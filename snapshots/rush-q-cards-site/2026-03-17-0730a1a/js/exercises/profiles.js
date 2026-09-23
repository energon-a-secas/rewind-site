// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Management Profile System for Exercises
 * Pre-defined archetypes with typical card selections and playstyles
 */

export const PROFILES = {
  hero: {
    key: 'hero',
    name: 'The Hero',
    description: 'Does everything personally, burns out but delivers',
    philosophy: "If you want it done right, do it yourself",
    typicalCards: [
      'Heroic Programming',
      'All-nighter',
      'Ship It and Forget It',
      'Tech Lead',
      'Debug Session'
    ],
    color: '#ef4444', // red
    counteredBy: 'delegator',
    strength: 'Delivers under pressure',
    weakness: 'Burnout, creates bottlenecks, team doesn\'t grow'
  },

  delegator: {
    key: 'delegator',
    name: 'The Delegator',
    description: 'Builds teams, develops people, sometimes too hands-off',
    philosophy: 'Empower others to do their best work',
    typicalCards: [
      'Pair Programming',
      'Knowledge Transfer',
      'Code Review',
      'Contractor',
      'Team Meeting'
    ],
    color: '#3b82f6', // blue
    counteredBy: 'cautious',
    strength: 'Scales through others, builds capability',
    weakness: 'Slow on urgent tasks, over-delegation'
  },

  cautious: {
    key: 'cautious',
    name: 'The Cautious',
    description: 'Measured, risk-averse, process-oriented',
    philosophy: 'Slow is smooth, smooth is fast',
    typicalCards: [
      'Documentation',
      'Risk Assessment',
      'Testing',
      'Architecture Review',
      'MVP Strategy'
    ],
    color: '#10b981', // green
    counteredBy: 'politician',
    strength: 'High quality, low risk, sustainable',
    weakness: 'Misses opportunities, too slow for crisis'
  },

  politician: {
    key: 'politician',
    name: 'The Politician',
    description: 'Navigates org dynamics, builds consensus',
    philosophy: 'Alignment before action',
    typicalCards: [
      'Stakeholder Alignment',
      'Executive Review',
      'Data-Driven Pitch',
      'Scope Negotiation',
      'Transparency'
    ],
    color: '#8b5cf6', // purple
    counteredBy: 'innovator',
    strength: 'Gets buy-in, manages up well',
    weakness: 'Analysis paralysis, slow to execute'
  },

  innovator: {
    key: 'innovator',
    name: 'The Innovator',
    description: 'Technical bets, platform thinking, 10x solutions',
    philosophy: 'Invest in leverage',
    typicalCards: [
      'Platform Strategy',
      'Tech Debt Paydown',
      'Tiger Team',
      'Architecture Review',
      'Innovation Lab'
    ],
    color: '#f59e0b', // amber
    counteredBy: 'hero',
    strength: 'Long-term thinking, technical excellence',
    weakness: 'Over-engineering, misses quick wins'
  }
};

/**
 * Get a profile by key
 */
export function getProfile(key) {
  return PROFILES[key];
}

/**
 * Get all profile keys
 */
export function getProfileKeys() {
  return Object.keys(PROFILES);
}

/**
 * Check if a card selection matches a profile's typical playstyle
 */
export function matchesProfile(cardNames, profileKey) {
  const profile = PROFILES[profileKey];
  if (!profile) return 0;

  // Count how many selected cards are in the profile's typical cards
  const matchingCards = cardNames.filter(card =>
    profile.typicalCards.includes(card)
  ).length;

  // Return match percentage (0-1)
  return matchingCards / cardNames.length;
}

/**
 * Detect which profile a set of cards most resembles
 */
export function detectProfile(cardNames) {
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, profile] of Object.entries(PROFILES)) {
    const score = matchesProfile(cardNames, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { profile: key, score, ...profile };
    }
  }

  return bestMatch && bestScore > 0.3 ? bestMatch : null;
}

/**
 * Get hand for countering a specific profile
 */
export function getCounterHand(targetProfileKey) {
  const profile = PROFILES[targetProfileKey];
  if (!profile) return null;

  const counterProfile = PROFILES[profile.counteredBy];
  if (!counterProfile) return null;

  return counterProfile.typicalCards.slice(0, 5); // Return 5 cards
}

/**
 * Is a decision on-profile or counter-profile?
 * Returns: 'on-profile' | 'counter-profile' | 'neutral'
 */
export function classifyDecision(cardNames, scenarioProfile, targetProfile = null) {
  // If we have a target profile to counter
  if (targetProfile) {
    const counterProfile = PROFILES[PROFILES[targetProfile].counteredBy];
    if (counterProfile) {
      const counterMatch = matchesProfile(cardNames, counterProfile.key);
      if (counterMatch > 0.4) return 'counter-profile';
    }
  }

  // Check if playing to scenario profile
  if (scenarioProfile) {
    const profileMatch = matchesProfile(cardNames, scenarioProfile);
    if (profileMatch > 0.4) return 'on-profile';
  }

  return 'neutral';
}
