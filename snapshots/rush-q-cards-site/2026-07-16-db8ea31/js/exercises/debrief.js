// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Post-game debrief question generator ─────────────────────

/**
 * Generate personalized debrief questions based on gameplay stats.
 * Called after a game completes.
 */
export function generateDebriefQuestions(gameStats) {
  const questions = [];

  const {
    completedProjects = 0,
    favorsUsed = 0,
    favorsHoarded = 0,
    negationsAttempted = 0,
    negationsSuccessful = 0,
    rushQsNegated = 0,
    techDebtAccumulated = 0,
    techDebtRemoved = 0,
    reputation = 0,
    finalPosition = 0,
    totalPlayers = 1,
    strategyType,
    quartersPlayed = 8
  } = gameStats;

  // Low project completion
  if (completedProjects < 2) {
    questions.push({
      question: "You completed few projects. What held you back?",
      category: "Execution",
      lesson: "Managing project load is essential. Taking on too much or staffing poorly leads to failure."
    });
  } else if (completedProjects > 5) {
    questions.push({
      question: `You completed ${completedProjects} projects. How did you maintain execution velocity?`,
      category: "Execution",
      lesson: "High output requires focus, good staffing, and knowing when to say no to scope creep."
    });
  }

  // Favor economy analysis
  if (favorsUsed === 0) {
    questions.push({
      question: "You never used any favors. What were you saving them for?",
      category: "Resource Management",
      lesson: "Favors are a use-it-or-lose-it resource due to decay. Hoarding them is usually suboptimal."
    });
  } else if (favorsUsed < 2) {
    questions.push({
      question: "You only used favors twice. Were there missed opportunities to use them?",
      category: "Resource Management",
      lesson: "Favors provide flexibility. Using them to negate bad events or accelerate key projects is often worth it."
    });
  } else if (favorsHoarded > 3) {
    questions.push({
      question: `You lost ${favorsHoarded} favors to decay. What could you have spent them on?`,
      category: "Resource Management",
      lesson: "The favor economy rewards spending over hoarding due to quarterly decay."
    });
  }

  // Negation patterns
  if (negationsAttempted === 0) {
    questions.push({
      question: "You never countered opponent cards. Why not?",
      category: "Competitive Strategy",
      lesson: "Negation is a key strategic tool. Letting opponents' cards resolve unchallenged gives them free advantages."
    });
  } else if (negationsSuccessful < negationsAttempted / 2) {
    questions.push({
      question: `You attempted ${negationsAttempted} negations but only ${negationsSuccessful} succeeded. What went wrong?`,
      category: "Competitive Strategy",
      lesson: "Failed negations waste resources. Consider the cost-benefit and your current reputation before negating."
    });
  }

  // Rush Q immunity
  if (rushQsNegated > 0) {
    questions.push({
      question: `You negated ${rushQsNegated} Rush Quarter events. When is negating them better than riding them out?`,
      category: "Risk Management",
      lesson: "Rush Q events hit everyone, so negating them gives you relative advantage. But the cost can be high."
    });
  }

  // Technical debt
  if (techDebtAccumulated > 0 && techDebtRemoved === 0) {
    questions.push({
      question: `You accumulated ${techDebtAccumulated} tech debt tokens but never removed them. How did this affect your projects?`,
      category: "Technical Strategy",
      lesson: "Tech debt slows all projects. Refactoring Sprint and Documentation cards can remove it."
    });
  } else if (techDebtRemoved > 0) {
    questions.push({
      question: `You removed ${techDebtRemoved} tech debt tokens. Was the investment worth it?`,
      category: "Technical Strategy",
      lesson: "Paying down tech debt early prevents it from compounding and slowing all future work."
    });
  }

  // Innovation tax
  if (gameStats.consecutiveQuartersWithoutProjects >= 2) {
    questions.push({
      question: "You went 2+ quarters without completing any projects and paid the Innovation Tax. How could you have avoided this?",
      category: "Anti-Turtle",
      lesson: "The Innovation Tax punishes hoarding strategies. Completing even small projects regularly avoids the penalty."
    });
  }

  // Final position reflection
  if (finalPosition === 1 && totalPlayers > 1) {
    questions.push({
      question: "You won! What was your most important strategic decision?",
      category: "Victory Analysis",
      lesson: "Reflecting on winning strategies helps internalize good management practices."
    });
  } else if (finalPosition === totalPlayers && totalPlayers > 1) {
    questions.push({
      question: "You came in last. If you could replay one quarter differently, which would it be and why?",
      category: "Learning from Failure",
      lesson: "Failure is a great teacher. Identifying the key turning points helps improve future decision-making."
    });
  }

  // Strategy-specific insights
  if (strategyType === 'turtle') {
    questions.push({
      question: "You played a 'turtle' strategy (hoarding resources, avoiding risks). How did the Innovation Tax affect your plan?",
      category: "Strategy Evolution",
      lesson: "Turtle strategies are punished in Rush Q. The game rewards active engagement and calculated risk-taking."
    });
  } else if (strategyType === 'aggressive') {
    questions.push({
      question: "You played aggressively, taking many risks. Which risks paid off and which didn't?",
      category: "Risk Assessment",
      lesson: "Aggressive strategies can work but require careful risk management and adaptation when things go wrong."
    });
  }

  // Add at least one general management question
  if (questions.length < 3) {
    questions.push({
      question: "What was the most challenging people management decision you faced?",
      category: "People Management",
      lesson: "Managing talent, morale, and team dynamics is as important as technical execution."
    });
  }

  return questions;
}

