// ── Modal machinery ──────────────────────────────────────────
// Lifted from the fleet template so the burst overlay and the part picker
// share one focus trap. Any .modal with a .modal__dialog gets Escape,
// backdrop-close, and [data-modal-close] for free.

function getFocusable(root) {
  const sel = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(root.querySelectorAll(sel)).filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
    return el.getClientRects().length > 0;
  });
}

let lastFocus = null;
const closeHandlers = new Map();

/** @param {string} id @param {() => void} [onClose] */
export function openModal(id, onClose) {
  const modal = document.getElementById(id);
  if (!modal) return;
  lastFocus = document.activeElement;
  modal.removeAttribute('hidden');
  document.body.classList.add('modal-open');
  if (onClose) closeHandlers.set(id, onClose);
  const dialog = modal.querySelector('.modal__dialog');
  const list = dialog ? getFocusable(dialog) : [];
  (list[0] || dialog)?.focus();
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal || modal.hasAttribute('hidden')) return;
  modal.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');
  closeHandlers.get(id)?.();
  closeHandlers.delete(id);
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  lastFocus = null;
}

export function openModalId() {
  return document.querySelector('.modal:not([hidden])')?.id || null;
}

function onKeydown(e) {
  const id = openModalId();
  if (!id) return;
  const modal = document.getElementById(id);

  if (e.key === 'Escape') { e.preventDefault(); closeModal(id); return; }
  if (e.key !== 'Tab') return;

  const dialog = modal.querySelector('.modal__dialog');
  const list = dialog ? getFocusable(dialog) : [];
  if (!list.length) return;
  const first = list[0];
  const last = list[list.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function onClick(e) {
  const modal = e.target.closest?.('.modal');
  if (!modal || modal.hasAttribute('hidden')) return;
  if (e.target.closest('[data-modal-close]')) closeModal(modal.id);
}

export function initModal() {
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onClick);
}
