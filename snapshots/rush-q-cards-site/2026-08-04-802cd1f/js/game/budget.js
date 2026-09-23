// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Budget system (CapEx / OpEx) ────────────────────────────
// Toggleable budget mode: when off, game plays identically to classic.
// Budget is tracked PER PLAYER, not globally.

import { addLog } from './state.js';
import { showChoiceDialog } from './render.js';
import { traitBudgetMod } from './traits.js';

/** Max people per player when budget mode is on. */
export const FTE_CEILING = 8;

/** Budget conversion ratio: 2 source = 1 target. */
const CONVERT_RATIO = 2;

/** Returns true if budget mode is active. */
export function isBudgetMode(s) {
  return !!s.budgetMode;
}

/** Get a player's budget object (creates default if missing). */
function getBudget(player) {
  if (!player.budget) {
    player.budget = { capEx: 0, opEx: 0, capExBase: 8, opExBase: 8 };
  }
  return player.budget;
}

/** Initialize budget values at game start for all players. */
export function initBudget(s) {
  if (!isBudgetMode(s)) return;
  for (const p of s.players) {
    p.budget = {
      capEx: s.budget.capExBase,
      opEx: s.budget.opExBase,
      capExBase: s.budget.capExBase,
      opExBase: s.budget.opExBase,
    };
  }
  addLog(s, `Budget mode ON — CapEx: ${s.budget.capExBase}, OpEx: ${s.budget.opExBase} per player`);
}

/** Check if player can afford an OpEx spend. */
export function canAffordOpEx(s, player, amount) {
  if (!isBudgetMode(s)) return true;
  return getBudget(player).opEx >= amount;
}

/** Check if player can afford a CapEx spend. */
export function canAffordCapEx(s, player, amount) {
  if (!isBudgetMode(s)) return true;
  return getBudget(player).capEx >= amount;
}

/** Deduct from player's OpEx pool. Returns true if successful. */
export function spendOpEx(s, player, amount) {
  if (!isBudgetMode(s)) return true;
  const b = getBudget(player);
  if (b.opEx < amount) return false;
  b.opEx -= amount;
  addLog(s, `${player.name} spent ${amount} OpEx (remaining: ${b.opEx}).`);
  return true;
}

/** Deduct from player's CapEx pool. Returns true if successful. */
export function spendCapEx(s, player, amount) {
  if (!isBudgetMode(s)) return true;
  const b = getBudget(player);
  if (b.capEx < amount) return false;
  b.capEx -= amount;
  addLog(s, `${player.name} spent ${amount} CapEx (remaining: ${b.capEx}).`);
  return true;
}

/**
 * Convert budget between pools at 2:1 ratio.
 * direction: 'capToOp' or 'opToCap'
 */
export function convertBudget(s, player, direction) {
  if (!isBudgetMode(s)) return false;
  const b = getBudget(player);
  if (direction === 'capToOp') {
    if (b.capEx < CONVERT_RATIO) return false;
    b.capEx -= CONVERT_RATIO;
    b.opEx += 1;
    addLog(s, `${player.name} converted ${CONVERT_RATIO} CapEx to 1 OpEx (CapEx: ${b.capEx}, OpEx: ${b.opEx}).`);
    return true;
  }
  if (direction === 'opToCap') {
    if (b.opEx < CONVERT_RATIO) return false;
    b.opEx -= CONVERT_RATIO;
    b.capEx += 1;
    addLog(s, `${player.name} converted ${CONVERT_RATIO} OpEx to 1 CapEx (CapEx: ${b.capEx}, OpEx: ${b.opEx}).`);
    return true;
  }
  return false;
}

/** Reset budget at quarter boundary. 50% CapEx rolls over, OpEx expires. */
export function resetQuarterBudget(s) {
  if (!isBudgetMode(s)) return;
  for (const p of s.players) {
    const b = getBudget(p);
    const capExRollover = Math.floor((b.capEx || 0) / 2); // 50% CapEx carries forward
    const expiredCap = b.capEx - capExRollover;
    const expiredOp = b.opEx;
    b.capEx = b.capExBase + capExRollover;
    b.opEx = b.opExBase;
    if (expiredCap > 0 || expiredOp > 0 || capExRollover > 0) {
      addLog(s, `${p.name} budget reset — expired CapEx: ${expiredCap}, OpEx: ${expiredOp}. Rollover CapEx: ${capExRollover}. New: CapEx ${b.capEx}, OpEx ${b.opEx}.`);
    }
  }
}

/** Budget total per quarter (player chooses the CapEx/OpEx split). */
const BUDGET_TOTAL = 18;
const BUDGET_MIN = 3; // minimum in each pool

/** Get unassigned people for payroll release (avoids circular import from engine). */
function getUnassigned(player) {
  const assignedIds = new Set();
  for (const ids of Object.values(player.assignments || {})) {
    for (const id of ids) assignedIds.add(id);
  }
  return player.people.filter(p => !assignedIds.has(p.id));
}

