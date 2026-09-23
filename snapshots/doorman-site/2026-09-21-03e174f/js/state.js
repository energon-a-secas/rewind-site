// ── State management ─────────────────────────────────────────
// The current cookbook session: chosen recipe, per-category picks,
// frontend approach, and the scale tier used for cost display.
// Persists to localStorage; shareable via URL hash. No backend.

import { CATEGORIES } from './data-services.js';
import { RECIPES, FRONTENDS } from './data-recipes.js';
import { PRESETS } from './data-presets.js';

const STORAGE_KEY = 'doorman-cookbook-v1';
const HASH_PREFIX = '#c=';

export const state = {
  recipe: 'saas',                 // recipe key | 'blank'
  picks: {},                      // { [categoryKey]: optionKey } — only categories in the recipe
  frontend: 'tailwind',           // FRONTENDS key
  tier: 'launched',               // 'hobby' | 'launched' | 'scaling'
  usage: { visitors: '', users: '', storageGb: '' }, // fit-check inputs, string-typed (input values)
  pinned: null,                   // compare snapshot: { recipe, picks, frontend } | null
  ui: { openCat: null, preset: null }, // ephemeral — open swap panel; active preset chip (never persisted)
};

const USAGE_DEFAULTS = { visitors: '', users: '', storageGb: '' };

/** Restore usage shape after loading old saves/hashes that predate it. */
function normalizeUsage() {
  const u = (state.usage && typeof state.usage === 'object') ? state.usage : {};
  state.usage = { ...USAGE_DEFAULTS, ...u };
}

/** Categories relevant to the current recipe, in display order. */
export function activeCategories() {
  const r = RECIPES[state.recipe];
  return r ? r.categories : Object.keys(CATEGORIES);
}

/** Default pick for a category: the option marked recommended. */
function defaultPick(catKey) {
  const opts = CATEGORIES[catKey].options;
  const rec = Object.entries(opts).find(([, o]) => o.recommended);
  return rec ? rec[0] : Object.keys(opts)[0];
}

/** Load a recipe: reset picks to its defaults. */
export function applyRecipe(recipeKey) {
  state.recipe = recipeKey;
  state.picks = {};
  for (const catKey of activeCategories()) {
    const r = RECIPES[recipeKey];
    state.picks[catKey] = (r && r.defaults && r.defaults[catKey]) || defaultPick(catKey);
  }
}

/**
 * Load a copy-a-real-site preset: its recipe, then its pick overrides
 * (same bypass-setPick semantics as recipe defaults). The preset stays
 * marked in state.ui until the next manual recipe change.
 */
export function applyPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;
  applyRecipe(p.recipe);
  if (p.picks) Object.assign(state.picks, p.picks);
  if (p.frontend && FRONTENDS[p.frontend]) state.frontend = p.frontend;
  state.ui.preset = presetKey;
}

// ── Compare pin ──────────────────────────────────────────────

/** Snapshot the current stack as the comparison baseline. */
export function pinCurrent() {
  state.pinned = { recipe: state.recipe, picks: { ...state.picks }, frontend: state.frontend };
}

export function unpin() {
  state.pinned = null;
}

/**
 * Pin from a pasted share link (full URL or raw #c= hash). Returns
 * true when it parsed into a valid config.
 */
export function pinFromShare(text) {
  const i = (text || '').indexOf(HASH_PREFIX);
  if (i === -1) return false;
  try {
    const saved = JSON.parse(decodeURIComponent(atob(text.slice(i + HASH_PREFIX.length).trim())));
    if (!RECIPES[saved.recipe]) return false;
    state.pinned = {
      recipe: saved.recipe,
      picks: (saved.picks && typeof saved.picks === 'object') ? saved.picks : {},
      frontend: FRONTENDS[saved.frontend] ? saved.frontend : 'tailwind',
    };
    return true;
  } catch { return false; }
}

/** Swap every category to its open-source or managed strategy pick. */
export function applyStrategy(strategy) {
  for (const catKey of activeCategories()) {
    const opts = CATEGORIES[catKey].options;
    // Managed strategy prefers the recommended option; OSS takes the
    // first self-host/open option. Either way, skip 'none'.
    const entries = Object.entries(opts).filter(([k, o]) => k !== 'none' && o.strategy === strategy);
    if (!entries.length) continue;
    let hit = entries[0];
    if (strategy === 'managed') {
      const rec = entries.find(([, o]) => o.recommended);
      if (rec) hit = rec;
    }
    setPick(catKey, hit[0]);
  }
}

/**
 * Hypothetical free-tier pick per active category: the option flagged
 * `freeTier`, else the first $0-at-hobby option, else 'none', else the
 * cheapest at hobby. Bundle-aware in the opposite direction from
 * applyStrategy: a category claimed by a free bundler STAYS bundled,
 * because fewest vendors is the point of the free path.
 */
