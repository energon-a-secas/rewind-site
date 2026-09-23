// ── State management ─────────────────────────────────────────
// Shared mutable state. The manifest is the committed archive
// (data/manifest.json); `local` holds browser captures from
// IndexedDB. Only lightweight prefs go to localStorage.

const PREFS_KEY = 'rewind-prefs';

export const state = {
  manifest: { generated: null, sites: {}, snapshots: [] },
  local: [],                 // browser captures: {id, site, date, source:'browser', kind, subject, html}
  site: null,                // selected site id
  snapId: null,              // selected snapshot id
  width: 'desktop',          // stage width preset: desktop | tablet | mobile
  compare: { on: false, aId: null, bId: null },
};

export const WIDTHS = { desktop: 1440, tablet: 768, mobile: 390 };

/** Restore the last-viewed site + width preset. */
export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.site) s.site = p.site;
      if (p.width in WIDTHS) s.width = p.width;
    }
  } catch { /* ignore corrupted data */ }
}

export function save(s) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ site: s.site, width: s.width }));
  } catch { /* quota exceeded or private browsing */ }
}

/** All sites that have at least one snapshot (archive or local), with counts. */
export function sitesList(s) {
  const map = new Map();
  const bump = (id, meta) => {
    const cur = map.get(id) || { id, title: id, domain: '', count: 0 };
    Object.assign(cur, meta, { count: cur.count + 1 });
    map.set(id, cur);
  };
  for (const snap of s.manifest.snapshots) {
    const info = s.manifest.sites[snap.site] || {};
    bump(snap.site, { title: info.title || snap.site, domain: info.domain || '' });
  }
  for (const snap of s.local) bump(snap.site, {});
  return [...map.values()].sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

/** Archive + local snapshots for one site, oldest first. */
export function timelineFor(s, siteId) {
  return s.manifest.snapshots
    .filter((x) => x.site === siteId)
    .concat(s.local.filter((x) => x.site === siteId))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function snapById(s, id) {
  return s.manifest.snapshots.find((x) => x.id === id) || s.local.find((x) => x.id === id) || null;
}
