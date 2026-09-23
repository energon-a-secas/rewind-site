import { CATEGORIES, PROBE_NAMES, HELP_CONTENT } from './data.js';
import { state } from './state.js';
import { getPlaceholderName, getCandidateName, sanitizeName, downloadMarkdown } from './utils.js';
import { calculate, updatePieceMatrix } from './scoring.js';
import { generateInternalReport, generateCandidateReport } from './reports.js';
import { gatherFormState, applyFormState, getAllQuestionNames } from './session.js';
import {
  listSessions, getSession, saveSession, deleteSession as storageDelete,
  renameSession, exportSessions, importSessions,
  getCurrentSession, setCurrentSession, createSession
} from './storage.js';

let autoSaveTimer = null;
let isRestoring = false;

function showHelp(questionId) {
  const data = HELP_CONTENT[questionId];
  if (!data) return;
  document.getElementById('help-title').textContent = data.title;
  let html = '<div class="help-section"><div class="help-section-label">Objective</div><p>' + data.objective + '</p></div>';
  if (data.ask && data.ask.length > 0) {
    html += '<div class="help-section"><div class="help-section-label">Try Asking</div><ul>';
    data.ask.forEach(a => { html += '<li>' + a + '</li>'; });
    html += '</ul></div>';
  }
  html += '<div class="help-section"><div class="help-section-label">Look For</div><ul>';
  data.lookFor.forEach(l => { html += '<li>' + l + '</li>'; });
  html += '</ul></div>';
  document.getElementById('help-body').innerHTML = html;
  document.getElementById('help-overlay').classList.add('visible');
}

function closeHelp() {
  document.getElementById('help-overlay').classList.remove('visible');
}

function selectPiece(key) {
  state.selectedPiece = (state.selectedPiece === key) ? null : key;
  updatePieceMatrix();
  scheduleAutoSave();
}

function resetPieceSelection() {
  state.selectedPiece = null;
  updatePieceMatrix();
  scheduleAutoSave();
}

function downloadInternal() {
  downloadMarkdown(generateInternalReport(), sanitizeName(getCandidateName()) + '-internal-review.md');
}

function downloadFeedback() {
  downloadMarkdown(generateCandidateReport(), sanitizeName(getCandidateName()) + '-feedback.md');
}

function resetAssessment() {
  setCurrentSession(null);
  document.getElementById('candidate-name').value = '';
  document.getElementById('candidate-name').placeholder = getPlaceholderName();
  document.getElementById('role-select').value = 'individual-contributor';
  document.getElementById('notes').value = '';
  document.getElementById('cheat-notes').value = '';
  const allGroups = getAllQuestionNames();
  allGroups.forEach(name => {
    const mid = document.querySelector(`input[name="${name}"][value="1"]`);
    if (mid) mid.checked = true;
  });
  document.getElementById('tech-probes').removeAttribute('open');
  document.getElementById('own-probes').removeAttribute('open');
  document.getElementById('solve-probes').removeAttribute('open');
  document.getElementById('cheat-probes').removeAttribute('open');
  state.selectedPiece = null;
  if (typeof window.__setTimerElapsed === 'function') window.__setTimerElapsed(0);
  calculate();
  updateSessionStatus('New session');
}

// Sessions UI
function updateSessionStatus(text) {
  const el = document.getElementById('session-status');
  if (!el) return;
  el.textContent = text || '';
  el.classList.remove('visible');
  void el.offsetWidth;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2000);
}

function getSessionDisplayName(session) {
  return (session.name || 'Unnamed candidate').trim() || 'Unnamed candidate';
}