/**
 * Process payroll: deduct 1 OpEx per person the player has.
 * If OpEx goes negative, release cheapest unassigned people.
 */
export function processPayroll(s) {
  if (!isBudgetMode(s)) return;
  for (const p of s.players) {
    const b = getBudget(p);
    const cost = p.people.length;
    b.opEx -= cost;
    addLog(s, `${p.name} payroll: -${cost} OpEx for ${cost} people (remaining: ${b.opEx}).`);
    releaseForPayroll(s, p);
  }
}

/** Release cheapest unassigned people if OpEx < 0. */
export function releaseForPayroll(s, player) {
  const b = getBudget(player);
  while (b.opEx < 0 && player.people.length > 0) {
    const unassigned = getUnassigned(player);
    if (unassigned.length === 0) break;
    unassigned.sort((a, b) => (a.value || 0) - (b.value || 0));
    const toRelease = unassigned[0];
    const idx = player.people.indexOf(toRelease);
    if (idx >= 0) {
      player.people.splice(idx, 1);
      s.discard.push(toRelease);
      // Refund based on person value (more valuable = higher refund)
      const refund = Math.max(1, Math.min(3, Math.floor((toRelease.value || 1) / 3)));
      b.opEx += refund;
      addLog(s, `${player.name} released ${toRelease.name} (value ${toRelease.value || 1}, +${refund} OpEx) — OpEx now ${b.opEx}.`);
    } else break;
  }
}

/**
 * Present a budget allocation choice at quarter start.
 * Total = 16 + budgetBonus. Player decides the split. Minimum 3 in each pool.
 * Human player gets a slider dialog; AI auto-chooses.
 */
export async function allocateQuarterBudget(s, player) {
  if (!isBudgetMode(s)) return;

  const bonus = player.budgetBonus || 0;
  const mod = traitBudgetMod(player);
  const total = BUDGET_TOTAL + bonus;
  const b = getBudget(player);

  if (!player.isAI) {
    // Offer two split options for human player
    const halfA = Math.floor(total / 2);
    const halfB = total - halfA;
    const optA = { capEx: halfA, opEx: halfB };
    // Bias second option toward OpEx (covers payroll)
    const opHeavy = Math.min(total - BUDGET_MIN, Math.max(BUDGET_MIN, player.people.length + 4));
    const optB = { capEx: total - opHeavy, opEx: opHeavy };
    if (optA.capEx === optB.capEx && optA.opEx === optB.opEx) {
      optB.capEx = BUDGET_MIN;
      optB.opEx = total - BUDGET_MIN;
    }

    const options = [
      {
        label: `CapEx ${optA.capEx} / OpEx ${optA.opEx}`,
        detail: `Balanced: CapEx ${optA.capEx} for hiring & projects, OpEx ${optA.opEx} for skills & payroll.`,
      },
      {
        label: `CapEx ${optB.capEx} / OpEx ${optB.opEx}`,
        detail: `Operations-heavy: CapEx ${optB.capEx} for hiring, OpEx ${optB.opEx} for skills & payroll (${player.people.length} people).`,
      },
    ];
    const fakeCard = { name: 'Quarter Budget', type: 'Budget', skill: `Total budget: ${total}. Choose your CapEx/OpEx split for this quarter.` };
    const idx = await showChoiceDialog(fakeCard, options);
    const chosen = idx === 0 ? optA : optB;
    b.capEx += chosen.capEx; // adds to any rollover
    b.opEx = chosen.opEx;
    b.capExBase = chosen.capEx;
    b.opExBase = chosen.opEx;
    addLog(s, `Budget allocated — CapEx: ${b.capEx} (${chosen.capEx} new), OpEx: ${chosen.opEx}. Total: ${total}.`);
  } else {
    // AI: split based on payroll needs + trait modifier
    const payrollNeed = player.people.length;
    const half = Math.floor(total / 2);
    const baseOpEx = Math.max(BUDGET_MIN, Math.min(total - BUDGET_MIN, half + Math.max(0, payrollNeed - half)));
    const baseCapEx = total - baseOpEx;
    const capEx = Math.max(BUDGET_MIN, baseCapEx + mod.capEx);
    const opEx = Math.max(BUDGET_MIN, total - capEx);
    b.capEx += capEx; // adds to any rollover
    b.opEx = opEx;
    b.capExBase = capEx;
    b.opExBase = opEx;
    addLog(s, `${player.name} allocated budget — CapEx: ${b.capEx} (${capEx} new), OpEx: ${opEx}. Total: ${total}${player.trait ? ` [${player.trait.name}]` : ''}.`);
  }
}

/**
 * Check if a player can add more people (FTE ceiling).
 * Returns true if under the limit or budget mode is off.
 */
export function canHireFTE(s, player) {
  if (!isBudgetMode(s)) return true;
  return player.people.length < FTE_CEILING;
}
