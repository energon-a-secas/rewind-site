// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── DOM rendering ────────────────────────────────────────────

import { icon, iconForEmoji } from '../shared/icons.js';
import { state } from './state.js';
import { escHtml, $ } from './utils.js';
import { typeColor, cardDefByName } from './data.js';
import { cardImagePath } from '../shared/cards-data.js';
import { renderCardHTML, galleryLink } from '../shared/card-component.js';
import { getAssignedPeople, getUnassignedPeople, foundationBand, getSynergyPartners, forecastBucket } from './engine.js';
import { isBudgetMode, canAffordOpEx, canAffordCapEx } from './budget.js';
import { showPostGameDebrief } from '../exercises/post-game.js';
import { extractGameStats } from '../exercises/debrief.js';
import { maybeShowHint } from '../shared/hints.js';
import { getTraitBriefing } from './traits.js';
import { PENDING_EFFECT_META, CONSTRAINT_META, pendingEffectTiming, activeConstraints, recentHits, splitPendingEffects, REACTION_CARDS, REACTION_COST } from './effect-rails.js';

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
  if (state.upcomingRushQ && state.upcomingRushQ.name === name) return state.upcomingRushQ;
  for (const deck of Object.values(state.decks || {})) {
    if (!Array.isArray(deck)) continue;
    const d = deck.find(c => c && c.name === name);
    if (d) return d;
  }
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
  renderPlayPrompt(s);

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

  // Quarter dots — compact progress pips
  const qChips = Array.from({ length: total }, (_, i) => {
    const cls = i < s.currentQuarter - 1 ? 'q-chip q-done' : i === s.currentQuarter - 1 ? 'q-chip q-current' : 'q-chip';
    return `<span class="${cls}" title="Quarter ${i + 1}">${i + 1}</span>`;
  }).join('');

  const maxRep = Math.max(0, ...s.players.map(p => p.reputation));
  const anyRep = s.players.some(p => p.reputation !== 0);
  const sortedRep = [...s.players].map(p => p.reputation).sort((a, b) => b - a);
  const scores = s.players.map(p => {
    const isLeader = p.reputation === maxRep && anyRep;
    const rank = sortedRep.indexOf(p.reputation) + 1;
    const badge = isLeader ? icon('crown', { cls: 'ic-gold', label: 'Leader' }) : anyRep ? rank : '·';
    return `<div class="score-chip ${p.isAI ? '' : 'human'}${isLeader ? ' leader' : ''}">
       <span class="score-rank">${badge}</span>
       <span class="score-name">${escHtml(p.name)}</span>
       <span class="score-val">${p.reputation}</span>
     </div>`;
  }).join('');

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
    <div class="hud-zone hud-progress">
      <div class="quarter-track">
        <span class="quarter-label">Quarter</span>
        <span class="quarter-now">Q${s.currentQuarter}<span class="quarter-of">/${total}</span></span>
        <div class="q-dots">${qChips}</div>
      </div>
      ${phaseHtml}
    </div>
    <div class="hud-zone hud-status">
      ${isBudgetMode(s) ? renderBudgetBar(s) : ''}
      <div class="scores">${scores}</div>
      <button class="btn btn-reset" onclick="window._resetGame()" title="Reset game" aria-label="Reset game">↺</button>
      <button id="recover-btn" class="btn btn-reset hidden" onclick="window._recoverGame()" title="Recover stuck game">Recover</button>
    </div>
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

  // Reputation graph (quarter progress lives in the HUD track now)
  html += renderReputationGraph(s);

  // What is acting on you, above the fold — an effect you have to scroll to
  // find is not an effect you will factor into this turn.
  if (s.players[0]) html += renderEffectRails(s, s.players[0]);

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
        ${cardView ? icon('menu') : icon('layout-grid')}
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

    html += '</div>';
  }

  el.innerHTML = html;
}

/** Two rails: buffs you own on the left, what rivals and the company are doing
 *  to you on the right. Split matters because the old single "Active Effects"
 *  row put a shield and a time bomb in the same neutral badge, and because
 *  cross-player damage previously left no trace at all. */
