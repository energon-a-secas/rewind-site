// ── DOM rendering ────────────────────────────────────────────
// Builds the hub (category blocks) and per-track pages from content.

import { escHtml } from './utils.js';
import { LEVELS, TRACKS, trackById } from './content.js';
import { isDone, trackProgress } from './state.js';

const app = () => document.getElementById('view');

/** Top-level render: pick hub or track based on the route. */
export function render(s) {
  const root = app();
  if (!root) return;
  if (s.route.name === 'track') {
    const t = trackById(s.route.trackId);
    if (t) { root.innerHTML = renderTrack(s, t); window.scrollTo(0, 0); return; }
  }
  root.innerHTML = renderHub(s);
  window.scrollTo(0, 0);
}

/* ── Hub ─────────────────────────────────────────────────────── */

function renderHub(s) {
  // Overall progress across every track
  let done = 0, total = 0;
  TRACKS.forEach((t) => { const p = trackProgress(s, t); done += p.done; total += p.total; });
  const pct = total ? Math.round((done / total) * 100) : 0;

  const intro = `
    <section class="hero">
      <p class="hero__eyebrow">Machine learning, from zero</p>
      <h2 class="hero__title">Get the same insights and instincts as a data person, one small project at a time.</h2>
      <p class="hero__lead">
        Primer is a hands-on ramp for people who are not data-oriented yet. Every track runs on your own
        laptop, escalates in difficulty, and ends with a pet project you can paste and run. Build the small
        version first, then map it to what Fortune 500 teams run at scale.
      </p>
      <div class="hero__meta">
        <span class="chip">7 tracks</span>
        <span class="chip">5 levels</span>
        <span class="chip">Copy-paste code</span>
        <span class="chip">Runs locally, free</span>
      </div>
      ${total ? `
      <div class="hero__progress" aria-label="Your overall progress">
        <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>
        <span class="hero__progress-label">${done} of ${total} steps done</span>
      </div>` : ''}
    </section>`;

  const levelBlocks = LEVELS.map((lvl) => {
    const tracks = TRACKS.filter((t) => t.level === lvl.n);
    if (!tracks.length) return '';
    return `
      <section class="level" aria-labelledby="lvl-${lvl.n}">
        <div class="level__head">
          <span class="level__badge">Level ${lvl.n}</span>
          <div class="level__titles">
            <h3 class="level__name" id="lvl-${lvl.n}">${escHtml(lvl.name)}</h3>
            <p class="level__blurb">${escHtml(lvl.blurb)}</p>
          </div>
        </div>
        <div class="track-grid">
          ${tracks.map((t) => renderTrackCard(s, t)).join('')}
        </div>
      </section>`;
  }).join('');

  return intro + levelBlocks;
}

function renderTrackCard(s, t) {
  const p = trackProgress(s, t);
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  const complete = p.total && p.done === p.total;
  return `
    <a class="track-card card card--interactive" href="#/track/${t.id}"
       style="--track-accent:${t.accent}">
      <div class="track-card__top">
        <span class="track-card__dot" aria-hidden="true"></span>
        <h4 class="track-card__title">${escHtml(t.title)}</h4>
        ${complete ? '<span class="track-card__check" title="Complete" aria-label="Complete">&#10003;</span>' : ''}
      </div>
      <p class="track-card__tagline">${escHtml(t.tagline)}</p>
      <p class="track-card__objective">${escHtml(t.objective)}</p>
      <div class="track-card__stack">
        ${t.stack.map((x) => `<span class="tag">${escHtml(x)}</span>`).join('')}
      </div>
      <div class="track-card__foot">
        <span class="track-card__time">${escHtml(t.time)}</span>
        ${p.total ? `<span class="track-card__prog">${p.done}/${p.total}</span>` : ''}
      </div>
      ${p.done ? `<div class="progress progress--thin"><div class="progress__bar" style="width:${pct}%"></div></div>` : ''}
    </a>`;
}

