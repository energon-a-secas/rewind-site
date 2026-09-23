// ── Agent-loop scenarios ─────────────────────────────────────
// Each run is a hand-authored simulation of the agentic loop.
// A run = { nodes, steps }. Steps are replayed by labs/loop.js.
//
// node   = { id, label, kind, role, model, tools, tool_choice, max_tokens, context, blurb }
//   kind = user | coordinator | subagent | tool
// step   = {
//   chat,   human-facing transcript line (what a Claude Code user sees)
//   raw,    under-the-hood API/loop event
//   turn,   request | response | tool | result | system  (styles the raw log)
//   reveal, node ids to add to the canvas
//   edges,  [[from,to], ...] connections to draw
//   active, node id(s) to mark "running"
//   done,   node id(s) to mark "complete"
//   tokens, context-window tokens after this step
//   flag,   anti-pattern id to surface inline (see data/antipatterns.js)
//   note,   exam note shown in the step detail
// }

export const RUNS = {
  writing: {
    id: 'writing',
    title: 'Review my writing with subagents',
    blurb: 'The classic "spin up reviewers" ask. One line to you, a coordinator plus three parallel subagents underneath.',
    prompt: 'Spin up subagents to give me feedback on my blog draft.',
    contextMax: 12000,
    nodes: {
      user: { id: 'user', label: 'You', kind: 'user', blurb: 'Your one-line request.' },
      coord: {
        id: 'coord', label: 'Coordinator', kind: 'coordinator', role: 'Main agent',
        model: 'claude-opus-4-6', tools: ['Task', 'Read'], tool_choice: 'auto', max_tokens: 4096,
        context: 'Full session history + the draft it reads',
        blurb: 'Decomposes the task, spawns reviewers, and merges their findings. It is the only thing that talks to the subagents.',
      },
      read: {
        id: 'read', label: 'Read', kind: 'tool', role: 'Built-in tool',
        blurb: 'Loads draft.md into the coordinator context so it can be pasted into each reviewer.',
      },
      clarity: {
        id: 'clarity', label: 'reviewer:clarity', kind: 'subagent', role: 'Subagent',
        model: 'claude-sonnet-4-6', tools: [], tool_choice: 'auto', max_tokens: 2048,
        context: 'ISOLATED — only the pasted draft + a clarity rubric',
        blurb: 'Judges whether each paragraph earns its place and flags vague claims. Knows nothing about the other reviewers.',
      },
      structure: {
        id: 'structure', label: 'reviewer:structure', kind: 'subagent', role: 'Subagent',
        model: 'claude-sonnet-4-6', tools: [], tool_choice: 'auto', max_tokens: 2048,
        context: 'ISOLATED — only the pasted draft + a structure rubric',
        blurb: 'Checks flow, headings, and whether the intro promises what the body delivers.',
      },
      grammar: {
        id: 'grammar', label: 'reviewer:grammar', kind: 'subagent', role: 'Subagent',
        model: 'claude-haiku-4-5', tools: [], tool_choice: 'auto', max_tokens: 2048,
        context: 'ISOLATED — only the pasted draft + a style guide',
        blurb: 'Line edits: grammar, tense, and banned words. Cheapest model because the task is narrow.',
      },
    },
    steps: [
      { chat: '\u203a Spin up subagents to give me feedback on my blog draft.', raw: 'POST /v1/messages \u2014 1 user turn \u00b7 tools: [Task, Read] \u00b7 tool_choice: auto', turn: 'request', reveal: ['user', 'coord'], edges: [['user', 'coord']], tokens: 1400, note: 'Every request ships the full history, tool definitions, and system prompt. Nothing persists server-side between calls.' },
      { chat: 'Coordinator: I\u2019ll read the draft, then run three focused reviewers in parallel.', raw: '\u2190 stop_reason: "tool_use" \u2192 Read(path="draft.md")', turn: 'response', active: 'coord', reveal: ['read'], edges: [['coord', 'read']], tokens: 1700, note: 'stop_reason "tool_use" is what keeps the loop going. The coordinator picked a tool; your code must run it and return the result.' },
      { chat: 'Read draft.md \u2713 (1,240 words)', raw: '\u2192 tool_result: draft.md \u2014 1,240 words appended to context', turn: 'result', done: ['read'], active: 'coord', tokens: 3600, note: 'Tool results pile up in the context window. A 40-field result where 5 matter is wasted budget \u2014 trim it with a PostToolUse hook.' },
      { chat: 'Coordinator: Splitting into clarity, structure, and grammar so the reviews don\u2019t dilute each other.', raw: '\u2190 (reasoning) task decomposition \u2192 3 independent review dimensions', turn: 'response', active: 'coord', tokens: 3900, note: 'Prompt-chaining logic: separate passes keep quality even. One reviewer reading for everything at once suffers attention dilution.' },
      { chat: 'Spawning 3 reviewers\u2026', raw: '\u2190 stop_reason: "tool_use" \u2192 3 \u00d7 Task() in ONE turn \u2192 run in parallel', turn: 'response', active: 'coord', reveal: ['clarity', 'structure', 'grammar'], edges: [['coord', 'clarity'], ['coord', 'structure'], ['coord', 'grammar']], tokens: 4200, flag: 'vague-task', note: 'The coordinator\u2019s allowed_tools must include "Task". Multiple Task calls in a single turn fan out concurrently.' },
      { chat: 'reviewer:clarity \u00b7 reviewer:structure \u00b7 reviewer:grammar \u2014 working\u2026', raw: 'Each Task boots fresh: system + pasted draft + rubric only. No parent history inherited.', turn: 'system', active: ['clarity', 'structure', 'grammar'], tokens: 4200, note: 'Isolated context is the whole point and the whole trap: if the coordinator forgets to paste the draft, the subagent reviews nothing.' },
      { chat: 'reviewer:grammar \u2713 4 line edits', raw: '\u2192 tool_result: reviewer:grammar \u2192 {findings:[\u2026], severity ranked} (JSON)', turn: 'result', done: ['grammar'], active: ['clarity', 'structure'], tokens: 5100, note: 'Subagents should return structured summaries, not raw dumps \u2014 that keeps the coordinator context lean.' },
      { chat: 'reviewer:clarity \u2713 3 findings', raw: '\u2192 tool_result: reviewer:clarity \u2192 {findings:[\u2026]} (JSON)', turn: 'result', done: ['clarity'], active: ['structure'], tokens: 6000 },
      { chat: 'reviewer:structure \u2713 2 findings', raw: '\u2192 tool_result: reviewer:structure \u2192 {findings:[\u2026]} (JSON)', turn: 'result', done: ['structure'], active: 'coord', tokens: 6800 },
      { chat: 'Coordinator: Merging 9 findings, dropping 2 duplicates, ranking by severity.', raw: '\u2190 (reasoning) aggregate + dedupe + rank across subagent outputs', turn: 'response', active: 'coord', tokens: 7200, note: 'All communication flows through the coordinator. Subagents never talk to each other \u2014 that is what makes the run observable and debuggable.' },
      { chat: 'Here\u2019s your prioritized feedback \u25b8 7 items, top fix first.', raw: '\u2190 stop_reason: "end_turn" \u2014 loop complete', turn: 'response', done: ['coord'], tokens: 7400, flag: 'parse-text-completion', note: '"end_turn" is the only trustworthy completion signal. Counting iterations or grepping for "done" is how agent loops silently break.' },
    ],
  },

  support: {
    id: 'support',
    title: 'Handle a customer refund',
    blurb: 'A single agent with four tools, plus a hook that makes the money rule non-negotiable.',
    prompt: 'A customer says their $89 headphones arrived broken and wants a refund.',
    contextMax: 9000,
    nodes: {
      user: { id: 'user', label: 'Customer', kind: 'user', blurb: 'Reports a damaged item and asks for a refund.' },
      agent: {
        id: 'agent', label: 'Support agent', kind: 'coordinator', role: 'Agent',
        model: 'claude-sonnet-4-6', tools: ['get_customer', 'lookup_order', 'process_refund', 'escalate_to_human'], tool_choice: 'auto', max_tokens: 2048,
        context: 'System prompt (policy) + conversation + a CASE FACTS block',
        blurb: 'Verifies identity before touching money, then resolves or escalates by explicit rules.',
      },
      getc: { id: 'getc', label: 'get_customer', kind: 'tool', role: 'MCP tool', blurb: 'Verifies the customer by email or ID. A precondition for any refund.' },
      lookup: { id: 'lookup', label: 'lookup_order', kind: 'tool', role: 'MCP tool', blurb: 'Returns order status, total, and return eligibility.' },
      refund: { id: 'refund', label: 'process_refund', kind: 'tool', role: 'MCP tool', blurb: 'Issues the refund. Guarded by a PreToolUse hook for amounts over $500.' },
      hook: { id: 'hook', label: 'PreToolUse hook', kind: 'tool', role: 'Deterministic guard', blurb: 'Runs in code, not in the prompt. Blocks refunds over $500 and redirects to escalation \u2014 100% of the time.' },
    },
    steps: [
      { chat: '\u203a My headphones arrived broken. I want a refund.', raw: 'POST /v1/messages \u2014 tools: [get_customer, lookup_order, process_refund, escalate_to_human]', turn: 'request', reveal: ['user', 'agent'], edges: [['user', 'agent']], tokens: 1500, note: 'Watch the system prompt wording: "always verify the customer" can make the model overuse get_customer even when it is not needed.' },
      { chat: 'Agent: Let me verify your account first.', raw: '\u2190 stop_reason: "tool_use" \u2192 get_customer(email)', turn: 'response', active: 'agent', reveal: ['getc'], edges: [['agent', 'getc']], tokens: 1800, note: 'Identity verification before a financial action is a workflow precondition \u2014 best enforced in code, not hoped for in a prompt.' },
      { chat: 'Verified \u2713', raw: '\u2192 tool_result: get_customer \u2192 {customer_id:"CUST-12345", status:"active"}', turn: 'result', done: ['getc'], active: 'agent', tokens: 2300 },
      { chat: 'Agent: Checking the order.', raw: '\u2190 stop_reason: "tool_use" \u2192 lookup_order(customer_id)', turn: 'response', active: 'agent', reveal: ['lookup'], edges: [['agent', 'lookup']], tokens: 2600 },
      { chat: 'Order ORD-67890 \u00b7 $89.99 \u00b7 return-eligible \u2713', raw: '\u2192 tool_result: lookup_order \u2192 {total:89.99, return_eligible:true}', turn: 'result', done: ['lookup'], active: 'agent', tokens: 3200, note: 'A CASE FACTS block (id, order, amount, request) is kept verbatim in every prompt so summarization never loses the $89.99.' },
      { chat: 'Agent: Issuing your refund.', raw: '\u2190 stop_reason: "tool_use" \u2192 process_refund(amount=89.99)', turn: 'response', active: 'agent', reveal: ['refund', 'hook'], edges: [['agent', 'hook'], ['hook', 'refund']], tokens: 3500, flag: 'prompt-not-hook', note: 'The call passes through a PreToolUse hook first. $89.99 < $500, so the hook lets it through. A prompt rule "don\u2019t refund over $500" would only work ~90% of the time.' },
      { chat: 'Refund of $89.99 processed \u2713', raw: '\u2192 tool_result: process_refund \u2192 {status:"ok", refund_id:"RF-4471"}', turn: 'result', done: ['refund', 'hook'], active: 'agent', tokens: 3900 },
      { chat: 'Done. Your $89.99 refund lands in 3\u20135 days.', raw: '\u2190 stop_reason: "end_turn"', turn: 'response', done: ['agent'], tokens: 4100, note: 'Had the amount been $900, the hook would have blocked process_refund and forced escalate_to_human with a structured handoff \u2014 no prompt could override it.' },
    ],
  },

  research: {
    id: 'research',
    title: 'Multi-agent research report',
    blurb: 'A coordinator fans out to three researchers. One times out \u2014 watch how a good system degrades instead of collapsing.',
    prompt: 'Write a cited report on AI\u2019s impact on creative industries.',
    contextMax: 16000,
    nodes: {
      user: { id: 'user', label: 'You', kind: 'user', blurb: 'Asks for a complete, cited report.' },
      coord: { id: 'coord', label: 'Coordinator', kind: 'coordinator', role: 'Main agent', model: 'claude-opus-4-6', tools: ['Task'], tool_choice: 'auto', max_tokens: 8192, context: 'Global state + each subagent\u2019s structured return', blurb: 'Splits coverage across researchers to avoid overlap, then synthesizes with citations and coverage notes.' },
      art: { id: 'art', label: 'research:visual-art', kind: 'subagent', role: 'Subagent', model: 'claude-sonnet-4-6', tools: ['web_search'], tool_choice: 'auto', max_tokens: 4096, context: 'ISOLATED \u2014 topic + query budget', blurb: 'Searches and returns claims with source, date, and confidence.' },
      music: { id: 'music', label: 'research:music', kind: 'subagent', role: 'Subagent', model: 'claude-sonnet-4-6', tools: ['web_search'], tool_choice: 'auto', max_tokens: 4096, context: 'ISOLATED \u2014 topic + query budget', blurb: 'Hits a timeout mid-run and returns a structured partial failure.' },
      lit: { id: 'lit', label: 'research:literature', kind: 'subagent', role: 'Subagent', model: 'claude-sonnet-4-6', tools: ['web_search'], tool_choice: 'auto', max_tokens: 4096, context: 'ISOLATED \u2014 topic + query budget', blurb: 'Returns full coverage with attributed claims.' },
    },
    steps: [
      { chat: '\u203a Write a cited report on AI\u2019s impact on creative industries.', raw: 'POST /v1/messages \u2014 tools: [Task]', turn: 'request', reveal: ['user', 'coord'], edges: [['user', 'coord']], tokens: 1600 },
      { chat: 'Coordinator: Three non-overlapping beats \u2014 visual art, music, literature.', raw: '\u2190 (reasoning) split coverage to minimize duplicate searches', turn: 'response', active: 'coord', tokens: 2000, note: 'Coordinator prompts are written as goals + quality criteria ("complete, cited, no overlap"), not step-by-step scripts.' },
      { chat: 'Spawning 3 researchers in parallel\u2026', raw: '\u2190 stop_reason: "tool_use" \u2192 3 \u00d7 Task(topic, query_budget, output_schema)', turn: 'response', reveal: ['art', 'music', 'lit'], edges: [['coord', 'art'], ['coord', 'music'], ['coord', 'lit']], active: ['art', 'music', 'lit'], tokens: 2600, note: 'Each Task carries an explicit output schema so returns are structured claims, not prose blobs.' },
      { chat: 'research:visual-art \u2713 6 attributed claims', raw: '\u2192 tool_result: visual-art \u2192 {claims:[{claim, source, date, confidence}]}', turn: 'result', done: ['art'], active: ['music', 'lit'], tokens: 4200, note: 'Provenance kept per claim (source + date + confidence) so the synthesis can\u2019t drop the "who said it".' },
      { chat: 'research:literature \u2713 5 attributed claims', raw: '\u2192 tool_result: literature \u2192 {claims:[\u2026]}', turn: 'result', done: ['lit'], active: ['music'], tokens: 5600 },
      { chat: 'research:music \u26a0 partial \u2014 search timed out', raw: '\u2192 tool_result (isError): music \u2192 {status:"partial_failure", failure_type:"timeout", partial_results:[1], alternative_approaches:[\u2026]}', turn: 'result', done: ['music'], active: 'coord', tokens: 6400, flag: 'generic-error', note: 'A structured error tells the coordinator what to do: retry a narrower query, use partial results, or annotate the gap. "search failed" would tell it nothing.' },
      { chat: 'Coordinator: Keeping the one music result, flagging the section as partial.', raw: '\u2190 (reasoning) continue with partial results + coverage annotation', turn: 'response', active: 'coord', tokens: 6900, flag: 'abort-on-failure', note: 'Never abort the whole workflow on one subagent failure \u2014 you\u2019d throw away two complete sections. Continue and mark the gap.' },
      { chat: 'Report ready \u25b8 Music tagged "PARTIAL COVERAGE".', raw: '\u2190 stop_reason: "end_turn"', turn: 'response', done: ['coord'], tokens: 7300, note: 'The synthesis renders coverage honestly: FULL for art & literature, PARTIAL for music, with a note explaining why.' },
    ],
  },

  chat: {
    id: 'chat',
    title: 'Sixty turns in character',
    blurb: 'A support persona over a long, multi-order chat. Watch it drift as its own answers dilute the brief, then three context moves bring it back.',
    prompt: 'Hi Riley! Quick question about my hoodie order — and later, two more…',
    contextMax: 9000,
    nodes: {
      user: { id: 'user', label: 'Customer', kind: 'user', blurb: 'One customer, three orders, sixty turns. The chat never ends — the window would.' },
      agent: {
        id: 'agent', label: 'Support persona', kind: 'coordinator', role: 'Agent',
        model: 'claude-sonnet-4-6', tools: ['lookup_order'], tool_choice: 'auto', max_tokens: 1024,
        context: 'System prompt (persona + exact-numbers policy) + every turn so far',
        blurb: 'A warm, named persona whose brief lives in the system prompt. The brief is resent on every call — what shrinks over time is its share of the window.',
      },
      lookup: { id: 'lookup', label: 'lookup_order', kind: 'tool', role: 'MCP tool', blurb: 'Returns each order’s exact status and total. Results join the history like everything else.' },
      remind: { id: 'remind', label: 'persona re-inject', kind: 'tool', role: 'Context strategy', context: 'A one-line reminder at conversation breakpoints', blurb: 'Re-establishes the constraints as history accumulates. Reinforce, don’t restart: it costs a message, not the conversation.' },
      digest: { id: 'digest', label: 'rolling summary', kind: 'tool', role: 'Context strategy', context: 'Resolved topics compressed to a short digest', blurb: 'Frees the window, blurs specifics. Fine for settled threads; fatal as the only home of an exact number.' },
      facts: { id: 'facts', label: 'CASE FACTS block', kind: 'tool', role: 'Context strategy', context: 'Verbatim: order ids, exact totals, dates', blurb: 'Kept word-for-word in every prompt so summarization never loses the $129.99.' },
    },
    steps: [
      { chat: '› Hi Riley! Quick question about my hoodie order.', raw: 'POST /v1/messages — system: persona "Riley" + exact-numbers policy · 1 user turn', turn: 'request', reveal: ['user', 'agent'], edges: [['user', 'agent']], tokens: 900, note: 'The persona lives in the system field, loaded at the top and resent with every request. It goes out on every call — "the system prompt is only sent once" is a distractor, not a mechanism.' },
      { chat: 'Riley: Happy to help — pulling it up now!', raw: '← stop_reason: "tool_use" → lookup_order("A-1188")', turn: 'response', active: 'agent', reveal: ['lookup'], edges: [['agent', 'lookup']], tokens: 1200 },
      { chat: 'Order A-1188 · hoodie · $42.50 · shipped ✓', raw: '→ tool_result: {order:"A-1188", total: 42.50, status:"shipped"}', turn: 'result', done: ['lookup'], active: 'agent', tokens: 1600 },
      { chat: '(turn 7, a second order now) › Also — where’s my keyboard?', raw: 'POST — the transcript is mostly the assistant’s own prose by now', turn: 'request', active: 'agent', tokens: 2200, note: 'Watch the ratio, not the total: every answer the assistant writes shrinks the persona’s share of the context.' },
      { chat: 'Agent: Your request has been processed. Please allow 3-5 business days.', raw: '← generic template voice — no Riley, no exact number, at only ~2,600 tokens', turn: 'response', active: 'agent', tokens: 2600, note: 'Drift, well inside every limit: the model increasingly pattern-matches to its own accumulated output instead of the brief. Not attention decay — at 2,600 tokens nothing is being forgotten.' },
      { chat: 'Fix — reinforce, don’t restart: a one-line persona reminder at the breakpoint.', raw: 'messages ← "Reminder: you are Riley — warm, named, exact totals only."', turn: 'system', reveal: ['remind'], edges: [['agent', 'remind']], active: ['remind'], tokens: 2900, note: 'Periodic reinforcement re-establishes the constraints as history accumulates — the direct counter to instruction drift, for the cost of a small message rather than the conversation.' },
      { chat: '(thirty turns later — three orders in flight) › So what’s my keyboard refund again?', raw: 'POST — 54 turns resent · window at 76% and climbing', turn: 'request', done: ['remind'], active: 'agent', tokens: 6800, note: 'A different problem now: the window itself. Nothing persists server-side, so the whole transcript reships on every request — and three orders of history is real budget.' },
      { chat: 'Fix — summarize what’s settled: the hoodie thread becomes a two-line digest.', raw: 'history ← digest("A-1188 resolved; tone warm") · 54 turns → 12', turn: 'system', reveal: ['digest'], edges: [['agent', 'digest']], active: ['digest'], tokens: 3600, flag: 'compact-numbers', note: 'Summaries free the window and blur specifics — "about $130" is how $129.99 dies. Never let a summary be the only place a number lives.' },
      { chat: 'Fix — pin the facts: ids, exact totals and dates kept verbatim in every prompt.', raw: 'prompt ← CASE FACTS {A-1188: $42.50 · B-2041: $129.99 · C-3307: $259.00}', turn: 'system', reveal: ['facts'], edges: [['agent', 'facts']], done: ['digest'], active: ['facts'], tokens: 3900, note: 'The CASE FACTS block rides along word-for-word, outside the digest, so no compression ever touches an exact number.' },
      { chat: 'Recent turns stay word-for-word; older ones live in the digest.', raw: 'context = system + CASE FACTS + digest + last N turns (verbatim)', turn: 'system', done: ['facts'], active: 'agent', tokens: 4200, note: 'A sliding window of recent turns keeps the live thread verbatim while the digest carries the past. Pick the split per case — support across multiple orders needs the numbers pinned hardest.' },
      { chat: 'Riley: Your keyboard refund is exactly $129.99, and the monitor (C-3307, $259.00) ships Friday!', raw: '← stop_reason: "end_turn" — persona intact, numbers exact', turn: 'response', done: ['agent'], tokens: 4400, note: 'The same recipe holds for any long-running chat — a support desk or a roleplay character: reinforce the persona at breakpoints, pin exact facts verbatim, summarize the rest.' },
    ],
  },
};

export const RUN_ORDER = ['writing', 'support', 'research', 'chat'];
