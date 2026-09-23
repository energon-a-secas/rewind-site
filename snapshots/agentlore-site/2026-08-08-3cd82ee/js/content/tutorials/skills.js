export const skills = [

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

];
