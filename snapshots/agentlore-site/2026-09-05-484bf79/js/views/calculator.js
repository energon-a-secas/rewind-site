import { MODELS, MODEL_BY_ID, PROVIDERS, priceOn } from '../content/models.js';
import { WORKLOADS, WORKLOAD_BY_ID, monthlyCost, breakEvenMonths, DEFAULT_HARDWARE_COST } from '../content/workloads.js';
import { escHtml, formatUSD, formatNumber } from '../utils.js';

export const DEFAULT_COMPARISON = [
  'claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5', 'gpt-5-6-terra', 'gemini-3-6-flash',
];

export function activeWorkload(s) {
  const preset = WORKLOAD_BY_ID[s.codex.workload] || WORKLOADS[0];
  const custom = s.codex.inputs;
  return custom ? { ...preset, ...custom, id: 'custom' } : preset;
}

export function comparisonIds(s) {
  return s.codex.selected.size ? [...s.codex.selected] : DEFAULT_COMPARISON;
}

function field(label, key, value, { step = 1, min = 0, max, suffix } = {}) {
  return `<label class="calc-field">
  <span class="calc-field-label">${escHtml(label)}</span>
  <span class="calc-field-input">
    <input type="number" data-calc="${key}" value="${value}" step="${step}" min="${min}"${max !== undefined ? ` max="${max}"` : ''} inputmode="numeric">
    ${suffix ? `<span class="calc-field-suffix">${escHtml(suffix)}</span>` : ''}
  </span>
</label>`;
}

function resultRow(model, workload, maxMonthly) {
  const provider = PROVIDERS[model.provider];

  if (model.provider === 'local') {
    return `<tr class="calc-row calc-row--local">
  <th scope="row"><span class="calc-dot" style="background:${provider.accent}"></span>${escHtml(model.name)}</th>
  <td class="calc-bar-cell"><span class="calc-local-note">no per-token cost · needs ${model.vramGb} GB VRAM</span></td>
  <td class="num">-</td>
  <td class="num strong">$0</td>
</tr>`;
  }

  const { perCall, monthly } = monthlyCost(model, workload, priceOn(model));
  const width = maxMonthly > 0 ? Math.max((monthly / maxMonthly) * 100, monthly > 0 ? 1.5 : 0) : 0;

  return `<tr class="calc-row">
  <th scope="row"><span class="calc-dot" style="background:${provider.accent}"></span>${escHtml(model.name)}</th>
  <td class="calc-bar-cell"><span class="calc-bar" style="width:${width.toFixed(1)}%;background:${provider.accent}"></span></td>
  <td class="num">${formatUSD(perCall, { precise: true })}</td>
  <td class="num strong">${formatUSD(monthly)}</td>
</tr>`;
}

/** The part that changes as you type — patched in isolation so inputs keep focus. */
export function calculatorOutput(s) {
  const workload = activeWorkload(s);
  const models = comparisonIds(s).map(id => MODEL_BY_ID[id]).filter(Boolean);

  const priced = models
    .filter(m => m.provider !== 'local')
    .map(m => ({ model: m, ...monthlyCost(m, workload, priceOn(m)) }))
    .sort((a, b) => a.monthly - b.monthly);

  const localModels = models.filter(m => m.provider === 'local');
  const maxMonthly = priced.length ? priced[priced.length - 1].monthly : 0;
  const cheapest = priced[0];
  const dearest = priced[priced.length - 1];
  const spread = cheapest && cheapest.monthly > 0 ? dearest.monthly / cheapest.monthly : 0;
  const breakEven = cheapest && localModels.length ? breakEvenMonths(cheapest.monthly, DEFAULT_HARDWARE_COST) : null;

  const table = priced.length || localModels.length
    ? `<div class="table-wrap">
  <table class="calc-table">
    <thead><tr><th scope="col">Model</th><th scope="col">Relative</th><th scope="col" class="num">Per call</th><th scope="col" class="num">Per month</th></tr></thead>
    <tbody>
      ${priced.map(p => resultRow(p.model, workload, maxMonthly)).join('')}
      ${localModels.map(m => resultRow(m, workload, maxMonthly)).join('')}
    </tbody>
  </table>
</div>`
    : '<p class="calc-empty">Select at least one model to compare.</p>';

  return `${table}
<div class="calc-takeaways">
  ${spread > 1.2 ? `<p class="calc-takeaway"><strong>${spread.toFixed(1)}× spread.</strong> ${escHtml(dearest.model.name)} costs ${spread.toFixed(1)} times what ${escHtml(cheapest.model.name)} does on this workload: a difference of ${formatUSD(dearest.monthly - cheapest.monthly)} a month. Route the mechanical share of the work down a tier before you shop providers.</p>` : ''}
  ${cheapest ? `<p class="calc-takeaway"><strong>Batch it and halve it.</strong> If this workload is not interactive, the Batch API takes ${escHtml(cheapest.model.name)} from ${formatUSD(cheapest.monthly)} to about ${formatUSD(cheapest.monthly / 2)} a month.</p>` : ''}
  ${workload.cacheHitRate < 0.5 ? `<p class="calc-takeaway calc-takeaway--warn"><strong>Your cache hit rate is low.</strong> At ${Math.round(workload.cacheHitRate * 100)}%, most input is billed at full price. Agentic loops re-send the same system prompt and history every turn, caching that usually lands 70–90%.</p>` : ''}
  ${breakEven && Number.isFinite(breakEven) ? `<p class="calc-takeaway"><strong>Local break-even: ${breakEven < 1 ? 'under a month' : `${Math.round(breakEven)} months`}.</strong> A ${formatUSD(DEFAULT_HARDWARE_COST)} machine pays for itself against ${escHtml(cheapest.model.name)} at ${formatUSD(cheapest.monthly)}/month. Excludes electricity, your time, and the capability gap, local models still trail hosted frontier models on agentic work.</p>` : ''}
</div>
<p class="calc-note">${formatNumber(workload.calls)} calls/month · ${formatNumber(workload.inputTokens)} input and ${formatNumber(workload.outputTokens)} output tokens per call · ${Math.round(workload.cacheHitRate * 100)}% cache hits. Cache <em>write</em> cost is excluded: where caching is worth enabling at all, writes amortise across many reads. Standard rates, not batch.</p>`;
}

