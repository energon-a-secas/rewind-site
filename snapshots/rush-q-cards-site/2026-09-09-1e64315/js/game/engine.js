// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary - see LICENSE.CONTENT.
// -- Game engine ----------------------------------------------
// Turn loop, quarter processing, game flow.

import { state, save, addLog, addChronicle } from './state.js';
import { loadCards, buildDecks } from './data.js';
import { shuffle, delay, showToast } from './utils.js';
import { resolveEvent, resolveRushQ, resolveLayoff, drawTimingGated } from './rules.js';
import { runAiTurn } from './ai.js';
import { render, renderLog, showCardProjection, showRushQReveal, showEffectDialog, showProjectCompleteModal, showChoiceDialog } from './render.js';
import { isBudgetMode, initBudget, canAffordOpEx, spendOpEx, canAffordCapEx, spendCapEx, resetQuarterBudget, allocateQuarterBudget, processPayroll, canHireFTE, FTE_CEILING } from './budget.js';
import { NAMED_CARD_EFFECTS, EFFECT_TYPE_HANDLERS, SUBCATEGORY_HANDLERS, REACTION_CARDS, REACTION_COST } from './effects.js';
import {
  assignTraits, traitCanPlay, traitCostMod, traitOnPlay, traitRewardMod, traitFailMult,
  traitEarlyBonus, traitTechLeadExtra, traitShortDeadlinePenalty, traitRushQExtra,
  traitQuarterStartActions, traitEnforceHandLimit, traitOnCompletion, traitFreeHire,
  traitFirstProjectSlowdown, traitDoubleNegativeEnd, traitProgressReduction
} from './traits.js';
import { withErrorBoundary, safeStateUpdate } from '../shared/error-boundary.js';
import { maybeShowHint } from '../shared/hints.js';
import { getSetting } from '../shared/settings.js';

/** Base progress a FULLY staffed project earns per quarter. A project's `deadline`
 *  is the number of quarters of sustained full staffing it takes, so deadlines
 *  actually bind: a deadline-8 project cannot be finished in one quarter by piling
 *  on people. Effective headcount still gates whether a project counts as staffed
 *  (see membersNeeded cap), but it no longer sets the pace. Tuned via
 *  scripts/sim-classic-balance.mjs — at this value balanced portfolios beat the
 *  old "rush the biggest project" exploit. */
const FULL_STAFF_PROGRESS = 2;

/** Foundation — the hidden organizational-health axis beneath the visible
 *  reputation score. Shortsighted, expedient plays (shipping on tech debt,
 *  chronic understaffing, letting work rot) quietly erode it; sustainable
 *  delivery slowly rebuilds it. When it craters, delayed consequences —
 *  burnout attrition and debt incidents — surface quarters later, modelling
 *  repercussions that in a real org take months to unfold. Surfaced as a coarse
 *  band (not an exact number) so players feel the strain without perfectly
 *  optimising against it — the shortsightedness the game is built to expose. */
const FOUNDATION_MAX = 100;
const FOUNDATION_START = 80;
const FOUNDATION_BANDS = [
  { min: 75, key: 'solid',     label: 'Solid' },
  { min: 50, key: 'strained',  label: 'Strained' },
  { min: 25, key: 'cracking',  label: 'Cracking' },
  { min: 0,  key: 'crumbling', label: 'Crumbling' },
];
/* Retuned per the 2026-08 balance review: at the original values (start 100,
   half these erosion rates, +3 idle recovery) the loop NEVER fired — 60 soak
   games saw zero band slips (min foundation observed: 62). Sloppy play now
   erodes ~2× faster and recovers slower, so Cracking is reachable around Q4-Q5
   of sustained neglect while clean play still climbs back to Solid. */
const FOUNDATION_DELTAS = {
  cleanShip: 6,      // completed fully-staffed with no tech debt — sustainable win
  debtShip: 8,       // erosion: shipped carrying tech debt
  understaffed: 4,   // erosion: crunching a project below headcount
  unstaffed: 8,      // erosion: an active project left with nobody on it
  overdue: 6,        // erosion: an active project past its deadline
  idleRecovery: 2,   // slow rebuild in a quarter with no eroding signals
};
const FOUNDATION_EROSION_CAP = 20; // most a single quarter can drain from work signals
const FOUNDATION_INCIDENT_REP = 5; // reputation lost when deferred debt surfaces publicly
const FOUNDATION_CONSEQUENCE_COOLDOWN = 2; // quarters between consequence firings per player

/** Year-end reckoning: the final Foundation band settles up as reputation.
 *  Gives the hidden axis a guaranteed payoff and the game an ending beat. */
const FOUNDATION_RECKONING = { solid: 10, strained: 3, cracking: -5, crumbling: -12 };

/** Foreshadowing whispers — an honest telegraph fired exactly one quarter
 *  before the consequence machinery can hit, mirroring how real orgs signal
 *  strain before someone actually quits. Deterministic pick (no RNG). */
const FOUNDATION_WHISPERS = [
  'People have gone quiet in standup.',
  'Someone on the team just updated their LinkedIn.',
  'The on-call channel is getting noisy after midnight.',
  'PR reviews are getting rubber-stamped: nobody has the energy to argue.',
];

/** Forecast buckets for the prediction beat: label + inclusive range. */
export const FORECAST_BUCKETS = {
  projects: [['0–1', 0, 1], ['2–3', 2, 3], ['4–5', 4, 5], ['6+', 6, Infinity]],
  rep: [['below 10', -Infinity, 9], ['10–19', 10, 19], ['20–34', 20, 34], ['35+', 35, Infinity]],
};
/** Map an actual value to its forecast-bucket label. */
export function forecastBucket(kind, value) {
  const hit = FORECAST_BUCKETS[kind].find(([, lo, hi]) => value >= lo && value <= hi);
  return hit ? hit[0] : '';
}

/** Partner project names for the synergy hint UI ("Pairs with: …"). */
export function getSynergyPartners(name) {
  const out = [];
  for (const s of PROJECT_SYNERGIES) {
    const [a, b] = s.combo;
    if (a === name) out.push({ partner: b, bonus: s.bonus });
    else if (b === name) out.push({ partner: a, bonus: s.bonus });
  }
  return out;
}

/** Coarse health band for a Foundation value (highest band whose floor it meets). */
export function foundationBand(value) {
  const v = typeof value === 'number' ? value : FOUNDATION_START;
  return FOUNDATION_BANDS.find(b => v >= b.min) || FOUNDATION_BANDS[FOUNDATION_BANDS.length - 1];
}

/** Tier 3A: Project synergy definitions — bonus rep for completing thematically
 *  related projects in back-to-back quarters. Names MUST match live project cards
 *  in data/cards.json (verify with scripts if editing). Teaching point: coherent,
 *  sequenced investment compounds; scattered one-offs don't. */
const PROJECT_SYNERGIES = [
  {
    combo: ['App Modernization', 'Architecture Modernization'],
    bonus: 3,
    message: 'A modern app on a modern architecture compounds'
  },
  {
    combo: ['Lift-and-Shift', 'On-Prem Migration'],
    bonus: 2,
    message: 'A coherent migration program pays off'
  },
  {
    combo: ['CI/CD Migration', 'CI/CD Improvements'],
    bonus: 2,
    message: 'A mature delivery pipeline accelerates everything'
  },
  {
    combo: ['CI/CD Improvements', 'Pipeline Migration'],
    bonus: 2,
    message: 'Pipeline work builds on itself'
  },
  {
    combo: ['Disaster Recovery Implementation', 'Security Vulnerability'],
    bonus: 2,
    message: 'Resilience plus security hardening reinforce each other'
  },
  {
    combo: ['Performance Optimization', 'Tech Upgrades'],
    bonus: 2,
    message: 'Upgraded hardware makes optimization land'
  },
  {
    combo: ['Documentation Update', 'Library Creation'],
    bonus: 1,
    message: 'Documented, reusable libraries multiply value'
  },
  {
    combo: ['Data Recollection', 'Report Automation'],
    bonus: 2,
    message: 'Clean data feeds automated reporting'
  },
  {
    combo: ['Backlog Cleaning', 'Internal Tools'],
    bonus: 1,
    message: 'A clean backlog plus better tooling raises throughput'
  }
];

/** Initialize a new game. */
export const startGame = withErrorBoundary(async function startGame_inner(playerName, aiCount, totalQuarters = 8) {
  const defs = await loadCards();
  const decks = buildDecks(defs);

  // Reset state
  state.currentQuarter = 1;
  state.currentPlayerIndex = 0;
  state.turnPhase = 'play';
  state.discard = [];
  state.gameLog = [];
  state.chronicle = [];
  state.forecasts = {};
  state.selectedCards = [];
  state.showModal = null;
  state.modalData = null;
  state.forHireUnlocked = true;
  state.layoffsActive = false;
  state.layoffTargetIndex = 0;
  state.animating = false;
  state.quarterFlags = { frozenProjects: [], noAssign: [], noBonusProject: false, bonusProjectExempt: [], noNewProject: false };
  state.reputationHistory = {};
  state.incomingHits = [];
  state.totalQuarters = totalQuarters;
  state.difficulty = getSetting('difficulty') || 'normal';

  // Build players
  const aiNames = ['Director Nova', 'VP Cipher', 'CTO Axiom', 'SVP Nexus'];
  const SPRINTER_INDEX = 0; // first AI seat plays the teaching-contrast profile
  const RIVAL_INDEX = 1;    // second AI seat plays the antagonist (2+ AI games)
  const players = [
    makePlayer(playerName || 'Player', false),
  ];
  for (let i = 0; i < aiCount; i++) {
    const ai = makePlayer(aiNames[i], true);
    if (i === SPRINTER_INDEX) ai.aiProfile = 'sprinter';
    else if (i === RIVAL_INDEX) ai.aiProfile = 'rival';
    players.push(ai);
  }
  state.players = players;

  // Set up decks
  state.decks.main = decks.main;
  state.decks.events = decks.events;
  state.decks.rushQ = decks.rushQ;
  state.decks.layoffs = decks.layoffs;
  // Layoffs escalate deliberately: sort descending so pop() serves the cheapest
  // severance first (Q5) and the harshest last (Q8).
  state.decks.layoffs.sort((a, b) => (b.negationCost || 0) - (a.negationCost || 0));
  state.decks.projectQueue = decks.projectQueue;
  state.decks.forHire = decks.forHire;
  state.decks.bonusProject = decks.bonusProject;
  state.decks.traits = decks.traits;

  // Deal starter cards
  for (const p of players) {
    if (decks.starterProjects.length) {
      const proj = decks.starterProjects.pop();
      proj.timeSpent = 0;
      proj.isCompleted = false;
      p.projects.push(proj);
    }
    for (let i = 0; i < 3; i++) {
      if (state.decks.forHire.length) {
        p.people.push(state.decks.forHire.pop());
      }
    }
    if (decks.starterFavors.length) {
      p.hand.push(decks.starterFavors.pop());
    }
  }

  // Deal 6 cards from main deck
  for (const p of players) {
    for (let i = 0; i < 6; i++) {
      if (state.decks.main.length) p.hand.push(state.decks.main.pop());
    }
  }

  // Set up markets
  refillMarket('projectQueue');
  refillMarket('forHire');

  state.turnSubPhase = 'play';

  // Assign management style traits (Standard/Expert only; Simple stays core)
  if (state.complexityMode !== 'simple') {
    assignTraits(state);
  }

  // Budget mode initialization
  if (isBudgetMode(state)) {
    initBudget(state);
  }

  state.apMax = AP_PER_TURN;
  state.apLeft = AP_PER_TURN;
  addLog(state, `Game started! ${players.length} players, ${totalQuarters} quarters.`);
  addLog(state, `Q1 - ${players[0].name}'s turn.`);
  addChronicle(state, { kind: 'milestone', text: `You took over as Tech Manager at Energon: ${totalQuarters} quarters to prove yourself.` });

  save(state);
  render(state);
});

