// ── MCP authoring data ───────────────────────────────────────
// data/mcp.js answers "why use a server". This file answers the four
// questions that come next: what MCP *is*, how a server is reached
// (local stdio vs remote HTTP), what you actually write to create a
// tool, and what a tool call looks like on the wire.
//
// The split is the same one as sdk.js / sdk-config.js: using vs
// authoring. Keep flow/comparison material in mcp.js.
//
// Escaping: fields that render RAW (inline <code>/<em>/<strong> and
// data-tip spans) are MCP_DEF.parts[].body, MCP_DEF.problem.*,
// MCP_DEF.scope, TRANSPORTS[].tagline/.caveats[].body,
// TRANSPORT_VARIANTS[].body, MCP_BUILD.lead, MCP_BUILD.contrast[].can,
// MCP_BUILD.impls[].notes[].body, MCP_BUILD.versionNote,
// MCP_BUILD.verify[].body, TOOL_ANATOMY.stages[].note and
// TOOL_ANATOMY.outputs[].note. Everything else is plain text and goes
// through escHtml. `title`, `label`, `when` and `what` especially,
// since their neighbours are raw.
//
// Code samples were checked against the current SDK docs (Aug 2026):
// the Python class is `MCPServer` (it was `FastMCP`), and the
// TypeScript package is `@modelcontextprotocol/server` since v2. The
// version note in MCP_BUILD says so on the page rather than pretending
// an import path is stable.

export const MCP_DEF = {
  oneLine: 'An open protocol for connecting an LLM application to an external system: one integration, written once, usable by every MCP client.',
  parts: [
    {
      term: 'Host and client',
      body: 'The app you are already using (Claude Code, Claude Desktop, an <span data-tip="sdk_allowed_tools">SDK</span> agent) runs an MCP <em>client</em>. It speaks the protocol so your integration does not have to know who is calling.',
    },
    {
      term: 'Server',
      body: 'One process per integration: Jira, Postgres, a filesystem. It exposes <strong>tools</strong>, <strong>resources</strong> and <strong>prompts</strong>. It is a program you run, not a document you publish.',
    },
    {
      term: 'Messages',
      body: 'Both sides exchange JSON-RPC 2.0 messages over a transport: <span data-tip="stdio_transport">stdio</span> for a local server, <span data-tip="streamable_http">Streamable HTTP</span> for a remote one.',
    },
    {
      term: 'Discovery',
      body: 'On connect the client asks the server what it has (<code>tools/list</code>) and gets names, descriptions and <span data-tip="input_schema">input_schema</span>s back. Nothing about your tools is hardcoded into the client.',
    },
  ],
  problem: {
    beforeLabel: 'Without a protocol',
    before: 'Every app × every system. Six apps and ten systems is <strong>sixty</strong> bespoke integrations, each one re-guessing the same auth and pagination.',
    afterLabel: 'With MCP',
    after: 'Every app speaks MCP, every system ships one server: <strong>sixteen</strong>. The Jira server you wire into Claude Code works unchanged in any other MCP client.',
  },
  scope: 'What a Foundations question turns on is this much: the three server primitives, and the local-versus-remote decision. The protocol defines more than that (client-side sampling, roots, elicitation) and it is worth knowing those exist so a stray term does not read as a trick.',
};

