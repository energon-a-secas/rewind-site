import { state, loadSaved } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';
import { parseShareHash } from './share.js';

function readUrlHash() {
  try {
    const hash = window.location.hash;
    const shared = parseShareHash(hash);
    if (shared) {
      state.mode = 'character';
      state.character = { ...state.character, ...shared, preset: 'blank' };
      return;
    }

    const mode = hash.replace(/^#/, '').split('?')[0];
    if (mode === 'tags' || mode === 'character') {
      state.mode = mode;
    }
  } catch (e) {
    // ignore
  }
}

function init() {
  loadSaved();
  readUrlHash();
  render();
  bindEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
