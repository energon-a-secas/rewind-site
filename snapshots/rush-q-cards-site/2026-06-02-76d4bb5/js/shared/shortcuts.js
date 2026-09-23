// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Keyboard shortcuts reference and help modal

export const CLASSIC_SHORTCUTS = [
  { key: 'A', action: 'Assign People', description: 'Open team assignment modal' },
  { key: 'T', action: 'Trade', description: 'Open trade/marketplace' },
  { key: 'E', action: 'End Turn', description: 'End your current turn' },
  { key: 'P / Enter', action: 'Play Card', description: 'Play the selected card' },
  { key: 'V', action: 'View Card', description: 'Show detail for selected card' },
  { key: 'Escape', action: 'Cancel', description: 'Close modal and clear selection' },
];

export const QUICK_SHORTCUTS = [
  { key: 'P', action: 'Pass Turn', description: 'Pass your action this turn' },
  { key: 'D', action: 'Draw Cards', description: 'Draw 2 cards from the deck' },
  { key: 'Space', action: 'Play Selected', description: 'Play the selected card' },
  { key: 'C', action: 'Commit', description: 'Commit people to projects' },
  { key: 'H', action: 'Hire', description: 'Hire people from the pool' },
  { key: 'Escape', action: 'Cancel', description: 'Close modal and clear selection' },
];

export const GLOBAL_SHORTCUTS = [
  { key: '?', action: 'Help', description: 'Toggle this help modal' },
  { key: 'R', action: 'Reset Game', description: 'Start a new game (when inactive)' },
  { key: 'Tab', action: 'Navigate', description: 'Cycle through interactive elements' },
];

export function showShortcutsModal(mode = 'classic') {
  const shortcuts = mode === 'quick' ? QUICK_SHORTCUTS : CLASSIC_SHORTCUTS;
  const overlay = document.createElement('div');
  overlay.className = 'keyboard-shortcuts-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'shortcuts-title');

  overlay.innerHTML = `
    <div class="shortcuts-modal">
      <div class="shortcuts-header">
        <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
        <button class="shortcuts-close" aria-label="Close help" onclick="window._closeShortcuts()">&times;</button>
      </div>
      <div class="shortcuts-content">
        <section class="shortcuts-section">
          <h3>Game Controls</h3>
          <div class="shortcuts-grid">
            ${shortcuts.map(s => `
              <div class="shortcut-row">
                <kbd class="shortcut-key">${s.key}</kbd>
                <div class="shortcut-info">
                  <span class="shortcut-action">${s.action}</span>
                  <span class="shortcut-desc">${s.description}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="shortcuts-section">
          <h3>Global Shortcuts</h3>
          <div class="shortcuts-grid">
            ${GLOBAL_SHORTCUTS.map(s => `
              <div class="shortcut-row">
                <kbd class="shortcut-key">${s.key}</kbd>
                <div class="shortcut-info">
                  <span class="shortcut-action">${s.action}</span>
                  <span class="shortcut-desc">${s.description}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Focus the close button
  const closeBtn = overlay.querySelector('.shortcuts-close');
  if (closeBtn) closeBtn.focus();

  // Close on escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      window._closeShortcuts();
    }
  };
  document.addEventListener('keydown', handleEscape);
  overlay._escapeHandler = handleEscape;
}

window._closeShortcuts = function() {
  const overlay = document.querySelector('.keyboard-shortcuts-overlay');
  if (overlay) {
    document.removeEventListener('keydown', overlay._escapeHandler);
    overlay.remove();
  }
};