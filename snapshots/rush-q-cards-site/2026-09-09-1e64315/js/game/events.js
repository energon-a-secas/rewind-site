// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Event handlers ───────────────────────────────────────────

import { state, save, clearSave, addChronicle } from './state.js';
import { render, renderAssignModal, renderTradeModal, showCardDetail, showTraitBriefing, renderStoryModal, getCardPlayability, showQuarterRecap } from './render.js';
import { startGame, endHumanTurn, playCard, assignPerson, unassignPerson, spendRetroToken, autoAssignPeople, foundationBand } from './engine.js';
import { renderCardHTML } from '../shared/card-component.js';
import { executeTrade } from './markets.js';
import { $, showToast } from './utils.js';
import { convertBudget, isBudgetMode } from './budget.js';
import { trackGameStart, trackActionTaken } from '../shared/analytics.js';
import { showTutorial, isTutorialCompleted } from '../shared/tutorial.js';
import { shouldEndTurn, getSetting } from '../shared/settings.js';

export function bindEvents(s) {
  // Add error handling for event binding
  const startBtn = $('start-btn');
  if (!startBtn) {
    console.error('start-btn not found in DOM');
    return;
  }

  // Prediction beat: record the setup-form forecast AFTER startGame finishes
  // (startGame resets state.forecasts) and open the chronicle with it.
  async function applyForecastFromForm(startPromise) {
    await startPromise;
    const projects = $('forecast-projects')?.value || '';
    const rep = $('forecast-rep')?.value || '';
    const band = $('forecast-band')?.value || '';
    if (!projects && !rep && !band) return;
    state.forecasts.q1 = { projects, rep, band };
    const parts = [];
    if (projects) parts.push(`${projects} projects`);
    if (rep) parts.push(`${rep} reputation`);
    if (band) parts.push(`${band.charAt(0).toUpperCase() + band.slice(1)} team health`);
    addChronicle(state, { kind: 'milestone', text: `You forecast the year: ${parts.join(', ')}.` });
    save(state);
  }

  startBtn.addEventListener('click', () => {
    document.body.classList.add('game-active');
    const name = $('player-name').value.trim() || 'Player';
    const aiCount = parseInt($('ai-count').value) || 2;
    const quarterEl = $('quarter-count');
    const totalQuarters = quarterEl ? parseInt(quarterEl.value) || 8 : 8;

    // Tier 1C: Read complexity mode selection
    const complexityEl = $('complexity-mode');
    state.complexityMode = complexityEl ? complexityEl.value : 'standard';

    // Budget mode toggle
    const budgetEl = $('budget-mode');
    state.budgetMode = budgetEl ? budgetEl.checked : false;

    // Track game start
    trackGameStart('classic', name, aiCount);

    // Budget scenario override
    const scenarioEl = $('budget-scenario');
    if (state.budgetMode && scenarioEl && scenarioEl.value) {
      const scenario = window._budgetScenarios?.find(sc => sc.id === scenarioEl.value);
      if (scenario) {
        state.budget.capExBase = scenario.capExBase;
        state.budget.opExBase = scenario.opExBase;
        applyForecastFromForm(startGame(name, scenario.aiCount, scenario.quarters));
        return;
      }
    }

    if (state.budgetMode) {
      state.budget.capExBase = 12;
      state.budget.opExBase = 8;
    }

    // First game on ANY complexity offers the tutorial — the default setup is
    // 'standard', and a first-timer on the default path should still get the
    // walkthrough (it marks itself completed / skippable).
    const offerTutorial = !isTutorialCompleted('classic') && !window._traitBriefingShown;
    if (offerTutorial) {
      setTimeout(() => showTutorial('classic'), 500);
    }

    applyForecastFromForm(startGame(name, aiCount, totalQuarters));

    // Trait identity briefing: once the human has been dealt a management style
    // (Standard/Expert only), show them who they are and how it plays. Shown once
    // per session so it teaches without nagging; re-openable from the board badge.
    // Skipped when the tutorial is on screen — one teacher at a time.
    if (state.complexityMode !== 'simple' && !window._traitBriefingShown && !offerTutorial) {
      setTimeout(() => {
        if (state.turnPhase !== 'setup' && state.players?.[0]?.trait) {
          window._traitBriefingShown = true;
          showTraitBriefing(state.players[0]);
        }
      }, 700);
    }
  });

  $('player-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('start-btn').click();
  });

  const resumeBtn = $('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      document.body.classList.add('game-active');
      s.turnPhase = 'play';
      render(s);
    });
  }

  document.addEventListener('keydown', e => {
    if (s.turnPhase === 'setup' || s.turnPhase === 'gameOver') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // While an awaited dialog is open (animating), ignore Escape so we never
    // dismiss the modal without resolving its promise — that would deadlock the turn.
    if (s.animating) return;

    if (e.key === 'Escape') {
      closeModal();
      s.selectedCards = [];
      render(s);
      return;
    }

    // Keyboard shortcuts
    const key = e.key.toLowerCase();
    if (key === 'a') { // Assign people
      if (s.turnSubPhase !== 'play') return;
      window._showAssign();
    } else if (key === 'e') { // End turn
      window._endTurn();
    } else if (key === 'h') { // Show tutorial
      window._showTutorial();
    } else if (key === 'p' || key === 'enter') { // Play selected card
      if (s.selectedCards.length) window._playSelected();
    } else if (key === 'v') { // View selected card
      if (s.selectedCards.length === 1) {
        window._showCardDetailById(s.selectedCards[0], 'hand');
      }
    } else if (key === '?') { // Show help modal
      import('../shared/shortcuts.js').then(module => {
        module.showShortcutsModal('classic');
      });
    }
  });

  // Collapsible header on scroll
  let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.header-bar');
    if (!header) return;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down — hide header
      header.classList.add('collapsed');
    } else {
      // Scrolling up — show header
      header.classList.remove('collapsed');
    }
    lastScrollTop = scrollTop;
  });
}

