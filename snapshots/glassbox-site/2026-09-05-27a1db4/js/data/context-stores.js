// ── Context lab: where a fact can live ───────────────────────
// The matrix in data/context.js answers "how do I manage the window".
// This file answers the question that comes next: a fact has to sit
// somewhere between two requests, and the window is only one of the
// places available. Grouped by medium, because that is what decides
// what a fact survives: a summarizer, a crashed process, a new
// session tomorrow.
//
// Sources: guide ch.11 (§11.1 CASE FACTS, §11.2 trimming tool results,
// §11.3 position-aware input, §11.4 scratchpad files, §11.5 delegating
// to subagents / separate context layer / context leakage, §11.6
// structured state persistence + manifest) and ch.9 (CLAUDE.md,
// /memory, --resume, fork_session). Nothing here is beyond the guide.
//
// Escaping: `survives`, `costs`, `note`, `exam`, WINDOW_HYGIENE[].body
// and STORE_RULE render RAW (inline <code>/<em>/<strong> and data-tip
// spans allowed). Names, `where`, `lifetime`, labels and every code
// sample are plain text; the lab escapes them (code via highlightCode).
//
// Code samples sit in a two-column grid: keep lines under ~46 columns
// or the block scrolls sideways in a card nobody will scroll.

export const STORE_HEADING = 'Where the fact actually lives between two requests';

export const STORE_LEAD = 'The model reads exactly one thing: the request in front of it. Everything else (a file, a sibling agent, a vector store) is somewhere you <em>copy from</em> into that request. So the useful question is not "how do I give Claude memory", it is "which of these survives the thing that is about to destroy my context": a summarizer, a crashed process, a closed session.';

