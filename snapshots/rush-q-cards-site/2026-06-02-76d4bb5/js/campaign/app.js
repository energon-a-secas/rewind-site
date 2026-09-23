// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Campaign app entry point ─────────────────────────────────

import { bindEvents } from '../game/events.js';
import { startGame, endHumanTurn, render, save } from '../game/engine.js';
import { state } from '../game/state.js';
import { aiTurn } from '../game/ai.js';
import { $ } from '../game/utils.js';
import { startCampaignGame, checkCampaignEndOfTurn, getCampaignVictoryMessage } from './engine.js';
import { checkCampaignVictory, saveCampaignCompletion } from './state.js';

const campaignBtn = document.getElementById('start-btn');
if (campaignBtn) {
  campaignBtn.addEventListener('click', () => {
    document.body.classList.add('game-active');
    const name = $('player-name').value.trim() || 'Player';
    const mode = window._campaignMode;

    if (!mode) {
      console.error('No campaign mode selected');
      return;
    }

    startCampaignGame(mode, name);
    render(state);
  });
}

const playerNameInput = $('player-name');
if (playerNameInput) {
  playerNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') campaignBtn.click();
  });
}

// Override end turn for campaign victory check
window._endTurn = async function() {
  if (state.currentPlayer !== 0) return;

  // Check if campaign victory is achieved
  if (checkCampaignVictory()) {
    const humanPlayer = state.players[0];
    const stats = {
      reputation: humanPlayer.reputation,
      quarters: state.currentQuarter,
      projects: humanPlayer.projects.filter(p => p.isCompleted).length
    };
    saveCampaignCompletion(window._campaignMode, stats);

    state.gameOver = true;
    state.turnPhase = 'gameOver';
    render(state);
    return;
  }

  // Normal end turn flow
  await endHumanTurn();
};

// Override game over rendering for campaign
const originalRenderGameOver = window._renderGameOver;
window._renderGameOver = function(s) {
  const el = $('game-over-modal');
  el.classList.remove('hidden');

  const humanPlayer = s.players[0];
  const completedProjects = humanPlayer.projects.filter(p => p.isCompleted).length;

  // Check campaign victory
  const isVictory = checkCampaignVictory();

  if (isVictory) {
    // Campaign victory screen
    const title = window._campaignMode === 'easy' ? '🏆 Campaign Complete!' :
                  window._campaignMode === 'medium' ? '🏆 Pressure Cooker Mastered!' :
                  '🏆 Crisis Management Expert!';

    const message = getCampaignVictoryMessage();

    el.innerHTML = `
      <div class="modal-content game-over-content">
        <h2>${title}</h2>
        <div class="standings">
          <div class="winner">
            <span class="standing-medal">🌟</span>
            <span class="standing-name">Campaign Complete!</span>
            <span class="standing-rep">${completedProjects} projects • ${humanPlayer.reputation} rep</span>
          </div>
        </div>
        <div style="margin: 20px 0; padding: 16px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <strong>⭐ Star Rating:</strong> ${getStarRating(humanPlayer.reputation)} stars<br>
          <strong>Final Score:</strong> ${humanPlayer.reputation} reputation<br>
          <strong>Completed:</strong> ${completedProjects} / ${campaignState.projectsCompletedGoal} projects
        </div>
        <button class="btn btn-play" onclick="window._backToCampaign()">Back to Campaign Menu</button>
      </div>
    `;
  } else {
    // Regular game over (failed campaign)
    const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
    const finalPosition = sorted.findIndex(p => p === humanPlayer) + 1;

    el.innerHTML = `
      <div class="modal-content game-over-content">
        <h2>Campaign Failed</h2>
        <div class="standings">
          ${sorted.map((p, i) => {
            const medal = ['🥇','🥈','🥉',''][Math.min(i, 3)];
            return `<div class="standing-row ${i === 0 ? 'winner' : ''}">
              <span class="standing-medal">${medal}</span>
              <span class="standing-name">${escHtml(p.name)}</span>
              <span class="standing-rep">${p.reputation} rep</span>
            </div>`;
          }).join('')}
        </div>
        <p style="margin: 16px 0; color: var(--text-muted);">
          You completed ${completedProjects} / ${campaignState.projectsCompletedGoal} required projects.
        </p>
        <button class="btn btn-play" onclick="window._retryCampaign()">Retry Campaign</button>
        <button class="btn btn-secondary" onclick="window._backToCampaign()" style="margin-top: 12px;">Back to Menu</button>
      </div>
    `;
  }
};

// Campaign navigation functions
window._backToCampaign = function() {
  window.location.href = './';
};

window._retryCampaign = function() {
  // Reset and restart current campaign
  const mode = window._campaignMode;
  const name = state.players?.[0]?.name || 'Player';

  // Clear game state
  state.players = [];
  state.currentQuarter = 1;
  state.currentPlayer = 0;
  state.gameOver = false;
  state.turnPhase = 'setup';

  // Restart campaign
  startCampaignGame(mode, name);
  render(state);
};

// Get star rating for campaign
function getStarRating(reputation) {
  const rating = reputation >= 35 ? 3 : reputation >= 20 ? 2 : 1;
  return '⭐'.repeat(rating);
}

// Original game over handler
window._newGame = function() {
  window.location.reload();
};

// Bind events from main game
bindEvents(state);

// Enhanced rendering for campaign progress
const originalRender = window._originalRender || render;
window._originalRender = originalRender;

window.render = function(s) {
  // Call original render first
  originalRender(s);

  // Update campaign progress display
  updateCampaignProgress(s);
  updateCampaignHeader(s);
};

function updateCampaignProgress(s) {
  if (!window._campaignMode) return;

  const humanPlayer = s.players[0];
  if (!humanPlayer) return;

  const completedProjects = humanPlayer.projects.filter(p => p.isCompleted).length;
  const progressEl = $('projects-progress');

  if (progressEl) {
    progressEl.textContent = `(${completedProjects}/${campaignState.projectsCompletedGoal})`;
  }
}

function updateCampaignHeader(s) {
  if (!$('current-quarter') || !s) return;

  $('current-quarter').textContent = s.currentQuarter;

  // Show/hide favor count based on campaign mode
  const favorEl = $('player-favor');
  if (favorEl && campaignState.modeConfig) {
    favorEl.style.display = campaignState.modeConfig.allowFavors ? 'block' : 'none';
  }
}

// Auto-save campaign progress
let autoSaveTimer = null;
window.addEventListener('beforeunload', () => {
  if (state.turnPhase !== 'setup' && state.turnPhase !== 'gameOver') {
    save(state);
  }
});

// Prevent losing progress if navigating away
window.addEventListener('load', () => {
  if (window.performance?.navigation?.type === 1) {
    console.log('Page refreshed - recovering game state if available');
  }
});

// Expose campaign state to global for debugging
window._campaignDebug = {
  state: campaignState,
  mode: window._campaignMode
};
