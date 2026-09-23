export const setup = [

  {
    id: 'install-claude-code',
    title: 'Install Claude Code',
    description: 'Get Claude Code running in your terminal in under 5 minutes',
    category: 'setup',
    tools: ['claude'],
    difficulty: 'beginner',
    content: `## What is Claude Code?

Claude Code is a terminal-based AI agent that reads, writes, and runs code in your projects. It operates directly in your shell, not inside an editor.

## Install

Requires Node.js 18+. If you need Node.js:

\`\`\`bash
# macOS (Homebrew)
brew install node

# Or use a version manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 22
\`\`\`

Then install Claude Code:

\`\`\`bash
npm install -g @anthropic-ai/claude-code
\`\`\`

Source: [docs.anthropic.com/en/docs/claude-code/overview](https://docs.anthropic.com/en/docs/claude-code/overview)

## Authenticate

### Personal account (fastest)

\`\`\`bash
claude login
\`\`\`

Opens your browser to sign in. Your session persists across terminal restarts. Requires a Max or Team plan.

### API key

\`\`\`bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
\`\`\`

Add to \`~/.zshrc\` or \`~/.bashrc\` to persist. Get keys at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### AWS Bedrock

Route through your AWS account. Add these exports to \`~/.zshrc\`:

\`\`\`bash
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_MODEL="us.anthropic.claude-sonnet-4-20250514-v1:0"
\`\`\`

Requires AWS credentials configured via \`aws configure\`. Costs appear in AWS Cost Explorer, not the Anthropic console.

Source: [docs.anthropic.com/en/docs/claude-code/bedrock-vertex](https://docs.anthropic.com/en/docs/claude-code/bedrock-vertex)

## Initialize a project

\`\`\`bash
claude /init
\`\`\`

This scans your codebase and generates a \`CLAUDE.md\` with structure, commands, and conventions pre-filled. Customize from there.

## Verify

\`\`\`bash
claude --version
claude "say hello"
\`\`\`

## First session tips

- Start in your project root so Claude can see your files
- Use \`claude --resume\` to continue where you left off
- Type \`/help\` inside a session for available commands`,
  },

  {
    id: 'claude-custom-models',
    title: 'Use Claude Code with Custom and Local Models',
    description: 'Route Claude Code to Moonshot, AWS Bedrock, or your own local model',
    category: 'setup',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## Why route Claude Code elsewhere?

Claude Code is hard-coded to talk to Anthropic by default, but it uses the standard Anthropic SDK under the hood. That means you can point it at any provider that speaks the same protocol: third-party APIs, AWS Bedrock, or a local server like LM Studio.

This is useful when:

- You have credits or quota with another provider
- You want to keep everything on your machine
- Your company requires AWS Bedrock for compliance

## Moonshot / Kimi setup

Set these environment variables before running \`claude\`:

\`\`\`bash
export ANTHROPIC_BASE_URL=https://api.moonshot.ai/anthropic
export ANTHROPIC_AUTH_TOKEN=sk-your-moonshot-key
export ANTHROPIC_MODEL=kimi-k2-thinking-turbo
export ANTHROPIC_DEFAULT_OPUS_MODEL=kimi-k2-thinking-turbo
export ANTHROPIC_DEFAULT_SONNET_MODEL=kimi-k2-thinking-turbo
export ANTHROPIC_DEFAULT_HAIKU_MODEL=kimi-k2-thinking-turbo
export CLAUDE_CODE_SUBAGENT_MODEL=kimi-k2-thinking-turbo
export ENABLE_TOOL_SEARCH=false
\`\`\`

\`ANTHROPIC_AUTH_TOKEN\` is used instead of \`ANTHROPIC_API_KEY\` because Moonshot expects its own bearer token. \`ENABLE_TOOL_SEARCH=false\` disables the built-in tool search feature that is not supported on non-Anthropic endpoints.

## AWS Bedrock setup

### Option 1: AWS credentials (recommended)

Make sure your machine is configured with AWS credentials:

\`\`\`bash
aws configure
\`\`\`

Then tell Claude Code to use Bedrock:

\`\`\`bash
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_MODEL="us.anthropic.claude-sonnet-4-20250514-v1:0"
\`\`\`

Costs show up in AWS Cost Explorer, not in the Anthropic console.

### Option 2: AWS + token (cross-account or explicit role)

If you need to assume a role or use temporary credentials, set them directly:

\`\`\`bash
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_REGION=us-east-1
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_MODEL="us.anthropic.claude-sonnet-4-20250514-v1:0"
\`\`\`

Use the model ARN or Bedrock model ID your account has access to.

## Local model with LM Studio

Start LM Studio and enable server mode, usually at:

\`\`\`
http://localhost:1234/v1
\`\`\`

Then point Claude Code at it:

\`\`\`bash
export ANTHROPIC_BASE_URL=http://localhost:1234
export ANTHROPIC_AUTH_TOKEN=lmstudio
export ANTHROPIC_MODEL=local-model
export CLAUDE_CODE_SUBAGENT_MODEL=local-model
export ENABLE_TOOL_SEARCH=false
\`\`\`

The token can be any non-empty string. LM Studio ignores it.

## Make settings persistent

Add the exports for your chosen provider to \`~/.zshrc\` or \`~/.bashrc\`. For per-project switching, create a small alias or a \`.env\` file you source before starting Claude Code.

Example helper alias for Moonshot:

\`\`\`bash
alias claude-kimi='export ANTHROPIC_BASE_URL=https://api.moonshot.ai/anthropic && export ANTHROPIC_AUTH_TOKEN=sk-your-moonshot-key && export ANTHROPIC_MODEL=kimi-k2-thinking-turbo && export ENABLE_TOOL_SEARCH=false && claude'
\`\`\`

## Common issues

| Issue | Fix |
|-------|-----|
| \`401 Unauthorized\` | Check that you used \`ANTHROPIC_AUTH_TOKEN\` for Moonshot/LM Studio, not \`ANTHROPIC_API_KEY\` |
| \`404 Not Found\` | Verify the base URL ends in \`/anthropic\` for Moonshot or \`/v1\` for LM Studio |
| Slow or truncated responses | Reduce \`--max-thinking-tokens\` or switch to a smaller model |
| \`Tool search error\` | Set \`ENABLE_TOOL_SEARCH=false\` for non-Anthropic endpoints |
| Bedrock \`AccessDenied\` | Confirm the model is enabled in Bedrock Console > Model access |
| Local model returns garbage | Lower the context length or use a higher quantization |

## Validate your setup

Run these before trusting the config for real work:

\`\`\`bash
# 1. Confirm which endpoint Claude Code sees
claude config get apiBaseUrl

# 2. Check the model name
claude config get model

# 3. Send a one-off prompt
claude "say hello and tell me which model you are"

# 4. For local models, disconnect Wi-Fi and try step 3 again
\`\`\`

If step 4 works offline, your traffic never left the machine.`,
  },

  {
    id: 'install-cursor',
    title: 'Install Cursor',
    description: 'Set up Cursor as your AI-powered code editor',
    category: 'setup',
    tools: ['cursor'],
    difficulty: 'beginner',
    content: `## What is Cursor?

Cursor is a code editor (VS Code fork) with built-in AI assistance. It uses Claude and other models for code generation, chat, and inline editing. Most VS Code extensions work in Cursor.

## Install

1. Download from [cursor.com](https://cursor.com)
2. Open the installer and follow the prompts
3. Import your VS Code settings and extensions when asked (optional)

Available on macOS, Windows, and Linux. Free Hobby plan included; Pro plan ($20/mo) adds more fast requests.

Source: [cursor.com/pricing](https://cursor.com/pricing)

## First-time configuration

### Select a model

Open Settings > Models and enable Claude (Sonnet or Opus). Cursor supports multiple providers including OpenAI and Google.

### Agent mode vs Ask mode

- **Agent mode**: reads, writes, and runs code (full power)
- **Ask mode**: read-only, answers questions without changing files

Use Ask mode for exploration, Agent mode for implementation.

## Key shortcuts

| Shortcut | Action |
|----------|--------|
| \`Cmd+L\` | Open chat panel |
| \`Cmd+K\` | Inline edit at cursor |
| \`Cmd+I\` | Open Composer (multi-file agent) |
| \`Tab\` | Accept AI suggestion |
| \`Cmd+Shift+J\` | Toggle terminal |

## Add project rules

Create \`.cursor/rules/\` to give the AI persistent instructions. See the "Set Up .cursorrules" tutorial.

## CLAUDE.md works here too

Cursor reads \`CLAUDE.md\` and \`AGENTS.md\` files from your project root, just like Claude Code. One file gives context to both tools.`,
  },

  {
    id: 'essential-cli-flags',
    title: 'Essential CLI Flags',
    description: 'The most useful Claude Code command-line options for daily work',
    category: 'setup',
    tools: ['claude'],
    difficulty: 'beginner',
    content: `## Session management

\`\`\`bash
# Resume last conversation
claude --resume

# Continue most recent session
claude --continue

# Start with a specific model
claude --model claude-sonnet-4-20250514
\`\`\`

## One-shot commands

Run Claude without entering interactive mode:

\`\`\`bash
# Pipe input
claude -p "explain this error" < error.log

# Output as plain text (for scripts)
claude -p "list TODOs in this repo" --output-format text

# Read-only mode (no file edits)
claude -p "review this code" --allowedTools ""
\`\`\`

## Debugging

\`\`\`bash
# See tool calls and token counts
claude --verbose

# Use a system prompt
claude --system-prompt "You are a Python expert"
\`\`\`

## Quick reference

| Flag | What it does |
|------|-------------|
| \`--resume\` | Resume last conversation |
| \`--continue\` | Continue most recent session |
| \`-p "..."\` | One-shot command (non-interactive) |
| \`--verbose\` | Show tool calls and token counts |
| \`--model\` | Use a specific model |
| \`--output-format text\` | Plain text output |
| \`--allowedTools ""\` | Read-only mode |

## Tip

Combine \`-p\` with pipes for scripted workflows:

\`\`\`bash
git diff | claude -p "review these changes" --output-format text
\`\`\``,
  },

  {
    id: 'session-management',
    title: 'Sessions, Memory & Gotchas',
    description: 'Resume conversations, understand memory files, and avoid the path rename trap',
    category: 'setup',
    tools: ['claude'],
    difficulty: 'beginner',
    content: `## Resuming sessions

Claude Code remembers previous conversations. Pick up where you left off:

\`\`\`bash
# Resume the last conversation
claude --resume

# Continue without a prompt (just re-enters the session)
claude --continue
\`\`\`

Use \`--resume\` when you want to add to an existing task. Start a new session for unrelated work (saves tokens).

## Memory files

Claude reads these files automatically at the start of every session:

\`\`\`
# Project instructions (checked into your repo)
CLAUDE.md

# User-level instructions (applies to all projects)
~/.claude/CLAUDE.md

# Auto-memory (Claude writes here when asked to remember things)
~/.claude/projects/<project-hash>/memory/MEMORY.md
\`\`\`

### Teaching Claude to remember

Tell Claude: "Remember: always use bun instead of npm in this project"

It writes the instruction to its memory file. To undo: "Forget the rule about using bun"

## The path rename trap

**Claude stores project memory using the absolute path to your project directory.** If you rename or move the folder, Claude loses all project-specific memory and context.

\`\`\`
# These are DIFFERENT projects to Claude:
~/Projects/my-app/          ← has memory
~/Projects/my-app-v2/       ← no memory (different path)
\`\`\`

### How to handle renames

If you must rename a project directory:

\`\`\`bash
# 1. Find the old memory directory
ls ~/.claude/projects/

# 2. Copy or rename the memory to match the new path hash
# Or: re-run claude /init in the renamed directory
\`\`\`

## Permission settings

Skip repetitive permission prompts by pre-approving common tools in \`.claude/settings.json\`:

\`\`\`json
{
  "permissions": {
    "allow": [
      "Bash(git *)", "Bash(ls *)", "Bash(cd *)",
      "Read", "Edit", "Write", "Glob", "Grep"
    ]
  }
}
\`\`\`

## Tips

- Start fresh sessions for unrelated tasks (cheaper, faster)
- Keep CLAUDE.md under 500 lines; split details into linked docs
- Regularly check \`~/.claude/projects/\` to prune stale memory`,
  },

  {
    id: 'auth-options',
    title: 'Authentication Options',
    description: 'Connect Claude via API key, AWS Bedrock, or Google Vertex AI',
    category: 'setup',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## Authentication methods

Claude Code supports multiple authentication backends. Choose based on your setup.

## 1. Personal login (simplest)

\`\`\`bash
claude login
\`\`\`

Uses your Anthropic account. Best for personal projects and exploration.

## 2. API key

\`\`\`bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
\`\`\`

Add to \`~/.zshrc\` to persist. Best for developers with API billing.

## 3. AWS Bedrock

Route Claude through your AWS account. Useful for teams with existing AWS billing.

\`\`\`bash
# Configure AWS credentials
aws configure

# Tell Claude Code to use Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# Optionally pin a model
export ANTHROPIC_MODEL="us.anthropic.claude-sonnet-4-20250514-v1:0"

# For cross-account access
export AWS_ROLE_ARN="arn:aws:iam::123456789:role/BedrockAccess"
\`\`\`

Add all exports to \`~/.zshrc\` to persist across sessions.

## 4. Google Vertex AI

Route through Google Cloud. Useful for teams with GCP billing.

\`\`\`bash
# Authenticate
gcloud auth application-default login

# Set project and region
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_VERTEX_PROJECT_ID="your-gcp-project-id"

# Tell Claude Code to use Vertex
export CLAUDE_CODE_USE_VERTEX=1
\`\`\`

## Which should I use?

| Scenario | Method |
|----------|--------|
| Personal projects | \`claude login\` |
| Solo developer, pay-per-use | API key |
| Team with AWS billing | Bedrock |
| Team with GCP billing | Vertex AI |`,
  },

];
