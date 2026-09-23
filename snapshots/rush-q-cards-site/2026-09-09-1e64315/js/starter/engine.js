// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary - see LICENSE.CONTENT.
// ── Starter Mode engine ──────────────────────────────────────
// A pure, deterministic, DOM-free rules module. Four quarters, two players
// (you vs "the Sprinter", who always crunches), one project and one pace
// decision per quarter. The whole game tree is small enough to enumerate
// exhaustively in tests, so Starter is balanced by proof rather than by soak:
// "always crunch" provably never beats the best mixed line.
//
// The pedagogical identity mirrors Classic's Foundation loop at miniature
// scale: shortcuts pay now and bill later, the health bar is VISIBLE here
// (Classic hides it), and the same band vocabulary carries over.

export const HEALTH_START = 8;
export const HEALTH_MAX = 10;
export const CRUNCH_BASE_COST = 2;
export const RECOVER_HEAL = 2;
export const SHIP_RIGHT_HEAL = 1;
export const DEBT_END_PENALTY = 1;    // rep lost per debt token at scoring
export const CRACKING_REP_LOSS = 1;   // start-of-quarter grumble while Cracking
export const CRUMBLING_REP_LOSS = 3;  // start-of-quarter incident while Crumbling
export const MAX_QUITS = 2;           // after the 2nd quit nobody is left to crunch
export const TOTAL_QUARTERS = 4;

/** Same band names as Classic — vocabulary continuity into the bigger game. */
export const BANDS = [
  { min: 8, key: 'solid',     label: 'Solid' },
  { min: 5, key: 'strained',  label: 'Strained' },
  { min: 3, key: 'cracking',  label: 'Cracking' },
  { min: 0, key: 'crumbling', label: 'Crumbling' },
];
export function bandOf(health) {
  return BANDS.find(b => health >= b.min) || BANDS[BANDS.length - 1];
}

/** Year-end reckoning, scaled to Starter's numbers. */
export const RECKONING = { solid: 3, strained: 1, cracking: -1, crumbling: -3 };

/** Fixed offers per quarter (real Classic project names — continuity). */
export const OFFERS = {
  1: [
    { name: 'Backlog Cleaning', reward: 3 },
    { name: 'Report Automation', reward: 5 },
    { name: 'CI/CD Migration', reward: 8 },
  ],
  2: [
    { name: 'Internal Tools', reward: 3 },
    { name: 'Data Recollection', reward: 5 },
    { name: 'App Modernization', reward: 8 },
  ],
  3: [
    { name: 'Library Creation', reward: 3 },
    { name: 'Disaster Recovery Implementation', reward: 5 },
    { name: 'Platform Launch', reward: 8 },
  ],
  4: [
    { name: 'On-Prem Migration', reward: 3 },
    { name: 'Lift-and-Shift', reward: 5 },
    { name: 'Innovation', reward: 8 },
  ],
};

const TEAMMATES = ['Priya', 'Marcus'];

function makePlayer(name, isAI) {
  return {
    name, isAI,
    rep: 0,
    health: HEALTH_START,
    debt: 0,
    quits: 0,
    pending: null,        // { name, reward } — ship-right project landing next quarter
    crunchLockedQ: false, // crumbling consequence: no crunch this quarter
  };
}

export function newGame() {
  const g = {
    quarter: 1,
    over: false,
    winner: null,
    players: [makePlayer('You', false), makePlayer('The Sprinter', true)],
    story: [], // [{q, who, kind: 'move'|'consequence'|'shipped'|'milestone', text}]
  };
  beat(g, 0, 'milestone', 'Four quarters. Your rival crunches everything. Beat them anyway.');
  return g;
}

function beat(g, pIdx, kind, text) {
  g.story.push({ q: g.quarter, who: pIdx, kind, text });
}

/** Crunch health cost right now: base + a point per debt token and per quit. */
export function crunchCost(p) {
  return CRUNCH_BASE_COST + p.debt + p.quits;
}

export function crunchAvailable(p) {
  return p.quits < MAX_QUITS && !p.crunchLockedQ;
}

/** All legal moves for a player this quarter. */
export function legalMoves(g, pIdx) {
  const p = g.players[pIdx];
  const moves = [{ type: 'recover' }];
  OFFERS[g.quarter].forEach((offer, idx) => {
    moves.push({ type: 'take', idx, pace: 'right' });
    if (crunchAvailable(p)) moves.push({ type: 'take', idx, pace: 'crunch' });
  });
  return moves;
}

/** Start-of-quarter phase: consequences from where your health sits, then any
 *  ship-right project lands. Q1 has neither. Call once per quarter. */
