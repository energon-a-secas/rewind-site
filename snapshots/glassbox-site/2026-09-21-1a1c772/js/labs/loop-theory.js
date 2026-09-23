// ── Loop lab, theory half (a partial, not a lab) ──────────────
// loop.js owns the replay; this file owns everything below it: the
// concept ledger, hub-and-spoke, and the built-in toolset. Split out
// because the two halves together would put loop.js far past the
// 500-line cap. The lab still mounts as one module.
//
// Exports a string builder and one binder. Nothing here is stateful
// except which ledger rows are open, which is deliberately reset on
// remount: the theory half is read, not operated.

import { LEDGER_GROUPS, LEDGER_LEAD, LEDGER_CYCLE } from '../data/loop-theory.js';
import { HUB_SPOKE, TOOL_KIT } from '../data/loop-orchestration.js';
import { ANTIPATTERNS } from '../data/antipatterns.js';
import { escHtml, highlightCode, flagHtml } from '../utils.js';

// ── The concept ledger ───────────────────────────────────────
function rowHtml(r, gi, ri) {
  const id = `led-${gi}-${ri}`;
  return `
    <li class="led">
      <button class="led__row" type="button" aria-expanded="false" aria-controls="${id}"${r.tip ? ` data-tip="${r.tip}"` : ''}>
        <span class="led__name">${escHtml(r.name)}</span>
        <span class="led__where">${escHtml(r.where)}</span>
        <span class="led__controls">${r.controls}</span>
        <span class="led__chev" aria-hidden="true">▾</span>
      </button>
      <div class="led__panel" id="${id}" hidden>
        <p class="led__cons"><span class="led__tag">consequence</span> ${r.consequence}</p>
        ${r.exam ? `<p class="led__exam"><span class="led__tag led__tag--exam">on the exam</span> ${r.exam}</p>` : ''}
      </div>
    </li>`;
}

function ledgerHtml() {
  return `
    <section class="lab-sub loop-ledger" id="loopLedger" data-section="Concept ledger">
      <div class="loop-ledger__head">
        <div>
          <h3>Every moving part, one row each</h3>
          <p class="lab__lead">${escHtml(LEDGER_LEAD)}</p>
        </div>
        <button class="btn btn--ghost btn--sm" type="button" id="ledToggleAll" data-open="0">Expand all</button>
      </div>

      <ol class="led-cycle">
        ${LEDGER_CYCLE.map((c) => `<li><span class="led-cycle__n">${c.n}</span><span>${c.text}</span></li>`).join('')}
      </ol>

      ${LEDGER_GROUPS.map((g, gi) => `
        <div class="led-group">
          <div class="lab-label">${escHtml(g.title)}</div>
          <p class="led-group__sub">${escHtml(g.sub)}</p>
          <ul class="ledger">${g.rows.map((r, ri) => rowHtml(r, gi, ri)).join('')}</ul>
        </div>`).join('')}
    </section>`;
}

