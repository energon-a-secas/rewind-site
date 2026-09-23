// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── AI logic ─────────────────────────────────────────────────
// Competent AI opponent: prioritizes staffing, projects, and skill cards.

import { addLog } from './state.js';
import { drawCard, refillMarket, getUnassignedPeople, getAssignedPeople, playCard, spendRetroToken, foundationBand } from './engine.js';
import { resolveEvent, drawTimingGated } from './rules.js';
import { REACTION_CARDS } from './effects.js';
import { delay } from './utils.js';
import { isBudgetMode, canAffordCapEx, spendCapEx, canHireFTE } from './budget.js';
import { traitMaxSkills, traitCanPlay, traitEnforceHandLimit } from './traits.js';

const AI_DELAY = 400;

// The Rival profile's arsenal: targeted attacks it saves for whoever leads.
const SABOTAGE_CARDS = new Set(['Shift The blame', 'Domain Collision', 'Reassign Resources', 'Charm People', 'Request Help']);

/** Run a complete AI turn. */
export async function runAiTurn(player, s) {
  addLog(s, `${player.name}'s turn.`);
  await delay(AI_DELAY);

  // Event phase (Q2+)
  if (s.currentQuarter >= 2 && s.decks.events.length) {
    const eventCard = drawTimingGated(s.decks.events, s.discard, s.currentQuarter);
    if (eventCard) {
      addLog(s, `Event for ${player.name}: ${eventCard.name}`);
      const result = await resolveEvent(eventCard, player, s);
      addLog(s, `${player.name}: ${result.outcome}${result.detail ? ', ' + result.detail : ''}`);
      s.discard.push(eventCard);
      await delay(AI_DELAY);
    }
  }

  // 0. Spend retro token if available
  if ((player.retroTokens || 0) > 0) {
    await spendRetroToken(player);
    await delay(AI_DELAY);
  }

  // 1. Assign people first (so projects are staffed before considering new ones)
  aiAssignPeople(player, s);
  await delay(AI_DELAY);

  // 2. Play people cards — prioritize getting team members
  const peopleCards = player.hand.filter(c => c.type === 'Talent' || c.deck === 'For Hire');
  let peoplePlayed = 0;
  for (const card of peopleCards) {
    if (peoplePlayed >= 2) break;
    if (isBudgetMode(s) && !canHireFTE(s, player)) break;
    const result = await playCard(player, card.id);
    if (result) {
      peoplePlayed++;
      await delay(AI_DELAY);
    }
  }

  // Re-assign after recruiting
  if (peoplePlayed > 0) aiAssignPeople(player, s);

  // 3. Play project cards — only if we have enough people to staff them
  const projectCards = player.hand.filter(c =>
    c.type === 'Project' || c.type === 'Project Queue' || c.type === 'Bonus Project'
  );
  const activeProjects = player.projects.filter(p => !p.isCompleted);
  const totalPeople = player.people.length;
  const totalNeeded = activeProjects.reduce((sum, p) => sum + (p.members || 0), 0);
  const hasSpare = totalPeople > totalNeeded;

  if (projectCards.length && activeProjects.length < 3 && (hasSpare || activeProjects.length === 0)) {
    // Pick highest reward project
    const sorted = [...projectCards].sort((a, b) => (b.reward || 0) - (a.reward || 0));
    const card = sorted[0];
    const result = await playCard(player, card.id);
    if (result) {
      aiAssignPeople(player, s);
      await delay(AI_DELAY);
    }
  }

  // 4. Trade at markets — higher probability, smarter choices
  aiTrade(player, s, 'projectQueue');
  if (s.forHireUnlocked) {
    aiTrade(player, s, 'forHire');
  }

  // 5. Play ALL viable skill cards (not just 50% chance for 1)
  let skillCards = player.hand.filter(c => c.type === 'Soft' || c.type === 'Hard' || c.type === 'Power');
  // Reaction cards are held for the reaction window, never played on turn.
  skillCards = skillCards.filter(c => !REACTION_CARDS.has(c.name));
  // Filter out trait-blocked cards
  skillCards = skillCards.filter(c => traitCanPlay(c, player).allowed);

  // Rival profile: hold the sabotage cluster, telegraph one turn ahead, then
  // fire it at the leader. Gives shields and reaction cards something to block.
  if (player.aiProfile === 'rival') {
    const sabotage = skillCards.filter(c => SABOTAGE_CARDS.has(c.name));
    if (sabotage.length) {
      const leader = s.players.reduce((m, p) => (p.reputation > m.reputation ? p : m), s.players[0]);
      const hunting = leader !== player && leader.reputation > player.reputation + 3;
      if (!hunting) {
        player._rivalArmed = false;
        skillCards = skillCards.filter(c => !SABOTAGE_CARDS.has(c.name));
      } else if (!player._rivalArmed) {
        player._rivalArmed = true;
        addLog(s, `${player.name} is asking pointed questions about ${leader.name}'s work…`);
        skillCards = skillCards.filter(c => !SABOTAGE_CARDS.has(c.name));
      }
      // armed && hunting → sabotage sorts first via the score boost below
    }
  }

  // Sort: reputation gain and draw effects first, risky cards last
  const rivalBoost = c =>
    (player.aiProfile === 'rival' && player._rivalArmed && SABOTAGE_CARDS.has(c.name)) ? 100 : 0;
  skillCards.sort((a, b) => {
    const aScore = aiSkillCardScore(a) + rivalBoost(a);
    const bScore = aiSkillCardScore(b) + rivalBoost(b);
    return bScore - aScore;
  });
  // Play up to max skills per turn (trait-dependent, default 2). Board
  // pressure (Q3+) hits AI too: a cracking/crumbling foundation costs a slot.
  let maxSkills = traitMaxSkills(player);
  if (s.currentQuarter >= 3) {
    const bandKey = foundationBand(player.foundation).key;
    if (bandKey === 'cracking' || bandKey === 'crumbling') {
      maxSkills = Math.max(1, maxSkills - 1);
    }
  }
  let skillsPlayed = 0;
  for (const card of skillCards) {
    if (skillsPlayed >= maxSkills) break;
    const result = await playCard(player, card.id);
    if (result) {
      skillsPlayed++;
      if (SABOTAGE_CARDS.has(card.name)) player._rivalArmed = false;
      await delay(AI_DELAY);
    }
  }

  // 6. Play favors when behind in reputation
  const avgRep = s.players.reduce((sum, p) => sum + p.reputation, 0) / s.players.length;
  if (player.reputation < avgRep - 5) {
    const favors = player.hand.filter(c => c.type === 'Favor');
    for (const fav of favors) {
      await playCard(player, fav.id);
    }
  }

  // 7. Draw
  const drawn = drawCard(player);
  if (drawn) addLog(s, `${player.name} drew a card.`);

  // 8. Enforce trait hand limit (Firefighter)
  const discarded = traitEnforceHandLimit(player, s.discard);
  if (discarded.length) {
    addLog(s, `${player.trait?.name || 'Trait'} hand limit: ${player.name} discarded ${discarded.length} card(s).`);
  }
}

