// Gamification animations and celebrations
import { gamification, auth, convex, api, state } from './state.js';
import { showToast } from './utils.js';

// Update user level indicator in header
export function updateUserLevelIndicator() {
  const indicator = document.getElementById('user-level-indicator');
  const levelNumber = indicator?.querySelector('.level-number');
  const xpFill = indicator?.querySelector('.user-xp-fill');

  if (!indicator || !auth.isAuthenticated) {
    if (indicator) indicator.style.display = 'none';
    return;
  }

  // Show indicator
  indicator.style.display = 'flex';

  // Update level
  if (levelNumber) {
    const currentLevel = levelNumber.textContent;
    if (currentLevel !== gamification.userLevel.toString()) {
      levelNumber.textContent = gamification.userLevel;
      // Add level up animation if level increased
      if (parseInt(currentLevel) < gamification.userLevel) {
        indicator.classList.add('user-level-up');
        setTimeout(() => indicator.classList.remove('user-level-up'), 800);
      }
    }
  }

  // Update XP bar
  if (xpFill) {
    const currentXP = gamification.totalXP;
    const currentLevel = gamification.userLevel;
    const xpForCurrentLevel = currentLevel * 100 + currentLevel * currentLevel * 10;
    const xpForNextLevel = (currentLevel + 1) * 100 + (currentLevel + 1) * (currentLevel + 1) * 10;
    const xpInLevel = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progress = Math.min(100, (xpInLevel / xpNeeded) * 100);

    xpFill.style.width = `${progress}%`;
  }
}

// Show level up celebration
export function showLevelUpCelebration(oldLevel, newLevel) {
  // Confetti animation
  createConfetti();

  // Level up popup
  const popup = document.createElement('div');
  popup.className = 'level-up-popup';
  popup.innerHTML = `
    <div class="level-up-text">Level Up!</div>
    <div style="font-size: 36px; font-weight: 800; color: var(--accent-bright); margin: 8px 0;">
      ${oldLevel} → ${newLevel}
    </div>
    <div class="level-up-subtext">Keep up the great work!</div>
  `;

  document.body.appendChild(popup);

  // Remove after animation
  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 3000);

  // Show toast
  showToast(`🎉 Level ${newLevel} reached!`, 'success', 4000);

  // Update indicator
  updateUserLevelIndicator();
}

// Show badge earned celebration
export function showBadgeCelebration(badge) {
  // Create celebration popup
  const popup = document.createElement('div');
  popup.className = 'badge-earned-popup';
  popup.innerHTML = `
    <div class="badge-icon-large">${badge.icon}</div>
    <div class="badge-name">${badge.name}</div>
    <div class="badge-tier ${badge.tier}">${badge.tier}</div>
    <div style="color: var(--text-secondary); font-size: 14px; margin-top: 8px;">
      ${badge.description}
    </div>
  `;

  document.body.appendChild(popup);

  // Remove after animation
  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 4000);

  // Show toast
  showToast(`🏆 Badge earned: ${badge.name}!`, 'success', 5000);

  // Add to gamification state
  gamification.badges.push(badge);
}

// Create confetti effect
export function createConfetti(count = 50) {
  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    overlay.appendChild(confetti);
  }

  document.body.appendChild(overlay);

  // Remove after all confetti has fallen
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 5000);
}

// Show XP gain floating text
export function showXPGain(element, xpAmount) {
  const rect = element.getBoundingClientRect();
  const xpText = document.createElement('div');
  xpText.className = 'xp-gain-float';
  xpText.textContent = `+${xpAmount} XP`;
  xpText.style.left = rect.left + rect.width / 2 + 'px';
  xpText.style.top = rect.top + 'px';

  document.body.appendChild(xpText);

  // Remove after animation
  setTimeout(() => {
    if (xpText.parentNode) {
      xpText.parentNode.removeChild(xpText);
    }
  }, 1500);
}

// Add glow effect to node
export function addNodeGlow(nodeElement) {
  nodeElement.classList.add('node-hover-glow');
  setTimeout(() => {
    nodeElement.classList.remove('node-hover-glow');
  }, 300);
}

// Animate streak flame
export function animateStreakFlame(streakElement) {
  streakElement.classList.add('streak-flame');
  setTimeout(() => {
    streakElement.classList.remove('streak-flame');
  }, 500);
}

// Show loading spinner
export function showLoadingSpinner(container) {
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  container.appendChild(spinner);
  return spinner;
}

// Remove loading spinner
export function hideLoadingSpinner(spinner) {
  if (spinner && spinner.parentNode) {
    spinner.parentNode.removeChild(spinner);
  }
}

// Initialize animations on app load
export function initAnimations() {
  // Update level indicator periodically
  setInterval(() => {
    if (auth.isAuthenticated) {
      updateUserLevelIndicator();
    }
  }, 5000);

  // Initial update
  if (auth.isAuthenticated) {
    updateUserLevelIndicator();
  }
}

// Check for badges and show celebrations
export async function checkForBadgeCelebrations() {
  if (!auth.isAuthenticated) return;

  try {
    const result = await convex.query(api.gamification.getBadgeProgress, {
      username: auth.username
    });

    if (result.ok) {
      const newlyEarned = result.badges.filter(b =>
        b.isEarned && !gamification.badges.some(eb => eb.id === b.id)
      );

      for (const badge of newlyEarned) {
        showBadgeCelebration({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          tier: badge.tier
        });
      }
    }
  } catch (err) {
    console.error('Badge check error:', err);
  }
}

// Watch for XP changes and trigger celebrations
let lastTotalXP = 0;

export function watchXPGrowth() {
  const currentTotalXP = gamification.totalXP;

  if (currentTotalXP > lastTotalXP) {
    const oldLevel = calculateLevelFromXP(lastTotalXP);
    const newLevel = calculateLevelFromXP(currentTotalXP);

    if (newLevel > oldLevel) {
      showLevelUpCelebration(oldLevel, newLevel);
    }
  }

  lastTotalXP = currentTotalXP;
}

// Helper function from state.js
default function calculateLevelFromXP(xp) {
  let level = 1;
  while (xp >= calculateXPForLevel(level) && level < 100) {
    level++;
  }
  return level;
}

function calculateXPForLevel(level) {
  return level * 100 + level * level * 10;
}

// Expose animation functions globally
window.updateUserLevelIndicator = updateUserLevelIndicator;
window.showLevelUpCelebration = showLevelUpCelebration;
window.showBadgeCelebration = showBadgeCelebration;
window.createConfetti = createConfetti;
window.showXPGain = showXPGain;
window.initAnimations = initAnimations;
window.checkForBadgeCelebrations = checkForBadgeCelebrations;
window.watchXPGrowth = watchXPGrowth;
