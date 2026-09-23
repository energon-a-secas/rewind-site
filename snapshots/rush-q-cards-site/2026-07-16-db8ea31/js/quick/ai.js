// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — AI opponent logic

import { state, addLog } from './state.js';
import { getHireCost, isPremium, getMembersNeeded, getSquareCost } from './data.js';
import { getUncommittedPeople, reshuffleDeck } from './engine.js';

const MAX_AI_ACTIONS_PER_QUARTER = 8;
const MAX_SKILL_PLAYS_PER_TURN_CYCLE = 3;

// T3C: Risk assessment helper
function calculateRiskMultiplier(player) {
  const playerIdx = state.players.indexOf(player);
  const standings = calculateStandings();
  const position = standings.findIndex(s => s.playerIdx === playerIdx);
  const leaderRep = standings[0].rep;
  const gap = leaderRep - player.rep;

  const quartersLeft = 3 - state.quarter;
  const desperationFactor = quartersLeft <= 1 ? 2 : quartersLeft === 2 ? 1.5 : 1;

  // If behind by 5+ or in last place after Q2, take more risks
  if ((position >= 2 && gap >= 5) || (gap >= 8)) {
    return 1.5 * desperationFactor;
  } else if (gap >= 3) {
    return 1.2 * desperationFactor;
  }
  return 1;
}

// T3C: Calculate standings
function calculateStandings() {
  return state.players
    .map((p, i) => ({ playerIdx: i, rep: p.rep, name: p.name }))
    .sort((a, b) => b.rep - a.rep);
}

export function runAiTurn(player, s) {
  if (!player._actionsThisQ) player._actionsThisQ = 0;
  if (!player._skillPlaysThisQ) player._skillPlaysThisQ = 0;
  if (player._actionsThisQ >= MAX_AI_ACTIONS_PER_QUARTER) {
    player.hasPassed = true;
    s.passCount++;
    addLog(`${player.name} passes.`);
    return;
  }

  // Priority: hire > commit > pay squares > push > limited skills > draw > pass

  // 1. Try to hire
  if (tryAiHire(player)) { player._actionsThisQ++; return; }

  // 2. Try to commit (now allows partial commits)
  if (tryAiCommit(player)) { player._actionsThisQ++; return; }

  // 3. Try to pay squares
  if (tryAiPaySquares(player)) { player._actionsThisQ++; return; }

  // 4. Try to push (widened condition)
  if (tryAiPush(player)) { player._actionsThisQ++; return; }

  // 5. Play skill card (throttled — max 2 per quarter to prevent spam)
  if (player._skillPlaysThisQ < MAX_SKILL_PLAYS_PER_TURN_CYCLE) {
    if (tryAiPlaySkill(player)) { player._actionsThisQ++; player._skillPlaysThisQ++; return; }
  }

  // 6. Draw if hand is low
  if (player.hand.length < 5) {
    aiDraw(player);
    player._actionsThisQ++;
    return;
  }

  // 7. Pass
  player.hasPassed = true;
  s.passCount++;
  addLog(`${player.name} passes.`);
}

function tryAiHire(player) {
  if (state.peoplePool.length === 0) return false;

  const budgetCards = player.hand.filter(c => c._isBudget);
  if (!budgetCards.length) return false;

  let totalTri = 0;
  for (const c of budgetCards) totalTri += c.symbols.filter(s => s === 'tri').length;

  // Find affordable person, prefer premium
  const affordable = state.peoplePool.filter(p => getHireCost(p) <= totalTri);
  if (!affordable.length) return false;

  const target = affordable.sort((a, b) => {
    if (isPremium(a) && !isPremium(b)) return -1;
    if (!isPremium(a) && isPremium(b)) return 1;
    return getHireCost(b) - getHireCost(a);
  })[0];

  const cost = getHireCost(target);
  let remaining = cost;
  const toSpend = [];
  // Spend budget cards with most triangles first
  const sorted = [...budgetCards].sort((a, b) =>
    b.symbols.filter(s => s === 'tri').length - a.symbols.filter(s => s === 'tri').length
  );
  for (const c of sorted) {
    if (remaining <= 0) break;
    toSpend.push(c);
    remaining -= c.symbols.filter(s => s === 'tri').length;
  }

  // Remove from hand
  for (const c of toSpend) {
    const idx = player.hand.indexOf(c);
    if (idx >= 0) player.hand.splice(idx, 1);
    state.discard.push(c);
  }

  const pidx = state.peoplePool.indexOf(target);
  if (pidx >= 0) state.peoplePool.splice(pidx, 1);
  player.people.push(target);

  // Refill
  while (state.peoplePool.length < 4 && state.decks.people.length) {
    state.peoplePool.push(state.decks.people.pop());
  }

  addLog(`${player.name} hired ${target.name}.`);
  return true;
}

