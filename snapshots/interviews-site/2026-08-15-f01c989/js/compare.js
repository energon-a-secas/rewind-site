import { listSessions } from './storage.js';
import { calculateMetrics } from './scoring.js';
import { CATEGORIES, PIECE_PROFILES, ROLES } from './data.js';

function renderOption(session) {
  const name = session.name || 'Unnamed candidate';
  const date = new Date(session.updatedAt).toLocaleDateString();
  return `<option value="${session.id}">${name} · ${date}</option>`;
}

function renderEmpty() {
  return `<div class="compare-empty">No saved sessions yet. Create one on the <a href="./">scorecard</a>.</div>`;
}

function renderCard(session) {
  if (!session) return renderEmpty();
  const scores = { ...session.scores };
  const metrics = calculateMetrics(scores, session.selectedPiece);
  const profile = PIECE_PROFILES[metrics.active];
  const roleLabel = (session.role && ROLES[session.role]) ? ROLES[session.role].label : 'Individual Contributor';

  let bars = '';
  for (const key in CATEGORIES) {
    const s = metrics.catScores[key];
    bars += `
      <div class="compare-bar">
        <span class="compare-bar-label">${CATEGORIES[key].short}</span>
        <div class="compare-bar-track"><div class="compare-bar-fill" style="width:${(s / 6) * 100}%"></div></div>
        <span class="compare-bar-val">${s}/6</span>
      </div>
    `;
  }

  return `
    <div class="compare-score">${metrics.total}<span style="font-size:0.4em;font-weight:500;opacity:0.8">/36</span></div>
    <div class="compare-verdict" style="background:${verdictColor(metrics.verdict.cls)}">${metrics.pct}% · ${metrics.verdict.label}</div>
    <div><strong>Role:</strong> ${roleLabel}</div>
    <div class="compare-section">
      <h3>Category Breakdown</h3>
      ${bars}
    </div>
    <div class="compare-section">
      <h3>Piece Profile</h3>
      <div class="compare-piece"><span class="compare-piece-icon">${profile.icon}</span> ${profile.name} (${metrics.matches[metrics.active]}%)</div>
    </div>
    <div class="compare-section">
      <h3>AI-Assist Risk</h3>
      <div class="compare-risk" style="color:${riskColor(metrics.risk.cls)}">${metrics.risk.label}</div>
    </div>
    ${session.notes ? `<div class="compare-section"><h3>Notes</h3><div class="compare-notes">${escapeHtml(session.notes)}</div></div>` : ''}
  `;
}

function verdictColor(cls) {
  if (cls.includes('strong-pass')) return 'rgba(34,197,94,0.25)';
  if (cls.includes('likely-pass')) return 'rgba(0,99,229,0.25)';
  if (cls.includes('borderline')) return 'rgba(245,158,11,0.25)';
  if (cls.includes('unlikely')) return 'rgba(74,85,104,0.25)';
  return 'rgba(229,62,62,0.25)';
}

function riskColor(cls) {
  if (cls === 'risk-low') return '#4ade80';
  if (cls === 'risk-medium') return '#fbbf24';
  return '#f87171';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function populateSelects() {
  const sessions = listSessions();
  const left = document.getElementById('left-select');
  const right = document.getElementById('right-select');
  const opts = sessions.map(renderOption).join('');
  left.innerHTML = '<option value="">Select session…</option>' + opts;
  right.innerHTML = '<option value="">Select session…</option>' + opts;

  if (sessions.length >= 1) left.value = sessions[0].id;
  if (sessions.length >= 2) right.value = sessions[1].id;

  renderSide('left');
  renderSide('right');
}

function renderSide(side) {
  const select = document.getElementById(side + '-select');
  const id = select.value;
  const session = id ? listSessions().find(s => s.id === id) : null;
  document.getElementById(side + '-content').innerHTML = session ? renderCard(session) : renderEmpty();
}

function init() {
  populateSelects();
  document.getElementById('left-select').addEventListener('change', () => renderSide('left'));
  document.getElementById('right-select').addEventListener('change', () => renderSide('right'));
}

init();
