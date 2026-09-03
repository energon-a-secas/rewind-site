// ── Entry point ──────────────────────────────────────────────
import { state, loadSaved, convex, api, setQuestsFromConvex } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';

async function init() {
  loadSaved(state);
  bindEvents();
  try {
    let quests = await convex.query(api.quests.list);
    if (!quests || quests.length === 0) {
      const seed = await convex.mutation(api.quests.seedIfEmpty, {});
      if (seed?.ok) quests = await convex.query(api.quests.list);
    }
    setQuestsFromConvex(quests || []);
  } catch (e) {
    console.warn('Convex not connected:', e?.message || e);
    state.quests = [];
  }
  render();
}

init();
