// ── Lab 2: MCP ───────────────────────────────────────────────
// Same task, two ways. Improvise an integration (burns tokens on
// throwaway code) vs a defined MCP server (auto-discovered tools).
//
// Then the questions the comparison provokes, from
// data/mcp-authoring.js: what MCP is, how the server is reached
// (local stdio vs remote HTTP), what you write to create a tool, and
// what the call looks like on the wire. See that file for which
// fields render raw. Two partials sit between the transport cards and
// the first tool call: labs/mcp-stdio.js (what the pipe underneath the
// local transport is) and labs/mcp-lifecycle.js (the four JSON-RPC
// steps that run over it), in that order.

import { MCP_TASK, MCP_FLOWS, MCP_CONFIG, MCP_ERRORS, MCP_PRIMITIVES } from '../data/mcp.js';
import { MCP_DEF, MCP_TRANSPORTS, TRANSPORT_VARIANTS, MCP_BUILD, TOOL_ANATOMY } from '../data/mcp-authoring.js';
import { lifecycleHtml, lifecycleClick } from './mcp-lifecycle.js';
import { stdioHtml, stdioClick } from './mcp-stdio.js';
import { el, escHtml, codeify, highlightCode, copyText } from '../utils.js';

const timers = {};
// Which language tab the build section shows. Module-level so it
// survives the remount that a lab switch causes.
let buildLang = 'py';

function total(flow) { return flow.steps.reduce((a, s) => a + s.tokens, 0); }

function playFlow(id) {
  const flow = MCP_FLOWS[id];
  const log = document.getElementById(`mcpLog-${id}`);
  const fill = document.getElementById(`mcpFill-${id}`);
  const label = document.getElementById(`mcpTok-${id}`);
  const bar = document.getElementById(`mcpBar-${id}`);
  const grand = total(flow);
  const grandMax = Math.max(total(MCP_FLOWS.adhoc), total(MCP_FLOWS.defined));
  clearInterval(timers[id]);
  log.innerHTML = '';
  let i = 0, acc = 0;
  timers[id] = setInterval(() => {
    if (i >= flow.steps.length) { clearInterval(timers[id]); return; }
    const st = flow.steps[i];
    acc += st.tokens;
    const row = el('div', `mcp-line mcp-line--${st.kind}`);
    row.innerHTML = `<span class="mcp-line__kind">${st.kind}</span><span class="mcp-line__txt">${escHtml(st.line)}</span><span class="mcp-line__tok">+${st.tokens}</span>`;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    fill.style.width = `${Math.round((acc / grand) * 100)}%`;
    label.textContent = `${acc.toLocaleString('en-US')} tokens`;
    if (bar) bar.style.width = `${Math.round((acc / grandMax) * 100)}%`;
    i++;
  }, 700);
}

function summary(flow) {
  const yn = (v) => v ? '<span class="yn yn--y">yes</span>' : '<span class="yn yn--n">no</span>';
  return `
    <dl class="mcp-summary">
      <div><dt>Turns</dt><dd>${flow.totals.turns}</dd></div>
      <div><dt data-tip="mcp">Tools auto-discovered</dt><dd>${yn(flow.totals.discovery)}</dd></div>
      <div><dt>Reusable next session</dt><dd>${yn(flow.totals.reusable)}</dd></div>
      <div><dt>Secret kept out of context</dt><dd>${yn(flow.totals.secretsSafe)}</dd></div>
    </dl>`;
}

function column(id) {
  const flow = MCP_FLOWS[id];
  // ${cons}${pros} yields exactly ONE list per column (adhoc defines only
  // cons, defined only pros), so keep it that way, and keep the child order:
  // head / src chip / run / meter / log / summary / list. The columns must
  // stay structurally identical (7 children) because .mcp-grid pins them to
  // shared subgrid rows so buttons, meters and logs sit on one baseline.
  const cons = flow.cons ? `<ul class="mcp-list mcp-list--con">${flow.cons.map((c) => `<li>${escHtml(c)}</li>`).join('')}</ul>` : '';
  const pros = flow.pros ? `<ul class="mcp-list mcp-list--pro">${flow.pros.map((c) => `<li>${escHtml(c)}</li>`).join('')}</ul>` : '';
  const src = id === 'defined'
    ? `<button type="button" class="mcp-src mcp-src--file" data-jump="mcpFile" title="Jump to the .mcp.json section">${escHtml(flow.srcLabel)} <span aria-hidden="true">\u2193</span></button>`
    : `<div class="mcp-src mcp-src--none">${escHtml(flow.srcLabel)}</div>`;
  return `
    <div class="mcp-col mcp-col--${flow.tone}">
      <header class="mcp-col__head">
        <h3>${escHtml(flow.title)}</h3>
        <p>${escHtml(flow.subtitle)}</p>
      </header>
      ${src}
      <button class="btn btn--secondary btn--sm mcp-run" data-run="${id}">\u25b6 Run this way</button>
      <div class="mcp-meter"><div class="mcp-meter__track"><div class="mcp-meter__fill" id="mcpFill-${id}"></div></div><span id="mcpTok-${id}">0 tokens</span></div>
      <div class="mcp-log" id="mcpLog-${id}"></div>
      ${summary(flow)}
      ${cons}${pros}
    </div>`;
}

