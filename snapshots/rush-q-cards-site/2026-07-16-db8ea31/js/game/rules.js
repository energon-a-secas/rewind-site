// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Rules engine ─────────────────────────────────────────────
// Event resolution, Rush Q effects, layoff logic.
// Timing gates: cards with minQuarter are skipped if drawn too early.

import { addLog } from './state.js';
import { showChoiceDialog } from './render.js';
import { drawCard, getAssignedPeople } from './engine.js';

/** Draw from a deck, respecting timing gates. */
export function drawTimingGated(deck, discard, currentQuarter, maxRetries = 5) {
  for (let i = 0; i < maxRetries && deck.length; i++) {
    const card = deck.pop();
    if (card.minQuarter && card.minQuarter > currentQuarter) {
      discard.push(card);
      continue;
    }
    return card;
  }
  return deck.length ? deck.pop() : null;
}

/** Check if a card has interactive choices. */
function isChoiceCard(card) {
  const skill = (card.skill || '').toLowerCase();
  const et = (card.effectType || '').toLowerCase();
  return et.includes('choice') || skill.includes('choose one') || skill.includes('choose:');
}

/** Parse choice options from card skill text. Returns array of {label, detail}. */
function parseChoiceOptions(card, player) {
  const skill = card.skill || '';
  const name = (card.name || '').toLowerCase();

  // Skills Gap / Discipline Issues pattern:
  // "Choose one:\n- Pay 2 Hard\n- Pay 4 Soft\n- Pay 0 Power+Skill\n\nIf refuse, lose 15"
  if (skill.includes('Pay 2 points using Hard') || skill.includes('Pay 4 points using Hard')) {
    const hardCards = player.hand.filter(c => c.type === 'Hard');
    const softCards = player.hand.filter(c => c.type === 'Soft');
    const powerCards = player.hand.filter(c => c.type === 'Power');
    const skillCards = player.hand.filter(c => c.type === 'Soft' || c.type === 'Hard' || c.type === 'Power');
    const hardVal = hardCards.reduce((s, c) => s + (c.value || 0), 0);
    const softVal = softCards.reduce((s, c) => s + (c.value || 0), 0);

    const isHardFirst = skill.includes('Pay 2 points using Hard');
    const lowCost = isHardFirst ? 2 : 2;
    const highCost = isHardFirst ? 4 : 4;
    const lowType = isHardFirst ? 'Hard' : 'Soft';
    const highType = isHardFirst ? 'Soft' : 'Hard';
    const lowVal = isHardFirst ? hardVal : softVal;
    const highVal = isHardFirst ? softVal : hardVal;

    return [
      {
        label: `Pay ${isHardFirst ? 2 : 4} using ${lowType} Skill cards`,
        detail: `You have ${isHardFirst ? hardCards.length : softCards.length} ${lowType} cards (${lowVal} value)`,
        disabled: lowVal < (isHardFirst ? 2 : 4),
        action: 'payLow',
      },
      {
        label: `Pay ${isHardFirst ? 4 : 2} using ${highType} Skill cards`,
        detail: `You have ${isHardFirst ? softCards.length : hardCards.length} ${highType} cards (${highVal} value)`,
        disabled: highVal < (isHardFirst ? 4 : 2),
        action: 'payHigh',
      },
      {
        label: 'Pay 0 — discard a Power + any other Skill card',
        detail: `You have ${powerCards.length} Power and ${skillCards.length} total Skill cards`,
        disabled: powerCards.length < 1 || skillCards.length < 2,
        action: 'payPower',
      },
      {
        label: 'Refuse to pay — lose 15 reputation',
        detail: `Current reputation: ${player.reputation}`,
        disabled: false,
        action: 'refuse',
      },
    ];
  }

  // 1:1 Meetings: hold (skip play, +1 progress all) or skip (+2 penalty)
  if (name.includes('1:1 meeting')) {
    return [
      {
        label: 'Hold 1:1 Meetings',
        detail: 'Skip your play phase this turn. All your projects gain +1 progress.',
        action: 'hold11',
      },
      {
        label: 'Skip 1:1 Meetings',
        detail: '+2 penalty to all your projects next quarter.',
        action: 'skip11',
      },
    ];
  }

  // Angry Client: Discard 2 Soft or Lose 2 progress
  if (name.includes('angry client')) {
    const softCards = player.hand.filter(c => c.type === 'Soft');
    return [
      {
        label: 'Discard 2 Soft Skill cards',
        detail: `You have ${softCards.length} Soft cards`,
        disabled: softCards.length < 2,
        action: 'discardSoft',
      },
      {
        label: 'Lose 2 progress from a project',
        detail: 'Removes progress from your most advanced project',
        action: 'loseProgress',
      },
    ];
  }

  // Company Priorities: Discard 1 Project or lose 10 rep
  if (name.includes('company priorities')) {
    const activeProjs = player.projects.filter(p => !p.isCompleted);
    return [
      {
        label: 'Discard one active project',
        detail: activeProjs.length ? `Active: ${activeProjs.map(p => p.name).join(', ')}` : 'No active projects',
        disabled: activeProjs.length === 0,
        action: 'discardProject',
      },
      {
        label: 'Lose 10 reputation',
        detail: `Current reputation: ${player.reputation}`,
        action: 'loseRep10',
      },
    ];
  }

  // Attrition: fire highest-value from small team / fire lowest from large team
  if (name.includes('attrition')) {
    return [
      {
        label: 'Fire highest-value member from a project with 2 or fewer people',
        detail: 'Removes your best team member from the smallest project',
        action: 'fireHighest',
      },
      {
        label: 'Fire lowest-value member from a project with more than 2 people',
        detail: 'Removes your weakest team member from the largest project',
        action: 'fireLowest',
      },
    ];
  }

  // Promotion Cycle: promote (+2 progress, +1 favor) or decline (lose 2 rep)
  if (name.includes('promotion')) {
    return [
      {
        label: 'Promote a team member',
        detail: '+2 progress on their project and gain 1 Favor',
        action: 'promote',
      },
      {
        label: 'Decline all promotions',
        detail: 'Lose 2 reputation next quarter',
        action: 'declinePromote',
      },
    ];
  }

  // Project Freeze / Scope Creep with choices
  if (name.includes('scope creep') || name.includes('project freeze')) {
    return [
      {
        label: 'Accept the effect',
        detail: 'Your largest project cannot progress this quarter',
        action: 'acceptFreeze',
      },
    ];
  }

  // Restructuring: Discard project or discard 1 card
  if (name.includes('restructuring') || skill.includes('drop/discard a project or discard one card')) {
    const activeProjs = player.projects.filter(p => !p.isCompleted);
    return [
      {
        label: 'Discard an active project',
        detail: activeProjs.length ? `Active: ${activeProjs.map(p => p.name).join(', ')}` : 'No active projects',
        disabled: activeProjs.length === 0,
        action: 'discardProject',
      },
      {
        label: 'Discard 1 card from your hand',
        detail: `Hand size: ${player.hand.length}`,
        disabled: player.hand.length === 0,
        action: 'discardHand1',
      },
    ];
  }

  // High-Performer Hostage: sabbatical or quit
  if (name.includes('hostage') || name.includes('High-Performer')) {
    return [
      {
        label: 'Give 2-quarter sabbatical',
        detail: 'Lose the team member temporarily (returns in 2 quarters)',
        action: 'hostageSabbatical',
      },
      {
        label: 'Work them harder (they quit)',
        detail: 'They gain 3 break tokens and leave the company',
        action: 'hostageTripleBreak',
      },
    ];
  }

  // Ethical Corner-Case: fix now or defer
  if (name.includes('ethical') || name.includes('privacy')) {
    return [
      {
        label: 'Fix the privacy issue now',
        detail: '-5 reputation, +1 Favor',
        action: 'ethicalFixNow',
      },
      {
        label: 'Defer the fix',
        detail: 'Risk -15 rep next quarter + 30% audit chance',
        action: 'ethicalDefer',
      },
    ];
  }

  // Generic fallback for any "choose" card
  return [
    {
      label: 'Accept the effect',
      detail: skill.slice(0, 100),
      action: 'acceptGeneric',
    },
  ];
}

