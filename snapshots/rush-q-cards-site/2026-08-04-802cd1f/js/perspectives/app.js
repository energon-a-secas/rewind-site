// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Perspectives entry point ─────────────────────────────────

import { loadAllCards } from '../shared/cards-data.js';
import { generateTOC } from '../shared/markdown.js';
import { initDocs } from '../shared/docs.js';
import '../shared/nav.js';
import {
  setCards, renderDecoder, renderBaselineStrip,
  renderProfileTabs, renderProfile, initProfileEvents, renderPaths,
} from './render.js';

async function init() {
  // TOC + docs chrome first, over the static headings only — dynamic
  // content (decoder cards, profile view) must not receive heading
  // anchors, or they vanish on the next re-render.
  generateTOC(document.getElementById('content'), document.getElementById('toc'));
  initDocs();

  // Paths render without card data; everything else needs the deck.
  renderPaths();

  const cards = await loadAllCards();
  setCards(cards);

  renderDecoder();
  renderBaselineStrip();
  renderProfileTabs();
  renderProfile('hero');
  initProfileEvents();
}

init().catch((e) => console.error('[perspectives] init failed:', e));
