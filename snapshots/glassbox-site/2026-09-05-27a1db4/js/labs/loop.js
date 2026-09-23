// ── Lab 1: Agent Loop terminal ───────────────────────────────
// Replays a hand-authored agentic run. Nodes reveal step by step,
// are draggable, and open an inspector on click. A dual log shows
// the "chat" view (what you see) vs the "under the hood" API turns.
//
// The lab reads as two parts, and the split is deliberate: Part 1 is
// the practice (this file, a run you drive), Part 2 is the theory
// (labs/loop-theory.js: the concept ledger, hub-and-spoke, the
// built-in toolset, then the steer-vs-enforce pair below). The jump
// nav at the top scrolls between them rather than hiding either, so
// every theory section stays findable with the browser's own search.

import { RUNS, RUN_ORDER } from '../data/runs.js';
import { ANTIPATTERNS } from '../data/antipatterns.js';
import { LOOP_CONTRAST } from '../data/loop-contrast.js';
import { theoryHtml, bindTheory } from './loop-theory.js';
import { el, escHtml, flagHtml, highlightCode } from '../utils.js';
import { openInspector } from '../ui.js';

const S = { runId: 'writing', step: 0, view: 'chat', playing: false, timer: null, pos: {} };
const SPEED = 1100;

const KIND_TIP = { coordinator: 'coordinator', subagent: 'subagent', tool: 'tool_use', user: null };

function run() { return RUNS[S.runId]; }
function coordId() { return Object.values(run().nodes).find((n) => n.kind === 'coordinator').id; }
function userId() { const u = Object.values(run().nodes).find((n) => n.kind === 'user'); return u && u.id; }
function childIds() {
  return Object.values(run().nodes).filter((n) => n.kind !== 'coordinator' && n.kind !== 'user').map((n) => n.id);
}

/** Cumulative scene state for steps 0..upto. */
function sceneAt(upto) {
  const r = run();
  const revealed = new Set(), done = new Set(), edges = [];
  let tokens = 0, active = [], flag = null, note = '';
  for (let i = 0; i <= upto; i++) {
    const st = r.steps[i];
    (st.reveal || []).forEach((id) => revealed.add(id));
    (st.edges || []).forEach((e) => { if (!edges.some((x) => x[0] === e[0] && x[1] === e[1])) edges.push(e); });
    (st.done || []).forEach((id) => done.add(id));
    if (st.tokens != null) tokens = st.tokens;
    active = st.active ? (Array.isArray(st.active) ? st.active : [st.active]) : [];
    flag = st.flag || null;
    note = st.note || '';
  }
  return { revealed, done, edges, tokens, active, flag, note };
}

// ── Layout ───────────────────────────────────────────────────
function layout() {
  const canvas = document.getElementById('loopCanvas');
  if (!canvas) return;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const cid = coordId(), uid = userId(), kids = childIds();
  const place = (id, cx, cy) => {
    const p = S.pos[id];
    if (!p || !p.manual) S.pos[id] = { cx, cy, manual: p && p.manual };
  };
  place(cid, W * 0.5, H * 0.24);
  if (uid) place(uid, Math.max(90, W * 0.13), H * 0.24);
  const n = kids.length;
  const pad = Math.min(140, W * 0.14);
  kids.forEach((id, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = pad + t * (W - pad * 2);
    place(id, x, H * 0.74);
  });
}

function drawEdges(scene) {
  const svg = document.getElementById('loopEdges');
  if (!svg) return;
  const parts = [];
  scene.edges.forEach(([a, b]) => {
    if (!scene.revealed.has(a) || !scene.revealed.has(b)) return;
    const pa = S.pos[a], pb = S.pos[b];
    if (!pa || !pb) return;
    const activeEdge = scene.active.includes(b) || scene.active.includes(a);
    parts.push(`<line x1="${pa.cx}" y1="${pa.cy}" x2="${pb.cx}" y2="${pb.cy}" class="edge${activeEdge ? ' edge--active' : ''}"/>`);
  });
  svg.innerHTML = parts.join('');
}

function nodeGlyph(kind) {
  if (kind === 'coordinator') return '\u25c9';
  if (kind === 'subagent') return '\u25c8';
  if (kind === 'tool') return '\u25a3';
  return '\u25cb';
}

