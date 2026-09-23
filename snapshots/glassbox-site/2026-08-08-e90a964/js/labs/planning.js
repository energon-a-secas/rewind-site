// ── Lab 4: Planning vs Direct decider ────────────────────────
// Set the signals (or load a preset) and the console decides, by
// the guide's rules: PLAN if any signal is a plan trigger.

import { PLANNING_SIGNALS, PLANNING_CASES, PLANNING_NOTES } from '../data/planning.js';
import { el, escHtml } from '../utils.js';

const P = { signals: {} };

function defaults() {
  const s = {};
  PLANNING_SIGNALS.forEach((sig) => { s[sig.id] = sig.options[0].v; });
  return s;
}

function evaluate() {
  const fired = [];
  PLANNING_SIGNALS.forEach((sig) => {
    if (sig.planWhen.includes(P.signals[sig.id])) fired.push(sig.reason);
  });
  return { verdict: fired.length ? 'plan' : 'direct', fired };
}

function renderSignals() {
  const wrap = document.getElementById('planSignals');
  wrap.innerHTML = PLANNING_SIGNALS.map((sig) => `
    <div class="sig">
      <div class="sig__label">${escHtml(sig.label)}</div>
      <div class="seg-group" data-sig="${sig.id}">
        ${sig.options.map((o) => `<button class="seg${P.signals[sig.id] === o.v ? ' is-active' : ''}" data-v="${o.v}">${escHtml(o.label)}</button>`).join('')}
      </div>
    </div>`).join('');
}

function renderVerdict() {
  const { verdict, fired } = evaluate();
  const box = document.getElementById('planVerdict');
  const note = PLANNING_NOTES[verdict];
  const reasons = verdict === 'plan'
    ? `<ul class="verdict__reasons">${fired.map((r) => `<li>${escHtml(r)}</li>`).join('')}</ul>`
    : `<p class="verdict__reasons verdict__reasons--ok">No plan triggers. The change is contained and unambiguous, so a plan is just overhead.</p>`;
  box.className = `verdict verdict--${verdict}`;
  box.innerHTML = `
    <div class="verdict__badge">${verdict === 'plan' ? 'Planning mode' : 'Direct execution'}</div>
    <div class="verdict__body">
      <div class="verdict__why"><h4>${escHtml(note.title)}</h4>${reasons}</div>
      <ul class="verdict__points">${note.points.map((p) => `<li>${escHtml(p)}</li>`).join('')}</ul>
    </div>`;
}

function renderCases() {
  const wrap = document.getElementById('planCases');
  wrap.innerHTML = PLANNING_CASES.map((c) => `<button class="case" data-case="${c.id}"><span class="case__task">${escHtml(c.task)}</span><span class="case__hint">${escHtml(c.hint)}</span></button>`).join('');
}

function loadCase(id) {
  const c = PLANNING_CASES.find((x) => x.id === id);
  if (!c) return;
  P.signals = { ...c.signals };
  renderSignals(); renderVerdict();
  document.querySelectorAll('.case').forEach((b) => b.classList.toggle('is-active', b.dataset.case === id));
}

export function mountPlanning(root) {
  P.signals = defaults();
  root.innerHTML = `
    <section class="lab lab-planning">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">Should Claude <span data-tip="planning_mode">plan</span> first, or just do it?</h2>
          <p class="lab__lead">The console auto-decides from the same signals the guide uses. Load a scenario or set the dials yourself, then watch the verdict flip.</p>
        </div>
      </header>

      <div class="plan-cases-wrap">
        <div class="plan-sub-label">Load a scenario</div>
        <div class="plan-cases" id="planCases"></div>
      </div>

      <div class="plan-grid">
        <div class="plan-signals-wrap">
          <div class="plan-sub-label">Signals</div>
          <div id="planSignals"></div>
        </div>
        <div class="verdict" id="planVerdict"></div>
      </div>

      <div class="plan-combined"><span class="plan-combined__tag">the real workflow</span> ${escHtml(PLANNING_NOTES.combined)}</div>
    </section>`;

  renderCases(); renderSignals(); renderVerdict();

  root.querySelector('#planSignals').addEventListener('click', (e) => {
    const b = e.target.closest('.seg'); if (!b) return;
    const group = b.closest('[data-sig]');
    P.signals[group.dataset.sig] = b.dataset.v;
    document.querySelectorAll('.case').forEach((c) => c.classList.remove('is-active'));
    renderSignals(); renderVerdict();
  });
  root.querySelector('#planCases').addEventListener('click', (e) => {
    const b = e.target.closest('.case'); if (b) loadCase(b.dataset.case);
  });
}
