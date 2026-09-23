// ── State management ─────────────────────────────────────────
// Shared mutable state. All modules import the same reference.

const STORAGE_KEY = 'lockdown-state';

export const state = {
  lang: 'en',
  view: 'list',
  activeGuide: null,
  search: '',
  category: null,
};

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.lang) s.lang = saved.lang;
    }
  } catch { /* ignore */ }
  const hash = location.hash.slice(1);
  if (hash) {
    s.view = 'detail';
    s.activeGuide = hash;
  }
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: s.lang }));
  } catch { /* quota */ }
}
