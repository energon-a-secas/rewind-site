// ── Lab: Context ─────────────────────────────────────────────
// Conversation memory, split-screen: the chat both sides see (left)
// vs the request actually shipped to the model (right), replayed
// under different context strategies. Below: a technique matrix and
// a symptom → cause → fix gallery of the recurring failures.

import { CW_ORDER, CW_SCENARIOS, CW_MATRIX, CW_ISSUES } from '../data/context.js';
import { ANTIPATTERNS } from '../data/antipatterns.js';
import { state } from '../state.js';
import { el, escHtml, flagHtml } from '../utils.js';
import { openInspector } from '../ui.js';

const S = { scen: 'support', strat: 'window', step: 0, playing: false, timer: null };
const SPEED = 1600;

function scen() { return CW_SCENARIOS[S.scen]; }
function strat() {
  return scen().strategies.find((x) => x.id === S.strat) || scen().strategies[0];
}
function steps() { return strat().steps; }

// ── Right pane: resolve a ship entry to a renderable block ───
// '@n' refs point at step n's chat turn; anything else is a named
// block on the strategy (system prompt, digest, CASE FACTS, …).
const WHO_LABEL = { user: 'user', agent: 'assistant', mark: 'system' };

function resolveBlock(ref) {
  if (ref.startsWith('@')) {
    const st = steps()[Number(ref.slice(1))];
    return {
      kind: 'turn',
      label: `turn ${Number(ref.slice(1)) + 1} · ${WHO_LABEL[st.who]}`,
      body: st.text.length > 72 ? `${st.text.slice(0, 72)}…` : st.text,
      tok: st.t,
    };
  }
  return strat().blocks[ref];
}

// ── Renderers ────────────────────────────────────────────────
function renderChat() {
  const log = document.getElementById('cwChat');
  const rows = [];
  for (let i = 0; i <= S.step; i++) {
    const st = steps()[i];
    const turn = st.who === 'user' ? 'request' : (st.who === 'agent' ? 'response' : 'system');
    rows.push(`<div class="log-row log-row--${turn}${i === S.step ? ' is-current' : ''}">
      <span class="log-chat">${escHtml(st.text)}</span>
    </div>`);
  }
  log.innerHTML = rows.join('');
  log.scrollTop = log.scrollHeight;
  const cur = steps()[S.step];
  document.getElementById('cwChatMeta').textContent =
    `transcript so far · ${cur.full.toLocaleString('en-US')} tokens`;
}

function renderStack() {
  const cur = steps()[S.step];
  const parts = cur.ship.map((ref) => {
    const b = resolveBlock(ref);
    if (!b) return '';
    const share = b.kind === 'sys' ? ` · ${Math.round((b.tok / cur.tok) * 100)}% of request` : '';
    const tok = b.tok ? `<span class="cw-block__tok">${b.tok} tok${share}</span>` : '';
    return `<div class="cw-block cw-block--${b.kind}">
      <div class="cw-block__top"><span class="cw-block__tag">${escHtml(b.label)}</span>${tok}</div>
      <div class="cw-block__body">${escHtml(b.body)}</div>
    </div>`;
  });
  document.getElementById('cwStack').innerHTML = parts.join('');

  const fill = document.getElementById('cwFill');
  const pct = Math.min(100, Math.round((cur.tok / cur.full) * 100));
  fill.style.width = `${pct}%`;
  fill.classList.toggle('is-hot', pct > 90);
  const saved = cur.full > cur.tok ? ` · ${Math.round((1 - cur.tok / cur.full) * 100)}% smaller than raw` : '';
  document.getElementById('cwTok').textContent =
    `ships ${cur.tok.toLocaleString('en-US')} tokens${saved}`;
}

function renderNote() {
  const cur = steps()[S.step];
  const note = document.getElementById('cwNote');
  note.innerHTML = cur.note ? `<span class="loop-note__tag">why it matters</span> ${cur.note}` : '';
  note.classList.toggle('is-empty', !cur.note);
  const box = document.getElementById('cwFlag');
  if (!cur.flag || !ANTIPATTERNS[cur.flag]) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  box.innerHTML = flagHtml(ANTIPATTERNS[cur.flag]);
}

function renderVerdict() {
  const v = strat().verdict;
  document.getElementById('cwVerdict').innerHTML = `
    <div class="cw-verdict__row"><span class="cw-verdict__tag cw-verdict__tag--win">wins</span><p>${v.wins}</p></div>
    <div class="cw-verdict__row"><span class="cw-verdict__tag cw-verdict__tag--cost">costs</span><p>${v.costs}</p></div>
    <div class="cw-verdict__row"><span class="cw-verdict__tag">use it for</span><p>${v.use}</p></div>
    ${state.examMode && v.exam ? `<div class="cw-verdict__row cw-verdict__row--exam"><span class="cw-verdict__tag cw-verdict__tag--exam">exam angle</span><p>${v.exam}</p></div>` : ''}`;
}

