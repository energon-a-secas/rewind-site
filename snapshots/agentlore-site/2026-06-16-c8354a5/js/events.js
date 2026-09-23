import { state, toggleCompleted, markCompleted, setActivePath } from './state.js';
import { render, renderModal, renderLearningPath } from './render.js';
import { tutorials } from './data.js';
import { $, showToast, debounce } from './utils.js';

let modalTrigger = null;
let scrollMarked = false;

export function bindEvents(s) {
  bindSearch(s);
  bindDropdowns(s);
  bindCardClicks(s);
  bindModal(s);
  bindHash(s);
  bindReset(s);
}

export function bindPathEvents(s) {
  bindCardClicks(s);
  bindModal(s);
  bindHash(s);
  bindTrackSelector(s);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && s.modalId) closeModal(s);
  });
}

function bindTrackSelector(s) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.path-track-btn');
    if (!btn) return;
    const id = btn.dataset.path;
    if (!id || id === s.activePath) return;
    setActivePath(id);
    renderLearningPath(s);
  });
}

function bindSearch(s) {
  const searchInput = $('search-input');
  if (!searchInput) return;

  const onSearch = debounce(() => {
    s.searchQuery = searchInput.value.trim();
    render(s);
  }, 150);
  searchInput.addEventListener('input', onSearch);

  const clearBtn = $('clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      s.searchQuery = '';
      render(s);
      searchInput.focus();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !s.modalId && document.activeElement !== searchInput) {
      e.preventDefault();
      closeAllDropdowns();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (s.modalId) {
        closeModal(s);
      } else if (document.activeElement === searchInput) {
        searchInput.blur();
      }
      closeAllDropdowns();
    }
  });
}

function bindDropdowns(s) {
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.dropdown-toggle');
    if (toggle) {
      e.stopPropagation();
      const dd = toggle.closest('.dropdown');
      const wasOpen = dd.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) {
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        focusFirstDropdownItem(dd);
      }
      return;
    }

    const item = e.target.closest('.dropdown-item');
    if (item) {
      const menu = item.closest('.dropdown-menu');
      const dd = item.closest('.dropdown');
      const value = item.dataset.value;
      const valueEl = dd.querySelector('.dropdown-value');

      if (menu.id === 'dd-category-menu') {
        s.activeCategory = value;
        if (valueEl) valueEl.textContent = value ? item.textContent : 'All';
      } else if (menu.id === 'dd-tool-menu') {
        s.activeTool = value;
        if (valueEl) valueEl.textContent = value ? item.textContent : 'All';
      }

      closeAllDropdowns();
      render(s);
      const toggle = dd.querySelector('.dropdown-toggle');
      if (toggle) toggle.focus();
      return;
    }

    closeAllDropdowns();
  });

  document.addEventListener('keydown', (e) => {
    const openDd = document.querySelector('.dropdown.open');
    if (!openDd) return;

    const items = Array.from(openDd.querySelectorAll('.dropdown-item'));
    const active = document.activeElement;
    let idx = items.indexOf(active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = idx < 0 ? 0 : Math.min(idx + 1, items.length - 1);
      items[idx].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = idx < 0 ? items.length - 1 : Math.max(idx - 1, 0);
      items[idx].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const toggle = openDd.querySelector('.dropdown-toggle');
      closeAllDropdowns();
      if (toggle) toggle.focus();
    } else if (e.key === 'Tab') {
      closeAllDropdowns();
    }
  });
}

function focusFirstDropdownItem(dd) {
  requestAnimationFrame(() => {
    const item = dd.querySelector('.dropdown-item');
    if (item) item.focus();
  });
}

function bindCardClicks(s) {
  document.addEventListener('click', (e) => {
    const checkBtn = e.target.closest('.path-check');
    if (checkBtn) {
      e.stopPropagation();
      const id = checkBtn.dataset.id;
      toggleCompleted(id);
      if (s.view === 'path') {
        renderLearningPath(s);
      } else {
        render(s);
      }
      return;
    }

    const card = e.target.closest('.tutorial-card');
    if (card) {
      openModal(s, card.dataset.id, card);
      return;
    }

    const pathBody = e.target.closest('.path-step-body');
    if (pathBody) {
      openModal(s, pathBody.dataset.id, pathBody);
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const card = e.target.closest('.tutorial-card');
    if (card) {
      e.preventDefault();
      openModal(s, card.dataset.id, card);
      return;
    }

    const pathBody = e.target.closest('.path-step-body');
    if (pathBody) {
      e.preventDefault();
      openModal(s, pathBody.dataset.id, pathBody);
    }
  });
}

function bindModal(s) {
  const overlay = $('tutorial-modal');
  if (!overlay) return;

  overlay.addEventListener('scroll', debounce(() => {
    if (!s.modalId || s.completed.has(s.modalId) || !scrollMarked) return;
    const panel = overlay.querySelector('.modal-panel');
    if (!panel) return;
    const panelBottom = panel.getBoundingClientRect().bottom;
    const viewportBottom = overlay.getBoundingClientRect().bottom;
    if (panelBottom <= viewportBottom + 40) {
      if (markCompleted(s.modalId)) {
        showToast('Marked as read');
        if (s.view === 'path') renderLearningPath(s);
      }
    }
  }, 100));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(s);

    const copyBtn = e.target.closest('.code-copy-btn');
    if (copyBtn) {
      e.stopPropagation();
      const targetId = copyBtn.dataset.target;
      const codeEl = document.getElementById(targetId);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>';
          showToast('Copied');
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
          }, 2000);
        }).catch(() => showToast('Copy failed'));
      }
    }
  });

  const closeBtn = $('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(s));

  const shareBtn = $('modal-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (!s.modalId) return;
      const url = `${location.origin}${location.pathname}#${s.modalId}`;
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copied'))
        .catch(() => showToast('Copy failed'));
    });
  }
}

function bindHash(s) {
  const hash = location.hash.slice(1);
  if (hash) {
    requestAnimationFrame(() => openModal(s, hash));
  }

  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (h) {
      openModal(s, h);
    } else {
      closeModal(s);
    }
  });
}

function bindReset(s) {
  const resetBtn = $('reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      s.searchQuery = '';
      s.activeCategory = '';
      s.activeTool = '';
      const si = $('search-input');
      if (si) si.value = '';
      document.querySelectorAll('.dropdown-value').forEach(el => { el.textContent = 'All'; });
      render(s);
    });
  }
}

function openModal(s, id, trigger = null) {
  const t = tutorials.find(x => x.id === id);
  if (!t) return;

  modalTrigger = trigger;
  s.modalId = id;
  scrollMarked = false;
  history.replaceState(null, '', `#${id}`);
  renderModal(s);

  requestAnimationFrame(() => {
    const closeBtn = $('modal-close');
    if (closeBtn) closeBtn.focus();
    requestAnimationFrame(() => { scrollMarked = true; });
  });
}

function closeModal(s) {
  s.modalId = null;
  history.replaceState(null, '', location.pathname);
  renderModal(s);
  if (modalTrigger) {
    modalTrigger.focus();
    modalTrigger = null;
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    dd.classList.remove('open');
    dd.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
}