/** Execute a choice action. Returns {outcome, detail}. */
function executeChoice(action, card, player, s) {
  switch (action) {
    case 'payLow': {
      const isHardFirst = (card.skill || '').includes('Pay 2 points using Hard');
      const type = isHardFirst ? 'Hard' : 'Soft';
      const cost = isHardFirst ? 2 : 2;
      return payWithType(player, s, type, cost);
    }
    case 'payHigh': {
      const isHardFirst = (card.skill || '').includes('Pay 2 points using Hard');
      const type = isHardFirst ? 'Soft' : 'Hard';
      const cost = isHardFirst ? 4 : 4;
      return payWithType(player, s, type, cost);
    }
    case 'payPower': {
      const powerCards = player.hand.filter(c => c.type === 'Power');
      const otherSkill = player.hand.filter(c => (c.type === 'Soft' || c.type === 'Hard' || c.type === 'Power') && c !== powerCards[0]);
      const removed = [];
      if (powerCards.length) {
        const idx = player.hand.indexOf(powerCards[0]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(powerCards[0].name); }
      }
      if (otherSkill.length) {
        const idx = player.hand.indexOf(otherSkill[0]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(otherSkill[0].name); }
      }
      addLog(s, `${player.name} paid with Power + Skill cards for "${card.name}".`);
      return { outcome: 'Paid with Power + Skill cards', detail: `Discarded: ${removed.join(', ')}` };
    }
    case 'refuse': {
      player.reputation -= 15;
      addLog(s, `${player.name} refused to pay for "${card.name}" → −15 rep.`);
      return { outcome: '−15 reputation', detail: `Refused to pay. Now at ${player.reputation} rep` };
    }
    case 'hold11': {
      for (const proj of player.projects) {
        if (!proj.isCompleted) proj.timeSpent = (proj.timeSpent || 0) + 1;
      }
      addLog(s, `${player.name} held 1:1 meetings → +1 progress to all projects.`);
      return { outcome: '+1 progress to all projects', detail: 'Play phase skipped this turn' };
    }
    case 'skip11': {
      player.reputation -= 2;
      addLog(s, `${player.name} skipped 1:1 meetings → −2 rep.`);
      return { outcome: '−2 reputation', detail: 'Skipped 1:1s, team morale drops' };
    }
    case 'discardSoft': {
      const softCards = player.hand.filter(c => c.type === 'Soft');
      const removed = [];
      for (let i = 0; i < 2 && softCards.length > i; i++) {
        const idx = player.hand.indexOf(softCards[i]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(softCards[i].name); }
      }
      addLog(s, `${player.name} discarded 2 Soft cards for "${card.name}".`);
      return { outcome: 'Discarded 2 Soft Skill cards', detail: `Lost: ${removed.join(', ')}` };
    }
    case 'loseProgress': {
      const active = player.projects.filter(p => !p.isCompleted).sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
      if (active.length) {
        active[0].timeSpent = Math.max(0, (active[0].timeSpent || 0) - 2);
        addLog(s, `${player.name} lost 2 progress on "${active[0].name}".`);
        return { outcome: `−2 progress on "${active[0].name}"`, detail: `Progress now: ${active[0].timeSpent}/${active[0].deadline || '?'}` };
      }
      return { outcome: 'No active projects', detail: 'No progress to lose' };
    }
    case 'discardProject': {
      const active = player.projects.filter(p => !p.isCompleted);
      if (active.length) {
        const proj = active[active.length - 1];
        const idx = player.projects.indexOf(proj);
        if (idx >= 0) {
          delete player.assignments[proj.id];
          s.discard.push(player.projects.splice(idx, 1)[0]);
          addLog(s, `${player.name} discarded project "${proj.name}".`);
          return { outcome: `Discarded project "${proj.name}"`, detail: 'Project removed from board' };
        }
      }
      return { outcome: 'No projects to discard', detail: '' };
    }
    case 'loseRep10': {
      player.reputation -= 10;
      addLog(s, `${player.name} chose to lose 10 rep for "${card.name}".`);
      return { outcome: '−10 reputation', detail: `Now at ${player.reputation} rep` };
    }
    case 'fireHighest': {
      for (const proj of player.projects) {
        if (proj.isCompleted) continue;
        const assigned = (player.assignments[proj.id] || []);
        if (assigned.length > 0 && assigned.length <= 2) {
          const people = assigned.map(id => player.people.find(p => p.id === id)).filter(Boolean);
          const highest = people.sort((a, b) => (b.value || 0) - (a.value || 0))[0];
          if (highest) {
            player.assignments[proj.id] = assigned.filter(id => id !== highest.id);
            const pIdx = player.people.indexOf(highest);
            if (pIdx >= 0) { s.discard.push(player.people.splice(pIdx, 1)[0]); }
            addLog(s, `${player.name} fired ${highest.name} from "${proj.name}".`);
            return { outcome: `Fired ${highest.name}`, detail: `Removed from "${proj.name}"` };
          }
        }
      }
      addLog(s, `${player.name}: no eligible project for attrition.`);
      return { outcome: 'No eligible project', detail: 'No project with 2 or fewer people' };
    }
    case 'fireLowest': {
      for (const proj of player.projects) {
        if (proj.isCompleted) continue;
        const assigned = (player.assignments[proj.id] || []);
        if (assigned.length > 2) {
          const people = assigned.map(id => player.people.find(p => p.id === id)).filter(Boolean);
          const lowest = people.sort((a, b) => (a.value || 0) - (b.value || 0))[0];
          if (lowest) {
            player.assignments[proj.id] = assigned.filter(id => id !== lowest.id);
            const pIdx = player.people.indexOf(lowest);
            if (pIdx >= 0) { s.discard.push(player.people.splice(pIdx, 1)[0]); }
            addLog(s, `${player.name} fired ${lowest.name} from "${proj.name}".`);
            return { outcome: `Fired ${lowest.name}`, detail: `Removed from "${proj.name}"` };
          }
        }
      }
      addLog(s, `${player.name}: no project with >2 people for attrition.`);
      return { outcome: 'No eligible project', detail: 'No project with more than 2 people' };
    }
    case 'promote': {
      const active = player.projects.filter(p => !p.isCompleted);
      if (active.length) {
        active[0].timeSpent = (active[0].timeSpent || 0) + 2;
        // Draw a Favor card
        const favorCard = s.decks.main.find(c => c.type === 'Favor') || s.decks.main.pop();
        if (favorCard) {
          player.hand.push(favorCard);
          s.decks.main = s.decks.main.filter(c => c !== favorCard);
          addLog(s, `${player.name} promoted a team member → +2 progress on "${active[0].name}", gained 1 Favor.`);
          return { outcome: `+2 progress on "${active[0].name}", +1 Favor`, detail: 'Promotion approved and rewarded' };
        } else {
          addLog(s, `${player.name} promoted a team member → +2 progress on "${active[0].name}" (no Favors left in deck).`);
          return { outcome: `+2 progress on "${active[0].name}"`, detail: 'Promotion approved but no Favors available' };
        }
      }
      return { outcome: 'No active projects', detail: 'Promotion had no effect' };
    }
    case 'declinePromote': {
      player.reputation -= 2;
      addLog(s, `${player.name} declined promotions → −2 rep.`);
      return { outcome: '−2 reputation', detail: 'Team morale drops from no promotions' };
    }
    case 'acceptFreeze': {
      const active = player.projects.filter(p => !p.isCompleted)
        .sort((a, b) => {
          const aAssigned = (player.assignments[a.id] || []).length;
          const bAssigned = (player.assignments[b.id] || []).length;
          return bAssigned - aAssigned;
        });
      if (active.length) {
        active[0].timeSpent = Math.max(0, (active[0].timeSpent || 0) - 1);
        addLog(s, `${player.name}'s project "${active[0].name}" frozen for this quarter.`);
        return { outcome: `"${active[0].name}" frozen`, detail: 'Cannot progress this quarter' };
      }
      return { outcome: 'No projects to freeze', detail: '' };
    }
    case 'discardHand1': {
      if (player.hand.length) {
        const c = player.hand.pop();
        s.discard.push(c);
        addLog(s, `${player.name} discarded "${c.name}" from hand.`);
        return { outcome: `Discarded "${c.name}"`, detail: 'Card removed from hand' };
      }
      return { outcome: 'No cards to discard', detail: '' };
    }
    // ── Phase B choice actions ──────────────────────────────
    case 'skipLevelAccept': {
      const active = player.projects.filter(p => !p.isCompleted);
      if (active.length) {
        const proj = active[active.length - 1]; // discard last project
        const idx = player.projects.indexOf(proj);
        if (idx >= 0) {
          delete player.assignments[proj.id];
          s.discard.push(player.projects.splice(idx, 1)[0]);
        }
        player.reputation += 10;
        addLog(s, `Skip-Level Surprise → ${player.name} discarded "${proj.name}" for +10 rep.`);
        return { outcome: `+10 rep, discarded "${proj.name}"`, detail: `Now at ${player.reputation} rep` };
      }
      return { outcome: 'No projects to discard', detail: '' };
    }
    case 'skipLevelDecline': {
      player.reputation -= 5;
      addLog(s, `Skip-Level Surprise → ${player.name} declined, −5 rep.`);
      return { outcome: '−5 reputation', detail: `Now at ${player.reputation} rep` };
    }
    case 'reorgUnassign': {
      for (const projId of Object.keys(player.assignments)) {
        player.assignments[projId] = [];
      }
      addLog(s, `Team Reorg → ${player.name} unassigned all people.`);
      return { outcome: 'All people unassigned', detail: 'Everyone returns to available pool' };
    }
    case 'reorgPay': {
      player.reputation -= 10;
      addLog(s, `Team Reorg → ${player.name} paid 10 rep to nullify.`);
      return { outcome: '−10 reputation', detail: `Paid to keep assignments. Now at ${player.reputation} rep` };
    }
    case 'crPayHard': {
      const hardCards = player.hand.filter(c => c.type === 'Hard');
      const removed = [];
      for (let i = 0; i < 3 && hardCards[i]; i++) {
        const idx = player.hand.indexOf(hardCards[i]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(hardCards[i].name); }
      }
      // +10 progress to project with most talent
      const active = player.projects.filter(p => !p.isCompleted);
      if (active.length) {
        const proj = active.sort((a, b) => (player.assignments[b.id] || []).length - (player.assignments[a.id] || []).length)[0];
        proj.timeSpent = (proj.timeSpent || 0) + 10;
        addLog(s, `Changing Requirements → ${player.name} paid 3 Hard cards, +10 progress on "${proj.name}".`);
        return { outcome: `+10 progress on "${proj.name}"`, detail: `Discarded: ${removed.join(', ')}` };
      }
      addLog(s, `Changing Requirements → ${player.name} paid 3 Hard cards.`);
      return { outcome: 'Paid 3 Hard cards', detail: `Discarded: ${removed.join(', ')}` };
    }
    case 'crPaySoft': {
      const softCards = player.hand.filter(c => c.type === 'Soft');
      const removed = [];
      for (let i = 0; i < 3 && softCards[i]; i++) {
        const idx = player.hand.indexOf(softCards[i]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(softCards[i].name); }
      }
      const active = player.projects.filter(p => !p.isCompleted);
      if (active.length) {
        const proj = active.sort((a, b) => (player.assignments[b.id] || []).length - (player.assignments[a.id] || []).length)[0];
        proj.timeSpent = (proj.timeSpent || 0) + 7;
        addLog(s, `Changing Requirements → ${player.name} paid 3 Soft cards, +7 progress on "${proj.name}".`);
        return { outcome: `+7 progress on "${proj.name}"`, detail: `Discarded: ${removed.join(', ')}` };
      }
      addLog(s, `Changing Requirements → ${player.name} paid 3 Soft cards.`);
      return { outcome: 'Paid 3 Soft cards', detail: `Discarded: ${removed.join(', ')}` };
    }
    case 'crPayPower': {
      const powerCards = player.hand.filter(c => c.type === 'Power');
      const otherSkill = player.hand.filter(c => (c.type === 'Soft' || c.type === 'Hard' || c.type === 'Power') && c !== powerCards[0]);
      const removed = [];
      if (powerCards.length) {
        const idx = player.hand.indexOf(powerCards[0]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(powerCards[0].name); }
      }
      if (otherSkill.length) {
        const idx = player.hand.indexOf(otherSkill[0]);
        if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); removed.push(otherSkill[0].name); }
      }
      addLog(s, `Changing Requirements → ${player.name} paid Power + Skill (no progress gained).`);
      return { outcome: 'Paid Power + Skill (0 progress)', detail: `Discarded: ${removed.join(', ')}` };
    }
    case 'crRefuse': {
      player.reputation -= 20;
      addLog(s, `Changing Requirements → ${player.name} refused, −20 rep.`);
      return { outcome: '−20 reputation', detail: `Now at ${player.reputation} rep` };
    }
    case 'hiringPay': {
      player.reputation -= 5;
      if (s.decks.forHire.length) {
        const hired = s.decks.forHire.pop();
        player.people.push(hired);
        addLog(s, `Hiring → ${player.name} paid 5 rep, hired ${hired.name}.`);
        return { outcome: `Hired ${hired.name}`, detail: `Paid 5 rep. Now at ${player.reputation} rep` };
      }
      addLog(s, `Hiring → ${player.name} paid 5 rep but no talent available.`);
      return { outcome: 'Paid 5 rep, no talent available', detail: 'For Hire deck is empty' };
    }
    case 'hiringDecline': {
      addLog(s, `Hiring → ${player.name} declined.`);
      return { outcome: 'Declined hire', detail: 'No cost, no benefit' };
    }
    case 'hostageSabbatical': {
      // Find highest-value person
      let bestPerson = null, bestVal = -1;
      for (const person of player.people) {
        if ((person.value || 0) > bestVal) {
          bestVal = person.value || 0;
          bestPerson = person;
        }
      }
      if (bestPerson) {
        // Remove from assignments and person list
        for (const projId of Object.keys(player.assignments)) {
          player.assignments[projId] = (player.assignments[projId] || []).filter(id => id !== bestPerson.id);
        }
        const idx = player.people.indexOf(bestPerson);
        if (idx >= 0) s.discard.push(player.people.splice(idx, 1)[0]);
        addLog(s, `${player.name} gave ${bestPerson.name} a 2-quarter sabbatical.`);
        return { outcome: `2-quarter sabbatical for ${bestPerson.name}`, detail: 'High performer will return in Q+2' };
      }
      return { outcome: 'No high performer', detail: 'No effect' };
    }
    case 'hostageTripleBreak': {
      // Find highest-value person
      let bestPerson = null, bestVal = -1;
      for (const person of player.people) {
        if ((person.value || 0) > bestVal) {
          bestVal = person.value || 0;
          bestPerson = person;
        }
      }
      if (bestPerson) {
        bestPerson.breakTokens = (bestPerson.breakTokens || 0) + 3;
        // Remove from assignments and person list
        for (const projId of Object.keys(player.assignments)) {
          player.assignments[projId] = (player.assignments[projId] || []).filter(id => id !== bestPerson.id);
        }
        const idx = player.people.indexOf(bestPerson);
        if (idx >= 0) s.discard.push(player.people.splice(idx, 1)[0]);
        addLog(s, `${bestPerson.name} quit after being overworked (3 break tokens).`);
        return { outcome: `${bestPerson.name} quit`, detail: 'High performer left due to burnout' };
      }
      return { outcome: 'No high performer', detail: 'No effect' };
    }
    case 'ethicalFixNow': {
      player.reputation = Math.max(0, player.reputation - 5);
      // Draw a Favor card if available
      const favorCard = s.decks.main.find(c => c.type === 'Favor');
      if (favorCard) {
        player.hand.push(favorCard);
        s.decks.main = s.decks.main.filter(c => c !== favorCard);
      }
      addLog(s, `${player.name} fixed privacy issue now → -5 rep, +1 Favor.`);
      return { outcome: '-5 reputation, +1 Favor', detail: 'Privacy issue resolved immediately' };
    }
    case 'ethicalDefer': {
      // Add pending effect for next quarter
      if (!player.pendingEffects) player.pendingEffects = [];
      player.pendingEffects.push({
        type: 'deferredPrivacyViolation',
        activateQuarter: s.currentQuarter + 1,
        sourceCardName: card.name,
        penalty: 15,
        auditChance: 0.3
      });
      addLog(s, `${player.name} deferred privacy fix → risk -15 rep next quarter + audit.`);
      return { outcome: 'Deferred (risky)', detail: 'May face -15 rep and regulatory audit next quarter' };
    }
    case 'stealHalfCredit': {
      // This will be handled at card play time, not choice time
      addLog(s, `${player.name} will appropriate credit from target's completed project.`);
      return { outcome: 'Credit appropriation ready', detail: 'Choose opponent and project next' };
    }
    default:
      addLog(s, `${player.name} accepted "${card.name}" effect.`);
      return { outcome: `Accepted "${card.name}"`, detail: card.skill || '' };
  }
}

