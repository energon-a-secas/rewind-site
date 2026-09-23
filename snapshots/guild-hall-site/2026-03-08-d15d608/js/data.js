// ── Static data: ranks, badges, quotes, MHR icons, default missions ────────

export const RANKS = {
  low:    { label: 'Low Rank',    stars: [1, 2, 3], color: 'var(--mh-low)',    colorDim: 'var(--mh-low-dim)' },
  high:   { label: 'High Rank',   stars: [4, 5, 6], color: 'var(--mh-high)',   colorDim: 'var(--mh-high-dim)' },
  master: { label: 'Master Rank', stars: [7, 8, 9], color: 'var(--mh-master)', colorDim: 'var(--mh-master-dim)' },
};

// MHR monster icons by rank (sublevel 0 = easiest, 2 = hardest within rank). No Jagras on max difficulty.
const MHR_ICONS_BY_RANK = {
  low: [
    'MHRise-Great_Izuchi_Icon.svg',
    'MHRise-Arzuros_Icon.svg',
    'MHRise-Kulu-Ya-Ku_Icon.svg',
    'MHRise-Great_Baggi_Icon.svg',
    'MHRise-Lagombi_Icon.svg',
    'MHRise-Aknosom_Icon.svg',
  ],
  high: [
    'MHRise-Rathian_Icon(3).svg',
    'MHRise-Rathalos_Icon.svg',
    'MHRise-Nargacuga_Icon.svg',
    'MHRise-Tigrex_Icon.svg',
    'MHRise-Mizutsune_Icon.svg',
    'MHRise-Magnamalo_Icon.svg',
  ],
  master: [
    'MHRise-Teostra_Icon.svg',
    'MHRise-Kushala_Daora_Icon.svg',
    'MHRise-Crimson_Glow_Valstrax_Icon.svg',
    'MHRise-Rajang_Icon.svg',
    'MHRise-Apex_Rathalos_Icon.svg',
    'MHRS-Malzeno_Icon(2).svg',
  ],
};

export const MHR_MONSTER_TIERS = MHR_ICONS_BY_RANK;

/** Get monster icon filename for rank and sublevel (0-based). Sublevel caps at pool length. */
export function getMonsterIconForRank(rank, sublevel = 0) {
  const pool = MHR_ICONS_BY_RANK[rank] || MHR_ICONS_BY_RANK.low;
  const idx = Math.min(Math.max(0, sublevel), pool.length - 1);
  return pool[idx];
}

/** All monster options for request form: { value: filename, label, rank }. */
export function getAllMonsterOptions() {
  const out = [];
  for (const [rank, icons] of Object.entries(MHR_ICONS_BY_RANK)) {
    const rankLabel = RANKS[rank]?.label || rank;
    icons.forEach((filename, i) => {
      const name = filename.replace(/^MHR(ise|S)-|_Icon.*\.svg$/gi, '').replace(/_/g, ' ');
      out.push({ value: filename, label: `${rankLabel} – ${name}`, rank });
    });
  }
  return out;
}

export const CATEGORIES = {
  hunt:          { label: 'Hunt',          icon: '\u2694\uFE0F', desc: 'Build a new feature' },
  slay:          { label: 'Slay',          icon: '\uD83D\uDDE1\uFE0F', desc: 'Fix a bug' },
  capture:       { label: 'Capture',       icon: '\uD83E\uDE64', desc: 'Improve existing code' },
  investigation: { label: 'Investigation', icon: '\uD83D\uDD0D', desc: 'Research or spike' },
};

