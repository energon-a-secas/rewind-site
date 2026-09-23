// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Achievement tracking system ──────────────────────────────

import { state } from './state.js';
import { showToast } from './utils.js';

const ACHIEVEMENT_KEY = 'rush-q-achievements';

export const ACHIEVEMENTS = {
  firstWin: {
    id: 'firstWin',
    name: 'First Victory',
    description: 'Win your first game of Rush Q',
    icon: '/assets/icons/achievements/first-win.svg',
    category: 'victory',
  },
  comebackKing: {
    id: 'comebackKing',
    name: 'Comeback King',
    description: 'Win after being behind at quarter 5',
    icon: '/assets/icons/achievements/target-arrows.svg',
    category: 'victory',
    check: (s) => checkComeback(s),
  },
  perfectGame: {
    id: 'perfectGame',
    name: 'Perfect Game',
    description: 'Win with 50+ reputation',
    icon: '/assets/icons/achievements/star.svg',
    category: 'victory',
    check: (s) => checkPerfectGame(s),
  },
  squeaker: {
    id: 'squeaker',
    name: 'Squeaker',
    description: 'Win by 1-3 reputation points',
    icon: '/assets/icons/achievements/archery-target.svg',
    category: 'victory',
    check: (s) => checkSqueaker(s),
  },
  sweep: {
    id: 'sweep',
    name: 'Clean Sweep',
    description: 'Win by 20+ reputation points',
    icon: '/assets/icons/achievements/wave-strike.svg',
    category: 'victory',
    check: (s) => checkSweep(s),
  },
  noFavors: {
    id: 'noFavors',
    name: 'No Favors',
    description: 'Win without using any favor cards',
    icon: '/assets/icons/achievements/cross-mark.svg',
    category: 'strategy',
    check: (s) => checkNoFavors(s),
  },
  projectMaster: {
    id: 'projectMaster',
    name: 'Project Master',
    description: 'Complete 8+ projects in one game',
    icon: '/assets/icons/achievements/files.svg',
    category: 'strategy',
    check: (s) => checkProjectMaster(s),
  },
  antiTurtle: {
    id: 'antiTurtle',
    name: 'Anti-Turtle',
    description: 'Win while paying Innovation Tax',
    icon: '/assets/icons/achievements/rocket.svg',
    category: 'strategy',
    check: (s) => checkAntiTurtle(s),
  },
};

// Achievement state
let unlockedAchievements = new Set();
let achievementProgress = {};

/**
 * Load achievements from localStorage
 */
export function loadAchievements() {
  try {
    const saved = localStorage.getItem(ACHIEVEMENT_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      unlockedAchievements = new Set(data.unlocked || []);
      achievementProgress = data.progress || {};
    }
  } catch (e) {
    console.warn('Failed to load achievements:', e);
  }
}

/**
 * Save achievements to localStorage
 */
export function saveAchievements() {
  try {
    const data = {
      unlocked: Array.from(unlockedAchievements),
      progress: achievementProgress,
    };
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save achievements:', e);
  }
}

/**
 * Check for new achievements on game end
 */
export function checkAchievementsOnGameEnd() {
  const newlyUnlocked = [];

  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (unlockedAchievements.has(id)) continue;

    if (!achievement.check) {
      // Default achievements checked elsewhere
      continue;
    }

    if (achievement.check(state)) {
      unlockedAchievements.add(id);
      newlyUnlocked.push(achievement);

      // Show notification
      showAchievementNotification(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievements();
  }

  return newlyUnlocked;
}

/**
 * Check if achievement is unlocked
 */
export function isAchievementUnlocked(id) {
  return unlockedAchievements.has(id);
}

/**
 * Get all achievements with unlock status
 */
export function getAllAchievements() {
  return Object.entries(ACHIEVEMENTS).map(([id, achievement]) => ({
    ...achievement,
    id,
    unlocked: unlockedAchievements.has(id),
  }));
}

/**
 * Show achievement notification popup
 */
function showAchievementNotification(achievement) {
  const popup = document.createElement('div');
  popup.className = 'achievement-popup';
  popup.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-title">${achievement.name}</div>
    <div class="achievement-desc">${achievement.description}</div>
  `;

  document.body.appendChild(popup);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (popup.parentNode) {
      popup.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => popup.remove(), 300);
    }
  }, 5000);

  // Also show toast
  showToast(`🏆 Achievement Unlocked: ${achievement.name}`);
}

// Achievement check functions

function checkComeback(s) {
  const human = s.players[0];
  if (!human || !s.reputationHistory) return false;

  // Check if human was behind at Q5
  if (s.reputationHistory[5]) {
    const q5Reps = Object.values(s.reputationHistory[5]);
    const humanQ5Rep = s.reputationHistory[5][0];
    const maxQ5Rep = Math.max(...q5Reps);

    if (humanQ5Rep < maxQ5Rep) {
      // Check if human won
      const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
      return sorted[0] === human;
    }
  }
  return false;
}

function checkPerfectGame(s) {
  const human = s.players[0];
  if (!human) return false;

  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  return sorted[0] === human && human.reputation >= 50;
}

function checkSqueaker(s) {
  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  if (sorted.length < 2) return false;

  const margin = sorted[0].reputation - sorted[1].reputation;
  return margin >= 1 && margin <= 3;
}

function checkSweep(s) {
  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  if (sorted.length < 2) return false;

  const margin = sorted[0].reputation - sorted[1].reputation;
  return margin >= 20;
}

function checkNoFavors(s) {
  const human = s.players[0];
  if (!human) return false;

  // Check game log or player stats for favor usage
  const favorUsed = s.gameLog.some(log =>
    log.msg.includes('favor') && log.msg.includes(human.name)
  );

  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  return sorted[0] === human && !favorUsed;
}

function checkProjectMaster(s) {
  const human = s.players[0];
  if (!human) return false;

  const completedProjects = human.projects.filter(p => p.isCompleted).length;
  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  return sorted[0] === human && completedProjects >= 8;
}

function checkAntiTurtle(s) {
  const human = s.players[0];
  if (!human) return false;

  // Check if Innovation Tax was paid
  const taxPaid = s.gameLog.some(log =>
    log.msg.includes('Innovation Tax') && log.msg.includes(human.name)
  );

  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  return sorted[0] === human && taxPaid;
}

// Unlock default achievements (not checked automatically)
export function unlockAchievement(id) {
  if (!ACHIEVEMENTS[id]) {
    console.warn(`Unknown achievement: ${id}`);
    return false;
  }

  if (!unlockedAchievements.has(id)) {
    unlockedAchievements.add(id);
    saveAchievements();
    showAchievementNotification(ACHIEVEMENTS[id]);
    return true;
  }
  return false;
}

// Initialize on load
loadAchievements();
