// ── Entry point ──────────────────────────────────────────────
// Wires the modules together. Keep under 50 lines.

import { state } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';
import { load, readLocal, getUser, isSignedIn } from './store.js';

async function init() {
  bindEvents();

  // Paint the cached local list first so the app is usable — and shows real
  // content — before any network call resolves.
  state.tasks = readLocal();
  state.syncState = isSignedIn() ? 'syncing' : 'local';
  render();

  try {
    state.user = await getUser();
    const { tasks, synced } = await load();
    state.tasks = tasks;
    state.syncState = synced ? 'synced' : 'local';
  } catch {
    // Cloud unreachable or the session expired — fall back to local-only.
    state.syncState = isSignedIn() ? 'error' : 'local';
  }

  render();
}

init();
