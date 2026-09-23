// ── Entry point ──────────────────────────────────────────────
// Wires modules together. Keep under 50 lines.

import { state, loadSaved } from './state.js';
import { render, recompute } from './render.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved(state);
  recompute(state);
  render(state);
  bindEvents(state);
}

init();