function renderSessionsList() {
  const container = document.getElementById('sessions-list');
  const sessions = listSessions();
  const currentId = getCurrentSession() ? getCurrentSession().id : null;
  if (!sessions.length) {
    container.innerHTML = '<p class="sessions-empty">No saved sessions yet.</p>';
    return;
  }
  let html = '';
  sessions.forEach(s => {
    const isActive = s.id === currentId ? ' active' : '';
    const date = new Date(s.updatedAt).toLocaleString();
    html += `
      <div class="sessions-item${isActive}" data-id="${s.id}">
        <div class="sessions-item-info">
          <div class="sessions-item-name" id="session-name-${s.id}">${escapeHtml(getSessionDisplayName(s))}</div>
          <div class="sessions-item-meta">${escapeHtml(s.role.replace(/-/g, ' '))} · ${date}</div>
        </div>
        <div class="sessions-item-actions">
          <button class="session-action-btn" data-action="load" data-id="${s.id}" title="Load">↗</button>
          <button class="session-action-btn" data-action="rename" data-id="${s.id}" title="Rename">✎</button>
          <button class="session-action-btn" data-action="export" data-id="${s.id}" title="Export">⬇</button>
          <button class="session-action-btn session-action-danger" data-action="delete" data-id="${s.id}" title="Delete">×</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveCurrentSession() {
  const current = getCurrentSession();
  const id = current ? current.id : createSession().id;
  const data = gatherFormState();
  const session = saveSession({
    id,
    name: data.name,
    role: data.role,
    scores: data.scores,
    notes: data.notes,
    cheatNotes: data.cheatNotes,
    selectedPiece: data.selectedPiece,
    timerDuration: data.timerDuration
  });
  setCurrentSession(session.id);
  updateSessionStatus('Saved');
  return session;
}

function scheduleAutoSave() {
  if (isRestoring) return;
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    const current = getCurrentSession();
    if (!current) return;
    saveCurrentSession();
  }, 800);
}

function openSessions() {
  renderSessionsList();
  document.getElementById('sessions-overlay').classList.add('visible');
}

function closeSessions() {
  document.getElementById('sessions-overlay').classList.remove('visible');
}

function loadSession(id) {
  const session = getSession(id);
  if (!session) return;
  isRestoring = true;
  setCurrentSession(session.id);
  applyFormState(session);
  calculate();
  closeSessions();
  updateSessionStatus('Loaded');
  isRestoring = false;
}

function newSession() {
  resetAssessment();
}

function exportAllSessions() {
  const blob = new Blob([exportSessions()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vibe-check-sessions.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportSession(id) {
  const session = getSession(id);
  if (!session) return;
  const payload = JSON.stringify({
    app: 'vibe-check',
    sessions: [session]
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeName(session.name || 'candidate') + '-vibe-check.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      importSessions(e.target.result);
      renderSessionsList();
      updateSessionStatus('Imported');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function deleteSession(id) {
  if (!confirm('Delete this session?')) return;
  storageDelete(id);
  const current = getCurrentSession();
  if (!current) {
    resetAssessment();
  }
  renderSessionsList();
}

function promptRename(id) {
  const session = getSession(id);
  if (!session) return;
  const name = prompt('Rename session:', session.name || '');
  if (name === null) return;
  renameSession(id, name);
  renderSessionsList();
}

// Auto-advance logic
function buildQuestionOrder() {
  const questionOrder = [];
  const cards = document.querySelectorAll('.content-area > .card');
  cards.forEach(card => {
    card.querySelectorAll(':scope > .control-group').forEach(g => {
      const radio = g.querySelector('input[type="radio"]');
      if (radio) questionOrder.push({ group: g, card, name: radio.name, isProbe: false });
    });
    card.querySelectorAll('.probe-content > .control-group').forEach(g => {
      const radio = g.querySelector('input[type="radio"]');
      if (radio) questionOrder.push({ group: g, card, name: radio.name, isProbe: true });
    });
  });
  return { questionOrder, cards };
}

function scrollToElement(el, highlightClass) {
  const headerHeight = document.querySelector('.header-bar').offsetHeight + 30;
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset + rect.top - headerHeight;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: scrollTop, behavior: reduceMotion ? 'auto' : 'smooth' });
  setTimeout(() => {
    el.classList.remove(highlightClass);
    void el.offsetWidth;
    el.classList.add(highlightClass);
    el.addEventListener('animationend', function handler() {
      el.classList.remove(highlightClass);
      el.removeEventListener('animationend', handler);
    });
  }, 350);
}

function advanceToNext(radioName, questionOrder, cards) {
  let currentIdx = -1;
  for (let i = 0; i < questionOrder.length; i++) {
    if (questionOrder[i].name === radioName) { currentIdx = i; break; }
  }
  if (currentIdx === -1) return;

  const current = questionOrder[currentIdx];
  const next = questionOrder[currentIdx + 1];

  if (!next || next.card !== current.card) {
    const cardIdx = Array.prototype.indexOf.call(cards, current.card);
    const nextCard = cards[cardIdx + 1];
    if (nextCard && nextCard.querySelector('.control-group')) {
      setTimeout(() => scrollToElement(nextCard, 'highlight-section'), 500);
    }
    return;
  }

  if (next.isProbe) {
    const details = next.group.closest('details');
    if (details && !details.open) {
      const cardIdx = Array.prototype.indexOf.call(cards, current.card);
      const nextCard = cards[cardIdx + 1];
      if (nextCard && nextCard.querySelector('.control-group')) {
        setTimeout(() => scrollToElement(nextCard, 'highlight-section'), 300);
      }
      return;
    }
  }

  setTimeout(() => scrollToElement(next.group, 'highlight-next'), 500);
}

export function initEvents() {
  const { questionOrder, cards } = buildQuestionOrder();

  const allRadioNames = getAllQuestionNames();
  allRadioNames.forEach(name => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        calculate();
        advanceToNext(name, questionOrder, cards);
        scheduleAutoSave();
      });
    });
  });

  // Text inputs trigger auto-save
  ['candidate-name', 'notes', 'cheat-notes', 'role-select'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', scheduleAutoSave);
  });

  // Session buttons
  document.getElementById('save-session-btn').addEventListener('click', () => {
    saveCurrentSession();
  });
  document.getElementById('sessions-btn').addEventListener('click', openSessions);
  document.getElementById('new-session-btn').addEventListener('click', newSession);
  document.getElementById('export-all-btn').addEventListener('click', exportAllSessions);
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) importFile(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('sessions-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'load') loadSession(id);
    else if (action === 'rename') promptRename(id);
    else if (action === 'export') exportSession(id);
    else if (action === 'delete') deleteSession(id);
  });
  document.getElementById('sessions-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('sessions-overlay')) closeSessions();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeHelp();
      closeSessions();
    }
  });

  document.getElementById('help-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeHelp();
  });

  window.showHelp = showHelp;
  window.closeHelp = closeHelp;
  window.selectPiece = selectPiece;
  window.resetPieceSelection = resetPieceSelection;
  window.downloadInternal = downloadInternal;
  window.downloadFeedback = downloadFeedback;
  window.resetAssessment = resetAssessment;
  window.generateInternalReport = generateInternalReport;
  window.generateCandidateReport = generateCandidateReport;
  window.openSessions = openSessions;
  window.closeSessions = closeSessions;
}
