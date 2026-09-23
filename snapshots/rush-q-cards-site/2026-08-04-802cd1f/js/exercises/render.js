// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { icon, iconForEmoji } from '../shared/icons.js';
import { state } from './state.js';
import { evaluate, getCommonMistake } from './evaluator.js';
import { DIMENSIONS, evaluateDecision, evaluateCustomDecision, findMatchingDecision, classifyScore, getRelativePerformance, evaluateAllApproaches, normalizeScore } from './scoring-engine.js';
import { PROFILES, getCounterHand } from './profiles.js';
import { renderCardHTML, galleryLink } from '../shared/card-component.js';

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

  // Play style bar — visible up top so the player knows the hand they hold
  // reflects a chosen archetype. Defaults to The Hero (set in loadScenario).
  if (state.useV2Scoring) {
    html += renderPlayStyleBar(sc);
  }

  // Question
  html += `<p class="scenario-question">${esc(sc.question)}</p>`;

  // Hand of cards (shared mini variant)
  const guideline = window.SCENARIO_IDEAL_CARD_COUNTS?.[sc.id] || { min: 2, max: 3 };
  const selectedCount = state.selectedCards.length;
  const guidanceClass = selectedCount === 0 ? 'no-selection' : selectedCount > guideline.max ? 'over-selected' : 'good-selection';

  // Clear instruction about card selection (above the hand grid)
  html += `<div class="card-selection-guidance ${guidanceClass}">`;
  html += `<span class="guidance-icon">${icon('lightbulb')}</span> `;
  html += `<span class="guidance-text">${guidanceClass === 'no-selection' ?
    `Pick any ${guideline.min}-${guideline.max} cards you would actually play. There is no single right answer; you will see the tradeoffs your combination makes and how other approaches compare.` :
    guidanceClass === 'over-selected' ?
    `You can submit this, but ${guideline.min}-${guideline.max} focused actions usually beat spreading your team thin. Your call.` :
    `${selectedCount} cards selected`.concat(guideline.explanation ? `. ${guideline.explanation}` : '. Submit to see how this plays out.')}`;
  html += `</div>`;

  html += `<div class="scenario-hand">`;

  for (const card of handCards) {
    const locked = state.lockedSet && state.lockedSet.has(card.name);
    const added = state.addedSet && state.addedSet.has(card.name);
    const emphasized = state.emphasizedSet && state.emphasizedSet.has(card.name);

    const sel = (!locked && state.selectedCards.includes(card.name)) ? ' rc-selected' : '';
    let cls = 'scenario-card-wrap';
    if (sel) cls += sel;
    if (locked) cls += ' ex-locked';
    else if (added) cls += ' ex-added';
    if (emphasized) cls += ' ex-emphasized';

    // Locked cards stay visible but can never be picked; a tooltip explains why
    // your style takes this move off the table. Post-submit disables the rest.
    let attrs = '';
    if (!locked) attrs += ` onclick="_selectScenarioCard('${esc(card.name)}')"`;
    if (locked) {
      attrs += ` title="Your style avoids this: ${esc(state.lockedReasons[card.name] || '')}"`;
    } else if (added) {
      attrs += ` title="You reach for this: ${esc(state.addedReasons[card.name] || '')}"`;
    } else if (emphasized) {
      attrs += ` title="You lean on this heavily."`;
    }
    if (state.submitted && !locked) attrs += ` style="pointer-events:none;opacity:.7"`;

    let badge = '';
    if (locked) badge = `<span class="ex-badge ex-badge-locked" aria-hidden="true">${icon('lock')}</span>`;
    else if (added) badge = `<span class="ex-badge ex-badge-added" aria-hidden="true">+</span>`;
    else if (emphasized) badge = `<span class="ex-badge ex-badge-emphasized" aria-hidden="true">${icon('star')}</span>`;

    const cardHtml = renderCardHTML(card, { variant: 'mini', galleryLink: true });
    html += `<div class="${cls}"${attrs}>${badge}${cardHtml}</div>`;
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
      const displayScore = normalizeScore(sc, result.score);
      const scoreClass = displayScore >= 72 ? 'perfect' : displayScore >= 55 ? 'good' : 'partial';

      feedbackHTML = `<div class="scenario-feedback">`;

      // Framing: this is ONE valid approach, not a pass/fail verdict.
      feedbackHTML += `<div class="feedback-frame">This is one workable approach. It is not the only right answer, every path below trades something for something else.</div>`;

      // Outcome strength (kept, but framed as "how this played out")
      feedbackHTML += `<div class="feedback-score ${scoreClass} scoring-v2-score">${displayScore} / 100`;
      feedbackHTML += ` <span class="score-grade grade-${grade.grade[0].toLowerCase()}" style="background: ${grade.color}; color: #1a120a;">${grade.grade}</span>`;
      feedbackHTML += ` <span class="score-classification" style="color: ${grade.color}; font-weight: 600;">${esc(grade.text)}</span>`;
      if (result.classification !== 'neutral') {
        feedbackHTML += ` <span class="classification-badge ${result.classification}">${esc(result.classification.replace('-', ' '))}</span>`;
      }
      feedbackHTML += `</div>`;

      // Why this works: the reasoning behind the play (from scenario data).
      if (result.reasoning) {
        feedbackHTML += `<div class="feedback-why"><span class="feedback-why-label">Why this works</span>${esc(result.reasoning)}</div>`;
      }
      // The core feedback line.
      feedbackHTML += `<div class="feedback-text">${esc(result.feedback)}</div>`;
      // What it synergizes / what it costs you.
      if (result.synergy) {
        feedbackHTML += `<div class="feedback-synergy"><span class="feedback-synergy-label">How the cards combine</span>${esc(result.synergy)}</div>`;
      }
      if (result.tradeoffs) {
        feedbackHTML += `<div class="feedback-tradeoff"><span class="feedback-tradeoff-label">The tradeoff</span>${esc(result.tradeoffs)}</div>`;
      }

      // Before/after tradeoff bars — cost and gain per dimension at a glance.
      feedbackHTML += `<div class="state-comparison">`;
      feedbackHTML += `<h4>How this choice moved each dimension</h4>`;
      feedbackHTML += `<div class="tradeoff-bars">`;

      for (const key of Object.keys(result.startState)) {
        const dim = DIMENSIONS[key];
        if (!dim) continue;
        const start = result.startState[key];
        const end = result.endState[key];
        const change = end - start;
        const sign = change > 0 ? '+' : '';
        const pct = (v) => Math.max(0, Math.min(100, ((v - dim.min) / (dim.max - dim.min)) * 100));
        const startPct = pct(start);
        const endPct = pct(end);
        const changeCls = change > 0 ? 'gain' : change < 0 ? 'cost' : 'flat';

        feedbackHTML += `<div class="tradeoff-row">`;
        feedbackHTML += `<div class="tradeoff-label"><span class="dim-icon">${dim.icon}</span> ${esc(dim.name)}</div>`;
        feedbackHTML += `<div class="tradeoff-track">`;
        feedbackHTML += `<div class="tradeoff-base" style="width:${Math.min(startPct, endPct)}%"></div>`;
        feedbackHTML += `<div class="tradeoff-delta ${changeCls}" style="left:${Math.min(startPct, endPct)}%; width:${Math.abs(endPct - startPct)}%"></div>`;
        feedbackHTML += `</div>`;
        feedbackHTML += `<div class="tradeoff-value ${changeCls}">${start} → ${end} <span class="tradeoff-change">(${sign}${change})</span></div>`;
        feedbackHTML += `</div>`;
      }
      feedbackHTML += `</div></div>`;

      // Critical threshold warnings (real consequences)
      if (result.warnings && result.warnings.length > 0) {
        feedbackHTML += `<div class="critical-warnings">`;
        feedbackHTML += `<h4>Watch these thresholds</h4>`;
        result.warnings.forEach(w => {
          feedbackHTML += `<div class="warning-item">${w.description} (Current: ${w.level})</div>`;
        });
        feedbackHTML += `</div>`;
      }

      // Blind-spot debrief — did your style's locked-out moves cost you here?
      feedbackHTML += renderBlindSpotDebrief(sc, result);

      // Other valid approaches — always visible, so the player sees this scenario
      // has several legitimate paths with different tradeoff profiles.
      feedbackHTML += renderOtherApproaches(sc, result);

      // Relative performance (only once there's enough data)
      const relative = getRelativePerformance(sc.id, result.score);
      if (relative && relative.totalPlays > 5) {
        feedbackHTML += `<div class="relative-performance">`;
        feedbackHTML += `<h4>Versus other players</h4>`;
        feedbackHTML += `<div class="performance-stat"><span>Average score</span> <span>${relative.averageScore}</span></div>`;
        feedbackHTML += `<div class="performance-stat"><span>Top score</span> <span>${relative.topScore}</span></div>`;
        feedbackHTML += `<div class="performance-stat" style="font-weight: 700; color: ${grade.color};"><span>You scored better than</span> <span>${relative.betterThanPercent}% of players</span></div>`;
        feedbackHTML += `</div>`;
      }

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
    // Always offer a re-try (any combination is a legitimate experiment), and
    // frame the primary action as exploring another way rather than "passing".
    html += `<button class="btn btn-secondary" onclick="_resetScenario()">Try a different combination</button>`;
    html += `<button class="btn btn-primary" onclick="_nextScenario()">Next Scenario &rarr;</button>`;
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

// ── Exercise browser (paginated review list) ─────────────────
const BROWSER_PAGE_SIZE = 8;

export function renderBrowser() {
  const el = document.getElementById('exercise-browser');
  if (!el) return;
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('scenario').classList.add('hidden');
  el.classList.remove('hidden');

  const scenarios = state.useV2Scoring ? state.scenariosV2 : state.scenarios;
  const total = scenarios.length;
  const pages = Math.max(1, Math.ceil(total / BROWSER_PAGE_SIZE));
  const page = Math.min(Math.max(state.browserPage || 0, 0), pages - 1);
  const start = page * BROWSER_PAGE_SIZE;
  const slice = scenarios.slice(start, start + BROWSER_PAGE_SIZE);

  const roleLabel = (key) => (ROLES.find(r => r.key === key) || {}).label || key;

  let html = '';
  html += `<button class="scenario-back" onclick="_closeBrowser()">&larr; Back to exercises</button>`;
  html += `<h2 class="exercise-heading">All Exercises</h2>`;
  html += `<p class="exercise-subheading">${total} scenarios • page ${page + 1} of ${pages}</p>`;

  html += `<div class="browser-list">`;
  slice.forEach((sc) => {
    const diff = sc.difficulty || '—';
    const nDecisions = (sc.decisions || []).length;
    const profiles = sc.profileHands ? Object.keys(sc.profileHands).length : 0;
    html += `<div class="browser-row">
      <div class="browser-row-main">
        <div class="browser-row-title">${esc(sc.title || sc.id)}</div>
        <div class="browser-row-meta">
          <span class="browser-tag">${esc(roleLabel(sc.role))}</span>
          <span class="browser-tag">${esc(diff)}</span>
          <span class="browser-tag">${esc(sc.category || '')}</span>
          <span class="browser-tag">${nDecisions} decision${nDecisions !== 1 ? 's' : ''}</span>
          ${profiles ? `<span class="browser-tag">${profiles} profiles</span>` : ''}
        </div>
        <div class="browser-row-setup">${esc(sc.setup || '')}</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="_openScenarioById('${esc(sc.id)}')">Open</button>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="browser-pager">`;
  html += `<button class="btn btn-sm btn-secondary" ${page === 0 ? 'disabled' : ''} onclick="_browserPage(${page - 1})">Prev</button>`;
  html += `<span class="browser-pager-info">${page + 1} / ${pages}</span>`;
  html += `<button class="btn btn-sm btn-secondary" ${page >= pages - 1 ? 'disabled' : ''} onclick="_browserPage(${page + 1})">Next</button>`;
  html += `</div>`;

  el.innerHTML = html;
}

// ── Helpers ──────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/**
 * Render the scenario's other defined decisions as "other valid approaches", each
 * with its cards, outcome strength, one-line tradeoff, and the dimension it leans
 * on. This makes the learning explicit: the situation has several workable paths,
 * and the player can see how each spends and gains differently versus their own.
 */
function renderOtherApproaches(sc, playerResult) {
  const all = evaluateAllApproaches(sc, state.targetProfile);
  if (all.length < 2) return '';

  const playerCards = [...state.selectedCards].sort().join('|');
  const others = all.filter(a => [...a.cards].sort().join('|') !== playerCards);
  if (!others.length) return '';

  // For each approach, find the dimension it most improves (its "lever").
  const leverOf = (dims) => {
    let best = null;
    for (const [key, d] of Object.entries(dims)) {
      if (!DIMENSIONS[key]) continue;
      if (d.total > 0 && (!best || d.total > best.total)) best = { key, total: d.total };
    }
    return best ? DIMENSIONS[best.key].name : null;
  };

  let html = `<div class="other-approaches">`;
  html += `<h4>Other valid approaches</h4>`;
  html += `<p class="other-approaches-note">Every one of these is a defensible call. They differ in what they protect and what they spend, that is the point.</p>`;

  for (const a of others) {
    const lever = leverOf(a.dimensions);
    const delta = a.score - playerResult.score;
    const cmp = delta > 4 ? `scores higher on the built-in benchmark`
      : delta < -4 ? `scores lower on the benchmark, but may fit your priorities better`
      : `scores about the same, a genuine alternative`;
    html += `<div class="approach-card">`;
    html += `<div class="approach-head">`;
    html += `<span class="approach-cards">${a.cards.map(c => `<span class="approach-chip">${esc(c)}</span>`).join('')}</span>`;
    html += `<span class="approach-score">${normalizeScore(sc, a.score)}</span>`;
    html += `</div>`;
    if (a.reasoning) html += `<div class="approach-reasoning">${esc(a.reasoning)}</div>`;
    if (a.tradeoffs) html += `<div class="approach-tradeoff">${esc(a.tradeoffs)}</div>`;
    html += `<div class="approach-meta">`;
    if (lever) html += `<span class="approach-lever">Leans on ${esc(lever)}</span>`;
    html += `<span class="approach-cmp">${cmp}</span>`;
    html += `</div>`;
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

/**
 * Blind-spot debrief: for the active style's locked cards, re-score the player's
 * selection with that card added. If a locked card would have raised the
 * normalized (0-100) score by at least +8, surface it — the point is to show what
 * your style quietly took off the table. Also adds a comfort-zone note when the
 * winning selection was only emphasized/added cards, and a control-case nudge for
 * "realistic" (which locks nothing).
 */
const BLIND_SPOT_THRESHOLD = 8;

function renderBlindSpotDebrief(sc, playerResult) {
  const profile = PROFILES[state.selectedProfile];
  const styleName = profile ? profile.name : 'this style';

  // Realistic control case: nothing locked, so nothing to reveal.
  if (state.selectedProfile === 'realistic' || !state.lockedSet || state.lockedSet.size === 0) {
    if (state.selectedProfile === 'realistic') {
      return `<div class="blind-spot blind-spot-control">You had every option. Replay this as another style to feel the constraint of a locked hand.</div>`;
    }
    return '';
  }

  const playerNorm = normalizeScore(sc, playerResult.score);
  const findings = [];

  state.lockedSet.forEach((cardName) => {
    if (state.selectedCards.includes(cardName)) return;
    const withCard = [...state.selectedCards, cardName];
    let result;
    try {
      result = evaluateCustomDecision(withCard, sc, state.allCards, state.targetProfile);
    } catch (e) {
      return;
    }
    const norm = normalizeScore(sc, result.score);
    const delta = norm - playerNorm;
    if (delta >= BLIND_SPOT_THRESHOLD) {
      findings.push({ card: cardName, delta, reason: state.lockedReasons[cardName] || '' });
    }
  });

  findings.sort((a, b) => b.delta - a.delta);

  let html = '';
  if (findings.length > 0) {
    html += `<div class="blind-spot">`;
    html += `<h4>Your blind spot</h4>`;
    for (const f of findings) {
      html += `<div class="blind-spot-item">`;
      html += `<span class="blind-spot-card">${esc(f.card)} <span class="blind-spot-delta">+${f.delta}</span></span>`;
      html += `<span class="blind-spot-text">Your style (${esc(styleName)}) locks out ${esc(f.card)}. Here it would have helped — but ${esc(lower(f.reason))}.</span>`;
      html += `</div>`;
    }
    html += `</div>`;
  } else {
    // Comfort-zone note: winning selection stayed inside the style's lane.
    const inLane = state.selectedCards.length > 0 && state.selectedCards.every(
      (c) => state.emphasizedSet.has(c) || state.addedSet.has(c)
    );
    if (inLane) {
      html += `<div class="blind-spot blind-spot-comfort">You stayed inside ${esc(styleName)}'s comfort zone — every card you played is one this style leans on. That is not wrong, but the locked moves above never got a look.</div>`;
    }
  }
  return html;
}

function lower(str) {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
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
      icon: icon('zap'),
      text: 'Balanced approach: defense + offense',
      impact: '+15% effectiveness'
    });
  }

  if (analysis.hasPeople && analysis.hasSkill && !analysis.hasProject) {
    synergies.push({
      quality: 'good',
      icon: icon('users'),
      text: 'Staffing with skills: good foundation',
      impact: 'Team ready'
    });
  }

  // Positive/coordination feedback
  if (analysis.hasPeople && analysis.hasSkill) {
    synergies.push({
      quality: 'excellent',
      icon: icon('users'),
      text: 'Well-coordinated: people + skills',
      impact: '+10% execution'
    });
  }

  if (analysis.hasSkill && !analysis.hasPeople) {
    synergies.push({
      quality: 'good',
      icon: icon('lightbulb'),
      text: 'Technical focus - watch for resource needs',
      impact: 'Coordination helps'
    });
  }

  if (analysis.count > 4) {
    synergies.push({
      quality: 'conflict',
      icon: icon('target'),
      text: 'Too many actions: spreading thin',
      impact: 'Reduced focus'
    });
  }

  if (analysis.matchesProfile) {
    const profile = PROFILES[analysis.matchesProfile];
    synergies.push({
      quality: 'excellent',
      icon: icon('sparkles'),
      text: `${profile.name} playstyle: ${profile.strength}`,
      impact: 'On-profile bonus'
    });
  }

  if (analysis.countersProfile) {
    const countered = PROFILES[analysis.countersProfile];
    synergies.push({
      quality: 'excellent',
      icon: icon('target'),
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
        <div class="preview-title">${icon('lightbulb')} Decision Preview Available</div>
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
      <div class="preview-title">${icon('telescope')} Projected Outcome</div>
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

// ── Play style bar (top of scenario) ─────────────────────────
// Shows the active archetype up front so the player understands the hand they
// are holding reflects a play style, and can switch it in one tap.
function renderPlayStyleBar(sc) {
  const keys = Object.keys(PROFILES);
  // Ordered so The Hero (default) sits first, then Realistic, then the rest.
  const order = ['hero', 'realistic'];
  keys.sort((a, b) => {
    const ia = order.indexOf(a); const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const isCounter = state.selectedProfile === 'counter-profile';
  const activeKey = isCounter ? null : (state.selectedProfile || keys[0]);
  const active = activeKey ? PROFILES[activeKey] : (sc.counterProfile ? PROFILES[sc.counterProfile] : null);
  const activeName = isCounter && active ? `Counter ${active.name}` : (active ? active.name : 'Custom');
  const activePhil = active ? active.philosophy : '';

  let h = `<div class="playstyle-bar">`;
  h += `<div class="playstyle-lede">`;
  h += `<span class="playstyle-eyebrow">Your hand reflects a play style</span>`;
  h += `<span class="playstyle-active">Playing as: <strong>${esc(activeName)}</strong></span>`;
  if (activePhil) h += `<span class="playstyle-phil">"${esc(activePhil)}"</span>`;
  h += `</div>`;

  h += `<div class="playstyle-options" role="group" aria-label="Choose a play style">`;
  keys.forEach((key) => {
    const p = PROFILES[key];
    if (!p) return;
    const sel = (!isCounter && activeKey === key) ? ' selected' : '';
    h += `<button type="button" class="playstyle-chip${sel}" onclick="_selectProfile('${key}')" title="${esc(p.description)}"`;
    h += ` style="--chip-color:${p.color}">`;
    h += `<span class="playstyle-chip-dot"></span>`;
    h += `<span class="playstyle-chip-name">${esc(p.name)}</span>`;
    h += `</button>`;
  });
  // Note: the competitive "Counter <profile>" chip was removed. It came from a
  // PvP framing that does not fit a solo learning tool, and "Realistic" already
  // covers the can't-be-picky, play-what-you-are-dealt hand.
  h += `</div></div>`;
  return h;
}

// Close open mini-card tooltips when tapping outside (mobile)
document.addEventListener('click', (e) => {
  if (!e.target.closest('.rc-mini-info')) {
    document.querySelectorAll('.rc-mini--tip-open').forEach(el => el.classList.remove('rc-mini--tip-open'));
  }
});
