// ── Inside stdio (partial of labs/mcp.js, not a lab) ─────────
// Sits between the transport cards and the connection lifecycle: the
// cards say "local means stdio", the lifecycle says "then these four
// JSON-RPC steps happen". This says what the pipe underneath them is.
//
// Two interactions, both state-in-module so they survive the remount a
// lab switch causes: a descriptor picker (0/1/2) and a framing demo
// whose three variants are the same tools/list answer written three
// ways, two of which kill the connection. The demo is the point of the
// section — a reader who has only met "log to stderr" as a rule sees
// the byte stream that makes it one.
//
// Escaping contract in data/mcp-stdio.js: lead, framing.body, the
// stream prose fields, variant notes, parsed messages, owns bodies,
// trade bodies, exam and source render RAW. Labels, titles, directions
// and tags are plain text via escHtml; both code blocks go through
// highlightCode, which escapes.

import { STDIO } from '../data/mcp-stdio.js';
import { escHtml, highlightCode } from '../utils.js';

let fdPick = 1;      // stdout is the one that bites people; open on it
let wirePick = 'clean';

const variant = () => STDIO.wire.variants.find((v) => v.id === wirePick) || STDIO.wire.variants[0];

/** The three descriptors as a pipe diagram: each row is a button, and
 *  the arrow direction is what makes 0 and 1 read as a pair. */
function fdRailHtml() {
  return STDIO.streams.map((s) => `
    <button class="fd${s.fd === fdPick ? ' is-active' : ''}" type="button" data-fd="${s.fd}"
            aria-pressed="${s.fd === fdPick ? 'true' : 'false'}">
      <span class="fd__n">${s.fd}</span>
      <span class="fd__name"><code>${escHtml(s.name)}</code></span>
      <span class="fd__dir">${escHtml(s.dir)}</span>
      <span class="fd__role">${escHtml(s.role)}</span>
    </button>`).join('');
}

function fdDetailHtml() {
  const s = STDIO.streams.find((x) => x.fd === fdPick) || STDIO.streams[0];
  return `
    <h4 class="fd-det__title">
      <span class="fd-det__fd" data-tip="file_descriptor">fd ${s.fd}</span>
      ${escHtml(s.title)}
    </h4>
    <dl class="fd-det__rows">
      <div><dt>Carries</dt><dd>${s.carries}</dd></div>
      <div><dt>Who writes</dt><dd>${s.who}</dd></div>
      <div><dt>The rule</dt><dd>${s.rule}</dd></div>
      <div><dt>If you break it</dt><dd>${s.breaks}</dd></div>
    </dl>`;
}

function wireHtml() {
  const v = variant();
  const tabs = STDIO.wire.variants.map((x) => `
    <button class="seg${x.id === wirePick ? ' is-active' : ''}" type="button" data-wire="${x.id}"
            aria-pressed="${x.id === wirePick ? 'true' : 'false'}">${escHtml(x.label)}</button>`).join('');

  const parsed = v.parsed.map((p) => `
    <li class="wread${p.ok ? ' wread--ok' : ' wread--bad'}">${p.msg}</li>`).join('');

  return `
    <div class="seg-group stdio-wire__tabs" aria-label="What the server wrote">${tabs}</div>

    <div class="stdio-wire__grid is-${v.verdict}">
      <div class="code-block code-block--sm">
        <div class="code-block__bar"><span class="code-block__lang">what your server ran</span></div>
        <pre><code>${highlightCode(v.sample, v.lang)}</code></pre>
      </div>

      <div class="code-block code-block--sm stdio-wire__bytes">
        <div class="code-block__bar">
          <span class="code-block__lang">bytes on descriptor 1</span>
          <span class="stdio-verdict stdio-verdict--${v.verdict}">${v.verdict === 'ok' ? 'parses' : 'connection dies'}</span>
        </div>
        <pre><code>${highlightCode(v.bytes, 'json')}</code></pre>
      </div>

      <div class="stdio-wire__read">
        <div class="lab-label">What the host&rsquo;s parser makes of it</div>
        <ul class="wread-list">${parsed}</ul>
        <p class="anat__note">${v.note}</p>
      </div>
    </div>`;
}

export function stdioHtml() {
  const owns = STDIO.owns.map((o) => `
    <li class="mcp-note"><span class="mcp-note__tag">${escHtml(o.tag)}</span>${o.body}</li>`).join('');

  const col = (kind, heading, items) => `
    <div class="stdio-tr__col stdio-tr__col--${kind}">
      <div class="lab-label">${escHtml(heading)}</div>
      <ul>${items.map((i) => `<li><b>${escHtml(i.title)}</b>${i.body}</li>`).join('')}</ul>
    </div>`;

  return `
    <div class="lab-sub mcp-stdio" id="mcpStdio" data-section="Inside stdio">
      <h3>What <code>stdio</code> actually is</h3>
      <p class="lab__lead">${STDIO.lead}</p>

      <div class="stdio-fd">
        <div class="stdio-fd__rail">${fdRailHtml()}</div>
        <div class="stdio-fd__det" id="stdioFdDet">${fdDetailHtml()}</div>
      </div>

      <div class="stdio-frame">
        <h4>${escHtml(STDIO.framing.title)}</h4>
        <p>${STDIO.framing.body}</p>
      </div>

      <div class="lab-label">${STDIO.wire.lead}</div>
      <div class="stdio-wire" id="stdioWire">${wireHtml()}</div>

      <div class="lab-label">The host owns the process, not just the connection</div>
      <ul class="mcp-file__notes stdio-owns">${owns}</ul>

      <div class="stdio-tr">
        ${col('buys', 'What removing the network buys', STDIO.trade.buys)}
        ${col('costs', 'What it costs', STDIO.trade.costs)}
      </div>

      <p class="stdio-exam">${STDIO.exam}</p>
      <p class="mcp-life__src">${STDIO.source}</p>
    </div>`;
}

/** Bench-style delegated click. Returns true when it consumed the event;
 *  each half re-renders only its own subtree, so the reader's scroll
 *  position inside a long section survives a click. */
export function stdioClick(e) {
  const fd = e.target.closest('[data-fd]');
  if (fd) {
    const n = Number(fd.dataset.fd);
    if (n === fdPick) return true;
    fdPick = n;
    const rail = document.querySelector('.stdio-fd__rail');
    const det = document.getElementById('stdioFdDet');
    if (rail) rail.innerHTML = fdRailHtml();
    if (det) det.innerHTML = fdDetailHtml();
    return true;
  }

  const w = e.target.closest('[data-wire]');
  if (w) {
    if (w.dataset.wire === wirePick) return true;
    wirePick = w.dataset.wire;
    const host = document.getElementById('stdioWire');
    if (host) host.innerHTML = wireHtml();
    return true;
  }

  return false;
}