// ── Window-exposed handlers ──────────────────────────────────

window._selectCard = function(cardId) {
  if (state.animating) return;
  const idx = state.selectedCards.indexOf(cardId);
  if (idx >= 0) {
    state.selectedCards.splice(idx, 1);
  } else {
    state.selectedCards = [cardId];
  }
  render(state);
};

window._cancelSelection = function() {
  state.selectedCards = [];
  render(state);
};

/** Double-click shortcut: play a hand card straight from the fan, or toast the
 *  reason it can't be played right now. */
window._playCardDoubleClick = function(cardId) {
  if (state.animating || state.turnSubPhase !== 'play') return;
  const player = state.players[0];
  const card = player && player.hand.find(c => c.id === cardId);
  if (!card) return;
  const play = getCardPlayability(state, card);
  if (!play.playable) { showToast(play.reason); return; }
  state.selectedCards = [cardId];
  window._playSelected();
};

// ── Action economy (human side) ───────────────────────────────
// 3 actions per turn: play a card, trade at a market, or move an already-
// assigned person. Drawing and fresh assignments are free. The engine resets
// state.apLeft each quarter (with board pressure); this layer enforces it.
function apLeft() { return state.apLeft ?? (state.apMax ?? 3); }
function hasAp() {
  if (apLeft() > 0) return true;
  showToast('No actions left this turn: End Turn (E) to continue.');
  return false;
}
function spendAp() {
  state.apLeft = Math.max(0, apLeft() - 1);
}
function isReassign(player, personId) {
  return Object.values(player.assignments || {}).some(list => list.includes(personId));
}

window._playSelected = async function() {
  if (state.animating) return;
  if (!hasAp()) return;
  const cardId = state.selectedCards[0];
  if (!cardId) return;
  const playedName = (state.players[0].hand.find(c => c.id === cardId) || {}).name || '';

  // Capture card position before it's removed from the DOM
  const cardEl = document.querySelector('.hand-card.selected');
  if (cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const fanAngle = cardEl.style.getPropertyValue('--fan-angle') || '0deg';
    // Copy rect properties (DOMRect may be frozen) and attach fan angle
    window._lastPlaySourceRect = {
      top: rect.top, left: rect.left,
      width: rect.width, height: rect.height,
      _fanAngle: parseFloat(fanAngle) || 0
    };
  } else {
    window._lastPlaySourceRect = null;
  }

  state.selectedCards = [];
  state.animating = true;
  render(state);
  const player = state.players[0];
  const played = await playCard(player, cardId);
  if (played) spendAp();
  state.animating = false;
  render(state);
  if (played && playedName) showToast(`▶ Played “${playedName}”`);
};

