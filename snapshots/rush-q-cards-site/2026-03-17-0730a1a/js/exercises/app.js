// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { loadAllCards } from '../shared/cards-data.js';
import { state } from './state.js';
import { evaluate } from './evaluator.js';
import { findMatchingDecision, evaluateCustomDecision, evaluateDecision } from './scoring-engine.js';
import { PROFILES, getCounterHand } from './profiles.js';
import { renderLanding, renderScenario } from './render.js';
import '../shared/nav.js';

async function init() {
  state.allCards = await loadAllCards();

  // Try to load v2 scenarios first, fallback to v1
  try {
    const resp = await fetch('../data/scenarios-v2.json');
    if (resp.ok) {
      state.scenariosV2 = await resp.json();
      state.useV2Scoring = true;
    } else {
      throw new Error('v2 scenarios not available');
    }
  } catch (e) {
    // Fallback to v1 scenarios
    const resp = await fetch('../data/scenarios.json');
    state.scenarios = await resp.json();
    state.useV2Scoring = false;
  }

  renderLanding();
}

window._selectRole = function(role) {
  state.role = role;

  // Use v2 scenarios if available
  const scenarios = state.useV2Scoring ? state.scenariosV2 : state.scenarios;
  const filtered = scenarios.filter(s => s.role === role);

  if (!filtered.length) return;
  const idx = Math.floor(Math.random() * filtered.length);
  const scenario = filtered[idx];

  // Reset state
  state.currentScenario = scenario;
  state.currentDecision = null;
  state.evaluationResult = null;
  state.selectedProfile = null;
  state.targetProfile = null;
  state.selectedCards = [];
  state.submitted = false;
  state.hintsRevealed = 0;
  state.attemptCount = 0;

  renderScenario();
};

window._selectScenarioCard = function(cardName) {
  if (state.submitted) return;
  const idx = state.selectedCards.indexOf(cardName);
  if (idx >= 0) state.selectedCards.splice(idx, 1);
  else state.selectedCards.push(cardName);
  renderScenario();
};

window._submitAnswer = async function() {
  state.attemptCount++;
  state.submitted = true;

  const stats = _loadStats();
  const sc = state.currentScenario;
  if (!stats[sc.id]) {
    stats[sc.id] = { attempts: 0, completions: 0, bestScore: 0, hintsUsed: 0, v2Results: [] };
  }
  stats[sc.id].attempts++;
  state.completionStats = stats;

  // Use v2 scoring engine if enabled
  if (state.useV2Scoring) {
    const decision = findMatchingDecision(state.selectedCards, sc, state.targetProfile);

    if (decision) {
      state.evaluationResult = evaluateDecision(sc, decision, null, state.targetProfile);
    } else {
      // Custom decision (not in scenario)
      state.evaluationResult = evaluateCustomDecision(
        state.selectedCards,
        sc,
        state.allCards,
        state.targetProfile
      );
    }
  }

  renderScenario();
};

window._revealHint = function() {
  state.hintsRevealed++;
  renderScenario();
};

window._nextScenario = function() {
  if (state.submitted && state.currentScenario) {
    const stats = _loadStats();
    const sc = state.currentScenario;

    if (stats[sc.id]) {
      const score = state.useV2Scoring ? state.evaluationResult?.score : evaluate(sc, state.selectedCards).score;

      stats[sc.id].completions++;
      stats[sc.id].bestScore = Math.max(stats[sc.id].bestScore || 0, score);
      stats[sc.id].hintsUsed = (stats[sc.id].hintsUsed || 0) + state.hintsRevealed;

      // Save v2 result if available
      if (state.useV2Scoring && state.evaluationResult) {
        if (!stats[sc.id].v2Results) stats[sc.id].v2Results = [];
        stats[sc.id].v2Results.push({
          timestamp: Date.now(),
          score: state.evaluationResult.score,
          classification: state.evaluationResult.classification,
          cards: state.selectedCards,
          dimensions: state.evaluationResult.endState
        });
      }

      _saveStats(stats);
    }
  }

  window._selectRole(state.role);
};

window._backToLanding = function() {
  document.getElementById('landing').classList.remove('hidden');
  document.getElementById('scenario').classList.add('hidden');
};

window._resetScenario = function() {
  state.selectedCards = [];
  state.submitted = false;
  state.attemptCount = 0;
  renderScenario();
};

window._selectProfile = function(profileKey) {
  state.selectedProfile = profileKey;

  // If scenario has profile hands, use them
  if (state.currentScenario.profileHands && state.currentScenario.profileHands[profileKey]) {
    state.currentScenario.hand = state.currentScenario.profileHands[profileKey].slice();
  }

  state.selectedCards = [];
  renderScenario();
};

window._selectTargetProfile = function(profileKey) {
  state.targetProfile = profileKey;
  state.selectedProfile = 'counter-profile';

  // Get hand designed to counter this profile
  const counterHand = getCounterHand(profileKey);
  if (counterHand) {
    state.currentScenario.hand = counterHand.slice();
  }

  state.selectedCards = [];
  renderScenario();
};

window._setDifficulty = function(difficulty) {
  state.selectedDifficulty = difficulty;
  renderLanding();
};

window._showProfileComparison = function(profileKey) {
  const sc = state.currentScenario;
  if (!sc || !sc.profileHands || !sc.profileHands[profileKey]) return;

  // Find the best decision for this profile
  const profileHand = sc.profileHands[profileKey];
  let bestDecision = null;
  let bestScore = -999;

  for (const decision of sc.decisions) {
    const matches = decision.cards.filter(card => profileHand.includes(card)).length;
    if (matches > 0) { // At least some cards match
      const result = evaluateDecision(sc, decision, null, state.targetProfile);
      if (result.score > bestScore) {
        bestScore = result.score;
        bestDecision = { ...decision, result };
      }
    }
  }

  if (!bestDecision) return;

  // Show comparison
  state.showingProfileComparison = {
    profile: profileKey,
    decision: bestDecision,
    yourResult: state.evaluationResult
  };

  renderScenario();
};

window._hideProfileComparison = function() {
  state.showingProfileComparison = null;
  renderScenario();
};

function _loadStats() {
  try {
    const stats = localStorage.getItem('rush-q-exercise-stats');
    return stats ? JSON.parse(stats) : {};
  } catch (e) {
    return {};
  }
}

function _saveStats(stats) {
  localStorage.setItem('rush-q-exercise-stats', JSON.stringify(stats));
}

init();