/** Helper: pay cost using cards of a specific type. */
function payWithType(player, s, type, cost) {
  const cards = player.hand.filter(c => c.type === type).sort((a, b) => (a.value || 0) - (b.value || 0));
  let remaining = cost;
  const removed = [];
  for (const card of cards) {
    if (remaining <= 0) break;
    const idx = player.hand.indexOf(card);
    if (idx >= 0) {
      player.hand.splice(idx, 1);
      s.discard.push(card);
      remaining -= (card.value || 0);
      removed.push(card.name);
    }
  }
  addLog(s, `${player.name} paid ${cost} with ${type} Skill cards.`);
  return { outcome: `Paid ${cost} using ${type} cards`, detail: `Discarded: ${removed.join(', ')}` };
}

/** Resolve a Team Event card. Async for human player choices. Returns {outcome, detail}. */
export async function resolveEvent(card, player, s) {
  const name = card.name || '';
  const skill = (card.skill || '').toLowerCase();

  // Foresight immunity: Check if player has foresight immunity active
  const foresightIdx = (player.pendingEffects || []).findIndex(e => e.type === 'foresightImmunity');
  if (foresightIdx >= 0) {
    // Check if this event should break immunity
    if (name === 'Company Priorities' || name === 'Team Reorg') {
      // Remove the foresight effect
      const removedEffect = player.pendingEffects.splice(foresightIdx, 1)[0];
      addLog(s, `${player.name}'s Foresight immunity broken by "${name}"!`);
      // Log the removal but continue with event resolution
    } else {
      // Player is immune to this event
      addLog(s, `${player.name} immune to "${name}" (Foresight).`);
      return { outcome: 'Immune (Foresight)', detail: 'No effect due to foresight' };
    }
  }

  // Check if this is a choice card for human player
  if (!player.isAI && isChoiceCard(card)) {
    const options = parseChoiceOptions(card, player);
    const choiceIdx = await showChoiceDialog(card, options);
    const chosen = options[choiceIdx];
    if (chosen) {
      return executeChoice(chosen.action, card, player, s);
    }
  }

  // AI choice handling — pick best available option
  if (player.isAI && isChoiceCard(card)) {
    return resolveAiChoice(card, player, s);
  }

  // ── Name-based auto-resolve (Phase A) ──────────────────────

  // Executive Review: +3 rep if total progress >50%, else -3
  if (name === 'Executive Review') {
    let totalProgress = 0, totalDeadline = 0;
    for (const proj of player.projects) {
      if (!proj.isCompleted && (proj.deadline || 0) > 0) {
        totalProgress += (proj.timeSpent || 0);
        totalDeadline += (proj.deadline || 0);
      }
    }
    const pct = totalDeadline > 0 ? totalProgress / totalDeadline : 0;
    if (pct > 0.5) {
      player.reputation += 3;
      addLog(s, `Executive Review → ${player.name} impressed (+3 rep). Progress at ${Math.round(pct * 100)}%.`);
      return { outcome: '+3 reputation', detail: `Progress at ${Math.round(pct * 100)}% — above 50%` };
    } else {
      player.reputation -= 3;
      addLog(s, `Executive Review → ${player.name} underperforming (−3 rep). Progress at ${Math.round(pct * 100)}%.`);
      return { outcome: '−3 reputation', detail: `Progress at ${Math.round(pct * 100)}% — below 50%` };
    }
  }

  // Knowledge Silo: highest-value person quits, project progress reset
  if (name === 'Knowledge Silo') {
    // Check for Documentation or Pair Programming card in hand (negation)
    const docIdx = player.hand.findIndex(c => (c.name || '').toLowerCase().includes('documentation'));
    const pairIdx = player.hand.findIndex(c => c.name === 'Pair Programming');
    if (docIdx >= 0) {
      const docCard = player.hand.splice(docIdx, 1)[0];
      s.discard.push(docCard);
      addLog(s, `${player.name} negated Knowledge Silo with "${docCard.name}".`);
      return { outcome: 'Negated!', detail: `Used "${docCard.name}" to prevent knowledge loss` };
    } else if (pairIdx >= 0) {
      const pairCard = player.hand.splice(pairIdx, 1)[0];
      s.discard.push(pairCard);
      addLog(s, `${player.name} negated Knowledge Silo with "${pairCard.name}" (knowledge shared).`);
      return { outcome: 'Negated!', detail: `Used "${pairCard.name}" to prevent knowledge loss` };
    }

    // Check for Favor to retain some knowledge
    const favor = player.hand.find(c => c.type === 'Favor');
    if (favor) {
      const favorIdx = player.hand.indexOf(favor);
      s.discard.push(player.hand.splice(favorIdx, 1)[0]);
      addLog(s, `${player.name} spent 1 Favor to retain 50% knowledge (no progress loss).`);
      return { outcome: 'Knowledge retained with Favor', detail: 'Spent 1 Favor to prevent progress reset' };
    }

    // Find highest-value person
    let bestPerson = null, bestVal = -1, bestProjId = null;
    for (const [projId, ids] of Object.entries(player.assignments)) {
      for (const pid of ids) {
        const person = player.people.find(p => p.id === pid);
        if (person && (person.value || 0) > bestVal) {
          bestVal = person.value || 0;
          bestPerson = person;
          bestProjId = projId;
        }
      }
    }
    if (!bestPerson && player.people.length) {
      bestPerson = player.people.reduce((a, b) => (b.value || 0) > (a.value || 0) ? b : a);
    }
    if (bestPerson) {
      // Remove from assignments
      for (const projId of Object.keys(player.assignments)) {
        player.assignments[projId] = (player.assignments[projId] || []).filter(id => id !== bestPerson.id);
      }
      // Reset progress on their project
      if (bestProjId) {
        const proj = player.projects.find(p => p.id === bestProjId);
        if (proj && !proj.isCompleted) {
          proj.timeSpent = 0;
          addLog(s, `Progress reset on "${proj.name}" due to knowledge loss.`);
        }
      }
      const pIdx = player.people.indexOf(bestPerson);
      if (pIdx >= 0) { s.discard.push(player.people.splice(pIdx, 1)[0]); }
      addLog(s, `Knowledge Silo → ${player.name} lost ${bestPerson.name}.`);
      return { outcome: `${bestPerson.name} quit`, detail: 'Highest-value member left. Project progress reset.' };
    }
    addLog(s, `Knowledge Silo → ${player.name} had no team members.`);
    return { outcome: 'No team members', detail: 'No one to lose' };
  }

  // Production Outage: all projects don't progress this quarter
  if (name === 'Production Outage') {
    const playerIdx = s.players.indexOf(player);
    if (!s.quarterFlags.frozenProjects.includes(playerIdx)) {
      s.quarterFlags.frozenProjects.push(playerIdx);
    }
    addLog(s, `Production Outage → ${player.name}'s projects frozen this quarter.`);
    return { outcome: 'All projects frozen', detail: 'No progress this quarter — everyone is on incident response' };
  }

  // Meeting Overload: each person produces 1 less progress (reduce timeSpent at quarter end)
  if (name === 'Meeting Overload') {
    // Reduce progress on each active project by number of assigned people (each produces 1 less)
    let totalReduced = 0;
    for (const proj of player.projects) {
      if (proj.isCompleted) continue;
      const assigned = getAssignedPeople(player, proj.id);
      if (assigned.length > 0) {
        const reduction = assigned.length; // each person produces 1 less
        proj.timeSpent = Math.max(0, (proj.timeSpent || 0) - reduction);
        totalReduced += reduction;
      }
    }
    addLog(s, `Meeting Overload → ${player.name}'s team lost ${totalReduced} progress to meetings.`);
    return { outcome: `−${totalReduced} total progress`, detail: 'Each team member produced 1 less this quarter' };
  }

  // OKR Alignment: reassign highest-level person to lowest-value project
  if (name === 'OKR Alignment') {
    // Find highest-value assigned person
    let bestPerson = null, bestVal = -1, fromProjId = null;
    for (const [projId, ids] of Object.entries(player.assignments)) {
      for (const pid of ids) {
        const person = player.people.find(p => p.id === pid);
        if (person && (person.value || 0) > bestVal) {
          bestVal = person.value || 0;
          bestPerson = person;
          fromProjId = projId;
        }
      }
    }
    // Find lowest-value active project
    const activeProjs = player.projects.filter(p => !p.isCompleted);
    const lowestProj = activeProjs.sort((a, b) => (a.reward || 0) - (b.reward || 0))[0];

    if (bestPerson && lowestProj && fromProjId !== lowestProj.id) {
      // Unassign from current
      player.assignments[fromProjId] = (player.assignments[fromProjId] || []).filter(id => id !== bestPerson.id);
      // Assign to lowest
      if (!player.assignments[lowestProj.id]) player.assignments[lowestProj.id] = [];
      player.assignments[lowestProj.id].push(bestPerson.id);
      addLog(s, `OKR Alignment → ${player.name} moved ${bestPerson.name} to "${lowestProj.name}".`);
      return { outcome: `${bestPerson.name} reassigned`, detail: `Moved to lowest-priority project "${lowestProj.name}"` };
    }
    addLog(s, `OKR Alignment → ${player.name} no reassignment needed.`);
    return { outcome: 'No reassignment', detail: 'No eligible person or project for OKR shift' };
  }

  // Uncertainty: unassigned people can't be assigned this quarter
  if (name === 'Uncertainty') {
    const playerIdx = s.players.indexOf(player);
    if (!s.quarterFlags.noAssign.includes(playerIdx)) {
      s.quarterFlags.noAssign.push(playerIdx);
    }
    addLog(s, `Uncertainty → ${player.name} cannot assign new people this quarter.`);
    return { outcome: 'Assignment frozen', detail: 'Unassigned talent cannot be assigned until next quarter' };
  }

  // ── Name-based choice handlers (Phase B) ──────────────────

  // Skip-Level Surprise: discard project +10 rep, or decline -5 rep
  if (name === 'Skip-Level Surprise') {
    const activeProjs = player.projects.filter(p => !p.isCompleted);
    if (!player.isAI) {
      const options = [
        { label: 'Discard an active project → +10 rep', detail: activeProjs.length ? `Active: ${activeProjs.map(p => p.name).join(', ')}` : 'No active projects', disabled: activeProjs.length === 0, action: 'skipLevelAccept' },
        { label: 'Decline the meeting → −5 rep', detail: `Current rep: ${player.reputation}`, action: 'skipLevelDecline' },
      ];
      const choiceIdx = await showChoiceDialog(card, options);
      return executeChoice(options[choiceIdx].action, card, player, s);
    }
    // AI: accept if has projects to spare
    return executeChoice(activeProjs.length > 1 ? 'skipLevelAccept' : 'skipLevelDecline', card, player, s);
  }

  // Team Reorg: unassign all people or pay 10 rep
  if (name === 'Team Reorg') {
    if (!player.isAI) {
      const options = [
        { label: 'Unassign all people from projects', detail: 'Everyone goes back to available pool', action: 'reorgUnassign' },
        { label: 'Pay 10 reputation to nullify', detail: `Current rep: ${player.reputation}`, disabled: player.reputation < 10, action: 'reorgPay' },
      ];
      const choiceIdx = await showChoiceDialog(card, options);
      return executeChoice(options[choiceIdx].action, card, player, s);
    }
    // AI: pay if rep > 20
    return executeChoice(player.reputation > 20 ? 'reorgPay' : 'reorgUnassign', card, player, s);
  }

  // Failed Release: freeze project with most people
  if (name === 'Failed Release') {
    const activeProjs = player.projects.filter(p => !p.isCompleted);
    const sorted = activeProjs.sort((a, b) => {
      const aCount = (player.assignments[a.id] || []).length;
      const bCount = (player.assignments[b.id] || []).length;
      return bCount - aCount;
    });
    if (sorted.length) {
      const proj = sorted[0];
      proj.timeSpent = Math.max(0, (proj.timeSpent || 0) - (player.assignments[proj.id] || []).length);
      addLog(s, `Failed Release → "${proj.name}" frozen this quarter.`);
      return { outcome: `"${proj.name}" frozen`, detail: 'Project with most people cannot progress' };
    }
    return { outcome: 'No active projects', detail: 'Nothing to freeze' };
  }

  // Missing Story Points: choose 1 assigned person to unassign
  if (name === 'Missing Story Points') {
    // Find all assigned people
    const assignedPeople = [];
    for (const [projId, ids] of Object.entries(player.assignments)) {
      for (const pid of ids) {
        const person = player.people.find(p => p.id === pid);
        if (person) assignedPeople.push({ person, projId });
      }
    }
    if (!assignedPeople.length) {
      addLog(s, `Missing Story Points → ${player.name} has no assigned people.`);
      return { outcome: 'No assigned people', detail: 'Nothing to unassign' };
    }
    if (!player.isAI) {
      const options = assignedPeople.map(({ person, projId }) => {
        const proj = player.projects.find(p => p.id === projId);
        return { label: `Unassign ${person.name}`, detail: `From "${proj ? proj.name : 'project'}"`, action: 'unassignPerson', personId: person.id, projId };
      });
      const choiceIdx = await showChoiceDialog(card, options);
      const chosen = options[choiceIdx];
      player.assignments[chosen.projId] = (player.assignments[chosen.projId] || []).filter(id => id !== chosen.personId);
      addLog(s, `${player.name} unassigned ${chosen.label.replace('Unassign ', '')} due to Missing Story Points.`);
      return { outcome: chosen.label, detail: chosen.detail };
    }
    // AI: unassign lowest-value person
    const lowest = assignedPeople.sort((a, b) => (a.person.value || 0) - (b.person.value || 0))[0];
    player.assignments[lowest.projId] = (player.assignments[lowest.projId] || []).filter(id => id !== lowest.person.id);
    addLog(s, `${player.name} unassigned ${lowest.person.name} due to Missing Story Points.`);
    return { outcome: `Unassigned ${lowest.person.name}`, detail: 'Lowest-value person removed from project' };
  }

  // Changing Requirements: pay cards or lose 20 rep (similar to Skills Gap)
  if (name === 'Changing Requirements') {
    const hardCards = player.hand.filter(c => c.type === 'Hard');
    const softCards = player.hand.filter(c => c.type === 'Soft');
    const powerCards = player.hand.filter(c => c.type === 'Power');
    if (!player.isAI) {
      const options = [
        { label: 'Discard 3 Hard Skill cards → +10 progress', detail: `You have ${hardCards.length} Hard cards`, disabled: hardCards.length < 3, action: 'crPayHard' },
        { label: 'Discard 3 Soft Skill cards → +7 progress', detail: `You have ${softCards.length} Soft cards`, disabled: softCards.length < 3, action: 'crPaySoft' },
        { label: 'Discard Power + any Skill → +0 progress', detail: `You have ${powerCards.length} Power cards`, disabled: powerCards.length < 1 || (hardCards.length + softCards.length + powerCards.length) < 2, action: 'crPayPower' },
        { label: 'Refuse to pay → −20 reputation', detail: `Current rep: ${player.reputation}`, action: 'crRefuse' },
      ];
      const choiceIdx = await showChoiceDialog(card, options);
      return executeChoice(options[choiceIdx].action, card, player, s);
    }
    // AI: try cheapest option
    if (powerCards.length >= 1 && (hardCards.length + softCards.length + powerCards.length) >= 2) {
      return executeChoice('crPayPower', card, player, s);
    }
    if (hardCards.length >= 3) return executeChoice('crPayHard', card, player, s);
    if (softCards.length >= 3) return executeChoice('crPaySoft', card, player, s);
    return executeChoice('crRefuse', card, player, s);
  }

  // RFP: draw 2, AI/opponent picks which you keep
  if (name === 'RFP') {
    const drawn = [];
    for (let i = 0; i < 2; i++) {
      const c = drawCard(player);
      if (c) drawn.push(c);
    }
    if (drawn.length < 2) {
      addLog(s, `RFP → not enough cards in deck.`);
      return { outcome: `Drew ${drawn.length} card(s)`, detail: 'Not enough cards for full RFP' };
    }
    if (!player.isAI) {
      const options = drawn.map((c, i) => ({
        label: `Keep "${c.name}"`,
        detail: `${c.type}${c.value ? ` — ${c.value}v` : ''}`,
        action: 'rfpKeep',
        keepIdx: i,
      }));
      const choiceIdx = await showChoiceDialog(card, options);
      const discardIdx = choiceIdx === 0 ? 1 : 0;
      const discardedCard = drawn[discardIdx];
      const idx = player.hand.indexOf(discardedCard);
      if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); }
      addLog(s, `RFP → ${player.name} kept "${drawn[choiceIdx].name}", discarded "${discardedCard.name}".`);
      return { outcome: `Kept "${drawn[choiceIdx].name}"`, detail: `Discarded "${discardedCard.name}"` };
    }
    // AI: keep higher value
    const keepIdx = (drawn[0].value || 0) >= (drawn[1].value || 0) ? 0 : 1;
    const discardIdx = keepIdx === 0 ? 1 : 0;
    const idx = player.hand.indexOf(drawn[discardIdx]);
    if (idx >= 0) { s.discard.push(player.hand.splice(idx, 1)[0]); }
    addLog(s, `RFP → ${player.name} kept "${drawn[keepIdx].name}".`);
    return { outcome: `Kept "${drawn[keepIdx].name}"`, detail: `Discarded "${drawn[discardIdx].name}"` };
  }

  // Hiring (Event): pay 5 rep → draw Talent and assign immediately
  if (name === 'Hiring') {
    if (!player.isAI) {
      const options = [
        { label: 'Pay 5 reputation → hire a Talent', detail: `Current rep: ${player.reputation}`, disabled: player.reputation < 5, action: 'hiringPay' },
        { label: 'Decline the hire', detail: 'No cost, no benefit', action: 'hiringDecline' },
      ];
      const choiceIdx = await showChoiceDialog(card, options);
      return executeChoice(options[choiceIdx].action, card, player, s);
    }
    // AI: hire if affordable
    return executeChoice(player.reputation >= 5 ? 'hiringPay' : 'hiringDecline', card, player, s);
  }

  // Mentorship: simplified — unassign a senior, draw lowest for hire
  // Mentorship (multi-turn): unassign senior now, draw lowest For Hire next quarter
  if (name === 'Mentorship') {
    const assignedPeople = [];
    for (const [projId, ids] of Object.entries(player.assignments)) {
      for (const pid of ids) {
        const person = player.people.find(p => p.id === pid);
        if (person) assignedPeople.push({ person, projId });
      }
    }
    const sorted = assignedPeople.sort((a, b) => (b.person.value || 0) - (a.person.value || 0));
    let unassignedName = '';
    if (sorted.length) {
      const senior = sorted[0];
      player.assignments[senior.projId] = (player.assignments[senior.projId] || []).filter(id => id !== senior.person.id);
      unassignedName = senior.person.name;
      addLog(s, `Mentorship → ${player.name} unassigned ${senior.person.name} for mentoring.`);
    }
    // Queue the hire for next quarter
    if (!player.pendingEffects) player.pendingEffects = [];
    player.pendingEffects.push({
      type: 'mentorshipHire',
      data: {},
      activateQuarter: s.currentQuarter,
      sourceCardName: 'Mentorship',
    });
    addLog(s, `Mentorship → ${player.name} will hire from For Hire next quarter.`);
    return { outcome: 'Mentorship started', detail: unassignedName ? `${unassignedName} unassigned. Hire arrives next quarter.` : 'Hire arrives next quarter.' };
  }

  // Onboarding (multi-turn): unassign last talent, buy 2 For Hire next quarter
  if (name === 'Onboarding') {
    // Find last-played talent (most recently added person)
    const lastTalent = player.people.length ? player.people[player.people.length - 1] : null;
    if (lastTalent) {
      // Unassign if assigned
      for (const projId of Object.keys(player.assignments)) {
        player.assignments[projId] = (player.assignments[projId] || []).filter(id => id !== lastTalent.id);
      }
      addLog(s, `Onboarding → ${player.name} pulled ${lastTalent.name} for onboarding.`);
    }
    // Queue the buy for next quarter
    if (!player.pendingEffects) player.pendingEffects = [];
    player.pendingEffects.push({
      type: 'onboardingBuy',
      data: {},
      activateQuarter: s.currentQuarter,
      sourceCardName: 'Onboarding',
    });
    addLog(s, `Onboarding → ${player.name} can draw 2 For Hire cards next quarter.`);
    return { outcome: 'Onboarding started', detail: lastTalent ? `${lastTalent.name} pulled for onboarding. 2 For Hire draws next quarter.` : '2 For Hire draws next quarter.' };
  }

  // Non-choice cards — keyword-based resolution (unchanged)
  if (skill.includes('gain') && skill.includes('reputation')) {
    const match = skill.match(/gain (\d+)/i);
    const rep = match ? parseInt(match[1]) : 2;
    player.reputation += rep;
    addLog(s, `Event "${name}" → ${player.name} +${rep} rep.`);
    return { outcome: `+${rep} reputation`, detail: `${player.name} now has ${player.reputation} rep` };
  }

  if (skill.includes('draw') && skill.includes('card')) {
    const match = skill.match(/draw (\d+)/i);
    const count = match ? parseInt(match[1]) : 1;
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (s.decks.main.length) {
        const c = s.decks.main.pop();
        player.hand.push(c);
        drawn.push(c.name);
      }
    }
    addLog(s, `Event "${name}" → ${player.name} drew ${count} card(s).`);
    return { outcome: `Drew ${drawn.length} card(s)`, detail: drawn.length ? `Cards: ${drawn.join(', ')}` : 'Deck empty' };
  }

  // "pay or lose" must come before generic "lose reputation" — it's more specific
  if (skill.includes('pay') && skill.includes('lose')) {
    const payMatch = skill.match(/pay (\d+)/i);
    const loseMatch = skill.match(/lose (\d+)/i);
    const payCost = payMatch ? parseInt(payMatch[1]) : 0;
    const losePenalty = loseMatch ? parseInt(loseMatch[1]) : 5;

    const skillCards = player.hand.filter(c => c.type === 'Soft' || c.type === 'Hard' || c.type === 'Power');
    const totalValue = skillCards.reduce((sum, c) => sum + (c.value || 0), 0);

    if (totalValue >= payCost && skillCards.length > 0) {
      let remaining = payCost;
      const sorted = [...skillCards].sort((a, b) => (a.value || 0) - (b.value || 0));
      const paid = [];
      for (const sc of sorted) {
        if (remaining <= 0) break;
        const idx = player.hand.indexOf(sc);
        if (idx >= 0) {
          player.hand.splice(idx, 1);
          s.discard.push(sc);
          remaining -= (sc.value || 0);
          paid.push(sc.name);
        }
      }
      addLog(s, `Event "${name}" → ${player.name} paid ${payCost} with skill cards.`);
      return { outcome: `Paid ${payCost} with skill cards`, detail: `Used: ${paid.join(', ')}` };
    } else {
      player.reputation -= losePenalty;
      addLog(s, `Event "${name}" → ${player.name} couldn't pay, −${losePenalty} rep.`);
      return { outcome: `Couldn't pay ${payCost}`, detail: `Lost ${losePenalty} reputation instead` };
    }
  }

  if (skill.includes('lose') && skill.includes('reputation')) {
    const match = skill.match(/lose (\d+)/i);
    const rep = match ? parseInt(match[1]) : 2;
    player.reputation -= rep;
    addLog(s, `Event "${name}" → ${player.name} −${rep} rep.`);
    return { outcome: `−${rep} reputation`, detail: `${player.name} now has ${player.reputation} rep` };
  }

  if (skill.includes('discard')) {
    const match = skill.match(/discard (\d+)/i);
    const count = match ? parseInt(match[1]) : 1;
    const discarded = [];
    for (let i = 0; i < count && player.hand.length; i++) {
      const c = player.hand.pop();
      s.discard.push(c);
      discarded.push(c.name);
    }
    addLog(s, `Event "${name}" → ${player.name} discarded ${count} card(s).`);
    return { outcome: `Discarded ${discarded.length} card(s)`, detail: discarded.length ? `Lost: ${discarded.join(', ')}` : 'No cards to discard' };
  }

  if (skill.includes('add') && skill.includes('progress')) {
    const activeProjs = player.projects.filter(p => !p.isCompleted);
    if (activeProjs.length) {
      activeProjs[0].timeSpent = (activeProjs[0].timeSpent || 0) + 1;
      addLog(s, `Event "${name}" → +1 progress on "${activeProjs[0].name}".`);
      return { outcome: `+1 progress on "${activeProjs[0].name}"`, detail: `Progress: ${activeProjs[0].timeSpent}/${activeProjs[0].deadline || '?'}` };
    }
    return { outcome: 'No active projects', detail: 'Progress event had no effect' };
  }

  if (card.penalty) {
    player.reputation -= card.penalty;
    addLog(s, `Event "${name}" → ${player.name} −${card.penalty} rep.`);
    return { outcome: `−${card.penalty} reputation`, detail: `${player.name} now has ${player.reputation} rep` };
  }

  addLog(s, `Event "${name}" occurred (no direct effect).`);
  return { outcome: `Event: ${name}`, detail: card.skill || 'No direct mechanical effect' };
}

