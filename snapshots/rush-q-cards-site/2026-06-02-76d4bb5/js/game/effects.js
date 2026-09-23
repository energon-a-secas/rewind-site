// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card effect registry ─────────────────────────────────────
// Data-driven dispatch for skill card resolution.
// Named cards get exact-match handlers; everything else matches effectType.

import { addLog } from './state.js';
import { drawCard, getUnassignedPeople, getAssignedPeople } from './engine.js';
import { showChoiceDialog } from './render.js';

// ── Named card handlers (exact card name match) ──────────────

async function handleOverreach(card, player, s) {
  player.reputation -= 5;
  const drawn = [];
  for (let i = 0; i < 2; i++) {
    const c = drawCard(player);
    if (c) drawn.push(c.name);
  }
  addLog(s, `${player.name} played "${card.name}" → −5 rep, drew ${drawn.length} card(s).`);
  return { outcome: `−5 rep, drew ${drawn.length} cards`, detail: drawn.length ? `Cards: ${drawn.join(', ')}` : 'Deck was empty' };
}

async function handleDomainCollision(card, player, s) {
  const playerActive = player.projects.filter(p => !p.isCompleted);
  const opponents = s.players.filter(p => p !== player);
  if (!playerActive.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects to exchange.`);
    return { outcome: 'No active projects', detail: 'Cannot exchange without a project' };
  }
  if (!player.isAI) {
    const options = [];
    for (const opp of opponents) {
      for (const oppProj of opp.projects.filter(p => !p.isCompleted)) {
        const oppMembers = oppProj.members || 0;
        if (playerActive.some(pp => (pp.members || 0) >= oppMembers)) {
          options.push({
            label: `Take "${oppProj.name}" from ${opp.name}`,
            detail: `${oppMembers}p, ${oppProj.deadline || '?'}q, +${oppProj.reward || 0} reward`,
            action: 'domainCollision',
            oppIdx: s.players.indexOf(opp),
            oppProjId: oppProj.id,
          });
        }
      }
    }
    if (!options.length) {
      addLog(s, `${player.name} played "${card.name}" — no eligible opponent projects.`);
      return { outcome: 'No eligible targets', detail: 'No opponent project with same or fewer members' };
    }
    const choiceIdx = await showChoiceDialog(card, options);
    const chosen = options[choiceIdx];
    return executeDomainCollision(player, s, chosen.oppIdx, chosen.oppProjId, playerActive);
  }
  let bestOpp = null, bestProj = null, bestReward = -1;
  for (const opp of opponents) {
    for (const oppProj of opp.projects.filter(p => !p.isCompleted)) {
      if ((oppProj.reward || 0) > bestReward && playerActive.some(pp => (pp.members || 0) >= (oppProj.members || 0))) {
        bestOpp = opp; bestProj = oppProj; bestReward = oppProj.reward || 0;
      }
    }
  }
  if (bestOpp && bestProj) {
    return executeDomainCollision(player, s, s.players.indexOf(bestOpp), bestProj.id, playerActive);
  }
  addLog(s, `${player.name} played "${card.name}" — no eligible targets.`);
  return { outcome: 'No eligible targets', detail: 'No valid exchange found' };
}

async function handleReassign(card, player, s) {
  if (!player.isAI) {
    const options = [];
    for (let pi = 0; pi < s.players.length; pi++) {
      const src = s.players[pi];
      const unassigned = getUnassignedPeople(src);
      for (const person of unassigned) {
        for (let ti = 0; ti < s.players.length; ti++) {
          if (ti === pi) continue;
          options.push({
            label: `Move ${person.name} from ${src.name} to ${s.players[ti].name}`,
            detail: `${person.type || 'Team member'}${person.value ? ` — ${person.value}v` : ''}`,
            action: 'reassign',
            srcIdx: pi, tgtIdx: ti, personId: person.id,
          });
        }
      }
    }
    if (!options.length) {
      addLog(s, `${player.name} played "${card.name}" — no unassigned people to move.`);
      return { outcome: 'No targets', detail: 'No unassigned people available to move' };
    }
    const choiceIdx = await showChoiceDialog(card, options);
    const chosen = options[choiceIdx];
    return executeReassign(s, chosen.srcIdx, chosen.tgtIdx, chosen.personId, card.name, player.name);
  }
  let bestPerson = null, bestSrcIdx = -1;
  for (let pi = 0; pi < s.players.length; pi++) {
    if (s.players[pi] === player) continue;
    const unassigned = getUnassignedPeople(s.players[pi]);
    for (const person of unassigned) {
      if (!bestPerson || (person.value || 0) > (bestPerson.value || 0)) {
        bestPerson = person; bestSrcIdx = pi;
      }
    }
  }
  if (bestPerson) {
    return executeReassign(s, bestSrcIdx, s.players.indexOf(player), bestPerson.id, card.name, player.name);
  }
  addLog(s, `${player.name} played "${card.name}" — no targets.`);
  return { outcome: 'No targets', detail: 'No unassigned opponents to steal from' };
}

async function handleRequestHelp(card, player, s) {
  const opponents = s.players.filter(p => p !== player);
  if (!player.isAI) {
    const options = [];
    for (const opp of opponents) {
      for (const proj of opp.projects.filter(p => !p.isCompleted && (p.timeSpent || 0) > 0)) {
        options.push({
          label: `Take 1 progress from ${opp.name}'s "${proj.name}"`,
          detail: `Current progress: ${proj.timeSpent}/${proj.deadline || '?'}`,
          action: 'requestHelp',
          oppIdx: s.players.indexOf(opp), projId: proj.id,
        });
      }
    }
    if (!options.length) {
      addLog(s, `${player.name} played "${card.name}" — no opponent projects with progress.`);
      return { outcome: 'No targets', detail: 'No opponent project has progress to take' };
    }
    const choiceIdx = await showChoiceDialog(card, options);
    const chosen = options[choiceIdx];
    return executeRequestHelp(player, s, chosen.oppIdx, chosen.projId, card.name);
  }
  let bestOppIdx = -1, bestProjId = null, bestProgress = 0;
  for (let pi = 0; pi < s.players.length; pi++) {
    if (s.players[pi] === player) continue;
    for (const proj of s.players[pi].projects.filter(p => !p.isCompleted)) {
      if ((proj.timeSpent || 0) > bestProgress) {
        bestProgress = proj.timeSpent || 0; bestOppIdx = pi; bestProjId = proj.id;
      }
    }
  }
  if (bestOppIdx >= 0 && bestProjId) {
    return executeRequestHelp(player, s, bestOppIdx, bestProjId, card.name);
  }
  addLog(s, `${player.name} played "${card.name}" — no targets.`);
  return { outcome: 'No targets', detail: 'No opponent project has progress' };
}

