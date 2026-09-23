// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── DOM rendering ────────────────────────────────────────────

import { state } from './state.js';
import { escHtml, $ } from './utils.js';
import { typeColor } from './data.js';
import { cardImagePath } from '../shared/cards-data.js';
import { renderCardHTML, galleryLink } from '../shared/card-component.js';
import { getAssignedPeople, getUnassignedPeople } from './engine.js';
import { isBudgetMode, canAffordOpEx, canAffordCapEx } from './budget.js';
import { showPostGameDebrief } from '../exercises/post-game.js';
import { extractGameStats } from '../exercises/debrief.js';
import { maybeShowHint } from '../shared/hints.js';
import { getTraitBriefing } from './traits.js';

/** Convert card name to image src path (root-absolute, loads from any route). */
function cardImg(card) {
  return cardImagePath(card.name);
}

/** Look up a card object by name from current game state. */
function findCardByName(name) {
  if (!name) return null;
  for (const pl of state.players) {
    const c = pl.hand.find(c => c.name === name)
           || pl.projects.find(c => c.name === name)
           || pl.people.find(c => c.name === name);
    if (c) return c;
  }
  const m = (state.markets.projectQueue || []).find(c => c.name === name)
         || (state.markets.forHire || []).find(c => c.name === name);
  if (m) return m;
  return (state.discard || []).find(c => c.name === name) || null;
}

/** Main render — rebuilds the entire UI from state. */
export function render(s) {
  if (s.turnPhase === 'setup') {
    $('setup-screen').classList.remove('hidden');
    $('game-screen').classList.add('hidden');
    return;
  }

  $('setup-screen').classList.add('hidden');
  $('game-screen').classList.remove('hidden');

  // Tier 1C: Apply complexity mode to UI
  const isSimple = s.complexityMode === 'simple';
  const isExpert = s.complexityMode === 'expert';

  renderTopBar(s);
  renderBoard(s);

  // Hide/show AI panels based on complexity
  if (!isSimple) {
    renderAiPanels(s);
  } else {
    // Collapse AI panels in simple mode
    const leftPanel = $('ai-panel-left');
    const rightPanel = $('ai-panel-right');
    if (leftPanel) leftPanel.classList.add('collapsed');
    if (rightPanel) rightPanel.classList.add('collapsed');
  }

  // Hide deck stats in simple mode (too much detail)
  if (!isSimple) {
    renderDeckStats(s);
  }

  renderPlayerScore(s);
  renderHand(s);
  renderLog();
  renderActions(s);

  // Sync log-section collapse state
  const ls = $('log-section');
  if (ls) ls.classList.toggle('log-collapsed', !!s._logHidden);

  // Hide budget UI in simple mode
  const budgetBar = document.querySelector('.budget-metrics');
  if (budgetBar) {
    budgetBar.style.display = isSimple ? 'none' : 'flex';
  }

  if (s.turnPhase === 'gameOver') {
    renderGameOver(s);
  }
}

function renderTopBar(s) {
  const el = $('top-bar');
  const total = s.totalQuarters || 8;

  // Quarter chips with connecting lines
  const qChips = Array.from({ length: total }, (_, i) => {
    const cls = i < s.currentQuarter - 1 ? 'q-chip q-done' : i === s.currentQuarter - 1 ? 'q-chip q-current' : 'q-chip';
    const line = i < total - 1 ? '<span class="q-line"></span>' : '';
    return `<span class="${cls}">Q${i + 1}</span>${line}`;
  }).join('');

  // Deck count chips
  const deckChips = `<div class="top-bar-decks">
    <span class="tbd-chip tbd-main">M <strong>${s.decks.main.length}</strong></span>
    <span class="tbd-chip tbd-events">EV <strong>${s.decks.events.length}</strong></span>
    <span class="tbd-chip tbd-rushq">RQ <strong>${s.decks.rushQ.length}</strong></span>
    <span class="tbd-chip tbd-layoffs">LY <strong>${s.decks.layoffs.length}</strong></span>
    <span class="tbd-chip tbd-discard">DI <strong>${s.discard.length}</strong></span>
  </div>`;

  const scores = s.players.map(p =>
    `<div class="score-chip ${p.isAI ? '' : 'human'}">
       <span class="score-name">${escHtml(p.name)}</span>
       <span class="score-val">${p.reputation}</span>
     </div>`
  ).join('');

  // Turn phase indicator — actively shows current sub-phase
  let phaseHtml = '';
  if (s.turnPhase === 'play') {
    const sub = s.turnSubPhase || 'play';
    const q = s.currentQuarter;

    // Build turn steps
    const turnSteps = [];
    if (q >= 2) turnSteps.push({ id: 'event', label: 'Event' });
    turnSteps.push({ id: 'play', label: 'Play' });
    turnSteps.push({ id: 'end', label: 'End Turn' });

    // Build quarter-end steps
    const qSteps = [];
    qSteps.push({ id: 'progress', label: 'Progress' });
    if (q >= 2) qSteps.push({ id: 'rushQ', label: 'Rush Q' });
    if (q >= 5) qSteps.push({ id: 'layoffs', label: 'Layoffs' });

    // Determine step states
    const stepState = (id) => {
      if (sub === 'resolution') {
        // During resolution: turn steps are done, quarter steps are active
        if (['event', 'play', 'end'].includes(id)) return 'done';
        return 'active';
      }
      if (sub === 'aiTurns') {
        // During AI turns: turn steps done, quarter steps upcoming
        if (['event', 'play', 'end'].includes(id)) return 'done';
        return '';
      }
      if (sub === 'event') {
        if (id === 'event') return 'active';
        return '';
      }
      if (sub === 'play') {
        if (id === 'event') return 'done';
        if (id === 'play') return 'active';
        return '';
      }
      return '';
    };

    const renderStep = (step) => {
      const st = stepState(step.id);
      return `<span class="phase-step ${st}">${step.label}</span>`;
    };

    const turnHtml = turnSteps.map((s, i) =>
      `${i > 0 ? '<span class="phase-sep">&rsaquo;</span>' : ''}${renderStep(s)}`
    ).join('');

    const qHtml = qSteps.map((s, i) =>
      `${i > 0 ? '<span class="phase-sep">&rsaquo;</span>' : ''}${renderStep(s)}`
    ).join('');

    let statusLabel = '';
    if (sub === 'aiTurns') statusLabel = '<span class="phase-ai-label">Opponents playing...</span>';

    phaseHtml = `<div class="phase-indicator">
      <span class="phase-group">${turnHtml}</span>
      <span class="phase-divider"></span>
      <span class="phase-group">${qHtml}</span>
      ${statusLabel}
    </div>`;
  }

  el.innerHTML = `
    <div class="quarter-track">
      <span class="quarter-label">Quarter</span>
      <div class="q-dots">${qChips}</div>
    </div>
    ${deckChips}
    ${phaseHtml}
    ${isBudgetMode(s) ? renderBudgetBar(s) : ''}
    <div class="scores">${scores}</div>
    <button class="btn btn-reset" onclick="window._resetGame()" title="Reset game">Reset</button>
    <button id="recover-btn" class="btn btn-reset hidden" onclick="window._recoverGame()" title="Recover stuck game">Recover</button>
  `;
}