/* ── Track page ──────────────────────────────────────────────── */

function renderTrack(s, t) {
  const steps = t.steps.map((step, i) => renderStep(s, t, step, i)).join('');
  const setup = t.setup ? renderSetup(t.setup) : '';
  const idx = TRACKS.findIndex((x) => x.id === t.id);
  const next = TRACKS[idx + 1];

  return `
    <div class="track-page" style="--track-accent:${t.accent}">
      <a class="back-link" href="#/">&larr; All tracks</a>
      <header class="track-head">
        <span class="track-head__level">Level ${t.level}</span>
        <h2 class="track-head__title">${escHtml(t.title)}</h2>
        <p class="track-head__tagline">${escHtml(t.tagline)}</p>
      </header>

      <div class="objective card">
        <h3 class="objective__label">Objective</h3>
        <p class="objective__text">${escHtml(t.objective)}</p>
        <div class="objective__stack">
          <span class="objective__stack-label">Stack:</span>
          ${t.stack.map((x) => `<span class="tag">${escHtml(x)}</span>`).join('')}
        </div>
      </div>

      <p class="track-intro">${escHtml(t.intro)}</p>

      ${setup}

      <ol class="steps">${steps}</ol>

      <div class="track-footer">
        ${next ? `<a class="btn btn--primary" href="#/track/${next.id}">Next: ${escHtml(next.title)} &rarr;</a>` : `<a class="btn btn--primary" href="#/">Back to all tracks</a>`}
      </div>
    </div>`;
}

function renderSetup(setup) {
  return `
    <section class="setup card">
      <h3 class="setup__title">${escHtml(setup.title)}</h3>
      <p class="setup__body">${escHtml(setup.body)}</p>
      ${(setup.blocks || []).map(renderBlock).join('')}
    </section>`;
}

function renderStep(s, t, step, i) {
  const done = isDone(s, t.id, i);
  return `
    <li class="step${done ? ' step--done' : ''}" id="step-${i}">
      <div class="step__head">
        <span class="step__num" aria-hidden="true">${i + 1}</span>
        <h3 class="step__title">${escHtml(step.title)}</h3>
        <button class="step__toggle" data-toggle-step="${i}" aria-pressed="${done}">
          ${done ? '&#10003; Done' : 'Mark done'}
        </button>
      </div>
      <div class="step__body">
        ${paras(step.body)}
        ${(step.blocks || []).map(renderBlock).join('')}
      </div>
    </li>`;
}

function paras(text) {
  return String(text || '')
    .split('\n\n')
    .map((p) => {
      // Turn "- item" runs into a list
      if (p.trimStart().startsWith('- ')) {
        const items = p.split('\n').filter((l) => l.trim().startsWith('- '))
          .map((l) => `<li>${inline(l.replace(/^\s*-\s/, ''))}</li>`).join('');
        return `<ul class="prose-list">${items}</ul>`;
      }
      return `<p>${inline(p)}</p>`;
    })
    .join('');
}

// Minimal inline formatting: `code` spans, escaped.
function inline(str) {
  return escHtml(str).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderBlock(b) {
  if (b.type === 'code') {
    return `
      <div class="code-block" data-lang="${escHtml(b.lang || '')}">
        <div class="code-block__bar">
          <span class="code-block__lang">${escHtml(b.lang || 'text')}</span>
          <button class="code-block__copy" data-copy aria-label="Copy code">Copy</button>
        </div>
        <pre><code>${escHtml(b.code)}</code></pre>
      </div>`;
  }
  if (b.type === 'output') {
    return `
      <div class="output-block">
        <span class="output-block__label">What you'll see</span>
        <pre><code>${escHtml(b.output)}</code></pre>
      </div>`;
  }
  if (b.type === 'note') {
    return `<div class="note-block"><span class="note-block__icon" aria-hidden="true">i</span><p>${inline(b.text)}</p></div>`;
  }
  return '';
}
