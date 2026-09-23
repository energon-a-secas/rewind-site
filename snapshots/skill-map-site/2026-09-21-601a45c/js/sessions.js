// ===== Session Logging UI & Streak Tracking =====

import { convex, api, auth, state, gamification } from './state.js';
import { renderXPBars } from './render.js';
import { showToast, showModal, closeModal, escHtml, createElement } from './utils.js';

// ===== Quick Session Logger =====

export function showSessionLogger(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const skill = gamification.skills.find(s => s.name === node.text || s.id === node.skillId);
  if (!skill) {
    showToast('Add some XP to this skill first!', 'warning');
    return;
  }

  const content = createElement('div', 'session-logger-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Log Practice Session</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="session-logger-node">
        <div class="node-icon-large">${skill.icon || '⭐'}</div>
        <div class="node-name">${escHtml(skill.name)}</div>
        <div class="node-level">Level ${skill.level || 1}</div>
      </div>

      <div class="streak-status ${getStreakClass(skill.streak?.currentStreak || 0)}">
        <div class="streak-flame">${skill.streak?.currentStreak ? '🔥' : '⚪️'}</div>
        <div class="streak-info">
          <div class="streak-count">${skill.streak?.currentStreak || 0} day streak</div>
          <div class="streak-best">Best: ${skill.streak?.longestStreak || 0} days</div>
        </div>
      </div>

      <div class="session-duration">
        <label>Duration:</label>
        <div class="duration-buttons">
          <button class="duration-btn" data-duration="15">15 min</button>
          <button class="duration-btn selected" data-duration="30">30 min</button>
          <button class="duration-btn" data-duration="60">1 hour</button>
          <button class="duration-btn" data-duration="90">1.5 hours</button>
          <button class="duration-btn" data-duration="120">2 hours</button>
        </div>
        <div class="custom-duration">
          <input type="number" id="custom-minutes" placeholder="Custom minutes" min="1" max="480">
        </div>
      </div>

      <div class="session-notes">
        <label for="session-notes">Notes (optional):</label>
        <textarea id="session-notes" placeholder="What did you practice? Any observations..."></textarea>
      </div>

      <div class="session-preview">
        You'll gain <strong id="xp-preview">50 XP</strong> from this session
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="log-session-btn">Log Session</button>
    </div>
  `;

  // Wire up duration buttons
  let selectedDuration = 30;
  const durationBtns = content.querySelectorAll('.duration-btn');
  durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      durationBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDuration = parseInt(btn.dataset.duration);
      updateXPPreview(selectedDuration);
      content.querySelector('#custom-minutes').value = '';
    });
  });

  // Custom duration input
  const customInput = content.querySelector('#custom-minutes');
  customInput.addEventListener('input', (e) => {
    const custom = parseInt(e.target.value);
    if (custom && custom > 0) {
      durationBtns.forEach(b => b.classList.remove('selected'));
      selectedDuration = custom;
      updateXPPreview(selectedDuration);
    }
  });

  // Update preview function
  function updateXPPreview(minutes) {
    const xp = calculateXP(minutes);
    content.querySelector('#xp-preview').textContent = `${xp} XP`;
  }

  // Log session button
  content.querySelector('#log-session-btn').addEventListener('click', async () => {
    const notes = content.querySelector('#session-notes').value.trim();
    await logSessionAndClose(skill.id, selectedDuration, notes, nodeId);
  });

  showModal(content);
}

async function logSessionAndClose(skillId, duration, notes, nodeId) {
  const btn = document.getElementById('log-session-btn');
  btn.disabled = true;
  btn.textContent = 'Logging...';

  try {
    const xpGained = calculateXP(duration);

    // Log the session
    const success = await logSession(skillId, duration, notes);

    if (success) {
      // Also add XP
      await window.gainXP(nodeId, xpGained, notes);

      showToast(`Session logged! +${xpGained} XP`, 'success');
      closeModal();

      // Update streak display
      setTimeout(() => renderXPBars(), 100);
    } else {
      showToast('Failed to log session', 'error');
      btn.disabled = false;
      btn.textContent = 'Log Session';
    }
  } catch (error) {
    console.error('Error logging session:', error);
    showToast('Error logging session', 'error');
    btn.disabled = false;
    btn.textContent = 'Log Session';
  }
}

function calculateXP(minutes) {
  // Base XP: 1 XP per minute
  let xp = minutes;

  // Bonus for longer sessions
  if (minutes >= 60) xp += 10;   // +10 bonus for 1 hour
  if (minutes >= 120) xp += 20;  // +30 total bonus for 2 hours

  // Bonus for consistency (streak multiplier)
  // This is applied when actually adding XP

  return Math.floor(xp);
}

function getStreakClass(streak) {
  if (streak >= 30) return 'master';
  if (streak >= 14) return 'gold';
  if (streak >= 7) return 'silver';
  if (streak >= 3) return 'bronze';
  return 'none';
}

// ===== Streak Calendar/Heatmap =====

export function showStreakCalendar(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const skill = gamification.skills.find(s => s.name === node.text || s.id === node.skillId);
  if (!skill) {
    showToast('No skill data found', 'warning');
    return;
  }

  const content = createElement('div', 'streak-calendar-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Practice History: ${escHtml(node.text)}</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="calendar-stats">
        <div class="stat-item">
          <div class="stat-value">${skill.streak?.currentStreak || 0}</div>
          <div class="stat-label">Current Streak</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${skill.streak?.longestStreak || 0}</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="total-sessions">-</div>
          <div class="stat-label">Total Sessions</div>
        </div>
      </div>
      <div id="calendar-container"></div>
      <div class="calendar-legend">
        <div class="legend-item">
          <div class="legend-box level-0"></div>
          <span>No practice</span>
        </div>
        <div class="legend-item">
          <div class="legend-box level-1"></div>
          <span>Light</span>
        </div>
        <div class="legend-item">
          <div class="legend-box level-2"></div>
          <span>Moderate</span>
        </div>
        <div class="legend-item">
          <div class="legend-box level-3"></div>
          <span>Heavy</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="window.closeModal()">Close</button>
    </div>
  `;

  showModal(content);

  // Load session data and render calendar
  loadSessionHistory(nodeId).then(sessions => {
    renderCalendar(content.querySelector('#calendar-container'), sessions);
    content.querySelector('#total-sessions').textContent = sessions.length;
  });
}

async function loadSessionHistory(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  const skill = gamification.skills.find(s => s.name === node.text || s.id === node.skillId);

  if (!skill) return [];

  try {
    // In a real implementation, we'd have a query for this
    // For now, we'll simulate or use the existing data
    // This would query something like: sessions.where({ skillId: skill.id })
    // and return the last 90 days of sessions

    // TODO: Add convex query for session history
    return [];
  } catch (error) {
    console.error('Error loading session history:', error);
    return [];
  }
}

function renderCalendar(container, sessions) {
  const today = new Date();
  const startDate = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago

  const calendar = createElement('div', 'streak-calendar');

  // Generate calendar grid
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dayEl = createElement('div', 'calendar-day');
    const dateStr = d.toISOString().split('T')[0];

    // Check if there's a session for this day
    const sessionCount = getSessionCountForDate(sessions, dateStr);

    dayEl.dataset.date = dateStr;
    dayEl.dataset.count = sessionCount;
    dayEl.classList.add(`level-${Math.min(sessionCount, 3)}`);

    if (d.toDateString() === today.toDateString()) {
      dayEl.classList.add('today');
    }

    dayEl.title = `${dateStr}: ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`;
    calendar.appendChild(dayEl);
  }

  clearElement(container);
  container.appendChild(calendar);
}

