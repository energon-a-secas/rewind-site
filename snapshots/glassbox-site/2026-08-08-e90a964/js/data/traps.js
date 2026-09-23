// ── Traps & caveats ──────────────────────────────────────────
// Distractor lures, near-miss discriminators, final checks.
// Pure data. No DOM. Rendered by js/labs/traps.js.
//
// Refs: Wn = the 12 worked "Examples of Exam Questions with
// Explanations"; Qn = the 76-question practice test.

export const LURES = [
  {
    id: 'routing-classifier',
    name: '“Add a routing classifier”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'It reads as real architecture: a dedicated component that inspects the request and picks the right path before the agent ever runs. Every misrouting stem makes it sound proportionate.',
    kill: 'It bolts a layer on top instead of repairing the layer that is broken - the tool descriptions, the tool names, or the system prompt. The guide grades it as overengineering that may need training data you do not have (§9.1), and it addresses availability rather than tool ordering (W1).',
    unless: null,
    seen: ['W1', 'W2', 'Q7', 'Q46', 'Q47', 'Q51', 'Q57', 'Q76'],
  },
  {
    id: 'sentiment-escalation',
    name: '“Escalate when sentiment turns negative”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'Real support orgs do escalate angry customers, and the option usually names a clean threshold, which makes it sound measurable and humane.',
    kill: 'Customer mood does not correlate with case complexity (§9.1). The guide escalates on an explicit request for a human, a policy gap, or an inability to make progress - never on tone.',
    unless: 'Emotion changes the <em>reply</em>, not the routing: acknowledge the frustration, offer a concrete resolution, and escalate only when the customer reiterates that they want a person (§9.2). A first expression of dissatisfaction is not a request for a manager.',
    seen: ['W3', 'Q49'],
  },
  {
    id: 'self-rated-confidence',
    name: '“Have the model rate its confidence 1–10”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'It looks like calibration, and it converts a soft judgement into a number you can threshold on - which feels like engineering rigour rather than prompting.',
    kill: 'The model can be confidently wrong and its self-calibration is poor (§9.1). Gating escalation or autonomy on that number stacks a second unreliable decision on top of the first one you were trying to fix.',
    unless: 'Confidence as <em>displayed</em> metadata survives: Q28 wins by putting rationale and a confidence estimate inside every finding, precisely because the stem forbids filtering. Field-level confidence scores calibrated against a labelled validation set are also legitimate for routing extractions to human review (§9.4) - measured calibration, not the model guessing about itself.',
    seen: ['W3', 'Q49', 'Q55', 'Q28', 'Q29'],
  },
  {
    id: 'bigger-model',
    name: '“Switch to a bigger model or a larger context window”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'When quality is uneven across a large input, more capacity is the intuitive lever - and it is the only option on the page that requires no redesign.',
    kill: 'The guide names it a misconception outright: a larger context window does not fix attention quality (W12). Attention dilution and inconsistent explanation are structure problems, so you split the work or add examples instead of buying headroom.',
    unless: null,
    seen: ['W12', 'Q27', 'Q52', 'Q20', 'Q66'],
  },
  {
    id: 'consensus-voting',
    name: '“Run three passes, keep findings seen in at least two”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'Ensembling is a real technique, and the option sounds like it buys precision with compute you already have.',
    kill: 'The passes are inconsistent by hypothesis - that inconsistency is the defect you were asked to fix - so agreement measures noise, not truth. It suppresses real bugs that only one pass caught (W12, Q27).',
    unless: 'Multiple passes win when each pass has a <em>different scope</em>: per-file local analysis plus one separate cross-file integration pass (W12, Q27). A single independent second instance reviewing generated code is also right (Q17) - that is fresh eyes without the generator\'s reasoning, not a vote.',
    seen: ['W12', 'Q27'],
  },
  {
    id: 'post-processing-filter',
    name: '“Filter the findings before developers see them”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'It is cheap, deterministic, and it visibly shrinks the number developers are complaining about without touching the prompt.',
    kill: 'It throws away real findings along with the repeats and never touches the reason the model produced them. Every duplicate-output stem is answered by handing Claude the missing context instead - the existing test file (Q24) or the prior review findings (Q25).',
    unless: 'Disabling an entire low-precision category up front is not filtering: Q23 and Q29 switch off style, naming, and documentation findings at the source so they are never generated, while security and correctness keep running at 8% false positives.',
    seen: ['Q24', 'Q25', 'Q28', 'Q22', 'Q72'],
  },
  {
    id: 'merge-tools',
    name: '“Combine the two tools into one general tool”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'If the model cannot choose between two tools, deleting the choice looks like deleting the error - and the merged tool can decide internally with real code.',
    kill: 'The guide always moves the other way: split general tools into specialised ones with clear contracts (Domain 2.1), replace <code>fetch_url</code> with <code>load_document</code> (Q10), split one destructive call into <code>preview_remove_member</code> plus a token-bound <code>execute_remove_member</code> (Q61). Merging hides the routing decision instead of making it reliable, and it costs more effort than rewriting the descriptions (W2).',
    unless: null,
    seen: ['W2', 'Q57', 'Q47', 'Q48', 'Q53'],
  },
  {
    id: 'strengthen-the-prompt',
    name: '“Add more explicit instructions to the prompt”',
    verdict: 'depends',
    verdictLabel: 'Genuinely goes both ways',
    bait: 'Prompting is the cheapest lever on the page, and there is nearly always one option offering a sharper edition of the instruction you already have.',
    kill: 'It loses whenever the requirement was already stated and the failure is <em>inconsistency</em> - Q20 and Q31 both say the instructions were tightened and the output stayed variable, so few-shot examples win. It also loses whenever the stem wants a guarantee: a programmatic precondition (W1, Q51), a token-bound tool pair (Q61), or a <code>PostToolUse</code> hook (Q59) beats any wording, because prompts are probabilistic and code is deterministic (§3.5).',
    unless: 'It wins when the existing instruction is <em>vague</em> and you replace it with a definition that did not exist before: explicit criteria for flagging a comment only when it contradicts the code (Q22), explicit escalation criteria with few-shot examples (W3, Q49), or asking for a capability the model already has but was never told to use, such as bundling <code>get_customer</code> and <code>lookup_order</code> into one turn (Q53).',
    seen: ['W1', 'Q51', 'Q20', 'Q31', 'Q59', 'Q61', 'Q10'],
  },
  {
    id: 'vector-retrieval',
    name: '“Store it in a vector database and retrieve semantically”',
    verdict: 'depends',
    verdictLabel: 'Genuinely goes both ways',
    bait: 'Retrieval is the reflex answer to any "too much history" stem, and it is the only option that sounds unbounded rather than a stopgap.',
    kill: 'For a single session it is architectural overkill - Q65 rejects it for one 78,000-token cooking conversation, and Q66 notes similarity search misses context that is not semantically close to the current query. Q14 rejects it for subagent findings because the real fix is making upstream agents return structured data, and Q64 rejects it as simply not part of Claude\'s architecture.',
    unless: 'It becomes correct once the timespan makes summarization lossy by construction: three months of weekly sessions, 85,000 tokens, and a user asking what you concluded about one specific theme (Q68). Retrieval wins there because progressive summarization has already abstracted away the exact conclusion being requested.',
    seen: ['Q14', 'Q54', 'Q64', 'Q65', 'Q66'],
  },
  {
    id: 'train-on-history',
    name: '“Train a model on our historical tickets”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'You already have the data, the problem is a judgement call, and supervised learning is the textbook answer to judgement calls.',
    kill: 'It is overengineering for a decision-boundary problem that explicit criteria plus few-shot examples solve directly (W3, Q49). Fine-tuning and training custom models are listed as out of scope for this exam, so an option that proposes them is disqualified before you weigh it.',
    unless: null,
    seen: ['W3', 'Q49', 'Q56'],
  },
  {
    id: 'raise-the-limit',
    name: '“Raise max_tokens or raise the summarization threshold”',
    verdict: 'rare',
    verdictLabel: 'One narrow case only',
    bait: 'It is a one-line config change that provably relieves the symptom, and the stem usually hands you a specific number to move.',
    kill: 'It buys turns instead of changing the mechanism. Q54 keeps exactly the same lossy summarization and merely triggers it later; the fix is a persistent case-facts block held outside the summarized history. Q53 wants fewer API loops, and <code>max_tokens</code> has nothing to do with how many tools Claude requests per turn.',
    unless: 'Raise <code>max_tokens</code> when the response was actually truncated - <code>stop_reason</code> came back as <code>max_tokens</code> (§1.3). That is the only place the guide endorses moving the number.',
    seen: ['Q53', 'Q54', 'Q66'],
  },
  {
    id: 'make-humans-adapt',
    name: '“Require developers to split their PRs”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'It is operationally true - smaller pull requests really do review better - so it reads as the mature process answer rather than a technical dodge.',
    kill: 'It shifts the burden onto people without improving the system (W12, Q27). The same shape loses in conversational stems: an intake form, a compound question list, or a "did that fully resolve your issue?" confirmation all add friction when the stated goal was to remove it (Q52, Q74, Q76).',
    unless: 'Asking a human is right when the human holds knowledge the system cannot derive: another identifier when <code>get_customer</code> returns multiple matches (Q55), or which of two contradictory preferences actually wins (Q63). One turn to eliminate a 15% error rate is not a workaround.',
    seen: ['W12', 'Q27', 'Q52', 'Q74', 'Q76'],
  },
  {
    id: 'silent-default',
    name: '“Pick the most likely one and proceed”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'It keeps the flow moving and bothers nobody, and the option usually adds a footnote, a ranking algorithm, or a metadata field so nothing looks hidden.',
    kill: 'Every appearance absorbs uncertainty that somebody downstream needed: choosing between conflicting statistics (Q1), ranking away multiple customer matches (Q55), hidden defaults on a vague request (Q74, Q76), or a failure dressed as success (Q3, Q6, Q9, W8). Surface it instead - annotate the conflict with attribution, ask for the identifier, state the assumption, set <code>isError</code>.',
    unless: null,
    seen: ['Q1', 'Q3', 'Q6', 'Q9', 'Q55', 'Q74', 'Q76', 'W8'],
  },
  {
    id: 'uniform-retry',
    name: '“Retry with exponential backoff”',
    verdict: 'never',
    verdictLabel: 'Wrong every time it appears',
    bait: 'Backoff is genuinely correct for transient failures, so an option that applies it everywhere reads as standard reliability engineering.',
    kill: 'Applied uniformly it burns latency on errors that can never succeed - Q62 has 8% network timeouts and 4% query syntax errors, and only the timeouts are retryable. Retrying three times and then returning a generic "search unavailable" status is worse: it hides the failure type, the query, and the partial results the coordinator needed (Q6, Q9, W8).',
    unless: 'Retry inside the component that has definitive knowledge of the error type, and only for that type: the tool retries its own network timeouts and returns syntax errors immediately with parameter validation details (Q62); a subagent does one or two local retries for transient failures and propagates everything else with attempted steps and partial results (Q3, §10.2).',
    seen: ['Q6', 'Q9', 'Q62', 'W8'],
  },
];

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
        answer: 'Create it under <code>~/.claude/skills/</code> with a <em>different</em> name, e.g. <code>/my-commit</code>. They keep the team’s maintained <code>/commit</code> — and every update the team ships to it — plus a clearly named personal skill.',
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
        answer: 'Capability, not latency. The fire-and-forget async model cannot execute a tool during a request and hand results back; multi-turn tool calling is unsupported.',
        ref: 'Q18',
      },
    ],
    rule: 'Look for a tool call <em>inside</em> the request. If the workflow has one, the 24-hour argument is a decoy - Q18 offers exactly that decoy, phrased as "too slow, although the workflow would otherwise function", and it is wrong because the workflow would not function at all. With no mid-request tool call, latency is the whole argument.',
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
];

