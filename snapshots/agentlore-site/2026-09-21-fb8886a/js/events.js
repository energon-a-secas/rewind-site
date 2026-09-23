import {
  applyRoute, saveFilters, syncFilterHash, resetFilters,
  toggleCompleted, setActivePath, saveCodex,
} from './state.js';
import { render } from './router.js';
import { patchBrowse } from './views/browse.js';
import { patchCalculator, comparisonIds, activeWorkload } from './views/calculator.js';
import { copyText, showToast, debounce } from './utils.js';
import { openPalette, isPaletteOpen } from './palette.js';

const CALC_FIELDS = {
  calls: v => Math.max(0, Math.round(v)),
  inputTokens: v => Math.max(0, Math.round(v)),
  outputTokens: v => Math.max(0, Math.round(v)),
  cacheHitRate: v => Math.min(Math.max(v, 0), 100) / 100,
};

function isTyping(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

/** Every handler is delegated on document, so innerHTML swaps never orphan one. */
export function bindEvents(s) {
  const applyAndRender = () => { applyRoute(s); render(s); };
  window.addEventListener('hashchange', applyAndRender);

  document.addEventListener('click', (e) => {
    const copy = e.target.closest('[data-target]');
    if (copy) {
      const pre = document.getElementById(copy.dataset.target);
      if (pre) {
        copyText(pre.textContent).then(ok => showToast(ok ? 'Copied' : 'Copy failed'));
        copy.classList.add('copied');
        setTimeout(() => copy.classList.remove('copied'), 1400);
      }
      return;
    }

    if (e.target.closest('#open-palette')) {
      e.preventDefault();
      openPalette();
      return;
    }

    const chip = e.target.closest('[data-category]');
    if (chip) {
      s.activeCategory = s.activeCategory === chip.dataset.category ? '' : chip.dataset.category;
      saveFilters(s);
      syncFilterHash(s);
      patchBrowse(s);
      return;
    }

    if (e.target.closest('[data-reset-filters]')) {
      resetFilters(s);
      syncFilterHash(s);
      render(s);
      return;
    }

    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      toggleCompleted(s, toggle.dataset.toggle);
      render(s);
      return;
    }

    const preset = e.target.closest('[data-workload]');
    if (preset) {
      s.codex.workload = preset.dataset.workload;
      s.codex.inputs = null;
      saveCodex(s);
      render(s);
      return;
    }

    if (e.target.closest('[data-calc-reset]')) {
      s.codex.inputs = null;
      saveCodex(s);
      render(s);
      return;
    }

    const compare = e.target.closest('[data-compare]');
    if (compare) {
      const id = compare.dataset.compare;
      const current = new Set(comparisonIds(s));
      if (current.has(id)) current.delete(id); else current.add(id);
      s.codex.selected = current;
      saveCodex(s);
      patchCalculator(s);
      return;
    }

    const filter = e.target.closest('[data-filter]');
    if (filter) {
      const set = s.codex[filter.dataset.filter];
      const value = filter.dataset.value;
      if (set.has(value)) set.delete(value); else set.add(value);
      render(s);
      return;
    }

    const sort = e.target.closest('[data-sort]');
    if (sort) {
      const key = sort.dataset.sort;
      if (s.codex.sort === key) s.codex.dir = s.codex.dir === 'asc' ? 'desc' : 'asc';
      else { s.codex.sort = key; s.codex.dir = 'asc'; }
      render(s);
      return;
    }

    const tmplTab = e.target.closest('[data-tmpl]');
    if (tmplTab) {
      const { tmpl, file } = tmplTab.dataset;
      for (const tab of document.querySelectorAll(`[data-tmpl="${tmpl}"]`)) {
        tab.classList.toggle('active', tab.dataset.file === file);
      }
      for (const pane of document.querySelectorAll(`[data-tmpl-pane="${tmpl}"]`)) {
        pane.classList.toggle('hidden', pane.dataset.file !== file);
      }
      return;
    }

    const trackTab = e.target.closest('[href^="#/learn/"]');
    if (trackTab) setActivePath(s, trackTab.getAttribute('href').split('/').pop());
  });

  const onSearch = debounce(() => {
    syncFilterHash(s);
    patchBrowse(s);
  }, 140);

  document.addEventListener('input', (e) => {
    if (e.target.id === 'search-input') {
      s.searchQuery = e.target.value;
      onSearch();
      return;
    }

    const calcKey = e.target.dataset?.calc;
    if (calcKey && CALC_FIELDS[calcKey]) {
      const raw = Number(e.target.value);
      if (e.target.value === '' || Number.isNaN(raw)) return;
      const base = activeWorkload(s);
      s.codex.inputs = {
        calls: base.calls,
        inputTokens: base.inputTokens,
        outputTokens: base.outputTokens,
        cacheHitRate: base.cacheHitRate,
        [calcKey]: CALC_FIELDS[calcKey](raw),
      };
      saveCodex(s);
      patchCalculator(s);
    }
  });

  document.addEventListener('change', (e) => {
    const which = e.target.dataset?.filterSelect;
    if (which === 'filter-tool') s.activeTool = e.target.value;
    else if (which === 'filter-level') s.activeLevel = e.target.value;
    else return;
    saveFilters(s);
    syncFilterHash(s);
    patchBrowse(s);
  });

  document.addEventListener('keydown', (e) => {
    if (isPaletteOpen()) return;

    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openPalette();
      return;
    }

    if (isTyping(document.activeElement)) return;

    if (e.key === '/') {
      e.preventDefault();
      const search = document.getElementById('search-input');
      if (search) search.focus();
      else openPalette();
    }
  });

  applyAndRender();
}
