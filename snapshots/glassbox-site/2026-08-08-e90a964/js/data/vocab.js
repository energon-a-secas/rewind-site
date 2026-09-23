// ── Lexicon: the exam's operational vocabulary ───────────────
// The recurring verbs and their mechanisms. The exam's wording is a
// signal: "synthesize", "aggregate" and "consolidate" are NOT
// interchangeable — each implies a different mechanism, and the
// distractors rely on you treating them as synonyms.
//
// VERB_GROUPS[].verbs[] = {
//   term    the word as it appears in stems
//   gloss   one-line mechanism (the definition that decides questions)
//   tell    what it looks like in a stem / the concrete example
//   trap    the misuse the distractors rely on
//   see     optional { hash, label } link to the lab that plays it out
// }
// Escaping: `gloss`, `tell`, `trap` and DISTINCTIONS[].diff render RAW
// (inline <code> + data-tip spans). `term`, group labels/leads, and
// QUICK_TEST fields are escaped.
//
// Sources: definitions trace to the official study guide's chapters
// and practice test. Claims that appear only in third-party banks
// (permissions.deny, /mcp__ slash-command surfacing, idempotency-key
// mechanics, JSON-RPC protocol-error splits) are deliberately absent.

export const VERB_GROUPS = [
  {
    id: 'combine',
    label: 'The combination family',
    lead: 'The exam’s favorite trap: four options that all mean “put things together” but imply different mechanisms.',
    verbs: [
      {
        term: 'synthesize',
        gloss: 'Combine inputs into a <em>new</em> coherent whole that adds interpretation none of them had.',
        tell: 'Subagent findings become one report with cross-cutting themes, surfaced contradictions, and coverage annotations (FULL vs PARTIAL).',
        trap: 'Requires judgment — it is <span data-tip="coordinator">coordinator</span>/model work, never a script. An option that mechanically concatenates or tallies is underselling the ask.',
        see: { hash: 'loop', label: 'Agent Loop · research run' },
      },
      {
        term: 'aggregate',
        gloss: 'Collect and tally inputs <em>without transformation</em> — error counts, usage stats.',
        tell: 'Mechanical. Plain code can do it; no model call needed.',
        trap: 'When the stem needs interpretation, “aggregate the outputs” is the undersell distractor — and when it needs a tally, a model-driven “synthesis” step is the oversell.',
      },
      {
        term: 'consolidate',
        gloss: 'Merge overlapping or redundant things into <em>fewer</em> of them.',
        tell: 'Two tools whose descriptions overlap become one tool, or one gets renamed out of the collision.',
        trap: 'The survivor is one of the originals, not something new — contrast <code>merge</code>. Bolting a routing layer in front of the overlap instead is the over-engineering lure.',
        see: { hash: 'antipatterns', label: 'Anti-patterns · overlapping tools' },
      },
      {
        term: 'merge',
        gloss: 'Combine structured artifacts <em>preserving every part</em> — structural and lossless.',
        tell: 'Claim→source mappings merged and carried through every handoff of a research pipeline.',
        trap: 'The opposite of summarize. Anything that rebuilds attribution after the fact — citation resolvers, similarity matching — is the trap; provenance is preserved by construction or it is gone.',
      },
      {
        term: 'reconcile',
        gloss: 'Resolve <em>conflicts</em> between sources — after both values are kept and attributed.',
        tell: 'Two sources disagree on a figure: the subagent keeps both with attribution and <code>conflict_detected</code>; the coordinator reconciles with its broader context. Dates ride along so temporal differences aren’t misread as contradictions.',
        trap: 'A subagent that quietly picks “the most credible” value is the lure — reconciliation is the hub’s job, and never arbitrary.',
      },
      {
        term: 'decompose',
        gloss: 'Break a task into subtasks — the coordinator’s defining move.',
        tell: 'A research question becomes per-topic Task prompts.',
        trap: 'When every subagent succeeds but whole areas are missing from the report, the decomposition was too narrow. Blame the coordinator, not the workers.',
        see: { hash: 'traps', label: 'Traps · root-cause checks' },
      },
      {
        term: 'partition',
        gloss: 'Divide the data or search space into <em>non-overlapping</em> chunks <em>before</em> delegating.',
        tell: 'Subagents duplicate each other’s work → the coordinator assigns distinct subtopics or source types up front.',
        trap: 'Dedupe-after-the-fact, shared-state “current focus” logging, and forced sequential runs all treat the symptom. Decompose splits the <em>task</em>; partition divides the <em>space</em>.',
      },
      {
        term: 'summarize',
        gloss: 'Compress content — <em>lossily</em>.',
        tell: 'Long history becomes a short digest and the window breathes again.',
        trap: 'Numbers, dates, percentages and provenance die first: “$129.99” becomes “about $130”. Anything critical rides <em>outside</em> the summary, verbatim.',
        see: { hash: 'context', label: 'Context · watch a digest blur' },
      },
    ],
  },
  {
    id: 'control',
    label: 'Control & flow',
    lead: 'Who acts, what blocks, and where an error goes. These verbs separate the code layer from the prompt layer.',
    verbs: [
      {
        term: 'delegate',
        gloss: 'Assign a subtask to a subagent with <em>complete context pasted into its prompt</em>.',
        tell: 'The Task prompt carries the document, prior findings, and the output schema — everything.',
        trap: '“The subagent looks it up in shared memory” describes nothing that exists: <span data-tip="isolated_context">isolated context</span> means no inheritance, no sibling calls, no shared store.',
      },
      {
        term: 'spawn',
        gloss: 'Create a subagent via the <span data-tip="task_tool">Task</span> tool.',
        tell: 'Multiple Task calls in one turn fan out in parallel.',
        trap: 'The coordinator’s <span data-tip="allowed_tools">allowed_tools</span> must include <code>"Task"</code> — without it, “I’ll ask the search agent…” executes nothing, silently.',
        see: { hash: 'loop', label: 'Agent Loop · watch a fan-out' },
      },
      {
        term: 'route',
        gloss: 'Pick the destination per query or tool call — the coordinator’s call to make.',
        tell: 'The hub decides which subagent or tool handles each request.',
        trap: 'A routing classifier bolted in front of two overlapping tools is the over-engineering lure: fix the descriptions or consolidate the overlap instead.',
      },
      {
        term: 'enforce',
        gloss: 'Make the violation <em>impossible in code</em> — not discouraged in prose.',
        tell: 'A <span data-tip="hook">PreToolUse hook</span> blocks the call; a precondition gates it; a token-bound tool pair makes the order architectural.',
        trap: '“Strengthen the system prompt” for a money, legal, or safety rule. Prompts are ~90% reliable; the exam reads “must” as 100%.',
        see: { hash: 'loop', label: 'Agent Loop · two ways to hold a rule' },
      },
      {
        term: 'gate',
        gloss: 'Block progress until a precondition holds — programmatically.',
        tell: '<code>process_refund</code> refuses until a verified customer id exists; <code>execute</code> requires the single-use token only <code>preview</code> can mint.',
        trap: 'A gate is a precondition in code, not a prompt rule — and not a validation that checks <em>after</em> the fact.',
      },
      {
        term: 'escalate',
        gloss: 'Hand off to a human with a <em>self-contained structured summary</em>.',
        tell: 'Customer id, issue, actions taken, recommended action, reason — the human sees only the summary, never the transcript.',
        trap: 'Reliable triggers: an explicit request for a human, a policy gap, genuine inability, a financial threshold. Sentiment and self-rated confidence are the unreliable ones the distractors love.',
      },
      {
        term: 'propagate',
        gloss: 'Pass what a subagent <em>can’t</em> resolve upward — structured.',
        tell: 'Category, <code>isRetryable</code>, the attempted query, partial results, alternatives.',
        trap: 'Never into a top-level handler that aborts everything: that throws away the two sections that finished because one timed out.',
      },
      {
        term: 'retry',
        gloss: 'Re-attempt <em>transient</em> failures only — with backoff, inside the tool.',
        tell: 'Timeouts and 503s get 1–2 retries; validation errors return immediately with what to fix.',
        trap: 'Uniform “retry with backoff” across error types is the lure: retrying the same bad input is pointless, and the numbers in the stem (8% timeouts vs 4% syntax errors) usually forbid it.',
        see: { hash: 'traps', label: 'Traps · when retry is genuinely right' },
      },
    ],
  },
  {
    id: 'context',
    label: 'Information & context',
    lead: 'What enters the window, what gets cut, and what must never pass through a summary.',
    verbs: [
      {
        term: 'ground',
        gloss: 'Tie every output claim to a verifiable source — <em>by construction</em>.',
        tell: 'Structured claim→source mappings (url, name, date) travel with the content through every stage.',
        trap: 'Ungrounded output invites fabrication, and attribution can’t be rebuilt afterwards — reconstruction is the distractor shape.',
      },
      {
        term: 'trim',
        gloss: 'Cut a tool result down to the fields the task actually needs.',
        tell: 'The classic <span data-tip="hook">PostToolUse</span> job — 40 fields arrive, 5 matter, especially from third-party MCP servers you can’t modify.',
        trap: 'The alternative is tool-result accumulation: the quiet way a window fills with noise.',
      },
      {
        term: 'compact',
        gloss: '<span data-tip="compact">/compact</span> — summarize session history to free the window.',
        tell: 'Long investigation sessions drowning in verbose tool output.',
        trap: 'It is a summary, so exact numbers and dates are the first casualties — pin them somewhere verbatim first.',
        see: { hash: 'context', label: 'Context · the digest playout' },
      },
      {
        term: 'inject',
        gloss: 'Insert a mid-conversation reminder — user role, at natural breakpoints.',
        tell: 'The direct counter to instruction drift as assistant turns pile up.',
        trap: 'If the brief being reinforced is a verbose rulebook, reminders treat the symptom — few-shot examples out-survive declarative rules.',
        see: { hash: 'context', label: 'Context · reinforce at breakpoints' },
      },
      {
        term: 'prefill',
        gloss: 'Seed the start of the assistant turn so the reply <em>continues from your opening</em>.',
        tell: 'Kills repetitive “Certainly!” openers and forces response prefixes at the generation level.',
        trap: 'Prompt instructions against a tic are probabilistic, post-processing is a patch, temperature is the wrong knob entirely.',
        see: { hash: 'context', label: 'Context · the prefill playout' },
      },
      {
        term: 'cache',
        gloss: 'Prompt caching reuses a processed prefix across calls for cost and latency.',
        tell: 'Know that it exists and when it helps.',
        trap: 'Its internals are on the official out-of-scope list — an option hinging on cache mechanics is testing whether you’ll overthink.',
      },
    ],
  },
];

