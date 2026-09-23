// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Data loading ─────────────────────────────────────────────
// Load cards from static cards.json.
// Expand by quantity, assign IDs, build decks.

import { shuffle, genId } from './utils.js';

// Re-export shared card data for backward compat within game modules
export { TYPE_COLORS, typeColor } from '../shared/cards-data.js';

let _cardsData = null;

export async function loadCards() {
  if (_cardsData) return _cardsData;

  // Load from static JSON (path relative to /game/ subdirectory)
  const resp = await fetch('../data/cards.json');
  const data = await resp.json();
  // Support both { cards: [...] } (v2) and [...] (v1) formats
  _cardsData = Array.isArray(data) ? data : (data.cards || []);
  // Filter to active cards only (quantity > 0)
  _cardsData = _cardsData.filter(c => c.quantity > 0);
  console.log(`Loaded ${_cardsData.length} cards from static JSON`);
  return _cardsData;
}

/** Expand card definitions by quantity, assign unique IDs. */
function expandCards(defs) {
  const cards = [];
  for (const def of defs) {
    const qty = def.quantity || 1;
    for (let i = 0; i < qty; i++) {
      cards.push({ ...def, id: genId() });
    }
  }
  return cards;
}

/** Build all decks from card definitions. */
export function buildDecks(defs) {
  const expanded = expandCards(defs);
  const decks = {
    main: [],
    events: [],
    rushQ: [],
    layoffs: [],
    projectQueue: [],
    forHire: [],
    starterProjects: [],
    starterPeople: [],
    starterFavors: [],
    starterTldr: [],
    bonusProject: [],
    traits: [],
  };

  for (const card of expanded) {
    const t = card.type;
    const d = card.deck;

    if (d === 'Skill') {
      decks.main.push(card);
    } else if (d === 'Event' && t === 'Team') {
      decks.events.push(card);
    } else if (d === 'Rush Q!' && t === 'Quarter Event') {
      decks.rushQ.push(card);
    } else if (d === 'Rush Q!' && t === 'Layoff') {
      decks.layoffs.push(card);
    } else if (d === 'Business' && t === 'Project Queue') {
      decks.projectQueue.push(card);
    } else if (d === 'Business' && t === 'Bonus Project') {
      decks.bonusProject.push(card);
    } else if (d === 'For Hire' && t === 'Talent') {
      decks.forHire.push(card);
    } else if (d === 'Starter' && t === 'Project') {
      decks.starterProjects.push(card);
    } else if (d === 'Starter' && t === 'Favor') {
      decks.starterFavors.push(card);
    } else if (d === 'Starter' && t === 'TL;DR') {
      decks.starterTldr.push(card);
    } else if (d === 'Player' && t === 'Trait') {
      decks.traits.push(card);
    }
  }

  // Shuffle all decks
  for (const key of Object.keys(decks)) shuffle(decks[key]);
  return decks;
}
