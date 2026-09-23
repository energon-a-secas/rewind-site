import { save, getProtocol, getStep } from './state.js';
import { render, renderTemplateGrid, renderStepDetail } from './render.js';
import {
  createProtocol, createStep, createContact, createResource, createTrigger,
  addProtocol, removeProtocol, duplicateProtocol, reorderStep, createFromTemplate
} from './protocols.js';
import { exportPlain, exportEncrypted, exportUrl, importFromFile, importFromUrl } from './export.js';
import { toast, nextStatus } from './utils.js';

export function bindEvents(s) {
  bindDashboard(s);
  bindEditor(s);
  bindStepView(s);
  bindModals(s);
}

// ── Navigation helpers ──────────────────────────────────────

function navigate(s, view, opts = {}) {
  s.view = view;
  if (opts.protocolId !== undefined) s.activeProtocolId = opts.protocolId;
  if (opts.stepId !== undefined) s.activeStepId = opts.stepId;
  render(s);
}

function updated(s) {
  const proto = getProtocol(s);
  if (proto) proto.updatedAt = new Date().toISOString();
  save(s);
}

// ── Dashboard ───────────────────────────────────────────────

function bindDashboard(s) {
  const grid = document.getElementById('protocolGrid');

  grid.addEventListener('click', e => {
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      const id = actionBtn.dataset.id;
      if (actionBtn.dataset.action === 'duplicate') {
        duplicateProtocol(s, id);
        save(s);
        render(s);
        toast('Protocol duplicated');
      } else if (actionBtn.dataset.action === 'delete') {
        if (confirm('Delete this protocol?')) {
          removeProtocol(s, id);
          save(s);
          render(s);
          toast('Protocol deleted');
        }
      }
      return;
    }

    const card = e.target.closest('.protocol-card');
    if (card) {
      navigate(s, 'editor', { protocolId: card.dataset.id });
    }
  });

  document.getElementById('newProtocolBtn').addEventListener('click', () => openTemplateModal(s));
  document.getElementById('emptyNewBtn').addEventListener('click', () => openTemplateModal(s));
  document.getElementById('importBtn').addEventListener('click', () => openImportModal());
}

// ── Editor ──────────────────────────────────────────────────

function bindEditor(s) {
  document.getElementById('backToDashboard').addEventListener('click', () => {
    navigate(s, 'dashboard', { protocolId: null });
  });

  document.getElementById('protocolName').addEventListener('input', e => {
    const proto = getProtocol(s);
    if (proto) { proto.name = e.target.value; updated(s); }
  });

  document.getElementById('protocolDesc').addEventListener('input', e => {
    const proto = getProtocol(s);
    if (proto) { proto.description = e.target.value; updated(s); }
  });

  document.getElementById('statusToggle').addEventListener('click', () => {
    const proto = getProtocol(s);
    if (proto) {
      proto.status = nextStatus(proto.status);
      updated(s);
      render(s);
    }
  });

  // Triggers
  document.getElementById('triggerList').addEventListener('input', e => {
    const proto = getProtocol(s);
    if (!proto) return;
    const tid = e.target.dataset.triggerId;
    const trigger = proto.triggers.find(t => t.id === tid);
    if (!trigger) return;
    if (e.target.classList.contains('trigger-type-select')) trigger.type = e.target.value;
    if (e.target.classList.contains('trigger-desc-input')) trigger.description = e.target.value;
    updated(s);
  });

  document.getElementById('triggerList').addEventListener('change', e => {
    const proto = getProtocol(s);
    if (!proto) return;
    const tid = e.target.dataset.triggerId;
    const trigger = proto.triggers.find(t => t.id === tid);
    if (!trigger) return;
    if (e.target.classList.contains('trigger-type-select')) {
      trigger.type = e.target.value;
      updated(s);
    }
  });

  document.getElementById('triggerList').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-trigger"]');
    if (!btn) return;
    const proto = getProtocol(s);
    if (proto) {
      proto.triggers = proto.triggers.filter(t => t.id !== btn.dataset.triggerId);
      updated(s);
      render(s);
    }
  });

  document.getElementById('addTriggerBtn').addEventListener('click', () => {
    const proto = getProtocol(s);
    if (proto) {
      proto.triggers.push(createTrigger());
      updated(s);
      render(s);
    }
  });

  // Steps
  document.getElementById('stepList').addEventListener('click', e => {
    const moveBtn = e.target.closest('[data-action="move-up"], [data-action="move-down"]');
    if (moveBtn) {
      e.stopPropagation();
      const proto = getProtocol(s);
      if (proto) {
        const dir = moveBtn.dataset.action === 'move-up' ? -1 : 1;
        reorderStep(proto, moveBtn.dataset.stepId, dir);
        updated(s);
        render(s);
      }
      return;
    }

    const body = e.target.closest('.step-card-body, .step-number');
    const card = e.target.closest('.step-card');
    if (card) {
      navigate(s, 'step', { stepId: card.dataset.stepId });
    }
  });

  document.getElementById('addStepBtn').addEventListener('click', () => {
    const proto = getProtocol(s);
    if (proto) {
      const step = createStep({ order: proto.steps.length });
      proto.steps.push(step);
      updated(s);
      render(s);
    }
  });

  // Export / Delete
  document.getElementById('exportProtocolBtn').addEventListener('click', () => openExportModal());
  document.getElementById('deleteProtocolBtn').addEventListener('click', () => {
    if (confirm('Delete this protocol permanently?')) {
      removeProtocol(s, s.activeProtocolId);
      save(s);
      navigate(s, 'dashboard', { protocolId: null });
      toast('Protocol deleted');
    }
  });
}