function presetsMarkup(s) {
  const chips = WORKLOADS.map(w => {
    const active = !s.codex.inputs && s.codex.workload === w.id;
    return `<button class="preset-chip${active ? ' active' : ''}" data-workload="${w.id}" aria-pressed="${active}" type="button" title="${escHtml(w.blurb)}">${escHtml(w.label)}</button>`;
  }).join('');

  return s.codex.inputs
    ? `${chips}<span class="preset-chip is-custom active">Custom</span><button class="btn-secondary btn-tiny" data-calc-reset type="button">Reset</button>`
    : chips;
}

export function renderCalculator(s) {
  const workload = activeWorkload(s);
  const ids = comparisonIds(s);

  const modelToggles = MODELS.map(m => {
    const on = ids.includes(m.id);
    return `<button class="model-toggle${on ? ' active' : ''}" data-compare="${m.id}" aria-pressed="${on}" type="button" style="--toggle-accent:${PROVIDERS[m.provider].accent}">${escHtml(m.name)}</button>`;
  }).join('');

  return `<section class="codex-section" id="calculator">
  <div class="section-head">
    <h3 class="section-title">What will it actually cost?</h3>
    <p class="section-sub">Pick a workload shape, adjust it to match yours, and compare. The absolute numbers depend on your usage. The spread between models is the part that holds.</p>
  </div>

  <div class="calc-presets" id="calc-presets" role="group" aria-label="Workload presets">${presetsMarkup(s)}</div>

  <p class="calc-derivation" id="calc-derivation">${escHtml(workload.blurb)}${workload.derivation ? ` <span class="calc-derivation-math">${escHtml(workload.derivation)}</span>` : ''}</p>

  <div class="calc-fields">
    ${field('API calls / month', 'calls', workload.calls, { step: 100 })}
    ${field('Input tokens / call', 'inputTokens', workload.inputTokens, { step: 1000 })}
    ${field('Output tokens / call', 'outputTokens', workload.outputTokens, { step: 100 })}
    ${field('Cache hit rate', 'cacheHitRate', Math.round(workload.cacheHitRate * 100), { step: 5, max: 100, suffix: '%' })}
  </div>

  <details class="calc-models">
    <summary>Models compared <span class="calc-models-count">${ids.length}</span></summary>
    <div class="model-toggles">${modelToggles}</div>
  </details>

  <div id="calc-output">${calculatorOutput(s)}</div>
</section>`;
}

export function patchCalculator(s) {
  const output = document.getElementById('calc-output');
  if (!output) return;
  output.innerHTML = calculatorOutput(s);

  // Chips are never the focused element while typing in a field, so replacing
  // them wholesale is safe — and it is how "Custom" and Reset appear.
  const presets = document.getElementById('calc-presets');
  if (presets) presets.innerHTML = presetsMarkup(s);

  const workload = activeWorkload(s);
  const derivation = document.getElementById('calc-derivation');
  if (derivation) {
    derivation.innerHTML = `${escHtml(workload.blurb)}${workload.derivation ? ` <span class="calc-derivation-math">${escHtml(workload.derivation)}</span>` : ''}`;
  }

  const ids = comparisonIds(s);
  for (const toggle of document.querySelectorAll('[data-compare]')) {
    const on = ids.includes(toggle.dataset.compare);
    toggle.classList.toggle('active', on);
    toggle.setAttribute('aria-pressed', String(on));
  }
  const countEl = document.querySelector('.calc-models-count');
  if (countEl) countEl.textContent = ids.length;
}
