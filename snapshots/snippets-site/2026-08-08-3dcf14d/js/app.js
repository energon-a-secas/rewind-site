// ── Entry point ──────────────────────────────────────────────

import { initState, state } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';
import { $ } from './utils.js';

/** Publishes the sticky toolbar's height so cards can scroll clear of it. */
function trackToolbarHeight() {
  const toolbar = $('toolbar');
  const apply = () =>
    document.documentElement.style.setProperty('--toolbar-h', `${toolbar.offsetHeight}px`);
  apply();
  new ResizeObserver(apply).observe(toolbar);
}

function init() {
  initState();
  $('search-input').value = state.searchQuery;
  render();
  bindEvents();
  trackToolbarHeight();
}

init();
