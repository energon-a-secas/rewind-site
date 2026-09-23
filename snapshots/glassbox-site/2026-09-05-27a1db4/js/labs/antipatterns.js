// ── Lab 5: Anti-patterns gallery ─────────────────────────────
// Grouped cards. Each flips to show why it's wrong and the fix.

import { ANTIPATTERNS, ANTIPATTERN_GROUPS } from '../data/antipatterns.js';
import { escHtml } from '../utils.js';

function card(id) {
  const ap = ANTIPATTERNS[id];
  return `
    <button class="ap-card" data-ap="${id}" aria-expanded="false">
      <div class="ap-card__face ap-card__front">
        <span class="ap-card__domain">${escHtml(ap.domain)}</span>
        <h3 class="ap-card__title">${escHtml(ap.title)}</h3>
        <div class="ap-card__bad"><span>Don\u2019t</span>${escHtml(ap.bad)}</div>
        <span class="ap-card__more">Why + the fix \u2192</span>
      </div>
      <div class="ap-card__face ap-card__back">
        <div class="ap-card__why"><span>Why it fails</span>${escHtml(ap.why)}</div>
        <div class="ap-card__fix"><span>Do this</span>${ap.fix}</div>
        <span class="ap-card__more">\u2190 Back</span>
      </div>
    </button>`;
}

export function mountAntipatterns(root) {
  const groups = ANTIPATTERN_GROUPS.map((g) => `
    <div class="ap-group">
      <h3 class="ap-group__label">${escHtml(g.label)}</h3>
      <div class="ap-grid">${g.ids.map(card).join('')}</div>
    </div>`).join('');

  root.innerHTML = `
    <section class="lab lab-ap">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">The traps the exam loves</h2>
          <p class="lab__lead">Every one of these looks reasonable and quietly breaks a production agent. Flip a card for why it fails and what to do instead. The other labs flag these live as they happen.</p>
        </div>
      </header>
      ${groups}
    </section>`;

  root.addEventListener('click', (e) => {
    const c = e.target.closest('.ap-card');
    if (!c) return;
    const flipped = c.classList.toggle('is-flipped');
    c.setAttribute('aria-expanded', String(flipped));
  });
}
