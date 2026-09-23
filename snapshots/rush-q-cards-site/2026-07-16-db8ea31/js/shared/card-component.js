// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Rendered HTML card component ─────────────────────────────
// Single-source card renderer. All card visuals flow from here.
// Usage: renderCardHTML(card, { size, variant, simplified })

import { typeColor } from './cards-data.js';

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A "View in Card Gallery" link for any card, so the game and exercises point back
 * to the canonical card in /cards/ (the real card of record). Root-absolute so it
 * resolves the same from every route. Deep-linked via ?card= (see js/cards/app.js).
 */
export function galleryLink(cardName, label = 'View in Card Gallery') {
  if (!cardName) return '';
  return `<a class="rc-gallery-link" href="/cards/?card=${encodeURIComponent(cardName)}">${escHtml(label)} &rarr;</a>`;
}

/** SVG icon file available per type (in /assets/icons/card-types/) */
const TYPE_ICON_FILE = {
  'Talent':         'talent.svg',
  'Project':        'project.svg',
  'Project Queue':  'project.svg',
  'Bonus Project':  'project.svg',
  'Soft':           'soft.svg',
  'Hard':           'hard.svg',
  'Power':          'power.svg',
  'Team':           'team.svg',
  'Favor':          'favor.svg',
};

/** Emoji fallback for types without SVG icons. */
export const TYPE_EMOJI = {
  'Talent':         '\u{1F464}',
  'Project':        '\u{1F4CB}',
  'Project Queue':  '\u{1F4C2}',
  'Bonus Project':  '\u{1F4A1}',
  'Soft':           '\u{1F9E0}',
  'Hard':           '\u{1F4BB}',
  'Power':          '\u26A1',
  'Team':           '\u{1F465}',
  'Quarter Event':  '\u{1F525}',
  'Layoff':         '\u{1F4C9}',
  'Favor':          '\u{1F91D}',
  'TL;DR':          '\u{1F4DD}',
  'budget':         '\u{1F4B0}',
  'Trait':          '\u{1F3AD}',
  'CapEx':          '\u{1F3E6}',
  'OpEx':           '⚙',
  'Individual':     '\u{1F3AF}',
};

// Collapse the many raw triggerTiming strings into a few labelled buckets.
const TIMING_LABELS = {
  'when played':        { label: 'On Play',    sym: '▸' },   // ▸
  'immediate':          { label: 'On Play',    sym: '▸' },
  'action':             { label: 'On Play',    sym: '▸' },
  'when completed':     { label: 'On Finish',  sym: '✓' },   // ✓
  'on completion':      { label: 'On Finish',  sym: '✓' },
  'passive effect':     { label: 'Passive',    sym: '∞' },   // ∞
  'continuous effect':  { label: 'Passive',    sym: '∞' },
  'quarter end':        { label: 'Quarter End',sym: '◷' },   // ◷
  'reactive':           { label: 'Reactive',   sym: '↺' },   // ↺
};

/** Map a raw triggerTiming string to a labelled timing bucket, or null. */
export function timingBadge(card) {
  const raw = (card.triggerTiming || '').toLowerCase().trim();
  if (!raw) return null;
  if (TIMING_LABELS[raw]) return TIMING_LABELS[raw];
  for (const key of Object.keys(TIMING_LABELS)) {
    if (raw.includes(key)) return TIMING_LABELS[key];
  }
  return null;
}