function renderBudgetBar(s) {
  maybeShowHint('classic-first-budget');
  const b = (s.players[0] && s.players[0].budget) || s.budget;
  const capPct = b.capExBase > 0 ? Math.round((b.capEx / b.capExBase) * 100) : 0;
  const opPct = b.opExBase > 0 ? Math.round((b.opEx / b.opExBase) * 100) : 0;
  return `<div class="budget-bar">
    <div class="budget-pool">
      <span class="budget-label">CapEx</span>
      <div class="budget-track"><div class="budget-fill budget-fill-cap" style="width:${capPct}%"></div></div>
      <span class="budget-val">${b.capEx}/${b.capExBase}</span>
    </div>
    <div class="budget-pool">
      <span class="budget-label">OpEx</span>
      <div class="budget-track"><div class="budget-fill budget-fill-op" style="width:${opPct}%"></div></div>
      <span class="budget-val">${b.opEx}/${b.opExBase}</span>
    </div>
  </div>`;
}

/** Render the main board — markets + human player only. */
function renderBoard(s) {
  const el = $('board');
  let html = '';

  // First-turn contextual hint (coach-mark anchored to the hand)
  if (s.currentQuarter === 1) {
    maybeShowHint('classic-first-turn');
  }

  // Timeline and reputation graph
  html += renderTimeline(s);
  html += renderReputationGraph(s);

  // Markets at top
  html += renderMarkets(s);

  // Human player panel
  const p = s.players[0];
  if (p) {
    const cardView = s._boardCardView;
    const hb = getTraitBriefing(p);
    html += `<div class="player-panel human-panel">`;
    html += `<div class="panel-header">
      <span class="panel-name">${escHtml(p.name)}</span>
      ${hb ? `<button class="trait-badge" onclick="window._showTraitBriefing()" title="${escHtml(hb.blurb)}">${escHtml(hb.archetype)}</button>` : ''}
      <span class="panel-rep">${p.reputation} rep</span>
      <button class="board-view-toggle" onclick="window._toggleBoardCardView()" title="${cardView ? 'Switch to compact view' : 'Switch to card view'}">
        ${cardView ? '☰' : '🗂'}
      </button>
    </div>`;

    // Projects + Team side by side
    html += '<div class="board-columns">';

    if (cardView) {
      // Card view — rendered cards
      html += '<div class="panel-section"><div class="panel-label">Projects</div><div class="board-card-grid">';
      if (p.projects.length) {
        for (const proj of p.projects) {
          const assigned = getAssignedPeople(p, proj.id);
          const needed = proj.members || 0;
          const statusLabel = proj.isCompleted ? '✓ Done' : `${assigned.length}/${needed}p · ${proj.timeSpent || 0}/${proj.deadline || '?'}q`;
          const dropAttrs = !proj.isCompleted
            ? ` ondragover="window._onDragOverProject(event)" ondragleave="window._onDragLeaveProject(event)" ondrop="window._onDropProject(event,'${proj.id}')"`
            : '';
          html += `<div class="board-card-wrap" onclick="window._showCardDetailById('${proj.id}','projects')"${dropAttrs}>
            ${renderCardHTML(proj, { size: 'sm' })}
            <div class="board-card-status">${statusLabel}</div>
          </div>`;
        }
      } else {
        html += '<div class="empty-msg">No projects</div>';
      }
      html += '</div></div>';

      const unassignedPeople = getUnassignedPeople(p);
      html += `<div class="panel-section"><div class="panel-label">Available Team (${unassignedPeople.length}/${p.people.length})</div><div class="board-card-grid">`;
      if (unassignedPeople.length) {
        for (const person of unassignedPeople) {
          html += `<div class="board-card-wrap" draggable="true" ondragstart="window._onDragPerson(event,'${person.id}')" onclick="window._showCardDetail('${person.id}','people')">
            ${renderCardHTML(person, { size: 'sm' })}
          </div>`;
        }
      } else if (p.people.length) {
        html += '<span class="empty-msg">All assigned to projects</span>';
      } else {
        html += '<span class="empty-msg">No team members</span>';
      }
      html += '</div></div>';
    } else {
      // Compact view — original rows
      html += '<div class="panel-section"><div class="panel-label">Projects</div><div class="project-rows">';
      if (p.projects.length) {
        for (const proj of p.projects) {
          html += renderProjectRow(p, proj, true);
        }
      } else {
        html += '<div class="empty-msg">No projects</div>';
      }
      html += '</div></div>';

      const unassignedPeople = getUnassignedPeople(p);
      html += `<div class="panel-section"><div class="panel-label">Available Team (${unassignedPeople.length}/${p.people.length})</div><div class="people-rows">`;
      if (unassignedPeople.length) {
        for (const person of unassignedPeople) {
          html += renderPersonRow(person, true);
        }
      } else if (p.people.length) {
        html += '<span class="empty-msg">All assigned to projects</span>';
      } else {
        html += '<span class="empty-msg">No team members</span>';
      }
      html += '</div></div>';
    }

    html += '</div>'; // close board-columns

    // Pending effects indicators
    const effects = (p.pendingEffects || []).filter(e => e.sourceCardName);
    if (effects.length) {
      html += '<div class="panel-section"><div class="panel-label">Active Effects</div><div class="pending-effects-row">';
      for (const eff of effects) {
        const labels = {
          mentorshipHire: 'Mentorship — hire next quarter',
          onboardingBuy: 'Onboarding — 2 For Hire next quarter',
          nullifyRushQ: 'Specialist — nullify next Rush Q',
          bonusOnComplete: 'Specialist — bonus on completion',
        };
        const label = labels[eff.type] || eff.sourceCardName;
        html += `<div class="pending-effect-badge" title="${escHtml(label)}">
          <span class="pe-glow"></span>
          <span class="pe-name">${escHtml(eff.sourceCardName)}</span>
          <span class="pe-desc">${escHtml(label)}</span>
        </div>`;
      }
      html += '</div></div>';
    }

    html += '</div>';
  }

  el.innerHTML = html;
}

