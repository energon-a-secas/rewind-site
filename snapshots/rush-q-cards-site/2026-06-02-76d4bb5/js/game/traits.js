// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Trait (Management Style) system ─────────────────────────
// Each trait creates a distinct playstyle with strengths, weaknesses,
// and budget interactions that teach real management archetypes.

import { addLog } from './state.js';
import { shuffle } from './utils.js';

export const TRAIT_DEFS = {
  'Facilitator': {
    archetype: 'The People-First Leader',
    budgetMod: { capEx: -2, opEx: 2 },
    onPlay: { triggerType: 'Soft', draw: 1 },
    costMod: { Hard: 1 },
    blocked: ['sabotage'],
  },
  'Networker': {
    archetype: 'The Relationship Builder',
    budgetMod: { capEx: 0, opEx: 0 },
    recovery: { type: 'Soft', interval: 3 },
    costHalved: 'Soft',
    costMod: { Hard: 1 },
    rushQExtra: 1,
    startBonus: 'favor',
  },
  'Visionary': {
    archetype: 'The Strategic Thinker',
    budgetMod: { capEx: 2, opEx: -2 },
    extraDrawQuarters: [1, 5],
    maxSkillsPerTurn: 1,
    shortDeadlinePenalty: 2,
  },
  'Politician': {
    archetype: 'The Corporate Operator',
    budgetMod: { capEx: 0, opEx: 0 },
    recovery: { type: 'Power', interval: 2 },
    costHalved: 'Power',
    sabotageFree: true,
    rewardMod: -1,
  },
  'Risk Manager': {
    archetype: 'The Conservative Leader',
    budgetMod: { capEx: 1, opEx: 1 },
    eventDiscard: true,
    shieldFree: true,
    maxProjects: 2,
    progressReduction: 1,
    blocked: ['burst'],
  },
  'Subject Matter Expert': {
    archetype: 'The Technical Leader',
    budgetMod: { capEx: -1, opEx: 2 },
    recovery: { type: 'Hard', interval: 2 },
    costHalved: 'Hard',
    techLeadExtra: 1,
  },
  'Time Wizard': {
    archetype: 'The Execution-Focused Manager',
    budgetMod: { capEx: 1, opEx: 2 },
    autoProgress: 1,
    earlyBonus: 2,
  },
  'Mentor': {
    archetype: 'The Coaching Leader',
    budgetMod: { capEx: 2, opEx: -1 },
    onCompletion: { personValueBonus: 2 },
    firstProjectSlowdown: 1,
    blocked: ['burst'],
  },
  'Firefighter': {
    archetype: 'The Crisis Leader',
    budgetMod: { capEx: -3, opEx: 3 },
    outageBonus: 3,
    noEventPenalty: -1,
    maxHandSize: 4,
  },
};

function def(player) {
  return player.trait ? (TRAIT_DEFS[player.trait.name] || null) : null;
}

export function getTraitDef(player) { return def(player); }

export function traitBudgetMod(player) {
  const d = def(player);
  return d?.budgetMod || { capEx: 0, opEx: 0 };
}

export function traitCostMod(card, player) {
  const d = def(player);
  if (!d) return 0;
  const t = card.type;
  if (d.costHalved === t) return -Math.floor((card.value || 0) / 2);
  if (d.sabotageFree && card.subcategory === 'sabotage') return -(card.value || 0);
  if (d.shieldFree && card.subcategory === 'shield') return -(card.value || 0);
  return d.costMod?.[t] || 0;
}

export function traitCanPlay(card, player) {
  const d = def(player);
  if (!d) return { allowed: true };
  if (d.blocked?.includes(card.subcategory)) {
    return { allowed: false, reason: `${player.trait.name} cannot play ${card.subcategory} cards` };
  }
  if (d.maxProjects) {
    const isProject = card.type === 'Project' || card.type === 'Project Queue' || card.type === 'Bonus Project';
    if (isProject && player.projects.filter(p => !p.isCompleted).length >= d.maxProjects) {
      return { allowed: false, reason: `${player.trait.name}: max ${d.maxProjects} active projects` };
    }
  }
  return { allowed: true };
}

