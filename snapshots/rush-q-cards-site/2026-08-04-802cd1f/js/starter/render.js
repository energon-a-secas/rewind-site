// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary - see LICENSE.CONTENT.
// ── Starter Mode rendering ───────────────────────────────────
import { costGlyph } from '../shared/card-component.js';
import { icon, iconForEmoji } from '../shared/icons.js';
import {
  bandOf, crunchCost, crunchAvailable, legalMoves, OFFERS,
  TOTAL_QUARTERS, HEALTH_MAX, RECOVER_HEAL, SHIP_RIGHT_HEAL,
} from './engine.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = () => document.getElementById('starter-app');

export function render(view) {
  const el = root();
  if (!el) return;
  if (view.phase === 'intro') { el.innerHTML = renderIntro(); return; }
  if (view.phase === 'over') { el.innerHTML = renderOver(view.g); return; }
  el.innerHTML = renderPlay(view);
}

function renderIntro() {
  return `
  <section class="st-intro">
    <p class="st-kicker">Starter Mode · 10 minutes</p>
    <h2 class="st-title">60 seconds to learn</h2>
    <div class="st-rules">
      <p>You're a tech manager. So is your rival. <strong>Four quarters. Most reputation wins.</strong></p>
      <p>Each quarter, two choices:</p>
      <ol>
        <li><strong>Pick a project.</strong> Bigger reward, tighter ask.</li>
        <li><strong>Pick your pace.</strong>
          <span class="st-pace-chip right">Ship right</span> — lands next quarter, team stays healthy.
          <span class="st-pace-chip crunch">Crunch</span> — lands now, team health drops, you gain a debt token.
          <span class="st-pace-chip recover">Recover</span> — no ship this quarter; heal the team, pay off a debt.
        </li>
      </ol>
      <p>Watch the <strong>team health bar</strong>. When it slides into the red, the bill arrives:
        people burn out, things break, and you lose reputation you already banked.
        Debt tokens cost 1 reputation each at the end — and every token makes the next crunch hurt more.</p>
      <p class="st-challenge">Your rival <strong>always crunches</strong>. Beat them anyway.</p>
    </div>
    <button class="btn btn-play st-start" onclick="window._stStart()">Start</button>
    <p class="st-onramp-note">Already know the loop? Jump to <a href="../quick/">Quick Mode</a> (15 min) or <a href="../game/">Classic</a> (the full year).</p>
  </section>`;
}

function healthBar(p) {
  const band = bandOf(p.health);
  const pct = (p.health / HEALTH_MAX) * 100;
  return `
    <div class="st-health st-band-${band.key}" title="Team health ${p.health}/${HEALTH_MAX} — ${band.label}">
      <div class="st-health-head">
        <span class="st-health-label">Team health</span>
        <span class="st-health-band">${band.label} · ${p.health}/${HEALTH_MAX}</span>
      </div>
      <div class="st-health-track"><div class="st-health-fill" style="width:${pct}%"></div></div>
    </div>`;
}

function playerBoard(g, pIdx) {
  const p = g.players[pIdx];
  const debt = p.debt ? `<span class="st-tokens" title="${p.debt} debt token${p.debt === 1 ? '' : 's'} — −1 rep each at year end, +1 crunch cost each">${costGlyph('opex').repeat(p.debt)} debt</span>` : '';
  const quits = p.quits ? `<span class="st-quits">${p.quits === 1 ? '1 teammate quit' : 'Team gutted — no more crunch'}</span>` : '';
  const pending = p.pending ? `<span class="st-pending" title="Lands at the start of next quarter">⏳ “${esc(p.pending.name)}” +${p.pending.reward}</span>` : '';
  return `
    <div class="st-board ${pIdx === 0 ? 'you' : 'rival'}">
      <div class="st-board-head">
        <span class="st-board-name">${esc(p.name)}</span>
        <span class="st-board-rep">${p.rep} <small>rep</small></span>
      </div>
      ${healthBar(p)}
      <div class="st-board-meta">${debt}${quits}${pending}</div>
    </div>`;
}

