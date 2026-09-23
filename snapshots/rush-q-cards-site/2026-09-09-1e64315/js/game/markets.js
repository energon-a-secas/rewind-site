// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Markets ──────────────────────────────────────────────────
// Project Queue & For Hire trading logic.

import { state, save, addLog } from './state.js';
import { refillMarket } from './engine.js';
import { render } from './render.js';
import { isBudgetMode, canAffordCapEx, spendCapEx, canHireFTE, FTE_CEILING } from './budget.js';

/** Trade cards from hand for a market card. */
export function executeTrade(marketType, marketCardId, handCardIds) {
  const player = state.players[0]; // human player
  const market = state.markets[marketType];
  const mIdx = market.findIndex(c => c.id === marketCardId);
  if (mIdx < 0) return false;

  const marketCard = market[mIdx];
  let cost = marketCard.value || 0;

  // Punished Senior (card text): free for the lowest-scoring player from Q3.
  if (marketCard.name === 'Punished Senior' && state.currentQuarter >= 3) {
    const minRep = Math.min(...state.players.map(p => p.reputation));
    if (player.reputation === minRep) {
      cost = 0;
      addLog(state, `Punished Senior joins the underdog for free (lowest reputation).`);
    }
  }

  // Find hand cards
  const handCards = handCardIds
    .map(id => player.hand.find(c => c.id === id))
    .filter(Boolean);

  const totalValue = handCards.reduce((sum, c) => sum + (c.value || 0), 0);
  if (totalValue < cost) return false;

  // Budget: CapEx check for market trades
  if (isBudgetMode(state)) {
    const capCost = marketCard.value || 0;
    if (capCost > 0 && !canAffordCapEx(state, player, capCost)) {
      const b = (player.budget) || state.budget;
      addLog(state, `Trade blocked: insufficient CapEx (need ${capCost}, have ${b.capEx}).`);
      return false;
    }
    // FTE ceiling check for hiring
    if (marketType === 'forHire' && !canHireFTE(state, player)) {
      addLog(state, `Trade blocked: FTE ceiling of ${FTE_CEILING} reached.`);
      return false;
    }
    if (capCost > 0) spendCapEx(state, player, capCost);
  }

  // Remove hand cards → discard
  for (const c of handCards) {
    const idx = player.hand.indexOf(c);
    if (idx >= 0) {
      player.hand.splice(idx, 1);
      state.discard.push(c);
    }
  }

  // Remove from market
  market.splice(mIdx, 1);

  // Add to player
  if (marketType === 'forHire') {
    player.people.push(marketCard);
    addLog(state, `Hired ${marketCard.name} from For Hire (paid ${totalValue} value).`);
  } else {
    marketCard.timeSpent = 0;
    marketCard.isCompleted = false;
    player.projects.push(marketCard);
    addLog(state, `Acquired project "${marketCard.name}" (paid ${totalValue} value).`);
  }

  refillMarket(marketType);
  save(state);
  render(state);
  return true;
}
