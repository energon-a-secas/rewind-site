// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — game engine

import { state, addLog, resetState } from './state.js';
import { loadCards, buildQuickDecks, AGENDAS, getHireCost, isPremium, getSquareCost, getMembersNeeded } from './data.js';
import { shuffle } from './utils.js';
import { render } from './render.js';
import { runAiTurn } from './ai.js';

export async function startGame(playerName, aiCount) {
  const defs = await loadCards();
  const decks = buildQuickDecks(defs);

  state.decks = decks;
  state.discard = [];
  state.log = [];
  state.quarter = 0;
  state.directives = [];
  state.claimedDirectives = [];
  state.crisisLog = [];

  // Create players
  state.players = [
    createPlayer(playerName, false),
  ];
  const aiNames = ['Aria', 'Blake', 'Casey'];
  for (let i = 0; i < aiCount; i++) {
    state.players.push(createPlayer(aiNames[i] || `AI ${i + 1}`, true));
  }

  // Deal 5 action cards each
  for (const p of state.players) {
    for (let i = 0; i < 5; i++) {
      const card = state.decks.action.pop();
      if (card) p.hand.push(card);
    }
  }

  // Deal 1 starting budget card to each player from the budget side-deck
  for (const p of state.players) {
    dealBudgetCard(p);
  }

  // Prepare draft: reveal 6 people (or 2 * playerCount, whichever is more)
  const draftCount = Math.max(6, state.players.length * 2 + 2);
  state.draftPool = [];
  for (let i = 0; i < draftCount; i++) {
    const p = state.decks.people.pop();
    if (p) state.draftPool.push(p);
  }

  // Build snake draft order with randomized start
  state.draftPicks = [];
  const n = state.players.length;
  const draftStart = Math.floor(Math.random() * n);
  const order = [];
  for (let i = 0; i < n; i++) order.push((draftStart + i) % n);
  for (let i = n - 1; i >= 0; i--) order.push((draftStart + i) % n);
  state._draftOrder = order;
  state.draftTurn = 0;

  state.phase = 'draft';
  addLog('People draft begins. Pick your starting team!');
  render(state);

  // If first drafter is AI, auto-pick
  advanceDraft();
}

export function doMulligan() {
  const human = state.players[0];
  if (human._mulliganUsed) return false;
  human._mulliganUsed = true;

  // Return non-budget hand cards to the deck
  const kept = [];
  for (const c of human.hand) {
    if (c._isBudget) {
      kept.push(c);
    } else {
      state.decks.action.push(c);
    }
  }
  human.hand = kept;

  shuffle(state.decks.action);

  // Draw 5 fresh action cards
  for (let i = 0; i < 5; i++) {
    const card = state.decks.action.pop();
    if (card) human.hand.push(card);
  }

  addLog(`${human.name} mulliganed — new hand drawn.`);
  render(state);
  return true;
}

export function startSimGame(cardDefs, numPlayers) {
  resetState();
  state._simMode = true;
  state.decks = buildQuickDecks(cardDefs);
  state.discard = [];
  state.log = [];
  state.quarter = 0;
  state.directives = [];
  state.claimedDirectives = [];
  state.crisisLog = [];

  const names = ['Alpha', 'Beta', 'Gamma', 'Delta'];
  state.players = [];
  for (let i = 0; i < numPlayers; i++) {
    state.players.push(createPlayer(names[i], true));
  }

  for (const p of state.players) {
    for (let i = 0; i < 5; i++) {
      const card = state.decks.action.pop();
      if (card) p.hand.push(card);
    }
    dealBudgetCard(p);
  }

  const draftCount = Math.max(6, numPlayers * 2 + 2);
  state.draftPool = [];
  for (let i = 0; i < draftCount; i++) {
    const p = state.decks.people.pop();
    if (p) state.draftPool.push(p);
  }

  const draftStart = Math.floor(Math.random() * numPlayers);
  const order = [];
  for (let i = 0; i < numPlayers; i++) order.push((draftStart + i) % numPlayers);
  for (let i = numPlayers - 1; i >= 0; i--) order.push((draftStart + i) % numPlayers);
  state._draftOrder = order;
  state.draftTurn = 0;
  state.phase = 'draft';

  advanceDraft();
}

