// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — event handlers

import { icon } from '../shared/icons.js';
import { state } from './state.js';
import { render } from './render.js';
import { $, escHtml, showToast } from './utils.js';
import { startGame, draftPick, pickAgenda, currentPlayer, doPass, doHire, doCommit, doPush, doPlaySkill, doDraw, doDiscardFromDraw, doPaySquares, doLend, doMulligan, getUncommittedPeople } from './engine.js';
import { getHireCost, isPremium, getMembersNeeded, getSquareCost } from './data.js';
import { resetState } from './state.js';
import { renderCardHTML, galleryLink } from '../shared/card-component.js';
import { shouldEndTurn } from '../shared/settings.js';

export function bindEvents() {
  $('start-btn').addEventListener('click', () => {
    const name = $('player-name').value.trim() || 'Player';
    const aiCount = parseInt($('ai-count').value) || 2;
    startGame(name, aiCount);
  });

  $('player-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('start-btn').click();
  });

  $('log-toggle').addEventListener('click', () => {
    $('log-strip').classList.toggle('expanded');
  });

  // ── View controls ──
  document.addEventListener('click', e => {
    if (e.target.classList.contains('view-btn')) {
      const size = e.target.dataset.size;
      state.cardSize = size;
      render(state);
    }
  });
}

// ── Draft ──

window._draftPick = function(personId) {
  if (state.phase !== 'draft') return;
  const order = state._draftOrder;
  const currentDrafter = order[state.draftTurn];
  if (state.players[currentDrafter]?.isAI) return;
  draftPick(personId);
};

// ── Agenda ──

window._pickAgenda = function(name) {
  if (state.phase !== 'agenda') return;
  pickAgenda(name);
};

// ── Card selection ──

window._selectCard = function(cardId) {
  const human = state.players[0];

  // If must discard (from draw 2 keep 1)
  if (human._mustDiscard) {
    doDiscardFromDraw(cardId);
    return;
  }

  // Toggle selection
  human._selectedCard = human._selectedCard === cardId ? null : cardId;
  render(state);
};

// ── Card detail ──

window._showCardDetail = function(cardId) {
  const human = state.players[0];
  const card = human.hand.find(c => c.id === cardId);
  if (!card) return;

  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="margin:0">Card Details</h3>
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">&times;</button>
    </div>
    ${renderCardHTML(card, { size: 'md' })}
    <div class="rc-gallery-link-row">${galleryLink(card.name)}</div>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn btn-action primary" onclick="document.getElementById('modal').classList.add('hidden');window._selectCard('${card.id}')">Select Card</button>
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Close</button>
    </div>
  </div>`;
};

// ── Actions ──

window._actionPass = function() {
  if (currentPlayer() !== state.players[0]) return;
  if (!shouldEndTurn()) return;
  doPass();
};

window._actionDraw = function() {
  if (currentPlayer() !== state.players[0]) return;
  doDraw();
};

window._doMulligan = function() {
  doMulligan();
};

window._actionPlay = function() {
  const human = state.players[0];
  if (currentPlayer() !== human) return;
  if (!human._selectedCard) return showToast('Select a card first');

  const card = human.hand.find(c => c.id === human._selectedCard);
  if (!card) return;

  if (card._isBudget) {
    // Show modal to choose: hire from pool or pay squares on a project
    showBudgetUseModal(card);
    return;
  }

  human._selectedCard = null;
  doPlaySkill(card.id);
};

window._actionPush = function() {
  const human = state.players[0];
  if (currentPlayer() !== human) return;

  if (!human.projects.length) {
    showToast('No active projects to push on');
    return;
  }

  if (human.projects.length === 1) {
    doPush(human.projects[0].id);
    return;
  }

  // Multiple projects: show picker
  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Push on which project?</h3>
    <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">Discard 1 card to count as +1 person</p>
    ${human.projects.map(p => `
      <button class="btn btn-action" style="display:block;width:100%;margin-bottom:6px"
        onclick="window._doPush('${p.id}')">${escHtml(p.name)} (${getMembersNeeded(p)} needed)</button>
    `).join('')}
    <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
  </div>`;
};

window._doPush = function(projectId) {
  $('modal').classList.add('hidden');
  doPush(projectId);
};

// ── Hire modal ──

