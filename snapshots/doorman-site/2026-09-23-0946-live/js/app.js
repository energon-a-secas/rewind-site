// ── Entry point ──────────────────────────────────────────────
// Doorman: Stack Cookbook — pick a recipe, see its probable stack,
// swap ingredients (open-source ↔ managed), compare costs, export
// the build prompt. Keep this file under 50 lines.

import { initState } from './state.js';
import { renderApp } from './render.js';
import { bindEvents } from './events.js';

initState();   // URL hash → localStorage → default recipe
renderApp();
bindEvents();
