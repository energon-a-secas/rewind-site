// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { loadAllCards } from '../shared/cards-data.js';
import { state } from './state.js';
import { evaluate } from './evaluator.js';
import { findMatchingDecision, evaluateCustomDecision, evaluateDecision } from './scoring-engine.js';
import { PROFILES, getCounterHand, buildProfileHand } from './profiles.js';
import { renderLanding, renderScenario, renderBrowser } from './render.js';
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

  const browseBtn = document.getElementById('browse-exercises-btn');
  if (browseBtn) browseBtn.addEventListener('click', () => window._showExerciseBrowser());
}

/**
 * Apply a play style to state: the displayed hand becomes BASELINE_HAND plus the
 * profile's added cards, and the locked/added/emphasized sets are recomputed so
 * render can dim, flag, and gate cards. The hand is scenario-independent.
 */
function applyProfile(scenario, profileKey) {
  const built = buildProfileHand(profileKey);
  state.lockedSet = built.lockedSet;
  state.addedSet = built.addedSet;
  state.emphasizedSet = built.emphasizedSet;
  state.lockedReasons = built.lockedReasons;
  state.addedReasons = built.addedReasons;
  scenario.hand = built.hand.slice();
  // Locked cards can never remain selected.
  state.selectedCards = state.selectedCards.filter(name => !state.lockedSet.has(name));
}

/** Load a scenario into a fresh solving state, with a sensible default profile. */
function loadScenario(scenario) {
  state.currentScenario = scenario;
  state.role = scenario.role;
  state.currentDecision = null;
  state.evaluationResult = null;
  state.selectedProfile = null;
  state.targetProfile = null;
  state.selectedCards = [];
  state.submitted = false;
  state.hintsRevealed = 0;
  state.attemptCount = 0;
  state.showingProfileComparison = null;

  // Reset the baseline sets, then default to a defined play style so the starting
  // hand isn't ambiguous. Every style plays the same ten-card baseline; the style
  // decides which are locked off, leaned on, or added.
  state.lockedSet = new Set();
  state.addedSet = new Set();
  state.emphasizedSet = new Set();
  state.lockedReasons = {};
  state.addedReasons = {};
  if (state.useV2Scoring) {
    state.selectedProfile = PROFILES.hero ? 'hero' : Object.keys(PROFILES)[0];
    applyProfile(scenario, state.selectedProfile);
  }

  document.getElementById('exercise-browser')?.classList.add('hidden');
  renderScenario();
}

window._selectRole = function(role) {
  const scenarios = state.useV2Scoring ? state.scenariosV2 : state.scenarios;
  const filtered = scenarios.filter(s => s.role === role);
  if (!filtered.length) return;
  const idx = Math.floor(Math.random() * filtered.length);
  loadScenario(filtered[idx]);
};

window._selectScenarioCard = function(cardName) {
  if (state.submitted) return;
  // Locked cards are your style's blind spots — visible but off the table.
  if (state.lockedSet && state.lockedSet.has(cardName)) return;
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
  document.getElementById('exercise-browser')?.classList.add('hidden');
};

// ── Exercise browser (paginated review list) ─────────────────
window._showExerciseBrowser = function() {
  state.browserPage = 0;
  renderBrowser();
};

window._browserPage = function(page) {
  state.browserPage = page;
  renderBrowser();
};

window._closeBrowser = function() {
  document.getElementById('exercise-browser').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
};

window._openScenarioById = function(id) {
  const scenarios = state.useV2Scoring ? state.scenariosV2 : state.scenarios;
  const scenario = scenarios.find(s => s.id === id);
  if (scenario) loadScenario(scenario);
};

window._resetScenario = function() {
  state.selectedCards = [];
  state.submitted = false;
  state.attemptCount = 0;
  renderScenario();
};

window._selectProfile = function(profileKey) {
  state.selectedProfile = profileKey;
  // Leaving counter-play mode when picking a regular play style.
  state.targetProfile = null;

  // Rebuild the hand from BASELINE_HAND + this style's added cards, and recompute
  // the locked/added/emphasized sets. Scenario-independent by design.
  state.selectedCards = [];
  applyProfile(state.currentScenario, profileKey);

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
