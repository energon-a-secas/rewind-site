// ── Entry point ──────────────────────────────────────────────
import { state, loadSaved } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved(state);
  render();
  bindEvents();
}

init();
