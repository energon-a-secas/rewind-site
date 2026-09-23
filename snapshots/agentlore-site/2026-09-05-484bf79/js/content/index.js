import { setup } from './tutorials/setup.js';
import { context } from './tutorials/context.js';
import { cost } from './tutorials/cost.js';
import { skills } from './tutorials/skills.js';
import { commands } from './tutorials/commands.js';
import { mcps } from './tutorials/mcps.js';
import { architecture } from './tutorials/architecture.js';
import { evaluation } from './tutorials/evaluation.js';
import { tips } from './tutorials/tips.js';
import { diagrams } from './tutorials/diagrams.js';
import { localAi } from './tutorials/local-ai.js';

/**
 * Category order defines the reading order of the whole corpus: get running,
 * feed it well, know what it costs, extend it, compose it, verify it, then
 * self-host. Prev/next walks this order.
 */
export const CATEGORY_META = {
  setup:        { label: 'Setup',        accent: '#22d3ee', blurb: 'Install the tools and get authenticated.' },
  context:      { label: 'Context',      accent: '#34d399', blurb: 'Feed the agent the right information.' },
  cost:         { label: 'Cost',         accent: '#fbbf24', blurb: 'Know what it costs and how to spend less.' },
  skills:       { label: 'Skills',       accent: '#a78bfa', blurb: 'Package reusable, grounded capabilities.' },
  commands:     { label: 'Commands',     accent: '#fb923c', blurb: 'Automate the workflows you repeat.' },
  mcps:         { label: 'MCPs',         accent: '#94a3b8', blurb: 'Connect agents to external systems.' },
  architecture: { label: 'Architecture', accent: '#818cf8', blurb: 'Compose agents into systems that hold up.' },
  evaluation:   { label: 'Evaluation',   accent: '#2dd4bf', blurb: 'Know whether it actually worked.' },
  tips:         { label: 'Tips',         accent: '#c9a035', blurb: 'Habits that compound over time.' },
  diagrams:     { label: 'Diagrams',     accent: '#38bdf8', blurb: 'Model systems in text the agent can read.' },
  'local-ai':   { label: 'Local AI',     accent: '#f472b6', blurb: 'Run models on your own hardware.' },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_META);

export const CATEGORIES = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([key, meta]) => [key, meta.label])
);

export const TOOLS = {
  claude: 'Claude',
  cursor: 'Cursor',
  local:  'Local AI',
};

export const LEVEL_META = {
  beginner: {
    label: 'Foundations',
    subtitle: 'Start here. Installation, cost awareness, and core concepts.',
    icon: '1',
  },
  intermediate: {
    label: 'Intermediate',
    subtitle: 'Level up. Deeper patterns, cross-tool workflows, and productivity techniques.',
    icon: '2',
  },
  advanced: {
    label: 'Advanced',
    subtitle: 'Power moves. Local AI, multi-step orchestration, architecture modeling, and optimization.',
    icon: '3',
  },
};

export const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];

const BY_CATEGORY = {
  setup, context, cost, skills, commands, mcps, architecture, evaluation, tips, diagrams, 'local-ai': localAi,
};

export const tutorials = CATEGORY_ORDER.flatMap(key => BY_CATEGORY[key]);

export const TUTORIAL_BY_ID = Object.fromEntries(tutorials.map(t => [t.id, t]));

export const tutorialById = (id) => TUTORIAL_BY_ID[id] || null;

/** Position in the corpus, used for prev/next and "N of M" counters. */
export const TUTORIAL_INDEX = Object.fromEntries(tutorials.map((t, i) => [t.id, i]));

export function neighbours(id) {
  const i = TUTORIAL_INDEX[id];
  if (i === undefined) return { prev: null, next: null, position: 0 };
  const n = tutorials.length;
  return {
    prev: tutorials[(i - 1 + n) % n],
    next: tutorials[(i + 1) % n],
    position: i + 1,
  };
}

export { PATHS } from './paths.js';
