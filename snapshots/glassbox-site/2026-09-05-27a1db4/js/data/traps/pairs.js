// ── Near-miss discriminators ─────────────────────────────────
// Clusters where two or three options are all defensible and the
// stem picks the winner. Pure data. No DOM. Rendered by js/labs/traps.js.
//
// Refs: Wn = the 12 worked "Examples of Exam Questions with
// Explanations"; Qn = the 76-question practice test.
//
// Escaping: `sides[].answer` and `rule` are rendered RAW (they carry
// <code> and <em>). `question`, `sides[].when` and `sides[].ref` are
// escaped - keep them free of markup.
//
// `beyond: true` means the discriminator comes from third-party question
// banks rather than the official guide. Those entries carry no W/Q refs
// and the renderer badges them, so a claim the guide never made cannot
// pass itself off as one that it did.

export const PAIRS = [
  {
    id: 'tool-misrouting',
    question: 'The agent keeps calling the wrong tool. What do you change?',
    sides: [
      {
        when: 'Both tool descriptions are minimal or near-identical ("Gets customer information" / "Gets order details").',
        answer: 'Expand each description with input formats, example queries, edge cases, and boundaries saying when to use it versus the similar tool. Lowest effort, highest impact, and it is the <em>first</em> thing to check.',
        ref: 'Q57, Q46, W2',
      },
      {
        when: 'The descriptions are adequate, but the two tool names mean the same thing - analyze_content next to analyze_document.',
        answer: 'Rename the offending tool to erase the semantic overlap: <code>analyze_content</code> becomes <code>extract_web_results</code>, described as processing information retrieved from web search and URLs.',
        ref: 'Q7',
      },
      {
        when: 'The stem states the tool descriptions are already clear, and the misrouting tracks a keyword in the user message (78% versus 93%).',
        answer: 'The system prompt holds keyword-sensitive routing instructions steering the model. Fix the prompt; the tools are innocent.',
        ref: 'Q56',
      },
    ],
    rule: 'Fix the layer the stem indicts. "Minimal or similar descriptions" means write better descriptions; "the names overlap" means rename; "descriptions are clear" means the system prompt is steering. Few-shot never wins this cluster unless the stem has already committed you to it - and then the answer is 4-6 examples aimed at the genuinely ambiguous cases with rationale, not 10-15 obvious ones or examples grouped by tool (Q60).',
  },
  {
    id: 'config-surface',
    question: 'Where does this instruction belong in a Claude Code repo?',
    sides: [
      {
        when: 'It must apply in every session, for everyone on the team.',
        answer: 'Project <code>CLAUDE.md</code> (or <code>.claude/CLAUDE.md</code>). A new joiner missing the rule that three teammates have means it was only ever in their user-level <code>~/.claude/CLAUDE.md</code>.',
        ref: 'Q37, Q33',
      },
      {
        when: 'It applies to a set of files identified by a glob, and those files are scattered across directories.',
        answer: 'A file under <code>.claude/rules/</code> with <code>paths:</code> frontmatter - it loads only when Claude edits a matching path, which saves context and works for co-located tests.',
        ref: 'Q40, Q42, W6',
      },
      {
        when: 'It is only useful while performing one task - PR review, deploy, migration, generating a new endpoint.',
        answer: 'A skill in <code>.claude/skills/</code>, invoked on demand, keeping <code>CLAUDE.md</code> for the standards that are always true.',
        ref: 'Q33, Q38',
      },
    ],
    rule: 'Ask what triggers the load: always → <code>CLAUDE.md</code>; a file path → <code>.claude/rules/</code> with <code>paths:</code>; a task → a skill. Directory-level <code>CLAUDE.md</code> loses whenever the matching files span many directories (W6, Q40), and <code>.claude/config.json</code> and <code>.claude/config.yaml</code> do not exist (W4, Q42).',
  },
  {
    id: 'frontmatter-mapping',
    question: 'Which SKILL.md frontmatter key fixes this symptom?',
    sides: [
      {
        when: 'After the skill runs, the session becomes unresponsive and Claude loses the original task - the analysis output flooded the window.',
        answer: '<code>context: fork</code>. The skill runs in an isolated subagent, so its verbose output never lands in the main session while full capability is preserved.',
        ref: 'Q35',
      },
      {
        when: 'After the skill runs, later answers keep referencing it - rejected approaches, schema details from unrelated prior conversations.',
        answer: '<code>context: fork</code> again. Same key, different symptom: leakage rather than volume.',
        ref: 'Q43, Q39',
      },
      {
        when: 'Developers invoke the skill with no argument, or the skill can reach tools that delete things.',
        answer: '<code>argument-hint</code> prompts for the missing parameter; <code>allowed-tools</code> constrains the skill to safe operations.',
        ref: 'Q39',
      },
    ],
    rule: 'Map symptom to key one-for-one: context pollution or verbose output → <code>context: fork</code>; missing parameters → <code>argument-hint</code>; unsafe reach → <code>allowed-tools</code>. Q39 stacks all three symptoms in one stem, so any option fixing only two of them loses. <code>model: haiku</code>, <code>override: true</code>, and splitting the skill in half are not context fixes.',
  },
  {
    id: 'personal-skill-override',
    question: 'A developer wants a personal variant of a team skill.',
    sides: [
      {
        when: 'They want their own workflow without affecting teammates.',
        answer: 'Create it under <code>~/.claude/skills/</code> with a <em>different</em> name, e.g. <code>/my-commit</code>. They keep the team’s maintained <code>/commit</code> (and every update the team ships to it) plus a clearly named personal skill.',
        ref: 'Q36, §5.5',
      },
      {
        when: 'The option reuses the same name at user scope, or sets override: true in the frontmatter.',
        answer: 'Both lose. Same-name shadowing is silent: personal skills take precedence over project skills, so that developer quietly stops receiving team updates to <code>/commit</code>. And <code>override: true</code> is not a real frontmatter key.',
        ref: 'Q36',
      },
    ],
    rule: 'Precedence is the trap, not the trick. User scope beats project scope at the same path, which makes shadowing automatic <em>and</em> invisible - the shadowed developer stops tracking team improvements without any signal. §5.5 and Q36 agree: personal variants go under different names, so the override never happens by accident.',
  },
  {
    id: 'error-handling-location',
    question: 'A subagent hits an error. Who handles it?',
    sides: [
      {
        when: 'The component can classify the failure itself and knows the class is transient - a network timeout next to a syntax error, one corrupt PDF among many.',
        answer: 'Local recovery at that level, for that class only: the tool retries its timeouts and rejects syntax errors immediately; the subagent does one or two retries and escalates the rest with attempted steps and partial results.',
        ref: 'Q62, Q3',
      },
      {
        when: 'The failure ends that unit of work, and the recovery choice - retry with a new query, reroute, or proceed and annotate the gap - belongs to whoever can see the whole task.',
        answer: 'Return structured error context to the coordinator: failure type, the query attempted, any partial results, and alternative approaches.',
        ref: 'Q9, Q6, W8',
      },
    ],
    rule: 'Handle the error at the lowest level that has definitive knowledge of its type; propagate everything above that line with context attached. Three shapes lose no matter which level they sit at: a generic "operation failed" status (W8, Q9), an empty result marked as success (Q6, Q9), and aborting the whole workflow on one failure (§10.2).',
  },
  {
    id: 'escalate-resolve-ask',
    question: 'Escalate, resolve, or ask the customer?',
    sides: [
      {
        when: 'The agent escalates simple cases and tries to handle policy exceptions on its own - the boundary itself is unclear.',
        answer: 'Put explicit escalation criteria in the system prompt with few-shot examples contrasting escalate against resolve. Not a classifier, not sentiment, not self-rated confidence.',
        ref: 'W3, Q49',
      },
      {
        when: 'Policy covers a neighbouring case and is silent on this one - price drops on your own site, nothing about competitor matching.',
        answer: 'Escalate for policy interpretation. The agent must not invent policy, and a genuine gap is a human decision.',
        ref: 'Q50',
      },
      {
        when: 'get_customer returned several matches, or the user has stated two preferences that cannot both hold.',
        answer: 'Ask the user - for another identifier, or for which preference wins. Do not escalate, do not guess, do not rank.',
        ref: 'Q55, Q63',
      },
    ],
    rule: 'Escalate only for a decision that needs human authority: an explicit request for a manager (immediately, with no investigation first - §9.2), a policy gap, or genuine inability to progress. Ambiguity the user can settle in one turn is a question, not an escalation - and "the message contains two issues" is never a trigger (Q50).',
  },
  {
    id: 'ambiguity-three-ways',
    question: 'The request is ambiguous. Ask, assume, or split it?',
    sides: [
      {
        when: 'Two stated preferences are logically incompatible - "very low risk tolerance" and "maximize my returns".',
        answer: 'Surface the contradiction and ask which one matters more. Every other route silently bakes in an assumption that may be wrong.',
        ref: 'Q63',
      },
      {
        when: 'The request is merely vague, and clarifying questions are causing 35-40% abandonment.',
        answer: 'Make reasonable assumptions, state them explicitly, proceed, and invite corrections.',
        ref: 'Q74, Q76',
      },
      {
        when: 'The message is clear but carries several distinct issues - a refund on one order and an address change on another.',
        answer: 'Decompose into separate items. Few-shot the decomposition and sequencing pattern (Q47); when the investigation is heavy, run the issues in parallel over shared customer context before synthesizing one resolution (Q48).',
        ref: 'Q47, Q48',
      },
    ],
    rule: 'Contradiction → ask. Vagueness → assume out loud. Multiplicity → decompose. The losing shapes repeat across all three: hidden defaults (Q74, Q76), a question list or intake form that adds friction (Q74), and a separate classifier or extra model call to pre-process the message (Q47, Q76).',
  },
  {
    id: 'conversation-memory',
    question: 'The conversation is too long. How do you compress it?',
    sides: [
      {
        when: 'One long session, 78,000 tokens, holding safety-critical specifics: allergies, quantities, clarified terms.',
        answer: 'Extract the critical data into a compact structured block, summarize the general discussion, and keep recent exchanges verbatim. The same move as the persistent case-facts block for amounts, dates, and order numbers (Q54).',
        ref: 'Q65, Q54',
      },
      {
        when: 'Extended chat losing earlier topics and preferences, with an implementation that keeps only the last N message pairs.',
        answer: 'Hybrid: summarize the older messages, keep the recent ones verbatim.',
        ref: 'Q66',
      },
      {
        when: 'Three months of weekly sessions, and the user asks what you concluded about one specific topic.',
        answer: 'Semantic embeddings with retrieval of the relevant exchanges - the only approach that scales to months and can surface a specific past conclusion on demand.',
        ref: 'Q68',
      },
    ],
    rule: 'Timespan decides, and so does what the user is asking for. One session, protect the facts → structure them in place; retrieval is architectural overkill (Q65). Months of history plus a pointed question about a past conclusion → retrieval, because summarization has already abstracted the answer away (Q68). Enlarging the window (Q66) and raising the summarization threshold (Q54) only delay the same failure.',
  },
  {
    id: 'instruction-drift',
    question: 'The model stops following the system prompt after N turns.',
    sides: [
      {
        when: 'It complied for the first 10-15 turns and then deviated, still comfortably inside token limits.',
        answer: 'Insert user-role messages that re-state the guidelines at conversation breakpoints - preventive, cheap, and it re-establishes constraints as history accumulates.',
        ref: 'Q69',
      },
      {
        when: 'The system prompt is long and declarative - 2,800 tokens of teaching rules - and one rule stops being applied.',
        answer: 'Replace the verbose rules with few-shot examples demonstrating the behaviour. Abstract rules must be reasoned about every turn; patterns can just be matched.',
        ref: 'Q70',
      },
      {
        when: 'The stem asks for the most likely cause rather than a fix, and the conversation is short - turn 7, only 2,500 tokens.',
        answer: 'Accumulated assistant responses dilute the system prompt\'s influence; the model pattern-matches its own prior output.',
        ref: 'Q75',
      },
    ],
    rule: 'Decide first whether the stem wants a cause or a fix, then look at the prompt itself. A long rule-shaped prompt makes few-shot beat reminders - Q70 grades reminder injection as treating the symptom. An ordinary prompt drifting over many turns takes reminders at breakpoints. At 2,500 tokens, neither attention decay nor "the system prompt is only sent once" is true; the system prompt goes out on every call.',
  },
  {
    id: 'batch-limits',
    question: 'Why can this workflow not use the Message Batches API?',
    sides: [
      {
        when: 'A person or a merge is waiting on the result.',
        answer: 'Latency. Up to a 24-hour processing window with no SLA, so blocking work stays synchronous and scheduled work goes to batch for the 50% saving.',
        ref: 'Q19, Q30, W11',
      },
      {
        when: 'The request itself needs a tool executed mid-flight - Claude asks for a related file, you return it, analysis continues.',
        answer: 'Capability, not latency. A batch request cannot pause for your code to run the tool and hand the result back, because that loop needs a client sitting between two API calls. Note what <em>is</em> allowed: a batch request is an ordinary Messages API request, so it may carry <code>tools</code> and even prior <code>tool_use</code>/<code>tool_result</code> turns. The agentic round-trip is the missing piece, not tool support.',
        ref: 'Q18',
      },
    ],
    rule: 'Look for a tool call <em>inside</em> the request. If the workflow has one, the 24-hour argument is a decoy - Q18 offers exactly that decoy, phrased as "too slow, although the workflow would otherwise function", and it is wrong because the workflow would not function at all. With no mid-request tool call, latency is the whole argument. Beware the over-correction sitting next to it: "batch does not accept tool definitions" is also false.',
  },
  {
    id: 'sync-vs-batch',
    question: 'Two workloads, one blocking, one overnight. Which API for each?',
    sides: [
      {
        when: 'Blocking pre-merge check or PR style check - developers cannot merge until it returns.',
        answer: 'Synchronous. A 50% discount cannot buy back a 24-hour worst case on a blocking gate.',
        ref: 'W11, Q30, Q19',
      },
      {
        when: 'Overnight tech-debt report, weekly security audit, nightly test generation.',
        answer: 'Message Batches API. Already asynchronous, already polled, deadline-flexible, and 50% cheaper.',
        ref: 'Q19, Q21, Q30',
      },
    ],
    rule: 'The answer is always the split, never a uniform policy. "Both to batch with a synchronous fallback" (W11, Q30) loses because you build and pay for the sync path anyway and add batch machinery on top; "keep both synchronous" (W11, Q30) throws away a free 50% on work nobody is waiting for; "both to batch with polling" (Q19, Q30) blocks the merge for up to a day.',
  },
  {
    id: 'duplicate-output',
    question: 'Output duplicates what the repo already contains.',
    sides: [
      {
        when: 'Suggested test cases repeat scenarios the existing suite already covers - 6 of 10.',
        answer: 'Put the existing test file in context so Claude can see what is covered and propose genuinely new cases.',
        ref: 'Q24',
      },
      {
        when: 'A re-run after new commits repeats findings the developer already fixed - 5 of 8.',
        answer: 'Put the previous review findings in context and instruct Claude to report only new or still-unresolved issues.',
        ref: 'Q25',
      },
    ],
    rule: 'Duplication is missing context, not excess output - hand Claude the artefact it is duplicating. Post-processing filters lose in both stems (keyword overlap against test names in Q24, file path and description matching in Q25) because they discard real findings along with the repeats, and narrowing the scope (review only at creation, or only files from the last push) loses coverage instead.',
  },
  {
    id: 'review-independence',
    question: 'The reviewer misses what the generator already dismissed.',
    sides: [
      {
        when: 'The same session that wrote the code is asked to review it, and the reasoning trace shows the edge case was considered and argued away.',
        answer: 'A second, independent instance with no access to the generator\'s reasoning. Fresh context is the mechanism - the first session cannot audit a conclusion it is still holding.',
        ref: 'Q17, W12',
      },
      {
        when: 'Depth is uneven inside one pass - fourteen files, detailed comments on some and superficial ones on others, contradictory verdicts on identical code.',
        answer: 'Split by scope, not by instance: per-file passes for local issues, then one separate integration pass for cross-file data flow. This is attention dilution, and a second reviewer would dilute the same way.',
        ref: 'W12, Q27',
      },
    ],
    rule: 'Two different failures wear the same costume. "It talked itself out of it" is <em>bias</em>, and only independence removes it. "Deep here, shallow there" is <em>dilution</em>, and only splitting the pass removes it. A three-pass consensus vote loses against both - it suppresses the finding that only one pass caught (W12, Q27) - and a bigger context window loses against dilution specifically, because window size is not attention quality.',
  },
  {
    id: 'model-tier',
    question: 'Haiku, Sonnet, or Opus for this component?',
    beyond: true,
    sides: [
      {
        when: 'High volume, narrow and well-specified work, and latency or cost per call is the binding constraint - classification, routing, extraction against a fixed schema, a first-pass filter.',
        answer: 'The Haiku tier. It is the fast, cheap end of the family, and a task with a tight specification does not need the reasoning headroom you would be paying for. Note that the minimum cacheable prompt is <em>2,048</em> tokens on Haiku against 1,024 on Sonnet and Opus, so short prompts you expected to cache may not.',
        ref: null,
      },
      {
        when: 'Ordinary agentic work - the coding, review, tool-using and orchestration components that make up most of a system.',
        answer: 'The Sonnet tier, which is the default the guide\'s own scenarios assume. When a stem gives you no reason to move, this is the answer that needs no justification; the other two need one.',
        ref: null,
      },
      {
        when: 'Open-ended reasoning where a wrong answer is expensive and volume is low - the hardest architectural analysis, an ambiguous root-cause investigation, the final synthesis over many subagent reports.',
        answer: 'The Opus tier. The cost per call only makes sense where the difficulty is real, so an option that puts Opus behind a high-volume classifier is spending in the wrong place.',
        ref: null,
      },
    ],
    rule: 'Match the <span data-tip="model_tiers">tier</span> to the <em>shape</em> of the task, not to its importance - "this component is critical" is not an argument for Opus if the work is a schema-bound extraction. Two elimination rules do most of the work on a real stem: a fabricated model name is never the answer (there was no "Claude 3.7 Opus" - 3.7 was Sonnet only), and switching to a bigger model is never the fix for a structural failure, which the guide states outright (W12).',
  },
  {
    id: 'mcp-transport',
    question: 'Which MCP transport does this server use?',
    beyond: true,
    sides: [
      {
        when: 'The server runs on the same machine and the client launches it as a subprocess - a filesystem server, a local database bridge, anything configured with a command and arguments.',
        answer: '<span data-tip="stdio_transport"><code>stdio</code></span>. The client owns the process lifecycle and talks JSON-RPC over its standard input and output. No port, no URL, no network exposure.',
        ref: null,
      },
      {
        when: 'The server is remote, shared between clients, or reached over a URL.',
        answer: '<span data-tip="streamable_http"><em>Streamable HTTP</em></span>. This is the current remote transport; the older HTTP+SSE transport was deprecated in the 2025-03-26 spec revision, so an option naming SSE is dated rather than merely different.',
        ref: null,
      },
    ],
    rule: 'Local versus remote decides it, and there are only these two. WebSocket, gRPC and "MCP over stdio to a remote host" are invented surfaces - treat them the way you treat an invented flag. Both transports carry the same JSON-RPC protocol, so anything the stem says about tools, resources or prompts is transport-independent; only the connection changes.',
  },
  {
    id: 'schema-vs-structured-outputs',
    question: 'The JSON coming back does not always match the shape you need.',
    beyond: true,
    sides: [
      {
        when: 'The shape you care about is the argument Claude passes to a tool you defined.',
        answer: 'The tool\'s <span data-tip="input_schema"><code>input_schema</code></span> is already the contract - tighten it. Required fields, enums instead of free strings, and a description on each field are what make the call well-formed, and a tool whose schema permits nonsense will receive nonsense.',
        ref: null,
      },
      {
        when: 'The shape you care about is Claude\'s final response to you, and downstream code has to parse it.',
        answer: '<span data-tip="structured_outputs">Structured Outputs</span> - request it through <code>output_config.format</code> with your JSON Schema. This constrains the response itself, so you stop paying for the retry-and-reparse loop that "please reply in JSON" needs.',
        ref: null,
      },
      {
        when: 'You are in Claude Code or the SDK and want machine-readable output from a run.',
        answer: 'A different surface again: <code>--output-format json</code> for the envelope, and <code>--json-schema</code> to constrain the shape inside it. Same idea, command-line spelling.',
        ref: null,
      },
    ],
    rule: 'Ask which artefact has to be valid: a tool call, a response body, or a CLI run. Prompting for JSON is the answer to none of them once a schema mechanism exists, and a schema is not a validator - it constrains generation, so it belongs in the request rather than in an <code>if</code> after the fact. Watch for <code>nullable: true</code> in a schema option: that is OpenAPI 3.0, and JSON Schema spells it <code>"type": ["string", "null"]</code>.',
  },
  {
    id: 'allowedtools-vs-canusetool',
    question: 'Which SDK control actually stops the agent from doing this?',
    beyond: true,
    sides: [
      {
        when: 'The tool must not be available at all - the agent should never be able to call it, and there should be nothing to prompt about.',
        answer: 'Restrict the toolset: <code>tools</code> as an allowlist, or <code>disallowedTools</code> as a denylist. A bare tool name in <code>disallowedTools</code> takes it out of the agent\'s context entirely; a scoped rule like <code>Bash(rm *)</code> leaves the tool available and denies the matching calls.',
        ref: null,
      },
      {
        when: 'The tool is fine to use and you are only trying to stop the permission prompt from interrupting an unattended run.',
        answer: '<code>allowedTools</code>. This is the trap in the cluster: despite the name it <em>auto-approves</em> rather than restricts - listing a tool there pre-approves it, and leaving one out does not remove it. It is a friction control, not a security boundary.',
        ref: null,
      },
      {
        when: 'The decision depends on the actual arguments at call time - block this path, allow that one, log everything.',
        answer: 'The <code>canUseTool</code> callback. It runs only when the permission flow would otherwise stop and ask, so it is your programmatic stand-in for the human at the prompt - which also means a call already auto-approved by <code>allowedTools</code> never reaches it.',
        ref: null,
      },
    ],
    rule: 'Separate the three questions: <em>can it exist</em> (<code>tools</code> / <code>disallowedTools</code>), <em>must someone approve it</em> (<code>allowedTools</code>), <em>who decides at call time</em> (<code>canUseTool</code>). The names mislead in opposite directions, so an option that reaches for <code>allowedTools</code> to enforce least privilege is wrong however sensible it sounds. Note also that Claude Code\'s <code>allowed-tools</code> frontmatter key is a different surface from the SDK\'s <code>allowedTools</code> option - the hyphenated one is a skill\'s own tool constraint.',
  },
  {
    id: 'max-tokens-truncation',
    question: 'The response came back incomplete. What do you look at?',
    sides: [
      {
        when: 'stop_reason came back as max_tokens.',
        answer: 'It was genuinely cut off mid-generation. Raise <code>max_tokens</code>, or restructure so each response has less to say - this is the one place the guide endorses moving the number (§1.3).',
        ref: '§1.3',
      },
      {
        when: 'stop_reason came back as end_turn, but the answer feels thin or skipped steps.',
        answer: 'Nothing was truncated - the model chose to stop there. That is a prompt problem: the output format was never specified, or the instruction was vague enough that a short answer satisfied it. Raising the limit changes nothing.',
        ref: 'Q54, Q66',
      },
    ],
    rule: 'Read <code>stop_reason</code> before touching any number, because the two cases have no overlap in their fixes. Three numbers get conflated here and they control different things: <code>max_tokens</code> caps one response, a <em>summarization threshold</em> decides when history gets compressed, and <span data-tip="max_turns">max turns</span> caps how many agentic loop iterations a run may take. Raising a summarization threshold postpones a lossy step without changing it (Q54); only <code>max_tokens</code> repairs an actual truncation.',
  },
  {
    id: 'cache-breakpoints',
    question: 'Prompt caching is on and the bill did not move.',
    beyond: true,
    sides: [
      {
        when: 'The cached block is short - a compact system prompt or a handful of tool definitions.',
        answer: 'It may be under the minimum cacheable length: 1,024 tokens on the Sonnet and Opus tiers, and <em>2,048</em> on Haiku. Below that the block is simply not cached, with no error to tell you.',
        ref: null,
      },
      {
        when: 'Something near the top of the prompt changes between calls - a timestamp, a session id, a reordered tool list.',
        answer: 'The cache matches on an exact prefix, so the first differing token invalidates everything after it. Put the stable material first - system prompt, tools, long documents - and the volatile material last.',
        ref: null,
      },
      {
        when: 'The prompt is long and only partly stable, and you are trying to cache several segments.',
        answer: 'You get at most four <code>cache_control</code> breakpoints. Spend them on boundaries between things that change at different rates, not evenly through the text.',
        ref: null,
      },
    ],
    rule: 'The economics decide whether it was ever going to pay off: a cache write costs 1.25× the base input rate (2× for the one-hour TTL) and a read costs 0.1×, so a prefix reused a handful of times wins and a prefix reused once loses. Read the usage fields rather than the total - <code>cache_creation_input_tokens</code> staying high call after call means the prefix is being invalidated, not reused.',
  },
];
