// ── Anti-patterns ────────────────────────────────────────────
// Drives the Anti-patterns lab AND the inline flags in other labs
// (a step's `flag` field is an id here). Keyed for cross-reference.
//
// Escaping: `fix` renders RAW (inline <code>). `bad`, `why`, `title`
// and `domain` are plain text; every consumer escapes them, so markup
// in those fields shows up literally.

export const ANTIPATTERNS = {
  'parse-text-completion': {
    id: 'parse-text-completion',
    domain: 'Agent loop',
    title: 'Detecting completion by reading the text',
    bad: 'Loop until the assistant message contains "task complete", or stop after max_iterations = 5.',
    why: 'Text is not a control signal. The model may say "done" mid-plan, or keep needing tools past your iteration cap. Both silently corrupt the run.',
    fix: 'Loop on <code>stop_reason</code> only: continue while it is <code>"tool_use"</code>, stop on <code>"end_turn"</code>.',
    tags: ['stop_reason', 'agentic_loop'],
  },
  'vague-task': {
    id: 'vague-task',
    domain: 'Orchestration',
    title: 'Spawning a subagent with no context',
    bad: 'Task: "Analyze the document." (The subagent has an isolated context and never saw the document.)',
    why: 'Subagents inherit none of the coordinator\u2019s history. A vague Task makes the subagent hallucinate or ask questions it can\u2019t ask.',
    fix: 'Paste everything it needs into the prompt: the full document, prior results, and the exact output schema.',
    tags: ['subagent', 'isolated_context', 'task_tool'],
  },
  'prompt-not-hook': {
    id: 'prompt-not-hook',
    domain: 'Enforcement',
    title: 'Enforcing a money rule with a prompt',
    bad: 'System prompt: "Never issue a refund over $500." Then trust the model to obey every time.',
    why: 'Prompt compliance is probabilistic (~90%+, never 100%). For financial, legal, or safety rules, "usually" is a breach waiting to happen.',
    fix: 'Use a <code>PreToolUse</code> hook that blocks the call in code and redirects to escalation. Deterministic, 100%.',
    tags: ['hook', 'allowed_tools'],
  },
  'generic-error': {
    id: 'generic-error',
    domain: 'MCP / reliability',
    title: 'Returning a generic error',
    bad: '{ "isError": true, "content": "Operation failed" }',
    why: 'The coordinator gets nothing to act on. Retry? Change the query? Escalate? Use partial data? It can\u2019t tell.',
    fix: 'Return a structured error: category, isRetryable, the attempted query, any partial results, and alternatives.',
    tags: ['is_error', 'mcp'],
  },
  'abort-on-failure': {
    id: 'abort-on-failure',
    domain: 'Reliability',
    title: 'Aborting the whole workflow on one failure',
    bad: 'One of three research subagents times out, so the coordinator throws an error and returns nothing.',
    why: 'You discard two complete sections because of one gap. Users get nothing instead of 80%.',
    fix: 'Continue with partial results and annotate the gap ("Music: PARTIAL COVERAGE \u00b7 search timeout").',
    tags: ['coordinator', 'subagent'],
  },
  'silent-empty': {
    id: 'silent-empty',
    domain: 'Reliability',
    title: 'Treating an empty result as success',
    bad: 'A search fails and returns [], which the coordinator reads as "no matches found".',
    why: '"No results" and "the search broke" demand opposite responses. Conflating them hides outages.',
    fix: 'Distinguish an empty-but-successful result from a failure via <code>isError</code> and a status field.',
    tags: ['is_error'],
  },
  'overlapping-tools': {
    id: 'overlapping-tools',
    domain: 'Tool design',
    title: 'Near-identical tool descriptions',
    bad: 'analyze_content and analyze_document both say "Analyzes the input and returns results."',
    why: 'The description is the selection mechanism. Overlapping descriptions make the model pick the wrong tool.',
    fix: 'Write distinct descriptions: what each returns, input formats, edge cases, and when to use it over the alternative.',
    tags: ['tool_use', 'tool_choice'],
  },
  'required-fields': {
    id: 'required-fields',
    domain: 'Structured output',
    title: 'Marking optional data as required',
    bad: 'A JSON schema marks "phone_number" as required even when many documents omit it.',
    why: 'Required fields push the model to fabricate a value rather than admit the data is missing.',
    fix: 'Use nullable types (<code>["string","null"]</code>) and an "unclear"/"other" enum so the model can be honest.',
    tags: ['tool_choice'],
  },
  'confidence-escalation': {
    id: 'confidence-escalation',
    domain: 'Human-in-the-loop',
    title: 'Escalating on sentiment or self-rated confidence',
    bad: 'Route to a human when the customer sounds angry, or when the model rates its confidence below 7/10.',
    why: 'Mood doesn\u2019t track case complexity, and models are confidently wrong, so self-rated confidence is poorly calibrated.',
    fix: 'Escalate on clear rules: explicit "get me a manager", policy gaps, threshold breaches, or no progress after N attempts.',
    tags: ['coordinator'],
  },
  'user-level-claude-md': {
    id: 'user-level-claude-md',
    domain: 'Claude Code config',
    title: 'Putting team standards in user-level CLAUDE.md',
    bad: 'Coding conventions live in ~/.claude/CLAUDE.md, so a new teammate never receives them.',
    why: 'User-level config isn\u2019t in version control. The rules exist only on one laptop.',
    fix: 'Put shared standards in project-level <code>.claude/CLAUDE.md</code> (or a root CLAUDE.md), committed to the repo.',
    tags: ['claude_md'],
  },
  'stale-resume': {
    id: 'stale-resume',
    domain: 'Sessions',
    title: 'Resuming a session over changed files',
    bad: 'Days later you --resume an investigation whose tool results describe files that have since changed.',
    why: 'Stale tool results mislead the model. It reasons over a codebase that no longer exists.',
    fix: 'Start fresh with a short summary ("here\u2019s what we found\u2026") instead of resuming stale context.',
    tags: ['fork_session'],
  },
  'compact-numbers': {
    id: 'compact-numbers',
    domain: 'Context',
    title: 'Trusting /compact with exact numbers',
    bad: 'Run /compact and assume the $89.99 total and 2024-12-01 date survive the summary.',
    why: 'Summarization blurs specifics into "about" and "roughly". Numbers, dates, and IDs are the first casualties.',
    fix: 'Keep a verbatim CASE FACTS block in every prompt, independent of whatever gets summarized.',
    tags: ['compact', 'context_window'],
  },
  'window-just-bigger': {
    id: 'window-just-bigger',
    domain: 'Context',
    title: 'Fixing forgetfulness by widening the window',
    bad: 'Users say the assistant forgets things, so you raise the sliding window from 25 to 50 message pairs.',
    why: 'The same cliff arrives at pair 51. Raw turns are the most expensive place to keep information, and the oldest still fall off first.',
    fix: 'Summarize older turns and keep recent ones verbatim; pin exact values in a <code>CASE FACTS</code> block that ships with every prompt.',
    tags: ['sliding_window', 'case_facts', 'context_window'],
  },
  'prompt-not-prefill': {
    id: 'prompt-not-prefill',
    domain: 'Conversation',
    title: 'Instructing away a verbal tic',
    bad: 'System prompt: NEVER open with "Certainly!" or "I’d be happy to help!", and hoping.',
    why: 'A prompt rule fights probability with prose: the model still samples openings, and its own past replies keep voting for the tic. Post-processing and temperature are patches on the same leak.',
    fix: 'Prefill a partial assistant turn (<code>{role:"assistant", content:"..."}</code> as the last message) so the model continues your opening instead of writing its own.',
    tags: ['prefill', 'system_prompt'],
  },
};

// Category → ids, for the gallery layout.
export const ANTIPATTERN_GROUPS = [
  { label: 'Agent loop & orchestration', ids: ['parse-text-completion', 'vague-task', 'prompt-not-hook'] },
  { label: 'Tools & MCP', ids: ['generic-error', 'silent-empty', 'overlapping-tools'] },
  { label: 'Prompting & output', ids: ['required-fields', 'confidence-escalation', 'prompt-not-prefill'] },
  { label: 'Config, sessions & context', ids: ['user-level-claude-md', 'stale-resume', 'compact-numbers', 'window-just-bigger'] },
];
