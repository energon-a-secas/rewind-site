// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Ephemeral state for Instinct (behavior mode). A run is one deck of shuffled
 * situations; picks accumulate into a Style Compass. Only the last compass is
 * optionally persisted (as a keepsake), never mid-run progress.
 */
export const state = {
  mode: 'solo',        // 'solo' | 'facilitated'
  allCards: [],        // loaded via loadAllCards()
  deck: [],            // shuffled SITUATIONS for this run
  round: 0,            // index into deck
  picks: [],           // [{ situationId, card, style }]
  pickedThisRound: null, // { card, style } once chosen — drives reflection
  finished: false,
};

const STORE_KEY = 'rush-q-instinct';

/** Persist the final compass tally so a returning facilitator sees their last read. */
export function saveCompass(tally) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ tally, at: Date.now() }));
  } catch (e) { /* storage unavailable — non-fatal */ }
}

/** Load the last saved compass, or null. */
export function loadCompass() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/** Reset run state for a fresh deck. */
export function resetRun() {
  state.deck = [];
  state.round = 0;
  state.picks = [];
  state.pickedThisRound = null;
  state.finished = false;
}