// ── Step detail ─────────────────────────────────────────────

function bindStepView(s) {
  document.getElementById('backToEditor').addEventListener('click', () => {
    navigate(s, 'editor', { stepId: null });
  });

  document.getElementById('stepTitle').addEventListener('input', e => {
    const st = getStep(s);
    if (st) { st.title = e.target.value; updated(s); }
  });

  document.getElementById('stepInstructions').addEventListener('input', e => {
    const st = getStep(s);
    if (st) { st.instructions = e.target.value; updated(s); }
  });

  document.getElementById('priorityOptions').addEventListener('click', e => {
    const btn = e.target.closest('.priority-btn');
    if (!btn) return;
    const st = getStep(s);
    if (st) {
      st.priority = btn.dataset.priority;
      updated(s);
      renderStepDetail(s);
    }
  });

  document.getElementById('deleteStepBtn').addEventListener('click', () => {
    const proto = getProtocol(s);
    if (proto) {
      proto.steps = proto.steps.filter(st => st.id !== s.activeStepId);
      proto.steps.forEach((st, i) => { st.order = i; });
      updated(s);
      navigate(s, 'editor', { stepId: null });
      toast('Step deleted');
    }
  });

  // Contacts
  document.getElementById('contactList').addEventListener('input', e => {
    const st = getStep(s);
    if (!st) return;
    const cid = e.target.dataset.contactId;
    const field = e.target.dataset.field;
    const contact = st.contacts.find(c => c.id === cid);
    if (contact && field) { contact[field] = e.target.value; updated(s); }
  });

  document.getElementById('contactList').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-contact"]');
    if (!btn) return;
    const st = getStep(s);
    if (st) {
      st.contacts = st.contacts.filter(c => c.id !== btn.dataset.contactId);
      updated(s);
      renderStepDetail(s);
    }
  });

  document.getElementById('addContactBtn').addEventListener('click', () => {
    const st = getStep(s);
    if (st) {
      st.contacts.push(createContact());
      updated(s);
      renderStepDetail(s);
    }
  });

  // Resources
  document.getElementById('resourceList').addEventListener('input', e => {
    const st = getStep(s);
    if (!st) return;
    const rid = e.target.dataset.resourceId;
    const field = e.target.dataset.field;
    const resource = st.resources.find(r => r.id === rid);
    if (resource && field) { resource[field] = e.target.value; updated(s); }
  });

  document.getElementById('resourceList').addEventListener('change', e => {
    const st = getStep(s);
    if (!st) return;
    if (e.target.classList.contains('resource-type-select')) {
      const rid = e.target.dataset.resourceId;
      const resource = st.resources.find(r => r.id === rid);
      if (resource) { resource.type = e.target.value; updated(s); }
    }
  });

  document.getElementById('resourceList').addEventListener('click', e => {
    const revealBtn = e.target.closest('[data-action="reveal"]');
    if (revealBtn) {
      const input = revealBtn.closest('.resource-value-wrap').querySelector('.resource-value');
      input.type = input.type === 'password' ? 'text' : 'password';
      return;
    }
    const removeBtn = e.target.closest('[data-action="remove-resource"]');
    if (removeBtn) {
      const st = getStep(s);
      if (st) {
        st.resources = st.resources.filter(r => r.id !== removeBtn.dataset.resourceId);
        updated(s);
        renderStepDetail(s);
      }
    }
  });

  document.getElementById('addResourceBtn').addEventListener('click', () => {
    const st = getStep(s);
    if (st) {
      st.resources.push(createResource());
      updated(s);
      renderStepDetail(s);
    }
  });
}

// ── Modals ──────────────────────────────────────────────────