export const MCP_TRANSPORTS = [
  {
    id: 'stdio',
    label: 'Local',
    title: 'stdio',
    tip: 'stdio_transport',
    tone: 'good',
    tagline: 'The client launches your server as a subprocess and talks to it over standard input and output. No port, no URL, nothing on the network.',
    when: 'Anything that touches this machine: the repo you cloned, a local database, your files. Also the default while you are still writing the server.',
    lang: 'json',
    // Lines stay under ~48 columns: these two cards are half-width, and a
    // code block a reader has to scroll sideways is a code block unread.
    code: `{
  "mcpServers": {
    "orders": {
      "command": "uv",
      "args": [
        "run", "--directory",
        "/Users/you/src/orders-mcp",
        "server.py"
      ],
      "env": {
        "ORDERS_TOKEN": "\${ORDERS_TOKEN}"
      }
    }
  }
}`,
    codeNote: 'A server you cloned. For a published one, skip the clone entirely: <code>"command": "uvx", "args": ["orders-mcp"]</code>, or <code>npx -y</code> for a Node server.',
    caveats: [
      { title: 'stdout is the protocol', body: 'One stray <code>print()</code> and the client reads your debug line as a malformed JSON-RPC message. <strong>Log to stderr.</strong> This is the single most common way a hand-written stdio server fails, and it fails at the handshake, before any tool runs.' },
      { title: 'The runtime has to be there', body: 'Right Python or Node, dependencies installed, on <em>every</em> machine that uses it. <code>uvx</code> and <code>npx -y</code> fetch on demand and are why a published server needs no clone.' },
      { title: 'It runs as you', body: 'Your files, your credentials, your privileges: a local server sits <em>inside</em> the trust boundary. Read the code you cloned; "it is only local" is not a security property.' },
      { title: 'One process per client', body: 'Two editors connected means two copies of your server, each with its own memory. Anything that must be shared belongs behind a database, not in a module-level variable.' },
      { title: 'Secrets stay outside the model', body: 'The <code>env</code> block is expanded by the client into the subprocess. The value reaches your code and never enters model context, unlike a token pasted into a script the model wrote.' },
    ],
  },
  {
    id: 'http',
    label: 'Remote',
    title: 'Streamable HTTP',
    tip: 'streamable_http',
    tone: 'warn',
    tagline: 'One deployed server, many users. The client POSTs JSON-RPC to a URL and the server answers with a single response, or streams events back over the same connection.',
    when: 'A shared internal service, a vendor-hosted integration, anything you want to fix once instead of asking thirty people to re-pull a repo.',
    lang: 'json',
    code: `{
  "mcpServers": {
    "orders": {
      "type": "http",
      "url": "https://orders.mcp.internal/mcp",
      "headers": {
        "Authorization": "Bearer \${ORDERS_TOKEN}"
      }
    }
  }
}`,
    codeNote: 'Same file, different shape: a <code>url</code> instead of a <code>command</code>. There is no subprocess to inherit your environment, so credentials travel as headers.',
    caveats: [
      { title: 'Auth becomes a real problem', body: 'A bearer token is the floor; the spec’s answer is OAuth 2.1 with your server as the resource server. Nothing here is inherited from your shell, and the endpoint is reachable by whoever finds it.' },
      { title: 'The data leaves the machine', body: 'Whatever the tool reads now travels to a host somebody operates. That is the compliance conversation the stdio version never starts, and often the whole reason an exam option prefers local.' },
      { title: 'You inherited its uptime', body: 'Your agent is down when that host is down, and every call pays network latency the subprocess did not. Retries and timeouts are now your problem, which is exactly what the structured error contract below is for.' },
      { title: 'Sessions are explicit', body: 'The server may return an <code>Mcp-Session-Id</code> on initialize, and the client echoes it on later requests. Stateless deployments skip it, which is a deliberate server-side choice rather than a default.' },
      { title: 'Bind and validate', body: 'A server listening on your own machine should bind <code>127.0.0.1</code> and validate the <code>Origin</code> header. Without it a web page you visit can drive your local server through DNS rebinding.' },
    ],
  },
];

// The neighbours of the real answer. Each one shows up in options.
export const TRANSPORT_VARIANTS = [
  {
    label: 'HTTP+SSE',
    verdict: 'deprecated',
    body: 'The <em>previous</em> remote transport, superseded by Streamable HTTP in the <strong>2025-03-26</strong> spec revision. Servers still accept it for backwards compatibility, so it is not fictional, but an option naming SSE for a <em>new</em> remote server is dated rather than merely different.',
  },
  {
    label: 'WebSocket',
    verdict: 'not a transport',
    body: 'Not an MCP transport at all. It sounds like the modern streaming answer, which is precisely why it is written into distractors.',
  },
  {
    label: 'A local server over HTTP',
    verdict: 'legal, rarely right',
    body: 'Allowed, and occasionally useful when several clients should share one process. It also puts a listening port on your laptop, so the bind-and-validate rule applies. <code>stdio</code> stays the default for local.',
  },
  {
    label: 'A custom transport',
    verdict: 'allowed',
    body: 'The spec permits one as long as it carries JSON-RPC messages intact. Nothing on the exam turns on it; knowing the two named transports does.',
  },
];