function renderNodes(scene) {
  const canvas = document.getElementById('loopCanvas');
  if (!canvas) return; // lab unmounted (same guard as layout())
  const r = run();
  Object.values(r.nodes).forEach((node) => {
    let node_el = canvas.querySelector(`.gnode[data-id="${node.id}"]`);
    if (!node_el) {
      node_el = el('div', 'gnode');
      node_el.dataset.id = node.id;
      node_el.dataset.kind = node.kind;
      node_el.innerHTML = `<span class="gnode__glyph">${nodeGlyph(node.kind)}</span><span class="gnode__label">${escHtml(node.label)}</span>`;
      node_el.tabIndex = 0;
      canvas.appendChild(node_el);
      attachDrag(node_el);
    }
    const p = S.pos[node.id];
    if (p) { node_el.style.left = `${p.cx}px`; node_el.style.top = `${p.cy}px`; }
    node_el.classList.toggle('is-hidden', !scene.revealed.has(node.id));
    node_el.classList.toggle('is-active', scene.active.includes(node.id));
    node_el.classList.toggle('is-done', scene.done.has(node.id) && !scene.active.includes(node.id));
  });
}

// ── Drag + click ─────────────────────────────────────────────
function attachDrag(node_el) {
  let sx = 0, sy = 0, moved = false, dragging = false;
  const id = node_el.dataset.id;
  node_el.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false;
    sx = e.clientX; sy = e.clientY;
    node_el.setPointerCapture(e.pointerId);
    node_el.classList.add('is-grabbing');
  });
  node_el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - sx) > 4 || Math.abs(e.clientY - sy) > 4) moved = true;
    if (!moved) return;
    const rect = document.getElementById('loopCanvas').getBoundingClientRect();
    const cx = Math.max(20, Math.min(e.clientX - rect.left, rect.width - 20));
    const cy = Math.max(20, Math.min(e.clientY - rect.top, rect.height - 20));
    S.pos[id] = { cx, cy, manual: true };
    node_el.style.left = `${cx}px`; node_el.style.top = `${cy}px`;
    drawEdges(sceneAt(S.step));
  });
  node_el.addEventListener('pointerup', (e) => {
    dragging = false;
    node_el.classList.remove('is-grabbing');
    if (!moved) inspectNode(id);
  });
  node_el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspectNode(id); }
  });
}

function inspectNode(id) {
  const node = run().nodes[id];
  if (!node) return;
  const rows = [];
  const add = (k, v, tip) => rows.push(`<div class="insp-row"><dt${tip ? ` data-tip="${tip}"` : ''}>${k}</dt><dd>${v}</dd></div>`);
  if (node.role) add('Role', escHtml(node.role));
  if (node.model) add('Model', `<code>${escHtml(node.model)}</code>`);
  if (node.tools) add('allowed_tools', node.tools.length ? node.tools.map((t) => `<code>${escHtml(t)}</code>`).join(' ') : '<em>none</em>', 'allowed_tools');
  if (node.tool_choice) add('tool_choice', `<code>${escHtml(node.tool_choice)}</code>`, 'tool_choice');
  if (node.max_tokens) add('max_tokens', `<code>${node.max_tokens}</code>`);
  if (node.context) {
    const isIso = /ISOLATED/.test(node.context);
    add('Context', escHtml(node.context), isIso ? 'isolated_context' : (node.kind === 'coordinator' ? 'context_window' : null));
  }
  const tipKind = KIND_TIP[node.kind];
  const kindBadge = `<span class="insp-kind insp-kind--${node.kind}"${tipKind ? ` data-tip="${tipKind}"` : ''}>${escHtml(node.role || node.kind)}</span>`;
  openInspector(node.label, `
    <div class="insp-head">${kindBadge}</div>
    <p class="insp-blurb">${escHtml(node.blurb)}</p>
    <dl class="insp-grid">${rows.join('')}</dl>
    ${node.kind === 'subagent' ? '<p class="insp-foot">This subagent shares no memory with its siblings. Everything it knows was pasted into its Task prompt.</p>' : ''}
  `);
}

