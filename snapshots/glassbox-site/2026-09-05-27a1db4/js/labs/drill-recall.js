// ── Drill: "Since last time" card ────────────────────────────
// The one view of the drill history, rendered above the filters on the
// setup screen because its two buttons set them. Split out of drill.js so
// the lab file holds the asking and this holds the remembering.
//
// Domain rows reuse .weight from the result view, .is-weak and all: the
// same bar meaning the same thing in both places is the point.

import { QUESTIONS, DOMAINS, DOMAIN_BY_ID } from '../data/questions/index.js';
import { domainTally, weakest, pending } from '../history.js';
import { escHtml } from '../utils.js';

const IDS = new Set(QUESTIONS.map((q) => q.id));

function dateLabel(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function domainBar(label, right, total) {
  const pct = Math.round((right / total) * 100);
  return `
    <div class="weight${pct < 70 ? ' is-weak' : ''}">
      <span class="weight__label">${escHtml(label)} <em>${pct}%</em></span>
      <span class="weight__bar"><i style="width:${pct}%"></i></span>
      <span class="weight__pct">${right}/${total}</span>
    </div>`;
}

/** Empty string until the first run finishes: nothing remembered, nothing said. */
export function recallHtml(runs) {
  if (!runs.length) return '';
  const tally = domainTally(runs);
  const rows = DOMAINS.filter((d) => tally[d.id])
    .map((d) => domainBar(d.label, tally[d.id][0], tally[d.id][1])).join('');
  const weak = weakest(runs, 2).map((id) => DOMAIN_BY_ID[id]).filter(Boolean);
  const todo = pending(runs).filter((id) => IDS.has(id));
  const last = runs[runs.length - 1];
  return `
    <div class="drill-recall">
      <div class="recall__head">
        <h4>Since last time <em>${runs.length} run${runs.length === 1 ? '' : 's'}</em></h4>
        <span class="recall__last">Last run ${dateLabel(last.ts)} · ${last.right}/${last.n} · scaled ${last.score}</span>
      </div>
      ${rows}
      <div class="recall__actions">
        ${weak.length ? `<button class="btn btn--secondary btn--sm" id="drillWeak">Drill my ${weak.length === 1 ? 'weakest domain' : `${weak.length} weakest domains`} · ${weak.map((d) => escHtml(d.short)).join(' + ')}</button>` : ''}
        ${todo.length ? `<button class="btn btn--secondary btn--sm" id="drillPending">Retry ${todo.length} still unlearned</button>` : ''}
        <button class="btn btn--ghost btn--sm" id="drillForget">Forget history</button>
      </div>
      <p class="recall__note">Percentages roll across every run this browser remembers, newest ${runs.length} kept. A question drops off the retry list once you answer it correctly. Nothing leaves this browser.</p>
    </div>`;
}
