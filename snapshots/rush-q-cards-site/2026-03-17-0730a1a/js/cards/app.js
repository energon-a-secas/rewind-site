// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card browser entry point ─────────────────────────────────
import { loadCards } from '../shared/cards-data.js';
import { state } from './state.js';
import { renderGrid } from './render.js';
import { bindFilters } from './filters.js';
import '../shared/nav.js';

async function init() {
  state.allCards = await loadCards();
  state.filtered = [...state.allCards];
  renderGrid();
  bindFilters();
}

init();
