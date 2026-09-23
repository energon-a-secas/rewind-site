import { tutorials, tutorialById, PATHS } from '../content/index.js';
import { MODELS, PROVIDERS, priceOn, pendingChange, blendedPrice } from '../content/models.js';
import { ARMORY_SECTIONS, SKILL_TEMPLATES } from '../content/armory.js';
import { escHtml, formatUSD, formatTokens } from '../utils.js';
import { arrowIcon, progressBar } from './parts.js';

const START_HERE = ['install-claude-code', 'write-effective-claude-md', 'check-ai-costs', 'create-skill'];

const SNAPSHOT = ['claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5', 'gpt-5-6-terra'];

function door({ href, eyebrow, title, blurb, stat, footer, accent }) {
  return `<a class="door" href="${href}" style="--door-accent:${accent}">
  <p class="door-eyebrow">${escHtml(eyebrow)}</p>
  <h3 class="door-title">${escHtml(title)}</h3>
  <p class="door-blurb">${escHtml(blurb)}</p>
  <div class="door-foot">
    <span class="door-stat">${stat}</span>
    ${footer || ''}
    <span class="door-arrow" aria-hidden="true">${arrowIcon()}</span>
  </div>
</a>`;
}

function costSnapshot() {
  const rows = SNAPSHOT.map(id => MODELS.find(m => m.id === id)).filter(Boolean);
  const change = rows.map(m => ({ m, c: pendingChange(m) })).find(x => x.c);

  return `<section class="home-snapshot">
  <div class="snapshot-head">
    <h3 class="snapshot-title">Today's prices, at a glance</h3>
    <a class="snapshot-link" href="#/codex">Full matrix and calculator ${arrowIcon()}</a>
  </div>
  <div class="table-wrap">
    <table class="snapshot-table">
      <thead><tr><th scope="col">Model</th><th scope="col" class="num">Context</th><th scope="col" class="num">In $/M</th><th scope="col" class="num">Out $/M</th><th scope="col" class="num">Cache hit</th></tr></thead>
      <tbody>
        ${rows.map(m => {
          const p = priceOn(m);
          return `<tr>
  <th scope="row"><span class="calc-dot" style="background:${PROVIDERS[m.provider].accent}"></span>${escHtml(m.name)}</th>
  <td class="num">${formatTokens(m.context)}</td>
  <td class="num">${formatUSD(p.in, { precise: true })}</td>
  <td class="num">${formatUSD(p.out, { precise: true })}</td>
  <td class="num strong">${formatUSD(p.cacheRead, { precise: true })}</td>
</tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  ${change ? `<p class="snapshot-alert"><strong>Heads up:</strong> ${escHtml(change.m.name)} pricing changes in ${change.c.daysAway} days — ${escHtml(change.c.note.toLowerCase())} <a href="#/codex">See what it does to your bill</a>.</p>` : ''}
  <p class="snapshot-note">A cache hit costs roughly a tenth of fresh input. On an agentic loop that re-sends the same context every turn, that one column is the difference between a comfortable bill and a surprising one.</p>
</section>`;
}

export function renderHome(s) {
  const done = s.completed.size;
  const cheapest = [...MODELS].filter(m => m.provider !== 'local')
    .sort((a, b) => blendedPrice(a) - blendedPrice(b))[0];

  return `<section class="hero">
  <p class="hero-eyebrow">Agent Lore</p>
  <h2 class="hero-title">Learn the agents.<br>Pick the model.<br>Ship the skill.</h2>
  <p class="hero-sub">A working reference for people who use AI agents seriously: ${tutorials.length} practical guides, a model-and-cost decision table, and the patterns that make agent skills reliable instead of merely plausible.</p>
  ${done > 0 ? `<div class="hero-progress">${progressBar(done, tutorials.length, 'Guides completed')}<span class="hero-progress-note">picking up where you left off</span></div>` : ''}
</section>

<div class="doors">
  ${door({
    href: '#/learn',
    eyebrow: 'Train',
    title: 'The Path',
    blurb: 'Structured tracks that take you from installing a tool to running agents you can trust. Claude Code and Cursor side by side.',
    stat: `${Object.keys(PATHS).length} tracks · ${tutorials.length} guides`,
    footer: done > 0 ? `<span class="door-progress">${done} done</span>` : '',
    accent: '#60a5fa',
  })}
  ${door({
    href: '#/codex',
    eyebrow: 'Decide',
    title: 'The Codex',
    blurb: 'What each model is good at, what it costs, and which one this task actually needs. With a calculator, so it is a number and not a feeling.',
    stat: `${MODELS.length} models · from ${formatUSD(blendedPrice(cheapest), { precise: true })}/M`,
    footer: '',
    accent: '#c9a035',
  })}
  ${door({
    href: '#/armory',
    eyebrow: 'Equip',
    title: 'The Armory',
    blurb: 'How to build agent skills grounded in sources you control — so they stay right when the model\'s recollection does not.',
    stat: `${ARMORY_SECTIONS.length} guides · ${SKILL_TEMPLATES.length} templates`,
    footer: '',
    accent: '#a78bfa',
  })}
</div>

<section class="start-here">
  <h3 class="section-title">New here? Start with these four.</h3>
  <ol class="start-list">
    ${START_HERE.map((id, i) => {
      const t = tutorialById(id);
      if (!t) return '';
      const complete = s.completed.has(id);
      return `<li class="start-item${complete ? ' is-done' : ''}">
  <span class="start-num">${i + 1}</span>
  <a class="start-link" href="/t/${t.id}/">
    <span class="start-title">${escHtml(t.title)}</span>
    <span class="start-desc">${escHtml(t.description)}</span>
  </a>
</li>`;
    }).join('')}
  </ol>
  <p class="section-foot"><a href="#/browse">Browse all ${tutorials.length} guides ${arrowIcon()}</a></p>
</section>

${costSnapshot()}`;
}
