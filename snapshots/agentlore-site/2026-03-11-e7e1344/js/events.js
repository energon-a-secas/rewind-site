import { state, toggleCompleted, markCompleted } from './state.js';
import { render, renderModal, renderLearningPath } from './render.js';
import { $, showToast, debounce } from './utils.js';

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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && s.modalId) closeModal(s);
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
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !s.modalId && document.activeElement !== searchInput) {
      e.preventDefault();
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
      return;
    }

    closeAllDropdowns();
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
      openModal(s, card.dataset.id);
      return;
    }

    const pathBody = e.target.closest('.path-step-body');
    if (pathBody) {
      openModal(s, pathBody.dataset.id);
      return;
    }
  });
}

function bindModal(s) {
  const overlay = $('tutorial-modal');
  if (!overlay) return;

  overlay.addEventListener('scroll', debounce(() => {
    if (!s.modalId || s.completed.has(s.modalId)) return;
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
          copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          showToast('Copied');
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
          }, 2000);
        });
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
      navigator.clipboard.writeText(url).then(() => showToast('Link copied'));
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

function openModal(s, id) {
  s.modalId = id;
  history.replaceState(null, '', `#${id}`);
  renderModal(s);
}

function closeModal(s) {
  s.modalId = null;
  history.replaceState(null, '', location.pathname);
  renderModal(s);
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    dd.classList.remove('open');
    dd.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
}
