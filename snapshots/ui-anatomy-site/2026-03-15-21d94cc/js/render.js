import { state } from './state.js';
import { COMPONENTS, CATEGORIES, LAYOUT_COMPONENTS, LAYOUTS, HERO_BACKGROUNDS } from './data.js';
import { landingLayout, corporateLayout, startupLayout } from './layouts.js';
import { portfolioLayout, blogLayout, componentsLayout, loginLayout, ecommerceLayout, linkinbioLayout } from './layouts2.js';
import { agencyLayout, photographyLayout, magazineLayout, docsLayout, healthcareLayout } from './layouts3.js';
import { fortuneLayout, saasLayout, fintechLayout, gamingLayout } from './layouts4.js';
import { guildLayout } from './layouts5.js';

const LAYOUT_FNS = {
  landing:    landingLayout,
  corporate:  corporateLayout,
  startup:    startupLayout,
  portfolio:  portfolioLayout,
  blog:       blogLayout,
  components: componentsLayout,
  login:      loginLayout,
  linkinbio:  linkinbioLayout,
  fortune:    fortuneLayout,
  ecommerce:  ecommerceLayout,
  gaming:     gamingLayout,
  saas:       saasLayout,
  fintech:    fintechLayout,
  agency:     agencyLayout,
  photography: photographyLayout,
  magazine:   magazineLayout,
  docs:       docsLayout,
  healthcare: healthcareLayout,
  guild:      guildLayout,
};

// ── Layout navigation (dropdown categories) ───────────────────────────────────
export function renderLayoutNav() {
  const el = document.getElementById('layoutNav');

  // Show all layouts grouped by category
  const layoutsByCategory = {};
  LAYOUTS.forEach(layout => {
    if (!layoutsByCategory[layout.category]) {
      layoutsByCategory[layout.category] = [];
    }
    layoutsByCategory[layout.category].push(layout);
  });

  const activeLayout = LAYOUTS.find(l => l.id === state.activeLayout);

  el.innerHTML = Object.entries(layoutsByCategory).map(([catId, layouts]) => {
    const catLabel = catId === 'basic' ? 'Basic Types' : 'Industry Layouts';
    const buttonLabel = activeLayout?.category === catId ? activeLayout.label : catLabel;
    const isActive = activeLayout?.category === catId;

    return `
      <div class="layout-dropdown">
        <button class="layout-dropdown-btn ${isActive ? 'active' : ''}" data-category="${catId}" aria-expanded="false">
          ${buttonLabel}
          <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
            <path fill="currentColor" d="M2 4l4 4 4-4"/>
          </svg>
        </button>
        <div class="layout-dropdown-menu" data-category="${catId}" role="menu">
          ${layouts.map(l => {
            return `
            <button class="layout-dropdown-item ${state.activeLayout === l.id ? 'active' : ''}"
                    data-layout="${l.id}" role="menuitemradio" aria-checked="${state.activeLayout === l.id}">
              ${l.label}
            </button>
          `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ── Wireframe mockup ──────────────────────────────────────────────────────────
export function renderMockup() {
  const frame = document.getElementById('mockupFrame');
  const fn = LAYOUT_FNS[state.activeLayout] || landingLayout;
  frame.innerHTML = fn({ dummy: state.dummyMode });
  if (state.outlinesOn) frame.classList.add('show-outlines');
  else frame.classList.remove('show-outlines');
  applyHeroBg();
}

// ── Hero background ───────────────────────────────────────────────────────────
export function applyHeroBg() {
  const heroEl = document.querySelector('#mockupFrame [data-comp="hero-section"]');
  if (!heroEl) return;
  heroEl.className = heroEl.className.replace(/\bbg-[\w-]+\b/g, '').trim();
  if (state.heroBg && state.heroBg !== 'solid') {
    heroEl.classList.add('bg-' + state.heroBg);
  }
}

// ── Hero BG swatch picker ─────────────────────────────────────────────────────
export function renderHeroBgPicker() {
  const el = document.getElementById('heroBgPicker');
  if (!el) return;
  el.innerHTML = HERO_BACKGROUNDS.map(bg => {
    const isGrad = bg.swatch.startsWith('linear-gradient');
    const isImg  = bg.swatch.startsWith('url(');
    const style  = isGrad ? `background:${bg.swatch}`
                 : isImg  ? `background:${bg.swatch} center/cover,#e5e7eb`
                 :          `background:${bg.swatch};border:1px solid #d1d5db`;
    return `<button class="hero-bg-swatch${state.heroBg === bg.id ? ' active' : ''}"
                    data-bg="${bg.id}" title="${bg.label}"
                    style="${style}"></button>`;
  }).join('');
}

