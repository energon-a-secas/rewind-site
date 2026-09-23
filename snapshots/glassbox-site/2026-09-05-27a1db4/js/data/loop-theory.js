// ── Loop lab: the concept ledger ──────────────────────────────
// Every moving part of one loop iteration, in the order it moves:
// what you send, what comes back, what you send back, and the SDK's
// own definitions on top. One row per part; hover the row for the
// glossary meaning, click it for what happens when you get it wrong.
//
// This is the *vocabulary* of the loop. The topology (hub-and-spoke)
// and the toolset (Grep/Glob/Read) live in loop-orchestration.js;
// the steer-vs-enforce comparison stays in loop-contrast.js.
//
// Every `tip` must exist in tips.js. The ledger is the one place that
// renders a browsable list of terms, so a typo shows as a dead hover.
//
// Escaping: `controls`, `consequence` and `exam` render RAW (inline
// <code>/<em>/<strong>). `name`, `group` and `where` are plain text
// through escHtml. `code` goes through highlightCode.

export const LEDGER_GROUPS = [
  {
    id: 'send',
    title: 'What you send',
    sub: 'One request object. Nothing is remembered for you: every field below is re-sent on every single call.',
    rows: [
      {
        name: 'model',
        tip: 'model_tiers',
        where: 'request field',
        controls: 'Which model answers: <code>claude-opus-4-6</code>, <code>claude-sonnet-4-6</code>, <code>claude-haiku-4-5</code>.',
        consequence: 'Pick by the task’s <em>shape</em>, not its importance: Haiku for high-volume narrow work, Sonnet as the default, Opus for open-ended reasoning at low volume. A bigger model never repairs a structural failure. If the format is unreliable, the fix is a schema; if a rule must hold, the fix is a hook.',
        exam: 'An option that upgrades the model to solve a determinism, format or policy problem is a distractor by construction.',
      },
      {
        name: 'max_tokens',
        tip: 'max_tokens',
        where: 'request field, required',
        controls: 'A ceiling on the <em>response</em> length. Not a context-window setting, and not a limit on how long the agent runs.',
        consequence: 'Hit it and generation stops mid-sentence with <code>stop_reason: "max_tokens"</code>. A loop that only tests for <code>tool_use</code> will treat that truncated turn as a finished answer and hand a half-written result to the user.',
      },
      {
        name: 'system',
        tip: 'system_prompt',
        where: 'top-level field',
        controls: 'Role, constraints and output format. Sits outside <code>messages</code>, loads first, and outranks user turns.',
        consequence: 'Wording creates tool associations you did not intend: "always verify the customer" gets <code>get_customer</code> fired on requests that never needed it. And it is still only advice: a rule with money, legal or safety consequences belongs in a hook.',
        exam: 'A <code>system</code>-role message can also be inserted mid-conversation, and later instructions take precedence for the turns that follow.',
      },
      {
        name: 'messages',
        tip: 'messages_array',
        where: 'the whole conversation',
        controls: 'Every prior turn, user and assistant, re-sent in full. The model holds no state between requests.',
        consequence: 'Send a trimmed history and the model has genuinely never seen what you dropped. It does not "remember" the order number and will invent one rather than admit the gap. This is why growth is inevitable and why the strategies in the Context lab exist at all.',
      },
      {
        name: 'tools + input_schema',
        tip: 'input_schema',
        where: 'request field',
        controls: 'The name, the description and the JSON Schema for each tool. This is the whole of what the model knows about your integration.',
        consequence: 'The <strong>description</strong> is the selection mechanism. Two tools described alike get confused for each other; a schema that permits free text receives free text. Say what it returns, the input formats, the edge cases, and when to use it <em>instead of</em> the similar one.',
        exam: 'Agents lean toward built-in tools (<code>Read</code>, <code>Grep</code>) over an MCP tool that does the same thing. The fix is a stronger MCP description naming data the built-ins cannot reach, not removing the built-ins.',
      },
      {
        name: 'tool_choice',
        tip: 'tool_choice',
        where: 'request field',
        controls: '<code>auto</code>: model decides. <code>any</code>: some tool, guaranteed. <code>{type:"tool",name:…}</code>: that tool, guaranteed.',
        consequence: 'Forcing a call is how you guarantee a structured first step; leaving it on <code>auto</code> and asking politely in the prompt is how you get prose where you expected JSON on the one input that matters.',
      },
      {
        name: 'temperature',
        tip: 'temperature',
        where: 'request field',
        controls: 'How randomly the next token is sampled. Nothing else.',
        consequence: 'It cannot supply a definition the prompt never gave, and it cannot make anything deterministic in the sense a question means. Inconsistent format wants few-shot or a schema; a hard requirement wants a hook. Do not pair it with <code>top_p</code>.',
        exam: 'The single most common wrong answer in the whole bank. When you see it offered as the fix, ask what it would actually change.',
      },
    ],
  },
  {
    id: 'back',
    title: 'What comes back',
    sub: 'One response, and one field in it decides whether the loop turns again.',
    rows: [
      {
        name: 'content blocks',
        tip: 'content_blocks',
        where: 'response array',
        controls: 'The assistant turn is a <em>list</em>: text blocks, <code>tool_use</code> blocks, and thinking blocks when extended thinking is on.',
        consequence: 'Reading <code>content[0].text</code> and stopping loses the tool call sitting in <code>content[1]</code>. Walk the array by <code>type</code>; a turn can narrate and call a tool in the same breath.',
      },
      {
        name: 'tool_use',
        tip: 'tool_use',
        where: 'content block',
        controls: 'A structured <em>request</em>: an <code>id</code>, the tool <code>name</code>, and an <code>input</code> object matching your schema.',
        consequence: 'Claude never executes anything. Your code runs the call, and your code is therefore the only place a permission check, an audit log or a rate limit can live. Keep the <code>id</code>: the result has to quote it back.',
      },
      {
        name: 'stop_reason',
        tip: 'stop_reason',
        where: 'response field',
        controls: 'Why generation stopped: <code>tool_use</code>, <code>end_turn</code>, <code>max_tokens</code>, <code>stop_sequence</code>.',
        consequence: 'This <em>is</em> the loop condition. Detecting completion any other way (parsing "done", counting iterations, watching for an empty tool list) is a named anti-pattern that produces both premature exits and loops that never end.',
      },
      {
        name: 'end_turn',
        tip: 'end_turn',
        where: 'stop_reason value',
        controls: 'The model wants no more tools. Show the answer.',
        consequence: 'The only completion signal. A run that ends any other way ended for a reason worth handling separately: truncation, a stop sequence, or your own turn ceiling.',
      },
      {
        name: 'stop_sequence',
        tip: 'stop_sequence',
        where: 'stop_reason value',
        controls: 'A string you listed in <code>stop_sequences</code> was generated, so output halted there.',
        consequence: 'The sequence itself is not in the text. Treating this like <code>end_turn</code> ships a deliberately truncated answer as a complete one.',
      },
      {
        name: 'tool_result',
        tip: 'tool_result',
        where: 'the next request',
        controls: 'Your tool’s output, returned as a content block inside a <strong><code>user</code>-role</strong> message quoting <code>tool_use_id</code>.',
        consequence: 'There is no <code>role: "tool"</code> in this API, so an option offering one is wrong on the format alone. This is also the turn where a 40-field payload becomes 40 fields of context: filter to what the next step needs before you send it.',
      },
    ],
  },
  {
    id: 'sdk',
    title: 'The definitions you write (SDK)',
    sub: 'The loop above is the protocol. These are the knobs the Agent SDK puts around it, and the names that get confused for each other.',
    rows: [
      {
        name: 'AgentDefinition',
        tip: 'agent_definition',
        where: 'SDK object',
        controls: 'One agent as data: <code>name</code>, <code>description</code>, <code>system_prompt</code>, <code>allowed_tools</code>.',
        consequence: 'The <code>description</code> is what a coordinator reads when picking a subagent, so it is selection copy, not documentation. An agent defined without a narrowed tool list gets the whole toolbox and the distraction that comes with it.',
      },
      {
        name: 'allowed_tools (AgentDefinition)',
        tip: 'allowed_tools',
        where: 'SDK field',
        controls: 'The tools this agent may call: least privilege, written down.',
        consequence: 'Fewer tools means fewer wrong turns <em>and</em> less context spent on definitions. A coordinator that will delegate must include <code>"Task"</code> here, or it simply cannot spawn anything.',
      },
      {
        name: 'allowedTools (CLI/SDK options)',
        tip: 'sdk_allowed_tools',
        where: 'SDK option',
        controls: 'Despite the name, it <em>auto-approves</em>: listing a tool skips its permission prompt.',
        consequence: 'Leaving a tool out does not remove it; it just means someone gets asked. Treating this as a security boundary is the trap; to actually restrict, use <code>disallowedTools</code> or an allowlist in <code>tools</code>.',
        exam: 'Two similar names, two different jobs. Read which surface the stem is describing before you answer.',
      },
      {
        name: 'disallowedTools',
        tip: 'disallowed_tools',
        where: 'SDK option',
        controls: 'The denylist. A bare <code>"Bash"</code> removes the tool from the agent’s context; a scoped <code>"Bash(rm *)"</code> keeps the tool and denies matching calls.',
        consequence: 'This is one of the two ways to genuinely shrink what an agent can do. The scoped form is what you want when the tool is necessary and one shape of it is not.',
      },
      {
        name: 'canUseTool',
        tip: 'can_use_tool',
        where: 'SDK callback',
        controls: 'Your programmatic stand-in for the human at the permission prompt, deciding per call from the actual arguments.',
        consequence: 'It runs where the prompt would have appeared, so anything already auto-approved by <code>allowedTools</code> never reaches it. Useful for "allow refunds under $500", but a rule that must never be bypassed still belongs in a <code>PreToolUse</code> hook.',
      },
      {
        name: 'hooks',
        tip: 'hook',
        where: 'SDK lifecycle',
        controls: '<code>PreToolUse</code> can block or redirect a call before the tool runs; <code>PostToolUse</code> can rewrite a result before the model sees it.',
        consequence: 'Deterministic, 100% of the time, because it is code. Money, identity, legality and safety rules live here. The prompt version of the same rule lands most of the time, which is a different guarantee entirely.',
      },
      {
        name: 'Task',
        tip: 'task_tool',
        where: 'built-in tool',
        controls: 'How a coordinator spawns a subagent. Several <code>Task</code> calls in one turn run in parallel.',
        consequence: 'The subagent starts with an empty context. Whatever you did not paste into the Task prompt, it does not know. See the hub-and-spoke section below for the shape of a prompt that works.',
      },
      {
        name: 'maxTurns',
        tip: 'max_turns',
        where: 'SDK option / --max-turns',
        controls: 'A ceiling on loop iterations for one run.',
        consequence: 'A backstop against a run that will not terminate, never a completion signal. Hitting it means the run was cut off, and something should notice that rather than reporting success.',
      },
      {
        name: 'sessions: --resume / fork_session',
        tip: 'fork_session',
        where: 'SDK / CLI',
        controls: 'Continue a stored session, or branch a second one from shared context up to the fork point.',
        consequence: 'Forking is how you compare two approaches without either polluting the other. Resuming the <em>same</em> session for both means the second attempt has already read the first one’s reasoning, which is exactly what an independent review must not do.',
      },
    ],
  },
];

// Rendered above the ledger: the four-line shape of one iteration, so
// the rows below have somewhere to attach.
export const LEDGER_LEAD = 'One turn of the loop is four moves, and every row below belongs to one of them. Hover a row for what the term means; click it for what happens when it is wrong.';

export const LEDGER_CYCLE = [
  { n: 1, text: 'You send the whole request: system, full history, tools.' },
  { n: 2, text: 'Claude answers with content blocks and a <code>stop_reason</code>.' },
  { n: 3, text: 'On <code>tool_use</code> you run the tool and append a <code>tool_result</code>.' },
  { n: 4, text: 'Repeat from 1 until <code>end_turn</code>.' },
];
