// ── DOM rendering ────────────────────────────────────────────

import { state, isPinned } from './state.js';
import { snippets, CATEGORIES, CATEGORY_LABELS } from './data.js';
import { $, escHtml, highlight, searchTerms, prefersReducedMotion } from './utils.js';

const PLATFORM_LABELS = { any: 'any platform' };

let visible = [];

/** The snippets currently on screen, in display order. Drives keyboard focus. */
export function getVisible() {
  return visible;
}

function getAllTags() {
  const tagSet = new Set();
  snippets.forEach(s => s.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}

function getAllPlatforms() {
  return [...new Set(snippets.map(s => s.platform))].sort();
}

function platformLabel(p) {
  return PLATFORM_LABELS[p] || p;
}

// ── Filtering ────────────────────────────────────────────────

function matchesSearch(snippet, terms) {
  if (!terms.length) return true;
  const haystack =
    `${snippet.title} ${snippet.description} ${snippet.command} ${snippet.tags.join(' ')} ${snippet.platform}`
      .toLowerCase();
  return terms.every(t => haystack.includes(t));
}

/** All filters except category — the basis for the rail's per-category counts. */
function matchesExceptCategory(snippet, terms) {
  if (!matchesSearch(snippet, terms)) return false;
  if (state.activePlatform && snippet.platform !== state.activePlatform) return false;
  if (state.activeTags.length && !state.activeTags.some(t => snippet.tags.includes(t))) return false;
  if (state.pinnedOnly && !isPinned(snippet.id)) return false;
  return true;
}

function matchesFilters(snippet, terms) {
  if (state.activeCategory && snippet.category !== state.activeCategory) return false;
  return matchesExceptCategory(snippet, terms);
}

// ── Category rail ────────────────────────────────────────────

export function renderRail() {
  const terms = searchTerms(state.searchQuery);
  const pool = snippets.filter(s => matchesExceptCategory(s, terms));
  const counts = {};
  pool.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });

  const chip = ({ cat = '', pinned = false, label, count, active, dot }) => {
    const cls = ['rail-chip'];
    if (active) cls.push('active');
    if (!count) cls.push('empty');
    if (pinned) cls.push('pin-chip');
    return `<button class="${cls.join(' ')}" aria-pressed="${active}"
      data-cat="${escHtml(cat)}"${pinned ? ' data-pinned="1"' : ''}
      ${dot ? `style="--chip-cat: var(--cat-${escHtml(cat)})"` : ''}>
      ${dot ? '<span class="rail-dot" aria-hidden="true"></span>' : ''}
      ${escHtml(label)}<span class="rail-count">${count}</span>
    </button>`;
  };

  const parts = [
    chip({
      label: 'All',
      count: pool.length,
      active: !state.activeCategory && !state.pinnedOnly,
    }),
  ];

  if (state.pins.length) {
    parts.push(chip({
      pinned: true,
      label: '★ Pinned',
      count: state.pins.length,
      active: state.pinnedOnly,
    }));
  }

  CATEGORIES.forEach(c => parts.push(chip({
    cat: c,
    dot: true,
    label: CATEGORY_LABELS[c],
    count: counts[c] || 0,
    active: state.activeCategory === c,
  })));

  $('cat-rail').innerHTML = parts.join('');
}

// ── Active filter chips ──────────────────────────────────────

export function renderActiveFilters() {
  const chips = [];
  const chip = (kind, value, label) =>
    `<button class="filter-chip" data-kind="${kind}" data-value="${escHtml(value)}"
      aria-label="Remove filter ${escHtml(label)}">${escHtml(label)}<span aria-hidden="true">×</span></button>`;

  if (state.searchQuery) chips.push(chip('search', '', `"${state.searchQuery}"`));
  if (state.activeCategory) chips.push(chip('category', '', CATEGORY_LABELS[state.activeCategory]));
  if (state.activePlatform) chips.push(chip('platform', '', platformLabel(state.activePlatform)));
  if (state.pinnedOnly) chips.push(chip('pinned', '', '★ Pinned only'));
  state.activeTags.forEach(t => chips.push(chip('tag', t, `#${t}`)));

  const host = $('active-filters');
  host.innerHTML = chips.length
    ? `<span class="filter-chip-label">Filtering by</span>${chips.join('')}` +
      `<button class="filter-chip clear-all" data-kind="all">Clear all</button>`
    : '';
  host.classList.toggle('visible', chips.length > 0);
}

// ── Dropdowns ────────────────────────────────────────────────

function searchBox(id, placeholder) {
  return `<li class="dd-search-wrap"><input class="dd-search" id="${id}" type="text" placeholder="${placeholder}" autocomplete="off"></li>`;
}