export const MCP_BUILD = {
  lead: 'Here is the question the quickstarts skip. An MCP tool is <strong>code you run</strong>, not a file you publish. Claude never reads your server’s source. It reads the <em>schema</em> the server reports on connect, then asks the server to run the function.',
  contrast: [
    {
      thing: 'llms.txt',
      what: 'A text file at your site’s root describing the site for a model to read.',
      can: 'Be <em>read</em>, if something puts it in context. It is prose: no arguments, no return value, nothing to call. Useful documentation, <strong>not a tool</strong>.',
      verdict: 'no',
    },
    {
      thing: 'An OpenAPI spec',
      what: 'A machine-readable description of an HTTP API.',
      can: 'Let the model write a correct request, which still means writing and running code every session, the improvised flow above. Good <em>input</em> for generating a server; not a substitute for one.',
      verdict: 'partly',
    },
    {
      thing: 'An MCP server',
      what: 'A running process exposing named functions with typed inputs.',
      can: 'Be discovered as <code>get_order</code> and <em>called</em> with <code>{"order_id": "B-2041"}</code>, returning a structured result. This is the one that creates a tool.',
      verdict: 'yes',
    },
  ],
  impls: [
    {
      id: 'py',
      label: 'Python',
      lang: 'py',
      file: 'server.py',
      // Wrapped to ~54 columns on purpose: this block sits in a column
      // beside its notes, and a sample you scroll sideways is a sample
      // nobody reads. Same rule for the TypeScript one below.
      code: `from mcp.server import MCPServer  # was FastMCP

mcp = MCPServer("orders")

@mcp.tool()
def get_order(order_id: str) -> dict:
    """Look up one order by id.

    Returns status, total and ship date -
    nothing else, on purpose.
    """
    row = db.fetch_one(
        "select * from orders where id = %s", order_id
    )
    if row is None:
        raise ValueError(f"No order {order_id}")
    return {
        "status": row.status,
        "total": row.total,
        "ship_date": row.ship_date,
    }

# stdio by default. To deploy it remotely:
#   mcp.run(transport="streamable-http")
if __name__ == "__main__":
    mcp.run()`,
      notes: [
        { tag: 'The name', body: 'The function name <em>is</em> the tool name the model calls. <code>get_order</code>, not <code>handler2</code>.' },
        { tag: 'The docstring', body: 'The description the model reads when deciding <em>whether</em> to call this. It is prompt engineering, not a comment: a vague one gets the tool fired at the wrong moments.' },
        { tag: 'The type hints', body: 'They become <span data-tip="input_schema">input_schema</span>. <code>order_id: str</code> is a required string; a default makes it optional; a <code>Literal["open","closed"]</code> becomes an enum, which is how you stop free-text nonsense arriving as an argument.' },
        { tag: 'The return value', body: 'Serialised into the <code>tool_result</code>. Returning the three fields that matter instead of the 62-field row is the entire reason the defined-MCP meter above stays short.' },
        { tag: 'The raise', body: 'An exception comes back as a failed result flagged <span data-tip="is_error">isError</span>. Give it the shape from the error contract below and the coordinator can retry on its own.' },
      ],
    },
    {
      id: 'ts',
      label: 'TypeScript',
      lang: 'js',
      file: 'server.ts',
      code: `import { McpServer }
  from '@modelcontextprotocol/server';
import { serveStdio }
  from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

serveStdio(() => {
  const server = new McpServer({
    name: 'orders',
    version: '1.0.0',
  });

  server.registerTool('get_order', {
    description:
      'Look up one order by id. Returns ' +
      'status, total and ship date.',
    inputSchema: z.object({
      order_id: z.string().describe(
        'Order id as printed on the invoice'
      ),
    }),
  }, async ({ order_id }) => {
    const row = await lookup(order_id);
    if (!row) {
      return {
        content: [{ type: 'text',
          text: \`No order \${order_id}\` }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text',
        text: JSON.stringify(row) }],
    };
  });

  return server;
});`,
      notes: [
        { tag: 'Same three parts', body: 'A name, a schema, a function, in a different language. Nothing about the protocol changed.' },
        { tag: 'The schema is explicit', body: 'What Python inferred from type hints, you write as a <code>zod</code> object. <code>.describe()</code> per field is what the model reads about that argument, and the SDK validates incoming calls against it before your handler runs.' },
        { tag: 'The error is a return', body: 'Instead of raising, hand back <code>isError: true</code> with content. Same contract, different idiom.' },
      ],
    },
  ],
  versionNote: 'Import paths move: the Python class was <code>FastMCP</code> before it was <code>MCPServer</code>, and the TypeScript SDK split into <code>@modelcontextprotocol/server</code> at v2. Check the README of the version you installed. The <em>shape</em> (a name, a schema, a function, a transport) has not changed, and that shape is the part an exam question tests.',
  wireLead: 'Then wire it up and confirm the client actually sees it. A server that starts fine and reports no tools is the normal first outcome.',
  wireLang: 'bash',
  wireCode: `# Register it with Claude Code (writes the .mcp.json entry for you).
claude mcp add orders -- uv run --directory ~/src/orders-mcp server.py
claude mcp list          # connected, or failed?

# In session: which servers, which tools, what auth state.
/mcp

# Or drive the server directly, with no model in the way.
npx @modelcontextprotocol/inspector uv run server.py`,
  verify: [
    { title: 'Inspect before you integrate', body: 'The Inspector calls your tools without a model involved. If a call misbehaves there, the problem is your server; if it works there and not in the client, the problem is the config or the transport.' },
    { title: 'Read your own schema', body: 'What <code>tools/list</code> reports is the whole of what the model knows. If the description is empty or a field is untyped, that is what Claude is guessing from.' },
    { title: 'Prefer an existing server', body: 'For a standard integration (GitHub, Postgres, Slack) a community server already exists and has already met the pagination and auth edge cases. Write one when the system is <em>yours</em>.' },
  ],
};

