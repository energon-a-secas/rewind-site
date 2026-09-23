// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Rendered HTML card component ─────────────────────────────
// Single-source card renderer. All card visuals flow from here.
// Usage: renderCardHTML(card, { size, variant })

import { typeColor } from './cards-data.js';
import { icon, iconForEmoji } from './icons.js';

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

/** Registry icon per card type — fallback when there is no per-card emoji mapping. */
export const TYPE_ICON = {
  'Talent':         'user',
  'Project':        'clipboard-list',
  'Project Queue':  'folder-open',
  'Bonus Project':  'lightbulb',
  'Soft':           'brain',
  'Hard':           'laptop',
  'Power':          'zap',
  'Team':           'users',
  'Quarter Event':  'flame',
  'Layoff':         'trending-down',
  'Favor':          'handshake',
  'TL;DR':          'notebook-pen',
  'budget':         'coins',
  'Trait':          'drama',
  'CapEx':          'landmark',
  'OpEx':           'settings',
  'Individual':     'target',
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
  // Order matters: the two rules below are more specific than the `block`
  // rule, which would otherwise swallow "Reaction Negation" via /negat/.
  { match: /reaction/,                 key: 'reaction' },
  { match: /attack/,                   key: 'attack' },
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
  // `shield` and `negate` used to live here but normalizeEffectType folds
  // every shield/negate/block token into `block`, so they could never be
  // produced. `reaction` and `attack` are reachable — see the rules above.
  'reaction':  'Reaction',
  'attack':    'Attack',
  'hiring':    'Hiring',
  'bonus':     'Bonus',
};

// ── Cost type helpers ────────────────────────────────────────
const OPEX_TYPES = new Set(['Soft', 'Hard', 'Power', 'OpEx']);
const CAPEX_TYPES = new Set(['Talent', 'Project', 'Project Queue', 'Bonus Project', 'CapEx']);

function isOpEx(type) { return OPEX_TYPES.has(type); }
function isCapEx(type) { return CAPEX_TYPES.has(type); }

// ── Cost tokens ──────────────────────────────────────────────
// Two resources, two silhouettes. OpEx is a coin: money that leaves every
// quarter. CapEx is a block: something you buy once and keep. Circle vs square
// is the most distinguishable pair at the ~8px these render at in a hand card,
// and the shapes tile cleanly into runs ("◉◉◉ to hire").
//
// Filled, not stroked — the stroke-based icon set mushes at this size. Each
// carries one lit detail that only resolves on a large card, so the mark stays
// honest at both ends of the scale. currentColor throughout, so the OpEx/CapEx
// type colours drive them and both themes come free.
const COST_GLYPHS = {
  // Coin: disc with a punched centre.
  opex: '<path fill="currentColor" fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Zm0 6.2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Z"/>',
  // Cube: three faces at three weights. The resource-cube silhouette every
  // euro-game uses, and unmistakably an object you own rather than a payment.
  capex: '<path fill="currentColor" opacity=".95" d="M12 2.4 21.2 7.7 12 13 2.8 7.7z"/>'
       + '<path fill="currentColor" opacity=".62" d="M2.8 9.2 11.2 14v7.7L2.8 16.9z"/>'
       + '<path fill="currentColor" opacity=".78" d="M21.2 9.2 12.8 14v7.7l8.4-4.8z"/>',
  // Gem: table, crown facets, pavilion — the generic-value fallback.
  value: '<path fill="currentColor" opacity=".55" d="M7.8 4.2h8.4l5 7.1H2.8z"/>'
       + '<path fill="currentColor" d="M2.8 12.6h18.4L12 20.8z"/>',
};


/** An inline cost token. `kind` is 'opex' | 'capex' | 'value'. */
export function costGlyph(kind) {
  return `<svg class="rc-cost" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${COST_GLYPHS[kind] || COST_GLYPHS.value}</svg>`;
}

/** Cost token for a card type: coin for OpEx, block for CapEx, gem otherwise. */
export function costSymbol(type) {
  if (isOpEx(type)) return costGlyph('opex');
  if (isCapEx(type)) return costGlyph('capex');
  return costGlyph('value');
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

/** Registry-based glyph for a card: per-card emoji mapping first, then type icon. */
function cardGlyph(card) {
  if (card.emoji) return iconForEmoji(card.emoji);
  return icon(TYPE_ICON[card.type] || 'square-asterisk');
}

function buildIconHtml(card) {
  const iconFile = TYPE_ICON_FILE[card.type];

  if (iconFile) {
    // Masked, not an <img>: the glyph has to take --card-type-color, and an
    // <img> cannot inherit currentColor. It also keeps the dark-theme icon
    // invert filter off the card face, which used to flip the type-coloured
    // ring to its complement.
    return `<span class="rc-type-svg"
                  role="img"
                  aria-label="${escHtml(card.type)}"
                  style="--icon: url('/assets/icons/card-types/${iconFile}')"></span>`;
  }
  return `<div class="rc-emoji">${cardGlyph(card)}</div>`;
}

// ── Main renderer ────────────────────────────────────────────

/**
 * Render a card as an HTML string.
 * @param {Object} card
 * @param {Object} [options]
 * @param {'sm'|'md'|'lg'|'xl'} [options.size='md']
 * @param {'full'|'mini'|'chip'} [options.variant='full']
 * @returns {string} HTML string
 */
export function renderCardHTML(card, options = {}) {
  const variant = options.variant || 'full';
  const size = options.size || 'md';
  const color = typeColor(card.type);
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
    if (card.members) statBits.push(`${icon('users')} ${card.members} members`);
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
        ? `<span class="rc-budget-sym rc-budget-tri">${costGlyph('capex')}</span>`
        : `<span class="rc-budget-sym rc-budget-sq">${costGlyph('opex')}</span>`
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

  // Always emitted; the container query hides it when the card is too small.
  const brandHtml = '<span class="rc-brand">RQ</span>';

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
    items.push(`<span class="rc-stat rc-stat--members"><span class="rc-stat-icon">${icon('users')}</span><span class="rc-stat-val">${card.members}</span></span>`);
  }
  if (card.deadline) {
    items.push(`<span class="rc-stat rc-stat--deadline"><span class="rc-stat-icon">Q</span><span class="rc-stat-val">${card.deadline}</span></span>`);
  }
  if (card.reward) {
    items.push(`<span class="rc-stat rc-stat--reward"><span class="rc-stat-icon">${icon('star')}</span><span class="rc-stat-val">+${card.reward}</span></span>`);
  }
  if (card.penalty) {
    items.push(`<span class="rc-stat rc-stat--penalty"><span class="rc-stat-icon">${icon('triangle-alert')}</span><span class="rc-stat-val">-${card.penalty}</span></span>`);
  }
  if (card.negationCost) {
    items.push(`<span class="rc-stat rc-stat--negation"><span class="rc-stat-icon">${icon('x')}</span><span class="rc-stat-val">${card.negationCost}</span></span>`);
  }
  if (card.minQuarter) {
    items.push(`<span class="rc-stat rc-stat--min-quarter"><span class="rc-stat-icon">&#9654;</span><span class="rc-stat-val">Q${card.minQuarter}+</span></span>`);
  }

  if (!items.length) return '';
  return `<div class="rc-stats">${items.join('')}</div>`;
}
