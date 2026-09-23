// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card browser filters ─────────────────────────────────────
import { state } from './state.js';
import { renderGrid } from './render.js';
import { TYPE_COLORS } from '../shared/cards-data.js';
import { normalizeEffectType, EFFECT_LABELS } from '../shared/card-component.js';

// Curated teaching subset — real management concepts, chosen editorially rather
// than by a data field (the cards span several decks).
const TEACHING_CARDS = [
  'Production Outage', '1:1 Meetings', 'Technical Debt', 'Promotion Cycle',
  'Executive Review', 'Board Review', 'Knowledge Silo', 'Skip-Level Surprise',
];

let searchTimer = null;

/** Attach event listeners to filter bar controls. */
export function bindFilters() {
  // Deck chips
  const chips = document.querySelectorAll('#deck-chips .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeDeck = chip.dataset.deck;
      applyFilters();
    });
  });

  // Search input (debounced)
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 200);
  });

  // Populate + wire the Type dropdown from the types present in the data.
  const typeSelect = document.getElementById('type-select');
  if (typeSelect) {
    const types = [...new Set(state.allCards.map(c => c.type))].sort();
    for (const t of types) {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      typeSelect.appendChild(opt);
    }
    typeSelect.addEventListener('change', () => {
      state.activeType = typeSelect.value;
      applyFilters();
    });
  }

  // Populate + wire the Effect dropdown from the normalized effect vocabulary.
  const effectSelect = document.getElementById('effect-select');
  if (effectSelect) {
    const effects = [...new Set(state.allCards.map(normalizeEffectType).filter(Boolean))].sort();
    for (const key of effects) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = EFFECT_LABELS[key] || key;
      effectSelect.appendChild(opt);
    }
    effectSelect.addEventListener('change', () => {
      state.activeEffect = effectSelect.value;
      applyFilters();
    });
  }

  // Cost range dropdown
  const costSelect = document.getElementById('cost-select');
  if (costSelect) {
    costSelect.addEventListener('change', () => {
      state.costRange = costSelect.value;
      applyFilters();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', () => {
    state.sortBy = sortSelect.value;
    applyFilters();
  });

  // Clear all filters
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.activeDeck = 'All';
      state.activeType = 'All';
      state.activeEffect = 'All';
      state.costRange = 'All';
      state.searchQuery = '';
      chips.forEach(c => c.classList.toggle('active', c.dataset.deck === 'All'));
      if (searchInput) searchInput.value = '';
      if (typeSelect) typeSelect.value = 'All';
      if (effectSelect) effectSelect.value = 'All';
      if (costSelect) costSelect.value = 'All';
      applyFilters();
    });
  }

  // Print view toggle — switches between md (browse) and xl (print-ready)
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      state.printView = !state.printView;
      printBtn.textContent = state.printView ? 'Browse' : 'Print';
      printBtn.title = state.printView ? 'Switch back to browse view' : 'Switch to print-ready card size';
      applyFilters();
    });
  }

  // Type legend toggle
  const legendBtn = document.getElementById('legend-toggle');
  const legendEl = document.getElementById('type-legend');
  if (legendBtn && legendEl) {
    legendEl.innerHTML = Object.entries(TYPE_COLORS).map(([type, color]) =>
      `<span class="legend-item" style="--lc:${color}"><span class="legend-dot" style="background:${color}"></span>${type}</span>`
    ).join('');

    legendBtn.addEventListener('click', () => {
      const open = legendEl.classList.toggle('hidden');
      legendBtn.setAttribute('aria-expanded', !open);
    });
  }
}

/** Does a card's cost fall in the selected range? */
function matchesCost(card, range) {
  const v = card.value || 0;
  switch (range) {
    case '0':    return v === 0;
    case '1-5':  return v >= 1 && v <= 5;
    case '6-10': return v >= 6 && v <= 10;
    case '11+':  return v >= 11;
    default:     return true;
  }
}

/** Filter allCards by all active filters, sort, update filtered, re-render. */
function applyFilters() {
  let cards = state.allCards;

  // Filter by deck
  if (state.activeDeck !== 'All') {
    if (state.activeDeck === 'Teaching') {
      cards = cards.filter(c => TEACHING_CARDS.includes(c.name));
    } else {
      cards = cards.filter(c => c.deck === state.activeDeck);
    }
  }

  // Filter by type
  if (state.activeType !== 'All') {
    cards = cards.filter(c => c.type === state.activeType);
  }

  // Filter by normalized effect
  if (state.activeEffect !== 'All') {
    cards = cards.filter(c => normalizeEffectType(c) === state.activeEffect);
  }

  // Filter by cost range
  if (state.costRange !== 'All') {
    cards = cards.filter(c => matchesCost(c, state.costRange));
  }

  // Filter by search query (name, type, effect text, timing, flavor)
  if (state.searchQuery) {
    cards = cards.filter(c => {
      const haystack = `${c.name} ${c.type} ${c.skill || ''} ${c.effectType || ''} ${c.triggerTiming || ''} ${c.flavorText || ''}`.toLowerCase();
      return haystack.includes(state.searchQuery);
    });
  }

  // Sort
  cards = [...cards];
  switch (state.sortBy) {
    case 'name':
      cards.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'type':
      cards.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
      break;
    case 'deck':
      cards.sort((a, b) => a.deck.localeCompare(b.deck) || a.name.localeCompare(b.name));
      break;
    case 'value':
      cards.sort((a, b) => (b.value || 0) - (a.value || 0));
      break;
  }

  state.filtered = cards;
  renderGrid();
}
