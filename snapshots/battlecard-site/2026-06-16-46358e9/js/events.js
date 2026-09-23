import { state, saveState, resetState, uid } from './state.js';
import { renderAll, renderIconModal, renderLayoutModal, applyTheme, renderThemePicker } from './render.js';
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

  // Export buttons (lazy-load export module)
  document.getElementById('btnExportPng').addEventListener('click', () => {
    import('./export.js').then(m => m.exportPNG());
  });
  document.getElementById('btnExportView').addEventListener('click', () => {
    import('./export.js').then(m => m.exportView());
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
      qa: 'New question?'
    };
    sec.subsections.push({ title: titles[sec.layout] || String(n + 1), content: 'Content here' });
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