function tryAiCommit(player) {
  const uncommitted = getUncommittedPeople(player);
  if (!uncommitted.length) return false;

  // Focus: finish existing projects before taking on new ones
  const activeProjects = player.projects.filter(p => {
    const committed = (player.committed[p.id] || []).length;
    const pushed = player.pushed[p.id] || 0;
    const needed = getMembersNeeded(p);
    return committed + pushed < needed;
  });

  // Allow 1 new project from center if we have at most 1 active
  const ownedFirst = [...activeProjects];
  const centerProjects = activeProjects.length <= 1 ? [...state.centerProjects] : [];
  const available = [...ownedFirst, ...centerProjects];
  if (!available.length) return false;

  // Sort by proximity to completion, then by reward
  const sorted = [...available].sort((a, b) => {
    const aNeeded = getMembersNeeded(a) - (player.committed[a.id] || []).length - (player.pushed[a.id] || 0);
    const bNeeded = getMembersNeeded(b) - (player.committed[b.id] || []).length - (player.pushed[b.id] || 0);
    if (aNeeded !== bNeeded) return aNeeded - bNeeded;
    return (b.reward || 0) - (a.reward || 0);
  });

  for (const proj of sorted) {
    const needed = getMembersNeeded(proj);
    const alreadyCommitted = (player.committed[proj.id] || []).length;
    const pushCount = player.pushed[proj.id] || 0;
    const stillNeeded = needed - alreadyCommitted - pushCount;
    if (stillNeeded <= 0) continue;

    const toCommit = [];
    let effectiveAdding = 0;
    for (const p of uncommitted) {
      if (effectiveAdding >= stillNeeded) break;
      toCommit.push(p);
      effectiveAdding += isPremium(p) ? 2 : 1;
    }

    if (toCommit.length > 0) {
      if (!player.committed[proj.id]) player.committed[proj.id] = [];
      for (const p of toCommit) {
        player.committed[proj.id].push(p.id);
      }
      if (!proj._committedQ) proj._committedQ = state.quarter;

      // Track peak simultaneous committed projects for Full House agenda
      const activeCommits = Object.entries(player.committed).filter(([_, ids]) => ids.length > 0).length;
      player._peakCommittedProjects = Math.max(player._peakCommittedProjects || 0, activeCommits);

      // Move to player's projects if from center
      const cidx = state.centerProjects.indexOf(proj);
      if (cidx >= 0) {
        state.centerProjects.splice(cidx, 1);
        player.projects.push(proj);
      }

      addLog(`${player.name} committed ${toCommit.map(p => p.name).join(', ')} to "${proj.name}".`);
      return true;
    }
  }

  return false;
}

function tryAiPaySquares(player) {
  for (const proj of player.projects) {
    const sqNeeded = getSquareCost(proj);
    const sqPaid = player.squaresPaid[proj.id] || 0;
    if (sqNeeded <= sqPaid) continue;

    const budgetCards = player.hand.filter(c => c._isBudget);
    let totalSq = 0;
    for (const c of budgetCards) totalSq += c.symbols.filter(s => s === 'sq').length;

    if (totalSq > 0) {
      const remaining = sqNeeded - sqPaid;
      let left = remaining;
      const toSpend = [];
      for (const c of budgetCards) {
        if (left <= 0) break;
        const sq = c.symbols.filter(s => s === 'sq').length;
        if (sq > 0) {
          toSpend.push(c);
          left -= sq;
        }
      }

      if (!player.squaresPaid[proj.id]) player.squaresPaid[proj.id] = 0;
      for (const c of toSpend) {
        player.squaresPaid[proj.id] += c.symbols.filter(s => s === 'sq').length;
        const idx = player.hand.indexOf(c);
        if (idx >= 0) player.hand.splice(idx, 1);
        state.discard.push(c);
      }
      addLog(`${player.name} paid squares toward "${proj.name}".`);
      return true;
    }
  }
  return false;
}

function tryAiPush(player) {
  if (player.hand.length < 2) return false;

  for (const proj of player.projects) {
    const committed = (player.committed[proj.id] || []).length;
    const pushCount = player.pushed[proj.id] || 0;
    const needed = getMembersNeeded(proj);
    const effective = committed + pushCount;
    const shortfall = needed - effective;

    // Push if 1-2 short and we have people committed (invested in the project)
    if (shortfall > 0 && shortfall <= 2 && committed > 0) {
      const nonBudget = player.hand.filter(c => !c._isBudget);
      if (!nonBudget.length) return false;
      const lowest = nonBudget.sort((a, b) => (a.value || 0) - (b.value || 0))[0];
      const idx = player.hand.indexOf(lowest);
      if (idx >= 0) player.hand.splice(idx, 1);
      state.discard.push(lowest);

      if (!player.pushed[proj.id]) player.pushed[proj.id] = 0;
      player.pushed[proj.id]++;
      addLog(`${player.name} pushed on "${proj.name}".`);
      return true;
    }
  }
  return false;
}

