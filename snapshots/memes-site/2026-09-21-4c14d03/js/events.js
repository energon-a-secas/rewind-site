// ── Event handlers ───────────────────────────────────────────────────
import { MEMES } from './data.js';
import { state, convex, api, visitorId, getAllMemes, getLoggedInUser, setAuthSession, canOrganize } from './state.js';
import { showToast, formatName, copyMemeUrl, copyMemeImage, downloadMeme } from './utils.js';
import { rebuildChips, filterGrid, renderLabelFilters, getFilteredMemes, allLabels } from './render.js';
import { categoryName, validateOrganization } from './organization.js';
import { createLabelInput } from './label-input.js';
import { NeoAuth } from './neorgon-auth.js';

// Respect prefers-reduced-motion for JS-driven smooth scrolling.
const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

// ── Search input ─────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', filterGrid);
document.getElementById('labelSearch').addEventListener('input', renderLabelFilters);
document.getElementById('filterToggle').addEventListener('click', event => {
  const open = document.getElementById('filterContents').classList.toggle('expanded');
  event.currentTarget.setAttribute('aria-expanded', String(open));
  event.currentTarget.textContent = open ? 'Filters −' : 'Filters +';
});
document.addEventListener('keydown', event => {
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && !event.target.isContentEditable && !document.getElementById('lightbox').classList.contains('open')) {
    event.preventDefault();
    searchInput.focus();
  }
});

// ── Sort control ─────────────────────────────────────────────────────
const sortSelect = document.getElementById('sortSelect');
sortSelect.addEventListener('change', () => {
  state.sortBy = sortSelect.value;
  filterGrid();
});

// ── Convex: load remote memes ────────────────────────────────────────
export async function loadConvexMemes({ render = true } = {}) {
  try {
    const results = await convex.query(api.memes.list);
    state.convexMemes = results;
    if (render) { rebuildChips(); filterGrid(); }
    const total = MEMES.length + state.convexMemes.length;
    document.getElementById('subtitle').textContent = `${total} internal jokes`;

  } catch (e) {
    console.warn('Convex not available:', e.message);
  }
}

export async function loadOrganization() {
  try {
    const rows = await convex.query(api.memes.organization, {});
    state.organization = Object.fromEntries(rows.map(row => [row.memeKey, { category: row.category, labels: row.labels }]));
    rebuildChips();
    filterGrid();
  } catch (error) {
    console.warn('Organization not available:', error.message);
  }
}

// ── Convex: load votes ───────────────────────────────────────────────
export async function loadVotes({ render = true } = {}) {
  try {
    const { counts, upvoted, downvoted } = await convex.query(api.votes.getVotes, { visitorId });
    state.voteCounts = counts;
    state.myVotes = new Set(upvoted);
    state.myDownvotes = new Set(downvoted);
    if (render) { filterGrid(); }
  } catch (e) {
    console.warn('Votes not available:', e.message);
  }
}

/** Handle a vote toggle (direction: +1 upvote, -1 downvote). */
export async function handleVoteClick(memeKey, direction = 1) {
  try {
    const { action, direction: dir } = await convex.mutation(api.votes.toggleVote, { memeKey, visitorId, direction });

    // Update local counts after the server accepts the vote.
    if (action === 'added') {
      state.voteCounts[memeKey] = (state.voteCounts[memeKey] || 0) + dir;
      if (dir > 0) { state.myVotes.add(memeKey); state.myDownvotes.delete(memeKey); }
      else { state.myDownvotes.add(memeKey); state.myVotes.delete(memeKey); }
      showToast(dir > 0 ? 'Upvoted!' : 'Downvoted');
    } else if (action === 'switched') {
      // Switched direction: net change is 2*dir
      state.voteCounts[memeKey] = (state.voteCounts[memeKey] || 0) + 2 * dir;
      if (dir > 0) { state.myVotes.add(memeKey); state.myDownvotes.delete(memeKey); }
      else { state.myDownvotes.add(memeKey); state.myVotes.delete(memeKey); }
      showToast(dir > 0 ? 'Switched to upvote' : 'Switched to downvote');
    } else {
      state.voteCounts[memeKey] = (state.voteCounts[memeKey] || 0) - dir;
      state.myVotes.delete(memeKey);
      state.myDownvotes.delete(memeKey);
      showToast('Vote removed');
    }

    filterGrid();

  } catch (e) {
    showToast('Could not save your vote. Please try again.');
  }
}