/** Score a skill card for AI priority (higher = play first). */
function aiSkillCardScore(card) {
  const et = (card.effectType || '').toLowerCase();
  const skill = (card.skill || '').toLowerCase();
  if (et.includes('reputation gain') || skill.includes('gain')) return 10;
  if (et.includes('draw') || skill.includes('draw')) return 8;
  if (et.includes('progress') || skill.includes('progress')) return 9;
  if (et.includes('hiring') || skill.includes('hire')) return 7;
  if (et.includes('protection') || et.includes('shield')) return 6;
  if (et.includes('risk')) return 3;
  if (et.includes('reputation loss') || skill.includes('lose')) return 1;
  return 5;
}

function aiTrade(player, s, marketType) {
  const market = s.markets[marketType];
  if (!market.length) return;

  const activeProjects = player.projects.filter(p => !p.isCompleted);

  // For hire: trade if we need more people for active projects
  if (marketType === 'forHire') {
    if (isBudgetMode(s) && !canHireFTE(s, player)) return;
    const totalNeeded = activeProjects.reduce((sum, p) => sum + (p.members || 0), 0);
    const totalAssigned = player.people.length;
    if (totalAssigned >= totalNeeded + 2) return; // have enough people
    // 70% chance to trade for people when understaffed
    if (Math.random() > 0.7) return;
  } else {
    // Project queue: trade if we have spare people or few projects
    if (activeProjects.length >= 3) return;
    if (Math.random() > 0.5) return;
  }

  const valuable = player.hand.filter(c => (c.value || 0) > 0);
  if (!valuable.length) return;

  // Pick best market card: highest reward for projects, highest value for people
  const sorted = marketType === 'projectQueue'
    ? [...market].sort((a, b) => (b.reward || 0) - (a.reward || 0))
    : [...market].sort((a, b) => (b.value || 0) - (a.value || 0));
  const target = sorted[0];
  const cost = target.value || 0;

  const totalValue = valuable.reduce((sum, c) => sum + (c.value || 0), 0);
  if (totalValue < cost) return;

  if (isBudgetMode(s) && cost > 0 && !canAffordCapEx(s, player, cost)) return;
  if (isBudgetMode(s) && cost > 0) spendCapEx(s, player, cost);

  let remaining = cost;
  const toRemove = [];
  const sortedVal = [...valuable].sort((a, b) => (a.value || 0) - (b.value || 0));
  for (const c of sortedVal) {
    if (remaining <= 0) break;
    toRemove.push(c);
    remaining -= (c.value || 0);
  }

  for (const c of toRemove) {
    const idx = player.hand.indexOf(c);
    if (idx >= 0) {
      player.hand.splice(idx, 1);
      s.discard.push(c);
    }
  }

  const mIdx = market.indexOf(target);
  if (mIdx >= 0) market.splice(mIdx, 1);

  if (marketType === 'forHire') {
    player.people.push(target);
    addLog(s, `${player.name} hired ${target.name} from market.`);
  } else {
    target.timeSpent = 0;
    target.isCompleted = false;
    player.projects.push(target);
    addLog(s, `${player.name} acquired project "${target.name}" from market.`);
  }

  refillMarket(marketType);
}