window._endTurn = function() {
  if (state.animating) return;
  if (!shouldEndTurn()) return;
  trackActionTaken('end_turn');
  state.selectedCards = [];
  endHumanTurn();
};

window._useRetro = async function() {
  if (state.animating) return;
  const player = state.players[0];
  if ((player.retroTokens || 0) < 1) return;
  const result = await spendRetroToken(player);
  if (result?.type === 'peek' && result.card) {
    showToast(`Next event: "${result.card.name}"`, 3000);
  }
  save(state);
  render(state);
};

window._showAssign = function() {
  if (state.animating) return;
  if (state.turnSubPhase !== 'play') return;
  trackActionTaken('assign');
  renderAssignModal(state);
};

window._autoAssign = function() {
  if (state.animating) return;
  if (state.turnSubPhase !== 'play') return;
  const player = state.players[0];
  const assignments = autoAssignPeople(player);
  if (assignments.length) {
    const summary = assignments.map(a => `${a.person.name} → ${a.project.name}`).join(', ');
    showToast(`Auto-assigned: ${summary}`);
  } else {
    showToast('Nothing to assign.');
  }
  save(state);
  render(state);
};

window._assignPerson = function(personId, projectId) {
  const moving = isReassign(state.players[0], personId);
  if (moving && !hasAp()) return;
  assignPerson(state.players[0], personId, projectId);
  if (moving) spendAp();
  renderAssignModal(state);
};

window._unassign = function(personId, projectId) {
  if (state.animating) return;
  unassignPerson(state.players[0], personId, projectId);
};

window._showTrade = function() {
  if (state.animating) return;
  trackActionTaken('trade');
  // Freeze active: skip project queue, only allow For Hire trades
  const projectCards = state.quarterFlags.noNewProject ? [] : state.markets.projectQueue;
  const cards = [...projectCards, ...state.markets.forHire];
  if (cards.length) {
    renderTradeModal(state, cards[0].id);
  }
};

window._showTutorial = function() {
  import('../shared/tutorial.js').then(module => {
    module.showTutorial('classic');
  });
};

window._showTraitBriefing = function() {
  if (state.players?.[0]) showTraitBriefing(state.players[0]);
};

window._tradeMarket = function(cardId) {
  if (state.animating) return;
  // Freeze active: block project queue trades
  if (state.quarterFlags.noNewProject) {
    const card = state.markets.projectQueue.find(c => c.id === cardId);
    if (card) {
      showToast('Cannot trade projects this quarter (Freeze).');
      return;
    }
  }
  renderTradeModal(state, cardId);
};

window._updateTradeTotal = function() {
  const checkboxes = document.querySelectorAll('#trade-select input[type=checkbox]:checked');
  let total = 0;
  const ids = [];
  checkboxes.forEach(cb => {
    total += parseInt(cb.dataset.value) || 0;
    ids.push(cb.value);
  });
  const costText = document.getElementById('trade-total');
  if (costText) {
    const cost = parseInt(costText.textContent.split('/')[1]) || 0;
    costText.textContent = `Selected: ${total} / ${cost}`;
    const met = total >= cost && ids.length > 0;
    costText.classList.toggle('ready', met);
    const btn = document.getElementById('trade-confirm');
    if (btn) {
      btn.disabled = !met;
      btn.classList.toggle('ready', met);
    }
  }
};

window._confirmTrade = function(marketType, marketCardId) {
  if (!hasAp()) return;
  const checkboxes = document.querySelectorAll('#trade-select input[type=checkbox]:checked');
  const ids = [];
  checkboxes.forEach(cb => ids.push(cb.value));
  if (executeTrade(marketType, marketCardId, ids)) {
    spendAp();
    closeModal();
  }
};

window._closeModal = closeModal;

function closeModal() {
  const el = $('modal');
  if (el) el.classList.add('hidden');
}

window._toggleLog = function() {
  state._logHidden = !state._logHidden;
  const ls = $('log-section');
  if (ls) ls.classList.toggle('log-collapsed', state._logHidden);
  save(state);
};

window._toggleHandCompact = function() {
  state._handCompact = !state._handCompact;
  save(state);
  render(state);
};

window._toggleHandSkill = function() {
  state._showHandSkill = !state._showHandSkill;
  save(state);
  render(state);
};

