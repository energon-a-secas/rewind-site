import { MODELS, PROVIDERS, TIERS, STALE_AFTER_DAYS, priceOn, pendingChange, blendedPrice, PRICING_LEVERS } from '../content/models.js';
import { escHtml, formatUSD, formatTokens, daysSince } from '../utils.js';
import { pageHead } from './parts.js';
import { renderCalculator } from './calculator.js';

const COLUMNS = [
  { key: 'name',      label: 'Model',      sortable: true },
  { key: 'context',   label: 'Context',    sortable: true, num: true },
  { key: 'in',        label: 'Input',      sortable: true, num: true, unit: '$/M' },
  { key: 'out',       label: 'Output',     sortable: true, num: true, unit: '$/M' },
  { key: 'cacheRead', label: 'Cache hit',  sortable: true, num: true, unit: '$/M' },
  { key: 'blended',   label: 'Blended',    sortable: true, num: true, unit: '$/M' },
];

const PRICE_KEYS = new Set(['in', 'out', 'cacheRead', 'blended']);

function sortValue(model, key) {
  if (key === 'name') return model.name.toLowerCase();
  if (key === 'context') return model.context || 0;
  if (key === 'blended') return blendedPrice(model);
  return priceOn(model)[key] ?? 0;
}

function visibleModels(s) {
  const { providers, tiers, sort, dir } = s.codex;
  const rows = MODELS.filter(m =>
    (!providers.size || providers.has(m.provider)) &&
    (!tiers.size || tiers.has(m.tier))
  );
  const factor = dir === 'desc' ? -1 : 1;

  return rows.sort((a, b) => {
    // Local models have no per-token price; $0 is an absence, not a bargain,
    // so they sink to the bottom of any price sort rather than topping it.
    if (PRICE_KEYS.has(sort)) {
      const aLocal = a.provider === 'local';
      const bLocal = b.provider === 'local';
      if (aLocal !== bLocal) return aLocal ? 1 : -1;
    }
    const av = sortValue(a, sort);
    const bv = sortValue(b, sort);
    if (av === bv) return a.name.localeCompare(b.name);
    return (av > bv ? 1 : -1) * factor;
  });
}

function stalenessBanner() {
  const oldest = Math.max(...MODELS.map(m => daysSince(m.verified)));
  const stale = oldest > STALE_AFTER_DAYS;
  return `<aside class="verify-banner${stale ? ' verify-banner--stale' : ''}">
  <p><strong>Prices verified ${stale ? `${oldest} days ago` : `${oldest === 0 ? 'today' : `${oldest} day${oldest === 1 ? '' : 's'} ago`}`}.</strong>
  Providers change pricing without notice. Confirm at the source before you budget:
  ${Object.entries(PROVIDERS).filter(([key]) => key !== 'local').map(([, p]) =>
    `<a href="${p.source}" target="_blank" rel="noopener noreferrer">${escHtml(p.label)}</a>`).join(' · ')}.</p>
  ${stale ? '<p class="verify-banner-warn">These figures are past their re-check window, treat them as indicative only.</p>' : ''}
</aside>`;
}

function changeAlerts() {
  const pending = MODELS.map(m => ({ model: m, change: pendingChange(m) })).filter(x => x.change);
  if (!pending.length) return '';
  return pending.map(({ model, change }) => {
    const from = model.price;
    const to = change.price;
    return `<aside class="callout callout--warn">
  <p class="callout-title"><span class="callout-icon" aria-hidden="true">!</span>${escHtml(model.name)} price changes in ${change.daysAway} day${change.daysAway === 1 ? '' : 's'}</p>
  <p>${escHtml(change.note)} On ${escHtml(change.on)}, input goes ${formatUSD(from.in, { precise: true })} → ${formatUSD(to.in, { precise: true })} and output ${formatUSD(from.out, { precise: true })} → ${formatUSD(to.out, { precise: true })} per million tokens. The table below quotes today's rate; budget on tomorrow's.</p>
</aside>`;
  }).join('');
}

