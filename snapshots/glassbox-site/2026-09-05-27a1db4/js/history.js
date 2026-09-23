// ── Drill history ────────────────────────────────────────────
// A rolling log of finished drill runs. Without it every session starts
// cold: the drill can already tell you which domains you are weak in, and
// then throws that away the moment you leave the lab.
//
// Aggregates are stored, not answers. A run keeps [right, total] per domain
// id and the ids you missed: enough to rebuild rolling accuracy and a
// retry pool, small enough that twenty runs stay a few kilobytes, and
// stable if a question is later reworded.
//
// Storage is best-effort throughout: private mode throws on write, and a
// hand-edited or half-written value is discarded rather than trusted.

const KEY = 'glassbox-drill-history';
const MAX_RUNS = 20;   // enough to see a trend; old runs are not interesting

function isRun(r) {
  return !!r && typeof r === 'object'
    && Number.isFinite(r.ts) && Number.isFinite(r.n) && Number.isFinite(r.right)
    && Number.isFinite(r.score)
    && !!r.perDomain && typeof r.perDomain === 'object'
    && Array.isArray(r.missed);
}

export function readRuns() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(isRun) : [];
  } catch { return []; }   // private mode, or someone edited the value by hand
}

/**
 * Append a finished run, oldest runs falling off the end. `solved` is the
 * ids answered correctly this time: they are cleared from earlier runs'
 * miss lists, so the retry pool holds what is still unlearned rather than
 * everything you ever got wrong.
 */
export function recordRun(run, solved = []) {
  const done = new Set(solved);
  const runs = readRuns()
    .map((r) => ({ ...r, missed: r.missed.filter((id) => !done.has(id)) }))
    .concat(run)
    .slice(-MAX_RUNS);
  try { localStorage.setItem(KEY, JSON.stringify(runs)); } catch { /* private mode */ }
  return runs;
}

export function clearRuns() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
  return [];
}

/** Rolling [right, total] per domain id across every logged run. */
export function domainTally(runs) {
  const tally = {};
  runs.forEach((r) => {
    Object.entries(r.perDomain).forEach(([id, pair]) => {
      const total = Array.isArray(pair) ? Number(pair[1]) : 0;
      if (!Number.isFinite(total) || total <= 0) return;
      const t = tally[id] || (tally[id] = [0, 0]);
      t[0] += Number(pair[0]) || 0;
      t[1] += total;
    });
  });
  return tally;
}

/**
 * The k weakest domain ids, worst accuracy first, ties going to the domain
 * with more evidence behind it. A domain you have never missed is left out:
 * there is nothing to drill there.
 *
 * Thin evidence is deliberately not filtered out. One question answered
 * wrong is a weak record on 0%, and the setup view shows that bar right
 * above this button, and ranking on a sample-size floor would have the button
 * name a domain visibly stronger than the ones on screen.
 */
export function weakest(runs, k = 2) {
  return Object.entries(domainTally(runs))
    .map(([id, [right, total]]) => ({ id, acc: right / total, total }))
    .filter((d) => d.acc < 1)
    .sort((a, b) => a.acc - b.acc || b.total - a.total)
    .slice(0, k)
    .map((d) => d.id);
}

/** Every question id still on the miss list, most recently missed first. */
export function pending(runs) {
  const ids = [];
  runs.slice().reverse().forEach((r) => r.missed.forEach((id) => {
    if (!ids.includes(id)) ids.push(id);
  }));
  return ids;
}
