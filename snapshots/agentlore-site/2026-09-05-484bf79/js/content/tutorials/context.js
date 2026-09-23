export const context = [

  {
    id: 'write-effective-claude-md',
    title: 'Write an Effective CLAUDE.md',
    description: 'Structure project context so AI agents understand your codebase fast',
    category: 'context',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Why CLAUDE.md matters

\`CLAUDE.md\` is the first file AI agents read when entering your project. A good one saves minutes per session by eliminating repeated questions.

## Auto-generate with /init

Generate a starter CLAUDE.md automatically. Run this in your project:

\`\`\`bash
claude /init
\`\`\`

Claude scans your codebase and generates a starter CLAUDE.md with structure, commands, and conventions. Review and customize it from there.

## Essential sections

\`\`\`markdown
# CLAUDE.md

## Project Overview
One paragraph: what this project does, who uses it, core tech stack.

## Architecture
Key directories, file naming patterns, data flow summary.

## Commands
How to run, test, build, deploy.

## Conventions
Coding style, naming rules, patterns to follow.

## Gotchas
Non-obvious behaviors, known issues, things that break easily.
\`\`\`

## Tips for great CLAUDE.md files

- **Be specific**: "Use camelCase for JS variables" beats "follow conventions"
- **Include run commands**: agents need exact commands, not vague instructions
- **List file paths**: reference actual files, not abstract concepts
- **Update regularly**: stale context is worse than no context
- **Keep it under 500 lines**: progressive disclosure beats a wall of text

## Progressive disclosure pattern

Put details in separate files, reference them from CLAUDE.md:

\`\`\`markdown
See \`docs/api.md\` for endpoint details.
See \`docs/deployment.md\` for deploy steps.
\`\`\``,
  },

  {
    id: 'setup-cursorrules',
    title: 'Set Up .cursorrules',
    description: 'Configure Cursor-specific behavior with rules files',
    category: 'context',
    tools: ['cursor'],
    difficulty: 'beginner',
    content: `## What are Cursor rules?

Rules are instruction files that Cursor loads based on file patterns, telling the AI how to handle specific parts of your codebase.

## File locations

\`\`\`
.cursor/rules/
  frontend.md       # Rules for React components
  backend.md        # Rules for API routes
  testing.md        # Rules for test files
\`\`\`

## Rule file format

Each rule file uses frontmatter to specify when it applies:

\`\`\`markdown
---
description: Rules for React components
globs: ["src/components/**/*.tsx", "src/components/**/*.ts"]
alwaysApply: false
---

## Component conventions

- Use functional components with TypeScript
- Props interface named \`{ComponentName}Props\`
- Place hooks at the top of the component
- Export components as named exports
\`\`\`

## Frontmatter options

| Field | Purpose |
|-------|---------|
| \`description\` | When the rule applies (shown to the agent) |
| \`globs\` | File patterns that trigger this rule |
| \`alwaysApply\` | If true, loaded for every conversation |

## Tips

- Use \`alwaysApply: true\` sparingly (only for universal project conventions)
- Keep rules focused: one rule per concern
- Include examples of correct and incorrect patterns`,
  },

  {
    id: 'explore-unfamiliar-codebase',
    title: 'Explore Unfamiliar Codebases',
    description: 'Strategies for context switching into repos you have never seen',
    category: 'context',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## The cold-start problem

Jumping into an unfamiliar codebase wastes time if you (or your AI agent) don't know where to look. Here's a systematic approach.

## Step 1: Read the entry points

\`\`\`
1. README.md -- what the project does
2. CLAUDE.md / .cursorrules -- AI-specific context
3. package.json / Makefile / Cargo.toml -- commands and deps
4. Directory listing (top-level only)
\`\`\`

## Step 2: Use explore agents

In Cursor, launch an explore agent:

> "Explore the codebase and explain the architecture. Focus on data flow and key entry points."

In Claude Code, use the Task tool with \`subagent_type="explore"\`:

> "Explore the src/ directory. Map the module structure and identify the main entry point, routing, and data layer."

## Step 3: Build a mental model

Ask targeted questions:

- "Where does authentication happen?"
- "How does data flow from the API to the UI?"
- "What are the key abstractions?"

## Step 4: Write what you learned

Create or update CLAUDE.md with what you discovered. Future sessions (yours or someone else's) will start faster.

## Anti-patterns

- Reading every file top-to-bottom (too slow)
- Skipping README and guessing (too error-prone)
- Asking vague questions like "explain everything" (too broad)`,
  },

  {
    id: 'ignore-files',
    title: 'Ignore Files for AI',
    description: 'Use .claudeignore and .cursorignore to exclude files from AI context',
    category: 'context',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Why ignore files?

AI agents read your project files for context. Large or irrelevant files waste tokens, slow responses, and can confuse the agent.

## .claudeignore

Works like \`.gitignore\`. Place at your project root:

\`\`\`
node_modules/
dist/
build/
*.min.js
*.lock
.env
coverage/
\`\`\`

Claude Code skips these files when reading your project.

## .cursorignore

Same syntax, same purpose for Cursor:

\`\`\`
node_modules/
dist/
*.min.js
.env
\`\`\`

Place at your project root. Cursor will not index or read these files.

## What to ignore

| Always ignore | Consider ignoring |
|--------------|-------------------|
| node_modules, dist, build | Large data files (.csv, .json dumps) |
| .env, credentials | Generated code |
| Lock files | Binary assets (images, fonts) |
| coverage/ | Vendored dependencies |

## Tip

Start with your \`.gitignore\` as a base, then add project-specific exclusions. Both tools respect their own ignore file independently of git.

Source: [docs.anthropic.com/en/docs/claude-code/overview](https://docs.anthropic.com/en/docs/claude-code/overview)`,
  },

  {
    id: 'cursor-at-references',
    title: 'Cursor @ References',
    description: 'Use @file, @folder, @web, and @docs to give the AI precise context',
    category: 'context',
    tools: ['cursor'],
    difficulty: 'beginner',
    content: `## What are @ references?

In Cursor chat or Composer, type \`@\` to attach specific context to your message. This tells the AI exactly what to look at instead of guessing.

## Reference types

| Reference | What it does |
|-----------|-------------|
| \`@file\` | Attach a specific file to the conversation |
| \`@folder\` | Include all files in a directory |
| \`@code\` | Reference a specific symbol (function, class) |
| \`@web\` | Search the web for current information |
| \`@docs\` | Search indexed documentation |
| \`@git\` | Reference git history (diffs, commits) |
| \`@codebase\` | Search across the entire codebase |
| \`@notepads\` | Include a saved notepad |

## Usage examples

\`\`\`
@auth.ts fix the login validation bug

@src/components/ create a new Button component matching the existing style

@web what is the latest React 19 API for use()

@git review the last 3 commits for issues
\`\`\`

## Tips

- Use \`@file\` for targeted questions about specific code
- Use \`@folder\` when the AI needs to understand a module
- Use \`@codebase\` sparingly: it uses more tokens
- Combine references: \`@auth.ts @types.ts fix the type mismatch\`

Source: [docs.cursor.com/context/@-symbols](https://docs.cursor.com/context/@-symbols)`,
  },

  {
    id: 'cursor-notepads',
    title: 'Notepads in Cursor',
    description: 'Save reusable context blocks that you can attach to any conversation',
    category: 'context',
    tools: ['cursor'],
    difficulty: 'intermediate',
    content: `## What are Notepads?

Notepads are saved text snippets in Cursor that you can attach to any chat with \`@notepads\`. Reusable context blocks, like bookmarks for instructions.

## When to use Notepads vs Rules

| Use Notepads for... | Use Rules for... |
|--------------------|-----------------|
| Context you need sometimes | Rules that always apply |
| API docs, design specs | Coding conventions |
| One-off reference material | File-pattern-based behavior |
| Temporary project notes | Persistent project standards |

## Creating a Notepad

1. Open the Notepads panel (sidebar)
2. Click "New Notepad"
3. Give it a name and paste your content

Example: save your API schema, design system tokens, or a feature spec.

## Using in conversation

\`\`\`
@notepad:api-schema add a new endpoint for user preferences
@notepad:design-tokens create a card component using our color system
\`\`\`

## Tips

- Keep notepads focused on one topic
- Update them as specs change
- Use them for context outside code files (design docs, meeting notes, requirements)

Source: [docs.cursor.com/context/notepads](https://docs.cursor.com/context/notepads)`,
  },

  {
    id: 'what-fills-context',
    title: 'What Actually Fills a Context Window',
    description: 'An accounting of where your tokens go, so you can cut the right ones',
    category: 'context',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## The window is not "your question"

People picture a context window as holding the conversation. In an agentic session the conversation is usually the smallest part of it.

A representative turn, thirty turns into a coding session:

| Component | Tokens | Share |
|---|---|---|
| System prompt | 2,500 | 4% |
| Tool definitions | 4,000 | 6% |
| \`CLAUDE.md\` and project context | 5,000 | 8% |
| Skill descriptions (all installed) | 1,500 | 2% |
| Files read this session | 28,000 | 44% |
| Tool output (searches, test runs, diffs) | 18,000 | 28% |
| The actual conversation | 5,000 | 8% |
| **Total** | **64,000** | |

Two thirds is file contents and tool output. That is where the leverage is.

## The compounding property

Every one of those tokens is re-sent on the next turn, and the next. A file you read on turn 4 is still being billed on turn 40.

\`\`\`
one 6,000-token file read early in a 40-turn session
= 6,000 × 36 remaining turns
= 216,000 input tokens
\`\`\`

At \$2/M that is \$0.43 for one file, most of which you stopped needing thirty turns ago. With caching it is a tenth of that, which is exactly why caching matters so much here.

## Cutting the right things

**Tool output is the best target.** Search results, full test output, directory listings. Almost all of it is scanned once and never needed again.

- Ask for filtered output: \`npm test 2>&1 | tail -30\` rather than the whole run
- Use \`rg -l\` to list files before reading any of them
- Move exploratory searching into a subagent so the noise never enters the main window

**File reads are the second target.** Read the function, not the file.

\`\`\`
Bad:   read src/services/billing.ts        (1,400 lines)
Good:  read src/services/billing.ts:200-260
\`\`\`

**\`CLAUDE.md\` is charged on every request, including trivial ones.** A 400-line one is ~5,000 tokens on "what does this function do?". Keep it to what is true for every task; push the rest into skills, which cost a description line until they fire.

**Ignore files stop waste at the source.** \`.claudeignore\` for build output, lock files, vendored code, and generated assets. See [Ignore Files for AI](/t/ignore-files/).

## Bigger windows do not remove the problem

A 1M-token window is permission to include more, not an instruction to. Two things stay true regardless of size:

1. **You still pay per token.** A full window on a frontier model is expensive per turn, and it is re-sent every turn.
2. **Attention is finite.** Signal buried in 800,000 tokens of noise gets less weight than the same signal in 40,000. More context can produce worse answers.

> [!tip] The diagnostic
> When answers start getting vaguer as a session goes on, that is not the model degrading. It is your signal-to-noise ratio degrading. Start a fresh session with a short written summary of where you got to. It is almost always faster than pushing on.

See also: [Context Management & Compaction](/t/context-management/) · [Compaction or a Fresh Session?](/t/compaction-vs-fresh-session/) · [Prompt Caching Economics](/t/prompt-caching-economics/)`,
  },

  {
    id: 'compaction-vs-fresh-session',
    title: 'Compaction or a Fresh Session?',
    description: 'Both reset the window. They lose very different things',
    category: 'context',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## What each one does

**Compaction** summarises the conversation so far and continues with the summary in place of the history. Continuity is preserved; detail is lost, and you do not choose which detail.

**A fresh session** starts empty. Nothing is preserved except what you deliberately carry over.

The difference that matters: compaction decides for you what was important. A fresh session makes you decide, which is worse when you are in flow, and better when you are stuck.

## When to compact

- You are mid-task and the thread genuinely matters
- The remaining work is a continuation, not a new direction
- The conversation holds decisions that are not written down anywhere else

## When to start fresh

- **The task changed.** New feature, new bug, new area of the codebase. Old context is now pure cost.
- **You are going in circles.** Compaction preserves a confused thread. If the model has misunderstood something structural, summarising the misunderstanding carries it forward. Starting over removes it.
- **Answers are getting vaguer.** A reliable sign that signal has drowned in noise.
- **You have compacted twice already.** A summary of a summary keeps very little. That is the point to write things down properly and restart.

## The handoff that makes fresh sessions cheap

The reason people avoid restarting is losing their place. Solve it by writing state to a file rather than keeping it in the conversation:

\`\`\`markdown
# notes/current-task.md

## Goal
Migrate the billing service off the legacy parser.

## Established
- Legacy parser lives at src/legacy/parse.ts:1-340
- Only two callers: billing.ts:88 and reports.ts:210
- The new parser handles all cases except multi-currency (issue #412)

## Next
Wire billing.ts:88 to the new parser, keep the legacy path behind
a flag until #412 lands.

## Do not
Touch reports.ts yet: it has its own test gap.
\`\`\`

Then a fresh session starts with: *"Read notes/current-task.md and continue."* That costs a few hundred tokens and carries more usable state than a compaction of fifty turns.

> [!tip] This is the habit worth building
> Durable state belongs in files, not in conversation history. Files survive compaction, session restarts, tool crashes, and tomorrow. History survives none of those reliably.

## What compaction reliably loses

Worth knowing before you rely on it:

- **Exact code you looked at.** Summaries keep conclusions, not line numbers.
- **Things you rejected.** "We tried X and it didn't work" often does not survive, so the agent proposes X again.
- **Precise constraints.** "Don't touch the auth module" becomes "be careful with auth", which is not the same instruction.

If any of those matter, write them down before compacting.

## A working rhythm

1. Start a session with a clear, bounded goal
2. When the goal is met, write what you learned to a file
3. Start fresh for the next goal
4. Compact only when a single goal genuinely outgrows the window

Sessions are cheap. The instinct to keep one alive all day is a habit from chat interfaces, and it is expensive in both money and answer quality.

See also: [Context Management & Compaction](/t/context-management/) · [What Actually Fills a Context Window](/t/what-fills-context/)`,
  },

  {
    id: 'retrieval-vs-stuffing',
    title: 'Retrieval or Just Put It In Context?',
    description: 'Long windows made this a real decision instead of a foregone one',
    category: 'context',
    tools: ['claude', 'local'],
    difficulty: 'intermediate',
    content: `## The decision changed

When windows were 8K tokens, retrieval was mandatory. At 1M tokens, stuffing everything in is often simpler, more accurate, and, accounting for engineering time, cheaper.

But not always, and the boundary is worth knowing.

## Just put it in context when…

- **The corpus fits with room to spare.** Under ~100K tokens against a 1M window, retrieval is machinery you do not need.
- **The question needs the whole thing.** "Is this API design consistent?" cannot be answered from three retrieved chunks. Neither can "what changed between these two versions?"
- **Relationships between distant parts matter.** Retrieval fetches locally relevant pieces and severs the connections between them.
- **The corpus is stable and the queries repeat.** Cache the whole thing as a prefix and each query costs a tenth of the input price. This is often cheaper *and* better than retrieval.

## Retrieve when…

- **The corpus does not fit.** Millions of tokens. No window solves this.
- **Only a tiny slice is ever relevant.** One support article out of fifty thousand. Sending all fifty thousand to answer one question is enormously wasteful.
- **Freshness matters per-query.** Content changing hourly cannot be a cached prefix.
- **Volume is high and cost dominates.** At a million queries, the difference between 2,000 retrieved tokens and 200,000 stuffed tokens is the whole budget.

## The arithmetic

50,000 queries a month against a 200,000-token corpus, on a model at \$2/M input:

\`\`\`
Stuffed, no caching:   200,000 × 50,000 × $2/M  = $20,000
Stuffed, cached:       ~10% of input             ≈  $2,000
Retrieved (~3k/query):   3,000 × 50,000 × $2/M  =    $300
\`\`\`

Retrieval wins by a lot here. Now the same corpus at 500 queries a month:

\`\`\`
Stuffed, cached:  $20
Retrieved:        $3   (plus an embedding pipeline you now maintain)
\`\`\`

Seventeen dollars is not worth a vector database. **Query volume, not corpus size, is what usually decides.**

## The hybrid worth knowing

Retrieve generously, then let the model read properly. Instead of 5 tight chunks, pull 30 loose ones and give the model the surrounding file when it asks.

\`\`\`
1. Embed the query, pull 30 candidates
2. Put all 30 in context (long windows make this affordable)
3. Give the agent a read_file tool so it can pull full context on
   anything that looks relevant
\`\`\`

This gets retrieval's cost profile with much of stuffing's accuracy, and it degrades gracefully when the embedding misses. The agent can go and look.

> [!warn] The failure mode of tight retrieval
> Chunking cuts documents at arbitrary boundaries. A rule and its exception end up in different chunks; you retrieve the rule, miss the exception, and get a confidently wrong answer. If your retrieved context is under a couple of thousand tokens, you are probably losing exceptions.

## Start simple

Put it in context. Measure. Add retrieval when the numbers say to, not because retrieval is what serious systems do. Most corpora people build pipelines for would fit in a cached prefix.

See also: [Local Embeddings](/t/ollama-embeddings/) · [What Actually Fills a Context Window](/t/what-fills-context/) · [Prompt Caching Economics](/t/prompt-caching-economics/)`,
  },

];