// T4A: Horizontal scroll toggle
window._toggleHorizontalScroll = function() {
  state._horizontalScroll = !state._horizontalScroll;
  const handStrip = document.querySelector('.hand-strip');
  if (state._horizontalScroll) {
    handStrip.classList.add('horizontal-scroll');
  } else {
    handStrip.classList.remove('horizontal-scroll');
  }
  save(state);
  render(state);
};

window._toggleRepGraph = function() {
  state._repGraphOpen = !state._repGraphOpen;
  save(state);
  render(state);
};

window._toggleBoardCardView = function() {
  state._boardCardView = !state._boardCardView;
  save(state);
  render(state);
};

window._newGame = function() {
  document.body.classList.remove('game-active');
  clearSave();
  state.turnPhase = 'setup';
  state.players = [];
  state.gameLog = [];
  state.budgetMode = false;
  state.budget = { capEx: 0, opEx: 0, capExBase: 12, opExBase: 8 };
  $('game-over-modal').classList.add('hidden');
  // Reset budget toggle UI
  const budgetEl = $('budget-mode');
  if (budgetEl) budgetEl.checked = false;
  const scenarioWrap = $('budget-scenario-wrap');
  if (scenarioWrap) scenarioWrap.classList.add('hidden');
  render(state);
};

window._resetGame = function() {
  if (!confirm('Reset the current game? All progress will be lost.')) return;
  window._newGame();
};

// ── Recovery ────────────────────────────────────────────────
// Global recovery: unstick the game if animating gets stuck.
window._recoverGame = function() {
  state.animating = false;
  save(state);
  render(state);
  console.log('Game state recovered');
};

// Show Recover button when animating has been true for >10 seconds.
let _animatingStart = 0;
setInterval(() => {
  const btn = document.getElementById('recover-btn');
  if (!btn) return;
  if (state.animating) {
    if (!_animatingStart) _animatingStart = Date.now();
    btn.classList.toggle('hidden', Date.now() - _animatingStart < 10000);
  } else {
    _animatingStart = 0;
    btn.classList.add('hidden');
  }
}, 1000);

/** Show card detail — find card from any source. */
window._showCardDetailById = function(cardId, source) {
  let card = null;
  const player = state.players[0];
  if (source === 'hand') {
    card = player.hand.find(c => c.id === cardId);
  } else if (source === 'market') {
    card = state.markets.projectQueue.find(c => c.id === cardId) ||
           state.markets.forHire.find(c => c.id === cardId);
  } else if (source === 'projects') {
    for (const p of state.players) {
      card = p.projects.find(c => c.id === cardId);
      if (card) break;
    }
  } else if (source === 'people') {
    for (const p of state.players) {
      card = p.people.find(c => c.id === cardId);
      if (card) break;
    }
  }
  if (card) showCardDetail(card);
};

window._showCardDetail = function(cardId, source) {
  window._showCardDetailById(cardId, source);
};

window._toggleAiPanel = function(side) {
  const panel = document.getElementById(`ai-panel-${side}`);
  if (panel) panel.classList.toggle('collapsed');
};

// ── Budget convert handler ────────────────────────────────────

