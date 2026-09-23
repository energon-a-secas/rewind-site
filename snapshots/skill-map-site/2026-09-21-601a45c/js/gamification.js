// ===== Gamification Integration with Convex Backend =====

import { convex, api, auth, state, gamification } from './state.js';
import { renderXPBars, animateLevelUp, animateXPGain } from './render.js';
import { showToast } from './utils.js';

// ===== Skill Management =====

export async function createSkill(name, icon = '⭐', category = null) {
  if (!auth.isAuthenticated) {
    showToast('Please log in to track skills', 'warning');
    return null;
  }

  try {
    const result = await convex.mutation(api.gamification.addSkill, {
      username: auth.username,
      name,
      icon,
      category,
    });

    if (result.ok) {
      // Add to local state
      const skill = {
        id: result.skillId,
        name,
        icon,
        category,
        xp: 0,
        level: 1,
        streak: { currentStreak: 0, longestStreak: 0 },
      };

      gamification.skills.push(skill);
      showToast(`Skill "${name}" created!`, 'success');
      return skill;
    } else {
      showToast(`Failed to create skill: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error creating skill:', error);
    showToast('Error creating skill', 'error');
  }

  return null;
}

export async function loadUserSkills() {
  if (!auth.isAuthenticated) return;

  try {
    const result = await convex.query(api.gamification.listSkills, {
      username: auth.username,
    });

    if (result.ok) {
      gamification.skills = result.skills;

      // Calculate total XP and user level
      recalculateGlobalStats();

      // Update nodes with skill data
      syncSkillDataToNodes();
      renderXPBars();
    }
  } catch (error) {
    console.error('Error loading skills:', error);
  }
}

export function recalculateGlobalStats() {
  // Calculate total XP across all skills
  const totalXP = gamification.skills.reduce((sum, skill) => sum + skill.xp, 0);
  gamification.totalXP = totalXP;

  // Calculate user level from total XP
  gamification.userLevel = calculateLevelFromXP(totalXP);

  // Update UI
  if (window.updateUserLevelIndicator) {
    window.updateUserLevelIndicator();
  }
}

export async function loadUserBadges() {
  if (!auth.isAuthenticated) return;

  try {
    const result = await convex.query(api.gamification.getUserBadges, {
      username: auth.username,
    });

    if (result.ok) {
      gamification.badges = result.badges;
    }
  } catch (error) {
    console.error('Error loading badges:', error);
  }
}

export async function loadAllUserData() {
  await Promise.all([
    loadUserSkills(),
    loadUserBadges(),
  ]);
}

export async function getSkillByName(name) {
  if (!auth.isAuthenticated) return null;

  return gamification.skills.find(s => s.name === name) || null;
}

// ===== XP & Leveling =====

export async function gainXP(nodeId, xpAmount, notes = null) {
  if (!auth.isAuthenticated) {
    showToast('Please log in to track XP', 'warning');
    return false;
  }

  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return false;

  // Get or create skill for this node
  let skill = await getSkillByName(node.text);
  if (!skill && node.skillId) {
    skill = gamification.skills.find(s => s.id === node.skillId);
  }

  if (!skill) {
    // Auto-create skill if it doesn't exist
    skill = await createSkill(node.text, node.icon || '⭐', 'General');
    if (skill) {
      node.skillId = skill.id;
    }
  }

  if (!skill) return false;

  try {
    const oldXP = skill.xp;
    const oldLevel = skill.level;

    // Calculate new XP and level
    const newXP = oldXP + xpAmount;
    const newLevel = calculateLevelFromXP(newXP);

    // Update skill in database
    const result = await convex.mutation(api.gamification.updateSkill, {
      skillId: skill.id,
      username: auth.username,
      xp: newXP,
      level: newLevel,
    });

    if (result.ok) {
      // Update local state
      skill.xp = newXP;
      skill.level = newLevel;

      // Update node
      node.xp = newXP;
      node.level = newLevel;

      // Recalculate global stats
      recalculateGlobalStats();

      // Animate XP gain
      animateXPGain(nodeId, xpAmount);

      // Check for level up
      if (newLevel > oldLevel) {
        animateLevelUp(nodeId, oldLevel, newLevel);

        // Check for badge awards
        setTimeout(() => {
          checkForAchievements();
        }, 1000);
      }

      // Update visual
      renderXPBars();

      // Log session
      await logSession(skill.id, 30, notes); // Default 30 min session

      return true;
    } else {
      showToast(`Failed to update XP: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error gaining XP:', error);
    showToast('Error updating XP', 'error');
  }

  return false;
}

// ===== Session Logging =====

export async function logSession(skillId, duration = 30, notes = null) {
  if (!auth.isAuthenticated) return false;

  try {
    const result = await convex.mutation(api.gamification.logSession, {
      username: auth.username,
      skillId,
      duration,
      notes,
    });

    if (result.ok) {
      // Update streak in local state
      const skill = gamification.skills.find(s => s.id === skillId);
      if (skill) {
        if (!skill.streak) skill.streak = {};
        skill.streak.currentStreak = result.streak;
        if (result.streak > (skill.streak.longestStreak || 0)) {
          skill.streak.longestStreak = result.streak;
        }
      }

      // Show streak milestone
      if (result.streak && [3, 7, 14, 30, 50, 100].includes(result.streak)) {
        setTimeout(() => {
          showToast(`🔥 ${result.streak} day streak! Keep it up!`, 'success', 4000);
        }, 500);
      }

      renderXPBars();
      return true;
    }
  } catch (error) {
    console.error('Error logging session:', error);
  }

  return false;
}

// ===== Badge System =====

export async function checkForAchievements() {
  if (!auth.isAuthenticated) return;

  try {
    const result = await convex.mutation(api.gamification.checkAndAwardBadges, {
      username: auth.username,
    });

    if (result.ok && result.newBadges.length > 0) {
      // Add new badges to local state
      if (!gamification.badges) gamification.badges = [];
      gamification.badges.push(...result.newBadges);

      // Show badge earned notifications
      result.newBadges.forEach((badge, index) => {
        setTimeout(() => {
          showBadgeEarned(badge);
        }, index * 1500);
      });

      renderBadgeShelf();
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

export async function loadUserBadges() {
  if (!auth.isAuthenticated) return;

  try {
    const result = await convex.query(api.gamification.getUserBadges, {
      username: auth.username,
    });

    if (result.ok) {
      gamification.badges = result.badges;
      renderBadgeShelf();
    }
  } catch (error) {
    console.error('Error loading badges:', error);
  }
}

function showBadgeEarned(badge) {
  const notification = document.createElement('div');
  notification.className = 'badge-earned-notification';
  notification.innerHTML = `
    <div class="badge-earned-content">
      <div class="badge-earned-icon ${badge.tier}">${badge.icon}</div>
      <div class="badge-earned-text">
        <div class="badge-earned-title">Badge Earned!</div>
        <div class="badge-earned-name">${badge.name}</div>
      </div>
    </div>
  `;
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);

  showToast(`🏆 Badge earned: ${badge.name}`, 'success', 5000);
}

// ===== Badge Shelf Rendering =====

export async function renderBadgeShelf() {
  const existingShelf = document.getElementById('badge-shelf-container');
  if (existingShelf) {
    existingShelf.remove();
  }

  const sidebarInner = document.getElementById('sidebar-inner');
  if (!sidebarInner) return;

  const section = document.createElement('div');
  section.className = 'sidebar-section';
  section.id = 'badge-shelf-container';

  const header = document.createElement('div');
  header.className = 'sidebar-section-header';
  header.onclick = () => toggleSection('badge-shelf-container');
  header.innerHTML = `
    <span>🏆 Achievements</span>
    <svg viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const body = document.createElement('div');
  body.className = 'sidebar-section-body';

  if (auth.isAuthenticated) {
    try {
      // Get badge progress from backend
      const result = await convex.query(api.gamification.getBadgeProgress, {
        username: auth.username,
      });

      if (result.ok) {
        const earnedBadges = result.badges.filter(b => b.isEarned);
        const lockedBadges = result.badges.filter(b => !b.isEarned);

        // Badge stats
        const stats = createBadgeStats(earnedBadges.length, result.badges.length);
        body.appendChild(stats);

        // Earned badges shelf
        if (earnedBadges.length > 0) {
          const earnedSection = createEarnedBadgesShelf(earnedBadges);
          body.appendChild(earnedSection);
        }

        // Progress toward next badges
        const inProgress = lockedBadges.filter(b => b.progress > 0);
        if (inProgress.length > 0) {
          const progressSection = createBadgeProgressSection(inProgress.slice(0, 3));
          body.appendChild(progressSection);
        }

        // View all button
        const viewAllBtn = document.createElement('button');
        viewAllBtn.className = 'btn btn-ghost btn-sm';
        viewAllBtn.textContent = 'View All Achievements';
        viewAllBtn.onclick = () => showBadgeGallery();
        viewAllBtn.style.marginTop = '12px';
        viewAllBtn.style.width = '100%';
        body.appendChild(viewAllBtn);

      } else {
        body.innerHTML = `<p style="color: var(--text-secondary); font-size: 12px;">Error loading badges: ${result.error}</p>`;
      }
    } catch (error) {
      console.error('Error loading badge progress:', error);
      body.innerHTML = '<p style="color: var(--text-secondary); font-size: 12px;">Failed to load achievements</p>';
    }
  } else {
    body.innerHTML = '<p style="color: var(--text-secondary); font-size: 12px;">Login to track achievements</p>';
    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn btn-primary';
    loginBtn.textContent = 'Login';
    loginBtn.onclick = () => showLoginModal();
    body.appendChild(loginBtn);
  }

  section.appendChild(header);
  section.appendChild(body);

  // Add after markers section
  const markersSection = document.getElementById('section-markers');
  if (markersSection) {
    markersSection.insertAdjacentElement('afterend', section);
  } else {
    sidebarInner.appendChild(section);
  }
}

function createBadgeStats(earned, total) {
  const container = document.createElement('div');
  container.className = 'badge-stats';
  container.innerHTML = `
    <div class="stat-row">
      <span class="stat-label">Earned:</span>
      <span class="stat-value">${earned} / ${total}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${(earned / total) * 100}%"></div>
    </div>
  `;
  return container;
}

function createEarnedBadgesShelf(badges) {
  const container = document.createElement('div');
  container.className = 'earned-badges-section';

  const subtitle = document.createElement('div');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = 'Earned Badges';
  container.appendChild(subtitle);

  const shelf = document.createElement('div');
  shelf.className = 'badge-shelf';

  badges.slice(0, 12).forEach(badge => {
    const item = document.createElement('div');
    item.className = `badge-item ${badge.tier} earned`;
    item.innerHTML = badge.icon;
    item.onclick = () => showBadgeDetail(badge);
    item.title = `${badge.name}: ${badge.description}`;
    shelf.appendChild(item);
  });

  if (badges.length > 12) {
    const more = document.createElement('div');
    more.className = 'badge-item more-indicator';
    more.innerHTML = `+${badges.length - 12}`;
    more.onclick = () => showBadgeGallery();
    shelf.appendChild(more);
  }

  container.appendChild(shelf);
  return container;
}

function createBadgeProgressSection(badges) {
  const container = document.createElement('div');
  container.className = 'badge-progress-section';

  const subtitle = document.createElement('div');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = 'In Progress';
  container.appendChild(subtitle);

  badges.forEach(badge => {
    const item = document.createElement('div');
    item.className = 'badge-progress-item';
    item.innerHTML = `
      <div class="badge-progress-icon ${badge.tier}">${badge.icon}</div>
      <div class="badge-progress-info">
        <div class="badge-name">${badge.name}</div>
        <div class="badge-description">${badge.description}</div>
        <div class="progress-bar small">
          <div class="progress-fill ${badge.tier}" style="width: ${badge.progress}%"></div>
        </div>
        <div class="badge-progress-text">${badge.current} / ${badge.target}</div>
      </div>
    `;
    container.appendChild(item);
  });

  return container;
}

export function showBadgeDetail(badge) {
  const content = createElement('div', 'badge-detail-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Badge Details</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="badge-detail-card ${badge.tier}">
        <div class="badge-icon-large">${badge.icon}</div>
        <div class="badge-info">
          <h3 class="badge-name">${badge.name}</h3>
          <p class="badge-description">${badge.description}</p>
          <div class="badge-meta">
            <span class="badge-tier ${badge.tier}">${badge.tier.toUpperCase()}</span>
            <span class="badge-requirement">${formatRequirement(badge)}</span>
          </div>
        </div>
      </div>
      ${badge.isEarned ? `
        <div class="badge-status earned">
          <div class="status-icon">✓</div>
          <div class="status-text">
            <div class="status-title">Badge Earned!</div>
            <div class="status-date">Earned on ${formatDate(badge.earnedAt)}</div>
          </div>
        </div>
      ` : `
        <div class="badge-status locked">
          <div class="status-icon">🔒</div>
          <div class="status-text">
            <div class="status-title">Not Yet Earned</div>
            <div class="status-progress">
              <div class="progress-bar">
                <div class="progress-fill ${badge.tier}" style="width: ${badge.progress}%"></div>
              </div>
              <span class="progress-text">${badge.current} / ${badge.target}</span>
            </div>
          </div>
        </div>
      `}
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="window.closeModal()">Close</button>
    </div>
  `;

  showModal(content);
}

export function showBadgeGallery() {
  const content = createElement('div', 'badge-gallery-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>All Achievements</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="badge-filters">
        <button class="filter-btn active" data-tier="all">All</button>
        <button class="filter-btn" data-tier="bronze">Bronze</button>
        <button class="filter-btn" data-tier="silver">Silver</button>
        <button class="filter-btn" data-tier="gold">Gold</button>
        <button class="filter-btn" data-tier="platinum">Platinum</button>
      </div>
      <div id="badge-gallery-grid" class="badge-gallery-grid"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="window.closeModal()">Close</button>
    </div>
  `;

  showModal(content);

  const grid = content.querySelector('#badge-gallery-grid');
  const filters = content.querySelectorAll('.filter-btn');

  // Load badge progress
  convex.query(api.gamification.getBadgeProgress, { username: auth.username })
    .then(result => {
      if (result.ok) {
        renderBadgeGallery(grid, result.badges, 'all');

        filters.forEach(btn => {
          btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBadgeGallery(grid, result.badges, btn.dataset.tier);
          });
        });
      }
    });
}

function renderBadgeGallery(container, badges, tierFilter) {
  const filtered = tierFilter === 'all' ? badges : badges.filter(b => b.tier === tierFilter);

  clearElement(container);

  filtered.forEach(badge => {
    const item = document.createElement('div');
    item.className = `badge-gallery-item ${badge.tier} ${badge.isEarned ? 'earned' : 'locked'}`;
    item.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-description">${badge.description}</div>
      <div class="badge-progress">
        ${badge.isEarned ?
          '<div class="badge-earned">✓ Earned</div>' :
          `<div class="progress-bar small">
             <div class="progress-fill ${badge.tier}" style="width: ${badge.progress}%"></div>
           </div>
           <div class="progress-text">${badge.current} / ${badge.target}</div>`
        }
      </div>
    `;
    item.onclick = () => showBadgeDetail(badge);
    container.appendChild(item);
  });
}

// ===== Helper Functions =====

function formatRequirement(badge) {
  const type = badge.requirementType;
  const value = badge.requirementValue;

  switch (type) {
    case 'skill_level': return `Reach level ${value}`;
    case 'skill_count': return `Create ${value} skills`;
    case 'session_count': return `${value} sessions`;
    case 'streak_days': return `${value} day streak`;
    case 'total_xp': return `${value} total XP`;
    default: return 'Complete requirement';
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'Not earned yet';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ===== User Level Rendering =====

export function renderUserLevel() {
  const existingIndicator = document.getElementById('user-level-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  if (!auth.isAuthenticated) return;

  const header = document.querySelector('.header-bar');
  if (!header) return;
  const indicator = document.createElement('div');
  indicator.className = 'user-level-indicator';
  indicator.id = 'user-level-indicator';

  // Calculate total XP across all skills
  const totalXP = gamification.skills.reduce((sum, skill) => sum + (skill.xp || 0), 0);
  const userLevel = calculateLevelFromXP(totalXP);
  const xpToNext = xpToNextLevel(totalXP, userLevel);
  const totalNeeded = calculateXPForLevel(userLevel);
  const currentLevelXP = totalNeeded - xpToNext;
  const progress = ((totalXP - currentLevelXP) / (totalNeeded - currentLevelXP)) * 100;

  indicator.innerHTML = `
    <span>Level ${userLevel}</span>
    <div class="user-level-bar">
      <div class="user-level-fill" style="width: ${Math.min(100, progress)}%"></div>
    </div>
  `;

  header.insertBefore(indicator, header.querySelector('.header-right'));
}

// ===== Sync Functions =====

function syncSkillDataToNodes() {
  gamification.skills.forEach(skill => {
    // Find node with matching name or skillId
    const node = state.nodes.find(n =>
      n.text === skill.name || n.skillId === skill.id
    );

    if (node) {
      node.skillId = skill.id;
      node.xp = skill.xp;
      node.level = skill.level;
      node.icon = skill.icon;
      node.streak = skill.streak;
    }
  });
}

// ===== Auto-save Integration =====

let autoSaveInterval;

export function startAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  // Auto-save every 30 seconds if authenticated
  autoSaveInterval = setInterval(() => {
    if (auth.isAuthenticated && state.title !== 'Untitled Map') {
      // Implementation in roadmaps module - placeholder
      console.log('Auto-saving...');
    }
  }, 30000);
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// ===== Re-export for convenience =====
export {
  calculateXPForLevel,
  xpToNextLevel,
  calculateLevelFromXP,
} from './state.js';