function renderEffectRails(s, p) {
  const { buffs, debuffs } = splitPendingEffects(p);
  const constraints = activeConstraints(s, 0);
  const hits = recentHits(s, 0);

  if (!buffs.length && !debuffs.length && !constraints.length && !hits.length) return '';

  const cardFace = (name) => {
    // Live state first (it has the real instance), then the card DB for
    // anything already played or purely systemic.
    const card = name ? (findCardByName(name) || cardDefByName(name)) : null;
    return card ? renderCardHTML(card, { size: 'sm' }) : '';
  };

  const railCard = (name, title, sub, meta, tone) => `
    <div class="rail-card rail-card--${tone}" ${name ? `data-card-name="${escHtml(name)}"` : ''}>
      <div class="rail-card-face">${cardFace(name) || `<div class="rail-card-stub">${escHtml(title)}</div>`}</div>
      <div class="rail-card-text">
        <span class="rail-card-title">${escHtml(title)}</span>
        <span class="rail-card-sub">${escHtml(sub)}</span>
        ${meta ? `<span class="rail-card-meta">${escHtml(meta)}</span>` : ''}
      </div>
    </div>`;

  const leftItems = [];
  for (const eff of buffs) {
    const meta = PENDING_EFFECT_META[eff.type];
    const t = pendingEffectTiming(eff, s.currentQuarter);
    leftItems.push(railCard(
      eff.sourceCardName,
      eff.sourceCardName || 'Active effect',
      meta?.label || 'In effect',
      t.mode === 'armed' ? 'Armed' : `${t.turnsLeft} quarter${t.turnsLeft === 1 ? '' : 's'} left`,
      'buff'));
  }
  if ((p.shieldActive || 0) > 0) {
    leftItems.push(railCard(p.shieldSource || null, p.shieldSource || 'Event shield',
      'Negates the next Event drawn for you', `×${p.shieldActive}`, 'buff'));
  }
  if ((p.attackShield || 0) > 0) {
    leftItems.push(railCard(p.attackShieldSource || null, p.attackShieldSource || 'Shield',
      'Negates the next card targeting you', `×${p.attackShield}`, 'buff'));
  }
  // Counters live in hand, not on the board, so nothing else would tell the
  // player they are holding an answer.
  const held = (p.hand || []).filter(c => REACTION_CARDS.has(c.name));
  for (const rc of held) {
    const cost = REACTION_COST[rc.name] || 0;
    leftItems.push(railCard(rc.name, rc.name, 'Reaction: fires when a rival targets you',
      cost ? `${cost} rep to use` : 'Free', 'buff'));
  }

  const rightItems = [];
  for (const eff of debuffs) {
    const meta = PENDING_EFFECT_META[eff.type];
    const t = pendingEffectTiming(eff, s.currentQuarter);
    rightItems.push(railCard(eff.sourceCardName, eff.sourceCardName || 'Pending',
      meta?.label || 'Comes due', t.mode === 'armed' ? 'Armed' : `${t.turnsLeft} quarter${t.turnsLeft === 1 ? '' : 's'} left`, 'threat'));
  }
  for (const c of constraints) {
    const meta = CONSTRAINT_META[c];
    // A constraint has no card of its own, so borrow the face from the hit
    // that caused it when one was recorded.
    const cause = hits.find(h => h.kind === c || (c === 'frozenProjects' && h.kind === 'freeze')
      || (c === 'noNewProject' && h.kind === 'noProject') || (c === 'noAssign' && h.kind === 'noAssign'));
    rightItems.push(railCard(cause?.cardName || null, meta.label, meta.detail, 'This quarter', 'threat'));
  }
  for (const h of hits.filter(x => x.kind === 'rep')) {
    rightItems.push(railCard(h.cardName, h.cardName || 'Setback', h.detail || 'Reputation lost',
      `${h.amount > 0 ? '+' : ''}${h.amount} rep · Q${h.q}`, 'threat'));
  }

  if (!leftItems.length && !rightItems.length) return '';

  // Three each, then a count. The rails sit above the markets so they are seen
  // without scrolling; letting them grow without limit would push the board
  // they are annotating off the screen.
  const CAP = 3;
  const railBody = (items, emptyMsg) => {
    if (!items.length) return `<p class="rail-empty">${emptyMsg}</p>`;
    const shown = items.slice(0, CAP).join('');
    const rest = items.length - CAP;
    return shown + (rest > 0 ? `<p class="rail-more">+${rest} more</p>` : '');
  };

  return `<div class="effect-rails">
    <section class="rail rail-buffs">
      <div class="rail-label">Working for you</div>
      ${railBody(leftItems, 'Nothing active.')}
    </section>
    <section class="rail rail-threats">
      <div class="rail-label">Working against you</div>
      ${railBody(rightItems, 'Nothing aimed at you.')}
    </section>
  </div>`;
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
      const emoji = person.emoji ? iconForEmoji(person.emoji) : icon('user');
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
  const emoji = person.emoji ? iconForEmoji(person.emoji) : icon('user');
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

  const band = foundationBand(p.foundation);
  const profileChip = p.aiProfile === 'sprinter'
    ? `<span class="ai-profile-chip" title="Plays for the quarter, never the year. Watch the arc.">${icon('zap')} Sprinter</span>`
    : p.aiProfile === 'rival'
    ? `<span class="ai-profile-chip ai-profile-rival" title="Hunts whoever leads. Listen for pointed questions, and hold a counter.">${icon('swords')} Rival</span>` : '';
  return `<div class="ai-summary-block">
    <div class="ai-summary-header">
      <span class="ai-summary-name">${escHtml(p.name)}</span>
      ${profileChip}
      <span class="ai-found-band foundation-${band.key}" title="Foundation: ${band.label}">${band.label}</span>
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

  const cardView = s._boardCardView;
  const listCls = cardView ? 'market-cards market-cards--cards' : 'market-cards market-cards--compact';

  // Project Queue
  html += `<div class="market-panel"><div class="panel-label">Project Queue</div><div class="${listCls}">`;
  for (const c of s.markets.projectQueue) {
    html += renderMarketCard(c, cardView);
  }
  if (!s.markets.projectQueue.length) html += '<div class="empty-msg">Empty</div>';
  html += '</div></div>';

  // For Hire
  if (s.forHireUnlocked) {
    html += `<div class="market-panel"><div class="panel-label">For Hire</div><div class="${listCls}">`;
    for (const c of s.markets.forHire) {
      html += renderMarketCard(c, cardView);
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

function renderMarketCard(card, cardView) {
  const partners = getSynergyPartners(card.name);
  const synergyChip = partners.length
    ? `<span class="ms-synergy" title="Synergy: pairs with ${escHtml(partners.map(x => `${x.partner} (+${x.bonus} rep)`).join(', '))} when completed the same or back-to-back quarters">&#10226;</span>`
    : '';

  // `.market-strip` stays on the wrapper in both views: it is the trade target,
  // the coach-mark anchor, and what the trade E2E specs select on.
  const attrs = `class="market-strip ${cardView ? 'market-strip--card' : 'market-strip--compact'}"`
    + ` tabindex="0" role="button" aria-label="${escHtml(card.name)}, ${escHtml(card.type)}"`
    + ` onclick="window._tradeMarket('${card.id}')"`
    + ` ondblclick="window._showCardDetailById('${card.id}','market')"`
    + ` onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window._tradeMarket('${card.id}')}"`
    + ` data-card-name="${escHtml(card.name)}"`;

  if (cardView) {
    // The card face already carries value/members/deadline/reward, so the text
    // stat pills would just repeat it.
    return `<div ${attrs}>${renderCardHTML(card, { size: 'sm' })}${synergyChip}</div>`;
  }

  const color = typeColor(card.type);
  const stats = [];
  if (card.value) stats.push(`${card.value}v`);
  if (card.members) stats.push(`${card.members}p`);
  if (card.deadline) stats.push(`${card.deadline}q`);
  if (card.reward) stats.push(`+${card.reward}`);

  return `<div ${attrs}>
    <span class="market-strip-pip" style="background:${color}"></span>
    <span class="market-strip-name">${escHtml(card.name)}</span>
    ${synergyChip}
    ${stats.length ? `<span class="market-strip-stats">${stats.map(x => `<span>${x}</span>`).join('')}</span>` : ''}
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
  const band = foundationBand(p.foundation);
  const fill = Math.max(0, Math.min(100, typeof p.foundation === 'number' ? p.foundation : 100));
  el.innerHTML = `
    <div class="psb-rep"><span class="psb-label">Your REP</span><span class="psb-val">${p.reputation}</span></div>
    <div class="psb-foundation foundation-${band.key}" title="Team &amp; delivery health. Shortsighted plays, shipping on tech debt, chronic understaffing, erode it, and a crumbling foundation surfaces as burnout and incidents quarters later.">
      <div class="psb-found-head">
        <span class="psb-label">Foundation</span>
        <span class="psb-found-band">${band.label}</span>
      </div>
      <div class="found-meter"><div class="found-fill" style="width:${fill}%"></div></div>
    </div>
    ${s.upcomingRushQ ? `
    <div class="psb-next-rushq" data-card-name="${escHtml(s.upcomingRushQ.name)}">
      <span class="psb-label">${icon('siren')} Incoming Q${s.currentQuarter}</span>
      <span class="nrq-name">${escHtml(s.upcomingRushQ.name)}</span>
    </div>` : ''}`;
}

function renderHand(s) {
  const el = $('hand');
  const player = s.players[0];
  if (!player) { el.innerHTML = ''; return; }

  const count = player.hand.length;
  const isPlayTurn = s.turnSubPhase === 'play' && !s.animating;

  const guide = turnGuidance(s, s.players[0]);
  let html = `<div class="hand-label">
    <span class="hl-count">Your Hand (${count})</span>
    ${guide ? `<span class="turn-guide turn-guide-${guide.tone}" tabindex="0">${guide.text}</span>` : ''}
  </div>`;

  if (s._handCompact) {
    // Compact list view
    html += '<div class="hand-compact-list">';
    player.hand.forEach(card => {
      const color = typeColor(card.type);
      const selected = s.selectedCards.includes(card.id) ? 'selected' : '';
      html += `<div class="hcl-row ${selected}" style="--card-accent:${color}" onclick="window._selectCard('${card.id}')" ondblclick="window._playCardDoubleClick('${card.id}')">
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
    // Fan view — a shallow arc. Cards are now large enough to read at rest,
    // and a card you have to tilt your head for is a card you misplay, so the
    // spread stays under 3 degrees and the droop under 3px per step.
    const SPREAD_DEG = Math.min(2.6, count > 1 ? 20 / count : 0);
    const Y_MULT = 2.5;
    html += `<div class="hand-cards${isPlayTurn ? ' play-turn' : ''}">`;
    player.hand.forEach((card, index) => {
      const color = typeColor(card.type);
      const selected = s.selectedCards.includes(card.id) ? 'selected' : '';
      const angle = (index - (count - 1) / 2) * SPREAD_DEG;
      const yOffset = Math.abs(index - (count - 1) / 2) * Y_MULT;


      html += `<div class="hand-card ${selected}" data-card-id="${card.id}" style="--fan-angle:${angle}deg;--fan-y:${yOffset}px;--card-accent:${color};z-index:${index}" tabindex="0" role="button" aria-label="${escHtml(card.name)}, ${escHtml(card.type)}" onclick="window._selectCard('${card.id}')" ondblclick="window._playCardDoubleClick('${card.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window._selectCard('${card.id}')}" data-card-name="${escHtml(card.name)}">
        <div class="card-type-label" style="color:${color};border-color:${color}33;background:${color}18">${escHtml(card.type)}</div>
        ${renderCardHTML(card, { size: 'sm' })}
        <button class="hand-play-btn" onclick="event.stopPropagation();window._selectCard('${card.id}');window._playSelected()">&#9654; Play</button>
        ${isBudgetMode(s) && (card.type === 'Soft' || card.type === 'Hard' || card.type === 'Power') && (card.value || 0) > 0
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

  // Keep the fan visually centered: when it's wider than its track, park the
  // scroll at the midpoint so it never left-aligns behind the side controls.
  const fan = el.querySelector('.hand-cards');
  if (fan) {
    requestAnimationFrame(() => {
      const overflow = fan.scrollWidth - fan.clientWidth;
      if (overflow > 0) fan.scrollLeft = overflow / 2;
    });
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

/** Whether a hand card can be played right now, and why not. Single source of
 *  truth for the play prompt and double-click-to-play. */
export function getCardPlayability(s, card) {
  const playableTypes = ['Talent', 'Project', 'Project Queue', 'Bonus Project', 'Soft', 'Hard', 'Power', 'Favor'];
  if (!playableTypes.includes(card.type)) {
    return { playable: false, reason: 'This card can’t be played directly.' };
  }
  if ((s.apLeft ?? (s.apMax ?? 3)) <= 0) {
    return { playable: false, reason: 'No actions left this turn: End Turn to continue.' };
  }
  const isSkill = card.type === 'Soft' || card.type === 'Hard' || card.type === 'Power';
  const isProject = card.type === 'Project' || card.type === 'Project Queue' || card.type === 'Bonus Project';
  const opCost = card.value || 0;
  const human = s.players[0];
  if (isBudgetMode(s) && isSkill && opCost > 0 && !canAffordOpEx(s, human, opCost)) {
    const hb = (human && human.budget) || s.budget;
    return { playable: false, opCost, reason: `Not enough OpEx: need ${opCost}, have ${hb.opEx}.` };
  }
  if (isProject && s.quarterFlags.noNewProject) {
    return { playable: false, reason: 'Freeze active: no new projects this quarter.' };
  }
  if (isProject && (s.quarterFlags._noNewProject || []).includes(0)) {
    return { playable: false, reason: 'Kill the Project active: no new projects this quarter.' };
  }
  return { playable: true, opCost };
}

/** The one sentence a player needs to act right now.
 *  Ordered by urgency, not by rule order: a deadline you can still save beats
 *  generic advice, and "you have nothing left to do" beats silence. */
function turnGuidance(s, player) {
  if (s.turnSubPhase !== 'play') return null;

  const activeProjects = player.projects.filter((p) => !p.isCompleted);
  const idle = getUnassignedPeople(player);
  const apLeft = s.apLeft ?? s.apMax ?? 3;

  const understaffedDueSoon = activeProjects.find((p) => {
    const need = (p.members ?? 0) - getAssignedPeople(player, p.id).length;
    const left = (p.deadline ?? 0) - (p.quartersWorked ?? 0);
    return need > 0 && left <= 1;
  });
  if (understaffedDueSoon) {
    return { tone: 'urgent', text: `<b>${escHtml(understaffedDueSoon.name)}</b> is short of people and its deadline is next quarter. Staff it or take the penalty.` };
  }

  if (idle.length && activeProjects.some((p) => getAssignedPeople(player, p.id).length < (p.members ?? 0))) {
    return { tone: 'act', text: `${idle.length} ${idle.length === 1 ? 'person is' : 'people are'} idle and a project still needs staffing. Assigning is free.` };
  }

  if (!activeProjects.length) {
    return { tone: 'act', text: 'No project in flight. Play one from your hand or take one from the Project Queue, three empty quarters costs 5 reputation.' };
  }

  if (apLeft <= 0) {
    return { tone: 'done', text: 'Out of actions. Assigning idle people is still free, then end your turn.' };
  }

  return { tone: 'idle', text: `${apLeft} ${apLeft === 1 ? 'action' : 'actions'} left. Play a card, trade at a market, or move someone already assigned.` };
}

function renderActions(s) {
  const el = $('actions');
  if (s.turnPhase === 'gameOver') {
    el.innerHTML = '';
    return;
  }
  if (s.animating) {
    el.innerHTML = `<div class="action-bar"><span class="action-animating">${icon('settings')} Resolving effect…</span></div>`;
    return;
  }

  const player = s.players[0];
  if (!player) { el.innerHTML = ''; return; }

  let html = '<div class="action-bar">';

  if (s.turnSubPhase === 'play') {
    const apMax = s.apMax ?? 3;
    const left = s.apLeft ?? apMax;
    const pips = Array.from({ length: apMax }, (_, i) => `<span class="ap-pip ${i < left ? 'on' : ''}"></span>`).join('');
    const pressured = left < apMax ? ' ap-pressured' : '';
    html += `<div class="ap-meter${pressured}" title="Actions this turn, playing a card, trading, or moving an assigned person each cost 1. Drawing and fresh assignments are free.${left < apMax ? ' Board pressure: your foundation band cost you an action.' : ''}">
      <span class="ap-label">Actions</span><span class="ap-pips">${pips}</span>
    </div>`;
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

  html += `<div class="action-help">
    <button class="action-help-btn" onclick="window._showTutorial()" title="Replay tutorial" aria-label="Replay tutorial (keyboard: H)">Tutorial</button>
    <button class="action-help-btn" onclick="import('../shared/shortcuts.js').then(m => m.showShortcutsModal('classic'))" title="Keyboard shortcuts" aria-label="Keyboard shortcuts (keyboard: ?)">Keys</button>
  </div>`;

  html += '</div>';
  el.innerHTML = html;
}

/** Floating action popup for the selected hand card — replaces per-card buttons
 *  in the side dock. Shows the effect and a Play / Cancel control anchored above
 *  the lifted card; double-clicking the card plays it without this step. */
export function renderPlayPrompt(s) {
  const el = $('play-prompt');
  if (!el) return;
  const player = s.players[0];
  const active = !s.animating && s.turnSubPhase === 'play' && player && s.selectedCards.length === 1;
  const selCard = active ? player.hand.find(c => c.id === s.selectedCards[0]) : null;
  if (!selCard) { el.classList.add('hidden'); el.innerHTML = ''; return; }

  const play = getCardPlayability(s, selCard);
  const color = typeColor(selCard.type);
  if (play.playable) maybeShowHint('classic-first-play');

  const partners = ['Project', 'Project Queue', 'Bonus Project'].includes(selCard.type)
    ? getSynergyPartners(selCard.name) : [];
  const synergyLine = partners.length
    ? `<div class="pp-synergy">⟲ Pairs with ${partners.map(x => `${escHtml(x.partner)} <b>+${x.bonus}</b>`).join(' · ')}</div>`
    : '';

  // Docked side inspector: a fixed panel on the right, never over the board or
  // hand — the full card plus its play options in one predictable place.
  el.innerHTML = `
    <div class="pp-inner" style="--card-accent:${color}">
      <div class="pp-head">
        <span class="pp-pip" style="background:${color}"></span>
        <span class="pp-name">${escHtml(selCard.name)}</span>
        <span class="pp-type" style="color:${color}">${escHtml(selCard.type)}</span>
        <button class="pp-close" onclick="window._cancelSelection()" aria-label="Cancel selection">&times;</button>
      </div>
      <div class="pp-card">${renderCardHTML(selCard, { size: 'md' })}</div>
      ${synergyLine}
      ${play.playable
        ? `<button class="btn btn-play pp-play" onclick="window._playSelected()">▶ Play</button>`
        : `<div class="pp-blocked">${icon('triangle-alert')} ${escHtml(play.reason)}</div>`}
      <div class="pp-hint">Double-click a card to play it instantly · <button class="pp-link" onclick="window._showCardDetailById('${selCard.id}','hand')">details</button></div>
    </div>`;
  el.classList.remove('hidden');
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
        <div class="got-reflect">You ${placed} with ${human.reputation} rep. ${escHtml(humanRank === 1 ? 'Your archetype’s strengths carried the game, was it the strategy, or the draw?' : 'Would a different management style have fit these eight quarters better?')}</div>
      </div>`;
  }

  const topRep = Math.max(1, ...sorted.map(p => p.reputation));
  const rankWord = ['', '1st', '2nd', '3rd', '4th', '5th'][humanRank] || `${humanRank}th`;
  const won = humanRank === 1;
  const headline = won ? `${icon('trophy', { cls: 'ic-gold' })} You win!` : `You finished ${rankWord}`;
  const subhead = won
    ? 'Top of the org chart. The promotion is yours.'
    : `${escHtml(sorted[0].name)} took the promotion this time.`;

  el.innerHTML = `
    <div class="modal-content game-over-content ${won ? 'is-victory' : ''}">
      <div class="game-over-hero">
        <h2>${headline}</h2>
        <p class="game-over-sub">${subhead}</p>
      </div>
      <div class="standings">
        ${sorted.map((p, i) => {
          const medal = [icon('medal', { cls: 'ic-gold' }), icon('medal', { cls: 'ic-silver' }), icon('medal', { cls: 'ic-bronze' }), ''][Math.min(i, 3)];
          const b = getTraitBriefing(p);
          const pct = Math.max(4, Math.round((p.reputation / topRep) * 100));
          return `<div class="standing-row ${i === 0 ? 'winner' : ''} ${p === human ? 'is-human' : ''}">
            <span class="standing-medal">${medal}</span>
            <span class="standing-main">
              <span class="standing-name">${escHtml(p.name)}${b ? ` <span class="standing-archetype">${escHtml(b.archetype)}</span>` : ''}</span>
              <span class="standing-bar"><span class="standing-bar-fill" style="width:${pct}%"></span></span>
            </span>
            <span class="standing-rep">${p.reputation}<span class="standing-rep-unit"> rep</span></span>
          </div>`;
        }).join('')}
      </div>
      <div class="foresight-panel">
        <div class="fp-title">Foresight: the part reputation doesn’t show</div>
        <div class="fp-stats">
          <span class="fp-stat good">${icon('check')} ${human._cleanShips || 0} clean ship${(human._cleanShips || 0) === 1 ? '' : 's'}</span>
          <span class="fp-stat ${human._debtShips ? 'bad' : ''}">${icon('triangle-alert')} ${human._debtShips || 0} debt ship${(human._debtShips || 0) === 1 ? '' : 's'}</span>
          <span class="fp-stat ${human._quartersBelowStrained ? 'bad' : ''}">${human._quartersBelowStrained || 0} quarter${(human._quartersBelowStrained || 0) === 1 ? '' : 's'} below Strained</span>
          <span class="fp-stat ${human._consequencesFired ? 'bad' : ''}">${human._consequencesFired || 0} consequence${(human._consequencesFired || 0) === 1 ? '' : 's'}</span>
        </div>
      </div>
      ${renderForecastPanel(s, human)}
      ${traitBlock}
      <div class="game-over-actions">
        <button class="btn btn-secondary" onclick="window._showStory()">${icon('book-open')} Story of the Year</button>
        <button class="btn btn-secondary" onclick="window._showDebrief()">Reflection</button>
        <button class="btn btn-play" onclick="window._newGame()">Play Again</button>
      </div>
    </div>
  `;
}

/** Forecast vs. reality — the prediction beat's payoff on the game-over screen. */
function renderForecastPanel(s, human) {
  const fc = s.forecasts?.q1;
  if (!fc) return '';
  const BAND_LABELS = { solid: 'Solid', strained: 'Strained', cracking: 'Cracking', crumbling: 'Crumbling' };
  const actualBand = foundationBand(human.foundation);
  const actual = {
    projects: forecastBucket('projects', human.projects.filter(p => p.isCompleted).length),
    rep: forecastBucket('rep', human.reputation),
  };
  const row = (label, called, got, hit) =>
    `<div class="fc-row ${hit ? 'hit' : 'miss'}">
      <span class="fc-label">${label}</span>
      <span class="fc-called">${escHtml(called)}</span>
      <span class="fc-arrow">→</span>
      <span class="fc-actual">${escHtml(got)}</span>
      <span class="fc-mark">${hit ? icon('check') : icon('x')}</span>
    </div>`;
  const rows = [];
  if (fc.projects) rows.push(row('Projects', fc.projects, actual.projects, fc.projects === actual.projects));
  if (fc.rep) rows.push(row('Reputation', fc.rep, actual.rep, fc.rep === actual.rep));
  if (fc.band) rows.push(row('Team health', BAND_LABELS[fc.band] || fc.band, actualBand.label, fc.band === actualBand.key));
  if (s.forecasts.q5?.band) rows.push(row('Mid-year call', BAND_LABELS[s.forecasts.q5.band] || '', actualBand.label, s.forecasts.q5.band === actualBand.key));
  if (!rows.length) return '';
  return `<div class="forecast-panel">
    <div class="fp-title">Forecast vs. reality</div>
    <div class="fc-rows">${rows.join('')}</div>
  </div>`;
}

/** Render the Story of the Year — the persistent chronicle of decisions and their
 *  downstream consequences, grouped by quarter, so a played game reads back as a
 *  cause-and-effect narrative for reflection or a workshop debrief. */
export function renderStoryModal(s) {
  const el = $('modal');
  if (!el) return;
  el.classList.remove('hidden');

  const beats = (s.chronicle || []).filter(b => b && b.text);
  const human = s.players[0];
  const finalBand = foundationBand(human?.foundation);
  const decisions = beats.filter(b => b.kind === 'decision').length;
  const consequences = beats.filter(b => b.kind === 'consequence').length;

  let thesis;
  if (consequences === 0 && decisions === 0) {
    thesis = 'A steady year: you built on a solid foundation and let the work compound.';
  } else if (consequences === 0) {
    thesis = 'You took some shortcuts, but stayed ahead of the bill before it came due.';
  } else {
    thesis = `${consequences} expedient call${consequences === 1 ? '' : 's'} came due later. The shortcuts you couldn’t see the cost of at the time.`;
  }

  const kindIcon = { milestone: icon('flag'), decision: icon('zap'), shift: icon('activity'), consequence: icon('triangle-alert'), whisper: '…' };
  const quarters = [...new Set(beats.map(b => b.q))].sort((a, b) => a - b);

  const rows = quarters.map(q => {
    const qBeats = beats.filter(b => b.q === q);
    const items = qBeats.map(b => {
      const cause = (b.kind === 'consequence' && b.cause && b.cause !== q)
        ? `<span class="story-cause">⟵ seeded in Q${b.cause}${b.avoid ? `, when you ${escHtml(b.avoid)}` : ''}</span>` : '';
      return `<div class="story-beat story-${b.kind}">
        <span class="story-icon">${kindIcon[b.kind] || '•'}</span>
        <span class="story-text">${escHtml(b.text)}${cause}</span>
      </div>`;
    }).join('');
    return `<div class="story-quarter">
      <div class="story-q-label">Q${q}</div>
      <div class="story-beats">${items}</div>
    </div>`;
  }).join('');

  // Teaching contrast: the Sprinter's arc vs yours, drawn from reputationHistory.
  let contrastHtml = '';
  const sprinter = s.players.find(p => p.aiProfile === 'sprinter');
  if (sprinter && s.turnPhase === 'gameOver') {
    const si = s.players.indexOf(sprinter);
    let peak = { q: null, rep: -Infinity };
    for (const [q, m] of Object.entries(s.reputationHistory || {})) {
      const r = m?.[si];
      if (r != null && r > peak.rep) peak = { q, rep: r };
    }
    if (peak.q != null) {
      const sb = foundationBand(sprinter.foundation);
      contrastHtml = `<div class="story-contrast">${icon('zap')} ${escHtml(sprinter.name)} played the Sprinter: peaked at ${peak.rep} rep in Q${peak.q}, finished with ${sprinter.reputation} on a ${sb.label} foundation, while yours ended ${finalBand.label}.</div>`;
    }
  }

  el.innerHTML = `
    <div class="modal-content story-content">
      <div class="modal-header">
        <h3>${icon('book-open')} Your Story of the Year</h3>
        <button class="modal-close" onclick="window._closeModal()">&times;</button>
      </div>
      <p class="story-thesis">${escHtml(thesis)}</p>
      <div class="story-timeline">${rows || '<div class="empty-msg">No notable beats recorded.</div>'}</div>
      ${contrastHtml}
      <div class="story-footer">
        <span class="story-final foundation-${finalBand.key}">Final foundation: <strong>${finalBand.label}</strong></span>
        <div class="story-actions">
          <button class="btn btn-secondary btn-sm" onclick="window._copyStory()" title="Copy the timeline as plain text for retro notes">Copy as text</button>
          <button class="btn btn-secondary btn-sm" onclick="window._printStory()" title="Print the timeline. The workshop debrief sheet">Print</button>
        </div>
      </div>
    </div>`;
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
          `).join('') || '<div class="empty-msg">All assigned, click a person on a project card to unassign</div>'}
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
          <div class="trade-target-img">${renderCardHTML(marketCard, { size: 'md' })}</div>
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
          ${renderCardHTML(card, { size: 'md' })}
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
    bannerText = 'Completed: Reward earned!';
  } else if (overdue) {
    bannerClass = 'proj-banner-fail';
    bannerText = 'Overdue: Project at risk!';
  } else if (onTrack) {
    bannerClass = 'proj-banner-ok';
    bannerText = `On track: ${timeLeft}q remaining, fully staffed`;
  } else if (assigned.length > 0) {
    bannerClass = 'proj-banner-warn';
    bannerText = `Needs ${needed - assigned.length} more member${needed - assigned.length > 1 ? 's' : ''}, ${timeLeft}q left`;
  } else {
    bannerClass = 'proj-banner-warn';
    bannerText = `Unstaffed: needs ${needed} member${needed > 1 ? 's' : ''}, ${timeLeft}q left`;
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
              <span class="proj-detail-person-role">${escHtml(p.type || '')}${p.value ? `: ${p.value}v` : ''}</span>
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
        <div class="rq-warning">${icon('triangle-alert')} RUSH QUARTER INCOMING ${icon('triangle-alert')}</div>
        <div class="rq-all-players">${icon('zap')} AFFECTS ALL PLAYERS ${icon('zap')}</div>
        <div class="rq-card-img">${renderCardHTML(card, { size: 'md' })}</div>
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

/** One-glance summary card between quarters (replaces log excavation). */
export function showQuarterRecap(recap) {
  return new Promise(resolve => {
    const el = $('rush-q-overlay');
    if (!el) { resolve(); return; }
    const deltas = recap.repDeltas.map(d => `
      <div class="qr-row ${d.isHuman ? 'qr-you' : ''}">
        <span class="qr-name">${escHtml(d.name)}</span>
        <span class="qr-delta ${d.delta > 0 ? 'good' : d.delta < 0 ? 'bad' : ''}">${d.delta > 0 ? '+' : ''}${d.delta}</span>
        <span class="qr-total">${d.rep} rep</span>
      </div>`).join('');
    const bandChanged = recap.bandBefore !== recap.bandAfter;
    el.className = 'quarter-recap-overlay';
    el.innerHTML = `
      <div class="quarter-recap" role="dialog" aria-modal="true" aria-label="Quarter ${recap.quarter} recap">
        <div class="qr-head">${icon('history')} Q${recap.quarter} wrapped</div>
        ${recap.shipped.length
          ? `<div class="qr-section good">${icon('check')} Shipped: ${recap.shipped.map(escHtml).join(', ')}</div>`
          : `<div class="qr-section muted">${icon('circle')} Nothing shipped this quarter.</div>`}
        ${recap.rushQ ? `<div class="qr-section bad">${icon('siren')} Rush Q hit: ${escHtml(recap.rushQ)}</div>` : ''}
        <div class="qr-section qr-foundation ${bandChanged ? 'changed' : ''}">
          ${icon('heart-pulse')} Foundation: ${escHtml(recap.bandBefore)}${bandChanged ? ` → ${escHtml(recap.bandAfter)}` : ' (steady)'}
        </div>
        <div class="qr-standings">${deltas}</div>
        ${recap.upcoming ? `<div class="qr-section warn">${icon('triangle-alert')} Incoming at Q${recap.nextQuarter} end: ${escHtml(recap.upcoming)}</div>` : ''}
        <button class="btn btn-play qr-btn" id="qr-continue-btn">On to Q${recap.nextQuarter} of ${recap.totalQuarters}</button>
      </div>`;
    document.getElementById('qr-continue-btn').addEventListener('click', () => {
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

/** Show interactive choice dialog.
 *  `extra.heading` overrides the title without touching the rendered card, so a
 *  reaction window can say who is attacking while still showing the real card
 *  face. `extra.note` prints the stake above the options. */
export function showChoiceDialog(card, options, canRefuse = false, extra = {}) {
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
      <div class="modal-content effect-dialog${extra.heading ? ' effect-dialog--reaction' : ''}">
        <div class="modal-header">
          <h3>${escHtml(extra.heading || card.name)}</h3>
          <span style="font-size:var(--text-xs);color:var(--text-muted)">${escHtml(card.type)}</span>
        </div>
        <div class="effect-card-img">${renderCardHTML(card, { size: 'md' })}</div>
        <div class="effect-desc">${escHtml(card.skill || '')}</div>
        ${extra.note ? `<p class="choice-stake">${escHtml(extra.note)}</p>` : ''}
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
      // Tear the markup down, don't just hide it. A resolved dialog that leaves
      // its buttons in the DOM is still findable — anything querying
      // `.choice-option-btn` picks up a dead control it can never click.
      el.innerHTML = '';
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

// ── Hover preview ────────────────────────────────────────────
// One system for every [data-card-name] on the board, hand included. There
// used to be two: an immediate one for the hand and a 400ms one for everything
// else, positioned differently, sized differently, and using hardcoded 300x420
// constants that matched neither the CSS width nor the rendered card.

let hoverTimer = null;
let hoverAnchor = null;

const HOVER_DELAY_HAND = 90;   // the hand is deliberate pointing — near-instant
const HOVER_DELAY_BOARD = 200; // the board is often crossed on the way somewhere

function initHoverPreview() {
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-card-name]');
    if (!el || el === hoverAnchor) return;
    clearTimeout(hoverTimer);
    hoverAnchor = el;
    const delay = el.closest('.hand-cards') ? HOVER_DELAY_HAND : HOVER_DELAY_BOARD;
    hoverTimer = setTimeout(() => showHoverPreview(el), delay);
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('[data-card-name]');
    if (!el || el !== hoverAnchor) return;
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;
    clearTimeout(hoverTimer);
    hoverAnchor = null;
    hideHoverPreview();
  });

  // A preview anchored to an element that scrolled away is just litter.
  document.addEventListener('scroll', hideHoverPreview, { capture: true, passive: true });
}

function showHoverPreview(anchor) {
  if (state.animating) return;
  const name = anchor.dataset.cardName;
  const preview = $('card-hover-preview');
  if (!name || !preview) return;

  // The selected card already has the play prompt showing it full size.
  const handCard = anchor.closest('.hand-card');
  if (handCard && state.selectedCards.includes(handCard.dataset.cardId)) return;

  const card = findCardByName(name);
  if (!card) return; // Better nothing than the old grey name-only box.

  const isHand = !!anchor.closest('.hand-cards');
  const rect = anchor.getBoundingClientRect();
  const gap = 14;

  // One size everywhere (--rc-inspect), so the zoom is recognisably the same
  // card as the play prompt shows. Only shrink when the window genuinely
  // cannot fit it; the card is 5:7, so a height limit is a width limit.
  const availH = (isHand ? rect.top - gap : window.innerHeight) - 16;
  const ideal = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--rc-inspect'), 10) || 240;
  const w = Math.max(150, Math.min(ideal, Math.floor(availH * 5 / 7), window.innerWidth - 24));
  preview.style.setProperty('--rc-size', `${w}px`);
  preview.innerHTML = renderCardHTML(card, { size: 'md' });
  preview.classList.remove('hidden');

  const pw = preview.offsetWidth;
  const ph = preview.offsetHeight;
  let left;
  let top;

  if (isHand) {
    left = rect.left + rect.width / 2 - pw / 2;
    top = rect.top - ph - gap;
  } else {
    left = rect.right + gap;
    if (left + pw > window.innerWidth - 8) left = rect.left - pw - gap;
    top = rect.top + rect.height / 2 - ph / 2;
  }

  preview.style.left = `${Math.max(8, Math.min(left, window.innerWidth - pw - 8))}px`;
  preview.style.top = `${Math.max(8, Math.min(top, window.innerHeight - ph - 8))}px`;
}

function hideHoverPreview() {
  const preview = $('card-hover-preview');
  if (!preview || preview.classList.contains('hidden')) return;
  preview.classList.add('hidden');
  preview.innerHTML = '';
}

// ── Timeline and Reputation Graph ────────────────────────────

export function renderTimeline(s) {
  const total = s.totalQuarters || 8;
  let html = '<div class="timeline-container">';

  for (let q = 1; q <= total; q++) {
    const isCompleted = q < s.currentQuarter;
    const isCurrent = q === s.currentQuarter;
    const className = isCurrent ? 'current' : isCompleted ? 'completed' : '';
    const mark = isCompleted ? '✓' : isCurrent ? '▶' : q;

    html += `<div class="timeline-quarter ${className}" title="Quarter ${q}">
      ${mark}
    </div>`;
  }

  html += '</div>';
  return html;
}

export function renderReputationGraph(s) {
  const history = s.reputationHistory || {};
  const quarters = Object.keys(history).sort((a, b) => a - b);
  // A hidden node still contributes the flex `gap` above it, so emit nothing.
  if (quarters.length < 2) return '';

  const reps = quarters.flatMap(q => Object.values(history[q]));
  const maxRep = Math.max(...reps);
  const minRep = Math.min(...reps, 0);
  const range = maxRep - minRep || 1;

  const open = !!s._repGraphOpen;
  const leader = s.players.reduce((best, p, i) =>
    p.reputation > s.players[best].reputation ? i : best, 0);
  const you = s.players[0];
  const summary = leader === 0
    ? `You lead on ${you.reputation}`
    : `You ${you.reputation} · ${escHtml(s.players[leader].name)} leads on ${s.players[leader].reputation}`;

  let html = `<section class="graph-container" data-open="${open}">
    <button class="graph-toggle" type="button" aria-expanded="${open}" aria-controls="rep-graph-body"
            onclick="window._toggleRepGraph()">
      <span class="gt-caret" aria-hidden="true"></span>
      <span class="gt-title">Reputation</span>
      <span class="gt-summary">${summary}</span>
    </button>
    <div class="graph-body" id="rep-graph-body">`;

  if (open) {
    // One SVG in fixed user units with a viewBox, so lines and dots finally
    // share a coordinate system. The old markup gave the polyline raw pixels
    // and the circles percentages, which drew them in different spaces.
    const W = 360, H = 120;
    const PAD = { l: 32, r: 14, t: 10, b: 20 };
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;
    const n = quarters.length;
    // Indexed by position in the history, not by quarter number: the old code
    // divided an absolute quarter by a count of samples, which threw points
    // off-canvas whenever history had a gap or did not start at Q1.
    const xAt = i => PAD.l + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const yAt = rep => PAD.t + plotH - ((rep - minRep) / range) * plotH;

    html += `<svg class="rep-graph" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Reputation over time">`;

    for (let i = 0; i <= 4; i++) {
      const y = PAD.t + (i / 4) * plotH;
      html += `<line class="rep-grid" x1="${PAD.l}" y1="${y}" x2="${W - PAD.r}" y2="${y}"/>`;
    }
    html += `<text class="rep-axis" x="${PAD.l - 6}" y="${yAt(maxRep) + 3}" text-anchor="end">${maxRep}</text>`;
    html += `<text class="rep-axis" x="${PAD.l - 6}" y="${yAt(minRep) + 3}" text-anchor="end">${minRep}</text>`;
    for (let i = 0; i < n; i++) {
      html += `<text class="rep-axis" x="${xAt(i)}" y="${H - 6}" text-anchor="middle">Q${escHtml(quarters[i])}</text>`;
    }

    for (let pi = 0; pi < s.players.length; pi++) {
      const pts = quarters.map((q, i) => `${xAt(i)},${yAt(history[q][pi] || 0)}`).join(' ');
      const dots = quarters.map((q, i) =>
        `<circle cx="${xAt(i)}" cy="${yAt(history[q][pi] || 0)}" r="3" fill="currentColor"/>`).join('');
      html += `<g class="rep-series rep-series-${pi}">
        <polyline points="${pts}" stroke="currentColor" fill="none" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        ${dots}
      </g>`;
    }
    html += '</svg>';

    html += '<div class="graph-legend">';
    for (let pi = 0; pi < s.players.length; pi++) {
      html += `<span class="legend-item rep-series-${pi}">
        <span class="legend-color"></span>${escHtml(s.players[pi].name)}
      </span>`;
    }
    html += '</div>';
  }

  html += '</div></section>';
  return html;
}

initHoverPreview();
