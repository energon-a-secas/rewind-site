// ── Planning vs Direct decider ───────────────────────────────
// The signals the console evaluates, preset cases, and the rule
// text. Verdict logic lives in labs/planning.js: PLAN if ANY
// signal is in its planWhen set, else DIRECT.

export const PLANNING_SIGNALS = [
  {
    id: 'scope', label: 'How much does it touch?',
    options: [
      { v: 'one', label: 'One file' },
      { v: 'few', label: 'A few files' },
      { v: 'many', label: 'Dozens (10+ files)' },
    ],
    planWhen: ['many'],
    reason: 'Large blast radius (dozens of files) needs a reviewed plan before edits begin.',
  },
  {
    id: 'approaches', label: 'How many viable approaches?',
    options: [
      { v: 'one', label: 'One obvious way' },
      { v: 'multi', label: 'Several, with trade-offs' },
    ],
    planWhen: ['multi'],
    reason: 'Multiple plausible approaches (e.g. Redux vs Context) are a design decision to settle first.',
  },
  {
    id: 'familiar', label: 'Do you know this codebase?',
    options: [
      { v: 'yes', label: 'Yes, well' },
      { v: 'no', label: 'Unfamiliar' },
    ],
    planWhen: ['no'],
    reason: 'Unfamiliar code must be understood (read-only) before it is safely changed.',
  },
  {
    id: 'arch', label: 'An architectural decision?',
    options: [
      { v: 'no', label: 'No' },
      { v: 'yes', label: 'Yes (framework, boundaries)' },
    ],
    planWhen: ['yes'],
    reason: 'Architecture (framework choice, service boundaries) is exactly what a plan is for.',
  },
  {
    id: 'clarity', label: 'Is the change well understood?',
    options: [
      { v: 'clear', label: 'Clear and unambiguous' },
      { v: 'fuzzy', label: 'Ambiguous' },
    ],
    planWhen: ['fuzzy'],
    reason: 'Ambiguous requirements need exploration to pin down scope before coding.',
  },
];

export const PLANNING_CASES = [
  {
    id: 'nullcheck', task: 'Fix a NullPointerException with a clear stack trace.',
    signals: { scope: 'one', approaches: 'one', familiar: 'yes', arch: 'no', clarity: 'clear' },
    hint: 'Single file, one obvious fix.',
  },
  {
    id: 'validation', task: 'Add one input-validation check to an existing endpoint.',
    signals: { scope: 'one', approaches: 'one', familiar: 'yes', arch: 'no', clarity: 'clear' },
    hint: 'Small, well-understood addition.',
  },
  {
    id: 'rename', task: 'Rename a variable across a single file.',
    signals: { scope: 'one', approaches: 'one', familiar: 'yes', arch: 'no', clarity: 'clear' },
    hint: 'Mechanical, zero ambiguity.',
  },
  {
    id: 'migration', task: 'Migrate 45 files from moment.js to date-fns.',
    signals: { scope: 'many', approaches: 'one', familiar: 'yes', arch: 'no', clarity: 'clear' },
    hint: 'A library migration touching dozens of files.',
  },
  {
    id: 'microservices', task: 'Define service boundaries for the billing domain.',
    signals: { scope: 'many', approaches: 'multi', familiar: 'yes', arch: 'yes', clarity: 'fuzzy' },
    hint: 'Pure architecture with several trade-offs.',
  },
  {
    id: 'legacytests', task: 'Add tests to an unfamiliar legacy payments module.',
    signals: { scope: 'many', approaches: 'multi', familiar: 'no', arch: 'no', clarity: 'fuzzy' },
    hint: 'Unfamiliar code; scope emerges as you explore.',
  },
];

export const PLANNING_NOTES = {
  plan: {
    title: 'Planning mode',
    points: [
      'Investigate only: Read, Grep, Glob. No edits, no side effects.',
      'Produces an implementation plan you approve before anything changes.',
      'For dozens of files, multiple approaches, architecture, or unfamiliar code.',
    ],
  },
  direct: {
    title: 'Direct execution',
    points: [
      'Make the change now, since the path is clear and contained.',
      'Single-file fixes, one validation check, a mechanical rename.',
      'Well-understood, unambiguous work where a plan is just overhead.',
    ],
  },
  combined: 'The real workflow is usually both: plan to investigate and design \u2192 you approve \u2192 direct execution to implement. For unfamiliar code, an Explore subagent reads the files and returns only a summary, so the main context never fills with 15 files of noise.',
};