export function traitMaxSkills(player) {
  const d = def(player);
  return d?.maxSkillsPerTurn ?? 2;
}

export function traitOnPlay(card, player) {
  const d = def(player);
  if (!d?.onPlay) return null;
  if (card.type === d.onPlay.triggerType) return { draw: d.onPlay.draw || 0 };
  return null;
}

export function traitRewardMod(player) {
  return def(player)?.rewardMod || 0;
}

export function traitFailMult(player) {
  return def(player)?.failMultiplier || 1;
}

export function traitEarlyBonus(player) {
  return def(player)?.earlyBonus || 0;
}

export function traitProgressReduction(player) {
  return def(player)?.progressReduction || 0;
}

export function traitTechLeadExtra(player) {
  return def(player)?.techLeadExtra || 0;
}

export function traitRushQExtra(player) {
  return def(player)?.rushQExtra || 0;
}

export function traitShortDeadlinePenalty(player, proj) {
  const d = def(player);
  if (!d?.shortDeadlinePenalty) return 0;
  return (proj.deadline || 99) <= d.shortDeadlinePenalty ? 1 : 0;
}

export function traitOutageBonus(player) {
  return def(player)?.outageBonus || 0;
}

export function traitEventDiscard(player) {
  const d = def(player);
  if (!d?.eventDiscard) return false;
  if (player._eventDiscardUsed) return false;
  return true;
}

export function useEventDiscard(player) {
  player._eventDiscardUsed = true;
}

export function traitMaxHandSize(player) {
  return def(player)?.maxHandSize ?? null;
}

export function traitNoEventPenalty(player) {
  return def(player)?.noEventPenalty || 0;
}

export function traitDoubleNegativeEnd(player) {
  return def(player)?.doubleNegativeEnd || false;
}

export function traitFirstProjectSlowdown(player) {
  const d = def(player);
  if (!d?.firstProjectSlowdown) return 0;
  const hasAny = player.projects.length > 0;
  if (!hasAny) return d.firstProjectSlowdown;
  return 0;
}

export function traitFreeHire(player) {
  const d = def(player);
  if (!d?.freeHireOnce) return false;
  if (player._freeHireUsed) return false;
  player._freeHireUsed = true;
  return true;
}

export function traitOnCompletion(player) {
  return def(player)?.onCompletion || null;
}

export function traitQuarterStartActions(player, s) {
  const d = def(player);
  if (!d) return [];
  const actions = [];

  player._eventDiscardUsed = false;

  if (d.autoProgress) {
    const active = player.projects.filter(p => !p.isCompleted);
    if (active.length) {
      const sorted = [...active].sort((a, b) =>
        ((a.deadline || 99) - (a.timeSpent || 0)) - ((b.deadline || 99) - (b.timeSpent || 0))
      );
      actions.push({ type: 'progress', projId: sorted[0].id, amount: d.autoProgress });
    }
  }

  if (d.extraDrawQuarters?.includes(s.currentQuarter)) {
    actions.push({ type: 'draw', count: 1 });
  }

  if (d.recovery && s.currentQuarter % d.recovery.interval === 0) {
    actions.push({ type: 'recover', cardType: d.recovery.type });
  }

  return actions;
}

export function traitEnforceHandLimit(player, discard) {
  const limit = traitMaxHandSize(player);
  if (limit === null) return [];
  const discarded = [];
  while (player.hand.length > limit) {
    const sorted = [...player.hand].sort((a, b) => (a.value || 0) - (b.value || 0));
    const card = sorted[0];
    const idx = player.hand.indexOf(card);
    if (idx >= 0) {
      player.hand.splice(idx, 1);
      discard.push(card);
      discarded.push(card);
    } else break;
  }
  return discarded;
}

export function assignTraits(s) {
  const traitDeck = s.decks.traits || [];
  if (!traitDeck.length) return;
  shuffle(traitDeck);
  for (const p of s.players) {
    if (traitDeck.length) {
      p.trait = traitDeck.pop();
      addLog(s, `${p.name} plays as ${p.trait.name} (${TRAIT_DEFS[p.trait.name]?.archetype || 'Manager'}).`);
    }
  }
}