/** Render a project as a compact row. */
function renderProjectRow(player, proj, isHuman) {
  const assigned = getAssignedPeople(player, proj.id);
  const needed = proj.members || 0;
  const timePct = proj.deadline > 0 ? Math.min(100, Math.round(((proj.timeSpent || 0) / proj.deadline) * 100)) : 0;
  const overdue = !proj.isCompleted && proj.deadline > 0 && (proj.timeSpent || 0) > proj.deadline;
  const color = typeColor(proj.type);
  const dropAttrs = isHuman && !proj.isCompleted
    ? ` ondragover="window._onDragOverProject(event)" ondragleave="window._onDragLeaveProject(event)" ondrop="window._onDropProject(event,'${proj.id}')"`
    : '';

  // Status
  const timeLeft = (proj.deadline || 0) - (proj.timeSpent || 0);
  const staffed = assigned.length >= needed;
  let statusCls = 'active', statusLabel = 'Active';
  if (proj.isCompleted) { statusCls = 'done'; statusLabel = 'Done'; }
  else if (overdue) { statusCls = 'late'; statusLabel = 'Overdue'; }

  // Forecast
  let forecastCls = '', forecastLabel = '';
  if (!proj.isCompleted && !overdue && timeLeft > 0) {
    if (timeLeft === 1 && !staffed) { forecastCls = 'urgent'; forecastLabel = '1 quarter left!'; }
    else if (timeLeft === 1 && staffed) { forecastCls = 'needs-more'; forecastLabel = 'Final quarter'; }
    else if (staffed) { forecastCls = 'on-track'; forecastLabel = 'On track'; }
    else if (assigned.length > 0) { forecastCls = 'needs-more'; forecastLabel = `Need ${needed - assigned.length} more`; }
    else { forecastCls = 'at-risk'; forecastLabel = 'Unstaffed'; }
  }

  // Progress color
  const progressColor = proj.isCompleted ? 'var(--stat-reward)' : overdue ? 'var(--type-quarter-event)' : color;

  // People slots (inline emoji dots)
  const slots = [];
  for (let i = 0; i < needed; i++) {
    const person = assigned[i];
    if (person) {
      const emoji = person.emoji || '👤';
      const unassignAttr = isHuman && !proj.isCompleted
        ? `onclick="event.stopPropagation();window._unassign('${person.id}','${proj.id}')" title="${escHtml(person.name)} (click to unassign)"`
        : `title="${escHtml(person.name)}"`;
      slots.push(`<span class="pr-slot filled" ${unassignAttr}>${emoji}</span>`);
    } else {
      slots.push(`<span class="pr-slot empty"></span>`);
    }
  }
  const slotsHtml = slots.length ? `<span class="pr-slots">${slots.join('')}</span>` : '';

  return `<div class="proj-row ${statusCls}" style="--card-accent:${color}"${dropAttrs} tabindex="0" role="button" aria-label="${escHtml(proj.name)}" onclick="window._showCardDetailById('${proj.id}','projects')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window._showCardDetailById('${proj.id}','projects')}" data-card-name="${escHtml(proj.name)}">
    <span class="pr-pip" style="background:${color}"></span>
    <span class="pr-name">${escHtml(proj.name)}</span>
    <span class="pr-progress"><span class="pr-progress-fill" style="width:${timePct}%;background:${progressColor}"></span></span>
    <span class="pr-stats">
      <span>${proj.timeSpent || 0}/${proj.deadline || '?'}q</span>
      <span>${assigned.length}/${needed}p</span>
      ${proj.reward ? `<span class="pr-reward">+${proj.reward}</span>` : ''}
    </span>
    ${slotsHtml}
    <span class="pr-badge ${statusCls}">${statusLabel}</span>
    ${forecastLabel ? `<span class="pr-forecast ${forecastCls}">${forecastLabel}</span>` : ''}
  </div>`;
}

/** Render a person as a compact row. */
function renderPersonRow(person, isDraggable) {
  const emoji = person.emoji || '👤';
  const color = typeColor(person.type);
  const dragAttrs = isDraggable
    ? ` draggable="true" ondragstart="window._onDragPerson(event,'${person.id}')"`
    : '';
  return `<div class="person-row"${dragAttrs} tabindex="0" role="button" aria-label="${escHtml(person.name)}" onclick="window._showCardDetail('${person.id}','people')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window._showCardDetail('${person.id}','people')}" data-card-name="${escHtml(person.name)}">
    <span class="psr-emoji">${emoji}</span>
    <span class="psr-name">${escHtml(person.name)}</span>
    <span class="psr-type" style="color:${color}">${escHtml(person.type)}</span>
    ${person.value ? `<span class="psr-val">${person.value}v</span>` : ''}
  </div>`;
}


/** Render AI panels — all opponents on the left side. */
function renderAiPanels(s) {
  const aiPlayers = s.players.filter(p => p.isAI);
  const leftEl = $('ai-left-content');
  if (!leftEl) return;

  leftEl.innerHTML = aiPlayers.map(p => renderAiSummary(p)).join('');

  const leftPanel = $('ai-panel-left');
  if (leftPanel) leftPanel.style.display = aiPlayers.length ? '' : 'none';

  // Hide right AI panel — all opponents on left now
  const rightPanel = $('ai-panel-right');
  if (rightPanel) rightPanel.style.display = 'none';
}

function renderAiSummary(p) {
  const projCount = p.projects.length;
  const activeCount = p.projects.filter(pr => !pr.isCompleted).length;
  const doneCount = projCount - activeCount;

  return `<div class="ai-summary-block">
    <div class="ai-summary-header">
      <span class="ai-summary-name">${escHtml(p.name)}</span>
      <span class="ai-summary-rep">${p.reputation} rep</span>
    </div>
    <div class="ai-summary-stats">
      <span>Projects: ${activeCount} active, ${doneCount} done</span>
      <span>Team: ${p.people.length}</span>
      <span>Hand: ${p.hand.length} cards</span>
    </div>
    <div class="ai-summary-projects">
      ${p.projects.map(proj => {
        const assigned = getAssignedPeople(p, proj.id);
        const timePct = proj.deadline > 0 ? Math.min(100, Math.round(((proj.timeSpent || 0) / proj.deadline) * 100)) : 0;
        return `<div class="ai-mini-proj ${proj.isCompleted ? 'done' : ''}">
          <span class="ai-proj-name">${escHtml(proj.name)}</span>
          <span class="ai-proj-info">${assigned.length}/${proj.members || '?'}p ${proj.timeSpent || 0}/${proj.deadline || '?'}q</span>
          <div class="ai-proj-bar"><div class="ai-proj-bar-fill" style="width:${timePct}%"></div></div>
        </div>`;
      }).join('') || '<div class="empty-msg">No projects</div>'}
    </div>
    <div class="ai-summary-people">
      ${p.people.map(person => {
        const isAssigned = Object.values(p.assignments).some(ids => ids.includes(person.id));
        return `<span class="ai-person-tag ${isAssigned ? 'busy' : ''}">${escHtml(person.name)}</span>`;
      }).join('') || '<span class="empty-msg">No team</span>'}
    </div>
  </div>`;
}

function renderMarkets(s) {
  let html = '<div class="markets-row">';

  // Project Queue
  html += '<div class="market-panel"><div class="panel-label">Project Queue</div><div class="market-cards">';
  for (const c of s.markets.projectQueue) {
    html += renderMarketCard(c);
  }
  if (!s.markets.projectQueue.length) html += '<div class="empty-msg">Empty</div>';
  html += '</div></div>';

  // For Hire
  if (s.forHireUnlocked) {
    html += '<div class="market-panel"><div class="panel-label">For Hire</div><div class="market-cards">';
    for (const c of s.markets.forHire) {
      html += renderMarketCard(c);
    }
    if (!s.markets.forHire.length) html += '<div class="empty-msg">Empty</div>';
    html += '</div></div>';
  }

  html += '</div>';
  if (s.markets.projectQueue.length || (s.forHireUnlocked && s.markets.forHire.length)) {
    maybeShowHint('classic-first-market');
  }
  return html;
}

function renderMarketCard(card) {
  const color = typeColor(card.type);
  const stats = [];
  if (card.value) stats.push(`${card.value}v`);
  if (card.members) stats.push(`${card.members}p`);
  if (card.deadline) stats.push(`${card.deadline}q`);
  if (card.reward) stats.push(`+${card.reward}`);

  return `<div class="market-strip" tabindex="0" role="button" aria-label="${escHtml(card.name)}, ${escHtml(card.type)}" onclick="window._tradeMarket('${card.id}')" ondblclick="window._showCardDetailById('${card.id}','market')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window._tradeMarket('${card.id}')}" data-card-name="${escHtml(card.name)}">
    <span class="market-strip-pip" style="background:${color}"></span>
    <span class="market-strip-name">${escHtml(card.name)}</span>
    ${stats.length ? `<span class="market-strip-stats">${stats.map(s => `<span>${s}</span>`).join('')}</span>` : ''}
  </div>`;
}

