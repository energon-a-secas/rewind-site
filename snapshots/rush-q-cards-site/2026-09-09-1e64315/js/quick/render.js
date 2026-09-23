// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — rendering

import { icon, iconForEmoji } from '../shared/icons.js';
import { state } from './state.js';
import { $, escHtml } from './utils.js';
import { getHireCost, isPremium, getMembersNeeded, getSquareCost } from './data.js';
import { getUncommittedPeople } from './engine.js';
import { renderCardHTML, costGlyph } from '../shared/card-component.js';
import { typeColor } from '../shared/cards-data.js';
import { maybeShowHint } from '../shared/hints.js';

let _prevRep = null;

export function render(s) {
  if (s._simMode) return;
  const setup = $('setup-screen');
  const draft = $('draft-screen');
  const agenda = $('agenda-screen');
  const game = $('game-screen');
  const over = $('game-over-screen');

  setup.classList.toggle('hidden', s.phase !== 'setup');
  draft.classList.toggle('hidden', s.phase !== 'draft');
  agenda.classList.toggle('hidden', s.phase !== 'agenda');
  game.classList.toggle('hidden', s.phase !== 'play');
  over.classList.toggle('hidden', s.phase !== 'gameOver');

  // Phase drives shell layout: the game log only docks during active play.
  document.body.dataset.qgPhase = s.phase;

  if (s.phase === 'draft') renderDraft(s);
  if (s.phase === 'agenda') renderAgenda(s);
  if (s.phase === 'play') renderGame(s);
  if (s.phase === 'gameOver') renderGameOver(s);
  renderLog(s);
}

function renderDraft(s) {
  maybeShowHint('quick-first-draft');
  const pool = $('draft-pool');
  const instruction = $('draft-instruction');
  const order = s._draftOrder;
  const currentDrafter = order[s.draftTurn];
  const player = s.players[currentDrafter];
  const yourPicks = s.players[0]?.people?.length ?? 0;
  const picksEach = Math.round(order.length / s.players.length);

  instruction.textContent = player?.isAI
    ? `${player.name} is picking\u2026`
    : `Your pick ${Math.min(yourPicks + 1, picksEach)} of ${picksEach} \u2014 you keep this person all game.`;

  // Snake order is the one thing nobody guesses correctly. Show it: who picks
  // next, and how many turns until it comes back around to you.
  const track = $('draft-order');
  if (track) {
    track.innerHTML = order.map((idx, i) => {
      const pl = s.players[idx];
      const state = i < s.draftTurn ? 'done' : i === s.draftTurn ? 'now' : 'next';
      return `<span class="draft-order-pip is-${state}${pl?.isAI ? '' : ' is-you'}" title="${escHtml(pl?.name ?? '')}">${escHtml(pl?.isAI ? pl.name.slice(0, 1) : 'You')}</span>`;
    }).join('');
  }

  pool.innerHTML = s.draftPool.map(p => {
    const premium = isPremium(p);
    const cost = getHireCost(p);
    const emoji = p.emoji ? iconForEmoji(p.emoji) : icon('user');
    const color = typeColor(p.type);
    const slots = premium ? 2 : 1;
    return `<button type="button" class="draft-card${premium ? ' premium' : ''}" style="--card-color:${color}" onclick="window._draftPick('${p.id}')" aria-label="Draft ${escHtml(p.name)}">
      <div class="draft-type-badge">${escHtml(p.type)}</div>
      <div class="draft-emoji">${emoji}</div>
      <div class="draft-name">${escHtml(p.name)}</div>
      <div class="draft-worth">Fills <b>${slots}</b> project ${slots === 1 ? 'slot' : 'slots'}</div>
      <div class="draft-cost"><span class="draft-cost-tri">${costGlyph('capex').repeat(cost)}</span> <span class="draft-cost-label">to hire later</span></div>
      ${premium ? `<div class="draft-premium">${icon('star')} Counts as 2</div>` : ''}
    </button>`;
  }).join('');
}

