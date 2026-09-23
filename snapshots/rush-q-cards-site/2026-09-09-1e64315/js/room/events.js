// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Room Compass event handlers. HTML uses inline onclick per this project's
 * convention, so each handler is exposed on window here (never on the elements
 * in render.js). Handlers mutate in-memory state then re-render.
 */
import { state, currentSituation, bump, resetRoom } from './state.js';
import { renderLanding, renderRound, renderFinal } from './render.js';

function start() {
  state.started = true;
  state.finished = false;
  state.index = 0;
  renderRound();
}

function bumpStyle(styleKey, delta) {
  const sit = currentSituation();
  if (!sit) return;
  bump(sit.id, styleKey, Number(delta));
  renderRound();
}

function next() {
  if (state.index >= state.deck.length - 1) {
    state.finished = true;
    renderFinal();
    return;
  }
  state.index += 1;
  renderRound();
}

function prev() {
  if (state.index > 0) state.index -= 1;
  renderRound();
}

function review() {
  state.finished = false;
  renderRound();
}

function reset() {
  resetRoom();
  renderLanding();
}

window._roomStart = start;
window._roomBump = bumpStyle;
window._roomNext = next;
window._roomPrev = prev;
window._roomReview = review;
window._roomReset = reset;