function renderDeckStats(s) {
  const el = $('deck-stats');
  if (!el) return;
  el.innerHTML = `
    <div class="deck-count dc-main"><span class="dc-label">Main</span><span class="dc-val">${s.decks.main.length}</span></div>
    <div class="deck-count dc-events"><span class="dc-label">Events</span><span class="dc-val">${s.decks.events.length}</span></div>
    <div class="deck-count dc-rushq"><span class="dc-label">Rush Q</span><span class="dc-val">${s.decks.rushQ.length}</span></div>
    <div class="deck-count dc-layoffs"><span class="dc-label">Layoffs</span><span class="dc-val">${s.decks.layoffs.length}</span></div>
    <div class="deck-count dc-discard"><span class="dc-label">Discard</span><span class="dc-val">${s.discard.length}</span></div>
  `;
}

function renderPlayerScore(s) {
  const el = $('player-score-bar');
  if (!el || !s.players[0]) return;
  const p = s.players[0];
  el.innerHTML = `<span class="psb-label">Your REP</span><span class="psb-val">${p.reputation}</span>`;
}

function renderHand(s) {
  const el = $('hand');
  const player = s.players[0];
  if (!player) { el.innerHTML = ''; return; }

  const count = player.hand.length;
  const isPlayTurn = s.turnSubPhase === 'play' && !s.animating;

  let html = `<div class="hand-label">Your Hand (${count})</div>`;

  if (s._handCompact) {
    // Compact list view
    html += '<div class="hand-compact-list">';
    player.hand.forEach(card => {
      const color = typeColor(card.type);
      const selected = s.selectedCards.includes(card.id) ? 'selected' : '';
      html += `<div class="hcl-row ${selected}" style="--card-accent:${color}" onclick="window._selectCard('${card.id}')" ondblclick="window._showCardDetailById('${card.id}','hand')">
        <span class="hcl-pip"></span>
        <span class="hcl-name">${escHtml(card.name)}</span>
        <span class="hcl-type" style="color:${color}">${escHtml(card.type)}</span>
        ${card.value ? `<span class="hcl-val">\u25C7${card.value}</span>` : ''}
        <button class="hcl-play" onclick="event.stopPropagation();window._selectCard('${card.id}');window._playSelected()">&#9654;</button>
        <button class="hcl-view" onclick="event.stopPropagation();window._showCardDetailById('${card.id}','hand')">&#8857;</button>
      </div>`;
    });
    html += '</div>';
  } else {
    // Fan view
    const SPREAD_DEG = Math.min(8, count > 1 ? 60 / count : 0);
    const Y_MULT = 8;
    html += `<div class="hand-cards${isPlayTurn ? ' play-turn' : ''}">`;
    player.hand.forEach((card, index) => {
      const color = typeColor(card.type);
      const selected = s.selectedCards.includes(card.id) ? 'selected' : '';
      const angle = (index - (count - 1) / 2) * SPREAD_DEG;
      const yOffset = Math.abs(index - (count - 1) / 2) * Y_MULT;

      // Tier 2A: Use simplified cards on mobile for better UX
      const isMobile = window.innerWidth <= 768;
      const simplified = isMobile; // Mobile gets simplified view, desktop gets full detail

      html += `<div class="hand-card ${selected}" style="--fan-angle:${angle}deg;--fan-y:${yOffset}px;--card-accent:${color};z-index:${index}" tabindex="0" role="button" aria-label="${escHtml(card.name)}, ${escHtml(card.type)}" onclick="window._selectCard('${card.id}')" ondblclick="window._showCardDetailById('${card.id}','hand')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window._selectCard('${card.id}')}" onmouseenter="window._showCardHover(event,'${card.id}')" onmouseleave="window._hideCardHover()" data-card-name="${escHtml(card.name)}">
        <div class="card-type-label" style="color:${color};border-color:${color}33;background:${color}18">${escHtml(card.type)}</div>
        ${renderCardHTML(card, { size: 'sm', simplified, showImage: true })}
        <button class="hand-play-btn" onclick="event.stopPropagation();window._selectCard('${card.id}');window._playSelected()">&#9654; Play</button>
        ${!simplified && isBudgetMode(s) && (card.type === 'Soft' || card.type === 'Hard' || card.type === 'Power') && (card.value || 0) > 0
          ? `<span class="budget-cost-badge ${canAffordOpEx(s, s.players[0], card.value) ? '' : 'insufficient'}">${card.value} OpEx</span>` : ''}
      </div>`;
    });
    html += '</div>';
  }

  el.innerHTML = html;

  // Sync hand-strip classes
  const hs = document.querySelector('.hand-strip');
  if (hs) {
    hs.classList.toggle('show-skill', !!s._showHandSkill);
    hs.classList.toggle('compact', !!s._handCompact);
    hs.classList.toggle('horizontal-scroll', !!s._horizontalScroll);
  }

  // Budget-expiring hint: anchor to a card the player cannot currently afford.
  if (isBudgetMode(s)) {
    const badge = el.querySelector('.budget-cost-badge.insufficient');
    if (badge) {
      const cardEl = badge.closest('.hand-card') || badge;
      maybeShowHint('classic-budget-expiring', { anchorEl: cardEl });
    }
  }
}

