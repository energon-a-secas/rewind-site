// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Multi-dimensional Scoring Engine with Weighted Trade-offs
 *
 * Evaluates decisions across 4 dimensions with temporal effects:
 * - Reputation (0-50): Political capital and standing
 * - Team Morale (0-30): Team health, retention, burnout risk
 * - Stakeholder Trust (0-30): PM/exec confidence
 * - Technical Debt (0-20): Code quality, future velocity drag
 *
 * Each decision has effects for "this quarter" and "next quarter"
 * that compound to create strategic depth.
 */

// Dimension configuration
import { icon } from '../shared/icons.js';

export const DIMENSIONS = {
  reputation: {
    name: 'Reputation',
    min: 0,
    max: 50,
    weight: 1.5, // Most important for final score
    icon: icon('star'),
    description: 'Political capital and standing'
  },
  teamMorale: {
    name: 'Team Morale',
    min: 0,
    max: 30,
    weight: 1.2, // Long-term multiplier
    icon: icon('biceps-flexed'),
    description: 'Team health and retention risk'
  },
  stakeholderTrust: {
    name: 'Stakeholder Trust',
    min: 0,
    max: 30,
    weight: 1.0,
    icon: icon('handshake'),
    description: 'PM, exec, and customer confidence'
  },
  techDebt: {
    name: 'Technical Debt',
    min: 0,
    max: 20,
    weight: 0.8, // Lower weight but important long-term
    icon: icon('wrench'),
    description: 'Code quality and future velocity'
  }
};

// Profile bonus/penalty multipliers
export const PROFILE_MULTIPLIERS = {
  'on-profile': 1.1, // 10% bonus for playing to strength
  'counter-profile': 1.15, // 15% bonus for countering opponent
  'neutral': 1.0
};

// Target card counts for scenarios (helps guide players)
export const SCENARIO_IDEAL_CARD_COUNTS = {
  'scope-creep-v2': { min: 2, max: 3, explanation: "This situation needs 2-3 complementary actions - negotiate scope + staff appropriately" },
  'problem-employee-v2': { min: 2, max: 3, explanation: "Employee issues need multiple interventions: immediate + long-term" },
  'security-incident-v2': { min: 2, max: 4, explanation: "Security incidents need decisive, multi-pronged response" },
  'layoff-decision-v2': { min: 2, max: 3, explanation: "Layoffs need careful planning and team protection" },
  'technical-bankruptcy-v2': { min: 3, max: 4, explanation: "Tech debt crises need sustained, multi-quarter effort" }
};

// Hidden triggers when dimensions hit critical thresholds
export const CRITICAL_THRESHOLDS = {
  teamMorale: {
    threshold: 5,
    event: 'mass_exodus',
    description: 'Team morale critically low - risk of key departures'
  },
  techDebt: {
    threshold: 15,
    event: 'technical_bankruptcy',
    description: 'Technical debt overwhelming - velocity collapse imminent'
  },
  stakeholderTrust: {
    threshold: 5,
    event: 'reorg_risk',
    description: 'Stakeholder trust broken - reorganization likely'
  },
  reputation: {
    threshold: 10,
    event: 'performance_plan',
    description: 'Reputation critical - performance improvement plan activated'
  }
};

/**
 * Evaluate a decision in a scenario
 * @param {Object} scenario - The scenario being played
 * @param {Object} decision - The decision/chosen path
 * @param {Object} initialState - Starting state for dimensions
 * @param {string|null} targetProfile - Profile to counter (or null)
 * @returns {Object} Detailed scoring with all dimensions
 */
