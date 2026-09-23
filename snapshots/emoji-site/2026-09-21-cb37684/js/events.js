// ── Event handlers ───────────────────────────────────────────────────
import { EMOJIS } from './data.js';
import { state, convex, api } from './state.js';
import { showToast } from './utils.js';
import { rebuildChips, filterGrid } from './render.js';

// ── Search input ─────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', filterGrid);

// ── Convex: load remote emojis ───────────────────────────────────────
export async function loadConvexEmojis() {
  try {
    const results = await convex.query(api.emojis.list);
    state.convexEmojis = results;
    rebuildChips();
    filterGrid();
    // Update subtitle count
    const total = EMOJIS.length + state.convexEmojis.length;
    document.querySelector('.header-subtitle').textContent = `${total} preserved specimens`;
    document.getElementById('searchInput').placeholder = `Search ${total} specimens\u2026`;
  } catch (e) {
    // Convex not configured yet — just use hardcoded emojis
    console.warn('Convex not available:', e.message);
  }
}

// ── Upload panel toggle ──────────────────────────────────────────────
const uploadToggle = document.getElementById('uploadToggle');
const uploadPanel  = document.getElementById('uploadPanel');
uploadToggle.addEventListener('click', () => {
  uploadPanel.classList.toggle('open');
});

// ── Password gate ────────────────────────────────────────────────────
const pwGate     = document.getElementById('pwGate');
const pwInput    = document.getElementById('pwInput');
const pwSubmit   = document.getElementById('pwSubmit');
const uploadZone = document.getElementById('uploadZone');

// Check sessionStorage for existing auth
if (sessionStorage.getItem('emoji-upload-auth') === 'true') {
  pwGate.style.display = 'none';
  uploadZone.style.display = 'block';
}

pwSubmit.addEventListener('click', async () => {
  const pw = pwInput.value.trim();
  if (!pw) return;
  pwSubmit.disabled = true;
  pwSubmit.textContent = 'Checking\u2026';
  try {
    const ok = await convex.action(api.auth.checkPassword, { password: pw });
    if (ok) {
      sessionStorage.setItem('emoji-upload-auth', 'true');
      pwGate.style.display = 'none';
      uploadZone.style.display = 'block';
      showToast('Unlocked');
    } else {
      showToast('Wrong password');
    }
  } catch (e) {
    showToast('Auth error. Check Convex config');
  }
  pwSubmit.disabled = false;
  pwSubmit.textContent = 'Unlock';
});

pwInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') pwSubmit.click();
});

// ── Drag-and-drop / file picker ──────────────────────────────────────
const dropZone       = document.getElementById('dropZone');
const fileInput      = document.getElementById('fileInput');
const uploadPreview  = document.getElementById('uploadPreview');
const previewImg     = document.getElementById('previewImg');
const emojiNameInput = document.getElementById('emojiNameInput');
const emojiCatSelect = document.getElementById('emojiCatSelect');
const uploadSubmit   = document.getElementById('uploadSubmit');

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
  if (!file.type.startsWith('image/')) {
    showToast('Only image files allowed');
    return;
  }
  state.selectedFile = file;
  previewImg.src = URL.createObjectURL(file);
  // Auto-fill name from filename (strip extension)
  const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  emojiNameInput.value = baseName;
  uploadPreview.style.display = 'block';
  dropZone.textContent = file.name;
}

// ── Upload submit ────────────────────────────────────────────────────
uploadSubmit.addEventListener('click', async () => {
  if (!state.selectedFile) { showToast('No file selected'); return; }
  const name = emojiNameInput.value.trim();
  if (!name) { showToast('Add a name first'); return; }

  uploadSubmit.disabled = true;
  uploadSubmit.textContent = 'Uploading\u2026';

  try {
    // 1. Get upload URL from Convex
    const uploadUrl = await convex.mutation(api.emojis.getUploadUrl);

    // 2. Upload file to Convex storage
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': state.selectedFile.type },
      body: state.selectedFile,
    });
    const { storageId } = await res.json();

    // 3. Save emoji metadata
    const ext = state.selectedFile.name.split('.').pop().toLowerCase();
    await convex.mutation(api.emojis.saveEmoji, {
      name,
      category: emojiCatSelect.value,
      ext,
      storageId,
    });

    showToast('Emoji uploaded!');

    // Reset form
    state.selectedFile = null;
    uploadPreview.style.display = 'none';
    dropZone.textContent = 'Drop an image here, or click to browse';
    emojiNameInput.value = '';
    fileInput.value = '';

    // Refresh gallery
    await loadConvexEmojis();
  } catch (e) {
    showToast('Upload failed: ' + e.message);
  }

  uploadSubmit.disabled = false;
  uploadSubmit.textContent = 'Upload Emoji';
});