export function createPlayer(name, isAI) {
  return {
    name, isAI,
    hand: [],
    people: [],
    projects: [],       // active projects this player is working on
    completedProjects: [],
    committed: {},       // { projectId: [personId, ...] }
    pushed: {},          // { projectId: pushCount }
    squaresPaid: {},     // { projectId: squareCount }
    agenda: null,
    rep: 0,
    trades: 0,
    _poachCount: 0,
    _lendCount: 0,
    _tradedWith: [],
    _soloCompleteQ: false,
    _mulliganUsed: false,
    _peakCommittedProjects: 0,
    hasPassed: false,
  };
}

/**
 * Apply catch-up bonus to a player who is trailing.
 * Returns the bonus amount applied (0 if no bonus).
 */
function applyCatchUpBonus(player, allPlayers) {
  const leaderRep = Math.max(...allPlayers.map(p => p.rep));
  const vpBehind = leaderRep - player.rep;

  if (vpBehind < state.catchUpThreshold) {
    return 0;  // Not far enough behind
  }

  // Calculate resource bonus
  const bonusResources = Math.min(
    (vpBehind - state.catchUpThreshold + 1) * state.catchUpBonusPerVP,
    state.catchUpMaxBonus
  );

  // Apply resource bonus
  if (bonusResources > 0) {
    // Find budget cards in hand
    const budgetCards = player.hand.filter(c => c._isBudget);

    // Create a catch-up budget card if needed
    if (budgetCards.length === 0) {
      const catchUpCard = {
        id: `catchup-${Date.now()}-${Math.random()}`,
        name: 'Catch-Up Bonus',
        _isBudget: true,
        symbols: ['tri', 'tri', 'tri', 'tri', 'tri', 'tri'].slice(0, bonusResources),
        _catchUpBonus: true
      };
      player.hand.push(catchUpCard);
      addLog(`💫 ${player.name} receives catch-up bonus: +${bonusResources} resources (trailing by ${vpBehind} VP)`);
    } else {
      // Add to existing budget cards
      const budget = budgetCards[0];
      const newTriangles = bonusResources;

      budget.symbols = [
        ...budget.symbols.filter(s => s !== 'tri'),
        ...Array(newTriangles).fill('tri')
      ];

      addLog(`💫 ${player.name} receives catch-up bonus: +${newTriangles} resources (trailing by ${vpBehind} VP)`);
    }

    // Log for analytics
    state._catchUpLog.push({
      playerIndex: state.players.indexOf(player),
      quarter: state.quarter,
      vpBehind,
      bonusGiven: bonusResources,
      timestamp: Date.now()
    });
  }

  // VP bonus when very far behind
  if (vpBehind >= state.catchUpVPBonusThreshold) {
    player.rep += 1;
    addLog(`🎯 ${player.name} gets desperation bonus: +1 VP`);
  }

  return bonusResources;
}

// ── Draft ───────────────────────────────────────────────────

export function draftPick(personId) {
  const order = state._draftOrder;
  const playerIdx = order[state.draftTurn];
  const player = state.players[playerIdx];

  const idx = state.draftPool.findIndex(p => p.id === personId);
  if (idx < 0) return;

  const person = state.draftPool.splice(idx, 1)[0];
  player.people.push(person);
  addLog(`${player.name} drafted ${person.name}.`);
  state.draftTurn++;

  render(state);
  advanceDraft();
}

function advanceDraft() {
  const order = state._draftOrder;

  while (state.draftTurn < order.length) {
    const playerIdx = order[state.draftTurn];
    const player = state.players[playerIdx];

    if (player.isAI) {
      aiDraftPick(player);
      state.draftTurn++;
      render(state);
    } else {
      render(state);
      return; // wait for human input
    }
  }

  // Draft complete — move to agenda pick
  startAgendaPick();
}

