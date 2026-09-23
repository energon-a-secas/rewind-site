export const architecture = [

  {
    id: 'single-agent-vs-subagents',
    title: 'Single Agent or Subagents?',
    description: 'The one question that decides it: and it is not "is this task big?"',
    category: 'architecture',
    tools: ['claude'],
    difficulty: 'intermediate',
    content: `## The question

Not *"is this task large?"*: large tasks often belong in one context. The question is:

> **Will this work produce a lot of output I do not want to keep?**

If yes, isolate it. If no, keep it inline.

## Why that is the right question

Everything in your context window is re-sent on every subsequent turn. A search that generates 8,000 tokens of dead ends does not cost you 8,000 tokens. It costs you 8,000 tokens multiplied by every remaining turn in the session.

A subagent is a disposable context. It does the messy work, and only the conclusion comes back.

\`\`\`
Inline:     8,000 tokens of noise, re-sent across 40 remaining turns
Subagent:   8,000 tokens once, a 300-token answer returns
\`\`\`

## The decision table

| Situation | Choice | Why |
|---|---|---|
| Searching for where something lives | Subagent | Enormous noise-to-signal ratio |
| Implementing a change you already scoped | Single agent | You need the surrounding context |
| Four independent investigations | Subagents, parallel | Genuinely concurrent |
| Step B needs step A's output | Single agent | Two cold starts for one job |
| Reviewing a large diff | Subagent per file, if very large | Each review is independent |
| Debugging one failing test | Single agent | The context *is* the work |
| Reading one file | Single agent | Setup costs more than the task |

## The cost of a cold start

A subagent shares nothing with its parent. Fresh system prompt, fresh tool definitions, no knowledge of the conversation. Everything it needs must be in the prompt you give it.

That makes the brief the whole skill:

\`\`\`
Bad:   "Look into the auth thing."

Good:  "Find every place a session token is created or validated.
        Search src/ and services/. Return a list of file:line with a
        one-line description of each. Do not propose changes.
        If you find nothing, say so: do not infer where it might be."
\`\`\`

The good version specifies scope, output shape, and, critically, what to do on failure. A vague brief produces an agent that explores broadly, burns tokens, and returns something unusable.

## Parallel fan-out

Independent work runs at once. The constraint is genuine independence, if you find yourself wanting agent 2 to know what agent 1 found, they were never parallel.

\`\`\`
Orchestrator (frontier tier)
├── Agent A: map the data layer        ─┐
├── Agent B: map the API surface        ├─ concurrent, independent
├── Agent C: find all the auth checks   │
└── Agent D: inventory the test suite  ─┘
        ↓
Orchestrator synthesises the four reports
\`\`\`

Route the fan-out down a tier. Searching and extracting is mechanical work. The fast tier does it fine at a fifth of the price, and the orchestrator that has to reason across four reports is where the frontier tier earns its keep.

> [!warn] The most common mistake
> Spawning subagents to "go faster" on work that is actually sequential. You pay for N cold starts, get N partial answers built on incomplete context, and then spend the orchestrator's turn reconciling contradictions. Sequential work belongs in one context.

## Signals you should have isolated

- The conversation is slowing down and answers reference things from far back
- You are compacting mid-task
- Half the visible context is tool output you have already extracted the answer from
- Cost per turn is climbing through a session that has not got harder

See also: [Parallel Agents Pattern](/t/parallel-agents-pattern/) · [What Subagents Actually Cost](/t/subagent-cost-model/) · [Agent Pipelines](/t/agent-pipeline-patterns/)`,
  },

  {
    id: 'agent-pipeline-patterns',
    title: 'Agent Pipelines',
    description: 'Four shapes for composing agent steps, and when each one is the right one',
    category: 'architecture',
    tools: ['claude', 'local'],
    difficulty: 'advanced',
    content: `## Four shapes

Most multi-step agent work is one of these. Picking the wrong one is where systems get slow, expensive, or unreliable.

### 1. Chain: each step feeds the next

\`\`\`
extract → normalise → validate → write
\`\`\`

Use when each step genuinely depends on the last. Simple, debuggable, no coordination.

The failure mode is **error propagation**: a bad extraction produces a confidently normalised, validated, written wrong answer. Put the cheapest possible check between steps.

\`\`\`python
data = extract(doc)
assert data.get("total") is not None, "extraction produced no total"
clean = normalise(data)
\`\`\`

### 2. Fan-out / fan-in: independent work, then synthesis

\`\`\`
        ┌── analyse security  ──┐
plan ───┼── analyse perf      ──┼── synthesise
        └── analyse tests     ──┘
\`\`\`

Use when subtasks are genuinely independent. The synthesis step is the one that needs capability, run the branches on a cheap tier and the join on a good one.

The failure mode is **contradictory branches**. Two agents reach opposite conclusions from different slices. The synthesiser must be told to surface disagreement rather than average it:

\`\`\`
If the reports conflict, say so explicitly and state which one has
stronger evidence. Do not merge contradictory claims into a single
confident answer.
\`\`\`

### 3. Loop with a critic: generate, check, revise

\`\`\`
generate → validate ──fail──> revise ──┐
              │                        │
             pass                      └──> (max 3 attempts)
              ↓
            done
\`\`\`

The most reliable shape for anything that must be correct. The critic should be a **program**, not a model, wherever possible. A test suite, a linter, a schema validator. A deterministic critic cannot be talked around.

\`\`\`python
for attempt in range(3):
    code = generate(spec, feedback=last_error)
    ok, last_error = run_tests(code)
    if ok:
        return code
raise PipelineError(f"failed after 3 attempts: {last_error}")
\`\`\`

Always bound the loop. An unbounded revise cycle is how a \$0.40 task becomes a \$40 one.

### 4. Router: classify first, then dispatch

\`\`\`
                ┌── simple  → fast tier
request ── classify ── standard → balanced tier
                └── hard    → frontier tier
\`\`\`

The highest-leverage cost pattern there is. A fast-tier classifier costs almost nothing and routes most traffic away from the expensive tier.

\`\`\`python
tier = classify(request)          # haiku: ~$0.0002
model = TIERS[tier]
return run(model, request)
\`\`\`

The failure mode is **misrouting downward**. A hard request sent to the fast tier returns a confident wrong answer. Build in escalation:

\`\`\`python
result = run(TIERS[tier], request)
if result.low_confidence or validation_failed(result):
    result = run(TIERS["hard"], request)   # escalate, don't retry the same tier
\`\`\`

## Choosing

| If… | Use |
|---|---|
| Steps depend on each other | Chain |
| Steps are independent | Fan-out / fan-in |
| Correctness is checkable by a program | Loop with a critic |
| Requests vary a lot in difficulty | Router |
| Two of the above apply | Compose them: router in front of a critic loop is very common |

## Rules that apply to all four

**Bound everything.** Max attempts, max tokens, max wall-clock. An agent pipeline without limits will eventually find a way to spend all your money on one request.

**Log the boundaries.** Store the input and output of every step. When the pipeline produces something wrong, you need to know which step went wrong, and reconstructing that from the final output is impossible.

**Fail loudly.** A step that cannot do its job should stop the pipeline, not pass through a plausible default. Silent degradation in an agent pipeline produces output that looks fine and is not.

**Make the critic deterministic where you can.** A test suite, a schema, an exit code. Model-as-critic is a fallback, not a first choice.

See also: [Single Agent or Subagents?](/t/single-agent-vs-subagents/) · [Chain Commands with Agents](/t/chain-commands-agents/) · [Build a Golden Task Set](/t/golden-task-set/)`,
  },

];
