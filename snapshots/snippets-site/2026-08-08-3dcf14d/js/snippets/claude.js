// ── Claude Code ─────────────────────────────────────────────

export const claude = [
  {
    id: 'claude-settings-permissions',
    title: 'settings.json — skip permission prompts',
    description: 'Allowlist for common tools so Claude Code stops asking for confirmation on every read, edit, bash, and glob call',
    command: `{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(cd *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(rm *)",
      "Bash(find *)",
      "Bash(grep *)",
      "Bash(rg *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(wc *)",
      "Bash(sort *)",
      "Bash(uniq *)",
      "Bash(diff *)",
      "Bash(echo *)",
      "Bash(which *)",
      "Bash(python3 *)",
      "Bash(node *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(make *)",
      "Bash(open *)",
      "Bash(curl *)",
      "Bash(jq *)",
      "Bash(sed *)",
      "Bash(awk *)",
      "Bash(chmod *)",
      "Bash(touch *)",
      "Bash(kill *)",
      "Bash(lsof *)",
      "Bash(pgrep *)",
      "Bash(brew *)",
      "Bash(du *)",
      "Bash(df *)",
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "Agent",
      "WebFetch",
      "NotebookEdit",
      "mcp__*"
    ],
    "deny": []
  }
}`,
    platform: 'Claude Code',
    tags: ['claude', 'settings', 'permissions', 'config'],
    category: 'claude',
  },
  {
    id: 'claude-suggested-skills',
    title: 'Useful Claude Code skills to install',
    description: 'Curated list of /slash skills that extend Claude Code — run each install command to add them',
    command: `# Commit helper — smart staging + conventional commits
claude skill install commit-work

# Code review — checks uncommitted changes
claude skill install code-review

# SEO & GEO optimization
claude skill install seo-geo

# Web design review — accessibility + visual audit
claude skill install web-design-reviewer

# Visual verification — screenshot-based testing
claude skill install visual-verification

# Brand voice enforcement
claude skill install brand-voice

# Interaction design — microinteractions + motion
claude skill install interaction-design

# Web performance — Core Web Vitals + Lighthouse
claude skill install web-perf

# Dependency updater — safe auto-updates
claude skill install dependency-updater

# Marp slides — presentation generator
claude skill install marp-slide`,
    platform: 'Claude Code',
    tags: ['claude', 'skills', 'plugins', 'install'],
    category: 'claude',
  },
  {
    id: 'claude-md-starter',
    title: 'CLAUDE.md project starter',
    description: 'Minimal CLAUDE.md template with sections Claude Code actually uses — drop this in any project root',
    command: `# CLAUDE.md

## Run
\`python3 -m http.server 8000\` from project root.

## Architecture
Single-page app: \`index.html\` shell + \`css/style.css\` + \`js/*.js\` (ES modules).

## Key conventions
- No build step, no npm dependencies
- Mutable state via \`export const state = {}\` in state.js
- No JS file over 500 lines; app.js under 50 lines
- Use \`<script type="module">\` (requires HTTP server)

## Testing
Open in browser, check console for errors.

## Do not
- Add npm/build tooling
- Create files unless strictly needed
- Modify files you haven't read first`,
    platform: 'Claude Code',
    tags: ['claude', 'config', 'project', 'template'],
    category: 'claude',
  },
  {
    id: 'claude-task-prompt',
    title: 'Structured task prompt for Claude Code',
    description: 'Copy this template when starting a complex task — forces Claude to plan before coding',
    command: `/task
## Goal
[One sentence describing the end state]

## Context
- File: [path]
- Current behavior: [what happens now]
- Desired behavior: [what should happen]

## Constraints
- Do not modify [files/patterns to preserve]
- Follow existing patterns in [reference file]
- No new dependencies

## Acceptance
- [ ] [Testable criteria 1]
- [ ] [Testable criteria 2]`,
    platform: 'Claude Code',
    tags: ['claude', 'prompt', 'workflow', 'template'],
    category: 'claude',
  },
  {
    id: 'claude-api-key-setup',
    title: 'Set up Claude with Anthropic API key',
    description: 'Configure Claude Code to use a direct Anthropic API token — the simplest auth method',
    command: `# Option 1: Environment variable (add to ~/.zshrc or ~/.bashrc)
export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Option 2: Claude Code login (opens browser)
claude login

# Verify it works
claude --version
claude "say hello"`,
    platform: 'Claude Code',
    tags: ['claude', 'api', 'token', 'auth', 'setup'],
    category: 'claude',
  },
  {
    id: 'claude-aws-bedrock',
    title: 'Configure Claude Code with AWS Bedrock',
    description: 'Use Claude via AWS Bedrock instead of direct API — set credentials, region, and enable Bedrock mode',
    command: `# 1. Set AWS credentials (if not already configured)
aws configure
# Or export directly:
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"

# 2. Tell Claude Code to use Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# 3. Optionally pin a specific model
export ANTHROPIC_MODEL="us.anthropic.claude-sonnet-4-20250514-v1:0"

# 4. For cross-account access via assumed role
export AWS_ROLE_ARN="arn:aws:iam::123456789:role/BedrockAccess"

# Add these to ~/.zshrc to persist across sessions`,
    platform: 'Claude Code',
    tags: ['claude', 'aws', 'bedrock', 'credentials', 'setup'],
    category: 'claude',
  },
  {
    id: 'claude-vertex-ai',
    title: 'Configure Claude Code with Google Vertex AI',
    description: 'Use Claude via Google Cloud Vertex AI — authenticate with gcloud and set project',
    command: `# 1. Authenticate with Google Cloud
gcloud auth application-default login

# 2. Set project and region
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_VERTEX_PROJECT_ID="your-gcp-project-id"

# 3. Tell Claude Code to use Vertex
export CLAUDE_CODE_USE_VERTEX=1

# 4. Optionally pin a model
export ANTHROPIC_MODEL="claude-sonnet-4-20250514"

# Add to ~/.zshrc to persist`,
    platform: 'Claude Code',
    tags: ['claude', 'gcp', 'vertex', 'credentials', 'setup'],
    category: 'claude',
  },
  {
    id: 'claude-mcp-config',
    title: 'Add MCP servers to Claude Code',
    description: 'Configure external tool servers (Playwright, Slack, GitHub, etc.) in Claude Code settings',
    command: `// File: ~/.claude/settings.json (global)
// or: .claude/settings.json (per-project)
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    }
  }
}`,
    platform: 'Claude Code',
    tags: ['claude', 'mcp', 'plugins', 'config', 'playwright'],
    category: 'claude',
  },
  {
    id: 'claude-flags',
    title: 'Useful Claude Code CLI flags',
    description: 'Flags you can pass when launching Claude Code for different workflows',
    command: `# Resume last conversation
claude --resume

# Continue most recent session (no prompt needed)
claude --continue

# Run a one-shot command (non-interactive)
claude -p "explain this error" < error.log

# Pipe output to stdout (for scripts)
claude -p "list TODOs in this repo" --output-format text

# Use a specific model
claude --model claude-sonnet-4-20250514

# Start with a system prompt
claude --system-prompt "You are a Python expert"

# Print only (no file edits, no commands)
claude -p "review this code" --allowedTools ""

# Verbose mode (see tool calls)
claude --verbose`,
    platform: 'Claude Code',
    tags: ['claude', 'cli', 'flags', 'options', 'workflow'],
    category: 'claude',
  },
  {
    id: 'claude-hooks',
    title: 'Claude Code hooks for automation',
    description: 'Run shell commands automatically before/after Claude takes actions — add to settings.json or .claude/settings.json',
    command: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'About to modify: $CLAUDE_FILE_PATH'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH 2>/dev/null || true"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "say 'Claude needs your attention'"
          }
        ]
      }
    ]
  }
}`,
    platform: 'Claude Code',
    tags: ['claude', 'hooks', 'automation', 'config', 'prettier'],
    category: 'claude',
  },
  {
    id: 'claude-claudeignore',
    title: '.claudeignore for excluding files',
    description: 'Prevent Claude from reading large, sensitive, or irrelevant files — same syntax as .gitignore',
    command: `# Dependencies