// ── Admin: delete meme ──────────────────────────────────────────────
export async function handleDeleteMeme(memeId, memeName) {
  if (!confirm(`Delete "${memeName}"?`)) return;
  if (!getLoggedInUser()) { showToast('Sign in required'); return; }
  try {
    const result = await convex.mutation(api.memes.deleteMeme, { memeId });
    if (result.ok) {
      showToast('Meme deleted');
      await loadConvexMemes();
    } else {
      showToast(result.error);
    }
  } catch (e) {
    showToast('Delete failed: ' + e.message);
  }
}

// ── Upload panel toggle ──────────────────────────────────────────────
const uploadToggle = document.getElementById('uploadToggle');
const uploadPanel  = document.getElementById('uploadPanel');
uploadToggle.addEventListener('click', () => {
  const open = uploadPanel.classList.toggle('open');
  if (open) uploadPanel.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  uploadToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.getElementById('uploadClose').addEventListener('click', () => {
  uploadPanel.classList.remove('open');
  uploadToggle.setAttribute('aria-expanded', 'false');
  uploadToggle.focus();
});

// ── Auth ─────────────────────────────────────────────────────────────
// The Neorgon Auth Kit owns the header slot, the sign-in dialog and the Convex
// token. This file only listens, and gates the upload behind a sign-in.
const uploadZone        = document.getElementById('uploadZone');
const uploadLoginPrompt = document.getElementById('uploadLoginPrompt');
const UPLOAD_REASON     = 'Sign in to upload your own memes.';

// The delete button renders only for admins, and the grid is drawn before this
// answers, so a change has to repaint or the button waits for an unrelated render.
async function refreshAdminFlag() {
  const subject = state.authSubject;
  let isAdmin = false;
  try {
    isAdmin = !!(await convex.query(api.auth.isAdmin, {}));
  } catch {
    isAdmin = false;
  }
  if (!getLoggedInUser() || subject !== state.authSubject || isAdmin === state.isConvexAdmin) return;
  setAuthSession(state.authLabel, isAdmin);
  if (currentMeme) renderLightboxOrganization();
  filterGrid();

}

function renderAuthState() {
  const loggedIn = !!getLoggedInUser();
  if (uploadZone) uploadZone.style.display = loggedIn ? 'block' : 'none';
  if (uploadLoginPrompt) uploadLoginPrompt.style.display = loggedIn ? 'none' : 'block';
}

/** Called once from app.js. */
export async function initMemesAuth() {
  NeoAuth.onChange(({ signedIn, label, userId }) => {
    setAuthSession(signedIn ? label : null, false, userId);
    if (currentMeme) renderLightboxOrganization();
    renderAuthState();
    filterGrid();

    if (signedIn) void refreshAdminFlag();
  });
  await NeoAuth.start({ convex });
}

document.getElementById('uploadSigninBtn')?.addEventListener('click', (event) => {
  void NeoAuth.requireSignIn({ reason: UPLOAD_REASON, invoker: event.currentTarget });
});

// ── Drag-and-drop / file picker ──────────────────────────────────────
const dropZone       = document.getElementById('dropZone');
const fileInput      = document.getElementById('fileInput');
const uploadPreview  = document.getElementById('uploadPreview');
const previewImg     = document.getElementById('previewImg');
const memeNameInput  = document.getElementById('memeNameInput');
const memeCatSelect  = document.getElementById('memeCatSelect');
const uploadSubmit   = document.getElementById('uploadSubmit');
const uploadLabels = createLabelInput(document.getElementById('uploadLabels'), { id: 'uploadLabelsInput', suggestions: allLabels });
const uploadError = document.getElementById('uploadError');
let previewUrl = null;

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
});

