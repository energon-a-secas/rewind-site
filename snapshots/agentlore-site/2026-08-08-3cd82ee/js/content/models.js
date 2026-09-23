/**
 * The Codex — model reference.
 *
 * Every price is USD per million tokens, taken from the provider's own pricing
 * page on the `verified` date. Providers change pricing without notice: the UI
 * stamps each row with that date and flags anything older than STALE_AFTER_DAYS.
 *
 * `cacheRead` is what a cache hit costs. It is the single biggest lever on an
 * agentic workload's bill, which is why it is a first-class column.
 */

export const STALE_AFTER_DAYS = 90;

export const PROVIDERS = {
  anthropic: { label: 'Anthropic', accent: '#d97757', source: 'https://platform.claude.com/docs/en/about-claude/pricing' },
  openai:    { label: 'OpenAI',    accent: '#10a37f', source: 'https://developers.openai.com/api/docs/pricing' },
  google:    { label: 'Google',    accent: '#4285f4', source: 'https://ai.google.dev/gemini-api/docs/pricing' },
  local:     { label: 'Local',     accent: '#f472b6', source: 'https://ollama.com/library' },
};

export const TIERS = {
  frontier: { label: 'Frontier', blurb: 'Hardest reasoning. Reach for these when being wrong is expensive.' },
  balanced: { label: 'Balanced', blurb: 'The daily driver. Most agentic coding belongs here.' },
  fast:     { label: 'Fast',     blurb: 'High volume, low latency, mechanical work.' },
  local:    { label: 'Local',    blurb: 'Your hardware. No per-token cost, no data leaving the machine.' },
};

const VERIFIED = '2026-08-03';

