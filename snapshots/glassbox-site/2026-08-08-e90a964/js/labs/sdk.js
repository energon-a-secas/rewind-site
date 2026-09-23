// ── Lab 2: Agent SDK, level by level ─────────────────────────
// Six levels, each adding one layer of setup, then a config bench that
// checks a configuration against what the agent actually has to do.
//
// Escaping contract (see data/sdk.js, data/sdk-config.js): caveat body,
// `breaks`, `exam`, `why`, `gap` and note `text` carry inline
// <code>/<em>/<strong> and data-tip glossary spans, and render raw.
// Everything else is plain text and goes through escHtml.

import { SDK_LEVELS } from '../data/sdk.js';
import { CFG_FIELDS, CFG_GOALS, CFG_NOTES } from '../data/sdk-config.js';
import { state } from '../state.js';
import { escHtml, highlightCode, copyText } from '../utils.js';

const S = {
  level: 'l0',
  cfg: Object.fromEntries(CFG_FIELDS.map((f) => [f.id, f.def])),
  goals: new Set(['refund']),
};

const level = () => SDK_LEVELS.find((l) => l.id === S.level) || SDK_LEVELS[0];

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

      <div class="code-block">
        <div class="code-block__bar">
          <span class="code-block__lang">${l.lang === 'bash' ? 'shell' : 'python'}</span>
          <button class="code-copy" type="button" id="sdkCopy">Copy</button>
        </div>
        <pre><code>${highlightCode(l.code, l.lang)}</code></pre>
      </div>

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

// ── Config bench ─────────────────────────────────────────────

const TOOLS_NARROW = ['get_customer', 'lookup_order', 'process_refund', 'escalate_to_human'];

