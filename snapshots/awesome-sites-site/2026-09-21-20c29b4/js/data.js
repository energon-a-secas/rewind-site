import { state } from './state.js';

const CATALOG_URL = new URL('../api/v1/catalog.json', import.meta.url).href;

export async function loadCatalog() {
  state.loading = true;
  state.error = '';
  try {
    const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.sites = Array.isArray(data.sites) ? data.sites : [];
    state.lists = Array.isArray(data.lists) ? data.lists : [];
  } catch (err) {
    state.error = 'Could not load the catalog. Try refreshing.';
    state.sites = [];
    state.lists = [];
    console.error(err);
  } finally {
    state.loading = false;
  }
}

export function siteById(id) {
  return state.sites.find((s) => s.id === id);
}

export function sitesForList(listId) {
  const list = state.lists.find((l) => l.id === listId);
  if (!list) return state.sites;
  const ids = new Set(list.siteIds || []);
  return state.sites.filter((s) => ids.has(s.id));
}

export function filteredSites() {
  const pool = state.activeListId ? sitesForList(state.activeListId) : state.sites;
  const q = state.query.trim().toLowerCase();
  if (!q) return pool;
  return pool.filter((s) => {
    const labels = (s.labels || []).join(' ');
    const blob = [s.name, s.description, s.url, labels].join(' ').toLowerCase();
    return blob.includes(q);
  });
}
