// ── Agent SDK: the progressive build ─────────────────────────
// Six levels, each adding exactly one layer of setup. The Agent Loop
// lab shows the loop as a concept; this shows what you actually write
// and configure, and what breaks if you stop at each level.
// Pure data. No DOM. Rendered by js/labs/sdk.js.
//
// Grounded in the guide: Ch.1 (request shape, roles, statelessness),
// Ch.2 (tools, tool_choice), Ch.3 (AgentDefinition, hub-and-spoke,
// Task, hooks), Ch.5.10 (sessions), Ch.11.5 (subagent context budgets).
//
// Escaping: caveat `body`, `breaks` and `exam` render RAW; they carry
// inline <code>/<em>/<strong> and data-tip glossary spans (keys must
// exist in js/tips.js). Everything else is plain text via escHtml.

export const SDK_LEVELS = [
  {
    id: 'l0',
    n: 0,
    title: 'One request, no tools',
    tagline: 'The whole API in five fields, and the property that shapes everything after it.',
    goal: 'Send a message, get an answer back.',
    lang: 'py',
    code: `import anthropic
client = anthropic.Anthropic()

resp = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a customer support agent.",
    messages=[
        {"role": "user", "content": "Where is order 1234?"},
    ],
)
print(resp.content[0].text)`,
    keys: [
      { key: 'model', why: 'Which model runs the turn. opus / sonnet / haiku.' },
      { key: 'max_tokens', why: 'Cap on the response. If it truncates, stop_reason comes back as "max_tokens".' },
      { key: 'system', why: 'Behavioural rules. A top-level field, not a message. Outranks user turns.' },
      { key: 'messages', why: 'The conversation. user and assistant turns, in order.' },
    ],
    buys: 'A single answer. Nothing more: the model cannot act on anything yet.',
    breaks: 'It has no memory. The next call knows nothing about this one, because the API keeps no state between requests.',
    caveats: [
      {
        title: 'You resend the entire transcript, every request',
        body: 'There is no <code>session_id</code> and no server-side memory. If prior turns are not in the <code>messages</code> array of <em>this</em> request, they did not happen. That is also why latency and cost grow as a conversation gets longer: every request carries more input tokens than the last.',
      },
      {
        title: 'Tool results are not a role',
        body: 'When you add tools at the next level, results go back as a <code>tool_result</code> content block inside a <strong>user</strong>-role message. There is no <code>role: "tool"</code>. Getting this wrong is a common first-build mistake.',
      },
    ],
    exam: 'Two questions turn purely on statelessness: "the assistant forgot what I said two messages ago" (you are not sending prior messages) and "latency and cost rise after 50 turns" (the whole transcript ships every time).',
    refs: 'Ch.1.1-1.2, 1.5 · Practice Q64, Q67',
  },

  {
    id: 'l1',
    n: 1,
    title: 'Add tools, write the loop',
    tagline: 'Claude never runs your code. It asks; you execute; you hand back the result.',
    goal: 'Let the model act, and keep going until it is finished.',
    lang: 'py',
    code: `TOOLS = [{
    "name": "lookup_order",
    "description": (
        "Look up an order by numeric order_id. Returns status, items, "
        "total and return_eligible. Use AFTER get_customer has verified "
        "identity. Not for profile lookups - that is get_customer."
    ),
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "integer"}},
        "required": ["order_id"],
    },
}]

messages = [{"role": "user", "content": "Where is order 1234?"}]

while True:
    resp = client.messages.create(
        model="claude-sonnet-4-6", max_tokens=1024,
        system=SYSTEM, tools=TOOLS,
        tool_choice={"type": "auto"},
        messages=messages,
    )
    messages.append({"role": "assistant", "content": resp.content})

    if resp.stop_reason == "end_turn":
        break                       # the only reliable completion signal

    if resp.stop_reason == "tool_use":
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                out = run_tool(block.name, block.input)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,   # must echo the request id
                    "content": out,
                })
        # results go back as a USER turn, not a "tool" role
        messages.append({"role": "user", "content": results})`,
    keys: [
      { key: 'tools', why: 'JSON-schema definitions. The description is how the model picks between them.' },
      { key: 'tool_choice', why: '"auto" lets it decide; "any" forces some tool; {"type":"tool","name":...} forces one.' },
      { key: 'stop_reason', why: 'The loop control signal. "tool_use" means continue, "end_turn" means stop.' },
    ],
    buys: 'A working agent. The model chooses the next action from context and prior results, rather than following a decision tree you hard-coded.',
    breaks: 'Every agent you build re-implements this loop, and nothing constrains which tools an agent may reach for.',
    caveats: [
      {
        title: 'stop_reason is the only completion signal',
        body: 'Not the presence of assistant text; Claude routinely writes prose <em>alongside</em> a tool call. Not a phrase like "task complete". Not an iteration cap: <code>max_iterations=5</code> as the primary stop condition truncates real work. An iteration cap is a safety net, never the signal.',
      },
      {
        title: 'The description is the router',
        body: 'The model selects tools by reading their descriptions. Two tools described as "analyzes content and extracts key information" and "analyzes documents and extracts key information" will be confused with each other. Say what it returns, the input format, edge cases, and when to use it <em>instead of</em> the similar one.',
      },
      {
        title: 'tool_choice is how you guarantee structure',
        body: '<code>auto</code> can answer in prose, which breaks a parser downstream. <code data-tip="tool_choice">any</code> forces a tool call: structured output guaranteed, model still picks which tool. A named tool forces a specific first step, so use it for ordering, not for classification.',
      },
    ],
    exam: 'The anti-patterns here are tested directly: parsing assistant text for completion, using an arbitrary iteration limit, and treating "the response contains text" as done. All three lose to <code data-tip="stop_reason">stop_reason</code>.',
    refs: 'Ch.2.1-2.3, 3.1 · Practice Q58',
  },

  {
    id: 'l2',
    n: 2,
    title: 'AgentDefinition',
    tagline: 'Stop hand-rolling the loop. Declare the agent instead.',
    goal: 'Give the agent an identity, a brief, and a bounded toolset.',
    lang: 'py',
    code: `from claude_agent_sdk import AgentDefinition

support_agent = AgentDefinition(
    name="customer_support",
    description="Handles returns, billing disputes and order issues",
    system_prompt=(
        "You are a customer support agent. Verify the customer with "
        "get_customer before any order operation. Escalate when policy "
        "does not cover the request."
    ),
    allowed_tools=[
        "get_customer",
        "lookup_order",
        "process_refund",
        "escalate_to_human",
    ],
)`,
    keys: [
      { key: 'name', why: 'Identifies the agent, and is how a coordinator addresses it later.' },
      { key: 'description', why: 'What this agent is for. A coordinator reads it to decide whether to delegate here.' },
      { key: 'system_prompt', why: 'Its behavioural brief. Applies to every turn this agent takes.' },
      { key: 'allowed_tools', why: 'The whitelist. Least privilege: fewer tools, more reliable selection, cheaper context.' },
    ],
    buys: 'The loop is handled for you, and the agent is now scoped: it physically cannot call a tool outside its list.',
    breaks: 'Everything in the system prompt is still a request. The model complies most of the time, which is not the same as always.',
    caveats: [
      {
        title: 'Four or five tools, not eighteen',
        body: 'Selection reliability degrades as the toolset grows, and an agent holding tools outside its specialism will misuse them. Scope each agent to its role plus a small set of shared utilities.',
      },
      {
        title: 'Your system prompt can bias tool choice',
        body: 'Wording creates associations you did not intend. "Always verify the customer" makes the agent reach for <code>get_customer</code> even when the request is purely about an order. If selection tracks a <em>keyword</em> in the user message while the tool descriptions are clean, suspect the prompt.',
      },
      {
        title: 'Constrain the capability, not the behaviour',
        body: 'A general <code>fetch_url</code> plus an instruction not to use it for search will still be used for search. Replace it with <code>load_document</code>, which validates that the URL points at a document. Least privilege at the interface beats a rule in the prompt.',
      },
    ],
    exam: '<code data-tip="allowed_tools">allowed_tools</code> is the answer whenever the stem describes an agent doing something outside its remit, and the fix "add an instruction telling it not to" is on the list.',
    refs: 'Ch.3.2 · Domain 2.3 · Practice Q10, Q56',
  },

  {
    id: 'l3',
    n: 3,
    title: 'Hooks',
    tagline: 'The only layer that gives you a guarantee.',
    goal: 'Enforce a rule in code, and reshape tool output before the model ever sees it.',
    lang: 'py',
    code: `# PreToolUse - intercept the outgoing call and block it
@hook("PreToolUse")
def enforce_refund_limit(tool_call):
    if tool_call.name == "process_refund" and tool_call.args["amount"] > 500:
        return redirect_to_escalation(tool_call)   # never reaches the tool
    return tool_call

# PostToolUse - rewrite the result before the model reads it
@hook("PostToolUse", tool="lookup_order")
def trim_order_fields(result):
    # 40+ fields come back; 5 matter for this task
    return {
        "order_id":        result["order_id"],
        "status":          result["status"],
        "total":           result["total"],
        "items":           result["items"],
        "return_eligible": result["return_eligible"],
    }

# PostToolUse also normalises formats you do not control
@hook("PostToolUse")
def normalize_dates(result):
    # Unix timestamps and "Mar 5, 2025" -> ISO 8601, in one place
    return to_iso8601(result)`,
    keys: [
      { key: 'PreToolUse', why: 'Fires before the tool runs. Can block the call or redirect it. This is your enforcement point.' },
      { key: 'PostToolUse', why: 'Fires after, before the model sees the result. Trim it, normalise it, reshape it.' },
    ],
    buys: 'Determinism. A hook fires 100% of the time; a prompt instruction is roughly 90-something percent and never 100%.',
    breaks: 'One agent can only do one job well. A broad task still needs decomposition.',
    caveats: [
      {
        title: 'Money, identity, legality, safety → hook, never prompt',
        body: 'This is the single most repeated judgement on the exam. If the consequence of non-compliance is financial, legal or a safety breach, the answer enforces it in code. "Strengthen the system prompt" and "add <span data-tip="few_shot">few-shot examples</span>" both lose to a programmatic precondition every time.',
      },
      {
        title: 'PostToolUse is a context-management tool',
        body: 'When a tool returns 40 fields and 5 matter, the other 35 consume the window on every call. Trimming in a hook is deterministic and central, better than asking the model to ignore them, and better than a wrapper per tool.',
      },
      {
        title: 'It reaches third-party MCP servers too',
        body: 'A <span data-tip="hook">hook</span> is the only place you can normalise output from a server you do not own. That is exactly why it beats "modify the tools you control and write wrappers for the rest".',
      },
    ],
    exam: 'Watch for the near-miss: sometimes the right answer is not a hook but a <em>tool-level</em> fix, when the tool itself has definitive knowledge: a tool that knows a failure was a network timeout should retry internally rather than surface a flag for the agent to interpret.',
    refs: 'Ch.3.5, 11.2 · Practice Q51, Q59, Q61, Q62',
  },

  {
    id: 'l4',
    n: 4,
    title: 'Subagents via the Task tool',
    tagline: 'Hub and spoke. The coordinator owns every hop.',
    goal: 'Decompose the work, delegate it, and keep each worker cheap and focused.',
    lang: 'py',
    code: `coordinator = AgentDefinition(
    name="research_coordinator",
    description="Decomposes a topic, delegates, aggregates, reconciles",
    system_prompt=COORDINATOR_PROMPT,
    allowed_tools=["Task"],        # Task is what spawns a subagent
)

search_agent = AgentDefinition(
    name="web_search",
    description="Searches the web, returns structured findings",
    system_prompt=SEARCH_PROMPT,
    allowed_tools=["web_search"],  # least privilege: nothing else
)

# A subagent inherits NO history. Everything it needs goes in the prompt.
Task(agent="web_search", prompt=f"""
Research: AI in music production, 2024 onward.
Do NOT cover visual art - another agent owns that slice.

Prior findings to build on:
{prior_findings}

Return JSON only, no prose:
  [{{"claim": ..., "source_url": ..., "published": "YYYY-MM-DD"}}]
""")

# Three Task calls in ONE coordinator turn run in parallel.`,
    keys: [
      { key: 'Task', why: 'The tool that spawns a subagent. The coordinator’s allowed_tools must include it, or delegation silently is not possible.' },
      { key: 'allowed_tools (subagent)', why: 'Fewer tools means fewer distractions and a smaller context bill per worker.' },
    ],
    buys: 'Parallelism and context isolation. Each subagent burns its own window on its own slice, and the coordinator keeps a clean view.',
    breaks: 'Across sessions nothing persists. Close the terminal and the investigation is gone.',
    caveats: [
      {
        title: 'Isolated context is the whole point, and the whole trap',
        body: 'A subagent inherits none of the coordinator’s history and <span data-tip="isolated_context">shares no memory between calls</span>. <code data-tip="task_tool">Task: "Analyze the document"</code> gives it nothing to analyse. Paste the document, the prior results and the output schema into the prompt.',
      },
      {
        title: 'Ask for structured findings, not raw dumps',
        body: 'If a search agent returns 85K tokens of page content and an analysis agent returns 70K of reasoning, synthesis drowns. Fix it at the source: require key facts, quotes and relevance scores. Do not add a summarisation agent to compress what should never have been sent.',
      },
      {
        title: 'Everything routes through the coordinator',
        body: 'Subagent-to-subagent traffic destroys the property you built this for: one place with visibility into every hop, uniform error handling, and control over what each worker sees.',
      },
      {
        title: 'Bad coverage is usually a decomposition bug',
        body: 'When every subagent succeeds and the report still misses whole areas, the subagents did their jobs and the coordinator handed out the wrong slices. Partition the space explicitly <em>before</em> delegating, or two agents research the same subtopic and double the token bill.',
      },
    ],
    exam: 'A coordinator without <code data-tip="task_tool">"Task"</code> in <code data-tip="allowed_tools">allowed_tools</code> cannot delegate at all. And when subagents all succeed but the output is wrong, look up the chain, not down.',
    refs: 'Ch.3.3-3.4, 11.5 · Practice Q4, Q8, Q11, Q14',
  },

  {
    id: 'l5',
    n: 5,
    title: 'Sessions: resume and fork',
    tagline: 'Work that outlives one terminal, and knows when to be thrown away.',
    goal: 'Continue a long investigation, or branch it to compare two approaches.',
    lang: 'bash',
    demo: 'sessions',
    code: `# Continue a named session with its full prior context
claude --resume cart-flicker

# Or branch from that context instead of continuing it. Both children
# inherit everything up to the branch point, then diverge independently -
# no cross-contamination between the two attempts:
#
#   query(prompt="Implement the Redux version.",
#         options={"resume": "cart-flicker", "fork_session": True})
#
# Run it both ways below.`,
    keys: [
      { key: '--resume <name>', why: 'Reopens a named session with the context it had when you left.' },
      { key: 'fork_session', why: 'Branches an independent session from shared context, for comparing approaches side by side.' },
    ],
    buys: 'Continuity across days, and the ability to try two designs from the same starting point without either polluting the other.',
    breaks: 'Nothing; this is the top of the stack. What is left is knowing when <em>not</em> to resume.',
    caveats: [
      {
        title: 'Stale tool results actively mislead',
        body: 'Resuming restores the file contents the session read days ago. If those files have since changed, the agent reasons confidently about a codebase that no longer exists. Starting fresh with "here is a short summary of what we found" is more reliable than resuming stale context.',
      },
      {
        title: 'Forking copies the staleness too',
        body: '<code data-tip="fork_session">fork_session</code> is for exploring alternatives from a good starting point, not for repairing a degraded one. It inherits whatever the parent had, including out-of-date tool results.',
      },
      {
        title: 'Write findings down instead',
        body: 'In a long investigation, have the agent keep a scratchpad file of concrete findings: real class names, call sites, external rate limits, migration dates. That survives compaction, a new session, and a crash, which context does not. Long multi-agent jobs go further: each agent persists a small state file and the coordinator keeps a manifest, so a crash resumes from disk instead of restarting from zero.',
      },
    ],
    exam: 'The tell for "start a new session" is always a change in the world since the session ran: files refactored, a dependency upgraded, time passed. The tell for <code data-tip="fork_session">fork_session</code> is two candidate approaches you want to compare.',
    refs: 'Ch.5.10, 11.4 · Domain 1.7',
  },
];
