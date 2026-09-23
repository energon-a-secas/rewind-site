// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Social sharing features for Rush Q Cards

import { trackActionTaken } from './analytics.js';

export function shareGameResult(mode, finalReputation, win, achievements = []) {
  const text = win
    ? `I won in Rush Q Cards ${mode} mode with ${finalReputation} reputation! ${achievements.length ? 'Unlocked: ' + achievements.join(', ') : ''}`
    : `I scored ${finalReputation} reputation in Rush Q Cards ${mode} mode. Better luck next time!`;

  shareGeneric(text, undefined, 'rush-q-cards-result');
}

export function shareAchievement(achievementName) {
  const text = `Just unlocked "${achievementName}" in Rush Q Cards!`;
  shareGeneric(text, undefined, 'rush-q-cards-achievement');
}

export function shareGameState(mode, currentRound, reputation) {
  const url = generateShareableURL(mode, currentRound, reputation);
  const text = `Playing Rush Q Cards ${mode} mode - Round ${currentRound}, ${reputation} reputation`;

  shareGeneric(text, url, 'rush-q-cards-state');
}

export function generateShareableURL(mode, round, reputation) {
  const params = new URLSearchParams({
    mode,
    round: round.toString(),
    reputation: reputation.toString(),
    timestamp: Date.now().toString(),
  });

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function parseSharedURL() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const round = params.get('round');
  const reputation = params.get('reputation');

  if (mode && round && reputation) {
    return {
      mode,
      round: parseInt(round),
      reputation: parseInt(reputation),
    };
  }
  return null;
}

async function shareGeneric(text, url, eventType) {
  trackActionTaken(`share_${eventType}`);

  const shareData = {
    title: 'Rush Q Cards',
    text,
    url: url || window.location.href,
  };

  // Check for Web Share API support
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      console.log('Shared successfully via Web Share API');
      return true;
    } catch (err) {
      console.log('Web Share API failed:', err);
    }
  }

  // Fallback: copy to clipboard
  try {
    await copyToClipboard(text, url);
    console.log('Shared via clipboard');
    return true;
  } catch (err) {
    console.error('Failed to share:', err);
    return false;
  }
}

async function copyToClipboard(text, url) {
  const fullText = url ? `${text} ${url}` : text;

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(fullText);
  } else {
    // Fallback for insecure contexts (localhost)
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

export function renderShareButton(mode, options = {}) {
  const { achievements = [], finalReputation = 0, win = false } = options;

  const shareButtonHTML = `
    <button
      class="btn btn-secondary"
      onclick="import('../shared/share.js').then(module => module.shareGameResult('${mode}', ${finalReputation}, ${win}, ${JSON.stringify(achievements)}))"
      aria-label="Share game result"
      title="Share your result"
    >
      <img src="/assets/icons/ui/share.svg" alt="" aria-hidden="true" style="width: 16px; height: 16px; vertical-align: -2px;">
      Share
    </button>
  `;

  return shareButtonHTML;
}

// Initialize Open Graph meta tags if they don't exist
export function ensureOpenGraphMeta() {
  const requiredMeta = [
    { property: 'og:title', content: 'Rush Q Cards: Corporate Strategy Card Game' },
    { property: 'og:description', content: 'Manage projects, recruit talent, and outmaneuver AI opponents across strategic quarters' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Neorgon' },
    { property: 'og:image', content: 'og-preview.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];

  requiredMeta.forEach(meta => {
    const key = meta.property ? 'property' : 'name';
    const value = meta.property || meta.name;
    const existing = document.querySelector(`meta[${key}="${value}"]`);

    if (!existing) {
      const metaEl = document.createElement('meta');
      Object.entries(meta).forEach(([k, v]) => metaEl.setAttribute(k, v));
      document.head.appendChild(metaEl);
    }
  });
}

// Check for shared game state on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleSharedURL);
} else {
  handleSharedURL();
}

function handleSharedURL() {
  const sharedData = parseSharedURL();
  if (sharedData) {
    // Create a toast or notification
    setTimeout(() => {
      const toast = document.createElement('div');
      toast.className = 'toast visible';
      toast.textContent = `Shared game: ${sharedData.mode} mode, Round ${sharedData.round}, ${sharedData.reputation} reputation`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    }, 1000);
  }
}