// ── Log + meter + flag ───────────────────────────────────────
function renderLog(scene) {
  const log = document.getElementById('loopLog');
  const r = run();
  const rows = [];
  for (let i = 0; i <= S.step; i++) {
    const st = r.steps[i];
    const cur = i === S.step ? ' is-current' : '';
    // In the chat view a request renders as the user's bubble; the CLI
    // caret (›) is the terminal's affordance, not the chat's.
    const chatText = st.turn === 'request' ? st.chat.replace(/›\s*/g, '') : st.chat;
    rows.push(`<div class="log-row log-row--${st.turn}${cur}">
      <span class="log-chat">${escHtml(chatText)}</span>
      <span class="log-raw">${escHtml(st.raw)}</span>
    </div>`);
  }
  log.innerHTML = rows.join('');
  log.className = `loop-log loop-log--${S.view}`;
  log.scrollTop = log.scrollHeight;
}

function renderMeter(scene) {
  const fill = document.getElementById('ctxFill');
  const label = document.getElementById('ctxLabel');
  if (!fill) return;
  const pct = Math.min(100, Math.round((scene.tokens / run().contextMax) * 100));
  fill.style.width = `${pct}%`;
  fill.classList.toggle('is-hot', pct > 66);
  label.textContent = `${scene.tokens.toLocaleString('en-US')} / ${run().contextMax.toLocaleString('en-US')} tokens`;
}

function renderNote(scene) {
  const note = document.getElementById('loopNote');
  if (!note) return;
  note.innerHTML = scene.note ? `<span class="loop-note__tag">why it matters</span> ${scene.note}` : '';
  note.classList.toggle('is-empty', !scene.note);
}

function renderFlag(scene) {
  const box = document.getElementById('loopFlag');
  if (!box) return;
  if (!scene.flag || !ANTIPATTERNS[scene.flag]) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  box.innerHTML = flagHtml(ANTIPATTERNS[scene.flag]);
}

// \u2500\u2500 Steer vs enforce (static bottom section) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Rendered once at mount; paint()/selectRun() never touch it. Each side
// has exactly FOUR children (title / claim / code / reliability row), and
// the .pair__cols subgrid template pins those rows to shared baselines.
function contrastHtml() {
  const c = LOOP_CONTRAST;
  const sides = c.sides.map((s) => `
    <div class="pair__side loop-contrast__side" data-tone="${s.tone}">
      <h4>${escHtml(s.title)}</h4>
      <p>${s.claim}</p>
      <div class="code-block code-block--sm">
        <div class="code-block__bar"><span class="code-block__lang">${escHtml(s.codeLabel)}</span></div>
        <pre><code>${highlightCode(s.code, s.lang)}</code></pre>
      </div>
      <div class="sdk-note sdk-note--${s.rel.tone === 'ok' ? 'ok' : 'warn'}">${s.rel.text}</div>
    </div>`).join('');
  const levers = c.levers.map((l) => `
    <div class="prim">
      <h4 data-tip="${l.tip}">${escHtml(l.name)}</h4>
      <p>${l.text}</p>
    </div>`).join('');
  return `
    <section class="pair loop-contrast" data-section="Steer vs enforce">
      <div class="loop-contrast__head">
        <h3>${escHtml(c.heading)}</h3>
        <p>${escHtml(c.lead)}</p>
      </div>
      <div class="pair__cols" data-sides="2">${sides}</div>
      <div class="lab-label">The levers that enforce instead of ask</div>
      <div class="prim-grid">${levers}</div>
      <div class="loop-note"><span class="loop-note__tag">replay it</span> ${c.counterfactual}</div>
      <div class="loop-flag">${flagHtml(ANTIPATTERNS[c.flag])}</div>
      <a class="btn btn--ghost loop-contrast__link" id="loopSdkLink" href="#${c.xref.hash}">${escHtml(c.xref.label)}</a>
    </section>`;
}

function paint() {
  // The lab unmounts when another tab is selected; a queued resize or
  // timer must not paint into a stage that is no longer in the DOM.
  if (!document.getElementById('loopCanvas')) return;
  const scene = sceneAt(S.step);
  layout();
  renderNodes(scene);
  drawEdges(scene);
  renderLog(scene);
  renderMeter(scene);
  renderNote(scene);
  renderFlag(scene);
  const r = run();
  const stepEl = document.getElementById('loopStepLabel');
  if (stepEl) stepEl.textContent = `Step ${S.step + 1} / ${r.steps.length}`;
  const playBtn = document.getElementById('loopPlay');
  if (playBtn) playBtn.textContent = S.playing ? '\u23f8 Pause' : (S.step >= r.steps.length - 1 ? '\u21bb Replay' : '\u25b6 Play');
}