function makePlayer(name, isAI) {
  return {
    name,
    isAI,
    reputation: 0,
    hand: [],
    people: [],
    projects: [],
    assignments: {},
    pendingEffects: [], // {type, data, activateQuarter, sourceCardName}
    foundation: FOUNDATION_START, // hidden org-health axis (see FOUNDATION_* above)
    foundationStrain: 0,          // consecutive quarters spent below the Strained band
  };
}

/** Draw a card from main deck into player's hand. */
export function drawCard(player) {
  if (!state.decks.main.length) {
    // Only Skill-deck cards reshuffle into the draw pile — the shared discard
    // also collects spent Event/Rush Q/Layoff and failed project cards, which
    // must never end up in players' hands as no-op draws.
    const skills = state.discard.filter(c => c.deck === 'Skill');
    if (skills.length) {
      state.decks.main = shuffle(skills);
      state.discard = state.discard.filter(c => c.deck !== 'Skill');
      addLog(state, 'Skill discards reshuffled into the draw deck.');
    }
  }
  if (state.decks.main.length) {
    const card = state.decks.main.pop();
    player.hand.push(card);
    return card;
  }
  return null;
}

/** Refill a market to 3 face-up cards. */
export function refillMarket(marketType) {
  const market = state.markets[marketType];
  const deck = state.decks[marketType];
  while (market.length < 3 && deck.length) {
    market.push(deck.pop());
  }
}

/** Human ends their turn. */
export async function endHumanTurn() {
  if (state.animating) return;

  state.turnSubPhase = 'aiTurns';
  const player = state.players[state.currentPlayerIndex];

  const drawCount = (state.currentQuarter === 1 && state.currentPlayerIndex === 0) ? 2 : 1;
  for (let i = 0; i < drawCount; i++) {
    const c = drawCard(player);
    if (c) addLog(state, `${player.name} drew a card.`);
  }

  save(state);
  render(state);

  await advanceToNextPlayer();
}

/** Move to the next player; run AI turns automatically. */
async function advanceToNextPlayer() {
  state.animating = true;
  try {
    state.currentPlayerIndex++;

    while (state.currentPlayerIndex < state.players.length) {
      const p = state.players[state.currentPlayerIndex];
      if (p.isAI) {
        await runAiTurn(p, state);
        render(state);
        state.currentPlayerIndex++;
      } else {
        break;
      }
    }

    if (state.currentPlayerIndex >= state.players.length) {
      await processQuarterEnd();
    }
  } finally {
    state.animating = false;
  }
  save(state);
  render(state);
}

/** Remove a team member from the roster and every project assignment, preserving
 *  the "no assignment references an unowned person" invariant. */
function removeTeamMember(player, personId) {
  player.people = player.people.filter(pe => pe.id !== personId);
  for (const projId of Object.keys(player.assignments || {})) {
    player.assignments[projId] = (player.assignments[projId] || []).filter(id => id !== personId);
  }
}

/** End-of-quarter Foundation accounting and its delayed consequences. Runs after
 *  all project/event/layoff resolution but before the quarter advances, so it sees
 *  the full quarter and attributes consequences to the quarter that just ended.
 *
 *  Erosion/recovery is deterministic (threshold-driven, no RNG) so a shortsighted
 *  line of play always reaps the same repercussion — the point is a legible cause
 *  and effect, not a dice roll. Consequences only bite from Q3 on, giving early
 *  expedience room to compound before it surfaces. Chronicle beats are recorded
 *  for the human player (index 0) to build their Story of the Year. */
export function applyFoundationAndConsequences(state) {
  const q = state.currentQuarter;
  for (let pi = 0; pi < state.players.length; pi++) {
    const p = state.players[pi];
    const isHuman = pi === 0;
    if (typeof p.foundation !== 'number') p.foundation = FOUNDATION_START;
    const bandBefore = foundationBand(p.foundation);

    let regen = 0, erode = 0;
    const decisions = []; // chronicled (max 2/quarter)
    const causes = [];    // full erosion-cause list, for counterfactual tags
    for (const proj of p.projects) {
      if (proj.isCompleted) {
        if (proj.completionQuarter !== q) continue;
        if ((proj.techDebt || 0) > 0) {
          erode += FOUNDATION_DELTAS.debtShip;
          p._debtShips = (p._debtShips || 0) + 1;
          decisions.push(`shipped “${proj.name}” carrying tech debt to hit the deadline`);
        } else {
          regen += FOUNDATION_DELTAS.cleanShip;
          p._cleanShips = (p._cleanShips || 0) + 1;
        }
        continue;
      }
      const needed = Math.min(proj.members || 0, 4);
      const staffed = getAssignedPeople(p, proj.id).length;
      if (needed > 0 && staffed === 0) {
        erode += FOUNDATION_DELTAS.unstaffed;
        decisions.push(`left “${proj.name}” unstaffed`);
      } else if (needed > 0 && staffed < needed) {
        erode += FOUNDATION_DELTAS.understaffed;
        causes.push(`ran “${proj.name}” understaffed`);
      }
      if ((proj.deadline || 0) > 0 && (proj.timeSpent || 0) > proj.deadline) {
        erode += FOUNDATION_DELTAS.overdue;
        causes.push(`let “${proj.name}” slide past its deadline`);
      }
    }
    causes.unshift(...decisions);

    erode = Math.min(erode, FOUNDATION_EROSION_CAP);
    if (erode === 0 && regen === 0 && p.foundation < FOUNDATION_MAX) {
      regen += FOUNDATION_DELTAS.idleRecovery;
    }

    p.foundation = Math.max(0, Math.min(FOUNDATION_MAX, p.foundation + regen - erode));
    if (erode > 0) {
      p._lastErodeQuarter = q;
      if (causes.length) {
        if (!p._erosionLog) p._erosionLog = {};
        p._erosionLog[q] = causes[0];
      }
    }
    const bandAfter = foundationBand(p.foundation);

    const belowStrained = bandAfter.key === 'cracking' || bandAfter.key === 'crumbling';
    p.foundationStrain = belowStrained ? (p.foundationStrain || 0) + 1 : 0;
    if (belowStrained) p._quartersBelowStrained = (p._quartersBelowStrained || 0) + 1;

    if (isHuman && bandBefore.key !== bandAfter.key) {
      const worse = p.foundation < bandBefore.min;
      addChronicle(state, {
        kind: 'shift',
        text: `Team health ${worse ? 'slipped' : 'recovered'}: ${bandBefore.label} → ${bandAfter.label}.`,
      });
      if (worse) addLog(state, `${p.name}'s team health slipped to ${bandAfter.label}.`);
    }
    if (isHuman) {
      for (const d of decisions.slice(0, 2)) {
        addChronicle(state, { kind: 'decision', text: `You ${d}.` });
      }
    }

    // Foreshadowing whisper — fires exactly one quarter before the consequence
    // machinery can hit: either the first quarter of Cracking (a second one
    // triggers attrition) or Crumbling while the cooldown has one quarter
    // left. Deterministic, so the telegraph never lies.
    const onCooldown = p._lastConsequenceQuarter && q - p._lastConsequenceQuarter < FOUNDATION_CONSEQUENCE_COOLDOWN;
    if (isHuman && (
      (bandAfter.key === 'cracking' && p.foundationStrain === 1) ||
      (bandAfter.key === 'crumbling' && p._lastConsequenceQuarter && q - p._lastConsequenceQuarter === FOUNDATION_CONSEQUENCE_COOLDOWN - 1)
    )) {
      const whisper = FOUNDATION_WHISPERS[q % FOUNDATION_WHISPERS.length];
      addLog(state, `〜 ${whisper}`);
      addChronicle(state, { kind: 'whisper', text: whisper });
    }

    if (q < 3) continue;
    // Cooldown keeps consequences from piling on a collapsing player every
    // single quarter (they already face the tax, layoffs, and Board Review).
    if (onCooldown) continue;
    const crumbling = bandAfter.key === 'crumbling';
    const sustainedCrack = bandAfter.key === 'cracking' && p.foundationStrain >= 2;
    if (crumbling || sustainedCrack) p._lastConsequenceQuarter = q;

    const avoid = p._erosionLog?.[p._lastErodeQuarter];

    if ((crumbling || sustainedCrack) && p.people.length > 1) {
      const unassigned = getUnassignedPeople(p);
      const victim = unassigned.length ? unassigned[unassigned.length - 1] : p.people[p.people.length - 1];
      removeTeamMember(p, victim.id);
      p._consequencesFired = (p._consequencesFired || 0) + 1;
      addLog(state, `Burnout: ${victim.name} quit ${p.name}'s team.`);
      if (isHuman) {
        addChronicle(state, {
          kind: 'consequence',
          text: `${victim.name} burned out and quit: the crunch finally caught up.`,
          cause: p._lastErodeQuarter,
          avoid,
        });
      }
    }

    if (crumbling) {
      p.reputation -= FOUNDATION_INCIDENT_REP;
      p._consequencesFired = (p._consequencesFired || 0) + 1;
      addLog(state, `Debt incident: deferred problems surfaced → ${p.name} −${FOUNDATION_INCIDENT_REP} rep.`);
      if (isHuman) {
        addChronicle(state, {
          kind: 'consequence',
          text: `Deferred problems blew up in production: −${FOUNDATION_INCIDENT_REP} reputation.`,
          cause: p._lastErodeQuarter,
          avoid,
        });
      }
    }
  }
}

