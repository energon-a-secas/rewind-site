import { state } from './state.js';
import { render } from './render.js';
import { debounce } from './utils.js';

export function bindEvents() {
  const search = document.getElementById('searchInput');
  const clear = document.getElementById('clearSearch');
  const pills = document.getElementById('listPills');

  if (search) {
    search.addEventListener(
      'input',
      debounce(() => {
        state.query = search.value;
        render();
      }, 120)
    );
  }

  if (clear && search) {
    clear.addEventListener('click', () => {
      search.value = '';
      state.query = '';
      render();
      search.focus();
    });
  }

  if (pills) {
    pills.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-list]');
      if (!btn) return;
      state.activeListId = btn.getAttribute('data-list') || '';
      render();
    });
  }
}