function renderPlay(view) {
  const { g, selIdx } = view;
  const chips = Array.from({ length: TOTAL_QUARTERS }, (_, i) =>
    `<span class="st-q ${i + 1 === g.quarter ? 'now' : i + 1 < g.quarter ? 'done' : ''}">Q${i + 1}</span>`).join('');

  const p = g.players[0];
  // Starter Mode teaches one idea, so its cards say only what matters: the
  // size of the job and what it pays. The full card renderer is deliberately
  // not used here — its stat block is noise a first-time player can't read yet.
  const SIZE = { 3: 'Small', 5: 'Medium', 8: 'Large' };
  const offers = OFFERS[g.quarter].map((o, idx) => `
    <button class="st-offer ${selIdx === idx ? 'selected' : ''}" onclick="window._stPick(${idx})" aria-pressed="${selIdx === idx}" style="--offer-weight: ${o.reward}">
      <span class="st-offer-size">${SIZE[o.reward] ?? 'Project'}</span>
      <span class="st-offer-name">${esc(o.name)}</span>
      <span class="st-offer-reward">+${o.reward}<small>rep</small></span>
      <span class="st-offer-note">${o.reward >= 8 ? 'Worth the most, hurts the most to rush.' : o.reward >= 5 ? 'A fair trade either way.' : 'Cheap to ship right.'}</span>
    </button>`).join('');

  let paceHtml = '';
  if (selIdx != null) {
    const offer = OFFERS[g.quarter][selIdx];
    const cost = crunchCost(p);
    const canCrunch = crunchAvailable(p);
    paceHtml = `
      <div class="st-pace">
        <div class="st-pace-title">Pace for “${esc(offer.name)}”</div>
        <div class="st-pace-options">
          <button class="btn st-pace-btn right" onclick="window._stPace('right')">
            <strong>Ship right</strong><span>lands next quarter · +${SHIP_RIGHT_HEAL} health</span>
          </button>
          <button class="btn st-pace-btn crunch" onclick="window._stPace('crunch')" ${canCrunch ? '' : 'disabled'}>
            <strong>Crunch</strong><span>${canCrunch ? `+${offer.reward} rep now · −${cost} health · +1 debt` : (p.quits >= 2 ? 'nobody left to crunch' : 'team can’t crunch this quarter')}</span>
          </button>
        </div>
        <button class="st-pace-cancel" onclick="window._stCancel()">back</button>
      </div>`;
  }

  const recent = g.story.slice(-4).reverse().map(b =>
    `<div class="st-beat st-beat-${b.kind}">Q${b.q} · ${esc(b.text)}</div>`).join('');

  return `
  <section class="st-play">
    <div class="st-top"><span class="st-top-label">Quarter</span>${chips}</div>
    <div class="st-boards">${playerBoard(g, 0)}${playerBoard(g, 1)}</div>
    <div class="st-choices">
      <div class="st-choices-title">${selIdx == null ? 'Pick a project — or pull back' : 'Now pick the pace'}</div>
      <div class="st-offers">${offers}</div>
      ${paceHtml}
      ${selIdx == null ? `<button class="btn btn-secondary st-recover" onclick="window._stRecover()">${icon('bed')} Recover instead <span>+${RECOVER_HEAL} health · pay off a debt · no ship</span></button>` : ''}
    </div>
    <div class="st-ticker">${recent}</div>
  </section>`;
}

function renderOver(g) {
  const [you, rival] = g.players;
  const won = g.winner === 0;
  const tied = g.winner === null;
  const headline = tied ? 'Dead heat.' : won ? `${icon('trophy', { cls: 'ic-gold' })} You beat the Sprinter` : 'The Sprinter takes it';
  const sub = won
    ? 'Pace beats panic. That was the whole lesson.'
    : tied ? 'Same score, same wreckage.' : 'Their shortcuts paid off this time — check what it cost them below.';

  const quarters = [...new Set(g.story.map(b => b.q))].sort((a, b) => a - b);
  const recap = quarters.map(q => {
    const beats = g.story.filter(b => b.q === q);
    return `<div class="st-recap-q"><div class="st-recap-label">${q === 0 ? '—' : 'Q' + q}</div>
      <div class="st-recap-beats">${beats.map(b => `<div class="st-beat st-beat-${b.kind}">${esc(b.text)}</div>`).join('')}</div></div>`;
  }).join('');

  return `
  <section class="st-over">
    <h2 class="st-title ${won ? 'st-win' : ''}">${headline}</h2>
    <p class="st-sub">${esc(sub)}</p>
    <div class="st-boards">${playerBoard(g, 0)}${playerBoard(g, 1)}</div>
    <div class="st-recap">
      <div class="st-recap-title">Your four quarters</div>
      ${recap}
    </div>
    <div class="st-onramp">
      <button class="btn btn-play" onclick="window._stAgain()">Play again</button>
      <a class="btn btn-secondary" href="../quick/">Quick Mode — adds drafting &amp; rivals (15 min)</a>
      <a class="btn btn-secondary" href="../game/">Classic — the full year, health bar hidden</a>
    </div>
  </section>`;
}
