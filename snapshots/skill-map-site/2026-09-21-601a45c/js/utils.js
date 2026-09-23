// escHtml and debounce come from the DOM Kit (js/neorgon-dom.js). This
// site's showToast is left alone: it creates and removes its own element
// rather than toggling a class, which the kit's contract does not cover.
//
// Do not edit js/neorgon-dom.js. Edit packages/neorgon-ui/dom/ and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml, debounce } from './neorgon-dom.js';
export { escHtml, debounce };

// ===== UI Utilities =====

export function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const body = section.querySelector('.sidebar-section-body');
  const icon = section.querySelector('.sidebar-section-header svg');

  const isCollapsed = section.classList.contains('collapsed');

  if (isCollapsed) {
    section.classList.remove('collapsed');
    body.style.display = 'block';
    icon.style.transform = 'rotate(0deg)';
  } else {
    section.classList.add('collapsed');
    body.style.display = 'none';
    icon.style.transform = 'rotate(-90deg)';
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  // Announced by screen readers. Without these the toast is
  // invisible to anyone not looking at that corner of the screen.
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return toast;
}



// ===== Modal System =====

export function showModal(content, onClose = null) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');

  box.innerHTML = '';

  if (typeof content === 'string') {
    box.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    box.appendChild(content);
  } else {
    box.appendChild(content);
  }

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (onClose) {
    overlay.dataset.onClose = onClose;
  }

  return overlay;
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const onClose = overlay.dataset.onClose;

  overlay.style.display = 'none';
  document.body.style.overflow = '';
  delete overlay.dataset.onClose;

  if (onClose && typeof onClose === 'function') {
    onClose();
  }
}

export function showConfirmModal(title, message, onConfirm) {
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.innerHTML = `
    <div class="modal-header">
      <h2>${escHtml(title)}</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <p>${escHtml(message)}</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="confirm-btn">Confirm</button>
    </div>
  `;

  content.querySelector('#confirm-btn').addEventListener('click', () => {
    closeModal();
    onConfirm();
  });

  return showModal(content);
}

// ===== Color Utilities =====

// Convert hex to RGB
export function hexToRgb(hex) {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate luminance
export function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

// Get contrast color (black or white)
export function getContrastColor(hex) {
  return getLuminance(hex) > 0.5 ? '#000000' : '#ffffff';
}

// ===== Date Utilities =====

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

// ===== Array/Object Utilities =====

export function findLastIndex(array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  return -1;
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ===== Validation =====

export function isValidColor(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

export function isValidUsername(username) {
  return username && username.length >= 2 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
}

// ===== DOM Helpers =====

export function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function createElement(tag, className, parent = null) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}

export function setAttributes(el, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
}
