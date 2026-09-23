// ── Rendering ────────────────────────────────────────────────
// Full-app re-render on every state change; the app is small enough
// that this stays fast, and the open swap panel survives via state.ui.

import { CATEGORIES, TYPE_META } from './data-services.js';
import { RECIPES, FRONTENDS, TIERS } from './data-recipes.js';
import { SIZE_LABELS, AI_MODELS, AGENT_TOOLS, buildCostUsd } from './data-models.js';
import { PRESETS } from './data-presets.js';
import { state, activeCategories, currentPick, bundlerFor } from './state.js';
import { infraRows, infraTotals, strategyTotals, freeTotals, buildTokens, modelCosts, subscriptionPath, activeGotchas, yearOneTotal, qualityModel, totalsForConfig, buildTokensForConfig } from './costmodel.js';
import { buildPrompt, buildFitPrompt } from './prompt.js';
import { escHtml, fmtUsd, fmtTokens, $ } from './utils.js';
import { icon, favicon } from './icons.js';

function badge(type) {
  const meta = TYPE_META[type] || TYPE_META.freemium;
  return `<span class="badge ${meta.cls}">${meta.badge}</span>`;
}

// ── Step 1: recipe picker ────────────────────────────────────

function renderRecipes() {
  const r = RECIPES[state.recipe];
  const totals = infraTotals();
  const models = modelCosts();
  const quality = models.find(m => m.bestValue) || models[0];

  const opt = ([key, rr]) =>
    `<option value="${key}"${key === state.recipe ? ' selected' : ''}>${escHtml(rr.label)}, ${SIZE_LABELS[rr.size]} · ${rr.categories.length} ingredients</option>`;
  const entries = Object.entries(RECIPES);
  const options =
    `<optgroup label="Product stacks">${entries.filter(([, rr]) => !rr.budget).map(opt).join('')}</optgroup>` +
    `<optgroup label="Almost free: the bill is a domain, or nothing">${entries.filter(([, rr]) => rr.budget).map(opt).join('')}</optgroup>`;

  return `
    <section class="step" aria-labelledby="s1">
      <div class="step-head">
        <span class="step-head__n">1</span>
        <h2 class="step-head__title" id="s1">Pick a recipe</h2>
        <p class="step-head__lead">The archetype decides which ingredients you need, and its size drives the AI build estimate.</p>
      </div>
      <div class="recipe-bar">
        <span class="recipe-bar__icon">${icon(r.icon)}</span>
        <label class="recipe-bar__label" for="recipe-select">Recipe</label>
        <select id="recipe-select" class="recipe-select" data-action="recipe-select">${options}</select>
      </div>
      <div class="preset-bar">
        <span class="preset-bar__label">Or copy a site you know:</span>
        ${Object.entries(PRESETS).map(([key, p]) =>
          `<button class="preset-chip${state.ui.preset === key ? ' is-active' : ''}" data-action="preset" data-preset="${key}">${escHtml(p.label)}</button>`
        ).join('')}
      </div>
      <div class="glance">
        <p class="glance__blurb">${escHtml(r.blurb)}</p>
        ${state.ui.preset && PRESETS[state.ui.preset] ? `
        <p class="glance__wontget"><strong>Copying ${escHtml(PRESETS[state.ui.preset].label)}, what the copy will not buy you:</strong> ${escHtml(PRESETS[state.ui.preset].wontGet)}</p>` : ''}
        <div class="glance__grid">
          <div class="glance__cell"><span class="glance__v">${SIZE_LABELS[r.size]}</span><span class="glance__k">Build size</span></div>
          <div class="glance__cell"><span class="glance__v">${r.categories.length}</span><span class="glance__k">Ingredients</span></div>
          <div class="glance__cell"><span class="glance__v">${fmtUsd(totals[state.tier])}/mo</span><span class="glance__k">Infra · ${TIERS[state.tier].label}</span></div>
          <div class="glance__cell"><span class="glance__v">~${fmtUsd(quality.usd)}</span><span class="glance__k">AI build · ${escHtml(quality.name)}</span></div>
          <div class="glance__cell"><span class="glance__v">~${fmtUsd(yearOneTotal())}</span><span class="glance__k">Year one, all-in</span></div>
        </div>
      </div>
    </section>`;
}

