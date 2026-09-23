// ── Lab 2: Agent SDK, level by level ─────────────────────────
// Six levels, each adding one layer of setup, then the tool-definition
// section (labs/sdk-tools.js) and the config bench (labs/sdk-bench.js),
// both partials, so this file stays the level view plus the router.
//
// Escaping contract (see data/sdk.js): caveat body, `breaks` and `exam`
// carry inline <code>/<em>/<strong> and data-tip glossary spans, and
// render raw. Everything else is plain text and goes through escHtml.

import { SDK_LEVELS } from '../data/sdk.js';
import { SDK_TS, SDK_TS_ABSENT } from '../data/sdk-ts.js';
import { state } from '../state.js';
import { escHtml, highlightCode, copyText, keepInScroller } from '../utils.js';
import { langTabs, toolsHtml, toolsCode } from './sdk-tools.js';
import { benchHtml, benchClick, benchChange } from './sdk-bench.js';
import { sessionsHtml, sessionsClick } from './sdk-sessions.js';

// A level may carry `demo: 'id'` (data/sdk.js) to render an interactive
// example under its sample. Deliberately *not* a rail `data-section`:
// sections are scanned once per mount, and a block that appears only at
// one level would leave the rail claiming a section the reader cannot see.
const DEMOS = { sessions: sessionsHtml };

// The bench owns its own {cfg, goals}; see labs/sdk-bench.js.
const S = {
  level: 'l0',
  lang: 'py',           // one language for the whole lab: levels + tool section
};

const level = () => SDK_LEVELS.find((l) => l.id === S.level) || SDK_LEVELS[0];

// The code-block bar names the language the reader is looking at. A TS
// sample is tagged `lang: 'js'` for the highlighter (there is no ts
// dialect), so the label cannot come from that field alone.
const LANG_LABEL = { py: 'python', js: 'javascript', bash: 'shell' };

/** The sample to render for a level in the chosen language. Python is the
 *  canon (data/sdk.js); a TS variant overrides it where one exists, and
 *  where one deliberately does not, `absent` explains why instead of
 *  silently falling back and leaving the toggle looking broken. */
function shown(l) {
  const ts = S.lang === 'ts' ? SDK_TS[l.id] : null;
  if (ts) return { ...ts, label: 'typescript', absent: null };
  return {
    lang: l.lang,
    label: LANG_LABEL[l.lang] || l.lang,
    code: l.code,
    note: null,
    divergence: null,
    absent: S.lang === 'ts' ? SDK_TS_ABSENT[l.id] || null : null,
  };
}

// ── Level view ───────────────────────────────────────────────

function stepper() {
  return SDK_LEVELS.map((l) => `
    <button class="sdk-step${l.id === S.level ? ' is-active' : ''}" type="button" data-level="${l.id}"
            aria-current="${l.id === S.level ? 'step' : 'false'}">
      <span class="sdk-step__n">L${l.n}</span>
      <span class="sdk-step__label">${escHtml(l.title)}</span>
    </button>`).join('');
}

function keyRows(keys) {
  return keys.map((k) => `
    <div class="sdk-key">
      <code class="sdk-key__name">${escHtml(k.key)}</code>
      <span class="sdk-key__why">${escHtml(k.why)}</span>
    </div>`).join('');
}

function caveatCards(caveats) {
  return caveats.map((c) => `
    <article class="sdk-caveat">
      <h4>${escHtml(c.title)}</h4>
      <p>${c.body}</p>
    </article>`).join('');
}

