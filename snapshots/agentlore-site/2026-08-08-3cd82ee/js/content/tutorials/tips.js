export const tips = [

  {
    id: 'context-management',
    title: 'Context Management & Compaction',
    description: 'How to manage conversation context in Claude Code and Cursor to save tokens and stay productive',
    category: 'tips',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Why context matters

Every message you send includes the full conversation history. A 50-turn conversation sends far more tokens than a 5-turn one. Managing context keeps costs down and responses focused.

## Claude Code: compaction

Claude Code offers three levels of context management.

### Auto-compact

Triggers automatically when you approach the context limit. Claude summarizes the conversation, preserving key decisions, code patterns, and recent changes while condensing older history.

You can see when it happens — Claude prints a compaction notice in the terminal.

### Micro-compact

A lighter pass that removes old tool call results (file reads, command outputs) without summarizing the conversation itself. Frees space with minimal information loss.

### Manual /compact

Run \`/compact\` to trigger compaction on demand. Add instructions to control what gets kept:

\`\`\`
/compact
/compact only keep the architecture decisions
/compact preserve the API schema we designed
/compact forget the debugging — keep the final solution
\`\`\`

This is useful mid-session when you finish one phase (e.g., debugging) and want to reclaim context for the next phase (e.g., writing tests).

### Other context commands

| Command | Effect |
|---------|--------|
| \`/clear\` | Wipe the conversation entirely and start fresh |
| \`/compact [instructions]\` | Summarize with custom focus |
| \`--resume\` | Restore a previous session (its compacted state) |

## Cursor: no compaction

Cursor does not offer compaction. When context fills up, you see a warning and must start a new chat. You cannot summarize mid-conversation or selectively trim context.

### Workarounds

**Notepads** — Store key decisions, schemas, or context in Notepads. They persist across chats and load on demand with \`@notepad-name\`.

**Rules files** — Put project conventions in \`.cursor/rules/\` as \`.mdc\` files. These load automatically based on glob patterns, so every new chat starts with the right context.

**Manual summary** — Before closing a long chat, ask the AI to summarize the conversation. Copy the summary and paste it into a new chat as the first message.

**Shorter chats** — Start a new chat for each distinct task. This is the most reliable way to keep context manageable.

## Side-by-side comparison

| Feature | Claude Code | Cursor |
|---------|------------|--------|
| Auto-compaction | Yes — triggers near context limit | No |
| Manual compaction | \`/compact [instructions]\` | No |
| Selective trimming | Micro-compact (tool results) | No |
| Clear conversation | \`/clear\` | Start new chat |
| Persist across chats | Memory files, CLAUDE.md | Notepads, rules files |
| Context limit signal | Auto-compact kicks in | Warning banner |

## Best practices for both tools

1. **One task per chat** — the single most effective cost-saving habit
2. **Front-load context** — put important info in CLAUDE.md or rules files, not repeated messages
3. **Compact before pivoting** — in Claude Code, run \`/compact\` when switching from exploration to implementation
4. **Don't fight context limits** — if a conversation feels sluggish or unfocused, start fresh`,
  },

  {
    id: 'parallel-agents-pattern',
    title: 'Parallel Agents Pattern',
    description: 'Launch multiple AI agents concurrently for independent tasks',
    category: 'tips',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## When to parallelize

Use parallel agents when tasks are independent and don't share state:

- Code review on one file + linting another
- Searching two different directories
- Building frontend + documenting API

## In Claude Code

Use the Task tool to launch concurrent sub-agents:

\`\`\`
Launch two agents in parallel:

Agent 1: Explore src/components/ and list all React components
Agent 2: Explore src/api/ and list all API endpoints
\`\`\`

Both agents run simultaneously and return their results.

## In Cursor

Open multiple Composer tabs or use the ask feature in parallel panels. Each operates with its own context.

## Anti-patterns

- Launching agents that depend on each other's output (sequential, not parallel)
- Spawning one agent per file in a 50-file refactor (use a shell loop instead)
- Parallelizing trivial tasks (the overhead isn't worth it)

## Rule of thumb

If two tasks require reading different files and producing independent outputs, parallelize. If task B needs task A's result, run them sequentially.`,
  },

  {
    id: 'progressive-disclosure-docs',
    title: 'Progressive Disclosure in Docs',
    description: 'Structure documentation so agents find what they need without reading everything',
    category: 'tips',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## The problem with monolithic docs

A 2000-line CLAUDE.md wastes tokens. Agents read the whole file on every message, even when they only need one section.

## Progressive disclosure pattern

Layer your documentation:

\`\`\`
CLAUDE.md              # 100-200 lines: overview, commands, key conventions
docs/
  architecture.md      # Deep dive: data flow, module responsibilities
  api.md               # Endpoint reference
  deployment.md        # Deploy steps and environment setup
  conventions.md       # Detailed coding standards
\`\`\`

## CLAUDE.md as an index

\`\`\`markdown
## Architecture
ES module app with state management. See \`docs/architecture.md\` for details.

## API
REST endpoints at /api/v1/. See \`docs/api.md\` for the full reference.
\`\`\`

The agent reads only CLAUDE.md initially. It follows links to deeper docs only when the task requires them.

## Benefits

- Lower token cost (smaller initial context)
- Faster agent orientation
- Easier maintenance (update one section without touching others)
- Works with both Claude and Cursor

## Rule of thumb

If a section in CLAUDE.md exceeds 50 lines, extract it to its own file and leave a one-line reference.`,
  },

  {
    id: 'model-selection',
    title: 'Choose the Right Model',
    description: 'When to use fast models vs powerful models in Claude and Cursor',
    category: 'tips',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Why model choice matters

Faster models cost less and respond quicker. Powerful models handle complex reasoning better. Picking the right one saves money and time.

## Model tiers

| Tier | Best for | Examples |
|------|----------|---------|
| Fast | Renames, formatting, simple edits | Claude Haiku, GPT-4o mini |
| Standard | Feature work, refactoring, code review | Claude Sonnet |
| Powerful | Architecture, complex debugging, multi-file | Claude Opus |

## In Claude Code

\`\`\`bash
# Start with a specific model
claude --model claude-sonnet-4-20250514

# Inside a session, switch with /model
/model claude-haiku-3-5-20241022
\`\`\`

## In Cursor

Open the model selector in the chat panel (bottom-left dropdown). Each conversation can use a different model.

## Rules of thumb

- **Use fast models** for: autocomplete, simple questions, formatting, small edits
- **Use standard models** for: feature implementation, code generation, refactoring
- **Use powerful models** for: debugging complex issues, architecture planning, multi-step reasoning

## Cost impact

A fast model can be 10-20x cheaper per token than a powerful one. Using Haiku for simple tasks instead of Opus across a full day can cut costs significantly.`,
  },

  {
    id: 'git-ai-workflows',
    title: 'Git Workflows with AI',
    description: 'Use AI agents to review diffs, write commits, and manage branches',
    category: 'tips',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Review changes before committing

\`\`\`bash
# Claude Code: pipe diff for review
git diff | claude -p "review these changes for bugs and style issues"

# Or inside a session
"Review my uncommitted changes and flag any issues"
\`\`\`

In Cursor, use \`@git\` in chat to reference recent changes.

## Write commit messages

\`\`\`bash
# Let Claude craft a commit message from staged changes
git diff --staged | claude -p "write a conventional commit message" --output-format text
\`\`\`

Or create a slash command at \`.claude/commands/commit.md\`:

\`\`\`markdown
Review git diff --staged and write a Conventional Commits message.
Follow the format: type(scope): description
\`\`\`

## Branch management

Ask the agent to help with branch operations:

\`\`\`
"Create a feature branch from main for the user-auth work"
"Show me what is different between this branch and main"
"Help me resolve the merge conflicts in src/auth.ts"
\`\`\`

## Tips

- Stage specific files before asking for commit messages (smaller diff = better message)
- Use \`-p\` mode for quick git operations to avoid starting a full session
- Both tools can run git commands directly — just ask`,
  },

];