function aiDraftPick(player) {
  if (!state.draftPool.length) return;
  // AI prefers premium people, then highest value
  const sorted = [...state.draftPool].sort((a, b) => {
    if (isPremium(a) && !isPremium(b)) return -1;
    if (!isPremium(a) && isPremium(b)) return 1;
    return (b.value || 0) - (a.value || 0);
  });
  const pick = sorted[0];
  const idx = state.draftPool.indexOf(pick);
  state.draftPool.splice(idx, 1);
  player.people.push(pick);
  addLog(`${player.name} drafted ${pick.name}.`);
}

// ── Agenda ──────────────────────────────────────────────────

function startAgendaPick() {
  // Filter out agendas that require trade/lend (AI can't do these)
  const aiIncompatible = new Set(['Dealmaker', 'Networker', 'Generous Leader']);
  const available = shuffle(AGENDAS.filter(a => !aiIncompatible.has(a.name)));
  let idx = 0;
  for (const p of state.players) {
    if (p.isAI) {
      p.agenda = available[idx++ % available.length];
    }
  }

  // Human picks from 2
  state.agendaOptions = [available[idx % available.length], available[(idx + 1) % available.length]];
  state.phase = 'agenda';
  render(state);

  if (state._simMode) {
    pickAgenda(state.agendaOptions[0].name);
  }
}

export function pickAgenda(agendaName) {
  const human = state.players[0];
  const picked = state.agendaOptions.find(a => a.name === agendaName);
  if (!picked) return;
  human.agenda = picked;
  addLog(`You chose your secret agenda.`);

  // Refill people pool
  refillPeoplePool();

  // Start Q1
  startQuarter(1);
}

// ── Quarter flow ────────────────────────────────────────────

function startQuarter(q) {
  state.quarter = q;
  state.phase = 'play';
  state.passCount = 0;

  for (const p of state.players) {
    p.hasPassed = false;
    p._actionsThisQ = 0;
    p._skillPlaysThisQ = 0;
  }

  // Randomize start player every quarter (including Q1)
  state.startPlayerIndex = Math.floor(Math.random() * state.players.length);
  state.turnIndex = state.startPlayerIndex;

  addLog(`--- Quarter ${q} begins ---`);

  // Q2: guaranteed crisis
  if (q === 2 && state.decks.crisis.length) {
    const crisis = state.decks.crisis.pop();
    resolveCrisis(crisis);
  }

  // Flip first management directive at Q1
  if (q === 1 && state.decks.directives.length) {
    const dir = state.decks.directives.pop();
    state.directives.push(dir);
    addLog(`Management Directive: "${dir.name}" — ${dir.desc} (+${dir.reward} rep)`, 'log-directive');
  }

  // Q3: second directive
  if (q === 3 && state.decks.directives.length) {
    const dir = state.decks.directives.pop();
    state.directives.push(dir);
    addLog(`New Directive: "${dir.name}" — ${dir.desc} (+${dir.reward} rep)`, 'log-directive');
  }

  // Reveal 3 projects
  revealProjects(3);
  render(state);

  // If first player is AI, run their turn
  if (currentPlayer().isAI) {
    if (state._simMode) runCurrentAiTurns();
    else setTimeout(() => runCurrentAiTurns(), 400);
  }
}

function revealProjects(count) {
  for (let i = 0; i < count; i++) {
    const card = state.decks.projects.pop();
    if (!card) break;

    if (card._isCrisis) {
      resolveCrisis(card);
      // Flip a replacement
      const replacement = state.decks.projects.pop();
      if (replacement) {
        if (replacement._isCrisis) {
          resolveCrisis(replacement);
        } else {
          state.centerProjects.push(replacement);
          addLog(`Project revealed: "${replacement.name}"`);
        }
      }
    } else {
      state.centerProjects.push(card);
      addLog(`Project revealed: "${card.name}"`);
    }
  }
}