// Normalize the inconsistent effectType vocabulary (Title-Case phrases and
// lowercase tokens) into the canonical keys used by EFFECT_LABELS.
const EFFECT_TYPE_NORMALIZE = [
  { match: /draw/,                     key: 'draw' },
  { match: /progress|advance|deliver/, key: 'progress' },
  { match: /shield|protect|negat|block|immun|defen/, key: 'block' },
  { match: /freeze|delay|frozen/,      key: 'freeze' },
  { match: /steal|poach|take/,         key: 'steal' },
  { match: /trade|swap|exchange/,      key: 'trade' },
  { match: /hir|recruit/,              key: 'hiring' },
  { match: /boost|double|bonus/,       key: 'boost' },
  { match: /rep.?gain|reputation gain|\+.*rep/, key: 'rep-gain' },
  { match: /rep.?loss|reputation loss|penal/, key: 'rep-loss' },
  { match: /risk|gamble|chance/,       key: 'risk' },
  { match: /deadline/,                 key: 'deadline' },
  { match: /discard/,                  key: 'discard' },
];

/** Resolve a card's canonical effect key from effectType, else null. */
export function normalizeEffectType(card) {
  const et = (card.effectType || '').toLowerCase().trim();
  if (!et) return null;
  for (const { match, key } of EFFECT_TYPE_NORMALIZE) {
    if (match.test(et)) return key;
  }
  return null;
}

const TYPE_CATEGORY = {
  'Talent':         'Recruit',
  'Project':        'Deliver',
  'Project Queue':  'Deliver',
  'Bonus Project':  'Bonus',
  'Soft':           'Soft',
  'Hard':           'Hard',
  'Power':          'Power',
  'Team':           'Team',
  'Quarter Event':  'Event',
  'Layoff':         'Crisis',
  'Favor':          'Favor',
  'TL;DR':          'Info',
  'budget':         'Budget',
  'Trait':          'Trait',
};

export const EFFECT_LABELS = {
  'draw':      'Draw',
  'rep-gain':  'Rep+',
  'rep-loss':  'Rep-',
  'risk':      'Risk',
  'block':     'Block',
  'progress':  'Progress',
  'freeze':    'Freeze',
  'steal':     'Steal',
  'trade':     'Trade',
  'boost':     'Boost',
  'discard':   'Discard',
  'deadline':  'Deadline',
  'shield':    'Shield',
  'negate':    'Negate',
  'hiring':    'Hiring',
  'bonus':     'Bonus',
};

// ── Cost type helpers ────────────────────────────────────────
const OPEX_TYPES = new Set(['Soft', 'Hard', 'Power']);
const CAPEX_TYPES = new Set(['Talent', 'Project', 'Project Queue', 'Bonus Project']);

function isOpEx(type) { return OPEX_TYPES.has(type); }
function isCapEx(type) { return CAPEX_TYPES.has(type); }

/** Cost symbol: square for OpEx, triangle for CapEx. */
export function costSymbol(type) {
  if (isOpEx(type)) return '\u25A0';  // ■
  if (isCapEx(type)) return '\u25B2'; // ▲
  return '\u25C6'; // ◆ fallback
}

function costClass(type) {
  if (isOpEx(type)) return 'rc-stat--opex';
  if (isCapEx(type)) return 'rc-stat--capex';
  return 'rc-stat--value';
}

/**
 * Build the ordered "trigger" badges that make a card's mechanics legible at a
 * glance: cost, timing, and effect. Each badge is { kind, label, sym }.
 */
function buildTriggers(card) {
  const triggers = [];

  // Cost — square (OpEx) / triangle (CapEx) / diamond, with the value.
  if (card.value) {
    triggers.push({ kind: 'cost ' + costClass(card.type), label: String(card.value), sym: costSymbol(card.type) });
  }

  // Timing — when the card's effect fires.
  const timing = timingBadge(card);
  if (timing) {
    triggers.push({ kind: 'timing', label: timing.label, sym: timing.sym });
  }

  // Timing gate — earliest quarter the card may be played.
  if (card.minQuarter) {
    triggers.push({ kind: 'gate', label: `Q${card.minQuarter}+`, sym: '▸' });
  }

  // Effect — normalized from effectType, falling back to skill-text detection.
  const effectKey = normalizeEffectType(card);
  if (effectKey && EFFECT_LABELS[effectKey]) {
    triggers.push({ kind: 'effect fx-' + effectKey, label: EFFECT_LABELS[effectKey], sym: '' });
  } else {
    for (const label of detectEffectPattern(card).slice(0, 1)) {
      triggers.push({ kind: 'effect', label, sym: '' });
    }
  }

  return triggers;
}

