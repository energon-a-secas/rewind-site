// ── Entry point ──────────────────────────────────────────────

import { state, loadSaved } from './state.js';
import { render } from './render.js';
import { bindEvents, loadData } from './events.js';

async function init() {
  loadSaved(state);

  const params = new URLSearchParams(window.location.search);
  const listId = params.get('list');
  if (listId && !window.location.hash.startsWith('#s=')) {
    state.currentView = 'shared';
    state.activeListId = listId;
  }

  render(state);
  bindEvents(state);
  await loadData();
}

init();