async function handleWonderfulMove(card, player, s) {
  const active = player.projects.filter(p => !p.isCompleted);
  const withProgress = active.filter(p => (p.timeSpent || 0) > 0);
  if (active.length < 2 || !withProgress.length) {
    addLog(s, `${player.name} played "${card.name}" — not enough projects.`);
    return { outcome: 'Not enough projects', detail: 'Need 2+ active projects, 1 with progress' };
  }
  if (player.reputation < 2) {
    addLog(s, `${player.name} played "${card.name}" — not enough rep (need 2).`);
    return { outcome: 'Not enough reputation', detail: 'Need 2 rep to pay for move' };
  }
  if (!player.isAI) {
    const options = [];
    for (const src of withProgress) {
      for (const tgt of active) {
        if (tgt.id === src.id) continue;
        options.push({
          label: `Move 1 progress: "${src.name}" → "${tgt.name}"`,
          detail: `Source: ${src.timeSpent}/${src.deadline || '?'} → Target: ${tgt.timeSpent || 0}/${tgt.deadline || '?'}`,
          action: 'wonderfulMove', srcId: src.id, tgtId: tgt.id,
        });
      }
    }
    const choiceIdx = await showChoiceDialog(card, options);
    const chosen = options[choiceIdx];
    const srcProj = player.projects.find(p => p.id === chosen.srcId);
    const tgtProj = player.projects.find(p => p.id === chosen.tgtId);
    srcProj.timeSpent = Math.max(0, (srcProj.timeSpent || 0) - 1);
    tgtProj.timeSpent = (tgtProj.timeSpent || 0) + 1;
    player.reputation -= 2;
    addLog(s, `${player.name} played "${card.name}" → moved progress from "${srcProj.name}" to "${tgtProj.name}", −2 rep.`);
    return { outcome: `Moved progress to "${tgtProj.name}"`, detail: `Paid 2 rep. Now at ${player.reputation} rep` };
  }
  const sorted = [...active].sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
  const src = sorted[0], tgt = sorted[sorted.length - 1];
  if (src.id !== tgt.id && (src.timeSpent || 0) > 0) {
    src.timeSpent = Math.max(0, (src.timeSpent || 0) - 1);
    tgt.timeSpent = (tgt.timeSpent || 0) + 1;
    player.reputation -= 2;
    addLog(s, `${player.name} played "${card.name}" → moved progress, −2 rep.`);
    return { outcome: 'Moved progress between projects', detail: `Paid 2 rep. Now at ${player.reputation} rep` };
  }
  return { outcome: 'No valid move', detail: 'Cannot shift progress' };
}