function renderAgenda(s) {
  maybeShowHint('both-secret-agenda');
  $('agenda-choices').innerHTML = s.agendaOptions.map(a => `
    <div class="agenda-card" onclick="window._pickAgenda('${escHtml(a.name)}')">
      <div class="agenda-name">${escHtml(a.name)}</div>
      <div class="agenda-desc">${escHtml(a.desc)}</div>
      <div class="agenda-tier">Tier ${a.tier} &middot; +10 bonus if completed</div>
    </div>
  `).join('');
}

function renderGame(s) {
  renderTopBar(s);
  renderCenterProjects(s);
  renderPeoplePool(s);
  renderDirectives(s);
  renderPlayerBoard(s);
  renderHand(s);
  renderActions(s);
  // First-turn coach-mark once the action bar exists and it's the human's turn.
  if (s.turnIndex === 0) maybeShowHint('quick-first-turn');
}

function renderTopBar(s) {
  const human = s.players[0];
  const cp = s.players[s.turnIndex];
  const isMyTurn = s.turnIndex === 0 && !human._mustDiscard;

  const delta = _prevRep !== null ? human.rep - _prevRep : 0;
  _prevRep = human.rep;
  const deltaHtml = delta > 0 ? `<span class="rep-delta">+${delta}</span>` : delta < 0 ? `<span class="rep-delta negative">${delta}</span>` : '';

  const maxRep = Math.max(0, ...s.players.map(p => p.rep));
  const anyRep = s.players.some(p => p.rep !== 0);
  const sortedRep = [...s.players].map(p => p.rep).sort((a, b) => b - a);
  const chips = s.players.map((p, i) => {
    const isLeader = p.rep === maxRep && anyRep;
    const rank = sortedRep.indexOf(p.rep) + 1;
    const badge = isLeader ? icon('crown', { cls: 'ic-gold', label: 'Leader' }) : anyRep ? rank : '·';
    return `<div class="qhud-chip${i === 0 ? ' human' : ''}${isLeader ? ' leader' : ''}${i === s.turnIndex ? ' active-turn' : ''}">
      <span class="qhud-rank">${badge}</span>
      <span class="qhud-name">${escHtml(p.name)}${i === 0 ? ' (you)' : ''}</span>
      <span class="qhud-rep">${p.rep}</span>
    </div>`;
  }).join('');

  $('top-bar').innerHTML = `
    <div class="qhud-stats">
      <div class="qhud-stat quarter"><span class="qhud-lbl">Quarter</span><span class="qhud-q">${s.quarter}<span class="qhud-of">/3</span></span></div>
      <div class="qhud-stat"><span class="qhud-lbl">Rep</span><span class="qhud-val tb-rep-wrap">${human.rep}${deltaHtml}</span></div>
      <div class="qhud-stat"><span class="qhud-lbl">Hand</span><span class="qhud-val">${human.hand.length}</span></div>
      <div class="qhud-stat"><span class="qhud-lbl">Done</span><span class="qhud-val">${human.completedProjects.length}</span></div>
    </div>
    <div class="qhud-turn">${isMyTurn ? 'Your turn' : `${escHtml(cp.name)}’s turn`}</div>
    <div class="qhud-scores">${chips}</div>
  `;
}

