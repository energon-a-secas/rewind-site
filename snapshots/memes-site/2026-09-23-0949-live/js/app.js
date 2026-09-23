// ── Entry point ──────────────────────────────────────────────────────

import { rebuildChips, filterGrid, renderMemeOfTheDay } from './render.js';
import { loadConvexMemes, loadVotes, loadOrganization, initMemesAuth } from './events.js';

rebuildChips();
filterGrid();
renderMemeOfTheDay();

loadConvexMemes();
loadVotes();
loadOrganization();

initMemesAuth();
