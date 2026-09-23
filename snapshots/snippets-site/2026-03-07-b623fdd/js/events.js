// ── Event handlers ───────────────────────────────────────────

import { state } from './state.js';
import { renderSnippets, renderDropdowns, filterDropdownItems } from './render.js';
import { $, showToast, debounce } from './utils.js';

function closeAllDropdowns(except) {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    if (dd !== except) {
      dd.classList.remove('open');
      dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      const search = dd.querySelector('.dd-search');
      if (search) { search.value = ''; }
    }
  });
}

function openDropdown(dd) {
  const wasOpen = dd.classList.contains('open');
  if (wasOpen) {
    dd.classList.remove('open');
    dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    const search = dd.querySelector('.dd-search');
    if (search) search.value = '';
    return;
  }
  dd.classList.add('open');
  dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
  closeAllDropdowns(dd);
  const search = dd.querySelector('.dd-search');
  if (search) requestAnimationFrame(() => search.focus());
}

export function bindEvents() {
  // ── Search ──────────────────────────────────────────────────
  $('search-input').addEventListener('input', debounce(e => {
    state.searchQuery = e.target.value.trim();
    renderSnippets();
  }, 150));

  // ── Clear all filters ──────────────────────────────────────
  $('clear-search').addEventListener('click', () => {
    $('search-input').value = '';
    state.searchQuery = '';
    state.activeCategory = '';
    state.activePlatform = '';
    state.activeTags = [];
    renderDropdowns();
    renderSnippets();
  });

  // ── Dropdown toggles ──────────────────────────────────────
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openDropdown(btn.closest('.dropdown'));
    });
  });

  // ── Dropdown search inputs ────────────────────────────────
  document.addEventListener('input', e => {
    if (!e.target.classList.contains('dd-search')) return;
    filterDropdownItems(e.target.id);
  });

  document.addEventListener('click', e => {
    if (e.target.classList.contains('dd-search')) {
      e.stopPropagation();
      return;
    }
    if (e.target.closest('.dd-search-wrap')) {
      e.stopPropagation();
      return;
    }
  }, true);

  // ── Category selection ────────────────────────────────────
  $('dd-category-menu').addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    state.activeCategory = item.dataset.value;
    $('dd-category').classList.remove('open');
    $('dd-category').querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    renderDropdowns();
    renderSnippets();
  });

  // ── Platform selection ────────────────────────────────────
  $('dd-platform-menu').addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    state.activePlatform = item.dataset.value;
    $('dd-platform').classList.remove('open');
    $('dd-platform').querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    renderDropdowns();
    renderSnippets();
  });

  // ── Tags multi-select ─────────────────────────────────────
  $('dd-tags-menu').addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    e.stopPropagation();
    const tag = item.dataset.value;
    const idx = state.activeTags.indexOf(tag);
    if (idx === -1) {
      state.activeTags.push(tag);
    } else {
      state.activeTags.splice(idx, 1);
    }
    renderDropdowns();
    renderSnippets();
  });

  // ── Close dropdowns on outside click ──────────────────────
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
  });

  // ── Snippet grid: copy + expand ───────────────────────────
  $('snippets-grid').addEventListener('click', e => {
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const card = copyBtn.closest('.snippet-card');
      const code = card.querySelector('.snippet-code code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        showToast('Copied to clipboard');
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 1200);
      });
      return;
    }

    const expandBtn = e.target.closest('.expand-btn');
    if (expandBtn) {
      const card = expandBtn.closest('.snippet-card');
      const isExpanded = card.classList.toggle('expanded');
      expandBtn.textContent = isExpanded ? 'Collapse' : `Show all ${expandBtn.dataset.lines} lines`;
      return;
    }
  });

  // ── Suggest modal ─────────────────────────────────────────
  $('suggest-btn').addEventListener('click', () => {
    $('suggest-modal').classList.toggle('open');
  });

  $('suggest-close').addEventListener('click', () => {
    $('suggest-modal').classList.remove('open');
  });

  $('suggest-copy').addEventListener('click', () => {
    const title = $('suggest-title').value.trim();
    const command = $('suggest-command').value.trim();
    const desc = $('suggest-desc').value.trim();
    if (!title || !command) {
      showToast('Title and command are required');
      return;
    }
    const text = `Snippet Suggestion\n\nTitle: ${title}\nCommand: ${command}\nDescription: ${desc}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Suggestion copied, share it with us');
      $('suggest-modal').classList.remove('open');
      $('suggest-title').value = '';
      $('suggest-command').value = '';
      $('suggest-desc').value = '';
    });
  });

  // ── Keyboard shortcuts ────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      $('suggest-modal').classList.remove('open');
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      $('search-input').focus();
    }
  });
}
