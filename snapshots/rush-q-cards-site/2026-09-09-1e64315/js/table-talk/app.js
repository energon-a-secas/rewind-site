// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Table Talk entry point ───────────────────────────────────
// Prints a fanned deck of pure workplace-tension discussion cards.
// Content is the verified behavior SITUATIONS (see js/behavior/data.js).

import { SITUATIONS } from '../behavior/data.js';
import { renderDeck } from './render.js';

const deck = document.getElementById('tt-deck');
if (deck) deck.innerHTML = renderDeck(SITUATIONS);

const count = document.getElementById('tt-count');
if (count) count.textContent = String(SITUATIONS.length);

// Print button uses inline onclick per site convention — expose on window.
window.ttPrint = () => window.print();
