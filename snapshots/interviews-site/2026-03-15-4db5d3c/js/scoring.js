import { CATEGORIES, DIMENSION_ORDER, DIM_TO_CAT, PIECE_PROFILES } from './data.js';
import { state } from './state.js';
import { getVal, getCatScore, getVerdict } from './utils.js';

export function dimMatchScore(actual, expected) {
  if (expected === 'high') return actual >= 5 ? 2 : actual >= 4 ? 1 : 0;
  if (expected === 'medium') return (actual >= 3 && actual <= 4) ? 2 : (actual === 2 || actual === 5) ? 1 : 0;
  return actual <= 2 ? 2 : actual === 3 ? 1 : 0;
}

export function calculatePieceMatches() {
  const catScores = {};
  for (const k in CATEGORIES) catScores[k] = getCatScore(k, CATEGORIES);
  const matches = {};
  for (const p in PIECE_PROFILES) {
    const profile = PIECE_PROFILES[p];
    let total = 0;
    DIMENSION_ORDER.forEach(dim => {
      total += dimMatchScore(catScores[DIM_TO_CAT[dim]], profile.dims[dim]);
    });
    matches[p] = Math.round((total / 12) * 100);
  }
  return matches;
}

export function getBestPiece(matches) {
  let best = null, bestScore = -1;
  for (const p in matches) {
    if (matches[p] > bestScore) { bestScore = matches[p]; best = p; }
  }
  return best;
}

export function updatePieceMatrix() {
  const matches = calculatePieceMatches();
  const best = getBestPiece(matches);
  const active = state.selectedPiece || best;
  for (const p in PIECE_PROFILES) {
    const tile = document.getElementById('piece-' + p);
    document.getElementById('pct-' + p).textContent = matches[p] + '%';
    let cls = 'piece-tile';
    if (p === active) cls += ' selected';
    else if (p === best && state.selectedPiece) cls += ' best-match';
    tile.className = cls;
  }
  const profile = PIECE_PROFILES[active];
  document.getElementById('piece-detail-icon').textContent = profile.icon;
  document.getElementById('piece-detail-name').textContent = profile.name;
  document.getElementById('piece-detail-tag').textContent = (state.selectedPiece ? 'Manual' : 'Best Match') + ' \u2014 ' + matches[active] + '%';
  document.getElementById('piece-detail-desc').textContent = profile.desc;
  let dimsHtml = '';
  DIMENSION_ORDER.forEach(dim => {
    const cat = DIM_TO_CAT[dim];
    const score = getCatScore(cat, CATEGORIES);
    const pct = Math.round((score / 6) * 100);
    const expected = profile.dims[dim];
    const m = dimMatchScore(score, expected);
    const fillCls = m === 2 ? 'dim-high' : m === 1 ? 'dim-mid' : 'dim-low';
    dimsHtml += `<div class="piece-dim-row"><span class="piece-dim-label">${dim}</span>`;
    dimsHtml += `<div class="piece-dim-bar"><div class="piece-dim-fill ${fillCls}" style="width:${pct}%"></div></div>`;
    dimsHtml += `<span class="piece-dim-val">${score}/6</span>`;
    dimsHtml += `<span class="piece-dim-expected">${expected.charAt(0).toUpperCase() + expected.slice(1)}</span></div>`;
  });
  document.getElementById('piece-dims').innerHTML = dimsHtml;
  const autoLabel = document.getElementById('piece-auto-label');
  autoLabel.innerHTML = state.selectedPiece ? '<a onclick="window.resetPieceSelection()">Reset to auto-detect</a>' : 'Auto-detected from scores';
  document.getElementById('sidebar-piece-icon').textContent = profile.icon;
  document.getElementById('sidebar-piece-name').textContent = profile.name + ' (' + matches[active] + '%)';
}

export function updateProbeIndicators() {
  const techWeak = ['tech-1','tech-2','tech-3'].some(n => getVal(n) === 0);
  const techEl = document.getElementById('tech-probes');
  const techTag = document.getElementById('tech-probe-tag');
  if (techWeak) {
    techEl.classList.add('recommended');
    techTag.textContent = '(Recommended)';
  } else {
    techEl.classList.remove('recommended');
    techTag.textContent = '(Optional)';
  }

  const ownWeak = ['own-1','own-2','own-3'].some(n => getVal(n) === 0);
  const ownEl = document.getElementById('own-probes');
  const ownTag = document.getElementById('own-probe-tag');
  if (ownWeak) {
    ownEl.classList.add('recommended');
    ownTag.textContent = '(Recommended)';
  } else {
    ownEl.classList.remove('recommended');
    ownTag.textContent = '(Optional)';
  }

  const solveWeak = ['solve-1','solve-2','solve-3'].some(n => getVal(n) === 0);
  const solveEl = document.getElementById('solve-probes');
  const solveTag = document.getElementById('solve-probe-tag');
  if (solveWeak) {
    solveEl.classList.add('recommended');
    solveTag.textContent = '(Recommended)';
  } else {
    solveEl.classList.remove('recommended');
    solveTag.textContent = '(Optional)';
  }
}

export function calculate() {
  let total = 0;
  for (const key in CATEGORIES) {
    const s = getCatScore(key, CATEGORIES);
    total += s;
    const badge = document.getElementById('badge-' + key);
    badge.textContent = s + '/6';
    badge.className = 'category-badge ' + (s >= 5 ? 'score-high' : s >= 3 ? 'score-mid' : 'score-low');
    document.getElementById('bar-' + key).style.width = ((s / 6) * 100) + '%';
    document.getElementById('val-' + key).textContent = s + '/6';
  }
  const pct = Math.round((total / 36) * 100);
  const verdict = getVerdict(pct);
  document.getElementById('score-pct').innerHTML = pct + '<span>%</span>';
  document.getElementById('verdict-label').textContent = verdict.label;
  document.getElementById('score-total').textContent = total;
  document.getElementById('score-card').className = 'score-card ' + verdict.cls;
  updateProbeIndicators();
  updatePieceMatrix();
}