// ── Transport ────────────────────────────────────────────────
function stop() { S.playing = false; clearInterval(S.timer); S.timer = null; }
function advance() {
  if (S.step >= run().steps.length - 1) { stop(); paint(); return; }
  S.step++; paint();
}
function play() {
  if (S.step >= run().steps.length - 1) { S.step = 0; }
  S.playing = true;
  paint();
  clearInterval(S.timer);
  S.timer = setInterval(advance, SPEED);
}
function togglePlay() { S.playing ? stop() : play(); paint(); }
function step() { stop(); advance(); }
function back() { stop(); if (S.step > 0) S.step--; paint(); }
function reset() { stop(); S.step = 0; S.pos = {}; paint(); }

function selectRun(id) {
  stop(); S.runId = id; S.step = 0; S.pos = {};
  buildScenarioChips();
  document.getElementById('loopPrompt').innerHTML = `<span class="loop-prompt__caret">\u203a</span> ${escHtml(run().prompt)}`;
  document.getElementById('loopBlurb').textContent = run().blurb;
  // clear stale node els
  const c = document.getElementById('loopCanvas');
  c.querySelectorAll('.gnode').forEach((n) => n.remove());
  paint();
}

function buildScenarioChips() {
  const wrap = document.getElementById('loopScenarios');
  wrap.innerHTML = '';
  RUN_ORDER.forEach((id) => {
    const b = el('button', 'chip' + (id === S.runId ? ' is-active' : ''));
    b.type = 'button'; b.dataset.run = id; b.textContent = RUNS[id].title;
    wrap.appendChild(b);
  });
}

