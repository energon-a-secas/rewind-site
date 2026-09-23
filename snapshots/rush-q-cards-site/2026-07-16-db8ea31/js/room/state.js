// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Room Compass — ephemeral, in-memory cohort state for a facilitated room.
 *
 * Solo Instinct maps ONE person's archetype. Room Compass maps the GROUP: the
 * facilitator projects a situation, the room picks (physical cards raised or a
 * show of hands), and the facilitator taps a counter per archetype. Counts
 * aggregate into a live group Style Compass per round and cumulatively across
 * the whole session.
 *
 * There is no backend and no localStorage. A run lives only for the session,
 * exactly like Quick mode, and `resetRoom()` returns to a clean slate.
 */
import { SITUATIONS } from '../behavior/data.js';
import { PROFILES } from '../exercises/profiles.js';

/** Every archetype key the compass can track, in a stable order. */
export const STYLE_KEYS = Object.keys(PROFILES);

export const state = {
  deck: SITUATIONS,   // all 8 situations, in fixed order for a projected walkthrough
  index: 0,           // current situation index
  started: false,     // false while on the landing screen
  finished: false,    // true once the final Room Compass is shown
  // Per-round hand counts: { [situationId]: { [styleKey]: count } }.
  counts: {},
};

/** The situation currently on the projector. */
export function currentSituation() {
  return state.deck[state.index];
}

/** The archetype keys present in a situation's hand (a subset of STYLE_KEYS). */
export function situationStyles(situation) {
  return situation.hand.map((h) => h.style);
}

/** Ensure a counts bucket exists for a situation and return it. */
export function bucketFor(situationId) {
  if (!state.counts[situationId]) state.counts[situationId] = {};
  return state.counts[situationId];
}

/** Current count of raised hands for one archetype in one situation. */
export function countOf(situationId, styleKey) {
  return (state.counts[situationId] && state.counts[situationId][styleKey]) || 0;
}

/** Nudge a count up or down, clamped at zero. Returns the new value. */
export function bump(situationId, styleKey, delta) {
  const bucket = bucketFor(situationId);
  const next = Math.max(0, (bucket[styleKey] || 0) + delta);
  bucket[styleKey] = next;
  return next;
}

/** Total hands counted for a single round. */
export function roundTotal(situationId) {
  const bucket = state.counts[situationId] || {};
  return Object.values(bucket).reduce((a, b) => a + b, 0);
}

/**
 * Distribution for ONE round: { styleKey: count } across only the archetypes
 * that appear in that situation's hand.
 */
export function roundTally(situation) {
  const bucket = state.counts[situation.id] || {};
  const tally = {};
  for (const key of situationStyles(situation)) tally[key] = bucket[key] || 0;
  return tally;
}

/**
 * Cumulative distribution across every round counted so far, over all six
 * archetype keys (so archetypes nobody ever picked surface as zeros).
 */
export function cumulativeTally() {
  const tally = {};
  for (const key of STYLE_KEYS) tally[key] = 0;
  for (const bucket of Object.values(state.counts)) {
    for (const [key, n] of Object.entries(bucket)) {
      if (tally[key] != null) tally[key] += n;
    }
  }
  return tally;
}

/** Total hands counted across the whole session. */
export function sessionTotal() {
  return Object.values(cumulativeTally()).reduce((a, b) => a + b, 0);
}

/** How many rounds have at least one counted hand. */
export function roundsCounted() {
  return Object.values(state.counts).filter(
    (b) => Object.values(b).some((n) => n > 0)
  ).length;
}

/** Wipe all counts and return to the landing screen. */
export function resetRoom() {
  state.index = 0;
  state.started = false;
  state.finished = false;
  state.counts = {};
}