// ── Component browser ─────────────────────────────────────────────────────────
export function renderBrowser() {
  const list = document.getElementById('browserList');
  const q = state.searchQuery.toLowerCase();
  const presentIds = new Set(LAYOUT_COMPONENTS[state.activeLayout] || []);

  const grouped = {};
  for (const [id, comp] of Object.entries(COMPONENTS)) {
    const show = !q || comp.name.toLowerCase().includes(q) || (comp.also || []).some(a => a.toLowerCase().includes(q));
    if (!show) continue;
    const cat = comp.category || 'content';
    if (!grouped[cat]) grouped[cat] = [];

    // Find which layouts have this component
    const foundIn = [];
    for (const [layoutId, compIds] of Object.entries(LAYOUT_COMPONENTS)) {
      if (compIds.includes(id)) foundIn.push(layoutId);
    }

    grouped[cat].push({ id, ...comp, present: presentIds.has(id), foundIn });
  }

  // Use grid layout when searching, list layout when not searching
  const isSearching = q.length > 0;
  if (isSearching) {
    list.classList.add('browser-grid');
  } else {
    list.classList.remove('browser-grid');
  }

  let html = '';
  for (const [catKey, catLabel] of Object.entries(CATEGORIES)) {
    const items = grouped[catKey];
    if (!items || items.length === 0) continue;

    // Show category header in both modes
    html += `<div class="browser-category">
      <div class="browser-category-label">${catLabel}</div>
    </div>`;

    // Add grid wrapper when searching
    if (isSearching) {
      html += `<div class="browser-grid-container">`;
    }

    for (const item of items) {
      const layoutHint = !item.present && item.foundIn.length > 0
        ? `\nClick to see in: ${item.foundIn.map(id => LAYOUTS.find(l => l.id === id)?.label).filter(Boolean).join(', ')}`
        : '';
      const title = (item.also ? 'Also: ' + item.also.join(', ') : '') + layoutHint;

      // Add badge when searching
      const badgeHtml = isSearching ? `<span class="browser-item-badge">${catLabel}</span>` : '';

      html += `<div class="browser-item${item.present ? '' : ' missing'}${state.activeComp === item.id ? ' active' : ''}${isSearching ? ' grid-item' : ''}"
                   data-comp-id="${item.id}"
                   data-found-in="${item.foundIn.join(',')}"
                   title="${title}">
        <div class="browser-dot"></div>
        ${item.name}
        ${!item.present && item.foundIn.length > 0 ? '<span class="browser-switch-hint">→</span>' : ''}
        ${badgeHtml}
      </div>`;
    }

    // Close grid wrapper when searching
    if (isSearching) {
      html += `</div>`;
    }
  }
  list.innerHTML = html || '<div style="padding:16px 12px;font-size:0.8rem;color:var(--text-muted)">No components match.</div>';
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export function showTooltip(compId, triggerEl) {
  const comp = COMPONENTS[compId];
  const tt = document.getElementById('tooltip');
  if (!comp) { tt.classList.add('hidden'); return; }

  document.getElementById('ttName').textContent = comp.name;
  document.getElementById('ttCategory').textContent = CATEGORIES[comp.category] || comp.category;
  document.getElementById('ttAlso').textContent = comp.also?.length ? 'Also: ' + comp.also.join(', ') : '';
  document.getElementById('ttDesc').textContent = comp.desc;

  const varWrap = document.getElementById('ttVariantsWrap');
  const varEl = document.getElementById('ttVariants');
  if (comp.variants?.length) {
    varEl.innerHTML = comp.variants.map(v => `<span class="tt-variant-pill">${v}</span>`).join('');
    varWrap.style.display = '';
  } else {
    varWrap.style.display = 'none';
  }

  const tipWrap = document.getElementById('ttTipWrap');
  const tipEl = document.getElementById('ttTip');
  if (comp.tip) {
    tipEl.textContent = comp.tip;
    tipWrap.style.display = '';
  } else {
    tipWrap.style.display = 'none';
  }

  // Frameworks section
  const fwWrap = document.getElementById('ttFrameworksWrap');
  const fwEl = document.getElementById('ttFrameworks');
  if (comp.frameworks?.length) {
    fwEl.innerHTML = comp.frameworks.map(fw => `<span class="tt-framework-pill">${fw}</span>`).join('');
    fwWrap.style.display = '';
  } else {
    fwWrap.style.display = 'none';
  }

  tt.classList.remove('hidden');

  // Add pinned indicator if this component is pinned
  if (state.pinnedComp === compId) {
    tt.classList.add('pinned');
  } else {
    tt.classList.remove('pinned');
  }

  positionTooltip(tt, triggerEl);
}

export function hideTooltip() {
  const tt = document.getElementById('tooltip');
  if (!tt) return;
  // Don't hide if tooltip is pinned
  if (state.pinnedComp !== null) return;
  tt.classList.add('hidden');
  tt.classList.remove('pinned');
}

export function togglePinTooltip(compId) {
  const tt = document.getElementById('tooltip');
  if (state.pinnedComp === compId) {
    // Unpin if clicking the same component
    state.pinnedComp = null;
    tt.classList.remove('pinned');
    hideTooltip();
  } else {
    // Pin the new component
    state.pinnedComp = compId;
    tt.classList.add('pinned');
  }
  renderBrowser();
}

function positionTooltip(tt, triggerEl) {
  if (!triggerEl) return;
  const rect = triggerEl.getBoundingClientRect();
  const ttW = 300;
  const ttH = tt.offsetHeight || 300;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 12;

  let left = rect.right + gap;
  let top  = rect.top;

  if (left + ttW > vw - 8) left = rect.left - ttW - gap;
  if (top + ttH > vh - 8)  top  = vh - ttH - 8;
  if (top < 8) top = 8;

  tt.style.left = Math.max(8, left) + 'px';
  tt.style.top  = top + 'px';
}

// ── Highlight browser item matching active comp ───────────────────────────────
export function syncBrowserHighlight(compId) {
  document.querySelectorAll('.browser-item').forEach(el => {
    const isActive = el.dataset.compId === compId;
    const isPinned = el.dataset.compId === state.pinnedComp;
    el.classList.toggle('active', isActive);
    el.classList.toggle('pinned', isPinned);
  });
}


