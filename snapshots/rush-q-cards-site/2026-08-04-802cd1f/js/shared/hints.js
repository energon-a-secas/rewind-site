// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Contextual hint / coach-mark engine ──────────────────────
// One coach-mark on screen at a time (rest are queued). Each hint fires once,
// is marked seen ON DISMISS, and degrades to a center toast if its anchor is
// missing. Reads the `hints` setting from settings.js (lazy import to avoid a
// circular dependency).

const SEEN_KEY = 'rush-q-hints-seen';
const AUTO_DISMISS_MS = 12000;

/** Hint registry. anchor is a CSS selector resolved at show-time. */
export const HINTS = [
  // ── Classic Mode ──
  {
    id: 'classic-first-turn', mode: 'classic', anchor: '#hand', position: 'above',
    title: 'Your hand', priority: 1, once: true,
    text: 'Play cards from your hand, assign people to projects, then end your turn.',
  },
  {
    id: 'classic-first-play', mode: 'classic', anchor: '.btn-play', position: 'above',
    title: 'Play a card', priority: 2, once: true,
    text: 'Select a card, then hit Play to put it into effect.',
  },
  {
    id: 'classic-first-assign', mode: 'classic', anchor: '.btn-assign', position: 'above',
    title: 'Staff your projects', priority: 2, once: true,
    text: 'Assign team members to projects so they complete before the deadline.',
  },
  {
    id: 'classic-first-market', mode: 'classic', anchor: '.market-strip', position: 'below',
    title: 'Markets', priority: 3, once: true,
    text: 'Click a market card to trade for it using value cards from your hand.',
  },
  {
    id: 'classic-first-budget', mode: 'classic', anchor: '.budget-bar', position: 'below',
    title: 'Budget', priority: 3, once: true,
    text: 'CapEx hires people; OpEx plays skill cards. Convert between them at 2:1.',
  },
  {
    id: 'classic-budget-expiring', mode: 'classic', anchor: null, position: 'above',
    title: 'Card expiring', priority: 1, once: true,
    text: 'This card expires soon — use it this turn or lose it.',
  },
  {
    id: 'classic-first-rushq', mode: 'classic', anchor: '#rush-q-overlay', position: 'center',
    title: 'Rush Quarter', priority: 1, once: true,
    text: 'Rush Q cards hit every player at quarter end and cannot be countered.',
  },
  {
    id: 'classic-first-layoff', mode: 'classic', anchor: '.human-panel', position: 'above',
    title: 'Layoffs', priority: 2, once: true,
    text: 'Layoffs begin now. Keep your reputation high to protect your team.',
  },
  // ── Quick Mode ──
  {
    id: 'quick-first-draft', mode: 'quick', anchor: '.draft-pool', position: 'below',
    title: 'Draft your team', priority: 1, once: true,
    text: 'Pick people in a snake draft. Premium people (gold) count as 2 on projects.',
  },
  {
    id: 'quick-first-turn', mode: 'quick', anchor: '#qg-actions', position: 'above',
    title: 'Your turn', priority: 1, once: true,
    text: 'Draw, Play, Push, Pay, Lend, or Pass. One action ends your turn.',
  },
  {
    id: 'quick-first-commit', mode: 'quick', anchor: '#qg-projects .qg-project-card', position: 'below',
    title: 'Commit people', priority: 2, once: true,
    text: 'Commit enough people before the quarter ends to score the reward.',
  },
  {
    id: 'quick-first-directive', mode: 'quick', anchor: '#qg-directive', position: 'left',
    title: 'Management directive', priority: 2, once: true,
    text: 'The first player to achieve a directive earns bonus reputation.',
  },
  {
    id: 'quick-first-crisis', mode: 'quick', anchor: '#game-log', position: 'above',
    title: 'Crisis', priority: 1, once: true,
    text: 'Crisis cards hit everyone. Free people or spare cards absorb the hit.',
  },
  // ── Shared ──
  {
    id: 'both-secret-agenda', mode: 'both', anchor: '.agenda-choices', position: 'below',
    title: 'Secret agenda', priority: 1, once: true,
    text: 'Your agenda grants +10 at game end if completed. No one else can see it.',
  },
];

const _hintMap = new Map(HINTS.map(h => [h.id, h]));

export function getHint(id) {
  return _hintMap.get(id) || null;
}

function currentMode() {
  return location.pathname.includes('/quick/') ? 'quick' : 'classic';
}

// ── Seen-set persistence ─────────────────────────────────────

function readSeen() {
  try {
    const arr = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeSeen(arr) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('Failed to persist seen hints:', e);
  }
}

export function hintSeen(id) {
  return readSeen().includes(id);
}

function markSeen(id) {
  const arr = readSeen();
  if (!arr.includes(id)) {
    arr.push(id);
    writeSeen(arr);
  }
}

export function resetHints() {
  writeSeen([]);
}

/** True unless the user disabled hints in settings. */
export function hintsEnabled() {
  try {
    // Lazy require to dodge the settings <-> hints circular import at load time.
    const raw = JSON.parse(localStorage.getItem('rush-q-settings') || '{}');
    return raw.hints !== false;
  } catch {
    return true;
  }
}

// ── Coach-mark engine ────────────────────────────────────────

let _current = null;          // { id, el, timer }
const _queue = [];            // pending { id, opts }

