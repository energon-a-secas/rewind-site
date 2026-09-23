// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — batch simulation runner

import { state } from './state.js';
import { loadCards } from './data.js';
import { startSimGame } from './engine.js';

let cardDefs = null;

export async function init() {
  cardDefs = await loadCards();
}

export function runBatch(numGames, numPlayers, onProgress) {
  const results = [];

  for (let i = 0; i < numGames; i++) {
    startSimGame(cardDefs, numPlayers);
    results.push(collectGameResult());
    if (onProgress && i % 10 === 0) onProgress(i, numGames);
  }

  return analyzeResults(results, numPlayers);
}

function collectGameResult() {
  const players = state.players.map((p, idx) => ({
    name: p.name,
    rep: p.rep,
    completed: p.completedProjects.length,
    completedNames: p.completedProjects.map(pr => pr.name),
    people: p.people.length,
    handSize: p.hand.length,
    agendaName: p.agenda?.name || '?',
    agendaComplete: p._agendaComplete || false,
    poachCount: p._poachCount || 0,
    // Track all cards played for meta analysis
    cardsPlayed: (p._cardsPlayed || []).map(c => c.name),
    // Track turn-by-turn actions for complexity analysis
    turnOptions: p._turnOptions || [],
    deadTurns: p._deadTurns || 0,
    // Track score at Q4 for catch-up analysis
    repAtQ4: p._repAtQ4 || null,
  }));

  const winner = [...players].sort((a, b) => b.rep - a.rep)[0];

  const logText = state.log.map(l => l.msg);
  const hires = logText.filter(m => m.includes(' hired ')).length;
  const commits = logText.filter(m => m.includes(' committed ')).length;
  const pushes = logText.filter(m => m.includes(' pushed on ')).length;
  const draws = logText.filter(m => m.includes(' drew')).length;
  const poaches = logText.filter(m => m.includes('poached')).length;
  const skillPlays = logText.filter(m => m.includes(' played "')).length;
  const squarePays = logText.filter(m => m.includes('paid') && m.includes('square')).length;
  const completions = logText.filter(m => m.includes('completed "') && m.includes('rep!')).length;
  const incompletes = logText.filter(m => m.includes('incomplete')).length;
  const crises = logText.filter(m => m.includes('CRISIS:')).length;
  const reshuffles = logText.filter(m => m.includes('reshuffled')).length;
  const directives = state.directives.filter(d => d.claimed).length;

  return {
    players,
    winnerIdx: players.indexOf(winner),
    winnerRep: winner.rep,
    winnerName: winner.name,
    totalActions: hires + commits + pushes + draws + skillPlays + squarePays,
    hires, commits, pushes, draws, poaches, skillPlays, squarePays,
    completions, incompletes, crises, reshuffles, directives,
    agendaCompletions: players.filter(p => p.agendaComplete).length,
    // New Tier 7 metrics
    turnCount: state.quarter * state.players.length,
  };
}