function handleFileSelect(file) {
  if (uploadSubmit.disabled) return;
  if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
    showToast('Choose a PNG, JPG, GIF or WebP image.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) { showToast('Choose an image smaller than 10 MB.'); return; }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  state.selectedFile = file;
  previewUrl = URL.createObjectURL(file);
  previewImg.src = previewUrl;
  uploadError.textContent = '';
  uploadLabels.setLabels();
  const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  memeNameInput.value = baseName;
  uploadPreview.style.display = 'block';
  dropZone.textContent = file.name;
}

// ── Upload submit ────────────────────────────────────────────────────
uploadSubmit.addEventListener('click', async () => {
  if (!state.selectedFile) { showToast('No file selected'); return; }
  const name = memeNameInput.value.trim();
  if (!name) { showToast('Add a name first'); return; }

  if (!getLoggedInUser() && !(await NeoAuth.requireSignIn({ reason: UPLOAD_REASON }))) return;

  if (!uploadLabels.commit()) return;
  let organization;
  try { organization = validateOrganization(memeCatSelect.value, uploadLabels.getLabels()); }
  catch (error) { uploadError.textContent = error.message; return; }
  uploadError.textContent = '';
  const selectedFile = state.selectedFile;
  uploadSubmit.disabled = true;
  uploadSubmit.textContent = 'Uploading\u2026';

  try {
    const uploadUrl = await convex.mutation(api.memes.getUploadUrl);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': selectedFile.type },
      body: selectedFile,
    });
    if (!res.ok) throw new Error('The image could not be uploaded. Please try again.');
    const { storageId } = await res.json();

    const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' }[selectedFile.type];
    const isAnon = document.getElementById('anonCheck').checked;
    await convex.mutation(api.memes.saveMeme, {
      name,
      ...organization,
      ext,
      storageId,
      displayAnonymous: isAnon,
    });

    showToast('Meme uploaded!');

    state.selectedFile = null;
    uploadPreview.style.display = 'none';
    dropZone.textContent = 'Drop an image here, or click to browse';
    memeNameInput.value = '';
    uploadLabels.setLabels();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    previewImg.removeAttribute('src');
    fileInput.value = '';

    await loadConvexMemes();
  } catch (e) {
    uploadError.textContent = 'Upload failed. Your details are still here; please try again.';
  }

  uploadSubmit.disabled = false;
  uploadSubmit.textContent = 'Upload meme';
});

// ── Lightbox with prev/next ───────────────────────────────────────────
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxName   = document.getElementById('lightboxName');
const lightboxCounter = document.getElementById('lightboxCounter');
const lbClose        = document.getElementById('lightboxClose');
const lbPrev         = document.getElementById('lbPrev');
const lbNext         = document.getElementById('lbNext');
const lbCopyUrl      = document.getElementById('lbCopyUrl');
const lbCopyImg      = document.getElementById('lbCopyImg');
const lbDownload     = document.getElementById('lbDownload');

let currentMeme = null;
let currentIndex = -1;
let currentList = [];

const organizeForm = document.getElementById('organizeForm');
const organizeToggle = document.getElementById('organizeToggle');
const organizeFields = document.getElementById('organizeFields');
const organizeSave = document.getElementById('organizeSave');
const organizeError = document.getElementById('organizeError');
const organizeLabels = createLabelInput(document.getElementById('organizeLabels'), { id: 'organizeLabelsInput', suggestions: allLabels });
let savingOrganization = false;

function renderLightboxOrganization() {
  if (!currentMeme) return;
  const latest = getAllMemes().find(meme => currentMeme._id ? meme._id === currentMeme._id : !meme._id && meme.name === currentMeme.name);
  if (latest) currentMeme = latest;
  const taxonomy = document.getElementById('lightboxTaxonomy');
  taxonomy.replaceChildren();
  [categoryName(currentMeme.category), ...(currentMeme.labels || [])].forEach((text, index) => {
    const tag = document.createElement('span');
    tag.className = index === 0 ? 'viewer-category' : 'viewer-label';
    tag.textContent = text;
    taxonomy.append(tag);
  });
  organizeForm.hidden = true;
  organizeToggle.setAttribute('aria-expanded', 'false');
  organizeToggle.disabled = !!getLoggedInUser() && !canOrganize(currentMeme);
  document.getElementById('organizeHint').textContent = !getLoggedInUser()
    ? 'Sign in to organize your uploads. Admins can organize any meme.'
    : canOrganize(currentMeme) ? 'Category and label changes are shared with everyone.'
    : 'Only the uploader or an admin can organize this meme.';
}

function setLightboxMeme(meme, index) {
  currentMeme = meme;
  currentIndex = index;
  lightboxImg.crossOrigin = meme.isNew ? 'anonymous' : null;
  lightboxImg.src = meme.path;
  lightboxImg.alt = formatName(meme.name);
  lightboxName.textContent = formatName(meme.name);
  lightboxCounter.textContent = `${index + 1} of ${currentList.length}`;
  renderLightboxOrganization();
}

function beginOrganizing() {
  if (!currentMeme || !canOrganize(currentMeme)) return;
  document.getElementById('organizeCategory').value = currentMeme.category;
  organizeLabels.setLabels(currentMeme.labels);
  organizeError.textContent = '';
  organizeForm.hidden = false;
  organizeToggle.setAttribute('aria-expanded', 'true');
  document.getElementById('organizeCategory').focus();
}

