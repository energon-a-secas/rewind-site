// ── Lab 5: Answer Playbook ───────────────────────────────────
// The exam brief, then the recurring decision patterns that settle
// most questions. Each pattern opens to tell / pick / reject.
//
// Escaping contract (see data/patterns.js): oneline, tells, pick and
// reject carry inline <code>/<b>/<em> and render raw. Everything else
// is plain text and goes through escHtml; the brief has no raw field.

import { EXAM_BRIEF } from '../data/exam-brief.js';
import { PATTERNS, PATTERN_GROUPS } from '../data/patterns.js';
import { state } from '../state.js';
import { escHtml } from '../utils.js';

const P = { filter: 'all', open: new Set() };

const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

/** Pattern ids under the active filter, in rank order. */
function visible() {
  if (P.filter === 'all') return PATTERNS;
  const g = PATTERN_GROUPS.find((x) => x.label === P.filter);
  return g ? PATTERNS.filter((p) => g.ids.includes(p.id)) : PATTERNS;
}

function brief() {
  const stats = EXAM_BRIEF.stats.map((s) => `
    <div class="brief__stat">
      <span class="brief__num">${escHtml(s.num)}</span>
      <span class="brief__cap">${escHtml(s.cap)}</span>
    </div>`).join('');

  const weights = EXAM_BRIEF.weights.map((w) => `
    <div class="weight">
      <span class="weight__label">${escHtml(w.label)}</span>
      <span class="weight__bar"><i style="width:${w.pct}%"></i></span>
      <span class="weight__pct">${w.pct}%</span>
    </div>`).join('');

  return `
    <div class="brief" data-section="Exam brief">
      <div class="brief__stats">${stats}</div>
      <div class="brief__weights">
        <div class="brief__sub">Domain weights · where the questions actually come from</div>
        ${weights}
      </div>
      <ul class="brief__notes">${EXAM_BRIEF.notes.map((n) => `<li>${escHtml(n)}</li>`).join('')}</ul>
      <details class="brief__scope">
        <summary>Not on the exam: stop studying these</summary>
        <ul>${EXAM_BRIEF.outOfScope.map((o) => `<li>${escHtml(o)}</li>`).join('')}</ul>
      </details>
    </div>`;
}

function col(kind, heading, items) {
  return `
    <div class="pat__col pat__col--${kind}">
      <h4>${heading}</h4>
      <ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>
    </div>`;
}

function patCard(p) {
  const open = P.open.has(p.id);
  const domains = p.domains.map((d) => `<span class="tag tag--domain">${escHtml(d.toUpperCase())}</span>`).join('');
  return `
    <article class="pat${open ? ' is-open' : ''}" data-id="${escHtml(p.id)}">
      <button class="pat__head" type="button" aria-expanded="${open}">
        <span class="pat__rank">${String(p.rank).padStart(2, '0')}</span>
        <span class="pat__titles">
          <span class="pat__title">${escHtml(p.title)}</span>
          <span class="pat__oneline">${p.oneline}</span>
        </span>
        <span class="pat__domains">${domains}</span>
        <span class="pat__chev" aria-hidden="true">${CHEVRON}</span>
      </button>
      <div class="pat__body">
        ${col('tell', 'The tell in the <span data-tip="stem">stem</span>', p.tells)}
        ${col('pick', 'Pick the option that', p.pick)}
        ${col('reject', 'Reject', p.reject)}
        <div class="pat__example">
          <span class="pat__example-tag">Worked</span>
          <p class="pat__example-stem">${escHtml(p.example.stem)}</p>
          <p class="pat__example-ans">${escHtml(p.example.answer)}</p>
        </div>
        <div class="pat__refs">${escHtml(p.example.ref)} · ${escHtml(p.refs)}</div>
      </div>
    </article>`;
}

function renderList() {
  const list = document.getElementById('patList');
  if (list) list.innerHTML = visible().map(patCard).join('');
}

function renderFilters() {
  const wrap = document.getElementById('patFilters');
  const chip = (val, label, n) =>
    `<button class="chip${P.filter === val ? ' is-active' : ''}" type="button" data-pat="${escHtml(val)}">${escHtml(label)} <span class="chip__n">${n}</span></button>`;
  wrap.innerHTML = chip('all', 'All patterns', PATTERNS.length)
    + PATTERN_GROUPS.map((g) => chip(g.label, g.label, g.ids.length)).join('');
}

/** Open + scroll to one pattern (used by the drill's pattern tags). */
function revealRequested() {
  let want = null;
  try { want = sessionStorage.getItem('glassbox-open-pattern'); sessionStorage.removeItem('glassbox-open-pattern'); } catch { /* private mode */ }
  if (!want) return;
  const p = PATTERNS.find((x) => x.id === want);
  if (!p) return;
  P.filter = 'all';
  P.open.add(p.id);
  renderFilters(); renderList();
  const node = document.querySelector(`.pat[data-id="${CSS.escape(p.id)}"]`);
  node?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  node?.classList.add('is-flash');
  setTimeout(() => node?.classList.remove('is-flash'), 1200);
}

export function mountPatterns(root) {
  root.innerHTML = `
    <section class="lab lab-patterns">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">The patterns that decide the answer</h2>
          <p class="lab__lead">Almost every question is a broken system and four plausible fixes, and the broken system is described in the <span data-tip="stem"><b>stem</b></span>: the scenario paragraph before the options. These are the recurring rules that separate the one that works from the three that look like it. Read the tell, then the shape of the winner.</p>
        </div>
      </header>

      ${brief()}

      <div class="pat-filters chip-row" id="patFilters" data-section="The 21 patterns"></div>
      <div class="pat-list" id="patList"></div>
    </section>`;

  renderFilters();
  renderList();

  root.querySelector('#patFilters').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    P.filter = b.dataset.pat;
    renderFilters(); renderList();
  });

  root.querySelector('#patList').addEventListener('click', (e) => {
    const head = e.target.closest('.pat__head');
    if (!head) return;
    const card = head.closest('.pat');
    const id = card.dataset.id;
    const open = !P.open.has(id);
    if (open) P.open.add(id); else P.open.delete(id);
    card.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', String(open));
  });

  // Exam mode expands everything: no hunting during a cram session.
  if (state.examMode) {
    PATTERNS.forEach((p) => P.open.add(p.id));
    renderList();
  }

  revealRequested();
}