function buildSnippet() {
  const c = S.cfg;
  const tools = c.scope === 'narrow'
    ? TOOLS_NARROW.slice()
    : [...TOOLS_NARROW, 'search_docs', 'send_email', 'fetch_url', 'run_report', '...11 more'];
  if (c.task === 'on') tools.unshift('Task');

  const lines = [
    'agent = AgentDefinition(',
    '    name="support_agent",',
    '    description="Handles returns, billing and order issues",',
    '    system_prompt=SYSTEM_PROMPT,',
    '    allowed_tools=[',
    ...tools.map((t) => `        ${t.startsWith('...') ? `# ${t}` : `"${t}",`}`),
    '    ],',
    ')',
    '',
    `tool_choice = ${c.toolChoice === 'auto' ? '{"type": "auto"}'
      : c.toolChoice === 'any' ? '{"type": "any"}'
      : '{"type": "tool", "name": "extract_metadata"}'}`,
  ];
  if (c.pre === 'on') {
    lines.push('', '@hook("PreToolUse")', 'def enforce_limits(call): ...   # blocks in code');
  }
  if (c.post === 'on') {
    lines.push('', '@hook("PostToolUse")', 'def reshape(result): ...        # trims + normalises');
  }
  return lines.join('\n');
}

/** A `need` is satisfied when the current value matches the value or is in the list. */
function satisfied(need) {
  return Object.entries(need).every(([k, v]) =>
    (Array.isArray(v) ? v.includes(S.cfg[k]) : S.cfg[k] === v));
}

function matches(when) {
  return Object.entries(when).every(([k, v]) => S.cfg[k] === v);
}

function verdictHtml() {
  const chosen = CFG_GOALS.filter((g) => S.goals.has(g.id));
  const gaps = chosen.filter((g) => !satisfied(g.need));
  const met = chosen.filter((g) => satisfied(g.need));
  const notes = CFG_NOTES.filter((n) => matches(n.when));

  const head = !chosen.length
    ? '<div class="sdk-verdict__head is-idle">Pick what the agent has to do.</div>'
    : gaps.length
      ? `<div class="sdk-verdict__head is-gap">${gaps.length} requirement${gaps.length === 1 ? '' : 's'} not guaranteed by this config</div>`
      : '<div class="sdk-verdict__head is-ok">Every requirement is enforced, not just requested</div>';

  const gapList = gaps.map((g) => `
    <article class="sdk-gap">
      <h5>${escHtml(g.label)}</h5>
      <p class="sdk-gap__risk">${g.gap}</p>
      <p class="sdk-gap__fix">${g.why}</p>
      <span class="sdk-gap__ref">${escHtml(g.refs)}</span>
    </article>`).join('');

  const metList = met.map((g) => `<li>${escHtml(g.label)}</li>`).join('');

  return `
    ${head}
    ${gapList ? `<div class="sdk-gaps">${gapList}</div>` : ''}
    ${metList ? `<ul class="sdk-met">${metList}</ul>` : ''}
    ${notes.length ? `<ul class="sdk-notes">${notes.map((n) => `<li class="sdk-note sdk-note--${n.tone}">${n.text}</li>`).join('')}</ul>` : ''}`;
}

function renderBench() {
  const goals = CFG_GOALS.map((g) =>
    `<button class="chip${S.goals.has(g.id) ? ' is-active' : ''}" type="button" data-goal="${g.id}">${escHtml(g.label)}</button>`).join('');

  const knobs = CFG_FIELDS.map((f) => `
    <div class="sig">
      <div class="sig__label">${escHtml(f.label)}<em>${escHtml(f.hint)}</em></div>
      <div class="seg-group" data-cfg="${f.id}">
        ${f.options.map((o) => `<button class="seg${S.cfg[f.id] === o.v ? ' is-active' : ''}" type="button" data-v="${o.v}">${escHtml(o.label)}</button>`).join('')}
      </div>
    </div>`).join('');

  const bench = document.getElementById('sdkBench');
  if (!bench) return;
  bench.innerHTML = `
    <div class="sdk-bench__goals">
      <div class="sdk-sub">What does this agent have to do?</div>
      <div class="chip-row" id="sdkGoals">${goals}</div>
    </div>
    <div class="sdk-bench__grid">
      <div class="sdk-bench__knobs" id="sdkKnobs">
        <div class="sdk-sub">Settings</div>
        ${knobs}
      </div>
      <div class="sdk-bench__out">
        <div class="code-block code-block--sm">
          <div class="code-block__bar"><span class="code-block__lang">live config</span></div>
          <pre><code>${highlightCode(buildSnippet(), 'py')}</code></pre>
        </div>
        <div class="sdk-verdict" id="sdkVerdict">${verdictHtml()}</div>
      </div>
    </div>`;
}

function renderLevel() {
  const host = document.getElementById('sdkLevel');
  if (host) host.innerHTML = levelHtml();
  document.querySelectorAll('.sdk-step').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.level === S.level);
    b.setAttribute('aria-current', b.dataset.level === S.level ? 'step' : 'false');
  });
  // Keep the active step inside the stepper's faded viewport (horizontal
  // only — block:nearest never moves the page vertically).
  document.querySelector('.sdk-step.is-active')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
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

      <nav class="sdk-stepper" id="sdkStepper" aria-label="SDK levels">${stepper()}</nav>
      <div id="sdkLevel"></div>

      <section class="sdk-bench">
        <header class="sdk-bench__head">
          <h3>Config bench</h3>
          <p>Set the knobs against a requirement. The difference between a setting that <em>works</em> and one that is <em>guaranteed</em> is most of Domain 1.</p>
        </header>
        <div id="sdkBench"></div>
      </section>
    </section>`;

  renderLevel();
  renderBench();

  root.addEventListener('click', (e) => {
    const step = e.target.closest('.sdk-step');
    if (step) { setLevel(step.dataset.level); return; }

    const goto = e.target.closest('[data-goto]');
    if (goto) { setLevel(goto.dataset.goto); return; }

    if (e.target.closest('#sdkCopy')) { copyText(level().code, 'Snippet copied'); return; }

    const goal = e.target.closest('[data-goal]');
    if (goal) {
      const id = goal.dataset.goal;
      if (S.goals.has(id)) S.goals.delete(id); else S.goals.add(id);
      renderBench();
      return;
    }

    const seg = e.target.closest('.seg[data-v]');
    if (seg) {
      const group = seg.closest('[data-cfg]');
      if (!group) return;
      S.cfg[group.dataset.cfg] = seg.dataset.v;
      renderBench();
    }
  });

  // Exam mode emphasises the bench: that is where the judgement lives.
  // (The CSS hook lives on the .sdk-bench section, not the inner div.)
  if (state.examMode) root.querySelector('.sdk-bench')?.setAttribute('data-emphasis', 'on');
}
