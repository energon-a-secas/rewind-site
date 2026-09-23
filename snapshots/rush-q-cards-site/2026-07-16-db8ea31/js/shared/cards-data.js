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
export const TYPE_COLORS = {
  'Talent':         '#14b8a6',  // Teal
  'Project':        '#ffc107',  // Amber
  'Project Queue':  '#f59e0b',  // Dark amber
  'Bonus Project':  '#fbbf24',  // Gold
  'Soft':           '#c084fc',  // Purple/lavender
  'Hard':           '#0ea5e9',  // Sky blue
  'Power':          '#9333ea',  // Deep purple
  'Team':           '#3b82f6',  // Blue
  'Quarter Event':  '#ef4444',  // Red
  'Layoff':         '#f9a8d4',  // Pink
  'Favor':          '#8a2be2',  // Blue-violet
  'TL;DR':          '#a855f7',  // Violet
  'budget':         '#60a5fa',  // Blue (budget tokens)
  'Trait':          '#f97316',  // Orange (player traits)
  'CapEx':          '#f59e0b',  // Amber (capital spend — matches project family)
  'OpEx':           '#c084fc',  // Lavender (operational spend — matches soft family)
  'Individual':     '#2dd4bf',  // Teal-green (mission/individual cards)
};

export function typeColor(type) {
  return TYPE_COLORS[type] || '#888';
}

/** Convert card name to a root-absolute image path so art loads from every route. */
export function cardImagePath(name) {
  const slug = name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
  return `/assets/cards/${slug}.png`;
}
