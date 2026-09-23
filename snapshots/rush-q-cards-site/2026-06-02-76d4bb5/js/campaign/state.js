// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Campaign state and persistence ───────────────────────────

import { state as gameState } from '../game/state.js';

export const campaignState = {
  mode: null, // 'easy', 'medium', 'hard'
  modeConfig: null,
  projectsCompletedGoal: 0,
  eventsPerQuarter: 1,
  aiSkillLevel: 50,
};

// Campaign mode configurations
export const MODE_CONFIGS = {
  easy: {
    name: 'Management Fundamentals',
    handSize: 4,
    projectsGoal: 5,
    projectModifier: 0, // no extra quarters
    eventsPerQuarter: 1,
    aiSkill: 50,
    allowFavors: true,
    description: 'Learn the basics with more forgiving rules and larger hand size.'
  },
  medium: {
    name: 'Pressure Cooker',
    handSize: 3,
    projectsGoal: 7,
    projectModifier: 1, // +1 quarter
    eventsPerQuarter: 2,
    aiSkill: 75,
    allowFavors: true,
    description: 'Realistic pressure with tighter deadlines and faster AI.'
  },
  hard: {
    name: 'Crisis Management',
    handSize: 2,
    projectsGoal: 9,
    projectModifier: 2, // +2 quarters
    eventsPerQuarter: 3,
    aiSkill: 100,
    allowFavors: false,
    description: 'Maximum pressure with severe constraints and no favors.'
  }
};

/**
 * Initialize campaign mode settings
 */
export function initCampaignMode(mode) {
  if (!MODE_CONFIGS[mode]) {
    throw new Error(`Unknown campaign mode: ${mode}`);
  }

  campaignState.mode = mode;
  campaignState.modeConfig = MODE_CONFIGS[mode];
  campaignState.projectsCompletedGoal = campaignState.modeConfig.projectsGoal;
  campaignState.eventsPerQuarter = campaignState.modeConfig.eventsPerQuarter;
  campaignState.aiSkillLevel = campaignState.modeConfig.aiSkillLevel;

  // Apply hand size limit
  gameState.settings = gameState.settings || {};
  gameState.settings.maxHandSize = campaignState.modeConfig.handSize;

  return campaignState;
}

/**
 * Check if campaign victory conditions are met
 */
export function checkCampaignVictory() {
  if (!campaignState.mode) return false;

  const humanPlayer = gameState.players[0];
  const completedProjects = humanPlayer.projects.filter(p => p.isCompleted).length;

  return completedProjects >= campaignState.projectsCompletedGoal;
}

/**
 * Save campaign completion to localStorage
 */
export function saveCampaignCompletion(mode, stats) {
  const progress = loadCampaignProgress();
  progress[mode] = {
    completed: true,
    completedAt: Date.now(),
    attempts: stats.attempts || 1,
    finalReputation: stats.reputation || 0,
    quartersTaken: stats.quarters || 0
  };

  // Calculate star rating (1-3 stars)
  const config = MODE_CONFIGS[mode];
  let stars = 1;

  if (stats.reputation >= 20) stars = 2;
  if (stats.reputation >= 35) stars = 3;

  progress[mode].stars = stars;

  localStorage.setItem('rush-q-campaign-progress', JSON.stringify(progress));
  return progress;
}

/**
 * Load campaign progress from localStorage
 */
export function loadCampaignProgress() {
  try {
    const saved = localStorage.getItem('rush-q-campaign-progress');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load campaign progress:', e);
  }

  // Return default empty progress
  return {
    easy: { completed: false, attempts: 0, stars: 0 },
    medium: { completed: false, attempts: 0, stars: 0 },
    hard: { completed: false, attempts: 0, stars: 0 }
  };
}

/**
 * Get AI difficulty settings for campaign
 */
export function getAiSettings() {
  if (!campaignState.mode) return { riskTolerance: 50, favorUsage: 50 };

  const skill = campaignState.aiSkillLevel;
  return {
    riskTolerance: skill, // Higher skill = more aggressive
    favorUsage: campaignState.modeConfig.allowFavors ? skill : 0,
    projectAggression: Math.min(skill + 20, 100),
    negationChance: skill / 100
  };
}

/**
 * Modify project deadline based on campaign difficulty
 */
export function modifyProjectDeadline(originalDeadline) {
  if (!campaignState.mode || !campaignState.modeConfig) {
    return originalDeadline;
  }

  return originalDeadline + campaignState.modeConfig.projectModifier;
}

/**
 * Check if favor cards are allowed in this campaign
 */
export function areFavorsAllowed() {
  return campaignState.modeConfig?.allowFavors ?? true;
}

/**
 * Reset campaign state
 */
export function resetCampaign() {
  campaignState.mode = null;
  campaignState.modeConfig = null;
  campaignState.projectsCompletedGoal = 0;
  campaignState.eventsPerQuarter = 1;
  campaignState.aiSkillLevel = 50;
}