function renderActions(s) {
  const el = $('actions');
  if (s.turnPhase === 'gameOver') {
    el.innerHTML = '';
    return;
  }
  if (s.animating) {
    el.innerHTML = '<div class="action-bar"><span class="action-animating">⚙ Resolving effect…</span></div>';
    return;
  }

  const player = s.players[0];
  if (!player) { el.innerHTML = ''; return; }
  const sel = s.selectedCards;
  const selCard = sel.length === 1 ? player.hand.find(c => c.id === sel[0]) : null;

  let html = '<div class="action-bar">';

  if (selCard) {
    const canPlay = selCard.type === 'Talent' || selCard.type === 'Project' ||
      selCard.type === 'Project Queue' || selCard.type === 'Bonus Project' ||
      selCard.type === 'Soft' || selCard.type === 'Hard' || selCard.type === 'Power' ||
      selCard.type === 'Favor';
    if (canPlay) {
      // Budget: check if skill card is affordable
      const isSkillCard = selCard.type === 'Soft' || selCard.type === 'Hard' || selCard.type === 'Power';
      const isProjectCard = selCard.type === 'Project' || selCard.type === 'Project Queue' || selCard.type === 'Bonus Project';
      const opCost = selCard.value || 0;
      const humanPlayer = s.players[0];
      const budgetBlocked = isBudgetMode(s) && isSkillCard && opCost > 0 && !canAffordOpEx(s, humanPlayer, opCost);
      const freezeBlocked = isProjectCard && s.quarterFlags.noNewProject;
      const killBlocked = isProjectCard && (s.quarterFlags._noNewProject || []).includes(0);
      if (budgetBlocked) {
        const hb = (humanPlayer && humanPlayer.budget) || s.budget;
        html += `<button class="btn btn-play" disabled title="Insufficient OpEx (need ${opCost}, have ${hb.opEx})">Play ${escHtml(selCard.name)} (${opCost} OpEx)</button>`;
      } else if (freezeBlocked || killBlocked) {
        const reason = freezeBlocked ? 'Freeze active' : 'Kill the Project active';
        html += `<button class="btn btn-play" disabled title="Cannot play projects this quarter (${reason})">Play ${escHtml(selCard.name)}</button>`;
      } else {
        html += `<button class="btn btn-play" onclick="window._playSelected()">Play ${escHtml(selCard.name)}</button>`;
      }
      maybeShowHint('classic-first-play');
    }
    html += `<button class="btn btn-secondary btn-sm" onclick="window._showCardDetailById('${selCard.id}','hand')">View Card</button>`;
  }

  const unassigned = getUnassignedPeople(player);
  const activeProjs = player.projects.filter(p => !p.isCompleted);
  if (player.people.length && activeProjs.length && s.turnSubPhase === 'play') {
    html += `<button class="btn btn-assign" onclick="window._showAssign()" aria-label="Assign people to projects (keyboard: A)"><img src="/assets/icons/ui/hand.svg" alt="" aria-hidden="true" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: -2px;">Assign <kbd>A</kbd></button>`;
    maybeShowHint('classic-first-assign');
    if (unassigned.length > 0) {
      html += `<button class="btn btn-secondary btn-sm" onclick="window._autoAssign()" title="Auto-assign people to projects by urgency" aria-label="Auto-assign people to projects by urgency"><img src="/assets/icons/ui/bolt.svg" alt="" aria-hidden="true" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: -2px;">Auto</button>`;
    }
  }

  // Budget: convert button
  if (isBudgetMode(s)) {
    const hBudget = (s.players[0] && s.players[0].budget) || s.budget;
    const canCap = hBudget.capEx >= 2;
    const canOp = hBudget.opEx >= 2;
    if (canCap || canOp) {
      html += `<button class="btn btn-convert" onclick="window._showBudgetConvert()" aria-label="Convert budget between CapEx and OpEx"><img src="/assets/icons/ui/trade.svg" alt="" aria-hidden="true" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: -2px;">Convert Budget</button>`;
    }
  }

  // Retro Token
  if ((player.retroTokens || 0) > 0 && s.turnSubPhase === 'play') {
    html += `<button class="btn btn-retro" onclick="window._useRetro()">Retro (${player.retroTokens})</button>`;
  }

  html += `<button class="btn btn-end" onclick="window._endTurn()" aria-label="End turn (keyboard: E)"><img src="/assets/icons/ui/next-button.svg" alt="" aria-hidden="true" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: -2px;">End Turn <kbd>E</kbd></button>`;

  // Tutorial & Help buttons - moved after End Turn for better visual grouping
  html += `<button class="btn btn-secondary btn-sm" onclick="window._showTutorial()" title="Show Tutorial" aria-label="Show tutorial (keyboard: H)"><img src="/assets/icons/ui/book-cover.svg" alt="" aria-hidden="true" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: -2px;">Tutorial</button>`;
  html += `<button class="btn btn-secondary btn-sm" onclick="import('../shared/shortcuts.js').then(module => module.showShortcutsModal('classic'))" title="Keyboard Shortcuts" aria-label="Keyboard shortcuts (keyboard: ?)"><img src="/assets/icons/ui/book-cover.svg" alt="" aria-hidden="true" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: -2px;">Shortcuts</button>`;

  html += '</div>';
  el.innerHTML = html;
}

export function renderLog() {
  const el = $('game-log');
  if (!el) return;
  const logs = state.gameLog.slice(-30);
  el.innerHTML = logs.map(l =>
    `<div class="log-entry"><span class="log-q">Q${l.q}</span> ${escHtml(l.msg)}</div>`
  ).join('');
  // rAF ensures the browser has laid out the new content before we set scrollTop
  requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
}

function renderGameOver(s) {
  const sorted = [...s.players].sort((a, b) => b.reputation - a.reputation);
  const el = $('game-over-modal');
  el.classList.remove('hidden');

  // Check for achievements
  import('./achievements.js').then(module => {
    const newAchievements = module.checkAchievementsOnGameEnd();

    // Check First Win (special case - not in auto-check list)
    const humanWon = sorted[0] === s.players[0];
    const firstWin = !module.isAchievementUnlocked('firstWin') && humanWon;
    if (firstWin) {
      module.unlockAchievement('firstWin');
    }
  });

  const human = s.players[0];
  const briefing = getTraitBriefing(human);
  const humanRank = sorted.indexOf(human) + 1;
  let traitBlock = '';
  if (briefing) {
    const placed = humanRank === 1 ? 'won' : `finished ${['', '1st', '2nd', '3rd', '4th', '5th'][humanRank] || humanRank + 'th'}`;
    traitBlock = `
      <div class="game-over-trait">
        <div class="got-archetype">You played as <strong>${escHtml(briefing.archetype)}</strong> <span class="got-trait-name">(${escHtml(briefing.name)})</span></div>
        <p class="got-blurb">${escHtml(briefing.blurb)}</p>
        <div class="got-reflect">You ${placed} with ${human.reputation} rep. ${escHtml(humanRank === 1 ? 'Your archetype’s strengths carried the game — was it the strategy, or the draw?' : 'Would a different management style have fit these eight quarters better?')}</div>
      </div>`;
  }

  el.innerHTML = `
    <div class="modal-content game-over-content">
      <h2>Game Over!</h2>
      <div class="standings">
        ${sorted.map((p, i) => {
          const medal = ['🥇','🥈','🥉',''][Math.min(i, 3)];
          const b = getTraitBriefing(p);
          return `<div class="standing-row ${i === 0 ? 'winner' : ''} ${p === human ? 'is-human' : ''}">
            <span class="standing-medal">${medal}</span>
            <span class="standing-name">${escHtml(p.name)}${b ? ` <span class="standing-archetype">${escHtml(b.archetype)}</span>` : ''}</span>
            <span class="standing-rep">${p.reputation} rep</span>
          </div>`;
        }).join('')}
      </div>
      ${traitBlock}
      <div class="game-over-actions">
        <button class="btn btn-secondary" onclick="window._showDebrief()">Reflection</button>
        <button class="btn btn-play" onclick="window._newGame()">Play Again</button>
      </div>
    </div>
  `;
}

