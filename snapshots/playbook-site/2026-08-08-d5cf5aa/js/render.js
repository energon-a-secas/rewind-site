// ── Render ────────────────────────────────────────────────────
import { escHtml, slugify } from './utils.js';

/** Render all cards into #posts-grid grouped as section columns. */
export function renderCards(cards, lang) {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  // Group cards into columns by category
  const columns = [];
  let current = null;

  for (const card of cards) {
    const cat = card.category;
    const label = cat ? escHtml(cat[lang] || cat.es) : null;

    if (!current || (label && label !== current.label)) {
      current = { label, cards: [] };
      columns.push(current);
    }
    current.cards.push(card);
  }

  grid.innerHTML = columns.map(col => {
    const header = col.label
      ? `<div class="section-divider" role="presentation">
          <span class="section-divider-label">${col.label}</span>
        </div>`
      : '';
    const cardHtml = col.cards.map(card =>
      card.type === 'series' ? renderSeriesCard(card, lang) : renderPostCard(card, lang)
    ).join('');
    const catKey = col.cards[0]?.category?.es;
    const sectionId = catKey ? `section-${slugify(catKey)}` : '';
    const idAttr = sectionId ? ` id="${sectionId}"` : '';
    return `<div class="section-column"${idAttr}>${header}<div class="section-cards">${cardHtml}</div></div>`;
  }).join('');
}

/** Render hero topic pills with hover preview into #hero-topics. */
export function renderHeroTopics(cards, lang) {
  const container = document.getElementById('hero-topics');
  if (!container) return;

  container.innerHTML = cards.map(card => {
    const cat    = card.category ? escHtml(card.category[lang] || card.category.es) : '';
    const title  = escHtml(card.title[lang] || card.title.es);
    const excerpt = card.excerpt ? escHtml(card.excerpt[lang] || card.excerpt.es) : '';
    const postUrl = card.type === 'series'
      ? `/post/?slug=${card.parts[0].slug}`
      : `/post/?slug=${card.slug}`;
    const sectionAnchor = card.category?.es
      ? `/#section-${slugify(card.category.es)}`
      : postUrl;
    const url = sectionAnchor;

    return `
      <a href="${url}" class="hero-topic" aria-label="${cat}">
        <span class="hero-topic-cat">${cat}</span>
        <span class="hero-topic-arrow" aria-hidden="true">→</span>
        <div class="hero-topic-preview" role="tooltip" aria-hidden="true">
          <p class="hero-preview-title">${title}</p>
          ${excerpt ? `<p class="hero-preview-excerpt">${excerpt}</p>` : ''}
        </div>
      </a>`;
  }).join('');
}

function renderPostCard(card, lang) {
  const title = escHtml(card.title[lang] || card.title.es);
  const subtitle = escHtml(card.subtitle[lang] || card.subtitle.es);
  const excerpt = card.excerpt ? escHtml(card.excerpt[lang] || card.excerpt.es) : '';
  const url = `/post/?slug=${card.slug}`;
  return `
    <article class="post-card" aria-label="${title}">
      <div class="post-card-banner">
        <img src="${escHtml(card.banner)}" alt="${title}" loading="lazy"
             onerror="this.closest('.post-card-banner').classList.add('no-image')">
        <div class="post-card-banner-overlay"></div>
      </div>
      <div class="post-card-body">
        <p class="post-card-date">${escHtml(card.date)}</p>
        <h2 class="post-card-title">
          <a href="${url}" class="post-card-title-link">${title}</a>
        </h2>
        <p class="post-card-subtitle">${subtitle}</p>
        ${excerpt ? `<p class="post-card-excerpt">${excerpt}</p>` : ''}
        <span class="btn-read" aria-hidden="true">
          ${lang === 'es' ? 'Leer' : 'Read'} →
        </span>
      </div>
    </article>`;
}

function renderSeriesCard(card, lang) {
  const title = escHtml(card.title[lang] || card.title.es);
  const subtitle = escHtml(card.subtitle[lang] || card.subtitle.es);
  const excerpt = card.excerpt ? escHtml(card.excerpt[lang] || card.excerpt.es) : '';
  const firstUrl = `/post/?slug=${card.parts[0].slug}`;
  const isEs = lang === 'es';
  const partCount = card.parts?.length || 0;
  const seriesBadge = isEs
    ? `Serie · ${partCount} partes`
    : `Series · ${partCount} parts`;

  return `
    <article class="post-card post-card--series" aria-label="${title}">
      <div class="post-card-banner">
        <span class="series-badge">${escHtml(seriesBadge)}</span>
        <img src="${escHtml(card.banner)}" alt="${title}" loading="lazy"
             onerror="this.closest('.post-card-banner').classList.add('no-image')">
        <div class="post-card-banner-overlay"></div>
      </div>
      <div class="post-card-body">
        <p class="post-card-date">${escHtml(card.date)}</p>
        <h2 class="post-card-title">
          <a href="${firstUrl}" class="post-card-title-link">${title}</a>
        </h2>
        <p class="post-card-subtitle">${subtitle}</p>
        ${excerpt ? `<p class="post-card-excerpt">${excerpt}</p>` : ''}
        <span class="btn-read" aria-hidden="true">${isEs ? 'Leer serie' : 'Read series'} →</span>
      </div>
    </article>`;
}
