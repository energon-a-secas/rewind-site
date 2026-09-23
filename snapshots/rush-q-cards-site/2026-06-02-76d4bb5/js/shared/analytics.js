// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Privacy-friendly analytics for Rush Q Cards
// No personal data or PII is collected

const ANALYTICS_VERSION = '1.0.0';
const STORAGE_KEY = 'rush-q-analytics-opt-out';

// Event types
const EVENTS = {
  PAGE_VIEW: 'page_view',
  GAME_START: 'game_start',
  GAME_MODE_SELECTION: 'game_mode_selection',
  GAME_END: 'game_end',
  CARD_PLAYED: 'card_played',
  ACTION_TAKEN: 'action_taken',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  ERROR: 'error',
};

// Track opt-out preference
function isOptedOut() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function setOptOut(isOptedOut) {
  try {
    if (isOptedOut) {
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to update analytics opt-out preference');
  }
}

// Generate a session ID (random, not tied to user identity)
function getSessionId() {
  try {
    let sessionId = sessionStorage.getItem('rush-q-session-id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('rush-q-session-id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return 'session_unknown';
  }
}

// Track an event
function trackEvent(eventName, eventData = {}) {
  if (isOptedOut()) {
    return;
  }

  const event = {
    event: eventName,
    version: ANALYTICS_VERSION,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    ...eventData,
  };

  // Filter out any potential PII from user agent (not perfect, but best effort)
  // In production, consider using a proper analytics service
  console.log('[Analytics]', eventName, eventData);

  // Could send to a server here, but keeping it privacy-first by logging only
  // Example: navigator.sendBeacon('/api/analytics', JSON.stringify(event));
}

// Track page view
trackEvent(EVENTS.PAGE_VIEW);

// Track game events
export function trackGameStart(mode, playerName, aiCount) {
  trackEvent(EVENTS.GAME_START, {
    mode,
    ai_count: aiCount,
    // Don't track player name to avoid PII
  });
}

export function trackGameEnd(mode, finalReputation, win) {
  trackEvent(EVENTS.GAME_END, {
    mode,
    final_reputation: finalReputation,
    win,
    game_duration_ms: Date.now() - (window._gameStartTime || Date.now()),
  });
}

export function trackCardPlayed(cardName, cardType) {
  trackEvent(EVENTS.CARD_PLAYED, {
    card_name: cardName,
    card_type: cardType,
  });
}

export function trackActionTaken(action) {
  trackEvent(EVENTS.ACTION_TAKEN, {
    action,
  });
}

export function trackAchievementUnlocked(achievementId) {
  trackEvent(EVENTS.ACHIEVEMENT_UNLOCKED, {
    achievement_id: achievementId,
  });
}

export function trackTutorialCompleted() {
  trackEvent(EVENTS.TUTORIAL_COMPLETED);
}

export function trackError(errorMessage, context) {
  trackEvent(EVENTS.ERROR, {
    error_message: errorMessage,
    context,
  });
}

// Tracking functions for UI events
export function trackModeSelection(mode) {
  trackEvent(EVENTS.GAME_MODE_SELECTION, {
    mode,
  });
}

// Opt-out UI function
export function toggleAnalyticsOptOut() {
  const currentlyOptedOut = isOptedOut();
  setOptOut(!currentlyOptedOut);
  return !currentlyOptedOut;
}

export function isAnalyticsEnabled() {
  return !isOptedOut();
}

// Mark game start time
window._gameStartTime = Date.now();

export { EVENTS };
