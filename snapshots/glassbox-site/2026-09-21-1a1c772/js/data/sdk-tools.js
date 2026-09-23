// ── Defining a custom tool (SDK lab) ─────────────────────────
// The step the six levels skipped: at L1 the `tools` array is hand-written
// JSON, and at L2 `allowed_tools` names tools that already exist. This is
// where a tool comes from: an ordinary async function plus one line that
// registers its name, its docstring and its types as a schema.
//
// The decorator is taught as a decorator, not as boilerplate to copy: the @
// line is a function that takes your function and returns a registered one,
// which is why the body below it is unchanged and still callable as itself.
// TypeScript has no decorator here at all; `tool()` is a plain helper call,
// and saying so is half the lesson about what the @ is doing in Python.
//
// Pure data. No DOM. Rendered by js/labs/sdk-tools.js.
//
// Escaping contract: `body`, `note`, `means` and gotcha `body` render RAW
// (inline <code>/<em>/<strong> and data-tip spans, whose keys must exist in
// js/tips.js). Every other field is plain text via escHtml, and all `code`
// goes through highlightCode.

export const TOOL_DEF = {
  lead: 'At L1 the tool was a JSON blob you maintained by hand, next to a Python function that had to keep matching it. The SDK closes that gap: write the function, mark it, and the schema the model reads is generated from what you already wrote.',

  // ── The decorator, as a concept ─────────────────────────────
  decorator: {
    title: 'What that @ line actually does',
    body: 'A <strong>decorator</strong> is a function that takes another function, adds behaviour or metadata, and returns the modified version, without editing the original body. <code>@tool(...)</code> above a definition is just Python for "pass this function through <code>tool(...)</code> and bind the name to whatever comes back". So <code>@tool</code> reads your async function\'s name, description and parameter types and registers them as a schema the model can read; your function keeps doing exactly what it did.',
    steps: [
      { n: 1, label: 'You write a function', body: 'An ordinary <code>async def</code>. It takes a dict of arguments and returns a result. Nothing about it is model-aware.' },
      { n: 2, label: 'The decorator registers it', body: 'Name, description and parameter types become a JSON Schema, and the function is wrapped so the SDK can invoke it when the model asks for that name.' },
      { n: 3, label: 'The model sees a schema', body: 'Not your code, never your code. It sees a name, a description and the argument shape, and decides from those whether this is the tool for the turn.' },
    ],
    plain: {
      label: 'Before: a function the model cannot see',
      lang: 'py',
      code: `async def lookup_order(args):
    order = await db.orders.find(args["order_id"])
    return {"content": [{"type": "text", "text": json.dumps(order)}]}`,
      note: 'Callable from your own code and invisible to the model: nothing here states a name, a description, or that <code>order_id</code> is an integer.',
    },
    wrapped: {
      label: 'After: the same function, registered',
      lang: 'py',
      code: `@tool(
    "lookup_order",
    "Look up an order by numeric order_id. Returns status, items, "
    "total and return_eligible. Use AFTER get_customer has verified "
    "identity. Not for profile lookups - that is get_customer.",
    {"order_id": int},
)
async def lookup_order(args):
    order = await db.orders.find(args["order_id"])
    return {"content": [{"type": "text", "text": json.dumps(order)}]}`,
      note: 'The body is byte-for-byte the same. The decorator adds the metadata around it, and <code>lookup_order</code> is still an ordinary function you can call and unit-test directly.',
    },
    schema: {
      label: 'What Claude receives',
      lang: 'json',
      code: `{
  "name": "mcp__support__lookup_order",
  "description": "Look up an order by numeric order_id. Returns status, items, total and return_eligible. Use AFTER get_customer has verified identity. Not for profile lookups - that is get_customer.",
  "input_schema": {
    "type": "object",
    "properties": {"order_id": {"type": "integer"}},
    "required": ["order_id"]
  }
}`,
      note: 'The same shape you hand-wrote at <strong>L1</strong>, and that is the point of the decorator: one definition instead of a function and a JSON copy of its signature drifting apart.',
    },
    tsNote: 'TypeScript has no decorator in this API. <code>tool()</code> is a helper you <em>call</em>, and the zod schema you pass it is both the runtime validation and the static type of the handler\'s argument. Same three steps, no <code>@</code>: which is a good way to see that the <code>@</code> was never magic. It is a function call with nicer placement.',
  },

  // ── The two implementations ────────────────────────────────
  impls: [
    {
      id: 'py',
      label: 'Python',
      file: 'tools.py',
      lang: 'py',
      code: `from claude_agent_sdk import (
    tool, create_sdk_mcp_server, ClaudeAgentOptions,
)

@tool(
    "lookup_order",
    "Look up an order by numeric order_id. Returns status, items, "
    "total and return_eligible. Use AFTER get_customer has verified "
    "identity.",
    {"order_id": int},
)
async def lookup_order(args):
    order = await db.orders.find(args["order_id"])
    if order is None:
        return {
            "content": [{"type": "text",
                         "text": f"No order {args['order_id']}"}],
            "is_error": True,          # a failure the agent can act on
        }
    return {"content": [{"type": "text", "text": json.dumps(order)}]}

# An in-process MCP server: no subprocess, no transport to configure.
server = create_sdk_mcp_server(
    name="support",
    version="1.0.0",
    tools=[lookup_order],
)

options = ClaudeAgentOptions(
    mcp_servers={"support": server},
    allowed_tools=["mcp__support__lookup_order"],
)`,
      notes: [
        { tag: 'schema', body: 'The third argument is the input shape. A dict of <code>{"name": type}</code> is the short form; pass a full JSON Schema when you need enums, ranges or nested objects.' },
        { tag: 'required', body: 'Every key in that dict is <strong>required</strong>. An optional parameter is one you leave out of the schema and read with <code>args.get("note")</code>. There is no "optional" marker in the short form.' },
        { tag: 'failure', body: '<code>is_error: True</code> with a message the agent can read. Raising instead gives it nothing to recover from, the same contract as the <span data-tip="is_error">MCP error rules</span>.' },
      ],
    },
    {
      id: 'ts',
      label: 'TypeScript',
      file: 'tools.ts',
      lang: 'js',   // highlighter dialect; the file name says TypeScript
      code: `import {
  tool, createSdkMcpServer, type Options,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const lookupOrder = tool(
  "lookup_order",
  "Look up an order by numeric order_id. Returns status, items, " +
    "total and return_eligible. Use AFTER get_customer has verified " +
    "identity.",
  {
    order_id: z.number().int().describe("Numeric order id"),
    fields: z.enum(["summary", "full"]).default("summary"),
  },
  async ({ order_id, fields }) => {          // args are typed from the schema
    const order = await db.orders.find(order_id);
    if (!order) {
      return {
        content: [{ type: "text", text: \`No order \${order_id}\` }],
        isError: true,
      };
    }
    return { content: [{ type: "text", text: JSON.stringify(order) }] };
  },
);

const server = createSdkMcpServer({
  name: "support",
  version: "1.0.0",
  tools: [lookupOrder],
});

const options: Options = {
  mcpServers: { support: server },
  allowedTools: ["mcp__support__lookup_order"],
};`,
      notes: [
        { tag: 'no @', body: 'A helper call, not a decorator, and the handler is the fourth argument. The zod object is the schema <em>and</em> the type: <code>{ order_id, fields }</code> is inferred, so a renamed field is a compile error rather than a runtime <code>KeyError</code>.' },
        { tag: 'optional', body: 'What Python\'s short form cannot express, zod can: <code>.optional()</code>, <code>.default("summary")</code>, <code>.describe()</code>. And <code>.describe()</code> lands in the schema the model reads, so use it for the units and formats the description would otherwise have to spell out.' },
        { tag: 'failure', body: '<code>isError: true</code>, camelCase here and <code>is_error</code> in Python. Both mean the same thing to the loop: the call failed, and this text is what the agent gets to reason about.' },
      ],
    },
  ],

  // ── Naming: the part that silently does nothing when wrong ──
  naming: {
    lead: 'A tool defined this way is reached through an MCP name, not the bare function name, and <code>allowed_tools</code> has to match it exactly.',
    rows: [
      { name: 'mcp__support__lookup_order', means: '<code>mcp__</code> + the server name you passed to <code>create_sdk_mcp_server</code> + the tool name. This is what the model calls and what <code data-tip="allowed_tools">allowed_tools</code> must list.' },
      { name: 'mcp__support__*', means: 'Every tool on that server. Convenient while building, and the opposite of the L2 lesson once you know which four tools the agent needs.' },
      { name: 'lookup_order', means: 'Does <strong>not</strong> match. The bare name is a built-in-tool name; listing it leaves the agent with no order lookup at all, and nothing errors: the tool is simply absent from what the model was offered.' },
    ],
  },

  // ── Gotchas ────────────────────────────────────────────────
  gotchas: [
    {
      title: 'In-process, not a subprocess',
      body: 'This server runs <em>inside</em> your application: no <code>docker run</code>, no stdio pipe, no process to supervise, and it shares your app\'s memory and connection pool. The <span data-tip="mcp">MCP</span> lab\'s transport cards are about servers somebody <em>else</em> operates; this is the same protocol with the transport removed.',
    },
    {
      title: 'The description is still the router',
      body: 'Generating the schema from your code does not make selection smarter. Two tools whose descriptions both say "gets order information" stay ambiguous, decorator or not. Say what it returns, the input format, and when to use it <em>instead of</em> the neighbouring tool.',
    },
    {
      title: 'Annotations are hints, not enforcement',
      body: '<code>readOnlyHint</code>, <code>destructiveHint</code>, <code>idempotentHint</code> and <code>openWorldHint</code> describe a tool to the host so it can decide what to confirm. Nothing in the protocol stops a tool marked read-only from writing. When the consequence is money, identity or safety, the guarantee is a <span data-tip="hook">PreToolUse hook</span> at <strong>L3</strong>, not a flag.',
    },
    {
      title: 'A tool is a bad place for a decision the code can make',
      body: 'Every tool you register costs schema tokens on every request and one more option for the model to choose wrongly. If the answer is a lookup your own code could do before the call, do it there and pass the result in the prompt.',
    },
  ],
};
