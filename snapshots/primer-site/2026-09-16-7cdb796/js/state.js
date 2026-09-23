// ── State ────────────────────────────────────────────────────
// Tracks the current route and which pet-project steps the user
// has marked done (persisted, so progress survives a refresh).

const STORAGE_KEY = 'primer-progress-v1';

export const state = {
  route: { name: 'hub', trackId: null },
  done: {}, // { "trackId:stepIndex": true }
};

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) s.done = JSON.parse(raw) || {};
  } catch { /* ignore corrupted data */ }
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s.done));
  } catch { /* quota exceeded or private browsing */ }
}

export function stepKey(trackId, i) {
  return `${trackId}:${i}`;
}

export function isDone(s, trackId, i) {
  return !!s.done[stepKey(trackId, i)];
}

export function toggleDone(s, trackId, i) {
  const k = stepKey(trackId, i);
  if (s.done[k]) delete s.done[k];
  else s.done[k] = true;
  save(s);
}

export function trackProgress(s, track) {
  const total = track.steps.length;
  let done = 0;
  for (let i = 0; i < total; i++) if (isDone(s, track.id, i)) done++;
  return { done, total };
}

/** Parse the hash into a route object. */
export function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts[0] === 'track' && parts[1]) {
    return { name: 'track', trackId: decodeURIComponent(parts[1]) };
  }
  return { name: 'hub', trackId: null };
}
