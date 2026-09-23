// ── Context lab, storage half (a partial, not a lab) ─────────
// context.js owns the replay, the technique matrix and the failure
// gallery; this file renders the "where does the fact live" tiers and
// the three window-hygiene cards under them. Split out for the same
// reason as labs/loop-theory.js: both halves in one module would put
// context.js past the 500-line cap.
//
// Static markup only. The cards are read, not operated, so there is
// no binder here and nothing to tear down.

import {
  STORE_HEADING, STORE_LEAD, STORE_TIERS,
  HYGIENE_LABEL, HYGIENE_LEAD, WINDOW_HYGIENE, STORE_RULE,
} from '../data/context-stores.js';
import { escHtml, highlightCode } from '../utils.js';

function codeHtml(c) {
  return `
    <div class="code-block code-block--sm">
      <div class="code-block__bar"><span class="code-block__lang">${escHtml(c.label)}</span></div>
      <pre><code>${highlightCode(c.text, c.lang)}</code></pre>
    </div>`;
}

function storeHtml(s) {
  return `
    <article class="store">
      <div class="store__head">
        <h4${s.tip ? ` data-tip="${s.tip}"` : ''}>${escHtml(s.name)}</h4>
        <span class="store__where">${escHtml(s.where)}</span>
      </div>
      <dl class="store__meta">
        <dt>lifetime</dt><dd>${escHtml(s.lifetime)}</dd>
        <dt>survives</dt><dd>${s.survives}</dd>
        <dt>costs</dt><dd>${s.costs}</dd>
      </dl>
      ${(s.codes || []).map(codeHtml).join('')}
      <p class="store__note">${s.note}</p>
      ${s.exam ? `<p class="store__exam"><span class="store__tag">on the exam</span> ${s.exam}</p>` : ''}
    </article>`;
}

export function storesHtml() {
  return `
    <section class="lab-sub ctx-stores" data-section="Where a fact lives">
      <h3>${escHtml(STORE_HEADING)}</h3>
      <p class="lab__lead">${STORE_LEAD}</p>

      ${STORE_TIERS.map((t) => `
        <div class="store-tier">
          <div class="lab-label">${escHtml(t.name)}</div>
          <p class="store-tier__sub">${escHtml(t.sub)}</p>
          <div class="store-grid">${t.stores.map(storeHtml).join('')}</div>
        </div>`).join('')}

      <div class="lab-label">${escHtml(HYGIENE_LABEL)}</div>
      <p class="store-tier__sub">${escHtml(HYGIENE_LEAD)}</p>
      <div class="store-grid store-grid--hyg">
        ${WINDOW_HYGIENE.map((h) => `
          <article class="store store--hyg">
            <div class="store__head"><h4${h.tip ? ` data-tip="${h.tip}"` : ''}>${escHtml(h.title)}</h4></div>
            <p class="store__note">${h.body}</p>
            ${h.code ? codeHtml({ label: h.codeLabel, lang: h.lang, text: h.code }) : ''}
          </article>`).join('')}
      </div>

      <p class="store-rule">${STORE_RULE}</p>
    </section>`;
}
