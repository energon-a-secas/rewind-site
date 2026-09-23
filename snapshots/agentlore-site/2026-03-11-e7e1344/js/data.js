export const CATEGORIES = {
  setup:    'Setup',
  skills:   'Skills',
  commands: 'Commands',
  context:  'Context',
  diagrams: 'Diagrams',
  tips:     'Tips',
  mcps:     'MCPs',
};

export const TOOLS = {
  claude: 'Claude',
  cursor: 'Cursor',
};

export const DIFFICULTIES = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

export const LEVEL_META = {
  beginner: {
    label: 'Foundations',
    subtitle: 'Start here. Installation, cost awareness, and core concepts.',
    icon: '1',
  },
  intermediate: {
    label: 'Intermediate',
    subtitle: 'Level up. Deeper patterns, cross-tool workflows, and productivity techniques.',
    icon: '2',
  },
  advanced: {
    label: 'Advanced',
    subtitle: 'Power moves. Multi-step orchestration, architecture modeling, and optimization.',
    icon: '3',
  },
};

/* ── Merged learning path ─────────────────────────────────
 * Each row is one of:
 *   { shared: id, why }            → centered spanning both columns
 *   { claude: id, cursor: id }     → side by side
 *   { claude: id }                 → left column only
 *   { cursor: id }                 → right column only
 * "why" on tool-specific entries is pulled from the tutorial description.
 */

export const LEARNING_PATH = [
  { claude: 'install-claude-code',    cursor: 'install-cursor' },
  { shared: 'check-ai-costs',        why: 'Know where to monitor spending before you burn tokens.' },
  { claude: 'session-cost-report',   why: 'Track per-session costs and set budget alerts.' },
  { shared: 'keep-ai-costs-low',     why: 'Build cost-awareness habits from day one.' },
  { shared: 'context-management',    why: 'Compact conversations to save tokens and stay focused.' },
  { shared: 'model-selection',       why: 'Pick the right model for the task to save time and money.' },
  { shared: 'write-effective-claude-md', why: 'Give the AI context so it works effectively.' },
  { shared: 'ignore-files',          why: 'Exclude irrelevant files to reduce token waste.' },
  { claude: 'essential-cli-flags',    cursor: 'setup-cursorrules' },
  { claude: 'session-management',     cursor: 'cursor-at-references' },
  { shared: 'git-ai-workflows',      why: 'Use AI for commits, reviews, and branch management.' },
  { shared: 'create-skill',          why: 'Write your first reusable agent skill.' },
  { shared: 'install-skills-registry', why: 'Expand with community-built skills.' },
  { shared: 'explore-unfamiliar-codebase', why: 'Jump into unfamiliar repos without wasting time.' },
  { shared: 'mermaid-flowchart-basics', why: 'Visualize architecture with text-based diagrams.' },
  { shared: 'what-is-mcp',           why: 'Understand the plugin system for AI agents.' },
  { claude: 'write-slash-command',    cursor: 'cursor-notepads' },
  { claude: 'configure-mcp-claude',   cursor: 'configure-mcp-cursor' },
  { claude: 'use-arguments-commands' },
  { claude: 'claude-hooks' },
  { claude: 'auth-options' },
  { shared: 'skill-discovery-differences', why: 'Understand how each tool finds and loads skills.' },
  { shared: 'progressive-disclosure-docs', why: 'Structure docs for minimal token cost.' },
  { shared: 'parallel-agents-pattern', why: 'Speed up work by running agents concurrently.' },
  { shared: 'generate-architecture-svg', why: 'Generate version-controlled diagrams.' },
  { claude: 'chain-commands-agents' },
  { shared: 'c4-diagrams-mermaid',   why: 'Model systems at multiple zoom levels.' },
];

/* ── Tutorials ────────────────────────────────────────────── */