// ── Authoring sections ───────────────────────────────────────

function defHtml() {
  return `
    <div class="mcp-def" data-section="What MCP is">
      <p class="mcp-def__one"><b>MCP</b> · ${MCP_DEF.oneLine}</p>
      <div class="mcp-def__parts">
        ${MCP_DEF.parts.map((p) => `
          <div class="mcp-def__part">
            <h4>${escHtml(p.term)}</h4>
            <p>${p.body}</p>
          </div>`).join('')}
      </div>
      <div class="mcp-def__why">
        <div class="mcp-def__why-col mcp-def__why-col--before">
          <span>${escHtml(MCP_DEF.problem.beforeLabel)}</span>
          <p>${MCP_DEF.problem.before}</p>
        </div>
        <div class="mcp-def__arrow" aria-hidden="true">→</div>
        <div class="mcp-def__why-col mcp-def__why-col--after">
          <span>${escHtml(MCP_DEF.problem.afterLabel)}</span>
          <p>${MCP_DEF.problem.after}</p>
        </div>
      </div>
      <p class="mcp-def__scope">${MCP_DEF.scope}</p>
    </div>`;
}

function transportHtml(t) {
  return `
    <article class="mcp-tr mcp-tr--${t.tone}">
      <header class="mcp-tr__head">
        <span class="mcp-tr__label">${escHtml(t.label)}</span>
        <h4 data-tip="${t.tip}">${escHtml(t.title)}</h4>
        <p class="mcp-tr__tag">${t.tagline}</p>
      </header>
      <div class="mcp-tr__when"><span>Use it for</span>${escHtml(t.when)}</div>
      <div class="code-block">
        <div class="code-block__bar"><span data-tip="mcp_json">.mcp.json</span></div>
        <pre><code>${highlightCode(t.code, t.lang)}</code></pre>
      </div>
      <p class="mcp-tr__cnote">${t.codeNote}</p>
      <div class="mcp-tr__caveats">
        <div class="lab-label">Caveats</div>
        ${t.caveats.map((c) => `
          <div class="mcp-cav">
            <h5>${escHtml(c.title)}</h5>
            <p>${c.body}</p>
          </div>`).join('')}
      </div>
    </article>`;
}

function buildHtml() {
  const impl = MCP_BUILD.impls.find((i) => i.id === buildLang) || MCP_BUILD.impls[0];
  return `
    <div class="lab-sub mcp-build" id="mcpBuild" data-section="Write a server">
      <h3>So what do I actually write?</h3>
      <p class="lab__lead">${MCP_BUILD.lead}</p>

      <div class="mcp-contrast">
        ${MCP_BUILD.contrast.map((c) => `
          <div class="mcp-ct mcp-ct--${c.verdict}">
            <div class="mcp-ct__head">
              <code>${escHtml(c.thing)}</code>
              <span class="mcp-ct__verdict">${escHtml(c.verdict === 'yes' ? 'a tool' : c.verdict === 'no' ? 'not a tool' : 'not by itself')}</span>
            </div>
            <p class="mcp-ct__what">${escHtml(c.what)}</p>
            <p class="mcp-ct__can">${c.can}</p>
          </div>`).join('')}
      </div>

      <nav class="sdk-stepper mcp-langs" aria-label="Implementation language">
        ${MCP_BUILD.impls.map((i) => `
          <button class="sdk-step mcp-lang${i.id === buildLang ? ' is-active' : ''}" type="button" data-lang="${i.id}"
                  aria-current="${i.id === buildLang ? 'true' : 'false'}">
            <span class="sdk-step__label">${escHtml(i.label)}</span>
          </button>`).join('')}
      </nav>

      <div class="mcp-impl">
        <div class="code-block">
          <div class="code-block__bar">
            <span class="code-block__lang">${escHtml(impl.file)}</span>
            <button class="code-copy" type="button" id="mcpImplCopy">Copy</button>
          </div>
          <pre><code>${highlightCode(impl.code, impl.lang)}</code></pre>
        </div>
        <ul class="mcp-file__notes">
          ${impl.notes.map((n) => `<li class="mcp-note"><span class="mcp-note__tag">${escHtml(n.tag)}</span>${n.body}</li>`).join('')}
        </ul>
      </div>

      <p class="mcp-build__ver">${MCP_BUILD.versionNote}</p>

      <div class="lab-label">Wire it, then prove the client sees it</div>
      <p class="mcp-build__wire">${MCP_BUILD.wireLead}</p>
      <div class="code-block">
        <div class="code-block__bar"><span class="code-block__lang">shell</span></div>
        <pre><code>${highlightCode(MCP_BUILD.wireCode, MCP_BUILD.wireLang)}</code></pre>
      </div>
      <div class="mcp-verify">
        ${MCP_BUILD.verify.map((v) => `
          <div class="sdk-caveat">
            <h4>${escHtml(v.title)}</h4>
            <p>${v.body}</p>
          </div>`).join('')}
      </div>
    </div>`;
}