export const MODELS = [
  /* ── Anthropic ─────────────────────────────────────────── */
  {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    apiId: 'claude-opus-5',
    provider: 'anthropic',
    tier: 'frontier',
    context: 1_000_000,
    maxOutput: 64_000,
    price: { in: 5, out: 25, cacheRead: 0.5, cacheWrite: 6.25, batchIn: 2.5, batchOut: 12.5 },
    bestAt: ['Long-horizon agentic coding', 'Ambiguous multi-file refactors', 'Planning before execution'],
    avoidFor: ['Bulk classification', 'Single-line edits', 'Anything you can specify exactly'],
    note: 'Fast mode is available at a premium ($10 in / $50 out) when latency matters more than cost.',
    verified: VERIFIED,
  },
  {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    apiId: 'claude-sonnet-5',
    provider: 'anthropic',
    tier: 'balanced',
    context: 1_000_000,
    maxOutput: 64_000,
    price: { in: 2, out: 10, cacheRead: 0.2, cacheWrite: 2.5, batchIn: 1, batchOut: 5 },
    priceChange: {
      on: '2026-09-01',
      price: { in: 3, out: 15, cacheRead: 0.3, cacheWrite: 3.75, batchIn: 1.5, batchOut: 7.5 },
      note: 'Introductory pricing ends — input rises 50%.',
    },
    bestAt: ['Everyday agentic coding', 'Tool-calling loops', 'The default choice for most work'],
    avoidFor: ['Research-grade reasoning where a wrong answer is costly'],
    note: 'Anthropic\'s default model. Currently the best price-to-capability ratio on this table.',
    verified: VERIFIED,
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    apiId: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    tier: 'fast',
    context: 200_000,
    maxOutput: 64_000,
    price: { in: 1, out: 5, cacheRead: 0.1, cacheWrite: 1.25, batchIn: 0.5, batchOut: 2.5 },
    bestAt: ['Subagent fan-out', 'Classification and extraction', 'Cheap first-pass filtering'],
    avoidFor: ['Multi-step planning', 'Work spanning many unfamiliar files'],
    verified: VERIFIED,
  },
  {
    id: 'claude-fable-5',
    name: 'Claude Fable 5',
    apiId: 'claude-fable-5',
    provider: 'anthropic',
    tier: 'frontier',
    context: 1_000_000,
    maxOutput: 64_000,
    price: { in: 10, out: 50, cacheRead: 1, cacheWrite: 12.5, batchIn: 5, batchOut: 25 },
    bestAt: ['The hardest reasoning available', 'Novel problems with no established pattern'],
    avoidFor: ['Anything a cheaper tier already passes your evals on'],
    note: 'Ten times Sonnet 5\'s input price. Justify it with an eval, not a hunch.',
    verified: VERIFIED,
  },

  /* ── OpenAI ────────────────────────────────────────────── */
  {
    id: 'gpt-5-6-sol',
    name: 'GPT-5.6 Sol',
    apiId: 'gpt-5.6-sol',
    provider: 'openai',
    tier: 'frontier',
    context: 1_000_000,
    maxOutput: 128_000,
    price: { in: 5, out: 30, cacheRead: 0.5, batchIn: 2.5, batchOut: 15 },
    bestAt: ['Complex reasoning', 'Long-horizon agentic work', 'Coding benchmarks'],
    avoidFor: ['High-volume routine calls'],
    verified: VERIFIED,
  },
  {
    id: 'gpt-5-6-terra',
    name: 'GPT-5.6 Terra',
    apiId: 'gpt-5.6-terra',
    provider: 'openai',
    tier: 'balanced',
    context: 1_000_000,
    maxOutput: 128_000,
    price: { in: 2, out: 12, cacheRead: 0.2, batchIn: 1, batchOut: 6 },
    bestAt: ['Everyday development work', 'Balanced cost and capability'],
    avoidFor: ['Frontier-difficulty reasoning'],
    verified: VERIFIED,
  },
  {
    id: 'gpt-5-6-luna',
    name: 'GPT-5.6 Luna',
    apiId: 'gpt-5.6-luna',
    provider: 'openai',
    tier: 'fast',
    context: 1_000_000,
    maxOutput: 128_000,
    price: { in: 0.2, out: 1.2, cacheRead: 0.02, batchIn: 0.1, batchOut: 0.6 },
    bestAt: ['Very high volume', 'Cheapest frontier-family option', 'Routing and triage'],
    avoidFor: ['Work needing deep multi-step reasoning'],
    note: 'The cheapest hosted model here by a wide margin — a tenth of Terra\'s input price.',
    verified: VERIFIED,
  },

  /* ── Google ────────────────────────────────────────────── */
  {
    id: 'gemini-3-6-flash',
    name: 'Gemini 3.6 Flash',
    apiId: 'gemini-3.6-flash',
    provider: 'google',
    tier: 'balanced',
    context: 1_000_000,
    price: { in: 1.5, out: 7.5, cacheRead: 0.15, batchIn: 0.75, batchOut: 3.75 },
    bestAt: ['Large-context document work', 'Multimodal input', 'Cost-sensitive throughput'],
    avoidFor: ['Deep agentic tool loops'],
    verified: VERIFIED,
  },
  {
    id: 'gemini-3-5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    apiId: 'gemini-3.5-flash-lite',
    provider: 'google',
    tier: 'fast',
    context: 1_000_000,
    price: { in: 0.3, out: 2.5, cacheRead: 0.03, batchIn: 0.15, batchOut: 1.25 },
    bestAt: ['Bulk summarisation', 'Cheap long-context reads'],
    avoidFor: ['Reasoning-heavy tasks'],
    verified: VERIFIED,
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    apiId: 'gemini-2.5-pro',
    provider: 'google',
    tier: 'frontier',
    context: 1_000_000,
    price: { in: 1.25, out: 10, cacheRead: 0.125, batchIn: 0.625, batchOut: 5 },
    bestAt: ['Long-context analysis', 'Cheapest frontier-tier input price here'],
    avoidFor: ['Latency-critical interactive loops'],
    verified: VERIFIED,
  },

  /* ── Local ─────────────────────────────────────────────── *
   * Described by hardware class rather than a specific release: the VRAM
   * arithmetic (params x bits / 8, plus KV-cache headroom) stays true as
   * individual model names come and go.
   */
  {
    id: 'local-8b',
    name: '8B class · Q4',
    provider: 'local',
    tier: 'local',
    context: 128_000,
    price: { in: 0, out: 0, cacheRead: 0 },
    vramGb: 6,
    hardware: 'Any 8 GB GPU · Apple Silicon 16 GB',
    throughput: '40–80 tok/s',
    examples: 'Llama 3.x 8B, Qwen 8B, Ministral',
    bestAt: ['Offline drafting', 'Autocomplete', 'Private note processing'],
    avoidFor: ['Multi-file code changes', 'Anything needing reliable tool calls'],
    verified: VERIFIED,
  },
  {
    id: 'local-30b',
    name: '30B class · Q4',
    provider: 'local',
    tier: 'local',
    context: 128_000,
    price: { in: 0, out: 0, cacheRead: 0 },
    vramGb: 20,
    hardware: 'RTX 4090/5090 · Apple Silicon 36 GB',
    throughput: '25–50 tok/s',
    examples: 'Qwen Coder 30B, Gemma 27B, DeepSeek distills',
    bestAt: ['Private codebases', 'Steady offline throughput', 'Bounded, well-specified edits'],
    avoidFor: ['Long-horizon autonomy', 'Ambiguous refactors'],
    note: 'The sweet spot for local coding work on a single consumer GPU.',
    verified: VERIFIED,
  },
  {
    id: 'local-70b',
    name: '70B class · Q4',
    provider: 'local',
    tier: 'local',
    context: 128_000,
    price: { in: 0, out: 0, cacheRead: 0 },
    vramGb: 42,
    hardware: '2× 24 GB GPUs · Apple Silicon 64 GB+',
    throughput: '8–20 tok/s',
    examples: 'Llama 3.x 70B, Qwen 72B',
    bestAt: ['The strongest fully-offline option', 'Regulated or air-gapped environments'],
    avoidFor: ['Interactive work where latency matters'],
    note: 'Still meaningfully behind hosted frontier models on agentic tasks.',
    verified: VERIFIED,
  },
];

