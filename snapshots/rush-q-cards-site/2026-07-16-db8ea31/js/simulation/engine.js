// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

import { PROFILES } from '../exercises/profiles.js';
import { evaluateDecision, evaluateCustomDecision, findMatchingDecision, classifyScore } from '../exercises/scoring-engine.js';
import { loadAllCards } from '../shared/cards-data.js';

export class SimulationEngine {
  constructor() {
    this.allCards = [];
    this.scenarios = [];
    this.isRunning = false;
    this.results = {
      runs: [],
      scenarioStats: {},
      cardUsage: {},
      profileStats: {},
      timestamp: Date.now()
    };
  }

  async initialize() {
    [this.allCards, this.scenarios] = await Promise.all([
      loadAllCards(),
      this.loadScenarios()
    ]);
  }

  async loadScenarios() {
    try {
      const resp = await fetch('../data/scenarios-v2.json');
      if (resp.ok) return await resp.json();

      const fallback = await fetch('../data/scenarios.json');
      return await fallback.json();
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      return [];
    }
  }

  async runBatchSimulation(config) {
    this.isRunning = true;
    this.results = {
      runs: [],
      scenarioStats: {},
      cardUsage: {},
      profileStats: {},
      timestamp: Date.now()
    };

    const selectedProfiles = config.profiles.filter(p => p.checked).map(p => p.key);
    console.log('Selected profiles:', selectedProfiles);
    console.log('Available profiles:', Object.keys(PROFILES));

    const runsPerScenario = config.runsPerScenario;
    const totalRuns = this.scenarios.length * selectedProfiles.length * runsPerScenario;
    let completedRuns = 0;

    // Initialize tracking
    this.scenarios.forEach(sc => {
      this.results.scenarioStats[sc.id] = {
        title: sc.title,
        runs: 0,
        totalScore: 0,
        avgScore: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        profileBreakdown: {},
        bestScore: -Infinity,
        worstScore: Infinity,
        decisions: {}
      };
    });

    // Initialize card usage tracking
    this.allCards.forEach(card => {
      this.results.cardUsage[card.name] = {
        used: 0,
        selected: 0,
        avgScoreWhenUsed: 0,
        type: card.type
      };
    });

    // Initialize profile stats
    selectedProfiles.forEach(profileKey => {
      this.results.profileStats[profileKey] = {
        name: PROFILES[profileKey].name,
        runs: 0,
        totalScore: 0,
        avgScore: 0,
        scenarioBreakdown: {}
      };
    });

    // Run simulations
    for (const scenario of this.scenarios) {
      for (const profileKey of selectedProfiles) {
        for (let i = 0; i < runsPerScenario; i++) {
          if (!this.isRunning) break;

          const run = this.simulateSingleGame(scenario, profileKey, i);
          this.recordRun(run, scenario, profileKey);

          completedRuns++;
          if (completedRuns % 5 === 0) {
            this.updateProgress(completedRuns, totalRuns);
            await this.sleep(1); // Yield to UI thread
          }
        }
      }
    }

    // Calculate final statistics
    this.calculateAggregates();
    this.isRunning = false;

    return this.results;
  }

  simulateSingleGame(scenario, profileKey, runId) {
    const profile = PROFILES[profileKey];
    const hand = scenario.profileHands?.[profileKey] || scenario.hand;

    // AI makes strategic decisions
    const decision = this.aiChooseDecision(scenario, hand, profileKey);
    const result = this.evaluateDecision(scenario, decision, profileKey);

    return {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      profileKey,
      profileName: profile.name,
      runId,
      decision,
      result,
      timestamp: Date.now()
    };
  }

  aiChooseDecision(scenario, hand, profileKey) {
    // Strategy 1: Try profile-typical cards first
    const profile = PROFILES[profileKey];
    const typicalCards = profile.typicalCards.filter(card => hand.includes(card));

    if (typicalCards.length >= 2) {
      const selected = this.selectRandom(typicalCards, 2 + Math.floor(Math.random() * 2));
      const decision = findMatchingDecision(selected, scenario);
      if (decision) return { type: 'preset', decision };
    }

    // Strategy 2: Mix cards strategically
    const peopleCards = hand.filter(card => this.isPeopleCard(card));
    const skillCards = hand.filter(card => this.isSkillCard(card));
    const selected = [];

    if (peopleCards.length > 0 && Math.random() > 0.3) {
      selected.push(this.selectRandom(peopleCards, 1)[0]);
    }
    if (skillCards.length > 0) {
      selected.push(...this.selectRandom(skillCards, Math.min(2, skillCards.length)));
    }
    if (selected.length < 2) {
      selected.push(...this.selectRandom(hand, 2 - selected.length));
    }

    const decision = findMatchingDecision(selected, scenario);
    if (decision) {
      return { type: 'preset', decision };
    }

    // Strategy 3: Custom decision
    return {
      type: 'custom',
      cards: selected,
      reasoning: `AI custom play: ${selected.join(', ')}`
    };
  }

  evaluateDecision(scenario, decision, profileKey) {
    let result;

    if (decision.type === 'preset') {
      result = evaluateDecision(scenario, decision.decision, null, null);
    } else {
      result = evaluateCustomDecision(decision.cards, scenario, this.allCards, null);
    }

    // Record card usage
    decision.decision?.cards?.forEach(cardName => {
      this.results.cardUsage[cardName].selected++;
      if (result.score > 0) {
        this.results.cardUsage[cardName].used++;
      }
    });

    return result;
  }

