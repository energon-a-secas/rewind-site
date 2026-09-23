import { state } from './state.js';
import { LAYOUTS } from './data.js';
import { renderLayoutNav, renderMockup, renderBrowser, renderHeroBgPicker, applyHeroBg,
         showTooltip, hideTooltip, syncBrowserHighlight } from './render.js';
import { debounce } from './utils.js';

let currentHovered = null;

// Close all dropdown menus
function closeAllDropdowns() {
  document.querySelectorAll('.layout-dropdown-menu').forEach(menu => {
    menu.classList.remove('open');
  });
  document.querySelectorAll('.layout-dropdown-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.layout-dropdown')) {
    closeAllDropdowns();
  }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAllDropdowns();
  }
});

export function initEvents() {

  // Layout dropdown interactions
  document.getElementById('layoutNav').addEventListener('click', e => {
    const dropdownBtn = e.target.closest('.layout-dropdown-btn');
    const menuItem = e.target.closest('.layout-dropdown-item');

    if (dropdownBtn) {
      // Toggle dropdown menu
      const category = dropdownBtn.dataset.category;
      const menu = document.querySelector(`.layout-dropdown-menu[data-category="${category}"]`);
      const isOpen = menu.classList.contains('open');

      // Close all menus first
      closeAllDropdowns();

      // Open this menu if it wasn't already open
      if (!isOpen) {
        menu.classList.add('open');
        dropdownBtn.setAttribute('aria-expanded', 'true');
      }
    } else if (menuItem) {
      // Select layout from dropdown
      state.activeLayout = menuItem.dataset.layout;
      state.activeComp = null;
      state.pinnedComp = null; // Unpin when switching layouts
      closeAllDropdowns();

      // Update URL for sharing
      const url = new URL(window.location);
      url.searchParams.set('layout', state.activeLayout);
      history.replaceState(null, '', url);

      // Re-render
      renderLayoutNav();
      renderMockup();
      renderBrowser();
      hideTooltip();
      currentHovered = null;
    }
  });

  // Component hover and click in mockup
  const mockupArea = document.getElementById('mockupArea');

  mockupArea.addEventListener('mouseover', e => {
    const comp = e.target.closest('[data-comp]');
    if (comp === currentHovered) return;
    if (currentHovered) currentHovered.classList.remove('hovered');
    currentHovered = comp;
    if (!comp) {
      // Only hide tooltip if nothing is pinned
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
    // Only hide if not pinned
    if (state.pinnedComp === null) {
      hideTooltip();
      state.activeComp = null;
      syncBrowserHighlight(null);
    }
  });

  // Click to pin tooltip
  mockupArea.addEventListener('click', e => {
    const comp = e.target.closest('[data-comp]');
    if (!comp) return;

    e.stopPropagation();
    const id = comp.dataset.comp;

    // Toggle pin state
    if (state.pinnedComp === id) {
      // Unpin
      state.pinnedComp = null;
      hideTooltip();
      syncBrowserHighlight(null);
    } else {
      // Pin this component
      state.pinnedComp = id;
      state.activeComp = id;
      showTooltip(id, comp);
      syncBrowserHighlight(id);
    }
  });

  // Click outside to unpin
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-comp]') && !e.target.closest('.anatomy-tooltip')) {
      if (state.pinnedComp !== null) {
        state.pinnedComp = null;
        hideTooltip();
        syncBrowserHighlight(null);
      }
    }
  });

  // Browser item click → scroll to component in mockup OR switch to layout with component
  document.getElementById('browserList').addEventListener('click', e => {
    const item = e.target.closest('.browser-item');
    if (!item) return;
    const id = item.dataset.compId;
    
    // If component is missing in current layout, switch to first layout that has it
    if (item.classList.contains('missing')) {
      const foundIn = item.dataset.foundIn?.split(',').filter(Boolean) || [];
      if (foundIn.length > 0) {
        state.activeLayout = foundIn[0]; // Switch to first layout that has this component
        state.activeComp = null;
        renderLayoutNav();
        renderMockup();
        renderBrowser();
        hideTooltip();
        currentHovered = null;

        // After render, scroll to the component
        setTimeout(() => {
          const target = document.querySelector(`#mockupFrame [data-comp="${id}"]`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
    // Component is present, scroll to it
    const target = document.querySelector(`#mockupFrame [data-comp="${id}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('hovered');
    if (currentHovered && currentHovered !== target) currentHovered.classList.remove('hovered');
    currentHovered = target;
    state.activeComp = id;
    showTooltip(id, target);
    syncBrowserHighlight(id);
  });

  // Search input
  const search = document.getElementById('compSearch');
  search.addEventListener('input', debounce(() => {
    state.searchQuery = search.value.trim();
    renderBrowser();
  }, 150));

  // Browser toggle
  document.getElementById('browserToggle').addEventListener('click', () => {
    state.browserOpen = !state.browserOpen;
    document.getElementById('compBrowser').classList.toggle('hidden', !state.browserOpen);
    document.getElementById('browserToggle').classList.toggle('active', state.browserOpen);
  });

  // Outlines toggle
  document.getElementById('outlinesToggle').addEventListener('click', () => {
    state.outlinesOn = !state.outlinesOn;
    document.getElementById('mockupFrame').classList.toggle('show-outlines', state.outlinesOn);
    document.getElementById('outlinesToggle').classList.toggle('active', state.outlinesOn);
  });

  // Dummy content toggle
  document.getElementById('dummyToggle').addEventListener('click', () => {
    state.dummyMode = !state.dummyMode;
    document.getElementById('dummyToggle').classList.toggle('active', state.dummyMode);
    renderMockup();
    hideTooltip();
    currentHovered = null;
  });

  // Hero BG swatch picker
  document.getElementById('heroBgPicker').addEventListener('click', e => {
    const btn = e.target.closest('[data-bg]');
    if (!btn) return;
    state.heroBg = btn.dataset.bg;
    renderHeroBgPicker();
    applyHeroBg();
  });

  // Random layout button
  document.getElementById('randomLayoutBtn').addEventListener('click', () => {
    // Unpin any pinned tooltip
    state.pinnedComp = null;
    hideTooltip();

    // Select random layout
    const randomIndex = Math.floor(Math.random() * LAYOUTS.length);
    const randomLayout = LAYOUTS[randomIndex];
    state.activeLayout = randomLayout.id;
    state.activeComp = null;
    currentHovered = null;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('layout', state.activeLayout);
    history.replaceState(null, '', url);

    // Re-render
    renderLayoutNav();
    renderMockup();
    renderBrowser();
    syncBrowserHighlight(null);
  });

}
