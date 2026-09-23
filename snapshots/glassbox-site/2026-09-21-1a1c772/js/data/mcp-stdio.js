// ── Inside the stdio transport ───────────────────────────────
// The transport cards in data/mcp-authoring.js answer "local or
// remote". data/mcp-lifecycle.js answers "how does the model find out
// a tool exists". Neither answers the question underneath both: what
// *is* stdio, as an architecture. Three operating-system streams, a
// byte pipe that is not a message pipe, and a parent process that owns
// a child. The glossary entry is a reminder of the answer; this is the
// answer.
//
// Pure data. No DOM. Rendered by js/labs/mcp-stdio.js.
//
// Escaping: `lead`, `framing.body`, `streams[].carries/.who/.rule/.breaks`,
// `wire.variants[].note`, `wire.parsed[].msg`, `owns[].body`,
// `trade.*[].body`, `exam` and `source` render RAW — inline
// <code>/<em>/<strong> and data-tip spans (keys must exist in
// js/tips.js). Everything else is plain text via escHtml: every
// `label`, `title`, `dir`, `tag`, and both code blocks, which go
// through highlightCode.
//
// Sources: the framing rules ("newline-delimited and MUST NOT contain
// embedded newlines"), the three stream obligations (server MUST NOT
// write non-MCP to stdout, client MUST NOT write non-MCP to stdin,
// server MAY write UTF-8 logs to stderr) and the shutdown sequence
// (close stdin → wait → SIGTERM → SIGKILL) are quoted from the MCP
// specification's stdio transport and lifecycle sections, 2025-11-25
// revision, re-checked Aug 2026. The descriptor numbers are POSIX.