function aiAssignPeople(player, s) {
  const playerIdx = s.players.indexOf(player);
  if ((s.quarterFlags.noAssign || []).includes(playerIdx)) return;

  const unassigned = getUnassignedPeople(player);
  if (!unassigned.length) return;

  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (!activeProjs.length) return;

  // Priority: fill understaffed projects by urgency (closest deadline first)
  activeProjs.sort((a, b) => {
    const aTimeLeft = (a.deadline || 99) - (a.timeSpent || 0);
    const bTimeLeft = (b.deadline || 99) - (b.timeSpent || 0);
    // Prioritize projects closest to deadline that still need people
    const aAssigned = getAssignedPeople(player, a.id).length;
    const bAssigned = getAssignedPeople(player, b.id).length;
    const aNeeds = (a.members || 0) - aAssigned;
    const bNeeds = (b.members || 0) - bAssigned;
    // Projects that need people and are urgent come first
    if (aNeeds > 0 && bNeeds <= 0) return -1;
    if (bNeeds > 0 && aNeeds <= 0) return 1;
    return aTimeLeft - bTimeLeft;
  });

  let available = [...unassigned];

  for (const proj of activeProjs) {
    if (!available.length) break;
    const assigned = (player.assignments[proj.id] || []).length;
    const needed = Math.min(proj.members || 0, 4) - assigned; // cap effective members at 4
    if (needed <= 0) continue;

    const toAssign = available.splice(0, needed);
    if (!player.assignments[proj.id]) player.assignments[proj.id] = [];
    for (const person of toAssign) {
      player.assignments[proj.id].push(person.id);
    }
    if (toAssign.length) {
      addLog(s, `${player.name} assigned ${toAssign.length} people to "${proj.name}".`);
    }
  }
}