export function freeTierPicks() {
  const picks = {};
  const claimed = new Set();
  const cats = activeCategories();
  for (const catKey of cats) {
    const opts = CATEGORIES[catKey].options;
    const entries = Object.entries(opts).filter(([k, o]) => k !== 'none' && o.type !== 'none');
    const hit = entries.find(([, o]) => o.freeTier)
      || entries.find(([, o]) => o.cost.hobby === 0)
      || (opts.none ? ['none'] : [...entries].sort((a, b) => a[1].cost.hobby - b[1].cost.hobby)[0]);
    picks[catKey] = hit[0];
    const bundles = opts[hit[0]] && opts[hit[0]].bundles;
    if (bundles) for (const b of bundles) if (cats.includes(b)) claimed.add(b);
  }
  for (const c of claimed) picks[c] = 'bundled';
  return picks;
}

/** The third quick-swap: every category to its free-tier pick, viewed at Hobby. */
export function applyFreeTier() {
  state.picks = freeTierPicks();
  state.tier = 'hobby';
}

/** Currently selected option object for a category. */
export function currentPick(catKey) {
  const cat = CATEGORIES[catKey];
  const key = state.picks[catKey];
  return cat.options[key] ? { key, ...cat.options[key] } : null;
}

/**
 * Which active pick (if any) bundles this category — e.g. a Supabase
 * database pick absorbs auth/storage/realtime. Returns { catKey, optKey,
 * name } or null.
 */
export function bundlerFor(catKey) {
  for (const c of activeCategories()) {
    if (c === catKey) continue;
    const optKey = state.picks[c];
    const opt = CATEGORIES[c].options[optKey];
    if (opt && opt.bundles && opt.bundles.includes(catKey)) {
      return { catKey: c, optKey, name: opt.name };
    }
  }
  return null;
}

/** First standalone (non-'none') option key — used when a bundle dissolves. */
function standaloneDefault(catKey) {
  const opts = CATEGORIES[catKey].options;
  const rec = Object.entries(opts).find(([k, o]) => o.recommended && k !== 'none');
  if (rec) return rec[0];
  const first = Object.keys(opts).find(k => k !== 'none');
  return first || 'none';
}

/**
 * Set a pick. Picking an option with `bundles` claims those categories
 * (stomps their picks to 'bundled' — re-pick them after to override).
 * Then clears stale 'bundled' sentinels whose bundler disappeared.
 */
export function setPick(catKey, optKey) {
  state.picks[catKey] = optKey;
  const opt = CATEGORIES[catKey].options[optKey];
  if (opt && opt.bundles) {
    for (const b of opt.bundles) {
      if (activeCategories().includes(b)) state.picks[b] = 'bundled';
    }
  }
  for (const c of activeCategories()) {
    if (state.picks[c] === 'bundled' && !bundlerFor(c)) {
      state.picks[c] = standaloneDefault(c);
    }
  }
}

// ── Persistence ──────────────────────────────────────────────

const PERSIST_KEYS = ['recipe', 'picks', 'frontend', 'tier', 'usage', 'pinned'];

export function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    for (const k of PERSIST_KEYS) if (k in saved) state[k] = saved[k];
    if (!RECIPES[state.recipe] && state.recipe !== 'blank') state.recipe = 'saas';
    if (!FRONTENDS[state.frontend]) state.frontend = 'tailwind';
    normalizeUsage();
    return true;
  } catch { return false; }
}

export function save() {
  try {
    const out = {};
    for (const k of PERSIST_KEYS) out[k] = state[k];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch { /* storage full or blocked — session-only is fine */ }
}

// ── URL hash sharing (dynamic-wheel pattern) ─────────────────

export function encodeShare() {
  const out = {};
  for (const k of PERSIST_KEYS) out[k] = state[k];
  return btoa(encodeURIComponent(JSON.stringify(out)));
}

export function writeHash() {
  history.replaceState(null, '', HASH_PREFIX + encodeShare());
}

/** Load from URL hash. Returns true if a shared config was applied. */
export function loadHash() {
  if (!location.hash.startsWith(HASH_PREFIX)) return false;
  try {
    const saved = JSON.parse(decodeURIComponent(atob(location.hash.slice(HASH_PREFIX.length))));
    for (const k of PERSIST_KEYS) if (k in saved) state[k] = saved[k];
    if (!RECIPES[state.recipe] && state.recipe !== 'blank') return false;
    normalizeUsage();
    return true;
  } catch { return false; }
}

/** Boot order: URL hash → localStorage → default recipe. */
export function initState() {
  if (loadHash()) return;
  if (loadSaved()) return;
  applyRecipe('saas');
}
