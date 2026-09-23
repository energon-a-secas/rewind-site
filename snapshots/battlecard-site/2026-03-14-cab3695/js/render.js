import { state } from './state.js';
import { iconHtml, chromeIconHtml, ICONS, ACCENT_COLORS, THEMES } from './icons.js';
import { escHtml } from './utils.js';

export function renderAll() {
  renderTitle();
  renderGrid();
  renderThemePicker();
  applyTheme(state.theme || 'dark');
}

function renderTitle() {
  const el = document.getElementById('cardTitle');
  if (el && el !== document.activeElement) {
    el.textContent = state.title;
  }
  const counter = document.getElementById('colsCount');
  if (counter) counter.textContent = state.columns;
}

function renderGrid() {
  const grid = document.getElementById('sectionsGrid');
  if (!grid) return;
  grid.style.setProperty('--grid-cols', state.columns);
  grid.innerHTML = state.sections.map((sec, idx) => renderSection(sec, idx)).join('');
}

function renderSection(sec, idx) {
  const accent = sec.accentColor || '#0063e5';
  const colSpan = Math.min(sec.colSpan || 1, state.columns);
  const rowSpan = sec.rowSpan || 1;
  return `
    <div class="section-card"
      data-id="${sec.id}"
      data-idx="${idx}"
      draggable="true"
      style="--accent:${accent};grid-column:span ${colSpan};grid-row:span ${rowSpan};border-top:3px solid ${accent};"
    >
      <div class="section-controls">
        <button class="ctrl-btn" data-action="icon" data-id="${sec.id}" title="Icon &amp; Color">
          ${chromeIconHtml('palette', 13)}
        </button>
        <button class="ctrl-btn" data-action="layout" data-id="${sec.id}" title="Layout type">
          ${chromeIconHtml('layout-grid', 13)}
        </button>
        <div class="ctrl-span-group" title="Column span">
          <button class="ctrl-span-btn" data-action="span" data-axis="col" data-dir="-1" data-id="${sec.id}">−</button>
          <span class="ctrl-span-label">${colSpan}c</span>
          <button class="ctrl-span-btn" data-action="span" data-axis="col" data-dir="1" data-id="${sec.id}">+</button>
        </div>
        <div class="ctrl-span-group" title="Row span">
          <button class="ctrl-span-btn" data-action="span" data-axis="row" data-dir="-1" data-id="${sec.id}">−</button>
          <span class="ctrl-span-label">${rowSpan}r</span>
          <button class="ctrl-span-btn" data-action="span" data-axis="row" data-dir="1" data-id="${sec.id}">+</button>
        </div>
        <div class="ctrl-gap"></div>
        <button class="ctrl-btn ctrl-delete" data-action="delete" data-id="${sec.id}" title="Delete section">
          ${chromeIconHtml('trash-2', 13)}
        </button>
      </div>

      <div class="section-header">
        <div class="section-icon-wrap" data-action="icon" data-id="${sec.id}" title="Change icon &amp; color">
          ${iconHtml(sec.icon || 'technology', 16)}
        </div>
        <div
          class="section-title"
          contenteditable="true"
          spellcheck="false"
          data-field="title"
          data-id="${sec.id}"
        >${escHtml(sec.title)}</div>
      </div>

      <div class="section-body">
        ${renderBody(sec)}
      </div>
    </div>
  `;
}

function renderBody(sec) {
  const hasContent = sec.content && sec.content.trim();
  const hasSubs = sec.subsections && sec.subsections.length > 0;

  if (sec.layout === 'free') {
    return `<div class="section-content" contenteditable="true" spellcheck="false" data-field="content" data-id="${sec.id}">${escHtml(sec.content || '')}</div>`;
  }

  const intro = hasContent
    ? `<div class="section-intro" contenteditable="true" spellcheck="false" data-field="content" data-id="${sec.id}">${escHtml(sec.content)}</div>`
    : '';

  if (!hasSubs) {
    return `${intro}<div class="sub-empty"><button class="sub-add-btn" data-action="add-sub" data-id="${sec.id}">+ Add item</button></div>`;
  }

  if (sec.layout === 'numbered') return intro + renderNumbered(sec);
  if (sec.layout === 'columns')  return intro + renderColumns(sec);
  if (sec.layout === 'qa')       return intro + renderQA(sec);
  return intro;
}

function renderNumbered(sec) {
  return `<div class="sub-numbered">
    ${sec.subsections.map((sub, i) => `
      <div class="sub-num-col">
        <div class="sub-num-badge" style="border-color:var(--accent);color:var(--accent)">
          <span contenteditable="true" spellcheck="false" data-field="sub-title" data-id="${sec.id}" data-sub="${i}">${escHtml(sub.title)}</span>
        </div>
        <div class="sub-num-text" contenteditable="true" spellcheck="false" data-field="sub-content" data-id="${sec.id}" data-sub="${i}">${escHtml(sub.content)}</div>
        <button class="sub-remove-btn" data-action="remove-sub" data-id="${sec.id}" data-sub="${i}" title="Remove">×</button>
      </div>
    `).join('')}
    <button class="sub-add-btn" data-action="add-sub" data-id="${sec.id}">+</button>
  </div>`;
}

