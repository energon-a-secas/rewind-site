// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Settings module ──────────────────────────────────────────
// Single JSON blob in localStorage 'rush-q-settings'. Drives the settings
// panel (gear button) and cross-cutting UI preferences.

import { trapFocus, releaseFocus, showToast } from '../game/utils.js';
import { resetHints } from './hints.js';

const STORAGE_KEY = 'rush-q-settings';
const LEGACY_MOBILE_KEY = 'rush-q-mobile-mode';

export const DEFAULTS = {
  hints: true,
  reduceMotion: false,
  compactMode: false,
  confirmEndTurn: false,
  difficulty: 'normal',
};

let _migrated = false;

/** Detect the current game mode from the URL. */
function currentMode() {
  return location.pathname.includes('/quick/') ? 'quick' : 'classic';
}

function osReducedMotion() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
}

function readRaw() {
  try {
    const txt = localStorage.getItem(STORAGE_KEY);
    if (!txt) return {};
    const obj = JSON.parse(txt);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function writeRaw(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to persist settings:', e);
  }
}

/** One-time migration of the legacy compact-mode flag. */
function migrate() {
  if (_migrated) return;
  _migrated = true;
  const raw = readRaw();
  if (!('compactMode' in raw)) {
    try {
      if (localStorage.getItem(LEGACY_MOBILE_KEY) === 'compact') {
        raw.compactMode = true;
        writeRaw(raw);
      }
    } catch { /* ignore */ }
  }
}

/** Returns the full, resolved settings object (defaults + stored + OS seed). */
export function getSettings() {
  migrate();
  const raw = readRaw();
  const merged = { ...DEFAULTS, ...raw };
  // Seed reduceMotion from the OS preference until the user sets it explicitly.
  if (!('reduceMotion' in raw)) merged.reduceMotion = osReducedMotion();
  return merged;
}

export function getSetting(key) {
  return getSettings()[key];
}

export function setSetting(key, value) {
  migrate();
  const raw = readRaw();
  raw[key] = value;
  writeRaw(raw);
  applySetting(key, value);
  return value;
}

export function resetSettings() {
  writeRaw({});
  applyAllSettings();
}

/** Apply a single setting's side effects to the DOM / runtime. */
export function applySetting(key, value) {
  switch (key) {
    case 'reduceMotion':
      document.body.classList.toggle('reduce-motion', !!value);
      break;
    case 'compactMode': {
      // No compact layout exists in Quick Mode — ignore there.
      if (currentMode() === 'quick') break;
      const isCompact = document.body.classList.contains('compact-mode');
      if (isCompact !== !!value && typeof window._toggleCompactMode === 'function') {
        window._toggleCompactMode();
      }
      break;
    }
    // hints → read on demand by hints.js
    // confirmEndTurn → read on demand by shouldEndTurn()
    // difficulty → read at startGame by the engine (optional)
    default:
      break;
  }
}

/** Apply every setting — call once during init, before the first render. */
export function applyAllSettings() {
  const s = getSettings();
  applySetting('reduceMotion', s.reduceMotion);
  applySetting('compactMode', s.compactMode);
}

/** Guard for end-turn / pass actions. Returns true if the turn may end. */
export function shouldEndTurn() {
  if (!getSetting('confirmEndTurn')) return true;
  return confirm('End your turn now?');
}

// ── Settings panel UI ────────────────────────────────────────

let _escHandler = null;

function closeSettings() {
  const overlay = document.getElementById('settings-overlay');
  if (!overlay) return;
  releaseFocus(overlay);
  overlay.remove();
  if (_escHandler) {
    document.removeEventListener('keydown', _escHandler);
    _escHandler = null;
  }
}

/** Open the settings panel (built here, wired with addEventListener). */
export function openSettings() {
  if (document.getElementById('settings-overlay')) return;
  const s = getSettings();
  const isQuick = currentMode() === 'quick';

  const overlay = document.createElement('div');
  overlay.id = 'settings-overlay';
  overlay.className = 'settings-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Settings');

  const toggleRow = (key, label, desc, checked) => `
    <div class="settings-row">
      <div class="settings-row-text">
        <span class="settings-row-label">${label}</span>
        ${desc ? `<span class="settings-row-desc">${desc}</span>` : ''}
      </div>
      <label class="settings-toggle">
        <input type="checkbox" data-setting="${key}" ${checked ? 'checked' : ''}>
        <span class="settings-toggle-track"></span>
      </label>
    </div>`;

  overlay.innerHTML = `
    <div class="settings-panel">
      <div class="settings-header">
        <h3>Settings</h3>
        <button class="settings-close" data-action="close" aria-label="Close settings">&times;</button>
      </div>
      ${toggleRow('hints', 'Contextual hints', 'Show one-time tips as you play', s.hints)}
      ${toggleRow('reduceMotion', 'Reduce motion', 'Minimize animations', s.reduceMotion)}
      ${!isQuick ? `<div data-classic-only>${toggleRow('compactMode', 'Compact mode', 'Mobile-friendly layout', s.compactMode)}</div>` : ''}
      ${toggleRow('confirmEndTurn', 'Confirm end turn', 'Ask before ending your turn', s.confirmEndTurn)}
      <div class="settings-row">
        <div class="settings-row-text">
          <span class="settings-row-label">Difficulty</span>
          <span class="settings-row-desc">AI opponent strength (new game)</span>
        </div>
        <select class="settings-select" data-setting="difficulty">
          <option value="easy" ${s.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
          <option value="normal" ${s.difficulty === 'normal' ? 'selected' : ''}>Normal</option>
          <option value="hard" ${s.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
        </select>
      </div>
      <div class="settings-actions">
        <button class="btn btn-secondary btn-sm" data-action="reset-hints">Reset hints</button>
        <button class="btn btn-secondary btn-sm" data-action="reset-tutorial">Reset tutorial</button>
        <button class="btn btn-play btn-sm" data-action="close">Done</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Toggle + select changes
  overlay.addEventListener('change', (e) => {
    const el = e.target.closest('[data-setting]');
    if (!el) return;
    const key = el.dataset.setting;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setSetting(key, value);
  });

  // Button actions (delegated)
  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn) {
      const action = btn.dataset.action;
      if (action === 'close') return closeSettings();
      if (action === 'reset-hints') {
        resetHints();
        showToast('Hints re-armed — they will show again as you play.');
        return;
      }
      if (action === 'reset-tutorial') {
        try {
          localStorage.removeItem('rush-q-tutorial-completed-classic');
          localStorage.removeItem('rush-q-tutorial-completed-quick');
          localStorage.removeItem('rushq_tutorial_seen');
        } catch { /* ignore */ }
        showToast('Tutorial reset — it will replay next game.');
        return;
      }
    }
    // Backdrop click closes
    if (e.target === overlay) closeSettings();
  });

  _escHandler = (e) => { if (e.key === 'Escape') closeSettings(); };
  document.addEventListener('keydown', _escHandler);

  requestAnimationFrame(() => trapFocus(overlay));
}

/** Bind the header gear button. Call once during init. */
export function initSettingsUI() {
  const gear = document.getElementById('settings-gear');
  if (gear && !gear._wired) {
    gear._wired = true;
    gear.addEventListener('click', openSettings);
  }
}
