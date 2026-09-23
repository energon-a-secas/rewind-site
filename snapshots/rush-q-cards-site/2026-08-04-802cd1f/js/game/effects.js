// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card effect registry ─────────────────────────────────────
// Data-driven dispatch for skill card resolution.
// Named cards get exact-match handlers; everything else matches effectType.

import { addLog, addChronicle, recordIncomingHit } from './state.js';
import { drawCard, getUnassignedPeople, getAssignedPeople } from './engine.js';
import { showChoiceDialog } from './render.js';
import { REACTION_CARDS, REACTION_COST } from './effect-rails.js';

// ── Reaction window ──────────────────────────────────────────
// The negation cluster's printed text ("nullify the opponent's Skill card")
// resolves here, and it runs in BOTH directions: any targeted play opens one
// window for its target, whoever they are. An earlier version guarded on
// `attacker.isAI && !target.isAI`, which made the human's own attacks
// uncounterable and reduced the whole system to ~0.2 windows per game.
//
// The window is also the only place defensive resources are spent by choice:
// a held counter, an armed Defensive Maneuver shield, or a partial soak.

export { REACTION_CARDS, REACTION_COST } from './effect-rails.js';

// Lighten the Mood does not nullify — it prints "reduce reputation damage
// based from the number of team members that you have", so it soaks rather
// than cancels, and only against reputation damage.
const SOFTEN_CARDS = new Set(['Lighten the Mood']);

/** What a non-reputation theft (project, person, progress) is worth to the AI
 *  when it decides whether a counter is worth paying for. Deliberately low: at
 *  4 only the cheap counters (Compromise 1, Counter Argument 3) are spent on a
 *  steal, while Talk Over is held back for a real reputation hit. Raising this
 *  much above 5 makes every affordable counter fire and quietly neuters the
 *  human's seven attack cards. */
const THEFT_VALUE = 4;

const NO_REACTION = { blocked: false, mitigated: 0 };

/** Open a reaction window for `target`. `opts.repDamage` is the reputation loss
 *  about to be applied (0 for theft-style attacks); it gates the soak option.
 *  Returns { blocked, mitigated } — `blocked` aborts the play entirely,
 *  `mitigated` is reputation damage absorbed by a soak. */
