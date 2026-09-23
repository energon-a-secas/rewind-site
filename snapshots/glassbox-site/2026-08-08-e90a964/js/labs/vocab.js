// ── Lab: Lexicon ─────────────────────────────────────────────
// The exam's operational vocabulary. Verb cards grouped by family
// (click one for the stem-tell and the trap), a five-question quick
// test for the combination family, and the distinction-pairs table.

import { VERB_GROUPS, QUICK_TEST, DISTINCTIONS } from '../data/vocab.js';
import { state } from '../state.js';
import { escHtml } from '../utils.js';
import { openInspector } from '../ui.js';

function findVerb(key) {
  const [gid, idx] = key.split(':');
  const g = VERB_GROUPS.find((x) => x.id === gid);
  return g && g.verbs[Number(idx)];
}

function inspectVerb(key) {
  const v = findVerb(key);
  if (!v) return;
  openInspector(v.term, `
    <p class="insp-blurb">${v.gloss}</p>
    <div class="vx-insp"><span class="vx-insp__tag">in a stem</span><p>${v.tell}</p></div>
    <div class="vx-insp vx-insp--trap"><span class="vx-insp__tag">the trap</span><p>${v.trap}</p></div>
    ${v.see ? `<p class="insp-foot"><a href="#${v.see.hash}" data-inspector-close>${escHtml(v.see.label)} →</a></p>` : ''}
  `);
}

function groupHtml(g) {
  const cards = g.verbs.map((v, i) => `
    <button type="button" class="vx-card" data-verb="${g.id}:${i}">
      <span class="vx-term">${escHtml(v.term)}</span>
      <span class="vx-gloss">${v.gloss}</span>
      ${state.examMode ? `<span class="vx-trap"><b>the trap</b> ${v.trap}</span>` : ''}
    </button>`).join('');
  return `
    <div class="lab-sub">
      <h3>${escHtml(g.label)}</h3>
      <p class="lab__lead">${escHtml(g.lead)}</p>
      <div class="vx-grid">${cards}</div>
    </div>`;
}

function quickTestHtml() {
  const rows = QUICK_TEST.map((t, i) => `
    <button type="button" class="vx-quick" data-q="${i}">
      <span class="vx-quick__q">${escHtml(t.q)}</span>
      <span class="vx-quick__a">→ ${escHtml(t.a)}</span>
    </button>`).join('');
  return `
    <div class="lab-sub">
      <h3>The ten-second test</h3>
      <p class="lab__lead">One question tells the combination verbs apart. Answer it about the stem, then click to check.</p>
      <div class="vx-quicklist">${rows}</div>
    </div>`;
}

function distinctionsHtml() {
  const rows = DISTINCTIONS.map((d) => `
    <tr>
      <th scope="row"><code>${escHtml(d.a)}</code> vs <code>${escHtml(d.b)}</code></th>
      <td>${d.diff}</td>
    </tr>`).join('');
  return `
    <div class="lab-sub">
      <h3>Near-synonyms, split</h3>
      <p class="lab__lead">The pairs the distractors lean on, and the one difference the exam cares about.</p>
      <div class="cw-tablewrap">
        <table class="cw-table vx-table">
          <thead><tr><th>Pair</th><th>The difference that decides the question</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

export function mountVocab(root) {
  root.innerHTML = `
    <section class="lab lab-vx">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">The words are signals</h2>
          <p class="lab__lead">Every operational verb in a stem encodes a mechanism — <em>synthesize</em> means coordinator judgment, <em>enforce</em> means code, <em>delegate</em> means full context in the prompt. The verbs are not interchangeable, and the distractors rely on you reading them as synonyms. Click any term for how it appears in a stem and the trap built on it.</p>
        </div>
      </header>
      ${VERB_GROUPS.map(groupHtml).join('')}
      ${quickTestHtml()}
      ${distinctionsHtml()}
    </section>`;

  root.addEventListener('click', (e) => {
    const card = e.target.closest('[data-verb]');
    if (card) { inspectVerb(card.dataset.verb); return; }
    const quick = e.target.closest('[data-q]');
    if (quick) quick.classList.toggle('is-open');
  });
}
