// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — shared mutable state

export const state = {
  phase: 'setup',       // setup | draft | agenda | play | gameOver
  quarter: 0,           // 1-3
  turnIndex: 0,         // whose turn (index into players)
  passCount: 0,         // consecutive passes
  startPlayerIndex: 0,  // rotates each quarter

  players: [],          // { name, isAI, hand, people, projects, committed, agenda, rep, completedProjects, trades }
  centerProjects: [],   // revealed projects in the center
  peoplePool: [],       // 4 visible people to hire

  decks: {
    projects: [],       // project draw pile (includes crisis cards)
    action: [],         // skill cards (no budget)
    budget: [],         // budget cards — separate side deck
    people: [],         // people draw pile
    directives: [],     // management directive deck
    crisis: [],         // Q2 guaranteed crisis
  },
  discard: [],

  directives: [],       // active directive cards (max 2)
  claimedDirectives: [],// { directive, playerId }
  crisisLog: [],        // crisis cards that fired

  draftPool: [],        // people available during draft
  draftPicks: [],       // tracks who picked what
  draftTurn: 0,         // current drafter index in snake order

  agendaOptions: [],    // 2 cards for human to pick from

  log: [],

  // UI preferences
  cardSize: 'sm',       // sm | md | lg for hand cards
  playerHasActed: false, // tracks if human has taken any action this game (prevents mulligan after acting)

  // Balance mechanics - catch-up settings
  catchUpThreshold: 3,           // VP difference to trigger catch-up
  catchUpBonusPerVP: 2,          // Resources per VP behind
  catchUpMaxBonus: 6,            // Max resources from catch-up
  catchUpVPBonusThreshold: 6,    // When to give +1 VP bonus

  // Analytics tracking
  _catchUpLog: [],        // {playerIndex, quarter, vpBehind, bonusGiven}
  _leaderTargetLog: [],   // {attackerIndex, leaderIndex, quarter, vpStolen}
};

export function addLog(msg, cls) {
  state.log.push({ msg, cls: cls || '' });
}

export function resetState() {
  state.phase = 'setup';
  state.quarter = 0;
  state.turnIndex = 0;
  state.passCount = 0;
  state.startPlayerIndex = 0;

  state.players = [];
  state.centerProjects = [];
  state.peoplePool = [];

  state.decks = { projects: [], action: [], budget: [], people: [], directives: [], crisis: [] };
  state.discard = [];

  state.directives = [];
  state.claimedDirectives = [];
  state.crisisLog = [];

  state.draftPool = [];
  state.draftPicks = [];
  state.draftTurn = 0;

  state.agendaOptions = [];

  state.log = [];

  state.cardSize = 'sm';
  state.playerHasActed = false;

  // Reset analytics
  state._catchUpLog = [];
  state._leaderTargetLog = [];
}
