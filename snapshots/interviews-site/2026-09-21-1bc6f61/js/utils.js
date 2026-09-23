import { PLACEHOLDER_NAMES, VERDICTS, CHEAT_NAMES } from './data.js';

export function getPlaceholderName() {
  return PLACEHOLDER_NAMES[Math.floor(Math.random() * PLACEHOLDER_NAMES.length)];
}

export function getCandidateName() {
  return document.getElementById('candidate-name').value.trim() || document.getElementById('candidate-name').placeholder;
}

export function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'candidate';
}

export function today() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getVal(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? parseInt(el.value) : 1;
}

export function getLabel(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  if (!el) return 'Not rated';
  return el.parentElement.querySelector('label').textContent.trim();
}

export function getCatScore(catKey, CATEGORIES) {
  return CATEGORIES[catKey].questions.reduce((s, q) => s + getVal(q), 0);
}

export function getVerdict(pct) {
  return VERDICTS.find(v => pct >= v.min) || VERDICTS[VERDICTS.length - 1];
}

export function getCheatRiskFromScores(scores) {
  const red = CHEAT_NAMES.filter(n => (scores && typeof scores[n] === 'number' ? scores[n] : getVal(n)) === 0).length;
  if (red === 0) return { label: 'Low', cls: 'risk-low' };
  if (red <= 2) return { label: 'Medium', cls: 'risk-medium' };
  return { label: 'High', cls: 'risk-high' };
}

export function getCheatRisk() {
  return getCheatRiskFromScores(null);
}

export function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
