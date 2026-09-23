/**
 * The Armory — grounded skills.
 *
 * Content is markdown-lite, rendered by the same renderer the tutorials use.
 * Note the escaping rules for these template literals: backticks are \` and a
 * literal dollar-brace is \${.
 */

export const ARMORY_SECTIONS = [
  {
    id: 'anatomy',
    title: 'Anatomy of a skill',
    tagline: 'A folder, a file, and two lines of frontmatter.',
    content: `A skill is a directory containing a \`SKILL.md\`. That is the whole format.

\`\`\`
.claude/skills/release-notes/
├── SKILL.md            # always loaded: frontmatter + short instructions
├── references/
│   └── house-style.md  # read only when the skill actually runs
└── scripts/
    └── check-links.sh  # run by the skill, not by the model
\`\`\`

## The frontmatter contract

\`\`\`markdown
---
name: release-notes
description: Draft release notes from merged PRs. Use when the user asks for release notes, a changelog entry, or a summary of what shipped.
---

Read references/house-style.md before writing anything.

1. Collect merged PRs since the last tag with \\\`gh pr list --state merged\\\`.
2. Group them under Added / Changed / Fixed.
3. Run scripts/check-links.sh and fix anything it reports.
4. Never invent a PR number. If you cannot find one, leave it out.
\`\`\`

Two fields matter and they do different jobs:

- **\`name\`** is the identifier. Lowercase, hyphenated, matches the folder.
- **\`description\`** is the *trigger surface*. It is the only part the agent sees when deciding whether this skill is relevant. Everything else loads afterwards.

## Why the body should be short

The frontmatter of every installed skill sits in context all the time. The body loads when the skill fires. Bundled files load only when the instructions say to read them.

That is three tiers, and it is the entire performance argument for skills: a 40-line \`SKILL.md\` that points at a 2,000-line reference costs you 40 lines until the moment the reference is genuinely needed.

> [!tip] Rule of thumb
> If \`SKILL.md\` is over ~100 lines, the excess probably belongs in a file under \`references/\` that the instructions tell the agent to read.`,
  },

  {
    id: 'grounding',
    title: 'Grounding: the part most skills skip',
    tagline: 'A skill that restates what the model already half-knows is worse than no skill.',
    content: `Most published skills are a summary of something the model was already trained on. They add tokens, they add a maintenance burden, and when the underlying facts move they are confidently wrong.

A **grounded** skill is one whose output traces back to something checkable — a file you control, a command's real output, or a validator that fails loudly.

## Four ways to ground a skill

### 1. Bundle the source of truth

Put the authoritative facts in a file and instruct the agent to read it. The model's recollection is then irrelevant.

\`\`\`markdown
Read references/api-conventions.md before proposing an endpoint.
Every rule in that file is binding. If the file contradicts your
prior assumptions, the file wins.
\`\`\`

That last sentence matters. Without it, a model that "knows better" will quietly average your conventions with its training data.

### 2. Ground in live command output

Better than a bundled file when the truth changes: have the skill go look.

\`\`\`markdown
Do not guess which services exist. Run:

    kubectl get deploy -o name

Work only from what that returns. If the command fails, stop and
report the failure — do not substitute an assumed service list.
\`\`\`

### 3. Ship a validator

The strongest form of grounding. The skill produces something, then proves it.

\`\`\`markdown
After generating the migration, run scripts/validate-migration.sh.
If it exits non-zero, fix the migration and run it again.
Do not report success until it exits zero.
\`\`\`

A validator converts "the model believes this is right" into "this passed a check". Those are very different claims.

### 4. Require citation

For anything research-shaped, force the answer to carry its evidence.

\`\`\`markdown
Every claim about the codebase must cite file:line.
If you cannot cite it, say you could not find it — do not infer it.
\`\`\`

## The test

Before you ship a skill, ask: **would a competent agent without this skill produce a materially different answer?**

If the answer is no, you have written documentation for a model that already read the docs. Delete it. If the answer is yes, ask *why* — and whatever that reason is, that is the part worth grounding.

> [!warn] The staleness trap
> Any specific version number, price, or API signature you hardcode in a skill will eventually be wrong, and the skill will assert it with full confidence. Either point at the live source, or stamp the file with a verification date and treat it as expiring.`,
  },

  {
    id: 'discovery',
    title: 'Making it fire',
    tagline: 'A skill that never triggers is a skill that does not exist.',
    content: `The most common failure is not a badly-written skill. It is a well-written skill that never loads, because its description does not match how anyone actually phrases the request.

## Write the description for matching, not for marketing

The description is matched against the user's intent. Write it as *situations*, not as a feature list.

| Weak | Strong |
|---|---|
| \`Helps with database work\` | \`Write and review PostgreSQL migrations. Use when adding a column, changing a schema, or reviewing a migration file.\` |
| \`Code review assistant\` | \`Review a diff for correctness and security. Use before opening a PR, when asked to review changes, or after a large refactor.\` |
| \`Documentation tool\` | \`Generate API reference docs from source. Use when asked to document an endpoint, module, or public function.\` |

The pattern in the strong column: **what it does, then the trigger phrases someone would actually type.** Include the synonyms. "Release notes" and "changelog" are the same request from two people.

## Naming

The folder name, the \`name\` field, and how you refer to it in conversation should all match. \`release-notes\`, not \`ReleaseNotesGenerator\` in a folder called \`rn-tool\`.

## Where each tool looks

Locations differ per tool and change over time, so this is the one place to check the tool's own docs rather than trust a table here. As a starting point, Claude Code reads project skills from \`.claude/skills/\` and personal skills from \`~/.claude/skills/\`.

For the current per-tool breakdown, see [Skill Discovery: Claude vs Cursor](/t/skill-discovery-differences/).

## Testing that it fires

Do not assume. Open a fresh session and phrase the request three different ways — the way you'd say it, the way a teammate would, and the way someone unfamiliar with the codebase would. If it fails to load on any of them, the description is missing a trigger phrase.`,
  },

  {
    id: 'choosing',
    title: 'Skill, command, subagent, or MCP?',
    tagline: 'Four mechanisms that look interchangeable and are not.',
    content: `These get conflated constantly. They solve different problems and the wrong choice is a maintenance tax you pay forever.

| Mechanism | Triggered by | Use it when | Costs you |
|---|---|---|---|
| **Skill** | The agent, on relevance | Expertise should apply automatically whenever the situation arises | Description tokens, always resident |
| **Slash command** | You, explicitly | You want a repeatable action on demand, with arguments | Nothing until invoked |
| **Subagent** | The agent, for a bounded job | A task needs its own context window and shouldn't pollute the main one | A separate context, and a cold start |
| **MCP server** | The agent, via tools | The agent needs to *reach* a system it otherwise can't | A process, auth, and a tool surface |
| **CLAUDE.md** | Always | Facts that are true for every task in this repo | Tokens on every single request |

## Choosing in one pass

- Does the agent need **new information from outside**? → MCP server. Nothing else can fetch what it cannot reach.
- Do you want to **run something on demand with arguments**? → Slash command.
- Should the behaviour apply **without being asked**, whenever the situation comes up? → Skill.
- Is it a **big, self-contained job** that would flood the main conversation? → Subagent.
- Is it **true for every task in the repo**? → CLAUDE.md. But keep it short: this one is charged on every request.

## The most common mistake

Putting in \`CLAUDE.md\` what belongs in a skill. \`CLAUDE.md\` is loaded on every request in the project — a 400-line one is a tax on every trivial question. Detail that only matters for *some* tasks belongs in a skill, where it costs a description line until it's needed.

> [!cost] Do the arithmetic
> A 400-line \`CLAUDE.md\` is roughly 5,000 tokens on every request. At 1,500 requests a month that is 7.5M input tokens — real money at any tier, and it buys nothing on the requests that didn't need it.`,
  },

  {
    id: 'antipatterns',
    title: 'Anti-patterns',
    tagline: 'The five ways skills go wrong.',
    content: `### 1. The encyclopedia

A skill that explains what REST is, or how git branching works. The model knows. You have added tokens and a maintenance burden for nothing.

**Fix:** delete it, or narrow it to the part that is specific to *you* — your endpoint conventions, your branching rules.

### 2. The vague description

\`description: Helps with testing\`. It never fires, or it fires on everything.

**Fix:** name the situations and the phrases. See [Making it fire](#discovery).

### 3. The hardcoded fact

A pinned version number, a price, an API signature written into the body. Six months later the skill asserts it confidently and wrongly.

**Fix:** point at the live source, or stamp a verification date and treat the file as expiring.

### 4. The monolith

A 900-line \`SKILL.md\` covering everything about the deployment pipeline. It loads in full every time it fires, most of it irrelevant to the current task.

**Fix:** short stub, \`references/\` folder, explicit instructions on which file to read for which situation.

### 5. The unverifiable output

The skill produces a migration, a config, a manifest — and nothing checks it. You have automated the production of plausible-looking artifacts.

**Fix:** ship a validator and instruct the agent to run it and to keep going until it passes.

---

## A quick audit

Run this against any skill you already have:

1. Would a good agent without it answer differently? If no — delete it.
2. Does its description contain the words someone would actually type? If no — rewrite it.
3. Does anything in it go stale? If yes — is it dated or pointed at a live source?
4. Is \`SKILL.md\` under ~100 lines? If no — move detail to \`references/\`.
5. Can its output be checked automatically? If yes — is it?`,
  },
];

