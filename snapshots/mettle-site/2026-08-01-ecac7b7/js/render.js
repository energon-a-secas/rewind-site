// ── DOM rendering ────────────────────────────────────────────
// Three views: compass (home), probe runner, result. The active probe
// run lives in state.active; otherwise the compass is shown.

import { $, escHtml } from './utils.js';
import { viz } from './viz.js';
import { VIRTUES, RANKS, THEMES, FAST_OPTIONS } from './data.js';
import { scoreVirtues, overallScore, rankFor, dominantVirtue } from './scorer.js';

const RUNG_NAMES = ['External', 'Surface', 'Causal', 'Systemic', 'Integrated'];
const RUNG_HINTS = [
  'Borrowed authority — no internal model yet.',
  'Received wisdom — a single surface cause.',
  'Cause and effect, with named tradeoffs.',
  'Second-order effects; a self-owned model.',
  'The principle transfers; uncertainty held openly.',
];

/** Recompute virtue + overall scores from completed results into state. */
export function recompute(s) {
  const v = scoreVirtues(THEMES, s.results);
  const overall = overallScore(v);
  s.scores = { ...v, overall, rank: rankFor(overall).key };
}

/** Main render — picks the view from state. */
export function render(s) {
  const root = $('view');
  if (!root) return;
  if (s.active) root.innerHTML = renderProbe(s);
  else if (s.lastResult) root.innerHTML = renderResult(s, s.lastResult);
  else root.innerHTML = renderCompass(s);
}

/** Render and switch to the result view for a freshly scored theme. */
export function showResult(s, themeId) {
  s.active = null;
  s.lastResult = themeId;
  $('view').innerHTML = renderResult(s, themeId);
}

/* ── Compass (home) ──────────────────────────────────────────── */
function renderCompass(s) {
  const rank = rankFor(s.scores.overall);
  const dom = dominantVirtue(s.scores);
  const done = Object.values(s.results).filter((r) => r.mode !== 'fast').length;
  const mode = s.settings.mode || 'slow';

  const rankScale = RANKS.map((r) => {
    const on = rank.key === r.key ? ' is-current' : '';
    return `<li class="rank-pip${on}"><span>${escHtml(r.label)}</span></li>`;
  }).join('');

  const themeCards = THEMES.map((t) => {
    const res = s.results[t.id];
    const tags = t.virtues.map((v) => `<span class="tag">${escHtml(virtueLabel(v))}</span>`).join('');
    const status = res
      ? `<span class="theme-score${res.mode === 'fast' ? ' is-fast' : ''}" title="${res.mode === 'fast' ? 'Fast estimate' : 'Measured score'}">${res.score}</span>`
      : `<span class="theme-go">Begin →</span>`;
    return `<button class="card card--interactive theme-card${res ? ' is-done' : ''}" data-theme="${t.id}">
      <div class="theme-card__top"><h3>${escHtml(t.title)}</h3>${status}</div>
      <div class="tags">${tags}</div>
    </button>`;
  }).join('');

  return `
  <section class="section compass">
    <div class="compass__hero card">
      <div class="compass__radar">${viz.radar(VIRTUES, [{ values: s.scores, color: 'var(--accent)' }], { max: 100, ariaLabel: 'Virtue radar chart', frame: false })}</div>
      <div class="compass__summary">
        <p class="eyebrow">Maturity rank</p>
        <h2 class="rank-name">${escHtml(rank.label)}</h2>
        <p class="rank-blurb">${escHtml(rank.blurb)}</p>
        ${done ? `<p class="dominant">Leaning <strong>${escHtml(dom.label)}</strong> · overall ${s.scores.overall}/100</p>` : `<p class="dominant">Run a probe to chart your virtues.</p>`}
        <ol class="rank-scale">${rankScale}</ol>
        <button class="btn btn--ghost btn--sm virtues-link" id="openVirtues">What do the virtues mean?</button>
      </div>
    </div>

    <div class="section__header">
      <div class="section__titles">
        <h2 class="section__title">Probes</h2>
        <p class="section__lead">Each probe is a chain of questions anchored on failure and recovery. <strong>Slow</strong> scores the depth of your written reasoning; <strong>Fast</strong> is a quick multiple-choice estimate that never affects your rank.</p>
      </div>
      <div class="toolbar probe-controls">
        <div class="mode-toggle" role="group" aria-label="Probe mode">
          <button class="mode-btn${mode === 'slow' ? ' is-active' : ''}" data-mode="slow">Slow</button>
          <button class="mode-btn${mode === 'fast' ? ' is-active' : ''}" data-mode="fast">Fast</button>
        </div>
        <label class="rehearse">
          <input type="checkbox" id="rehearseToggle" ${s.settings.rehearsalMode ? 'checked' : ''}>
          Rehearsal mode
        </label>
      </div>
    </div>
    <div class="theme-grid">${themeCards}</div>
  </section>
  ${renderVirtuesModal()}`;
}

function virtueLabel(key) {
  return (VIRTUES.find((v) => v.key === key) || {}).label || key;
}

