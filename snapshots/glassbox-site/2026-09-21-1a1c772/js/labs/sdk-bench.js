// ── Config bench (partial of labs/sdk.js, not a lab) ─────────
// Pick what the agent has to do, set the knobs, read the config that
// results. The load-bearing behaviour: a requirement you pick has to show
// up *in the config* (as a hook, a tool_choice, a delegated tool) and
// when the knobs cannot deliver it, the snippet gains a commented GAP
// block exactly where the missing structure would go. A verdict card
// underneath is a footnote; the code is the answer.
//
// Laid out as three numbered steps, and that is a fix rather than a
// decoration: as one chip row above a 300px knob column, picking the case
// and tuning the knobs read as one undifferentiated bank of controls, so
// a reported gap could not be traced back to the requirement that raised
// it. Now step 1 states the case (a dropdown adds one; each lands as a
// row carrying its own verdict and the setting it rides on), step 2 tunes
// the settings with the riding requirements badged *on the knob*, and
// step 3 is the config plus the gaps. The chain a reader has to follow
// -- requirement -> knob -> line of config -- is the layout.
//
// Escaping contract (see data/sdk-config.js): goal `why`/`gap` and note
// `text` render RAW (inline <code>/<em> + data-tip spans). Everything
// else is plain text via escHtml. The snippet is assembled as plain text
// and goes through highlightCode, which escapes.

import { CFG_FIELDS, CFG_GOALS, CFG_NOTES } from '../data/sdk-config.js';
import { escHtml, highlightCode, copyText } from '../utils.js';

const B = {
  cfg: Object.fromEntries(CFG_FIELDS.map((f) => [f.id, f.def])),
  goals: new Set(['refund']),
};

const TOOLS_NARROW = ['get_customer', 'lookup_order', 'process_refund', 'escalate_to_human'];
const TOOLS_EXTRA = ['search_docs', 'send_email', 'fetch_url', 'run_report', '...11 more'];

/** A `need` is satisfied when the current value matches, or is in the list. */
function satisfied(need) {
  return Object.entries(need).every(([k, v]) =>
    (Array.isArray(v) ? v.includes(B.cfg[k]) : B.cfg[k] === v));
}

function matches(when) {
  return Object.entries(when).every(([k, v]) => B.cfg[k] === v);
}

const chosen = () => CFG_GOALS.filter((g) => B.goals.has(g.id));

/** Which chosen requirements ride on each knob, split by whether the
 *  knob's current value delivers them. This is what lets the snippet
 *  name the requirement at the line responsible for it. */
function needsByField() {
  const map = {};
  chosen().forEach((g) => {
    const ok = satisfied(g.need);
    Object.keys(g.need).forEach((f) => {
      map[f] = map[f] || { met: [], gap: [] };
      map[f][ok ? 'met' : 'gap'].push(g.label);
    });
  });
  return map;
}

// ── The snippet ──────────────────────────────────────────────
// Built as marked lines, not one string: a line carries `mark` so the
// renderer can tint the structure a requirement lands on. Continuation
// lines align under the first label instead of repeating the verb, which
// keeps every comment inside the column at phone width.

function annot(kind, labels, indent = '') {
  const head = kind === 'gap' ? '# GAP: ' : '# ENFORCES: ';
  const cont = `#${' '.repeat(head.length - 1)}`;
  return labels.map((l, i) => ({ t: indent + (i ? cont : head) + l, mark: kind }));
}

