export const commands = [

  {
    id: 'write-slash-command',
    title: 'Write a Slash Command',
    description: 'Create custom slash commands for Claude Code with markdown templates',
    category: 'commands',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## What are slash commands?

Slash commands are reusable prompt templates stored as markdown files. Type \`/command-name\` in Claude Code to run them.

## File location

\`\`\`
.claude/commands/
  my-command.md
  another-command.md
\`\`\`

## Basic template

\`\`\`markdown
# Command Title

You are performing X. The user wants Y.

**User's input:** $ARGUMENTS

## Steps

1. Read the relevant files
2. Analyze the situation
3. Perform the action
4. Report results
\`\`\`

## Using arguments

\`$ARGUMENTS\` captures everything the user types after the command name:

\`\`\`
/my-command fix the login bug
\`\`\`

Here, \`$ARGUMENTS\` = "fix the login bug".

## Tips

- Keep instructions specific and actionable
- Reference file paths the agent should check
- Include guardrails (e.g., "do NOT modify tests")
- Test with edge cases to refine the prompt`,
  },

  {
    id: 'use-arguments-commands',
    title: 'Use $ARGUMENTS in Commands',
    description: 'Pass dynamic input to slash commands with the $ARGUMENTS variable',
    category: 'commands',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## How $ARGUMENTS works

When you invoke a slash command, everything after the command name becomes \`$ARGUMENTS\`:

\`\`\`
/commit refactor auth module
→ $ARGUMENTS = "refactor auth module"
\`\`\`

## Parsing patterns

### Simple pass-through

\`\`\`markdown
Review this code change: $ARGUMENTS
\`\`\`

### Structured parsing

\`\`\`markdown
Parse the user's input: $ARGUMENTS

Extract:
- **Project name** (first word)
- **Description** (remaining words)
\`\`\`

### Optional arguments

\`\`\`markdown
$ARGUMENTS

If no arguments provided, ask the user what they want to build.
If arguments provided, proceed directly with the description.
\`\`\`

## Real example: /commit command

\`\`\`markdown
# Commit

Review diffs and create a commit.

**Message hint:** $ARGUMENTS

## Steps
1. Run git diff --staged
2. Analyze changes
3. Craft a Conventional Commits message
4. If $ARGUMENTS is provided, use it as a hint for the message
\`\`\``,
  },

  {
    id: 'chain-commands-agents',
    title: 'Chain Commands with Agents',
    description: 'Combine slash commands with agent patterns for multi-step workflows',
    category: 'commands',
    tools: ['claude'],
    difficulty: 'advanced',
    content: `## Multi-step command workflows

Encode complex workflows as commands that orchestrate multiple agent actions.

## Pattern: review then commit

\`\`\`markdown
# Ship

Review, test, and commit changes in one pass.

$ARGUMENTS

## Steps

1. Run \`git diff\` to see all changes
2. Check for linter errors in modified files
3. If errors found, fix them before proceeding
4. Review the changes for quality issues
5. Create a commit with a Conventional Commits message
6. Report what was committed
\`\`\`

## Pattern: parallel agent delegation

Commands can instruct Claude to launch parallel sub-agents:

\`\`\`markdown
# Audit

Run a comprehensive audit of the project.

Launch these checks in parallel:
- Code review agent on uncommitted changes
- Dependency update check
- Linter error scan across all source files

Collect results and present a unified report.
\`\`\`

## Tips for multi-step commands

- Number your steps explicitly
- Add checkpoint conditions ("if X fails, stop and report")
- Reference specific tools the agent should use
- Keep the total scope reasonable (5-8 steps max)`,
  },

  {
    id: 'claude-hooks',
    title: 'Hooks in Claude Code',
    description: 'Run custom scripts before or after Claude uses tools for validation and automation',
    category: 'commands',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## What are hooks?

Hooks are scripts that run automatically when Claude Code performs specific actions. They can validate, log, or transform tool calls.

## Hook types

| Hook | Runs when |
|------|----------|
| \`PreToolUse\` | Before Claude calls a tool (can block it) |
| \`PostToolUse\` | After a tool call completes |
| \`Notification\` | When Claude sends a notification |
| \`Stop\` | When Claude finishes a turn |

## Configuration

Add hooks to \`.claude/settings.json\`:

\`\`\`json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "python3 .claude/hooks/validate.py"
        }]
      }
    ]
  }
}
\`\`\`

## Example: block writes to protected files

\`\`\`python
import sys, json

input_data = json.load(sys.stdin)
file_path = input_data.get("tool_input", {}).get("file_path", "")

protected = [".env", "secrets.json", "credentials.yml"]
if any(file_path.endswith(p) for p in protected):
    print(json.dumps({"decision": "block", "reason": "Protected file"}))
else:
    print(json.dumps({"decision": "approve"}))
\`\`\`

## Use cases

- Block writes to sensitive files
- Auto-format code after edits
- Log all tool calls for audit
- Run linters after file changes

Source: [docs.anthropic.com/en/docs/claude-code/hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)`,
  },

];