// ── Step 2: the stack ────────────────────────────────────────

function renderAlt(catKey, optKey, o, isCurrent) {
  const free = o.free ? `<span class="alt__line alt__free"><strong>Free tier:</strong> ${escHtml(o.free)}</span>` : '';
  const rev = o.revshare ? `<span class="alt__line"><strong>Cut:</strong> ${escHtml(o.revshare)}</span>` : '';
  const bundles = o.bundles
    ? `<span class="alt__line"><strong>Absorbs:</strong> ${o.bundles.map(b => CATEGORIES[b].label).join(', ')}. One bill, many jobs</span>` : '';
  const action = isCurrent
    ? `<span class="badge badge--rec">In the stack</span>`
    : `<button class="btn btn--sm btn--secondary" data-action="pick" data-cat="${catKey}" data-opt="${optKey}">Use this</button>`;
  const link = o.url ? `<a class="alt__link" href="${escHtml(o.url)}" target="_blank" rel="noopener noreferrer">pricing ↗</a>` : '';
  return `
    <div class="alt${isCurrent ? ' is-current' : ''}">
      <span class="alt__head">${favicon(o.url)}<span class="alt__name">${escHtml(o.name)}</span> ${badge(o.type)}</span>
      ${bundles}
      ${free}
      <span class="alt__line"><strong>Then:</strong> ${escHtml(o.entry)}</span>
      ${rev}
      <span class="alt__line alt__gotcha">${icon('warn', 'ic--warn')} ${escHtml(o.gotcha)}</span>
      ${o.exit ? `<span class="alt__line alt__exit alt__exit--${o.exit}"><strong>Exit ${o.exit}:</strong> ${escHtml(o.exitNote)}</span>` : ''}
      <span class="alt__actions">${action}${link}</span>
    </div>`;
}

function renderIngredient(catKey) {
  const cat = CATEGORIES[catKey];
  const pick = currentPick(catKey);
  const open = state.ui.openCat === catKey;
  const b = bundlerFor(catKey);

  let pickHtml, costHtml;
  if (!pick && b) {
    pickHtml = `<span class="ing__pick">→ bundled with ${escHtml(b.name)}</span>`;
    costHtml = `<span class="ing__cost">$0<small>in ${escHtml(b.name)}</small></span>`;
  } else if (pick) {
    pickHtml = `<span class="ing__pick">${favicon(pick.url)}${escHtml(pick.name)} ${badge(pick.type)}</span>`;
    costHtml = `<span class="ing__cost">${fmtUsd(pick.cost[state.tier])}/mo<small>${TIERS[state.tier].label}</small></span>`;
  } else {
    pickHtml = `<span class="ing__pick">-</span>`;
    costHtml = '';
  }

  let altsHtml = '';
  if (open) {
    const oss = [], managed = [];
    for (const [optKey, o] of Object.entries(cat.options)) {
      if (o.type === 'none') { managed.push([optKey, o]); continue; }
      (o.strategy === 'oss' ? oss : managed).push([optKey, o]);
    }
    const currentKey = state.picks[catKey];
    altsHtml = `
      <div class="ing__alts">
        <div class="alt-group alt-group--oss">
          <span class="alt-group__title">Open source / self-host</span>
          ${oss.length ? oss.map(([k, o]) => renderAlt(catKey, k, o, k === currentKey)).join('') : '<span class="alt__line">No self-host path here. This one is a service.</span>'}
        </div>
        <div class="alt-group alt-group--managed">
          <span class="alt-group__title">Managed / pay-to-win</span>
          ${managed.map(([k, o]) => renderAlt(catKey, k, o, k === currentKey)).join('')}
        </div>
      </div>`;
  }

  return `
    <div class="ing${open ? ' is-open' : ''}">
      <button class="ing__main" data-action="toggle-cat" data-cat="${catKey}" aria-expanded="${open}">
        <span class="ing__icon" aria-hidden="true">${icon(cat.icon)}</span>
        <span class="ing__id">
          <span class="ing__cat">${escHtml(cat.label)}</span>
          ${pickHtml}
        </span>
        ${costHtml}
        <span class="ing__chev" aria-hidden="true">▸</span>
      </button>
      ${altsHtml}
    </div>`;
}

