import { state, saveState, resetState, replaceState, normalizeCard, uid } from './state.js';
import { renderAll, renderIconModal, renderLayoutModal, applyTheme, renderThemePicker } from './render.js';
import { TEMPLATES } from './templates.js';
import { toast } from './utils.js';

let _dragIdx = null;

export function bindEvents() {
  // Card title
  document.getElementById('cardTitle').addEventListener('blur', e => {
    state.title = e.target.textContent.trim() || 'SALES BATTLECARD';
    saveState();
  });
  document.getElementById('cardTitle').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
  });

  // Columns control
  document.getElementById('btnColsMinus').addEventListener('click', () => {
    if (state.columns > 1) { state.columns--; saveState(); renderAll(); }
  });
  document.getElementById('btnColsPlus').addEventListener('click', () => {
    if (state.columns < 6) { state.columns++; saveState(); renderAll(); }
  });

  // Add section
  document.getElementById('btnAddSection').addEventListener('click', addSection);

  // Templates modal
  document.getElementById('btnTemplates').addEventListener('click', () => {
    renderTemplatesModal();
    openModal('templatesModal');
  });
  document.getElementById('templatesModalClose').addEventListener('click', () => closeModal('templatesModal'));
  document.getElementById('templatesList').addEventListener('click', e => {
    const btn = e.target.closest('[data-template]');
    if (!btn) return;
    const tpl = TEMPLATES.find(t => t.id === btn.dataset.template);
    if (!tpl) return;
    if (!confirm(`Load "${tpl.name}"? Your current card will be replaced.`)) return;
    const card = normalizeCard(JSON.parse(JSON.stringify(tpl.card)));
    card.theme = state.theme;
    replaceState(card);
    renderAll();
    closeModal('templatesModal');
    toast(`Loaded: ${tpl.name}`);
  });

  // Export dropdown (kit .header-menu styling, site-owned behavior)
  const exportToggle = document.getElementById('btnExportMenu');
  const exportMenu = document.getElementById('exportMenu');
  exportToggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = !exportMenu.classList.contains('open');
    exportMenu.classList.toggle('open', open);
    exportToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!exportMenu.contains(e.target) && e.target !== exportToggle) {
      exportMenu.classList.remove('open');
      exportToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && exportMenu.classList.contains('open')) {
      exportMenu.classList.remove('open');
      exportToggle.setAttribute('aria-expanded', 'false');
    }
  });
  exportMenu.addEventListener('click', e => {
    const item = e.target.closest('[data-export]');
    if (!item) return;
    exportMenu.classList.remove('open');
    exportToggle.setAttribute('aria-expanded', 'false');
    import('./export.js').then(m => {
      if (item.dataset.export === 'png')   m.exportPNG();
      if (item.dataset.export === 'view')  m.exportView();
      if (item.dataset.export === 'json')  m.exportJSON();
      if (item.dataset.export === 'share') m.copyShareLink();
    });
  });

  // Import JSON
  const importFile = document.getElementById('importFile');
  document.getElementById('btnImportJson').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (file) import('./export.js').then(m => m.importJSONFile(file));
    importFile.value = '';
  });

  // Brand modal
  document.getElementById('btnBrand').addEventListener('click', () => {
    syncBrandModal();
    openModal('brandModal');
  });
  document.getElementById('brandModalClose').addEventListener('click', () => closeModal('brandModal'));
  document.getElementById('brandCompany').addEventListener('input', e => {
    state.brand.company = e.target.value.slice(0, 60);
    saveState();
    renderAll();
  });
  document.getElementById('brandFont').addEventListener('change', e => {
    state.brand.font = e.target.value;
    saveState();
    renderAll();
  });
  document.getElementById('brandLogo').addEventListener('change', e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 512 * 1024) { toast('Logo too large (max 500 KB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      state.brand.logoDataUrl = reader.result;
      saveState();
      renderAll();
      syncBrandModal();
      toast('Logo added');
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('brandLogoRemove').addEventListener('click', () => {
    state.brand.logoDataUrl = '';
    saveState();
    renderAll();
    syncBrandModal();
  });

  // Reset
  document.getElementById('btnReset').addEventListener('click', () => {
    if (confirm('Reset to default battlecard? All changes will be lost.')) {
      resetState();
      renderAll();
      toast('Reset to default');
    }
  });

  // Grid: click + blur delegation
  const grid = document.getElementById('sectionsGrid');
  grid.addEventListener('click', onGridClick);
  grid.addEventListener('blur', onGridBlur, true);

  // Drag and drop
  grid.addEventListener('dragstart', onDragStart);
  grid.addEventListener('dragover', onDragOver);
  grid.addEventListener('drop', onDrop);
  grid.addEventListener('dragend', onDragEnd);

  // Modal close buttons
  document.getElementById('iconModalClose').addEventListener('click', () => closeModal('iconModal'));
  document.getElementById('layoutModalClose').addEventListener('click', () => closeModal('layoutModal'));
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Icon modal: icon selection
  document.getElementById('iconGrid').addEventListener('click', e => {
    const btn = e.target.closest('.icon-option');
    if (!btn) return;
    const sec = state.sections.find(s => s.id === btn.dataset.id);
    if (!sec) return;
    sec.icon = btn.dataset.icon;
    saveState();
    renderAll();
    renderIconModal(btn.dataset.id);
  });

  // Icon modal: color swatches
  document.getElementById('colorSwatches').addEventListener('click', e => {
    const btn = e.target.closest('.color-swatch');
    if (!btn) return;
    const sec = state.sections.find(s => s.id === btn.dataset.id);
    if (!sec) return;
    sec.accentColor = btn.dataset.color;
    saveState();
    renderAll();
    renderIconModal(btn.dataset.id);
  });

  // Icon modal: custom color picker
  document.getElementById('colorPicker').addEventListener('input', e => {
    const sec = state.sections.find(s => s.id === e.target.dataset.id);
    if (!sec) return;
    sec.accentColor = e.target.value;
    // Live update section styling without full re-render
    const card = document.querySelector(`.section-card[data-id="${e.target.dataset.id}"]`);
    if (card) {
      card.style.setProperty('--accent', e.target.value);
      card.style.borderTopColor = e.target.value;
    }
  });
  document.getElementById('colorPicker').addEventListener('change', e => {
    const sec = state.sections.find(s => s.id === e.target.dataset.id);
    if (!sec) return;
    sec.accentColor = e.target.value;
    saveState();
    renderAll();
    renderIconModal(e.target.dataset.id);
  });

  // Theme picker
  document.getElementById('themePicker').addEventListener('click', e => {
    const btn = e.target.closest('[data-theme]');
    if (!btn) return;
    state.theme = btn.dataset.theme;
    saveState();
    applyTheme(state.theme);
    renderThemePicker();
  });

  // Layout modal: radio selection
  document.getElementById('layoutModalBody').addEventListener('change', e => {
    if (e.target.name !== 'layout') return;
    const sec = state.sections.find(s => s.id === e.target.dataset.id);
    if (!sec) return;
    sec.layout = e.target.value;
    saveState();
    renderAll();
    closeModal('layoutModal');
    toast('Layout updated');
  });
}

function onGridClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id, axis, dir, sub } = btn.dataset;

  if (action === 'icon') {
    renderIconModal(id);
    openModal('iconModal');
    return;
  }

  if (action === 'layout') {
    renderLayoutModal(id);
    openModal('layoutModal');
    return;
  }

  if (action === 'span') {
    const sec = state.sections.find(s => s.id === id);
    if (!sec) return;
    const delta = parseInt(dir, 10);
    if (axis === 'col') {
      sec.colSpan = Math.max(1, Math.min(state.columns, (sec.colSpan || 1) + delta));
    } else {
      sec.rowSpan = Math.max(1, Math.min(4, (sec.rowSpan || 1) + delta));
    }
    saveState();
    renderAll();
    return;
  }

  if (action === 'duplicate') {
    const idx = state.sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    const clone = JSON.parse(JSON.stringify(state.sections[idx]));
    clone.id = uid();
    state.sections.splice(idx + 1, 0, clone);
    saveState();
    renderAll();
    toast('Section duplicated');
    return;
  }

  if (action === 'delete') {
    if (state.sections.length <= 1) { toast('Need at least one section'); return; }
    if (confirm('Delete this section?')) {
      state.sections = state.sections.filter(s => s.id !== id);
      saveState();
      renderAll();
    }
    return;
  }

  if (action === 'add-sub') {
    const sec = state.sections.find(s => s.id === id);
    if (!sec) return;
    const n = sec.subsections.length;
    const numLabels = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
    const titles = {
      numbered: String(n + 1).padStart(2, '0'),
      columns: numLabels[Math.min(n, 5)],
      qa: 'New question?',
      pairs: 'New objection'
    };
    const contents = { pairs: 'Your response' };
    sec.subsections.push({ title: titles[sec.layout] || String(n + 1), content: contents[sec.layout] || 'Content here' });
    saveState();
    renderAll();
    return;
  }

  if (action === 'remove-sub') {
    const sec = state.sections.find(s => s.id === id);
    if (!sec) return;
    sec.subsections.splice(parseInt(sub, 10), 1);
    saveState();
    renderAll();
    return;
  }
}