function dismissCurrent() {
  if (!_current) return;
  const { id, el, timer } = _current;
  if (timer) clearTimeout(timer);
  if (el && el.parentNode) el.remove();
  const spot = document.querySelector('.hint-spotlight');
  if (spot) spot.classList.remove('hint-spotlight');
  markSeen(id);
  _current = null;
  // Advance the queue.
  if (_queue.length) {
    const next = _queue.shift();
    // rAF so the DOM settles between marks.
    requestAnimationFrame(() => showCoachMark(next.id, next.opts));
  }
}

/** Public: dismiss the visible coach-mark (marks it seen). */
export function dismissHint(id) {
  if (_current && (!id || _current.id === id)) dismissCurrent();
}

/** Clear every pending and visible coach-mark without marking them seen.
 *  Used when a louder teacher (the tutorial) takes the screen — the hints
 *  should come back afterwards, not be silently consumed. */
export function suspendHints() {
  _queue.length = 0;
  if (_current) {
    const { el, timer } = _current;
    if (timer) clearTimeout(timer);
    el?.remove();
    document.querySelectorAll('.hint-spotlight').forEach((n) => n.classList.remove('hint-spotlight'));
    _current = null;
  }
}

function positionCoachMark(el, anchorEl, position) {
  const rect = anchorEl.getBoundingClientRect();
  const mw = el.offsetWidth;
  const mh = el.offsetHeight;
  const gap = 12;
  let top;
  let left;

  switch (position) {
    case 'below':
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - mw / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - mh / 2;
      left = rect.left - mw - gap;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - mh / 2;
      left = rect.right + gap;
      break;
    case 'above':
    default:
      top = rect.top - mh - gap;
      left = rect.left + rect.width / 2 - mw / 2;
      break;
  }

  // Clamp to the viewport.
  left = Math.max(8, Math.min(left, window.innerWidth - mw - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - mh - 8));
  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
}

function buildCoachMark(hint) {
  const el = document.createElement('div');
  el.className = `coach-mark pos-${hint.position || 'above'}`;
  el.id = 'coach-mark';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `
    <div class="coach-mark-title">${hint.title || ''}</div>
    <div class="coach-mark-text">${hint.text || ''}</div>
    <div class="coach-mark-actions">
      <button class="coach-mark-mute" data-hint-action="mute">Don't show tips</button>
      <button class="coach-mark-got" data-hint-action="dismiss">Got it</button>
    </div>
  `;
  return el;
}

function showCenterToast(hint) {
  const el = buildCoachMark(hint);
  el.classList.remove(`pos-${hint.position || 'above'}`);
  el.classList.add('pos-center');
  document.body.appendChild(el);
  el.style.top = '50%';
  el.style.left = '50%';
  el.style.transform = 'translate(-50%, -50%)';
  finishShow(hint, el, null);
}

function finishShow(hint, el, anchorEl) {
  const timer = setTimeout(() => dismissHint(hint.id), AUTO_DISMISS_MS);
  _current = { id: hint.id, el, timer };
  if (anchorEl) anchorEl.classList.add('hint-spotlight');
}

function showCoachMark(id, opts) {
  const hint = getHint(id);
  if (!hint) return;

  // Resolve the anchor: explicit live element, else selector.
  const resolve = () => opts.anchorEl || (hint.anchor ? document.querySelector(hint.anchor) : null);

  const place = (anchorEl) => {
    if (hint.position === 'center' || (!anchorEl && !hint.anchor)) {
      showCenterToast(hint);
      return;
    }
    if (!anchorEl) {
      // Retry once on the next frame before falling back to a center toast.
      requestAnimationFrame(() => {
        const retry = resolve();
        if (retry) {
          const el = buildCoachMark(hint);
          document.body.appendChild(el);
          positionCoachMark(el, retry, hint.position);
          finishShow(hint, el, retry);
        } else {
          showCenterToast(hint);
        }
      });
      return;
    }
    const el = buildCoachMark(hint);
    document.body.appendChild(el);
    positionCoachMark(el, anchorEl, hint.position);
    finishShow(hint, el, anchorEl);
  };

  place(resolve());
}

/**
 * Attempt to show a hint. Bails if hints are disabled or the hint was already
 * seen (unless opts.force). If a coach-mark is on screen, queues this one.
 * @param {string} id
 * @param {{force?:boolean, anchorEl?:Element}} [opts]
 */
export function maybeShowHint(id, opts = {}) {
  const hint = getHint(id);
  if (!hint) return;
  if (!hintsEnabled()) return;
  if (!opts.force && hintSeen(id)) return;

  // Mode filtering.
  if (hint.mode !== 'both' && hint.mode !== currentMode()) return;

  // Single-slot queue: only one coach-mark visible at a time.
  if (_current) {
    if (_current.id === id || _queue.some(q => q.id === id)) return;
    _queue.push({ id, opts });
    return;
  }

  // Never compete with an open dialog — retry after it closes so the
  // player faces one overlay at a time. The tutorial counts: it is the loudest
  // teacher on screen and a coach-mark on top of it reads as a bug.
  if (document.querySelector('.modal-overlay:not(.hidden), .settings-overlay, .tutorial-overlay')) {
    const tries = (opts._modalRetries || 0) + 1;
    if (tries <= 20) {
      setTimeout(() => maybeShowHint(id, { ...opts, _modalRetries: tries }), 900);
    }
    return;
  }

  showCoachMark(id, opts);
}

// Delegated handler for the coach-mark's own buttons.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-hint-action]');
  if (!btn) return;
  const action = btn.dataset.hintAction;
  if (action === 'mute') {
    import('./settings.js').then(m => m.setSetting('hints', false));
    // Drop the queue and dismiss the current mark.
    _queue.length = 0;
    dismissCurrent();
  } else if (action === 'dismiss') {
    dismissCurrent();
  }
});