function renderFrontend() {
  const cards = Object.entries(FRONTENDS).map(([key, f]) => {
    const active = key === state.frontend ? ' is-active' : '';
    return `
      <button class="fe-card${active}" data-action="frontend" data-frontend="${key}" aria-pressed="${key === state.frontend}">
        <span class="fe-card__name">${escHtml(f.label)} <span class="chip">${escHtml(f.chip)}</span></span>
        <span class="fe-card__blurb">${escHtml(f.blurb)}</span>
        <ul class="fe-card__list">
          ${f.pros.map(p => `<li>${escHtml(p)}</li>`).join('')}
          ${f.cons.map(c => `<li class="is-con">${escHtml(c)}</li>`).join('')}
        </ul>
      </button>`;
  }).join('');

  return `
    <div class="subsection" style="margin-top: var(--space-6);">
      <h3 class="step-head__title" style="font-size: var(--text-base); margin-bottom: var(--space-3);">Frontend, pick your compromise</h3>
      <div class="fe-grid">${cards}</div>
    </div>`;
}

function renderStack() {
  return `
    <section class="step" aria-labelledby="s2">
      <div class="step-head">
        <span class="step-head__n">2</span>
        <h2 class="step-head__title" id="s2">The stack</h2>
        <span class="step-head__aside">
          <span class="switch" role="group" aria-label="Strategy quick-swap">
            <button class="switch__btn switch__btn--free" data-action="strategy" data-strategy="free" title="Cheapest pick per category: the whole stack on free tiers, viewed at Hobby">Free tier</button>
            <button class="switch__btn switch__btn--oss" data-action="strategy" data-strategy="oss">All open-source</button>
            <button class="switch__btn switch__btn--paid" data-action="strategy" data-strategy="managed">All managed</button>
          </span>
        </span>
        <p class="step-head__lead">Tap an ingredient to swap it. BaaS picks (Convex, Supabase, Firebase, PocketBase) absorb whole categories into one bill.</p>
      </div>
      <div class="stack-list">
        ${activeCategories().map(renderIngredient).join('')}
      </div>
      ${renderFrontend()}
    </section>`;
}

// ── Step 3: costs ────────────────────────────────────────────

function fmtDelta(n) {
  if (n === 0) return '<span class="cmp-same">same</span>';
  const cls = n > 0 ? 'cmp-up' : 'cmp-down';
  return `<span class="${cls}">${n > 0 ? '+' : '−'}$${Math.abs(n)}</span>`;
}