// ── Named card helper functions ──────────────────────────────

function executeDomainCollision(player, s, oppIdx, oppProjId, playerActive) {
  const opp = s.players[oppIdx];
  const oppProj = opp.projects.find(p => p.id === oppProjId);
  if (!oppProj) return { outcome: 'Target not found', detail: '' };
  const eligible = playerActive.filter(p => (p.members || 0) >= (oppProj.members || 0));
  const playerProj = eligible[eligible.length - 1];
  if (!playerProj) return { outcome: 'No eligible project', detail: '' };
  const ppIdx = player.projects.indexOf(playerProj);
  const opIdx = opp.projects.indexOf(oppProj);
  player.projects[ppIdx] = oppProj;
  opp.projects[opIdx] = playerProj;
  const playerAssign = player.assignments[playerProj.id] || [];
  const oppAssign = opp.assignments[oppProjId] || [];
  delete player.assignments[playerProj.id];
  delete opp.assignments[oppProjId];
  player.assignments[oppProjId] = playerAssign;
  opp.assignments[playerProj.id] = oppAssign;
  player.reputation -= 5;
  opp.reputation -= 5;
  addLog(s, `Domain Collision → ${player.name} exchanged "${playerProj.name}" with ${opp.name}'s "${oppProj.name}". Both −5 rep.`);
  return { outcome: `Exchanged projects with ${opp.name}`, detail: `Gave "${playerProj.name}", got "${oppProj.name}". Both −5 rep` };
}

function executeReassign(s, srcIdx, tgtIdx, personId, cardName, playerName) {
  const src = s.players[srcIdx];
  const tgt = s.players[tgtIdx];
  const pIdx = src.people.findIndex(p => p.id === personId);
  if (pIdx < 0) return { outcome: 'Person not found', detail: '' };
  const person = src.people.splice(pIdx, 1)[0];
  tgt.people.push(person);
  addLog(s, `${playerName} played "${cardName}" → moved ${person.name} from ${src.name} to ${tgt.name}.`);
  return { outcome: `Moved ${person.name}`, detail: `From ${src.name} to ${tgt.name}` };
}

function executeRequestHelp(player, s, oppIdx, projId, cardName) {
  const opp = s.players[oppIdx];
  const proj = opp.projects.find(p => p.id === projId);
  if (!proj || (proj.timeSpent || 0) <= 0) return { outcome: 'No progress to take', detail: '' };
  proj.timeSpent = Math.max(0, (proj.timeSpent || 0) - 1);
  const playerProj = player.projects.find(p => !p.isCompleted);
  if (playerProj) {
    playerProj.timeSpent = (playerProj.timeSpent || 0) + 1;
    addLog(s, `${player.name} played "${cardName}" → took 1 progress from ${opp.name}'s "${proj.name}" to "${playerProj.name}".`);
    return { outcome: `+1 progress on "${playerProj.name}"`, detail: `Taken from ${opp.name}'s "${proj.name}"` };
  }
  addLog(s, `${player.name} played "${cardName}" → took 1 progress from ${opp.name}'s "${proj.name}".`);
  return { outcome: `−1 progress on "${proj.name}"`, detail: `${opp.name} lost 1 progress (you had no project to receive it)` };
}

// ── effectType handlers (matched by substring) ───────────────

