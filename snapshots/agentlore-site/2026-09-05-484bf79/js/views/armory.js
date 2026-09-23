import { ARMORY_SECTIONS, SKILL_TEMPLATES } from '../content/armory.js';
import { escHtml, renderMarkdown } from '../utils.js';
import { pageHead } from './parts.js';

function templateCard(t, index) {
  const tabs = t.files.map((f, i) =>
    `<button class="tmpl-tab${i === 0 ? ' active' : ''}" data-tmpl="${t.id}" data-file="${i}" type="button">${escHtml(f.path)}</button>`
  ).join('');

  const panes = t.files.map((f, i) => `<div class="tmpl-pane${i === 0 ? '' : ' hidden'}" data-tmpl-pane="${t.id}" data-file="${i}">
  <div class="code-block-wrap" data-lang="${escHtml(f.path.endsWith('.sh') ? 'bash' : 'markdown')}">
    <pre class="code-block" id="tmpl-${t.id}-${i}">${escHtml(f.code)}</pre>
    <button class="code-copy-btn" data-target="tmpl-${t.id}-${i}" title="Copy" aria-label="Copy ${escHtml(f.path)}" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
  </div>
</div>`).join('');

  return `<article class="tmpl-card" id="template-${t.id}">
  <header class="tmpl-head">
    <span class="tmpl-num">${String(index + 1).padStart(2, '0')}</span>
    <div>
      <h4 class="tmpl-name">${escHtml(t.name)}</h4>
      <p class="tmpl-blurb">${escHtml(t.blurb)}</p>
      <p class="tmpl-grounds"><span class="tmpl-grounds-tag">Grounded on</span> ${escHtml(t.grounds)}</p>
    </div>
  </header>
  <div class="tmpl-tabs" role="tablist" aria-label="${escHtml(t.name)} files">${tabs}</div>
  ${panes}
</article>`;
}

export function renderArmory() {
  const nav = ARMORY_SECTIONS.map(s =>
    `<a class="armory-nav-link" href="#/armory?s=${s.id}" data-scroll="${s.id}">${escHtml(s.title)}</a>`
  ).join('') + '<a class="armory-nav-link" href="#/armory?s=templates" data-scroll="templates">Starter templates</a>';

  const sections = ARMORY_SECTIONS.map(s => `<section class="armory-section" id="${s.id}">
  <header class="armory-section-head">
    <h3 class="armory-section-title">${escHtml(s.title)}</h3>
    <p class="armory-section-tagline">${escHtml(s.tagline)}</p>
  </header>
  <div class="prose">${renderMarkdown(s.content)}</div>
</section>`).join('');

  return `${pageHead('The Armory', 'How to build agent skills that stay right, anchored to sources you control, not to what the model half-remembers.', 'Equip')}

<nav class="armory-nav" aria-label="Armory sections">${nav}</nav>

${sections}

<section class="armory-section" id="templates">
  <header class="armory-section-head">
    <h3 class="armory-section-title">Starter templates</h3>
    <p class="armory-section-tagline">Four working skills, each demonstrating a different grounding technique. Copy, rename, replace the specifics.</p>
  </header>
  <div class="tmpl-grid">${SKILL_TEMPLATES.map(templateCard).join('')}</div>
</section>

<p class="section-foot">Related guides: <a href="/t/create-skill/">Create an Agent Skill</a> · <a href="/t/skill-discovery-differences/">Skill Discovery: Claude vs Cursor</a> · <a href="/t/progressive-disclosure-docs/">Progressive Disclosure in Docs</a> · <a href="/t/install-skills-registry/">Install Skills from a Registry</a></p>`;
}