organizeToggle.addEventListener('click', async event => {
  if (!getLoggedInUser()) {
    const meme = currentMeme;
    closeLightbox();
    const signedIn = await NeoAuth.requireSignIn({ reason: 'Sign in to organize your uploads.' });
    if (signedIn && meme) openLightbox(meme, { organize: true });
    return;
  }
  if (!organizeForm.hidden) { renderLightboxOrganization(); return; }
  beginOrganizing();
});
document.getElementById('organizeCancel').addEventListener('click', () => {
  renderLightboxOrganization();
  organizeToggle.focus();
});
organizeForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (savingOrganization || !currentMeme || !canOrganize(currentMeme) || !organizeLabels.commit()) return;
  let organization;
  try { organization = validateOrganization(document.getElementById('organizeCategory').value, organizeLabels.getLabels()); }
  catch (error) { organizeError.textContent = error.message; return; }
  const meme = currentMeme;
  savingOrganization = true;
  organizeFields.disabled = true;
  organizeToggle.disabled = true;
  lbPrev.disabled = lbNext.disabled = true;
  organizeSave.textContent = 'Saving…';
  organizeError.textContent = '';
  try {
    const saved = await convex.mutation(api.memes.organize, { ...(meme._id ? { memeId: meme._id } : {}), memeKey: meme.name, ...organization });
    if (meme._id) state.convexMemes = state.convexMemes.map(item => item._id === meme._id ? { ...item, ...saved } : item);
    else state.organization[meme.name] = saved;
    rebuildChips();
    filterGrid();
    renderLightboxOrganization();
    showToast('Category and labels saved');
  } catch (error) {
    organizeError.textContent = 'Could not save changes. Your edits are still here; please try again.';
  } finally {
    savingOrganization = false;
    organizeFields.disabled = false;
    organizeToggle.disabled = !!currentMeme && !!getLoggedInUser() && !canOrganize(currentMeme);
    lbPrev.disabled = lbNext.disabled = false;
    organizeSave.textContent = 'Save changes';
    if (organizeForm.hidden && currentMeme) organizeToggle.focus();
  }
});

let lightboxReturnFocus = null;

export function openLightbox(meme, { organize = false } = {}) {
  if (savingOrganization) return;
  const matches = item => meme._id ? item._id === meme._id : !item._id && item.name === meme.name;
  currentList = getFilteredMemes();
  if (!currentList.some(matches)) currentList = getAllMemes();
  const index = currentList.findIndex(matches);
  setLightboxMeme(meme, index >= 0 ? index : 0);
  lightboxReturnFocus = document.activeElement;
  lightbox.inert = false;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.querySelector('main').inert = true;
  document.querySelector('header').inert = true;
  document.querySelector('footer').inert = true;
  document.getElementById('scrollTop').inert = true;
  document.body.style.overflow = 'hidden';
  lbClose.focus();
  if (organize && canOrganize(meme)) beginOrganizing();
}

function closeLightbox() {
  if (savingOrganization) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.inert = true;
  document.querySelector('main').inert = false;
  document.querySelector('header').inert = false;
  document.querySelector('footer').inert = false;
  document.getElementById('scrollTop').inert = false;
  document.body.style.overflow = '';
  currentMeme = null;
  currentIndex = -1;
  if (lightboxReturnFocus?.isConnected) lightboxReturnFocus.focus();
  else searchInput.focus();
  lightboxReturnFocus = null;
}

function navigateLightbox(dir) {
  if (currentList.length === 0 || savingOrganization) return;
  const next = (currentIndex + dir + currentList.length) % currentList.length;
  setLightboxMeme(currentList[next], next);
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

lbCopyUrl.addEventListener('click', () => {
  if (currentMeme) copyMemeUrl(currentMeme.path);
});

lbCopyImg.addEventListener('click', () => {
  if (currentMeme) copyMemeImage(currentMeme.path, currentMeme.ext, currentMeme.isNew);
});

lbDownload.addEventListener('click', () => {
  if (currentMeme) downloadMeme(currentMeme.path, `${currentMeme.name}.${currentMeme.ext}`);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') { closeLightbox(); return; }
  const editing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if (!editing && organizeForm.hidden && e.key === 'ArrowLeft')  { navigateLightbox(-1); return; }
  if (!editing && organizeForm.hidden && e.key === 'ArrowRight') { navigateLightbox(1); return; }
  if (e.key === 'Tab') {
    // Trap focus among the lightbox's interactive controls.
    const focusable = [...lightbox.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled)')].filter(element => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (!lightbox.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  }
});

// ── Random meme ──────────────────────────────────────────────────────
document.getElementById('randomBtn').addEventListener('click', () => {
  const all = getFilteredMemes();
  if (all.length === 0) { showToast('No memes match. Clear a filter to try a random pick.'); return; }
  const rand = all[Math.floor(Math.random() * all.length)];
  openLightbox(rand);
});

// ── Scroll to top ────────────────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
});