function handleDraw(card, player, s) {
  const skill = (card.skill || '').toLowerCase();
  const effectType = (card.effectType || '').toLowerCase();
  const match = skill.match(/draw (\d+)/i);
  const count = match ? parseInt(match[1]) : 1;
  const drawn = [];

  if (effectType.includes('bonus project') || skill.includes('bonus project')) {
    if (s.quarterFlags.noBonusProject) {
      addLog(s, `Bonus project draw blocked by Scope Creep.`);
    } else {
      for (let i = 0; i < count; i++) {
        if (s.decks.bonusProject.length) {
          const c = s.decks.bonusProject.pop();
          player.hand.push(c);
          drawn.push(c.name);
        } else {
          const c = drawCard(player);
          if (c) drawn.push(c.name);
        }
      }
    }
  } else if (skill.includes('people') || skill.includes('for hire') || skill.includes('talent')) {
    for (let i = 0; i < count; i++) {
      if (s.decks.forHire.length) {
        const c = s.decks.forHire.pop();
        player.hand.push(c);
        drawn.push(c.name);
      } else {
        const c = drawCard(player);
        if (c) drawn.push(c.name);
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      const c = drawCard(player);
      if (c) drawn.push(c.name);
    }
  }

  const outcome = `Drew ${drawn.length} card(s)`;
  const detail = drawn.length ? `Cards: ${drawn.join(', ')}` : 'Deck was empty';
  addLog(s, `${player.name} played "${card.name}" → ${outcome}.`);
  return { outcome, detail };
}

async function handleProgress(card, player, s) {
  const skill = (card.skill || '').toLowerCase();
  const match = skill.match(/(\d+)\s*progress/i);
  const amount = match ? parseInt(match[1]) : 1;
  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (!activeProjs.length) {
    addLog(s, `${player.name} played "${card.name}" (no active projects).`);
    return { outcome: 'No active projects', detail: 'Progress effect had no target' };
  }
  let proj;
  if (!player.isAI && activeProjs.length > 1) {
    const options = activeProjs.map(p => ({
      label: `Advance "${p.name}"`,
      detail: `Progress: ${p.timeSpent || 0}/${p.deadline || '?'}q · ${p.members || 0}p needed`,
    }));
    const idx = await showChoiceDialog(card, options);
    proj = activeProjs[idx] || activeProjs[0];
  } else {
    proj = activeProjs[0];
  }
  proj.timeSpent = (proj.timeSpent || 0) + amount;
  const outcome = `+${amount} progress on "${proj.name}"`;
  const detail = `Progress: ${proj.timeSpent}/${proj.deadline || '?'}`;
  addLog(s, `${player.name} played "${card.name}" → ${outcome}.`);
  return { outcome, detail };
}

function handleRepGain(card, player, s) {
  const skill = (card.skill || '').toLowerCase();
  const match = skill.match(/gain (\d+)/i) || skill.match(/\+(\d+)/i);
  const rep = match ? parseInt(match[1]) : 2;
  player.reputation += rep;
  addLog(s, `${player.name} played "${card.name}" → +${rep} rep.`);
  return { outcome: `+${rep} reputation`, detail: `Total: ${player.reputation} rep` };
}

function handleRepLoss(card, player, s) {
  const skill = (card.skill || '').toLowerCase();
  const match = skill.match(/lose (\d+)/i) || skill.match(/-(\d+)/i);
  const rep = match ? parseInt(match[1]) : 2;
  player.reputation -= rep;
  addLog(s, `${player.name} played "${card.name}" → −${rep} rep.`);
  return { outcome: `−${rep} reputation`, detail: `Total: ${player.reputation} rep` };
}

function handleNegation(card, player, s) {
  addLog(s, `${player.name} played "${card.name}" → protection effect active.`);
  return { outcome: 'Protection activated', detail: 'Negates the next negative event or penalty' };
}

function handleDiscardRecovery(card, player, s) {
  if (s.discard.length) {
    const recovered = s.discard.pop();
    player.hand.push(recovered);
    addLog(s, `${player.name} played "${card.name}" → recovered "${recovered.name}" from discard.`);
    return { outcome: `Recovered "${recovered.name}"`, detail: 'Card added back to hand' };
  }
  addLog(s, `${player.name} played "${card.name}" (discard empty).`);
  return { outcome: 'Discard empty', detail: 'No cards to recover' };
}

function handleHiring(card, player, s) {
  if (s.decks.forHire.length) {
    const hired = s.decks.forHire.pop();
    player.people.push(hired);
    addLog(s, `${player.name} played "${card.name}" → hired ${hired.name}.`);
    return { outcome: `Hired ${hired.name}`, detail: 'Added to your team' };
  }
  addLog(s, `${player.name} played "${card.name}" (no people available).`);
  return { outcome: 'No people available', detail: 'For Hire deck is empty' };
}

function handleDeadline(card, player, s) {
  const effectType = (card.effectType || '').toLowerCase();
  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (activeProjs.length) {
    const proj = activeProjs[0];
    if (effectType.includes('reduction')) {
      proj.deadline = Math.max(1, (proj.deadline || 1) - 1);
      addLog(s, `${player.name} played "${card.name}" → deadline reduced on "${proj.name}".`);
      return { outcome: `Deadline reduced on "${proj.name}"`, detail: `New deadline: ${proj.deadline}q` };
    } else {
      proj.deadline = (proj.deadline || 1) + 1;
      addLog(s, `${player.name} played "${card.name}" → deadline extended on "${proj.name}".`);
      return { outcome: `Deadline extended on "${proj.name}"`, detail: `New deadline: ${proj.deadline}q` };
    }
  }
  return { outcome: 'No active projects', detail: 'Deadline effect had no target' };
}

function handleChoice(card, player, s) {
  const rep = 2;
  player.reputation += rep;
  addLog(s, `${player.name} played "${card.name}" → chose +${rep} rep.`);
  return { outcome: `+${rep} reputation (choice)`, detail: card.skill || 'Choice effect resolved' };
}

function handleRisk(card, player, s) {
  const roll = Math.random();
  if (roll > 0.4) {
    const rep = 3;
    player.reputation += rep;
    addLog(s, `${player.name} played "${card.name}" → risk paid off! +${rep} rep.`);
    return { outcome: `Risk succeeded! +${rep} rep`, detail: `Total: ${player.reputation} rep` };
  } else {
    const rep = 2;
    player.reputation -= rep;
    addLog(s, `${player.name} played "${card.name}" → risk failed! −${rep} rep.`);
    return { outcome: `Risk failed! −${rep} rep`, detail: `Total: ${player.reputation} rep` };
  }
}

function handleBurst(card, player, s) {
  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (!activeProjs.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects.`);
    return { outcome: 'No active projects', detail: 'Burst effect had no target' };
  }
  const proj = activeProjs[0];
  const boost = proj.members || 3;
  proj.timeSpent = (proj.timeSpent || 0) + boost;
  player.reputation -= 3;
  addLog(s, `${player.name} played "${card.name}" → +${boost} progress on "${proj.name}", −3 rep.`);
  return { outcome: `+${boost} burst progress on "${proj.name}"`, detail: `Counted as full team for 1 quarter. −3 rep (now ${player.reputation})` };
}

// ── Scope Negotiation ────────────────────────────────────────

async function handleScopeNegotiation(card, player, s) {
  const active = player.projects.filter(p => !p.isCompleted);
  if (!active.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects.`);
    return { outcome: 'No active projects', detail: 'Need an active project to negotiate scope' };
  }
  if (!player.isAI) {
    const options = active.map(p => ({
      label: `Negotiate "${p.name}"`,
      detail: `Current: ${p.members}p, ${p.deadline}q, +${p.reward} reward → After: ${Math.max(1, p.members - 1)}p, ${(p.deadline || 1) + 1}q, +${Math.max(1, (p.reward || 0) - 2)} reward`,
    }));
    const idx = await showChoiceDialog(card, options);
    return executeScopeNegotiation(player, s, active[idx]);
  }
  // AI: negotiate on the hardest-to-staff project
  const sorted = [...active].sort((a, b) => (b.members || 0) - (a.members || 0));
  return executeScopeNegotiation(player, s, sorted[0]);
}

