// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card data loader ─────────────────────────────────────────
// Shared card loading + type colors. Used by cards browser, exercises, and game.

let _cardsData = null;
let _allCardsData = null;

export async function loadCards() {
  if (_cardsData) return _cardsData;
  const all = await loadAllCards();
  _cardsData = all.filter(c => c.quantity > 0);
  return _cardsData;
}

/** Load all cards including exercise-only (quantity: 0). */
export async function loadAllCards() {
  if (_allCardsData) return _allCardsData;

  const isSubdir = location.pathname.split('/').filter(Boolean).length > 0;
  const basePath = isSubdir ? '../data/cards.json' : 'data/cards.json';

  const resp = await fetch(basePath);
  const data = await resp.json();
  _allCardsData = Array.isArray(data) ? data : (data.cards || []);
  return _allCardsData;
}

/** Card type to accent color map — synced with generate-cards.py TYPE_STYLES. */
// Eye-comfort ramp — same hues as the original palette, desaturated ~15% for
// the warm-dark bg. Keep in sync with the --type-* tokens in css/shared.css.
export const TYPE_COLORS = {
  'Talent':         '#35b0a1',  // Teal
  'Project':        '#e3b64a',  // Amber
  'Project Queue':  '#d9973a',  // Dark amber
  'Bonus Project':  '#e2b654',  // Gold
  'Soft':           '#b490e4',  // Purple/lavender
  'Hard':           '#4da5d8',  // Sky blue
  'Power':          '#9c64d6',  // Deep purple
  'Team':           '#6591e0',  // Blue
  'Quarter Event':  '#e0605c',  // Red
  'Layoff':         '#e2a8c4',  // Pink
  'Favor':          '#9560d2',  // Blue-violet
  'TL;DR':          '#ac74e0',  // Violet
  'budget':         '#7dabe8',  // Blue (budget tokens)
  'Trait':          '#e08a4a',  // Orange (player traits)
  'CapEx':          '#d9973a',  // Amber (capital spend — matches project family)
  'OpEx':           '#b490e4',  // Lavender (operational spend — matches soft family)
  'Individual':     '#4fc2b2',  // Teal-green (mission/individual cards)
};

export function typeColor(type) {
  return TYPE_COLORS[type] || '#888';
}

/** Convert card name to a root-absolute image path so art loads from every route. */
export function cardImagePath(name) {
  const slug = name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
  return `/assets/cards/${slug}.png`;
}