// ── Mount ────────────────────────────────────────────────────
export function mountLoop(root) {
  stop(); // playback from a previous mount would keep advancing off-screen

  // Arriving from the Context lab: land on the requested run. Navigation
  // itself was the #loop hashchange; the parked id only picks the run.
  try {
    const runId = sessionStorage.getItem('glassbox-open-loop-run');
    if (runId && RUNS[runId]) {
      sessionStorage.removeItem('glassbox-open-loop-run');
      S.runId = runId; S.step = 0; S.pos = {};
    }
  } catch { /* private mode */ }

  root.innerHTML = `
    <section class="lab lab-loop">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">The <span data-tip="agentic_loop">agentic loop</span>, one click at a time</h2>
          <p class="lab__lead">One line goes in. Underneath, a <span data-tip="coordinator">coordinator</span> reads <span data-tip="stop_reason">stop_reason</span>, fires the <span data-tip="task_tool">Task</span> tool, and waits on <span data-tip="subagent">subagents</span>. Click any node to see its settings. Drag it aside to untangle the graph.</p>
        </div>
      </header>

      <nav class="loop-parts" aria-label="The two halves of this lab">
        <button class="loop-parts__link" type="button" data-jump="loopPractice">
          <span class="loop-parts__n">Part 1 · practice</span>
          <span class="loop-parts__t">Drive a run</span>
          <span class="loop-parts__d">Step through a real loop and watch the context fill</span>
        </button>
        <button class="loop-parts__link" type="button" data-jump="loopTheory">
          <span class="loop-parts__n">Part 2 · theory</span>
          <span class="loop-parts__t">Name every part</span>
          <span class="loop-parts__d">The ledger, hub-and-spoke, the built-in toolset, prompt vs hook</span>
        </button>
      </nav>

      <div class="loop-part" id="loopPractice" data-section="Drive a run">
      <div class="loop-part__head">
        <span class="loop-part__tag">Part 1 · practice</span>
        <h3>Watch one run, one step at a time</h3>
        <p>Pick a scenario, then step through it. The graph is what is running; the log on the right is the same run seen twice: as the user sees it, and as the API turns underneath.</p>
      </div>
      <div class="loop-scenarios" id="loopScenarios"></div>
      <p class="loop-blurb" id="loopBlurb"></p>
      <div class="loop-prompt" id="loopPrompt"></div>

      <div class="loop-toolbar">
        <div class="transport">
          <button class="btn btn--secondary btn--sm" id="loopReset" title="Reset">\u21ba Reset</button>
          <button class="btn btn--secondary btn--sm" id="loopBack" title="Previous step">\u2039 Back</button>
          <button class="btn btn--primary btn--sm" id="loopPlay">\u25b6 Play</button>
          <button class="btn btn--secondary btn--sm" id="loopStep" title="Next step">Step \u203a</button>
          <span class="loop-step-label" id="loopStepLabel"></span>
        </div>
        <div class="view-toggle" role="group" aria-label="View">
          <button class="seg is-active" data-view="chat">What you see</button>
          <button class="seg" data-view="raw">Under the hood</button>
        </div>
      </div>

      <div class="loop-stage">
        <div class="loop-canvas" id="loopCanvas">
          <svg class="loop-edges" id="loopEdges"></svg>
        </div>
        <aside class="loop-side">
          <div class="ctx-meter">
            <div class="ctx-meter__top"><span data-tip="context_window">Context window</span><span id="ctxLabel"></span></div>
            <div class="ctx-meter__track"><div class="ctx-meter__fill" id="ctxFill"></div></div>
          </div>
          <div class="loop-log loop-log--chat" id="loopLog"></div>
        </aside>
      </div>

      <div class="loop-note is-empty" id="loopNote"></div>
      <div class="loop-flag" id="loopFlag" hidden></div>
      </div>

      <div class="loop-part loop-part--theory" id="loopTheory">
        <div class="loop-part__head">
          <span class="loop-part__tag">Part 2 · theory</span>
          <h3>What each moving part is, and what breaks without it</h3>
          <p>The run above is one path through the loop. This half names every part of it (the fields you send, the fields you read, the definitions the SDK adds) then the two things a coordinator actually does with them: delegate, and read a codebase.</p>
        </div>
        ${theoryHtml()}
        ${contrastHtml()}
      </div>
    </section>`;

  buildScenarioChips();
  document.getElementById('loopPrompt').innerHTML = `<span class="loop-prompt__caret">\u203a</span> ${escHtml(run().prompt)}`;
  document.getElementById('loopBlurb').textContent = run().blurb;

  root.querySelector('#loopScenarios').addEventListener('click', (e) => {
    const b = e.target.closest('[data-run]'); if (b) selectRun(b.dataset.run);
  });
  root.querySelector('#loopPlay').addEventListener('click', togglePlay);
  root.querySelector('#loopStep').addEventListener('click', step);
  root.querySelector('#loopBack').addEventListener('click', back);
  root.querySelector('#loopReset').addEventListener('click', reset);
  root.querySelector('.view-toggle').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]'); if (!b) return;
    S.view = b.dataset.view;
    root.querySelectorAll('.view-toggle .seg').forEach((s) => s.classList.toggle('is-active', s === b));
    renderLog(sceneAt(S.step));
  });

  // Part jumps: buttons + scrollIntoView, never anchors, because the hash
  // namespace belongs to the lab router (events.js), and #loop must
  // survive the jump. Same reason as the mcp lab's file jump.
  root.querySelectorAll('[data-jump]').forEach((b) => {
    b.addEventListener('click', () => {
      document.getElementById(b.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  bindTheory(root);

  // Deep-link into the SDK lab landing on L3 Hooks. Navigation itself is
  // the href="#sdk" hashchange; this only parks the level for mountSdk,
  // mirroring the drill → playbook sessionStorage precedent.
  root.querySelector('#loopSdkLink').addEventListener('click', () => {
    try { sessionStorage.setItem('glassbox-open-sdk-level', LOOP_CONTRAST.xref.level); } catch { /* private mode */ }
  });

  // Bound once: the lab remounts on every tab switch, and one listener
  // per mount would accumulate for the life of the page.
  if (!mountLoop._resize) {
    mountLoop._resize = true;
    window.addEventListener('resize', () => paint(), { passive: true });
  }
  paint();

  // render.js runs this before the next mount: a run left playing must not
  // keep advancing (and painting) against a detached stage.
  return stop;
}
