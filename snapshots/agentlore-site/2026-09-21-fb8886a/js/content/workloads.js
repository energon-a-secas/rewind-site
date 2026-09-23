/**
 * Calculator presets. Every preset is a guess about *your* usage — the numbers
 * are starting points shaped like real workloads, not measurements. The point
 * is the relative spread between models, which holds even when the absolute
 * volume is wrong.
 */

export const WORKLOADS = [
  {
    id: 'solo-dev',
    label: 'Solo dev, daily driver',
    blurb: 'One engineer running a coding agent through the working day.',
    derivation: '≈22 working days × 3 sessions × 25 turns',
    calls: 1_500,
    inputTokens: 45_000,
    outputTokens: 1_200,
    cacheHitRate: 0.8,
  },
  {
    id: 'team-5',
    label: 'Team of five',
    blurb: 'Five engineers on the same footing as the solo profile.',
    derivation: '5 × the solo-dev profile',
    calls: 7_500,
    inputTokens: 45_000,
    outputTokens: 1_200,
    cacheHitRate: 0.8,
  },
  {
    id: 'light',
    label: 'Occasional use',
    blurb: 'A few focused sessions a week rather than all-day driving.',
    derivation: '≈3 sessions a week × 25 turns',
    calls: 300,
    inputTokens: 35_000,
    outputTokens: 1_000,
    cacheHitRate: 0.7,
  },
  {
    id: 'bulk',
    label: 'Bulk classification',
    blurb: 'A non-interactive pipeline over a large corpus. Batch-eligible.',
    derivation: '200k records, one call each',
    calls: 200_000,
    inputTokens: 2_500,
    outputTokens: 400,
    cacheHitRate: 0.5,
  },
  {
    id: 'longdoc',
    label: 'Long-document analysis',
    blurb: 'Big inputs, small outputs, little repetition between calls.',
    derivation: '20k documents at ~30k tokens each',
    calls: 20_000,
    inputTokens: 30_000,
    outputTokens: 900,
    cacheHitRate: 0.2,
  },
];

export const WORKLOAD_BY_ID = Object.fromEntries(WORKLOADS.map(w => [w.id, w]));

export const DEFAULT_HARDWARE_COST = 2_400;

/**
 * Monthly cost for one model under one workload.
 *
 * Mirrors the worked example in Anthropic's pricing docs: cached input is
 * billed at the cache-read rate, the remainder at the base input rate.
 * Cache *write* cost is excluded — writes are amortised across many hits in
 * any workload where caching is worth switching on.
 */
export function monthlyCost(model, workload, price) {
  const { calls, inputTokens, outputTokens, cacheHitRate } = workload;
  const hit = Math.min(Math.max(cacheHitRate, 0), 1);

  const cachedIn = inputTokens * hit;
  const freshIn = inputTokens - cachedIn;

  const perCall =
    (freshIn * price.in + cachedIn * (price.cacheRead ?? price.in) + outputTokens * price.out) / 1_000_000;

  return { perCall, monthly: perCall * calls };
}

/** Months of hosted spend before local hardware pays for itself. */
export function breakEvenMonths(hostedMonthly, hardwareCost = DEFAULT_HARDWARE_COST) {
  if (hostedMonthly <= 0) return Infinity;
  return hardwareCost / hostedMonthly;
}
