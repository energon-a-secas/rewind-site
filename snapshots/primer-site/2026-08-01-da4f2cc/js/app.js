// ── Entry point ──────────────────────────────────────────────
// Wire modules together. bindEvents applies the initial route
// and renders, so no separate render() call is needed here.

import { state, loadSaved } from './state.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved(state);
  bindEvents(state);
}

init();
