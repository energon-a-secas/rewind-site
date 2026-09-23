// ── Event handlers ───────────────────────────────────────────

import { state, togglePin, resetFilters, syncHash, readHash } from './state.js';
import {
  render, renderRail, renderSnippets, renderDropdowns, renderActiveFilters,
  filterDropdownItems, updateFocus, getVisible,
} from './render.js';
import { $, showToast, debounce } from './utils.js';

const TYPING_TAGS = ['INPUT', 'TEXTAREA'];

/** Re-renders everything that a filter change can affect, then syncs the URL. */
function applyFilters() {
  renderRail();
  renderDropdowns();
  renderActiveFilters();
  renderSnippets();
  syncHash();
}

function closeAllDropdowns(except) {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    if (dd === except) return;
    dd.classList.remove('open');
    dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    const search = dd.querySelector('.dd-search');
    if (search) search.value = '';
  });
}

function toggleDropdown(dd) {
  const wasOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (wasOpen) return;
  dd.classList.add('open');
  dd.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
  const search = dd.querySelector('.dd-search');
  if (search) requestAnimationFrame(() => search.focus());
}

function closeModals() {
  document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
}

function copySnippet(card) {
  const code = card.querySelector('.snippet-code code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Copied to clipboard');
    const btn = card.querySelector('.copy-btn');
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1200);
  }).catch(() => showToast('Could not access the clipboard'));
}

function pinSnippet(card) {
  const id = card.dataset.id;
  const nowPinned = togglePin(id);
  state.focusId = id;
  showToast(nowPinned ? 'Pinned to the top' : 'Unpinned');
  renderRail();
  renderSnippets();
  updateFocus({ scroll: true });
}

function toggleTag(tag) {
  const at = state.activeTags.indexOf(tag);
  if (at === -1) state.activeTags.push(tag);
  else state.activeTags.splice(at, 1);
  applyFilters();
}

// ── Keyboard focus movement ──────────────────────────────────

function moveFocus(delta) {
  const list = getVisible();
  if (!list.length) return;
  const current = list.findIndex(s => s.id === state.focusId);
  const next = current === -1
    ? (delta > 0 ? 0 : list.length - 1)
    : Math.min(list.length - 1, Math.max(0, current + delta));
  state.focusId = list[next].id;
  updateFocus({ scroll: true });
}

function focusedCard() {
  if (!state.focusId) return null;
  return $('snippets-grid').querySelector(`.snippet-card[data-id="${CSS.escape(state.focusId)}"]`);
}

// ── Bindings ─────────────────────────────────────────────────

export function bindEvents() {
  $('search-input').addEventListener('input', debounce(e => {
    state.searchQuery = e.target.value.trim();
    renderRail();
    renderActiveFilters();
    renderSnippets();
    syncHash();
  }, 150));

  $('clear-search').addEventListener('click', () => {
    resetFilters();
    $('search-input').value = '';
    applyFilters();
  });

  // ── Category rail ─────────────────────────────────────────
  $('cat-rail').addEventListener('click', e => {
    const chip = e.target.closest('.rail-chip');
    if (!chip) return;
    if (chip.dataset.pinned) {
      state.pinnedOnly = !state.pinnedOnly;
    } else {
      state.activeCategory = chip.dataset.cat;
      if (!chip.dataset.cat) state.pinnedOnly = false;
    }
    applyFilters();
  });

  // ── Removable filter chips ────────────────────────────────
  $('active-filters').addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    switch (chip.dataset.kind) {
      case 'search': state.searchQuery = ''; $('search-input').value = ''; break;
      case 'category': state.activeCategory = ''; break;
      case 'platform': state.activePlatform = ''; break;
      case 'pinned': state.pinnedOnly = false; break;
      case 'tag': state.activeTags = state.activeTags.filter(t => t !== chip.dataset.value); break;
      case 'all': resetFilters(); $('search-input').value = ''; break;
    }
    applyFilters();
  });

  // ── Dropdowns ─────────────────────────────────────────────
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleDropdown(btn.closest('.dropdown'));
    });
  });

  document.addEventListener('input', e => {
    if (e.target.classList.contains('dd-search')) filterDropdownItems(e.target.id);
  });

  document.addEventListener('click', e => {
    if (e.target.closest('.dd-search-wrap')) e.stopPropagation();
  }, true);

  $('dd-platform-menu').addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    state.activePlatform = item.dataset.value;
    closeAllDropdowns();
    applyFilters();
  });

  $('dd-tags-menu').addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    e.stopPropagation();
    toggleTag(item.dataset.value);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) closeAllDropdowns();
  });

  // ── Snippet grid ──────────────────────────────────────────
  $('snippets-grid').addEventListener('click', e => {
    if (e.target.closest('[data-action="reset-filters"]')) {
      resetFilters();
      $('search-input').value = '';
      applyFilters();
      return;
    }

    const tagBtn = e.target.closest('.snippet-tag');
    if (tagBtn) { toggleTag(tagBtn.dataset.tag); return; }

    const card = e.target.closest('.snippet-card');
    if (!card) return;

    if (e.target.closest('.copy-btn')) { copySnippet(card); return; }
    if (e.target.closest('.pin-btn')) { pinSnippet(card); return; }

    const expandBtn = e.target.closest('.expand-btn');
    if (expandBtn) {
      const isExpanded = card.classList.toggle('expanded');
      expandBtn.textContent = isExpanded ? 'Collapse' : `Show all ${expandBtn.dataset.lines} lines`;
      return;
    }

    state.focusId = card.dataset.id;
    updateFocus();
  });

  // ── Modals ────────────────────────────────────────────────
  $('suggest-btn').addEventListener('click', () => $('suggest-modal').classList.add('open'));
  $('suggest-close').addEventListener('click', closeModals);
  $('help-btn').addEventListener('click', () => $('help-modal').classList.add('open'));
  $('help-close').addEventListener('click', closeModals);

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModals();
    });
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
      closeModals();
      $('suggest-title').value = '';
      $('suggest-command').value = '';
      $('suggest-desc').value = '';
    });
  });

  // ── Back/forward and pasted deep links ────────────────────
  window.addEventListener('hashchange', () => {
    readHash();
    $('search-input').value = state.searchQuery;
    render();
  });

  // ── Keyboard shortcuts ────────────────────────────────────
  document.addEventListener('keydown', e => {
    const typing = TYPING_TAGS.includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      closeAllDropdowns();
      closeModals();
      if (typing) document.activeElement.blur();
      return;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('.modal.open')) return;

    // Layouts differ on whether Shift+/ reports '?' or '/', so check both.
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      if (typing) return;
      e.preventDefault();
      $('help-modal').classList.add('open');
      return;
    }

    if (e.key === '/' && !typing) {
      e.preventDefault();
      $('search-input').focus();
      $('search-input').select();
      return;
    }

    if (typing) return;

    switch (e.key) {
      case 'j': case 'ArrowDown': e.preventDefault(); moveFocus(1); break;
      case 'k': case 'ArrowUp': e.preventDefault(); moveFocus(-1); break;
      case 'c': case 'Enter': {
        const card = focusedCard();
        if (card) { e.preventDefault(); copySnippet(card); }
        break;
      }
      case 'p': {
        const card = focusedCard();
        if (card) { e.preventDefault(); pinSnippet(card); }
        break;
      }
    }
  });
}
