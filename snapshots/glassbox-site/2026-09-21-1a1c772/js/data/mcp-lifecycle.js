// ── How a tool becomes callable: the stdio connection lifecycle ─
// The question this answers is the one a reader has to Google: I put a
// server in .mcp.json: how does the *model* find out it exists? Four
// sequential steps, each one changing exactly one thing about what is
// true, and the model only enters at the last one.
//
// Worked on a real published server (crystaldba/postgres-mcp under
// docker) rather than a placeholder, because the parts that confuse
// people are all in the concrete config: why `-i`, why the value of
// DATABASE_URI never reaches the model, where the tool names come from.
//
// Pure data. No DOM. Rendered by js/labs/mcp-lifecycle.js.
//
// Escaping: `lead`, `config.notes[].body`, `steps[].headline`,
// `steps[].note`, `steps[].fail`, `tools.source` and `coda` render RAW;
// inline <code>/<em>/<strong> and data-tip spans (keys must exist in
// js/tips.js). Everything else is plain text via escHtml: labels, tags,
// `state` values and the tool names especially, since their neighbours
// are raw.
//
// Sources: the four steps and the message shapes are the MCP
// specification's own lifecycle (initialize → initialized notification →
// tools/list); the tool names are the ones crystaldba/postgres-mcp
// publishes, checked Aug 2026. The `mcp__<server>__<tool>` prefix is
// Claude Code's naming, not the protocol's, and the page says so.