window._showHireModal = function(personId) {
  const human = state.players[0];
  if (currentPlayer() !== human || human.hasPassed) return;

  const person = state.peoplePool.find(p => p.id === personId);
  if (!person) return;

  const cost = getHireCost(person);
  const budgetCards = human.hand.filter(c => c._isBudget);
  const totalTri = budgetCards.reduce((sum, c) => sum + c.symbols.filter(s => s === 'tri').length, 0);

  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Hire ${escHtml(person.name)}</h3>
    <p style="font-size:var(--text-sm);color:var(--text-secondary)">
      Cost: <span class="shape-tri">${'&#9650;'.repeat(cost)}</span> (${cost} triangles)
      ${isPremium(person) ? '<br><span style="color:#fbbf24">Counts as 2 people for projects</span>' : ''}
    </p>
    <p style="font-size:var(--text-sm);margin:8px 0">Your budget cards (${totalTri} triangles available):</p>
    <div id="hire-budget-select" style="display:flex;flex-direction:column;gap:4px">
      ${budgetCards.map(c => {
        const tri = c.symbols.filter(s => s === 'tri').length;
        const sq = c.symbols.filter(s => s === 'sq').length;
        return `<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);cursor:pointer">
          <input type="checkbox" value="${c.id}" data-tri="${tri}" onchange="window._updateHireTotal()">
          ${c.name} (${tri ? '<span class="shape-tri">' + '&#9650;'.repeat(tri) + '</span>' : ''}${sq ? '<span class="shape-sq">' + '&#9724;'.repeat(sq) + '</span>' : ''})
        </label>`;
      }).join('')}
    </div>
    <p id="hire-total" style="font-size:var(--text-sm);margin-top:8px">Selected: 0 / ${cost} triangles</p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="hire-confirm" class="btn btn-action primary" disabled onclick="window._confirmHire('${personId}')">Hire</button>
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
    </div>
  </div>`;
};

window._updateHireTotal = function() {
  const checks = document.querySelectorAll('#hire-budget-select input:checked');
  let total = 0;
  checks.forEach(cb => total += parseInt(cb.dataset.tri) || 0);
  const costText = document.getElementById('hire-total');
  if (costText) {
    const cost = parseInt(costText.textContent.split('/')[1]) || 0;
    costText.textContent = `Selected: ${total} / ${cost} triangles`;
    const btn = document.getElementById('hire-confirm');
    if (btn) btn.disabled = total < cost;
  }
};

window._confirmHire = function(personId) {
  const checks = document.querySelectorAll('#hire-budget-select input:checked');
  const ids = [];
  checks.forEach(cb => ids.push(cb.value));
  $('modal').classList.add('hidden');
  doHire(personId, ids);
};

// ── Budget use modal ──

function showBudgetUseModal(card) {
  const human = state.players[0];
  const hasTri = card.symbols.filter(s => s === 'tri').length;
  const hasSq = card.symbols.filter(s => s === 'sq').length;

  const projectsNeedingSq = human.projects.filter(p => {
    const sqNeeded = getSquareCost(p);
    const sqPaid = human.squaresPaid[p.id] || 0;
    return sqNeeded > sqPaid;
  });

  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Use Budget Card</h3>
    <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">
      ${card.name}: ${hasTri ? '<span class="shape-tri">' + '&#9650;'.repeat(hasTri) + '</span> ' : ''}${hasSq ? '<span class="shape-sq">' + '&#9724;'.repeat(hasSq) + '</span>' : ''}
    </p>
    ${hasTri && state.peoplePool.length ? `<p style="font-size:var(--text-sm);margin-bottom:8px"><strong>Hire from pool:</strong></p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
      ${state.peoplePool.map(p => {
        const cost = getHireCost(p);
        const canAfford = hasTri >= cost;
        return `<button class="btn btn-sm btn-action" ${canAfford ? '' : 'disabled'} onclick="window._quickHireWithCard('${p.id}','${card.id}')">
          ${escHtml(p.name)} (${'&#9650;'.repeat(cost)})
        </button>`;
      }).join('')}
    </div>` : ''}
    ${hasSq && projectsNeedingSq.length ? `<p style="font-size:var(--text-sm);margin-bottom:8px"><strong>Pay squares on project:</strong></p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
      ${projectsNeedingSq.map(p => `<button class="btn btn-sm btn-action" onclick="window._paySquaresWithCard('${p.id}','${card.id}')">
        ${escHtml(p.name)} (needs ${'&#9724;'.repeat(getSquareCost(p) - (human.squaresPaid[p.id] || 0))})
      </button>`).join('')}
    </div>` : ''}
    <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
  </div>`;
}

