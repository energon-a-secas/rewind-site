// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Shared error handling utilities for Rush Q Cards

let errorModal = null;
let errorState = { shown: false, count: 0 };

function createErrorModal() {
  const modal = document.createElement('div');
  modal.id = 'error-modal';
  modal.className = 'error-modal hidden';
  modal.innerHTML = `
    <div class="error-modal-content">
      <div class="error-icon"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
      <h2>Something went wrong</h2>
      <p class="error-message">An unexpected error occurred. The game state has been preserved and you can continue playing.</p>
      <p class="error-details" style="display: none;"></p>
      <div class="error-actions">
        <button type="button" class="btn btn-primary" onclick="reloadGame()">Reload Game</button>
        <button type="button" class="btn btn-secondary" onclick="dismissError()">Dismiss</button>
        <button type="button" class="btn btn-outline" onclick="toggleErrorDetails()">Show Details</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function showErrorModal(error, context = '') {
  if (errorState.shown) return;

  if (!errorModal) {
    errorModal = createErrorModal();
  }

  const message = error?.message || 'Unknown error';
  const messageEl = errorModal.querySelector('.error-message');
  const detailsEl = errorModal.querySelector('.error-details');

  messageEl.textContent = `An error occurred${context ? ` while ${context}` : ''}. The game has attempted to recover automatically.`;

  if (error?.stack) {
    detailsEl.textContent = `Error: ${error.message}\nStack: ${error.stack}`;
  } else {
    detailsEl.textContent = `Error: ${JSON.stringify(error)}`;
  }

  errorModal.classList.remove('hidden');
  errorState.shown = true;
  errorState.count++;

  // Log to console for debugging
  console.error('Game error caught:', error);
  console.error('Error context:', context);
  console.error('Total errors this session:', errorState.count);
}

function dismissError() {
  if (!errorModal) return;
  errorModal.classList.add('hidden');
  errorState.shown = false;
}

function reloadGame() {
  window.location.reload();
}

function toggleErrorDetails() {
  if (!errorModal) return;
  const detailsEl = errorModal.querySelector('.error-details');
  const button = errorModal.querySelector('.btn-outline');

  if (detailsEl.style.display === 'none') {
    detailsEl.style.display = 'block';
    button.textContent = 'Hide Details';
  } else {
    detailsEl.style.display = 'none';
    button.textContent = 'Show Details';
  }
}

// Global error handlers
export function initGlobalErrorHandlers() {
  // Global JavaScript error handler
  window.addEventListener('error', (event) => {
    showErrorModal(event.error, 'running the game');
  });

  // Promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    showErrorModal(event.reason, 'processing an action');
  });

  // Expose utility functions globally
  window.reloadGame = reloadGame;
  window.dismissError = dismissError;
  window.toggleErrorDetails = toggleErrorDetails;
}

// Error boundary wrapper for async game functions
export function withErrorBoundary(fn, context) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      showErrorModal(error, context || 'processing a game action');
      throw error; // Re-throw to allow game-specific handling
    }
  };
}

// Safe wrapper for state mutations
export function safeStateUpdate(updateFn, context) {
  return function(...args) {
    try {
      return updateFn(...args);
    } catch (error) {
      showErrorModal(error, context || 'updating game state');
      // Return a safe default value if possible
      return null;
    }
  };
}

// Error recovery utilities
export const ErrorRecovery = {
  // Attempt to recover corrupted game state
  recoverState(corruptedState, defaultState = {}) {
    try {
      // Basic state validation and recovery
      const recovered = { ...defaultState, ...corruptedState };

      // Ensure essential arrays exist
      if (!Array.isArray(recovered.gameLog)) recovered.gameLog = [];
      if (!Array.isArray(recovered.players)) recovered.players = [];
      if (!recovered.turnPhase) recovered.turnPhase = 'setup';
      if (!recovered.currentQuarter) recovered.currentQuarter = 1;

      return recovered;
    } catch (error) {
      showErrorModal(error, 'recovering game state');
      return defaultState;
    }
  },

  // Clear corrupted data and start fresh
  resetCorruptedData(storageKey) {
    try {
      localStorage.removeItem(storageKey);
      showErrorModal(new Error('Corrupted game data has been cleared. Please start a new game.'), 'clearing corrupted data');
      setTimeout(() => window.location.href = '/', 2000);
    } catch (error) {
      showErrorModal(error, 'resetting corrupted data');
    }
  }
};

export { errorState };
