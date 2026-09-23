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
    body: 'Usually the top-level <code>system</code> field: loaded first, outranks user messages, and careless wording can bias tool choice. A <code>system</code>-role message can also be inserted mid-conversation to update instructions; later ones take precedence for the turns that follow.',
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
    body: 'Config that follows the person, not the repo: CLAUDE.md, settings, skills and commands under <code>~/.claude/</code>. Never version-controlled. A personal skill with the same name silently takes precedence over the project one, which is why the guide says to name personal variants differently.',
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
    body: 'Opens the CLAUDE.md memory file for editing from inside a session. What you save there persists across sessions, unlike the conversation itself.',
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
    body: 'Keep only the last N turns verbatim and drop the rest. Cheap and exact for recent context, but everything older is simply gone, and widening N only delays the cliff.',
  },
  case_facts: {
    term: 'CASE FACTS block',
    body: 'Critical values (ids, amounts, dates) extracted into a structured block that ships <em>verbatim</em> in every prompt, outside any summary, so compression never touches them.',
  },
  prefill: {
    term: 'Prefill',
    body: 'End the <code>messages</code> array with a partial <code>assistant</code> turn; the model continues from it. Controls openings and forces formats at the generation level.',
  },
  prompt_dilution: {
    term: 'System-prompt dilution',
    body: 'As assistant replies accumulate, the brief’s share of the window shrinks and the model pattern-matches its own prose instead. Drift at 2,500 tokens is dilution, not attention decay. Counter: reinforce at breakpoints.',
  },

  // ── Beyond the guide ───────────────────────────────────────
  // Terms the official study guide does not define but third-party
  // question banks test. Kept factually tight against current docs;
  // where a mechanism could not be confirmed, these describe
  // behaviour rather than asserting a signature.
  settings_json: {
    term: '.claude/settings.json',
    body: 'The real settings surface for a project: permissions, hooks, environment. Checked into version control, unlike <code>~/.claude/settings.json</code> which follows the person. Note what does <em>not</em> exist: <code>.claude/config.json</code>, <code>.claude/config.yaml</code>, and <code>.claudeignore</code>.',
  },
  permissions_deny: {
    term: 'permissions.deny',
    body: 'The deny list inside <code>.claude/settings.json</code>: the actual way to keep Claude out of a path, e.g. <code>"Read(./.env)"</code>. Its counterpart <code>permissions.allow</code> pre-approves. This is the answer whenever an option offers <code>.claudeignore</code>, which is not a real file.',
  },
  streamable_http: {
    term: 'Streamable HTTP',
    body: 'The current MCP transport for a <em>remote</em> server. It replaced the older HTTP+SSE transport, deprecated in the 2025-03-26 spec revision, so an option naming SSE is dated rather than merely different. WebSocket is not an MCP transport at all.',
  },
  stdio_transport: {
    term: 'stdio transport',
    body: 'The MCP transport for a <em>local</em> server the client launches as a subprocess, speaking JSON-RPC over standard input and output. No port, no URL, no network exposure. Local versus remote is the whole decision: <code>stdio</code> or Streamable HTTP.',
  },
  file_descriptor: {
    term: 'File descriptor',
    body: 'A small integer the operating system hands a process for each stream it can read or write. Three are already open before your code runs: <code>0</code> stdin, <code>1</code> stdout, <code>2</code> stderr. MCP\u2019s local transport is the decision to carry JSON-RPC over 0 and 1, and leave 2 for your logs.',
  },
  json_rpc: {
    term: 'JSON-RPC 2.0',
    body: 'The message format both MCP transports carry. A <em>request</em> has a <code>method</code>, <code>params</code> and an <code>id</code>; the <em>response</em> that answers it repeats that <code>id</code>, which is how replies are matched when several are in flight. A <em>notification</em> has no <code>id</code> at all, which is exactly why nothing ever answers one.',
  },
  stem: {
    term: 'Stem',
    body: 'The scenario paragraph a question opens with, before the four options: the setup, the measured symptom, and any constraint you must respect. Standard exam terminology. Everything needed to pick the answer is in it, which is why the patterns here are written as <em>the tell in the stem</em> rather than as facts to recall.',
  },
  structured_outputs: {
    term: 'Structured Outputs',
    body: 'Constrains Claude’s <em>final response</em> to your JSON Schema, requested through <code>output_config.format</code>. It removes the retry-and-reparse loop that "please reply in JSON" needs. Different surface from a tool’s <code>input_schema</code>, which constrains a tool <em>call</em>.',
  },
  input_schema: {
    term: 'input_schema',
    body: 'The JSON Schema on a tool definition: the contract for the arguments Claude passes. Required fields, enums instead of free strings, and a description per field are what make calls well-formed. A schema permitting nonsense will receive nonsense.',
  },
  prompt_caching: {
    term: 'Prompt caching',
    body: 'Reuses a processed prefix across calls. Five numbers decide whether it pays: a <strong>1,024</strong>-token minimum on Sonnet and Opus, <strong>2,048</strong> on Haiku, at most <strong>4</strong> <code>cache_control</code> breakpoints, a write at <strong>1.25×</strong> base input (2× for the one-hour TTL), a read at <strong>0.1×</strong>. Matching is exact-prefix, so one changed token near the top invalidates everything after it.',
  },
  model_tiers: {
    term: 'Model tiers',
    body: 'Haiku for high-volume narrow work where latency or cost binds; Sonnet as the default for ordinary agentic work; Opus for expensive open-ended reasoning at low volume. Match the tier to the task’s <em>shape</em>, not its importance, and remember a bigger model never fixes a structural failure.',
  },
  sdk_allowed_tools: {
    term: 'allowedTools (SDK)',
    body: 'Despite the name it <em>auto-approves</em> rather than restricts: listing a tool pre-approves it so no permission prompt interrupts, and leaving one out does not remove it. A friction control, not a security boundary. Not to be confused with a skill’s hyphenated <code>allowed-tools</code> frontmatter key.',
  },
  disallowed_tools: {
    term: 'disallowedTools',
    body: 'The SDK denylist, and one of the two ways to actually restrict the toolset (the other is <code>tools</code> as an allowlist). A bare name like <code>"Bash"</code> takes the tool out of the agent’s context entirely; a scoped rule like <code>"Bash(rm *)"</code> leaves it available and denies the matching calls.',
  },
  can_use_tool: {
    term: 'canUseTool',
    body: 'A callback that runs when the permission flow would otherwise stop and ask a human: your programmatic stand-in for the person at the prompt, deciding per call from the actual arguments. Because it sits at that point in the flow, a call already auto-approved by <code>allowedTools</code> never reaches it.',
  },
  max_turns: {
    term: 'max turns',
    body: 'A ceiling on how many agentic loop iterations a run may take (<code>--max-turns</code> on the CLI, <code>maxTurns</code> in the SDK). A backstop against a loop that will not terminate, not a completion signal. Completion is still <code>stop_reason</code>.',
  },
  temperature: {
    term: 'temperature',
    body: 'How randomly the next token is sampled. It cannot supply a definition the prompt never gave or a guarantee only code can make, which is why it appears 64 times across 718 bank questions and is credited <em>zero</em> times. Inconsistent format wants few-shot or a schema; a hard requirement wants a hook. Do not combine it with <code>top_p</code>.',
  },
  token: {
    term: 'Token',
    body: 'The atom the model reads and writes: a chunk of text (whole word, word piece, single character, space) from a fixed vocabulary, split by a learned tokenizer. Billing, rate limits, and the context window are all counted in these, roughly 4 characters or ¾ of a word of English each.',
  },
  messages_array: {
    term: 'messages',
    body: 'The full conversation, re-sent on every request: <code>user</code> and <code>assistant</code> turns in order, tool results among them. The model persists <em>nothing</em> between calls. Each one is independent, which is why history grows and why every memory strategy exists.',
  },
  max_tokens: {
    term: 'max_tokens',
    body: 'A required ceiling on the <em>response</em> length, not the context window, and not a limit on how long an agent runs. Reaching it truncates the reply and returns <code>stop_reason: "max_tokens"</code>, which a loop that only checks for <code>tool_use</code> will mistake for a finished answer.',
  },
  stop_sequence: {
    term: 'stop_sequence',
    body: 'The <code>stop_reason</code> you get when the model generates one of the strings you listed in <code>stop_sequences</code>. Generation halts there and the sequence itself is not included, so the text is deliberately incomplete, unlike <code>end_turn</code>.',
  },
  content_blocks: {
    term: 'Content blocks',
    body: 'An assistant turn is a <em>list</em>, not a string: text blocks, <code>tool_use</code> blocks, and thinking blocks when extended thinking is on. Reading <code>content[0].text</code> and stopping is how a tool call in the second block gets silently dropped.',
  },
  agent_definition: {
    term: 'AgentDefinition',
    body: 'One agent declared as data: <code>name</code>, <code>description</code>, <code>system_prompt</code>, <code>allowed_tools</code>. The description is what a coordinator reads when picking a subagent, and the tool list is where least privilege actually gets written down.',
  },
  glob_tool: {
    term: 'Glob',
    body: 'Finds <em>files</em> by name pattern (<code>**/*.test.tsx</code>, <code>src/api/**/*.ts</code>) at any depth. It never looks inside them. The first move when mapping an unfamiliar repo; its counterpart for content is <code>Grep</code>.',
  },
  grep_tool: {
    term: 'Grep',
    body: 'Searches <em>inside</em> files: a function name, an error message, an import. Returns hits with locations without loading whole files into context, which is what makes it the cheap step before <code>Read</code>.',
  },
  read_tool: {
    term: 'Read',
    body: 'Loads a file in full: the one built-in that spends real context. Use it on files a <code>Grep</code> or <code>Glob</code> already pointed at; reading everything up front answers one question and leaves no window for the next.',
  },
  edit_tool: {
    term: 'Edit',
    body: 'Precise change by unique text match. When the target appears more than once it fails rather than guessing, and the documented fallback is <code>Read</code> the file, change it programmatically, then <code>Write</code> it back.',
  },
  incremental_investigation: {
    term: 'Incremental investigation',
    body: 'The documented way to explore an unfamiliar codebase: <code>Grep</code> for the entry point, <code>Read</code> what it found, <code>Grep</code> for the usages, <code>Read</code> the consumers, repeat. Reading everything up front answers one question and leaves no context window for the next.',
  },
  scratchpad: {
    term: 'Scratchpad file',
    body: 'A file the agent writes its findings to <em>during</em> a long investigation. Not the transcript, the conclusions. When context degrades or a new session starts, it reads the scratchpad instead of re-running discovery.',
  },
  agent_state: {
    term: 'Structured state persistence',
    body: 'Each agent exports its state (<code>status</code>, results, <code>coverage</code>, <code>gaps</code>) to a known path, and the coordinator reads a <code>manifest.json</code> on resume. Crash recovery for a multi-agent run: restart the unfinished agents, not the whole pipeline.',
  },
  context_leakage: {
    term: 'Context leakage',
    body: 'One agent filling the shared window with material no other agent needs. The coordinator prevents it by acting as a separate context layer: it allocates each subagent a minimal budget and holds the global state itself.',
  },
  explicit_criteria: {
    term: 'Explicit criteria',
    body: 'Replacing a vague adjective with a testable definition: "flag a comment only when it contradicts the code", not "flag unhelpful comments". The guide’s standard fix when the boundary itself is unclear, usually paired with few-shot examples contrasting the two sides.',
  },
  independent_review: {
    term: 'Independent review',
    body: 'A <em>second</em> instance reviewing without access to the generator’s reasoning. Fresh context is the mechanism: the session that wrote the code already argued itself out of the edge case, so a self-check inside it inherits the bias. Distinct from splitting a pass by scope, which fixes attention dilution instead.',
  },
};
