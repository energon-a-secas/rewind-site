import { CATEGORIES, PROBE_NAMES, HELP_CONTENT } from './data.js';
import { state } from './state.js';
import { getPlaceholderName, getCandidateName, sanitizeName, downloadMarkdown } from './utils.js';
import { calculate, updatePieceMatrix } from './scoring.js';
import { generateInternalReport, generateCandidateReport } from './reports.js';

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
}

function resetPieceSelection() {
  state.selectedPiece = null;
  updatePieceMatrix();
}

function downloadInternal() {
  downloadMarkdown(generateInternalReport(), sanitizeName(getCandidateName()) + '-internal-review.md');
}

function downloadFeedback() {
  downloadMarkdown(generateCandidateReport(), sanitizeName(getCandidateName()) + '-feedback.md');
}

function resetAssessment() {
  document.getElementById('candidate-name').value = '';
  document.getElementById('candidate-name').placeholder = getPlaceholderName();
  document.getElementById('notes').value = '';
  const allGroups = Object.keys(CATEGORIES).reduce((arr, k) => arr.concat(CATEGORIES[k].questions), []).concat(PROBE_NAMES);
  allGroups.forEach(name => {
    const mid = document.querySelector(`input[name="${name}"][value="1"]`);
    if (mid) mid.checked = true;
  });
  document.getElementById('tech-probes').removeAttribute('open');
  document.getElementById('own-probes').removeAttribute('open');
  document.getElementById('solve-probes').removeAttribute('open');
  state.selectedPiece = null;
  calculate();
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
  window.scrollTo({ top: scrollTop, behavior: 'smooth' });
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

  const allRadioNames = Object.keys(CATEGORIES).reduce((arr, k) => arr.concat(CATEGORIES[k].questions), []).concat(PROBE_NAMES);
  allRadioNames.forEach(name => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        calculate();
        advanceToNext(name, questionOrder, cards);
      });
    });
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHelp(); });

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
}