async function offerReaction(s, attacker, target, card, opts = {}) {
  if (!target || !attacker || target === attacker) return NO_REACTION;
  const repDamage = Math.max(0, opts.repDamage || 0);

  // Reputation in this game routinely runs to zero and below, and an attack is
  // exactly when you are poorest — hard-gating the counter on affordability
  // closed the window precisely when it mattered (measured: 0.12 windows/game
  // with the gate vs 0.20 without). The human is shown the price and decides;
  // only the AI declines what it cannot afford, so it never bankrupts itself.
  const affordableForAi = (rc) => target.reputation >= (REACTION_COST[rc.name] || 0);
  const nullifiers = target.hand.filter(
    c => REACTION_CARDS.has(c.name) && !SOFTEN_CARDS.has(c.name)
      && (!target.isAI || affordableForAi(c)));
  const softeners = repDamage > 0
    ? target.hand.filter(c => SOFTEN_CARDS.has(c.name))
    : [];
  const hasShield = (target.attackShield || 0) > 0;
  if (!nullifiers.length && !softeners.length && !hasShield) return NO_REACTION;

  // Soak size is capped at the incoming damage — absorbing more than was dealt
  // would turn a hit into a profit.
  const soakFor = () => Math.min(target.people.length, repDamage);

  const spendShield = () => {
    target.attackShield--;
    const src = target.attackShieldSource || 'Shield';
    addLog(s, `${target.name}'s ${src} negates "${card.name}" — the attack fizzles.`);
    if (!target.isAI) {
      addChronicle(s, { kind: 'decision', text: `Your ${src} absorbed ${attacker.name}'s ${card.name}.` });
    }
    return { blocked: true, mitigated: 0 };
  };

  const spendCounter = (rc) => {
    const hi = target.hand.findIndex(c => c.id === rc.id);
    if (hi < 0) return NO_REACTION;
    target.hand.splice(hi, 1);
    s.discard.push(rc);
    const cost = REACTION_COST[rc.name] || 0;
    target.reputation -= cost;
    const costNote = cost ? ` (paid ${cost} rep)` : '';
    addLog(s, `${target.name} countered "${card.name}" with "${rc.name}"${costNote} — the attack fizzles.`);
    if (!target.isAI) {
      addChronicle(s, { kind: 'decision', text: `You countered ${attacker.name}'s ${card.name} with ${rc.name}.` });
    }
    return { blocked: true, mitigated: 0 };
  };

  const spendSoak = (rc) => {
    const hi = target.hand.findIndex(c => c.id === rc.id);
    if (hi < 0) return NO_REACTION;
    target.hand.splice(hi, 1);
    s.discard.push(rc);
    const soak = soakFor();
    addLog(s, `${target.name} played "${rc.name}" — ${soak} of the ${repDamage} rep damage is laughed off.`);
    if (!target.isAI) {
      addChronicle(s, { kind: 'decision', text: `You softened ${attacker.name}'s ${card.name} by ${soak} rep.` });
    }
    return { blocked: false, mitigated: soak };
  };

  // ── AI target: a fixed, legible policy ──────────────────────
  // Shields are free, so they always fire. A counter is only worth paying for
  // when the threat outvalues it — which deliberately leaves expensive
  // counters (Talk Over) in hand against cheap attacks, so a human's attack
  // is contested but not reliably neutralised.
  if (target.isAI) {
    if (hasShield) return spendShield();
    const threat = repDamage > 0 ? repDamage : THEFT_VALUE;
    const worth = nullifiers
      .filter(rc => (REACTION_COST[rc.name] || 0) < threat)
      .sort((a, b) => (REACTION_COST[a.name] || 0) - (REACTION_COST[b.name] || 0));
    if (worth.length) return spendCounter(worth[0]);
    if (softeners.length && soakFor() > 0) return spendSoak(softeners[0]);
    return NO_REACTION;
  }

  // ── Human target: present the window ────────────────────────
  const stake = repDamage > 0
    ? `You are about to lose ${repDamage} reputation.`
    : (opts.stake || 'A targeted play is about to resolve against you.');

  const options = [];
  if (hasShield) {
    options.push({
      label: `Spend your ${target.attackShieldSource || 'shield'}`,
      detail: 'Negates it outright — costs nothing more',
      action: 'shield',
    });
  }
  for (const rc of nullifiers) {
    const cost = REACTION_COST[rc.name] || 0;
    const short = cost > target.reputation;
    options.push({
      label: `Counter with "${rc.name}"${cost ? ` — pay ${cost} rep` : ''}`,
      detail: short
        ? `Discard it, the attack fizzles. You only have ${target.reputation} rep — this puts you at ${target.reputation - cost}.`
        : `Discard it, the attack fizzles. You have ${target.reputation} rep.`,
      action: 'react',
      cardId: rc.id,
    });
  }
  for (const rc of softeners) {
    options.push({
      label: `Soften with "${rc.name}"`,
      detail: `Your ${target.people.length} team member(s) absorb ${soakFor()} of the ${repDamage} rep`,
      action: 'soften',
      cardId: rc.id,
    });
  }
  options.push({ label: 'Let it resolve', detail: 'Save your counters for later', action: 'decline' });

  const idx = await showChoiceDialog(card, options, false, {
    heading: `${attacker.name} plays "${card.name}" at you`,
    note: stake,
  });
  const chosen = options[idx];
  if (!chosen) return NO_REACTION;
  if (chosen.action === 'shield') return spendShield();
  if (chosen.action === 'react') {
    const rc = target.hand.find(c => c.id === chosen.cardId);
    return rc ? spendCounter(rc) : NO_REACTION;
  }
  if (chosen.action === 'soften') {
    const rc = target.hand.find(c => c.id === chosen.cardId);
    return rc ? spendSoak(rc) : NO_REACTION;
  }
  return NO_REACTION;
}

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
    if (!chosen) return { outcome: 'Cancelled', detail: 'No target selected' };
    const victim = s.players[chosen.oppIdx];
    const react = await offerReaction(s, player, victim, card, {
      stake: `${player.name} wants to swap a project with you.`,
    });
    if (react.blocked) return { outcome: 'Countered', detail: `${victim.name} nullified the play` };
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
    const react = await offerReaction(s, player, bestOpp, card, {
      stake: `${player.name} wants to swap a project with you.`,
    });
    if (react.blocked) return { outcome: 'Countered', detail: `${bestOpp.name} nullified the play` };
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
    if (!chosen) return { outcome: 'Cancelled', detail: 'No move selected' };
    // Only the player losing the person gets a window, and only when it is
    // not the person doing the moving.
    const victim = s.players[chosen.srcIdx];
    if (victim !== player) {
      const react = await offerReaction(s, player, victim, card, {
        stake: `${player.name} is moving one of your people off your team.`,
      });
      if (react.blocked) return { outcome: 'Countered', detail: `${victim.name} nullified the play` };
    }
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
    const victim = s.players[bestSrcIdx];
    const react = await offerReaction(s, player, victim, card, {
      stake: `${player.name} is moving one of your people off your team.`,
    });
    if (react.blocked) return { outcome: 'Countered', detail: `${victim.name} nullified the play` };
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
    if (!chosen) return { outcome: 'Cancelled', detail: 'No target selected' };
    const victim = s.players[chosen.oppIdx];
    const react = await offerReaction(s, player, victim, card, {
      stake: `${player.name} is taking a quarter of progress off one of your projects.`,
    });
    if (react.blocked) return { outcome: 'Countered', detail: `${victim.name} nullified the play` };
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
    const victim = s.players[bestOppIdx];
    const react = await offerReaction(s, player, victim, card, {
      stake: `${player.name} is taking a quarter of progress off one of your projects.`,
    });
    if (react.blocked) return { outcome: 'Countered', detail: `${victim.name} nullified the play` };
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
  recordIncomingHit(s, {
    target: oppIdx,
    source: s.players.indexOf(player),
    cardName: 'Domain Collision',
    kind: 'rep',
    amount: -5,
    detail: `${player.name} swapped "${oppProj.name}" off you for "${playerProj.name}".`,
  });
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
  if (srcIdx !== tgtIdx) {
    recordIncomingHit(s, {
      target: srcIdx,
      source: tgtIdx,
      cardName,
      kind: 'people',
      amount: -1,
      detail: `${playerName} moved ${person.name} off your team.`,
    });
  }
  addLog(s, `${playerName} played "${cardName}" → moved ${person.name} from ${src.name} to ${tgt.name}.`);
  return { outcome: `Moved ${person.name}`, detail: `From ${src.name} to ${tgt.name}` };
}

