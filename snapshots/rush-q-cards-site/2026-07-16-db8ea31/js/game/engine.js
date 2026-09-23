// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary - see LICENSE.CONTENT.
// -- Game engine ----------------------------------------------
// Turn loop, quarter processing, game flow.

import { state, save, addLog } from './state.js';
import { loadCards, buildDecks } from './data.js';
import { shuffle, delay } from './utils.js';
import { resolveEvent, resolveRushQ, resolveLayoff, drawTimingGated } from './rules.js';
import { runAiTurn } from './ai.js';
import { render, renderLog, showCardProjection, showRushQReveal, showEffectDialog, showProjectCompleteModal, showChoiceDialog } from './render.js';
import { isBudgetMode, initBudget, canAffordOpEx, spendOpEx, canAffordCapEx, spendCapEx, resetQuarterBudget, allocateQuarterBudget, processPayroll, canHireFTE, FTE_CEILING } from './budget.js';
import { NAMED_CARD_EFFECTS, EFFECT_TYPE_HANDLERS, SUBCATEGORY_HANDLERS } from './effects.js';
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
  state.selectedCards = [];
  state.showModal = null;
  state.modalData = null;
  state.forHireUnlocked = true;
  state.layoffsActive = false;
  state.layoffTargetIndex = 0;
  state.animating = false;
  state.quarterFlags = { frozenProjects: [], noAssign: [], noBonusProject: false, noNewProject: false };
  state.reputationHistory = {};
  state.totalQuarters = totalQuarters;
  state.difficulty = getSetting('difficulty') || 'normal';

  // Build players
  const aiNames = ['Director Nova', 'VP Cipher', 'CTO Axiom', 'SVP Nexus'];
  const players = [
    makePlayer(playerName || 'Player', false),
  ];
  for (let i = 0; i < aiCount; i++) {
    players.push(makePlayer(aiNames[i], true));
  }
  state.players = players;

  // Set up decks
  state.decks.main = decks.main;
  state.decks.events = decks.events;
  state.decks.rushQ = decks.rushQ;
  state.decks.layoffs = decks.layoffs;
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

  addLog(state, `Game started! ${players.length} players, ${totalQuarters} quarters.`);
  addLog(state, `Q1 - ${players[0].name}'s turn.`);

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
  };
}