function filterChips(s) {
  const chip = (group, value, label, accent) => {
    const set = s.codex[group];
    const active = set.has(value);
    return `<button class="filter-chip${active ? ' active' : ''}" data-filter="${group}" data-value="${value}" aria-pressed="${active}" type="button"${accent ? ` style="--chip-accent:${accent}"` : ''}>${escHtml(label)}</button>`;
  };
  return `<div class="codex-filters">
  <div class="chip-group" role="group" aria-label="Filter by provider">
    <span class="chip-group-label">Provider</span>
    ${Object.entries(PROVIDERS).map(([key, p]) => chip('providers', key, p.label, p.accent)).join('')}
  </div>
  <div class="chip-group" role="group" aria-label="Filter by tier">
    <span class="chip-group-label">Tier</span>
    ${Object.entries(TIERS).map(([key, t]) => chip('tiers', key, t.label, '')).join('')}
  </div>
</div>`;
}

function modelRow(model) {
  const price = priceOn(model);
  const provider = PROVIDERS[model.provider];
  const change = pendingChange(model);
  const isLocal = model.provider === 'local';

  const money = (v) => (isLocal ? '-' : formatUSD(v, { precise: true }));

  return `<tr class="model-row" data-tier="${model.tier}">
  <th scope="row" class="model-cell">
    <span class="model-name"><span class="calc-dot" style="background:${provider.accent}"></span>${escHtml(model.name)}</span>
    <span class="model-meta">${escHtml(provider.label)} · ${escHtml(TIERS[model.tier].label)}${change ? ` · <span class="model-flag">price change in ${change.daysAway}d</span>` : ''}</span>
    ${model.apiId ? `<code class="model-api-id">${escHtml(model.apiId)}</code>` : ''}
    ${isLocal ? `<span class="model-meta">${escHtml(model.hardware)} · ${escHtml(model.throughput)}</span>` : ''}
  </th>
  <td class="num">${model.context ? formatTokens(model.context) : '-'}</td>
  <td class="num">${money(price.in)}</td>
  <td class="num">${money(price.out)}</td>
  <td class="num">${money(price.cacheRead)}</td>
  <td class="num strong">${isLocal ? `${model.vramGb} GB` : formatUSD(blendedPrice(model), { precise: true })}</td>
</tr>
<tr class="model-row-detail">
  <td colspan="6">
    <div class="model-detail">
      <p class="model-detail-line"><span class="model-detail-tag model-detail-tag--good">Reach for it</span> ${escHtml(model.bestAt.join(' · '))}</p>
      <p class="model-detail-line"><span class="model-detail-tag model-detail-tag--bad">Not for</span> ${escHtml(model.avoidFor.join(' · '))}</p>
      ${model.examples ? `<p class="model-detail-line"><span class="model-detail-tag">Examples</span> ${escHtml(model.examples)}</p>` : ''}
      ${model.note ? `<p class="model-detail-note">${escHtml(model.note)}</p>` : ''}
    </div>
  </td>
</tr>`;
}

function matrix(s) {
  const rows = visibleModels(s);
  const head = COLUMNS.map(col => {
    const active = s.codex.sort === col.key;
    const dir = active ? s.codex.dir : '';
    return `<th scope="col"${col.num ? ' class="num"' : ''} ${active ? `aria-sort="${s.codex.dir === 'asc' ? 'ascending' : 'descending'}"` : ''}>
      <button class="sort-btn${active ? ' active' : ''}" data-sort="${col.key}" type="button">
        ${escHtml(col.label)}${col.unit ? `<span class="col-unit">${escHtml(col.unit)}</span>` : ''}
        <span class="sort-arrow" aria-hidden="true">${active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>`;
  }).join('');

  return `<section class="codex-section" id="matrix">
  <div class="section-head">
    <h3 class="section-title">The matrix</h3>
    <p class="section-sub">Blended is a single comparable number: input and output weighted 3:1, the rough shape of agentic coding. Sort by it to rank on real-world cost rather than headline input price.</p>
  </div>
  ${filterChips(s)}
  <div class="table-wrap">
    <table class="model-table">
      <thead><tr>${head}</tr></thead>
      <tbody>${rows.length ? rows.map(modelRow).join('') : '<tr><td colspan="6" class="calc-empty">No models match those filters.</td></tr>'}</tbody>
    </table>
  </div>
</section>`;
}

