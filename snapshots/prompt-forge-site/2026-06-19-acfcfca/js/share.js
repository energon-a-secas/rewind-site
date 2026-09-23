import { state } from './state.js';

const SHARE_KEY = 'c';

function encodeBase64Url(str) {
  try {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return '';
  }
}

function decodeBase64Url(str) {
  try {
    const padded = str
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
    return atob(padded);
  } catch (e) {
    return null;
  }
}

export function characterToHash(char) {
  const payload = JSON.stringify(char);
  return `#character?${SHARE_KEY}=${encodeBase64Url(payload)}`;
}

export function parseShareHash(hash) {
  try {
    const parts = hash.replace(/^#/, '').split('?');
    if (parts[0] !== 'character') return null;
    const params = new URLSearchParams(parts[1] || '');
    const encoded = params.get(SHARE_KEY);
    if (!encoded) return null;
    const decoded = decodeBase64Url(encoded);
    if (!decoded) return null;
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export function buildShareUrl() {
  try {
    const url = new URL(window.location.href);
    url.hash = characterToHash(state.character);
    return url.toString();
  } catch (e) {
    return '';
  }
}

export async function copyShareLink(button) {
  const url = buildShareUrl();
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    if (button) {
      const original = button.textContent;
      button.textContent = 'Link copied';
      setTimeout(() => (button.textContent = original), 1500);
    }
  } catch (e) {
    if (button) button.textContent = 'Copy failed';
  }
}
