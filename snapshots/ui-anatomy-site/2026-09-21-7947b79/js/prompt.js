// ── Layout prompt export: turn the visible wireframe into an AI prompt ──────
// Components are read from the rendered DOM in page order (not from
// LAYOUT_COMPONENTS) so the prompt can never drift from what's on screen.

import { state } from './state.js';
import { COMPONENTS, LAYOUTS, HERO_BACKGROUNDS } from './data.js';

export function buildLayoutPrompt() {
  const layout = LAYOUTS.find(l => l.id === state.activeLayout);
  const ids = [...new Set([...document.querySelectorAll('#mockupFrame [data-comp]')].map(el => el.dataset.comp))]
    .filter(id => COMPONENTS[id]);

  const lines = ids.map(id => {
    const c = COMPONENTS[id];
    const cut = c.desc.indexOf('. ');
    const short = cut === -1 ? c.desc : c.desc.slice(0, cut + 1);
    return `- ${c.name}: ${short}`;
  });

  const parts = [
    `Design a ${layout ? layout.label : state.activeLayout} page as a desktop web mockup.`,
    '',
    'Use these components, in page order. Name each section/layer with the exact component term, so the design maps cleanly onto a design system:',
    '',
    ...lines,
  ];

  if (ids.includes('hero-section') && state.heroBg !== 'solid') {
    const bg = HERO_BACKGROUNDS.find(b => b.id === state.heroBg);
    if (bg) parts.push('', `Hero background style: ${bg.label}.`);
  }

  parts.push('', 'Style: modern, clean, generous whitespace, readable sans-serif type, one accent color used sparingly for CTAs.');
  return parts.join('\n');
}

let lastFocus = null;

export function openPrompt() {
  const layout = LAYOUTS.find(l => l.id === state.activeLayout);
  document.getElementById('promptLayoutName').textContent = layout ? layout.label : '';
  document.getElementById('promptText').value = buildLayoutPrompt();
  lastFocus = document.activeElement;
  document.getElementById('promptOverlay').classList.remove('hidden');
  document.getElementById('promptCopyBtn').focus();
}

export function closePrompt() {
  document.getElementById('promptOverlay').classList.add('hidden');
  if (lastFocus) lastFocus.focus();
}

export function isPromptOpen() {
  return !document.getElementById('promptOverlay').classList.contains('hidden');
}

export function copyPrompt(btn) {
  const ta = document.getElementById('promptText');
  const done = () => {
    btn.textContent = 'Copied ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy prompt'; btn.classList.remove('copied'); }, 1200);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(ta.value).then(done, () => {
      ta.select();
      document.execCommand('copy');
      done();
    });
  } else {
    ta.select();
    document.execCommand('copy');
    done();
  }
}
