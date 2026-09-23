// ── Loop lab: topology and toolset ───────────────────────────
// Two theory sections that belong together because both answer "how
// does the coordinator get work done": HUB_SPOKE is the shape of
// delegation (and the isolated-context rule that makes it work), and
// TOOL_KIT is what an agent reaches for when the work is a codebase.
//
// The vocabulary of one iteration is in loop-theory.js; the
// steer-vs-enforce comparison is in loop-contrast.js.
//
// Escaping: HUB_SPOKE.duties[].body, .isolation[].body, .prompts[].note,
// .parallelNote, .aggregate[].body, .returns, TOOL_KIT.rows[].use,
// .walk[].body and .notes[].body render RAW (inline <code>/<em>).
// Names, titles, labels, `pattern` and `example` are plain text
// through escHtml; code goes through highlightCode.

export const HUB_SPOKE = {
  heading: 'Hub-and-spoke: one coordinator, isolated spokes',
  lead: 'A multi-agent system is not a group chat. It is a hub with spokes: the coordinator holds the task and the history, and each subagent gets exactly what it was handed. Nothing travels sideways.',
  topology: {
    hub: { label: 'Coordinator', note: 'holds the task, the history and the user' },
    spokes: [
      { label: 'Subagent 1', role: 'search' },
      { label: 'Subagent 2', role: 'analysis' },
      { label: 'Subagent 3', role: 'synthesis' },
    ],
    forbidden: 'Subagent → subagent. There is no such edge: two spokes cannot talk, compare notes, or read each other’s results. Everything passes through the hub, which is what makes the run observable and its errors recoverable.',
  },
  dutiesLabel: 'The coordinator is responsible for',
  duties: [
    { name: 'Decomposing the task', body: 'Turning one request into subtasks that can be worked on independently. Anything two subagents would both need becomes context you pass to both.' },
    { name: 'Deciding which subagents are needed', body: 'Dynamic selection, by reading each agent’s <code>description</code>. A run that always spawns all five is not orchestrating, it is broadcasting.' },
    { name: 'Delegating the work', body: 'One <code>Task</code> call per subagent, each carrying its own complete prompt. The coordinator’s <code>allowed_tools</code> must include <code>"Task"</code> or it cannot delegate at all.' },
    { name: 'Aggregating and validating results', body: 'Merging what came back <em>and</em> checking it: a citation-free section, an empty result, a subagent that answered a different question. Validation is the coordinator’s job because it is the only party that saw the whole task.' },
    { name: 'Handling errors and retries', body: 'One failed spoke is not a failed run. Retry it, retry it with a narrower prompt, or continue with a partial result that says which part is missing, and never abort the other four because the third one timed out.' },
    { name: 'Communicating results to the user', body: 'The user talks to the hub, always. A subagent has no channel to the person and no idea what they asked for.' },
  ],
  isolationLabel: 'Critical principle: subagents have isolated context',
  isolation: [
    { name: 'No inherited history', body: 'A subagent does <strong>not</strong> automatically receive the coordinator’s conversation. It starts empty, holding only its system prompt and the Task prompt you wrote.' },
    { name: 'Context is passed explicitly', body: 'Every fact it needs (the document, the prior results, the schema) is pasted into the prompt. If it is not in there, it does not exist for that agent.' },
    { name: 'No shared memory across calls', body: 'Two <code>Task</code> calls to the same subagent share nothing. Neither does a second call to the same agent later in the run: state lives in the coordinator or it lives nowhere.' },
    { name: 'All communication flows through the coordinator', body: 'That is the point, not a limitation: one place logs every hand-off, one place sees every failure, one place decides what to retry.' },
  ],
  promptsLabel: 'The same delegation, written twice',
  prompts: [
    {
      tone: 'warn',
      title: 'The subagent has no context',
      lang: 'text',
      code: `Task: "Analyze the document"`,
      note: 'Which document? It never saw one. What comes back is either a question it has no way to ask you, or a confident analysis of a document it invented.',
    },
    {
      tone: 'ok',
      title: 'Everything it needs, in the prompt',
      lang: 'text',
      code: `Task: "Analyze the following document.

Document:
[full document text]

Prior search results:
[web search results]

Output format requirements:
[schema]"`,
      note: 'Long, repetitive across spokes, and correct. The cost of pasting the document three times is tokens; the cost of not pasting it is a fabricated answer you cannot tell apart from a real one.',
    },
  ],
  parallelLabel: 'Several spokes at once',
  parallelLang: 'text',
  parallelCode: `# One coordinator response contains:
Task 1: "Search for articles about X"
Task 2: "Analyze document Y"
Task 3: "Search for articles about Z"
# All three run concurrently`,
  parallelNote: 'Multiple <code>Task</code> calls in a single response run in parallel, which is the reason a research pipeline finishes at all. It also means three isolated contexts, three prompts to write, and three results to validate. Independent work parallelises; a step that needs the previous step’s output does not.',
  aggregateLabel: 'What comes back, and what to ask of it',
  aggregate: [
    { name: 'Structured summaries, not raw dumps', body: 'A subagent that returns its entire transcript spends the coordinator’s context on reasoning nobody will re-read. Ask for the findings and the citations, in a shape you can merge.' },
    { name: 'Validate before you synthesize', body: 'Check each result against what you asked for. A section with no sources, or one that answers a neighbouring question, is a retry, not something to paper over in the final report.' },
    { name: 'Partial beats silent', body: 'When one spoke cannot be recovered, say which part is missing in the output. A report that quietly drops a section reads exactly like a complete one.' },
  ],
  // Rendered by id from data/antipatterns.js; never copied.
  flag: 'vague-task',
};