function resolveCrisis(card) {
  state.crisisLog.push(card);
  addLog(`CRISIS: ${card.name} — All players affected!`, 'log-crisis');

  for (const p of state.players) {
    // Crisis effect: lose 1 uncommitted person OR discard 2 cards (whichever hurts less for AI)
    const uncommitted = getUncommittedPeople(p);
    if (uncommitted.length > 0) {
      const lost = uncommitted[uncommitted.length - 1];
      const idx = p.people.indexOf(lost);
      if (idx >= 0) p.people.splice(idx, 1);
      state.discard.push(lost);
      addLog(`${p.name} lost ${lost.name} to the crisis.`);
    } else if (p.hand.length >= 2) {
      const d1 = p.hand.pop();
      const d2 = p.hand.pop();
      if (d1) state.discard.push(d1);
      if (d2) state.discard.push(d2);
      addLog(`${p.name} discarded 2 cards to the crisis.`);
    } else {
      addLog(`${p.name} had nothing to lose to the crisis.`);
    }
  }
}

export function getUncommittedPeople(player) {
  const committedIds = new Set();
  for (const ids of Object.values(player.committed)) {
    for (const id of ids) committedIds.add(id);
  }
  return player.people.filter(p => !committedIds.has(p.id));
}

function refillPeoplePool() {
  while (state.peoplePool.length < 4 && state.decks.people.length) {
    state.peoplePool.push(state.decks.people.pop());
  }
}

// ── Turn actions ────────────────────────────────────────────

export function currentPlayer() {
  return state.players[state.turnIndex];
}

function nextTurn() {
  // Advance to next non-passed player
  const n = state.players.length;
  let attempts = 0;
  do {
    state.turnIndex = (state.turnIndex + 1) % n;
    attempts++;
  } while (state.players[state.turnIndex].hasPassed && attempts < n);

  // Check if all passed
  if (state.players.every(p => p.hasPassed)) {
    endQuarter();
    return;
  }

  // ⭐ APPLY CATCH-UP BONUS HERE
  const player = currentPlayer();
  applyCatchUpBonus(player, state.players);

  // Deal a budget card to the active player at the start of their turn
  dealBudgetCard(currentPlayer());

  render(state);

  if (currentPlayer().isAI) {
    if (state._simMode) runCurrentAiTurns();
    else setTimeout(() => runCurrentAiTurns(), 400);
  }
}

function runCurrentAiTurns() {
  while (currentPlayer().isAI && !state.players.every(p => p.hasPassed)) {
    // ⭐ APPLY CATCH-UP BONUS before AI acts
    applyCatchUpBonus(currentPlayer(), state.players);

    runAiTurn(currentPlayer(), state);

    if (state.players.every(p => p.hasPassed)) {
      endQuarter();
      return;
    }

    const n = state.players.length;
    let attempts = 0;
    do {
      state.turnIndex = (state.turnIndex + 1) % n;
      attempts++;
    } while (state.players[state.turnIndex].hasPassed && attempts < n);

    // Deal budget card to new active player
    if (!state.players.every(p => p.hasPassed)) {
      dealBudgetCard(currentPlayer());
    }
  }
  render(state);
}

export function reshuffleDeck() {
  if (state.decks.action.length > 0) return;
  if (state.discard.length === 0) return;
  state.decks.action = shuffle([...state.discard]);
  state.discard = [];
  addLog('Discard pile reshuffled into the deck.');
}

function dealBudgetCard(player) {
  if (state.decks.budget.length === 0) reshuffleBudgetDeck();
  const card = state.decks.budget.pop();
  if (card) player.hand.push(card);
}

function reshuffleBudgetDeck() {
  const budgetDiscard = state.discard.filter(c => c._isBudget);
  state.discard = state.discard.filter(c => !c._isBudget);
  state.decks.budget = shuffle([...budgetDiscard]);
}

export function doPass() {
  const player = currentPlayer();
  player.hasPassed = true;
  state.passCount++;
  addLog(`${player.name} passes.`);
  nextTurn();
}