function levelHtml() {
  const l = level();
  const prev = SDK_LEVELS[l.n - 1];
  const v = shown(l);
  return `
    <div class="sdk-level" data-level="${l.id}">
      <header class="sdk-level__head">
        <div class="sdk-level__titles">
          <span class="sdk-level__eyebrow">Level ${l.n}${prev ? ` · adds to L${prev.n}` : ' · the floor'}</span>
          <h3 class="sdk-level__title">${escHtml(l.title)}</h3>
          <p class="sdk-level__tagline">${escHtml(l.tagline)}</p>
        </div>
        <div class="sdk-level__goal"><span>Goal</span>${escHtml(l.goal)}</div>
      </header>

      ${langTabs(S.lang, 'level code')}
      <div class="code-block">
        <div class="code-block__bar">
          <span class="code-block__lang">${v.label}</span>
          <button class="code-copy" type="button" id="sdkCopy">Copy</button>
        </div>
        <pre><code>${highlightCode(v.code, v.lang)}</code></pre>
      </div>
      ${v.note ? `<p class="sdk-langnote">${v.note}</p>` : ''}
      ${v.absent ? `<p class="sdk-langnote sdk-langnote--absent"><span>Python only</span> ${v.absent}</p>` : ''}
      ${v.divergence ? `
        <div class="sdk-diverge">
          <span class="sdk-diverge__badge">${escHtml(v.divergence.badge)}</span>
          <p>${v.divergence.body}</p>
        </div>` : ''}
      ${l.demo && DEMOS[l.demo] ? DEMOS[l.demo]() : ''}

      <div class="sdk-keys">
        <h4 class="sdk-sub">What this level introduces</h4>
        ${keyRows(l.keys)}
      </div>

      <div class="sdk-ledger">
        <div class="sdk-ledger__col sdk-ledger__col--buys">
          <h4>What it buys you</h4>
          <p>${escHtml(l.buys)}</p>
        </div>
        <div class="sdk-ledger__col sdk-ledger__col--breaks">
          <h4>${l.n === SDK_LEVELS.length - 1 ? 'What is still on you' : 'What breaks if you stop here'}</h4>
          <p>${l.breaks}</p>
        </div>
      </div>

      <div class="sdk-caveats">
        <h4 class="sdk-sub">Caveats</h4>
        ${caveatCards(l.caveats)}
      </div>

      <div class="sdk-exam"><span>On the exam</span><p>${l.exam}</p></div>
      <div class="sdk-refs">${escHtml(l.refs)}</div>

      <div class="sdk-level__nav">
        ${l.n > 0 ? `<button class="btn btn--ghost" type="button" data-goto="${SDK_LEVELS[l.n - 1].id}">&larr; L${l.n - 1}</button>` : '<span></span>'}
        ${l.n < SDK_LEVELS.length - 1 ? `<button class="btn btn--primary" type="button" data-goto="${SDK_LEVELS[l.n + 1].id}">L${l.n + 1} · ${escHtml(SDK_LEVELS[l.n + 1].title)} &rarr;</button>` : '<span></span>'}
      </div>
    </div>`;
}

function renderLevel() {
  const host = document.getElementById('sdkLevel');
  if (host) host.innerHTML = levelHtml();
  // `[data-level]` matters: a language tab is a .sdk-step too, so an
  // unscoped sweep stripped is-active from both language navs on every
  // level render, and the level's own toggle came back unlit.
  document.querySelectorAll('.sdk-step[data-level]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.level === S.level);
    b.setAttribute('aria-current', b.dataset.level === S.level ? 'step' : 'false');
  });
  // Keep the active step inside the stepper's faded viewport. Its own
  // scroller only: `block: 'nearest'` does move the page when the stepper is
  // scrolled out of sight, which yanked the reader up out of the tool section
  // every time they flipped the language from down there.
  keepInScroller(document.querySelector('.sdk-stepper > .sdk-step.is-active'));
}

function renderTools() {
  const host = document.getElementById('sdkTools');
  if (host) host.innerHTML = toolsHtml(S.lang);
}

/** One language for the whole lab, set from either toggle. The two navs are
 *  the same control rendered twice, so both re-render. */