function buildLines() {
  const c = B.cfg;
  const n = needsByField();
  const out = [];
  const push = (t, mark) => out.push({ t, mark: mark || null });

  push('agent = AgentDefinition(');
  push('    name="support_agent",');
  push('    description="Handles returns, billing and order issues",');
  push('    system_prompt=SYSTEM_PROMPT,');
  if (c.scope === 'wide') push('    allowed_tools=[            # 18 tools: selection degrades', 'warn');
  else push('    allowed_tools=[');

  // The Task tool is a member of the toolset, so its requirement is
  // answered inside the list; the gap sits where the entry is missing.
  const t = n.task;
  if (c.task === 'on') {
    if (t?.met.length) out.push(...annot('ok', t.met, '        '));
    push('        "Task",', t?.met.length ? 'ok' : null);
  } else if (t?.gap.length) {
    out.push(...annot('gap', t.gap, '        '));
    push('        # "Task",   <- not in the toolset', 'gap');
  }
  TOOLS_NARROW.forEach((name) => push(`        "${name}",`));
  if (c.scope === 'wide') {
    TOOLS_EXTRA.forEach((name) => push(`        ${name.startsWith('...') ? `# ${name}` : `"${name}",`}`, 'warn'));
  }
  push('    ],');
  push(')');
  push('');

  // tool_choice is one line, so the requirement's verdict lands on the
  // line itself rather than on a block below its annotation.
  const tc = n.toolChoice;
  if (tc?.gap.length) out.push(...annot('gap', tc.gap));
  if (tc?.met.length) out.push(...annot('ok', tc.met));
  push(`tool_choice = ${
    c.toolChoice === 'auto' ? '{"type": "auto"}'
      : c.toolChoice === 'any' ? '{"type": "any"}'
        : '{"type": "tool", "name": "extract_metadata"}'}`,
  tc?.gap.length ? 'gap' : tc?.met.length ? 'ok' : null);

  [['pre', 'PreToolUse', 'def enforce_limits(call): ...   # blocks in code'],
    ['post', 'PostToolUse', 'def reshape(result): ...        # trims + normalises'],
  ].forEach(([field, hook, body]) => {
    const f = n[field];
    if (c[field] === 'on') {
      push('');
      if (f?.met.length) out.push(...annot('ok', f.met));
      push(`@hook("${hook}")`, f?.met.length ? 'ok' : null);
      push(body, f?.met.length ? 'ok' : null);
    } else if (f?.gap.length) {
      push('');
      out.push(...annot('gap', f.gap));
      push(`# @hook("${hook}")`, 'gap');
      push(`# ${body.split('#')[0].trim()}`, 'gap');
    }
  });

  return out;
}

const snippetText = () => buildLines().map((l) => l.t).join('\n');

function snippetHtml() {
  return buildLines().map((l) => {
    const cls = `cline${l.mark ? ` cline--${l.mark}` : ''}`;
    return `<span class="${cls}">${l.t ? highlightCode(l.t, 'py') : '&nbsp;'}</span>`;
  }).join('');
}

// ── The verdict, a footnote to the snippet ───────────────────

function verdictHtml() {
  const picked = chosen();
  const gaps = picked.filter((g) => !satisfied(g.need));
  const met = picked.filter((g) => satisfied(g.need));
  const notes = CFG_NOTES.filter((n) => matches(n.when));

  const head = !picked.length
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

// ── Render ───────────────────────────────────────────────────

/** "PreToolUse hook = on", "tool_choice = any or named tool". Built from
 *  CFG_FIELDS so a renamed option label can never drift from the rule. */
function needText(need) {
  return Object.entries(need).map(([k, v]) => {
    const f = CFG_FIELDS.find((x) => x.id === k);
    if (!f) return k;
    const vals = (Array.isArray(v) ? v : [v])
      .map((x) => f.options.find((o) => o.v === x)?.label || x);
    return `${escHtml(f.label)} = ${escHtml(vals.join(' or '))}`;
  }).join(' &middot; ');
}

/** Only the requirements not already in the case. The dropdown empties as
 *  the case fills, which is what makes "you have picked them all" legible
 *  without a count. */
function pickOptionsHtml() {
  const left = CFG_GOALS.filter((g) => !B.goals.has(g.id));
  const opts = left.map((g) =>
    `<option value="${escHtml(g.id)}">${escHtml(g.label)}</option>`).join('');
  return `<option value="">${left.length ? 'Choose a requirement\u2026' : 'All seven are in the case'}</option>${opts}`;
}

function caseListHtml() {
  const picked = chosen();
  if (!picked.length) {
    return `<li class="case-empty">No requirements yet. The config below is a default agent \u2014 it enforces nothing because nothing has been asked of it.</li>`;
  }
  return picked.map((g) => {
    const ok = satisfied(g.need);
    return `
      <li class="case-row case-row--${ok ? 'ok' : 'gap'}">
        <span class="case-row__state">${ok ? 'Enforced' : 'Not guaranteed'}</span>
        <span class="case-row__label">${escHtml(g.label)}</span>
        <span class="case-row__need">needs ${needText(g.need)}</span>
        <button class="case-row__x" type="button" data-drop="${escHtml(g.id)}"
                aria-label="Remove ${escHtml(g.label)} from the case">&times;</button>
      </li>`;
  }).join('');
}

/** The requirements riding on one knob, each carrying its own verdict.
 *  This is where a gap becomes attributable: the failing requirement is
 *  named on the control that would fix it. */
function ridersHtml(fieldId) {
  const n = needsByField()[fieldId];
  if (!n || (!n.met.length && !n.gap.length)) return '';
  const tag = (label, kind) =>
    `<span class="rider rider--${kind}">${escHtml(label)}</span>`;
  return n.gap.map((l) => tag(l, 'gap')).join('') + n.met.map((l) => tag(l, 'ok')).join('');
}

function knobsHtml() {
  return CFG_FIELDS.map((f) => `
    <div class="sig">
      <div class="sig__label">
        ${escHtml(f.label)}
        <button class="cfg-lvl" type="button" data-goto="${f.level}" title="Added at level ${f.level.slice(1)}">${f.level.toUpperCase()}</button>
        <em>${escHtml(f.hint)}</em>
      </div>
      <div class="seg-group" data-cfg="${f.id}">
        ${f.options.map((o) => `<button class="seg${B.cfg[f.id] === o.v ? ' is-active' : ''}" type="button" data-v="${o.v}">${escHtml(o.label)}</button>`).join('')}
      </div>
      <div class="sig__riders" id="sdkRiders-${f.id}">${ridersHtml(f.id)}</div>
    </div>`).join('');
}

/** Built once. Everything that changes on a click is swapped in place by
 *  `updateBench`: replacing the whole panel discarded the reader's scroll
 *  position inside the snippet and re-ran every animation on the page. */
export function benchHtml() {
  const step = (n, title, lead, body, extra = '') => `
    <section class="bstep${extra ? ` ${extra}` : ''}">
      <header class="bstep__head">
        <span class="bstep__n">${n}</span>
        <div>
          <h4>${title}</h4>
          <p>${lead}</p>
        </div>
      </header>
      ${body}
    </section>`;

  return `
    <div class="bench-steps">
      ${step(1, 'State the case',
    'What does this agent actually have to do? Add one or more. Each lands below with the setting it rides on, so you can see which knob answers it.',
    `<div class="bstep__body">
          <div class="bench-pick">
            <label class="bench-pick__label" for="sdkGoalPick">Add a requirement</label>
            <select class="bench-select" id="sdkGoalPick">${pickOptionsHtml()}</select>
          </div>
          <ul class="case-list" id="sdkCase">${caseListHtml()}</ul>
        </div>`)}

      ${step(2, 'Tune the settings',
    'Now make the config deliver it. A requirement riding on a knob is badged <b class="is-gap">red</b> while the current value cannot guarantee it, and <b class="is-ok">green</b> once it can.',
    `<div class="bstep__body">
          <div class="sdk-bench__knobs" id="sdkKnobs">${knobsHtml()}</div>
          <button class="cfg-reset" type="button" id="sdkCfgReset">Reset the knobs</button>
        </div>`)}

      ${step(3, 'Read the config',
    'Every requirement has to appear here as real structure: a hook, a <code>tool_choice</code>, a tool in the list. Where the knobs cannot deliver one, the snippet gains a commented <b class="is-gap">GAP</b> block exactly where the missing structure would go.',
    `<div class="bstep__body bstep__body--out">
          <div class="code-block code-block--sm">
            <div class="code-block__bar">
              <span class="code-block__lang">live config</span>
              <span class="cfg-legend"><i class="cline--ok"></i>enforced<i class="cline--gap"></i>gap</span>
              <button class="code-copy" type="button" id="sdkCfgCopy">Copy</button>
            </div>
            <pre><code class="cfg-code" id="sdkCfgCode">${snippetHtml()}</code></pre>
          </div>
          <div class="sdk-verdict" id="sdkVerdict">${verdictHtml()}</div>
        </div>`)}
    </div>`;
}

/** Reflect state without rebuilding the panel. The snippet's innerHTML is
 *  replaced, which restarts the mark animation, and that flash is the point:
 *  it shows *which lines* the click just changed. The seg buttons keep their
 *  identity (class toggle, not re-render) so a keyboard user does not lose
 *  focus mid-adjustment; only their rider badges are swapped. */
function updateBench() {
  const pick = document.getElementById('sdkGoalPick');
  if (pick) { pick.innerHTML = pickOptionsHtml(); pick.value = ''; }

  const list = document.getElementById('sdkCase');
  if (list) list.innerHTML = caseListHtml();

  document.querySelectorAll('#sdkKnobs [data-cfg]').forEach((group) => {
    group.querySelectorAll('.seg[data-v]').forEach((b) => {
      const on = B.cfg[group.dataset.cfg] === b.dataset.v;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });
  CFG_FIELDS.forEach((f) => {
    const r = document.getElementById(`sdkRiders-${f.id}`);
    if (r) r.innerHTML = ridersHtml(f.id);
  });

  const code = document.getElementById('sdkCfgCode');
  if (code) code.innerHTML = snippetHtml();
  const verdict = document.getElementById('sdkVerdict');
  if (verdict) verdict.innerHTML = verdictHtml();
}

/** Bench clicks, delegated from the lab's one listener.
 *  Returns true when it consumed the event. */
export function benchClick(e) {
  const drop = e.target.closest('[data-drop]');
  if (drop) {
    B.goals.delete(drop.dataset.drop);
    updateBench();
    return true;
  }

  const seg = e.target.closest('.seg[data-v]');
  if (seg) {
    const group = seg.closest('[data-cfg]');
    if (!group) return false;
    B.cfg[group.dataset.cfg] = seg.dataset.v;
    updateBench();
    return true;
  }

  if (e.target.closest('#sdkCfgReset')) {
    CFG_FIELDS.forEach((f) => { B.cfg[f.id] = f.def; });
    updateBench();
    return true;
  }

  if (e.target.closest('#sdkCfgCopy')) {
    copyText(snippetText(), 'Config copied');
    return true;
  }

  return false;
}

/** The case dropdown fires `change`, not `click`, so the lab delegates
 *  both. Returns true when it consumed the event. */
export function benchChange(e) {
  const pick = e.target.closest('#sdkGoalPick');
  if (!pick || !pick.value) return false;
  B.goals.add(pick.value);
  updateBench();
  return true;
}