function executeScopeNegotiation(player, s, proj) {
  const oldMembers = proj.members || 1;
  const oldDeadline = proj.deadline || 1;
  const oldReward = proj.reward || 0;
  proj.members = Math.max(1, oldMembers - 1);
  proj.deadline = oldDeadline + 1;
  proj.reward = Math.max(1, oldReward - 2);
  const drawn = drawCard(player);
  addLog(s, `${player.name} negotiated scope on "${proj.name}": ${oldMembers}→${proj.members} members, ${oldDeadline}→${proj.deadline} deadline, ${oldReward}→${proj.reward} reward.`);
  return {
    outcome: `Scope negotiated on "${proj.name}"`,
    detail: `Members: ${oldMembers}→${proj.members}, Deadline: ${oldDeadline}→${proj.deadline}q, Reward: ${oldReward}→${proj.reward}. Drew 1 card.`,
  };
}

// ── Kill the Project ─────────────────────────────────────────

async function handleKillProject(card, player, s) {
  const active = player.projects.filter(p => !p.isCompleted);
  if (!active.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects to kill.`);
    return { outcome: 'No active projects', detail: 'Nothing to cancel' };
  }
  if (!player.isAI) {
    const options = active.map(p => ({
      label: `Kill "${p.name}"`,
      detail: `Progress: ${p.timeSpent || 0}/${p.deadline || '?'}q, ${p.members}p assigned. Penalty avoided: -${p.penalty || 0} rep`,
    }));
    const idx = await showChoiceDialog(card, options);
    return executeKillProject(player, s, active[idx]);
  }
  // AI: kill the project furthest from completion (worst ROI)
  const sorted = [...active].sort((a, b) => {
    const aRemaining = (a.deadline || 0) - (a.timeSpent || 0);
    const bRemaining = (b.deadline || 0) - (b.timeSpent || 0);
    return bRemaining - aRemaining;
  });
  return executeKillProject(player, s, sorted[0]);
}

function executeKillProject(player, s, proj) {
  // Release assignments
  delete player.assignments[proj.id];
  // Remove project
  const idx = player.projects.indexOf(proj);
  if (idx >= 0) player.projects.splice(idx, 1);
  s.discard.push(proj);
  // Cost: -2 rep
  player.reputation -= 2;
  // Block new projects this quarter
  const playerIdx = s.players.indexOf(player);
  if (!s.quarterFlags._noNewProject) s.quarterFlags._noNewProject = [];
  s.quarterFlags._noNewProject.push(playerIdx);
  addLog(s, `${player.name} killed "${proj.name}" — project cancelled, -2 rep. No new projects this quarter.`);
  return {
    outcome: `Killed "${proj.name}"`,
    detail: `Project removed with no failure penalty. -2 rep. Cannot start a new project this quarter.`,
  };
}

// ── Fit Interviews ───────────────────────────────────────────

async function handleFitInterviews(card, player, s) {
  // Draw 2 people cards from For Hire deck
  const drawn = [];
  for (let i = 0; i < 2; i++) {
    if (s.decks.forHire.length) {
      drawn.push(s.decks.forHire.pop());
    }
  }
  if (!drawn.length) {
    addLog(s, `${player.name} played "${card.name}" — no people available to draw.`);
    return { outcome: 'No people available', detail: 'For Hire deck is empty' };
  }
  if (drawn.length === 1) {
    player.people.push(drawn[0]);
    addLog(s, `${player.name} played "${card.name}" → kept ${drawn[0].name} (only 1 available).`);
    return { outcome: `Hired ${drawn[0].name}`, detail: 'Only 1 person was available' };
  }
  let keptIdx = 0;
  if (!player.isAI) {
    const options = drawn.map(p => ({
      label: `Keep ${p.name}`,
      detail: `${p.type || 'Talent'} · Value: ${p.value || '?'}`,
    }));
    keptIdx = await showChoiceDialog(card, options);
  } else {
    // AI: keep the higher-value person
    keptIdx = (drawn[1].value || 0) > (drawn[0].value || 0) ? 1 : 0;
  }
  const kept = drawn[keptIdx];
  const other = drawn[1 - keptIdx];
  player.people.push(kept);
  // Give the other to an opponent who has a Favor, or discard
  const opponents = s.players.filter(p => p !== player);
  const favorTarget = opponents.find(opp => opp.hand.some(c => c.type === 'Favor'));
  if (favorTarget) {
    const favorIdx = favorTarget.hand.findIndex(c => c.type === 'Favor');
    const favor = favorTarget.hand.splice(favorIdx, 1)[0];
    player.hand.push(favor);
    favorTarget.people.push(other);
    addLog(s, `${player.name} played "${card.name}" → kept ${kept.name}, gave ${other.name} to ${favorTarget.name} for a Favor.`);
    return {
      outcome: `Hired ${kept.name}, traded ${other.name} for a Favor`,
      detail: `${favorTarget.name} received ${other.name} and gave you their Favor.`,
    };
  } else {
    s.discard.push(other);
    addLog(s, `${player.name} played "${card.name}" → kept ${kept.name}, discarded ${other.name} (no opponent had a Favor).`);
    return {
      outcome: `Hired ${kept.name}`,
      detail: `${other.name} discarded — no opponent had a Favor to trade.`,
    };
  }
}

async function handleTechnicalDebt(card, player, s) {
  // Find target project
  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (!activeProjs.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects to add debt to.`);
    return { outcome: 'No active projects', detail: 'Cannot add Technical Debt without an active project' };
  }

  // AI: target the biggest project
  if (player.isAI) {
    const target = activeProjs.reduce((biggest, proj) => {
      const bigMembers = biggest.members || 0;
      const projMembers = proj.members || 0;
      return projMembers > bigMembers ? proj : biggest;
    });

    // Add or increment tech debt
    target.techDebt = (target.techDebt || 0) + 1;
    target.deadline = (target.deadline || 0) + 1; // +1 quarter to timeline

    addLog(s, `${player.name} played "${card.name}" → "${target.name}" gains Tech Debt (+1 quarter).`);
    return { outcome: `+1 Tech Debt on "${target.name}"`, detail: 'Project timeline extended by 1 quarter' };
  }

  // Human player: show project selection dialog
  const options = activeProjs.map(proj => {
    const currentDebt = proj.techDebt || 0;
    return {
      label: `"${proj.name}"`,
      detail: `${proj.members || 0} members, deadline ${proj.deadline || 0}, current debt: ${currentDebt}`,
      action: 'addDebt',
      projId: proj.id,
    };
  });

  const choiceIdx = await showChoiceDialog(card, options);
  const chosen = options[choiceIdx];
  if (chosen) {
    const proj = player.projects.find(p => p.id === chosen.projId);
    if (proj) {
      proj.techDebt = (proj.techDebt || 0) + 1;
      proj.deadline = (proj.deadline || 0) + 1;
      addLog(s, `"${proj.name}" gains Tech Debt (+1 quarter to timeline).`);
      return { outcome: `+1 Tech Debt`, detail: `"${proj.name}" deadline extended to ${proj.deadline}` };
    }
  }
  return { outcome: 'Cancelled', detail: 'No project selected' };
}

