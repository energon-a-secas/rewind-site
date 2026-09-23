import { getProtocol, getStep } from './state.js';
import { TEMPLATES } from './protocols.js';
import { escHtml, formatDate, PRIORITY_LABELS, TRIGGER_TYPES, RESOURCE_TYPES } from './utils.js';

export function render(s) {
  const dash = document.getElementById('dashboardView');
  const editor = document.getElementById('editorView');
  const step = document.getElementById('stepView');

  dash.hidden = s.view !== 'dashboard';
  editor.hidden = s.view !== 'editor';
  step.hidden = s.view !== 'step';

  if (s.view === 'dashboard') renderDashboard(s);
  if (s.view === 'editor') renderEditor(s);
  if (s.view === 'step') renderStepDetail(s);
}

function renderDashboard(s) {
  const grid = document.getElementById('protocolGrid');
  const empty = document.getElementById('emptyState');

  if (s.protocols.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = s.protocols.map(p => `
    <div class="protocol-card card" data-id="${p.id}">
      <div class="protocol-card-header">
        <span class="protocol-icon">${p.icon || '&#9888;'}</span>
        <span class="status-badge status-${p.status}">&gt; ${p.status.toUpperCase()}</span>
      </div>
      <h3 class="protocol-card-name">${escHtml(p.name || 'Untitled')}</h3>
      <p class="protocol-card-desc">${escHtml(p.description || '')}</p>
      <div class="protocol-card-meta">
        <span>${p.steps.length} step${p.steps.length !== 1 ? 's' : ''}</span>
        <span>${formatDate(p.updatedAt)}</span>
      </div>
      <div class="protocol-card-actions">
        <button class="btn btn-ghost btn-xs" data-action="duplicate" data-id="${p.id}">Duplicate</button>
        <button class="btn btn-ghost btn-xs btn-danger" data-action="delete" data-id="${p.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderEditor(s) {
  const proto = getProtocol(s);
  if (!proto) return;

  document.getElementById('protocolName').value = proto.name;
  document.getElementById('protocolDesc').value = proto.description;

  const label = document.getElementById('statusLabel');
  const toggle = document.getElementById('statusToggle');
  label.textContent = '> ' + proto.status.toUpperCase();
  toggle.className = 'status-toggle status-' + proto.status;

  renderTriggers(proto);
  renderStepList(proto);
}

function renderTriggers(proto) {
  const list = document.getElementById('triggerList');
  if (proto.triggers.length === 0) {
    list.innerHTML = '<p class="empty-hint">No triggers defined</p>';
    return;
  }
  list.innerHTML = proto.triggers.map(t => `
    <div class="trigger-item" data-trigger-id="${t.id}">
      <select class="trigger-type-select" data-trigger-id="${t.id}">
        ${TRIGGER_TYPES.map(tt => `<option value="${tt}" ${tt === t.type ? 'selected' : ''}>${tt}</option>`).join('')}
      </select>
      <input type="text" class="trigger-desc-input" data-trigger-id="${t.id}" value="${escHtml(t.description)}" placeholder="Describe the trigger condition...">
      <button class="btn-icon btn-danger" data-action="remove-trigger" data-trigger-id="${t.id}" title="Remove" aria-label="Remove trigger">&times;</button>
    </div>
  `).join('');
}

function renderStepList(proto) {
  const list = document.getElementById('stepList');
  if (proto.steps.length === 0) {
    list.innerHTML = '<p class="empty-hint">No steps added yet</p>';
    return;
  }
  list.innerHTML = proto.steps.map((st, i) => `
    <div class="step-card" data-step-id="${st.id}">
      <div class="step-card-order">
        <button class="btn-icon btn-reorder" data-action="move-up" data-step-id="${st.id}" ${i === 0 ? 'disabled' : ''} title="Move up" aria-label="Move step up">&#9650;</button>
        <span class="step-number">${String(i + 1).padStart(2, '0')}</span>
        <button class="btn-icon btn-reorder" data-action="move-down" data-step-id="${st.id}" ${i === proto.steps.length - 1 ? 'disabled' : ''} title="Move down" aria-label="Move step down">&#9660;</button>
      </div>
      <div class="step-card-body" data-step-id="${st.id}">
        <div class="step-card-top">
          <span class="step-card-title">${escHtml(st.title || 'Untitled step')}</span>
          <span class="priority-tag priority-${st.priority}">${PRIORITY_LABELS[st.priority] || st.priority}</span>
        </div>
        <div class="step-card-counts">
          ${st.contacts.length ? `<span>${st.contacts.length} contact${st.contacts.length !== 1 ? 's' : ''}</span>` : ''}
          ${st.resources.length ? `<span>${st.resources.length} resource${st.resources.length !== 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

export function renderStepDetail(s) {
  const st = getStep(s);
  if (!st) return;

  document.getElementById('stepTitle').value = st.title;
  document.getElementById('stepInstructions').value = st.instructions;

  document.querySelectorAll('#priorityOptions .priority-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.priority === st.priority);
  });

  renderContacts(st);
  renderResources(st);
}

function renderContacts(st) {
  const list = document.getElementById('contactList');
  if (st.contacts.length === 0) {
    list.innerHTML = '<p class="empty-hint">No contacts</p>';
    return;
  }
  list.innerHTML = st.contacts.map(c => `
    <div class="contact-item" data-contact-id="${c.id}">
      <input type="text" class="contact-input" data-contact-id="${c.id}" data-field="name" value="${escHtml(c.name)}" placeholder="Name">
      <input type="text" class="contact-input" data-contact-id="${c.id}" data-field="role" value="${escHtml(c.role)}" placeholder="Role">
      <input type="tel" class="contact-input" data-contact-id="${c.id}" data-field="phone" value="${escHtml(c.phone)}" placeholder="Phone">
      <input type="email" class="contact-input" data-contact-id="${c.id}" data-field="email" value="${escHtml(c.email)}" placeholder="Email">
      <button class="btn-icon btn-danger" data-action="remove-contact" data-contact-id="${c.id}" title="Remove" aria-label="Remove contact">&times;</button>
    </div>
  `).join('');
}

function renderResources(st) {
  const list = document.getElementById('resourceList');
  if (st.resources.length === 0) {
    list.innerHTML = '<p class="empty-hint">No resources</p>';
    return;
  }
  list.innerHTML = st.resources.map(r => `
    <div class="resource-item" data-resource-id="${r.id}">
      <input type="text" class="resource-input" data-resource-id="${r.id}" data-field="label" value="${escHtml(r.label)}" placeholder="Label">
      <select class="resource-type-select" data-resource-id="${r.id}">
        ${RESOURCE_TYPES.map(rt => `<option value="${rt}" ${rt === r.type ? 'selected' : ''}>${rt}</option>`).join('')}
      </select>
      <div class="resource-value-wrap">
        <input type="password" class="resource-input resource-value" data-resource-id="${r.id}" data-field="value" value="${escHtml(r.value)}" placeholder="Value (stored locally)">
        <button class="btn-icon btn-reveal" data-action="reveal" data-resource-id="${r.id}" title="Show/hide" aria-label="Show or hide value">&#128065;</button>
      </div>
      <button class="btn-icon btn-danger" data-action="remove-resource" data-resource-id="${r.id}" title="Remove" aria-label="Remove resource">&times;</button>
    </div>
  `).join('');
}

export function renderTemplateGrid() {
  const grid = document.getElementById('templateGrid');
  grid.innerHTML = TEMPLATES.map(t => `
    <button class="template-card" data-template="${t.key}">
      <span class="template-icon">${t.icon}</span>
      <span class="template-name">${escHtml(t.name)}</span>
      <span class="template-label">${t.label}</span>
      <span class="template-desc">${escHtml(t.description)}</span>
    </button>
  `).join('');
}
