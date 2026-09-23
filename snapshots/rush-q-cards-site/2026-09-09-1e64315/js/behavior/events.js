// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { state, resetRun, saveCompass } from './state.js';
import { SITUATIONS } from './data.js';
import { PROFILES } from '../exercises/profiles.js';
import { renderLanding, renderRound, renderCompass, computeTally } from './render.js';

/** Fisher–Yates shuffle into a new array. */
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

window._startInstinct = function(mode) {
  state.mode = mode === 'facilitated' ? 'facilitated' : 'solo';
  resetRun();
  state.deck = shuffled(SITUATIONS);
  renderRound();
  window.scrollTo(0, 0);
};

window._pickCard = function(name) {
  if (state.pickedThisRound) return; // already chosen this round
  const sit = state.deck[state.round];
  if (!sit) return;
  const choice = sit.hand.find(h => h.card === name);
  if (!choice) return;
  state.pickedThisRound = { card: choice.card, style: choice.style };
  state.picks.push({ situationId: sit.id, card: choice.card, style: choice.style });
  renderRound();
  window.scrollTo(0, 0);
};

window._nextRound = function() {
  state.pickedThisRound = null;
  state.round++;
  if (state.round >= state.deck.length) {
    state.finished = true;
    saveCompass(computeTally());
    renderCompass();
  } else {
    renderRound();
  }
  window.scrollTo(0, 0);
};

window._restart = function() {
  resetRun();
  renderLanding();
  window.scrollTo(0, 0);
};

window._copySummary = function() {
  const tally = computeTally();
  const total = state.picks.length || 0;
  const ordered = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const lines = [];
  lines.push('RUSH Q: INSTINCT: STYLE COMPASS');
  lines.push('(A mirror of your gut reactions, not a score.)');
  lines.push('');
  for (const [key, n] of ordered) {
    const p = PROFILES[key];
    const bar = '█'.repeat(n) + '·'.repeat(Math.max(0, total - n));
    lines.push(`${p.name.padEnd(14)} ${bar} ${n}/${total}`);
  }
  const top = PROFILES[ordered[0][0]];
  lines.push('');
  lines.push(`Leans most toward: ${top.name}, ${top.strength}.`);
  lines.push(`Shadow to watch: ${top.weakness}.`);
  const zeros = ordered.filter(([, n]) => n === 0).map(([k]) => PROFILES[k].name);
  if (zeros.length) lines.push(`Never reached for: ${zeros.join(', ')}.`);
  const text = lines.join('\n');

  const done = () => {
    const btn = document.querySelector('.instinct-btn--ghost');
    if (btn) { const t = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = t; }, 1600); }
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done, () => window.prompt('Copy your compass:', text));
  } else {
    window.prompt('Copy your compass:', text);
  }
};