/** Rush Q cards upgraded from flat hits to reputation-vs-Foundation dilemmas —
 *  the game's thesis stated as a choice. Handled per player INSTEAD of the
 *  generic resolveRushQ; the Sprinter always takes the shortsighted option. */
const RUSHQ_DILEMMAS = new Set(['Invisible Work Tax', 'Budget Cuts']);

async function resolveRushQDilemma(card, state, exempt = []) {
  for (let pi = 0; pi < state.players.length; pi++) {
    const p = state.players[pi];
    if (exempt.includes(p)) continue;
    const isHuman = pi === 0;

    if (card.name === 'Invisible Work Tax') {
      const active = p.projects.filter(pr => !pr.isCompleted);
      if (!active.length) { addLog(state, `${p.name} has no active projects: the toil passes by.`); continue; }
      let push = false;
      if (p.isAI) {
        push = p.aiProfile === 'sprinter';
      } else {
        const idx = await showChoiceDialog(
          {
            name: card.name, type: 'Quarter Event',
            skill: 'Toil, on-call, and support tickets slow everything. Absorb it into the plan, or make the team push through it.',
          },
          [
            { label: 'Absorb the toil', detail: `All ${active.length} active project deadline${active.length === 1 ? '' : 's'} +1 quarter`, action: 'absorb' },
            { label: 'Push the team through it', detail: 'Deadlines hold · team health −6', action: 'push' },
          ]
        );
        push = idx === 1;
      }
      if (push) {
        p.foundation = Math.max(0, (p.foundation ?? FOUNDATION_START) - 6);
        addLog(state, `${p.name} pushes through the invisible work, deadlines hold, team health −6.`);
        if (isHuman) addChronicle(state, { kind: 'decision', text: 'You pushed the team through the invisible work, deadlines held, the team paid.' });
      } else {
        for (const pr of active) pr.deadline = (pr.deadline || 0) + 1;
        addLog(state, `${p.name} absorbs the toil: active deadlines +1 quarter.`);
      }
      continue;
    }

    if (card.name === 'Budget Cuts') {
      const favors = p.hand.filter(c => c.type === 'Favor');
      let victimId = null;
      for (const ids of Object.values(p.assignments || {})) {
        if (ids.length) victimId = ids[ids.length - 1];
      }
      if (!victimId) { addLog(state, `${p.name} has nobody assigned: Budget Cuts finds nothing to cut.`); continue; }
      let pay = false;
      if (p.isAI) {
        pay = p.aiProfile !== 'sprinter' && favors.length >= 2;
      } else if (favors.length >= 2) {
        const idx = await showChoiceDialog(
          {
            name: card.name, type: 'Quarter Event',
            skill: 'Finance wants a body back. Return an assigned person to the For Hire pool, or burn 2 Favors to protect the team.',
          },
          [
            { label: 'Pay 2 Favors', detail: 'Everyone stays', action: 'pay' },
            { label: 'Return an assigned person', detail: 'They go back to the For Hire pool', action: 'cut' },
          ]
        );
        pay = idx === 0;
      }
      if (pay) {
        for (let k = 0; k < 2; k++) {
          const fav = p.hand.find(c => c.type === 'Favor');
          if (fav) { p.hand.splice(p.hand.indexOf(fav), 1); state.discard.push(fav); }
        }
        addLog(state, `${p.name} pays 2 Favors: the team stays intact.`);
      } else {
        const victim = p.people.find(x => x.id === victimId);
        removeTeamMember(p, victimId);
        if (victim) state.decks.forHire.push(victim);
        addLog(state, `Budget Cuts: ${p.name} returns ${victim ? victim.name : 'a team member'} to the For Hire pool.`);
        if (isHuman) addChronicle(state, { kind: 'consequence', text: `Budget Cuts took ${victim ? victim.name : 'a teammate'} back to the market.` });
      }
    }
  }
}

/** Process end-of-quarter effects. */
/**
 * Non-destructive preview of the Rush Q card the current quarter's end will
 * draw — mirrors drawTimingGated's skip logic (top 5 gated cards are skipped,
 * the 6th comes out regardless).
 */
/** Action points per human turn: play a card, trade, or move an assigned
 * person each cost 1. Drawing and first-time assignment stay free.
 * Enforced at the UI layer (events.js) — headless runs are unaffected. */
export const AP_PER_TURN = 3;

/** Toast a beat to the human player only (no-op in headless runs). */
function toastHuman(state, playerOrIndex, msg) {
  const isHuman = typeof playerOrIndex === 'number'
    ? playerOrIndex === 0
    : state.players[0] === playerOrIndex;
  if (!isHuman) return;
  if (typeof document === 'undefined' || !document.getElementById('game-log')) return;
  try { showToast(msg); } catch { /* non-fatal */ }
}

export function peekNextRushQ(s) {
  const deck = s.decks && s.decks.rushQ;
  if (!deck || !deck.length || s.currentQuarter < 2 || s.gameOver) return null;
  for (let n = 0; n < deck.length; n++) {
    const card = deck[deck.length - 1 - n];
    if (n < 5 && card.minQuarter && card.minQuarter > s.currentQuarter) continue;
    return { name: card.name, skill: card.skill || '' };
  }
  return null;
}