export function renderDropdowns() {
  const platMenu = $('dd-platform-menu');
  const platQ = document.getElementById('dd-plat-q')?.value || '';
  platMenu.innerHTML = searchBox('dd-plat-q', 'Filter platforms...') +
    `<li class="dropdown-item${!state.activePlatform ? ' selected' : ''}" data-value="" data-label="all">All</li>` +
    getAllPlatforms().map(p => {
      const sel = state.activePlatform === p ? ' selected' : '';
      return `<li class="dropdown-item${sel}" data-value="${escHtml(p)}" data-label="${escHtml(p.toLowerCase())}">${escHtml(platformLabel(p))}</li>`;
    }).join('');
  if (platQ) { document.getElementById('dd-plat-q').value = platQ; filterDropdownItems('dd-plat-q'); }

  const tagMenu = $('dd-tags-menu');
  const tagQ = document.getElementById('dd-tag-q')?.value || '';
  tagMenu.innerHTML = searchBox('dd-tag-q', 'Filter tags...') +
    getAllTags().map(t => {
      const checked = state.activeTags.includes(t) ? ' checked' : '';
      return `<li class="dropdown-item${checked ? ' selected' : ''}" data-value="${escHtml(t)}" data-label="${escHtml(t)}">
        <span class="check-box${checked}"></span>${escHtml(t)}
      </li>`;
    }).join('');
  if (tagQ) { document.getElementById('dd-tag-q').value = tagQ; filterDropdownItems('dd-tag-q'); }

  updateDropdownLabels();
}

export function filterDropdownItems(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const q = input.value.toLowerCase();
  const menu = input.closest('.dropdown-menu');
  let anyVisible = false;
  menu.querySelectorAll('.dropdown-item').forEach(item => {
    const label = item.dataset.label || '';
    const match = !q || label.includes(q);
    item.classList.toggle('hidden', !match);
    if (match) anyVisible = true;
  });
  const existing = menu.querySelector('.dd-no-match');
  if (!anyVisible && !existing) {
    const li = document.createElement('li');
    li.className = 'dd-no-match';
    li.textContent = 'No matches';
    menu.appendChild(li);
  } else if (anyVisible && existing) {
    existing.remove();
  }
}

export function updateDropdownLabels() {
  $('dd-platform').querySelector('.dropdown-value').textContent =
    state.activePlatform ? platformLabel(state.activePlatform) : 'All';

  const tagVal = $('dd-tags').querySelector('.dropdown-value');
  if (state.activeTags.length === 0) tagVal.textContent = 'All';
  else if (state.activeTags.length <= 2) tagVal.textContent = state.activeTags.join(', ');
  else tagVal.textContent = `${state.activeTags.length} selected`;
}

// ── Snippet cards ────────────────────────────────────────────

function renderSnippetCard(s, terms) {
  const cat = CATEGORY_LABELS[s.category] || s.category;
  const lines = s.command.split('\n').length;
  const isLong = lines > 12;
  const pinned = isPinned(s.id);
  return `
    <article class="snippet-card${pinned ? ' pinned' : ''}" data-id="${escHtml(s.id)}" data-cat="${escHtml(s.category)}" tabindex="-1">
      <div class="snippet-header">
        <h2 class="snippet-title">${highlight(s.title, terms)}</h2>
        <div class="snippet-badges">
          <span class="snippet-platform">${escHtml(platformLabel(s.platform))}</span>
          <button class="pin-btn" aria-pressed="${pinned}" title="${pinned ? 'Unpin' : 'Pin to the top'}" aria-label="${pinned ? 'Unpin snippet' : 'Pin snippet'}">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="snippet-desc">${highlight(s.description, terms)}</p>
      <div class="snippet-code-wrap">
        <pre class="snippet-code"><code>${highlight(s.command, terms)}</code></pre>
        <button class="copy-btn" title="Copy to clipboard" aria-label="Copy command">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>${isLong ? `\n      <button class="expand-btn visible" data-lines="${lines}">Show all ${lines} lines</button>` : ''}
      <div class="snippet-meta">
        <span class="snippet-category">${escHtml(cat)}</span>
        ${s.tags.map(t => `<button class="snippet-tag${state.activeTags.includes(t) ? ' active' : ''}" data-tag="${escHtml(t)}">${escHtml(t)}</button>`).join('')}
      </div>
    </article>`;
}

function emptyState() {
  return `<div class="empty-state">
    <p class="empty-title">No snippets match these filters</p>
    <p>Try dropping a filter, or search for something broader.</p>
    <button class="btn-secondary" data-action="reset-filters">Clear all filters</button>
  </div>`;
}

export function renderSnippets() {
  const terms = searchTerms(state.searchQuery);
  const pinned = new Set(state.pins);

  visible = snippets.filter(s => matchesFilters(s, terms));
  visible.sort((a, b) => (pinned.has(b.id) ? 1 : 0) - (pinned.has(a.id) ? 1 : 0));

  if (state.focusId && !visible.some(s => s.id === state.focusId)) state.focusId = '';

  const container = $('snippets-grid');
  container.innerHTML = visible.length
    ? visible.map(s => renderSnippetCard(s, terms)).join('')
    : emptyState();
  container.classList.toggle('is-empty', visible.length === 0);

  $('result-count').textContent = `${visible.length} snippet${visible.length !== 1 ? 's' : ''}`;
  updateFocus();
}

/** Applies the focus ring without a full re-render. */
export function updateFocus({ scroll = false } = {}) {
  const grid = $('snippets-grid');
  grid.querySelectorAll('.snippet-card.focused').forEach(c => c.classList.remove('focused'));
  if (!state.focusId) return;
  const card = grid.querySelector(`.snippet-card[data-id="${CSS.escape(state.focusId)}"]`);
  if (!card) return;
  card.classList.add('focused');
  if (scroll) {
    card.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

export function render() {
  renderRail();
  renderDropdowns();
  renderActiveFilters();
  renderSnippets();
}
