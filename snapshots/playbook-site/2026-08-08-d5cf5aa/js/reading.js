// ── Reading UX: progress, TOC, breadcrumbs, meta ─────────────
import { escHtml, readTime } from './utils.js';

/** Sync <html lang> with active locale. */
export function setDocumentLang(lang) {
  document.documentElement.lang = lang === 'en' ? 'en' : 'es';
}

/** Find card/series context for a post slug. */
export function findSlugContext(postsData, slug) {
  if (!postsData?.cards) return null;
  for (const card of postsData.cards) {
    if (card.type === 'post' && card.slug === slug) {
      return { card, category: card.category, kind: 'post' };
    }
    if (card.type === 'series') {
      const idx = card.parts.findIndex(p => p.slug === slug);
      if (idx >= 0) {
        return { card, category: card.category, kind: 'series', partIndex: idx };
      }
    }
  }
  return null;
}

export function renderBreadcrumbs(ctx, meta, lang) {
  const nav = document.getElementById('post-breadcrumbs');
  if (!nav) return;

  const home = lang === 'es' ? 'Inicio' : 'Home';
  const cat = ctx?.category ? escHtml(ctx.category[lang] || ctx.category.es) : '';
  const title = escHtml(meta?.title?.[lang] || meta?.title?.es || '');

  let trail = `<a href="/">${home}</a>`;
  if (cat) trail += `<span class="crumb-sep" aria-hidden="true">/</span><span class="crumb-muted">${cat}</span>`;
  if (title) trail += `<span class="crumb-sep" aria-hidden="true">/</span><span class="crumb-current" aria-current="page">${title}</span>`;

  nav.innerHTML = trail;
}

export function renderPostMeta(meta, lang, wordCount) {
  const el = document.getElementById('post-meta');
  if (!el) return;

  const mins = readTime(' '.repeat(Math.max(wordCount, 1)));
  const minLabel = lang === 'es'
    ? `${mins} min de lectura`
    : `${mins} min read`;

  const date = meta?.date ? `<span class="post-meta-item">${escHtml(meta.date)}</span>` : '';
  const part = meta?.series && meta.part
    ? `<span class="post-meta-item">${lang === 'es' ? 'Parte' : 'Part'} ${meta.part}/${meta.total}</span>`
    : '';

  el.innerHTML = `${date}${part}<span class="post-meta-item post-meta-read">${minLabel}</span>`;
}

/** Series: jump list of all parts with current highlighted. */
export function renderSeriesOutline(ctx, slug, lang) {
  const wrap = document.getElementById('series-outline');
  if (!wrap || ctx?.kind !== 'series' || !ctx.card?.parts) {
    wrap?.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');

  const heading = lang === 'es' ? 'En esta serie' : 'In this series';
  const items = ctx.card.parts.map((p, i) => {
    const label = escHtml(p.label[lang] || p.label.es);
    const topic = label.replace(/^(Parte|Part)\s+\d+[:\s–—]+/i, '');
    const isCurrent = p.slug === slug;
    const cls = isCurrent ? 'series-outline-link is-current' : 'series-outline-link';
    const aria = isCurrent ? ' aria-current="page"' : '';
    return `<li><a class="${cls}" href="/post/?slug=${escHtml(p.slug)}"${aria}>
      <span class="series-outline-num">${i + 1}</span>
      <span class="series-outline-label">${escHtml(topic)}</span>
    </a></li>`;
  }).join('');

  wrap.innerHTML = `
    <p class="series-outline-title">${heading}</p>
    <ol class="series-outline-list">${items}</ol>`;
}

export function mountReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return () => {};

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
  return () => window.removeEventListener('scroll', onScroll);
}

export function mountBackToTop(lang) {
  const btn = document.getElementById('back-to-top');
  if (!btn) return () => {};

  btn.setAttribute('aria-label', lang === 'es' ? 'Volver arriba' : 'Back to top');

  const toggle = () => {
    btn.classList.toggle('visible', window.scrollY > 480);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  toggle();
  return () => window.removeEventListener('scroll', toggle);
}

export function mountMobileToc(lang) {
  const toggle = document.getElementById('toc-mobile-toggle');
  const panel = document.getElementById('toc-mobile-panel');
  const backdrop = document.getElementById('toc-mobile-backdrop');
  if (!toggle || !panel) return () => {};

  const openLabel = lang === 'es' ? 'Contenido' : 'Contents';
  const closeLabel = lang === 'es' ? 'Cerrar contenido' : 'Close contents';
  toggle.textContent = openLabel;

  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
    panel.classList.toggle('open', open);
    backdrop?.classList.toggle('open', open);
    document.body.classList.toggle('toc-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  backdrop?.addEventListener('click', () => setOpen(false));
  panel.addEventListener('click', e => {
    if (e.target.closest('.toc-link')) setOpen(false);
  });

  return () => setOpen(false);
}

/** Clone desktop TOC links into mobile panel. */
export function syncMobileToc() {
  const desktop = document.getElementById('post-toc');
  const mobile = document.getElementById('post-toc-mobile');
  if (!desktop || !mobile) return;
  mobile.innerHTML = desktop.innerHTML;
}

export function countWordsFromMarkdown(md) {
  return md.replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_\-\[\]()!`]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