// ── Hub-and-spoke ────────────────────────────────────────────
function hubHtml() {
  const h = HUB_SPOKE;
  return `
    <section class="lab-sub loop-hub" data-section="Hub and spoke">
      <h3>${escHtml(h.heading)}</h3>
      <p class="lab__lead">${escHtml(h.lead)}</p>

      <div class="hub-map">
        <div class="hub-map__hub">
          <span class="hub-map__label">${escHtml(h.topology.hub.label)}</span>
          <span class="hub-map__note">${escHtml(h.topology.hub.note)}</span>
        </div>
        <div class="hub-map__spokes">
          ${h.topology.spokes.map((s) => `
            <div class="hub-map__spoke">
              <span class="hub-map__label">${escHtml(s.label)}</span>
              <span class="hub-map__role">${escHtml(s.role)}</span>
              <span class="hub-map__iso" data-tip="isolated_context">isolated context</span>
            </div>`).join('')}
        </div>
        <p class="hub-map__forbidden"><span class="hub-map__x" aria-hidden="true">✕</span> ${escHtml(h.topology.forbidden)}</p>
      </div>

      <div class="lab-label">${escHtml(h.dutiesLabel)}</div>
      <ol class="hub-duties">
        ${h.duties.map((d, i) => `
          <li>
            <span class="hub-duties__n">${i + 1}</span>
            <div><h4>${escHtml(d.name)}</h4><p>${d.body}</p></div>
          </li>`).join('')}
      </ol>

      <div class="lab-label">${escHtml(h.isolationLabel)}</div>
      <div class="hub-iso">
        ${h.isolation.map((r) => `
          <div class="hub-iso__card">
            <h4>${escHtml(r.name)}</h4>
            <p>${r.body}</p>
          </div>`).join('')}
      </div>

      <div class="lab-label">${escHtml(h.promptsLabel)}</div>
      <div class="pair__cols hub-prompts" data-sides="2">
        ${h.prompts.map((p) => `
          <div class="pair__side" data-tone="${p.tone}">
            <h4>${escHtml(p.title)}</h4>
            <div class="code-block code-block--sm">
              <div class="code-block__bar"><span class="code-block__lang" data-tip="task_tool">Task prompt</span></div>
              <pre><code>${highlightCode(p.code, p.lang)}</code></pre>
            </div>
            <p class="hub-prompts__note">${p.note}</p>
          </div>`).join('')}
      </div>

      <div class="lab-label">${escHtml(h.parallelLabel)}</div>
      <div class="hub-par">
        <div class="code-block code-block--sm">
          <div class="code-block__bar"><span class="code-block__lang">one coordinator turn</span></div>
          <pre><code>${highlightCode(h.parallelCode, h.parallelLang)}</code></pre>
        </div>
        <p class="hub-par__note">${h.parallelNote}</p>
      </div>

      <div class="lab-label">${escHtml(h.aggregateLabel)}</div>
      <div class="prim-grid">
        ${h.aggregate.map((a) => `
          <div class="prim">
            <h4>${escHtml(a.name)}</h4>
            <p>${a.body}</p>
          </div>`).join('')}
      </div>

      <div class="loop-flag">${flagHtml(ANTIPATTERNS[h.flag])}</div>
    </section>`;
}

// ── Built-in tools ───────────────────────────────────────────
function toolkitHtml() {
  const k = TOOL_KIT;
  return `
    <section class="lab-sub loop-kit" data-section="Built-in toolset">
      <h3>${escHtml(k.heading)}</h3>
      <p class="lab__lead">${k.lead}</p>

      <div class="kit-table">
        <div class="kit-row kit-row--head">
          <span>When the task is…</span><span>the tool is</span><span>example</span><span>why that one</span>
        </div>
        ${k.rows.map((r) => `
          <div class="kit-row">
            <span class="kit-task">${escHtml(r.task)}</span>
            <span class="kit-tool"><code${r.tip ? ` data-tip="${r.tip}"` : ''}>${escHtml(r.tool)}</code></span>
            <span class="kit-ex"><code>${escHtml(r.example)}</code></span>
            <span class="kit-use">${r.use}</span>
          </div>`).join('')}
      </div>

      <div class="lab-label" data-tip="incremental_investigation">${escHtml(k.walkLabel)}</div>
      <p class="loop-kit__lead">${escHtml(k.walkLead)}</p>
      <ol class="kit-walk">
        ${k.walk.map((w) => `
          <li>
            <span class="kit-walk__n">${w.n}</span>
            <span class="kit-walk__tool">${escHtml(w.tool)}</span>
            <span class="kit-walk__body">${w.body}</span>
          </li>`).join('')}
      </ol>

      <div class="kit-notes">
        ${k.notes.map((n) => `
          <div class="sdk-caveat">
            <h4>${escHtml(n.title)}</h4>
            <p>${n.body}</p>
          </div>`).join('')}
      </div>
    </section>`;
}

export function theoryHtml() {
  return `${ledgerHtml()}${hubHtml()}${toolkitHtml()}`;
}

/** Ledger accordion. Delegated, so one binding covers every row. */
export function bindTheory(root) {
  const ledger = root.querySelector('#loopLedger');
  if (!ledger) return;

  ledger.addEventListener('click', (e) => {
    const btn = e.target.closest('.led__row');
    if (!btn) return;
    const panel = ledger.querySelector(`#${btn.getAttribute('aria-controls')}`);
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (panel) panel.hidden = open;
  });

  const all = ledger.querySelector('#ledToggleAll');
  all.addEventListener('click', () => {
    const open = all.dataset.open === '1';
    ledger.querySelectorAll('.led__row').forEach((b) => {
      b.setAttribute('aria-expanded', String(!open));
      const p = ledger.querySelector(`#${b.getAttribute('aria-controls')}`);
      if (p) p.hidden = open;
    });
    all.dataset.open = open ? '0' : '1';
    all.textContent = open ? 'Expand all' : 'Collapse all';
  });
}