function onGridBlur(e) {
  const el = e.target;
  if (!el.dataset.field) return;
  const { field, id, sub } = el.dataset;
  const sec = state.sections.find(s => s.id === id);
  if (!sec) return;
  const text = el.textContent;
  if (field === 'title')       sec.title = text;
  else if (field === 'content') sec.content = text;
  else if (field === 'sub-title' && sub !== undefined)   sec.subsections[+sub].title = text;
  else if (field === 'sub-content' && sub !== undefined) sec.subsections[+sub].content = text;
  saveState();
}

function onDragStart(e) {
  // Don't drag when editing text or clicking controls
  if (e.target.closest('[contenteditable]') || e.target.closest('button')) {
    e.preventDefault();
    return;
  }
  const card = e.target.closest('.section-card');
  if (!card) return;
  _dragIdx = parseInt(card.dataset.idx, 10);
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const card = e.target.closest('.section-card');
  document.querySelectorAll('.section-card.drag-over').forEach(c => c.classList.remove('drag-over'));
  if (card && parseInt(card.dataset.idx, 10) !== _dragIdx) {
    card.classList.add('drag-over');
  }
}

function onDrop(e) {
  e.preventDefault();
  const card = e.target.closest('.section-card');
  if (!card || _dragIdx === null) return;
  const targetIdx = parseInt(card.dataset.idx, 10);
  if (targetIdx === _dragIdx) return;
  const sections = [...state.sections];
  const [moved] = sections.splice(_dragIdx, 1);
  sections.splice(targetIdx, 0, moved);
  state.sections = sections;
  saveState();
  renderAll();
}