function renderCenterProjects(s) {
  $('project-count').textContent = `(${s.centerProjects.length})`;
  const human = s.players[0];

  const canDrop = !human.hasPassed && s.turnIndex === 0;
  $('qg-projects').innerHTML = s.centerProjects.map(p => {
    const needed = getMembersNeeded(p);
    const sqCost = getSquareCost(p);
    return `<div class="qg-project-card"${canDrop ? ` data-drop-project="${p.id}" ondragover="window._qgDragOver(event)" ondragleave="window._qgDragLeave(event)" ondrop="window._qgDrop(event,'${p.id}')"` : ''}>
      <div class="pj-name">${escHtml(p.name)}</div>
      <div class="pj-stats">
        <div class="pj-stat"><span class="icon">${icon('user')}</span> ${needed} ${needed === 1 ? 'person' : 'people'}</div>
        <div class="pj-stat"><span class="icon">${icon('star')}</span> ${p.reward || 0} rep</div>
        ${sqCost ? `<div class="pj-sq">${costGlyph('opex')} ${sqCost}</div>` : ''}
      </div>
      ${!human.hasPassed && s.turnIndex === 0 ? `
        <div class="pj-actions">
          <button class="btn btn-sm btn-action" onclick="window._showCommitModal('${p.id}')">Commit</button>
        </div>
      ` : ''}
    </div>`;
  }).join('') || '<div style="color:var(--text-muted);font-size:var(--text-sm)">No projects in center</div>';

  if (s.centerProjects.length && s.turnIndex === 0) maybeShowHint('quick-first-commit');
}

function renderPeoplePool(s) {
  const human = s.players[0];
  const isMyTurn = s.turnIndex === 0 && !human.hasPassed;

  $('qg-people-pool').innerHTML = s.peoplePool.map(p => {
    const cost = getHireCost(p);
    const premium = isPremium(p);
    return `<div class="qg-person-chip${premium ? ' premium' : ''}" ${isMyTurn ? `onclick="window._showHireModal('${p.id}')"` : ''}>
      <span class="chip-name">${escHtml(p.name)}</span>
      <span class="chip-cost"><span class="shape-tri">${costGlyph('capex').repeat(cost)}</span></span>
    </div>`;
  }).join('') || '<span style="color:var(--text-muted);font-size:var(--text-sm)">Empty</span>';
}

function renderDirectives(s) {
  if (!s.directives.length) { $('qg-directive').innerHTML = ''; return; }

  maybeShowHint('quick-first-directive');
  $('qg-directive').innerHTML = s.directives.map(d => `
    <div class="dir-label">Management Directive${d.claimed ? ' (Claimed!)' : ''}</div>
    <div class="dir-name">${escHtml(d.name)}</div>
    <div class="dir-desc">${escHtml(d.desc)}</div>
    <div class="dir-reward">+${d.reward} rep to first player</div>
  `).join('<hr style="border-color:var(--border-subtle);margin:8px 0">');
}

