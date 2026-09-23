// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Post-game debrief integration ────────────────────────────

import { icon, iconForEmoji } from '../shared/icons.js';
import { generateDebriefQuestions } from './debrief.js';

let currentDebriefStats = null;

/**
 * Show post-game debrief modal.
 * Called when a game ends.
 */
export function showPostGameDebrief(gameStats) {
  currentDebriefStats = gameStats;

  const questions = generateDebriefQuestions(gameStats);
  const modal = document.getElementById('debrief-modal');

  if (!modal) {
    console.warn('Debrief modal not found');
    return;
  }

  // Generate HTML
  let html = `
    <div class="debrief-header">
      <h2>Post-Game Reflection</h2>
      <p>Your reputation: ${gameStats.reputation} | Final position: ${gameStats.finalPosition} of ${gameStats.totalPlayers}</p>
    </div>
  `;

  html += '<div class="debrief-questions">';
  questions.forEach((q, i) => {
    html += `
      <div class="debrief-question">
        <div class="question-header">
          <span class="question-category">${q.category}</span>
          <div class="question-text">${q.question}</div>
        </div>
        <textarea class="debrief-response" placeholder="Reflect on this..." data-question="${i}"></textarea>
        <div class="question-lesson" style="display:none;">
          <strong>Learning:</strong> ${q.lesson}
        </div>
      </div>
    `;
  });
  html += '</div>';

  html += `
    <div class="debrief-actions">
      <button onclick="_closeDebrief()" class="btn btn-secondary">Skip Reflection</button>
      <button onclick="_completeDebrief()" class="btn btn-primary">Save Reflection</button>
    </div>
  `;

  modal.innerHTML = html;
  modal.classList.remove('hidden');

  // Wire up textarea change handlers
  document.querySelectorAll('.debrief-response').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
      const questionIdx = parseInt(e.target.dataset.question);
      const lessonDiv = e.target.parentElement.querySelector('.question-lesson');

      if (e.target.value.trim().length > 10) {
        lessonDiv.style.display = 'block';
      }
    });
  });
}

/**
 * Close debrief modal.
 */
window._closeDebrief = function() {
  const modal = document.getElementById('debrief-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentDebriefStats = null;
};

/**
 * Save debrief responses.
 */
window._completeDebrief = function() {
  const responses = [];
  const textareas = document.querySelectorAll('.debrief-response');

  textareas.forEach(textarea => {
    const questionIdx = parseInt(textarea.dataset.question);
    if (textarea.value.trim()) {
      responses.push({
        questionIdx,
        response: textarea.value.trim()
      });
    }
  });

  // Save to localStorage
  try {
    const debriefHistory = JSON.parse(localStorage.getItem('rush-q-debrief') || '[]');
    debriefHistory.push({
      timestamp: Date.now(),
      stats: currentDebriefStats,
      responses
    });
    localStorage.setItem('rush-q-debrief', JSON.stringify(debriefHistory));
  } catch (e) {
    console.warn('Failed to save debrief:', e);
  }

  // Show completion message
  const modal = document.getElementById('debrief-modal');
  modal.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <h2>${icon('check')} Reflection Complete!</h2>
      <p style="margin: 16px 0;">Your insights have been saved. Reflection accelerates learning.</p>
      <button onclick="_closeDebrief()" class="btn btn-primary">Continue</button>
    </div>
  `;
};

/**
 * Show debrief history for the player.
 */
export function showDebriefHistory() {
  try {
    const history = JSON.parse(localStorage.getItem('rush-q-debrief') || '[]');
    if (!history.length) {
      return '<p>No reflection history yet. Complete a game to see your progress!</p>';
    }

    let html = '<div class="debrief-history">';
    html += `<h3>Reflection History (${history.length} sessions)</h3>`;

    history.slice(-10).reverse().forEach(session => {
      const date = new Date(session.timestamp).toLocaleDateString();
      html += `
        <div class="history-session">
          <div class="session-header">
            <strong>${date}</strong> - Reputation: ${session.stats.reputation}
          </div>
          <div class="session-insights">
            ${session.responses.length} reflection${session.responses.length !== 1 ? 's' : ''} recorded
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  } catch (e) {
    return '<p>Error loading reflection history.</p>';
  }
}
