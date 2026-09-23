// ── Partial: "Defining a custom tool" (SDK lab) ──────────────
// Not a lab, but an HTML builder imported by labs/sdk.js, same arrangement as
// labs/loop-theory.js and labs/context-stores.js, so sdk.js stays well
// under the 500-line cap.
//
// Two things live here:
//
//   langTabs(lang)  the Python/TypeScript switch, used TWICE on the page:
//                   once over the level code, once here. Both read the same
//                   S.lang in sdk.js, so flipping either flips both; a
//                   reader deep in this section should not have to scroll
//                   back to the stepper to change language.
//   toolsHtml(lang) the section itself.
//
// The decorator walk (plain → wrapped → schema) is deliberately NOT
// language-switched: it exists to explain what Python's `@` does, and a
// TypeScript "equivalent" would be three panels showing that nothing
// happens. The comparison is carried by tsNote instead, which is the
// honest version of the same lesson.
//
// Escaping contract: see data/sdk-tools.js.

import { TOOL_DEF } from '../data/sdk-tools.js';
import { SDK_LANGS } from '../data/sdk-ts.js';
import { escHtml, highlightCode } from '../utils.js';

/** The language switch. `where` distinguishes the two instances for tests
 *  and for `aria-label`; the click handler in sdk.js listens for [data-lang]
 *  anywhere in the lab, so both behave identically. */
export function langTabs(lang, where) {
  return `
    <nav class="sdk-stepper lang-tabs" aria-label="Code language (${escHtml(where)})">
      ${SDK_LANGS.map((l) => `
        <button class="sdk-step lang-tab${l.id === lang ? ' is-active' : ''}" type="button"
                data-lang="${l.id}" aria-current="${l.id === lang ? 'true' : 'false'}">
          <span class="sdk-step__label">${escHtml(l.label)}</span>
        </button>`).join('')}
    </nav>`;
}

function panel(p, cls) {
  return `
    <figure class="dec__panel${cls ? ` dec__panel--${cls}` : ''}">
      <figcaption>${escHtml(p.label)}</figcaption>
      <div class="code-block code-block--sm">
        <div class="code-block__bar"><span class="code-block__lang">${p.lang === 'json' ? 'what the model sees' : 'python'}</span></div>
        <pre><code>${highlightCode(p.code, p.lang === 'json' ? 'js' : p.lang)}</code></pre>
      </div>
      <p class="dec__note">${p.note}</p>
    </figure>`;
}

function decoratorHtml() {
  const d = TOOL_DEF.decorator;
  return `
    <div class="dec">
      <h4 class="sdk-sub">${escHtml(d.title)}</h4>
      <p class="dec__lead">${d.body}</p>

      <ol class="dec__steps">
        ${d.steps.map((s) => `
          <li class="dec__step">
            <span class="dec__n">${s.n}</span>
            <div>
              <b>${escHtml(s.label)}</b>
              <p>${s.body}</p>
            </div>
          </li>`).join('')}
      </ol>

      <div class="dec__flow">
        ${panel(d.plain, 'before')}
        ${panel(d.wrapped, 'after')}
        ${panel(d.schema, 'schema')}
      </div>

      <p class="dec__ts"><span>In TypeScript</span> ${d.tsNote}</p>
    </div>`;
}

function implHtml(lang) {
  const impl = TOOL_DEF.impls.find((i) => i.id === lang) || TOOL_DEF.impls[0];
  return `
    ${langTabs(impl.id, 'tool definition')}
    <div class="impl-grid">
      <div class="code-block">
        <div class="code-block__bar">
          <span class="code-block__lang">${escHtml(impl.file)}</span>
          <button class="code-copy" type="button" id="sdkToolsCopy">Copy</button>
        </div>
        <pre><code>${highlightCode(impl.code, impl.lang)}</code></pre>
      </div>
      <ul class="impl-notes">
        ${impl.notes.map((n) => `<li class="impl-note"><span class="impl-note__tag">${escHtml(n.tag)}</span>${n.body}</li>`).join('')}
      </ul>
    </div>`;
}

function namingHtml() {
  const n = TOOL_DEF.naming;
  return `
    <div class="tool-naming">
      <h4 class="sdk-sub">The name the model actually calls</h4>
      <p class="dec__lead">${n.lead}</p>
      <div class="tool-names">
        ${n.rows.map((r) => `
          <div class="tool-name">
            <code>${escHtml(r.name)}</code>
            <p>${r.means}</p>
          </div>`).join('')}
      </div>
    </div>`;
}

/** The whole section body. The stable wrapper (with data-section) lives in
 *  sdk.js so the rail's minted id survives a language flip. */
export function toolsHtml(lang) {
  return `
    <h3>Defining a custom tool</h3>
    <p class="lab__lead">${escHtml(TOOL_DEF.lead)}</p>
    ${decoratorHtml()}
    ${implHtml(lang)}
    ${namingHtml()}
    <div class="sdk-caveats">
      <h4 class="sdk-sub">What the schema generator does not do for you</h4>
      ${TOOL_DEF.gotchas.map((g) => `
        <article class="sdk-caveat">
          <h4>${escHtml(g.title)}</h4>
          <p>${g.body}</p>
        </article>`).join('')}
    </div>`;
}

/** The code the Copy button should hand over: whichever language is shown. */
export function toolsCode(lang) {
  const impl = TOOL_DEF.impls.find((i) => i.id === lang) || TOOL_DEF.impls[0];
  return { code: impl.code, file: impl.file };
}
