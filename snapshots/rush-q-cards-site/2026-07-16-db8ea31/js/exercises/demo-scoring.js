// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Demo and Test Suite for New Scoring Engine
 *
 * Run this in browser console to test the scoring engine:
 * 1. Open exercises/index.html
 * 2. Open browser console
 * 3. Run: await testScoringEngine()
 */

import { PROFILES, getProfile, detectProfile } from './profiles.js';
import {
  DIMENSIONS,
  evaluateDecision,
  findMatchingDecision,
  evaluateCustomDecision,
  projectFuture,
  compareDecisionPaths
} from './scoring-engine.js';

// Example test function
export async function testScoringEngine() {
  console.log('🎯 Testing Multi-Dimensional Scoring Engine\n');

  // Load scenarios
  const response = await fetch('../data/scenarios-v2.json');
  const scenarios = await response.json();
  const scenario = scenarios[0]; // scope-creep-v2

  console.log('📋 Scenario:', scenario.title);
  console.log('🎭 Profile:', scenario.profile);
  console.log('🎯 Counter Profile:', scenario.counterProfile);
  console.log('');

  // Test 1: Evaluate different decisions
  console.log('=== DECISION EVALUATIONS ===\n');

  scenario.decisions.forEach((decision, index) => {
    console.log(`${index + 1}. ${decision.reasoning}`);
    console.log('   Cards:', decision.cards.join(', '));

    const result = evaluateDecision(scenario, decision);

    console.log('   Score:', result.score, `(${result.classification}, ×${result.multiplier})`);
    console.log('   Dimensions:');

    for (const [key, data] of Object.entries(result.dimensions)) {
      if (data.total !== 0) {
        const icon = DIMENSIONS[key].icon;
        const q1 = data.q1 > 0 ? `+${data.q1}` : data.q1;
        const q2 = data.q2 > 0 ? `+${data.q2}` : data.q2;
        console.log(`     ${icon} ${key}: ${q1} → ${q2} = ${data.total > 0 ? '+' : ''}${data.total}`);
      }
    }

    console.log('   Feedback:', result.feedback);
    console.log('');
  });

  // Test 2: Profile analysis
  console.log('=== PROFILE ANALYSIS ===\n');

  Object.entries(PROFILES).forEach(([key, profile]) => {
    console.log(`${profile.name} (${key})`);
    console.log('  Philosophy:', profile.philosophy);
    console.log('  Typical cards:', profile.typicalCards.slice(0, 3).join(', '));
    console.log('  Strength:', profile.strength);
    console.log('  Weakness:', profile.weakness);
    console.log('  Counters:', profile.counteredBy);
    console.log('');
  });

  // Test 3: Detect profile from card selection
  console.log('=== PROFILE DETECTION ===\n');

  const testSelections = [
    {
      name: 'Hero Play',
      cards: ['Heroic Programming', 'All-nighter', 'Ship It and Forget It']
    },
    {
      name: 'Delegator Play',
      cards: ['Pair Programming', 'Knowledge Transfer', 'Code Review']
    },
    {
      name: 'Mixed Play',
      cards: ['Heroic Programming', 'Pair Programming', 'Testing']
    }
  ];

  testSelections.forEach(selection => {
    const profile = detectProfile(selection.cards);
    console.log(`${selection.name}: ${selection.cards.join(', ')}`);
    console.log('  Detected:', profile ? `${profile.name} (${Math.round(profile.score * 100)}% match)` : 'No clear match');
    console.log('');
  });

  // Test 4: Temporal projection
  console.log('=== TEMPORAL PROJECTION ===\n');

  const negotiateDecision = scenario.decisions.find(d => d.id === 'negotiate-scope');
  const heroDecision = scenario.decisions.find(d => d.id === 'hero-mode');

  const negotiatePath = projectFuture(scenario.initialState, [negotiateDecision, negotiateDecision]);
  const heroPath = projectFuture(scenario.initialState, [heroDecision, heroDecision]);

  console.log('Negotiation path (repeated twice):');
  negotiatePath.forEach((step, i) => {
    console.log(`  Q${i}: Rep ${step.state.reputation}, Morale ${step.state.teamMorale}, Stakeholders ${step.state.stakeholderTrust}, TechDebt ${step.state.techDebt}`);
  });

  console.log('\nHero path (repeated twice):');
  heroPath.forEach((step, i) => {
    console.log(`  Q${i}: Rep ${step.state.reputation}, Morale ${step.state.teamMorale}, Stakeholders ${step.state.stakeholderTrust}, TechDebt ${step.state.techDebt}`);
  });

  const comparison = compareDecisionPaths(negotiatePath, heroPath);
  console.log('\nComparison:', comparison.winner === 'A' ? 'Negotiation wins' : 'Hero wins', `by ${comparison.difference} points`);

  // Test 5: Counter-profile bonus
  console.log('\n=== COUNTER-PROFILE BONUS ===\n');

  const engageResult = evaluateDecision(scenario, scenario.decisions[0], null, 'hero');
  console.log('Negotiation vs Hero (counter-profile bonus):', engageResult.score, 'points');
  console.log('Classification:', engageResult.classification);
  console.log('Multiplier: ×' + engageResult.multiplier);

  console.log('\n✅ All tests completed!');
}

// Simple demonstration without loading
export function demoScoring() {
  console.log('🎯 Quick Demo: Multi-Dimensional Scoring\n');

  // Show dimension weights
  console.log('=== DIMENSION WEIGHTS ===');
  Object.entries(DIMENSIONS).forEach(([key, dim]) => {
    console.log(`${dim.icon} ${dim.name}: weight ${dim.weight} (range ${dim.min}-${dim.max})`);
  });
  console.log('');

  // Example calculation
  console.log('=== EXAMPLE CALCULATION ===');
  console.log('Decision: Scope Negotiation');
  console.log('Effects:');
  console.log('  Reputation: -2 now, 0 later × weight 1.5 = -3');
  console.log('  Team Morale: 0 now, +3 later × weight 1.2 = +3.6');
  console.log('  Stakeholder Trust: -1 now, +2 later × weight 1.0 = +1');
  console.log('  Tech Debt: 0 now, 0 later × weight 0.8 = 0');
  console.log('  Subtotal: 1.6');
  console.log('  Bonus (counter-profile): ×1.15');
  console.log('  Final Score: 2 (rounded from 1.84)');
  console.log('');

  // Scoring ranges
  console.log('=== INTERPRETING SCORES ===');
  console.log('70-100: Strong strategic thinking');
  console.log('40-69: Reasonable but with trade-offs');
  console.log('0-39: Poor decision or counter-productive');
  console.log('Negative: Actively harmful');
  console.log('');

  console.log('✅ Demo complete!');
}

// Export for console use
if (typeof window !== 'undefined') {
  window.testScoringEngine = testScoringEngine;
  window.demoScoring = demoScoring;
  window.PROFILES = PROFILES;
  window.DIMENSIONS = DIMENSIONS;
  window.evaluateDecision = evaluateDecision;
  window.findMatchingDecision = findMatchingDecision;
}
