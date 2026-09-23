// ── Connection lifecycle (partial of labs/mcp.js, not a lab) ──
// The four steps between "I added a server to .mcp.json" and "the model
// can call it". The load-bearing behaviour is the state column: every
// step changes exactly one row, the changed row is highlighted, and the
// row about the model stays dark until step 4, which is the answer to
// the question the section exists for.
//
// Escaping contract in data/mcp-lifecycle.js: lead, note, fail,
// headline, config notes and the source line render RAW; labels, tags,
// state values and tool names are plain text via escHtml.

import { MCP_LIFE } from '../data/mcp-lifecycle.js';
import { escHtml, highlightCode } from '../utils.js';

// Module-level so it survives the remount a lab switch causes, exactly
// like the build section's language tab.
let lifeStep = 0;

/** Cumulative state after `lifeStep`, plus which rows this step changed
 *  the two things the panel renders differently. */
function stateAt(i) {
  const val = {};
  const fresh = new Set();
  MCP_LIFE.steps.slice(0, i + 1).forEach((s, n) => {
    Object.entries(s.state).forEach(([k, v]) => {
      val[k] = v;
      if (n === i) fresh.add(k);
    });
  });
  return { val, fresh };
}

function msgHtml(m) {
  return `
    <div class="mcp-msg mcp-msg--${m.dir}">
      <div class="code-block code-block--sm">
        <div class="code-block__bar">
          <span class="code-block__lang">${escHtml(m.label)}</span>
        </div>
        <pre><code>${highlightCode(m.code, m.lang)}</code></pre>
      </div>
    </div>`;
}

function stateHtml(i) {
  const { val, fresh } = stateAt(i);
  const rows = MCP_LIFE.stateRows.map((r) => {
    const on = val[r.id] !== undefined;
    const cls = `lifer${on ? ' is-on' : ''}${fresh.has(r.id) ? ' is-new' : ''}`;
    return `
      <div class="${cls}">
        <span class="lifer__k">${escHtml(r.label)}</span>
        <span class="lifer__v">${escHtml(on ? val[r.id] : r.idle)}</span>
      </div>`;
  }).join('');
  return `
    <aside class="mcp-life__state">
      <div class="lab-label">True after step ${i + 1}</div>
      ${rows}
    </aside>`;
}

export function lifecycleHtml() {
  const i = Math.min(lifeStep, MCP_LIFE.steps.length - 1);
  const step = MCP_LIFE.steps[i];
  const last = i === MCP_LIFE.steps.length - 1;

  const steps = MCP_LIFE.steps.map((s, n) => `
    <button class="sdk-step${n === i ? ' is-active' : ''}" type="button" data-life="${n}"
            aria-current="${n === i ? 'true' : 'false'}">
      <span class="sdk-step__n">${s.n}</span>
      <span class="sdk-step__label">${escHtml(s.label)}</span>
    </button>`).join('');

  const tools = i >= 2 ? `
    <div class="mcp-life__tools">
      <div class="lab-label">${escHtml(MCP_LIFE.tools.label)}</div>
      <div class="chip-row">${MCP_LIFE.tools.names.map((t) =>
    `<span class="chip chip--static"><code>${escHtml(t)}</code></span>`).join('')}</div>
      <p class="mcp-life__src">${MCP_LIFE.tools.source}</p>
    </div>` : '';

  return `
    <div class="lab-sub mcp-life" id="mcpLife" data-section="Connection lifecycle">
      <h3>How the model finds out the tool exists</h3>
      <p class="lab__lead">${MCP_LIFE.lead}</p>

      <div class="mcp-file__grid">
        <div class="code-block">
          <div class="code-block__bar"><span data-tip="mcp_json">.mcp.json</span></div>
          <pre><code>${highlightCode(MCP_LIFE.config.code, 'json')}</code></pre>
        </div>
        <ul class="mcp-file__notes">
          ${MCP_LIFE.config.notes.map((n) =>
    `<li class="mcp-note"><span class="mcp-note__tag">${escHtml(n.tag)}</span>${n.body}</li>`).join('')}
        </ul>
      </div>

      <nav class="sdk-stepper mcp-life__steps" aria-label="Connection steps">${steps}</nav>

      <div class="mcp-life__grid">
        <div class="mcp-life__wire">
          <p class="mcp-life__head"><span class="mcp-life__actor">${escHtml(step.actor === 'both' ? 'host and server' : step.actor)}</span>${step.headline}</p>
          ${step.msgs.map(msgHtml).join('')}
          <p class="anat__note">${step.note}</p>
          <div class="mcp-life__fail">
            <span class="mcp-life__fail-label">When it breaks here</span>
            <p>${step.fail}</p>
          </div>
          ${tools}
        </div>
        ${stateHtml(i)}
      </div>

      <div class="mcp-life__nav">
        <button class="btn btn--secondary btn--sm" type="button" data-life="${i + 1}" ${last ? 'disabled' : ''}>
          ${last ? 'Connected' : `Next: ${escHtml(MCP_LIFE.steps[i + 1].label)} →`}
        </button>
      </div>

      <p class="mcp-life__coda">${MCP_LIFE.coda} <button type="button" class="mcp-src mcp-src--file" data-jump="mcpAnat">Walk one call <span aria-hidden="true">↓</span></button></p>
    </div>`;
}

/** Returns true when it consumed the click; the caller re-renders the
 *  section in place (state lives here, nothing is bound per node). */
export function lifecycleClick(e) {
  const btn = e.target.closest('[data-life]');
  if (!btn || btn.disabled) return false;
  const n = Number(btn.dataset.life);
  if (!Number.isInteger(n) || n < 0 || n >= MCP_LIFE.steps.length) return false;
  if (n === lifeStep) return false;
  lifeStep = n;
  return true;
}
