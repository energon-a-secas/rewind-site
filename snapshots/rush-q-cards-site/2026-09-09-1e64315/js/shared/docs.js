// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Long-document affordances ────────────────────────────────
// A rulebook is several screens tall. Two things make that bearable: knowing
// how much is left, and being able to get back out. Both are opt-in via
// [data-docs] so short pages don't pay for furniture they don't need.

function mountProgress() {
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  return bar;
}

function mountToTop() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  document.body.appendChild(btn);
  return btn;
}

export function initDocs() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  // Nothing to track on a page that barely scrolls.
  if (scrollable < 600) return;

  const bar = mountProgress();
  const btn = mountToTop();
  let ticking = false;

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = `${pct}%`;
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9);
  }

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

if (document.querySelector('[data-docs]')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocs, { once: true });
  } else {
    initDocs();
  }
}