window._quickHireWithCard = function(personId, cardId) {
  $('modal').classList.add('hidden');
  const human = state.players[0];
  human._selectedCard = null;
  doHire(personId, [cardId]);
};

window._paySquaresWithCard = function(projectId, cardId) {
  $('modal').classList.add('hidden');
  const human = state.players[0];
  human._selectedCard = null;
  doPaySquares(projectId, [cardId]);
};

// ── Pay Squares action button ──

window._actionPaySquares = function() {
  const human = state.players[0];
  if (currentPlayer() !== human || human.hasPassed) return;

  const budgetWithSq = human.hand.filter(c => c._isBudget && c.symbols && c.symbols.some(s => s === 'sq'));
  if (!budgetWithSq.length) { showToast('No budget cards with squares'); return; }

  const projectsNeedSq = human.projects.filter(p => {
    const sqNeeded = getSquareCost(p);
    const sqPaid = human.squaresPaid[p.id] || 0;
    return sqNeeded > sqPaid;
  });
  if (!projectsNeedSq.length) { showToast('No projects need squares'); return; }

  if (projectsNeedSq.length === 1) {
    showPaySquaresModal(projectsNeedSq[0], budgetWithSq);
  } else {
    // Multiple projects: pick one first
    const modal = $('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `<div class="modal-content">
      <h3>Pay Squares on Which Project?</h3>
      ${projectsNeedSq.map(p => {
        const remaining = getSquareCost(p) - (human.squaresPaid[p.id] || 0);
        return `<button class="btn btn-action" style="display:block;width:100%;margin-bottom:6px"
          onclick="window._pickProjectForSquares('${p.id}')">
          ${escHtml(p.name)} (needs ${'&#9724;'.repeat(remaining)})
        </button>`;
      }).join('')}
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
    </div>`;
  }
};

window._pickProjectForSquares = function(projectId) {
  const human = state.players[0];
  const project = human.projects.find(p => p.id === projectId);
  if (!project) return;
  const budgetWithSq = human.hand.filter(c => c._isBudget && c.symbols && c.symbols.some(s => s === 'sq'));
  showPaySquaresModal(project, budgetWithSq);
};

function showPaySquaresModal(project, budgetCards) {
  const human = state.players[0];
  const sqNeeded = getSquareCost(project);
  const sqPaid = human.squaresPaid[project.id] || 0;
  const remaining = sqNeeded - sqPaid;

  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Pay Squares: ${escHtml(project.name)}</h3>
    <p style="font-size:var(--text-sm);color:var(--text-secondary)">
      Needs: ${'&#9724;'.repeat(remaining)} (${remaining} remaining)
    </p>
    <p style="font-size:var(--text-sm);margin:8px 0">Select budget cards to spend:</p>
    <div id="sq-budget-select" style="display:flex;flex-direction:column;gap:4px">
      ${budgetCards.map(c => {
        const sq = c.symbols.filter(s => s === 'sq').length;
        const tri = c.symbols.filter(s => s === 'tri').length;
        return `<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);cursor:pointer">
          <input type="checkbox" value="${c.id}" data-sq="${sq}" onchange="window._updateSqTotal()">
          ${c.name} (${sq ? '<span class="shape-sq">' + '&#9724;'.repeat(sq) + '</span>' : ''}${tri ? ' <span class="shape-tri">' + '&#9650;'.repeat(tri) + '</span>' : ''})
        </label>`;
      }).join('')}
    </div>
    <p id="sq-total" style="font-size:var(--text-sm);margin-top:8px" data-need="${remaining}">Selected: 0 / ${remaining} squares</p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="sq-confirm" class="btn btn-action primary" disabled onclick="window._confirmPaySquares('${project.id}')">Pay Squares</button>
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
    </div>
  </div>`;
}

window._updateSqTotal = function() {
  const checks = document.querySelectorAll('#sq-budget-select input:checked');
  let total = 0;
  checks.forEach(cb => total += parseInt(cb.dataset.sq) || 0);
  const totalEl = document.getElementById('sq-total');
  if (totalEl) {
    const need = parseInt(totalEl.dataset.need) || 1;
    totalEl.textContent = `Selected: ${total} / ${need} squares`;
    const btn = document.getElementById('sq-confirm');
    if (btn) btn.disabled = total < need;
  }
};

window._confirmPaySquares = function(projectId) {
  const checks = document.querySelectorAll('#sq-budget-select input:checked');
  const ids = [];
  checks.forEach(cb => ids.push(cb.value));
  $('modal').classList.add('hidden');
  const human = state.players[0];
  human._selectedCard = null;
  doPaySquares(projectId, ids);
};

// ── Commit modal ──

window._showCommitModal = function(projectId) {
  const human = state.players[0];
  if (currentPlayer() !== human || human.hasPassed) return;

  // Look in center first, then in player's own active projects
  let project = state.centerProjects.find(p => p.id === projectId);
  if (!project) project = human.projects.find(p => p.id === projectId);
  if (!project) return;

  const uncommitted = getUncommittedPeople(human);
  if (!uncommitted.length) {
    showToast('No free people to commit');
    return;
  }

  const needed = getMembersNeeded(project);
  const sqCost = getSquareCost(project);

  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Commit to "${escHtml(project.name)}"</h3>
    <p style="font-size:var(--text-sm);color:var(--text-secondary)">
      Needs: ${icon('user')} ${needed} people${sqCost ? ` + &#9724; ${sqCost} squares` : ''} &middot; Reward: ${project.reward || 0} rep
    </p>
    <p style="font-size:var(--text-sm);margin:8px 0">Select people to commit:</p>
    <div id="commit-select" style="display:flex;flex-direction:column;gap:4px">
      ${uncommitted.map(p => {
        const premium = isPremium(p);
        return `<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);cursor:pointer">
          <input type="checkbox" value="${p.id}">
          ${escHtml(p.name)} ${premium ? '<span style="color:#fbbf24">(x2)</span>' : ''}
        </label>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-action primary" onclick="window._confirmCommit('${projectId}')">Commit</button>
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
    </div>
  </div>`;
};

window._confirmCommit = function(projectId) {
  const checks = document.querySelectorAll('#commit-select input:checked');
  const ids = [];
  checks.forEach(cb => ids.push(cb.value));
  if (!ids.length) { showToast('Select at least one person'); return; }
  $('modal').classList.add('hidden');
  doCommit(projectId, ids);
};

// ── Lend modal ──

window._actionLend = function() {
  const human = state.players[0];
  if (currentPlayer() !== human || human.hasPassed) return;

  const uncommitted = getUncommittedPeople(human);
  if (!uncommitted.length) { showToast('No free people to lend'); return; }

  const opponents = state.players.filter(p => p !== human && p.projects.length > 0);
  if (!opponents.length) { showToast('No opponents with active projects'); return; }

  const modal = $('modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Lend a Team Member</h3>
    <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">
      Lend one of your free people to an opponent's project. You draw 2 cards as payment.
    </p>
    <p style="font-size:var(--text-sm);margin-bottom:6px"><strong>Who to lend:</strong></p>
    <div id="lend-person-select" style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
      ${uncommitted.map(p => `<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);cursor:pointer">
        <input type="radio" name="lend-person" value="${p.id}">
        ${escHtml(p.name)} ${isPremium(p) ? '<span style="color:#fbbf24">(x2)</span>' : ''}
      </label>`).join('')}
    </div>
    <p style="font-size:var(--text-sm);margin-bottom:6px"><strong>Lend to which project:</strong></p>
    <div id="lend-target-select" style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
      ${opponents.map(opp => {
        const oppIdx = state.players.indexOf(opp);
        return opp.projects.map(proj => `<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);cursor:pointer">
          <input type="radio" name="lend-target" value="${oppIdx}:${proj.id}">
          ${escHtml(opp.name)}'s "${escHtml(proj.name)}"
        </label>`).join('');
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-action primary" onclick="window._confirmLend()">Lend</button>
      <button class="btn btn-sm" onclick="document.getElementById('modal').classList.add('hidden')">Cancel</button>
    </div>
  </div>`;
};

window._confirmLend = function() {
  const personRadio = document.querySelector('#lend-person-select input:checked');
  const targetRadio = document.querySelector('#lend-target-select input:checked');
  if (!personRadio) { showToast('Select a person to lend'); return; }
  if (!targetRadio) { showToast('Select a target project'); return; }

  const personId = personRadio.value;
  const [targetIdx, projectId] = targetRadio.value.split(':');
  $('modal').classList.add('hidden');
  doLend(personId, parseInt(targetIdx), projectId);
};

// ── Tutorial ──

const TUTORIAL_STEPS = [
  { title: 'Welcome to Quick Mode!', text: 'Draft your team, complete projects, and outmaneuver rivals in 3 quarters. Let\'s walk through the basics.' },
  { title: 'Drafting', text: 'You start by picking 2 team members in a snake draft. Premium people (gold border) count as 2 when assigned to projects.' },
  { title: 'Your Turn', text: 'Each turn you can: Draw cards, Play a skill or budget card, Commit people to projects, Push (discard to add +1), Lend to opponents, or Pass.' },
  { title: 'Budget Cards', text: 'Triangles hire people. Squares pay project costs. Spend them on hires and project costs while they\'re in your hand.' },
  { title: 'Projects', text: 'Commit enough people before the quarter ends to score the reward. Partially-staffed projects give reduced credit.' },
  { title: 'Secret Agenda', text: 'Your agenda gives +10 bonus at game end if completed. Nobody else can see it. Choose wisely!' },
  { title: 'Good luck!', text: 'Management directives reward the first player to achieve them. Crisis cards hit everyone. Adapt and win!' },
];

export function showTutorial() {
  if (localStorage.getItem('rushq_tutorial_seen')) return;
  showTutorialStep(0);
}

function showTutorialStep(idx) {
  const step = TUTORIAL_STEPS[idx];
  if (!step) {
    localStorage.setItem('rushq_tutorial_seen', '1');
    const el = $('tutorial-overlay');
    if (el) el.remove();
    return;
  }

  let overlay = $('tutorial-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);
  }

  const isLast = idx === TUTORIAL_STEPS.length - 1;
  overlay.innerHTML = `<div class="tutorial-box">
    <div class="tutorial-step">Step ${idx + 1} of ${TUTORIAL_STEPS.length}</div>
    <h3>${step.title}</h3>
    <p>${step.text}</p>
    <div class="tutorial-btns">
      ${idx > 0 ? '<button class="btn btn-sm" onclick="window._tutorialStep(' + (idx - 1) + ')">Back</button>' : ''}
      <button class="btn btn-action primary" onclick="window._tutorialStep(${idx + 1})">${isLast ? 'Start Playing' : 'Next'}</button>
      <button class="btn btn-sm" onclick="window._tutorialSkip()">Skip</button>
    </div>
  </div>`;
}

window._tutorialStep = function(idx) { showTutorialStep(idx); };
window._tutorialSkip = function() {
  localStorage.setItem('rushq_tutorial_seen', '1');
  const el = $('tutorial-overlay');
  if (el) el.remove();
};

// ── Drag-and-drop: commit people to projects ─────────────────
// Intuitive alternative to the Commit modal. Dragging a free team member
// onto any project drop zone (center or your own) commits that one person —
// the same path as clicking Commit + selecting one person.

window._qgDragPerson = function(e, personId) {
  const human = state.players[0];
  if (currentPlayer() !== human || human.hasPassed) { e.preventDefault(); return; }
  e.dataTransfer.setData('text/plain', personId);
  e.dataTransfer.effectAllowed = 'move';
  const row = e.target.closest('.qg-my-person');
  if (row) row.classList.add('qg-dragging');
};

window._qgDragEnd = function(e) {
  const row = e.target.closest('.qg-my-person');
  if (row) row.classList.remove('qg-dragging');
  document.querySelectorAll('.qg-drop-active').forEach(el => el.classList.remove('qg-drop-active'));
};

window._qgDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('qg-drop-active');
};

window._qgDragLeave = function(e) {
  e.currentTarget.classList.remove('qg-drop-active');
};

window._qgDrop = function(e, projectId) {
  e.preventDefault();
  e.currentTarget.classList.remove('qg-drop-active');
  const human = state.players[0];
  if (currentPlayer() !== human || human.hasPassed) return;

  const personId = e.dataTransfer.getData('text/plain');
  if (!personId || !projectId) return;

  // Guard: person must still be free (uncommitted) and owned by the human.
  const free = getUncommittedPeople(human).some(p => p.id === personId);
  if (!free) { showToast('That person is already committed'); return; }

  doCommit(projectId, [personId]);
};

// ── New game ──

window._newGame = function() {
  resetState();
  render(state);
};
