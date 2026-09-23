// ── DOM rendering ────────────────────────────────────────────
import { state } from './state.js';
import { guides, categories } from './guides.js';
import { ui, t } from './i18n.js';
import { $, escHtml, md } from './utils.js';

const ICONS = {
  apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
  gmail: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10a6 6 0 10-1.45 2.9l2.8 2.8V18h3v2h2v-3.1L21 14.9V12h-5.35zM7 12a2 2 0 110-4 2 2 0 010 4z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>',
  android: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0012 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 006 7h12c0-2.12-1.1-3.98-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  sim: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.99 4c0-1.1-.89-2-1.99-2h-8L4 8v12c0 1.1.9 2 2 2h12.01c1.1 0 1.99-.9 1.99-2l-.01-16zM9 19H7v-2h2v2zm8 0h-2v-2h2v2zm-8-4H7v-4h2v4zm4 4h-2v-4h2v4zm0-6h-2v-2h2v2zm4 2h-2v-4h2v4z"/></svg>',
  hook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
  backup: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
  credit: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  estate: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
};

const CAT_COLORS = {
  apple: '#a78bfa',
  google: '#34d399',
  passwords: '#fbbf24',
  mobile: '#f472b6',
  browser: '#fb923c',
  network: '#22d3ee',
  data: '#38bdf8',
  travel: '#a3e635',
};

export function render() {
  $('siteTitle').textContent = t(ui.siteTitle, state.lang);
  $('siteSubtitle').textContent = t(ui.siteSubtitle, state.lang);
  $('langToggle').textContent = state.lang === 'en' ? 'ES' : 'EN';
  document.documentElement.lang = state.lang;

  if (state.view === 'detail') {
    renderDetail();
  } else {
    renderList();
  }
}

function renderList() {
  $('listView').hidden = false;
  $('detailView').hidden = true;
  $('searchInput').placeholder = t(ui.searchPlaceholder, state.lang);

  renderCategoryPills();
  renderCards();
}

function renderCategoryPills() {
  const wrap = $('categoryPills');
  let html = `<button class="pill${!state.category ? ' active' : ''}" data-cat="">${t(ui.allCategories, state.lang)}</button>`;
  for (const cat of categories) {
    const color = CAT_COLORS[cat];
    const active = state.category === cat;
    html += `<button class="pill${active ? ' active' : ''}" data-cat="${cat}" style="--pill-color:${color}">${t(ui.categoryLabels[cat], state.lang)}</button>`;
  }
  wrap.innerHTML = html;
}

function renderCards() {
  const q = state.search.toLowerCase();
  const filtered = guides.filter(g => {
    if (state.category && g.category !== state.category) return false;
    if (q) {
      const title = t(g.title, state.lang).toLowerCase();
      const sub = t(g.subtitle, state.lang).toLowerCase();
      const body = g.sections.map(s => t(s.heading, state.lang)).join(' ').toLowerCase();
      if (!title.includes(q) && !sub.includes(q) && !body.includes(q)) return false;
    }
    return true;
  });

  const grid = $('guideGrid');
  if (!filtered.length) {
    grid.innerHTML = `<p class="no-results">${t(ui.noResults, state.lang)}</p>`;
    return;
  }

  grid.innerHTML = filtered.map(g => {
    const color = CAT_COLORS[g.category];
    return `<article class="guide-card" data-id="${g.id}" style="--card-accent:${color}">
      <div class="guide-card-icon">${ICONS[g.icon] || ''}</div>
      <div class="guide-card-body">
        <span class="guide-card-cat" style="color:${color}">${t(ui.categoryLabels[g.category], state.lang)}</span>
        <h2 class="guide-card-title">${escHtml(t(g.title, state.lang))}</h2>
        <p class="guide-card-sub">${escHtml(t(g.subtitle, state.lang))}</p>
        <div class="guide-card-meta">
          <span>${t(ui.lastUpdated, state.lang)} ${g.updated}</span>
          <span class="guide-card-sections">${g.sections.length} ${state.lang === 'en' ? 'sections' : 'secciones'}</span>
        </div>
      </div>
    </article>`;
  }).join('');
}

function renderDetail() {
  $('listView').hidden = true;
  $('detailView').hidden = false;

  const guide = guides.find(g => g.id === state.activeGuide);
  if (!guide) { state.view = 'list'; render(); return; }

  const color = CAT_COLORS[guide.category];
  const lang = state.lang;

  $('backBtn').innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg> ${t(ui.backToGuides, lang)}`;

  let tocHtml = `<h3>${t(ui.tableOfContents, lang)}</h3><ul>`;
  guide.sections.forEach((s, i) => {
    tocHtml += `<li><a href="#section-${i}">${escHtml(t(s.heading, lang))}</a></li>`;
  });
  tocHtml += '</ul>';
  $('guideToc').innerHTML = tocHtml;

  let bodyHtml = `<div class="guide-header" style="--card-accent:${color}">
    <div class="guide-header-icon">${ICONS[guide.icon] || ''}</div>
    <div>
      <span class="guide-cat-label" style="color:${color}">${t(ui.categoryLabels[guide.category], lang)}</span>
      <h1>${escHtml(t(guide.title, lang))}</h1>
      <p class="guide-subtitle">${escHtml(t(guide.subtitle, lang))}</p>
      <span class="guide-updated">${t(ui.lastUpdated, lang)} ${guide.updated}</span>
    </div>
  </div>`;

  guide.sections.forEach((s, i) => {
    bodyHtml += `<section class="guide-section" id="section-${i}">
      <h2>${escHtml(t(s.heading, lang))}</h2>`;

    if (s.paragraphs) {
      s.paragraphs.forEach(p => {
        bodyHtml += `<p>${md(t(p, lang))}</p>`;
      });
    }

    if (s.steps && s.steps.length) {
      bodyHtml += `<div class="steps-block"><span class="steps-label">${t(ui.stepsLabel, lang)}</span><ol>`;
      s.steps.forEach(step => {
        bodyHtml += `<li>${md(t(step, lang))}</li>`;
      });
      bodyHtml += '</ol></div>';
    }

    if (s.tip) {
      bodyHtml += `<div class="callout callout-tip"><span class="callout-label">${t(ui.tipLabel, lang)}</span><p>${md(t(s.tip, lang))}</p></div>`;
    }
    if (s.warning) {
      bodyHtml += `<div class="callout callout-warning"><span class="callout-label">${t(ui.warningLabel, lang)}</span><p>${md(t(s.warning, lang))}</p></div>`;
    }

    bodyHtml += '</section>';
  });

  $('guideBody').innerHTML = bodyHtml;
}
