// ── DOM rendering ────────────────────────────────────────────────────
import { CATEGORIES, EMOJIS } from './data.js';
import { state, getAllEmojis } from './state.js';
import { copyEmoji, downloadEmoji, showToast } from './utils.js';

// ── Emoji of the Day ────────────────────────────────────────────────
function getDayIndex(total) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return ((seed * 2654435761) >>> 0) % total;
}

export function renderEmojiOfTheDay() {
  if (EMOJIS.length === 0) return;
  const emoji = EMOJIS[getDayIndex(EMOJIS.length)];
  const banner = document.getElementById('eotdBanner');
  if (!banner) return;
  document.getElementById('eotdImg').src = emoji.path;
  document.getElementById('eotdImg').alt = emoji.name;
  document.getElementById('eotdName').textContent = `:${emoji.name}:`;
  banner.style.display = 'flex';
  document.getElementById('eotdCopy').addEventListener('click', () => {
    navigator.clipboard.writeText(`:${emoji.name}:`).then(() => showToast('Copied :' + emoji.name + ':'));
  });
}

// ── SVG icon templates ───────────────────────────────────────────────
const COPY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
const DL_SVG   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

// ── Cached DOM references ────────────────────────────────────────────
const grid       = document.getElementById('emojiGrid');
const chipsEl    = document.getElementById('chips');
const resultInfo = document.getElementById('resultInfo');
const searchInput = document.getElementById('searchInput');

// ── Chip factory ─────────────────────────────────────────────────────
function makeChip(value, label, count) {
  const c = document.createElement('button');
  c.className = 'chip' + (value === state.activeCategory ? ' active' : '');
  c.dataset.value = value;
  c.innerHTML = `${label}<span class="chip-count">${count}</span>`;
  c.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    state.activeCategory = value;
    filterGrid();
  });
  return c;
}

/** Rebuild category chips from current data (hardcoded + Convex). */
export function rebuildChips() {
  chipsEl.innerHTML = '';
  const all = getAllEmojis();
  const counts = {};
  all.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
  // Collect all categories (hardcoded + any new ones from Convex)
  const cats = [...new Set([...CATEGORIES, ...state.convexEmojis.map(e => e.category)])];
  chipsEl.appendChild(makeChip('all', 'All', all.length));
  cats.forEach(cat => {
    if (counts[cat]) chipsEl.appendChild(makeChip(cat, cat, counts[cat]));
  });
}

// ── Card factory ─────────────────────────────────────────────────────
function makeCard(e) {
  const card = document.createElement('div');
  card.className = 'emoji-card';

  const img = document.createElement('img');
  img.className = 'emoji-img';
  img.src = e.path;
  img.alt = e.name;
  img.loading = 'lazy';
  if (e.isNew) img.crossOrigin = 'anonymous';

  const meta = document.createElement('div');
  meta.className = 'emoji-meta';
  const newBadge = e.isNew ? '<span class="badge-new">new</span>' : '';
  meta.innerHTML = `
    <div class="emoji-name" title="${e.name}">${e.name}</div>
    <div class="emoji-badges">
      <span class="badge-ext">${e.ext}</span>
      ${newBadge}
      <span class="badge-id">#${String(e.id).padStart(4,'0')}</span>
    </div>`;

  const overlay = document.createElement('div');
  overlay.className = 'emoji-overlay';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'overlay-btn';
  copyBtn.title = 'Copy';
  copyBtn.innerHTML = COPY_SVG;
  copyBtn.addEventListener('click', () => copyEmoji(e.path, e.ext, e.isNew));

  const dlBtn = document.createElement('button');
  dlBtn.className = 'overlay-btn';
  dlBtn.title = 'Download';
  dlBtn.innerHTML = DL_SVG;
  dlBtn.addEventListener('click', () => downloadEmoji(e.path, `${e.name}.${e.ext}`));

  overlay.appendChild(copyBtn);
  overlay.appendChild(dlBtn);
  card.appendChild(img);
  card.appendChild(meta);
  card.appendChild(overlay);
  return card;
}

// ── Grid rendering ───────────────────────────────────────────────────
function renderGrid(emojis) {
  grid.innerHTML = '';
  if (emojis.length === 0) {
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.textContent = '// try a different search';
    grid.appendChild(el);
  } else {
    const frag = document.createDocumentFragment();
    emojis.forEach(e => frag.appendChild(makeCard(e)));
    grid.appendChild(frag);
  }
  resultInfo.textContent = `${emojis.length} specimen${emojis.length !== 1 ? 's' : ''}`;
}

/** Filter emojis by active category and search query, then re-render the grid. */
export function filterGrid() {
  const q = searchInput.value.toLowerCase().trim();
  const all = getAllEmojis();
  const filtered = all.filter(e => {
    const catMatch = state.activeCategory === 'all' || e.category === state.activeCategory;
    const nameMatch = !q || e.name.toLowerCase().includes(q);
    return catMatch && nameMatch;
  });
  renderGrid(filtered);
}
