// ── State management ─────────────────────────────────────────
// Filters live in the URL hash so any view is shareable. Category,
// platform, tags and the pinned toggle also persist to localStorage
// so a return visit lands where you left off — the free-text query
// deliberately does not, since a stale search on load is disorienting.

import { snippets } from './data.js';

const PIN_KEY = 'neo_snippets_pins';
const FILTER_KEY = 'neo_snippets_filters';

export const state = {
  searchQuery: '',
  activeCategory: '',
  activePlatform: '',
  activeTags: [],
  pinnedOnly: false,
  pins: [],
  focusId: '',
};

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing or a full quota — state just stops persisting */
  }
}

// ── Pins ─────────────────────────────────────────────────────

export function isPinned(id) {
  return state.pins.includes(id);
}

export function togglePin(id) {
  const at = state.pins.indexOf(id);
  if (at === -1) state.pins.unshift(id);
  else state.pins.splice(at, 1);
  writeStored(PIN_KEY, state.pins);
  return at === -1;
}

function loadPins() {
  const known = new Set(snippets.map(s => s.id));
  state.pins = readStored(PIN_KEY, []).filter(id => known.has(id));
}

// ── Filters ──────────────────────────────────────────────────

export function resetFilters() {
  state.searchQuery = '';
  state.activeCategory = '';
  state.activePlatform = '';
  state.activeTags = [];
  state.pinnedOnly = false;
}

export function hasActiveFilters() {
  return Boolean(
    state.searchQuery || state.activeCategory || state.activePlatform ||
    state.activeTags.length || state.pinnedOnly
  );
}

function toParams() {
  const params = new URLSearchParams();
  if (state.searchQuery) params.set('q', state.searchQuery);
  if (state.activeCategory) params.set('cat', state.activeCategory);
  if (state.activePlatform) params.set('plat', state.activePlatform);
  if (state.activeTags.length) params.set('tags', state.activeTags.join(','));
  if (state.pinnedOnly) params.set('pinned', '1');
  return params;
}

export function readHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return false;
  const params = new URLSearchParams(raw);
  state.searchQuery = params.get('q') || '';
  state.activeCategory = params.get('cat') || '';
  state.activePlatform = params.get('plat') || '';
  state.activeTags = (params.get('tags') || '').split(',').filter(Boolean);
  state.pinnedOnly = params.get('pinned') === '1';
  return true;
}

export function syncHash() {
  const query = toParams().toString();
  history.replaceState(null, '', query ? `#${query}` : location.pathname + location.search);
  writeStored(FILTER_KEY, {
    activeCategory: state.activeCategory,
    activePlatform: state.activePlatform,
    activeTags: state.activeTags,
    pinnedOnly: state.pinnedOnly,
  });
}

export function initState() {
  loadPins();
  if (readHash()) return;
  const stored = readStored(FILTER_KEY, null);
  if (!stored) return;
  state.activeCategory = stored.activeCategory || '';
  state.activePlatform = stored.activePlatform || '';
  state.activeTags = Array.isArray(stored.activeTags) ? stored.activeTags : [];
  state.pinnedOnly = Boolean(stored.pinnedOnly);
}