function onDragEnd() {
  _dragIdx = null;
  document.querySelectorAll('.section-card').forEach(c => c.classList.remove('dragging', 'drag-over'));
}

function addSection() {
  state.sections.push({
    id: uid(),
    title: 'New Section',
    icon: 'technology',
    accentColor: '#0063e5',
    colSpan: 1,
    rowSpan: 1,
    content: 'Add your content here.',
    layout: 'free',
    subsections: []
  });
  saveState();
  renderAll();
  toast('Section added');
}

function openModal(id) {
  const el = document.getElementById(id);
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('open'));
}

function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('open');
  setTimeout(() => { el.hidden = true; }, 220);
}

function renderTemplatesModal() {
  const list = document.getElementById('templatesList');
  list.innerHTML = TEMPLATES.map(t => `
    <button type="button" class="template-option" data-template="${t.id}">
      <span class="template-name">${t.name}</span>
      <span class="template-desc">${t.desc}</span>
      <span class="template-meta">${t.card.sections.length} sections</span>
    </button>`).join('');
}

function syncBrandModal() {
  document.getElementById('brandCompany').value = state.brand.company || '';
  document.getElementById('brandFont').value = state.brand.font || 'sans';
  const preview = document.getElementById('brandLogoPreview');
  const removeBtn = document.getElementById('brandLogoRemove');
  if (state.brand.logoDataUrl) {
    preview.src = state.brand.logoDataUrl;
    preview.hidden = false;
    removeBtn.hidden = false;
  } else {
    preview.hidden = true;
    removeBtn.hidden = true;
  }
}