/** Render trigger badges as an HTML row. */
function triggersHtml(card) {
  const triggers = buildTriggers(card);
  if (!triggers.length) return '';
  const chips = triggers.map(t =>
    `<span class="rc-trigger ${t.kind}">${t.sym ? `<span class="rc-trigger-sym">${t.sym}</span>` : ''}<span class="rc-trigger-label">${escHtml(t.label)}</span></span>`
  ).join('');
  return `<div class="rc-trigger-row">${chips}</div>`;
}

// ── Effect detection ─────────────────────────────────────────

function detectEffectPattern(card) {
  const s = (card.skill || '').toLowerCase();
  const patterns = [];

  const drawMatch = s.match(/draw\s+(\d+)/);
  if (drawMatch) patterns.push(`Draw +${drawMatch[1]}`);
  else if (s.includes('draw')) patterns.push('Draw');

  if (card.reward && card.type !== 'Project' && card.type !== 'Project Queue' && card.type !== 'Bonus Project') {
    patterns.push(`+${card.reward} Rep`);
  }
  if (card.penalty) patterns.push(`-${card.penalty} Rep`);

  if (s.includes('nullif') || s.includes('negate') || s.includes('cancel') || s.includes('block') || s.includes('immune')) {
    patterns.push('Block');
  }
  if (s.includes('freeze') || s.includes('frozen') || s.includes('delay') || s.includes('extend')) {
    patterns.push('Freeze');
  }
  if (s.includes('progress') || s.includes('advance') || s.includes('complete') || s.includes('accelerat')) {
    patterns.push('Progress');
  }
  if (s.includes('steal') || s.includes('take from') || s.includes('poach')) {
    patterns.push('Steal');
  }
  if (s.includes('trade') || s.includes('swap') || s.includes('exchange')) {
    patterns.push('Trade');
  }
  if (s.includes('bonus') || s.includes('boost') || s.includes('double')) {
    patterns.push('Boost');
  }
  if (s.includes('discard') || s.includes('remove') || s.includes('lose')) {
    patterns.push('Discard');
  }
  if (s.includes('deadline')) {
    patterns.push('Deadline');
  }

  return patterns.slice(0, 2);
}

// ── Icon rendering ───────────────────────────────────────────

function buildIconHtml(card) {
  const iconFile = TYPE_ICON_FILE[card.type];
  const emoji = card.emoji || TYPE_EMOJI[card.type] || '\u{1F0CF}';

  if (iconFile) {
    return `<img src="/assets/icons/card-types/${iconFile}"
                 alt="${escHtml(card.type)}"
                 class="rc-type-svg"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="rc-emoji" style="display:none">${emoji}</div>`;
  }
  return `<div class="rc-emoji">${emoji}</div>`;
}

// ── Main renderer ────────────────────────────────────────────

/**
 * Render a card as an HTML string.
 * @param {Object} card
 * @param {Object} [options]
 * @param {'sm'|'md'|'lg'|'xl'} [options.size='md']
 * @param {'full'|'mini'|'chip'} [options.variant='full']
 * @param {boolean} [options.simplified=false]
 * @returns {string} HTML string
 */