// ── Quick test ───────────────────────────────────────────────
// One question decides the combination verb. All fields escaped.
export const QUICK_TEST = [
  { q: 'Does the output contain insight none of the inputs had?', a: 'synthesize' },
  { q: 'Fewer of the same thing afterwards?', a: 'consolidate' },
  { q: 'Every part preserved, nothing interpreted away?', a: 'merge' },
  { q: 'Numbers tallied, no judgment involved?', a: 'aggregate' },
  { q: 'A conflict settled — with both values still attributed?', a: 'reconcile' },
];

// ── Distinction pairs ────────────────────────────────────────
// { a, b, diff } — diff renders RAW.
export const DISTINCTIONS = [
  { a: 'synthesize', b: 'aggregate', diff: 'New insight (model judgment) vs mechanical collection (plain code).' },
  { a: 'consolidate', b: 'merge', diff: 'Remove redundancy — fewer survive vs preserve every part — nothing lost.' },
  { a: 'decompose', b: 'partition', diff: 'Split the <em>task</em> into subtasks vs divide the <em>data/space</em> up front so work can’t overlap.' },
  { a: 'enforce', b: 'instruct', diff: 'Impossible in code (hook, precondition) vs encouraged in the prompt (~90%, never 100%).' },
  { a: 'gate', b: 'validate', diff: 'Block until the precondition holds vs check the result after the fact.' },
  { a: 'escalate', b: 'propagate', diff: 'To a <em>human</em>, as a self-contained summary vs up the <em>agent chain</em>, as a structured error with partial results.' },
  { a: 'retry', b: 'recover', diff: 'Re-attempt a transient failure (backoff, inside the tool) vs handle locally and pass upward only what can’t be resolved.' },
  { a: 'compact', b: 'summarize', diff: 'Same lossy family: <code>/compact</code> works on session history; summarization compresses any content. Both blur numbers.' },
  { a: 'Resources', b: 'Tools', diff: 'MCP’s read-only context “maps” (schemas, catalogs — skip exploratory calls) vs actions the model invokes.' },
  { a: 'CLAUDE.md', b: 'Skills', diff: 'Always-loaded universal standards vs on-demand workflows behind a <code>/command</code>.' },
  { a: 'plan mode', b: 'Explore subagent', diff: 'Read-only exploration ending in a plan you approve vs context-isolated discovery that returns a summary.' },
  { a: '--resume', b: 'fork_session', diff: 'Continue the same session (stale tool results are the risk) vs branch shared context to compare two approaches cleanly.' },
  { a: 'ground', b: 'reconstruct', diff: 'Provenance carried by construction through every stage vs rebuilding citations after they were summarized away — the trap.' },
];