async function processQuarterEnd() {
  // Recap snapshot: what the quarter looked like before resolution, so the
  // human gets one summary card instead of excavating the log.
  const _recap = {
    quarter: state.currentQuarter,
    reps: state.players.map(p => p.reputation),
    band: state.players[0] ? foundationBand(state.players[0].foundation).label : '',
  };
  let _recapRush = null;
  try {
  state.turnSubPhase = 'resolution';
  render(state);
  addLog(state, `-- Quarter ${state.currentQuarter} End --`);

  // 1. Project progress (respects frozenProjects, staffing requirements)
  for (let pi = 0; pi < state.players.length; pi++) {
    const p = state.players[pi];
    const frozen = (state.quarterFlags.frozenProjects || []).includes(pi);
    for (const proj of p.projects) {
      if (proj.isCompleted) continue;
      if (frozen) continue; // Production Outage - no progress this quarter
      const assigned = getAssignedPeople(p, proj.id);
      // Context Switch: people who switched projects this quarter are ramping up
      const effectiveAssigned = assigned.filter(a => !a._lastProjectId || a._lastProjectId === proj.id);
      const rampingCount = assigned.length - effectiveAssigned.length;
      const membersNeeded = Math.min(proj.members || 0, 4); // cap effective members at 4

      if (effectiveAssigned.length === 0) {
        if (membersNeeded > 0) {
          const rampNote = rampingCount > 0 ? ` (${rampingCount} ramping up)` : '';
          addLog(state, `${p.name}'s "${proj.name}" unstaffed${rampNote} - no progress.`);
        }
      } else if (effectiveAssigned.length < membersNeeded) {
        proj.timeSpent = (proj.timeSpent || 0) + 1;
        const rampNote = rampingCount > 0 ? ` (${rampingCount} ramping up)` : '';
        addLog(state, `${p.name}'s "${proj.name}" understaffed (${effectiveAssigned.length}/${membersNeeded})${rampNote} - reduced progress.`);
      } else {
        // Fully staffed - steady expected pace. Deadline = quarters of full
        // staffing, so headcount gates "staffed or not" but does not let a big
        // project be brute-forced in one quarter. Apply tech debt penalty first.
        const techDebt = proj.techDebt || 0;
        const progressAfterDebt = Math.max(0, FULL_STAFF_PROGRESS - techDebt);

        const techLeadCount = effectiveAssigned.filter(a => a.name === 'Tech Lead').length;
        const tlBonus = techLeadCount * (1 + traitTechLeadExtra(p));
        const shortPenalty = traitShortDeadlinePenalty(p, proj);
        const totalProgress = Math.max(1, progressAfterDebt + tlBonus - shortPenalty);

        proj.timeSpent = (proj.timeSpent || 0) + totalProgress;

        if (techDebt > 0) {
          addLog(state, `Tech Debt: "${proj.name}" reduced by ${techDebt} progress (${techDebt} token(s)).`);
        }
        if (techLeadCount > 0) {
          addLog(state, `Tech Lead bonus on "${proj.name}": +${tlBonus} extra progress.`);
        }
        if (shortPenalty > 0) {
          addLog(state, `${p.trait.name} penalty: "${proj.name}" short deadline, -${shortPenalty} progress.`);
        }
      }
    }
    if (frozen) {
      addLog(state, `${p.name}'s projects frozen - no progress this quarter.`);
    }

    // Context Switch: update last-assigned project tracking
    for (const proj of p.projects) {
      if (proj.isCompleted) continue;
      for (const a of getAssignedPeople(p, proj.id)) {
        a._lastProjectId = proj.id;
      }
    }

    // WIP Tax: more than 2 active projects slows ALL progress
    if (!frozen) {
      const activeCount = p.projects.filter(pr => !pr.isCompleted).length;
      if (activeCount > 2) {
        const wipPenalty = activeCount - 2;
        for (const proj of p.projects) {
          if (proj.isCompleted) continue;
          const before = proj.timeSpent || 0;
          proj.timeSpent = Math.max(0, before - wipPenalty);
          if (before > proj.timeSpent) {
            addLog(state, `WIP Tax: ${p.name}'s "${proj.name}" -${before - proj.timeSpent} progress (${activeCount} active projects).`);
          }
        }
      }
    }
  }

  // 1b. Ship-early dilemma — the debt system's main live source. A fully
  // staffed project one quarter from a clean finish may ship NOW carrying
  // tech debt: the reward lands today, the Foundation erosion and slower
  // codebase land later. One offer per player per quarter, highest reward
  // first; AI ships early only when trailing the leader (deadline pressure).
  for (let pi = 0; pi < state.players.length; pi++) {
    const p = state.players[pi];
    if ((state.quarterFlags.frozenProjects || []).includes(pi)) continue;
    const eligible = p.projects.filter(proj => {
      if (proj.isCompleted) return false;
      const needed = Math.min(proj.members || 0, 4);
      if (needed <= 0 || (proj.deadline || 0) < 2) return false;
      return getAssignedPeople(p, proj.id).length >= needed &&
        (proj.timeSpent || 0) === proj.deadline - 1;
    }).sort((a, b) => (b.reward || 0) - (a.reward || 0));
    if (!eligible.length) continue;
    const proj = eligible[0];

    let shipEarly = false;
    if (p.isAI) {
      const leaderRep = Math.max(...state.players.filter(x => x !== p).map(x => x.reputation));
      // The Sprinter always takes the shortcut; other AIs only under pressure.
      shipEarly = p.aiProfile === 'sprinter' || p.reputation < leaderRep - 5;
    } else {
      const choiceIdx = await showChoiceDialog(
        {
          name: 'Ship it early?',
          type: 'Quarter Event',
          skill: `"${proj.name}" is one quarter from a clean finish. Ship now and bank the reward. The corners you cut become tech debt the team pays for later.`,
        },
        [
          { label: `Ship "${proj.name}" now`, detail: `+${proj.reward || 0} rep this quarter · gains 1 tech debt (erodes team health)`, action: 'shipEarly' },
          { label: 'Hold for a clean finish', detail: 'Completes next quarter at full quality', action: 'hold' },
        ]
      );
      shipEarly = choiceIdx === 0;
    }

    if (shipEarly) {
      proj.timeSpent = proj.deadline;
      proj.techDebt = (proj.techDebt || 0) + 1;
      addLog(state, `${p.name} ships "${proj.name}" a quarter early, +1 tech debt.`);
    }
  }

  // Reset quarter flags for next quarter
  state.quarterFlags = { frozenProjects: [], noAssign: [], noBonusProject: false, bonusProjectExempt: [], noNewProject: false };

  // 2. Check project completion
  for (const p of state.players) {
    for (const proj of p.projects) {
      if (proj.isCompleted) continue;
      const assigned = getAssignedPeople(p, proj.id);
      const membersNeeded = Math.min(proj.members || 0, 4); // cap effective members at 4
      const timeNeeded = proj.deadline || 0;

      if (assigned.length >= membersNeeded && (proj.timeSpent || 0) >= timeNeeded && membersNeeded > 0) {
        proj.isCompleted = true;
        proj.completionQuarter = state.currentQuarter;
        const baseReward = proj.reward || 0;
        const reward = Math.max(0, baseReward + traitRewardMod(p));
        p.reputation += reward;
        if (traitRewardMod(p) !== 0) {
          addLog(state, `${p.name} completed "${proj.name}" → +${reward} rep (${traitRewardMod(p) > 0 ? '+' : ''}${traitRewardMod(p)} from ${p.trait?.name || 'trait'}).`);
        } else {
          addLog(state, `${p.name} completed "${proj.name}" → +${reward} rep!`);
        }

        // Trait: early completion bonus (Time Wizard)
        const earlyBonus = traitEarlyBonus(p);
        if (earlyBonus > 0 && (proj.timeSpent || 0) <= (proj.deadline || 0)) {
          p.reputation += earlyBonus;
          addLog(state, `${p.trait.name} early bonus: +${earlyBonus} rep for finishing on time.`);
        }

        // Tier 3A: Check for project synergy bonuses
        const synergyBonus = checkProjectSynergy(p, proj);
        if (synergyBonus > 0) {
          p.reputation += synergyBonus;
          addLog(state, `Synergy bonus: ${p.name} earned +${synergyBonus} rep for completing related projects!`);
        }

        // Technical Debt check: rushed projects (<50% of deadline) add debt
        const timeRatio = timeNeeded > 0 ? (proj.timeSpent || 0) / timeNeeded : 1;
        if (timeRatio < 0.5) {
          proj.techDebt = (proj.techDebt || 0) + 1;
          addLog(state, `Rushed project: "${proj.name}" added 1 Tech Debt token (${proj.techDebt} total).`);
        }

        // Trait: on-completion effects (Mentor person value boost)
        const compEffect = traitOnCompletion(p);
        if (compEffect?.personValueBonus && assigned.length > 0) {
          const person = assigned[0];
          person.value = (person.value || 0) + compEffect.personValueBonus;
          addLog(state, `${p.trait.name}: ${person.name} gained +${compEffect.personValueBonus} trade value.`);
        }

        // Trait: Mentor free hire (once per game)
        if (traitFreeHire(p) && state.decks.forHire.length) {
          const hired = state.decks.forHire.pop();
          p.people.push(hired);
          addLog(state, `${p.trait.name} free hire: ${p.name} recruited ${hired.name}.`);
        }

        // ROI feedback: increase budget bonus on completion
        if (isBudgetMode(state)) {
          p.budgetBonus = (p.budgetBonus || 0) + 1;
          addLog(state, `${p.name} budget bonus increased to +${p.budgetBonus} (project ROI).`);
        }

        // Completion reward: free hire — only for substantial (3+ member)
        // projects, so cheap-project churn stops snowballing headcount.
        if ((proj.members || 0) >= 3 && state.decks.forHire.length && (!isBudgetMode(state) || canHireFTE(state, p))) {
          const hired = state.decks.forHire.pop();
          p.people.push(hired);
          addLog(state, `Completion bonus: ${p.name} hired ${hired.name}.`);
        }

        // Internal projects: no reputation, but the team breathes again.
        if (proj.foundationRestore) {
          p.foundation = Math.min(FOUNDATION_MAX, (p.foundation ?? FOUNDATION_START) + proj.foundationRestore);
          addLog(state, `${p.name} completed internal work "${proj.name}" → team health +${proj.foundationRestore}.`);
          if (state.players.indexOf(p) === 0) {
            addChronicle(state, { kind: 'decision', text: `You invested in internal work: “${proj.name}” restored the team (+${proj.foundationRestore} health).` });
          }
        }

        // Contractor bonus: draw 1 card for each Contractor assigned
        const contractorCount = assigned.filter(a => a.name === 'Contractor').length;
        for (let ci = 0; ci < contractorCount; ci++) {
          const drawn = drawCard(p);
          if (drawn) addLog(state, `Contractor bonus: ${p.name} drew "${drawn.name}".`);
        }

        // Human player: show completion modal, let them pick 1 person to keep
        if (!p.isAI && assigned.length > 0) {
          render(state);
          const keepId = await showProjectCompleteModal(proj, assigned, reward);
          // Release everyone except the chosen person
          const projAssignments = p.assignments[proj.id] || [];
          for (const pid of projAssignments) {
            if (pid !== keepId) {
              // Person stays in p.people but is no longer assigned
            }
          }
          // Clear all assignments for this project (completed)
          p.assignments[proj.id] = keepId ? [keepId] : [];
          addLog(state, `Team released from "${proj.name}".`);
        } else if (p.isAI) {
          // AI: keep one (first), release rest
          const ids = p.assignments[proj.id] || [];
          p.assignments[proj.id] = ids.length ? [ids[0]] : [];
        }

        // Phase E: bonusOnComplete - if Specialist assigned, draw bonus project
        const bonusIdx = (p.pendingEffects || []).findIndex(e =>
          e.type === 'bonusOnComplete' && assigned.some(a => a.id === e.data.specialistId)
        );
        if (bonusIdx >= 0) {
          p.pendingEffects.splice(bonusIdx, 1);
          const scopeCreeped = state.quarterFlags.noBonusProject
            && !(state.quarterFlags.bonusProjectExempt || []).includes(state.players.indexOf(p));
          if (state.decks.bonusProject.length && !scopeCreeped) {
            const bonus = state.decks.bonusProject.pop();
            p.hand.push(bonus);
            addLog(state, `Specialist bonus → ${p.name} drew bonus project "${bonus.name}"!`);
          }
        }
      }
    }
  }

  // 3. Failed projects - discard overdue projects
  for (const p of state.players) {
    for (let i = p.projects.length - 1; i >= 0; i--) {
      const proj = p.projects[i];
      if (proj.isCompleted) continue;
      const deadline = proj.deadline || 0;
      const penalty = proj.penalty || 0;
      const wasWorkedOn = (proj.timeSpent || 0) > 0;
      if (deadline > 0 && (proj.timeSpent || 0) > deadline + 1) {
        // Project overdue for 2+ quarters - discard it
        if (wasWorkedOn && penalty > 0) {
          const halved = Math.ceil(penalty / 2) * traitFailMult(p);
          p.reputation -= halved;
          addLog(state, `${p.name} failed "${proj.name}" → −${halved} rep${traitFailMult(p) > 1 ? ` (${p.trait?.name} ${traitFailMult(p)}x penalty)` : ''}. Project discarded.`);
        } else {
          addLog(state, `${p.name}'s "${proj.name}" expired - discarded (no penalty, never started).`);
        }
        // ROI feedback: decrease budget bonus on failure
        if (isBudgetMode(state)) {
          p.budgetBonus = Math.max(0, (p.budgetBonus || 0) - 1);
        }
        delete p.assignments[proj.id];
        state.discard.push(p.projects.splice(i, 1)[0]);
      }
    }
  }

  // 4. Innovation Tax (Q4+, fires after 3 quarters without a completion, −5,
  // then holds for 2 quarters before it can hit the same player again).
  // Retuned per the 2026-08 balance review: at −10 on a 2-quarter window with
  // no cooldown it destroyed ≈100% of the project economy's output (median
  // final rep was 0) and pile-drove whoever was already behind.
  if (state.currentQuarter >= 4) {
    for (const p of state.players) {
      const recentCompletion = p.projects.some(proj =>
        proj.isCompleted && proj.completionQuarter &&
        proj.completionQuarter >= state.currentQuarter - 2
      );
      if (recentCompletion) {
        addLog(state, `${p.name} avoided Innovation Tax: completed a project recently.`);
      } else if (p._lastTaxQuarter && state.currentQuarter - p._lastTaxQuarter < 2) {
        addLog(state, `${p.name} is still under review: Innovation Tax holds this quarter.`);
      } else {
        p._lastTaxQuarter = state.currentQuarter;
        p.reputation -= 5;
        addLog(state, `${p.name} hit by Innovation Tax: 3 quarters without completing a project, -5 rep.`);
      }
    }
  }

  // 5. Favor decay - remove oldest, cap at 3
  for (const p of state.players) {
    const favorIndices = [];
    for (let i = 0; i < p.hand.length; i++) {
      if (p.hand[i].type === 'Favor') favorIndices.push(i);
    }
    // Decay: remove oldest (first) favor
    if (favorIndices.length > 0) {
      state.discard.push(p.hand.splice(favorIndices[0], 1)[0]);
      addLog(state, `${p.name} lost a favor to decay.`);
      // Recalculate indices after splice
      favorIndices.shift();
      for (let i = 0; i < favorIndices.length; i++) favorIndices[i]--;
    }
    // Cap at 3: remove from end
    while (favorIndices.length > 3) {
      const idx = favorIndices.pop();
      state.discard.push(p.hand.splice(idx, 1)[0]);
    }
  }

  // 6. Rush Quarter (with animated reveal). The card drawn here is the one
  // telegraphed at quarter start via peekNextRushQ (same gate logic).
  if (state.currentQuarter >= 2 && state.decks.rushQ.length) {
    const rushCard = drawTimingGated(state.decks.rushQ, state.discard, state.currentQuarter);
    if (rushCard) {
      // Show animated Rush Q reveal
      maybeShowHint('classic-first-rushq');
      await showRushQReveal(rushCard);
      addLog(state, `Rush Quarter: "${rushCard.name}" hits ALL players!`);
      _recapRush = rushCard.name;

      // Project Manager (card text): "Reveal the top Rush Quarter card. Pay 1
      // Favor to negate it." Buys the owner out via the nullify machinery.
      for (const p of state.players) {
        const hasPM = p.people.some(x => x.name === 'Project Manager');
        const favors = p.hand.filter(c => c.type === 'Favor');
        const alreadyNull = (p.pendingEffects || []).some(e => e.type === 'nullifyRushQ');
        if (!hasPM || !favors.length || alreadyNull) continue;
        let pay = false;
        if (p.isAI) {
          pay = p.aiProfile !== 'sprinter' && favors.length >= 2;
        } else {
          const idx = await showChoiceDialog(
            {
              name: 'Project Manager: buy cover?', type: 'Quarter Event',
              skill: `"${rushCard.name}" is about to hit. Your Project Manager can spend 1 Favor to shield you from it.`,
            },
            [
              { label: 'Spend 1 Favor: negate it for you', action: 'pmNegate' },
              { label: 'Save the Favor: take the hit', action: 'decline' },
            ]
          );
          pay = idx === 0;
        }
        if (pay) {
          const fav = p.hand.find(c => c.type === 'Favor');
          p.hand.splice(p.hand.indexOf(fav), 1);
          state.discard.push(fav);
          if (!p.pendingEffects) p.pendingEffects = [];
          p.pendingEffects.push({ type: 'nullifyRushQ', activateQuarter: state.currentQuarter, sourceCardName: 'Project Manager' });
          addLog(state, `${p.name}'s Project Manager spends a Favor to negate "${rushCard.name}".`);
        }
      }

      // Phase E: nullifyRushQ — snapshot shielded players BEFORE resolution so
      // negation is a true skip. (The old post-hoc flat-rep refund granted a
      // windfall on non-rep Rush Qs and undid nothing else.)
      const nullified = [];
      for (const p of state.players) {
        const nullIdx = (p.pendingEffects || []).findIndex(e => e.type === 'nullifyRushQ');
        if (nullIdx >= 0) {
          p.pendingEffects.splice(nullIdx, 1);
          nullified.push({ p, snapshot: JSON.parse(JSON.stringify(p)) });
        }
      }

      if (RUSHQ_DILEMMAS.has(rushCard.name)) {
        await resolveRushQDilemma(rushCard, state, nullified.map(n => n.p));
      } else {
        resolveRushQ(rushCard, state);
      }

      // Trait: Networker takes extra Rush Q damage
      for (const p of state.players) {
        const extra = traitRushQExtra(p);
        if (extra > 0) {
          p.reputation -= extra;
          addLog(state, `${p.trait.name} visibility: ${p.name} takes -${extra} extra Rush Q damage.`);
        }
      }

      // Restore nullified players wholesale (rep, people, projects, hand) and
      // clear any per-player quarter flags the Rush Q stamped on them.
      for (const { p, snapshot } of nullified) {
        const pi = state.players.indexOf(p);
        Object.assign(p, JSON.parse(JSON.stringify(snapshot)));
        state.quarterFlags.frozenProjects = (state.quarterFlags.frozenProjects || []).filter(i => i !== pi);
        state.quarterFlags.noAssign = (state.quarterFlags.noAssign || []).filter(i => i !== pi);
        addLog(state, `Specialist nullification → ${p.name} negated "${rushCard.name}".`);
      }

      state.discard.push(rushCard);
      render(state);
      await delay(400);
    }
  }

  // 7. Layoffs — every quarter from Q5 (rulebook cadence), with escalating
  // severance costs across the four layoff cards.
  if (state.currentQuarter >= 5) {
    state.layoffsActive = true;
    maybeShowHint('classic-first-layoff');
    if (state.decks.layoffs.length) {
      const layoffCard = state.decks.layoffs.pop();
      addLog(state, `Layoff: ${layoffCard.name}`);
      resolveLayoff(layoffCard, state);
      state.discard.push(layoffCard);
      render(state);
      await delay(600);
    }
  }

  // Foundation: org-health accounting + delayed burnout/debt consequences.
  applyFoundationAndConsequences(state);

  // Catch-up (rubber-banding): help trailing players before advancing the quarter.
  applyCatchUp();

  // Track reputation for analytics before advancing quarter
  trackReputationHistory();

  // 8. Advance quarter
  state.currentQuarter++;

  // Telegraph the incoming Rush Q for the new quarter — players get one quarter
  // of dread/planning instead of a surprise at quarter end.
  state.upcomingRushQ = null;
  if (state.currentQuarter <= (state.totalQuarters || 8)) {
    state.upcomingRushQ = peekNextRushQ(state);
    if (state.upcomingRushQ) {
      addLog(state, `Heads-up: "${state.upcomingRushQ.name}" hits everyone at the end of Q${state.currentQuarter}.`);
    }
  }

  // Tier 3B: Evaluate public commitments from previous quarter
  for (let pi = 0; pi < state.players.length; pi++) {
    const p = state.players[pi];
    const commitment = state.commitments[pi];

    if (commitment && commitment.quarter === state.currentQuarter - 1) {
      let success = false;
      let actual = 0;

      switch (commitment.type) {
        case 'projects':
          // Count projects completed in the commitment quarter
          actual = p.projects.filter(proj => proj.isCompleted && proj.completionQuarter === commitment.quarter).length;
          success = actual >= commitment.target;
          break;
        case 'rep':
          // Check if player reached target reputation
          const prevRep = state.reputationHistory[commitment.quarter - 1]?.[pi] || 0;
          const currentRep = p.reputation;
          const gained = currentRep - prevRep;
          success = gained >= commitment.target;
          actual = gained;
          break;
      }

      if (success) {
        p.reputation += state.commitmentBonus;
        addLog(state, `${p.name} kept commitment: +${state.commitmentBonus} rep bonus!`);
        toastHuman(state, pi, `Commitment kept: +${state.commitmentBonus} rep`);
      } else {
        p.reputation = Math.max(0, p.reputation - state.commitmentPenalty);
        addLog(state, `${p.name} missed commitment (target: ${commitment.target}, actual: ${actual}): -${state.commitmentPenalty} rep.`);
        toastHuman(state, pi, `Commitment missed: −${state.commitmentPenalty} rep`);
      }

      // Clear commitment after evaluating
      delete state.commitments[pi];
    }
  }

  if (state.currentQuarter > (state.totalQuarters || 8)) {
    // Year-end reckoning: the Foundation each player finishes on settles up as
    // reputation — the hidden axis gets a guaranteed payoff, and the year an
    // ending beat.
    for (const p of state.players) {
      const band = foundationBand(p.foundation);
      const delta = FOUNDATION_RECKONING[band.key] || 0;
      if (delta !== 0) {
        p.reputation += delta;
        addLog(state, `Year-end review: ${p.name}'s ${band.label} foundation → ${delta > 0 ? '+' : ''}${delta} rep.`);
      }
    }
    const humanBand = foundationBand(state.players[0]?.foundation);
    const humanDelta = FOUNDATION_RECKONING[humanBand.key] || 0;
    addChronicle(state, {
      kind: humanDelta < 0 ? 'consequence' : 'milestone',
      text: `Year-end review: your ${humanBand.label.toLowerCase()} foundation ${humanDelta >= 0 ? `earned +${humanDelta}` : `cost ${humanDelta}`} reputation.`,
    });

    // Prediction beat: settle the forecast against reality.
    if (state.forecasts?.q1) {
      const h = state.players[0];
      const f = state.forecasts.q1;
      const checks = [];
      if (f.projects) checks.push(f.projects === forecastBucket('projects', h.projects.filter(pr => pr.isCompleted).length));
      if (f.rep) checks.push(f.rep === forecastBucket('rep', h.reputation));
      if (f.band) checks.push(f.band === humanBand.key);
      if (state.forecasts.q5?.band) checks.push(state.forecasts.q5.band === humanBand.key);
      if (checks.length) {
        const hits = checks.filter(Boolean).length;
        addChronicle(state, {
          kind: 'milestone',
          text: `Forecast check: you called ${hits} of ${checks.length} right. ${hits === checks.length
            ? 'Clear eyes.'
            : 'Where was the gap, optimism about output, or blindness about cost?'}`,
        });
      }
    }

    // Trait: Politician double-negative penalty at game end
    for (const p of state.players) {
      if (traitDoubleNegativeEnd(p) && p.reputation < 0) {
        const extra = Math.abs(p.reputation);
        p.reputation -= extra;
        addLog(state, `${p.trait.name} penalty: ${p.name}'s negative rep doubled (−${extra} extra).`);
      }
    }
    state.turnPhase = 'gameOver';
    addLog(state, 'Game over! Final standings:');
    const human = state.players[0];
    const finalRank = [...state.players].sort((a, b) => b.reputation - a.reputation).indexOf(human) + 1;
    const rankWord = ['', '1st', '2nd', '3rd', '4th', '5th'][finalRank] || `${finalRank}th`;
    addChronicle(state, {
      kind: 'milestone',
      text: `The year closed. You finished ${rankWord} with ${human.reputation} reputation and a ${foundationBand(human.foundation).label.toLowerCase()} foundation.`,
    });
    const sorted = [...state.players].sort((a, b) => b.reputation - a.reputation);
    sorted.forEach((p, i) => {
      const rankTag = ['1st', '2nd', '3rd'][i] || `${i + 1}th`;
      addLog(state, `${rankTag}: ${p.name}: ${p.reputation} rep`);
    });
    return;
  }

  state.currentPlayerIndex = 0;
  addLog(state, `-- Quarter ${state.currentQuarter} --`);

  // Prediction beat: one mid-year forecast check — only for players who made a
  // pre-game forecast, so the dialog budget stays at zero for everyone else.
  if (state.currentQuarter === 5 && state.forecasts?.q1 && !state.forecasts.q5 &&
      state.players[0] && !state.players[0].isAI) {
    const h = state.players[0];
    const nowBand = foundationBand(h.foundation);
    const q1Band = FOUNDATION_BANDS.find(b => b.key === state.forecasts.q1.band);
    const options = FOUNDATION_BANDS.map(b => ({
      label: b.label,
      detail: b.key === nowBand.key ? 'where you are right now' : '',
      action: 'forecastBand',
      key: b.key,
    }));
    const idx = await showChoiceDialog(
      {
        name: 'Mid-year forecast check',
        type: 'Quarter Event',
        skill: `Half the year is gone and your team health reads ${nowBand.label}.` +
          (q1Band ? ` Before Q1 you called the ending: ${q1Band.label}.` : '') +
          ` Where will it actually end?`,
      },
      options
    );
    const chosen = options[idx] || options[0];
    state.forecasts.q5 = { band: chosen.key };
    addLog(state, `Mid-year forecast: ${h.name} calls the ending ${chosen.label}.`);
    addChronicle(state, { kind: 'decision', text: `Mid-year, you called the ending: ${chosen.label} team health.` });
  }

  // 8b. Budget: reset, allocate, and process payroll for new quarter
  if (isBudgetMode(state)) {
    resetQuarterBudget(state);
    render(state);
    await allocateQuarterBudget(state, state.players[0]);
    // AI players also allocate (auto-choose)
    for (let i = 1; i < state.players.length; i++) {
      await allocateQuarterBudget(state, state.players[i]);
    }
    // Payroll: deduct 1 OpEx per person, release if can't afford
    processPayroll(state);
    save(state);
    render(state);
  }

  // 8c. Trait quarter-start effects (auto-progress, extra draw, recovery)
  for (const p of state.players) {
    const actions = traitQuarterStartActions(p, state);
    for (const action of actions) {
      if (action.type === 'progress') {
        const proj = p.projects.find(pr => pr.id === action.projId);
        if (proj && !proj.isCompleted) {
          proj.timeSpent = (proj.timeSpent || 0) + action.amount;
          addLog(state, `${p.trait.name}: +${action.amount} auto-progress on "${proj.name}".`);
        }
      } else if (action.type === 'draw') {
        for (let i = 0; i < action.count; i++) {
          const c = drawCard(p);
          if (c) addLog(state, `${p.trait.name}: ${p.name} drew extra card.`);
        }
      } else if (action.type === 'recover') {
        const recovered = state.discard.findIndex(c => c.type === action.cardType);
        if (recovered >= 0) {
          const card = state.discard.splice(recovered, 1)[0];
          p.hand.push(card);
          addLog(state, `${p.trait.name}: ${p.name} recovered "${card.name}" from discard.`);
        }
      }
    }
  }

  // 8d. Retro tokens: each player gains 1 token per quarter (for continuous improvement)
  for (const p of state.players) {
    p.retroTokens = (p.retroTokens || 0) + 1;
  }
  if (state.currentQuarter > 1) {
    addLog(state, `All players gained 1 Retro Token (retrospective).`);
  }

  // 9. Process pending effects that activate this quarter
  for (const p of state.players) {
    if (!p.pendingEffects) continue;
    const toRemove = [];
    for (let i = 0; i < p.pendingEffects.length; i++) {
      const eff = p.pendingEffects[i];

      // Deferred privacy violation: the deferred fix comes due — apply the
      // reputation penalty, with a chance of a regulatory audit doubling it.
      if (eff.type === 'deferredPrivacyViolation' && eff.activateQuarter <= state.currentQuarter) {
        const audited = Math.random() < (eff.auditChance || 0);
        const loss = audited ? eff.penalty * 2 : eff.penalty;
        p.reputation -= loss;
        addLog(state, audited
          ? `Deferred privacy issue → regulatory audit! ${p.name} loses ${loss} rep.`
          : `Deferred privacy issue caught up → ${p.name} loses ${loss} rep.`);
        toRemove.push(i);
        continue;
      }

      // Foresight immunity expires once its window has passed. Strict '<' so a
      // card played in Qn (activateQuarter n+2) covers the Qn+1 AND Qn+2 events
      // — the "2 quarters" its text promises (expiry runs before events fire).
      if (eff.type === 'foresightImmunity' && eff.activateQuarter < state.currentQuarter) {
        addLog(state, `${p.name}'s Foresight immunity expired.`);
        toRemove.push(i);
        continue;
      }

      if (eff.activateQuarter < state.currentQuarter) {
        if (eff.type === 'mentorshipHire') {
          // Draw lowest for-hire card
          if (state.decks.forHire.length) {
            const sorted = [...state.decks.forHire].sort((a, b) => (a.value || 0) - (b.value || 0));
            const lowest = sorted[0];
            const hIdx = state.decks.forHire.indexOf(lowest);
            if (hIdx >= 0) {
              const hired = state.decks.forHire.splice(hIdx, 1)[0];
              p.people.push(hired);
              addLog(state, `Mentorship effect → ${p.name} hired ${hired.name} (mentored).`);
            }
          }
          toRemove.push(i);
        } else if (eff.type === 'onboardingBuy') {
          // Allow buying 2 from For Hire this quarter (add to hand)
          let bought = 0;
          while (bought < 2 && state.decks.forHire.length) {
            const hire = state.decks.forHire.pop();
            p.hand.push(hire);
            addLog(state, `Onboarding effect → ${p.name} drew ${hire.name} from For Hire.`);
            bought++;
          }
          toRemove.push(i);
        }
        // bonusOnComplete and nullifyRushQ are consumed when triggered, not here
      }
    }
    // Remove processed effects in reverse order
    for (let i = toRemove.length - 1; i >= 0; i--) {
      p.pendingEffects.splice(toRemove[i], 1);
    }
  }

  // Quarter recap for the human — registered by events.js, absent in headless
  // runs (soak/sim) and suppressible via the quarterRecap setting.
  if (typeof window !== 'undefined' && window._showQuarterRecap && !state.gameOver && state.players[0] && !state.players[0].isAI) {
    const human = state.players[0];
    await window._showQuarterRecap({
      quarter: _recap.quarter,
      shipped: human.projects.filter(pr => pr.isCompleted && pr.completionQuarter === _recap.quarter).map(pr => pr.name),
      repDeltas: state.players.map((p, i) => ({ name: p.name, delta: p.reputation - _recap.reps[i], rep: p.reputation, isHuman: i === 0 })),
      rushQ: _recapRush,
      bandBefore: _recap.band,
      bandAfter: foundationBand(human.foundation).label,
      nextQuarter: state.currentQuarter,
      totalQuarters: state.totalQuarters || 8,
      upcoming: state.upcomingRushQ ? state.upcomingRushQ.name : null,
    });
  }

  // Event for human player (Q2+)
  if (state.currentQuarter >= 2 && state.decks.events.length) {
    state.turnSubPhase = 'event';
    render(state);
    const eventCard = drawTimingGated(state.decks.events, state.discard, state.currentQuarter);
    if (eventCard) {
      addLog(state, `Event: ${eventCard.name}`);
      // Show event effect dialog for human
      const result = await resolveEvent(eventCard, state.players[0], state);
      await showEffectDialog(eventCard, result.outcome, result.detail);
      state.discard.push(eventCard);
    }
  }

  // Board pressure (Q3+): a strained org visibly steals your slack. Cracking
  // or Crumbling costs the human 1 action; Crumbling also has one assigned
  // person refuse their assignment (the Starter-mode lesson, felt in Classic).
  state.apMax = AP_PER_TURN;
  state.apLeft = AP_PER_TURN;
  if (state.currentQuarter >= 3 && state.players[0] && !state.players[0].isAI) {
    const hBand = foundationBand(state.players[0].foundation).key;
    if (hBand === 'cracking' || hBand === 'crumbling') {
      state.apLeft = AP_PER_TURN - 1;
      addLog(state, `Board pressure: ${hBand} foundation, only ${state.apLeft} actions this turn.`);
    }
  }
  if (state.currentQuarter >= 3) {
    for (const p of state.players) {
      if (foundationBand(p.foundation).key !== 'crumbling') continue;
      const assignedIds = Object.values(p.assignments || {}).flat();
      if (!assignedIds.length) continue;
      const pick = assignedIds[Math.floor(Math.random() * assignedIds.length)];
      for (const list of Object.values(p.assignments)) {
        const i = list.indexOf(pick);
        if (i >= 0) { list.splice(i, 1); break; }
      }
      const person = p.people.find(x => x.id === pick);
      addLog(state, `Burnout refusal: ${person ? person.name : 'a team member'} on ${p.name}'s team refuses assignment this quarter.`);
      if (!p.isAI) {
        addChronicle(state, { kind: 'consequence', text: `${person ? person.name : 'Someone'} refused their assignment. A crumbling foundation now has costs you can see.` });
        toastHuman(state, p, `${person ? person.name : 'A team member'} refuses assignment, crumbling foundation`);
      }
    }
  }

  state.turnSubPhase = 'play';
  addLog(state, `${state.players[0].name}'s turn.`);
  } catch (err) {
    console.error('processQuarterEnd error:', err);
    addLog(state, 'Error during quarter end - game state recovered.');
    state.animating = false;
    save(state);
    render(state);
  }
}