function renderCompareCard() {
  const pinned = state.pinned;
  if (!pinned) {
    return `
        <div class="cost-card">
          <h3 class="cost-card__title">Compare two stacks</h3>
          <p class="cost-card__sub">Pin the current stack, keep tweaking, and watch the per-ingredient delta. Or paste another session's share link as the baseline.</p>
          <div class="export-actions">
            <button class="btn btn--secondary" data-action="pin-stack">Pin current stack</button>
          </div>
          <div class="cmp-load">
            <input type="text" id="compare-input" class="cmp-input" placeholder="…or paste a share link">
            <button class="btn btn--sm btn--ghost" data-action="compare-load">Load</button>
          </div>
        </div>`;
  }

  const t = state.tier;
  const pr = RECIPES[pinned.recipe] || RECIPES.blank;
  const cats = [...new Set([...pr.categories, ...activeCategories()])];
  const sideName = (cfg, inRecipe, catKey, live) => {
    if (!inRecipe.categories.includes(catKey)) return '<span class="cmp-absent">not in recipe</span>';
    const key = cfg ? cfg.picks[catKey] : state.picks[catKey];
    const opt = CATEGORIES[catKey].options[key];
    if (opt) return escHtml(opt.name);
    if (live && bundlerFor(catKey)) return `bundled (${escHtml(bundlerFor(catKey).name)})`;
    return key === 'bundled' ? 'bundled' : '<span class="cmp-absent">?</span>';
  };
  const sideCost = (cfg, inRecipe, catKey) => {
    if (!inRecipe.categories.includes(catKey)) return 0;
    const opt = CATEGORIES[catKey].options[cfg ? cfg.picks[catKey] : state.picks[catKey]];
    return opt ? opt.cost[t] : 0;
  };
  const cur = RECIPES[state.recipe] || RECIPES.blank;
  const rows = cats.map(catKey => {
    const a = sideCost(pinned, pr, catKey);
    const b = sideCost(null, cur, catKey);
    return `
    <tr>
      <td>${escHtml(CATEGORIES[catKey].label)}</td>
      <td>${sideName(pinned, pr, catKey, false)}</td>
      <td>${sideName(null, cur, catKey, true)}</td>
      <td>${fmtDelta(b - a)}</td>
    </tr>`;
  }).join('');

  const pinTotals = totalsForConfig(pinned);
  const curTotals = infraTotals();
  const q = qualityModel();
  const pinBuild = buildCostUsd(AI_MODELS[q.key], buildTokensForConfig(pinned));
  const curBuild = q.usd;

  return `
        <div class="cost-card">
          <h3 class="cost-card__title">Compare: pinned vs current</h3>
          <p class="cost-card__sub">Pinned: <strong>${escHtml(pr.label)}</strong>. Deltas at the ${TIERS[t].label} tier; positive means the current stack costs more.</p>
          <table class="cost-table cmp-table">
            <thead><tr><th>Ingredient</th><th>Pinned</th><th>Current</th><th>Δ/mo</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td>Total</td><td>${fmtUsd(pinTotals[t])}</td><td>${fmtUsd(curTotals[t])}</td><td>${fmtDelta(curTotals[t] - pinTotals[t])}</td></tr></tfoot>
          </table>
          <div class="sub-note">AI build on ${escHtml(q.name)}: pinned ~${fmtUsd(pinBuild)} vs current ~${fmtUsd(curBuild)} (${fmtDelta(Math.round(curBuild - pinBuild))} one-time).</div>
          <div class="export-actions" style="margin-top: var(--space-3); margin-bottom: 0;">
            <button class="btn btn--sm btn--secondary" data-action="pin-stack">Re-pin current</button>
            <button class="btn btn--sm btn--ghost" data-action="unpin">Unpin</button>
          </div>
        </div>`;
}

