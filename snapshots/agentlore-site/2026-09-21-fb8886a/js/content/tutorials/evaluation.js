export const evaluation = [

  {
    id: 'golden-task-set',
    title: 'Build a Golden Task Set',
    description: 'The 30 cases that let you answer "did that change help?" with evidence instead of vibes',
    category: 'evaluation',
    tools: ['claude', 'cursor', 'local'],
    difficulty: 'intermediate',
    content: `## The problem it solves

You tweak a system prompt. It feels better. Is it? You switch to a cheaper model. Did quality drop, or did you just get unlucky on the two examples you tried?

Without a fixed set of cases you are guessing, and guessing is how people end up paying frontier-tier prices for work a fast-tier model handled fine.

## What a golden set is

Thirty to fifty cases, each with an input and a known-good outcome. Small enough to run in a couple of minutes. Fixed, so results are comparable across runs.

\`\`\`json
[
  {
    "id": "extract-invoice-total",
    "input": "invoices/2026-03-acme.pdf",
    "expect": { "total": 4820.50, "currency": "USD" },
    "check": "exact"
  },
  {
    "id": "refactor-preserves-behaviour",
    "input": "fixtures/legacy-parser.js",
    "expect": "tests/parser.test.js passes",
    "check": "command"
  },
  {
    "id": "flags-sql-injection",
    "input": "fixtures/vulnerable-query.py",
    "expect": ["sql injection", "parameterised"],
    "check": "contains-any"
  }
]
\`\`\`

## Choosing the cases

The instinct is to pick representative examples. Do that for a third of the set, then deliberately fill the rest with the cases that actually discriminate:

- **Ones that have failed before.** Every production bug becomes a case. This is the highest-value source and it costs nothing to collect.
- **Edge cases.** Empty input, enormous input, malformed input, ambiguous input.
- **Near-misses.** Two cases that look similar but need different answers. These are what separate a model that understands from one that pattern-matches.
- **Cases where the right answer is "I don't know".** Models are bad at this and it matters enormously for agentic work. Include a few where the correct behaviour is refusing to guess.

A set of thirty easy cases that every model passes tells you nothing. You want a set where the fast tier fails a few.

## The three check types

**Exact**: deterministic output. Extraction, classification, structured data. Cheap and unambiguous.

**Command**: the output is code, and the check is whether it works.

\`\`\`bash
npm test -- parser.test.js
\`\`\`

This is the strongest check available. Where you can express the expectation as a passing command, do.

**Contains**: the output is prose and you are checking that key points appear. Weakest and the most prone to false passes, but sometimes the only option.

> [!warn] Be sceptical of model-graded evals
> Using a model to grade another model's output is convenient and correlates poorly with what you actually care about, especially near the decision boundary. Use it as a first-pass filter, never as the thing you make a model-selection decision on.

## Running it

\`\`\`bash
# Run the set against each tier and compare
for model in claude-haiku-4-5 claude-sonnet-5 claude-opus-5; do
  python3 evals/run.py --model "$model" --set golden.json --out "results-$model.json"
done

python3 evals/compare.py results-*.json
\`\`\`

What you want out the other end:

\`\`\`
                     passed   cost      p50 latency
claude-haiku-4-5      41/50   $0.11     1.2s
claude-sonnet-5       48/50   $0.34     2.1s
claude-opus-5         49/50   $0.88     3.8s
\`\`\`

That table is the entire model-selection decision, made once, with evidence. Here Sonnet is the answer: Opus buys one more case for 2.6× the price.

## The discipline

- **Freeze the set.** Changing cases and prompts at the same time tells you nothing. Change one thing per run.
- **Version it.** \`golden-v3.json\` in the repo, alongside the results.
- **Run it in CI on prompt changes.** A prompt is code. Treat a quality regression like a failing test.
- **Grow it from failures, not from imagination.** Every real-world miss becomes case 51.

See also: [Regression Prompts](/t/regression-prompts/) · [Verify What the Agent Tells You](/t/verify-agent-output/) · [Choose the Right Model](/t/model-selection/)`,
  },

  {
    id: 'regression-prompts',
    title: 'Regression Prompts',
    description: 'Catch the quality drift that happens when nothing on your side changed',
    category: 'evaluation',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## Why output changes when you didn't change anything

Your prompt is the same. Your code is the same. The output is different. Legitimate causes:

- The provider updated the model behind an alias you pinned loosely
- You upgraded a tool or SDK that alters the system prompt
- Your \`CLAUDE.md\` grew and pushed something important out of attention
- A skill's description started matching requests it shouldn't
- Temperature, or genuine sampling variance

Most teams find out from a user. A regression set finds out first.

## The set

Different from a golden set. A golden set asks *is this correct?* A regression set asks *is this the same as last time?* Fewer cases, tighter checks, higher frequency.

\`\`\`json
[
  {
    "id": "commit-message-format",
    "prompt": "Write a commit message for this diff",
    "fixture": "fixtures/small-refactor.diff",
    "assert": {
      "matches": "^(feat|fix|chore|docs|refactor)\\\\([a-z-]+\\\\): .{10,72}$",
      "max_output_tokens": 120
    }
  },
  {
    "id": "refuses-without-context",
    "prompt": "What does the deploy script do?",
    "fixture": "fixtures/empty-repo/",
    "assert": {
      "contains_any": ["could not find", "no deploy script", "does not exist"],
      "not_contains": ["typically", "usually", "generally"]
    }
  }
]
\`\`\`

That second case is worth dwelling on. It asserts the agent says *"I couldn't find it"* rather than describing what a deploy script usually does. Hedging words like "typically" are a reliable signal that the model has stopped reading your repo and started reciting. Catching that drift early is most of the value.

## Assertions that hold up

**Structural, not semantic.** Assert the format, the length, the presence of a citation, not the exact prose. Prose varies run to run without anything being wrong.

\`\`\`
Good:  output matches /^(feat|fix|chore)\\(.+\\): /
Good:  output cites at least one file:line
Good:  output is under 200 tokens
Bad:   output equals "fix(parser): handle empty input"
\`\`\`

**Negative assertions catch the most.** What should *never* appear is often sharper than what should:

\`\`\`
not_contains: ["As an AI", "I don't have access", "typically", "in general"]
\`\`\`

**Pin the model exactly.** \`claude-haiku-4-5-20251001\`, not \`claude-haiku-latest\`. An alias that silently moves is the drift you are trying to detect.

## Wiring it up

\`\`\`yaml
name: prompt-regression
on:
  pull_request:
    paths: ['prompts/**', 'CLAUDE.md', '.claude/skills/**']
  schedule:
    - cron: '0 6 * * 1'   # weekly, to catch provider-side drift

jobs:
  regress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python3 evals/regress.py --set regression.json
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
\`\`\`

Two triggers matter and they catch different things. The **path filter** catches your changes. The **schedule** catches everyone else's.

> [!tip] Run it on the cheap tier
> A regression set is about consistency, not capability. Running it against the fast tier costs almost nothing and detects prompt-side drift just as well. Save the expensive runs for the golden set.

## When it fires

Do not immediately fix the prompt. First establish which kind of change it was:

1. **Re-run.** Once is variance; three times is a change.
2. **Diff the inputs.** Did \`CLAUDE.md\` grow? Did a skill get installed? Check git.
3. **Pin harder.** If the model alias moved, that is your answer.
4. **Only then** adjust the prompt: and add the failing case to the golden set.

See also: [Build a Golden Task Set](/t/golden-task-set/) · [Write an Effective CLAUDE.md](/t/write-effective-claude-md/)`,
  },

  {
    id: 'verify-agent-output',
    title: 'Verify What the Agent Tells You',
    description: 'Cheap checks that separate "the model believes this" from "this is true"',
    category: 'evaluation',
    tools: ['claude', 'cursor', 'local'],
    difficulty: 'beginner',
    content: `## The failure this prevents

An agent reports: *"I've updated the config and all tests pass."*

Three things could be true. It did the work and verified it. It did the work and assumed the tests pass. It did something adjacent and described what it intended.

The output looks identical in all three cases. Confidence is not evidence, and fluent text is not a receipt.

## Make the agent produce receipts

The cheapest intervention is a standing instruction. In \`CLAUDE.md\`:

\`\`\`markdown
## Reporting rules

- Never claim a test passes without pasting the command and its output.
- Cite file:line for every claim about this codebase.
- If you could not verify something, say "unverified" explicitly.
- "Should work" is not an acceptable report. Run it.
\`\`\`

This costs a few dozen tokens per request and changes the failure mode from silent to visible.

## The four checks, cheapest first

**1. Does it cite?** A claim about your code should carry \`file:line\`. If it doesn't, the model is probably recalling a pattern rather than reading your repo. Ask for the citation. The answer often changes.

**2. Does the command actually run?** For anything the agent claims works:

\`\`\`bash
git diff --stat          # did it change what it said it changed?
npm test                 # do the tests actually pass?
\`\`\`

Ten seconds. Catches the majority of confident-but-wrong reports.

**3. Does the negative case hold?** Agents are good at making a test pass and bad at noticing they made it pass trivially.

\`\`\`bash
# Break the thing on purpose. The test must fail.
git stash && npm test    # expect failure
git stash pop && npm test # expect pass
\`\`\`

A test that passes both ways is testing nothing. This catches the single most common form of fake work.

**4. Is it internally consistent?** Ask the same question a different way in a fresh session. Confident answers that change between phrasings were never grounded.

## Automate the check into the loop

The strongest version is not checking afterwards. It is making the agent unable to finish without checking. That is what a validator in a skill does:

\`\`\`markdown
After generating the migration, run scripts/validate-migration.sh.
If it exits non-zero, fix it and run again.
Do not report success until it exits zero. Paste the final output.
\`\`\`

See [The Armory](/#/armory) for the full pattern.

> [!warn] Watch for hedging vocabulary
> "Typically", "usually", "generally", "should", "in most cases", when these appear in an answer about *your specific codebase*, the model has stopped reading and started generalising. It is the most reliable tell there is. Ask it to cite the file.

## Where to spend the effort

You cannot verify everything, and you should not try. Scale the check to the blast radius:

| Change | Check |
|---|---|
| A comment, a doc | Read it |
| A function | Run the tests |
| A migration, a config, anything in CI | Run it, roll it back, run it again |
| Anything touching auth, payments, or deletion | Read every line yourself |

The agent is a fast, confident colleague who does not know when it is wrong. Treat its output like a pull request from someone talented and new.

See also: [Build a Golden Task Set](/t/golden-task-set/) · [The Armory](/#/armory)`,
  },

];