export const STDIO = {
  lead: 'MCP did not invent <code>stdio</code>, and that is the useful part. Every process an operating system starts is handed three open streams before its first line runs; the local transport is nothing more than the decision to carry <span data-tip="json_rpc">JSON-RPC</span> over two of them. No port is bound, no URL exists, and nothing is a server in the network sense. There is a parent process, a child process, and a pipe in each direction.',

  framing: {
    title: 'A pipe carries bytes, not messages',
    body: 'This is the fact everything else on this page follows from. Nothing in a pipe marks where one message ends and the next begins, so the transport has to impose it: <strong>one JSON-RPC object per line, and no newlines inside it</strong>. The parser reads to the next <code>\\n</code> and expects what it finds to be a complete message. Both failures below are the same failure, something reached the wire that was not a message.',
  },

  // fd numbers are POSIX; the obligations are the spec's own MUST/MAY.
  streams: [
    {
      fd: 0,
      name: 'stdin',
      title: 'Standard input',
      dir: 'host → server',
      role: 'requests in',
      carries: 'Everything the host asks for: <code>initialize</code>, <code>tools/list</code>, and every <code>tools/call</code> the model triggers.',
      who: 'The host writes; your server reads in a loop until end-of-file.',
      rule: 'The client <strong>MUST NOT</strong> write anything to stdin that is not a valid MCP message. The rule cuts both ways. There is no room here for a prompt, a banner or a keystroke.',
      breaks: 'Closing this stream <em>is</em> the shutdown signal; there is no <code>shutdown</code> method in the protocol. A server that ignores end-of-file becomes an orphan the host has to kill.',
    },
    {
      fd: 1,
      name: 'stdout',
      title: 'Standard output',
      dir: 'server → host',
      role: 'responses out',
      carries: 'Every response, and every notification the server raises on its own, one JSON object per line.',
      who: 'Your server writes; the host parses each line as it arrives.',
      rule: 'The server <strong>MUST NOT</strong> write anything to stdout that is not a valid MCP message. This one sentence is the whole reason <code>print()</code> is dangerous in a stdio server: <code>print</code> writes to descriptor 1, and descriptor 1 is the wire.',
      breaks: 'One stray line and the host reads malformed JSON-RPC. It dies at the handshake, before a single tool is discovered, so the symptom you see is <em>"the server never connected"</em> rather than <em>"a tool returned garbage"</em>.',
    },
    {
      fd: 2,
      name: 'stderr',
      title: 'Standard error',
      dir: 'server → host, off the protocol',
      role: 'logs, ignored',
      carries: 'Logging. Anything you want to watch while the thing runs.',
      who: 'Your server writes; the host <em>may</em> capture it, forward it to a log pane, or drop it entirely.',
      rule: 'The server <strong>MAY</strong> write UTF-8 strings to stderr, and the client <strong>SHOULD NOT</strong> read output here as a sign that anything went wrong. Despite the name, it is a log stream, not an error channel.',
      breaks: 'Nothing. That is the point: stderr is the free stream, and the entire fix for the failure above is moving one line from descriptor 1 to descriptor 2.',
    },
  ],

  // The same moment three times: the server answering tools/list. Only
  // the code differs, and two of the three take the connection down.
  wire: {
    lead: 'Same moment in all three: the server answering <code>tools/list</code>. Only its logging changes.',
    variants: [
      {
        id: 'clean',
        label: 'Correct',
        verdict: 'ok',
        title: 'Log to stderr, answer on stdout',
        lang: 'py',
        sample: `import sys

# fd 2: logged, never parsed
print("loaded 3 tools", file=sys.stderr)

# fd 1: one object, one line
sys.stdout.write(json.dumps(reply) + "\\n")
sys.stdout.flush()`,
        bytes: `{"jsonrpc":"2.0","id":2,"result":{"tools":[…]}}`,
        parsed: [
          { ok: true, msg: 'Line 1 parses as JSON-RPC. Response to <code>id: 2</code>, two tools registered.' },
        ],
        note: 'The debug line still reached you: it just travelled on the stream the protocol ignores.',
      },
      {
        id: 'print',
        label: 'A stray print()',
        verdict: 'fail',
        title: 'The most common way a hand-written server dies',
        lang: 'py',
        sample: `# fd 1 by default. This IS the wire.
print("loaded 3 tools")

sys.stdout.write(json.dumps(reply) + "\\n")
sys.stdout.flush()`,
        bytes: `loaded 3 tools
{"jsonrpc":"2.0","id":2,"result":{"tools":[…]}}`,
        parsed: [
          { ok: false, msg: 'Line 1 is not JSON. <strong>Protocol violation</strong>. The host tears the connection down here.' },
          { ok: false, msg: 'Line 2 was a perfectly valid response. Nothing is left to read it.' },
        ],
        note: 'The response was never wrong. The line above it was, and on a byte stream that is the same thing. Note where this lands: during startup, so the model is never told the server was supposed to exist.',
      },
      {
        id: 'pretty',
        label: 'Pretty-printed JSON',
        verdict: 'fail',
        title: 'Valid JSON, invalid framing',
        lang: 'py',
        sample: `# Readable in a terminal,
# fatal on a pipe: indent= puts
# newlines INSIDE one message
sys.stdout.write(
    json.dumps(reply, indent=2))
sys.stdout.flush()`,
        bytes: `{
  "jsonrpc": "2.0",
  "id": 2,
  "result": { "tools": [ … ] }
}`,
        parsed: [
          { ok: false, msg: 'Line 1 is <code>{</code>: a truncated object. The parser had to stop at the newline, because the newline is the only delimiter it has.' },
          { ok: false, msg: 'Every following line is a fragment of a message that was already declared broken.' },
        ],
        note: 'The document is valid JSON and the transport still rejects it: messages are newline-delimited and <strong>must not contain embedded newlines</strong>. Formatting for a human is what breaks it.',
      },
    ],
  },

  owns: [
    {
      tag: 'The host spawns it',
      body: 'There is no install step and no service to start. The host runs <code>command</code> with <code>args</code>, hands the child the environment it built from the <code>env</code> block, and keeps the two pipe ends. That is the entire deployment.',
    },
    {
      tag: 'One client, one process',
      body: 'Connect two editors and two copies of your server are running, each with its own memory. A module-level variable is per-connection state, not shared state, anything that must be shared belongs behind a database.',
    },
    {
      tag: 'Shutdown is closing a stream',
      body: 'The protocol defines no shutdown message. The client closes the server&rsquo;s stdin, waits for it to exit, sends <code>SIGTERM</code> if it lingers, and <code>SIGKILL</code> only if it must. Reading to end-of-file and exiting is therefore a real obligation of your server, not tidiness.',
    },
    {
      tag: 'It runs as you',
      body: 'Same user, same files, same credentials, same privileges. A local server sits <em>inside</em> the trust boundary, which is why "it is only local" is a description of the network and not a security property.',
    },
  ],

  trade: {
    buys: [
      { title: 'No network surface', body: 'Nothing binds, nothing listens, nothing is reachable from another machine. There is no TLS to terminate and no <code>Origin</code> to validate.' },
      { title: 'No auth to build', body: 'The process already runs as the user. Identity is the operating system&rsquo;s problem, which is the single biggest chunk of work Streamable HTTP adds back.' },
      { title: 'Secrets stay off the wire', body: 'A value passed through <code>env</code> is expanded by the host into the subprocess. It reaches your code and <strong>never enters model context</strong>.' },
      { title: 'A pipe write is the latency', body: 'No DNS, no handshake, no round trip across a network you do not control.' },
    ],
    costs: [
      { title: 'The runtime must be local', body: 'Right Python or Node, dependencies installed, on <em>every</em> machine that uses it. <code>uvx</code> and <code>npx -y</code> exist to make this someone else&rsquo;s problem.' },
      { title: 'Nothing is shared', body: 'No pooled connections, no shared cache, no one place to fix a bug. Thirty users means thirty processes and thirty re-pulls.' },
      { title: 'Your stdout is spoken for', body: 'Every library you import shares descriptor 1 with the protocol. A dependency that prints a deprecation warning takes the connection down, and the traceback will not mention it.' },
      { title: 'Local is not safe', body: 'The server reads your files with your privileges. Read what you cloned. The transport removes the network, not the trust question.' },
    ],
  },

  exam: 'The tell is never the word <code>stdio</code>; it is <em>local</em>, <em>the client launches it</em>, or <em>nothing should be exposed on the network</em>. When a stem describes a server reading the repo you cloned or a database on your laptop, the transport is decided before the options are read. And when a stem hands you a server that fails on connect with no tool ever called, look at what it writes to stdout before you look at the tools.',

  source: 'Framing, the three stream obligations and the shutdown sequence are the MCP specification&rsquo;s own stdio transport and lifecycle sections (2025-11-25 revision, re-checked Aug 2026). The descriptor numbers are POSIX, and predate the protocol by four decades.',
};