export const MCP_LIFE = {
  lead: 'Four steps, in this order, before you type anything. Watch the right-hand column: each step changes exactly one line of it, and <strong>the model does not appear until the fourth</strong>.',

  config: {
    code: `{
  "mcpServers": {
    "postgres": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "DATABASE_URI",
        "crystaldba/postgres-mcp",
        "--access-mode=restricted"
      ],
      "env": { "DATABASE_URI": "\${DATABASE_URI}" }
    }
  }
}`,
    notes: [
      { tag: 'command + args are a process', body: 'There is no URL and nothing to install into the host. <code>docker</code> is the program, <code>args</code> are its arguments, and the container is the MCP server; the host just knows how to start it.' },
      { tag: 'The flag is the server’s, not MCP’s', body: 'Everything after the image name is postgres-mcp’s own CLI. <code>--access-mode=restricted</code> keeps it read-only with a statement timeout; <code>unrestricted</code> lets the agent write. MCP does not define either: a server’s safety switches are the server’s.' },
      { tag: 'The secret is passed by name', body: '<code>-e DATABASE_URI</code> names the variable without a value, so docker takes it from the environment the host built out of the <code>env</code> block. The connection string reaches the container and <em>never</em> enters model context.' },
    ],
  },

  // One row per thing that is either true or not yet true. `idle` is the
  // value before any step has run; a step supplies the new value.
  stateRows: [
    { id: 'proc', label: 'Subprocess', idle: 'not started' },
    { id: 'session', label: 'Session', idle: 'none' },
    { id: 'registry', label: 'Host tool registry', idle: 'empty' },
    { id: 'model', label: 'What the model can call', idle: 'nothing from this server' },
  ],

  steps: [
    {
      n: 1,
      id: 'spawn',
      label: 'Spawn the process',
      actor: 'host',
      headline: 'The host reads the file and launches the entry as a local subprocess. Two pipes become the transport.',
      msgs: [
        {
          dir: 'host',
          label: 'what the host runs',
          lang: 'bash',
          code: `docker run -i --rm -e DATABASE_URI \\
  crystaldba/postgres-mcp --access-mode=restricted

# Nothing listens on a port. The pipes ARE the channel:
#   host --> container stdin    requests
#   host <-- container stdout   responses
#           container stderr    logs, ignored by the protocol`,
        },
      ],
      note: '<code>-i</code> is load-bearing: it keeps the container’s stdin open, and that pipe is how every request arrives. <code>--rm</code> says the container is disposable: one per connected client, gone when the host exits. Nothing has been negotiated yet; the host has a running program and two file descriptors.',
      fail: 'A wrong <code>command</code>, a missing runtime, an image that was never pulled: all fail here, and from the model’s side the failure is <em>silent</em>. The host marks the server as failed; the model is never told a postgres server was supposed to exist, so it improvises an integration exactly like the left-hand column at the top of this lab.',
      state: { proc: 'running · stdio pipes open' },
    },

    {
      n: 2,
      id: 'handshake',
      label: 'Handshake',
      actor: 'both',
      headline: 'Three JSON-RPC 2.0 messages agree a protocol version and declare what each side can do. This is what makes the connection a session.',
      msgs: [
        {
          dir: 'host',
          label: 'host → server',
          lang: 'json',
          code: `{"jsonrpc": "2.0", "id": 1, "method": "initialize",
 "params": {
   "protocolVersion": "2025-06-18",
   "capabilities": { "roots": {"listChanged": true} },
   "clientInfo": {"name": "claude-code", "version": "2.1.0"}
 }}`,
        },
        {
          dir: 'server',
          label: 'server → host',
          lang: 'json',
          code: `{"jsonrpc": "2.0", "id": 1,
 "result": {
   "protocolVersion": "2025-06-18",
   "capabilities": { "tools": {"listChanged": true} },
   "serverInfo": {"name": "postgres-mcp", "version": "0.3.0"}
 }}`,
        },
        {
          dir: 'host',
          label: 'host → server  ·  no id, nothing answers it',
          lang: 'json',
          code: '{"jsonrpc": "2.0", "method": "notifications/initialized"}',
        },
      ],
      note: 'The client proposes a <code>protocolVersion</code>; the server answers with the version it will actually use, and the client either accepts it or disconnects. Capabilities are declared once, here. This server says it has <code>tools</code>, which is how the host knows to ask for them next and knows not to ask for prompts. The third message carries no <code>id</code>, so it is a notification: an announcement, not a question.',
      fail: 'A version the server cannot speak comes back as <code>-32602 Unsupported protocol version</code>, listing what it does support. And this is where a stray <code>print()</code> in a hand-written server kills the connection: the debug line lands on <span data-tip="stdio_transport">stdout</span> between these messages, the client reads malformed JSON-RPC, and the server dies before a single tool is discovered.',
      state: { session: 'live · protocol 2025-06-18' },
    },

    {
      n: 3,
      id: 'list',
      label: 'Discover the tools',
      actor: 'both',
      headline: 'One request, and the server describes itself: exact names, human-readable descriptions, and a JSON Schema per tool.',
      msgs: [
        {
          dir: 'host',
          label: 'host → server',
          lang: 'json',
          code: '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}',
        },
        {
          dir: 'server',
          label: 'server → host  ·  truncated: 1 of 9 tools',
          lang: 'json',
          code: `{"jsonrpc": "2.0", "id": 2, "result": {"tools": [
  {
    "name": "explain_query",
    "description": "Explain a statement's execution plan.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "sql": {"type": "string"},
        "analyze": {"type": "boolean", "default": false}
      },
      "required": ["sql"]
    }
  },
  ... 8 more, same shape
]}}`,
        },
      ],
      note: 'Nothing about this server is compiled into the client. Every name and schema the host holds came out of that answer. Which is why the <code>description</code> is not documentation: it is the only thing the model reads when deciding between <code>execute_sql</code> and <code>explain_query</code>. The <code>listChanged: true</code> the server declared in step 2 means it may later push <code>notifications/tools/list_changed</code>, and the host re-asks.',
      fail: 'A server that answers with sixty tools has just made every request in the session more expensive and tool selection less reliable: the toolset size problem from the SDK lab, arriving from a server somebody else wrote. Scoping it is the host’s job: <span data-tip="allowed_tools">allowed_tools</span> can whitelist a subset of what was discovered.',
      state: { registry: '9 tools, with schemas' },
    },

    {
      n: 4,
      id: 'inject',
      label: 'Inject into context',
      actor: 'host',
      headline: 'The host copies the discovered definitions into the tools array of an ordinary API request. This is the first time the model is involved at all.',
      msgs: [
        {
          dir: 'host',
          label: 'host → model',
          lang: 'py',
          code: `client.messages.create(
    model="claude-sonnet-4-6",
    system=SYSTEM_PROMPT,
    tools=[
        {"name": "mcp__postgres__explain_query",
         "description": "Explain a SQL statement's ...",
         "input_schema": {...}},     # verbatim from tools/list
        # ... the other 8
    ],
    messages=[{"role": "user",
               "content": "Why is the orders page slow?"}],
)`,
        },
      ],
      note: 'The model never speaks to the server and has no idea a container exists. It receives the same <span data-tip="messages_array">tools array</span> you hand-wrote at SDK level 1, and discovery is only what filled it in. So the model’s side of MCP is nothing new: it emits a <span data-tip="tool_use">tool_use</span> block naming one of these tools, and the host routes it back down the pipe. Note the cost shape too: discovery happens once, but the definitions ride in <em>every</em> request for the rest of the session.',
      fail: 'The <code>mcp__&lt;server&gt;__&lt;tool&gt;</code> prefix is Claude Code’s naming, not the protocol’s, and it is what keeps two servers from colliding. Wire up a second database server that also exposes <code>execute_sql</code> and without namespacing they would land in one flat array as the same tool.',
      state: { model: '9 tools, prefixed mcp__postgres__' },
    },
  ],

  // Shown from step 3 onward: the whole answer, not the truncated block.
  tools: {
    label: 'The nine names the server actually returned',
    names: [
      'list_schemas', 'list_objects', 'get_object_details', 'execute_sql',
      'explain_query', 'analyze_workload_indexes', 'analyze_query_indexes',
      'analyze_db_health', 'get_top_queries',
    ],
    source: 'As published by <code>crystaldba/postgres-mcp</code>, checked Aug 2026. Worth reading once: a server’s tool list <em>is</em> its interface, and it is the thing you evaluate before wiring somebody else’s server into your agent.',
  },

  coda: 'From here the loop is the ordinary one, and the next section walks a single call through it. The lifecycle above is the part that runs before your first message and is invisible when it works, which is why "Claude cannot see my MCP server" is almost always step 1 or step 2, not a prompting problem.',
};
