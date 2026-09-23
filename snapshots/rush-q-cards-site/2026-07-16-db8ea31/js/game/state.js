// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── State management ─────────────────────────────────────────

const STORAGE_KEY = 'rush-q-game';

export const state = {
  // Core game
  currentQuarter: 1,
  currentPlayerIndex: 0,
  turnPhase: 'setup', // setup | event | play | draw | quarterEnd | gameOver

  // Players: [0] = human, rest are AI
  players: [],

  // Decks
  decks: {
    main: [],       // Skills deck (Soft, Hard, Power)
    events: [],     // Team events
    rushQ: [],      // Quarter Events
    layoffs: [],    // Layoff cards
    projectQueue: [],// Business projects
    forHire: [],    // Talent cards
    starter: [],    // Starter projects + people
    bonusProject: [],// Bonus Project cards
  },
  discard: [],

  // Markets (face-up cards)
  markets: { projectQueue: [], forHire: [] },

  // Config
  totalQuarters: 8,

  // Flags
  forHireUnlocked: false,
  layoffsActive: false,
  layoffTargetIndex: 0,

  // Quarter flags — reset each quarter
  quarterFlags: {
    frozenProjects: [],   // player indices whose projects don't progress
    noAssign: [],         // player indices who can't assign new people
    noBonusProject: false, // no bonus project draws this quarter
    noNewProject: false,  // Freeze Rush Q: no new project cards this quarter
  },

  // Turn sub-phase tracking (for phase indicator)
  turnSubPhase: 'play', // 'event' | 'play' | 'aiTurns' | 'resolution'

  // Budget mode (CapEx/OpEx)
  budgetMode: false,
  budget: { capEx: 0, opEx: 0, capExBase: 8, opExBase: 8 },

  // UI state
  selectedCards: [],
  gameLog: [],
  showModal: null,
  modalData: null,
  animating: false,

  // UI preferences
  _logHidden: false,
  _handCompact: false,
  _showHandSkill: true,
  _horizontalScroll: false, // T4A: Horizontal hand scrolling
  _boardCardView: false, // Board: show projects/people as rendered cards

  // Tier 1C: Progressive complexity mode
  complexityMode: 'standard', // 'simple' | 'standard' | 'expert'

  // Tier 3B: Public commitments (player declares goals for bonus)
  commitments: {}, // playerIndex -> { type, target, quarter }
  commitmentBonus: 3, // Rep gained on success
  commitmentPenalty: 1, // Rep lost on failure

  // Analytics tracking
  reputationHistory: {}, // quarter -> { playerIndex: reputation }

  // Balance mechanics - catch-up settings
  catchUpThreshold: 8,           // Rep behind the leader before catch-up triggers
  catchUpCardsPer: 4,            // 1 bonus card per this many rep behind (past threshold)
  catchUpCardsMax: 2,            // Max bonus cards drawn per quarter from catch-up
  catchUpVPBonusThreshold: 20,   // Rep behind the leader before a +1 rep desperation bump
  catchUpEnabled: true,          // Classic-side rubber-banding on/off

  // Leader targeting settings
  leaderTargetingEnabled: true,
  leaderTargetingBonusVP: 2,
  leaderTargetingBonusResources: 2,
  leaderPenaltyOnAttack: 1,

  // Analytics logs (not persisted)
  _catchUpLog: [],        // {playerIndex, quarter, vpBehind, bonusGiven}
  _leaderTargetLog: [],   // {attackerIndex, leaderIndex, quarter, vpStolen}
};

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Validate save shape — discard corrupted state
      if (!saved.players || !Array.isArray(saved.players) || !saved.players.length || !saved.turnPhase) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      Object.assign(s, saved);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota */ }
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEY);
}

export function addLog(s, msg) {
  s.gameLog.push({ q: s.currentQuarter, msg, t: Date.now() });
  if (s.gameLog.length > 30) s.gameLog.shift();
}
