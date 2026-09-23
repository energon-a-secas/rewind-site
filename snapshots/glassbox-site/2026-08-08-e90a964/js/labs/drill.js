// ── Lab 8: Question Drill ────────────────────────────────────
// Filter a set, answer it, get the reasoning for every option, then a
// weighted score estimate and a breakdown of what you actually missed.
//
// Option letters are never shuffled: `distractors` is keyed by letter
// and the guide's own explanations refer to them ("Why C"). Question
// order is shuffled; the set is otherwise deterministic.

import { QUESTIONS, SCENARIOS, DOMAINS, LEVELS, SCENARIO_BY_ID, DOMAIN_BY_ID, PATTERN_ALIASES } from '../data/questions/index.js';
import { PATTERNS } from '../data/patterns.js';
import { codeify, escHtml, showToast } from '../utils.js';

const PASS = 720;

// A question's pattern label → a Playbook card id, so the tag can deep-link.
// Exact title match first, then the curated alias map. Labels finer-grained
// than any card simply do not link.
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const PLAYBOOK = new Map(PATTERNS.map((p) => [norm(p.title), p.id]));
const ALIASES = new Map(Object.entries(PATTERN_ALIASES).map(([k, v]) => [norm(k), v]));
const VALID = new Set(PATTERNS.map((p) => p.id));

function playbookId(label) {
  const k = norm(label);
  const id = PLAYBOOK.get(k) || ALIASES.get(k) || null;
  return id && VALID.has(id) ? id : null;
}

const D = {
  view: 'setup',            // setup | run | result
  scenario: new Set(),      // empty set = no filter
  domain: new Set(),
  level: new Set(),
  instant: true,
  set: [],                  // questions in play
  i: 0,
  picks: {},                // question id → chosen letter
  revealed: false,
};

// ── Selection ────────────────────────────────────────────────

