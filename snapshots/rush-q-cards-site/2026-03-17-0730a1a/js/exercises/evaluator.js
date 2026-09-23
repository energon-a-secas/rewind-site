// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
/** Evaluate the player's selected cards against scenario solutions. */
export function evaluate(scenario, selectedCards) {
  const selected = [...selectedCards].sort();
  let bestMatch = { score: 0, feedback: 'Try a different combination of cards.' };

  for (const sol of scenario.solutions) {
    const solCards = [...sol.cards].sort();
    // Exact match
    if (selected.length === solCards.length && selected.every((c, i) => c === solCards[i])) {
      return { score: sol.score, feedback: sol.feedback };
    }
    // Partial match: count overlap
    const overlap = selected.filter(c => solCards.includes(c)).length;
    const partialScore = Math.round((overlap / solCards.length) * sol.score * 0.6);
    if (partialScore > bestMatch.score) {
      bestMatch = { score: partialScore, feedback: sol.feedback };
    }
  }

  return bestMatch;
}

/**
 * Find the most common mistake pattern from the player's attempt.
 * Returns a helpful message about common errors for this scenario.
 */
export function getCommonMistake(scenario, selectedCards, allCards) {
  const mistakePatterns = [
    {
      pattern: (cards) => cards.includes('Hoard Favor') || cards.includes('Stroach Misallocation'),
      message: "Hoarding favors is usually suboptimal - favor economy rewards spending due to decay",
      category: 'favorHoarding'
    },
    {
      pattern: (cards) => cards.length === 1 && !scenario.solutions[0].cards.includes(cards[0]),
      message: "Single-card solutions rarely work - you often need a combination of actions",
      category: 'singleAction'
    },
    {
      pattern: (cards) => cards.length > 4,
      message: "Too many actions! Focus on the most impactful 2-4 cards",
      category: 'overcommitting'
    },
    {
      pattern: (cards, cardsData) => {
        const hasProject = cards.some(c => cardsData.find(ac => ac.name === c)?.type === 'Project');
        const hasPeople = cards.some(c => cardsData.find(ac => ac.name === c)?.type === 'Talent');
        return hasProject && !hasPeople;
      },
      message: "Projects need people! Staffing is critical for execution",
      category: 'staffing'
    }
  ];

  for (const mistake of mistakePatterns) {
    const matched = mistake.pattern(selectedCards, allCards);
    if (matched) return mistake.message;
  }

  return null;
}