function renderPlayerBoard(s) {
  const human = s.players[0];
  const uncommitted = getUncommittedPeople(human);
  const committedIds = new Set();
  for (const ids of Object.values(human.committed)) {
    for (const id of ids) committedIds.add(id);
  }

  const canDrag = s.turnIndex === 0 && !human.hasPassed;
  $('team-count').textContent = `(${human.people.length})`;
  $('qg-my-people').innerHTML = human.people.map(p => {
    const isCommitted = committedIds.has(p.id);
    const premium = isPremium(p);
    const draggable = canDrag && !isCommitted;
    return `<div class="qg-my-person${isCommitted ? ' committed' : ''}"${draggable ? ` draggable="true" data-person="${p.id}" ondragstart="window._qgDragPerson(event,'${p.id}')" ondragend="window._qgDragEnd(event)"` : ''} title="${draggable ? 'Drag onto a project to commit' : ''}">
      ${draggable ? '<span class="mp-grip" aria-hidden="true">⠿</span>' : ''}
      <span class="mp-name">${escHtml(p.name)}</span>
      ${premium ? '<span class="mp-badge">x2</span>' : ''}
      <span class="mp-status">${isCommitted ? 'Committed' : 'Free'}</span>
    </div>`;
  }).join('') || '<div style="color:var(--text-muted);font-size:var(--text-xs)">No team members</div>';

  $('qg-my-projects').innerHTML = human.projects.map(proj => {
    const committed = (human.committed[proj.id] || []);
    const pushCount = human.pushed[proj.id] || 0;
    const needed = getMembersNeeded(proj);
    const sqNeeded = getSquareCost(proj);
    const sqPaid = human.squaresPaid[proj.id] || 0;

    let effective = pushCount;
    for (const pid of committed) {
      const person = human.people.find(pe => pe.id === pid);
      effective += (person && isPremium(person)) ? 2 : 1;
    }

    const peopleMet = effective >= needed;
    const sqMet = sqPaid >= sqNeeded;

    const canCommitMore = !peopleMet && s.turnIndex === 0 && !human.hasPassed;
    const canDrop = s.turnIndex === 0 && !human.hasPassed;
    return `<div class="qg-my-project"${canDrop ? ` data-drop-project="${proj.id}" ondragover="window._qgDragOver(event)" ondragleave="window._qgDragLeave(event)" ondrop="window._qgDrop(event,'${proj.id}')"` : ''}>
      <div class="mp-name">${escHtml(proj.name)}</div>
      <div class="mp-progress">
        <span class="${peopleMet ? 'ok' : 'need'}">${icon('user')} ${effective}/${needed}</span>
        ${sqNeeded ? ` <span class="${sqMet ? 'ok' : 'need'}">${costGlyph('opex')} ${sqPaid}/${sqNeeded}</span>` : ''}
        ${pushCount ? ` <span>+${pushCount} pushed</span>` : ''}
      </div>
      ${canCommitMore ? `<button class="btn btn-sm btn-action" onclick="window._showCommitModal('${proj.id}')" style="margin-top:4px;font-size:0.7rem">+ Commit More</button>` : ''}
    </div>`;
  }).join('') || '<div style="color:var(--text-muted);font-size:var(--text-xs)">No active projects</div>';
}

function renderHand(s) {
  const human = s.players[0];

  let handHtml = human.hand.map(c => {
    const selected = human._selectedCard === c.id;
    const size = s.cardSize || 'sm';
    const cardHtml = renderCardHTML(c, { size });
    return `<div class="qg-hand-card-wrap${selected ? ' selected' : ''}"
        onclick="window._selectCard('${c.id}')">
      ${cardHtml}
      <button class="hc-info" onclick="event.stopPropagation();window._showCardDetail('${c.id}')" title="Card details">ⓘ</button>
    </div>`;
  }).join('');

  // Mulligan button — available on Q1, first turn, if not used yet and no actions taken
  if (s.quarter === 1 && !human._mulliganUsed && !human.hasPassed && s.turnIndex === 0 && !s.playerHasActed) {
    handHtml += `<button class="btn btn-sm btn-mulligan" onclick="window._doMulligan()" title="Return hand and draw 5 new cards (once per game)">${icon('refresh-cw')} Mulligan</button>`;
  }

  $('qg-hand').innerHTML = handHtml;
  renderViewControls(s);
}

function renderViewControls(s) {
  const controls = document.querySelector('.qg-view-controls');
  if (!controls) return;

  const currentSize = s.cardSize || 'sm';

  // Update active button
  controls.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === currentSize);
  });
}

