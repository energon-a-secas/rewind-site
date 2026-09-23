// ── DOM rendering ────────────────────────────────────────────────────
import { CATEGORIES, MEMES } from './data.js';
import { state, getAllMemes } from './state.js';
import { formatName, copyMemeImage, downloadMeme } from './utils.js';
import { categoryName, selectMemes } from './organization.js';
import { openLightbox, handleVoteClick, handleDeleteMeme } from './events.js';

// ── Meme of the Day ─────────────────────────────────────────────────
function getDayIndex(total) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return ((seed * 2654435761) >>> 0) % total;
}

export function renderMemeOfTheDay() {
  const all = MEMES;
  if (all.length === 0) return;
  const meme = all[getDayIndex(all.length)];
  const banner = document.getElementById('motdBanner');
  const img = document.getElementById('motdImg');
  const name = document.getElementById('motdName');
  img.src = meme.path;
  img.alt = formatName(meme.name);
  name.textContent = formatName(meme.name);
  banner.style.display = 'flex';

  img.addEventListener('click', () => openLightbox(meme));
  document.getElementById('motdView').addEventListener('click', () => openLightbox(meme));
  document.getElementById('motdCopy').addEventListener('click', () => copyMemeImage(meme.path, meme.ext, false));
}

// ── SVG icon templates ───────────────────────────────────────────────
const COPY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
const DL_SVG   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const VIEW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const HEART_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
const HEART_FILLED_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
const THUMBDOWN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>`;
const THUMBDOWN_FILLED_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>`;
const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`;

// ── Cached DOM references ────────────────────────────────────────────
const grid        = document.getElementById('memeGrid');
const chipsEl     = document.getElementById('chips');
const resultInfo  = document.getElementById('resultInfo');
const searchInput = document.getElementById('searchInput');


// Category navigation and label filters use text nodes for user-created names.
export function chooseCategory(value) {
  state.activeCategory = value;
  rebuildChips();
  filterGrid();
}

function makeChip(value, label, count) {
  const button = document.createElement('button');
  button.className = 'chip' + (value === state.activeCategory ? ' active' : '');
  button.dataset.value = value;
  button.setAttribute('aria-pressed', String(value === state.activeCategory));
  const title = document.createElement('span');
  title.textContent = label;
  const total = document.createElement('span');
  total.className = 'chip-count';
  total.textContent = count;
  button.append(title, total);
  button.addEventListener('click', () => chooseCategory(value));
  return button;
}

export function allLabels() {
  return [...new Set(getAllMemes().flatMap(meme => meme.labels || []))].sort((a, b) => a.localeCompare(b));
}

export function rebuildChips() {
  const focusedCategory = chipsEl.contains(document.activeElement) ? document.activeElement.dataset.value : null;
  const all = getAllMemes();
  const counts = new Map();
  all.forEach(meme => counts.set(meme.category, (counts.get(meme.category) || 0) + 1));
  const categories = [...new Set([...CATEGORIES, ...counts.keys()])].sort((a, b) => categoryName(a).localeCompare(categoryName(b)));
  chipsEl.replaceChildren(makeChip('all', 'All memes', all.length));
  categories.filter(category => counts.has(category) || category === state.activeCategory).forEach(category => chipsEl.append(makeChip(category, categoryName(category), counts.get(category) || 0)));
  if (focusedCategory) [...chipsEl.children].find(button => button.dataset.value === focusedCategory)?.focus({ preventScroll: true });
  document.getElementById('categoryOptions').replaceChildren(...categories.map(category => new Option(categoryName(category), category)));
  document.getElementById('subtitle').textContent = `${all.length} internal jokes`;
  renderLabelFilters();
}

export function toggleLabel(label) {
  if (state.activeLabels.has(label)) state.activeLabels.delete(label);
  else state.activeLabels.add(label);
  filterGrid();
}

export function renderLabelFilters() {
  const root = document.getElementById('labelFilters');
  const focusedLabel = root.contains(document.activeElement) ? document.activeElement.dataset.label : null;
  const labels = allLabels();
  const query = document.getElementById('labelSearch').value.trim().toLowerCase();
  const available = getAllMemes().filter(meme => state.activeCategory === 'all' || meme.category === state.activeCategory);
  document.getElementById('labelTotal').textContent = labels.length || '';
  document.getElementById('labelSearch').hidden = labels.length < 6;
  root.replaceChildren();
  labels.filter(label => label.includes(query)).forEach(label => {
    const button = document.createElement('button');
    button.className = 'label-filter' + (state.activeLabels.has(label) ? ' active' : '');
    button.dataset.label = label;
    button.setAttribute('aria-pressed', String(state.activeLabels.has(label)));
    const text = document.createElement('span');
    text.textContent = label;
    const count = document.createElement('span');
    count.className = 'label-count';
    count.textContent = available.filter(meme => (meme.labels || []).includes(label)).length;
    button.append(text, count);
    button.addEventListener('click', () => toggleLabel(label));
    root.append(button);
  });
  if (!root.childElementCount) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = labels.length ? 'No labels match your search.' : 'No labels yet. Add them when uploading or organizing a meme.';
    root.append(hint);
  }
  if (focusedLabel) [...root.children].find(button => button.dataset.label === focusedLabel)?.focus({ preventScroll: true });
}

export function resetFilters() {
  state.activeCategory = 'all';
  state.activeLabels.clear();
  searchInput.value = '';
  document.getElementById('labelSearch').value = '';
  rebuildChips();
  filterGrid();
  searchInput.focus({ preventScroll: true });
}

function renderActiveFilters() {
  const root = document.getElementById('activeFilters');
  const hadFocus = root.contains(document.activeElement);
  root.replaceChildren();
  const add = (text, action) => {
    const button = document.createElement('button');
    button.className = 'filter-token';
    button.textContent = `${text} ×`;
    button.setAttribute('aria-label', `Remove filter ${text}`);
    button.addEventListener('click', action);
    root.append(button);
  };
  if (state.activeCategory !== 'all') add(categoryName(state.activeCategory), () => chooseCategory('all'));
  state.activeLabels.forEach(label => add(label, () => toggleLabel(label)));
  if (searchInput.value.trim()) add(`“${searchInput.value.trim()}”`, () => { searchInput.value = ''; filterGrid(); });
  root.hidden = !root.childElementCount;
  if (!root.hidden) {
    const clear = document.createElement('button');
    clear.className = 'text-button';
    clear.textContent = 'Clear all';
    clear.addEventListener('click', resetFilters);
    root.append(clear);
  }
  if (hadFocus) (root.querySelector('button') || searchInput).focus({ preventScroll: true });
}

// ── Card factory ─────────────────────────────────────────────────────
export function makeCard(m) {
  const card = document.createElement('div');
  card.className = 'meme-card';
  card.setAttribute('role', 'listitem');
  const readableName = formatName(m.name);

  const img = document.createElement('img');
  img.className = 'meme-img';
  if (m.isNew) img.crossOrigin = 'anonymous';
  img.src = m.path;
  img.alt = readableName;
  img.loading = 'lazy';
  if (m.isNew) img.crossOrigin = 'anonymous';
  img.addEventListener('load', () => img.classList.add('loaded'), { once: true });

  const meta = document.createElement('div');
  meta.className = 'meme-meta';
  const newBadge = m.isNew ? '<span class="badge-new">new</span>' : '';
  meta.innerHTML = '<div class="meme-name"></div><div class="meme-badges"><span class="badge-ext"></span>' + newBadge + '</div>';
  meta.querySelector('.meme-name').textContent = readableName;
  meta.querySelector('.meme-name').title = readableName;
  meta.querySelector('.badge-ext').textContent = m.ext;

  // Vote row: upvote | score | downvote
  const voteRow = document.createElement('div');
  voteRow.className = 'vote-row';
  const score = state.voteCounts[m.name] || 0;
  const hasUp = state.myVotes.has(m.name);
  const hasDown = state.myDownvotes.has(m.name);

  const upBtn = document.createElement('button');
  upBtn.className = 'vote-btn' + (hasUp ? ' voted' : '');
  upBtn.innerHTML = hasUp ? HEART_FILLED_SVG : HEART_SVG;
  upBtn.setAttribute('aria-label', `Upvote ${readableName}`);
  upBtn.setAttribute('aria-pressed', hasUp ? 'true' : 'false');
  upBtn.addEventListener('click', (e) => { e.stopPropagation(); handleVoteClick(m.name, 1); });

  const scoreEl = document.createElement('span');
  scoreEl.className = 'vote-score' + (score > 0 ? ' positive' : score < 0 ? ' negative' : '');
  scoreEl.textContent = String(score);
  if (score !== 0) scoreEl.setAttribute('aria-label', `Score ${score}`);

  const downBtn = document.createElement('button');
  downBtn.className = 'vote-btn downvote' + (hasDown ? ' voted' : '');
  downBtn.innerHTML = hasDown ? THUMBDOWN_FILLED_SVG : THUMBDOWN_SVG;
  downBtn.setAttribute('aria-label', `Downvote ${readableName}`);
  downBtn.setAttribute('aria-pressed', hasDown ? 'true' : 'false');
  downBtn.addEventListener('click', (e) => { e.stopPropagation(); handleVoteClick(m.name, -1); });

  voteRow.appendChild(upBtn);
  voteRow.appendChild(scoreEl);
  voteRow.appendChild(downBtn);

  const overlay = document.createElement('div');
  overlay.className = 'meme-overlay';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'overlay-btn';
  viewBtn.title = 'View';
  viewBtn.setAttribute('aria-label', `View ${readableName}`);
  viewBtn.innerHTML = VIEW_SVG;
  viewBtn.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(m); });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'overlay-btn';
  copyBtn.title = 'Copy Image';
  copyBtn.setAttribute('aria-label', `Copy ${readableName} image`);
  copyBtn.innerHTML = COPY_SVG;
  copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyMemeImage(m.path, m.ext, m.isNew); });

  const dlBtn = document.createElement('button');
  dlBtn.className = 'overlay-btn';
  dlBtn.title = 'Download';
  dlBtn.setAttribute('aria-label', `Download ${readableName}`);
  dlBtn.innerHTML = DL_SVG;
  dlBtn.addEventListener('click', (e) => { e.stopPropagation(); downloadMeme(m.path, `${m.name}.${m.ext}`); });

  overlay.appendChild(viewBtn);
  overlay.appendChild(copyBtn);
  overlay.appendChild(dlBtn);

  // Admin: delete button for Convex-uploaded memes
  if (state.isConvexAdmin && m._id) {
    const delBtn = document.createElement('button');
    delBtn.className = 'overlay-btn overlay-btn--delete';
    delBtn.title = 'Delete (admin)';
    delBtn.setAttribute('aria-label', `Delete ${readableName}`);
    delBtn.innerHTML = TRASH_SVG;
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteMeme(m._id, m.name); });
    overlay.appendChild(delBtn);
  }

  // Wrap image + overlay together so overlay only covers the image.
  // The card (a div) opens the lightbox on click; the vote and overlay
  // buttons stopPropagation. Keyboard users reach the overlay's View
  // button, revealed via :focus-within.
  const imgWrap = document.createElement('div');
  imgWrap.className = 'meme-img-wrap';
  imgWrap.appendChild(img);
  imgWrap.appendChild(overlay);
  card.addEventListener('click', () => openLightbox(m));
  card.appendChild(imgWrap);
  card.appendChild(meta);
  const taxonomy = document.createElement('div');
  taxonomy.className = 'card-taxonomy';
  const category = document.createElement('button');
  category.className = 'card-category';
  category.textContent = categoryName(m.category);
  category.setAttribute('aria-label', `Filter by category ${categoryName(m.category)}`);
  category.addEventListener('click', event => { event.stopPropagation(); chooseCategory(m.category); });
  taxonomy.append(category);
  (m.labels || []).slice(0, 2).forEach(label => {
    const button = document.createElement('button');
    button.className = 'card-label';
    button.textContent = label;
    button.setAttribute('aria-label', `Filter by label ${label}`);
    button.addEventListener('click', event => { event.stopPropagation(); toggleLabel(label); });
    taxonomy.append(button);
  });
  if ((m.labels || []).length > 2) {
    const more = document.createElement('span');
    more.className = 'more-labels';
    more.textContent = `+${m.labels.length - 2}`;
    more.title = m.labels.slice(2).join(', ');
    taxonomy.append(more);
  }
  card.append(taxonomy);
  const organize = document.createElement('button');
  organize.className = 'card-organize';
  organize.textContent = 'Organize';
  organize.setAttribute('aria-label', `Organize ${readableName}`);
  organize.addEventListener('click', event => { event.stopPropagation(); openLightbox(m, { organize: true }); });
  voteRow.append(organize);
  // Uploader credit (Convex memes only)
  if (m.displayName) {
    const uploaderEl = document.createElement('div');
    uploaderEl.className = 'uploader-badge';
    uploaderEl.textContent = `by ${m.displayName}`;
    card.appendChild(uploaderEl);
  }
  card.appendChild(voteRow);
  return card;
}

const EMPTY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;

// ── Grid rendering ───────────────────────────────────────────────────
function renderGrid(memes) {
  grid.innerHTML = '';
  if (memes.length === 0) {
    const q = searchInput.value.trim();
    const filtered = q || state.activeCategory !== 'all' || state.activeLabels.size;
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.innerHTML = `
      ${EMPTY_SVG}
      <div class="empty-state-title">${filtered ? 'No memes match' : 'No memes yet'}</div>
      <div class="empty-state-hint">${filtered
        ? 'Try another search, category or label. Or clear the filters to see everything.'
        : 'Upload the first one to get the vault started.'}</div>
      ${filtered ? '<button type="button" class="empty-state-reset" id="emptyReset">Clear search &amp; filters</button>' : ''}`;
    grid.appendChild(el);
    const reset = document.getElementById('emptyReset');
    if (reset) reset.addEventListener('click', resetFilters);
  } else {
    const frag = document.createDocumentFragment();
    memes.forEach(meme => frag.appendChild(makeCard(meme)));
    grid.appendChild(frag);
  }
  resultInfo.textContent = `${memes.length} of ${getAllMemes().length} memes${state.activeLabels.size > 1 ? ' · matching all selected labels' : ''}`;
}

export function getFilteredMemes() {
  return selectMemes(getAllMemes(), { category: state.activeCategory, labels: [...state.activeLabels], query: searchInput.value, sort: state.sortBy, votes: state.voteCounts });
}

export function filterGrid() {
  document.getElementById('collectionTitle').textContent = state.activeCategory === 'all' ? 'All memes' : categoryName(state.activeCategory);
  renderGrid(getFilteredMemes());
  renderActiveFilters();
  renderLabelFilters();
}
