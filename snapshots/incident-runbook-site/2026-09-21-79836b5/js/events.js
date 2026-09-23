import { chapters } from './content/index.js';
import { state, matchingSectionIds } from './state.js';
import { chapterToMarkdown, copyText, toast } from './utils.js';
import { stepSection, setDrawer } from './nav.js';

function applyFilter(query) {
  state.query = query;
  const matches = matchingSectionIds(query);
  const count = document.getElementById('tocCount');

  document.querySelectorAll('.toc-sec').forEach(item => {
    const hit = !matches || matches.has(item.dataset.tocSection);
    item.hidden = !hit;
  });

  document.querySelectorAll('.toc-ch').forEach(chapter => {
    const visible = chapter.querySelectorAll('.toc-sec:not([hidden])').length;
    chapter.hidden = matches ? visible === 0 : false;
  });

  document.body.classList.toggle('is-filtering', Boolean(matches));

  if (!matches) {
    count.textContent = '';
    return;
  }
  count.textContent = matches.size === 0
    ? 'No sections match'
    : `${matches.size} section${matches.size === 1 ? '' : 's'}`;
}

function initSearch() {
  const input = document.getElementById('tocSearch');
  const clear = document.getElementById('tocClear');

  input.addEventListener('input', () => applyFilter(input.value.trim()));
  clear.addEventListener('click', () => {
    input.value = '';
    applyFilter('');
    input.focus();
  });
}

function initCopy() {
  document.getElementById('doc').addEventListener('click', async event => {
    const button = event.target.closest('[data-copy-chapter]');
    if (!button) return;
    const chapter = chapters.find(c => c.id === button.dataset.copyChapter);
    if (!chapter) return;
    const ok = await copyText(chapterToMarkdown(chapter));
    toast(ok ? 'Chapter copied as Markdown' : 'Copy blocked by the browser');
  });
}

function initShortcuts() {
  const panel = document.getElementById('shortcuts');
  const input = document.getElementById('tocSearch');

  const toggleHelp = force => {
    const open = force ?? panel.hidden;
    panel.hidden = !open;
  };

  document.getElementById('shortcutsToggle').addEventListener('click', () => toggleHelp());
  document.getElementById('shortcutsClose').addEventListener('click', () => toggleHelp(false));

  document.addEventListener('keydown', event => {
    const typing = event.target.matches('input, textarea, select');

    if (event.key === 'Escape') {
      if (!panel.hidden) return toggleHelp(false);
      if (state.drawerOpen) return setDrawer(false);
      if (typing) {
        event.target.value = '';
        applyFilter('');
        event.target.blur();
      }
      return;
    }

    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === '/') {
      event.preventDefault();
      setDrawer(true);
      input.focus();
      input.select();
    } else if (event.key === 'j') {
      event.preventDefault();
      stepSection(1);
    } else if (event.key === 'k') {
      event.preventDefault();
      stepSection(-1);
    } else if (event.key === '?') {
      event.preventDefault();
      toggleHelp();
    }
  });
}

export function initEvents() {
  initSearch();
  initCopy();
  initShortcuts();
}
