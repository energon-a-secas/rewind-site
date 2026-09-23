// ── Glossary ─────────────────────────────────────────────────
// Hover-tip definitions keyed by term id. Any element with
// data-tip="<key>" gets an explainer popover (see events.js).
// Kept exam-accurate: language mirrors the certification guide.

export const TIPS = {
  agentic_loop: {
    term: 'Agentic loop',
    body: 'Send a request with tools, read <code>stop_reason</code>, run any requested tool, append the result to history, and repeat. The model drives which tool comes next.',
  },
  stop_reason: {
    term: 'stop_reason',
    body: 'The field that controls the loop. <code>"tool_use"</code> means run a tool and continue; <code>"end_turn"</code> means the task is done. It is the <em>only</em> reliable completion signal. Other values: <code>"max_tokens"</code> (the response truncated) and <code>"stop_sequence"</code> (a custom stop string was hit).',
  },
  tool_use: {
    term: 'tool_use',
    body: 'Claude does not run code. It emits a structured request to call a tool; your code executes it and returns a <code>tool_result</code> in the next user turn.',
  },
  tool_result: {
    term: 'tool_result',
    body: 'A tool\u2019s output, sent back as a content block inside a <code>user</code>-role message (never a <code>role: "tool"</code> message).',
  },
  end_turn: {
    term: 'end_turn',
    body: 'The model finished and wants no more tools. Show the result. Detecting completion any other way (parsing "done", counting iterations) is an anti-pattern.',
  },
  task_tool: {
    term: 'Task tool',
    body: 'The tool a coordinator uses to spawn a subagent. The coordinator\u2019s <code>allowed_tools</code> must include <code>"Task"</code>. Multiple Task calls in one turn run in parallel.',
  },
  coordinator: {
    term: 'Coordinator',
    body: 'The hub in hub-and-spoke. It decomposes the task, picks subagents, delegates, aggregates results, handles errors, and is the only path between subagents.',
  },
  subagent: {
    term: 'Subagent',
    body: 'A spawned agent with <strong>isolated context</strong>. It inherits none of the coordinator\u2019s history, so every fact it needs must be pasted into its prompt.',
  },
  isolated_context: {
    term: 'Isolated context',
    body: 'Subagents do not share memory and do not inherit parent history. Pass required context explicitly, and have them return structured summaries, not raw dumps.',
  },
  allowed_tools: {
    term: 'allowed_tools',
    body: 'The whitelist of tools an agent may call (least privilege). Fewer tools means fewer distractions and lower context cost for a subagent.',
  },
  tool_choice: {
    term: 'tool_choice',
    body: '<code>auto</code> lets the model decide; <code>any</code> forces some tool (guaranteed structured output); <code>{type:"tool",name:...}</code> forces a specific first step.',
  },
  system_prompt: {
    term: 'System prompt',
    body: 'Usually the top-level <code>system</code> field: loaded first, outranks user messages, and careless wording can bias tool choice. A <code>system</code>-role message can also be inserted mid-conversation to update instructions — later ones take precedence for the turns that follow.',
  },
  context_window: {
    term: 'Context window',
    body: 'The total tokens the model sees at once: system prompt + full history + tool definitions + tool results. It fills up fast when tools return 40 fields but 5 matter.',
  },
  lost_in_middle: {
    term: 'Lost in the middle',
    body: 'Models reliably read the start and end of a long input but miss the middle. Put key facts and action items at the top and bottom.',
  },
  hook: {
    term: 'Hook',
    body: 'Deterministic (100%) interception at a lifecycle point. <code>PreToolUse</code> can block a call; <code>PostToolUse</code> can rewrite a result. Use for money/legal/safety rules, not prompts.',
  },
  mcp: {
    term: 'MCP',
    body: 'Model Context Protocol: an open protocol that connects external systems to Claude via Tools, Resources, and Prompts. Connect a server once, all its tools are auto-discovered.',
  },
  mcp_resource: {
    term: 'MCP Resource',
    body: 'Read-only data an agent can pull for context (schemas, catalogs, docs). It hands the agent a "map" so it skips exploratory tool calls.',
  },
  is_error: {
    term: 'isError',
    body: 'The MCP flag marking a failed call. A <em>structured</em> error (type, retryable, query, partial results) lets the coordinator decide; "Operation failed" tells it nothing.',
  },
  mcp_json: {
    term: '.mcp.json',
    body: 'Project-root config listing MCP servers, checked into version control. Secrets stay as <code>${ENV_VAR}</code> references, never committed tokens.',
  },
  claude_md: {
    term: 'CLAUDE.md',
    body: 'Always-loaded instructions. Three levels: user (<code>~/.claude/</code>), project (<code>.claude/CLAUDE.md</code> or root, in VCS), and directory-level for local conventions.',
  },
  rules_dir: {
    term: '.claude/rules/',
    body: 'Topic-split rules with YAML <code>paths:</code> frontmatter. A rule loads only when Claude edits a matching file, saving context versus one monolithic CLAUDE.md.',
  },
  user_scope: {
    term: 'User scope (~/.claude)',
    body: 'Config that follows the person, not the repo: CLAUDE.md, settings, skills and commands under <code>~/.claude/</code>. Never version-controlled. A personal skill with the same name silently takes precedence over the project one — which is why the guide says to name personal variants differently.',
  },
  planning_mode: {
    term: 'Planning mode',
    body: 'Read-only exploration (Read, Grep, Glob) that produces a plan you approve before any edits. Use for large, ambiguous, architectural, or unfamiliar-codebase work.',
  },
  compact: {
    term: '/compact',
    body: 'Summarizes prior history to free the context window. Risk: exact numbers, dates, and specifics can blur into "about" and "roughly".',
  },
  memory_cmd: {
    term: '/memory',
    body: 'Opens the CLAUDE.md memory file for editing from inside a session. What you save there persists across sessions — unlike the conversation itself.',
  },
  fork_session: {
    term: 'fork_session',
    body: 'Branches an independent session from shared context up to the fork point. Great for comparing two approaches (Redux vs Context) without cross-contamination.',
  },
  few_shot: {
    term: 'Few-shot',
    body: '2\u20134 input/output examples in the prompt. Beats vague instructions like "be precise" because an example shows the exact format and decision logic.',
  },
  headless: {
    term: 'Headless (-p)',
    body: '<code>claude -p "..."</code> runs non-interactively: process prompt, print to stdout, exit. The only correct way to run Claude Code in CI/CD.',
  },
  sliding_window: {
    term: 'Sliding window',
    body: 'Keep only the last N turns verbatim and drop the rest. Cheap and exact for recent context — but everything older is simply gone, and widening N only delays the cliff.',
  },
  case_facts: {
    term: 'CASE FACTS block',
    body: 'Critical values (ids, amounts, dates) extracted into a structured block that ships <em>verbatim</em> in every prompt, outside any summary — so compression never touches them.',
  },
  prefill: {
    term: 'Prefill',
    body: 'End the <code>messages</code> array with a partial <code>assistant</code> turn; the model continues from it. Controls openings and forces formats at the generation level.',
  },
  prompt_dilution: {
    term: 'System-prompt dilution',
    body: 'As assistant replies accumulate, the brief’s share of the window shrinks and the model pattern-matches its own prose instead. Drift at 2,500 tokens is dilution, not attention decay. Counter: reinforce at breakpoints.',
  },
};