let _passwordResolve = null;

function openTemplateModal(s) {
  renderTemplateGrid();
  document.getElementById('templateModal').hidden = false;
}

function openExportModal() {
  document.getElementById('exportModal').hidden = false;
}

function openImportModal() {
  document.getElementById('importModal').hidden = false;
}

function closeAllModals() {
  document.getElementById('templateModal').hidden = true;
  document.getElementById('exportModal').hidden = true;
  document.getElementById('passwordModal').hidden = true;
  document.getElementById('importModal').hidden = true;
}

function requestPassword(title, showConfirm) {
  return new Promise(resolve => {
    _passwordResolve = resolve;
    document.getElementById('passwordModalTitle').textContent = title;
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordConfirm').value = '';
    document.getElementById('passwordConfirm').hidden = !showConfirm;
    document.getElementById('passwordModal').hidden = false;
    document.getElementById('passwordInput').focus();
  });
}

function bindModals(s) {
  // Close buttons
  document.getElementById('closeTemplateModal').addEventListener('click', closeAllModals);
  document.getElementById('closeExportModal').addEventListener('click', closeAllModals);
  document.getElementById('closePasswordModal').addEventListener('click', () => {
    closeAllModals();
    if (_passwordResolve) { _passwordResolve(null); _passwordResolve = null; }
  });
  document.getElementById('closeImportModal').addEventListener('click', closeAllModals);

  // Click overlay to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        closeAllModals();
        if (_passwordResolve) { _passwordResolve(null); _passwordResolve = null; }
      }
    });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllModals();
      if (_passwordResolve) { _passwordResolve(null); _passwordResolve = null; }
    }
  });

  // Template selection
  document.getElementById('templateGrid').addEventListener('click', e => {
    const card = e.target.closest('.template-card');
    if (!card) return;
    const proto = createFromTemplate(card.dataset.template);
    if (proto) {
      addProtocol(s, proto);
      save(s);
      closeAllModals();
      navigate(s, 'editor', { protocolId: proto.id });
    }
  });

  document.getElementById('blankProtocolBtn').addEventListener('click', () => {
    const proto = createProtocol({ name: 'New Protocol' });
    addProtocol(s, proto);
    save(s);
    closeAllModals();
    navigate(s, 'editor', { protocolId: proto.id });
  });

  // Export options
  document.getElementById('exportEncryptedBtn').addEventListener('click', async () => {
    const proto = getProtocol(s);
    if (!proto) return;
    closeAllModals();
    const password = await requestPassword('Set Encryption Password', true);
    if (!password) return;
    try {
      await exportEncrypted(proto, password);
    } catch (err) {
      toast('Export failed');
    }
  });

  document.getElementById('exportPlainBtn').addEventListener('click', () => {
    const proto = getProtocol(s);
    if (proto) { exportPlain(proto); closeAllModals(); }
  });

  document.getElementById('exportUrlBtn').addEventListener('click', () => {
    const proto = getProtocol(s);
    if (proto) { exportUrl(proto); closeAllModals(); }
  });

  // Password submit
  document.getElementById('passwordSubmit').addEventListener('click', () => {
    const pass = document.getElementById('passwordInput').value;
    const confirm = document.getElementById('passwordConfirm');
    if (!confirm.hidden && pass !== confirm.value) {
      toast('Passwords do not match');
      return;
    }
    if (!pass) { toast('Password required'); return; }
    closeAllModals();
    if (_passwordResolve) { _passwordResolve(pass); _passwordResolve = null; }
  });

  document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('passwordSubmit').click();
  });
  document.getElementById('passwordConfirm').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('passwordSubmit').click();
  });

  // Import
  document.getElementById('importDropzone').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });

  document.getElementById('importFileInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    closeAllModals();
    const passwordFn = () => requestPassword('Enter Decryption Password', false);
    const ok = await importFromFile(file, s, passwordFn);
    if (ok) { render(s); }
    e.target.value = '';
  });

  document.getElementById('importUrlBtn').addEventListener('click', async () => {
    const url = document.getElementById('importUrlInput').value.trim();
    if (!url) { toast('Paste a URL first'); return; }
    closeAllModals();
    const passwordFn = () => requestPassword('Enter Decryption Password', false);
    const ok = await importFromUrl(url, s, passwordFn);
    if (ok) { navigate(s, 'dashboard'); }
  });

  // Drop zone drag events
  const dropzone = document.getElementById('importDropzone');
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', async e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    closeAllModals();
    const passwordFn = () => requestPassword('Enter Decryption Password', false);
    const ok = await importFromFile(file, s, passwordFn);
    if (ok) { render(s); }
  });
}
