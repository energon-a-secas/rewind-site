// ── Entry point ──────────────────────────────────────────────
// Import modules and initialize the app.
// Keep this file under 50 lines — it only wires things together.

import { state, loadSaved } from './state.js';
import { loadManifest, localAll } from './data.js';
import { render } from './render.js';
import { bindEvents, applyHash } from './events.js';

async function init() {
  loadSaved(state);
  const manifest = await loadManifest();
  if (manifest) state.manifest = manifest;
  try {
    state.local = await localAll();
  } catch { /* IndexedDB unavailable (private mode) — browser captures off */ }
  applyHash();
  render(state);
  bindEvents(state);
}

init();
