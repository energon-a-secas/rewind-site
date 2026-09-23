// ── State management ─────────────────────────────────────────
// Shared mutable state. Fully local: all data lives in localStorage,
// no network calls. Self-assessment is the default mode.

const STORAGE_KEY = 'mettle-mapper-v1';

export const state = {
  version: 1,
  profileName: 'self',
  // results[themeId] = { rungs, consistency, score }
  results: {},
  // drafts[themeId] = { R0: {answer, confidence}, ... } (in-progress)
  drafts: {},
  scores: { courage: 0, wisdom: 0, tolerance: 0, eloquence: 0, imagination: 0, overall: 0, rank: 'dormant' },
  settings: { rehearsalMode: false, mode: 'slow' },
  // transient (not persisted): the active probe run
  active: null, // { themeId, rungIndex, mode: 'slow' | 'fast' }
};

const PERSIST_KEYS = ['version', 'profileName', 'results', 'drafts', 'scores', 'settings'];

/** Load saved state from localStorage. */
export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      for (const k of PERSIST_KEYS) if (k in saved) s[k] = saved[k];
    }
  } catch { /* ignore corrupted data */ }
}

/** Persist current state to localStorage. */
export function save(s) {
  try {
    const out = {};
    for (const k of PERSIST_KEYS) out[k] = s[k];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch { /* quota exceeded or private browsing */ }
}

/** Wipe all stored data and reset scores. */
export function wipe(s) {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  s.results = {};
  s.drafts = {};
  s.scores = { courage: 0, wisdom: 0, tolerance: 0, eloquence: 0, imagination: 0, overall: 0, rank: 'dormant' };
  s.active = null;
}