export const TOOL_ANATOMY = {
  lead: 'Four messages, and the same four whatever SDK you use. This is the exchange the flows above compress into one line each.',
  stages: [
    {
      n: 1,
      label: 'The definition',
      who: 'you → the model',
      lang: 'json',
      code: `{
  "name": "get_order",
  "description": "Look up one order by id. Returns status, total and ship date.",
  "input_schema": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "Order id as printed on the invoice, e.g. B-2041"
      }
    },
    "required": ["order_id"]
  }
}`,
      note: 'What an MCP server reports at connect, and what you pass in <code>tools</code> when you call the API yourself. The model never sees your implementation: the two descriptions and <span data-tip="input_schema">input_schema</span> are the <em>entire</em> contract. Mark only genuinely required fields <code>required</code>: a schema that demands a value the caller cannot know gets one invented.',
    },
    {
      n: 2,
      label: 'The request',
      who: 'the model → you',
      lang: 'json',
      code: `{
  "stop_reason": "tool_use",
  "content": [
    { "type": "text", "text": "Let me look that order up." },
    { "type": "tool_use",
      "id": "toolu_01A9F2",
      "name": "get_order",
      "input": { "order_id": "B-2041" } }
  ]
}`,
      note: 'Claude does not run anything; it <em>asks</em>. Your loop reads <span data-tip="stop_reason">stop_reason</span>, sees <code>tool_use</code>, and executes the call itself. Keep the <code>id</code>: the result has to quote it back.',
    },
    {
      n: 3,
      label: 'The result',
      who: 'you → the model',
      lang: 'json',
      code: `{
  "role": "user",
  "content": [
    { "type": "tool_result",
      "tool_use_id": "toolu_01A9F2",
      "content": [{ "type": "text",
        "text": "{\\"status\\":\\"shipped\\",\\"total\\":129.99,\\"ship_date\\":\\"2026-08-11\\"}" }] }
  ]
}`,
      note: 'Results come back inside a <code>user</code>-role message. There is no <code>role: "tool"</code>, and an option offering one is wrong on the format alone. <code>tool_use_id</code> matches the request. This is also the turn where you decide how much of the payload earns its tokens.',
    },
    {
      n: 4,
      label: 'The next turn',
      who: 'the model → you',
      lang: 'json',
      code: `{
  "stop_reason": "end_turn",
  "content": [
    { "type": "text",
      "text": "Order B-2041 shipped on 11 Aug for $129.99." }
  ]
}`,
      note: 'The loop continues until <span data-tip="end_turn">end_turn</span>. Claude may instead ask for another tool, which is one more pass of stages 2 and 3, and why the loop is a loop rather than a call.',
    },
  ],
  outputsLead: 'Both of these produce schema-valid JSON, and they are different surfaces. Neither is "ask nicely and set temperature to 0".',
  outputs: [
    {
      label: 'Force a tool call',
      sub: 'constrains a tool_use',
      lang: 'json',
      // Both output samples are half-width cards: keep every line
      // under ~46 columns so nothing clips.
      code: `{
  "tool_choice": {
    "type": "tool", "name": "extract_invoice"
  },
  "tools": [{
    "name": "extract_invoice",
    "input_schema": {
      "type": "object",
      "properties": {
        "invoice_no": { "type": "string" },
        "total": { "type": "number" },
        "currency": {
          "type": "string",
          "enum": ["USD", "EUR", "CLP"]
        }
      },
      "required": ["invoice_no", "total"]
    }
  }]
}`,
      note: 'Pin <span data-tip="tool_choice">tool_choice</span> to one tool and the reply <em>is</em> a <code>tool_use</code> block whose <code>input</code> validates against your schema. The oldest reliable extraction trick, and still the right answer when a stem says <em>guaranteed</em> structured output from a tool. <code>tool_choice: "any"</code> is the looser form: some tool, model’s pick.',
    },
    {
      label: 'Constrain the answer',
      sub: 'constrains the final response',
      lang: 'json',
      code: `{
  "output_config": {
    "format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": ["shipped", "pending",
                     "returned"]
          },
          "total": { "type": "number" }
        },
        "required": ["status", "total"]
      }
    }
  }
}`,
      note: '<span data-tip="structured_outputs">Structured Outputs</span> shape the model’s <em>final response</em> rather than a tool call, which removes the parse-and-retry loop that "reply in JSON" needs. Same JSON Schema vocabulary, different place in the request; mixing the two up is the distinction a question can be built on.',
    },
  ],
};
