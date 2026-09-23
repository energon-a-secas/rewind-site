/**
 * Command palette — `/` or ⌘K.
 *
 * Runs on the app shell and on generated reader pages alike, so it never
 * imports content modules: it lazy-fetches search-index.json on first open.
 * That keeps a reader page's payload to its own text.
 */

import { escHtml } from './utils.js';

const INDEX_URL = '/search-index.json';
const MAX_RESULTS = 24;

let root = null;
let entries = null;
let loading = null;
let cursor = 0;
let matches = [];
let restoreFocus = null;

export function isPaletteOpen() {
  return Boolean(root);
}

async function loadIndex() {
  if (entries) return entries;
  if (!loading) {
    loading = fetch(INDEX_URL)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(data => { entries = data.entries || []; return entries; })
      .catch(() => { entries = []; return entries; });
  }
  return loading;
}

/** Tiered ladder; ties broken by shortest label, so exact-ish names win. */
function score(entry, q) {
  const label = entry.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if ((entry.sub || '').toLowerCase().includes(q)) return 40;
  if ((entry.kind || '').toLowerCase().includes(q)) return 30;
  if ((entry.keywords || '').toLowerCase().includes(q)) return 20;
  return 0;
}

function search(query) {
  const q = query.trim().toLowerCase();
  if (!entries) return [];
  if (!q) {
    return entries.filter(e => e.kind === 'Section').slice(0, 8);
  }
  return entries
    .map(entry => ({ entry, s: score(entry, q) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s || a.entry.label.length - b.entry.label.length)
    .slice(0, MAX_RESULTS)
    .map(x => x.entry);
}

function resultsMarkup() {
  if (!entries) return '<p class="palette-hint">Loading…</p>';
  if (!matches.length) return '<p class="palette-hint">Nothing matches. Try a model name, a topic, or a term.</p>';

  return `<ul class="palette-list" role="listbox" id="palette-list">
    ${matches.map((entry, i) => `<li class="palette-item${i === cursor ? ' active' : ''}" role="option" id="palette-opt-${i}" aria-selected="${i === cursor}" data-index="${i}">
      <span class="palette-kind">${escHtml(entry.kind)}</span>
      <span class="palette-label">${escHtml(entry.label)}</span>
      ${entry.sub ? `<span class="palette-sub">${escHtml(entry.sub)}</span>` : ''}
    </li>`).join('')}
  </ul>`;
}

/** Replace only the list, never the input — focus and caret survive typing. */
function patchResults() {
  const box = root?.querySelector('#palette-results');
  if (!box) return;
  box.innerHTML = resultsMarkup();
  const input = root.querySelector('#palette-input');
  if (input) {
    input.setAttribute('aria-activedescendant', matches.length ? `palette-opt-${cursor}` : '');
  }
}

function move(delta) {
  if (!matches.length) return;
  cursor = (cursor + delta + matches.length) % matches.length;
  patchResults();
  root?.querySelector('.palette-item.active')?.scrollIntoView({ block: 'nearest' });
}

function choose() {
  const entry = matches[cursor];
  if (!entry) return;
  closePalette();
  if (entry.url.startsWith('#')) {
    location.hash = entry.url;
  } else {
    location.href = entry.url;
  }
}

export function closePalette() {
  if (!root) return;
  root.remove();
  root = null;
  document.body.classList.remove('palette-open');
  if (restoreFocus && document.contains(restoreFocus)) restoreFocus.focus();
  restoreFocus = null;
}

export function openPalette() {
  if (root) return;
  restoreFocus = document.activeElement;
  cursor = 0;
  matches = [];

  root = document.createElement('div');
  root.className = 'palette-overlay';
  root.innerHTML = `<div class="palette" role="dialog" aria-modal="true" aria-label="Search Agent Lore">
  <div class="palette-input-wrap">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    <input id="palette-input" type="text" placeholder="Search guides, models, skills, terms…" autocomplete="off" spellcheck="false"
           role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list">
    <kbd class="palette-esc">Esc</kbd>
  </div>
  <div id="palette-results" class="palette-results">${resultsMarkup()}</div>
  <footer class="palette-foot"><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>Esc</kbd> close</footer>
</div>`;

  document.body.appendChild(root);
  document.body.classList.add('palette-open');

  const input = root.querySelector('#palette-input');
  input.focus();

  loadIndex().then(() => {
    matches = search(input.value);
    cursor = 0;
    patchResults();
  });

  input.addEventListener('input', () => {
    matches = search(input.value);
    cursor = 0;
    patchResults();
  });

  root.addEventListener('click', (e) => {
    const item = e.target.closest('[data-index]');
    if (item) {
      cursor = Number(item.dataset.index);
      choose();
      return;
    }
    if (e.target === root) closePalette();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); return; }
    if (e.key === 'Enter') { e.preventDefault(); choose(); return; }
    if (e.key === 'Tab') e.preventDefault();
  });
}

/** Reader pages have no app shell, so they wire the palette themselves. */
export function bindPaletteShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (isPaletteOpen()) return;
    const el = document.activeElement;
    const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); openPalette(); }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#open-palette')) { e.preventDefault(); openPalette(); }
  });
}