export const SKILL_TEMPLATES = [
  {
    id: 'grounded-review',
    name: 'Grounded code review',
    blurb: 'Reviews a diff against your written standards, not the model\'s general taste.',
    grounds: 'A bundled standards file that explicitly outranks the model\'s priors.',
    files: [
      {
        path: 'SKILL.md',
        code: `---
name: grounded-review
description: Review a diff against this repo's engineering standards. Use before opening a PR, when asked to review changes, or after a large refactor.
---

Read references/standards.md first. Those rules are binding and outrank
your general preferences. If a rule contradicts what you would normally
advise, follow the rule.

1. Get the diff: git diff --merge-base origin/main
2. Check it against every rule in references/standards.md.
3. Report findings as: file:line — rule violated — suggested fix.
4. Cite file:line for every finding. If you cannot cite it, do not report it.
5. Say plainly when you find nothing. Do not invent findings to seem useful.`,
      },
      {
        path: 'references/standards.md',
        code: `# Engineering standards

## Errors
- Never swallow an exception without logging the cause.
- Fail fast on invalid input; do not substitute a default.

## Naming
- Booleans read as assertions: isReady, hasAccess.
- No abbreviations except id, url, db.

## Tests
- Every bug fix carries a regression test naming the bug.`,
      },
    ],
  },
  {
    id: 'release-notes',
    name: 'Release notes',
    blurb: 'Drafts notes from real merged PRs and refuses to invent them.',
    grounds: 'Live \`gh\` output, plus a hard instruction against fabricating PR numbers.',
    files: [
      {
        path: 'SKILL.md',
        code: `---
name: release-notes
description: Draft release notes or a changelog entry from merged PRs. Use when asked for release notes, a changelog, or a summary of what shipped.
---

Read references/house-style.md before writing.

1. Find the last tag:  git describe --tags --abbrev=0
2. List what merged since:
   gh pr list --state merged --search "merged:>=<date of that tag>" --json number,title,author
3. Group under Added / Changed / Fixed / Internal.
4. One line per entry, past tense, user-facing language.
5. Never invent a PR number or an author. If the command returns nothing,
   say so and stop.`,
      },
      {
        path: 'references/house-style.md',
        code: `# Release note style

- Lead with what changed for the reader, not the implementation.
  Good: "Search now matches partial words."
  Bad:  "Refactored the tokenizer in SearchIndex."
- No marketing adjectives. No "we are excited to".
- Breaking changes get their own section at the top, with the migration step.`,
      },
    ],
  },
  {
    id: 'validated-migration',
    name: 'Validated migration',
    blurb: 'Writes a database migration, then proves it applies and rolls back.',
    grounds: 'A validator script the skill must run to exit zero before reporting success.',
    files: [
      {
        path: 'SKILL.md',
        code: `---
name: validated-migration
description: Write and verify a database migration. Use when adding or changing a column, table, index, or constraint.
---

Read references/migration-rules.md before writing SQL.

1. Write the migration and its down-migration. Both are required.
2. Run scripts/validate-migration.sh
3. If it exits non-zero, fix the migration and run it again.
4. Do not report success until it exits zero. Paste the final output.

Never write a destructive change (DROP, or a NOT NULL without a default
on a populated table) without stating the downtime implication first.`,
      },
      {
        path: 'scripts/validate-migration.sh',
        code: `#!/usr/bin/env bash
set -euo pipefail

echo "→ applying migration"
npm run migrate:up

echo "→ rolling back"
npm run migrate:down

echo "→ re-applying"
npm run migrate:up

echo "✓ migration applies and rolls back cleanly"`,
      },
    ],
  },
  {
    id: 'incident-triage',
    name: 'Incident triage',
    blurb: 'Reads live system state instead of guessing at architecture.',
    grounds: 'Real command output. The skill is forbidden from assuming what exists.',
    files: [
      {
        path: 'SKILL.md',
        code: `---
name: incident-triage
description: Triage a production incident. Use when something is down, erroring, or degraded, or when asked what is wrong with an environment.
---

Do not assume which services exist. Establish the facts first:

1. kubectl get pods -A --field-selector=status.phase!=Running
2. kubectl top nodes
3. Recent deploys: kubectl rollout history deploy/<name>

Work only from what those return. If a command fails, report the failure
and stop — do not substitute an assumed topology.

Then, and only then, form a hypothesis. State it as a hypothesis, name the
single observation that would disprove it, and check that observation next.

Never restart or scale anything. Recommend the action; the human runs it.`,
      },
    ],
  },
];
