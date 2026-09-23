// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Rendered HTML card component ─────────────────────────────
// Single-source card renderer. All card visuals flow from here.
// Usage: renderCardHTML(card, { size, variant, showImage })

import { typeColor } from './cards-data.js';

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
const TYPE_EMOJI = {
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
};

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

const EFFECT_LABELS = {
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
function costSymbol(type) {
  if (isOpEx(type)) return '\u25A0';  // ■
  if (isCapEx(type)) return '\u25B2'; // ▲
  return '\u25C6'; // ◆ fallback
}

function costClass(type) {
  if (isOpEx(type)) return 'rc-stat--opex';
  if (isCapEx(type)) return 'rc-stat--capex';
  return 'rc-stat--value';
}

// ── Effect detection ─────────────────────────────────────────

function generateEffectSummary(card) {
  const skill = (card.skill || '').toLowerCase();
  const effectType = (card.effectType || '').toLowerCase();

  if (card.type === 'Project' || card.type === 'Project Queue' || card.type === 'Bonus Project') {
    const reward = card.reward || 0;
    const penalty = card.penalty || 0;
    if (reward && penalty) return `Project \u2022 Q${card.deadline} deadline \u2022 Reward: ${reward} Rep, Penalty: ${penalty}`;
    if (reward) return `Project \u2022 Q${card.deadline} deadline \u2022 ${reward} Rep reward`;
    return `Project \u2022 Q${card.deadline} deadline`;
  }

  // Draw cards
  const drawMatch = skill.match(/draw\s+(\d+)/) || effectType.match(/draw\s+(\d+)/);
  if (drawMatch) return `Draw ${drawMatch[1]} cards \u2022 Increase options`;
  if (skill.includes('draw') || effectType.includes('draw')) return 'Draw cards \u2022 Gain more options';

  // Reputation changes
  if (card.reward && card.type !== 'Project') return `+${card.reward} Reputation \u2022 Builds credibility`;
  if (card.penalty) {
    if (effectType.includes('risk')) return `Risk: -${card.penalty} Rep \u2022 Potential loss`;
    return `-${card.penalty} Reputation \u2022 Damages standing`;
  }

  // Defensive/blocking
  if (effectType.includes('negate') || effectType.includes('block') ||
      effectType.includes('shield') || effectType.includes('immune')) {
    return 'Negates events \u2022 Protective measure';
  }

  // Control/delay
  if (effectType.includes('freeze') || effectType.includes('delay') ||
      skill.includes('freeze') || skill.includes('delay')) {
    return 'Freeze/delay \u2022 Buys time';
  }

  // Progress/acceleration
  if (effectType.includes('progress') || effectType.includes('advance') ||
      skill.includes('progress') || skill.includes('complete')) {
    return 'Progress boost \u2022 Accelerates delivery';
  }

  // Resource movement
  if (effectType.includes('steal') || effectType.includes('take from') || effectType.includes('poach')) {
    return 'Take from opponent \u2022 Aggressive move';
  }
  if (effectType.includes('trade') || effectType.includes('swap') ||
      skill.includes('trade') || skill.includes('swap')) {
    return 'Trade cards \u2022 Exchange resources';
  }

  // Team/hiring
  if (effectType.includes('hiring') || effectType.includes('hire') ||
      skill.includes('hiring') || skill.includes('hire')) {
    return 'Recruit talent \u2022 Add capacity';
  }

  // Boosts/enhancements
  if (effectType.includes('boost') || effectType.includes('bonus') ||
      effectType.includes('double') || skill.includes('boost')) {
    return 'Boost output \u2022 Multiply effectiveness';
  }

  // Discarding
  if (skill.includes('discard') || effectType.includes('discard')) {
    return 'Discard cards \u2022 Remove from hand';
  }

  // Special cases based on card name patterns
  if (card.name.includes('Testing')) return 'Testing \u2022 Quality assurance';
  if (card.name.includes('Documentation')) return 'Documentation \u2022 Capture knowledge';
  if (card.name.includes('Review')) return 'Review \u2022 Improve quality';
  if (card.name.includes('Pair')) return 'Pair Programming \u2022 Collaborate & learn';
  if (card.name.includes('Risk')) return 'Risk Assessment \u2022 Evaluate dangers';
  if (card.name.includes('Security')) return 'Security \u2022 Protect systems';
  if (card.name.includes('Performance')) return 'Performance \u2022 Optimize speed';

  // Default to effect type or skill
  const defaultText = EFFECT_LABELS[effectType] || card.type || 'Skill effect';
  return `${defaultText} \u2022 ${skill.substring(0, 60)}${skill.length > 60 ? '...' : ''}`;
}

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
 * @param {boolean} [options.showImage=true]
 * @param {boolean} [options.simplified=false]
 * @returns {string} HTML string
 */
export function renderCardHTML(card, options = {}) {
  const variant = options.variant || 'full';
  const size = options.size || 'md';
  const simplified = options.simplified || false;
  const showImage = options.showImage !== false;
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
    const effectSummary = generateEffectSummary(card);
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
    const hasTooltip = tipParts.length > 0;

    return `<div class="rush-card rc-mini ${hasTooltip ? 'has-tooltip' : ''}" data-type="${escHtml(card.type)}" data-card-id="${cardId}" style="--card-type-color:${color}">
      <div class="rc-mini-icon">${buildIconHtml(card)}</div>
      <div class="rc-mini-name">${escHtml(card.name)}</div>
      <div class="rc-mini-type">${escHtml(category)}</div>
      ${effectSummary ? `<div class="rc-mini-effect">${escHtml(effectSummary)}</div>` : ''}
      ${hasTooltip ? `<button class="rc-mini-info" aria-label="Card details" onclick="event.stopPropagation(); event.preventDefault(); const card = this.closest('.rush-card'); const isOpen = card.classList.toggle('rc-mini--tip-open'); card.setAttribute('data-tip-open', isOpen); return false;" onmousedown="event.stopPropagation();">i</button>
      <div class="rc-mini-tooltip" role="tooltip">${tipParts.join('')}</div>` : ''}
    </div>`;
  }

  // Generate card image URL from name
  const cardSlug = card.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const cardImageUrl = `assets/cards/${cardSlug}.png`;

  // ── Simplified variant ──
  if (simplified) {
    const category = TYPE_CATEGORY[card.type] || card.type;
    const effectSummary = generateEffectSummary(card);

    return `<div class="rush-card ${sizeClass} rc-simplified" data-type="${escHtml(card.type)}" style="--card-type-color:${color}">
      <div class="rc-header">
        <span class="rc-title">${escHtml(card.name)}</span>
        <span class="rc-pill">${escHtml(category)}</span>
      </div>
      <div class="rc-image-area">
        <div class="rc-emoji">${emoji}</div>
      </div>
      ${effectSummary ? `<div class="rc-effect-row">${escHtml(effectSummary)}</div>` : ''}
    </div>`;
  }

  // ── Full variant ──

  // Header: name + "{type} {deck}" as plain text
  const deckLabel = card.deck ? `${card.type} ${card.deck}` : card.type;
  const headerHtml = `<div class="rc-header">
    <span class="rc-title">${escHtml(card.name)}</span>
    <span class="rc-deck">${escHtml(deckLabel)}</span>
  </div>`;

  // Effect pills only (no category pill, no cost pills)
  const effects = detectEffectPattern(card);
  const effectPillsHtml = effects.map(e =>
    `<span class="rc-effect-pill">${escHtml(e)}</span>`
  ).join('');
  const pillHtml = effects.length
    ? `<div class="rc-pill-row">${effectPillsHtml}</div>`
    : '';

  // Card icon: SVG from card-types, fallback to card art, fallback to emoji
  const iconHtml = buildIconHtml(card);
  const imageHtml = `<div class="rc-image-area">
    ${showImage ? `
      <img src="${cardImageUrl}"
           alt="${escHtml(card.name)}"
           class="rc-card-art"
           loading="lazy"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="rc-icon-fallback" style="display:none">${iconHtml}</div>
    ` : `<div class="rc-icon-fallback">${iconHtml}</div>`}
  </div>`;

  // Flavor text
  const flavorHtml = card.flavorText
    ? `<div class="rc-flavor">${escHtml(card.flavorText)}</div>`
    : '';

  // Description / skill
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
    descHtml = '<div class="rc-desc" style="border-color:transparent;background:transparent"></div>';
  }

  // Stats footer
  const statsHtml = buildStats(card);

  // Brand mark for lg/xl cards
  const brandHtml = (size === 'lg' || size === 'xl') ? '<span class="rc-brand">RQ</span>' : '';

  return `<div class="rush-card ${sizeClass}" data-type="${escHtml(card.type)}" style="--card-type-color:${color}">
    ${headerHtml}
    ${pillHtml}
    ${imageHtml}
    ${flavorHtml}
    ${descHtml}
    ${statsHtml}
    ${brandHtml}
  </div>`;
}

/** Build the stat footer row. Uses square for OpEx, triangle for CapEx. */
function buildStats(card) {
  const items = [];

  if (card.value) {
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