/** AI resolves choice cards automatically — picks the cheapest option. */
function resolveAiChoice(card, player, s) {
  const skill = (card.skill || '').toLowerCase();
  const name = (card.name || '').toLowerCase();

  // Skills Gap type — AI tries cheapest pay option
  if (skill.includes('pay 2 points using') || skill.includes('pay 4 points using')) {
    const hardCards = player.hand.filter(c => c.type === 'Hard');
    const softCards = player.hand.filter(c => c.type === 'Soft');
    const powerCards = player.hand.filter(c => c.type === 'Power');
    const hardVal = hardCards.reduce((sum, c) => sum + (c.value || 0), 0);
    const softVal = softCards.reduce((sum, c) => sum + (c.value || 0), 0);

    // Try Power+Skill first (free)
    if (powerCards.length >= 1 && (hardCards.length + softCards.length + powerCards.length) >= 2) {
      return executeChoice('payPower', card, player, s);
    }
    // Try cheaper pay option
    if (skill.includes('pay 2 points using hard') && hardVal >= 2) {
      return executeChoice('payLow', card, player, s);
    }
    if (skill.includes('pay 2 points using soft') && softVal >= 2) {
      return executeChoice('payLow', card, player, s);
    }
    if (skill.includes('pay 4 points using soft') && softVal >= 4) {
      return executeChoice('payHigh', card, player, s);
    }
    if (skill.includes('pay 4 points using hard') && hardVal >= 4) {
      return executeChoice('payHigh', card, player, s);
    }
    // Can't pay — refuse
    return executeChoice('refuse', card, player, s);
  }

  // 1:1 Meetings — AI holds if has projects
  if (name.includes('1:1 meeting')) {
    const active = player.projects.filter(p => !p.isCompleted);
    return executeChoice(active.length ? 'hold11' : 'skip11', card, player, s);
  }

  // Angry Client — AI discards soft if possible
  if (name.includes('angry client')) {
    const softCards = player.hand.filter(c => c.type === 'Soft');
    return executeChoice(softCards.length >= 2 ? 'discardSoft' : 'loseProgress', card, player, s);
  }

  // Company Priorities — AI discards project if rep is more important
  if (name.includes('company priorities')) {
    const active = player.projects.filter(p => !p.isCompleted);
    return executeChoice(active.length > 1 ? 'discardProject' : 'loseRep10', card, player, s);
  }

  // Attrition — AI fires lowest value
  if (name.includes('attrition')) {
    return executeChoice('fireLowest', card, player, s);
  }

  // Promotion — AI promotes
  if (name.includes('promotion')) {
    return executeChoice('promote', card, player, s);
  }

  // Default: accept
  addLog(s, `${player.name} accepted "${card.name}" effect.`);
  return { outcome: `${player.name} accepted "${card.name}"`, detail: card.skill || '' };
}