function getSessionCountForDate(sessions, dateStr) {
  // This is a placeholder - in real implementation, we'd filter sessions by date
  return Math.floor(Math.random() * 4); // Random for demo
}

// ===== Session History List =====

export function showSessionHistory(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const content = createElement('div', 'session-history-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Session History: ${escHtml(node.text)}</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div id="history-list"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="exportSessions('${nodeId}')">Export CSV</button>
      <button class="btn btn-primary" onclick="window.closeModal()">Close</button>
    </div>
  `;

  showModal(content);

  // Load and display session history
  loadDetailedSessionHistory(nodeId).then(sessions => {
    renderSessionHistory(content.querySelector('#history-list'), sessions);
  });
}

async function loadDetailedSessionHistory(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  const skill = gamification.skills.find(s => s.name === node.text || s.id === node.skillId);

  if (!skill) return [];

  try {
    // TODO: Add convex query for detailed session history
    // Would return sessions with duration, notes, createdAt

    // Mock data for demo
    return Array.from({ length: 20 }, (_, i) => ({
      id: `session-${i}`,
      duration: [15, 30, 60, 90][Math.floor(Math.random() * 4)],
      notes: i % 3 === 0 ? 'Great focus today!' : null,
      createdAt: Date.now() - (i * 24 * 60 * 60 * 1000) + Math.random() * 1000000,
    }));
  } catch (error) {
    console.error('Error loading session history:', error);
    return [];
  }
}

function renderSessionHistory(container, sessions) {
  if (sessions.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No sessions logged yet. Start practicing!</p>';
    return;
  }

  const list = createElement('div', 'session-history-list');

  sessions.forEach(session => {
    const item = createElement('div', 'session-item');
    const date = new Date(session.createdAt);

    item.innerHTML = `
      <div class="session-date">${formatDate(date)}</div>
      <div class="session-duration">${session.duration} minutes</div>
      <div class="session-xp">+${calculateXP(session.duration)} XP</div>
      ${session.notes ? `<div class="session-notes">${escHtml(session.notes)}</div>` : ''}
    `;

    list.appendChild(item);
  });

  clearElement(container);
  container.appendChild(list);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function exportSessions(nodeId) {
  showToast('Export feature coming soon!', 'info');
  // TODO: Implement CSV export
}

// ===== Streak Recovery =====

export function showStreakRecovery(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  const skill = gamification.skills.find(s => s.name === node.text || s.id == node.skillId);

  if (!skill || !skill.streak || skill.streak.currentStreak > 0) return;

  const content = createElement('div', 'streak-recovery-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Streak Broken 😔</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <p>Your ${skill.streak.longestStreak} day streak for "${escHtml(skill.name)}" has ended.</p>
      <p>Don't worry! Start a new session to begin building your streak again.</p>
      <div class="recovery-tip">
        <strong>💡 Tip:</strong> Even 5 minutes of practice counts! Consistency is key.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="window.startRecoverySession('${nodeId}')">Practice Now</button>
    </div>
  `;

  showModal(content);
}

export function startRecoverySession(nodeId) {
  closeModal();
  setTimeout(() => showSessionLogger(nodeId), 100);
}

// ===== Daily Reminders =====

export function checkDailyReminders() {
  if (!auth.isAuthenticated) return;

  const lastCheck = localStorage.getItem('last-daily-check');
  const today = new Date().toDateString();

  if (lastCheck === today) return;

  // Check which skills haven't been practiced today
  const skillsNeedingPractice = gamification.skills.filter(skill => {
    if (!skill.streak || !skill.streak.lastSessionDate) return true;
    const lastSession = new Date(skill.streak.lastSessionDate).toDateString();
    return lastSession !== today;
  });

  if (skillsNeedingPractice.length > 0) {
    showPracticeReminder(skillsNeedingPractice);
  }

  localStorage.setItem('last-daily-check', today);
}

function showPracticeReminder(skills) {
  const content = createElement('div', 'practice-reminder');
  content.innerHTML = `
    <div class="reminder-header">
      <div class="reminder-icon">🎯</div>
      <div class="reminder-title">Time to Practice!</div>
    </div>
    <div class="reminder-skills">
      <p>You have skills ready for practice:</p>
      <ul id="reminder-skills-list"></ul>
    </div>
  `;

  const list = content.querySelector('#reminder-skills-list');
  skills.slice(0, 5).forEach(skill => {
    const li = createElement('li');
    li.textContent = `${skill.icon || '⭐'} ${skill.name}`;
    list.appendChild(li);
  });

  if (skills.length > 5) {
    const more = createElement('li');
    more.textContent = `...and ${skills.length - 5} more`;
    more.style.color = 'var(--text-secondary)';
    list.appendChild(more);
  }

  const toast = showToast('', 'info', 0); // Persistent toast
  toast.appendChild(content);

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 10000);
}

// ===== Keyboard Shortcuts =====

export function setupSessionShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + L to log session for selected node
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      const selectedNode = document.querySelector('.node-selected');
      if (selectedNode) {
        const nodeId = selectedNode.dataset.nodeId;
        showSessionLogger(nodeId);
      }
    }
  });
}

// ===== Re-export functions =====
export { showStreakCalendar, showSessionHistory, showPracticeReminder } from './sessions.js';
