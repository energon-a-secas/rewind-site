// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Management Profile System for Exercises
 * Pre-defined archetypes with typical card selections and playstyles
 */

/**
 * The shared ten-card hand every manager is dealt. A play style does not change
 * the deck — it decides which of these ten you reach for (emphasized), which you
 * quietly take off the table (locked), and which extra moves you add on top.
 */
export const BASELINE_HAND = [
  'Heroic Programming',
  'Ship It and Forget It',
  'Pair Programming',
  'Code Review',
  '1:1 Meetings',
  'Contractor',
  'Documentation',
  'Automated Testing',
  'Refactoring Sprint',
  'Executive Review',
];

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
    weakness: 'Burnout, creates bottlenecks, team doesn\'t grow',
    baseline: {
      locked: [
        { card: 'Pair Programming', reason: 'No time to coach; faster to do it myself' },
        { card: 'Contractor', reason: 'Outsiders won\'t do it to my standard' },
        { card: '1:1 Meetings', reason: 'People development is a luxury during crunch' },
        { card: 'Documentation', reason: 'I\'ll remember it; writing it down is overhead' },
      ],
      emphasized: ['Heroic Programming', 'Ship It and Forget It'],
      added: [
        { card: 'Overreach', reason: 'Trade my reputation/energy for output' },
        { card: 'Skilled Execution', reason: 'Head down, grind the ticket myself' },
      ],
    },
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
    weakness: 'Slow on urgent tasks, over-delegation',
    baseline: {
      locked: [
        { card: 'Heroic Programming', reason: 'Cannot jump in and solo it' },
        { card: 'Ship It and Forget It', reason: 'Won\'t take the shortcut; team owns quality' },
      ],
      emphasized: ['Pair Programming', '1:1 Meetings', 'Contractor'],
      added: [
        { card: 'Mentorship', reason: 'Grow a senior instead of doing the work' },
        { card: 'Hiring', reason: 'Scale the team, not my hours' },
        { card: 'Onboarding', reason: 'Invest in ramping new people' },
      ],
    },
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
    weakness: 'Misses opportunities, too slow for crisis',
    baseline: {
      locked: [
        { card: 'Ship It and Forget It', reason: 'Skipping QA is unacceptable risk' },
        { card: 'Heroic Programming', reason: 'Solo heroics create single points of failure' },
      ],
      emphasized: ['Automated Testing', 'Documentation', 'Refactoring Sprint'],
      added: [
        { card: 'Organization and Planning', reason: 'Plan before anyone touches code' },
        { card: 'Foresight', reason: 'De-risk two quarters ahead' },
        { card: 'Defensive Maneuver', reason: 'Keep a protection in reserve' },
      ],
    },
  },

  realistic: {
    key: 'realistic',
    name: 'Realistic',
    description: 'The messy hand you actually get: a mix of solid work, some firefighting, and a tempting shortcut',
    philosophy: 'Play the hand you were dealt, not the one you wanted',
    typicalCards: [
      'Debug Session',
      'Documentation',
      'Code Review',
      'Hotfix',
      'Testing'
    ],
    color: '#b08968', // warm taupe
    counteredBy: 'cautious',
    strength: 'Pragmatic, ships with the team it has, no illusions',
    weakness: 'Muddled priorities, easy to drift into firefighting',
    baseline: {
      locked: [],
      emphasized: [],
      added: [],
    },
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
    weakness: 'Analysis paralysis, slow to execute',
    baseline: {
      locked: [
        { card: 'Heroic Programming', reason: 'Hands-in-code earns no political credit' },
        { card: 'Refactoring Sprint', reason: 'Invisible work; nobody upstream sees it' },
        { card: 'Automated Testing', reason: 'Unglamorous; doesn\'t move the narrative' },
      ],
      emphasized: ['Executive Review'],
      added: [
        { card: 'Compromise', reason: 'Give ground to keep everyone aligned' },
        { card: 'Owed Favors', reason: 'Cash in relationship capital' },
        { card: 'Charm People', reason: 'Move the right person into the right room' },
      ],
    },
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
    weakness: 'Over-engineering, misses quick wins',
    baseline: {
      locked: [
        { card: 'Ship It and Forget It', reason: 'Won\'t ship slop; leverage = do it right once' },
        { card: 'Contractor', reason: 'Bodies don\'t create leverage; systems do' },
        { card: '1:1 Meetings', reason: 'Under-invests in near-term people care' },
      ],
      emphasized: ['Refactoring Sprint'],
      added: [
        { card: 'Resume-Driven Development', reason: 'Bet on unproven tech for 10x' },
        { card: 'Breakthrough', reason: 'One platform move advances everything' },
        { card: 'Optimize Workflow', reason: 'Build tooling that compounds' },
      ],
    },
  }
};

/**
 * Build the displayed hand and the locked/added/emphasized sets for a play style.
 * The hand is always BASELINE_HAND with the profile's added cards appended, so it
 * is independent of the scenario. Locked cards stay visible but are unselectable.
 * Returns { hand, lockedSet, addedSet, emphasizedSet, lockedReasons, addedReasons }.
 */
export function buildProfileHand(profileKey) {
  const profile = PROFILES[profileKey];
  const baseline = (profile && profile.baseline) || { locked: [], emphasized: [], added: [] };

  const lockedReasons = {};
  (baseline.locked || []).forEach(({ card, reason }) => { lockedReasons[card] = reason; });

  const addedReasons = {};
  (baseline.added || []).forEach(({ card, reason }) => { addedReasons[card] = reason; });

  const hand = [...BASELINE_HAND, ...(baseline.added || []).map(a => a.card)];

  return {
    hand,
    lockedSet: new Set(Object.keys(lockedReasons)),
    addedSet: new Set(Object.keys(addedReasons)),
    emphasizedSet: new Set(baseline.emphasized || []),
    lockedReasons,
    addedReasons,
  };
}

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