function anatomyHtml() {
  return `
    <div class="lab-sub mcp-anat" id="mcpAnat" data-section="Tool-call anatomy">
      <h3>What a tool call actually looks like</h3>
      <p class="lab__lead">${escHtml(TOOL_ANATOMY.lead)}</p>
      <ol class="anat-stages">
        ${TOOL_ANATOMY.stages.map((s) => `
          <li class="anat">
            <div class="anat__rail"><span class="anat__n">${s.n}</span></div>
            <div class="anat__body">
              <div class="anat__head">
                <h4>${escHtml(s.label)}</h4>
                <span class="anat__who">${escHtml(s.who)}</span>
              </div>
              <div class="code-block">
                <pre><code>${highlightCode(s.code, s.lang)}</code></pre>
              </div>
              <p class="anat__note">${s.note}</p>
            </div>
          </li>`).join('')}
      </ol>

      <div class="lab-label">Two ways to guarantee the shape of what comes back</div>
      <p class="mcp-build__wire">${escHtml(TOOL_ANATOMY.outputsLead)}</p>
      <div class="anat-outs">
        ${TOOL_ANATOMY.outputs.map((o) => `
          <article class="anat-out">
            <header>
              <h4>${escHtml(o.label)}</h4>
              <span>${escHtml(o.sub)}</span>
            </header>
            <div class="code-block">
              <pre><code>${highlightCode(o.code, o.lang)}</code></pre>
            </div>
            <p class="anat__note">${o.note}</p>
          </article>`).join('')}
      </div>
    </div>`;
}