/** Get people cards assigned to a project. */
export function getAssignedPeople(player, projectId) {
  const ids = player.assignments[projectId] || [];
  return ids.map(pid => player.people.find(p => p.id === pid)).filter(Boolean);
}

/** Clear all assignments for a specific person across all projects. */
function clearPersonAssignments(player, personId) {
  for (const projectId in player.assignments) {
    player.assignments[projectId] = (player.assignments[projectId] || [])
      .filter(pid => pid !== personId);
  }
}

/** Move a person from one player to another, clearing assignments. */
export function movePersonBetweenPlayers(fromPlayer, toPlayer, personId) {
  const personIdx = fromPlayer.people.findIndex(p => p.id === personId);
  if (personIdx === -1) return false;

  // Remove from source player
  const [person] = fromPlayer.people.splice(personIdx, 1);

  // Clear assignments in source player
  clearPersonAssignments(fromPlayer, personId);

  // Add to target player
  toPlayer.people.push(person);

  // Clear any assignments that might exist in target player (safety)
  clearPersonAssignments(toPlayer, personId);

  return true;
}

/** Get unassigned people for a player. */
export function getUnassignedPeople(player) {
  const assignedIds = new Set();
  for (const ids of Object.values(player.assignments)) {
    for (const id of ids) assignedIds.add(id);
  }
  return player.people.filter(p => !assignedIds.has(p.id));
}