/* ── Virtues explainer popup ─────────────────────────────────── */
function renderVirtuesModal() {
  const rows = VIRTUES.map((v) => `
    <li class="virtue-row">
      <span class="virtue-dot"></span>
      <div><strong>${escHtml(v.label)}</strong><p>${escHtml(v.blurb)}</p></div>
    </li>`).join('');
  return `
  <div class="modal" id="virtuesModal" hidden>
    <div class="modal__backdrop" data-modal-close tabindex="-1" aria-hidden="true"></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="virtuesTitle" tabindex="-1">
      <header class="modal__header">
        <h2 id="virtuesTitle">The five virtues</h2>
        <button type="button" class="btn btn--ghost btn--icon" data-modal-close aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </header>
      <div class="modal__body">
        <p class="virtues-intro">Mettle charts your reasoning across five qualities of judgment. Each probe exercises one or two of them — and they rise from how you reason, not what you claim.</p>
        <ul class="virtue-list">${rows}</ul>
      </div>
    </div>
  </div>`;
}

/* ── Probe runner ────────────────────────────────────────────── */
function renderProbe(s) {
  const theme = THEMES.find((t) => t.id === s.active.themeId);
  const mode = s.active.mode || 'slow';
  const i = s.active.rungIndex;
  const rung = theme.rungs[i];
  const draft = (s.drafts[theme.id] || {})[rung.id] || {};
  const progress = theme.rungs.map((_, idx) => `<span class="step${idx < i ? ' done' : ''}${idx === i ? ' current' : ''}"></span>`).join('');
  const last = i === theme.rungs.length - 1;

  const body = mode === 'fast'
    ? renderFastBody(rung, draft)
    : renderSlowBody(draft);

  return `
  <section class="section probe">
    <button class="btn btn--ghost btn--sm" id="probeExit">← Back to compass</button>
    <div class="card probe__card">
      <div class="probe__head">
        <span class="eyebrow">${escHtml(theme.title)} · ${mode === 'fast' ? 'Fast' : 'Slow'}</span>
        <div class="steps">${progress}</div>
      </div>
      <p class="probe__kind">${escHtml(kindLabel(rung.kind))}</p>
      <h2 class="probe__prompt">${escHtml(rung.prompt)}</h2>
      ${body}
      <div class="probe__actions">
        <span class="probe__hint">${mode === 'fast' ? 'A quick estimate — pick the closest.' : 'No going back once submitted — answer honestly.'}</span>
        <button class="btn btn--primary" id="probeNext">${last ? 'Finish probe' : 'Next'}</button>
      </div>
    </div>
  </section>`;
}

function renderSlowBody(draft) {
  return `
    <textarea id="probeAnswer" class="probe__answer" rows="6" placeholder="Write the real reasoning — the why behind the why. Short or empty answers score low by design.">${escHtml(draft.answer || '')}</textarea>
    <div class="probe__conf">
      <label for="probeConf">How confident are you in this answer? <span id="confVal">${draft.confidence ?? 50}</span>%</label>
      <input type="range" id="probeConf" min="0" max="100" step="5" value="${draft.confidence ?? 50}">
    </div>`;
}

function renderFastBody(rung, draft) {
  const opts = FAST_OPTIONS[rung.kind] || [];
  const chosen = draft.level;
  const items = opts.map((o) => `
    <button type="button" class="fast-opt${chosen === o.level ? ' is-chosen' : ''}" data-level="${o.level}">
      ${escHtml(o.text)}
    </button>`).join('');
  return `<div class="fast-opts" id="fastOpts">${items}</div>`;
}

function kindLabel(kind) {
  return { trigger: 'The trigger', recovery: 'Recovery', durability: 'Durability', root: 'The root', transfer: 'Transfer' }[kind] || kind;
}

/* ── Result ──────────────────────────────────────────────────── */
function renderResult(s, themeId) {
  const theme = THEMES.find((t) => t.id === themeId);
  const res = s.results[themeId];
  if (!res) return renderCompass(s);
  const isFast = res.mode === 'fast';

  const trace = res.rungs.map((r) => {
    const rung = theme.rungs.find((x) => x.id === r.id);
    const draft = (s.drafts[themeId] || {})[r.id] || {};
    const ans = isFast ? (draft.optionText || '') : (draft.answer || '');
    return `<li class="trace">
      <div class="trace__head">
        <span class="trace__kind">${escHtml(kindLabel(r.kind))}</span>
        <span class="trace__level lvl-${r.level}">${escHtml(RUNG_NAMES[r.level])} · rung ${r.level}</span>
      </div>
      <p class="trace__q">${escHtml(rung.prompt)}</p>
      <p class="trace__a">${ans ? escHtml(ans) : '<em>(no answer)</em>'}</p>
      <p class="trace__hint">${escHtml(RUNG_HINTS[r.level])}</p>
    </li>`;
  }).join('');

  const flag = isFast
    ? `<p class="consistency fast">Fast estimate — does not affect your rank. Run it in Slow mode to measure for real.</p>`
    : res.consistency.ok
      ? `<p class="consistency ok">Coherent across rungs.</p>`
      : `<p class="consistency warn">⚠ ${escHtml(res.consistency.note)}</p>`;

  return `
  <section class="section result">
    <button class="btn btn--ghost btn--sm" id="resultBack">← Back to compass</button>
    <div class="card result__head">
      <div class="result__score${isFast ? ' is-fast' : ''}"><span class="big">${res.score}</span><span class="of">/100</span></div>
      <div>
        <h2>${escHtml(theme.title)}</h2>
        ${flag}
        <div class="toolbar">
          <button class="btn btn--secondary btn--sm" data-theme="${themeId}" id="resultRetry">${s.settings.rehearsalMode ? 'Rehearse again' : 'Retake'}</button>
        </div>
      </div>
    </div>
    <h3 class="result__subtitle">Reasoning trace</h3>
    <ol class="trace-list">${trace}</ol>
  </section>`;
}
