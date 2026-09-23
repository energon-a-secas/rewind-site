// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary - see LICENSE.CONTENT.
// ── Starter Mode entry ───────────────────────────────────────
import { newGame, startQuarter, applyMove, sprinterMove, advance } from './engine.js';
import { render } from './render.js';

const view = { phase: 'intro', g: null, selIdx: null };

function commitMove(move) {
  const g = view.g;
  applyMove(g, 0, move);
  applyMove(g, 1, sprinterMove(g));
  advance(g);
  view.selIdx = null;
  if (g.over) view.phase = 'over';
  render(view);
}

window._stStart = function () {
  view.g = newGame();
  startQuarter(view.g);
  view.phase = 'play';
  view.selIdx = null;
  render(view);
};

window._stAgain = window._stStart;

window._stPick = function (idx) {
  view.selIdx = view.selIdx === idx ? null : idx;
  render(view);
};

window._stCancel = function () {
  view.selIdx = null;
  render(view);
};

window._stPace = function (pace) {
  if (view.selIdx == null) return;
  commitMove({ type: 'take', idx: view.selIdx, pace });
};

window._stRecover = function () {
  commitMove({ type: 'recover' });
};

render(view);