async function handleForesight(card, player, s) {
  if (!player.pendingEffects) player.pendingEffects = [];

  // Add foresight immunity effect that lasts 2 quarters
  player.pendingEffects.push({
    type: 'foresightImmunity',
    activateQuarter: s.currentQuarter + 2, // Activate for this quarter and next
    sourceCardName: card.name
  });

  addLog(s, `${player.name} played "${card.name}" → immune to events for 2 quarters (breaks on Company Priorities/Team Reorg).`);
  return { outcome: 'Event immunity for 2 quarters', detail: 'Immunity will break if Company Priorities or Team Reorg events occur' };
}

async function handleShiftTheBlame(card, player, s) {
  // Find target (opponent with highest reputation)
  const opponents = s.players.filter(p => p !== player);
  if (!opponents.length) {
    addLog(s, `${player.name} played "${card.name}" — no opponents to target.`);
    return { outcome: 'No targets', detail: 'No opponents available' };
  }

  // Track usage count for escalating cost
  if (!player.shiftTheBlameCount) player.shiftTheBlameCount = 0;
  player.shiftTheBlameCount++;

  // Calculate cost: base 10 + 5 per previous use
  const baseCost = 10;
  const additionalCost = (player.shiftTheBlameCount - 1) * 5;
  const totalCost = baseCost + additionalCost;

  // AI: target player with highest reputation
  if (player.isAI) {
    const target = opponents.reduce((max, p) => p.reputation > max.reputation ? p : max);
    target.reputation = Math.max(0, target.reputation - 5);
    player.reputation = Math.min(player.reputation + 3, 100); // Cap at 100
    addLog(s, `${player.name} played "${card.name}" → ${target.name} loses 5 rep, ${player.name} gains 3 rep (cost: ${totalCost} total, ${additionalCost} extra).`);
    return { outcome: `Cost: ${totalCost} (escalating)`, detail: `${target.name} -5 rep, ${player.name} +3 rep` };
  }

  // Human player: offer target selection
  const options = opponents.map(opp => ({
    label: opp.name,
    detail: `Current rep: ${opp.reputation}`,
    action: 'shiftBlame',
    targetId: s.players.indexOf(opp),
  }));

  const choiceIdx = await showChoiceDialog(card, options);
  const chosen = options[choiceIdx];
  if (chosen) {
    const target = s.players[chosen.targetId];
    target.reputation = Math.max(0, target.reputation - 5);
    player.reputation = Math.min(player.reputation + 3, 100);
    addLog(s, `${player.name} shifted blame → ${target.name} -5 rep, ${player.name} +3 rep (cost: ${totalCost}).`);
    return { outcome: `Cost: ${totalCost} rep`, detail: `${target.name} lost 5 rep, you gained 3 rep` };
  }
  return { outcome: 'Cancelled', detail: 'No target selected' };
}