function setLang(lang) {
  if (!lang || lang === S.lang) return;
  const anchor = document.getElementById('sdkTools');
  const before = anchor?.getBoundingClientRect().top;
  S.lang = lang;
  renderLevel();
  renderTools();
  // The level sample above the tool section changes height between languages
  // (the TS loop is longer than the Python one), so without this a reader who
  // flipped the language from down here watches the page slide under them.
  const after = document.getElementById('sdkTools')?.getBoundingClientRect().top;
  if (typeof before === 'number' && typeof after === 'number' && Math.abs(after - before) > 1) {
    window.scrollBy(0, after - before);
  }
}

function setLevel(id) {
  if (!id || id === S.level) return;
  S.level = id;
  renderLevel();
  document.getElementById('sdkLevel')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

// ── Mount ────────────────────────────────────────────────────

export function mountSdk(root) {
  // Deep-linked from the Loop lab's steer-vs-enforce section: land on the
  // parked level (L3 Hooks), then clear the key so a manual visit starts
  // wherever the reader left off. Mirrors the drill → playbook precedent.
  try {
    const want = sessionStorage.getItem('glassbox-open-sdk-level');
    if (want && SDK_LEVELS.some((l) => l.id === want)) S.level = want;
    sessionStorage.removeItem('glassbox-open-sdk-level');
  } catch { /* private browsing: no sessionStorage, keep the current level */ }
  root.innerHTML = `
    <section class="lab lab-sdk">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">Building an agent, one setting at a time</h2>
          <p class="lab__lead">The Agent Loop lab shows the <span data-tip="agentic_loop">loop</span> Claude Code already runs for you. This is the part you write: six levels, each adding exactly one layer of configuration, with what it buys you and what still breaks if you stop there.</p>
        </div>
      </header>

      <div class="sdk-levels" data-section="The six levels">
        <nav class="sdk-stepper" id="sdkStepper" aria-label="SDK levels">${stepper()}</nav>
        <div id="sdkLevel"></div>
      </div>

      <section class="lab-sub sdk-tools" id="sdkTools" data-section="Defining a tool"></section>

      <section class="sdk-bench" data-section="Config bench">
        <header class="sdk-bench__head">
          <h3>Config bench</h3>
          <p>Set the knobs against a requirement and read the config that results: each knob carries the level that introduced it. The difference between a setting that <em>works</em> and one that is <em>guaranteed</em> is most of Domain 1.</p>
        </header>
        <div id="sdkBench"></div>
      </section>
    </section>`;

  renderLevel();
  renderTools();
  const bench = document.getElementById('sdkBench');
  if (bench) bench.innerHTML = benchHtml();

  root.addEventListener('click', (e) => {
    // Language first: a lang tab is also a .sdk-step (same component), so
    // testing for the step class first would swallow the click.
    const lang = e.target.closest('[data-lang]');
    if (lang) { setLang(lang.dataset.lang); return; }

    const step = e.target.closest('.sdk-step');
    if (step) { setLevel(step.dataset.level); return; }

    const goto = e.target.closest('[data-goto]');
    if (goto) { setLevel(goto.dataset.goto); return; }

    if (e.target.closest('#sdkCopy')) { copyText(shown(level()).code, 'Snippet copied'); return; }

    if (e.target.closest('#sdkToolsCopy')) {
      const t = toolsCode(S.lang);
      copyText(t.code, `${t.file} copied`);
      return;
    }

    // The level's own interactive demo (L5) keeps its state in its
    // partial; the level view is re-rendered from it.
    if (sessionsClick(e)) { renderLevel(); return; }

    // The case list, knobs, reset and copy all live in the bench partial,
    // which updates in place rather than rebuilding the panel.
    benchClick(e);
  });

  // The bench's case dropdown is the one control on this lab that reports
  // through `change` rather than `click`, so it needs its own delegate.
  root.addEventListener('change', benchChange);

  // Exam mode emphasises the bench: that is where the judgement lives.
  // (The CSS hook lives on the .sdk-bench section, not the inner div.)
  if (state.examMode) root.querySelector('.sdk-bench')?.setAttribute('data-emphasis', 'on');
}
