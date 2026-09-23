// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { state } from './state.js';
import { evaluate, getCommonMistake } from './evaluator.js';
import { DIMENSIONS, evaluateDecision, evaluateCustomDecision, findMatchingDecision, classifyScore, getRelativePerformance } from './scoring-engine.js';
import { PROFILES, getCounterHand } from './profiles.js';
import { renderCardHTML } from '../shared/card-component.js';

const ROLES = [
  {
    key: 'tech-lead',
    icon: '/assets/icons/card-types/hard.svg',
    label: 'Tech Lead',
    desc: 'Project staffing, market trades, events, and game fundamentals.',
    color: '#0ea5e9',
  },
  {
    key: 'eng-manager',
    icon: '/assets/icons/card-types/team.svg',
    label: 'Engineering Manager',
    desc: 'People problems, crises, scope creep, hiring, and team dynamics.',
    color: '#3b82f6',
  },
  {
    key: 'director',
    icon: '/assets/icons/card-types/power.svg',
    label: 'Director',
    desc: 'Strategic decisions, political navigation, risk, and endgame plays.',
    color: '#9333ea',
  },
  {
    key: 'vp-cto',
    icon: '/assets/icons/card-types/talent.svg',
    label: 'VP / CTO',
    desc: 'Org scaling, platform bets, M&A, vendor strategy, and security.',
    color: '#14b8a6',
  },
];

