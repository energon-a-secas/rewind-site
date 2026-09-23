// ── Agent SDK: the config bench ──────────────────────────────
// Pick what the agent has to do, set the knobs, and the console says
// whether the configuration actually satisfies the requirement. The
// point is the gap between "this works" and "this is guaranteed".
// Pure data. No DOM. Evaluated by js/labs/sdk.js.
//
// Escaping: goal `why`/`gap` and note `text` render RAW: inline
// <code>/<em> and data-tip glossary spans (keys in js/tips.js).
// Everything else is plain text via escHtml.

/** The knobs. `def` is the starting value; `level` is the SDK level that
 *  introduces the knob, which the bench renders as a jump back into it.
 *  A bench setting with no level is a setting the reader never met. */
export const CFG_FIELDS = [
  {
    id: 'scope',
    level: 'l2',
    label: 'Toolset',
    hint: 'How many tools this agent may reach for',
    options: [
      { v: 'narrow', label: '4 role tools' },
      { v: 'wide', label: '18 tools' },
    ],
    def: 'narrow',
  },
  {
    id: 'toolChoice',
    level: 'l1',
    label: 'tool_choice',
    hint: 'Whether a tool call is optional, required, or pinned',
    options: [
      { v: 'auto', label: 'auto' },
      { v: 'any', label: 'any' },
      { v: 'forced', label: 'named tool' },
    ],
    def: 'auto',
  },
  {
    id: 'pre',
    level: 'l3',
    label: 'PreToolUse hook',
    hint: 'Block or redirect a call before the tool runs',
    options: [{ v: 'off', label: 'off' }, { v: 'on', label: 'on' }],
    def: 'off',
  },
  {
    id: 'post',
    level: 'l3',
    label: 'PostToolUse hook',
    hint: 'Reshape the result before the model reads it',
    options: [{ v: 'off', label: 'off' }, { v: 'on', label: 'on' }],
    def: 'off',
  },
  {
    id: 'task',
    level: 'l4',
    label: 'Task tool',
    hint: 'Whether this agent can spawn subagents',
    options: [{ v: 'off', label: 'off' }, { v: 'on', label: 'on' }],
    def: 'off',
  },
];

/**
 * Requirements you can put on the agent. `need` lists the settings that
 * satisfy it: an array means any of those values will do. Anything not
 * satisfied is reported as a gap, with the reason it matters.
 */
export const CFG_GOALS = [
  {
    id: 'refund',
    label: 'It issues refunds',
    need: { pre: 'on' },
    why: 'Money moves. A threshold rule stated in the system prompt is followed most of the time, and "most of the time" is a breach waiting to happen. <code data-tip="hook">PreToolUse</code> blocks the call in code.',
    gap: 'Nothing stops a refund above the limit except the model choosing to obey.',
    refs: 'Practice Q51 · Ch.3.5',
  },
  {
    id: 'verify',
    label: 'Identity must be verified first',
    need: { pre: 'on' },
    why: 'Ordering that must hold every time is a precondition, not a suggestion. Block <code>lookup_order</code> and <code>process_refund</code> until <code>get_customer</code> has returned a verified id.',
    gap: 'The agent can skip verification and act on the wrong account. Few-shot examples raise compliance but never to 100%.',
    refs: 'Practice Q51 · Domain 1.4',
  },
  {
    id: 'structured',
    label: 'Output must parse as JSON',
    need: { toolChoice: ['any', 'forced'] },
    why: '<code data-tip="tool_choice">any</code> forces a tool call, so you always get schema-shaped output while the model still picks which tool fits.',
    gap: 'With <code>auto</code> the model can reply in prose, and the parser downstream throws.',
    refs: 'Ch.2.3-2.4 · Drill: Extraction',
  },
  {
    id: 'order',
    label: 'A specific tool must run first',
    need: { toolChoice: 'forced' },
    why: 'A named tool guarantees the first step: extract metadata before enrichment, for example.',
    gap: 'Neither <code>auto</code> nor <code>any</code> pins <em>which</em> tool goes first.',
    refs: 'Ch.2.3',
  },
  {
    id: 'thirdparty',
    label: 'It reads third-party MCP tools',
    need: { post: 'on' },
    why: 'Unix timestamps here, ISO dates there, numeric status codes somewhere else. A <code data-tip="hook">PostToolUse</code> hook normalises all of it in one place, including servers you cannot modify.',
    gap: 'The model interprets three different formats on every call, and you cannot patch a server you do not own.',
    refs: 'Practice Q59 · Ch.3.5',
  },
  {
    id: 'verbose',
    label: 'A tool returns 40+ fields',
    need: { post: 'on' },
    why: 'Trim to the five fields the task needs. Every unused field is context spent on every single call.',
    gap: 'The window fills with data nobody reads, and the useful part drifts toward the middle where attention is weakest.',
    refs: 'Ch.11.2 · Practice Q14',
  },
  {
    id: 'broad',
    label: 'It researches a broad topic',
    need: { task: 'on' },
    why: 'Decompose and delegate. Each subagent gets its own window and its own slice, and they run in parallel.',
    gap: 'One agent carries the whole topic in one context, and coverage thins as the window fills.',
    refs: 'Ch.3.3-3.4',
  },
];

/** Standing notes on the current setting, regardless of requirements. */
export const CFG_NOTES = [
  {
    when: { scope: 'wide' },
    tone: 'warn',
    text: 'Eighteen tools measurably degrades selection. Scope an agent to its role plus a few shared utilities: four or five.',
  },
  {
    when: { scope: 'narrow' },
    tone: 'ok',
    text: 'Least privilege: fewer tools, more reliable selection, smaller context bill.',
  },
  {
    when: { toolChoice: 'auto' },
    tone: 'note',
    text: '<code>auto</code> is right for conversation, where a text answer is a valid outcome.',
  },
  {
    when: { toolChoice: 'any' },
    tone: 'ok',
    text: 'A tool call is guaranteed, so output is always structured, and the model still chooses which schema fits.',
  },
  {
    when: { toolChoice: 'forced' },
    tone: 'warn',
    text: 'Pinning one tool guarantees the first step, but it is the wrong instrument for classification: every document gets the same schema whether it fits or not.',
  },
  {
    when: { task: 'on' },
    tone: 'note',
    text: 'A subagent <span data-tip="isolated_context">inherits no history</span>. Everything it needs goes in the Task prompt, and it should return structured findings rather than raw output.',
  },
  {
    when: { pre: 'on' },
    tone: 'ok',
    text: 'Deterministic enforcement: the <span data-tip="hook">hook</span> fires 100% of the time, where a prompt instruction does not.',
  },
];