export function doHire(personId, budgetCardIds) {
  const player = currentPlayer();
  const personIdx = state.peoplePool.findIndex(p => p.id === personId);
  if (personIdx < 0) return false;

  const person = state.peoplePool[personIdx];
  const cost = getHireCost(person);

  // Count triangles from budget cards
  let triangles = 0;
  const budgetCards = [];
  for (const cid of budgetCardIds) {
    const card = player.hand.find(c => c.id === cid);
    if (card && card._isBudget) {
      triangles += card.symbols.filter(s => s === 'tri').length;
      budgetCards.push(card);
    }
  }

  if (triangles < cost) return false;

  // Remove budget cards from hand
  for (const card of budgetCards) {
    const idx = player.hand.indexOf(card);
    if (idx >= 0) player.hand.splice(idx, 1);
    state.discard.push(card);
  }

  state.peoplePool.splice(personIdx, 1);
  player.people.push(person);
  refillPeoplePool();

  // Track that player has acted (prevents mulligan)
  if (!player.isAI) state.playerHasActed = true;

  addLog(`${player.name} hired ${person.name}.`);
  nextTurn();
  return true;
}

export function doCommit(projectId, personIds) {
  const player = currentPlayer();
  // Look in center first, then in player's own active projects
  let project = state.centerProjects.find(p => p.id === projectId);
  const fromCenter = !!project;
  if (!project) project = player.projects.find(p => p.id === projectId);
  if (!project) return false;

  // Verify all people are uncommitted and owned
  const uncommitted = getUncommittedPeople(player);
  const toCommit = [];
  for (const pid of personIds) {
    const person = uncommitted.find(p => p.id === pid);
    if (!person) return false;
    toCommit.push(person);
  }

  if (!player.committed[projectId]) player.committed[projectId] = [];
  for (const person of toCommit) {
    player.committed[projectId].push(person.id);
  }

  // Track when committed for agenda
  if (!project._committedQ) project._committedQ = state.quarter;

  // Move project to player's active projects if not there yet
  if (fromCenter && !player.projects.find(p => p.id === projectId)) {
    const idx = state.centerProjects.indexOf(project);
    if (idx >= 0) state.centerProjects.splice(idx, 1);
    player.projects.push(project);
  }

  // Track peak simultaneous committed projects for Full House agenda
  const activeCommits = Object.entries(player.committed).filter(([_, ids]) => ids.length > 0).length;
  player._peakCommittedProjects = Math.max(player._peakCommittedProjects || 0, activeCommits);

  addLog(`${player.name} committed ${toCommit.map(p => p.name).join(', ')} to "${project.name}".`);
  if (!player.isAI) state.playerHasActed = true;
  nextTurn();
  return true;
}

export function doPush(projectId) {
  const player = currentPlayer();
  const project = player.projects.find(p => p.id === projectId);
  if (!project) return false;
  if (!player.hand.length) return false;

  // Discard lowest-value non-budget card, or any card
  const nonBudget = player.hand.filter(c => !c._isBudget);
  const toDiscard = nonBudget.length ? nonBudget.sort((a, b) => (a.value || 0) - (b.value || 0))[0] : player.hand[0];

  const idx = player.hand.indexOf(toDiscard);
  if (idx >= 0) player.hand.splice(idx, 1);
  state.discard.push(toDiscard);

  if (!player.pushed[projectId]) player.pushed[projectId] = 0;
  player.pushed[projectId]++;

  addLog(`${player.name} pushed on "${project.name}" (discarded "${toDiscard.name}").`);
  if (!player.isAI) state.playerHasActed = true;
  nextTurn();
  return true;
}

export function doPlaySkill(cardId) {
  const player = currentPlayer();
  const idx = player.hand.findIndex(c => c.id === cardId);
  if (idx < 0) return false;

  const card = player.hand.splice(idx, 1)[0];
  resolveSkillCard(player, card);
  state.discard.push(card);
  if (!player.isAI) state.playerHasActed = true;
  nextTurn();
  return true;
}

