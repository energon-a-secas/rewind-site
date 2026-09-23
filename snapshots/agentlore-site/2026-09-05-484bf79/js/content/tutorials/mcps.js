export const mcps = [

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

Source: [modelcontextprotocol.io](https://modelcontextprotocol.io). The full MCP specification and server registry.`,
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