/** Resolve a Rush Quarter card (affects all players). */
export function resolveRushQ(card, s) {
  const skill = (card.skill || '').toLowerCase();
  const name = card.name || '';

  // ── Name-based Rush Q handlers ──────────────────────────

  // Board Review: lowest-rep player(s) lose 5 (or 3 if tied)
  if (name === 'Board Review') {
    const minRep = Math.min(...s.players.map(p => p.reputation));
    const lowest = s.players.filter(p => p.reputation === minRep);
    if (lowest.length > 1) {
      for (const p of lowest) p.reputation -= 3;
      addLog(s, `Board Review → tied players (${lowest.map(p => p.name).join(', ')}) each lose 3 rep.`);
    } else if (lowest.length === 1) {
      lowest[0].reputation -= 5;
      addLog(s, `Board Review → ${lowest[0].name} has lowest rep, loses 5.`);
    }
    return;
  }

  // Scope Creep (Rush Q): no bonus project draws this quarter
  if (name === 'Scope Creep') {
    s.quarterFlags.noBonusProject = true;
    addLog(s, `Scope Creep → no bonus projects can be gained this quarter.`);
    return;
  }

  // Budget Cuts: each player returns 1 assigned person or pays 2 favors
  if (name === 'Budget Cuts') {
    for (const p of s.players) {
      // Check for 2 favor cards
      const favors = p.hand.filter(c => c.type === 'Favor');
      if (favors.length >= 2) {
        // Pay 2 favors
        for (let i = 0; i < 2; i++) {
          const idx = p.hand.indexOf(favors[i]);
          if (idx >= 0) s.discard.push(p.hand.splice(idx, 1)[0]);
        }
        addLog(s, `Budget Cuts → ${p.name} paid 2 favors to keep team.`);
      } else {
        // Return 1 assigned person to for-hire pool
        let returned = false;
        for (const projId of Object.keys(p.assignments)) {
          const ids = p.assignments[projId] || [];
          if (ids.length > 0) {
            const personId = ids.pop();
            const pIdx = p.people.findIndex(per => per.id === personId);
            if (pIdx >= 0) {
              const person = p.people.splice(pIdx, 1)[0];
              s.decks.forHire.push(person);
              addLog(s, `Budget Cuts → ${p.name} returned ${person.name} to For Hire pool.`);
              returned = true;
              break;
            }
          }
        }
        if (!returned) {
          // No assigned people — return any unassigned person
          if (p.people.length) {
            const person = p.people.pop();
            s.decks.forHire.push(person);
            addLog(s, `Budget Cuts → ${p.name} returned ${person.name} to For Hire pool.`);
          } else {
            addLog(s, `Budget Cuts → ${p.name} had no team or favors.`);
          }
        }
      }
    }
    return;
  }

  // Unrealistic Expectations: all project deadlines reduced by 1
  if (name === 'Unrealistic Expectations') {
    for (const p of s.players) {
      for (const proj of p.projects) {
        if (!proj.isCompleted && (proj.deadline || 0) > 1) {
          proj.deadline = (proj.deadline || 1) - 1;
        }
      }
    }
    addLog(s, `Unrealistic Expectations → all project deadlines reduced by 1 quarter.`);
    return;
  }

  // Reorg Roulette: each player passes 1 random person to left, all assignments reset
  if (name === 'Reorg Roulette') {
    const n = s.players.length;
    const toPass = [];
    // Collect one random person from each player
    for (const p of s.players) {
      if (p.people.length) {
        const randIdx = Math.floor(Math.random() * p.people.length);
        const person = p.people.splice(randIdx, 1)[0];
        toPass.push(person);
      } else {
        toPass.push(null);
      }
    }
    // Pass to the left (player i gives to player (i-1+n)%n)
    for (let i = 0; i < n; i++) {
      const leftIdx = (i + 1) % n;
      if (toPass[i]) {
        s.players[leftIdx].people.push(toPass[i]);
        addLog(s, `Reorg Roulette → ${s.players[i].name} passed ${toPass[i].name} to ${s.players[leftIdx].name}.`);
      }
    }
    // Reset all assignments
    for (const p of s.players) {
      p.assignments = {};
    }
    addLog(s, `Reorg Roulette → all assignments reset.`);
    return;
  }

  // Ambition Backfires: players with 2+ projects lose 3 rep per project unless they discard 1 Favor
  if (name === 'Ambition Backfires') {
    for (const p of s.players) {
      const activeCount = p.projects.filter(pr => !pr.isCompleted).length;
      if (activeCount >= 2) {
        const favor = p.hand.find(c => c.type === 'Favor');
        if (favor) {
          const idx = p.hand.indexOf(favor);
          s.discard.push(p.hand.splice(idx, 1)[0]);
          addLog(s, `Ambition Backfires → ${p.name} discarded a favor to avoid penalty.`);
        } else {
          const penalty = 3 * activeCount;
          p.reputation -= penalty;
          addLog(s, `Ambition Backfires → ${p.name} has ${activeCount} projects, −${penalty} rep.`);
        }
      }
    }
    return;
  }

  // Freeze / SOX Compliance: freeze all projects next quarter
  if (name === 'Freeze' || name === 'SOX Compliance') {
    for (let pi = 0; pi < s.players.length; pi++) {
      s.quarterFlags.frozenProjects.push(pi);
    }
    // Freeze: also block new project card plays this quarter
    if (name === 'Freeze') {
      s.quarterFlags.noNewProject = true;
    }
    // SOX: can be avoided by unassigning a Manager or paying 1 favor
    if (name === 'SOX Compliance') {
      for (const p of s.players) {
        const manager = p.people.find(per => (per.name || '').toLowerCase().includes('manager'));
        const favor = p.hand.find(c => c.type === 'Favor');
        if (manager) {
          // Unassign manager from all projects
          for (const projId of Object.keys(p.assignments)) {
            p.assignments[projId] = (p.assignments[projId] || []).filter(id => id !== manager.id);
          }
          const pi = s.players.indexOf(p);
          s.quarterFlags.frozenProjects = s.quarterFlags.frozenProjects.filter(i => i !== pi);
          addLog(s, `SOX Compliance → ${p.name} unassigned ${manager.name} to avoid freeze.`);
        } else if (favor) {
          const idx = p.hand.indexOf(favor);
          s.discard.push(p.hand.splice(idx, 1)[0]);
          const pi = s.players.indexOf(p);
          s.quarterFlags.frozenProjects = s.quarterFlags.frozenProjects.filter(i => i !== pi);
          addLog(s, `SOX Compliance → ${p.name} paid 1 favor to avoid freeze.`);
        }
      }
    }
    addLog(s, `${name} → projects frozen next quarter for affected players.`);
    return;
  }

  // Invisible Work Tax: all active projects gain +1 quarter to deadline
  if (name === 'Invisible Work Tax') {
    for (const p of s.players) {
      for (const proj of p.projects) {
        if (!proj.isCompleted && (proj.deadline || 0) > 0) {
          proj.deadline = (proj.deadline || 0) + 1;
        }
      }
    }
    addLog(s, `Invisible Work Tax → all project deadlines extended by 1 quarter.`);
    return;
  }

  // Appropriated Glory: the current leader takes half the credit for the
  // best completed project among the other players (global Rush Q effect —
  // the person on top appropriates the win).
  if (name === 'Appropriated Glory') {
    const maxRep = Math.max(...s.players.map(p => p.reputation));
    const leader = s.players.find(p => p.reputation === maxRep);

    let bestTarget = null;
    let bestProject = null;
    let bestReward = 0;
    for (const opp of s.players) {
      if (opp === leader) continue;
      for (const proj of opp.projects) {
        if (proj.isCompleted && proj.reward > bestReward) {
          bestReward = proj.reward;
          bestTarget = opp;
          bestProject = proj;
        }
      }
    }

    if (!bestTarget) {
      addLog(s, `Appropriated Glory → no completed projects to appropriate.`);
      return { outcome: 'No targets', detail: 'No player has a completed project to appropriate' };
    }

    const stolen = Math.ceil(bestProject.reward / 2);
    bestTarget.reputation -= stolen;
    leader.reputation += stolen;
    addLog(s, `Appropriated Glory → ${leader.name} took ${stolen} rep of credit for ${bestTarget.name}'s "${bestProject.name}".`);
    return { outcome: `${leader.name} +${stolen} rep`, detail: `Appropriated half the credit for "${bestProject.name}"` };
  }

  // Legacy Strikes Back: each player must complete their longest project in 1 quarter
  if (name === 'Legacy Strikes Back') {
    for (const p of s.players) {
      const active = p.projects.filter(pr => !pr.isCompleted);
      if (!active.length) continue;
      // Find project with most quarters remaining
      const sorted = [...active].sort((a, b) => {
        const aLeft = (a.deadline || 0) - (a.timeSpent || 0);
        const bLeft = (b.deadline || 0) - (b.timeSpent || 0);
        return bLeft - aLeft;
      });
      const target = sorted[0];
      const remaining = (target.deadline || 0) - (target.timeSpent || 0);
      if (remaining > 1) {
        // Set deadline to current timeSpent + 1 (must complete next quarter)
        target.deadline = (target.timeSpent || 0) + 1;
        addLog(s, `Legacy Strikes Back → ${p.name}'s "${target.name}" must be completed in 1 quarter!`);
      }
    }
    return;
  }

  // Missing Deadline: all projects get -1 quarter deadline reduction
  if (name === 'Missing Deadline') {
    for (const p of s.players) {
      // Check if player has 3+ favors for immunity
      const favors = p.hand.filter(c => c.type === 'Favor');
      if (favors.length >= 3) {
        addLog(s, `Missing Deadline → ${p.name} immune (3+ favors).`);
        continue;
      }
      for (const proj of p.projects) {
        if (!proj.isCompleted && (proj.deadline || 0) > 1) {
          proj.deadline = (proj.deadline || 1) - 1;
        }
      }
      addLog(s, `Missing Deadline → ${p.name}'s project deadlines reduced by 1.`);
    }
    return;
  }

  // Technical Debt: each rushed project (completed early) costs -2 rep
  if (name === 'Technical Debt') {
    for (const p of s.players) {
      let debtCount = 0;
      for (const proj of p.projects) {
        if (proj.isCompleted && proj.completionQuarter > 0) {
          // Completed ahead of deadline = rushed
          if ((proj.timeSpent || 0) < (proj.deadline || 0)) {
            debtCount++;
          }
        }
      }
      if (debtCount > 0) {
        const penalty = debtCount * 2;
        p.reputation -= penalty;
        addLog(s, `Technical Debt → ${p.name} has ${debtCount} rushed project(s), −${penalty} rep.`);
      }
    }
    return;
  }

  // ── Keyword-based fallbacks ──────────────────────────────

  if (skill.includes('lose') && skill.includes('reputation')) {
    const match = skill.match(/lose (\d+)/i);
    const rep = match ? parseInt(match[1]) : 2;
    for (const p of s.players) {
      p.reputation -= rep;
    }
    addLog(s, `Rush Q "${name}" → all players −${rep} rep.`);
    return;
  }

  if (skill.includes('discard')) {
    const match = skill.match(/discard (\d+)/i);
    const count = match ? parseInt(match[1]) : 1;
    for (const p of s.players) {
      for (let i = 0; i < count && p.hand.length; i++) {
        const c = p.hand.pop();
        s.discard.push(c);
      }
    }
    addLog(s, `Rush Q "${name}" → all players discard ${count} card(s).`);
    return;
  }

  if (skill.includes('delay') || skill.includes('quarter')) {
    for (const p of s.players) {
      for (const proj of p.projects) {
        if (!proj.isCompleted) {
          proj.timeSpent = Math.max(0, (proj.timeSpent || 0) - 1);
        }
      }
    }
    addLog(s, `Rush Q "${name}" → all projects lose 1 progress.`);
    return;
  }

  const penalty = card.penalty || card.negationCost || 2;
  for (const p of s.players) {
    p.reputation -= penalty;
  }
  addLog(s, `Rush Q "${name}" → all players −${penalty} rep.`);
}

