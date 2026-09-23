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
    bonusProjectExempt: [], // player indices shielded from it (Punished Senior)
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
  chronicle: [], // uncapped narrative of decisions & consequences (Story of the Year)
  showModal: null,
  modalData: null,
  animating: false,

  // UI preferences
  _logHidden: false,
  _handCompact: false,
  _showHandSkill: true,
  _horizontalScroll: false, // T4A: Horizontal hand scrolling
  _boardCardView: true,   // Board + markets: show cards rather than text rows
  _repGraphOpen: false,   // Reputation graph expanded inline

  // Tier 1C: Progressive complexity mode
  complexityMode: 'standard', // 'simple' | 'standard' | 'expert'

  // Prediction beat: the human's pre-game forecast (from the setup form) and
  // mid-year re-forecast, confronted with actuals on the game-over screen.
  forecasts: {}, // { q1?: {projects, rep, band}, q5?: {band} }

  // Tier 3B: Public commitments (player declares goals for bonus)
  commitments: {}, // playerIndex -> { type, target, quarter }
  commitmentBonus: 3, // Rep gained on success
  commitmentPenalty: 1, // Rep lost on failure

  // Analytics tracking
  reputationHistory: {}, // quarter -> { playerIndex: reputation }

  // Hits landed on a player by rivals or by the company. Cross-player damage
  // otherwise leaves no trace, so the receiving player can never see who did
  // what to them. Ring buffer — see recordIncomingHit().
  incomingHits: [], // { q, target, source, cardName, kind, amount, detail }

  // Balance mechanics - catch-up settings
  catchUpThreshold: 8,           // Rep behind the leader before catch-up triggers
  catchUpCardsPer: 4,            // 1 bonus card per this many rep behind (past threshold)
  catchUpCardsMax: 2,            // Max bonus cards drawn per quarter from catch-up
  catchUpVPBonusThreshold: 20,   // Rep behind the leader before a +1 rep desperation bump
  catchUpEnabled: true,          // Classic-side rubber-banding on/off

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
      // First field this function has ever needed to migrate: a save written
      // before incomingHits existed would leave it undefined.
      if (!Array.isArray(s.incomingHits)) s.incomingHits = [];
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

/** Append a narrative beat to the run chronicle. Unlike the game log (trimmed to
 *  the last 30 lines), the chronicle keeps every beat so the end-of-game "Story of
 *  the Year" can reconstruct the full decision→consequence arc.
 *  @param {object} s game state
 *  @param {{kind:string, text:string, cause?:number}} entry narrative beat */
export function addChronicle(s, entry) {
  if (!s.chronicle) s.chronicle = [];
  s.chronicle.push({ q: s.currentQuarter, ...entry });
}

/** Record a hit landed on a player by a rival or by the game itself.
 *  `source` is a player index, or -1 when the company/deck did it.
 *  Capped because save() serialises the whole state into one localStorage key. */
export function recordIncomingHit(s, entry) {
  if (!Array.isArray(s.incomingHits)) s.incomingHits = [];
  s.incomingHits.push({ q: s.currentQuarter, ...entry });
  if (s.incomingHits.length > 24) s.incomingHits.shift();
}
