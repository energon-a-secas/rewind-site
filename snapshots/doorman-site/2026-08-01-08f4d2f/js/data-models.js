// ── AI build-cost model ──────────────────────────────────────
// Researched July 2026 (api pricing pages). The one-time cost of
// generating the app with an AI coding agent:
//
//   buildCost = sizeTokens(recipe) × tokenFactor(frontend) × blendedRate(model)
//
// blendedRate assumes a 3:1 input:output ratio (typical agentic
// coding mix; heavy prompt-cache hits push real cost lower).
// Prices change monthly — the table is a snapshot, links included.

export const AI_MODELS = {
  'sonnet-5':     { name: 'Claude Sonnet 5',     provider: 'Anthropic', in: 2.00,  out: 10.00, note: 'Best value quality — intro price ends Aug 2026, then $3/$15', bestValue: true },
  'opus-5':       { name: 'Claude Opus 5',       provider: 'Anthropic', in: 5.00,  out: 25.00, note: 'Top-tier coding model' },
  'haiku-45':     { name: 'Claude Haiku 4.5',    provider: 'Anthropic', in: 1.00,  out: 5.00,  note: 'Fast/cheap — edits and boilerplate' },
  'gpt56-terra':  { name: 'GPT-5.6 Terra',       provider: 'OpenAI',    in: 2.50,  out: 15.00, note: 'Mid flagship split' },
  'gpt53-codex':  { name: 'GPT-5.3 Codex',       provider: 'OpenAI',    in: 1.75,  out: 14.00, note: 'Coding-tuned' },
  'gpt5-mini':    { name: 'GPT-5 mini',          provider: 'OpenAI',    in: 0.25,  out: 2.00,  note: 'Budget tier' },
  'gemini31-pro': { name: 'Gemini 3.1 Pro',      provider: 'Google',    in: 2.00,  out: 12.00, note: '≤200K ctx; pricier above' },
  'gemini35-flash': { name: 'Gemini 3.5 Flash',  provider: 'Google',    in: 1.50,  out: 9.00,  note: 'Workhorse' },
  'kimi-k3':      { name: 'Kimi K3',             provider: 'Moonshot',  in: 3.00,  out: 15.00, note: '1M ctx, open weights' },
  'qwen3-flash':  { name: 'Qwen3 Coder Flash',   provider: 'Alibaba',   in: 0.30,  out: 1.50,  note: '1M ctx, very cheap' },
  'deepseek-v4':  { name: 'DeepSeek V4 Flash',   provider: 'DeepSeek',  in: 0.14,  out: 0.28,  note: 'Cheapest credible coding API', cheapest: true },
};

/**
 * Total tokens (input + output) to build a recipe of each size with an
 * agentic coding tool — mid-points of observed ranges (landing page
 * 0.5–2M, CRUD 2–10M, full-stack 10–50M), extended for L/XL.
 * Frontend tokenFactor (0.7 / 1.0 / 1.5) multiplies this.
 */
export const SIZE_TOKENS = {
  S:  1_500_000,
  M:  6_000_000,
  L:  15_000_000,
  XL: 35_000_000,
};

export const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large', XL: 'Boss fight' };

/** Blended $/Mtok at a 3:1 input:output ratio. */
export function blendedRate(model) {
  return 0.75 * model.in + 0.25 * model.out;
}

/** One-time build cost in USD for `tokens` total tokens. */
export function buildCostUsd(model, tokens) {
  return (tokens / 1_000_000) * blendedRate(model);
}

/**
 * The subscription path — most hobby builders never touch the API.
 * Which flat plan plausibly covers building this size in ~a month.
 */
export const SUBSCRIPTION_PATH = {
  S:  { plan: 'Claude Pro / Cursor Pro / ChatGPT Plus', usd: 20,  note: 'A focused weekend or two. Any $20 plan covers a small build.' },
  M:  { plan: 'Claude Pro / Cursor Pro',                usd: 20,  note: 'Fits a $20/mo plan if you are not reckless with rerolls.' },
  L:  { plan: 'Claude Max 5x / ChatGPT Pro',            usd: 100, note: 'One month of a $100 tier with iteration, debugging, refactors.' },
  XL: { plan: 'Claude Max 5–20x',                       usd: 150, note: 'Budget 2–3 months of a $100–200 tier — marketplaces fight back.' },
};

export const MODEL_PRICING_SOURCES = [
  { name: 'Anthropic', url: 'https://www.anthropic.com/pricing' },
  { name: 'OpenAI', url: 'https://openai.com/api/pricing/' },
  { name: 'Google', url: 'https://ai.google.dev/pricing' },
  { name: 'OpenRouter (open-weight)', url: 'https://openrouter.ai/models' },
];
