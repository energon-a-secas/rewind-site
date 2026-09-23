// ── Shared UI: inspector drawer + glossary tooltips ──────────
import { $, el } from './utils.js';
import { TIPS } from './tips.js';

// ── Inspector drawer ─────────────────────────────────────────
let _lastFocus = null;

export function openInspector(title, html) {
  const wrap = $('inspector');
  if (!wrap) return;
  _lastFocus = document.activeElement;
  $('inspectorTitle').textContent = title;
  $('inspectorBody').innerHTML = html;
  wrap.hidden = false;
  wrap.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    wrap.classList.add('open');
    wrap.querySelector('.inspector__panel')?.focus();
  });
}

export function closeInspector() {
  const wrap = $('inspector');
  if (!wrap || wrap.hidden) return;
  wrap.classList.remove('open');
  wrap.setAttribute('aria-hidden', 'true');
  setTimeout(() => { wrap.hidden = true; }, 220);
  if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
}

// ── Tooltips (delegated on [data-tip]) ───────────────────────
let _tipEl = null;
let _tipTarget = null;

function positionTip(target) {
  const tip = _tipEl;
  const r = target.getBoundingClientRect();
  tip.hidden = false;
  const tr = tip.getBoundingClientRect();
  let left = r.left + r.width / 2 - tr.width / 2;
  left = Math.max(10, Math.min(left, window.innerWidth - tr.width - 10));
  let top = r.top - tr.height - 10;
  let place = 'top';
  if (top < 70) { top = r.bottom + 10; place = 'bottom'; }
  tip.style.left = `${left + window.scrollX}px`;
  tip.style.top = `${top + window.scrollY}px`;
  tip.dataset.place = place;
  // arrow x relative to tip
  const arrowX = r.left + r.width / 2 - left;
  tip.style.setProperty('--arrow-x', `${Math.max(12, Math.min(arrowX, tr.width - 12))}px`);
}

function showTip(target) {
  const key = target.dataset.tip;
  const def = TIPS[key];
  if (!def) return;
  _tipEl = $('tip');
  _tipEl.innerHTML = `<span class="tip__term">${def.term}</span><span class="tip__body">${def.body}</span>`;
  _tipEl.hidden = false;
  _tipTarget = target;
  positionTip(target);
  _tipEl.classList.add('visible');
  target.classList.add('tip-active');
}

function hideTip() {
  if (!_tipEl) return;
  _tipEl.classList.remove('visible');
  _tipEl.hidden = true;
  if (_tipTarget) _tipTarget.classList.remove('tip-active');
  _tipTarget = null;
}

export function initTooltips() {
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('[data-tip]');
    if (t && t !== _tipTarget) showTip(t);
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target.closest('[data-tip]');
    if (t && !e.relatedTarget?.closest?.('[data-tip]')) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const t = e.target.closest?.('[data-tip]');
    if (t) showTip(t);
  });
  document.addEventListener('focusout', hideTip);
  // Tap toggles on touch devices
  if (!supportsHover) {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tip]');
      if (t) { t === _tipTarget ? hideTip() : showTip(t); }
      else hideTip();
    });
  }
  window.addEventListener('scroll', hideTip, { passive: true });
  window.addEventListener('resize', hideTip);
}