function paint() {
  if (!document.getElementById('cwChat')) return; // lab unmounted mid-timer
  renderChat();
  renderStack();
  renderNote();
  renderVerdict();
  document.getElementById('cwHow').textContent = strat().how;
  document.getElementById('cwStepLabel').textContent = `Turn ${S.step + 1} / ${steps().length}`;
  const playBtn = document.getElementById('cwPlay');
  playBtn.textContent = S.playing ? '⏸ Pause' : (S.step >= steps().length - 1 ? '↻ Replay' : '▶ Play');
}

// ── Transport ────────────────────────────────────────────────
function stop() { S.playing = false; clearInterval(S.timer); S.timer = null; }
function advance() {
  if (S.step >= steps().length - 1) { stop(); paint(); return; }
  S.step++; paint();
}
function play() {
  if (S.step >= steps().length - 1) S.step = 0;
  S.playing = true;
  clearInterval(S.timer);
  S.timer = setInterval(advance, SPEED);
  paint();
}

function buildScenarioChips() {
  const wrap = document.getElementById('cwScenarios');
  wrap.innerHTML = '';
  CW_ORDER.forEach((id) => {
    const b = el('button', 'chip' + (id === S.scen ? ' is-active' : ''));
    b.type = 'button'; b.dataset.scen = id; b.textContent = CW_SCENARIOS[id].title;
    wrap.appendChild(b);
  });
  document.getElementById('cwBlurb').textContent = scen().blurb;
}

function buildStrategyTabs() {
  const wrap = document.getElementById('cwStrats');
  wrap.innerHTML = '';
  scen().strategies.forEach((st) => {
    const b = el('button', 'seg' + (st.id === S.strat ? ' is-active' : ''));
    b.type = 'button'; b.dataset.strat = st.id; b.textContent = st.name;
    wrap.appendChild(b);
  });
}

function selectScenario(id) {
  stop();
  S.scen = id;
  S.strat = scen().strategies[0].id;
  S.step = 0;
  buildScenarioChips();
  buildStrategyTabs();
  paint();
}

// The step index survives a strategy switch on purpose: park the
// player at turn 9 and flip tabs to compare what each strategy ships
// at the same moment of the same conversation.
function selectStrategy(id) {
  stop();
  S.strat = id;
  S.step = Math.min(S.step, steps().length - 1);
  buildStrategyTabs();
  paint();
}

// ── Static sections ──────────────────────────────────────────
function toneCell(c) {
  return `<span class="cw-yn cw-yn--${c.tone}">${escHtml(c.t)}</span>`;
}

