// ── Post page logic ────────────────────────────────────────────
import { state, loadSaved } from './state.js';
import { setupLangToggle } from './events.js';
import { escHtml } from './utils.js';
import {
  setDocumentLang,
  findSlugContext,
  renderBreadcrumbs,
  renderPostMeta,
  renderSeriesOutline,
  mountReadingProgress,
  mountBackToTop,
  mountMobileToc,
  syncMobileToc,
  countWordsFromMarkdown,
} from './reading.js';

const params = new URLSearchParams(location.search);
const slug = params.get('slug');

let postsData = null;
let slugContext = null;

async function fetchMarkdown(lang) {
  const res = await fetch(`/docs/${slug}.${lang}.md`);
  if (!res.ok) throw new Error(res.status);
  return res.text();
}

/** Strip the first h1 and optional bold subtitle line — both are shown in the page header. */
function stripLeadingMeta(md) {
  return md
    .replace(/^# [^\n]+\n/, '')
    .replace(/^\n+/, '')
    .replace(/^\*\*[^\n]+\*\*\n/, '')
    .replace(/^\n+/, '');
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

function smoothScrollToHash(hash) {
  if (!hash) return;
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }
}

async function renderPost(lang) {
  const el = document.getElementById('post-content');
  if (!el) return;
  el.innerHTML = '<div class="post-loading"><div class="skeleton" style="height:24px;width:60%;margin-bottom:12px"></div><div class="skeleton" style="height:16px;width:90%;margin-bottom:8px"></div><div class="skeleton" style="height:16px;width:80%"></div></div>';

  let md = '';
  try {
    md = await fetchMarkdown(lang);
  } catch {
    const fallback = lang === 'es' ? 'en' : 'es';
    try {
      md = await fetchMarkdown(fallback);
    } catch {
      el.innerHTML = '<p class="load-error">Post not found.</p>';
      return;
    }
  }

  el.innerHTML = window.marked.parse(stripLeadingMeta(md));

  const meta = postsData?.slugMeta?.[slug];
  renderPostMeta(meta, lang, countWordsFromMarkdown(md));

  buildToc(lang);
  styleRoleCards();

  if (location.hash) {
    requestAnimationFrame(() => smoothScrollToHash(location.hash));
  }
}

function buildToc(lang) {
  const content = document.getElementById('post-content');
  const tocEl = document.getElementById('post-toc');
  const tocColumn = document.getElementById('post-toc-column');
  const mobileToggle = document.getElementById('toc-mobile-toggle');
  if (!content || !tocEl) return;

  const headings = Array.from(content.querySelectorAll('h2'));
  if (headings.length < 2) {
    tocColumn?.classList.add('toc-hidden');
    mobileToggle?.classList.add('hidden');
    return;
  }
  tocColumn?.classList.remove('toc-hidden');
  mobileToggle?.classList.remove('hidden');

  headings.forEach((h, i) => {
    h.id = `section-${i}`;
  });

  const tocHeading = lang === 'es' ? 'Contenido' : 'Contents';
  const items = headings.map(h => {
    const label = h.textContent.split(/\s[—–]\s/)[0].trim();
    return `<a class="toc-link" href="#${h.id}">${escHtml(label)}</a>`;
  }).join('');
  tocEl.innerHTML = `<p class="toc-label">${tocHeading}</p>${items}`;
  syncMobileToc();

  document.getElementById('post-toc-mobile')?.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      smoothScrollToHash(link.getAttribute('href'));
    });
  });

  tocEl.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      smoothScrollToHash(link.getAttribute('href'));
    });
  });

  const bannerEl = document.getElementById('post-hero-banner');
  if (bannerEl && tocColumn) {
    const bannerWatcher = new IntersectionObserver(
      ([entry]) => tocColumn.classList.toggle('toc-active', !entry.isIntersecting),
      { threshold: 0 }
    );
    bannerWatcher.observe(bannerEl);
  } else {
    tocColumn?.classList.add('toc-active');
  }

  const headingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      document.querySelectorAll(`.toc-link[href="#${id}"]`).forEach(link => {
        link.classList.toggle('active', entry.isIntersecting);
      });
    });
  }, { rootMargin: '-88px 0px -70% 0px' });

  headings.forEach(h => headingObserver.observe(h));
}