function resolveSkillCard(player, card) {
  const t = card.type;
  if (t === 'Soft') {
    // Draw 1 card
    reshuffleDeck();
    const drawn = state.decks.action.pop();
    if (drawn) player.hand.push(drawn);
    addLog(`${player.name} played "${card.name}" (Soft) — drew a card.`);
  } else if (t === 'Hard') {
    // +1 virtual person on project closest to completion
    const active = player.projects.reduce((best, p) => {
      const rem = getMembersNeeded(p) - (player.committed[p.id] || []).length - (player.pushed[p.id] || 0);
      const bestRem = best ? getMembersNeeded(best) - (player.committed[best.id] || []).length - (player.pushed[best.id] || 0) : Infinity;
      return rem < bestRem ? p : best;
    }, null);
    if (active) {
      if (!player.pushed[active.id]) player.pushed[active.id] = 0;
      player.pushed[active.id]++;
      addLog(`${player.name} played "${card.name}" (Hard) — +1 push on "${active.name}".`);
    } else {
      addLog(`${player.name} played "${card.name}" (Hard) — no active project.`);
    }
  } else if (t === 'Power') {
    // Poach attempt: steal 1 uncommitted person from random opponent
    const opponents = state.players.filter(p => p !== player);
    for (const opp of shuffle([...opponents])) {
      const uncommitted = getUncommittedPeople(opp);
      if (uncommitted.length) {
        const stolen = uncommitted[0];
        const oidx = opp.people.indexOf(stolen);
        if (oidx >= 0) opp.people.splice(oidx, 1);
        player.people.push(stolen);
        player._poachCount = (player._poachCount || 0) + 1;
        addLog(`${player.name} played "${card.name}" (Power) — poached ${stolen.name} from ${opp.name}!`);
        return;
      }
    }
    addLog(`${player.name} played "${card.name}" (Power) — no one to poach.`);
  } else if (t === 'Favor') {
    player.rep += 1;
    addLog(`${player.name} played "${card.name}" (Favor) — +1 rep.`);
  }
}

export function doDraw() {
  const player = currentPlayer();
  reshuffleDeck();
  const c1 = state.decks.action.pop();
  reshuffleDeck();
  const c2 = state.decks.action.pop();

  if (c1 && c2) {
    // Human: keep both for now (simplified — draw 2 keep 1 is handled in UI via discard)
    // For simplicity, AI picks the better one
    if (player.isAI) {
      const keep = (c1.value || 0) >= (c2.value || 0) ? c1 : c2;
      const disc = keep === c1 ? c2 : c1;
      player.hand.push(keep);
      state.discard.push(disc);
      addLog(`${player.name} drew and kept a card.`);
    } else {
      player.hand.push(c1);
      player.hand.push(c2);
      player._mustDiscard = true;
      addLog(`You drew 2 cards — discard 1 to keep.`);
      render(state);
      return; // Don't advance turn until discard
    }
  } else if (c1) {
    player.hand.push(c1);
    addLog(`${player.name} drew a card (deck nearly empty).`);
  } else {
    addLog(`${player.name} tried to draw but deck is empty.`);
  }

  nextTurn();
}

export function doDiscardFromDraw(cardId) {
  const player = currentPlayer();
  if (!player._mustDiscard) return;

  const idx = player.hand.findIndex(c => c.id === cardId);
  if (idx < 0) return;

  const card = player.hand.splice(idx, 1)[0];
  state.discard.push(card);
  player._mustDiscard = false;
  addLog(`You kept a card and discarded "${card.name}".`);
  nextTurn();
}

export function doLend(personId, targetPlayerIdx, projectId) {
  const player = currentPlayer();
  const target = state.players[targetPlayerIdx];
  if (!target || target === player) return false;

  const person = getUncommittedPeople(player).find(p => p.id === personId);
  if (!person) return false;

  const project = target.projects.find(p => p.id === projectId);
  if (!project) return false;

  // Mark as lent
  if (!target.committed[projectId]) target.committed[projectId] = [];
  target.committed[projectId].push(person.id);
  person._lentFrom = state.players.indexOf(player);
  person._lentTo = targetPlayerIdx;

  // Payment: lender draws 2
  for (let i = 0; i < 2; i++) {
    const drawn = state.decks.action.pop();
    if (drawn) player.hand.push(drawn);
  }

  player._lendCount = (player._lendCount || 0) + 1;
  addLog(`${player.name} lent ${person.name} to ${target.name}'s "${project.name}" — drew 2 cards.`);
  if (!player.isAI) state.playerHasActed = true;
  nextTurn();
  return true;
}

