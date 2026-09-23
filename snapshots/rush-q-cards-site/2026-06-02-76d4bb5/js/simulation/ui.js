// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

import { simulationEngine } from './engine.js';

class SimulationUI {
  constructor() {
    this.currentResults = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById('startSimulation').addEventListener('click', () => this.runSimulation());
    document.getElementById('stopSimulation').addEventListener('click', () => this.stopSimulation());

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Agent review buttons
    document.getElementById('runTechnicalReview')?.addEventListener('click', () => this.runAgentReview('technical'));
    document.getElementById('runSocialReview')?.addEventListener('click', () => this.runAgentReview('social'));
    document.getElementById('runBothReviews')?.addEventListener('click', () => this.runBothReviews());
  }

  async runSimulation() {
    const config = this.getConfig();
    if (config.profiles.length === 0) {
      alert('Please select at least one profile to test');
      return;
    }

    this.showProgress();
    this.hideResults();

    try {
      await simulationEngine.initialize();
      console.log('Engine initialized:', {
        cards: simulationEngine.allCards.length,
        scenarios: simulationEngine.scenarios.length
      });
      const results = await simulationEngine.runBatchSimulation(config);
      this.currentResults = results;
      this.displayResults(results);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed: ' + error.message + '\n\nCheck console for details');
    } finally {
      this.hideProgress();
    }
  }

  stopSimulation() {
    simulationEngine.stop();
    this.hideProgress();
  }

  getConfig() {
    const runsPerScenario = parseInt(document.getElementById('runCount').value) || 50;
    const profiles = [];

    ['hero', 'delegator', 'cautious', 'politician', 'innovator'].forEach(key => {
      const checkbox = document.getElementById(key);
      if (checkbox?.checked) {
        profiles.push({ key, checked: true });
      }
    });

    return { runsPerScenario, profiles };
  }

  showProgress() {
    document.getElementById('simProgress').style.display = 'block';
    document.getElementById('startSimulation').style.display = 'none';
    document.getElementById('stopSimulation').style.display = 'inline-block';
  }

  hideProgress() {
    document.getElementById('simProgress').style.display = 'none';
    document.getElementById('startSimulation').style.display = 'inline-block';
    document.getElementById('stopSimulation').style.display = 'none';
  }

  hideResults() {
    document.querySelector('.results-container').style.display = 'none';
  }

  displayResults(results) {
    document.querySelector('.results-container').style.display = 'block';

    // Overview stats
    document.getElementById('totalRuns').textContent = results.runs.length;
    const avgScore = results.runs.reduce((sum, run) => sum + run.result.score, 0) / results.runs.length;
    document.getElementById('avgScore').textContent = Math.round(avgScore);

    const gaps = simulationEngine.detectGaps();
    document.getElementById('problemCount').textContent = gaps.difficulty.length + gaps.engagement.length;
    document.getElementById('balanceIssues').textContent = gaps.balance.length;

    this.renderOverviewChart(results);
    this.renderScenarios(results);
    this.renderCards(results);
    this.renderProfiles(results);
  }