export const TOOL_KIT = {
  heading: 'How an agent reads a codebase: Glob, Grep, Read',
  lead: 'Claude Code’s built-in tools are not interchangeable, and the exam tests the choice. Two of them find things, one by <em>filename</em> and one by <em>content</em>, and one loads a file into context, which is the expensive move.',
  rows: [
    { task: 'Find files by name or pattern', tool: 'Glob', tip: 'glob_tool', example: '**/*.test.tsx', use: 'Filename patterns, any depth. The right first move in an unfamiliar repo: shape before substance.' },
    { task: 'Search inside file contents', tool: 'Grep', tip: 'grep_tool', example: 'calculateTotal', use: 'A function name, an error string, an import. Returns the hits with their locations, and it never loads whole files.' },
    { task: 'Read a file in full', tool: 'Read', tip: 'read_tool', example: 'src/checkout/total.ts', use: 'The only one of the three that puts file contents in the context window. Use it on files a search already pointed at.' },
    { task: 'Edit an existing file precisely', tool: 'Edit', tip: 'edit_tool', example: 'replace one unique snippet', use: 'Matches unique text and replaces it. Precise, and it fails loudly when the match is ambiguous.' },
    { task: 'Create a file from scratch', tool: 'Write', tip: null, example: 'new module, generated config', use: 'Whole-file write. It overwrites, so on an existing file it is the fallback path, not the first choice.' },
    { task: 'Run a shell command', tool: 'Bash', tip: null, example: 'npm test, git diff', use: 'Tests, builds, git. The tool that changes things outside the editor, which is why it is the one you scope in a denylist.' },
  ],
  walkLabel: 'The incremental strategy, and why it is not "read everything"',
  walkLead: 'Loading forty files answers the question and leaves no window to answer the next one. The guide’s strategy builds understanding in passes, each one narrowing what the next pass has to read.',
  walk: [
    { n: 1, tool: 'Glob', body: 'Map the shape. <code>**/*.test.tsx</code>, <code>src/api/**/*.ts</code>: what exists and where, without reading any of it.' },
    { n: 2, tool: 'Grep', body: 'Find the entry point: the function definition, the export, the error message from the ticket.' },
    { n: 3, tool: 'Read', body: 'Open only the files those hits named. Now the context holds code that is known to be relevant.' },
    { n: 4, tool: 'Grep', body: 'Find the usages, imports and call sites, to trace the flow outward, including through wrapper modules that re-export it.' },
    { n: 5, tool: 'Read', body: 'Open the consumers that matter, and repeat until the picture closes. Stop when the next read would not change the answer.' },
  ],
  notes: [
    { title: 'Grep is content, Glob is filenames', body: 'The pair is written into distractors constantly. "Find every test file" is <code>Glob</code>; "find where this error string is produced" is <code>Grep</code>. Reaching for <code>Bash</code> with a hand-rolled <code>find</code> or <code>grep</code> when the built-in exists is the third shape of the same wrong answer.' },
    { title: 'When Edit fails, fall back to Read + Write', body: 'An <code>Edit</code> whose target text appears more than once fails rather than guessing. The documented recovery is <code>Read</code> the file, change the content programmatically, <code>Write</code> it back, rather than loosening the match until something changes.' },
    { title: 'Planning mode is these tools with the writes taken away', body: 'Read-only exploration with <code>Read</code>, <code>Grep</code> and <code>Glob</code>, producing a plan you approve before an edit exists. Same investigation, no side effects, which is why it is the answer for large or unfamiliar work.' },
    { title: 'Built-ins are the default, and that is a design problem for MCP', body: 'Given an MCP tool and a built-in that look similar, an agent tends toward the built-in. If your server reaches data <code>Read</code> and <code>Grep</code> cannot see, the description has to say so explicitly. That is the fix, not deleting the built-in.' },
  ],
};
