// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card browser filters ─────────────────────────────────────
import { state } from './state.js';
import { renderGrid } from './render.js';
import { TYPE_COLORS } from '../shared/cards-data.js';

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

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', () => {
    state.sortBy = sortSelect.value;
    applyFilters();
  });

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
    // Build legend content once
    legendEl.innerHTML = Object.entries(TYPE_COLORS).map(([type, color]) =>
      `<span class="legend-item" style="--lc:${color}"><span class="legend-dot" style="background:${color}"></span>${type}</span>`
    ).join('');

    legendBtn.addEventListener('click', () => {
      const open = legendEl.classList.toggle('hidden');
      legendBtn.setAttribute('aria-expanded', !open);
    });
  }
}

/** Filter allCards by deck + search, sort, update filtered, re-render. */
function applyFilters() {
  let cards = state.allCards;

  // Filter by deck
  if (state.activeDeck !== 'All') {
    if (state.activeDeck === 'Teaching') {
      // Show only the 8 teaching cards
      const teachingCards = [
        'Production Outage',
        '1:1 Meetings',
        'Technical Debt',
        'Promotion Cycle',
        'Executive Review',
        'Board Review',
        'Knowledge Silo',
        'Skip-Level Surprise'
      ];
      cards = cards.filter(c => teachingCards.includes(c.name));
    } else {
      cards = cards.filter(c => c.deck === state.activeDeck);
    }
  }

  // Filter by search query
  if (state.searchQuery) {
    cards = cards.filter(c => {
      const haystack = `${c.name} ${c.type} ${c.skill || ''} ${c.flavorText || ''}`.toLowerCase();
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
