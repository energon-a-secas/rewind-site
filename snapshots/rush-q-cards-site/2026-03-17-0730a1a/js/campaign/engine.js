// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Campaign game engine adaptations ─────────────────────────

import { state } from '../game/state.js';
import { startGame } from '../game/engine.js';
import { drawEventCard } from '../game/rules.js';
import { addLog } from '../game/render.js';
import { modifyProjectDeadline, getAiSettings, areFavorsAllowed } from './state.js';

/**
 * Start a campaign game with mode-specific rules
 */
export function startCampaignGame(mode, playerName) {
  // Initialize campaign mode
  const campaign = require('./state.js');
  campaign.initCampaignMode(mode);

  // Start base game
  const config = campaign.MODE_CONFIGS[mode];
  startGame(playerName, 2, 8); // 2 AI opponents, 8 quarters

  // Apply campaign-specific modifications
  applyCampaignRules(mode);

  return state;
}

/**
 * Apply campaign-specific modifications to game state
 */
function applyCampaignRules(mode) {
  const campaign = require('./state.js');
  const config = campaign.MODE_CONFIGS[mode];

  // Modify all project deadlines
  for (const player of state.players) {
    for (const project of player.projects) {
      if (project.deadline) {
        project.originalDeadline = project.deadline;
        project.deadline = modifyProjectDeadline(project.deadline);
      }
    }
  }

  // Modify starting hand size
  state.handSize = config.handSize;

  // Adjust player hand if needed
  const humanPlayer = state.players[0];
  if (humanPlayer.hand.length > config.handSize) {
    // Discard down to max hand size
    const toDiscard = humanPlayer.hand.slice(config.handSize);
    humanPlayer.hand = humanPlayer.hand.slice(0, config.handSize);
    state.discard.push(...toDiscard);
    addLog(state, `Campaign rule: Hand size limited to ${config.handSize}. ${toDiscard.length} cards discarded.`);
  }

  // Filter favor cards if not allowed
  if (!config.allowFavors) {
    const favorCards = humanPlayer.hand.filter(c => c.type === 'Favor');
    humanPlayer.hand = humanPlayer.hand.filter(c => c.type !== 'Favor');
    state.discard.push(...favorCards);
    addLog(state, `Campaign rule: Favor cards are not available in Crisis Mode.`);
  }

  addLog(state, `🎯 Campaign: ${config.name} - Complete ${config.projectsGoal} projects to win!`);
}

/**
 * Check for campaign-specific win conditions at end of turn
 */
export function checkCampaignEndOfTurn() {
  const campaign = require('./state.js');

  if (!campaign.campaignState.mode) return false;

  // Check for campaign victory
  if (campaign.checkCampaignVictory()) {
    const humanPlayer = state.players[0];
    const completedProjects = humanPlayer.projects.filter(p => p.isCompleted).length;

    addLog(state, `🎉 Campaign Victory! Completed ${completedProjects} projects in ${state.currentQuarter} quarters!`);

    // Save completion
    const stats = {
      reputation: humanPlayer.reputation,
      quarters: state.currentQuarter,
      projects: completedProjects
    };
    campaign.saveCampaignCompletion(campaign.campaignState.mode, stats);

    // Trigger game over
    state.gameOver = true;
    state.turnPhase = 'gameOver';
    return true;
  }

  // Hard mode: Check for elimination (all players must survive in cooperative mode)
  if (campaign.campaignState.mode === 'hard') {
    const humanPlayer = state.players[0];
    if (humanPlayer.reputation < -10) {
      addLog(state, '💀 Campaign Failed: Reputation dropped too low in Crisis Mode!');
      state.gameOver = true;
      state.turnPhase = 'gameOver';
      return true;
    }
  }

  return false;
}

/**
 * Custom event card drawing for campaign modes
 */
export function campaignDrawEventCard() {
  const campaign = require('./state.js');

  if (!campaign.campaignState.mode) {
    return drawEventCard(); // Use default
  }

  const config = campaign.MODE_CONFIGS[campaign.campaignState.mode];
  const currentEvents = state.players.reduce((sum, p) => sum + p.playedThisQuarter.filter(c => c.deck === 'Event').length, 0);

  // Check if we should draw more events this quarter
  if (currentEvents < config.eventsPerQuarter) {
    return drawEventCard();
  }

  return null; // No more events this quarter
}

/**
 * Campaign AI decision making (scaled by difficulty)
 */
export function getCampaignAiDecision(player) {
  const campaign = require('./state.js');
  const settings = campaign.getAiSettings();

  // Base AI logic from ../game/ai.js
  const { getAiPlay } = require('../game/ai.js');

  // Apply campaign-specific AI biases
  const baseDecision = getAiPlay(player, state);

  // Scale decision based on AI skill level
  if (baseDecision.card && settings.riskTolerance < 70) {
    // Conservative AI prefers safer plays
    if (baseDecision.card.value > 2 && Math.random() > settings.riskTolerance / 100) {
      // Skip high-value cards sometimes
      return { skip: true };
    }
  }

  return baseDecision;
}

/**
 * Get star rating for campaign completion
 */
export function getStarRating(reputation) {
  if (reputation >= 35) return 3;
  if (reputation >= 20) return 2;
  return 1;
}

/**
 * Get campaign-specific victory message
 */
export function getCampaignVictoryMessage() {
  const campaign = require('./state.js');
  const config = campaign.MODE_CONFIGS[campaign.campaignState.mode];

  return `Campaign Complete: ${config.name}`;
}

// Export for use in other modules
export { areFavorsAllowed } from './state.js';
