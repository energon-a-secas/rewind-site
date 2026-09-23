// ── Scorer: the anti-fake engine ─────────────────────────────
// Classifies each free-text answer into a reasoning rung (0-4), then
// applies consistency and calibration adjustments. Heuristic backend
// only — fully offline, deterministic. The signal is the rung, not the
// stated answer. See future/tools/maturity-mapper/SPEC.md §3.

import { RUBRIC, RANKS, VIRTUES } from './data.js';

const RUNG_MAX = 4;

/** Count marker hits for a rubric level in a normalized answer. */
function markerHits(text, markers) {
  let hits = 0;
  for (const m of markers) if (text.includes(m)) hits++;
  return hits;
}

/**
 * Classify one answer into a rung level 0-4.
 * Highest-level rubric with any marker wins; structural depth (length,
 * causal connectors, self-reference) nudges sparse answers up a little.
 */
export function classifyRung(answer) {
  const text = ` ${String(answer || '').toLowerCase()} `;
  const trimmed = text.trim();
  if (trimmed.length < 12) return 0; // a few words is not a reasoning trace

  let level = 0;
  for (const r of RUBRIC) {
    if (markerHits(text, r.markers) > 0) level = Math.max(level, r.level);
  }

  // Structural signals that lift a marker-light but genuinely reasoned answer.
  const words = trimmed.split(/\s+/).length;
  const causalConnectors = (text.match(/\b(because|so|therefore|which|if|when|unless|since)\b/g) || []).length;
  const selfReference = /\bi (believe|think|own|realized|assume|fear|chose|would)\b/.test(text);

  if (level < 2 && words > 40 && causalConnectors >= 2) level = 2;
  if (level < 3 && words > 70 && causalConnectors >= 3 && selfReference) level = 3;

  return Math.min(level, RUNG_MAX);
}

/**
 * Calibration multiplier from confidence vs rung.
 * Overconfidence (high confidence, low rung) penalizes; calibrated
 * humility (lower confidence with high-rung reasoning) earns a bonus.
 */
function calibrationMultiplier(level, confidence) {
  const conf = Math.max(0, Math.min(100, Number(confidence) || 0)) / 100;
  const rung = level / RUNG_MAX;
  const gap = conf - rung; // positive = more confident than reasoning supports
  if (gap > 0.35) return 0.85;   // overconfidence penalty
  if (gap < -0.2) return 1.08;   // calibrated humility bonus
  return 1.0;
}

/**
 * Consistency cross-check: a high-rung recovery (R1) backed by a
 * rung-0 root (R3) reads as performed, not owned. Flags + penalizes.
 */
function consistencyCheck(rungs) {
  const byKind = {};
  for (const r of rungs) byKind[r.kind] = r;
  const recovery = byKind.recovery;
  const root = byKind.root;
  if (recovery && root && recovery.level >= 3 && root.level <= 0) {
    return { ok: false, penalty: 0.85, note: 'recovery polished but root shallow: looks performed' };
  }
  return { ok: true, penalty: 1.0, note: 'coherent across rungs' };
}

/**
 * Score a completed theme. Returns per-rung levels, the consistency
 * flag, and a 0-100 theme score (mean rung × calibration × consistency).
 *
 * mode 'slow' (default) classifies free text and applies the full anti-fake
 * pass. mode 'fast' takes the rung level straight from the chosen option and
 * skips calibration — it is a casual estimate, not a rigorous measurement.
 */
export function scoreTheme(theme, answers, mode = 'slow') {
  const fast = mode === 'fast';
  const rungs = theme.rungs.map((rung) => {
    const a = answers[rung.id] || {};
    const level = fast ? (a.level ?? 0) : classifyRung(a.answer);
    const calib = fast ? 1 : calibrationMultiplier(level, a.confidence);
    return { id: rung.id, kind: rung.kind, level, confidence: a.confidence ?? null, calib };
  });

  const consistency = fast ? { ok: true, penalty: 1, note: 'fast estimate: not anti-fake checked' } : consistencyCheck(rungs);
  const meanLevel = rungs.reduce((s, r) => s + r.level * r.calib, 0) / rungs.length;
  const raw = (meanLevel / RUNG_MAX) * 100 * consistency.penalty;
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  return { rungs, consistency, score, mode };
}

/** Roll completed themes into per-virtue axis scores (0-100). */
export function scoreVirtues(themes, results) {
  const acc = {};
  for (const v of VIRTUES) acc[v.key] = { sum: 0, n: 0 };

  for (const theme of themes) {
    const res = results[theme.id];
    if (!res) continue;
    if (res.mode === 'fast') continue; // fast estimates never feed the real rank
    for (const vKey of theme.virtues) {
      if (!acc[vKey]) continue;
      acc[vKey].sum += res.score;
      acc[vKey].n += 1;
    }
  }

  const scores = {};
  for (const v of VIRTUES) {
    scores[v.key] = acc[v.key].n ? Math.round(acc[v.key].sum / acc[v.key].n) : 0;
  }
  return scores;
}

/** Overall score = mean of answered virtue axes (0 axes → 0). */
export function overallScore(virtueScores) {
  const vals = Object.values(virtueScores).filter((n) => n > 0);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
}

/** Map an overall score to a maturity rank. */
export function rankFor(score) {
  let rank = RANKS[0];
  for (const r of RANKS) if (score >= r.min) rank = r;
  return rank;
}

/** Dominant virtue (highest axis) → label for the archetype line. */
export function dominantVirtue(virtueScores) {
  let best = null;
  for (const v of VIRTUES) {
    if (!best || virtueScores[v.key] > virtueScores[best.key]) best = v;
  }
  return best;
}
