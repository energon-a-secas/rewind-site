import { tutorials, CATEGORY_META, CATEGORY_ORDER, TOOLS, LEVEL_META, LEVEL_ORDER } from '../content/index.js';
import { escHtml } from '../utils.js';
import { tutorialCard, pageHead, emptyState } from './parts.js';

function searchTerms(s) {
  return s.searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesSearch(t, terms) {
  if (!terms.length) return true;
  const hay = `${t.title} ${t.description} ${CATEGORY_META[t.category].label} ${t.tools.join(' ')} ${t.difficulty}`.toLowerCase();
  return terms.every(term => hay.includes(term));
}

/**
 * Every filter except category — the basis for rail counts, so a chip showing
 * zero genuinely would be empty if you clicked it.
 */
function matchesExceptCategory(t, s, terms) {
  if (s.activeTool && !t.tools.includes(s.activeTool)) return false;
  if (s.activeLevel && t.difficulty !== s.activeLevel) return false;
  return matchesSearch(t, terms);
}

export function filteredTutorials(s) {
  const terms = searchTerms(s);
  return tutorials.filter(t =>
    (!s.activeCategory || t.category === s.activeCategory) && matchesExceptCategory(t, s, terms)
  );
}

function railCounts(s) {
  const terms = searchTerms(s);
  const pool = tutorials.filter(t => matchesExceptCategory(t, s, terms));
  const counts = { '': pool.length };
  for (const t of pool) counts[t.category] = (counts[t.category] || 0) + 1;
  return counts;
}

function categoryRail(s) {
  const counts = railCounts(s);
  const chip = (value, label, accent) => {
    const count = counts[value] || 0;
    const active = s.activeCategory === value;
    return `<button class="rail-chip${active ? ' active' : ''}${count ? '' : ' empty'}" data-category="${value}" aria-pressed="${active}" type="button"${accent ? ` style="--chip-accent:${accent}"` : ''}>
      <span class="rail-chip-label">${escHtml(label)}</span><span class="rail-chip-count">${count}</span>
    </button>`;
  };
  return `<nav class="cat-rail" aria-label="Filter by category">
  ${chip('', 'All', '')}
  ${CATEGORY_ORDER.map(key => chip(key, CATEGORY_META[key].label, CATEGORY_META[key].accent)).join('')}
</nav>`;
}

function select(id, label, options, active) {
  return `<label class="select-wrap">
  <span class="select-label">${escHtml(label)}</span>
  <select id="${id}" class="select" data-filter-select="${id}">
    <option value=""${active ? '' : ' selected'}>All</option>
    ${options.map(([value, text]) =>
      `<option value="${value}"${active === value ? ' selected' : ''}>${escHtml(text)}</option>`).join('')}
  </select>
</label>`;
}

function resultsMarkup(s) {
  const filtered = filteredTutorials(s);
  if (!filtered.length) {
    return emptyState('No guides match those filters.', 'Reset filters', 'data-reset-filters');
  }

  const groups = {};
  for (const level of LEVEL_ORDER) groups[level] = [];
  for (const t of filtered) groups[t.difficulty].push(t);

  return LEVEL_ORDER.filter(l => groups[l].length).map(level => {
    const meta = LEVEL_META[level];
    return `<section class="level-section" data-level="${level}">
  <div class="level-header">
    <span class="level-number">${meta.icon}</span>
    <div>
      <h3 class="level-title">${escHtml(meta.label)}</h3>
      <p class="level-subtitle">${escHtml(meta.subtitle)}</p>
    </div>
  </div>
  <div class="level-grid">${groups[level].map(t => tutorialCard(t, s)).join('')}</div>
</section>`;
  }).join('');
}

export function renderBrowse(s) {
  const filtered = filteredTutorials(s);

  return `${pageHead('Browse the archive', 'Every guide in Agent Lore, grouped by depth. Filter, search, or share the URL, your filters travel with it.', 'Archive')}

<div class="toolbar">
  <div class="toolbar-inner">
    <div class="search-bar">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input id="search-input" class="search-input" type="search" placeholder="Search guides…" aria-label="Search guides" value="${escHtml(s.searchQuery)}" autocomplete="off">
      </div>
      ${select('filter-tool', 'Tool', Object.entries(TOOLS), s.activeTool)}
      ${select('filter-level', 'Level', LEVEL_ORDER.map(l => [l, LEVEL_META[l].label]), s.activeLevel)}
      <button class="btn-secondary" data-reset-filters type="button">Reset</button>
    </div>
    ${categoryRail(s)}
    <p class="result-count" id="result-count" aria-live="polite">Showing ${filtered.length} of ${tutorials.length}</p>
  </div>
</div>

<div id="browse-results">${resultsMarkup(s)}</div>`;
}

/**
 * Update results and counts without touching the search input, so the caret
 * and focus survive every keystroke.
 */
export function patchBrowse(s) {
  const results = document.getElementById('browse-results');
  if (!results) return;

  results.innerHTML = resultsMarkup(s);

  const counts = railCounts(s);
  for (const chip of document.querySelectorAll('.rail-chip')) {
    const value = chip.dataset.category;
    const count = counts[value] || 0;
    chip.querySelector('.rail-chip-count').textContent = count;
    chip.classList.toggle('empty', count === 0);
    chip.classList.toggle('active', s.activeCategory === value);
    chip.setAttribute('aria-pressed', String(s.activeCategory === value));
  }

  const count = document.getElementById('result-count');
  if (count) count.textContent = `Showing ${filteredTutorials(s).length} of ${tutorials.length}`;
}
