export const cost = [

  {
    id: 'check-ai-costs',
    title: 'Check Your AI Costs',
    description: 'Where to monitor usage and spending in Claude and Cursor',
    category: 'cost',
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

Full scripts and the dashboard: [releve.neorgon.com](https://releve.neorgon.com/)

\`\`\`bash
curl -O https://releve.neorgon.com/scripts/releve-mini.py
python3 releve-mini.py --days 7
\`\`\`

One number, no dependencies:

\`\`\`
Releve  ·  7 days  ·  22 sessions  ·  13,621 turns
API-equivalent   \$2,659.18
  excluded       113 turns, never billed
rates as of 2026-08-27. A counterfactual at list rates, not an invoice.
\`\`\`

For the breakdown by model, project, skill and effort, \`releve-scan.py\` writes a JSON file you drop on the dashboard. Full walkthrough: [/t/session-cost-report/](/t/session-cost-report/).

Costs are estimates. Max plan users see theoretical API-rate costs. Check your actual billing dashboard for real charges.

> [!warn] Resolve the rate per turn, not per session
> The obvious version of this script keeps the last model it saw in a file and prices the whole session with it. Sessions switch models, so that mis-prices the lot. Worse, a rate table that falls back to a "close enough" model when it finds no match will silently price a new model at an old model's rate and never tell you. Match exactly, or report the model as unpriced.

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
    description: 'Price your Claude Code transcripts at real API rates, and the six rules that decide whether the number is right',
    category: 'cost',
    tools: ['claude'],
    difficulty: 'beginner',
    content: `## What it does

Claude Code writes a JSONL transcript for every session under \`~/.claude/projects/\`, and every assistant turn in it carries a \`usage\` object: input, output, thinking, cache writes split by TTL, and cache reads. That is enough to price the work at published API rates without an account, an API key, or a network call.

[Releve](https://releve.neorgon.com/) is that, as three Python scripts and a dashboard. The scripts are standard library only.

> [!warn] This page used to teach a script that got the answer wrong
> The earlier version of this guide shipped \`claude-costs.py\`. Its rate table had no entry for the current model generation, and it fell back to the nearest substring match, so every session was priced at an older, cheaper model's rate and nothing said so. It is retired. The rules below are the ones it broke.

## Download

\`\`\`bash
# one number
curl -O https://releve.neorgon.com/scripts/releve-mini.py
python3 releve-mini.py --days 30

# the full scan, which writes the file the dashboard loads
curl -O https://releve.neorgon.com/scripts/releve-scan.py
curl -O https://releve.neorgon.com/scripts/releve_cost.py
python3 releve-scan.py --days 30 --out releve.json
\`\`\`

Requires Python 3.8+. No external dependencies. Each script prints the date of the rate card it used.

## Basic usage

\`\`\`bash
python3 releve-mini.py --days 7        # last week
python3 releve-mini.py --days 1        # today only
\`\`\`

\`\`\`
Releve  ·  7 days  ·  22 sessions  ·  13,621 turns
API-equivalent   \$2,659.18
  excluded       113 turns, never billed
rates as of 2026-08-27. A counterfactual at list rates, not an invoice.
\`\`\`

## The six rules

Reading a transcript naively is wrong in six specific ways. Each of these is a real defect the first attempt shipped.

| | Rule |
|---|---|
| 1 | Resolve the rate **per turn**, from that turn's own \`message.model\`. A session that switched models is not priced by whichever model appears last in the file. |
| 2 | **Never substitute another model's rates.** Exact id, then longest declared prefix, then *unpriced*. An unpriced model is named and counted in its own bucket, never folded into a total and never rendered as zero. |
| 3 | **Split the cache writes.** A 5-minute write bills at 1.25x base input, a 1-hour write at 2x. A turn carrying only the flat counter is an assumption, and should be flagged as one. |
| 4 | **Honour \`usage.speed\`.** Fast mode bills double, so a fast session must not be priced as standard. |
| 5 | A non-empty \`usage.iterations\` **replaces** the top-level counters rather than adding to them. Adding double-counts; ignoring it under-reports every multi-iteration turn. |
| 6 | **Count each response once, keyed on \`message.id\`.** A response is written one entry per content block and every entry repeats the same \`usage\`, so a turn that thought, spoke and called a tool appears three times and is billed once. |

Rule 6 decides whether the answer is right or roughly triple. On one real machine, 116,402 transcript entries are 52,078 responses, and counting entries reports 30.0B cache-read tokens against a true 12.9B.

Rule 3 is the one people skip, and the cache is usually most of the bill: cache reads at 0.1x base input are cheap per token and enormous in aggregate.

## The whole tree, not one directory deep

Transcripts nest three ways, and a single-level glob misses the third:

\`\`\`
~/.claude/projects/<project>/*.jsonl
~/.claude/projects/<project>/<session>/*.jsonl
~/.claude/projects/<project>/<session>/subagents/agent-*.jsonl
\`\`\`

Subagent spend lives in that last tier. \`releve-scan.py\` walks all three; \`--no-subagents\` excludes them deliberately, which is different from missing them.

## Budget alerts

\`--budget\` exits 1 when the window is over the threshold, so it works as a cron guard:

\`\`\`bash
python3 releve-scan.py --days 7 --budget 100 --quiet
\`\`\`

\`--notify\` sends a desktop notification with the total (macOS \`osascript\`, Linux \`notify-send\`).

## Automate with cron

\`\`\`bash
crontab -e
\`\`\`

\`\`\`
0 9 * * * /usr/bin/python3 /path/to/releve-scan.py --days 7 --budget 100 --notify --quiet
\`\`\`

On macOS, launchd survives reboots. Create \`~/Library/LaunchAgents/com.releve.costs.plist\`:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.releve.costs</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>/path/to/releve-scan.py</string>
    <string>--days</string>
    <string>7</string>
    <string>--budget</string>
    <string>100</string>
    <string>--notify</string>
    <string>--quiet</string>
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
launchctl load ~/Library/LaunchAgents/com.releve.costs.plist
\`\`\`

## Reading the breakdown

\`releve-scan.py --out releve.json\` writes aggregates only, no prompt or response text. Drop that file on [releve.neorgon.com](https://releve.neorgon.com/) and the same total is cut by model, project, skill, effort, git branch, main thread against subagent, service tier and Claude Code version. Nothing is uploaded: the file is read in the browser.

Add \`--anonymize\` before sharing one. It hashes project labels and drops \`cwd\`, \`gitBranch\`, \`title\` and \`slug\`.

The rate card is editable on the page, so you can reprice the whole window against a rate you have verified yourself rather than trusting the one shipped.

## Limitations

- **Not an invoice.** Every figure is tokens multiplied by a published list rate. Nothing here reads a bill or the Admin API.
- **Subscription users** see what the work would have cost through the API. The plan number is whatever you type in.
- **Bedrock and Vertex rates differ** and are left null rather than guessed. A wrong rate presented confidently is worse than a stated gap.
- Web search (\\$10 per 1,000 searches) and code execution time are not counted.
- Thinking tokens are already inside \`output_tokens\`. Report them as a label, never add them to cost.`,
  },

  {
    id: 'keep-ai-costs-low',
    title: 'Keep AI Costs Low',
    description: 'Practical strategies to reduce token usage and API spend',
    category: 'cost',
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
    id: 'prompt-caching-economics',
    title: 'Prompt Caching Economics',
    description: 'Why caching is the single biggest lever on an agentic bill, and when it stops paying',
    category: 'cost',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## The shape of the problem

An agentic loop is wasteful in one very specific way: every turn re-sends everything that came before. Your system prompt, your tool definitions, the file you read four turns ago, the whole conversation. Turn 30 might send 60,000 input tokens of which 58,000 are byte-for-byte identical to turn 29.

Prompt caching bills that repeated prefix at a fraction of the normal rate.

## The multipliers

Prices differ by provider, but the structure is consistent:

| Operation | Multiplier vs base input | Meaning |
|---|---|---|
| Cache write (5 min) | 1.25× | Storing the prefix |
| Cache write (1 hour) | 2× | Storing it for longer |
| Cache read (hit) | 0.1× | Reusing it |

A hit costs a tenth of fresh input. That is the whole game.

## When it pays off

Because a 5-minute write costs 1.25× and a hit saves 0.9×, the write pays for itself after **one** hit:

\`\`\`
write cost:  1.25 × base
saving/hit:  0.90 × base
break-even:  1.25 / 0.90 ≈ 1.4 hits
\`\`\`

For the 1-hour cache at 2×, break-even is a bit over two hits. In an agentic session you will get dozens.

> [!cost] What this is worth
> A coding session sending 45,000 input tokens per turn, 1,500 turns a month, on a model at \$2/M input:
>
> - No caching: 45,000 × 1,500 × \$2/M = **\$135/month**
> - 80% hit rate: (9,000 × \$2 + 36,000 × \$0.20) × 1,500 / 1M = **\$38/month**
>
> Same work. Same model. Same output.

## Getting hits

Caching only works on an **exact prefix match**. The rules that follow from that:

1. **Put stable content first.** System prompt, tool definitions, and long reference documents go at the top. Anything that changes per-turn goes at the bottom.
2. **Do not interpolate volatile values into the prefix.** A timestamp, a random id, or a "current time" line at the top of your system prompt invalidates the entire cache on every single call. This is the most common cause of a 0% hit rate.
3. **Watch the 5-minute window.** The cache expires on idle. A developer thinking for ten minutes between prompts pays the write cost again. That is fine. It is still cheaper than not caching.
4. **Batch your reads.** Reading six files in one turn caches them together. Reading them across six turns writes the cache six times.

## Checking your hit rate

The API reports it per call:

\`\`\`json
{
  "usage": {
    "input_tokens": 9012,
    "cache_read_input_tokens": 36104,
    "cache_creation_input_tokens": 0,
    "output_tokens": 1180
  }
}
\`\`\`

Hit rate is \`cache_read / (cache_read + input_tokens)\`. Here that is 80%.

If you see \`cache_creation\` high and \`cache_read\` near zero on every call, something in your prefix is changing. Find it. It is almost always a timestamp.

## When caching does not help

- **Every call is genuinely different.** Bulk classification over unrelated documents shares only the system prompt. Cache that, expect a modest saving, and reach for the Batch API instead.
- **Your prefix is tiny.** Below roughly a thousand tokens the bookkeeping is not worth it, and some providers set a minimum.

See also: [Keep AI Costs Low](/t/keep-ai-costs-low/) · [The Codex](/#/codex)`,
  },

  {
    id: 'batch-api-savings',
    title: 'Halve the Bill with the Batch API',
    description: 'A 50% discount on anything that does not need an answer right now',
    category: 'cost',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## The trade

Every major provider offers the same deal: submit your requests asynchronously, accept a slower turnaround, pay **half**. Input and output both.

There is no quality difference. Same models, same weights, same output. You are paying for latency, and batch says you do not need it.

## What qualifies

Ask one question: *does a human need this answer in the next few seconds?*

If no, it is batch-eligible:

- Backfilling summaries or embeddings over an existing corpus
- Bulk classification, extraction, tagging
- Running an eval suite
- Nightly report generation
- Migration work: rewriting a thousand files to a new pattern
- Anything on a cron

If yes, it is not:

- An interactive coding agent
- Anything a user is waiting on
- A tool call inside a live agentic loop

## The shape of a batch job

\`\`\`python
import anthropic

client = anthropic.Anthropic()

batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"ticket-{t['id']}",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 512,
                "system": SHARED_PROMPT,
                "messages": [{"role": "user", "content": t["body"]}],
            },
        }
        for t in tickets
    ]
)

print(batch.id, batch.processing_status)
\`\`\`

Then poll and collect:

\`\`\`python
import time

while True:
    batch = client.messages.batches.retrieve(batch.id)
    if batch.processing_status == "ended":
        break
    time.sleep(30)

for result in client.messages.batches.results(batch.id):
    handle(result.custom_id, result.result)
\`\`\`

\`custom_id\` is how you match results back to inputs. Results do not come back in order, always key on it, never on position.

## It stacks with caching

Batch and caching are independent discounts and they compose. A bulk job with a large shared system prompt gets both:

\`\`\`
base:                    $X
+ batch (50% off):       $X × 0.5
+ cached prefix reads:   the input share drops to ~10%
\`\`\`

> [!tip] Order of operations
> Do the model routing first, then batch, then caching. Routing down a tier is usually worth more than either discount, and the discounts apply to whatever tier you land on.

## The failure mode to plan for

Batches are not transactional. Individual requests can fail while the rest succeed, usually on token limits or malformed input.

\`\`\`python
for result in client.messages.batches.results(batch.id):
    if result.result.type == "succeeded":
        store(result.custom_id, result.result.message)
    else:
        retry_queue.append(result.custom_id)
\`\`\`

Always inspect the result type. A pipeline that assumes every request succeeded will silently lose rows.

See also: [Prompt Caching Economics](/t/prompt-caching-economics/) · [Choose the Right Model](/t/model-selection/)`,
  },

  {
    id: 'output-token-discipline',
    title: 'Output Discipline',
    description: 'Output costs five to six times input: and it is the part you control most directly',
    category: 'cost',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## The asymmetry

Look down any provider's price list and the same ratio appears:

| Model | Input \$/M | Output \$/M | Ratio |
|---|---|---|---|
| Claude Opus 5 | \$5 | \$25 | 5× |
| Claude Sonnet 5 | \$2 | \$10 | 5× |
| Claude Haiku 4.5 | \$1 | \$5 | 5× |
| GPT-5.6 Sol | \$5 | \$30 | 6× |
| Gemini 3.6 Flash | \$1.50 | \$7.50 | 5× |

Output is where the money goes. And unlike input, which is largely determined by your codebase and history, output is set by how you ask.

## The single highest-value habit

**Ask for the diff, not the file.**

\`\`\`
Bad:  "Update the config and show me the file."
Good: "Update the config. Show only the changed lines."
\`\`\`

On a 400-line config that is the difference between ~5,000 output tokens and ~40.

## Patterns that cut output

**Bound the format explicitly.**

\`\`\`
Answer in at most 3 bullet points. No preamble, no summary.
\`\`\`

**Ask for a decision, not an essay.**

\`\`\`
Bad:  "What are the trade-offs between these three approaches?"
Good: "Which of these three should I use? One sentence of reasoning."
\`\`\`

You can always ask for the long version. You cannot un-pay for it.

**Suppress restatement.** Models often echo your question back before answering. A line in your system prompt stops it:

\`\`\`
Do not restate the question or summarise what you are about to do.
Answer directly.
\`\`\`

**Use \`max_tokens\` as a real budget**, not as a safety limit set to the maximum. If a classification answer should be one word, \`max_tokens: 8\` both saves money and catches prompt bugs loudly.

## The counter-case

Reasoning output is not waste. When a model thinks through a hard problem, those tokens are what buys the correct answer, clamping them produces a cheap wrong answer, which is the most expensive kind.

The discipline is: **short output for mechanical work, room to think for hard work.** Not "short output always".

> [!warn] Do not optimise the wrong direction
> Cutting a frontier model's reasoning to save \$0.30 and then spending an hour debugging its rushed answer is a bad trade. Output discipline is for the high-volume, well-specified end of your workload.

## Measuring it

Pull the ratio from your own usage before you decide anything:

\`\`\`bash
# Claude Code session costs, if you use it
curl -O https://releve.neorgon.com/scripts/releve-mini.py
python3 releve-mini.py --days 30
\`\`\`

If output tokens are under 10% of input, you are already disciplined and caching is your lever. If output is 30%+ of input, start here.

See also: [Session Cost Report Script](/t/session-cost-report/) · [The Codex](/#/codex)`,
  },

  {
    id: 'subagent-cost-model',
    title: 'What Subagents Actually Cost',
    description: 'Fan-out buys you clean context and parallelism, and multiplies your token bill',
    category: 'cost',
    tools: ['claude'],
    difficulty: 'advanced',
    content: `## Why subagents cost more than they look

A subagent is a fresh context window running its own loop. That means:

1. It re-sends its own system prompt and tool definitions. No sharing with the parent.
2. It does its own exploration, often re-reading files the parent already read.
3. Its result comes back into the parent's context, which the parent then re-sends on every subsequent turn.

Three agents exploring a codebase in parallel do not cost one-third each. They cost roughly **three full explorations**, plus the summaries flowing back.

## When the arithmetic works

Subagents win when the alternative is worse, not when they are cheap.

**Good trade: context isolation.** Searching a large codebase generates thousands of tokens of dead ends. In the main conversation those stay in context and get re-billed on every subsequent turn for the rest of the session. In a subagent, they evaporate and only the answer returns.

\`\`\`
In main context:   8,000 tokens of search noise × 40 remaining turns
                   = 320,000 re-sent input tokens

In a subagent:     8,000 tokens once, 300-token summary returns
                   = 8,000 + (300 × 40) = 20,000
\`\`\`

That is a 16× saving, and it grows with session length.

**Good trade: genuine parallelism.** Four independent investigations that would otherwise run in sequence. You pay four times the tokens to save three-quarters of the wall-clock time. Whether that is worth it depends on what your time costs.

**Bad trade: sequential dependency.** If agent B needs agent A's output, you have paid for two cold starts to do one job. Keep it in one context.

**Bad trade: trivial work.** Spawning an agent to read one file costs more in setup than doing it inline.

## Routing subagents down a tier

The strongest cost move: subagents doing mechanical work do not need the frontier tier.

\`\`\`
Main agent (planning, synthesis):   frontier tier
Search / extraction subagents:      fast tier
\`\`\`

At a 5× spread between tiers, running fan-out on the fast tier while keeping the orchestrator on the frontier tier usually costs less than doing everything in one frontier context, because you also avoid the context bloat.

> [!cost] Rough model
> A frontier orchestrator plus four fast-tier subagents at 15,000 input tokens each:
>
> - All-frontier, single context: exploration noise persists and compounds
> - Split: 4 × 15,000 × \$1/M ≈ \$0.06 for the fan-out, and the main context stays lean
>
> The fan-out is nearly free. The saving is in what does *not* enter the main window.

## The rule

Reach for a subagent when the work will generate a lot of output you do not want to keep, or when independent tasks can genuinely run at once. Do not reach for one to save tokens on a single well-scoped question. That is where it costs you.

See also: [Parallel Agents Pattern](/t/parallel-agents-pattern/) · [Single Agent or Subagents?](/t/single-agent-vs-subagents/) · [Context Management](/t/context-management/)`,
  },

  {
    id: 'local-vs-api-breakeven',
    title: 'When Local Actually Beats the API',
    description: 'Running the numbers on hardware, throughput, and the capability gap',
    category: 'cost',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## The naive comparison, and why it misleads

Local inference has no per-token price, so it looks free. It is not. You have just moved the cost from a variable to a fixed one, and added two costs that do not appear on any invoice.

**The real comparison:**

| | Hosted API | Local |
|---|---|---|
| Marginal cost per call | \$0.02–0.10 | ≈\$0 |
| Up-front cost | \$0 | \$1,500–4,000 |
| Throughput | 50–150 tok/s | 8–50 tok/s |
| Capability | Frontier | Meaningfully behind on agentic work |
| Data leaves the machine | Yes | No |

## The break-even calculation

\`\`\`
months to break even = hardware cost / monthly API spend
\`\`\`

Against a typical solo-dev workload:

| Monthly API spend | \$2,400 machine pays for itself in |
|---|---|
| \$28 (fast tier) | 86 months |
| \$56 (balanced tier) | 43 months |
| \$140 (frontier tier) | 17 months |
| \$700 (heavy team use) | 3.4 months |

For one developer on a balanced-tier model, hardware never pays for itself before it is obsolete. That is the honest answer, and it is why "local to save money" is usually wrong.

Run your own numbers in [the calculator](/#/codex).

## When local genuinely wins

Cost is rarely the reason. These are:

**1. The data cannot leave.** Regulated environments, client code under NDA, personal material. No amount of API pricing changes this. It is a hard constraint, and local is the only answer.

**2. You are already offline.** Flights, poor connectivity, air-gapped networks.

**3. Volume is enormous and the task is simple.** Classifying ten million documents with an 8B model. Here the arithmetic does flip, decisively.

**4. You want to learn how the stack works.** A real reason. Just do not file it under cost savings.

**5. You already own the GPU.** If the hardware is sunk cost from gaming or ML work, the marginal cost really is close to zero and the break-even question disappears.

## The capability gap is the real cost

A 30B-class model at Q4 handles bounded, well-specified edits well. It does not handle long-horizon agentic work, multi-file refactors, ambiguous debugging, planning across a session, anywhere near a hosted frontier model.

If a local model needs three attempts where a hosted one needs one, and your time is worth anything, the free tokens were expensive.

> [!tip] The hybrid that usually wins
> Local for the private, bulk, and offline work. Hosted for the hard reasoning. This is not a compromise. It is routing, applied to a constraint that happens to be about data rather than difficulty.

## Sizing the machine

VRAM is the binding constraint. Rough arithmetic:

\`\`\`
VRAM ≈ (parameters × bits per weight / 8) + KV cache headroom
\`\`\`

| Class | Q4 VRAM | Runs on | Throughput |
|---|---|---|---|
| 8B | ~6 GB | Any 8 GB GPU | 40–80 tok/s |
| 30B | ~20 GB | RTX 4090, 36 GB Apple Silicon | 25–50 tok/s |
| 70B | ~42 GB | 2× 24 GB, 64 GB Apple Silicon | 8–20 tok/s |

See also: [Local AI Hardware Requirements](/t/local-ai-hardware/) · [Quantization Explained](/t/lmstudio-quantization/) · [The Codex](/#/codex)`,
  },

];