function styleRoleCards() {
  const content = document.getElementById('post-content');
  if (!content) return;

  const paragraphs = Array.from(content.querySelectorAll('p'));
  let group = [];

  const flushGroup = () => {
    if (group.length < 1) return;
    const card = document.createElement('div');
    card.className = 'role-card';
    group[0].parentNode.insertBefore(card, group[0]);
    group.forEach(p => card.appendChild(p));
    group = [];
  };

  paragraphs.forEach(p => {
    const first = p.firstElementChild;
    if (first?.tagName === 'STRONG' && first.textContent.trim().endsWith(':')) {
      group.push(p);
    } else {
      flushGroup();
    }
  });
  flushGroup();
}

function renderSeriesNav(meta, lang) {
  const html = buildSeriesNavHtml(meta, lang);
  ['series-nav', 'series-nav-bottom'].forEach(id => {
    const nav = document.getElementById(id);
    if (!nav) return;
    nav.classList.remove('hidden');
    nav.innerHTML = html;
  });
}

function buildSeriesNavHtml(meta, lang) {
  const prev = meta.prevSlug;
  const next = meta.nextSlug;
  const isEs = lang === 'es';
  return `
    <div class="series-progress">
      <span class="series-progress-label">${escHtml(meta.seriesTitle?.[lang] || '')}</span>
      <span class="series-progress-part">${isEs ? 'Parte' : 'Part'} ${meta.part} ${isEs ? 'de' : 'of'} ${meta.total}</span>
    </div>
    <div class="series-buttons">
      ${prev
        ? `<a href="/post/?slug=${prev}" class="nav-btn">← ${isEs ? 'Anterior' : 'Previous'}</a>`
        : '<span class="nav-btn-placeholder"></span>'}
      <a href="/" class="nav-btn nav-btn--home">${isEs ? 'Inicio' : 'Home'}</a>
      ${next
        ? `<a href="/post/?slug=${next}" class="nav-btn nav-btn--next">${isEs ? 'Siguiente' : 'Next'} →</a>`
        : '<span class="nav-btn-placeholder"></span>'}
    </div>`;
}

function applyMeta(meta, lang) {
  const titleEl = document.getElementById('post-title');
  const subtitleEl = document.getElementById('post-subtitle');
  const bannerEl = document.getElementById('post-banner');
  if (titleEl) titleEl.textContent = meta.title?.[lang] || meta.title?.es || slug;
  if (subtitleEl) subtitleEl.textContent = meta.subtitle?.[lang] || meta.subtitle?.es || '';
  if (bannerEl && meta.banner) {
    bannerEl.src = meta.banner;
    bannerEl.alt = meta.title?.[lang] || '';
    bannerEl.onerror = () => bannerEl.closest('.post-hero-banner')?.classList.add('no-image');
  }
  document.title = `${meta.title?.[lang] || slug} — Playbook`;

  const desc = meta.subtitle?.[lang] || meta.subtitle?.es || '';
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = desc;
}

function refreshReadingChrome(lang) {
  cleanupReading();
  mountReadingProgress();
  mountBackToTop(lang);
  mountMobileToc(lang);
}

async function init() {
  if (!slug) { location.href = '/'; return; }

  loadSaved(state);
  setDocumentLang(state.lang);
  setupLangToggle();

  try {
    const res = await fetch('/data/posts.json');
    postsData = await res.json();
  } catch { /* non-fatal */ }

  slugContext = findSlugContext(postsData, slug);
  const meta = postsData?.slugMeta?.[slug];
  if (meta) {
    meta.slug = slug;
    applyMeta(meta, state.lang);
    renderBreadcrumbs(slugContext, meta, state.lang);
    renderSeriesOutline(slugContext, slug, state.lang);
    if (meta.series) renderSeriesNav(meta, state.lang);
  }

  await renderPost(state.lang);
  refreshReadingChrome(state.lang);
}

document.addEventListener('langchange', async ({ detail }) => {
  setDocumentLang(detail.lang);

  try {
    const res = await fetch('/data/posts.json');
    postsData = await res.json();
  } catch { /* non-fatal */ }

  slugContext = findSlugContext(postsData, slug);
  const meta = postsData?.slugMeta?.[slug];
  if (meta) {
    meta.slug = slug;
    applyMeta(meta, detail.lang);
    renderBreadcrumbs(slugContext, meta, detail.lang);
    renderSeriesOutline(slugContext, slug, detail.lang);
    if (meta.series) renderSeriesNav(meta, detail.lang);
  }

  await renderPost(detail.lang);
  refreshReadingChrome(detail.lang);
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
});

init();