node_modules/
vendor/
venv/

# Build output
dist/
build/
.next/

# Sensitive files
.env
.env.*
*.pem
credentials.json

# Large binaries
*.wasm
*.sqlite
*.db

# Logs
*.log
logs/

# IDE / OS
.DS_Store
.idea/
.vscode/`,
    platform: 'Claude Code',
    tags: ['claude', 'ignore', 'config', 'security', 'performance'],
    category: 'claude',
  },
  {
    id: 'claude-api-curl',
    title: 'Call Claude API with curl',
    description: 'Send a message to the Claude API directly from the terminal — useful for scripting and testing',
    command: `curl https://api.anthropic.com/v1/messages \\
  -H "content-type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain this error in one sentence"}
    ]
  }' | jq '.content[0].text'`,
    platform: 'bash',
    tags: ['claude', 'api', 'curl', 'rest', 'scripting'],
    category: 'claude',
  },
  {
    id: 'claude-memory',
    title: 'Claude Code memory files explained',
    description: 'Where Claude stores persistent memory across sessions and how to manage it',
    command: `# Claude reads these automatically every session:
# 1. Project instructions (checked into repo)
cat CLAUDE.md

# 2. User-level instructions (applies to all projects)
cat ~/.claude/CLAUDE.md

# 3. Auto-memory (Claude writes here to remember things)
ls ~/.claude/projects/*/memory/

# Tell Claude to remember something:
# "Remember: always use bun instead of npm in this project"

# Tell Claude to forget:
# "Forget the rule about using bun"

# Manually edit memory files:
code ~/.claude/projects/*/memory/MEMORY.md`,
    platform: 'Claude Code',
    tags: ['claude', 'memory', 'context', 'persistence', 'config'],
    category: 'claude',
  },
  {
    id: 'claude-custom-slash',
    title: 'Create a custom slash command',
    description: 'Add reusable commands to .claude/commands/ that show up as /project:command-name in Claude Code',
    command: `# Create the commands directory
mkdir -p .claude/commands

# Create a command file (markdown with a prompt)
cat > .claude/commands/deploy-check.md << 'EOF'
Run a pre-deploy checklist:

1. Check for uncommitted changes
2. Run the test suite
3. Verify no TODO or FIXME in staged files
4. Check that .env.example matches .env keys
5. Report any issues found
EOF

# Now use it in Claude Code:
# /project:deploy-check`,
    platform: 'Claude Code',
    tags: ['claude', 'commands', 'slash', 'custom', 'workflow'],
    category: 'claude',
  },
];