// ── Landing view ─────────────────────────────────────────────
export function renderLanding() {
  const grid = document.getElementById('role-grid');

  // Use v2 scenarios if available, fallback to v1
  const scenarios = state.useV2Scoring ? state.scenariosV2 : state.scenarios;

  // Filter by difficulty if set
  const filteredScenarios = state.selectedDifficulty
    ? scenarios.filter(s => s.difficulty === state.selectedDifficulty)
    : scenarios;

  grid.innerHTML = ROLES.map(r => {
    const count = filteredScenarios.filter(s => s.role === r.key).length;
    const totalCount = scenarios.filter(s => s.role === r.key).length;
    const stats = loadCompletionStats(r.key);
    return `
      <div class="role-card" onclick="_selectRole('${r.key}')" style="--role-color:${r.color}">
        <div class="role-card-icon">
          <img src="${r.icon}" alt="${esc(r.label)}" class="role-card-svg">
        </div>
        <div class="role-card-body">
          <div class="role-card-label">${esc(r.label)}</div>
          <div class="role-card-desc">${esc(r.desc)}</div>
          <div class="role-card-meta">
            <span>${count} scenario${count !== 1 ? 's' : ''}</span>
            ${stats.completed > 0 ? `<span class="role-card-progress">${stats.completed}/${count} done</span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  // Add difficulty filter
  const difficultyFilterHtml = `
    <div class="difficulty-filter" style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
      <label style="color: var(--text-secondary); font-weight: 600;">Difficulty:</label>
      <button class="difficulty-btn ${!state.selectedDifficulty ? 'active' : ''}" onclick="_setDifficulty(null)">All</button>
      <button class="difficulty-btn ${state.selectedDifficulty === 'easy' ? 'active' : ''}" onclick="_setDifficulty('easy')">Easy</button>
      <button class="difficulty-btn ${state.selectedDifficulty === 'medium' ? 'active' : ''}" onclick="_setDifficulty('medium')">Medium</button>
      <button class="difficulty-btn ${state.selectedDifficulty === 'hard' ? 'active' : ''}" onclick="_setDifficulty('hard')">Hard</button>
      <button class="difficulty-btn ${state.selectedDifficulty === 'expert' ? 'active' : ''}" onclick="_setDifficulty('expert')">Expert</button>
    </div>
  `;

  // Insert before grid if not exists
  if (!document.querySelector('.difficulty-filter')) {
    grid.insertAdjacentHTML('beforebegin', difficultyFilterHtml);
  }

  // Add info about scoring system
  if (state.useV2Scoring) {
    const infoHtml = `
      <div class="scoring-info" style="margin-top: 20px; padding: 15px; background: var(--surface-1); border-radius: var(--radius-sm); border-left: 4px solid var(--accent-bright);">
        <strong style="color: var(--accent-bright);">New: Multi-Dimensional Scoring</strong><br>
        <small>Decisions now impact Reputation, Team Morale, Stakeholder Trust, and Technical Debt with temporal effects. Try countering management profiles!</small>
      </div>
    `;
    // Append after grid if not already there
    if (!document.querySelector('.scoring-info')) {
      grid.insertAdjacentHTML('afterend', infoHtml);
    }
  }
}

function loadCompletionStats(role) {
  try {
    const raw = localStorage.getItem('rush-q-exercise-stats');
    if (!raw) return { completed: 0 };
    const stats = JSON.parse(raw);
    const roleScenarios = state.scenarios.filter(s => s.role === role);
    const completed = roleScenarios.filter(s => stats[s.id]?.completions > 0).length;
    return { completed };
  } catch (e) {
    return { completed: 0 };
  }
}

// ── Scenario view ────────────────────────────────────────────
export function renderScenario() {
  const sc = state.currentScenario;
  if (!sc) return;

  document.getElementById('landing').classList.add('hidden');
  const el = document.getElementById('scenario');
  el.classList.remove('hidden');

  const handCards = sc.hand.map(name => {
    const card = state.allCards.find(c => c.name === name);
    return card || { name, type: 'Unknown', emoji: '\u2753' };
  });

  const role = ROLES.find(r => r.key === sc.role);
  const diffColor = sc.difficulty === 'easy' ? '#34d399'
    : sc.difficulty === 'medium' ? '#fbbf24' : '#f43f5e';
  const diffLabel = sc.difficulty.charAt(0).toUpperCase() + sc.difficulty.slice(1);

  let html = '';

  // Back button
  html += `<button class="scenario-back" onclick="_backToLanding()">&larr; Back to exercises</button>`;

  // Setup card
  html += `<div class="scenario-setup">`;
  html += `<div class="scenario-header-row">`;
  html += `<h3 class="scenario-title">${esc(sc.title)}</h3>`;
  html += `<div class="scenario-badges">`;
  if (role) html += `<span class="scenario-badge" style="background:${role.color}22;color:${role.color}">${esc(role.label)}</span>`;
  html += `<span class="scenario-badge" style="background:${diffColor}22;color:${diffColor}">${diffLabel}</span>`;
  html += `<span class="scenario-badge scenario-badge-muted">${esc(sc.category)}</span>`;
  html += `</div></div>`;
  html += `<p class="scenario-setup-text">${esc(sc.setup)}</p>`;

  if (sc.context) {
    html += `<div class="scenario-context">`;
    if (sc.context.project) html += badge('Project', sc.context.project);
    if (sc.context.quarter) html += badge('Quarter', `Q${sc.context.quarter}`);
    if (sc.context.reputation != null) html += badge('Rep', sc.context.reputation);
    html += `</div>`;
  }
  html += `</div>`;

  // Question
  html += `<p class="scenario-question">${esc(sc.question)}</p>`;

  // Hand of cards (shared mini variant)
  const guideline = window.SCENARIO_IDEAL_CARD_COUNTS?.[sc.id] || { min: 2, max: 3 };
  const selectedCount = state.selectedCards.length;
  const guidanceClass = selectedCount === 0 ? 'no-selection' : selectedCount > guideline.max ? 'over-selected' : 'good-selection';

  html += `<div class="scenario-hand">`;

  // Add clear instruction about card selection
  html += `<div class="card-selection-guidance ${guidanceClass}">`;
  html += `<span class="guidance-icon">💡</span> `;
  html += `<span class="guidance-text">${guidanceClass === 'no-selection' ?
    `Select ${guideline.min}-${guideline.max} cards that work together` :
    guidanceClass === 'over-selected' ?
    `Consider using fewer cards - ${guideline.min}-${guideline.max} focused actions beat overcommitting` :
    `Good selection (${selectedCount} cards)`.concat(guideline.explanation ? ` - ${guideline.explanation}` : '')}`;
  html += `</div>`;

  for (const card of handCards) {
    const sel = state.selectedCards.includes(card.name) ? ' rc-selected' : '';
    const disabled = state.submitted ? ' style="pointer-events:none;opacity:.7"' : '';
    const cardHtml = renderCardHTML(card, { variant: 'mini' });
    html += `<div class="scenario-card-wrap${sel}" onclick="_selectScenarioCard('${esc(card.name)}')"${disabled}>${cardHtml}</div>`;
  }
  html += `</div>`;

  // Decision preview (v2 only, before submission)
  if (!state.submitted && state.useV2Scoring && state.selectedCards.length > 0) {
    const preview = generateDecisionPreview(state.selectedCards, sc, state.targetProfile);
    html += renderPreviewHTML(preview);
  }

  // Card synergy hints (v2 only, when 2+ cards selected)
  if (!state.submitted && state.useV2Scoring && state.selectedCards.length >= 2) {
    const synergies = detectSynergies(state.selectedCards, sc, state.allCards);
    html += renderSynergyHTML(synergies);
  }

  // Submit button
  if (!state.submitted) {
    const dis = state.selectedCards.length === 0 ? ' disabled' : '';
    html += `<button class="scenario-submit"${dis} onclick="_submitAnswer()">Submit Answer</button>`;
  }

  // Feedback
  if (state.submitted) {
    let feedbackHTML = '';

    // Use v2 scoring if enabled and result available
    if (state.useV2Scoring && state.evaluationResult) {
      const result = state.evaluationResult;
      const grade = classifyScore(sc, result.score);
      const scoreClass = result.score >= 70 ? 'perfect' : result.score >= 40 ? 'good' : 'partial';

      feedbackHTML = `<div class="scenario-feedback">`;
      feedbackHTML += `<div class="feedback-score ${scoreClass} scoring-v2-score">${result.score} / 100`;
      feedbackHTML += ` <span class="score-grade grade-${grade.grade[0].toLowerCase()}" style="background: ${grade.color}; color: white;">${grade.grade}</span>`;
      feedbackHTML += ` <span class="score-classification" style="color: ${grade.color}; font-weight: 600;">${grade.text}</span>`;
      feedbackHTML += `</div>`;
      feedbackHTML += `<div class="feedback-text">${esc(result.feedback)}</div>`;

      // Relative performance
      const relative = getRelativePerformance(sc.id, result.score);
      if (relative && relative.totalPlays > 5) {
        feedbackHTML += `<div class="relative-performance">`;
        feedbackHTML += `<h4>Performance vs Other Players:</h4>`;
        feedbackHTML += `<div class="performance-stat"><span>Average Score:</span> <span>${relative.averageScore}</span></div>`;
        feedbackHTML += `<div class="performance-stat"><span>Top Score:</span> <span>${relative.topScore}</span></div>`;
        feedbackHTML += `<div class="performance-stat" style="font-weight: 700; color: ${grade.color};"><span>You scored better than:</span> <span>${relative.betterThanPercent}% of players</span></div>`;
        feedbackHTML += `</div>`;
      }

      // ... continue with existing dimension visualization
      if (result.classification !== 'neutral') {
        feedbackHTML += ` <span class="classification-badge ${result.classification}">(${result.classification})</span>`;
      }
      feedbackHTML += `</div>`;
      feedbackHTML += `<div class="feedback-text">${esc(result.feedback)}</div>`;

      // Dimension impact visualization
      const hasDimensionEffects = Object.values(result.dimensions).some(d => d.total !== 0);
      if (hasDimensionEffects) {
        feedbackHTML += `<div class="dimension-impact">`;
        feedbackHTML += `<h4>Multi-dimensional Impact:</h4>`;
        feedbackHTML += `<div class="dimension-grid">`;

        for (const [key, dim] of Object.entries(result.dimensions)) {
          if (dim.total !== 0) {
            const icon = DIMENSIONS[key].icon;
            const name = DIMENSIONS[key].name;
            const sign = dim.total > 0 ? '+' : '';
            const arrow = dim.total > 0 ? '▲' : '▼';

            feedbackHTML += `<div class="dimension-item dimension-${key}">`;
            feedbackHTML += `<span class="dim-icon">${icon}</span> `;
            feedbackHTML += `<span class="dim-name">${name}</span> `;
            feedbackHTML += `<span class="dim-change">${arrow} ${sign}${dim.total}</span>`;
            feedbackHTML += ` <span class="dim-breakdown">(${dim.q1} → ${dim.q2})</span>`;
            feedbackHTML += `</div>`;
          }
        }

        feedbackHTML += `</div></div>`;
      }

      // Critical threshold warnings
      if (result.warnings && result.warnings.length > 0) {
        feedbackHTML += `<div class="critical-warnings">`;
        feedbackHTML += `<h4>⚠️ Critical Thresholds:</h4>`;
        result.warnings.forEach(w => {
          feedbackHTML += `<div class="warning-item">${w.description} (Current: ${w.level})</div>`;
        });
        feedbackHTML += `</div>`;
      }

      // Start vs End state comparison
      feedbackHTML += `<div class="state-comparison">`;
      feedbackHTML += `<h4>State Changes:</h4>`;
      feedbackHTML += `<div class="state-grid">`;

      for (const key of Object.keys(result.startState)) {
        const start = result.startState[key];
        const end = result.endState[key];
        const change = end - start;
        const sign = change > 0 ? '+' : '';
        const icon = DIMENSIONS[key]?.icon || '';
        const name = DIMENSIONS[key]?.name || key;

        if (change !== 0) {
          feedbackHTML += `<div class="state-item">`;
          feedbackHTML += `<span class="state-icon">${icon}</span> `;
          feedbackHTML += `<span class="state-name">${name}:</span> `;
          feedbackHTML += `<span class="state-change">${start} → ${end} (${sign}${change})</span>`;
          feedbackHTML += `</div>`;
        }
      }

      feedbackHTML += `</div></div>`;

      feedbackHTML += `</div>`;
    } else {
      // Original v1 scoring
      const result = evaluate(sc, state.selectedCards);
      const cls = result.score >= 90 ? 'perfect' : result.score >= 60 ? 'good' : 'partial';
      feedbackHTML = `<div class="scenario-feedback">`;
      feedbackHTML += `<div class="feedback-score ${cls}">${result.score} / 100</div>`;
      feedbackHTML += `<div class="feedback-text">${esc(result.feedback)}</div>`;

      const mistake = result.score < 90 ? getCommonMistake(sc, state.selectedCards, state.allCards) : null;
      if (mistake) {
        feedbackHTML += `<div class="common-mistake"><strong>Common mistake:</strong> ${esc(mistake)}</div>`;
      }
      feedbackHTML += `</div>`;
    }

    html += feedbackHTML;

      // Profile comparison (What Would X Do?)
      if (sc.profileHands && !state.showingProfileComparison) {
        html += `<div class="profile-comparison-trigger" style="margin-top: 20px; text-align: center;">`;
        html += `<h4 style="margin-bottom: 12px; color: var(--text-primary);">See How Other Profiles Play This:</h4>`;
        html += `<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">`;

        Object.keys(sc.profileHands).forEach(profileKey => {
          if (profileKey === state.selectedProfile) return;
          const profile = PROFILES[profileKey];
          html += `<button class="btn btn-secondary" onclick="_showProfileComparison('${profileKey}')" style="padding: 8px 16px; font-size: var(--text-sm);">`;
          html += `${profile.name} play →`;
          html += `</button>`;
        });

        html += `</div></div>`;
      }

      // Show profile comparison if enabled
      if (state.showingProfileComparison) {
        const comparison = state.showingProfileComparison;
        const profile = PROFILES[comparison.profile];

        html += `<div class="profile-comparison">`;
        html += `<h4 style="margin-bottom: 16px; color: var(--text-primary);">Profile Comparison</h4>`;
        html += `<button class="scenario-back" onclick="_hideProfileComparison()" style="margin-bottom: 16px;">← Back to your result</button>`;

        html += `<div class="comparison-grid">`;

        // Your play
        html += `<div class="your-play">`;
        html += `<div class="comparison-title">Your Play</div>`;
        html += `<div class="comparison-cards">Cards: ${state.selectedCards.join(', ')}</div>`;
        html += `<div class="comparison-outcome">`;
        html += `<strong>Score: ${comparison.yourResult.score}</strong><br>`;
        html += comparison.yourResult.feedback;
        html += `</div></div>`;

        // Profile play
        html += `<div class="profile-play">`;
        html += `<div class="comparison-title">${profile.name} Play</div>`;
        html += `<div class="comparison-cards">Cards: ${comparison.decision.cards.join(', ')}</div>`;
        html += `<div class="comparison-outcome">`;
        html += `<strong>Score: ${comparison.decision.result.score}</strong><br>`;
        html += comparison.decision.result.feedback;
        html += `</div></div>`;

        html += `</div></div>`;
      }

    html += `<div class="scenario-actions">`;
    const score = state.useV2Scoring ? state.evaluationResult?.score : evaluate(sc, state.selectedCards).score;
    if (score < 90) {
      html += `<button class="btn btn-secondary" onclick="_resetScenario()">Try Again</button>`;
    }
    html += `<button class="btn btn-primary" onclick="_nextScenario()">Next Scenario &rarr;</button>`;
    html += `</div>`;
  }

  // Profile selector (v2 only)
  if (state.useV2Scoring && sc.profileHands) {
    html += `<div class="profile-selector">`;
    html += `<h4>Choose a play style:</h4>`;
    html += `<div class="profile-options">`;

    // Regular profile options
    Object.entries(sc.profileHands).forEach(([key, cards]) => {
      const profile = PROFILES[key];
      const isSelected = state.selectedProfile === key;
      html += `<div class="profile-option ${isSelected ? 'selected' : ''}" onclick="_selectProfile('${key}')">`;
      html += `<div class="profile-name">${profile.name}</div>`;
      html += `<div class="profile-desc">${profile.description}</div>`;
      html += `<div class="profile-philosophy">"${profile.philosophy}"</div>`;
      html += `</div>`;
    });

    // Counter-profile option (if scenario has counterProfile)
    if (sc.counterProfile) {
      const counterProfile = PROFILES[sc.counterProfile];
      const isSelected = state.selectedProfile === 'counter-profile';
      html += `<div class="profile-option counter-option ${isSelected ? 'selected' : ''}" onclick="_selectTargetProfile('${sc.counterProfile}')">`;
      html += `<div class="profile-name">🎯 Counter ${counterProfile.name}</div>`;
      html += `<div class="profile-desc">Get cards that counter ${counterProfile.name} profile</div>`;
      html += `<div class="profile-philosophy">Practice counter-play strategy</div>`;
      html += `</div>`;
    }

    html += `</div>`;
    html += `</div>`;
  }

  // Hints
  if (sc.hints && sc.hints.length > 0 && !state.submitted) {
    html += `<div class="scenario-hints">`;
    for (let i = 0; i < sc.hints.length; i++) {
      if (i < state.hintsRevealed) {
        html += `<div class="hint-text">${esc(sc.hints[i])}</div>`;
      }
    }
    if (state.hintsRevealed < sc.hints.length) {
      html += `<button class="hint-btn" onclick="_revealHint()">Reveal hint (${state.hintsRevealed + 1}/${sc.hints.length})</button>`;
    }
    html += `</div>`;
  }

  el.innerHTML = html;
}

// ── Helpers ──────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Card Combination Synergy Detector ────────────────────────
export function detectSynergies(selectedCards, scenario, allCards = null) {
  if (!state.useV2Scoring || selectedCards.length < 2) {
    return [];
  }

  const synergies = [];
  const cards = allCards || state.allCards || [];

  // Analyze the cards
  const analysis = analyzeCardCombination(selectedCards, cards);

  // Generate synergy hints based on analysis
  if (analysis.hasDefense && analysis.hasAggression) {
    synergies.push({
      quality: 'excellent',
      icon: '⚡',
      text: 'Balanced approach: defense + offense',
      impact: '+15% effectiveness'
    });
  }

  if (analysis.hasPeople && analysis.hasSkill && !analysis.hasProject) {
    synergies.push({
      quality: 'good',
      icon: '👥',
      text: 'Staffing with skills: good foundation',
      impact: 'Team ready'
    });
  }

  // Positive/coordination feedback
  if (analysis.hasPeople && analysis.hasSkill) {
    synergies.push({
      quality: 'excellent',
      icon: '👥',
      text: 'Well-coordinated: people + skills',
      impact: '+10% execution'
    });
  }

  if (analysis.hasSkill && !analysis.hasPeople) {
    synergies.push({
      quality: 'good',
      icon: '💡',
      text: 'Technical focus - watch for resource needs',
      impact: 'Coordination helps'
    });
  }

  if (analysis.count > 4) {
    synergies.push({
      quality: 'conflict',
      icon: '🎯',
      text: 'Too many actions: spreading thin',
      impact: 'Reduced focus'
    });
  }

  if (analysis.matchesProfile) {
    const profile = PROFILES[analysis.matchesProfile];
    synergies.push({
      quality: 'excellent',
      icon: '✨',
      text: `${profile.name} playstyle: ${profile.strength}`,
      impact: 'On-profile bonus'
    });
  }

  if (analysis.countersProfile) {
    const countered = PROFILES[analysis.countersProfile];
    synergies.push({
      quality: 'excellent',
      icon: '🎯',
      text: `Counters ${countered.name}: exploiting weakness`,
      impact: 'Counter bonus'
    });
  }

  return synergies;
}

function analyzeCardCombination(selectedCards, allCards) {
  const analysis = {
    hasPeople: false,
    hasSkill: false,
    hasProject: false,
    hasDefense: false,
    hasAggression: false,
    hasProcess: false,
    count: selectedCards.length,
    matchesProfile: null,
    countersProfile: null
  };

  for (const cardName of selectedCards) {
    const card = allCards.find(c => c.name === cardName);
    if (!card) continue;

    // Categorize by type
    if (card.type === 'Talent') analysis.hasPeople = true;
    if (card.type === 'Project') analysis.hasProject = true;
    if (card.type === 'Soft' || card.type === 'Hard') analysis.hasSkill = true;

    // Categorize by effect
    const effect = (card.skill || '').toLowerCase();
    if (effect.includes('shield') || effect.includes('protect') || effect.includes('negate')) {
      analysis.hasDefense = true;
    }
    if (effect.includes('undermine') || effect.includes('steal') || effect.includes('rush')) {
      analysis.hasAggression = true;
    }
    if (effect.includes('review') || effect.includes('process') || effect.includes('documentation')) {
      analysis.hasProcess = true;
    }
  }

  // Check profile matching
  if (state.selectedProfile && PROFILES[state.selectedProfile]) {
    const profileMatch = matchesProfile(selectedCards, state.selectedProfile);
    if (profileMatch > 0.4) {
      analysis.matchesProfile = state.selectedProfile;
    }
  }

  // Check counter matching
  if (state.targetProfile && PROFILES[state.targetProfile]) {
    const counterProfile = PROFILES[state.targetProfile].counteredBy;
    if (counterProfile && matchesProfile(selectedCards, counterProfile)) {
      analysis.countersProfile = state.targetProfile;
    }
  }

  return analysis;
}

function matchesProfile(cardNames, profileKey) {
  const profile = PROFILES[profileKey];
  if (!profile) return 0;

  const matchingCards = cardNames.filter(card =>
    profile.typicalCards.includes(card)
  ).length;

  return matchingCards / cardNames.length;
}

function renderSynergyHTML(synergies) {
  if (!synergies || synergies.length === 0) {
    return '';
  }

  return `
    <div class="synergy-hints">
      <h4 style="margin-bottom: 12px; color: var(--text-primary); font-weight: 600;">Card Synergies</h4>
      ${synergies.map(synergy => `
        <div class="synergy-hint ${synergy.quality}">
          <span class="synergy-icon">${synergy.icon}</span>
          <span class="synergy-text">${esc(synergy.text)}</span>
          <span class="synergy-impact">${esc(synergy.impact)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Decision Preview System ─────────────────────────────────
export function generateDecisionPreview(selectedCards, scenario, targetProfile = null) {
  if (!state.useV2Scoring || selectedCards.length === 0) {
    return null;
  }

  try {
    const decision = findMatchingDecision(selectedCards, scenario, targetProfile);
    let previewResult;

    if (decision) {
      previewResult = evaluateDecision(scenario, decision, null, targetProfile);
    } else {
      previewResult = evaluateCustomDecision(selectedCards, scenario, state.allCards, targetProfile);
    }

    // Check if we should show preview (based on difficulty/hints)
    const shouldShowPreview = checkPreviewVisibility();

    if (!shouldShowPreview) {
      return { showHint: true };
    }

    return previewResult;
  } catch (error) {
    console.warn('Preview generation failed:', error);
    return null;
  }
}

function checkPreviewVisibility() {
  const sc = state.currentScenario;

  // Always show on easy
  if (sc.difficulty === 'easy') return true;

  // Show if hints have been revealed
  if (state.hintsRevealed > 0) return true;

  // Don't show on hard/expert
  if (sc.difficulty === 'hard' || sc.difficulty === 'expert') return false;

  // Default for medium: show classification but not numbers
  return 'partial';
}

function renderPreviewHTML(preview) {
  if (!preview) return '';

  if (preview.showHint) {
    return `
      <div class="preview-panel preview-hint">
        <div class="preview-title">💡 Decision Preview Available</div>
        <div class="preview-text">Reveal a hint to see projected outcomes!</div>
      </div>
    `;
  }

  const dimensionRows = Object.entries(preview.dimensions)
    .filter(([_, dim]) => dim.total !== 0)
    .map(([key, dim]) => {
      const config = DIMENSIONS[key];
      const sign = dim.total > 0 ? '+' : '';
      const arrow = dim.total > 0 ? '▲' : '▼';
      const colorClass = dim.total > 0 ? 'positive' : 'negative';

      return `
        <div class="dimension-preview ${colorClass}">
          <span class="dim-icon">${config.icon}</span>
          <span class="dim-name">${config.name}</span>
          <span class="dim-arrow">${arrow}</span>
          <span class="dim-value">${sign}${dim.total}</span>
          <span class="dim-breakdown">(Now: ${dim.q1}, Next: ${dim.q2})</span>
        </div>
      `;
    }).join('');

  const classificationText = {
    'on-profile': 'Playing to your strengths',
    'counter-profile': 'Countering opponent profile',
    'neutral': 'Balanced approach'
  }[preview.classification] || 'Strategic play';

  return `
    <div class="preview-panel">
      <div class="preview-title">🔮 Projected Outcome</div>
      <div class="preview-classification">${classificationText}</div>
      <div class="preview-score">Score: ~${preview.score}</div>

      <div class="preview-dimensions">
        ${dimensionRows || '<div class="preview-no-impact">No significant impact</div>'}
      </div>
    </div>
  `;
}

function badge(label, value) {
  return `<span class="scenario-context-badge"><strong>${esc(label)}:</strong> ${esc(String(value))}</span>`;
}

// Close open mini-card tooltips when tapping outside (mobile)
document.addEventListener('click', (e) => {
  if (!e.target.closest('.rc-mini-info')) {
    document.querySelectorAll('.rc-mini--tip-open').forEach(el => el.classList.remove('rc-mini--tip-open'));
  }
});