export const BADGES = [
  { key: 'first-hunt',     name: 'First Hunt',        icon: '\uD83C\uDFC6', description: 'Complete your first quest', tier: 'low' },
  { key: 'bug-slayer',     name: 'Bug Slayer',         icon: '\uD83D\uDC1B', description: 'Slay 5 bugs',              tier: 'low' },
  { key: 'team-player',    name: 'Team Player',        icon: '\uD83E\uDD1D', description: 'Join 3 multiplayer hunts', tier: 'low' },
  { key: 'rising-star',    name: 'Rising Star',        icon: '\u2B50',       description: 'Complete 10 quests',        tier: 'high' },
  { key: 'code-wyvern',    name: 'Code Wyvern',        icon: '\uD83D\uDC09', description: 'Complete a 6-star quest',   tier: 'high' },
  { key: 'sos-responder',  name: 'SOS Responder',      icon: '\uD83D\uDEA8', description: 'Answer 5 SOS flares',      tier: 'high' },
  { key: 'elder-hunter',   name: 'Elder Hunter',       icon: '\uD83D\uDD25', description: 'Complete 25 quests',        tier: 'master' },
  { key: 'sapphire-star',  name: 'Sapphire Star',      icon: '\uD83D\uDC8E', description: 'Complete a 9-star quest',   tier: 'master' },
  { key: 'guild-knight',   name: 'Guild Knight',       icon: '\uD83D\uDEE1\uFE0F', description: 'Earn all Low/High badges', tier: 'master' },
  { key: 'palico-friend',  name: 'Palico\'s Friend',   icon: '\uD83D\uDC31', description: 'Pet Poogie 10 times',       tier: 'special' },
  { key: 'canteen-regular', name: 'Canteen Regular',   icon: '\uD83C\uDF56', description: 'Visit the hall 50 times',   tier: 'special' },
  { key: 'ace-hunter',     name: 'Ace Hunter',         icon: '\u2728',       description: 'Complete 50 quests',        tier: 'special' },
];

export const HUNTER_TITLES = [
  'Greenhorn', 'Apprentice', 'Journeyman', 'Veteran',
  'Ace Hunter', 'Master Hunter', 'Elder Hunter', 'Sapphire Star',
];

export function hunterTitleForCompletions(n) {
  if (n >= 50) return HUNTER_TITLES[7];
  if (n >= 35) return HUNTER_TITLES[6];
  if (n >= 25) return HUNTER_TITLES[5];
  if (n >= 15) return HUNTER_TITLES[4];
  if (n >= 10) return HUNTER_TITLES[3];
  if (n >= 5)  return HUNTER_TITLES[2];
  if (n >= 1)  return HUNTER_TITLES[1];
  return HUNTER_TITLES[0];
}

export const HANDLER_QUOTES = [
  "We've got a new quest on the board, partner!",
  "This one looks like it'll be a tough hunt. Better prepare well!",
  "The Guildmaster posted this one personally. Must be important!",
  "I've heard rumors about this quest... sounds exciting!",
  "Another day, another quest. Let's give it our all!",
  "The canteen's serving Felyne Acorn Steak today. Eat up before heading out!",
  "Remember, a true hunter never hunts alone... unless they're showing off.",
  "The Smithy says they can forge something special if we gather the right materials.",
  "I believe in you, partner! Now go get 'em!",
  "Quest complete! That was some fine hunting, partner!",
  "The Meowscular Chef outdid himself today!",
  "Don't forget to pet Poogie on your way out!",
  "A Rathalos-sized task? Nothing you can't handle!",
  "The Research Commission would be proud of this work.",
  "Time to carve those rewards!",
];

export function randomQuote() {
  return HANDLER_QUOTES[Math.floor(Math.random() * HANDLER_QUOTES.length)];
}

export const POOGIE_OUTFITS = [
  { name: 'Emperor Hopper', emoji: '\uD83D\uDC16' },
  { name: 'Hog in a Frog', emoji: '\uD83D\uDC38' },
  { name: 'Poogie Pumpkin', emoji: '\uD83C\uDF83' },
  { name: 'White Leather', emoji: '\uD83E\uDD0D' },
  { name: 'Dapper Coralline', emoji: '\uD83C\uDF3A' },
  { name: 'Memorial Stripes', emoji: '\uD83C\uDFF3\uFE0F' },
];

// Fallback when Convex is not used (e.g. localStorage mode)
export const SAMPLE_QUESTS = [];
