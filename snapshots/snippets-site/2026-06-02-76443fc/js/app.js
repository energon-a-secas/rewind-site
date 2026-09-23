// ── Entry point ──────────────────────────────────────────────

import { render } from './render.js';
import { bindEvents } from './events.js';

function init() {
  render();
  bindEvents();
}

init();
