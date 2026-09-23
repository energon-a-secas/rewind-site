// ── AI build-cost model ──────────────────────────────────────
// Model prices verified 2026-08-29 on vendor pricing pages (agent
// research; Kimi and Qwen rows are OpenRouter rates, no vendor
// primary published). The one-time cost of generating the app:
//
//   buildCost = sizeTokens(recipe) × tokenFactor(frontend) × blendedRate(model)
//
// blendedRate assumes a 3:1 input:output ratio (typical agentic
// coding mix; heavy prompt-cache hits push real cost lower).
// Prices change monthly — the table is a snapshot, links included.
//
// Tokenizer caveat: Claude 4.7+ (Sonnet/Opus/Fable 5) tokenize ~30%
// more tokens for the same text than older Claudes and rival vendors,
// so per-Mtok sticker prices are not directly comparable across rows.

export const AI_MODELS = {
  'sonnet-5':     { name: 'Claude Sonnet 5',     provider: 'Anthropic', in: 2.00,  out: 10.00, note: 'Best value quality: the intro price was made permanent Aug 2026', bestValue: true },
  'opus-5':       { name: 'Claude Opus 5',       provider: 'Anthropic', in: 5.00,  out: 25.00, note: 'Top-tier coding model; fast mode bills 2×' },
  'fable-5':      { name: 'Claude Fable 5',      provider: 'Anthropic', in: 10.00, out: 50.00, note: 'The new top tier: frontier reasoning at frontier prices' },
  'haiku-45':     { name: 'Claude Haiku 4.5',    provider: 'Anthropic', in: 1.00,  out: 5.00,  note: 'Fast/cheap: edits and boilerplate (old tokenizer)' },
  'gpt56-terra':  { name: 'GPT-5.6 Terra',       provider: 'OpenAI',    in: 2.00,  out: 12.00, note: 'Mid flagship split' },
  'gpt53-codex':  { name: 'GPT-5.3 Codex',       provider: 'OpenAI',    in: 1.75,  out: 14.00, note: 'Coding-tuned' },
  'gpt5-mini':    { name: 'GPT-5 mini',          provider: 'OpenAI',    in: 0.25,  out: 2.00,  note: 'Budget tier' },
  'gemini31-pro': { name: 'Gemini 3.1 Pro',      provider: 'Google',    in: 2.00,  out: 12.00, note: '≤200K ctx; $4/$18 above' },
  'gemini37-flash': { name: 'Gemini 3.7 Flash',  provider: 'Google',    in: 0.75,  out: 3.75,  note: 'Promo price through Dec 2026, then 2×' },
  'kimi-k3':      { name: 'Kimi K3',             provider: 'Moonshot',  in: 2.55,  out: 12.75, note: '1M ctx, open weights; OpenRouter rate' },
  'qwen3-flash':  { name: 'Qwen3 Coder Flash',   provider: 'Alibaba',   in: 0.20,  out: 0.98,  note: '1M ctx; OpenRouter rate, regional prices vary', cheapest: true },
  'deepseek-v4':  { name: 'DeepSeek V4 Flash',   provider: 'DeepSeek',  in: 0.44,  out: 1.32,  note: 'Peak rate; off-peak halves it, cache hits are pennies' },
};

/**
 * Total tokens (input + output) to build a recipe of each size with an
 * agentic coding tool — mid-points of observed ranges (landing page
 * 0.5–2M, CRUD 2–10M, full-stack 10–50M), extended for L/XL.
 * Frontend tokenFactor (0.25 no-code / 0.7 / 1.0 / 1.5) multiplies this.
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
  XL: { plan: 'Claude Max 5–20x',                       usd: 150, note: 'Budget 2–3 months of a $100–200 tier: marketplaces fight back.' },
};

/**
 * Agent coding tools — how the build actually gets run. Editorial,
 * same snapshot rules as AI_MODELS: verify on the linked pages.
 */
export const AGENT_TOOLS = [
  { name: 'Claude Code', pay: 'Included in Claude Pro ($20) / Max ($100–200), or API credits', url: 'https://claude.com/pricing',
    note: 'Terminal + IDE agent. Usage shares one pool with the Claude chat app: a heavy chat day eats the coding budget.' },
  { name: 'OpenAI Codex CLI', pay: 'Included in every ChatGPT tier ($8–200), or API key', url: 'https://learn.chatgpt.com/docs/pricing',
    note: 'Included usage is a rolling 5-hour window, not monthly; past it you buy credits on a separate rate card.' },
  { name: 'Gemini CLI', pay: 'Free with a Google login; paid plans or API key for more', url: 'https://google-gemini.github.io/gemini-cli/docs/quota-and-pricing.html',
    note: 'Logged-in free tier is 1,000 requests/day; a raw API key gets 250/day, Flash only. The auth mode picks your quota.' },
  { name: 'Cursor', pay: '$20 Pro / $60 Pro+ / $200 Ultra', url: 'https://cursor.com/pricing',
    note: 'IDE-first. Overage bills in arrears at API rates, and model choice silently changes the burn rate.' },
  { name: 'aider', pay: 'Free, open source + your API key', url: 'https://aider.chat/',
    note: 'Zero tool cost, 100% provider cost: the bill is exactly the model table above, with no subscription to cap it.' },
];

export const MODEL_PRICING_SOURCES = [
  { name: 'Anthropic', url: 'https://www.anthropic.com/pricing' },
  { name: 'OpenAI', url: 'https://openai.com/api/pricing/' },
  { name: 'Google', url: 'https://ai.google.dev/pricing' },
  { name: 'OpenRouter (open-weight)', url: 'https://openrouter.ai/models' },
];
