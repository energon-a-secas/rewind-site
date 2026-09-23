// ── TypeScript variants for the SDK levels ───────────────────
// data/sdk.js is the canon and stays Python, the language the
// guide and the exam use. This is an overlay keyed by level id, so a
// level's Python sample and its TS twin can never drift into two
// different lessons: the levels list stays one array.
//
// Only the levels where the API genuinely differs get a variant:
//
//   l0, l1  same fields, different type ceremony (worth seeing)
//   l2, l4  the SDK spells agent definitions differently in TS, which
//             is the one place the two languages are not a transliteration
//   l3      no variant: hooks are shown in the guide's Python form, and
//             a TS twin would teach a decorator that does not exist there
//   l5      no variant: a CLI flag and a session option, not language code
//
// `divergence` is the badge-and-date mechanism required by CLAUDE.md:
// where the current SDK docs name something differently from the guide,
// say so on the page, dated, instead of silently picking a side.
//
// Escaping contract: `note` and `divergence.body` render RAW (inline
// <code>/<em>/<strong>); `code` goes through highlightCode; every other
// field is plain text via escHtml.

export const SDK_LANGS = [
  { id: 'py', label: 'Python' },
  { id: 'ts', label: 'TypeScript' },
];

export const SDK_TS = {
  l0: {
    lang: 'js',   // highlighter dialect; the file name says TypeScript
    code: `import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const resp = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: "You are a customer support agent.",
  messages: [
    { role: "user", content: "Where is order 1234?" },
  ],
});

// content is a union of block types - narrow before reading .text
const first = resp.content[0];
console.log(first.type === "text" ? first.text : "");`,
    note: 'The same five fields, in the same order, with the same snake_case names. The wire format is the wire format. The one real difference is at the end: <code>content</code> is a <em>discriminated union</em> of block types, so you narrow on <code>type</code> before touching <code>.text</code>. That is the type system telling you something true about the API that the Python version lets you forget until a tool-use block arrives at <code>content[0]</code>.',
  },

  l1: {
    lang: 'js',   // highlighter dialect; the file name says TypeScript
    code: `const TOOLS: Anthropic.Tool[] = [{
  name: "lookup_order",
  description:
    "Look up an order by numeric order_id. Returns status, items, " +
    "total and return_eligible. Use AFTER get_customer has verified " +
    "identity. Not for profile lookups - that is get_customer.",
  input_schema: {
    type: "object",
    properties: { order_id: { type: "integer" } },
    required: ["order_id"],
  },
}];

const messages: Anthropic.MessageParam[] = [
  { role: "user", content: "Where is order 1234?" },
];

while (true) {
  const resp = await client.messages.create({
    model: "claude-sonnet-4-6", max_tokens: 1024,
    system: SYSTEM, tools: TOOLS,
    tool_choice: { type: "auto" },
    messages,
  });
  messages.push({ role: "assistant", content: resp.content });

  if (resp.stop_reason === "end_turn") break;   // the only signal

  if (resp.stop_reason === "tool_use") {
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of resp.content) {
      if (block.type !== "tool_use") continue;
      results.push({
        type: "tool_result",
        tool_use_id: block.id,        // must echo the request id
        content: await runTool(block.name, block.input),
      });
    }
    // results go back as a USER turn, not a "tool" role
    messages.push({ role: "user", content: results });
  }
}`,
    note: 'Structurally identical, and two things get safer for free: <code>stop_reason</code> is a string union, so a mistyped <code>"end-turn"</code> fails to compile instead of looping forever, and <code>ToolResultBlockParam</code> will not let you omit <code>tool_use_id</code>. What the compiler still cannot catch is the mistake this level exists to teach: <em>where</em> the results go. <code>{ role: "tool" }</code> is not in the union either, but building the loop around assistant text instead of <code>stop_reason</code> type-checks perfectly.',
  },

  l2: {
    lang: 'js',   // highlighter dialect; the file name says TypeScript
    code: `import { query, type Options } from "@anthropic-ai/claude-agent-sdk";

const options: Options = {
  agents: {
    customer_support: {
      description: "Handles returns, billing disputes and order issues",
      prompt:
        "You are a customer support agent. Verify the customer with " +
        "get_customer before any order operation. Escalate when policy " +
        "does not cover the request.",
      tools: [
        "get_customer",
        "lookup_order",
        "process_refund",
        "escalate_to_human",
      ],
      model: "sonnet",        // optional: per-agent model choice
    },
  },
};

for await (const msg of query({ prompt: userText, options })) {
  handle(msg);
}`,
    note: 'The four ideas are unchanged (an identity, a description a coordinator can route on, a standing brief, and a bounded toolset) and the last one is still the load-bearing part: an agent physically cannot call a tool outside the list.',
    divergence: {
      badge: 'Guide vs current docs',
      body: 'The guide constructs an <code>AgentDefinition(name=…, description=…, system_prompt=…, allowed_tools=…)</code>; the TypeScript SDK declares the same thing as an entry in <code>options.agents</code>, where the key <em>is</em> the name and the fields are <code>description</code>, <code>prompt</code> and <code>tools</code>. Same four ideas, different spelling. <strong>Read exam stems in the guide\'s vocabulary</strong>: <code data-tip="allowed_tools">allowed_tools</code> is what a question will call the whitelist. Checked against the SDK docs, Aug 2026.',
    },
  },

  l4: {
    lang: 'js',   // highlighter dialect; the file name says TypeScript
    code: `// You do not call Task yourself - the coordinator issues it as a tool
// call. What you control is the brief it hands over, and a subagent
// inherits NO history, so the slice, the prior work and the output
// shape all have to be in there.
const COORDINATOR_PROMPT = \`
Delegate each slice with Task, one call per slice, in a single turn
so they run in parallel. Every brief must state:
  - the slice, and what it must NOT cover (another agent owns that)
  - the prior findings to build on, pasted in full
  - the exact return shape:
      [{"claim": ..., "source_url": ..., "published": "YYYY-MM-DD"}]
Return JSON only, no prose. Reconcile conflicts yourself; never let
two subagents talk to each other.\`;

const options: Options = {
  agents: {
    research_coordinator: {
      description: "Decomposes a topic, delegates, aggregates, reconciles",
      prompt: COORDINATOR_PROMPT,
      tools: ["Task"],        // without this it cannot delegate at all
    },
    web_search: {
      description: "Searches the web, returns structured findings",
      prompt: SEARCH_PROMPT,
      tools: ["web_search"],  // least privilege: nothing else
      model: "haiku",         // cheap worker, expensive coordinator
    },
  },
};`,
    note: 'The parallelism rule survives the language change intact: several <code data-tip="task_tool">Task</code> calls in <strong>one</strong> coordinator turn run concurrently, and <code>model: "haiku"</code> per agent is where a fan-out stops being expensive. Note what moved. In Python the brief looked like a function argument you fill in; here it is plainly what it always was, <em>instructions to a coordinator</em> about what a delegation must contain.',
    divergence: {
      badge: 'Guide vs current docs',
      body: 'Two names to hold at once. The guide (and every exam stem) calls the delegation tool <code>Task</code> and the whitelist <code>allowed_tools</code>; current SDK docs use <code>tools</code> on an <code>agents</code> entry, and the built-in delegation tool has also been documented as <code>Agent</code>. <strong>Answer in the guide\'s terms</strong>: the concept being tested is that a coordinator with no delegation tool in its list cannot delegate at all, whatever the tool is called. Checked against the SDK docs, Aug 2026.',
    },
  },
};

// Shown in place of the toggle on the two levels that have no TS twin, so
// the absence reads as a decision rather than as unfinished work.
export const SDK_TS_ABSENT = {
  l3: 'Python only here, on purpose. The hook API in the guide is a decorator, and the decorator <em>is</em> the lesson at this level. See <strong>Defining a tool</strong> below for what an <code>@</code> actually does. The enforcement point is the same in any language: the hook fires 100% of the time, the prompt does not.',
  l5: 'No language variant: this is a CLI flag and a session option, not code you write. <code>claude --resume &lt;name&gt;</code> is the same command whatever your app is written in, and <code data-tip="fork_session">fork_session</code> is a boolean on the request.',
};