window._showBudgetConvert = function() {
  if (state.animating || !isBudgetMode(state)) return;
  const b = (state.players[0] && state.players[0].budget) || state.budget;
  const el = $('modal');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="modal-content" role="document">
      <div class="modal-header">
        <h3>Convert Budget</h3>
        <button class="modal-close" onclick="window._closeModal()">&times;</button>
      </div>
      <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:16px">
        Current: CapEx <strong>${b.capEx}</strong> / OpEx <strong>${b.opEx}</strong><br>
        Conversion rate: 2:1
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-convert" ${b.capEx >= 2 ? '' : 'disabled'} onclick="window._doConvert('capToOp')">2 CapEx &rarr; 1 OpEx</button>
        <button class="btn btn-convert" ${b.opEx >= 2 ? '' : 'disabled'} onclick="window._doConvert('opToCap')">2 OpEx &rarr; 1 CapEx</button>
      </div>
    </div>
  `;
};

window._doConvert = function(direction) {
  if (convertBudget(state, state.players[0], direction)) {
    save(state);
    render(state);
    window._showBudgetConvert(); // refresh modal
  } else {
    showToast('Insufficient budget for conversion');
  }
};

// ── Budget scenario loading ──────────────────────────────────

window._budgetScenarios = null;

window._onBudgetToggle = function() {
  const checkbox = $('budget-mode');
  const scenarioWrap = $('budget-scenario-wrap');
  if (!scenarioWrap) return;
  if (checkbox && checkbox.checked) {
    scenarioWrap.classList.remove('hidden');
    if (!window._budgetScenarios) {
      fetch('../data/scenarios-budget.json')
        .then(r => r.json())
        .then(data => {
          window._budgetScenarios = data;
          const sel = $('budget-scenario');
          if (sel) {
            sel.innerHTML = '<option value="">Custom (default)</option>' +
              data.map(sc => `<option value="${sc.id}">${sc.name}: ${sc.description}</option>`).join('');
          }
        })
        .catch(() => { /* ignore */ });
    }
  } else {
    scenarioWrap.classList.add('hidden');
  }
};

// ── Drag-and-drop: assign people to projects ─────────────────

window._dismissTutorial = function() {
  state._tutorialDismissed = true;
};

window._onDragPerson = function(e, personId) {
  e.dataTransfer.setData('text/plain', personId);
  e.dataTransfer.effectAllowed = 'move';
  // Draggable people appear both as compact rows and as board cards.
  const card = e.target.closest('.person-row, .board-card-wrap');
  if (card) {
    card.classList.add('dragging');
    card.addEventListener('dragend', () => card.classList.remove('dragging'), { once: true });
  }
};

window._onDragOverProject = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
};

window._onDragLeaveProject = function(e) {
  e.currentTarget.classList.remove('drag-over');
};

window._onDropProject = function(e, projectId) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const personId = e.dataTransfer.getData('text/plain');
  if (personId && projectId) {
    const moving = isReassign(state.players[0], personId);
    if (moving && !hasAp()) return;
    assignPerson(state.players[0], personId, projectId);
    if (moving) spendAp();
    render(state);
  }
};

// ── Hand card hover preview ───────────────────────────────────


// ── Mobile UI ────────────────────────────────────────────────
// The legacy compact-mode toggle and tap-to-zoom clone are gone: the
// responsive breakpoints in game.css now produce one mobile layout that
// works without a mode switch, and tap-to-zoom hijacked every card tap
// with a 3-second overlay cloned via outerHTML (including its inline
// handlers). Card details remain available through the detail modal.

// ── Debrief integration ───────────────────────────────────────

window._showDebrief = function() {
  Promise.all([
    import('../exercises/post-game.js'),
    import('../exercises/debrief.js')
  ]).then(([postGame, debrief]) => {
    postGame.showPostGameDebrief(debrief.extractGameStats(state));
  });
};

// Quarter recap hook — the engine awaits this between quarters. Headless runs
// (soak, simulators) never register it; the setting turns it off for players.
window._showQuarterRecap = function(recap) {
  if (!getSetting('quarterRecap')) return Promise.resolve();
  return showQuarterRecap(recap);
};

window._showStory = function() {
  renderStoryModal(state);
};

/** Serialize the chronicle as plain text — the workshop debrief artifact. */
function storyAsText() {
  const marks = { milestone: '◆', decision: '»', shift: '~', consequence: '!', whisper: '…' };
  const lines = ['RUSH Q: STORY OF THE YEAR', ''];
  for (const b of (state.chronicle || [])) {
    if (!b || !b.text) continue;
    const cause = b.kind === 'consequence' && b.cause && b.cause !== b.q
      ? ` (seeded in Q${b.cause}${b.avoid ? `, when you ${b.avoid}` : ''})` : '';
    lines.push(`Q${b.q}  ${marks[b.kind] || '•'} ${b.text}${cause}`);
  }
  const human = state.players[0];
  if (human) lines.push('', `Final foundation: ${foundationBand(human.foundation).label} · Final reputation: ${human.reputation}`);
  return lines.join('\n');
}

window._copyStory = function() {
  const text = storyAsText();
  const done = () => showToast('Story copied to clipboard');
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done, () => showToast('Copy failed: select and copy manually'));
  } else {
    showToast('Clipboard unavailable in this browser');
  }
};

window._printStory = function() {
  document.body.classList.add('printing-story');
  const cleanup = () => document.body.classList.remove('printing-story');
  window.addEventListener('afterprint', cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 2000);
};