export function renderCardHTML(card, options = {}) {
  const variant = options.variant || 'full';
  const size = options.size || 'md';
  const simplified = options.simplified || false;
  const color = typeColor(card.type);
  const emoji = card.emoji || TYPE_EMOJI[card.type] || '\u{1F0CF}';
  const sizeClass = `rc-${size}`;

  // ── Chip variant: inline colored dot + name ──
  if (variant === 'chip') {
    return `<span class="rush-card-chip" style="--card-type-color:${color}" data-type="${escHtml(card.type)}">${escHtml(card.name)}</span>`;
  }

  // ── Mini variant: compact card for exercises/lists ──
  if (variant === 'mini') {
    const category = TYPE_CATEGORY[card.type] || card.type;
    const triggerRow = triggersHtml(card);
    const skillText = card.skill || card.effectType || '';

    const cardId = 'card-' + Math.random().toString(36).substr(2, 9);

    // Build rich tooltip content
    const tipParts = [];
    if (card.type) tipParts.push(`<div class="rc-tip-type" style="color:${color};font-weight:700;text-transform:uppercase;font-size:.6rem;letter-spacing:.4px;margin-bottom:4px">${escHtml(card.type)}${card.deck ? ' \u2022 ' + escHtml(card.deck) : ''}</div>`);
    if (skillText) tipParts.push(`<div class="rc-tip-skill">${escHtml(skillText)}</div>`);
    const statBits = [];
    if (card.value) statBits.push(`${costSymbol(card.type)} ${card.value}`);
    if (card.members) statBits.push(`\u263A ${card.members} members`);
    if (card.deadline) statBits.push(`Q${card.deadline} deadline`);
    if (card.reward) statBits.push(`+${card.reward} rep`);
    if (card.penalty) statBits.push(`-${card.penalty} penalty`);
    if (card.minQuarter) statBits.push(`Q${card.minQuarter}+ only`);
    if (card.negationCost) statBits.push(`Negate: ${card.negationCost}`);
    if (statBits.length) tipParts.push(`<div class="rc-tip-stats" style="margin-top:4px;font-size:.62rem;color:rgba(255,255,255,.55)">${statBits.join(' \u2022 ')}</div>`);
    // Optional link back to the canonical gallery card (used in exercises so the
    // learning ties to the real card of record).
    if (options.galleryLink) tipParts.push(`<div class="rc-tip-gallery">${galleryLink(card.name, 'Open in Card Gallery')}</div>`);
    const hasTooltip = tipParts.length > 0;

    return `<div class="rush-card rc-mini ${hasTooltip ? 'has-tooltip' : ''}" data-type="${escHtml(card.type)}" data-card-id="${cardId}" style="--card-type-color:${color}">
      <div class="rc-mini-icon">${buildIconHtml(card)}</div>
      <div class="rc-mini-name">${escHtml(card.name)}</div>
      <div class="rc-mini-type">${escHtml(category)}</div>
      ${triggerRow}
      ${hasTooltip ? `<button class="rc-mini-info" aria-label="Card details" onclick="event.stopPropagation(); event.preventDefault(); const card = this.closest('.rush-card'); const isOpen = card.classList.toggle('rc-mini--tip-open'); card.setAttribute('data-tip-open', isOpen); return false;" onmousedown="event.stopPropagation();">i</button>
      <div class="rc-mini-tooltip" role="tooltip">${tipParts.join('')}</div>` : ''}
    </div>`;
  }

  // ── Simplified variant ──
  if (simplified) {
    const category = TYPE_CATEGORY[card.type] || card.type;

    return `<div class="rush-card ${sizeClass} rc-simplified" data-type="${escHtml(card.type)}" style="--card-type-color:${color}">
      <div class="rc-header">
        <span class="rc-title">${escHtml(card.name)}</span>
        <span class="rc-type-badge">${escHtml(category)}</span>
      </div>
      <div class="rc-image-area rc-image-area--icon">
        <div class="rc-icon-fallback">${buildIconHtml(card)}</div>
      </div>
      ${triggersHtml(card)}
    </div>`;
  }

  // ── Full variant — clean, information-first typographic card ──

  // Header: name + a type-colored category badge (the primary "what is this").
  const category = TYPE_CATEGORY[card.type] || card.type;
  const headerHtml = `<div class="rc-header">
    <span class="rc-title">${escHtml(card.name)}</span>
    <span class="rc-type-badge">${escHtml(category)}</span>
  </div>`;

  // Trigger row: cost / timing / effect badges — the mechanics at a glance.
  const triggerRow = triggersHtml(card);

  // Type-tinted icon accent panel. The pre-rendered card art (cardImageUrl) is
  // a complete baked card, so it isn't overlaid here — the typographic card is
  // the single on-screen representation. Art stays available for print/export.
  const iconHtml = buildIconHtml(card);
  const imageHtml = `<div class="rc-image-area rc-image-area--icon"><div class="rc-icon-fallback">${iconHtml}</div></div>`;

  // Flavor text
  const flavorHtml = card.flavorText
    ? `<div class="rc-flavor">${escHtml(card.flavorText)}</div>`
    : '';

  // Description / skill — the substance of the card.
  let descHtml;
  if (card._isBudget && card.symbols) {
    const symbolsHtml = card.symbols.map(s =>
      s === 'tri'
        ? '<span class="rc-budget-sym rc-budget-tri">&#9650;</span>'
        : '<span class="rc-budget-sym rc-budget-sq">&#9724;</span>'
    ).join(' ');
    descHtml = `<div class="rc-desc rc-budget-desc">${symbolsHtml}</div>`;
  } else if (card.skill) {
    descHtml = `<div class="rc-desc">${escHtml(card.skill)}</div>`;
  } else {
    descHtml = '<div class="rc-desc rc-desc--empty"></div>';
  }

  // Numeric stat footer (members/deadline/reward/penalty/negation) — cost lives
  // in the trigger row now, so drop it here to avoid duplication.
  const statsHtml = buildStats(card, { skipCost: true });

  // Brand mark for lg/xl cards
  const brandHtml = (size === 'lg' || size === 'xl') ? '<span class="rc-brand">RQ</span>' : '';

  return `<div class="rush-card ${sizeClass}" data-type="${escHtml(card.type)}" style="--card-type-color:${color}">
    ${headerHtml}
    ${triggerRow}
    ${imageHtml}
    ${flavorHtml}
    ${descHtml}
    ${statsHtml}
    ${brandHtml}
  </div>`;
}