function pool() {
  return QUESTIONS.filter((q) =>
    (!D.scenario.size || D.scenario.has(q.scenario))
    && (!D.domain.size || D.domain.has(q.domain))
    && (!D.level.size || D.level.has(q.level)));
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const current = () => D.set[D.i];
const correctCount = () => D.set.filter((q) => D.picks[q.id] === q.answer).length;

/**
 * Weighted score estimate on the exam's 100-1000 scale. Each domain
 * contributes its published weight, renormalised over the domains the
 * drill actually covered, so a Tools-only set is not scored as if it
 * were a full exam. Estimate only - not an official conversion.
 */
function scaled() {
  const present = DOMAINS.filter((d) => D.set.some((q) => q.domain === d.id));
  const totalPct = present.reduce((s, d) => s + d.pct, 0) || 1;
  let acc = 0;
  present.forEach((d) => {
    const qs = D.set.filter((q) => q.domain === d.id);
    const right = qs.filter((q) => D.picks[q.id] === q.answer).length;
    acc += (right / qs.length) * (d.pct / totalPct);
  });
  return { score: Math.round(100 + 900 * acc), acc };
}

// ── Setup view ───────────────────────────────────────────────

function chipRow(kind, items, sel) {
  return items.map((it) => {
    const n = QUESTIONS.filter((q) => q[kind] === it.id).length;
    const label = it.short || it.label;
    const flag = it.guide === false ? '<span class="chip__flag" title="Exam scenario with no questions in the official practice test">+</span>' : '';
    return `<button class="chip${sel.has(it.id) ? ' is-active' : ''}" type="button" data-kind="${kind}" data-id="${escHtml(it.id)}" title="${escHtml(it.hint || it.label)}">${escHtml(label)}${flag} <span class="chip__n">${n}</span></button>`;
  }).join('');
}

function renderSetup() {
  const n = pool().length;
  const wrap = document.getElementById('drillSetup');
  wrap.innerHTML = `
    <div class="drill-filters">
      <div class="drill-filter">
        <span class="drill-filter__label">Scenario <em>${SCENARIOS.length}</em></span>
        <div class="chip-row" data-filter="scenario">${chipRow('scenario', SCENARIOS, D.scenario)}</div>
      </div>
      <div class="drill-filter">
        <span class="drill-filter__label">Domain <em>weighted</em></span>
        <div class="chip-row" data-filter="domain">${chipRow('domain', DOMAINS, D.domain)}</div>
      </div>
      <div class="drill-filter">
        <span class="drill-filter__label">Difficulty</span>
        <div class="chip-row" data-filter="level">${chipRow('level', LEVELS, D.level)}</div>
      </div>
    </div>
    <p class="drill-note">Nothing selected means everything. <b>+</b> marks the two exam scenarios the official practice test leaves empty · those questions are written here from the guide&rsquo;s theory chapters.</p>
    <div class="drill-launch">
      <label class="switch">
        <input type="checkbox" id="drillInstant"${D.instant ? ' checked' : ''}>
        <span class="switch__track"><span class="switch__thumb"></span></span>
        <span class="switch__label">Explain after each answer</span>
      </label>
      <button class="btn btn--primary" id="drillStart"${n ? '' : ' disabled'}>Start drill · <span id="drillCount">${n}</span> question${n === 1 ? '' : 's'}</button>
    </div>`;
}

// ── Run view ─────────────────────────────────────────────────

function optionRow(q, o) {
  const pick = D.picks[q.id];
  const cls = ['opt'];
  if (D.revealed) {
    if (o.k === q.answer) cls.push('is-correct');
    else if (o.k === pick) cls.push('is-wrong');
  } else if (o.k === pick) cls.push('is-picked');
  return `
    <button class="${cls.join(' ')}" type="button" data-k="${o.k}"${D.revealed ? ' disabled' : ''}>
      <span class="opt__letter">${o.k}</span>
      <span class="opt__text">${codeify(o.t)}</span>
      <span class="opt__mark" aria-hidden="true"></span>
    </button>`;
}

function revealHtml(q) {
  const pick = D.picks[q.id];
  const right = pick === q.answer;
  const others = q.options.filter((o) => o.k !== q.answer);
  const pid = playbookId(q.pattern);
  const last = D.i === D.set.length - 1;
  return `
    <div class="q__reveal">
      <div class="q__verdict ${right ? 'is-right' : 'is-wrong'}">${right ? 'Correct' : `You picked ${pick} · the answer is ${q.answer}`}</div>
      <div class="q__why"><h4>Why ${q.answer}</h4><p>${codeify(q.why)}</p></div>
      <ul class="q__distractors">
        ${others.map((o) => `<li${o.k === pick ? ' class="is-yours"' : ''}><b>${o.k}</b><span>${codeify(q.distractors[o.k] || '')}</span></li>`).join('')}
      </ul>
      <div class="q__foot">
        <a class="q__pattern" href="#patterns"${pid ? ` data-pattern="${escHtml(pid)}"` : ''}><span>Pattern</span>${escHtml(q.pattern)}</a>
        <span class="q__source">${escHtml(q.source)}</span>
      </div>
      <div class="q__nav"><button class="btn btn--primary" id="drillNext">${last ? 'See results' : 'Next question'}</button></div>
    </div>`;
}

function renderRun() {
  const q = current();
  const done = D.i + (D.revealed ? 1 : 0);
  const pct = Math.round((done / D.set.length) * 100);
  const s = SCENARIO_BY_ID[q.scenario];
  const d = DOMAIN_BY_ID[q.domain];
  document.getElementById('drillRun').innerHTML = `
    <div class="drill-bar">
      <div class="meter"><i style="width:${pct}%"></i></div>
      <span class="drill-bar__pos">Question ${D.i + 1} of ${D.set.length}</span>
      <span class="drill-bar__score">${correctCount()} correct</span>
      <button class="btn btn--ghost btn--sm" id="drillQuit">End drill</button>
    </div>
    <article class="q" id="drillQ">
      <div class="q__tags">
        <span class="tag tag--scenario">${escHtml(s.label)}</span>
        <span class="tag tag--domain">${escHtml(d.short)} &middot; ${d.pct}%</span>
        <span class="tag tag--level">${q.level === 'hard' ? 'Hard' : 'Core'}</span>
      </div>
      <p class="q__situation">${codeify(q.situation)}</p>
      <h3 class="q__ask">${codeify(q.ask)}</h3>
      <div class="q__options">${q.options.map((o) => optionRow(q, o)).join('')}</div>
      ${D.revealed ? revealHtml(q) : ''}
    </article>`;
  if (D.revealed) document.querySelector('.q__reveal')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function pick(k) {
  const q = current();
  if (D.revealed) return;
  D.picks[q.id] = k;
  if (D.instant) { D.revealed = true; renderRun(); return; }
  next();
}

function next() {
  if (D.i >= D.set.length - 1) { finish(); return; }
  D.i += 1;
  D.revealed = false;
  renderRun();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Result view ──────────────────────────────────────────────

function renderResult() {
  const { score } = scaled();
  const passed = score >= PASS;
  const right = correctCount();

  const domains = DOMAINS.filter((d) => D.set.some((q) => q.domain === d.id)).map((d) => {
    const qs = D.set.filter((q) => q.domain === d.id);
    const ok = qs.filter((q) => D.picks[q.id] === q.answer).length;
    const pct = Math.round((ok / qs.length) * 100);
    return `
      <div class="weight${pct < 70 ? ' is-weak' : ''}">
        <span class="weight__label">${escHtml(d.label)} <em>${d.pct}%</em></span>
        <span class="weight__bar"><i style="width:${pct}%"></i></span>
        <span class="weight__pct">${ok}/${qs.length}</span>
      </div>`;
  }).join('');

  const missed = D.set.filter((q) => D.picks[q.id] !== q.answer);
  const byPattern = {};
  missed.forEach((q) => { (byPattern[q.pattern] = byPattern[q.pattern] || []).push(q); });
  const missedHtml = missed.length
    ? `<ul class="missed-list">${Object.entries(byPattern).sort((a, b) => b[1].length - a[1].length).map(([label, qs]) => {
        const pid = playbookId(label);
        // Linked entries are real anchors: focusable, Enter-activatable, and
        // announced as links. Unlinked ones stay inert <b>.
        const name = pid
          ? `<a class="missed__pattern" href="#patterns" data-pattern="${escHtml(pid)}">${escHtml(label)}</a>`
          : `<b>${escHtml(label)}</b>`;
        return `<li class="missed">${name}<span>${qs.length} question${qs.length === 1 ? '' : 's'} · ${qs.map((q) => escHtml(SCENARIO_BY_ID[q.scenario].short)).join(', ')}</span></li>`;
      }).join('')}</ul>`
    : '<p class="missed-none">Nothing missed. Run a harder set or widen the filters.</p>';

  document.getElementById('drillResult').innerHTML = `
    <div class="score">
      <div class="score__ring" style="--pct:${Math.min(100, Math.round(((score - 100) / 900) * 100))}">
        <span class="score__num">${score}</span>
      </div>
      <div class="score__caption">
        <b class="${passed ? 'is-pass' : 'is-fail'}">${passed ? 'Above the line' : 'Below the line'}</b>
        <span>${right}/${D.set.length} correct · estimated scaled score, ${PASS} to pass</span>
        <span class="score__disclaimer">Domain-weighted estimate on the published 100-1000 scale, not an official conversion.</span>
      </div>
    </div>
    <div class="result-domains">
      <h4>By domain</h4>
      ${domains}
    </div>
    <div class="result-missed">
      <h4>Patterns behind your misses</h4>
      ${missedHtml}
    </div>
    <div class="result-actions">
      ${missed.length ? `<button class="btn btn--primary" id="drillRetry">Retry the ${missed.length} you missed</button>` : ''}
      <button class="btn btn--ghost" id="drillRestart">New drill</button>
    </div>`;
}

// ── View switching ───────────────────────────────────────────

function show(view) {
  D.view = view;
  ['setup', 'run', 'result'].forEach((v) => {
    const node = document.getElementById(`drill${v[0].toUpperCase()}${v.slice(1)}`);
    if (node) node.hidden = v !== view;
  });
  // While a drill is running the digit keys answer instead of switching labs.
  document.body.dataset.capture = view === 'run' ? 'keys' : '';
  if (view === 'setup') renderSetup();
  if (view === 'run') renderRun();
  if (view === 'result') renderResult();
}

function start(qs) {
  if (!qs.length) { showToast('No questions match those filters'); return; }
  D.set = shuffled(qs);
  D.i = 0; D.picks = {}; D.revealed = false;
  show('run');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function finish() {
  D.revealed = false;
  show('result');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gotoPattern(id) {
  try { sessionStorage.setItem('glassbox-open-pattern', id); } catch { /* private mode */ }
}

// ── Mount ────────────────────────────────────────────────────

export function mountDrill(root) {
  root.innerHTML = `
    <section class="lab lab-drill">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">Drill the question bank</h2>
          <p class="lab__lead">${QUESTIONS.length} scenario questions in the exam&rsquo;s own format · one stem, four plausible fixes, one that is most effective. Every answer comes back with the reasoning for the winner and for each option you rejected.</p>
        </div>
      </header>
      <div class="drill-setup" id="drillSetup"></div>
      <div class="drill-run" id="drillRun" hidden></div>
      <div class="drill-result" id="drillResult" hidden></div>
    </section>`;

  show('setup');

  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip[data-kind]');
    if (chip) {
      const set = D[chip.dataset.kind];
      const id = chip.dataset.id;
      if (set.has(id)) set.delete(id); else set.add(id);
      renderSetup();
      return;
    }
    if (e.target.closest('#drillStart')) { start(pool()); return; }
    const opt = e.target.closest('.opt');
    if (opt && !opt.disabled) { pick(opt.dataset.k); return; }
    if (e.target.closest('#drillNext')) { next(); return; }
    if (e.target.closest('#drillQuit')) { show('setup'); return; }
    if (e.target.closest('#drillRestart')) { show('setup'); return; }
    if (e.target.closest('#drillRetry')) {
      start(D.set.filter((q) => D.picks[q.id] !== q.answer));
      return;
    }
    const pat = e.target.closest('[data-pattern]');
    if (pat) gotoPattern(pat.dataset.pattern);
  });

  root.addEventListener('change', (e) => {
    if (e.target.id === 'drillInstant') D.instant = e.target.checked;
  });

  // Digits 1-4 and letters A-D answer; Enter advances. Only while running.
  // Bound once on document: the lab remounts on every tab switch.
  if (!mountDrill._keys) {
    mountDrill._keys = true;
    document.addEventListener('keydown', (e) => {
      if (D.view !== 'run' || document.body.dataset.lab !== 'drill') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.matches('input, textarea, select')) return;
      const k = e.key.toUpperCase();
      const letter = 'ABCD'.includes(k) ? k : ('1234'.includes(k) ? 'ABCD'['1234'.indexOf(k)] : null);
      if (letter) { e.preventDefault(); pick(letter); return; }
      if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && D.revealed) { e.preventDefault(); next(); }
    });
  }
}