/** Play a card from hand - with projection and effect resolution. */
export async function playCard(player, cardId) {
  const idx = player.hand.findIndex(c => c.id === cardId);
  if (idx < 0) return null;
  const card = player.hand.splice(idx, 1)[0];

  // Reaction cards are held, not played. Their printed text ("Pay N reputation
  // to nullify the opponent's Skill card") only means anything in the reaction
  // window, so playing one on your own turn is always a mistake — previously
  // it silently converted the card into an unrelated event shield.
  if (REACTION_CARDS.has(card.name)) {
    player.hand.splice(idx, 0, card);
    const cost = REACTION_COST[card.name] || 0;
    addLog(state, `"${card.name}" is a reaction: hold it. It plays itself when a rival targets you${cost ? ` (costs ${cost} rep then)` : ''}.`);
    return null;
  }

  // Trait: check if card is allowed
  const traitCheck = traitCanPlay(card, player);
  if (!traitCheck.allowed) {
    player.hand.splice(idx, 0, card);
    addLog(state, `${player.name}: ${traitCheck.reason}`);
    return null;
  }

  // Budget: FTE ceiling check for people cards
  if (isBudgetMode(state) && (card.type === 'Talent' || card.deck === 'For Hire')) {
    if (!canHireFTE(state, player)) {
      player.hand.splice(idx, 0, card);
      addLog(state, `${player.name} cannot recruit - FTE ceiling of ${FTE_CEILING} reached.`);
      return null;
    }
  }

  // Budget: OpEx check for skill cards (with trait cost modifier)
  if (isBudgetMode(state) && (card.type === 'Soft' || card.type === 'Hard' || card.type === 'Power')) {
    const baseCost = card.value || 0;
    const opCost = Math.max(0, baseCost + traitCostMod(card, player));
    if (opCost > 0 && !canAffordOpEx(state, player, opCost)) {
      player.hand.splice(idx, 0, card);
      const b = player.budget || state.budget;
      addLog(state, `${player.name} cannot play "${card.name}" - insufficient OpEx (need ${opCost}, have ${b.opEx}).`);
      return null;
    }
    if (opCost > 0) spendOpEx(state, player, opCost);
  }

  try {
    // Show card projection for human player (use captured source rect for animation origin)
    const sourceRect = !player.isAI ? (window._lastPlaySourceRect || null) : null;
    window._lastPlaySourceRect = null;
    const projectionPromise = !player.isAI ? showCardProjection(card, 1700, sourceRect) : Promise.resolve();

    if (card.type === 'Talent' || card.deck === 'For Hire') {
      player.people.push(card);
      addLog(state, `${player.name} recruited ${card.name}.`);

      // Add animation to the card element
      const cardEl = document.querySelector(`[data-card-id="${card.id}"]`);
      if (cardEl && !player.isAI) {
        cardEl.classList.add('played-skill');
        setTimeout(() => cardEl.classList.remove('played-skill'), 1000);
      }
      // On-recruit effects based on effectType
      const eff = (card.effectType || '').toLowerCase();
      if (eff.includes('draw')) {
        if (eff.includes('bonus project')) {
          if (state.decks.bonusProject.length) {
            const drawn = state.decks.bonusProject.pop();
            player.hand.push(drawn);
            addLog(state, `${card.name} recruit bonus: drew bonus project "${drawn.name}".`);
          }
        } else if (eff.includes('skill')) {
          const drawn = drawCard(player);
          if (drawn) addLog(state, `${card.name} recruit bonus: drew "${drawn.name}".`);
        }
      }
      // Specialist: choose an ability when played
      if (card.name === 'Specialist') {
        const specialistResult = await resolveSpecialist(card, player, state);
        if (!player.isAI) {
          await projectionPromise;
          await showEffectDialog(card, specialistResult.outcome, specialistResult.detail);
          save(state); render(state);
          return card;
        }
      }
    } else if (card.type === 'Project' || card.type === 'Project Queue' || card.type === 'Bonus Project') {
      // Kill the Project: block new projects for the rest of this quarter (per-player)
      const playerIdx = state.players.indexOf(player);
      if ((state.quarterFlags._noNewProject || []).includes(playerIdx)) {
        player.hand.splice(idx, 0, card);
        addLog(state, `${player.name} cannot start new projects this quarter (Kill the Project).`);
        return null;
      }
      // Freeze Rush Q: block all new project plays this quarter (global)
      if (state.quarterFlags.noNewProject) {
        player.hand.splice(idx, 0, card);
        addLog(state, `${player.name} cannot start new projects this quarter (Freeze).`);
        return null;
      }
      card.timeSpent = 0;
      card.isCompleted = false;
      player.projects.push(card);
      addLog(state, `${player.name} started project "${card.name}".`);

      // Add animation to the card element
      const cardEl = document.querySelector(`[data-card-id="${card.id}"]`);
      if (cardEl && !player.isAI) {
        cardEl.classList.add('played-project');
        setTimeout(() => cardEl.classList.remove('played-project'), 1000);
      }
    } else if (card.type === 'Soft' || card.type === 'Hard' || card.type === 'Power') {
      const result = await resolveSkillCard(card, player, state);
      // Trait on-play effect (e.g., Facilitator draws on Soft Skill)
      const traitAction = traitOnPlay(card, player);
      if (traitAction?.draw) {
        for (let i = 0; i < traitAction.draw; i++) {
          const drawn = drawCard(player);
          if (drawn) addLog(state, `${player.trait.name} trait: ${player.name} drew "${drawn.name}".`);
        }
      }
      // Show effect dialog for human
      if (!player.isAI) {
        await projectionPromise;
        await showEffectDialog(card, result.outcome, result.detail);
        save(state);
        render(state);
        return card;
      }
    } else if (card.type === 'Favor') {
      player.reputation += 1;
      addLog(state, `${player.name} used favor "${card.name}" → +1 rep.`);
      state.discard.push(card);
    } else {
      state.discard.push(card);
      addLog(state, `${player.name} played ${card.name}.`);
    }

    if (!player.isAI) await projectionPromise;
    save(state);
    render(state);
    return card;
  } catch (err) {
    console.error('playCard error:', err);
    // Put card back in hand if it's not already placed somewhere
    const inHand = player.hand.some(c => c.id === card.id);
    const inPeople = player.people.some(c => c.id === card.id);
    const inProjects = player.projects.some(c => c.id === card.id);
    if (!inHand && !inPeople && !inProjects) {
      player.hand.splice(idx, 0, card);
    }
    addLog(state, 'Error resolving card - game state recovered.');
    state.animating = false;
    save(state);
    render(state);
    return null;
  }
}