export function mountMcp(root) {
  const err = (k) => `
    <div class="err-card err-card--${k === 'good' ? 'good' : 'bad'}">
      <div class="err-card__label">${escHtml(MCP_ERRORS[k].label)}</div>
      <pre><code>${highlightCode(MCP_ERRORS[k].code, 'json')}</code></pre>
      <p class="err-card__note">${escHtml(MCP_ERRORS[k].note)}</p>
    </div>`;

  const primitives = MCP_PRIMITIVES.map((p) => `
    <div class="prim">
      <h4${p.tip ? ` data-tip="${p.tip}"` : ''}>${escHtml(p.name)}</h4>
      <p>${p.body}</p>
    </div>`).join('');

  root.innerHTML = `
    <section class="lab lab-mcp">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">Improvise an integration, or wire an <span data-tip="mcp">MCP</span> server</h2>
          <p class="lab__lead">"Connecting to Jira" isn\u2019t free. Without a server, Claude writes throwaway code to guess the API and dumps raw JSON into context. With a defined server, tools are discovered once and reused forever.</p>
        </div>
      </header>

      ${defHtml()}

      <div class="mcp-task" data-section="Improvise vs MCP"><span class="mcp-task__label">Task</span> ${escHtml(MCP_TASK)}</div>

      <div class="mcp-grid">${column('adhoc')}${column('defined')}</div>

      <div class="mcp-compare">
        <div class="mcp-compare__row"><span>Improvised</span><div class="mcp-bar-track"><div class="mcp-bar mcp-bar--warn" id="mcpBar-adhoc"></div></div><span class="mcp-compare__t">${total(MCP_FLOWS.adhoc).toLocaleString('en-US')} tok</span></div>
        <div class="mcp-compare__row"><span>Defined MCP</span><div class="mcp-bar-track"><div class="mcp-bar mcp-bar--good" id="mcpBar-defined"></div></div><span class="mcp-compare__t">${total(MCP_FLOWS.defined).toLocaleString('en-US')} tok</span></div>
        <button class="btn btn--primary btn--sm" id="mcpRunBoth">\u25b6 Run both</button>
      </div>

      <div class="lab-sub mcp-file" id="mcpFile" data-section="The .mcp.json file">
        <h3>The whole difference is one file</h3>
        <p class="lab__lead">${escHtml(MCP_CONFIG.lead)}</p>
        <div class="mcp-file__grid">
          <div class="code-block">
            <div class="code-block__bar"><span data-tip="mcp_json">.mcp.json</span><button class="code-copy" data-copy="mcpcfg">copy</button></div>
            <pre><code>${highlightCode(MCP_CONFIG.code, 'json')}</code></pre>
          </div>
          <ul class="mcp-file__notes">
            ${MCP_CONFIG.notes.map((n) => `<li class="mcp-note"><span class="mcp-note__tag">${escHtml(n.tag)}</span>${codeify(n.body)}</li>`).join('')}
          </ul>
        </div>
        <div class="lab-label">…and the server it wires exposes three things</div>
        <div class="prim-grid">${primitives}</div>
      </div>

      <div class="lab-sub mcp-trs" data-section="Transports">
        <h3>Where the server runs decides how it is reached</h3>
        <p class="lab__lead">Two transports, and the choice is not stylistic: local means a subprocess on this machine, remote means a URL somebody operates. Everything else follows from that.</p>
        <div class="mcp-tr-grid">${MCP_TRANSPORTS.map(transportHtml).join('')}</div>
        <div class="lab-label">And the neighbours that show up in options</div>
        <div class="mcp-vars">
          ${TRANSPORT_VARIANTS.map((v) => `
            <div class="mcp-var">
              <div class="mcp-var__head">
                <code>${escHtml(v.label)}</code>
                <span class="mcp-var__verdict">${escHtml(v.verdict)}</span>
              </div>
              <p>${v.body}</p>
            </div>`).join('')}
        </div>
      </div>

      ${stdioHtml()}

      ${lifecycleHtml()}

      ${buildHtml()}

      ${anatomyHtml()}

      <div class="lab-sub" data-section="Error contract">
        <h3>The error contract is what makes tools debuggable</h3>
        <p class="lab__lead">MCP marks a failed call with <span data-tip="is_error">isError</span>. What you put next to it decides whether the coordinator can recover.</p>
        <div class="err-grid">${err('bad')}${err('good')}</div>
      </div>
    </section>`;

  root.querySelectorAll('.mcp-run').forEach((b) => b.addEventListener('click', () => playFlow(b.dataset.run)));
  root.querySelector('#mcpRunBoth').addEventListener('click', () => { playFlow('adhoc'); playFlow('defined'); });
  root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyText(MCP_CONFIG.code, '.mcp.json copied')));
  // Language tabs and the lifecycle stepper swap their section in place,
  // so everything below is delegated on the lab root; a listener bound
  // to a button inside either section would not survive its own rebuild.
  const impl = () => MCP_BUILD.impls.find((i) => i.id === buildLang) || MCP_BUILD.impls[0];
  root.addEventListener('click', (e) => {
    // A <button> + scrollIntoView, not an anchor: the hash namespace
    // belongs to the lab router (events.js), and #mcp must survive it.
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      document.getElementById(jump.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (stdioClick(e)) return;
    if (lifecycleClick(e)) {
      const old = root.querySelector('#mcpLife');
      if (old) old.outerHTML = lifecycleHtml();
      return;
    }
    const tab = e.target.closest('.mcp-lang');
    if (tab) {
      if (tab.dataset.lang === buildLang) return;
      buildLang = tab.dataset.lang;
      const old = root.querySelector('#mcpBuild');
      if (old) old.outerHTML = buildHtml();
      return;
    }
    if (e.target.closest('#mcpImplCopy')) copyText(impl().code, `${impl().file} copied`);
  });

  // Stop any in-flight run when the lab unmounts (render.js calls this
  // before the next mount) so intervals never tick against orphaned nodes.
  return () => Object.keys(timers).forEach((k) => { clearInterval(timers[k]); delete timers[k]; });
}