  recordRun(run, scenario, profileKey) {
    this.results.runs.push(run);

    // Scenario stats
    const scenarioStats = this.results.scenarioStats[scenario.id];
    scenarioStats.runs++;
    scenarioStats.totalScore += run.result.score;
    scenarioStats.bestScore = Math.max(scenarioStats.bestScore, run.result.score);
    scenarioStats.worstScore = Math.min(scenarioStats.worstScore, run.result.score);

    // Grade distribution
    const grade = classifyScore(scenario, run.result.score).grade[0];
    scenarioStats.gradeDistribution[grade]++;

    // Profile breakdown
    if (!scenarioStats.profileBreakdown[profileKey]) {
      scenarioStats.profileBreakdown[profileKey] = { runs: 0, totalScore: 0, avgScore: 0 };
    }
    scenarioStats.profileBreakdown[profileKey].runs++;
    scenarioStats.profileBreakdown[profileKey].totalScore += run.result.score;

    // Profile stats
    const profileStats = this.results.profileStats[profileKey];
    profileStats.runs++;
    profileStats.totalScore += run.result.score;

    if (!profileStats.scenarioBreakdown[scenario.id]) {
      profileStats.scenarioBreakdown[scenario.id] = { runs: 0, totalScore: 0, avgScore: 0 };
    }
    profileStats.scenarioBreakdown[scenario.id].runs++;
    profileStats.scenarioBreakdown[scenario.id].totalScore += run.result.score;
  }

  calculateAggregates() {
    // Scenario averages
    Object.values(this.results.scenarioStats).forEach(stats => {
      stats.avgScore = Math.round(stats.totalScore / stats.runs);
      Object.values(stats.profileBreakdown).forEach(profile => {
        profile.avgScore = Math.round(profile.totalScore / profile.runs);
      });
    });

    // Profile averages
    Object.values(this.results.profileStats).forEach(stats => {
      stats.avgScore = Math.round(stats.totalScore / stats.runs);
      Object.values(stats.scenarioBreakdown).forEach(scenario => {
        scenario.avgScore = Math.round(scenario.totalScore / scenario.runs);
      });
    });

    // Card effectiveness
    Object.entries(this.results.cardUsage).forEach(([name, stats]) => {
      if (stats.used > 0) {
        stats.avgScoreWhenUsed = Math.round(
          this.results.runs
            .filter(run => run.decision.cards?.includes(name))
            .reduce((sum, run) => sum + run.result.score, 0) / stats.used
        );
      }
    });
  }

  updateProgress(completed, total) {
    const percent = Math.round((completed / total) * 100);
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `Running... ${completed}/${total} simulations (${percent}%)`;
  }

  stop() {
    this.isRunning = false;
  }

  // Utility methods
  selectRandom(array, count) {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  isPeopleCard(cardName) {
    const card = this.allCards.find(c => c.name === cardName);
    return card && (card.type === 'Talent' ||
      ['Lead', 'Contractor', 'Manager', 'Team'].some(keyword =>
        cardName.includes(keyword)
      ));
  }

  isSkillCard(cardName) {
    const card = this.allCards.find(c => c.name === cardName);
    return card && ['Soft', 'Hard', 'Power'].includes(card.type);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Gap detection
  detectGaps() {
    const gaps = {
      difficulty: [],
      balance: [],
      unplayable: [],
      engagement: []
    };

    // Scenario difficulty analysis
    Object.entries(this.results.scenarioStats).forEach(([id, stats]) => {
      const avg = stats.avgScore;
      const gradeDist = stats.gradeDistribution;
      const failRate = (gradeDist.F + gradeDist.D) / stats.runs;

      if (failRate > 0.7) {
        gaps.difficulty.push({
          type: 'too_hard',
          scenario: id,
          title: stats.title,
          failRate: Math.round(failRate * 100),
          avgScore: avg
        });
      } else if (failRate < 0.1 && avg > 60) {
        gaps.difficulty.push({
          type: 'too_easy',
          scenario: id,
          title: stats.title,
          failRate: Math.round(failRate * 100),
          avgScore: avg
        });
      }
    });

    // Profile balance issues
    const profileScores = Object.entries(this.results.profileStats)
      .map(([key, stats]) => ({ key, ...stats }))
      .sort((a, b) => b.avgScore - a.avgScore);

    if (profileScores.length > 1) {
      const variance = profileScores[0].avgScore - profileScores[profileScores.length - 1].avgScore;
      if (variance > 20) {
        gaps.balance.push({
          type: 'profile_imbalance',
          message: `High profile variance: ${variance} points between best and worst`,
          details: profileScores
        });
      }
    }

    // Unused cards (never selected in successful runs)
    const unusedCards = Object.entries(this.results.cardUsage)
      .filter(([name, stats]) => stats.used === 0 && stats.selected === 0)
      .map(([name, stats]) => name);

    if (unusedCards.length > 0) {
      gaps.engagement.push({
        type: 'unused_cards',
        cards: unusedCards,
        message: `${unusedCards.length} cards never selected in ${this.results.runs.length} runs`
      });
    }

    // Overused cards (used >50% of runs)
    const overusedCards = Object.entries(this.results.cardUsage)
      .filter(([name, stats]) => stats.selected / this.results.runs.length > 0.5)
      .map(([name, stats]) => ({ name, rate: Math.round((stats.selected / this.results.runs.length) * 100) }));

    if (overusedCards.length > 0) {
      gaps.balance.push({
        type: 'overused_cards',
        cards: overusedCards,
        message: `${overusedCards.length} cards dominate selections`
      });
    }

    return gaps;
  }
}

// Singleton
export const simulationEngine = new SimulationEngine();
