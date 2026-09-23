// ── State management ─────────────────────────────────────────
// One mutable object every module imports. Persisted whole, so a reload
// restores the frame, the custom part library, and the console settings.

import { DEFAULT_LOADOUT } from './parts.js';

const STORAGE_KEY = 'sortie-state';

export const DEFAULT_SETTINGS = {
  accent: '#06b6d4',
  layout: 'frame',
  scanlines: true,
  bloom: true,
  particles: true,
  aberration: false,
  curve: false,
  motion: 'auto',   // auto (follow the OS) | full | reduced | off
  sound: false,
  attract: true,
  chrome: true,      // header bar visible
};

export const state = {
  unlocked: false,
  screen: 'boot',        // boot | console | forge
  mode: null,            // null | burst | siege | recon | sprint
  form: null,            // null (frame) | flight | siege
  loadout: { ...DEFAULT_LOADOUT },
  custom: [],            // user-forged parts
  settings: { ...DEFAULT_SETTINGS },
  editing: null,         // part id being edited in the forge
};

/** Merge a saved blob without letting stale keys widen the shape. */
export function hydrate(s, raw) {
  if (!raw || typeof raw !== 'object') return;
  if (typeof raw.unlocked === 'boolean') s.unlocked = raw.unlocked;
  if (typeof raw.mode === 'string' || raw.mode === null) s.mode = raw.mode;
  if (typeof raw.form === 'string' || raw.form === null) s.form = raw.form;
  if (raw.loadout && typeof raw.loadout === 'object') {
    // Only slots the current model knows about. A save from before the AC6
    // restructure carries slot names that no longer exist, and keeping them
    // would quietly grow the payload of every share link from here on.
    const known = Object.keys(DEFAULT_LOADOUT);
    const kept = Object.fromEntries(
      Object.entries(raw.loadout).filter(([slot]) => known.includes(slot)),
    );
    s.loadout = { ...DEFAULT_LOADOUT, ...kept };
  }
  if (Array.isArray(raw.custom)) s.custom = raw.custom.filter(isPartish);
  if (raw.settings && typeof raw.settings === 'object') {
    s.settings = { ...DEFAULT_SETTINGS, ...raw.settings };
  }
}

function isPartish(p) {
  return p && typeof p.id === 'string' && typeof p.glyph === 'string' && typeof p.slot === 'string';
}

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) hydrate(s, JSON.parse(raw));
  } catch { /* corrupted or unavailable — fall back to defaults */ }
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      unlocked: s.unlocked,
      mode: s.mode,
      form: s.form,
      loadout: s.loadout,
      custom: s.custom,
      settings: s.settings,
    }));
  } catch { /* quota exceeded or private browsing */ }
}

/** Every part the console knows about, stock first. */
export function library(s, stock) {
  return [...stock, ...s.custom];
}

/** Resolve a slot to the part currently equipped there. */
export function equipped(s, stock, slot) {
  const id = s.loadout[slot];
  const all = library(s, stock);
  return all.find((p) => p.id === id && p.slot === slot)
    || all.find((p) => p.slot === slot)
    || null;
}