/** Resolve a Layoff card. Targets the lowest-reputation player (rulebook rule),
 *  breaking ties toward the earliest seat for determinism. */
export function resolveLayoff(card, s) {
  if (!s.players || !s.players.length) return;
  let targetIndex = 0;
  for (let i = 1; i < s.players.length; i++) {
    if (s.players[i].reputation < s.players[targetIndex].reputation) targetIndex = i;
  }
  s.layoffTargetIndex = targetIndex;
  const target = s.players[targetIndex];
  if (!target) return;

  const cost = card.negationCost || 5;
  const name = card.name || 'Layoff';

  if (target.reputation >= cost) {
    target.reputation -= cost;
    addLog(s, `Layoff "${name}" → ${target.name} paid ${cost} rep to survive.`);
  } else if (target.reputation >= 20) {
    const paid = target.reputation;
    target.reputation = 0;
    addLog(s, `Layoff "${name}" → ${target.name} paid all ${paid} rep to barely survive.`);
  } else if (target.reputation >= 10) {
    target.reputation = Math.max(0, target.reputation - 5);
    if (target.people.length) {
      const lostPerson = target.people.pop();
      s.discard.push(lostPerson);
      addLog(s, `Layoff "${name}" → ${target.name} lost team member ${lostPerson.name}.`);
    }
    const activeProj = target.projects.find(p => !p.isCompleted);
    if (activeProj) {
      activeProj.isCompleted = true;
      activeProj.completionQuarter = -1;
      addLog(s, `${target.name} lost project "${activeProj.name}" to layoff cuts.`);
    }
  } else {
    addLog(s, `Layoff "${name}" → ${target.name} eliminated! Rep too low (${target.reputation}).`);
    for (const person of target.people) s.discard.push(person);
    target.people = [];
    target.projects = target.projects.map(p => ({ ...p, isCompleted: true, completionQuarter: -1 }));
    target.assignments = {};
    target.reputation = 0;
  }
}