function renderCosts() {
  const rows = infraRows();
  const totals = infraTotals();
  const ossTotal = strategyTotals('oss');
  const managedTotal = strategyTotals('managed');
  const freeTotal = freeTotals();
  const t = state.tier;

  const tierBtn = k => `<button class="switch__btn${t === k ? ' is-active' : ''}" data-action="tier" data-tier="${k}">${TIERS[k].label}</button>`;

  const infraBody = rows.map(r => `
    <tr>
      <td><span class="cost-cat">${escHtml(r.label)}</span><br><span class="cost-pick">${escHtml(r.name)}</span>${r.bundled ? ' <span class="badge badge--rec">bundled</span>' : ''}</td>
      <td class="${t === 'hobby' ? 'is-tier' : ''}">${fmtUsd(r.cost.hobby)}</td>
      <td class="${t === 'launched' ? 'is-tier' : ''}">${fmtUsd(r.cost.launched)}</td>
      <td class="${t === 'scaling' ? 'is-tier' : ''}">${fmtUsd(r.cost.scaling)}</td>
    </tr>`).join('');

  return `
    <section class="step" aria-labelledby="s3">
      <div class="step-head">
        <span class="step-head__n">3</span>
        <h2 class="step-head__title" id="s3">What it costs</h2>
        <span class="step-head__aside">
          <span class="switch" role="group" aria-label="Scale tier">
            ${tierBtn('hobby')}${tierBtn('launched')}${tierBtn('scaling')}
          </span>
        </span>
        <p class="step-head__lead">${escHtml(TIERS[t].note)} Free-tier swap: ~${fmtUsd(freeTotal[t])}/mo · all-OSS: ~${fmtUsd(ossTotal[t])}/mo · all-managed: ~${fmtUsd(managedTotal[t])}/mo.</p>
      </div>
      <div class="cost-grid">
        <div class="cost-card">
          <h3 class="cost-card__title">Run it: infra per month</h3>
          <p class="cost-card__sub">Estimates from free-tier limits + entry plans, July 2026. Confirm on the linked pages.</p>
          <table class="cost-table">
            <thead><tr><th>Ingredient</th><th>Hobby</th><th>Launched</th><th>Scaling</th></tr></thead>
            <tbody>${infraBody}</tbody>
            <tfoot><tr><td>Total</td><td class="${t === 'hobby' ? 'is-tier' : ''}">${fmtUsd(totals.hobby)}</td><td class="${t === 'launched' ? 'is-tier' : ''}">${fmtUsd(totals.launched)}</td><td class="${t === 'scaling' ? 'is-tier' : ''}">${fmtUsd(totals.scaling)}</td></tr></tfoot>
          </table>
          <div class="cost-total-big">
            <span class="cost-total-big__k">${TIERS[t].label} total</span>
            <span class="cost-total-big__v">${fmtUsd(totals[t])}<small>/mo</small></span>
          </div>
        </div>
        ${renderCompareCard()}
      </div>
    </section>`;
}

// ── Step 4: the builder ──────────────────────────────────────

function renderBuilder() {
  const tokens = buildTokens();
  const models = modelCosts();
  const sub = subscriptionPath();

  const modelBody = models.map(m => `
    <tr${m.cheapest ? ' class="is-best"' : ''}>
      <td>${escHtml(m.name)}${m.bestValue ? ' <span class="chip chip--best">Best value</span>' : ''}</td>
      <td>${escHtml(m.provider)}</td>
      <td>${fmtUsd(m.usd)}</td>
    </tr>`).join('');

  const toolBody = AGENT_TOOLS.map(tool => `
    <li class="tool-item">
      <span class="tool-item__head">${favicon(tool.url)}<strong>${escHtml(tool.name)}</strong> <span class="tool-item__pay">${escHtml(tool.pay)}</span></span>
      <span class="tool-item__note">${escHtml(tool.note)}</span>
    </li>`).join('');

  return `
    <section class="step" aria-labelledby="s4">
      <div class="step-head">
        <span class="step-head__n">4</span>
        <h2 class="step-head__title" id="s4">The builder</h2>
        <p class="step-head__lead">The AI that writes the copy: what the build costs per model, and which tool actually runs it.</p>
      </div>
      <div class="cost-grid">
        <div class="cost-card">
          <h3 class="cost-card__title">Build it: one-time AI cost</h3>
          <p class="cost-card__sub">~${fmtTokens(tokens)} tokens for a ${SIZE_LABELS[RECIPES[state.recipe].size].toLowerCase()} build with the ${escHtml(FRONTENDS[state.frontend].label)} frontend (3:1 input:output blend). Model prices verified Aug 2026.</p>
          <table class="model-table">
            <thead><tr><th>Model</th><th>Provider</th><th>Build cost</th></tr></thead>
            <tbody>${modelBody}</tbody>
          </table>
          <p class="cost-note">Best value = quality-per-dollar right now. Prompt-cache hits and batch mode push real API cost 50–90% lower. Sticker prices are not directly comparable across vendors: the newest Claudes tokenize ~30% more tokens for the same text than older models.</p>
        </div>
        <div class="cost-card">
          <h3 class="cost-card__title">Run the build: tools and plans</h3>
          <p class="cost-card__sub">Most builds never touch the API: a flat plan plus an agent tool covers them.</p>
          <div class="sub-note"><strong>For this recipe:</strong> ${escHtml(sub.plan)} (~$${sub.usd}/mo), ${escHtml(sub.note)}</div>
          <ul class="tool-list">${toolBody}</ul>
          <p class="cost-note">Route by task: the frontier model for architecture and hard bugs, the cheap tier for boilerplate and edits. A 70/30 cheap-to-frontier split routinely halves the model table.</p>
        </div>
      </div>
    </section>`;
}

