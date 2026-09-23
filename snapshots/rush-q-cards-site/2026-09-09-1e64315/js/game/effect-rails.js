// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Effect rails ─────────────────────────────────────────────
// Splits everything currently acting on the human player into two questions:
// what is working *for* me, and what is being done *to* me.
//
// Polarity cannot be derived from the card. `deferredPrivacyViolation` and the
// harmless `ethicalFixNow` are two branches of the same player choice on the
// same card (rules.js), so type, effectType and subcategory all say the same
// thing for a time bomb and for a clean fix. It has to be declared.

/** Cards that are HELD for the reaction window rather than played on turn.
 *  Declared here rather than in effects.js because both the resolver and the
 *  renderer need them, and this module imports nothing — putting them in
 *  effects.js would make render.js ↔ effects.js a cycle. */
export const REACTION_CARDS = new Set(['Compromise', 'Counter Argument', 'Talk Over', 'Lighten the Mood']);

/** Printed rep cost to play each counter out of turn. Charged on use. */
export const REACTION_COST = {
  'Compromise': 1,
  'Counter Argument': 3,
  'Talk Over': 5,
  'Lighten the Mood': 0,
};

/** Presentation metadata per pendingEffect type.
 *  `timing: 'armed'` means it waits for a trigger rather than a quarter. */
export const PENDING_EFFECT_META = {
  mentorshipHire:           { polarity: 'buff',   label: 'Hire again next quarter',      timing: 'countdown' },
  onboardingBuy:            { polarity: 'buff',   label: 'Two For Hire buys next quarter', timing: 'countdown' },
  nullifyRushQ:             { polarity: 'buff',   label: 'Next Rush Q is nullified',     timing: 'armed' },
  bonusOnComplete:          { polarity: 'buff',   label: 'Bonus when a project ships',   timing: 'armed' },
  foresightImmunity:        { polarity: 'buff',   label: 'Immune to events',             timing: 'countdown' },
  deferredPrivacyViolation: { polarity: 'debuff', label: 'Deferred privacy fix comes due', timing: 'countdown' },
};

/** Constraints imposed for the current quarter, read out of state.quarterFlags.
 *  These are the "someone did this to you" effects that never had a home. */
export const CONSTRAINT_META = {
  frozenProjects: { label: 'Projects frozen', detail: 'No progress on your projects this quarter.' },
  noAssign:       { label: 'Cannot assign',   detail: 'You may not move people onto projects this quarter.' },
  noNewProject:   { label: 'No new projects', detail: 'You may not start a project this quarter.' },
  noBonusProject: { label: 'No bonus project', detail: 'The bonus project slot is closed this quarter.' },
};

/** Unknown types are neutral, never a buff — a future negative effect quietly
 *  rendering as a benefit is the worst way for this to fail. */
export function effectPolarity(type) {
  return PENDING_EFFECT_META[type]?.polarity || 'neutral';
}

/** `activateQuarter` is an absolute quarter, not a countdown; this converts it
 *  for display only. The engine's own comparisons are deliberately subtle
 *  (foresight uses a strict `<` to buy two quarters) and are left alone. */
export function pendingEffectTiming(eff, currentQuarter) {
  const meta = PENDING_EFFECT_META[eff.type];
  if (!meta || meta.timing === 'armed') return { mode: 'armed' };
  return { mode: 'countdown', turnsLeft: Math.max(0, (eff.activateQuarter ?? currentQuarter) - currentQuarter + 1) };
}

/** Constraints landing on a player this quarter, derived from quarterFlags. */
export function activeConstraints(s, playerIdx) {
  const f = s.quarterFlags || {};
  const out = [];
  if ((f.frozenProjects || []).includes(playerIdx)) out.push('frozenProjects');
  if ((f.noAssign || []).includes(playerIdx)) out.push('noAssign');
  if (f.noNewProject || (f._noNewProject || []).includes(playerIdx)) out.push('noNewProject');
  if (f.noBonusProject && !(f.bonusProjectExempt || []).includes(playerIdx)) out.push('noBonusProject');
  return out;
}

/** Hits worth showing: this quarter and the one before, aimed at this player.
 *  Older entries stay in state for the end-of-game story but leave the rail. */
export function recentHits(s, playerIdx) {
  return (s.incomingHits || []).filter(h => h.target === playerIdx && h.q >= s.currentQuarter - 1);
}

/** Split the human's pendingEffects by polarity. */
export function splitPendingEffects(player) {
  const all = player.pendingEffects || [];
  return {
    buffs: all.filter(e => effectPolarity(e.type) !== 'debuff'),
    debuffs: all.filter(e => effectPolarity(e.type) === 'debuff'),
  };
}
