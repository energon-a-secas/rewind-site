// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card browser entry point ─────────────────────────────────
import { loadCards, loadAllCards } from '../shared/cards-data.js';
import { state } from './state.js';
import { renderGrid, renderDetail } from './render.js';
import { bindFilters } from './filters.js';
import '../shared/nav.js';

async function init() {
  state.allCards = await loadCards();
  state.filtered = [...state.allCards];
  renderGrid();
  bindFilters();
  openDeepLinkedCard();
}

/**
 * Open a specific card's detail when arrived at via a deep link, so links from
 * the game and exercises ("View in Card Gallery") land on the exact card. The
 * gallery cards are the canonical reference; every other surface points here.
 */
async function openDeepLinkedCard() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('card');
  if (!name) return;
  await showCardByName(name);
}

/**
 * Open a card's detail by name, falling back to the full card set for
 * exercise-only cards (quantity 0), which the gallery grid filters out but which
 * are still referenced from the exercises "Open in Card Gallery" links.
 */
async function showCardByName(name) {
  let card = state.allCards.find(c => c.name === name);
  if (!card) {
    const all = await loadAllCards();
    card = all.find(c => c.name === name);
  }
  if (card) renderDetail(card);
}

// Reachable from other pages via the shared card-detail "View in Card Gallery" link.
window._openCardByName = (name) => showCardByName(name);

init();