/** Resolve a skill card via the effect registry. Returns {outcome, detail}. */
export async function resolveSkillCard(card, player, s) {
  const cardName = card.name || '';
  const subcategory = card.subcategory || '';
  const effectType = (card.effectType || '').toLowerCase();

  // 1. Named card handler (exact match)
  // Ensure card is discarded after handler executes
  if (NAMED_CARD_EFFECTS[cardName]) {
    const result = await NAMED_CARD_EFFECTS[cardName](card, player, s);
    s.discard.push(card);
    return result;
  }

  // 2. Subcategory handler (exact match - preferred)
  if (subcategory && SUBCATEGORY_HANDLERS[subcategory]) {
    const result = await SUBCATEGORY_HANDLERS[subcategory](card, player, s);
    s.discard.push(card);
    return result;
  }

  // 3. effectType handler (substring match - legacy fallback)
  for (const { match, handler } of EFFECT_TYPE_HANDLERS) {
    if (effectType.includes(match)) {
      const result = await handler(card, player, s);
      s.discard.push(card);
      return result;
    }
  }

  // 4. Default fallback - always discard the card before returning
  addLog(s, `${player.name} played "${card.name}".`);
  s.discard.push(card);
  return { outcome: `Played "${card.name}"`, detail: card.skill || 'Effect resolved' };
}

// -- Phase E: Specialist --------------------------------------

async function resolveSpecialist(card, player, s) {
  if (!player.isAI) {
    const options = [
      { label: 'Draw 2 cards immediately', detail: `Main deck: ${s.decks.main.length} cards`, action: 'specDraw' },
      { label: 'Nullify the next Rush Quarter card', detail: 'Protection lasts until next Rush Q', action: 'specNullify' },
      { label: 'Draw 1 bonus project after completing a project with this card', detail: 'Persistent effect while Specialist is assigned', action: 'specBonus' },
    ];
    const choiceIdx = await showChoiceDialog(card, options);
    return executeSpecialistChoice(options[choiceIdx].action, player, s, card);
  }
  // AI: draw 2 is safest
  return executeSpecialistChoice('specDraw', player, s, card);
}

function executeSpecialistChoice(action, player, s, card) {
  switch (action) {
    case 'specDraw': {
      const drawn = [];
      for (let i = 0; i < 2; i++) {
        const c = drawCard(player);
        if (c) drawn.push(c.name);
      }
      addLog(s, `Specialist → ${player.name} drew 2 cards.`);
      return { outcome: `Drew 2 cards`, detail: drawn.length ? `Cards: ${drawn.join(', ')}` : 'Deck empty' };
    }
    case 'specNullify': {
      player.pendingEffects.push({
        type: 'nullifyRushQ',
        data: {},
        activateQuarter: s.currentQuarter,
        sourceCardName: 'Specialist',
      });
      addLog(s, `Specialist → ${player.name} will nullify the next Rush Q card.`);
      return { outcome: 'Rush Q nullification ready', detail: 'The next Rush Quarter card will be negated for you' };
    }
    case 'specBonus': {
      player.pendingEffects.push({
        type: 'bonusOnComplete',
        data: { specialistId: card.id },
        activateQuarter: s.currentQuarter,
        sourceCardName: 'Specialist',
      });
      addLog(s, `Specialist → ${player.name} will draw a bonus project on next project completion with Specialist.`);
      return { outcome: 'Bonus project on completion', detail: 'When you complete a project with Specialist assigned, draw 1 bonus project' };
    }
    default:
      return { outcome: 'Specialist recruited', detail: '' };
  }
}