function tryAiPlaySkill(player) {
  const skills = player.hand.filter(c => !c._isBudget && (c.type === 'Soft' || c.type === 'Hard' || c.type === 'Power' || c.type === 'Favor'));
  if (!skills.length) return false;

  // T3C: Risk multiplier affects card value assessment
  const riskMultiplier = calculateRiskMultiplier(player);

  // Filter to only contextually useful skills
  const playable = skills.filter(c => {
    if (c.type === 'Favor') return true;
    if (c.type === 'Hard') return player.projects.length > 0;
    if (c.type === 'Soft') return player.hand.length < 5;
    if (c.type === 'Power') {
      return state.players.filter(p => p !== player)
        .some(o => getUncommittedPeople(o).length > 0);
    }
    return false;
  });
  if (!playable.length) return false;

  // T3C: Dynamic scoring based on risk and game state
  playable.sort((a, b) => {
    const baseScore = { 'Favor': 8, 'Hard': 6, 'Soft': 4, 'Power': 5 };
    let aScore = (baseScore[a.type] || 0) + (a.value || 0);
    let bScore = (baseScore[b.type] || 0) + (b.value || 0);

    // Boost Power cards when behind (risk multiplier)
    if (a.type === 'Power') aScore *= riskMultiplier;
    if (b.type === 'Power') bScore *= riskMultiplier;

    return bScore - aScore;
  });

  // T3C: Bluffing behavior - occasionally make suboptimal play (20% chance)
  const shouldBluff = Math.random() < 0.2 && playable.length > 1;
  const chosenCard = shouldBluff ? playable[playable.length - 1] : playable[0];

  return aiPlayCard(player, chosenCard);
}

function aiPlayCard(player, card) {
  const idx = player.hand.indexOf(card);
  if (idx < 0) return false;
  player.hand.splice(idx, 1);

  // Record for balance-simulator meta analysis.
  if (!player._cardsPlayed) player._cardsPlayed = [];
  player._cardsPlayed.push({ name: card.name, type: card.type, quarter: state.quarter });

  // Resolve effect
  const t = card.type;
  if (t === 'Soft') {
    reshuffleDeck();
    const drawn = state.decks.action.pop();
    if (drawn) player.hand.push(drawn);
    addLog(`${player.name} played "${card.name}" (Soft) — drew a card.`);
  } else if (t === 'Hard') {
    // Target project closest to completion
    const active = player.projects.reduce((best, p) => {
      const rem = getMembersNeeded(p) - (player.committed[p.id] || []).length - (player.pushed[p.id] || 0);
      const bestRem = best ? getMembersNeeded(best) - (player.committed[best.id] || []).length - (player.pushed[best.id] || 0) : Infinity;
      return rem < bestRem ? p : best;
    }, null);
    if (active) {
      if (!player.pushed[active.id]) player.pushed[active.id] = 0;
      player.pushed[active.id]++;
      addLog(`${player.name} played "${card.name}" (Hard) — +1 push on "${active.name}".`);
    }
  } else if (t === 'Power') {
    const opponents = state.players.filter(p => p !== player);
    for (const opp of opponents) {
      const uncommitted = getUncommittedPeople(opp);
      if (uncommitted.length) {
        const stolen = uncommitted[0];
        const oidx = opp.people.indexOf(stolen);
        if (oidx >= 0) opp.people.splice(oidx, 1);
        player.people.push(stolen);
        player._poachCount = (player._poachCount || 0) + 1;
        addLog(`${player.name} played "${card.name}" (Power) — poached ${stolen.name} from ${opp.name}!`);
        break;
      }
    }
  } else if (t === 'Favor') {
    player.rep += 1;
    addLog(`${player.name} played "${card.name}" (Favor) — +1 rep.`);
  }

  state.discard.push(card);
  return true;
}

function aiDraw(player) {
  reshuffleDeck();
  const c1 = state.decks.action.pop();
  reshuffleDeck();
  const c2 = state.decks.action.pop();
  if (c1 && c2) {
    const keep = (c1.value || 0) >= (c2.value || 0) ? c1 : c2;
    const disc = keep === c1 ? c2 : c1;
    player.hand.push(keep);
    state.discard.push(disc);
  } else if (c1) {
    player.hand.push(c1);
  }
  addLog(`${player.name} drew a card.`);
}