export function doPaySquares(projectId, budgetCardIds) {
  const player = currentPlayer();
  const project = player.projects.find(p => p.id === projectId);
  if (!project) return false;

  let squares = 0;
  const budgetCards = [];
  for (const cid of budgetCardIds) {
    const card = player.hand.find(c => c.id === cid);
    if (card && card._isBudget) {
      squares += card.symbols.filter(s => s === 'sq').length;
      budgetCards.push(card);
    }
  }

  if (!player.squaresPaid[projectId]) player.squaresPaid[projectId] = 0;
  player.squaresPaid[projectId] += squares;

  for (const card of budgetCards) {
    const idx = player.hand.indexOf(card);
    if (idx >= 0) player.hand.splice(idx, 1);
    state.discard.push(card);
  }

  addLog(`${player.name} paid ${squares} square(s) toward "${project.name}".`);
  nextTurn();
  return true;
}

// ── Quarter end ─────────────────────────────────────────────

function endQuarter() {
  addLog(`--- Quarter ${state.quarter} ends ---`);

  // Track reputation at end of game for catch-up analysis
  if (state.quarter === 3) {
    for (const p of state.players) {
      p._repAtQ4 = p.rep;
    }
  }

  // Resolve projects for each player
  for (const p of state.players) {
    const completed = [];
    const failed = [];

    for (const proj of [...p.projects]) {
      const committedPeople = (p.committed[proj.id] || []);
      const pushCount = p.pushed[proj.id] || 0;

      // Count effective people (premium = 2)
      let effective = pushCount;
      for (const pid of committedPeople) {
        const person = p.people.find(pe => pe.id === pid);
        if (person && isPremium(person)) {
          effective += 2;
          proj._usedPremium = true;
        } else {
          effective += 1;
        }
      }

      const needed = getMembersNeeded(proj);
      const sqNeeded = getSquareCost(proj);
      const sqPaid = p.squaresPaid[proj.id] || 0;

      if (effective >= needed && sqPaid >= sqNeeded) {
        completed.push(proj);
      } else {
        failed.push(proj);
      }
    }

    // Score completed
    for (const proj of completed) {
      proj._completedQ = state.quarter;
      p.rep += (proj.reward || 0);
      p.completedProjects.push(proj);
      const pidx = p.projects.indexOf(proj);
      if (pidx >= 0) p.projects.splice(pidx, 1);

      // Return committed people
      delete p.committed[proj.id];
      delete p.pushed[proj.id];
      delete p.squaresPaid[proj.id];

      addLog(`${p.name} completed "${proj.name}" — +${proj.reward} rep!`, 'log-complete');
    }

    // Partial credit for incomplete projects, then return to center
    for (const proj of failed) {
      const committedPeople = (p.committed[proj.id] || []);
      const pushCount = p.pushed[proj.id] || 0;
      let effective = pushCount;
      for (const pid of committedPeople) {
        const person = p.people.find(pe => pe.id === pid);
        effective += (person && isPremium(person)) ? 2 : 1;
      }
      const needed = getMembersNeeded(proj);
      const fullReward = proj.reward || 0;

      if (effective > 0 && needed > 0 && fullReward > 0) {
        const ratio = Math.min(effective / needed, 1);
        const sqNeeded = getSquareCost(proj);
        const sqPaid = p.squaresPaid[proj.id] || 0;
        const sqMet = sqPaid >= sqNeeded;
        const partialRep = Math.floor(fullReward * ratio * (sqMet ? 0.75 : 0.5));
        if (partialRep > 0) {
          p.rep += partialRep;
          addLog(`${p.name}'s "${proj.name}" incomplete (${effective}/${needed}) — +${partialRep} partial rep.`);
        } else {
          addLog(`${p.name}'s "${proj.name}" incomplete — no reward.`);
        }
      } else if (p.committed[proj.id]?.length || pushCount) {
        addLog(`${p.name}'s "${proj.name}" incomplete — people return.`);
      }

      const pidx = p.projects.indexOf(proj);
      if (pidx >= 0) p.projects.splice(pidx, 1);
      state.centerProjects.push(proj);

      delete p.committed[proj.id];
      delete p.pushed[proj.id];
      delete p.squaresPaid[proj.id];
    }

    // Check solo completion (for Survivor agenda)
    if (completed.length > 0) {
      const othersCompleted = state.players.filter(o => o !== p).some(o => {
        return o.completedProjects.some(c => c._completedQ === state.quarter);
      });
      if (!othersCompleted) p._soloCompleteQ = true;
    }
  }

  // Return lent people
  for (const p of state.players) {
    for (const person of [...p.people]) {
      if (person._lentFrom !== undefined) {
        const owner = state.players[person._lentFrom];
        const idx = p.people.indexOf(person);
        // Person might be in committed — remove from all
        for (const [pid, ids] of Object.entries(p.committed)) {
          const cidx = ids.indexOf(person.id);
          if (cidx >= 0) ids.splice(cidx, 1);
        }
        delete person._lentFrom;
        delete person._lentTo;
        // Person stays with original owner (already there)
      }
    }
  }

  // Check directives
  checkDirectives();

  // Everyone draws 2
  for (const p of state.players) {
    for (let i = 0; i < 2; i++) {
      reshuffleDeck();
      const card = state.decks.action.pop();
      if (card) p.hand.push(card);
    }
  }

  // Refill people pool
  refillPeoplePool();

  // Next quarter or game over
  if (state.quarter >= 3) {
    endGame();
  } else {
    startQuarter(state.quarter + 1);
  }
}