function analyzeResults(results, numPlayers) {
  const n = results.length;
  const names = results[0].players.map(p => p.name);

  const winsByPosition = new Array(numPlayers).fill(0);
  const repByPosition = new Array(numPlayers).fill(0);
  const completedByPosition = new Array(numPlayers).fill(0);
  const peopleByPosition = new Array(numPlayers).fill(0);
  const agendaByPosition = new Array(numPlayers).fill(0);

  let totalActions = 0, totalCompletions = 0, totalIncompletes = 0;
  let totalHires = 0, totalCommits = 0, totalPushes = 0, totalDraws = 0;
  let totalPoaches = 0, totalSkillPlays = 0, totalSquarePays = 0;
  let totalCrises = 0, totalReshuffles = 0, totalDirectives = 0;
  let totalAgendaCompletions = 0;
  let winnerReps = [];
  let repSpread = [];
  let zeroRepGames = 0;

  // Tier 7 new metrics
  let q4ComebackWins = 0;
  let totalTurns = 0;
  let totalDeadTurns = 0;
  let totalOptionsPerTurn = 0;
  let turnOptionSamples = 0;

  const completionRateByProject = {};
  const cardPlayStats = {}; // Track card performance
  const winnerDeckMeta = {}; // Track cards in winning decks

  for (const r of results) {
    totalActions += r.totalActions;
    totalCompletions += r.completions;
    totalIncompletes += r.incompletes;
    totalHires += r.hires;
    totalCommits += r.commits;
    totalPushes += r.pushes;
    totalDraws += r.draws;
    totalPoaches += r.poaches;
    totalSkillPlays += r.skillPlays;
    totalSquarePays += r.squarePays;
    totalCrises += r.crises;
    totalReshuffles += r.reshuffles;
    totalDirectives += r.directives;
    totalAgendaCompletions += r.agendaCompletions;
    totalTurns += r.turnCount || 0;

    // Catch-up analysis: check if winner was behind at Q4
    const winner = r.players[r.winnerIdx];
    if (winner && winner.repAtQ4) {
      const maxRepAtQ4 = Math.max(...r.players.map(p => p.repAtQ4 || 0));
      if (winner.repAtQ4 < maxRepAtQ4) {
        q4ComebackWins++;
      }
    }

    winnerReps.push(r.winnerRep);

    const reps = r.players.map(p => p.rep);
    repSpread.push(Math.max(...reps) - Math.min(...reps));

    for (let i = 0; i < numPlayers; i++) {
      repByPosition[i] += r.players[i].rep;
      completedByPosition[i] += r.players[i].completed;
      peopleByPosition[i] += r.players[i].people;
      if (r.players[i].agendaComplete) agendaByPosition[i]++;

      // Track dead turns and options per turn (only when instrumented)
      if (r.players[i].turnOptions && r.players[i].turnOptions.length) {
        for (const options of r.players[i].turnOptions) {
          if (options === 0) totalDeadTurns++;
          else totalOptionsPerTurn += options;
        }
        turnOptionSamples += r.players[i].turnOptions.length;
      }
    }

    if (r.players[r.winnerIdx]) winsByPosition[r.winnerIdx]++;
    if (r.players.some(p => p.rep === 0)) zeroRepGames++;

    // Card usage analysis
    for (let i = 0; i < numPlayers; i++) {
      const player = r.players[i];
      const isWinner = i === r.winnerIdx;

      for (const cardName of player.cardsPlayed || []) {
        // Initialize card stats if not exists
        if (!cardPlayStats[cardName]) {
          cardPlayStats[cardName] = {
            timesPlayed: 0,
            wins: 0,
            losses: 0,
            inWinningDeck: 0,
          };
        }

        cardPlayStats[cardName].timesPlayed++;
        if (isWinner) {
          cardPlayStats[cardName].wins++;
        } else {
          cardPlayStats[cardName].losses++;
        }

        // Track if card appeared in winner's deck
        if (isWinner) {
          winnerDeckMeta[cardName] = (winnerDeckMeta[cardName] || 0) + 1;
        }
      }
    }

    // Project completion tracking
    for (const p of r.players) {
      for (const name of p.completedNames) {
        if (!completionRateByProject[name]) completionRateByProject[name] = 0;
        completionRateByProject[name]++;
      }
    }
  }

  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const stdDev = arr => {
    const m = avg(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
  };

  // Analyze card performance for balance reports
  const balanceAnalysis = analyzeCardBalance(cardPlayStats, winnerDeckMeta, n);

  return {
    gamesPlayed: n,
    numPlayers,
    playerNames: names,

    winRateByPosition: winsByPosition.map(w => ((w / n) * 100).toFixed(1) + '%'),
    avgRepByPosition: repByPosition.map(r => (r / n).toFixed(1)),
    avgCompletedByPosition: completedByPosition.map(c => (c / n).toFixed(2)),
    avgPeopleByPosition: peopleByPosition.map(p => (p / n).toFixed(1)),
    agendaRateByPosition: agendaByPosition.map(a => ((a / n) * 100).toFixed(1) + '%'),

    avgWinnerRep: avg(winnerReps).toFixed(1),
    winnerRepStdDev: stdDev(winnerReps).toFixed(1),
    avgRepSpread: avg(repSpread).toFixed(1),

    // Tier 7 new metrics
    catchUpIndex: ((q4ComebackWins / n) * 100).toFixed(1) + '%',
    decisionComplexity: turnOptionSamples > 0 ? (totalOptionsPerTurn / turnOptionSamples).toFixed(2) : 'n/a',
    deadTurnRate: turnOptionSamples > 0 ? ((totalDeadTurns / turnOptionSamples) * 100).toFixed(1) + '%' : 'n/a',
    metaHealth: balanceAnalysis.metaHealth,

    avgActionsPerGame: (totalActions / n).toFixed(1),
    avgCompletionsPerGame: (totalCompletions / n).toFixed(2),
    avgIncompletesPerGame: (totalIncompletes / n).toFixed(2),
    completionRate: ((totalCompletions / (totalCompletions + totalIncompletes)) * 100).toFixed(1) + '%',

    actionBreakdown: {
      hires: (totalHires / n).toFixed(1),
      commits: (totalCommits / n).toFixed(1),
      pushes: (totalPushes / n).toFixed(1),
      draws: (totalDraws / n).toFixed(1),
      poaches: (totalPoaches / n).toFixed(1),
      skillPlays: (totalSkillPlays / n).toFixed(1),
      squarePays: (totalSquarePays / n).toFixed(1),
    },

    avgCrisesPerGame: (totalCrises / n).toFixed(2),
    avgReshufflesPerGame: (totalReshuffles / n).toFixed(2),
    directiveClaimRate: ((totalDirectives / (n * 2)) * 100).toFixed(1) + '%',
    agendaCompletionRate: ((totalAgendaCompletions / (n * numPlayers)) * 100).toFixed(1) + '%',
    zeroRepGameRate: ((zeroRepGames / n) * 100).toFixed(1) + '%',

    topProjects: Object.entries(completionRateByProject)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, completions: count, rate: ((count / n) * 100).toFixed(1) + '%' })),

    balanceAnalysis, // Include card balance data

    raw: results,
  };
}