export function startQuarter(g) {
  if (g.quarter === 1) return;
  for (let pIdx = 0; pIdx < g.players.length; pIdx++) {
    const p = g.players[pIdx];
    p.crunchLockedQ = false;
    const band = bandOf(p.health);
    if (band.key === 'cracking') {
      p.rep -= CRACKING_REP_LOSS;
      beat(g, pIdx, 'consequence', `Sick days pile up on ${p.name === 'You' ? 'your' : 'the Sprinter’s'} team (−${CRACKING_REP_LOSS} rep).`);
    } else if (band.key === 'crumbling') {
      p.rep -= CRUMBLING_REP_LOSS;
      if (p.quits < MAX_QUITS) {
        const who = TEAMMATES[p.quits];
        p.quits++;
        beat(g, pIdx, 'consequence', `${who} burned out and quit ${p.name === 'You' ? 'your' : 'the Sprinter’s'} team (−${CRUMBLING_REP_LOSS} rep).${p.quits >= MAX_QUITS ? ' Nobody is left to crunch.' : ''}`);
      } else {
        beat(g, pIdx, 'consequence', `Another incident in production (−${CRUMBLING_REP_LOSS} rep).`);
      }
      p.crunchLockedQ = true;
    }
    if (p.pending) {
      p.rep += p.pending.reward;
      beat(g, pIdx, 'shipped', `“${p.pending.name}” shipped clean (+${p.pending.reward} rep).`);
      p.pending = null;
    }
  }
}

/** Apply one player's move for the current quarter. */
export function applyMove(g, pIdx, move) {
  const p = g.players[pIdx];
  if (move.type === 'recover') {
    p.health = Math.min(HEALTH_MAX, p.health + RECOVER_HEAL);
    if (p.debt > 0) p.debt--;
    beat(g, pIdx, 'move', `${p.name === 'You' ? 'You' : p.name} pulled back to recover (+${RECOVER_HEAL} health${p.debt >= 0 ? ', paid down debt' : ''}).`);
    return;
  }
  const offer = OFFERS[g.quarter][move.idx];
  if (move.pace === 'crunch') {
    const cost = crunchCost(p);
    p.rep += offer.reward;
    p.health = Math.max(0, p.health - cost);
    p.debt++;
    beat(g, pIdx, 'move', `${p.name === 'You' ? 'You' : p.name} crunched “${offer.name}” (+${offer.reward} rep now, −${cost} health, +1 debt).`);
  } else {
    p.health = Math.min(HEALTH_MAX, p.health + SHIP_RIGHT_HEAL);
    p.pending = { ...offer };
    beat(g, pIdx, 'move', `${p.name === 'You' ? 'You' : p.name} started “${offer.name}” at a sustainable pace (lands next quarter).`);
  }
}

/** The Sprinter's fixed policy: biggest reward, crunched if at all possible. */
export function sprinterMove(g, pIdx = 1) {
  const p = g.players[pIdx];
  const biggest = OFFERS[g.quarter].length - 1;
  if (crunchAvailable(p)) return { type: 'take', idx: biggest, pace: 'crunch' };
  return { type: 'take', idx: biggest, pace: 'right' };
}

/** Advance after both players have moved. Ends the game after Q4. */
export function advance(g) {
  if (g.quarter < TOTAL_QUARTERS) {
    g.quarter++;
    startQuarter(g);
    return;
  }
  // Final scoring: land pending work, settle debt, year-end reckoning.
  g.quarter = TOTAL_QUARTERS; // story beats stamp Q4
  for (let pIdx = 0; pIdx < g.players.length; pIdx++) {
    const p = g.players[pIdx];
    if (p.pending) {
      p.rep += p.pending.reward;
      beat(g, pIdx, 'shipped', `“${p.pending.name}” landed in January: it still counts (+${p.pending.reward} rep).`);
      p.pending = null;
    }
    if (p.debt > 0) {
      p.rep -= p.debt * DEBT_END_PENALTY;
      beat(g, pIdx, 'consequence', `${p.debt} unpaid debt token${p.debt === 1 ? '' : 's'} (−${p.debt * DEBT_END_PENALTY} rep).`);
    }
    const band = bandOf(p.health);
    const delta = RECKONING[band.key] || 0;
    p.rep += delta;
    beat(g, pIdx, 'milestone', `Year-end review: ${band.label} team health (${delta >= 0 ? '+' : ''}${delta} rep).`);
  }
  const [you, rival] = g.players;
  g.over = true;
  if (you.rep !== rival.rep) g.winner = you.rep > rival.rep ? 0 : 1;
  else if (you.health !== rival.health) g.winner = you.health > rival.health ? 0 : 1;
  else g.winner = null; // dead tie
}

/** Convenience driver: play the human move, then the Sprinter's, then advance. */
export function playTurn(g, humanMove) {
  applyMove(g, 0, humanMove);
  applyMove(g, 1, sprinterMove(g));
  advance(g);
}