/**
 * Extract game statistics from a completed game state.
 */
export function extractGameStats(finalState) {
  if (!finalState || !finalState.players || !finalState.players.length) {
    return {};
  }

  const humanPlayer = finalState.players[0]; // Human is always index 0
  const allPlayers = finalState.players;

  // Sort by reputation to find final position
  const ranked = [...allPlayers].sort((a, b) => b.reputation - a.reputation);
  const finalPosition = ranked.findIndex(p => p === humanPlayer) + 1;

  // Calculate favor hoarding
  const maxFavorsPossible = finalState.currentQuarter * 1; // Approximate
  const favorsHoarded = Math.max(0, (humanPlayer.totalFavorsReceived || 0) - (humanPlayer.favorsUsed || 0));

  // Calculate tech debt
  let techDebtAccumulated = 0;
  let techDebtRemoved = 0;
  for (const proj of humanPlayer.projects) {
    techDebtAccumulated += proj.techDebtAdded || 0;
    techDebtRemoved += proj.techDebtRemoved || 0;
  }

  // Identify strategy type
  let strategyType = 'balanced';
  if (humanPlayer.consecutiveQuartersWithoutProjects >= 2) {
    strategyType = 'turtle';
  } else if ((humanPlayer.cardsPlayed || 0) > finalState.currentQuarter * 2) {
    strategyType = 'aggressive';
  }

  return {
    completedProjects: humanPlayer.projects.filter(p => p.isCompleted).length,
    favorsUsed: humanPlayer.favorsUsed || 0,
    favorsHoarded,
    negationsAttempted: humanPlayer.negationsAttempted || 0,
    negationsSuccessful: humanPlayer.negationsSuccessful || 0,
    rushQsNegated: humanPlayer.rushQsNegated || 0,
    techDebtAccumulated,
    techDebtRemoved,
    reputation: humanPlayer.reputation,
    finalPosition,
    totalPlayers: allPlayers.length,
    strategyType,
    quartersPlayed: finalState.currentQuarter
  };
}

/**
 * Track an event during gameplay for debrief analysis.
 */
export function trackGameEvent(eventType, data) {
  // This would be called during gameplay to build up statistics
  // For now, we extract everything at the end from the final state
  // In a future version, this could enable real-time debrief hints
}
