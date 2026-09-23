// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — shared utilities

const _els = {};
export function $(id) {
  if (_els[id] && _els[id].isConnected) return _els[id];
  return (_els[id] = document.getElementById(id));
}

export function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** AI playback step delay in ms, scaled by the shared aiSpeed setting. */
export function aiStepDelay(base = 400) {
  try {
    const s = JSON.parse(localStorage.getItem('rush-q-settings') || '{}');
    if (s.aiSpeed === 'instant') return 0;
    if (s.aiSpeed === 'fast') return Math.round(base * 0.35);
  } catch { /* default */ }
  return base;
}

let _toastTimer = null;
export function showToast(msg) {
  let el = $('app-toast');
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
export function genId() { return 'q' + (++_idCounter) + '_' + Math.random().toString(36).slice(2, 7); }

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