function executeRequestHelp(player, s, oppIdx, projId, cardName) {
  const opp = s.players[oppIdx];
  const proj = opp.projects.find(p => p.id === projId);
  if (!proj || (proj.timeSpent || 0) <= 0) return { outcome: 'No progress to take', detail: '' };
  proj.timeSpent = Math.max(0, (proj.timeSpent || 0) - 1);
  recordIncomingHit(s, {
    target: oppIdx,
    source: s.players.indexOf(player),
    cardName,
    kind: 'progress',
    amount: -1,
    detail: `${player.name} took a quarter of progress off "${proj.name}".`,
  });
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
    const exempt = (s.quarterFlags.bonusProjectExempt || []).includes(s.players.indexOf(player));
    if (s.quarterFlags.noBonusProject && !exempt) {
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

/** Arms an EVENT shield. This is deliberately narrower than a reaction card:
 *  it absorbs the next Event drawn for you, not a play aimed at you by another
 *  player. Defensive Maneuver is the one card that covers both. */
function handleNegation(card, player, s) {
  player.shieldActive = (player.shieldActive || 0) + 1;
  player.shieldSource = card.name;
  addLog(s, `${player.name} played "${card.name}" → event shield ready.`);
  return { outcome: 'Event shield ready', detail: 'Negates the next Event card drawn for you. It does not stop a play aimed at you by another player.' };
}

function handleDiscardRecovery(card, player, s) {
  // Recover the most recent SKILL card — the shared discard also collects
  // spent Event/Rush Q/Layoff cards, which are useless (no-op) in hand.
  for (let i = s.discard.length - 1; i >= 0; i--) {
    if (s.discard[i].deck === 'Skill') {
      const recovered = s.discard.splice(i, 1)[0];
      player.hand.push(recovered);
      addLog(s, `${player.name} played "${card.name}" → recovered "${recovered.name}" from discard.`);
      return { outcome: `Recovered "${recovered.name}"`, detail: 'Card added back to hand' };
    }
  }
  addLog(s, `${player.name} played "${card.name}" (no skill cards in discard).`);
  return { outcome: 'Nothing to recover', detail: 'No Skill cards in the discard pile' };
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
  proj.techDebt = (proj.techDebt || 0) + 1;
  player.reputation -= 3;
  addLog(s, `${player.name} played "${card.name}" → +${boost} progress on "${proj.name}", −3 rep, +1 tech debt.`);
  return { outcome: `+${boost} burst progress on "${proj.name}"`, detail: `Counted as full team for 1 quarter. −3 rep (now ${player.reputation}); the shortcut left 1 tech debt behind` };
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
  // Taking a card out of another player's hand is a targeted play, so it opens
  // a window like the rest of the cluster.
  const forced = favorTarget
    ? await offerReaction(s, player, favorTarget, card, {
        stake: `${player.name} wants to trade ${other.name} for a Favor out of your hand.`,
      })
    : NO_REACTION;
  if (favorTarget && !forced.blocked) {
    const favorIdx = favorTarget.hand.findIndex(c => c.type === 'Favor');
    const favor = favorTarget.hand.splice(favorIdx, 1)[0];
    player.hand.push(favor);
    favorTarget.people.push(other);
    recordIncomingHit(s, {
      target: s.players.indexOf(favorTarget),
      source: s.players.indexOf(player),
      cardName: card.name,
      kind: 'trade',
      amount: 0,
      detail: `${player.name} traded ${other.name} for your Favor.`,
    });
    addLog(s, `${player.name} played "${card.name}" → kept ${kept.name}, gave ${other.name} to ${favorTarget.name} for a Favor.`);
    return {
      outcome: `Hired ${kept.name}, traded ${other.name} for a Favor`,
      detail: `${favorTarget.name} received ${other.name} and gave you their Favor.`,
    };
  } else if (favorTarget && forced.blocked) {
    s.discard.push(other);
    addLog(s, `${player.name} played "${card.name}" → kept ${kept.name}; ${favorTarget.name} refused the trade.`);
    return {
      outcome: `Hired ${kept.name}`,
      detail: `${favorTarget.name} countered the trade — ${other.name} discarded.`,
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
  const opponents = s.players.filter(p => p !== player);
  if (!opponents.length) {
    addLog(s, `${player.name} played "${card.name}" — no opponents to target.`);
    return { outcome: 'No targets', detail: 'No opponents available' };
  }

  // Card text: "Target player loses 10 reputation. Each use costs 5 more
  // reputation." — the escalating cost is actually charged (5, 10, 15, …),
  // and the counter only advances when the play resolves.
  const uses = (player.shiftTheBlameCount || 0) + 1;
  const cost = 5 * uses;
  const BLAME_DAMAGE = 10;

  const applyBlame = (target, mitigated = 0) => {
    const dealt = Math.max(0, BLAME_DAMAGE - mitigated);
    player.shiftTheBlameCount = uses;
    target.reputation -= dealt;
    player.reputation -= cost;
    recordIncomingHit(s, {
      target: s.players.indexOf(target),
      source: s.players.indexOf(player),
      cardName: card.name,
      kind: 'rep',
      amount: -dealt,
      detail: `${player.name} shifted the blame onto you.`,
    });
    return dealt;
  };

  const resolveAgainst = async (target) => {
    const react = await offerReaction(s, player, target, card, { repDamage: BLAME_DAMAGE });
    if (react.blocked) {
      return { outcome: 'Countered', detail: `${target.name} nullified the play` };
    }
    const dealt = applyBlame(target, react.mitigated);
    const soaked = react.mitigated ? `, ${react.mitigated} soaked` : '';
    addLog(s, `${player.name} played "${card.name}" → ${target.name} −${dealt} rep${soaked}; paid ${cost} rep.`);
    return {
      outcome: `${target.name} −${dealt} rep`,
      detail: `${player.isAI ? 'Paid' : 'You paid'} ${cost} rep (cost escalates 5 per use)${soaked}`,
    };
  };

  if (player.isAI) {
    return resolveAgainst(opponents.reduce((max, p) => p.reputation > max.reputation ? p : max));
  }

  const options = opponents.map(opp => ({
    label: opp.name,
    detail: `Current rep: ${opp.reputation} — costs you ${cost} rep`,
    action: 'shiftBlame',
    targetId: s.players.indexOf(opp),
  }));

  const choiceIdx = await showChoiceDialog(card, options);
  const chosen = options[choiceIdx];
  if (chosen) return resolveAgainst(s.players[chosen.targetId]);
  return { outcome: 'Cancelled', detail: 'No target selected' };
}

// ── Undermine Reputation ─────────────────────────────────────
// Printed: "Target player loses 5 reputation. You gain 3 reputation."
// It had no named handler, so it fell through to the `rep-loss` subcategory
// and `handleRepLoss`, which subtracts from the CASTER — and whose
// `/lose (\d+)/` regex misses "loses 5", so it charged the default 2. The card
// did the opposite of its text, at the wrong magnitude.

async function handleUndermineReputation(card, player, s) {
  const opponents = s.players.filter(p => p !== player);
  if (!opponents.length) {
    addLog(s, `${player.name} played "${card.name}" — no opponents to target.`);
    return { outcome: 'No targets', detail: 'No opponents available' };
  }
  const DAMAGE = 5;
  const GAIN = 3;

  const resolveAgainst = async (target) => {
    const react = await offerReaction(s, player, target, card, { repDamage: DAMAGE });
    if (react.blocked) {
      return { outcome: 'Countered', detail: `${target.name} nullified the play` };
    }
    const dealt = Math.max(0, DAMAGE - react.mitigated);
    target.reputation -= dealt;
    player.reputation += GAIN;
    recordIncomingHit(s, {
      target: s.players.indexOf(target),
      source: s.players.indexOf(player),
      cardName: card.name,
      kind: 'rep',
      amount: -dealt,
      detail: `${player.name} undermined you.`,
    });
    const soaked = react.mitigated ? `, ${react.mitigated} soaked` : '';
    addLog(s, `${player.name} played "${card.name}" → ${target.name} −${dealt} rep${soaked}; +${GAIN} rep.`);
    return { outcome: `${target.name} −${dealt} rep, you +${GAIN}`, detail: `Now at ${player.reputation} rep${soaked}` };
  };

  if (player.isAI) {
    return resolveAgainst(opponents.reduce((max, p) => p.reputation > max.reputation ? p : max));
  }

  const options = opponents.map(opp => ({
    label: opp.name,
    detail: `Current rep: ${opp.reputation} — they lose ${DAMAGE}, you gain ${GAIN}`,
    targetId: s.players.indexOf(opp),
  }));
  const choiceIdx = await showChoiceDialog(card, options);
  const chosen = options[choiceIdx];
  if (chosen) return resolveAgainst(s.players[chosen.targetId]);
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

  // Printed: "negate any card targeting you". One charge, spendable against
  // EITHER a play aimed at you (offered in the reaction window, so it is a
  // choice) or an Event drawn for you (resolveEvent falls back to it once the
  // ordinary event shields are spent). It arms `attackShield` only — the
  // event path reads that same charge, so it can never be spent twice.
  player.reputation -= 10;
  player.defensiveManeuverUsed = true;
  player.attackShield = (player.attackShield || 0) + 1;
  player.attackShieldSource = card.name;

  addLog(s, `${player.name} paid 10 rep for "${card.name}" → shield armed (one-time use).`);
  return { outcome: 'Shield armed', detail: 'Negates the next card targeting you — a rival\'s play or an Event. You choose when to spend it against a play.' };
}

// ── Cards that used to resolve as something unrelated ────────

/** Pull a Favor for `player`, matching the existing grant pattern in rules.js. */
function grantFavor(player, s) {
  const favorCard = s.decks.main.find(c => c.type === 'Favor');
  if (!favorCard) return false;
  s.decks.main = s.decks.main.filter(c => c !== favorCard);
  player.hand.push(favorCard);
  return true;
}

// Breakthrough — the printed text shipped with an unsubstituted "VAR"
// placeholder ("Advance every project by VAR quarter"), and resolved through
// the generic progress handler, advancing exactly one project by one.
async function handleBreakthrough(card, player, s) {
  const active = player.projects.filter(p => !p.isCompleted);
  if (!active.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects.`);
    return { outcome: 'No active projects', detail: 'Nothing to advance' };
  }
  for (const proj of active) proj.timeSpent = (proj.timeSpent || 0) + 1;

  const discarded = [];
  for (const opp of s.players) {
    if (opp === player || !opp.hand.length) continue;
    let lost;
    if (opp.isAI) {
      const sorted = [...opp.hand].sort((a, b) => (a.value || 0) - (b.value || 0));
      lost = sorted[0];
    } else {
      const options = opp.hand.map(c => ({
        label: `Discard "${c.name}"`,
        detail: `${c.type}${c.value ? ` — ${c.value}v` : ''}`,
        cardId: c.id,
      }));
      const idx = await showChoiceDialog(card, options, false, {
        heading: `${player.name}'s Breakthrough forces a discard`,
        note: 'Every player but the caster loses a card. Choose which.',
      });
      lost = opp.hand.find(c => c.id === (options[idx] || options[0]).cardId);
    }
    const li = opp.hand.indexOf(lost);
    if (li >= 0) {
      opp.hand.splice(li, 1);
      s.discard.push(lost);
      discarded.push(`${opp.name}: ${lost.name}`);
      recordIncomingHit(s, {
        target: s.players.indexOf(opp),
        source: s.players.indexOf(player),
        cardName: card.name,
        kind: 'discard',
        amount: -1,
        detail: `${player.name}'s Breakthrough cost you a card.`,
      });
    }
  }
  addLog(s, `${player.name} played "${card.name}" → +1 progress on ${active.length} project(s); ${discarded.length} opponent(s) discarded.`);
  return {
    outcome: `+1 progress on all ${active.length} of your projects`,
    detail: discarded.length ? `Discarded — ${discarded.join(', ')}` : 'No opponent had a card to lose',
  };
}

// Brainstorming — printed as a table-wide favour trade, resolved as a plain
// draw. Now it actually asks the other players.
async function handleBrainstorming(card, player, s) {
  const active = player.projects.filter(p => !p.isCompleted);
  if (!active.length) {
    addLog(s, `${player.name} played "${card.name}" — no active projects.`);
    return { outcome: 'No active projects', detail: 'Nothing to brainstorm about' };
  }
  let proj = active[0];
  if (!player.isAI && active.length > 1) {
    const options = active.map(p => ({
      label: `Brainstorm "${p.name}"`,
      detail: `Progress: ${p.timeSpent || 0}/${p.deadline || '?'}q`,
    }));
    proj = active[await showChoiceDialog(card, options)] || active[0];
  } else if (player.isAI) {
    proj = [...active].sort((a, b) =>
      ((a.deadline || 99) - (a.timeSpent || 0)) - ((b.deadline || 99) - (b.timeSpent || 0)))[0];
  }

  const helpers = [];
  for (const opp of s.players) {
    if (opp === player) continue;
    const hard = opp.hand.filter(c => c.type === 'Hard');
    if (!hard.length) continue;
    let helps;
    if (opp.isAI) {
      // Trade a spare Hard Skill for a Favor, but never the last one.
      helps = hard.length >= 2;
    } else {
      const idx = await showChoiceDialog(card, [
        { label: `Help — discard "${hard[0].name}"`, detail: 'You gain a Bonus Favor for helping' },
        { label: 'Stay out of it', detail: 'Keep your Hard Skill card' },
      ], false, {
        heading: `${player.name} is brainstorming "${proj.name}"`,
        note: 'Helping advances their project by 1 quarter and earns you a Bonus Favor.',
      });
      helps = idx === 0;
    }
    if (!helps) continue;
    const hi = opp.hand.indexOf(hard[0]);
    opp.hand.splice(hi, 1);
    s.discard.push(hard[0]);
    grantFavor(opp, s);
    helpers.push(opp.name);
  }

  proj.timeSpent = (proj.timeSpent || 0) + helpers.length;
  addLog(s, `${player.name} played "${card.name}" → ${helpers.length} helper(s), +${helpers.length} progress on "${proj.name}".`);
  return {
    outcome: helpers.length ? `+${helpers.length} progress on "${proj.name}"` : 'Nobody helped',
    detail: helpers.length ? `Helped by ${helpers.join(', ')} — each gained a Bonus Favor` : 'No opponent spent a Hard Skill card',
  };
}

// It's Show Time — printed as a 3-Favor menu, resolved as a flat +2 rep with
// no prompt and no Favor spent.
async function handleShowTime(card, player, s) {
  const favors = player.hand.filter(c => c.type === 'Favor');
  if (!favors.length) {
    addLog(s, `${player.name} played "${card.name}" — no Favors to spend.`);
    return { outcome: 'No Favors to spend', detail: 'This card needs at least 1 Favor in hand' };
  }
  const budget = Math.min(3, favors.length);
  const taken = [];
  const active = player.projects.filter(p => !p.isCompleted);

  for (let i = 0; i < budget; i++) {
    const options = [
      { label: 'Draw 1 card', detail: `Main deck: ${s.decks.main.length}`, action: 'draw' },
      { label: "Add 1 quarter to a project's deadline", detail: active.length ? `"${active[0].name}"` : 'No active project', disabled: !active.length, action: 'deadline' },
      { label: 'Arm an Event shield', detail: 'Negates the next Event drawn for you', action: 'shield' },
      { label: 'Stop here', detail: `Keep your remaining ${budget - i} Favor(s)`, action: 'stop' },
    ];
    let action;
    if (player.isAI) {
      action = active.length && i === 0 ? 'deadline' : 'draw';
    } else {
      action = (options[await showChoiceDialog(card, options)] || options[0]).action;
    }
    if (action === 'stop') break;

    const fav = player.hand.find(c => c.type === 'Favor');
    if (!fav) break;
    player.hand.splice(player.hand.indexOf(fav), 1);
    s.discard.push(fav);

    if (action === 'draw') {
      const c = drawCard(player);
      taken.push(c ? `drew ${c.name}` : 'deck empty');
    } else if (action === 'deadline' && active.length) {
      active[0].deadline = (active[0].deadline || 1) + 1;
      taken.push(`"${active[0].name}" deadline → ${active[0].deadline}q`);
    } else if (action === 'shield') {
      player.shieldActive = (player.shieldActive || 0) + 1;
      player.shieldSource = card.name;
      taken.push('armed an Event shield');
    }
  }

  if (!taken.length) {
    addLog(s, `${player.name} played "${card.name}" — spent nothing.`);
    return { outcome: 'Nothing spent', detail: 'You kept your Favors' };
  }
  addLog(s, `${player.name} played "${card.name}" → spent ${taken.length} Favor(s).`);
  return { outcome: `Spent ${taken.length} Favor(s)`, detail: taken.join(' · ') };
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
  'Undermine Reputation': handleUndermineReputation,
  'Defensive Maneuver': handleDefensiveManeuver,
  'Breakthrough': handleBreakthrough,
  'Brainstorming': handleBrainstorming,
  "It's Show Time": handleShowTime,
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