function renderColumns(sec) {
  return `<div class="sub-columns">
    ${sec.subsections.map((sub, i) => `
      <div class="sub-col-item">
        <div class="sub-col-title" contenteditable="true" spellcheck="false" data-field="sub-title" data-id="${sec.id}" data-sub="${i}">${escHtml(sub.title)}</div>
        <div class="sub-col-text" contenteditable="true" spellcheck="false" data-field="sub-content" data-id="${sec.id}" data-sub="${i}">${escHtml(sub.content)}</div>
        <button class="sub-remove-btn" data-action="remove-sub" data-id="${sec.id}" data-sub="${i}" title="Remove">×</button>
      </div>
    `).join('')}
    <button class="sub-add-btn" data-action="add-sub" data-id="${sec.id}">+</button>
  </div>`;
}

function renderQA(sec) {
  return `<div class="sub-qa">
    ${sec.subsections.map((sub, i) => `
      <div class="qa-item">
        <div class="qa-row qa-q-row">
          <span class="qa-label" style="color:var(--accent)">Q</span>
          <div class="qa-text" contenteditable="true" spellcheck="false" data-field="sub-title" data-id="${sec.id}" data-sub="${i}">${escHtml(sub.title)}</div>
          <button class="sub-remove-btn qa-remove" data-action="remove-sub" data-id="${sec.id}" data-sub="${i}" title="Remove">×</button>
        </div>
        <div class="qa-row qa-a-row">
          <span class="qa-label qa-a-label">A</span>
          <div class="qa-text qa-a-text" contenteditable="true" spellcheck="false" data-field="sub-content" data-id="${sec.id}" data-sub="${i}">${escHtml(sub.content)}</div>
        </div>
      </div>
    `).join('')}
    <button class="sub-add-btn" data-action="add-sub" data-id="${sec.id}">+ Add Q&amp;A</button>
  </div>`;
}

export function renderIconModal(sectionId) {
  const sec = state.sections.find(s => s.id === sectionId);
  const iconGrid = document.getElementById('iconGrid');
  const swatches = document.getElementById('colorSwatches');
  const picker = document.getElementById('colorPicker');
  if (!sec || !iconGrid) return;

  iconGrid.innerHTML = ICONS.map(ic => `
    <button class="icon-option ${ic.name === sec.icon ? 'selected' : ''}" data-icon="${ic.name}" data-id="${sectionId}" title="${ic.label}">
      ${iconHtml(ic.name, 20)}
    </button>
  `).join('');

  swatches.innerHTML = ACCENT_COLORS.map(c => `
    <button class="color-swatch ${c === sec.accentColor ? 'selected' : ''}" style="background:${c}" data-color="${c}" data-id="${sectionId}" title="${c}"></button>
  `).join('');

  picker.value = sec.accentColor || '#0063e5';
  picker.dataset.id = sectionId;
}

export function renderLayoutModal(sectionId) {
  const sec = state.sections.find(s => s.id === sectionId);
  const body = document.getElementById('layoutModalBody');
  if (!sec || !body) return;

  const layouts = [
    { value: 'free',     label: 'Free Text',  desc: 'Simple paragraph content, no subsections' },
    { value: 'numbered', label: 'Numbered',   desc: 'Items with number labels (01, 02, 03...)' },
    { value: 'columns',  label: 'Columns',    desc: 'Titled column grid (ONE, TWO, THREE...)' },
    { value: 'qa',       label: 'Q & A',      desc: 'Question and answer pairs' },
  ];

  body.innerHTML = `<div class="layout-options">
    ${layouts.map(l => `
      <label class="layout-option ${l.value === sec.layout ? 'active' : ''}">
        <input type="radio" name="layout" value="${l.value}" data-id="${sectionId}" ${l.value === sec.layout ? 'checked' : ''}>
        <span class="layout-option-name">${l.label}</span>
        <span class="layout-option-desc">${l.desc}</span>
      </label>
    `).join('')}
  </div>`;
}

export function renderThemePicker() {
  const el = document.getElementById('themePicker');
  if (!el) return;
  const active = state.theme || 'dark';
  el.innerHTML = THEMES.map(t => `
    <button class="theme-swatch ${t.id === active ? 'active' : ''}"
      style="background:${t.swatch};${t.id === active ? `box-shadow:0 0 0 2px ${t.swatchRing}` : ''}"
      data-theme="${t.id}"
      title="${t.label}"></button>
  `).join('');
}

export function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const bc = document.getElementById('battlecard');
  if (!bc) return;
  bc.style.setProperty('--bc-card-bg',    theme.card);
  bc.style.setProperty('--bc-section-bg', theme.section);
  bc.style.setProperty('--bc-hover',      theme.hover);
  bc.style.setProperty('--bc-gap',        theme.gap);
  bc.style.setProperty('--bc-title-grad', theme.titleGrad);
  // Override text vars so all child elements inherit the right palette
  bc.style.setProperty('--text-primary',   theme.textPrimary);
  bc.style.setProperty('--text-secondary', theme.textSecondary);
  bc.style.setProperty('--text-muted',     theme.textMuted);
}
