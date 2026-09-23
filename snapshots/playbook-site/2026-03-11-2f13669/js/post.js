// ── Post page logic ────────────────────────────────────────────
import { state, loadSaved, save } from './state.js';
import { setupLangToggle } from './events.js';
import { escHtml } from './utils.js';

const params = new URLSearchParams(location.search);
const slug = params.get('slug');

async function fetchMarkdown(lang) {
  const res = await fetch(`/docs/${slug}.${lang}.md`);
  if (!res.ok) throw new Error(res.status);
  return res.text();
}

/** Strip the first h1 and optional bold subtitle line — both are shown in the page header. */
function stripLeadingMeta(md) {
  return md
    .replace(/^# [^\n]+\n/, '')       // remove first # heading
    .replace(/^\n+/, '')               // remove leading blank lines
    .replace(/^\*\*[^\n]+\*\*\n/, '') // remove first **bold-only** subtitle line
    .replace(/^\n+/, '');              // remove leading blank lines again
}

async function renderPost(lang) {
  const el = document.getElementById('post-content');
  if (!el) return;
  el.innerHTML = '<div class="post-loading"><div class="skeleton" style="height:24px;width:60%;margin-bottom:12px"></div><div class="skeleton" style="height:16px;width:90%;margin-bottom:8px"></div><div class="skeleton" style="height:16px;width:80%"></div></div>';
  try {
    const md = await fetchMarkdown(lang);
    el.innerHTML = window.marked.parse(stripLeadingMeta(md));
  } catch {
    const fallback = lang === 'es' ? 'en' : 'es';
    try {
      const md = await fetchMarkdown(fallback);
      el.innerHTML = window.marked.parse(stripLeadingMeta(md));
    } catch {
      el.innerHTML = '<p class="load-error">Post not found.</p>';
    }
  }
  buildToc(lang);
  styleRoleCards();
}

function buildToc(lang) {
  const content = document.getElementById('post-content');
  const tocEl = document.getElementById('post-toc');
  const tocColumn = document.getElementById('post-toc-column');
  if (!content || !tocEl) return;

  const headings = Array.from(content.querySelectorAll('h2'));
  if (headings.length < 2) {
    tocColumn?.classList.add('toc-hidden');
    return;
  }
  tocColumn?.classList.remove('toc-hidden');

  headings.forEach((h, i) => {
    h.id = `section-${i}`;
  });

  const tocHeading = lang === 'es' ? 'Contenido' : 'Contents';
  const items = headings.map(h => {
    const label = h.textContent.split(/\s[—–]\s/)[0].trim();
    return `<a class="toc-link" href="#${h.id}">${escHtml(label)}</a>`;
  }).join('');
  tocEl.innerHTML = `<p class="toc-label">${tocHeading}</p>${items}`;

  // Show TOC only after the banner scrolls out of view
  const bannerEl = document.getElementById('post-hero-banner');
  if (bannerEl) {
    const bannerWatcher = new IntersectionObserver(
      ([entry]) => tocColumn.classList.toggle('toc-active', !entry.isIntersecting),
      { threshold: 0 }
    );
    bannerWatcher.observe(bannerEl);
  } else {
    tocColumn.classList.add('toc-active');
  }

  // Scroll-based active highlight
  const headingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = tocEl.querySelector(`[href="#${id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { rootMargin: '-68px 0px -70% 0px' });

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
    // Match paragraphs that start with <strong>Label:</strong>
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
}

async function init() {
  if (!slug) { location.href = '/'; return; }

  loadSaved(state);
  setupLangToggle();

  let postsData = null;
  try {
    const res = await fetch('/data/posts.json');
    postsData = await res.json();
  } catch { /* non-fatal */ }

  const meta = postsData?.slugMeta?.[slug];
  if (meta) applyMeta(meta, state.lang);

  await renderPost(state.lang);

  if (meta?.series) renderSeriesNav(meta, state.lang);
}

document.addEventListener('langchange', async ({ detail }) => {
  let postsData = null;
  try {
    const res = await fetch('/data/posts.json');
    postsData = await res.json();
  } catch { /* non-fatal */ }
  const meta = postsData?.slugMeta?.[slug];
  if (meta) applyMeta(meta, detail.lang);
  await renderPost(detail.lang);
  if (meta?.series) renderSeriesNav(meta, detail.lang);
  // Scroll to top on lang change so user starts from beginning
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

init();