/** Assign a person to a project. */
export function assignPerson(player, personId, projectId) {
  // Check noAssign flag (Uncertainty card)
  const playerIdx = state.players.indexOf(player);
  if ((state.quarterFlags.noAssign || []).includes(playerIdx)) {
    addLog(state, `${player.name} cannot assign people this quarter (Uncertainty).`);
    return;
  }
  if (!player.assignments[projectId]) player.assignments[projectId] = [];
  if (!player.assignments[projectId].includes(personId)) {
    const person = player.people.find(p => p.id === personId);
    const proj = player.projects.find(p => p.id === projectId);

    // AI Companion (card text): only assignable where a senior mentor is present.
    if (person && person.name === 'AI Companion') {
      const mentors = (player.assignments[projectId] || [])
        .map(id => player.people.find(x => x.id === id))
        .filter(x => x && /Senior Lv\. [34]|Tech Lead/.test(x.name));
      if (!mentors.length) {
        addLog(state, `${player.name}: AI Companion needs a Senior Lv. 3/4 or Tech Lead on the project first.`);
        save(state);
        render(state);
        return;
      }
    }

    player.assignments[projectId].push(personId);
    if (person && proj) {
      addLog(state, `${player.name} assigned ${person.name} to "${proj.name}".`);

      // The Architect (card text): once per project, reduce the quarter
      // requirement by 1 — applied automatically on first assignment.
      if (person.name === 'Senior Lv. 4 The Architect' && !proj._architectApplied && (proj.deadline || 0) > 1 && !proj.isCompleted) {
        proj.deadline -= 1;
        proj._architectApplied = true;
        addLog(state, `The Architect streamlines "${proj.name}": deadline reduced to ${proj.deadline} quarters.`);
      }
    }
  }
  save(state);
  render(state);
}

/** Unassign a person from a project. */
export function unassignPerson(player, personId, projectId) {
  if (player.assignments[projectId]) {
    player.assignments[projectId] = player.assignments[projectId].filter(id => id !== personId);
  }
  save(state);
  render(state);
}

/** Spend a retro token for a continuous improvement action. */
export async function spendRetroToken(player) {
  if ((player.retroTokens || 0) < 1) return null;

  if (!player.isAI) {
    const options = [
      { label: 'Peek at next event', detail: 'See the top event card before it fires' },
      { label: 'Cycle hand', detail: 'Discard lowest-value card, draw 1 new card' },
      { label: 'Micro-improvement', detail: '+1 progress on your most urgent active project' },
    ];
    const fakeCard = { name: 'Retrospective', type: 'Retro', skill: 'Reflect on last quarter and choose an improvement.' };
    const idx = await showChoiceDialog(fakeCard, options);
    player.retroTokens--;
    return executeRetro(player, idx);
  }
  // AI: improve if has projects, else cycle hand
  player.retroTokens--;
  const active = player.projects.filter(p => !p.isCompleted);
  return executeRetro(player, active.length > 0 ? 2 : 1);
}

function executeRetro(player, choice) {
  switch (choice) {
    case 0: {
      if (state.decks.events.length) {
        const top = state.decks.events[state.decks.events.length - 1];
        addLog(state, `Retro: ${player.name} peeked at next event - "${top.name}".`);
        return { type: 'peek', card: top };
      }
      addLog(state, `Retro: ${player.name} peeked - no events remaining.`);
      return { type: 'peek', card: null };
    }
    case 1: {
      if (player.hand.length > 0) {
        const sorted = [...player.hand].sort((a, b) => (a.value || 0) - (b.value || 0));
        const discard = sorted[0];
        const idx = player.hand.indexOf(discard);
        player.hand.splice(idx, 1);
        state.discard.push(discard);
        const drawn = drawCard(player);
        addLog(state, `Retro: ${player.name} cycled "${discard.name}" for "${drawn?.name || 'nothing'}".`);
        return { type: 'cycle', discarded: discard, drawn };
      }
      return { type: 'cycle', discarded: null, drawn: null };
    }
    case 2: {
      const active = player.projects.filter(p => !p.isCompleted);
      if (active.length) {
        const sorted = [...active].sort((a, b) =>
          ((a.deadline || 99) - (a.timeSpent || 0)) - ((b.deadline || 99) - (b.timeSpent || 0))
        );
        sorted[0].timeSpent = (sorted[0].timeSpent || 0) + 1;
        addLog(state, `Retro: ${player.name} +1 progress on "${sorted[0].name}".`);
        return { type: 'improve', project: sorted[0] };
      }
      return { type: 'improve', project: null };
    }
  }
}

/** Auto-assign all free people to projects using urgency-based priority (same as AI). */
export function autoAssignPeople(player) {
  const playerIdx = state.players.indexOf(player);
  if ((state.quarterFlags.noAssign || []).includes(playerIdx)) {
    addLog(state, `${player.name} cannot assign people this quarter (Uncertainty).`);
    return [];
  }
  const unassigned = getUnassignedPeople(player);
  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (!unassigned.length || !activeProjs.length) return [];

  activeProjs.sort((a, b) => {
    const aTimeLeft = (a.deadline || 99) - (a.timeSpent || 0);
    const bTimeLeft = (b.deadline || 99) - (b.timeSpent || 0);
    const aAssigned = getAssignedPeople(player, a.id).length;
    const bAssigned = getAssignedPeople(player, b.id).length;
    const aNeeds = (a.members || 0) - aAssigned;
    const bNeeds = (b.members || 0) - bAssigned;
    if (aNeeds > 0 && bNeeds <= 0) return -1;
    if (bNeeds > 0 && aNeeds <= 0) return 1;
    return aTimeLeft - bTimeLeft;
  });

  let available = [...unassigned];
  const result = [];
  for (const proj of activeProjs) {
    if (!available.length) break;
    const assigned = (player.assignments[proj.id] || []).length;
    const needed = Math.min(proj.members || 0, 4) - assigned;
    if (needed <= 0) continue;
    const toAssign = available.splice(0, needed);
    if (!player.assignments[proj.id]) player.assignments[proj.id] = [];
    for (const person of toAssign) {
      player.assignments[proj.id].push(person.id);
      result.push({ person, project: proj });
    }
  }

  if (result.length) {
    addLog(state, `${player.name} auto-assigned ${result.length} people to projects.`);
  }
  return result;
}

/**
 * Track reputation history for timeline and graph
 */
/**
 * Classic rubber-banding. A player trailing the reputation leader by at least
 * `catchUpThreshold` draws bonus cards at quarter-end — Classic's core resource
 * is cards, so the trailing manager gets more options to dig out, without simply
 * handing them free reputation. Very far behind also grants a small +1 rep bump.
 * Runs after all quarter-end scoring, before the quarter advances. The leader and
 * anyone not meaningfully behind get nothing.
 */
function applyCatchUp() {
  if (state.catchUpEnabled === false) return;
  if (!state.players || state.players.length < 2) return;

  const leaderRep = Math.max(...state.players.map(p => p.reputation));
  const threshold = state.catchUpThreshold ?? 8;
  const per = state.catchUpCardsPer ?? 4;
  const maxCards = state.catchUpCardsMax ?? 2;
  const vpBump = state.catchUpVPBonusThreshold ?? 20;

  for (const p of state.players) {
    const behind = leaderRep - p.reputation;
    if (behind < threshold) continue;

    const bonusCards = Math.min(maxCards, 1 + Math.floor((behind - threshold) / per));
    let drawn = 0;
    for (let i = 0; i < bonusCards; i++) {
      if (drawCard(p)) drawn++;
    }
    if (drawn > 0) {
      addLog(state, `${p.name} is ${behind} rep behind: catch-up: drew ${drawn} bonus card${drawn > 1 ? 's' : ''}.`);
    }

    if (behind >= vpBump && p.aiProfile !== 'sprinter') {
      // The Sprinter is exempt from the rep bump: its collapse is the lesson,
      // and a bailout would blunt the Story-of-the-Year contrast.
      p.reputation += 1;
      addLog(state, `${p.name} far behind: catch-up: +1 rep.`);
    }
  }
}

function trackReputationHistory() {
  if (!state.reputationHistory) state.reputationHistory = {};
  const quarter = state.currentQuarter;
  if (!state.reputationHistory[quarter]) {
    state.reputationHistory[quarter] = {};
  }

  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    state.reputationHistory[quarter][i] = player.reputation;
  }
}

/**
 * Tier 3A: Check if a newly completed project has synergy with any other
 * completed projects this quarter, awarding bonus reputation.
 * Returns bonus amount (0 if no synergy).
 */
function checkProjectSynergy(player, newlyCompletedProject) {
  if (!player || !newlyCompletedProject) return 0;

  // Partners count whether they completed this quarter or last quarter — the
  // two windows are always checked together. (Previously the last-quarter
  // check was skipped whenever any unrelated project completed this quarter,
  // silently missing back-to-back combos.)
  const completedRecently = player.projects.filter(proj =>
    proj.isCompleted &&
    proj.id !== newlyCompletedProject.id &&
    (proj.completionQuarter === state.currentQuarter ||
     proj.completionQuarter === state.currentQuarter - 1)
  );

  for (const synergy of PROJECT_SYNERGIES) {
    const [proj1, proj2] = synergy.combo;
    const partner = newlyCompletedProject.name === proj1 ? proj2
      : newlyCompletedProject.name === proj2 ? proj1 : null;
    if (partner && completedRecently.some(p => p.name === partner)) {
      addLog(state, `Synergy: ${newlyCompletedProject.name} + ${partner} = +${synergy.bonus} rep!`);
      toastHuman(state, player, `Synergy! ${newlyCompletedProject.name} + ${partner}, +${synergy.bonus} rep`);
      return synergy.bonus;
    }
  }

  return 0;
}
