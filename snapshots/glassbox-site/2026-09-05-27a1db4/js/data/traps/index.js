// ── Traps & caveats ──────────────────────────────────────────
// Three separate catalogues behind one import, split out of a single
// data/traps.js once the file passed 500 lines. Each has its own shape
// and its own render panel in js/labs/traps.js, so the boundary is real:
//
//   lures.js   distractor shapes that read senior and lose
//   pairs.js   near-miss clusters where the stem picks the winner
//   checks.js  the passes to run before committing to an answer
//
// Escaping contracts and the meaning of `beyond` are documented at the
// top of each file. Pure data. No DOM.

export { LURES } from './lures.js';
export { PAIRS } from './pairs.js';
export { CHECKS } from './checks.js';