// ── Step 5: challenges ───────────────────────────────────────

function renderChallenges() {
  const recipe = RECIPES[state.recipe];
  const gotchas = activeGotchas();
  return `
    <section class="step" aria-labelledby="s5">
      <div class="step-head">
        <span class="step-head__n">5</span>
        <h2 class="step-head__title" id="s5">The hard parts</h2>
        <p class="step-head__lead">What this recipe hides from you, plus the fine print on every ingredient you picked.</p>
      </div>
      <div class="chal-grid">
        <div>
          <ol class="chal-list">
            ${recipe.challenges.map((c, i) => `
              <li class="chal-item">
                <span class="chal-item__n">${i + 1}</span>
                <span><strong>${escHtml(c.title)}.</strong> ${escHtml(c.note)}</span>
              </li>`).join('')}
          </ol>
        </div>
        <div>
          <ul class="gotcha-list">
            ${gotchas.map(g => `
              <li class="gotcha-item">${icon('warn', 'ic--warn')} <strong>${escHtml(g.from)}</strong>, ${escHtml(g.text)}</li>`).join('')}
          </ul>
        </div>
      </div>
    </section>`;
}

// ── Step 6: export ───────────────────────────────────────────

function usageField(label, field, placeholder) {
  const v = state.usage[field];
  return `
    <label class="usage-field">
      <span>${escHtml(label)}</span>
      <input type="number" min="0" inputmode="numeric" placeholder="${escHtml(placeholder)}"
        data-action="usage" data-field="${field}" value="${escHtml(String(v ?? ''))}">
    </label>`;
}

function renderExport() {
  return `
    <section class="step" aria-labelledby="s6">
      <div class="step-head">
        <span class="step-head__n">6</span>
        <h2 class="step-head__title" id="s6">Take the prompts</h2>
        <p class="step-head__lead">Two exports: the build order for the AI that cooks, and a fit check that asks whether the free tiers will actually hold your numbers.</p>
      </div>
      <div class="export-grid">
        <div class="cost-card">
          <h3 class="cost-card__title">Build order</h3>
          <p class="cost-card__sub">The whole session as a build order, drop it into any AI coding tool and cook.</p>
          <div class="export-actions">
            <button class="btn btn--primary" data-action="copy-prompt">Copy prompt</button>
            <button class="btn btn--secondary" data-action="download-prompt">Download .md</button>
            <button class="btn btn--ghost" data-action="share-link">Copy share link</button>
          </div>
          <pre class="prompt-pre" id="prompt-preview">${escHtml(buildPrompt())}</pre>
        </div>
        <div class="cost-card">
          <h3 class="cost-card__title">Will the free tiers hold?</h3>
          <p class="cost-card__sub">Your expected usage plus every pick's recorded limits, as a research prompt: an agent verifies live pricing pages and names the first limit to break.</p>
          <div class="usage-row">
            ${usageField('Visitors / month', 'visitors', 'e.g. 2000')}
            ${usageField('Active users', 'users', 'e.g. 50')}
            ${usageField('Stored GB', 'storageGb', 'e.g. 1')}
          </div>
          <div class="export-actions">
            <button class="btn btn--primary" data-action="copy-fit">Copy fit check</button>
            <button class="btn btn--secondary" data-action="download-fit">Download .md</button>
          </div>
          <pre class="prompt-pre" id="fit-preview">${escHtml(buildFitPrompt())}</pre>
        </div>
      </div>
    </section>`;
}

// ── Root ─────────────────────────────────────────────────────

export function renderApp() {
  $('app').innerHTML =
    renderRecipes() +
    renderStack() +
    renderCosts() +
    renderBuilder() +
    renderChallenges() +
    renderExport();
}
