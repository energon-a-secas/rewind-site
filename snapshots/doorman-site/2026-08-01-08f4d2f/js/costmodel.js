// ── Cost model ───────────────────────────────────────────────
// Two answers:
//   1. Infra: what the chosen stack costs per month at each tier
//   2. AI build: the one-time token cost of generating this app
//      with different coding models (+ the subscription path)

import { CATEGORIES } from './data-services.js';
import { RECIPES, FRONTENDS } from './data-recipes.js';
import { AI_MODELS, SIZE_TOKENS, buildCostUsd, SUBSCRIPTION_PATH } from './data-models.js';
import { state, activeCategories, currentPick, bundlerFor } from './state.js';

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
      rows.push({ catKey, label: cat.label, name: b ? b.name : '—', bundled: true, cost: { hobby: 0, launched: 0, scaling: 0 } });
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

/** Estimated total tokens to build the current recipe + frontend. */
export function buildTokens() {
  const recipe = RECIPES[state.recipe] || RECIPES.blank;
  const fe = FRONTENDS[state.frontend] || FRONTENDS.tailwind;
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