/** Draw a card from main deck into player's hand. */
export function drawCard(player) {
  if (!state.decks.main.length) {
    if (state.discard.length) {
      state.decks.main = shuffle([...state.discard]);
      state.discard = [];
      addLog(state, 'Discard pile reshuffled into main deck.');
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

/** Process end-of-quarter effects. */
async function processQuarterEnd() {
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
          addLog(state, `⚠️ Tech Debt: "${proj.name}" reduced by ${techDebt} progress (${techDebt} token(s)).`);
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

  // Reset quarter flags for next quarter
  state.quarterFlags = { frozenProjects: [], noAssign: [], noBonusProject: false, noNewProject: false };

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
          addLog(state, `⚠️ Rushed project: "${proj.name}" added 1 Tech Debt token (${proj.techDebt} total).`);
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

        // Completion reward: free hire from For Hire deck
        if (state.decks.forHire.length && (!isBudgetMode(state) || canHireFTE(state, p))) {
          const hired = state.decks.forHire.pop();
          p.people.push(hired);
          addLog(state, `Completion bonus: ${p.name} hired ${hired.name}.`);
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
          if (state.decks.bonusProject.length && !state.quarterFlags.noBonusProject) {
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

  // 4. Innovation Tax (Q3+ only, checks last 2 consecutive quarters, -10 rep)
  if (state.currentQuarter >= 3) {
    for (const p of state.players) {
      const recentCompletion = p.projects.some(proj =>
        proj.isCompleted && proj.completionQuarter &&
        proj.completionQuarter >= state.currentQuarter - 1
      );
      if (!recentCompletion) {
        p.reputation -= 10;
        addLog(state, `${p.name} hit by Innovation Tax: 2 quarters without completing a project, -10 rep.`);
      } else {
        addLog(state, `${p.name} avoided Innovation Tax: completed a project recently.`);
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

  // 6. Rush Quarter (with animated reveal)
  if (state.currentQuarter >= 2 && state.decks.rushQ.length) {
    const rushCard = drawTimingGated(state.decks.rushQ, state.discard, state.currentQuarter);
    if (rushCard) {
      // Show animated Rush Q reveal
      maybeShowHint('classic-first-rushq');
      await showRushQReveal(rushCard);
      addLog(state, `Rush Quarter: "${rushCard.name}" hits ALL players!`);
      resolveRushQ(rushCard, state);

      // Trait: Networker takes extra Rush Q damage
      for (const p of state.players) {
        const extra = traitRushQExtra(p);
        if (extra > 0) {
          p.reputation -= extra;
          addLog(state, `${p.trait.name} visibility: ${p.name} takes -${extra} extra Rush Q damage.`);
        }
      }

      // Phase E: nullifyRushQ - remove Rush Q effects for players with the pending effect
      for (const p of state.players) {
        const nullIdx = (p.pendingEffects || []).findIndex(e => e.type === 'nullifyRushQ');
        if (nullIdx >= 0) {
          p.pendingEffects.splice(nullIdx, 1);
          // Undo the Rush Q effect for this player (restore rep lost)
          const penalty = rushCard.penalty || rushCard.negationCost || 2;
          p.reputation += penalty;
          addLog(state, `Specialist nullification → ${p.name} negated Rush Q effect (+${penalty} rep restored).`);
        }
      }

      state.discard.push(rushCard);
      render(state);
      await delay(400);
    }
  }

  // 7. Layoffs (Q5 and Q7 only)
  if (state.currentQuarter === 5 || state.currentQuarter === 7) {
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

  // Catch-up (rubber-banding): help trailing players before advancing the quarter.
  applyCatchUp();

  // Track reputation for analytics before advancing quarter
  trackReputationHistory();

  // 8. Advance quarter
  state.currentQuarter++;

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
        addLog(state, `✅ ${p.name} kept commitment: +${state.commitmentBonus} rep bonus!`);
      } else {
        p.reputation = Math.max(0, p.reputation - state.commitmentPenalty);
        addLog(state, `❌ ${p.name} missed commitment (target: ${commitment.target}, actual: ${actual}): -${state.commitmentPenalty} rep.`);
      }

      // Clear commitment after evaluating
      delete state.commitments[pi];
    }
  }

  if (state.currentQuarter > (state.totalQuarters || 8)) {
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
    const sorted = [...state.players].sort((a, b) => b.reputation - a.reputation);
    sorted.forEach((p, i) => {
      const medal = ['🥇','🥈','🥉',''][Math.min(i, 3)];
      addLog(state, `${medal} ${p.name}: ${p.reputation} rep`);
    });
    return;
  }

  state.currentPlayerIndex = 0;
  addLog(state, `-- Quarter ${state.currentQuarter} --`);

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

      // Foresight immunity expires once its window has passed.
      if (eff.type === 'foresightImmunity' && eff.activateQuarter <= state.currentQuarter) {
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
    player.assignments[projectId].push(personId);
    const person = player.people.find(p => p.id === personId);
    const proj = player.projects.find(p => p.id === projectId);
    if (person && proj) {
      addLog(state, `${player.name} assigned ${person.name} to "${proj.name}".`);
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
      addLog(state, `💫 ${p.name} is ${behind} rep behind — catch-up: drew ${drawn} bonus card${drawn > 1 ? 's' : ''}.`);
    }

    if (behind >= vpBump) {
      p.reputation += 1;
      addLog(state, `🎯 ${p.name} far behind — catch-up: +1 rep.`);
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

  const completedThisQuarter = player.projects.filter(proj =>
    proj.isCompleted &&
    proj.completionQuarter === state.currentQuarter &&
    proj.id !== newlyCompletedProject.id
  );

  // If this is the first project completed this quarter, check for completed last quarter
  if (completedThisQuarter.length === 0) {
    const completedLastQuarter = player.projects.filter(proj =>
      proj.isCompleted &&
      proj.completionQuarter === state.currentQuarter - 1
    );

    // Check each synergy definition
    for (const synergy of PROJECT_SYNERGIES) {
      const [proj1, proj2] = synergy.combo;

      // Check if newly completed project matches either project in combo
      if (newlyCompletedProject.name === proj1) {
        // Check if other project was completed last quarter
        const hasOther = completedLastQuarter.some(p => p.name === proj2);
        if (hasOther) {
          addLog(state, `🔄 Synergy: ${newlyCompletedProject.name} + ${proj2} = +${synergy.bonus} rep!`);
          return synergy.bonus;
        }
      } else if (newlyCompletedProject.name === proj2) {
        const hasOther = completedLastQuarter.some(p => p.name === proj1);
        if (hasOther) {
          addLog(state, `🔄 Synergy: ${proj1} + ${newlyCompletedProject.name} = +${synergy.bonus} rep!`);
          return synergy.bonus;
        }
      }
    }
  } else {
    // Check for synergies within the same quarter
    for (const synergy of PROJECT_SYNERGIES) {
      const [proj1, proj2] = synergy.combo;

      if (newlyCompletedProject.name === proj1) {
        const hasOther = completedThisQuarter.some(p => p.name === proj2);
        if (hasOther) {
          addLog(state, `🔄 Synergy: ${newlyCompletedProject.name} + ${proj2} = +${synergy.bonus} rep!`);
          return synergy.bonus;
        }
      } else if (newlyCompletedProject.name === proj2) {
        const hasOther = completedThisQuarter.some(p => p.name === proj1);
        if (hasOther) {
          addLog(state, `🔄 Synergy: ${proj1} + ${newlyCompletedProject.name} = +${synergy.bonus} rep!`);
          return synergy.bonus;
        }
      }
    }
  }

  return 0;
}