export const tutorials = [

  // ── Setup ──────────────────────────────────────────────────

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
    id: 'check-ai-costs',
    title: 'Check Your AI Costs',
    description: 'Where to monitor usage and spending in Claude and Cursor',
    category: 'setup',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Why check costs early

AI tools charge per token. A single long session can consume more than you expect. Knowing where to look prevents surprises.

## Claude Code: where costs live

Cost tracking depends on how you authenticate.

### Personal account (Max plan)

Usage counts against your subscription. No per-token bill, but you have rate limits.

\`\`\`
console.anthropic.com → Settings → Usage
\`\`\`

### API key

You pay per token. Track spending and set monthly caps:

\`\`\`
console.anthropic.com → Billing → Usage
\`\`\`

### AWS Bedrock

Costs go through your AWS bill, not the Anthropic console. Check:

\`\`\`
AWS Console → Cost Explorer → filter by "Amazon Bedrock"
\`\`\`

Or use the AWS CLI:

\`\`\`bash
aws ce get-cost-and-usage --time-period Start=2026-03-01,End=2026-03-09 \\
  --granularity DAILY --filter '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Bedrock"]}}' \\
  --metrics BlendedCost --query 'ResultsByTime[].Total.BlendedCost'
\`\`\`

### Google Vertex AI

Costs go through GCP billing:

\`\`\`
console.cloud.google.com → Billing → Reports → filter "Vertex AI"
\`\`\`

### In-session tracking

Claude Code logs token counts per response when you run in verbose mode:

\`\`\`bash
claude --verbose
\`\`\`

This shows input, output, and cache tokens after each turn. Useful for spotting expensive operations in real time.

## Session cost report

Claude Code stores token usage in session files at \`~/.claude/projects/\`. A Python script can read them and estimate costs across all billing methods.

Full script: [claude-costs.py on GitHub](https://github.com/energon-a-secas/agentlore-site/blob/main/scripts/claude-costs.py)

\`\`\`bash
python3 claude-costs.py                          # API pricing, last 30 days
python3 claude-costs.py --days 7                 # last week
python3 claude-costs.py --pricing bedrock        # AWS Bedrock global
python3 claude-costs.py --pricing vertex         # Google Vertex global
python3 claude-costs.py --pricing bedrock --regional  # Bedrock +10% regional
\`\`\`

The script matches each session's model (Opus 4.6, Sonnet 4, Haiku 3.5, etc.) to its published per-token rate and applies the correct provider multiplier. Output looks like:

\`\`\`
  Pricing: BEDROCK regional | Period: 7 days | Sessions: 42

Date              Project         Model                       Cost
------------------------------------------------------------------
2026-03-08 12:55  myapp           claude-opus-4-6         \$ 17.72
2026-03-07 15:38  myapp           claude-sonnet-4-6       \$  3.21
...
------------------------------------------------------------------
Total (42 sessions, 7d)                                 \$156.8300
\`\`\`

Costs are estimates. Max plan users see theoretical API-rate costs. Check your actual billing dashboard for real charges.

## Cursor costs

### Subscription

Cursor Pro includes a monthly allowance of "premium" requests. Check remaining:

\`\`\`
Settings → Subscription → Usage
\`\`\`

Or visit: [cursor.com/settings](https://cursor.com/settings)

### Premium vs standard requests

Cursor splits requests into two tiers:

- **Premium requests** draw from your monthly allowance. They run on the strongest models (Claude Sonnet, GPT-4o) with priority.
- **Standard requests** are unlimited. They use smaller models or run during off-peak times with lower priority.

Once your premium allowance runs out, you can still work with standard requests at no extra charge. Cursor shows your remaining premium count in Settings.

Source: [docs.cursor.com/account/plans-and-usage](https://docs.cursor.com/account/plans-and-usage)

## Quick reference

| Method | Where to check costs | Alerts |
|--------|---------------------|--------|
| Claude Max plan | console.anthropic.com | Rate limits |
| Claude API key | console.anthropic.com → Billing | Monthly cap |
| AWS Bedrock | AWS Cost Explorer | AWS Budgets |
| Google Vertex | GCP Billing → Reports | GCP Alerts |
| Cursor Pro | cursor.com/settings | Request counter |`,
  },

  {
    id: 'session-cost-report',
    title: 'Session Cost Report Script',
    description: 'Track per-session Claude Code spending with a Python script — supports API, Bedrock, and Vertex pricing with budget alerts',
    category: 'setup',
    tools: ['claude'],
    difficulty: 'beginner',
    content: `## What it does

This script reads Claude Code session files from \`~/.claude/projects/\` and calculates estimated costs per session. It supports API, Bedrock, and Vertex pricing with optional budget alerts and OS notifications.

Claude Code stores token usage (input, output, cache write, cache read) in JSONL files for every session. The script parses those files, matches each session's model to its published per-token rate, and outputs a cost report.

## Download

\`\`\`bash
curl -o claude-costs.py https://raw.githubusercontent.com/energon-a-secas/agentlore-site/main/scripts/claude-costs.py
chmod +x claude-costs.py
\`\`\`

Or copy the full script from the [source file](https://github.com/energon-a-secas/agentlore-site/blob/main/scripts/claude-costs.py).

Requires Python 3.8+. No external dependencies.

## Basic usage

\`\`\`bash
python3 claude-costs.py                # last 30 days, API pricing
python3 claude-costs.py --days 7       # last week only
python3 claude-costs.py --days 1       # today only
\`\`\`

## Provider pricing

The default uses Anthropic API rates. Switch to Bedrock or Vertex:

\`\`\`bash
python3 claude-costs.py --pricing bedrock       # AWS Bedrock global endpoint
python3 claude-costs.py --pricing vertex        # Google Vertex global endpoint
python3 claude-costs.py --pricing bedrock --regional  # +10% regional premium
\`\`\`

Regional endpoints on Bedrock and Vertex charge 10% more for Claude 4.5+ models. Use \`--regional\` to include that premium in the estimate.

## Budget alerts

Set a spending threshold. The script prints a warning and exits with code 1 if exceeded:

\`\`\`bash
python3 claude-costs.py --budget 50              # warn if over $50
python3 claude-costs.py --days 7 --budget 100    # weekly $100 cap
\`\`\`

Under budget shows remaining amount:

\`\`\`
  Budget: $100.00 | Remaining: $48.13 | Used: 52%
\`\`\`

Over budget shows a warning:

\`\`\`
  *** OVER BUDGET by $11.87 (budget: $100.00, spent: $111.87) ***
\`\`\`

## OS notifications

Add \`--notify\` to send a system notification when over budget:

\`\`\`bash
python3 claude-costs.py --budget 50 --notify
\`\`\`

Works on macOS (osascript) and Linux (notify-send). The notification only fires when the budget is exceeded.

## Automate with cron

Run the check daily at 9 AM and get a notification if you go over:

\`\`\`bash
crontab -e
\`\`\`

Add this line:

\`\`\`
0 9 * * * /usr/bin/python3 /path/to/claude-costs.py --days 7 --budget 100 --notify
\`\`\`

On macOS, you can also use launchd for persistence across reboots. Create \`~/Library/LaunchAgents/com.claude.costs.plist\`:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.claude.costs</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>/path/to/claude-costs.py</string>
    <string>--days</string>
    <string>7</string>
    <string>--budget</string>
    <string>100</string>
    <string>--notify</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
</dict>
</plist>
\`\`\`

Load it:

\`\`\`bash
launchctl load ~/Library/LaunchAgents/com.claude.costs.plist
\`\`\`

## Model pricing (March 2026)

The script includes rates for all current Claude models:

| Model | Input | Output | Cache write | Cache read |
|-------|-------|--------|-------------|------------|
| Opus 4.6 / 4.5 | \\$5 | \\$25 | \\$6.25 | \\$0.50 |
| Opus 4.1 / 4 | \\$15 | \\$75 | \\$18.75 | \\$1.50 |
| Sonnet 4.x | \\$3 | \\$15 | \\$3.75 | \\$0.30 |
| Haiku 4.5 | \\$1 | \\$5 | \\$1.25 | \\$0.10 |
| Haiku 3.5 | \\$0.80 | \\$4 | \\$1.00 | \\$0.08 |

Prices are per million tokens. Source: [docs.anthropic.com/en/docs/about-claude/pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

## Limitations

- Estimates only — actual Bedrock/Vertex charges may differ slightly
- Max plan users see what sessions "would cost" at API rates (subscription covers actual use)
- Does not track web search tool costs (\\$10 per 1,000 searches) or code execution time`,
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

  // ── Skills ──────────────────────────────────────────────────

  {
    id: 'create-skill',
    title: 'Create an Agent Skill',
    description: 'Write a SKILL.md file that Claude and Cursor discover and follow automatically',
    category: 'skills',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## What is an Agent Skill?

A skill is a reusable instruction file (\`SKILL.md\`) that AI agents discover and follow when a task matches the skill's trigger. It lives alongside your code and works across tools.

## File structure

Place skills in one of these directories:

- \`~/.claude/skills/\` -- global skills for Claude Code
- \`~/.cursor/skills/\` -- global skills for Cursor
- \`.agents/skills/<name>/\` -- repo-level skills (both tools)

Each skill folder contains one file:

\`\`\`
.agents/skills/my-skill/
  SKILL.md
\`\`\`

## SKILL.md anatomy

\`\`\`markdown
# Skill Name

## Triggers
Use when the user asks to "do X", "build Y", or mentions "Z".

## Steps
1. First, check the existing code for ...
2. Then create/modify ...
3. Finally, verify ...

## Rules
- Always use TypeScript
- Never modify files outside src/
\`\`\`

## Tips

- Keep skills focused on a single task
- Include concrete examples in your steps
- Add file path patterns so the agent knows where to look
- Test by asking the agent to perform the trigger phrase`,
  },

  {
    id: 'install-skills-registry',
    title: 'Install Skills from a Registry',
    description: 'Use skillfish or manual install to add community skills',
    category: 'skills',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Skill registries

Community skills are shared through registries. The most common is [skill.fish](https://skill.fish).

## Install with skillfish CLI

\`\`\`bash
# Install a skill by ID
npx skillfish add <skill-id>

# Browse available skills
npx skillfish search "code review"
\`\`\`

## Manual install

Download the \`SKILL.md\` file and place it in:

\`\`\`bash
# For Claude Code (global)
~/.claude/skills/<skill-name>/SKILL.md

# For Cursor (global)
~/.cursor/skills/<skill-name>/SKILL.md

# For both (repo-level)
.agents/skills/<skill-name>/SKILL.md
\`\`\`

## Recommended starter skills

\`\`\`bash
# Smart commit messages
claude skill install commit-work

# Code review
claude skill install code-review

# SEO optimization
claude skill install seo-geo

# Web design audit
claude skill install web-design-reviewer
\`\`\`

## Verifying installation

Ask your agent: "What skills do you have available?" -- it should list the newly installed skill and its trigger conditions.`,
  },

  {
    id: 'skill-discovery-differences',
    title: 'Skill Discovery: Claude vs Cursor',
    description: 'Where each tool looks for skills and how discovery differs',
    category: 'skills',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## Discovery paths

Each tool scans different directories for skills:

### Claude Code

1. \`~/.claude/skills/*/SKILL.md\` -- global user skills
2. \`.claude/skills/*/SKILL.md\` -- project-level skills
3. \`.agents/skills/*/SKILL.md\` -- shared convention

### Cursor

1. \`~/.cursor/skills/*/SKILL.md\` -- global user skills
2. \`.cursor/skills/*/SKILL.md\` -- project-level (via rules)
3. \`.agents/skills/*/SKILL.md\` -- shared convention

## Cross-tool compatibility

The \`.agents/skills/\` directory works with both tools. Use it for skills you want portable across Claude and Cursor.

## Key differences

| Aspect | Claude Code | Cursor |
|--------|------------|--------|
| Invocation | Reads SKILL.md on demand | Listed in agent skills panel |
| Triggers | Pattern-matched from skill description | Matched via skill metadata |
| Scope | Session-based | Persistent across sessions |

## Recommendation

For maximum portability, always place skills in \`.agents/skills/\`. Add symlinks or copies to tool-specific directories only when the skill uses tool-specific features.`,
  },

  // ── Commands ────────────────────────────────────────────────

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

  // ── Context ─────────────────────────────────────────────────

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

  // ── Diagrams ────────────────────────────────────────────────

  {
    id: 'mermaid-flowchart-basics',
    title: 'Mermaid Flowchart Basics',
    description: 'Create flowcharts with Mermaid syntax for architecture docs',
    category: 'diagrams',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## What is Mermaid?

Mermaid is a text-based diagramming language that renders in GitHub, GitLab, Notion, and many editors. Write text, get diagrams.

## Basic flowchart

\`\`\`
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

## Node shapes

\`\`\`
A[Rectangle]
B(Rounded)
C([Stadium])
D{Diamond}
E[(Database)]
F((Circle))
\`\`\`

## Direction options

- \`TD\` or \`TB\` -- top to bottom
- \`LR\` -- left to right
- \`BT\` -- bottom to top
- \`RL\` -- right to left

## Subgraphs for grouping

\`\`\`
flowchart LR
    subgraph Frontend
        A[React App] --> B[Components]
    end
    subgraph Backend
        C[API Server] --> D[(Database)]
    end
    B --> C
\`\`\`

## Common gotchas

- Do not use spaces in node IDs (\`UserService\`, not \`User Service\`)
- Wrap edge labels with special chars in quotes: \`A -->|"O(n)"| B\`
- Avoid \`end\` as a node ID (reserved keyword)`,
  },

  {
    id: 'generate-architecture-svg',
    title: 'Generate Architecture SVGs',
    description: 'Use mmdc CLI to convert Mermaid source into SVG files for docs',
    category: 'diagrams',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## Why SVGs?

Mermaid renders in GitHub markdown, but SVGs give you:
- Consistent rendering everywhere
- Version-controlled visual diffs
- Embeddable in any documentation

## Install mermaid-cli

\`\`\`bash
npm install -g @mermaid-js/mermaid-cli
\`\`\`

## Create a .mmd source file

Save your diagram as \`docs/architecture.mmd\`:

\`\`\`
flowchart TB
    User([User]) --> HTML["index.html"]
    HTML --> App["app.js"]
    App --> State["state.js"]
    App --> Render["render.js"]
\`\`\`

## Generate the SVG

\`\`\`bash
npx mmdc -i docs/architecture.mmd -o docs/architecture.svg --backgroundColor white
\`\`\`

## Embed in README

\`\`\`markdown
## Architecture

![Architecture](docs/architecture.svg)
\`\`\`

## Automation tip

Add a Makefile target:

\`\`\`makefile
docs/architecture.svg: docs/architecture.mmd
	npx mmdc -i $< -o $@ --backgroundColor white
\`\`\``,
  },

  {
    id: 'c4-diagrams-mermaid',
    title: 'C4 Diagrams in Mermaid',
    description: 'Model system architecture with C4 context, container, and component diagrams',
    category: 'diagrams',
    tools: ['claude', 'cursor'],
    difficulty: 'advanced',
    content: `## C4 model overview

C4 describes software architecture at four levels of zoom:

1. **Context** -- system + external actors
2. **Container** -- deployable units (apps, databases, queues)
3. **Component** -- internal modules within a container
4. **Code** -- class/function level (rarely diagrammed)

## C4 Context in Mermaid

\`\`\`
C4Context
    title System Context

    Person(user, "Developer", "Uses the tool")
    System(app, "Agent Lore", "AI tutorial hub")
    System_Ext(github, "GitHub Pages", "Static hosting")

    Rel(user, app, "Browses tutorials")
    Rel(app, github, "Deployed to")
\`\`\`

## C4 Container diagram

\`\`\`
C4Container
    title Container Diagram

    Person(user, "Developer")

    Container_Boundary(web, "Web App") {
        Container(html, "index.html", "HTML", "App shell")
        Container(js, "ES Modules", "JavaScript", "App logic")
        Container(css, "style.css", "CSS", "Styling")
    }

    ContainerDb(storage, "localStorage", "Browser", "Filter state")

    Rel(user, html, "Loads")
    Rel(html, js, "Imports")
    Rel(js, storage, "Reads/writes")
\`\`\`

## Tips

- Start with Context (zoom out), then drill into Containers
- Use \`System_Ext\` for third-party services
- Keep each diagram focused on one level
- GitHub renders C4 Mermaid natively since 2024`,
  },

  // ── Tips ────────────────────────────────────────────────────

  {
    id: 'keep-ai-costs-low',
    title: 'Keep AI Costs Low',
    description: 'Practical strategies to reduce token usage and API spend',
    category: 'tips',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Why costs add up

Every message to an AI agent sends your entire conversation context. Longer conversations = more tokens = higher costs.

## Cost reduction strategies

### 1. Start fresh for new tasks

Don't reuse a long conversation for unrelated tasks. Open a new chat to reset context.

### 2. Write good CLAUDE.md

A clear CLAUDE.md eliminates back-and-forth questions. Agents that understand your project on the first try cost less. Use \`claude /init\` to generate one automatically.

### 3. Be specific in prompts

Bad: "Fix the bug"
Good: "Fix the null pointer in src/auth.js line 42 where user.email is accessed before checking if user exists"

### 4. Use smaller models for simple tasks

Both Claude and Cursor let you select models. Use faster/cheaper models for straightforward tasks (rename, format, simple edits).

### 5. Batch related changes

Instead of 5 separate requests, describe all 5 changes in one message. The agent processes them together with shared context.

### 6. Use .claudeignore and .cursorignore

Exclude large files, build artifacts, and node_modules from agent context:

\`\`\`
node_modules/
dist/
*.min.js
\`\`\`

### 7. Monitor usage

Check your cost dashboard regularly. See the "Check Your AI Costs" tutorial for exact URLs and steps.`,
  },

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

  // ── MCPs ────────────────────────────────────────────────────

  {
    id: 'what-is-mcp',
    title: 'What is MCP?',
    description: 'Model Context Protocol basics and when to use MCP servers',
    category: 'mcps',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## Model Context Protocol

MCP (Model Context Protocol) is a standard for connecting AI agents to external tools and data sources. Think of it as a plugin system for AI.

## Core concepts

- **MCP Server**: a process that exposes tools and resources to the agent
- **Tools**: functions the agent can call (search, navigate, analyze)
- **Resources**: read-only data the agent can access (docs, schemas)

## Common MCP servers

| Server | Purpose |
|--------|---------|
| Context7 | Fetch up-to-date library documentation |
| Playwright | Browser automation and testing |
| File system | Enhanced file operations |
| Database | Query databases directly |

## When to use MCPs vs Skills

| Use MCPs when... | Use Skills when... |
|------------------|--------------------|
| You need live external data | You need reusable instructions |
| The tool requires a running process | The task is pure text/code generation |
| Integration with APIs or browsers | Following a specific workflow pattern |

## Key takeaway

MCPs extend what an agent *can do* (new capabilities). Skills guide *how* the agent works (new behaviors). Start with skills; add MCPs when you need external integrations.

Source: [modelcontextprotocol.io](https://modelcontextprotocol.io) — the full MCP specification and server registry.`,
  },

  {
    id: 'configure-mcp-cursor',
    title: 'Configure an MCP Server in Cursor',
    description: 'Set up and use MCP servers in your Cursor workspace',
    category: 'mcps',
    tools: ['cursor'],
    difficulty: 'intermediate',
    content: `## MCP in Cursor

Cursor connects to MCP servers that provide tools and resources to the AI agent.

## Setup

### 1. Configure in Cursor settings

Add servers to \`.cursor/mcp.json\` in your project root or globally via Cursor Settings > MCP:

\`\`\`json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
\`\`\`

### 2. Verify

After saving, Cursor restarts the servers automatically. The agent can now discover and call tools from configured servers.

## Useful MCP servers

| Server | Install | Purpose |
|--------|---------|---------|
| Playwright | \`@playwright/mcp@latest\` | Browser automation and testing |
| Context7 | \`@upstash/context7-mcp@latest\` | Live library docs lookup |
| GitHub | \`@modelcontextprotocol/server-github\` | Issues, PRs, repo access |

## Troubleshooting

- Server won't start: check that \`npx\` can resolve the package
- Tool call fails: read the tool schema first to get correct parameters
- Missing tools: restart Cursor after editing mcp.json

Source: [docs.cursor.com/context/model-context-protocol](https://docs.cursor.com/context/model-context-protocol)`,
  },

  // ── New tutorials ──────────────────────────────────────────────

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
- Use \`@codebase\` sparingly — it uses more tokens
- Combine references: \`@auth.ts @types.ts fix the type mismatch\`

Source: [docs.cursor.com/context/@-symbols](https://docs.cursor.com/context/@-symbols)`,
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

  {
    id: 'cursor-notepads',
    title: 'Notepads in Cursor',
    description: 'Save reusable context blocks that you can attach to any conversation',
    category: 'context',
    tools: ['cursor'],
    difficulty: 'intermediate',
    content: `## What are Notepads?

Notepads are saved text snippets in Cursor that you can attach to any chat with \`@notepads\`. Reusable context blocks — like bookmarks for instructions.

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

  {
    id: 'configure-mcp-claude',
    title: 'Configure MCP in Claude Code',
    description: 'Add MCP servers to Claude Code for browser testing, docs lookup, and more',
    category: 'mcps',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## MCP in Claude Code

Claude Code connects to MCP servers through its settings file, giving the agent access to external tools.

## Configuration

Add servers to \`.claude/settings.json\` in your project:

\`\`\`json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
\`\`\`

Or add globally to \`~/.claude/settings.json\` for all projects.

## Using MCP tools in a session

Once configured, Claude Code discovers the tools automatically. Ask naturally:

\`\`\`
"Navigate to localhost:3000 and take a screenshot"
"Look up the latest Tailwind CSS docs for grid layout"
\`\`\`

## Useful servers

| Server | Package | Purpose |
|--------|---------|---------|
| Playwright | \`@playwright/mcp@latest\` | Browser automation |
| Context7 | \`@upstash/context7-mcp@latest\` | Library docs lookup |
| Filesystem | \`@anthropic/mcp-server-filesystem\` | Enhanced file ops |

## Permissions

Some MCP servers need network access. Claude Code may prompt you to allow it. Pre-approve with:

\`\`\`json
{
  "permissions": {
    "allow": ["mcp__playwright__browser_navigate"]
  }
}
\`\`\`

Source: [docs.anthropic.com/en/docs/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp)`,
  },
];