export const CHECKS = [
  {
    id: 'read-the-last-sentence',
    title: 'Read the last sentence of the stem first.',
    body: 'It names the metric that has to improve, and it often carries a constraint that eliminates two options before you weigh any of them - Q28 forbids filtering anything before developers see it, Q52 forbids adding human oversight, Q44 forbids committing credentials. An option that violates the stated constraint is out regardless of how good it otherwise looks.',
  },
  {
    id: 'name-the-root-cause',
    title: 'Name the root cause before you read the options.',
    body: 'Say it in one sentence from the stem alone: "the coordinator decomposed too narrowly", "the descriptions are minimal", "assistant turns are diluting the system prompt". Every explanation in the guide is written as root cause versus symptom, and the correct answer almost always names the same cause you just did.',
  },
  {
    id: 'mechanism-over-wording',
    title: 'Prefer the option that changes the mechanism.',
    body: 'When two options would both plausibly help, the winner makes the failure impossible rather than discouraged: a programmatic precondition over a stronger prompt (W1, Q51), a token-bound tool pair over instructions in the tool description (Q61), a <code>PostToolUse</code> hook over documenting each tool\'s formats in the system prompt (Q59). Hooks and code are deterministic; prompts are probabilistic at best (§3.5).',
  },
  {
    id: 'distrust-new-infrastructure',
    title: 'Distrust any option that adds a component.',
    body: 'Classifiers, dedicated error-handling agents, shared-state buses, intermediate summarization agents, and vector stores are this exam\'s default wrong answers - they get graded as overengineering when a description, a criterion, or an explicit partition would do (Q3, Q11, Q47, Q65). Take the smallest intervention that removes the cause, and scale up only when the stem proves the small one cannot work (Q68).',
  },
  {
    id: 'no-human-workarounds',
    title: 'Never make humans work around the system.',
    body: 'Splitting PRs by hand, filling in an intake form, answering four clarifying questions, or confirming "did that fully resolve your issue?" all move work onto people without improving the system (W12, Q27, Q52, Q74). The one exception is information only the user holds - a single question for a missing identifier or a contradictory preference is the correct answer (Q55, Q63).',
  },
  {
    id: 'invented-flags',
    title: 'If a flag or config file sounds invented, it is.',
    body: 'The guide plants non-existent surfaces routinely: <code>.claude/config.json</code>, <code>.claude/config.yaml</code>, <code>--batch</code>, <code>CLAUDE_HEADLESS=true</code>, <code>override: true</code>, a <code>session_id</code> parameter. If you cannot place it in the real surface - <code>CLAUDE.md</code>, <code>.claude/rules/</code>, <code>.claude/commands/</code>, <code>.claude/skills/</code>, <code>.mcp.json</code>, <code>-p</code>/<code>--print</code>, <code>--output-format json</code>, <code>--json-schema</code> - eliminate it on sight.',
  },
  {
    id: 'numbers-are-the-discriminator',
    title: 'Treat the numbers in the stem as the discriminator.',
    body: 'A statistic is never decoration: 78% versus 93% by keyword points at the system prompt (Q56), an 85/15 split puts a narrow tool in the subagent and leaves the rest with the coordinator (W9, Q15), 8% timeouts against 4% syntax errors forbids uniform retry (Q62), and three months against one session decides retrieval versus in-place structuring (Q68 versus Q65). Find the number and the branch is usually already decided.',
  },
  {
    id: 'most-effective-not-valid',
    title: 'The question asks most effective, not valid.',
    body: 'Expect two or three options that would genuinely help; the guide dismisses them as "adds tokens without addressing the root cause", "overengineering", or "more effort than justified" (W2). Rank the survivors by whether they hit the cause you named, then by effort - lowest effort with highest impact wins.',
  },
  {
    id: 'answer-everything',
    title: 'Answer every question.',
    body: 'There is no guessing penalty and the pass mark is 720 on a 100-1000 scale, so a blank is strictly worse than a guess. When stuck, eliminate against the lure catalogue first - classifier, sentiment, self-rated confidence, bigger model, consensus voting, post-hoc filter - and choose from whatever survives.',
  },
];