/**
 * Analyze card balance and generate reports
 */
function analyzeCardBalance(cardPlayStats, winnerDeckMeta, totalGames) {
  const cards = Object.entries(cardPlayStats);
  const metaCards = Object.keys(winnerDeckMeta);

  // Calculate win rates and play rates
  const analysis = {
    overpowered: [],
    underpowered: [],
    autoInclude: [],
    trap: [],
    allCards: [],
  };

  for (const [cardName, stats] of cards) {
    const totalPlays = stats.timesPlayed;
    const winRate = totalPlays > 0 ? (stats.wins / totalPlays) * 100 : 0;
    const playRate = (totalPlays / (totalGames * 15)) * 100; // Assuming ~15 plays per game

    // In winners' deck rate
    const inWinnerDecks = (winnerDeckMeta[cardName] || 0);
    const winnerDeckRate = (inWinnerDecks / totalGames) * 100;

    // Classify cards
    if (winRate > 60 && totalPlays > 10) {
      analysis.overpowered.push({ cardName, winRate: winRate.toFixed(1), playRate: playRate.toFixed(1) });
    } else if (playRate < 5 && totalPlays > 5) {
      analysis.underpowered.push({ cardName, winRate: winRate.toFixed(1), playRate: playRate.toFixed(1) });
    }

    if (winnerDeckRate > 80) {
      analysis.autoInclude.push({ cardName, inWinnerDecks: inWinnerDecks, rate: winnerDeckRate.toFixed(1) });
    }

    // Trap cards: high play rate but low win rate
    if (playRate > 10 && winRate < 30 && totalPlays > 10) {
      analysis.trap.push({ cardName, winRate: winRate.toFixed(1), playRate: playRate.toFixed(1) });
    }

    analysis.allCards.push({
      cardName,
      winRate: winRate.toFixed(1),
      playRate: playRate.toFixed(1),
      winnerDeckRate: winnerDeckRate.toFixed(1),
      totalPlays,
      inWinnerDecks
    });
  }

  // Sort by relevance
  analysis.overpowered.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
  analysis.underpowered.sort((a, b) => parseFloat(a.playRate) - parseFloat(b.playRate));
  analysis.autoInclude.sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
  analysis.trap.sort((a, b) => parseFloat(a.winRate) - parseFloat(b.winRate));

  // Calculate meta health score
  const viableCards = analysis.allCards.filter(c =>
    parseFloat(c.playRate) >= 5 && parseFloat(c.winRate) >= 30 && parseFloat(c.winRate) <= 70
  ).length;
  analysis.metaHealth = analysis.allCards.length
    ? ((viableCards / analysis.allCards.length) * 100).toFixed(1) + '%'
    : 'N/A';

  return analysis;
}