export const MODEL_BY_ID = Object.fromEntries(MODELS.map(m => [m.id, m]));

/**
 * Effective price on a date — resolves scheduled changes such as the end of
 * an introductory rate, so the table never quotes a price that has lapsed.
 */
export function priceOn(model, when = new Date()) {
  const change = model.priceChange;
  if (change && Date.parse(change.on + 'T00:00:00Z') <= when.getTime()) return change.price;
  return model.price;
}

export function pendingChange(model, when = new Date()) {
  const change = model.priceChange;
  if (!change) return null;
  const at = Date.parse(change.on + 'T00:00:00Z');
  if (at <= when.getTime()) return null;
  return { ...change, daysAway: Math.ceil((at - when.getTime()) / 86_400_000) };
}

/** One comparable number, weighted 3:1 input:output — the shape of agentic coding. */
export function blendedPrice(model, when) {
  const p = priceOn(model, when);
  return (p.in * 3 + p.out) / 4;
}

/**
 * Levers that apply across providers. Multipliers, not prices, so these stay
 * true longer than any individual number in the table above.
 */
export const PRICING_LEVERS = [
  {
    id: 'cache',
    name: 'Prompt caching',
    effect: 'Cache hits cost ~10% of the input price',
    detail: 'The largest single lever on an agentic workload. A coding session re-sends the same system prompt, file tree, and history on every turn — cache it and that input bill drops by ~90%. Anthropic charges 1.25× to write a 5-minute cache and 2× for an hour, so a 5-minute cache pays for itself after one hit.',
  },
  {
    id: 'batch',
    name: 'Batch API',
    effect: '50% off input and output',
    detail: 'Available from all three hosted providers. If the work is not interactive — backfills, migrations, bulk classification, evals — this is a free halving. It stacks with caching.',
  },
  {
    id: 'tokenizer',
    name: 'Tokenizer changes',
    effect: 'Newer Claude models emit ~30% more tokens for the same text',
    detail: 'Claude 4.7 and later use a newer tokenizer that produces roughly 30% more tokens for identical input. A model that looks 20% cheaper per token can cost more per task. Compare cost per finished task, never cost per token alone.',
  },
  {
    id: 'routing',
    name: 'Model routing',
    effect: 'Often 5–20× on the same task mix',
    detail: 'The spread between the fast and frontier tiers is far larger than the spread between providers. Sending mechanical work to the fast tier and escalating only on failure beats any amount of provider shopping.',
  },
  {
    id: 'output',
    name: 'Output discipline',
    effect: 'Output costs 5–6× input',
    detail: 'Across every row in this table, output tokens cost several times what input tokens cost. "Show me the whole file" is expensive; "show me the diff" is cheap. Constrain response length in the prompt.',
  },
];