export function evaluateDecision(scenario, decision, initialState = null, targetProfile = null) {
  // Use scenario initial state or defaults
  const startState = initialState || scenario.initialState || {
    reputation: 25,
    teamMorale: 20,
    stakeholderTrust: 20,
    techDebt: 10
  };

  // Calculate dimension scores with temporal compounding
  const dimensionScores = {};
  let weightedTotal = 0;
  const dimensionBreakdown = {};

  for (const [key, config] of Object.entries(DIMENSIONS)) {
    // Get quarterly effects [thisQuarter, nextQuarter]
    const effects = decision.effects[key] || [0, 0];
    const q1Effect = effects[0] || 0;
    const q2Effect = effects[1] || 0;

    // Next quarter effect compounds from Q1 final state
    // Example: Q1: 20 → 15 (-5), Q2: +3 → 18 (compounds)
    const compoundedQ2 = q2Effect;

    // Total effect across both quarters
    const totalEffect = q1Effect + compoundedQ2;

    // Calculate final state and clamp to bounds
    const finalState = Math.max(config.min, Math.min(config.max, startState[key] + totalEffect));
    dimensionScores[key] = finalState;

    // Calculate score contribution (positive = better than start)
    const score = totalEffect;
    dimensionBreakdown[key] = {
      q1: q1Effect,
      q2: q2Effect,
      total: totalEffect,
      finalState,
      weighted: score * config.weight
    };

    weightedTotal += score * config.weight;
  }

  // Apply profile multiplier
  const profileClassification = classifyDecisionByProfile(
    decision.cards || [],
    scenario.profile,
    targetProfile,
    typeof PROFILES !== 'undefined' ? PROFILES : {}
  );

  const multiplier = PROFILE_MULTIPLIERS[profileClassification];
  const finalScore = Math.round(weightedTotal * multiplier);

  // Check for critical thresholds
  const warnings = checkCriticalThresholds(dimensionScores);

  // Generate feedback
  const feedback = generateFeedback(decision, dimensionBreakdown, profileClassification);

  return {
    score: finalScore,
    classification: profileClassification,
    multiplier,
    startState,
    endState: dimensionScores,
    dimensions: dimensionBreakdown,
    warnings,
    feedback: decision.feedback || feedback,
    reasoning: decision.reasoning,
    tradeoffs: decision.tradeoffs || null,
    profileNote: decision.profileNote || null,
    synergy: decision.synergy || null,
    matchedDecisionId: decision.id || null,
    partialMatch: decision.partialMatch || false,
    extraCards: decision.extraCards || []
  };
}

/**
 * Evaluate every decision defined in a scenario so the UI can show the player's
 * chosen path alongside the other valid approaches. Each scenario decision is a
 * legitimate way to handle the situation with its own tradeoff profile; there is
 * no single "correct" answer. Returns an array sorted by score (desc), each entry
 * carrying its cards, score, one-line tradeoff, and full dimension breakdown.
 */