/** Render assign modal. */
export function renderAssignModal(s) {
  const player = s.players[0];
  const unassigned = getUnassignedPeople(player);
  const activeProjs = player.projects.filter(p => !p.isCompleted);

  const el = $('modal');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Assign People to Projects</h3>
        <button class="modal-close" onclick="window._closeModal()">&times;</button>
      </div>
      <div class="assign-grid">
        <div class="assign-people">
          <div class="panel-label">Available (${unassigned.length})</div>
          ${unassigned.map(p => `
            <div class="assign-person" data-person-id="${p.id}">
              <span>${escHtml(p.name)}</span>
            </div>
          `).join('') || '<div class="empty-msg">All assigned — click a person on a project card to unassign</div>'}
        </div>
        <div class="assign-projects">
          <div class="panel-label">Projects</div>
          ${activeProjs.map(proj => {
            const assigned = getAssignedPeople(player, proj.id);
            return `<div class="assign-project">
              <div class="ap-name">${escHtml(proj.name)} (${assigned.length}/${proj.members || '?'})</div>
              ${unassigned.map(p => `
                <button class="btn btn-sm" onclick="window._assignPerson('${p.id}','${proj.id}')">
                  + ${escHtml(p.name)}
                </button>
              `).join('')}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/** Render trade modal. */
export function renderTradeModal(s, marketCardId) {
  const player = s.players[0];
  let marketCard = s.markets.projectQueue.find(c => c.id === marketCardId);
  let marketType = 'projectQueue';
  if (!marketCard) {
    marketCard = s.markets.forHire.find(c => c.id === marketCardId);
    marketType = 'forHire';
  }
  if (!marketCard) return;

  const cost = marketCard.value || 0;
  const valuable = player.hand.filter(c => (c.value || 0) > 0);

  const el = $('modal');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="modal-content trade-modal">
      <div class="modal-header">
        <h3>Trade for ${escHtml(marketCard.name)}</h3>
        <button class="modal-close" onclick="window._closeModal()">&times;</button>
      </div>
      <div class="trade-body">
        <div class="trade-target">
          <div class="trade-target-img">${renderCardHTML(marketCard, { size: 'md', showImage: true })}</div>
          <div class="trade-info">Cost: <strong>${cost}</strong> value</div>
        </div>
        <div class="trade-select-col">
          <div class="trade-select-label">Pay with value cards</div>
          <div class="trade-cards" id="trade-select">
            ${valuable.map(c => `
              <label class="trade-card-option">
                <input type="checkbox" value="${c.id}" data-value="${c.value || 0}" onchange="window._updateTradeTotal()">
                <span style="color:${typeColor(c.type)}">${escHtml(c.name)}</span>
                <span class="tv">${c.value || 0}v</span>
              </label>
            `).join('') || '<div class="empty-msg">No cards with trade value</div>'}
          </div>
        </div>
      </div>
      <div class="trade-footer">
        <span id="trade-total">Selected: 0 / ${cost}</span>
        <button class="btn btn-play" id="trade-confirm" disabled
          onclick="window._confirmTrade('${marketType}','${marketCardId}')">Confirm Trade</button>
      </div>
    </div>
  `;
}

/** Show card detail modal for any card. */
export function showCardDetail(card) {
  if (!card) return;
  const color = typeColor(card.type);
  const el = $('modal');
  el.classList.remove('hidden');

  const stats = [];
  if (card.value) stats.push(['Value', card.value]);
  if (card.deadline) stats.push(['Deadline', card.deadline + ' quarters']);
  if (card.members) stats.push(['Members', card.members]);
  if (card.reward) stats.push(['Reward', '+' + card.reward + ' rep']);
  if (card.penalty) stats.push(['Penalty', '-' + card.penalty + ' rep']);
  if (card.negationCost) stats.push(['Negation', card.negationCost]);
  if (card.effectType) stats.push(['Effect', card.effectType]);
  if (card.complexity) stats.push(['Complexity', card.complexity]);

  // Check if this is an active project owned by any player
  let projectSection = '';
  for (const p of state.players) {
    const proj = p.projects.find(pr => pr.id === card.id);
    if (proj) {
      projectSection = renderProjectDetailSection(p, proj);
      break;
    }
  }

  el.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${escHtml(card.name)}</h3>
        <button class="modal-close" onclick="window._closeModal()">&times;</button>
      </div>
      <div class="card-detail-modal">
        <div class="card-detail-left">
          ${renderCardHTML(card, { size: '', showImage: true })}
        </div>
        <div class="card-detail-right">
          <span class="card-detail-type-badge" style="background:${color};color:#000">${escHtml(card.type)}</span>
          ${card.deck ? `<span style="font-size:var(--text-xs);color:var(--text-muted);display:block;margin-top:4px">${escHtml(card.deck)} deck</span>` : ''}
          ${card.skill ? `<div class="card-detail-skill">${escHtml(card.skill)}</div>` : ''}
          ${card.flavorText ? `<div class="card-detail-flavor">"${escHtml(card.flavorText)}"</div>` : ''}
          ${stats.length ? `<div class="card-detail-stats">
            ${stats.map(([l, v]) => `<div class="card-detail-stat"><span class="label">${l}</span><span class="val">${v}</span></div>`).join('')}
          </div>` : ''}
          <div class="rc-gallery-link-row">${galleryLink(card.name)}</div>
        </div>
      </div>
      ${projectSection}
    </div>
  `;
}

function renderProjectDetailSection(player, proj) {
  const assigned = getAssignedPeople(player, proj.id);
  const needed = proj.members || 0;
  const timeLeft = (proj.deadline || 0) - (proj.timeSpent || 0);
  const staffed = assigned.length >= needed;
  const onTrack = staffed && timeLeft > 0;
  const completed = proj.isCompleted;
  const overdue = !completed && timeLeft <= 0;

  let bannerClass, bannerText;
  if (completed) {
    bannerClass = 'proj-banner-done';
    bannerText = 'Completed — Reward earned!';
  } else if (overdue) {
    bannerClass = 'proj-banner-fail';
    bannerText = 'Overdue — Project at risk!';
  } else if (onTrack) {
    bannerClass = 'proj-banner-ok';
    bannerText = `On track — ${timeLeft}q remaining, fully staffed`;
  } else if (assigned.length > 0) {
    bannerClass = 'proj-banner-warn';
    bannerText = `Needs ${needed - assigned.length} more member${needed - assigned.length > 1 ? 's' : ''} — ${timeLeft}q left`;
  } else {
    bannerClass = 'proj-banner-warn';
    bannerText = `Unstaffed — needs ${needed} member${needed > 1 ? 's' : ''}, ${timeLeft}q left`;
  }

  // Sort assigned: by complexity or value descending (rank order)
  const sorted = [...assigned].sort((a, b) => (b.value || 0) - (a.value || 0));

  return `
    <div class="proj-detail-section">
      <div class="proj-banner ${bannerClass}">${bannerText}</div>
      <div class="proj-detail-progress">
        <div class="proj-detail-bar">
          <div class="proj-detail-bar-label">Staff</div>
          <div class="proj-detail-bar-track">
            <div class="proj-detail-bar-fill" style="width:${needed > 0 ? Math.min(100, Math.round(assigned.length / needed * 100)) : 0}%;background:var(--type-talent)"></div>
          </div>
          <div class="proj-detail-bar-val">${assigned.length}/${needed}</div>
        </div>
        <div class="proj-detail-bar">
          <div class="proj-detail-bar-label">Time</div>
          <div class="proj-detail-bar-track">
            <div class="proj-detail-bar-fill" style="width:${proj.deadline > 0 ? Math.min(100, Math.round((proj.timeSpent || 0) / proj.deadline * 100)) : 0}%;background:${overdue ? 'var(--type-quarter-event)' : 'var(--accent-bright)'}"></div>
          </div>
          <div class="proj-detail-bar-val">${proj.timeSpent || 0}/${proj.deadline || '?'}q</div>
        </div>
      </div>
      <div class="proj-detail-team-label">Assigned Team (${assigned.length})</div>
      <div class="proj-detail-team">
        ${sorted.length ? sorted.map(p =>
          `<div class="proj-detail-person" onclick="event.stopPropagation();window._showCardDetailById('${p.id}','people')">
            <img src="${cardImg(p)}" alt="${escHtml(p.name)}" loading="lazy">
            <div class="proj-detail-person-info">
              <span class="proj-detail-person-name">${escHtml(p.name)}</span>
              <span class="proj-detail-person-role">${escHtml(p.type || '')}${p.value ? ` — ${p.value}v` : ''}</span>
            </div>
          </div>`
        ).join('') : '<div class="empty-msg">No one assigned yet</div>'}
      </div>
    </div>
  `;
}

/** Show card projection using center-rise animation.
 *  Accepts optional sourceRect (from getBoundingClientRect) for animation origin. */
export function showCardProjection(card, duration = 1700, sourceRect = null) {
  const el = $('card-play-stage');
  if (!el) {
    // Fallback to old projection if new element missing
    const oldEl = $('card-projection');
    if (!oldEl) return Promise.resolve();
    const color = typeColor(card.type);
    oldEl.className = 'card-projection';
    oldEl.style.setProperty('--card-accent', color);
    oldEl.innerHTML = renderCardHTML(card, { size: 'md' });
    return new Promise(resolve => {
      setTimeout(() => {
        oldEl.classList.add('exiting');
        setTimeout(() => { oldEl.className = 'hidden'; oldEl.innerHTML = ''; resolve(); }, 300);
      }, duration);
    });
  }

  const color = typeColor(card.type);

  el.innerHTML = renderCardHTML(card, { size: 'md' });
  el.style.setProperty('--card-accent', color);

  // Set animation origin based on sourceRect
  if (sourceRect) {
    el.style.setProperty('--start-x', `${sourceRect.left + sourceRect.width / 2}px`);
    el.style.setProperty('--start-y', `${sourceRect.top}px`);
    el.style.setProperty('--start-scale', `${sourceRect.width / 200}`);
    el.style.setProperty('--start-rotation', `${sourceRect._fanAngle || 0}deg`);
  } else {
    el.style.setProperty('--start-x', '50vw');
    el.style.setProperty('--start-y', '80vh');
    el.style.setProperty('--start-scale', '0.7');
    el.style.setProperty('--start-rotation', '0deg');
  }

  // Force reflow to restart animation
  el.className = 'hidden';
  void el.offsetWidth;
  el.className = 'card-play-stage';

  return new Promise(resolve => {
    el.addEventListener('animationend', () => {
      el.className = 'hidden';
      el.innerHTML = '';
      resolve();
    }, { once: true });

    // Safety timeout in case animationend doesn't fire
    setTimeout(() => {
      if (!el.classList.contains('hidden')) {
        el.className = 'hidden';
        el.innerHTML = '';
        resolve();
      }
    }, duration + 200);
  });
}

/** Show Rush Q card reveal animation. */
export function showRushQReveal(card) {
  return new Promise(resolve => {
    const el = $('rush-q-overlay');
    el.className = 'rush-q-reveal';
    el.innerHTML = `
      <div class="rush-q-card">
        <div class="rq-warning">⚠️ RUSH QUARTER INCOMING ⚠️</div>
        <div class="rq-all-players">⚡ AFFECTS ALL PLAYERS ⚡</div>
        <div class="rq-card-img">${renderCardHTML(card, { size: '', showImage: true })}</div>
        <div class="rq-title">RUSH QUARTER</div>
        <div class="rq-skill">${escHtml(card.skill || 'A corporate event hits all players!')}</div>
        <div class="rq-effect-type">Simultaneous Effect • Cannot Be Countered</div>
        <button class="btn btn-play rq-btn" id="rq-continue-btn">Continue</button>
      </div>
    `;
    document.getElementById('rq-continue-btn').addEventListener('click', () => {
      el.className = 'hidden';
      el.innerHTML = '';
      resolve();
    });
  });
}

/** Show effect dialog for skill card resolution. */
export function showEffectDialog(card, outcome, detail) {
  return new Promise(resolve => {
    const el = $('modal');
    el.classList.remove('hidden');
    el.innerHTML = `
      <div class="modal-content effect-dialog">
        <div class="modal-header">
          <h3>${escHtml(card.name)}</h3>
          <button class="modal-close" onclick="window._closeModal()">&times;</button>
        </div>
        <div class="effect-card-img">${renderCardHTML(card, { size: 'md' })}</div>
        <div class="effect-desc">${escHtml(card.skill || '')}</div>
        <div class="effect-result">
          <div class="effect-outcome">${escHtml(outcome)}</div>
          <div class="effect-detail">${escHtml(detail)}</div>
        </div>
        <div class="effect-actions">
          <button class="btn btn-play" id="effect-ok-btn">OK</button>
        </div>
      </div>
    `;
    const okBtn = document.getElementById('effect-ok-btn');
    const closeBtn = el.querySelector('.modal-close');
    const done = () => { el.classList.add('hidden'); resolve(); };
    okBtn.addEventListener('click', done);
    closeBtn.addEventListener('click', done);
  });
}

/** Show the human player's management-style (trait) briefing. Informational; used
 *  as a once-per-game intro and re-openable from the trait badge on the board. */
export function showTraitBriefing(player) {
  const b = getTraitBriefing(player);
  if (!b) return;
  const el = $('modal');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="modal-content trait-briefing">
      <div class="modal-header">
        <h3>Your management style</h3>
        <button class="modal-close" onclick="window._closeModal()">&times;</button>
      </div>
      <div class="tb-archetype">${escHtml(b.archetype)}</div>
      <div class="tb-name">${escHtml(b.name)}</div>
      <p class="tb-blurb">${escHtml(b.blurb)}</p>
      <div class="tb-row tb-strength"><span class="tb-tag">Strength</span> ${escHtml(b.strength)}</div>
      <div class="tb-row tb-watch"><span class="tb-tag">Watch out</span> ${escHtml(b.watch)}</div>
      <p class="tb-note">This is how you're wired this game. Lean into the strength; the same instinct is your blind spot.</p>
      <div class="effect-actions">
        <button class="btn btn-play" id="trait-ok-btn">Got it</button>
      </div>
    </div>
  `;
  const done = () => el.classList.add('hidden');
  document.getElementById('trait-ok-btn')?.addEventListener('click', done);
  el.querySelector('.modal-close')?.addEventListener('click', done);
}

/** Show interactive choice dialog. */
export function showChoiceDialog(card, options, canRefuse = false) {
  return new Promise(resolve => {
    const el = $('modal');
    el.classList.remove('hidden');

    const optionsHtml = options.map((opt, i) => `
      <button class="btn choice-option-btn" data-choice="${i}" style="
        display:block; width:100%; text-align:left; margin-bottom:8px;
        padding:12px 16px; background:var(--surface-2); border:2px solid var(--border);
        color:var(--text-primary); border-radius:var(--radius-sm); cursor:pointer;
        font-size:var(--text-sm); line-height:1.5;
        transition: border-color var(--dur), background var(--dur);
      ">
        <strong>${escHtml(opt.label)}</strong>
        ${opt.detail ? `<div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${escHtml(opt.detail)}</div>` : ''}
        ${opt.disabled ? `<div style="font-size:var(--text-xs);color:var(--stat-penalty);margin-top:2px">Not enough cards</div>` : ''}
      </button>
    `).join('');

    el.innerHTML = `
      <div class="modal-content effect-dialog">
        <div class="modal-header">
          <h3>${escHtml(card.name)}</h3>
          <span style="font-size:var(--text-xs);color:var(--text-muted)">${escHtml(card.type)}</span>
        </div>
        <div class="effect-card-img">${renderCardHTML(card, { size: 'md' })}</div>
        <div class="effect-desc">${escHtml(card.skill || '')}</div>
        <div id="choice-options">${optionsHtml}</div>
      </div>
    `;

    const container = document.getElementById('choice-options');
    container.addEventListener('click', e => {
      const btn = e.target.closest('.choice-option-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.choice);
      if (options[idx] && options[idx].disabled) return;
      el.classList.add('hidden');
      resolve(idx);
    });

    container.addEventListener('mouseover', e => {
      const btn = e.target.closest('.choice-option-btn');
      if (btn && !options[parseInt(btn.dataset.choice)]?.disabled) {
        btn.style.borderColor = 'var(--accent-bright)';
        btn.style.background = 'rgba(0,99,229,.1)';
      }
    });
    container.addEventListener('mouseout', e => {
      const btn = e.target.closest('.choice-option-btn');
      if (btn) {
        btn.style.borderColor = 'var(--border)';
        btn.style.background = 'var(--surface-2)';
      }
    });
  });
}

/** Show project completion modal. */
export function showProjectCompleteModal(project, assignedPeople, reward) {
  return new Promise(resolve => {
    const el = $('modal');
    el.classList.remove('hidden');

    if (assignedPeople.length <= 1) {
      el.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Project Completed!</h3>
            <button class="modal-close" style="visibility:hidden">&times;</button>
          </div>
          <div class="complete-modal-reward">
            <div class="complete-proj-img">${renderCardHTML(project, { size: 'md' })}</div>
            <div class="reward-amount">+${reward} Reputation</div>
          </div>
          <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:16px">
            ${assignedPeople.length === 1 ? `${escHtml(assignedPeople[0].name)} stays on the completed project.` : 'No team members were assigned.'}
          </p>
          <button class="btn btn-play" id="complete-ok-btn">Continue</button>
        </div>
      `;
      document.getElementById('complete-ok-btn').addEventListener('click', () => {
        el.classList.add('hidden');
        resolve(assignedPeople.length === 1 ? assignedPeople[0].id : null);
      });
      return;
    }

    let selectedId = assignedPeople[0].id;

    function renderPeople() {
      return assignedPeople.map(p => `
        <div class="complete-person-option ${p.id === selectedId ? 'selected' : ''}" data-pid="${p.id}">
          <span class="complete-person-name">${escHtml(p.name)}</span>
          <span class="complete-person-role">${escHtml(p.type || 'Team member')}</span>
        </div>
      `).join('');
    }

    el.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Project Completed!</h3>
          <button class="modal-close" style="visibility:hidden">&times;</button>
        </div>
        <div class="complete-modal-reward">
          <div class="complete-proj-img">${renderCardHTML(project, { size: 'md' })}</div>
          <div class="reward-amount">+${reward} Reputation</div>
        </div>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:12px">
          Choose <strong>one</strong> team member to keep on the project. The rest will be released back to your available team.
        </p>
        <div class="complete-modal-people" id="complete-people-list">
          ${renderPeople()}
        </div>
        <button class="btn btn-play" id="complete-confirm-btn">Confirm</button>
      </div>
    `;

    const list = document.getElementById('complete-people-list');
    list.addEventListener('click', e => {
      const option = e.target.closest('.complete-person-option');
      if (!option) return;
      selectedId = option.dataset.pid;
      list.innerHTML = renderPeople();
    });

    document.getElementById('complete-confirm-btn').addEventListener('click', () => {
      el.classList.add('hidden');
      resolve(selectedId);
    });
  });
}

// ── Hover preview system ─────────────────────────────────────

let hoverTimer = null;

function initHoverPreview() {
  document.addEventListener('mouseover', e => {
    const card = e.target.closest('[data-card-name]');
    if (!card) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => showHoverPreview(card), 400);
  });

  document.addEventListener('mouseout', e => {
    const card = e.target.closest('[data-card-name]');
    if (card) {
      clearTimeout(hoverTimer);
      hideHoverPreview();
    }
  });
}

function showHoverPreview(cardEl) {
  const name = cardEl.dataset.cardName;
  if (!name) return;

  const preview = $('card-hover-preview');
  if (!preview) return;

  const card = findCardByName(name);
  if (card) {
    preview.innerHTML = renderCardHTML(card, { size: '', showImage: true });
  } else {
    preview.innerHTML = `<div style="padding:12px;color:var(--text-muted);font-size:0.8rem">${escHtml(name)}</div>`;
  }
  preview.classList.remove('hidden');

  const rect = cardEl.getBoundingClientRect();
  const previewW = 300;
  const previewH = 420;

  let left = rect.right + 12;
  let top = rect.top;

  if (left + previewW > window.innerWidth) {
    left = rect.left - previewW - 12;
  }
  if (top + previewH > window.innerHeight) {
    top = window.innerHeight - previewH - 12;
  }
  if (top < 8) top = 8;

  preview.style.left = left + 'px';
  preview.style.top = top + 'px';
}

function hideHoverPreview() {
  const preview = $('card-hover-preview');
  if (preview) {
    preview.classList.add('hidden');
    preview.innerHTML = '';
  }
}

// ── Timeline and Reputation Graph ────────────────────────────

export function renderTimeline(s) {
  const total = s.totalQuarters || 8;
  let html = '<div class="timeline-container">';

  for (let q = 1; q <= total; q++) {
    const isCompleted = q < s.currentQuarter;
    const isCurrent = q === s.currentQuarter;
    const className = isCurrent ? 'current' : isCompleted ? 'completed' : '';
    const icon = isCompleted ? '✓' : isCurrent ? '▶' : q;

    html += `<div class="timeline-quarter ${className}" title="Quarter ${q}">
      ${icon}
    </div>`;
  }

  html += '</div>';
  return html;
}

export function renderReputationGraph(s) {
  if (!s.reputationHistory || Object.keys(s.reputationHistory).length < 2) {
    return '<div class="graph-container" style="display:none;"></div>';
  }

  const quarters = Object.keys(s.reputationHistory).sort((a, b) => a - b);
  const maxRep = Math.max(...quarters.flatMap(q => Object.values(s.reputationHistory[q])));
  const minRep = Math.min(...quarters.flatMap(q => Object.values(s.reputationHistory[q])), 0);
  const range = maxRep - minRep || 1;

  let html = '<div class="graph-container">';
  html += '<h3 style="font-size:var(--text-sm);margin-bottom:12px;color:var(--text-muted);">Reputation Progress</h3>';
  html += '<div class="graph-area">';

  // Grid lines
  html += '<div class="graph-grid">';
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * 100;
    html += `<div class="grid-line" style="bottom:${y}%"></div>`;
  }
  html += '</div>';

  // Player lines
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
  const playerNames = s.players.map(p => p.name);

  for (let i = 0; i < s.players.length; i++) {
    const points = quarters.map(q => {
      const rep = s.reputationHistory[q][i] || 0;
      const x = ((parseInt(q) - 1) / (quarters.length - 1)) * 100;
      const y = ((rep - minRep) / range) * 100;
      return `${x},${100 - y}`;
    }).join(' ');

    html += `<svg class="graph-line" style="position:absolute;top:0;left:0;width:100%;height:100%">
      <polyline points="${points}"
        stroke="${colors[i % colors.length]}"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"/>
      ${quarters.map((q, idx) => {
        const rep = s.reputationHistory[q][i] || 0;
        const x = ((parseInt(q) - 1) / (quarters.length - 1)) * 100;
        const y = ((rep - minRep) / range) * 100;
        return `<circle cx="${x}%" cy="${100 - y}%" r="4" fill="${colors[i % colors.length]}"/>`;
      }).join('')}
    </svg>`;
  }

  // Legend
  html += '<div class="graph-legend">';
  for (let i = 0; i < s.players.length; i++) {
    html += `<div class="legend-item">
      <div class="legend-color" style="background:${colors[i % colors.length]}"></div>
      <span>${escHtml(playerNames[i])}</span>
    </div>`;
  }
  html += '</div>';

  html += '</div></div>';
  return html;
}

initHoverPreview();
