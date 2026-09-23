import { state } from './state.js';
import { LAYOUTS, COMPONENTS } from './data.js';
import { renderLayoutNav, renderMockup, renderBrowser, renderHeroBgPicker, applyHeroBg,
         showTooltip, hideTooltip, syncBrowserHighlight } from './render.js';
import { debounce, prefersReducedMotion } from './utils.js';

let currentHovered = null;

function scrollBehaviorOpts() {
  return { behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' };
}

function closeAllDropdowns() {
  document.querySelectorAll('.layout-dropdown-menu').forEach(menu => {
    menu.classList.remove('open');
  });
  document.querySelectorAll('.layout-dropdown-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function toggleLayoutDropdown(dropdownBtn) {
  const category = dropdownBtn.dataset.category;
  const menu = document.getElementById(`layout-menu-${category}`);
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) {
    menu.classList.add('open');
    dropdownBtn.setAttribute('aria-expanded', 'true');
  }
}

function selectLayout(layoutId) {
  state.activeLayout = layoutId;
  state.activeComp = null;
  state.pinnedComp = null;
  closeAllDropdowns();

  const url = new URL(window.location);
  url.searchParams.set('layout', state.activeLayout);
  url.searchParams.delete('comp');
  history.replaceState(null, '', url);

  renderLayoutNav();
  renderMockup();
  renderBrowser();
  hideTooltip();
  currentHovered = null;
}

function activateBrowserItem(item) {
  const id = item.dataset.compId;

  if (item.classList.contains('missing')) {
    const foundIn = item.dataset.foundIn?.split(',').filter(Boolean) || [];
    if (foundIn.length > 0) {
      state.activeLayout = foundIn[0];
      state.activeComp = null;
      renderLayoutNav();
      renderMockup();
      renderBrowser();
      hideTooltip();
      currentHovered = null;

      setTimeout(() => {
        const target = document.querySelector(`#mockupFrame [data-comp="${id}"]`);
        if (target) {
          target.scrollIntoView(scrollBehaviorOpts());
          target.classList.add('hovered');
          currentHovered = target;
          state.activeComp = id;
          showTooltip(id, target);
          syncBrowserHighlight(id);
        }
      }, 100);
    }
    return;
  }

  const target = document.querySelector(`#mockupFrame [data-comp="${id}"]`);
  if (!target) return;
  target.scrollIntoView(scrollBehaviorOpts());
  target.classList.add('hovered');
  if (currentHovered && currentHovered !== target) currentHovered.classList.remove('hovered');
  currentHovered = target;
  state.activeComp = id;
  showTooltip(id, target);
  syncBrowserHighlight(id);
}

document.addEventListener('click', e => {
  if (!e.target.closest('.layout-dropdown')) {
    closeAllDropdowns();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAllDropdowns();
  }
});

export function initEvents() {
  const layoutNav = document.getElementById('layoutNav');

  layoutNav.addEventListener('click', e => {
    const dropdownBtn = e.target.closest('.layout-dropdown-btn');
    const menuItem = e.target.closest('.layout-dropdown-item');

    if (dropdownBtn) {
      toggleLayoutDropdown(dropdownBtn);
    } else if (menuItem) {
      selectLayout(menuItem.dataset.layout);
    }
  });

  layoutNav.addEventListener('keydown', e => {
    const dropdownBtn = e.target.closest('.layout-dropdown-btn');
    const menuItem = e.target.closest('.layout-dropdown-item');

    if (dropdownBtn) {
      const category = dropdownBtn.dataset.category;
      const menu = document.getElementById(`layout-menu-${category}`);
      if (!menu) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLayoutDropdown(dropdownBtn);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        closeAllDropdowns();
        menu.classList.add('open');
        dropdownBtn.setAttribute('aria-expanded', 'true');
        menu.querySelector('.layout-dropdown-item')?.focus();
        return;
      }
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        e.preventDefault();
        closeAllDropdowns();
        dropdownBtn.focus();
      }
      return;
    }

    if (menuItem) {
      const menu = menuItem.closest('.layout-dropdown-menu');
      const ddBtn = menuItem.closest('.layout-dropdown')?.querySelector('.layout-dropdown-btn');
      const items = [...menu.querySelectorAll('.layout-dropdown-item')];
      const idx = items.indexOf(menuItem);

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectLayout(menuItem.dataset.layout);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllDropdowns();
        ddBtn?.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[Math.min(idx + 1, items.length - 1)]?.focus();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx <= 0) {
          closeAllDropdowns();
          ddBtn?.focus();
        } else {
          items[idx - 1]?.focus();
        }
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    }
  });

  const mockupArea = document.getElementById('mockupArea');

  mockupArea.addEventListener('mouseover', e => {
    const comp = e.target.closest('[data-comp]');
    if (comp === currentHovered) return;
    if (currentHovered) currentHovered.classList.remove('hovered');
    currentHovered = comp;
    if (!comp) {
      if (state.pinnedComp === null) {
        hideTooltip();
        state.activeComp = null;
        syncBrowserHighlight(null);
      }
      return;
    }
    comp.classList.add('hovered');
    const id = comp.dataset.comp;
    state.activeComp = id;
    showTooltip(id, comp);
    syncBrowserHighlight(id);
  });

  mockupArea.addEventListener('mouseleave', () => {
    if (currentHovered) {
      currentHovered.classList.remove('hovered');
      currentHovered = null;
    }
    if (state.pinnedComp === null) {
      hideTooltip();
      state.activeComp = null;
      syncBrowserHighlight(null);
    }
  });

  mockupArea.addEventListener('click', e => {
    const comp = e.target.closest('[data-comp]');
    if (!comp) return;

    e.stopPropagation();
    const id = comp.dataset.comp;

    if (state.pinnedComp === id) {
      state.pinnedComp = null;
      hideTooltip();
      syncBrowserHighlight(null);
    } else {
      state.pinnedComp = id;
      state.activeComp = id;
      showTooltip(id, comp);
      syncBrowserHighlight(id);
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('[data-comp]') && !e.target.closest('.anatomy-tooltip')) {
      if (state.pinnedComp !== null) {
        state.pinnedComp = null;
        hideTooltip();
        syncBrowserHighlight(null);
      }
    }
  });

  const browserList = document.getElementById('browserList');
  browserList.addEventListener('click', e => {
    const item = e.target.closest('.browser-item');
    if (!item) return;
    activateBrowserItem(item);
  });

  browserList.addEventListener('keydown', e => {
    const item = e.target.closest('.browser-item');
    if (!item) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateBrowserItem(item);
    }
  });

  const search = document.getElementById('compSearch');
  search.addEventListener('input', debounce(() => {
    state.searchQuery = search.value.trim();
    renderBrowser();
  }, 150));

  const browserToggle = document.getElementById('browserToggle');
  browserToggle.addEventListener('click', () => {
    state.browserOpen = !state.browserOpen;
    document.getElementById('compBrowser').classList.toggle('hidden', !state.browserOpen);
    browserToggle.classList.toggle('active', state.browserOpen);
    browserToggle.setAttribute('aria-pressed', String(state.browserOpen));
    browserToggle.setAttribute('aria-expanded', String(state.browserOpen));
  });

  const outlinesToggle = document.getElementById('outlinesToggle');
  outlinesToggle.addEventListener('click', () => {
    state.outlinesOn = !state.outlinesOn;
    document.getElementById('mockupFrame').classList.toggle('show-outlines', state.outlinesOn);
    outlinesToggle.classList.toggle('active', state.outlinesOn);
    outlinesToggle.setAttribute('aria-pressed', String(state.outlinesOn));
  });

  const dummyToggle = document.getElementById('dummyToggle');
  dummyToggle.addEventListener('click', () => {
    state.dummyMode = !state.dummyMode;
    dummyToggle.classList.toggle('active', state.dummyMode);
    dummyToggle.setAttribute('aria-pressed', String(state.dummyMode));
    renderMockup();
    hideTooltip();
    currentHovered = null;
  });

  document.getElementById('heroBgPicker').addEventListener('click', e => {
    const btn = e.target.closest('[data-bg]');
    if (!btn) return;
    state.heroBg = btn.dataset.bg;
    renderHeroBgPicker();
    applyHeroBg();
  });

  document.getElementById('randomLayoutBtn').addEventListener('click', () => {
    state.pinnedComp = null;
    hideTooltip();

    const randomIndex = Math.floor(Math.random() * LAYOUTS.length);
    const randomLayout = LAYOUTS[randomIndex];
    state.activeLayout = randomLayout.id;
    state.activeComp = null;
    currentHovered = null;

    const url = new URL(window.location);
    url.searchParams.set('layout', state.activeLayout);
    url.searchParams.delete('comp');
    history.replaceState(null, '', url);

    renderLayoutNav();
    renderMockup();
    renderBrowser();
    syncBrowserHighlight(null);
  });

  const glossaryExportBtn = document.getElementById('glossaryExportBtn');
  if (glossaryExportBtn) {
    glossaryExportBtn.addEventListener('click', () => {
      const g = {};
      for (const [id, c] of Object.entries(COMPONENTS)) {
        g[id] = {
          name: c.name,
          also: c.also || [],
          desc: c.desc,
          category: c.category,
        };
      }
      const blob = new Blob([JSON.stringify(g, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      const u = URL.createObjectURL(blob);
      a.href = u;
      a.download = 'ui-anatomy-component-glossary.json';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(u);
    });
  }
}