/** Build the stat footer row. Uses square for OpEx, triangle for CapEx. */
function buildStats(card, { skipCost = false } = {}) {
  const items = [];

  if (card.value && !skipCost) {
    const sym = costSymbol(card.type);
    const cls = costClass(card.type);
    items.push(`<span class="rc-stat ${cls}"><span class="rc-stat-icon">${sym}</span><span class="rc-stat-val">${card.value}</span></span>`);
  }
  if (card.members) {
    items.push(`<span class="rc-stat rc-stat--members"><span class="rc-stat-icon">&#9786;</span><span class="rc-stat-val">${card.members}</span></span>`);
  }
  if (card.deadline) {
    items.push(`<span class="rc-stat rc-stat--deadline"><span class="rc-stat-icon">Q</span><span class="rc-stat-val">${card.deadline}</span></span>`);
  }
  if (card.reward) {
    items.push(`<span class="rc-stat rc-stat--reward"><span class="rc-stat-icon">&#9733;</span><span class="rc-stat-val">+${card.reward}</span></span>`);
  }
  if (card.penalty) {
    items.push(`<span class="rc-stat rc-stat--penalty"><span class="rc-stat-icon">&#9888;</span><span class="rc-stat-val">-${card.penalty}</span></span>`);
  }
  if (card.negationCost) {
    items.push(`<span class="rc-stat rc-stat--negation"><span class="rc-stat-icon">&#10006;</span><span class="rc-stat-val">${card.negationCost}</span></span>`);
  }
  if (card.minQuarter) {
    items.push(`<span class="rc-stat rc-stat--min-quarter"><span class="rc-stat-icon">&#9654;</span><span class="rc-stat-val">Q${card.minQuarter}+</span></span>`);
  }

  if (!items.length) return '';
  return `<div class="rc-stats">${items.join('')}</div>`;
}
