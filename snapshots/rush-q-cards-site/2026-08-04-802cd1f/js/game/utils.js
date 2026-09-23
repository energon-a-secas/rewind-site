// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Shared utilities ─────────────────────────────────────────

const _els = {};
export function $(id) {
  if (_els[id] && _els[id].isConnected) return _els[id];
  return (_els[id] = document.getElementById(id));
}

export function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let _toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2500);
}

let _idCounter = 0;
export function genId() { return 'c' + (++_idCounter) + '_' + Math.random().toString(36).slice(2, 7); }

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * AI playback speed factor from settings ('rush-q-settings'.aiSpeed):
 * instant → 0 (no waits), fast → 0.35, normal/unset → 1.
 * Read per call so the setting takes effect mid-game.
 */
export function aiSpeedFactor() {
  try {
    const s = JSON.parse(localStorage.getItem('rush-q-settings') || '{}');
    if (s.aiSpeed === 'instant') return 0;
    if (s.aiSpeed === 'fast') return 0.35;
  } catch { /* default */ }
  return 1;
}

export function delay(ms) {
  const f = aiSpeedFactor();
  if (f <= 0) return Promise.resolve();
  return new Promise(r => setTimeout(r, ms * f));
}

let _previousFocus = null;
let _trapHandler = null;

export function trapFocus(container) {
  _previousFocus = document.activeElement;
  const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first.focus();
  _trapHandler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  container.addEventListener('keydown', _trapHandler);
}

export function releaseFocus(container) {
  if (_trapHandler && container) container.removeEventListener('keydown', _trapHandler);
  _trapHandler = null;
  if (_previousFocus && _previousFocus.focus) _previousFocus.focus();
  _previousFocus = null;
}
