/**
 * Runs on generated tutorial pages only. Deliberately imports nothing from
 * the content modules — a reader page should carry its own text and little
 * else. Progress uses the same localStorage key as the app shell, so marking
 * something done here shows up over there.
 */

import { copyText, showToast } from './utils.js';
import { bindPaletteShortcuts } from './palette.js';

const PROGRESS_KEY = 'agentlore-completed';

function readProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeProgress(set) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
  } catch {
    /* private browsing or quota */
  }
}

function syncDoneButton(button, done) {
  button.classList.toggle('is-done', done);
  button.setAttribute('aria-pressed', String(done));
  button.querySelector('.done-label').textContent = done ? 'Completed' : 'Mark complete';
}

function initProgress(id) {
  const button = document.getElementById('mark-done');
  if (!button) return;

  const progress = readProgress();
  syncDoneButton(button, progress.has(id));

  button.addEventListener('click', () => {
    const current = readProgress();
    if (current.has(id)) current.delete(id);
    else current.add(id);
    writeProgress(current);
    syncDoneButton(button, current.has(id));
    showToast(current.has(id) ? 'Marked complete' : 'Marked incomplete');
  });

  let autoMarked = false;
  const onScroll = () => {
    if (autoMarked) return;
    const article = document.querySelector('.reader-body');
    if (!article) return;
    if (article.getBoundingClientRect().bottom > window.innerHeight + 80) return;
    autoMarked = true;
    const current = readProgress();
    if (current.has(id)) return;
    current.add(id);
    writeProgress(current);
    syncDoneButton(button, true);
    showToast('Marked complete');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/** Highlights the outline entry for whichever heading you are reading. */
function initOutline() {
  const links = [...document.querySelectorAll('.outline-link')];
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map(l => [l.getAttribute('href').slice(1), l]));
  const headings = [...byId.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if (!headings.length) return;

  const visible = new Set();
  const observer = new IntersectionObserver((records) => {
    for (const record of records) {
      if (record.isIntersecting) visible.add(record.target.id);
      else visible.delete(record.target.id);
    }
    const first = headings.find(h => visible.has(h.id));
    for (const link of links) link.classList.remove('active');
    if (first) byId.get(first.id)?.classList.add('active');
  }, { rootMargin: '-80px 0px -70% 0px' });

  for (const heading of headings) observer.observe(heading);
}

function initCopy() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-target]');
    if (!button) return;
    const pre = document.getElementById(button.dataset.target);
    if (!pre) return;
    copyText(pre.textContent).then(ok => showToast(ok ? 'Copied' : 'Copy failed'));
    button.classList.add('copied');
    setTimeout(() => button.classList.remove('copied'), 1400);
  });
}

function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

    if (e.key === 'ArrowLeft' || e.key === 'k') {
      const prev = document.querySelector('[data-nav="prev"]');
      if (prev) { e.preventDefault(); location.href = prev.href; }
    }
    if (e.key === 'ArrowRight' || e.key === 'j') {
      const next = document.querySelector('[data-nav="next"]');
      if (next) { e.preventDefault(); location.href = next.href; }
    }
  });
}

const id = document.body.dataset.tutorial;
if (id) initProgress(id);
initOutline();
initCopy();
initKeyboardNav();
bindPaletteShortcuts();
