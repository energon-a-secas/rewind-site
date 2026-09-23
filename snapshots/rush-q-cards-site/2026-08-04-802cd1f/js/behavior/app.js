// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { loadAllCards } from '../shared/cards-data.js';
import { state } from './state.js';
import { renderLanding } from './render.js';
import './events.js';
import '../shared/nav.js';

async function init() {
  state.allCards = await loadAllCards();
  renderLanding();
}

init();