function checkDirectives() {
  for (const dir of state.directives) {
    if (dir.claimed) continue;

    const checkOrder = shuffle([...state.players.keys()]);
    for (const i of checkOrder) {
      const p = state.players[i];
      if (checkDirectiveCondition(dir, p)) {
        dir.claimed = true;
        state.claimedDirectives.push({ directive: dir, playerId: i });
        p.rep += dir.reward;
        addLog(`${p.name} claimed directive "${dir.name}" — +${dir.reward} rep!`, 'log-directive');
        break;
      }
    }
  }
}

function checkDirectiveCondition(dir, player) {
  const name = dir.name;
  if (name === 'Board Wants a Big Win') return player.completedProjects.some(p => (p.reward || 0) >= 5);
  if (name === 'Ship Fast') return player.completedProjects.length >= 2;
  if (name === 'Talent Showcase') return player.people.length >= 4;
  if (name === 'Innovation Push') return player.completedProjects.some(p => p.type === 'Bonus Project');
  if (name === 'Reliability Mandate') return player.completedProjects.length >= 2;
  if (name === 'Resource Efficiency') {
    return player.completedProjects.some(p => {
      const committed = Object.keys(player.committed).length; // rough check
      return true; // simplified
    });
  }
  if (name === 'Cross-Team Excellence') return (player._lendCount || 0) >= 1;
  if (name === 'Cost-Cutting Initiative') return player.completedProjects.some(p => !(player.pushed[p.id]));
  return false;
}

// ── Game over ───────────────────────────────────────────────

function endGame() {
  addLog('=== Game Over ===');

  // Agenda bonuses
  for (const p of state.players) {
    if (p.agenda && p.agenda.check(p, state)) {
      p.rep += 10;
      p._agendaComplete = true;
      addLog(`${p.name} completed agenda "${p.agenda.name}" — +10 rep!`);
    } else {
      p._agendaComplete = false;
    }

    // Leftover people bonus
    const peopleBonus = p.people.length;
    p.rep += peopleBonus;
    if (peopleBonus) addLog(`${p.name} has ${peopleBonus} people on field — +${peopleBonus} rep.`);
  }

  state.phase = 'gameOver';
  render(state);
}
