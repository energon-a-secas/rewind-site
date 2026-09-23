// ── Lab 6: Traps & Caveats ───────────────────────────────────
// Three panels: the distractor shapes that look senior and lose,
// the near-miss stems whose answers diverge, and a pre-answer routine.
//
// Escaping contract (see data/traps/): bait, kill, unless, the
// sides' answer, rule and body carry inline <code>/<b>/<em> and render
// raw. Everything else is plain text and goes through escHtml.
//
// Provenance: an entry with `beyond: true` was observed in third-party
// question banks rather than the official guide, and gets a badge saying
// so. Those entries have no W/Q refs to show, which is why the "Seen in"
// line and the per-side ref are both conditional - an empty seen[] used
// to render a dangling "Seen in".

import { LURES, PAIRS, CHECKS } from '../data/traps/index.js';
import { escHtml } from '../utils.js';

const BEYOND_NOTE = 'Not in the official guide - seen in third-party question banks';

function beyondBadge(o) {
  return o.beyond
    ? `<span class="trap-beyond" title="${escHtml(BEYOND_NOTE)}">Beyond the guide</span>`
    : '';
}

const T = { panel: 'lures' };

const PANELS = [
  { id: 'lures', label: 'Distractor lures' },
  { id: 'pairs', label: 'Near-miss pairs' },
  { id: 'checks', label: 'Before you answer' },
];

function lureCard(l) {
  const unless = l.unless
    ? `<div class="lure__unless"><span>Except when</span><p>${l.unless}</p></div>`
    : '';
  const seen = l.seen.length
    ? `<div class="lure__seen">Seen in ${l.seen.map(escHtml).join(' &middot; ')}</div>`
    : '';
  return `
    <article class="lure lure--${escHtml(l.verdict)}">
      <div class="lure__meta">
        <div class="lure__verdict">${escHtml(l.verdictLabel)}</div>
        ${beyondBadge(l)}
      </div>
      <h3 class="lure__name">${escHtml(l.name)}</h3>
      <div class="lure__row lure__row--bait"><span>Why it reads right</span><p>${l.bait}</p></div>
      <div class="lure__row lure__row--kill"><span>Why it loses</span><p>${l.kill}</p></div>
      ${unless}
      ${seen}
    </article>`;
}

function pairCard(p) {
  const sides = p.sides.map((s) => `
    <div class="pair__side">
      <span class="pair__when">If the <span data-tip="stem">stem</span> says</span>
      <p class="pair__whentext">${escHtml(s.when)}</p>
      <div class="pair__ans">${s.answer}</div>
      ${s.ref ? `<span class="pair__ref">${escHtml(s.ref)}</span>` : ''}
    </div>`).join('');
  return `
    <article class="pair">
      <h3 class="pair__q">${escHtml(p.question)}${beyondBadge(p)}</h3>
      <div class="pair__cols" data-sides="${p.sides.length}">${sides}</div>
      <p class="pair__rule"><b>Discriminator</b> ${p.rule}</p>
    </article>`;
}

function checkItem(c, i) {
  return `
    <li class="check">
      <span class="check__n">${i + 1}</span>
      <div class="check__body">
        <h4>${escHtml(c.title)}${beyondBadge(c)}</h4>
        <p>${c.body}</p>
      </div>
    </li>`;
}

function panelHtml() {
  if (T.panel === 'lures') {
    return `<div class="lure-grid">${LURES.map(lureCard).join('')}</div>`;
  }
  if (T.panel === 'pairs') {
    return `<div class="pair-list">${PAIRS.map(pairCard).join('')}</div>`;
  }
  return `<ol class="check-list">${CHECKS.map(checkItem).join('')}</ol>`;
}

function renderPanel() {
  const wrap = document.getElementById('trapPanel');
  if (wrap) wrap.innerHTML = panelHtml();
  document.querySelectorAll('#trapTabs .seg').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.trap === T.panel);
    b.setAttribute('aria-pressed', String(b.dataset.trap === T.panel));
  });
}

export function mountTraps(root) {
  const tabs = PANELS.map((p) => `
    <button class="seg${T.panel === p.id ? ' is-active' : ''}" type="button" data-trap="${p.id}" aria-pressed="${T.panel === p.id}">
      ${escHtml(p.label)}
    </button>`).join('');

  root.innerHTML = `
    <section class="lab lab-traps">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">Where the points actually go</h2>
          <p class="lab__lead">Two or three options in every question are real engineering. You lose marks to answers that sound senior but are wrong here, and to stems that look identical until one word moves the answer. Both catalogues, plus what to run through before you commit.</p>
        </div>
      </header>

      <div class="seg-group traps-tabs" id="trapTabs" role="group" aria-label="Trap views">${tabs}</div>
      <div class="trap-panel" id="trapPanel"></div>
    </section>`;

  renderPanel();

  root.querySelector('#trapTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.seg');
    if (!b || b.dataset.trap === T.panel) return;
    T.panel = b.dataset.trap;
    renderPanel();
  });
}
