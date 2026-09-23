// ── Cost model ───────────────────────────────────────────────
// Two answers:
//   1. Infra: what the chosen stack costs per month at each tier
//   2. AI build: the one-time token cost of generating this app
//      with different coding models (+ the subscription path)

import { CATEGORIES } from './data-services.js';
import { RECIPES, FRONTENDS } from './data-recipes.js';
import { AI_MODELS, SIZE_TOKENS, buildCostUsd, SUBSCRIPTION_PATH } from './data-models.js';
import { state, activeCategories, currentPick, bundlerFor, freeTierPicks } from './state.js';

/**
 * Per-category cost rows for the current picks.
 * Bundled categories report $0 with a pointer to their bundler.
 */
export function infraRows() {
  const rows = [];
  for (const catKey of activeCategories()) {
    const cat = CATEGORIES[catKey];
    const pick = currentPick(catKey);
    if (!pick) {
      const b = bundlerFor(catKey);
      rows.push({ catKey, label: cat.label, name: b ? b.name : '-', bundled: true, cost: { hobby: 0, launched: 0, scaling: 0 } });
      continue;
    }
    rows.push({ catKey, label: cat.label, name: pick.name, type: pick.type, bundled: false, cost: pick.cost });
  }
  return rows;
}

/** Total monthly infra cost per tier: { hobby, launched, scaling }. */
export function infraTotals() {
  const totals = { hobby: 0, launched: 0, scaling: 0 };
  for (const row of infraRows()) {
    totals.hobby += row.cost.hobby;
    totals.launched += row.cost.launched;
    totals.scaling += row.cost.scaling;
  }
  return totals;
}

/**
 * What the stack would cost under a pure strategy (all open-source vs
 * all managed) — computed hypothetically, without touching state.
 * Skips categories with no option for that strategy.
 */
export function strategyTotals(strategy) {
  const totals = { hobby: 0, launched: 0, scaling: 0 };
  for (const catKey of activeCategories()) {
    const opts = CATEGORIES[catKey].options;
    const entries = Object.entries(opts).filter(([k, o]) => k !== 'none' && o.strategy === strategy);
    if (!entries.length) continue;
    let hit = entries[0];
    if (strategy === 'managed') {
      const rec = entries.find(([, o]) => o.recommended);
      if (rec) hit = rec;
    }
    totals.hobby += hit[1].cost.hobby;
    totals.launched += hit[1].cost.launched;
    totals.scaling += hit[1].cost.scaling;
  }
  return totals;
}

/**
 * What the free-tier quick-swap would cost, computed hypothetically
 * without touching state. Bundle-aware via freeTierPicks, so a claimed
 * category contributes $0 the same way it would after the swap.
 */
export function freeTotals() {
  const totals = { hobby: 0, launched: 0, scaling: 0 };
  const picks = freeTierPicks();
  for (const catKey of Object.keys(picks)) {
    const opt = CATEGORIES[catKey].options[picks[catKey]];
    if (!opt) continue; // 'bundled' sentinel: absorbed into its bundler's bill
    totals.hobby += opt.cost.hobby;
    totals.launched += opt.cost.launched;
    totals.scaling += opt.cost.scaling;
  }
  return totals;
}

/** Estimated total tokens to build the current recipe + frontend. */
export function buildTokens() {
  const recipe = RECIPES[state.recipe] || RECIPES.blank;
  const fe = FRONTENDS[state.frontend] || FRONTENDS.tailwind;
  return Math.round(SIZE_TOKENS[recipe.size] * fe.tokenFactor);
}

/** The best-value model's row — the reference build cost everywhere. */
export function qualityModel() {
  const models = modelCosts();
  return models.find(m => m.bestValue) || models[0];
}

/**
 * The headline number: a year of running it at Launched, plus building
 * it once on the best-value model. What year one actually costs.
 */
export function yearOneTotal() {
  return 12 * infraTotals().launched + qualityModel().usd;
}

/** Infra totals for a saved config (the compare pin), not current state. */
export function totalsForConfig(cfg) {
  const totals = { hobby: 0, launched: 0, scaling: 0 };
  const r = RECIPES[cfg.recipe] || RECIPES.blank;
  for (const catKey of r.categories) {
    const cat = CATEGORIES[catKey];
    const opt = cat && cat.options[cfg.picks[catKey]];
    if (!opt) continue; // 'bundled' sentinel or a pick that no longer exists
    totals.hobby += opt.cost.hobby;
    totals.launched += opt.cost.launched;
    totals.scaling += opt.cost.scaling;
  }
  return totals;
}

/** Build tokens for a saved config, same math as buildTokens(). */
export function buildTokensForConfig(cfg) {
  const recipe = RECIPES[cfg.recipe] || RECIPES.blank;
  const fe = FRONTENDS[cfg.frontend] || FRONTENDS.tailwind;
  return Math.round(SIZE_TOKENS[recipe.size] * fe.tokenFactor);
}

/**
 * One-time build cost across all tracked models, cheapest first:
 * [ { key, name, provider, usd, note, cheapest, bestValue } ].
 */
export function modelCosts() {
  const tokens = buildTokens();
  return Object.entries(AI_MODELS)
    .map(([key, m]) => ({
      key, name: m.name, provider: m.provider, note: m.note,
      cheapest: !!m.cheapest, bestValue: !!m.bestValue,
      usd: buildCostUsd(m, tokens),
    }))
    .sort((a, b) => a.usd - b.usd);
}

/** The flat-subscription alternative for this recipe size. */
export function subscriptionPath() {
  const recipe = RECIPES[state.recipe] || RECIPES.blank;
  return SUBSCRIPTION_PATH[recipe.size];
}

/** Gotchas of every current pick (for the challenges section). */
export function activeGotchas() {
  const out = [];
  for (const catKey of activeCategories()) {
    const pick = currentPick(catKey);
    if (pick && pick.gotcha && pick.type !== 'none') {
      out.push({ from: pick.name, text: pick.gotcha });
    }
  }
  return out;
}

/** Build rules imposed by the current picks (for the prompt's constraints). */
export function activeRules() {
  const out = [];
  for (const catKey of activeCategories()) {
    const pick = currentPick(catKey);
    if (pick && pick.rule && pick.type !== 'none') {
      out.push({ from: pick.name, text: pick.rule });
    }
  }
  return out;
}

/** Exit ratings of the current picks, hardest exits first. */
export function activeExits() {
  const order = { rewrite: 0, sticky: 1, easy: 2 };
  const out = [];
  for (const catKey of activeCategories()) {
    const pick = currentPick(catKey);
    if (pick && pick.exit && pick.type !== 'none') {
      out.push({ from: pick.name, grade: pick.exit, note: pick.exitNote });
    }
  }
  return out.sort((a, b) => order[a.grade] - order[b.grade]);
}
