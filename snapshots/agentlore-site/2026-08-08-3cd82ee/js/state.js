import { tutorials } from './content/index.js';

const PROGRESS_KEY = 'agentlore-completed';
const PATH_KEY = 'agentlore-path';
const FILTER_KEY = 'agentlore-filters';
const CODEX_KEY = 'agentlore-codex';

export const state = {
  route: { name: 'home', param: null, query: new URLSearchParams() },

  searchQuery: '',
  activeCategory: '',
  activeTool: '',
  activeLevel: '',

  completed: new Set(),
  activePath: 'core',

  codex: {
    sort: 'blended',
    dir: 'asc',
    providers: new Set(),
    tiers: new Set(),
    selected: new Set(),
    workload: 'solo-dev',
    inputs: null,
  },
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing or quota — progress is a nicety, never a blocker */
  }
}

/* ── Progress ─────────────────────────────────────────────── */

export function loadProgress(s) {
  const known = new Set(tutorials.map(t => t.id));
  s.completed = new Set(read(PROGRESS_KEY, []).filter(id => known.has(id)));
}

export function saveProgress(s) {
  write(PROGRESS_KEY, [...s.completed]);
}

export function toggleCompleted(s, id) {
  if (s.completed.has(id)) s.completed.delete(id);
  else s.completed.add(id);
  saveProgress(s);
}

export function markCompleted(s, id) {
  if (s.completed.has(id)) return false;
  s.completed.add(id);
  saveProgress(s);
  return true;
}

export function setActivePath(s, id) {
  s.activePath = id;
  write(PATH_KEY, id);
}

/* ── Filters ──────────────────────────────────────────────── */

export function hasActiveFilters(s) {
  return Boolean(s.searchQuery || s.activeCategory || s.activeTool || s.activeLevel);
}

export function resetFilters(s) {
  s.searchQuery = '';
  s.activeCategory = '';
  s.activeTool = '';
  s.activeLevel = '';
  saveFilters(s);
}

export function saveFilters(s) {
  write(FILTER_KEY, {
    activeCategory: s.activeCategory,
    activeTool: s.activeTool,
    activeLevel: s.activeLevel,
  });
}

/**
 * Mirror browse filters into the hash so a filtered view is shareable.
 * replaceState keeps the back button free of filter noise.
 */
export function syncFilterHash(s) {
  if (s.route.name !== 'browse') return;
  const p = new URLSearchParams();
  if (s.searchQuery) p.set('q', s.searchQuery);
  if (s.activeCategory) p.set('cat', s.activeCategory);
  if (s.activeTool) p.set('tool', s.activeTool);
  if (s.activeLevel) p.set('level', s.activeLevel);
  const query = p.toString();
  history.replaceState(null, '', `#/browse${query ? '?' + query : ''}`);
}

/* ── Codex preferences ────────────────────────────────────── */

export function saveCodex(s) {
  write(CODEX_KEY, {
    workload: s.codex.workload,
    inputs: s.codex.inputs,
    selected: [...s.codex.selected],
  });
}

/* ── Routing ──────────────────────────────────────────────── */

const ROUTES = ['home', 'browse', 'learn', 'codex', 'armory'];

/**
 * `#/` · `#/browse?q=…` · `#/learn/<trackId>` · `#/codex` · `#/armory`
 * Unknown routes fall back to home rather than rendering nothing.
 */
export function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const name = parts[0] || 'home';
  return {
    name: ROUTES.includes(name) ? name : 'home',
    param: parts[1] ? decodeURIComponent(parts[1]) : null,
    query: new URLSearchParams(queryPart || ''),
  };
}

/**
 * A shared URL always wins over stored state. Free-text search is read from
 * the hash only — a stale search restored on load is disorienting.
 */
export function applyRoute(s) {
  s.route = parseRoute();

  if (s.route.name === 'browse') {
    const q = s.route.query;
    if ([...q.keys()].length) {
      s.searchQuery = q.get('q') || '';
      s.activeCategory = q.get('cat') || '';
      s.activeTool = q.get('tool') || '';
      s.activeLevel = q.get('level') || '';
    } else {
      const stored = read(FILTER_KEY, null);
      if (stored) {
        s.activeCategory = stored.activeCategory || '';
        s.activeTool = stored.activeTool || '';
        s.activeLevel = stored.activeLevel || '';
      }
      s.searchQuery = '';
    }
  }

  if (s.route.name === 'learn' && s.route.param) s.activePath = s.route.param;
}

export function loadSaved(s) {
  loadProgress(s);
  s.activePath = read(PATH_KEY, 'core');
  const codex = read(CODEX_KEY, null);
  if (codex) {
    if (codex.workload) s.codex.workload = codex.workload;
    if (codex.inputs) s.codex.inputs = codex.inputs;
    if (Array.isArray(codex.selected)) s.codex.selected = new Set(codex.selected);
  }
}
