// ── State management ─────────────────────────────────────────
const STORAGE_KEY = 'playbook-lang';

export const state = {
  lang: 'es',
  posts: null,
};

export function loadSaved(s) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') s.lang = saved;
  } catch { /* private browsing */ }
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, s.lang);
  } catch { /* quota exceeded */ }
}