function renderActions(s) {
  const human = s.players[0];
  const isMyTurn = s.turnIndex === 0;
  const disabled = !isMyTurn || human.hasPassed;

  if (human._mustDiscard) {
    $('qg-actions').innerHTML = `<span style="color:#f59e0b;font-size:var(--text-sm)">Click a card to discard it (draw 2 keep 1)</span>`;
    return;
  }

  const canLend = !disabled && getUncommittedPeople(human).length > 0 &&
    s.players.some(p => p !== human && p.projects.length > 0);

  const budgetWithSq = human.hand.filter(c => c._isBudget && c.symbols && c.symbols.some(s => s === 'sq'));
  const projectsNeedSq = human.projects.filter(p => getSquareCost(p) > (human.squaresPaid[p.id] || 0));
  const canPaySq = !disabled && budgetWithSq.length > 0 && projectsNeedSq.length > 0;

  $('qg-actions').innerHTML = `
    <button class="btn btn-action" ${disabled ? 'disabled' : ''} onclick="window._actionDraw()">Draw</button>
    <button class="btn btn-action" ${disabled || !human._selectedCard ? 'disabled' : ''} onclick="window._actionPlay()">Play</button>
    <button class="btn btn-action" ${disabled ? 'disabled' : ''} onclick="window._actionPush()">Push</button>
    <button class="btn btn-action" ${canPaySq ? '' : 'disabled'} onclick="window._actionPaySquares()">Pay ${costGlyph('opex')}</button>
    <button class="btn btn-action" ${canLend ? '' : 'disabled'} onclick="window._actionLend()">Lend</button>
    <button class="btn btn-end-turn" ${disabled ? 'disabled' : ''} onclick="window._actionPass()">Pass</button>
  `;
}

function renderGameOver(s) {
  const sorted = [...s.players].sort((a, b) => b.rep - a.rep);
  const winner = sorted[0];
  const isHumanWinner = winner === s.players[0];

  let html = `<div class="go-trophy">${isHumanWinner ? icon('trophy', { cls: 'ic-gold' }) : icon('chart-column')}</div>`;
  html += `<h2 class="go-title">${escHtml(winner.name)} ${isHumanWinner ? 'Victory!' : 'wins!'}</h2>`;
  html += `<p class="go-subtitle">${isHumanWinner ? 'Outstanding corporate leadership.' : 'Better luck next quarter.'}</p>`;

  const topRep = Math.max(1, ...sorted.map(p => p.rep));
  html += '<div class="go-scores">';
  sorted.forEach((p, i) => {
    const medal = i === 0 ? icon('medal', { cls: 'ic-gold' }) : i === 1 ? icon('medal', { cls: 'ic-silver' }) : i === 2 ? icon('medal', { cls: 'ic-bronze' }) : '';
    const pct = Math.max(4, Math.round((p.rep / topRep) * 100));
    const isYou = p === s.players[0];
    html += `<div class="go-score-row${p === winner ? ' winner' : ''}${isYou ? ' is-you' : ''}">
      <span class="go-rank">${medal || (i + 1)}</span>
      <span class="go-main">
        <span class="go-name">${escHtml(p.name)}${isYou ? ' (you)' : ''}</span>
        <span class="go-bar"><span class="go-bar-fill" style="width:${pct}%"></span></span>
      </span>
      <span class="go-pts">${p.rep}<span class="go-pts-unit"> rep</span></span>
    </div>`;
  });
  html += '</div>';

  // Agenda reveal
  html += `<div class="go-agenda"><h3>${icon('search')} Secret Agendas Revealed</h3>`;
  for (const p of s.players) {
    const complete = p._agendaComplete;
    html += `<div class="go-agenda-row ${complete ? 'complete' : 'incomplete'}">
      <span class="go-agenda-name">${escHtml(p.name)}</span>
      <span class="go-agenda-detail">"${escHtml(p.agenda?.name || '?')}" &mdash; ${escHtml(p.agenda?.desc || '')}</span>
      <span class="go-agenda-status">${complete ? `${icon('check')} +10` : icon('x')}</span>
    </div>`;
  }
  html += '</div>';

  // Retro
  html += `<div class="go-retro">
    <strong>${icon('message-circle')} Retro Question:</strong> "What did you sacrifice to pursue your agenda?"
  </div>`;

  html += `<button class="btn btn-play go-play-again" onclick="window._newGame()">Play Again</button>`;

  $('game-over-content').innerHTML = html;
}

function renderLog(s) {
  const logEl = $('game-log');
  if (!logEl) return;
  logEl.innerHTML = s.log.map(l => `<div class="${l.cls}">${escHtml(l.msg)}</div>`).join('');
  requestAnimationFrame(() => { logEl.scrollTop = logEl.scrollHeight; });
}