export const STORE_TIERS = [
  {
    name: 'In the request itself',
    sub: 'Read directly by the model, and paid for on every single call.',
    stores: [
      {
        id: 'messages',
        name: 'The messages array',
        tip: 'messages_array',
        where: 'the request body',
        lifetime: 'one call',
        survives: 'Nothing. It is not storage: it is what you rebuild on every request out of whatever the other rows on this page kept for you.',
        costs: 'Tokens, linearly, forever. This is the pressure that makes every other row exist.',
        note: 'Worth stating plainly because it is the assumption behind every wrong answer about memory: there is no server-side session, no conversation id to resume, nothing retained between two API calls.',
      },
      {
        id: 'facts',
        name: 'A facts block in the prompt',
        tip: 'case_facts',
        where: 'every prompt, outside the history',
        lifetime: 'as long as you keep re-sending it',
        survives: 'Summarization. That is the entire point: a <code>=== CASE FACTS ===</code> block ships verbatim, so no digest ever rounds <code>$89.99</code> into "about $90".',
        costs: 'Extraction logic, and the discipline to update it when a fact changes. A stale block is worse than no block.',
        note: 'Compared against the other window strategies in the table above; it is listed here because it is also the cheapest <em>store</em> in the set, a dozen lines of structured text you own.',
      },
    ],
  },
  {
    name: 'On disk, next to the code',
    sub: 'Outlives the window, the process and the session. The agent has to be told to read it.',
    stores: [
      {
        id: 'scratchpad',
        name: 'A scratchpad file',
        tip: 'scratchpad',
        where: 'a working file the agent writes',
        lifetime: 'until you delete it',
        survives: 'Context degradation <em>and</em> a brand-new session. When the window is compacted or the session ends, the agent reads the scratchpad instead of re-running the whole investigation.',
        costs: 'One instruction ("record findings as you go") and the risk of a stale note: a file that still claims a rate limit that changed last month.',
        codes: [
          {
            label: 'investigation-scratchpad.md',
            lang: 'text',
            text: `# investigation-scratchpad.md
## Key findings
- PaymentProcessor inherits BaseProcessor
  (src/payments/processor.ts)
- refund() is called from 3 places:
  OrderController, AdminPanel, CronJob
- PaymentGateway API: 100 req/min limit
- Migration #47 added refund_reason
  (NOT NULL) - 2024-12-01`,
          },
        ],
        note: 'The findings, not the transcript. Four lines like these replace the fifteen file reads that produced them, which is why a scratchpad is a context technique and not just note-taking.',
        exam: 'The answer whenever a long investigation has to survive something: a compaction, a crash, a session boundary, a hand-off to tomorrow. Re-running discovery is the distractor.',
      },
      {
        id: 'state',
        name: 'Structured state + a manifest',
        tip: 'agent_state',
        where: 'one JSON file per agent',
        lifetime: 'until the run is finished with it',
        survives: 'A crash. Each agent exports its state to a known location; the coordinator reads a manifest on resume and restarts only what is unfinished.',
        costs: 'A schema per agent and a write at every checkpoint. Overkill for a chat, load-bearing for a pipeline that runs for an hour.',
        codes: [
          {
            label: 'agent-state/web-search-agent.json',
            lang: 'json',
            text: `{
  "status": "completed",
  "queries_executed": [
    "AI music 2024",
    "AI music composition"
  ],
  "results_count": 12,
  "key_findings": ["..."],
  "coverage": ["music composition"],
  "gaps": ["music licensing"]
}`,
          },
          {
            label: 'agent-state/manifest.json',
            lang: 'json',
            text: `{
  "web-search":   "completed",
  "doc-analysis": "in_progress",
  "synthesis":    "not_started"
}`,
          },
        ],
        note: 'Note what the state file carries besides results: <code>coverage</code> and <code>gaps</code>. A resumed coordinator needs to know what was <em>not</em> covered, and no amount of re-reading the findings will tell it.',
        exam: 'Multi-agent crash recovery: persist per-agent state to a known path and resume from a manifest, not "start the whole research run again", and not "keep it in the coordinator’s context".',
      },
      {
        id: 'claudemd',
        name: 'CLAUDE.md',
        tip: 'claude_md',
        where: 'the repo (or ~/.claude/)',
        lifetime: 'until edited; it is version-controlled',
        survives: 'Every session, because it is loaded at the start of all of them. The place for a convention that should never have to be discovered twice.',
        costs: 'Window, permanently: it is always in context. Convention belongs here, findings from one investigation do not.',
        note: 'The line between this and a scratchpad is durability of the <em>fact</em>, not of the file: "we use pnpm, never npm" is CLAUDE.md; "refund() has three callers" is a scratchpad note that a refactor will falsify. <span data-tip="memory_cmd">/memory</span> edits the former from inside a session.',
      },
    ],
  },
  {
    name: 'Somewhere else entirely',
    sub: 'Another agent, an index, or a stored transcript. Retrieved on demand instead of carried.',
    stores: [
      {
        id: 'subagent',
        name: 'A subagent’s summary',
        tip: 'subagent',
        where: 'a separate context layer',
        lifetime: 'one Task call',
        survives: 'Nothing on its own, but it is the only technique that keeps 15 files out of the coordinator’s window in the first place. The subagent burns its own context and returns one line.',
        costs: 'A prompt to write, a result to validate, and no shared memory: everything the spoke needs must be pasted in. See <a href="#loop">hub-and-spoke</a> in the Agent Loop lab.',
        codes: [
          {
            label: 'delegating to protect context',
            lang: 'text',
            text: `Main: "Investigate the payments
       module's dependencies"

  -> Subagent (Explore): reads 15 files,
     traces imports
  -> Returns: "Payments depends on
     AuthService, OrderModel and the
     external PaymentGateway API"

Main agent: one line in context,
not 15 files.`,
          },
        ],
        note: 'The guide calls the coordinator a <em>separate context layer</em>: it aggregates outputs, holds global state and allocates budget, which is what prevents <span data-tip="context_leakage">context leakage</span>. Constrain each spoke with a minimal prompt, a structured return, and a short <code>allowedTools</code> list; fewer tools is also less context.',
        exam: 'When the complaint is "the main agent’s window fills up with exploration", delegation is the answer, and the reason is the isolated window, not speed.',
      },
      {
        id: 'retrieval',
        name: 'A semantic index',
        tip: null,
        where: 'an embedding store',
        lifetime: 'as long as you maintain it',
        survives: 'Months. The full history lives outside the window and only the exchanges relevant to the current question come back, word for word.',
        costs: 'Real infrastructure, and a recall failure mode: something relevant but not semantically similar is simply not retrieved.',
        note: 'Right at archive scale, wrong at session scale. The guide calls it overkill for a single conversation, which is exactly how it shows up as a distractor.',
      },
      {
        id: 'session',
        name: 'The stored session',
        tip: 'fork_session',
        where: 'the SDK / CLI session store',
        lifetime: 'until you stop resuming it',
        survives: 'Closing the terminal. <code>--resume</code> continues the same conversation later; <code>fork_session</code> branches a second one from shared context up to the fork point.',
        costs: 'It restores history, not judgement: a resumed session inherits every wrong turn it took, and a forked one inherits everything before the branch.',
        note: 'Useful as a store precisely because it is the transcript itself. Reach for a fork when two approaches must be compared without one contaminating the other: the shared prefix is the setup you do not want to rebuild twice.',
      },
    ],
  },
];