function levers() {
  return `<section class="codex-section" id="levers">
  <div class="section-head">
    <h3 class="section-title">The levers that actually move the bill</h3>
    <p class="section-sub">These are multipliers, not prices. They stay true longer than any number in the table above.</p>
  </div>
  <div class="lever-grid">
    ${PRICING_LEVERS.map(l => `<article class="lever-card">
      <h4 class="lever-name">${escHtml(l.name)}</h4>
      <p class="lever-effect">${escHtml(l.effect)}</p>
      <p class="lever-detail">${escHtml(l.detail)}</p>
    </article>`).join('')}
  </div>
</section>`;
}

const ROUTING = [
  {
    q: 'Is the task mechanical and fully specified?',
    a: 'Fast tier.',
    body: 'Renames, format conversions, applying a pattern you already described, extracting fields. You know what correct looks like before it runs, so a cheap model that gets it wrong is caught immediately.',
    models: ['Claude Haiku 4.5', 'GPT-5.6 Luna', 'Gemini 3.5 Flash-Lite'],
  },
  {
    q: 'Is it everyday coding across a few files?',
    a: 'Balanced tier: the default.',
    body: 'Most agentic work lives here: implement a feature, fix a failing test, refactor a module. Do not reach past this tier by reflex; reach past it when this tier demonstrably fails.',
    models: ['Claude Sonnet 5', 'GPT-5.6 Terra', 'Gemini 3.6 Flash'],
  },
  {
    q: 'Is it ambiguous, cross-cutting, or expensive to get wrong?',
    a: 'Frontier tier.',
    body: 'Architecture decisions, debugging something nobody understands yet, refactors spanning unfamiliar code. The token cost is trivial next to an engineer chasing a wrong answer for a day.',
    models: ['Claude Opus 5', 'GPT-5.6 Sol', 'Claude Fable 5'],
  },
  {
    q: 'Is it high-volume and not interactive?',
    a: 'Cheapest tier that passes your eval, plus the Batch API.',
    body: 'Build a golden set of 30–50 cases first. Run it down the tiers and pick the cheapest that passes. Then halve that with batching. Guessing here costs more than the eval does.',
    models: ['Any fast tier + Batch API'],
  },
  {
    q: 'Is the data sensitive, or are you offline?',
    a: 'Local.',
    body: 'The per-token cost is zero and nothing leaves the machine. You pay in hardware, throughput, and capability. A 30B-class model handles bounded, well-specified edits, not long-horizon autonomy.',
    models: ['30B class on a single consumer GPU'],
  },
];

function routing() {
  return `<section class="codex-section" id="routing">
  <div class="section-head">
    <h3 class="section-title">Which model, for this task?</h3>
    <p class="section-sub">Read top to bottom and stop at the first match. Escalating on failure is cheaper than starting at the top.</p>
  </div>
  <ol class="routing-list">
    ${ROUTING.map((r, i) => `<li class="routing-step">
      <span class="routing-num">${i + 1}</span>
      <div class="routing-body">
        <h4 class="routing-q">${escHtml(r.q)}</h4>
        <p class="routing-a">${escHtml(r.a)}</p>
        <p class="routing-detail">${escHtml(r.body)}</p>
        <p class="routing-models">${r.models.map(m => `<span class="routing-model">${escHtml(m)}</span>`).join('')}</p>
      </div>
    </li>`).join('')}
  </ol>
  <p class="routing-foot">Configuring this in practice: <a href="/t/model-selection/">Choose the Right Model</a> · <a href="/t/claude-custom-models/">Custom and Local Models</a> · <a href="/t/check-ai-costs/">Check Your AI Costs</a></p>
</section>`;
}

export function renderCodex(s) {
  return `${pageHead('The Codex', 'What each model is good at, what it costs, and how to decide between them.', 'Decide')}
${stalenessBanner()}
${changeAlerts()}
${routing()}
${matrix(s)}
${renderCalculator(s)}
${levers()}`;
}