async function handleDefensiveManeuver(card, player, s) {
  // Check if already used this game
  if (player.defensiveManeuverUsed) {
    addLog(s, `"${card.name}" already used this game — cannot use again.`);
    return { outcome: 'Already used', detail: 'One-time use per game' };
  }

  // Check if player can afford 10 rep
  if (player.reputation < 10) {
    addLog(s, `${player.name} cannot afford "${card.name}" (needs 10 rep, has ${player.reputation}).`);
    return { outcome: 'Cannot afford', detail: 'Insufficient reputation' };
  }

  // Pay cost and mark as used
  player.reputation -= 10;
  player.defensiveManeuverUsed = true;

  addLog(s, `${player.name} paid 10 rep for "${card.name}" (one-time use).`);
  return { outcome: 'Protection ready', detail: 'You may now negate one card targeting you' };
}

// ── Registry maps ────────────────────────────────────────────

export const NAMED_CARD_EFFECTS = {
  'Overreach': handleOverreach,
  'Domain Collision': handleDomainCollision,
  'Reassign Resources': handleReassign,
  'Charm People': handleReassign,
  'Request Help': handleRequestHelp,
  'Wonderful Move': handleWonderfulMove,
  'Scope Negotiation': handleScopeNegotiation,
  'Kill the Project': handleKillProject,
  'Fit Interviews': handleFitInterviews,
  'Foresight': handleForesight,
  'Shift The blame': handleShiftTheBlame,
  'Defensive Maneuver': handleDefensiveManeuver,
};

