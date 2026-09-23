// ── DOM rendering ────────────────────────────────────────────

import { state } from './state.js';
import { snippets, CATEGORIES, CATEGORY_LABELS } from './data.js';
import { $, escHtml } from './utils.js';

function getAllTags() {
  const tagSet = new Set();
  snippets.forEach(s => s.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}

function getAllPlatforms() {
  const set = new Set();
  snippets.forEach(s => set.add(s.platform));
  return [...set].sort();
}

function searchBox(id, placeholder) {
  return `<li class="dd-search-wrap"><input class="dd-search" id="${id}" type="text" placeholder="${placeholder}" autocomplete="off"></li>`;
}

export function renderDropdowns() {
  const catMenu = $('dd-category-menu');
  const catQ = document.getElementById('dd-cat-q')?.value || '';
  catMenu.innerHTML = searchBox('dd-cat-q', 'Filter categories...') +
    `<li class="dropdown-item${!state.activeCategory ? ' selected' : ''}" data-value="" data-label="all">All</li>` +
    CATEGORIES.map(c => {
      const label = CATEGORY_LABELS[c];
      const sel = state.activeCategory === c ? ' selected' : '';
      return `<li class="dropdown-item${sel}" data-value="${escHtml(c)}" data-label="${escHtml(label.toLowerCase())}">${escHtml(label)}</li>`;
    }).join('');
  if (catQ) { document.getElementById('dd-cat-q').value = catQ; filterDropdownItems('dd-cat-q'); }

  const platMenu = $('dd-platform-menu');
  const platQ = document.getElementById('dd-plat-q')?.value || '';
  const platforms = getAllPlatforms();
  platMenu.innerHTML = searchBox('dd-plat-q', 'Filter platforms...') +
    `<li class="dropdown-item${!state.activePlatform ? ' selected' : ''}" data-value="" data-label="all">All</li>` +
    platforms.map(p => {
      const sel = state.activePlatform === p ? ' selected' : '';
      return `<li class="dropdown-item${sel}" data-value="${escHtml(p)}" data-label="${escHtml(p.toLowerCase())}">${escHtml(p)}</li>`;
    }).join('');
  if (platQ) { document.getElementById('dd-plat-q').value = platQ; filterDropdownItems('dd-plat-q'); }

  const tagMenu = $('dd-tags-menu');
  const tagQ = document.getElementById('dd-tag-q')?.value || '';
  const tags = getAllTags();
  tagMenu.innerHTML = searchBox('dd-tag-q', 'Filter tags...') +
    tags.map(t => {
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
  const catVal = $('dd-category').querySelector('.dropdown-value');
  catVal.textContent = state.activeCategory ? CATEGORY_LABELS[state.activeCategory] : 'All';

  const platVal = $('dd-platform').querySelector('.dropdown-value');
  platVal.textContent = state.activePlatform || 'All';

  const tagVal = $('dd-tags').querySelector('.dropdown-value');
  if (state.activeTags.length === 0) {
    tagVal.textContent = 'All';
  } else if (state.activeTags.length <= 2) {
    tagVal.textContent = state.activeTags.join(', ');
  } else {
    tagVal.textContent = `${state.activeTags.length} selected`;
  }
}

function matchesFilters(snippet) {
  const q = state.searchQuery.toLowerCase();
  if (q) {
    const haystack = `${snippet.title} ${snippet.description} ${snippet.command} ${snippet.tags.join(' ')} ${snippet.platform}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (state.activeCategory && snippet.category !== state.activeCategory) return false;
  if (state.activePlatform && snippet.platform !== state.activePlatform) return false;
  if (state.activeTags.length > 0) {
    if (!state.activeTags.some(t => snippet.tags.includes(t))) return false;
  }
  return true;
}

function renderSnippetCard(s) {
  const cat = CATEGORY_LABELS[s.category] || s.category;
  const lines = s.command.split('\n').length;
  const isLong = lines > 12;
  return `
    <article class="snippet-card" data-id="${escHtml(s.id)}" data-cat="${escHtml(s.category)}">
      <div class="snippet-header">
        <h2 class="snippet-title">${escHtml(s.title)}</h2>
        <span class="snippet-platform">${escHtml(s.platform)}</span>
      </div>
      <p class="snippet-desc">${escHtml(s.description)}</p>
      <div class="snippet-code-wrap">
        <pre class="snippet-code"><code>${escHtml(s.command)}</code></pre>
        <button class="copy-btn" title="Copy to clipboard" aria-label="Copy command">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>${isLong ? `\n      <button class="expand-btn visible" data-lines="${lines}">Show all ${lines} lines</button>` : ''}
      <div class="snippet-meta">
        <span class="snippet-category">${escHtml(cat)}</span>
        ${s.tags.map(t => `<span class="snippet-tag">${escHtml(t)}</span>`).join('')}
      </div>
    </article>`;
}

export function renderSnippets() {
  const filtered = snippets.filter(matchesFilters);
  const container = $('snippets-grid');

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">No snippets match your filters. Try broadening your search.</div>`;
    $('result-count').textContent = '0 snippets';
    return;
  }

  container.innerHTML = filtered.map(renderSnippetCard).join('');
  $('result-count').textContent = `${filtered.length} snippet${filtered.length !== 1 ? 's' : ''}`;
}

export function render() {
  renderDropdowns();
  renderSnippets();
}