export const HYGIENE_LABEL = 'Three ways to spend less of it';
export const HYGIENE_LEAD = 'Storage decides what survives. These decide how much of the window a turn needs in the first place, and two of them are code rather than prompting.';

export const WINDOW_HYGIENE = [
  {
    title: 'Trim the tool result',
    tip: 'hook',
    body: 'A <code>lookup_order</code> that returns 40 fields when the task needs 5 spends the window on noise the model then has to read past. A <code>PostToolUse</code> hook rewrites the result before it is ever appended, deterministically, on every call.',
    // Labels are rendered uppercase by .code-block__lang, so they read
    // as short tags; "PostToolUse hook" would come out unreadable.
    codeLabel: 'trim hook · python',
    lang: 'python',
    code: `# PostToolUse hook: keep 5 of 40 fields
@hook("PostToolUse", tool="lookup_order")
def trim_order_fields(result):
    return {
        "order_id": result["order_id"],
        "status":   result["status"],
        "total":    result["total"],
        "items":    result["items"],
        "return_eligible":
            result["return_eligible"],
    }`,
  },
  {
    title: 'Put the important part first, and last',
    tip: 'lost_in_middle',
    body: 'A long tool output is read reliably at its edges and unreliably in the middle. So lay it out that way on purpose: findings at the top, bulk in the middle, action items at the end. The same tokens, positioned to be read.',
    codeLabel: 'tool output layout',
    lang: 'text',
    code: `[KEY FINDINGS - at the top]
Found 3 critical vulnerabilities...

[DETAILED RESULTS - middle]
=== File auth.ts ===
...
=== File database.ts ===
...

[ACTION ITEMS - at the end]
Priority: fix auth.ts before merge.`,
  },
  {
    title: 'Do not read it in the main window at all',
    tip: 'subagent',
    body: 'The cheapest tokens are the ones that never enter this window. Exploration that will produce one paragraph of conclusions belongs in a subagent whose context you are willing to throw away: the “subagent’s summary” card above, seen from the budget side instead of the storage side.',
    codeLabel: null,
    lang: null,
    code: null,
  },
];

export const STORE_RULE = 'One rule ties the whole page together: <strong>the model only ever reads the request.</strong> A scratchpad the agent is never told to open, a state file nothing loads on resume, an index nobody queries: each is a store that changed nothing. Storing a fact and re-supplying it are two separate jobs, and the exam tests the second one.';