  renderOverviewChart(results) {
    const container = document.getElementById('overviewChart');
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    results.runs.forEach(run => {
      const grade = run.result.feedback?.charAt(0) || 'C';
      if (gradeCounts.hasOwnProperty(grade)) {
        gradeCounts[grade]++;
      }
    });

    const total = results.runs.length;
    const bars = Object.entries(gradeCounts).map(([grade, count]) => {
      const pct = (count / total * 100).toFixed(1);
      const color = this.getGradeColor(grade);
      return `
        <div class="chart-bar">
          <div class="bar-segment" style="height: ${pct}%; background: ${color}"></div>
          <div class="bar-label">${grade}<br>${count}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="chart-title">Score Distribution</div>
      <div class="chart-bars">${bars}</div>
    `;
  }

  renderScenarios(results) {
    const container = document.getElementById('scenarioGrid');
    const scenarios = Object.entries(results.scenarioStats)
      .sort(([,a], [,b]) => b.avgScore - a.avgScore);

    container.innerHTML = scenarios.map(([id, stats]) => {
      const failRate = ((stats.gradeDistribution.F + stats.gradeDistribution.D) / stats.runs * 100).toFixed(1);
      const grade = this.classifyPerformance(stats.avgScore);

      return `
        <div class="scenario-card">
          <div class="scenario-header">
            <h4>${stats.title}</h4>
            <span class="grade-badge ${grade.toLowerCase()}">${grade}</span>
          </div>
          <div class="scenario-stats">
            <div>Avg: <strong>${stats.avgScore}</strong></div>
            <div>Runs: <strong>${stats.runs}</strong></div>
            <div>Fail Rate: <strong>${failRate}%</strong></div>
          </div>
          <div class="grade-distribution">
            ${Object.entries(stats.gradeDistribution).map(([g, count]) => {
              const pct = (count / stats.runs * 100).toFixed(0);
              return `<div class="grade-seg" style="width: ${pct}%; background: ${this.getGradeColor(g)}"></div>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderCards(results) {
    const container = document.getElementById('cardUsageChart');
    const unusedContainer = document.getElementById('unusedCards');

    // Sort by usage frequency
    const cards = Object.entries(results.cardUsage)
      .sort(([,a], [,b]) => b.selected - a.selected)
      .slice(0, 15);

    const maxUsage = Math.max(...cards.map(([,stats]) => stats.selected));

    container.innerHTML = `
      <div class="chart-title">Most Selected Cards</div>
      ${cards.map(([name, stats]) => {
        const width = (stats.selected / maxUsage * 100);
        const effectiveness = stats.used > 0 ? (stats.used / stats.selected * 100).toFixed(0) : 0;
        return `
          <div class="usage-bar">
            <div class="usage-label">${name} <span class="type-badge">${stats.type}</span></div>
            <div class="usage-track">
              <div class="usage-fill" style="width: ${width}%"></div>
            </div>
            <div class="usage-stats">${stats.selected} plays · ${effectiveness}% effective</div>
          </div>
        `;
      }).join('')}
    `;

    // Unused cards
    const unused = Object.entries(results.cardUsage)
      .filter(([,stats]) => stats.selected === 0)
      .map(([name]) => name);

    unusedContainer.innerHTML = `
      <h4>Never Selected (${unused.length} cards)</h4>
      <div class="unused-grid">${unused.slice(0, 20).join(', ')}${unused.length > 20 ? '...' : ''}</div>
    `;
  }

  renderProfiles(results) {
    const container = document.getElementById('profilePerformance');
    const profiles = Object.entries(results.profileStats)
      .sort(([,a], [,b]) => b.avgScore - a.avgScore);

    container.innerHTML = `
      <div class="profile-leaderboard">
        ${profiles.map(([key, stats]) => {
          const rank = profiles.findIndex(([k]) => k === key) + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
          return `
            <div class="profile-card">
              <div class="medal">${medal}</div>
              <div class="profile-info">
                <h4>${stats.name}</h4>
                <div class="avg-score">Avg: <strong>${stats.avgScore}</strong></div>
                <div class="run-count">${stats.runs} runs</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  getGradeColor(grade) {
    const colors = {
      A: '#10b981', B: '#3b82f6', C: '#f59e0b',
      D: '#f97316', F: '#ef4444'
    };
    return colors[grade] || '#6b7280';
  }

  classifyPerformance(score) {
    if (score >= 70) return 'A';
    if (score >= 50) return 'B';
    if (score >= 30) return 'C';
    if (score >= 10) return 'D';
    return 'F';
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
  }

  async runAgentReview(type) {
    if (!this.currentResults) {
      alert('Please run a simulation first');
      return;
    }

    const container = document.getElementById('agentReviews');
    container.innerHTML = '<div class="agent-thinking">🤖 Analyzing simulation data...</div>';

    const review = await this.generateAgentReview(type);
    this.displayAgentReview(review);
  }

  async runBothReviews() {
    if (!this.currentResults) {
      alert('Please run a simulation first');
      return;
    }

    const container = document.getElementById('agentReviews');
    container.innerHTML = '<div class="agent-thinking">🤝 Running dual analysis...</div>';

    const [technical, social] = await Promise.all([
      this.generateAgentReview('technical'),
      this.generateAgentReview('social')
    ]);

    this.displayDualReview(technical, social);
  }

  async generateAgentReview(type) {
    const gaps = simulationEngine.detectGaps();
    const results = this.currentResults;

    // Simulate agent analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (type === 'technical') {
      return this.generateTechnicalReview(results, gaps);
    } else {
      return this.generateSocialReview(results, gaps);
    }
  }

  generateTechnicalReview(results, gaps) {
    const issues = [];
    const recommendations = [];

    // Analyze difficulty distribution
    const hardScenarios = Object.values(results.scenarioStats).filter(s => s.avgScore < 30);
    const easyScenarios = Object.values(results.scenarioStats).filter(s => s.avgScore > 60);

    if (hardScenarios.length > 0) {
      issues.push(`${hardScenarios.length} scenarios have avg scores below 30 - may be too difficult`);
      recommendations.push('Consider adding more approachable paths or reducing penalty severity');
    }

    if (easyScenarios.length > 0) {
      issues.push(`${easyScenarios.length} scenarios have avg scores above 60 - may lack challenge`);
      recommendations.push('Add complexity or raise benchmarks for experienced players');
    }

    // Analyze card balance
    const overused = Object.entries(results.cardUsage)
      .filter(([,stats]) => stats.selected / results.runs.length > 0.4)
      .map(([name]) => name);

    if (overused.length > 0) {
      issues.push(`${overused.length} cards dominate selections (used in >40% of runs)`);
      recommendations.push(`Review ${overused.slice(0,3).join(', ')} - may be overpowered or too versatile`);
    }

    // Analyze profile variance
    const profileScores = Object.values(results.profileStats).map(s => s.avgScore);
    const variance = Math.max(...profileScores) - Math.min(...profileScores);
    if (variance > 25) {
      issues.push(`High profile variance (${variance} points) - some profiles significantly outperform others`);
      recommendations.push('Rebalance profile bonuses or add counter-play mechanics');
    }

    return {
      type: 'technical',
      title: '🔧 Technical Review',
      emoji: '🤖',
      issues: issues.length > 0 ? issues : ['No major technical issues detected'],
      recommendations: recommendations.length > 0 ? recommendations : ['Scoring system appears well-balanced'],
      summary: issues.length > 2 ? '⚠️ Multiple balance issues detected' : issues.length > 0 ? '⚡ Minor adjustments recommended' : '✅ System healthy'
    };
  }

  generateSocialReview(results, gaps) {
    const issues = [];
    const recommendations = [];

    // Analyze engagement (unused cards)
    const unusedCount = gaps.engagement.filter(g => g.type === 'unused_cards')[0]?.cards?.length || 0;
    if (unusedCount > 10) {
      issues.push(`${unusedCount} cards never selected - players may not understand their value`);
      recommendations.push('Add scenario-specific hints or redesign card effects to be more explicit');
    }

    // Analyze fail rates
    const highFailRate = Object.values(results.scenarioStats)
      .filter(s => (s.gradeDistribution.F + s.gradeDistribution.D) / s.runs > 0.6);

    if (highFailRate.length > 0) {
      issues.push(`${highFailRate.length} scenarios have >60% failure rate - may frustrate players`);
      recommendations.push('Add progressive difficulty or optional hints to reduce frustration');
    }

    // Analyze profile appeal
    const profileUsage = Object.entries(results.profileStats)
      .sort(([,a], [,b]) => b.runs - a.runs);
    const mostUsed = profileUsage[0];
    const leastUsed = profileUsage[profileUsage.length - 1];

    if (mostUsed[1].runs > leastUsed[1].runs * 2) {
      issues.push(`${mostUsed[1].name} used ${Math.round(mostUsed[1].runs / leastUsed[1].runs)}x more than ${leastUsed[1].name} - appeal imbalance`);
      recommendations.push(`Make ${leastUsed[1].name} more attractive with clearer strengths or better starting cards`);
    }

    return {
      type: 'social',
      title: '👥 Social Review',
      emoji: '🤝',
      issues: issues.length > 0 ? issues : ['Good player engagement patterns'],
      recommendations: recommendations.length > 0 ? recommendations : ['No major UX concerns'],
      summary: issues.length > 2 ? '⚠️ Player experience issues detected' : issues.length > 0 ? '💡 Minor UX improvements suggested' : '✅ Players should enjoy this'
    };
  }

  displayAgentReview(review) {
    const container = document.getElementById('agentReviews');

    container.innerHTML = `
      <div class="agent-review ${review.type}">
        <div class="agent-header">
          <span class="agent-avatar">${review.emoji}</span>
          <h3>${review.title}</h3>
          <span class="agent-summary">${review.summary}</span>
        </div>

        <div class="review-section">
          <h4>Issues Found</h4>
          <ul>
            ${review.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>

        ${review.recommendations.length > 0 ? `
          <div class="review-section">
            <h4>Recommendations</h4>
            <ul>
              ${review.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  displayDualReview(technical, social) {
    const container = document.getElementById('agentReviews');

    container.innerHTML = `
      <div class="dual-review">
        <div class="agent-review technical">
          <div class="agent-header">
            <span class="agent-avatar">${technical.emoji}</span>
            <h3>${technical.title}</h3>
            <span class="agent-summary">${technical.summary}</span>
          </div>
          <div class="review-section">
            <ul>
              ${technical.issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="agent-review social">
          <div class="agent-header">
            <span class="agent-avatar">${social.emoji}</span>
            <h3>${social.title}</h3>
            <span class="agent-summary">${social.summary}</span>
          </div>
          <div class="review-section">
            <ul>
              ${social.issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="combined-verdict">
          <h4>Overall Assessment</h4>
          <p>${this.generateCombinedVerdict(technical, social)}</p>
        </div>
      </div>
    `;
  }

  generateCombinedVerdict(technical, social) {
    const techIssues = technical.issues.length;
    const socialIssues = social.issues.length;
    const totalIssues = techIssues + socialIssues;

    if (totalIssues === 0) {
      return '🎉 Excellent! Both technical balance and player experience are strong. The game appears ready for broader playtesting.';
    }

    if (totalIssues <= 2) {
      return '✨ Mostly solid! Minor issues identified but nothing game-breaking. A few targeted improvements will elevate the experience.';
    }

    if (totalIssues <= 4) {
      return '⚡ Good foundation with room to improve. Address the balance and UX issues identified to create a more polished experience.';
    }

    return '⚠️ Several issues need attention. Focus on the highest-impact recommendations first, then re-test to measure improvement.';
  }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.simulationUI = new SimulationUI();
  });
} else {
  window.simulationUI = new SimulationUI();
}