function matrixHtml() {
  const rows = CW_MATRIX.map((m) => `
    <tr tabindex="0" role="button" data-tech="${m.id}" title="Full trade-off">
      <th scope="row"${m.tip ? ` data-tip="${m.tip}"` : ''}>${escHtml(m.name)}</th>
      <td>${toneCell(m.exact)}</td>
      <td>${toneCell(m.past)}</td>
      <td>${toneCell(m.size)}</td>
      <td class="cw-table__when">${escHtml(m.when)}</td>
    </tr>`).join('');
  return `
    <div class="cw-tablewrap">
      <table class="cw-table">
        <thead><tr>
          <th>Technique</th><th>Exact values</th><th>Old topics</th><th>Request size</th><th>Reach for it when</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function inspectTechnique(id) {
  const m = CW_MATRIX.find((x) => x.id === id);
  if (!m) return;
  const d = m.detail;
  const li = (arr) => arr.map((x) => `<li>${x}</li>`).join('');
  openInspector(m.name, `
    <p class="insp-blurb">${d.how}</p>
    <ul class="mcp-list mcp-list--pro">${li(d.pros)}</ul>
    <ul class="mcp-list mcp-list--con">${li(d.cons)}</ul>
    <p class="insp-blurb"><strong>Reach for it when:</strong> ${d.use}</p>
    ${state.examMode && d.exam ? `<p class="insp-foot">${d.exam}</p>` : ''}
  `);
}

function issuesHtml() {
  return CW_ISSUES.map((i) => `
    <div class="cw-issue">
      <div class="cw-issue__symptom">${escHtml(i.symptom)}</div>
      <div class="cw-issue__row"><span class="cw-issue__tag">cause</span><p>${i.cause}</p></div>
      <div class="cw-issue__row"><span class="cw-issue__tag cw-issue__tag--fix">fix</span><p>${i.fix}</p></div>
      ${i.flag && ANTIPATTERNS[i.flag] ? `<div class="loop-flag">${flagHtml(ANTIPATTERNS[i.flag])}</div>` : ''}
    </div>`).join('');
}

// ── Mount ────────────────────────────────────────────────────
export function mountContext(root) {
  stop();
  root.innerHTML = `
    <section class="lab lab-cw">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">Conversation memory: what ships in the next request</h2>
          <p class="lab__lead">The API is stateless — each turn re-sends the whole <span data-tip="context_window">context window</span>: system prompt, history, tool results. When a chat outgrows its budget, <em>something</em> must be dropped, and the strategy you pick decides what the model can still know. Left: the chat both sides see. Right: what actually reaches the model. (Watch drift happen live in the <a href="#loop" id="cwLoopLink">Agent Loop lab’s “Sixty turns in character” run</a>.)</p>
        </div>
      </header>

      <div class="chip-row" id="cwScenarios"></div>
      <p class="loop-blurb" id="cwBlurb"></p>

      <div class="loop-toolbar">
        <div class="transport">
          <button class="btn btn--secondary btn--sm" id="cwReset" title="Reset">↺ Reset</button>
          <button class="btn btn--secondary btn--sm" id="cwBack" title="Previous turn">‹ Back</button>
          <button class="btn btn--primary btn--sm" id="cwPlay">▶ Play</button>
          <button class="btn btn--secondary btn--sm" id="cwStep" title="Next turn">Step ›</button>
          <span class="loop-step-label" id="cwStepLabel"></span>
        </div>
        <div class="view-toggle" role="group" aria-label="Strategy" id="cwStrats"></div>
      </div>
      <p class="cw-how" id="cwHow"></p>

      <div class="cw-grid">
        <div class="cw-pane">
          <div class="cw-pane__head"><span>The conversation</span><span id="cwChatMeta"></span></div>
          <div class="loop-log loop-log--chat cw-chat" id="cwChat"></div>
        </div>
        <div class="cw-pane">
          <div class="cw-pane__head"><span>The next request</span><span id="cwTok"></span></div>
          <div class="ctx-meter__track cw-meter"><div class="ctx-meter__fill" id="cwFill"></div></div>
          <div class="cw-stack" id="cwStack"></div>
        </div>
      </div>

      <div class="loop-note is-empty" id="cwNote"></div>
      <div class="loop-flag" id="cwFlag" hidden></div>
      <div class="cw-verdict" id="cwVerdict"></div>

      <div class="lab-sub">
        <h3>Pick the technique by what must survive</h3>
        <p class="lab__lead">Five tools, one question: what happens to an exact number — and to a topic from forty turns ago? Click a row for the full trade-off.</p>
        ${matrixHtml()}
      </div>

      <div class="lab-sub">
        <h3>The recurring failures</h3>
        <p class="lab__lead">Four symptoms long conversations keep producing. The cause is never “the model forgot” — it is always something about what the request did or didn’t contain.</p>
        <div class="cw-issues">${issuesHtml()}</div>
      </div>
    </section>`;

  buildScenarioChips();
  buildStrategyTabs();

  root.querySelector('#cwScenarios').addEventListener('click', (e) => {
    const b = e.target.closest('[data-scen]'); if (b) selectScenario(b.dataset.scen);
  });
  root.querySelector('#cwStrats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-strat]'); if (b) selectStrategy(b.dataset.strat);
  });
  root.querySelector('#cwPlay').addEventListener('click', () => { S.playing ? stop() : play(); paint(); });
  root.querySelector('#cwStep').addEventListener('click', () => { stop(); advance(); });
  root.querySelector('#cwBack').addEventListener('click', () => { stop(); if (S.step > 0) S.step--; paint(); });
  root.querySelector('#cwReset').addEventListener('click', () => { stop(); S.step = 0; paint(); });

  // Technique rows open the inspector (click or Enter/Space).
  const table = root.querySelector('.cw-table');
  table.addEventListener('click', (e) => {
    const tr = e.target.closest('[data-tech]'); if (tr) inspectTechnique(tr.dataset.tech);
  });
  table.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tr = e.target.closest('[data-tech]');
    if (tr) { e.preventDefault(); inspectTechnique(tr.dataset.tech); }
  });

  // Deep-link into the Agent Loop lab landing on the drift run.
  // Navigation is the href="#loop" hashchange; this only parks the
  // run id for mountLoop (same pattern as the loop → SDK link).
  root.querySelector('#cwLoopLink').addEventListener('click', () => {
    try { sessionStorage.setItem('glassbox-open-loop-run', 'chat'); } catch { /* private mode */ }
  });

  paint();

  // render.js runs this before the next mount: a playing replay must
  // not keep ticking against a detached DOM.
  return stop;
}