export function evaluateAllApproaches(scenario, targetProfile = null) {
  if (!scenario.decisions || !Array.isArray(scenario.decisions)) return [];
  return scenario.decisions
    .map(decision => {
      const result = evaluateDecision(scenario, decision, scenario.initialState, targetProfile);
      return {
        id: decision.id || null,
        cards: decision.cards || [],
        reasoning: decision.reasoning || '',
        tradeoffs: decision.tradeoffs || '',
        profileNote: decision.profileNote || '',
        score: result.score,
        endState: result.endState,
        dimensions: result.dimensions
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Find the best-scoring decision for a set of selected cards
 * @param {Array<string>} selectedCardNames - Names of cards player selected
 * @param {Object} scenario - Complete scenario object
 * @param {string|null} targetProfile - Profile to counter (optional)
 * @returns {Object|null} Best matching decision or null
 */
export function findMatchingDecision(selectedCardNames, scenario, targetProfile = null) {
  if (!scenario.decisions || !Array.isArray(scenario.decisions)) {
    console.warn('Scenario missing decisions array');
    return null;
  }

  // Try to find exact match first (cards sorted and compared)
  const selectedSorted = [...selectedCardNames].sort();

  for (const decision of scenario.decisions) {
    const decisionCards = [...(decision.cards || [])].sort();

    // Exact match (all cards, same count)
    if (selectedSorted.length === decisionCards.length &&
        selectedSorted.every((card, i) => card === decisionCards[i])) {
      return decision;
    }

    // Partial match: player's cards contain decision cards
    // (allows selecting extra cards, but scores lower)
    const includesAllDecisionCards = decisionCards.every(card =>
      selectedSorted.includes(card)
    );

    if (includesAllDecisionCards && selectedSorted.length >= decisionCards.length) {
      // Check if this is the "closest" match
      const extraCards = selectedSorted.filter(card => !decisionCards.includes(card));
      return {
        ...decision,
        partialMatch: true,
        extraCards,
        matchRatio: decisionCards.length / selectedSorted.length
      };
    }
  }

  // No match found - return null so we can generate dynamic evaluation
  return null;
}

/**
 * Evaluate a custom decision not in the scenario
 * @param {Array<string>} selectedCardNames - Player's card selection
 * @param {Object} scenario - Full scenario
 * @param {Object|null} allCards - Card definitions for analysis
 * @returns {Object} Evaluated decision
 */
export function evaluateCustomDecision(
  selectedCardNames,
  scenario,
  allCards = null,
  targetProfile = null
) {
  // Analyze card selection for patterns
  const analysis = analyzeCardSelection(selectedCardNames, allCards);

  // Check what cards are available in hand
  const availablePeople = scenario.hand.some(cardName => {
    const card = allCards?.find(c => c.name === cardName);
    return card && card.type === 'Talent';
  });

  // Generate reasonable effects based on card types and analysis
  const effects = generateEffectsFromAnalysis(analysis, scenario, availablePeople);

  const decision = {
    id: 'custom-' + Date.now(),
    cards: selectedCardNames,
    reasoning: 'Custom play: ' + analysis.summary,
    feedback: generateFeedbackFromAnalysis(analysis, availablePeople), // Only set once here
    effects,
    custom: true
  };

  return evaluateDecision(scenario, decision, scenario.initialState, targetProfile);
}

/**
 * Analyze a set of cards to infer intent and strategy
 */
function analyzeCardSelection(cardNames, allCards) {
  const analysis = {
    hasPeople: false,
    hasSkill: false,
    hasProject: false,
    hasDefense: false,
    hasAggression: false,
    hasProcess: false,
    count: cardNames.length,
    summary: ''
  };

  if (!allCards) {
    analysis.summary = `${cardNames.length} cards selected`;
    return analysis;
  }

  for (const cardName of cardNames) {
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

  // Generate summary
  const parts = [];
  if (analysis.hasPeople) parts.push('staffing');
  if (analysis.hasSkill) parts.push('skill cards');
  if (analysis.hasDefense) parts.push('defensive play');
  if (analysis.hasAggression) parts.push('aggressive');
  if (analysis.hasProcess) parts.push('process-oriented');

  analysis.summary = parts.length > 0
    ? `${parts.join(', ')} approach`
    : `${cardNames.length} cards selected`;

  return analysis;
}

/**
 * Generate effects based on card analysis
 */
function generateEffectsFromAnalysis(analysis, scenario, availablePeople = true) {
  const effects = {};

  for (const key of Object.keys(DIMENSIONS)) {
    effects[key] = [0, 0]; // [thisQuarter, nextQuarter]
  }

  // Base effects based on analysis - gentler penalties, more teaching-oriented
  if (analysis.hasSkill && !analysis.hasPeople && availablePeople) {
    // Learning opportunity: skills work better with people
    effects.reputation[0] -= 1;  // Slight stakeholder concern
    effects.teamMorale[0] -= 1;  // Team wonders about resources
  }

  if (analysis.count > 4) {
    // Overcommitting - noticeable but recoverable
    effects.teamMorale[0] -= 1;  // Initial stress
    effects.reputation[1] -= 1;  // Future delivery concern
  }

  if (analysis.count === 1) {
    // Single focus - can be effective
    effects.reputation[0] += 1;  // Clear priority appreciated
    effects.stakeholderTrust[0] += 1;  // Decision clarity
  }

  if (analysis.hasDefense && analysis.hasAggression) {
    // Balanced approach - rewarded
    effects.stakeholderTrust[0] += 2;  // Strong stakeholder confidence
  }

  // Always add some positive potential to encourage experimentation
  if (Object.values(effects).every(([q1, q2]) => q1 === 0 && q2 === 0)) {
    // No effects yet - add minimal positive to show system working
    effects.reputation[0] += 0.5;  // Small token for engagement
  }

  return effects;
}

/**
 * Generate feedback for custom analysis
 * Connects game mechanics to real-world intuition
 */
function generateFeedbackFromAnalysis(analysis, availablePeople = true) {
  if (analysis.hasSkill && !analysis.hasPeople && availablePeople) {
    return 'Skills are strongest with team support. Consider including staffing cards if available for better execution.';
  }
  if (analysis.count > 4) {
    return 'Overcommitting spreads your team too thin. Fewer, focused actions beat shotgun approaches every time.';
  }
  if (analysis.count === 1) {
    return 'Single focus can be powerful, but most real problems need coordinated actions across multiple dimensions (people, process, communication).';
  }
  if (analysis.hasProject && !analysis.hasPeople) {
    return 'Projects need people. A plan without staffing tends to stall, so budget for both the work and the team.';
  }
  if (analysis.count >= 2 && analysis.count <= 3) {
    return 'This is an off-script combination, not one of the scenario’s modeled plays, so it is scored from the cards’ general shape. Compare it against the modeled approaches below to see how it holds up.';
  }
  return 'This combination is scored from the general shape of the cards rather than a modeled play. The details, communication, and team buy-in would decide it in practice. Compare it with the approaches below.';
}

/**
 * Classify decision by profile alignment
 */
function classifyDecisionByProfile(cardNames, scenarioProfile, targetProfile, allProfiles = null) {
  // Use passed profiles or try module-level if available
  const profiles = allProfiles || (typeof PROFILES !== 'undefined' ? PROFILES : {});

  // If countering a specific profile
  if (targetProfile && profiles[targetProfile]) {
    const profile = profiles[targetProfile];
    const counterKey = profile.counteredBy;
    if (counterKey && matchesProfile(cardNames, counterKey, profiles)) {
      return 'counter-profile';
    }
  }

  // Check if playing to scenario profile
  if (scenarioProfile && matchesProfile(cardNames, scenarioProfile, profiles)) {
    return 'on-profile';
  }

  return 'neutral';
}

/**
 * Check if card selection matches a profile
 */
function matchesProfile(cardNames, profileKey, profiles = {}) {
  const profile = profiles[profileKey];
  if (!profile) return 0;

  const matchingCards = cardNames.filter(card =>
    profile.typicalCards.includes(card)
  ).length;

  return matchingCards >= 2; // At least 2 cards match the profile
}

/**
 * Check for critical threshold warnings
 */
function checkCriticalThresholds(dimensionScores) {
  const warnings = [];

  for (const [key, thresholdData] of Object.entries(CRITICAL_THRESHOLDS)) {
    const current = dimensionScores[key];
    const threshold = thresholdData.threshold;
    const max = DIMENSIONS[key].max;

    // Only show warning if we're AT or below threshold (not approaching)
    if (current <= threshold) {
      const isCritical = current <= (threshold - 2); // 2 points below is critical
      const dangerEmoji = isCritical ? icon('siren') : icon('triangle-alert');

      warnings.push({
        dimension: key,
        level: current,
        threshold: threshold,
        max: max,
        event: thresholdData.event,
        description: `${dangerEmoji} ${thresholdData.description} ${isCritical ? '(CRITICAL)' : '(At Risk)'}
          <span class="threshold-context">Score: ${current}/${max} (Critical below: ${threshold})</span>`,
        isCritical: isCritical
      });
    }
  }

  return warnings;
}

/**
 * Generate dynamic feedback based on dimension scores
 */
function generateFeedback(decision, dimensionBreakdown, classification) {
  // If decision has explicit feedback, use it
  if (decision.feedback && !decision.custom) {
    return decision.feedback;
  }

  // Build feedback based on largest impacts
  const impacts = [];

  for (const [key, data] of Object.entries(dimensionBreakdown)) {
    if (Math.abs(data.total) >= 2) {
      const dim = DIMENSIONS[key];
      const direction = data.total > 0 ? '▼' : '▲';
      impacts.push({
        dim: key,
        name: dim.name,
        total: data.total,
        text: `${direction} ${dim.name}: ${data.total > 0 ? '+' : ''}${data.total}`
      });
    }
  }

  // Sort by absolute impact
  impacts.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

  if (impacts.length === 0) {
    return 'Conservative play. Minimal impact on all dimensions.';
  }

  const topImpacts = impacts.slice(0, 3).map(i => i.text).join(', ');

  let classificationText = '';
  if (classification === 'counter-profile') {
    classificationText = ' Excellent counter-play strategy!';
  } else if (classification === 'on-profile') {
    classificationText = ' Playing to your strengths.';
  }

  return `${topImpacts}${classificationText}`;
}

/**
 * Project future state across multiple quarters
 * @param {Object} initialState - Starting state
 * @param {Array<Object>} decisions - Array of decisions to apply
 * @returns {Array<Object>} State at each quarter
 */
export function projectFuture(initialState, decisions = []) {
  const timeline = [];
  let currentState = { ...initialState };

  // Add initial state
  timeline.push({
    quarter: 0,
    state: { ...currentState },
    decision: null
  });

  // Apply each decision
  decisions.forEach((decision, index) => {
    const quarter = index + 1;

    // Apply first quarter effect immediately
    for (const [key, config] of Object.entries(DIMENSIONS)) {
      const q1Effect = decision.effects[key]?.[0] || 0;
      currentState[key] = Math.max(
        config.min,
        Math.min(config.max, currentState[key] + q1Effect)
      );
    }

    timeline.push({
      quarter,
      state: { ...currentState },
      decision
    });

    // Apply second quarter effect for next iteration
    if (index < decisions.length - 1) {
      for (const key of Object.keys(DIMENSIONS)) {
        const q2Effect = decision.effects[key]?.[1] || 0;
        currentState[key] = Math.max(
          DIMENSIONS[key].min,
          Math.min(DIMENSIONS[key].max, currentState[key] + q2Effect)
        );
      }
    }
  });

  return timeline;
}

/**
 * Compare two decision paths
 */
export function compareDecisionPaths(pathA, pathB, weights = null) {
  const w = weights || Object.fromEntries(
    Object.entries(DIMENSIONS).map(([k, v]) => [k, v.weight])
  );

  const scorePath = (path) => {
    return path.reduce((total, quarter) => {
      return total + Object.entries(quarter.state).reduce((sum, [key, value]) => {
        return sum + (value * w[key]);
      }, 0);
    }, 0);
  };

  return {
    pathAScore: scorePath(pathA),
    pathBScore: scorePath(pathB),
    winner: scorePath(pathA) > scorePath(pathB) ? 'A' : 'B',
    difference: Math.abs(scorePath(pathA) - scorePath(pathB))
  };
}

/**
 * Map a raw weighted score to an honest 0-100 display value using the scenario's
 * benchmark bands, so the displayed number and the letter grade can never
 * contradict each other (the old code showed a raw score like "1" next to "/100"
 * while grading it "D", which read as broken). Each band maps to a fixed display
 * range via linear interpolation.
 */
export function normalizeScore(scenario, score) {
  const b = getBenchmarks(scenario);
  const lerp = (x, x0, x1, y0, y1) => {
    if (x1 === x0) return y1;
    return Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
  };
  if (score >= b.excellent) return Math.min(100, lerp(score, b.excellent, b.excellent + 30, 88, 100));
  if (score >= b.good) return lerp(score, b.good, b.excellent, 72, 88);
  if (score >= b.fair) return lerp(score, b.fair, b.good, 55, 72);
  if (score >= b.poor) return lerp(score, b.poor, b.fair, 35, 55);
  return Math.max(5, lerp(score, b.poor - 30, b.poor, 5, 35));
}

function getBenchmarks(scenario) {
  const defaultBenchmarks = {
    easy: { excellent: 70, good: 50, fair: 25, poor: -5 },
    medium: { excellent: 60, good: 40, fair: 15, poor: -15 },
    hard: { excellent: 50, good: 30, fair: 5, poor: -20 },
    expert: { excellent: 40, good: 25, fair: 0, poor: -25 }
  };
  const difficulty = scenario.difficulty || 'medium';

  // Prefer benchmarks derived from the scenario's OWN authored decisions: the raw
  // weighted effects are small (best ~2-18) and don't match the hardcoded 50-60
  // "excellent" thresholds, so optimal play could never grade above C. Anchoring
  // the bands to the actual best/worst modeled decision makes the strongest
  // authored approach read as excellent and the weakest as poor, which is the
  // teaching intent. Falls back to difficulty defaults when no decisions exist.
  const derived = deriveBenchmarksFromDecisions(scenario);
  if (derived) return derived;

  return { ...defaultBenchmarks[difficulty], ...(scenario.benchmarks || {}) };
}

function deriveBenchmarksFromDecisions(scenario) {
  if (!scenario.decisions || scenario.decisions.length < 2) return null;
  const scores = scenario.decisions.map(d => rawDecisionScore(scenario, d));
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  if (!Number.isFinite(max) || !Number.isFinite(min) || max === min) return null;
  const span = max - min;
  // Best authored decision sits just inside "excellent"; worst sits at "poor".
  return {
    excellent: max - span * 0.15,
    good: min + span * 0.60,
    fair: min + span * 0.30,
    poor: min
  };
}

/** Raw weighted score of a decision, without profile multiplier or normalization. */
function rawDecisionScore(scenario, decision) {
  const startState = scenario.initialState || { reputation: 25, teamMorale: 20, stakeholderTrust: 20, techDebt: 10 };
  let weightedTotal = 0;
  for (const [key, config] of Object.entries(DIMENSIONS)) {
    const effects = decision.effects?.[key] || [0, 0];
    weightedTotal += ((effects[0] || 0) + (effects[1] || 0)) * config.weight;
  }
  return weightedTotal;
}

/**
 * Classify a score using scenario-specific benchmarks
 */
export function classifyScore(scenario, score) {
  const benchmarks = getBenchmarks(scenario);

  if (score >= benchmarks.excellent) {
    return {
      grade: 'A+',
      classification: 'excellent',
      text: 'Excellent strategic thinking!',
      color: '#10b981'
    };
  }

  if (score >= benchmarks.good) {
    return {
      grade: 'B+',
      classification: 'good',
      text: 'Good approach with minor trade-offs',
      color: '#3b82f6'
    };
  }

  if (score >= benchmarks.fair) {
    return {
      grade: 'C',
      classification: 'fair',
      text: 'Reasonable foundation - room to optimize',
      color: '#f59e0b'
    };
  }

  if (score >= benchmarks.poor) {
    return {
      grade: 'D',
      classification: 'poor',
      text: 'Considered approach - try different combinations',
      color: '#f97316'
    };
  }

  // Very negative scores (significant problems)
  return {
    grade: 'F',
    classification: 'critical',
    text: 'Learning opportunity - review the feedback and try again',
    color: '#ef4444'
  };
}

/**
 * Get relative performance data for a scenario
 */
export function getRelativePerformance(scenarioId, userScore) {
  const stats = JSON.parse(localStorage.getItem('rush-q-exercise-stats') || '{}');
  const scenarioStats = stats[scenarioId];

  if (!scenarioStats || !scenarioStats.v2Results || scenarioStats.v2Results.length === 0) {
    return null;
  }

  const allScores = scenarioStats.v2Results.map(r => r.score);
  const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const topScore = Math.max(...allScores);
  const betterThanPercent = (allScores.filter(s => s < userScore).length / allScores.length) * 100;

  return {
    userScore,
    averageScore: Math.round(averageScore),
    topScore,
    betterThanPercent: Math.round(betterThanPercent),
    totalPlays: allScores.length
  };
}
// Export for browser
if (typeof window !== 'undefined') {
  window.SCENARIO_IDEAL_CARD_COUNTS = SCENARIO_IDEAL_CARD_COUNTS;
}
