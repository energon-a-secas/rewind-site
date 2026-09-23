// ── Question bank ────────────────────────────────────────────
// Aggregates every scenario file into one QUESTIONS array plus the
// filter vocabularies the drill lab renders. Pure data, no DOM.
//
// Q1-Q76 come from the official guide's practice test, one file per
// exam scenario. authored.js covers the two exam scenarios the guide
// lists but leaves without practice questions.

import { RESEARCH } from './research.js';
import { CI } from './ci.js';
import { CODEGEN } from './codegen.js';
import { SUPPORT } from './support.js';
import { CONVERSATIONAL } from './conversational.js';
import { AUTHORED } from './authored.js';

export const QUESTIONS = [
  ...SUPPORT,
  ...CODEGEN,
  ...RESEARCH,
  ...CI,
  ...CONVERSATIONAL,
  ...AUTHORED,
];

/** Exam scenarios, in the guide's numbering. `guide` = the guide's practice
 *  test exercises it; false = the guide lists the scenario but leaves it
 *  without practice questions, so ours are authored here. */
export const SCENARIOS = [
  { id: 'support', label: 'Customer Support Agent', short: 'Support', n: 1, guide: true },
  { id: 'codegen', label: 'Code Generation with Claude Code', short: 'Code Gen', n: 2, guide: true },
  { id: 'research', label: 'Multi-Agent Research System', short: 'Research', n: 3, guide: true },
  { id: 'devtools', label: 'Developer Productivity Tools', short: 'Dev Tools', n: 4, guide: false },
  { id: 'ci', label: 'Claude Code for Continuous Integration', short: 'CI/CD', n: 5, guide: true },
  { id: 'extraction', label: 'Structured Data Extraction', short: 'Extraction', n: 6, guide: false },
  { id: 'conversational', label: 'Conversational AI Architecture', short: 'Conversational', n: 7, guide: true },
];

/** Weighted exam domains. `pct` drives the scaled-score estimate. */
export const DOMAINS = [
  { id: 'd1', label: 'Agent architecture & orchestration', short: 'Architecture', pct: 27 },
  { id: 'd2', label: 'Tool design & MCP integration', short: 'Tools & MCP', pct: 18 },
  { id: 'd3', label: 'Claude Code config & workflows', short: 'Claude Code', pct: 20 },
  { id: 'd4', label: 'Prompt engineering & structured output', short: 'Prompting', pct: 20 },
  { id: 'd5', label: 'Context management & reliability', short: 'Context', pct: 15 },
];

export const LEVELS = [
  { id: 'core', label: 'Core', hint: 'One signal in the stem, one clear winner' },
  { id: 'hard', label: 'Hard', hint: 'Competing signals, two plausible options' },
];

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));

/**
 * A question's `pattern` is a specific, teachable label ("Required fields push
 * the model to fabricate"). The Playbook generalises those into 18 patterns.
 * This maps label → PATTERNS[].id so the drill can deep-link into the card.
 *
 * Labels are deliberately finer-grained than the playbook, so some have no
 * card and stay unlinked. That is expected, not a gap to be filled with a
 * loose match. Titles matching a playbook title resolve without an entry here.
 */
export const PATTERN_ALIASES = {
  'Few-shot beats more instructions': 'few-shot',
  'Show the target, do not describe it': 'few-shot',
  'Tool descriptions are the selection mechanism': 'tool-descriptions',
  'The system prompt can steer tool choice': 'tool-descriptions',
  'Blocking is synchronous, scheduled is batch': 'blocking-vs-batch',
  'Batch cannot round-trip a tool result mid-request': 'blocking-vs-batch',
  'Correlate with custom_id, resubmit only failures': 'blocking-vs-batch',
  'Explicit criteria beat vague adjectives': 'explicit-criteria',
  'Critical facts live outside the summary': 'facts-outside-summary',
  'Hybrid retention beats a single strategy': 'facts-outside-summary',
  'Match the memory strategy to the timespan': 'facts-outside-summary',
  'Ask when the answer is only in the user’s head': 'escalate-or-assume',
  'Assume and state when you can, ask when you cannot': 'escalate-or-assume',
  'Escalate on policy gaps, not on discomfort': 'escalate-or-assume',
  'The coordinator is the only hub': 'coordinator-hub',
  'Narrow decomposition is a coordinator bug': 'coordinator-hub',
  'Preserve the conflict, do not arbitrate it': 'coordinator-hub',
  'Handle the error at the lowest level that can resolve it': 'lowest-level-recovery',
  'Know when retry cannot work': 'retry-with-feedback',
  'Structured error context over generic status': 'structured-errors',
  'Continue with partial results, annotate the gap': 'structured-errors',
  'Distinguish access failure from valid empty result': 'structured-errors',
  'Least privilege at the interface': 'least-privilege',
  'Give it the missing context, do not filter afterwards': 'root-cause',
  'Fix the root cause, not the symptom': 'root-cause',
  'Decompose, then parallelise on shared context': 'root-cause',
  'The API is stateless': 'stateless-transcript',
  'Use the native capability before adding machinery': 'no-new-subsystem',
  'stop_reason is the only loop signal': 'protocol-fields',
  'Use the documented mechanism, not a workaround': 'protocol-fields',
  'Schemas fix syntax; validation fixes semantics': 'retry-with-feedback',
  'tool_choice any guarantees structured output': 'protocol-fields',
  'Required fields push the model to fabricate': 'retry-with-feedback',
  'Give the schema a way to be honest': 'retry-with-feedback',
  'Self-correction: extract stated and calculated': 'retry-with-feedback',
  'Aggregate accuracy hides segment failure': 'calibrated-confidence',
  'Grep to locate, Read to understand': 'built-in-tools',
  'Read + Write when Edit cannot be unique': 'built-in-tools',
  'Normalise in a hook, not in the prompt': 'enforce-in-code',
  'Enforce structure at the tool level, not by asking': 'enforce-in-code',
  'Constrain at generation, not after it': 'enforce-in-code',
  'Independent instance for review': 'split-the-pass',
  'Split the pass when attention dilutes': 'split-the-pass',
  'Delegate discovery to protect the main context': 'context-economy',
  'Position and structure beat volume': 'context-economy',
  'Cut tokens at the source, not downstream': 'context-economy',
  'Scratchpad findings survive context loss': 'context-economy',
  'Personal variants get their own name': 'config-surface',
  'Project config in VCS, secrets by environment': 'config-surface',
};
