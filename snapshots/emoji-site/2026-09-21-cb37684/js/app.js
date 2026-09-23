// ── Entry point ──────────────────────────────────────────────────────
// Imports all modules to wire up the application.
// No logic beyond initialisation lives here.

import { rebuildChips, filterGrid, renderEmojiOfTheDay } from './render.js';
import { loadConvexEmojis } from './events.js';

// events.js self-registers all DOM listeners on import,
// so we only need to kick off the initial render here.

rebuildChips();
filterGrid();
renderEmojiOfTheDay();
loadConvexEmojis();