export const EFFECT_TYPE_HANDLERS = [
  { match: 'draw', handler: handleDraw },
  { match: 'progress', handler: handleProgress },
  { match: 'reputation gain', handler: handleRepGain },
  { match: 'reputation loss', handler: handleRepLoss },
  { match: 'negation', handler: handleNegation },
  { match: 'shield', handler: handleNegation },
  { match: 'protection', handler: handleNegation },
  { match: 'discard recovery', handler: handleDiscardRecovery },
  { match: 'hiring', handler: handleHiring },
  { match: 'deadline', handler: handleDeadline },
  { match: 'choice', handler: handleChoice },
  { match: 'risk', handler: handleRisk },
  { match: 'tech debt', handler: handleTechnicalDebt },
];

export const SUBCATEGORY_HANDLERS = {
  'draw': handleDraw,
  'progress': handleProgress,
  'rep-gain': handleRepGain,
  'rep-loss': handleRepLoss,
  'shield': handleNegation,
  'recovery': handleDiscardRecovery,
  'hiring': handleHiring,
  'deadline': handleDeadline,
  'choice': handleChoice,
  'risk': handleRisk,
  'burst': handleBurst,
  'scope': handleScopeNegotiation,
  'kill-project': handleKillProject,
  'debt': handleTechnicalDebt,
};
