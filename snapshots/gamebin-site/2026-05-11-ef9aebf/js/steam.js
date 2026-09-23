// ── Steam integration ────────────────────────────────────────
// Extracts appId from Steam URLs and builds CDN cover URLs.
// Includes a local game database for search (Steam APIs have CORS limits).

const STEAM_URL_PATTERNS = [
  { re: /store\.steampowered\.com\/app\/(\d+)(?:\/([^/?#]+))?/, hasSlug: true },
  { re: /steamcommunity\.com\/app\/(\d+)/, hasSlug: false },
  { re: /s\.team\/a\/(\d+)/, hasSlug: false },
];

export function extractSteamAppId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  for (const { re } of STEAM_URL_PATTERNS) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  if (/^\d{3,10}$/.test(trimmed)) return trimmed;
  return null;
}

export function extractNameFromUrl(input) {
  if (!input) return null;
  const trimmed = input.trim();
  for (const { re, hasSlug } of STEAM_URL_PATTERNS) {
    const m = trimmed.match(re);
    if (m && hasSlug && m[2]) {
      return m[2].replace(/_/g, ' ').replace(/\/$/, '');
    }
  }
  return null;
}

export function getSteamCoverUrl(appId) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
}

export function getSteamHeaderUrl(appId) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function buildSteamInfoFromUrl(input) {
  const appId = extractSteamAppId(input);
  if (!appId) return null;
  const nameFromSlug = extractNameFromUrl(input);
  return {
    appId,
    name: nameFromSlug || 'Steam Game ' + appId,
    coverUrl: getSteamCoverUrl(appId),
    headerUrl: getSteamHeaderUrl(appId),
  };
}

// Local game database for instant search (no CORS issues)
const GAME_DB = [
  { appId: '548430', name: 'Deep Rock Galactic' },
  { appId: '1966720', name: 'Lethal Company' },
  { appId: '739630', name: 'Phasmophobia' },
  { appId: '1426210', name: 'It Takes Two' },
  { appId: '945360', name: 'Among Us' },
  { appId: '413150', name: 'Stardew Valley' },
  { appId: '892970', name: 'Valheim' },
  { appId: '1172470', name: 'Apex Legends' },
  { appId: '730', name: 'Counter-Strike 2' },
  { appId: '570', name: 'Dota 2' },
  { appId: '440', name: 'Team Fortress 2' },
  { appId: '252490', name: 'Rust' },
  { appId: '271590', name: 'Grand Theft Auto V' },
  { appId: '1245620', name: 'Elden Ring' },
  { appId: '1091500', name: 'Cyberpunk 2077' },
  { appId: '1174180', name: 'Red Dead Redemption 2' },
  { appId: '292030', name: 'The Witcher 3' },
  { appId: '814380', name: 'Sekiro' },
  { appId: '367520', name: 'Hollow Knight' },
  { appId: '1145360', name: 'Hades' },
  { appId: '1449560', name: 'Hades II' },
  { appId: '960090', name: 'Balatro' },
  { appId: '1086940', name: 'Baldur\'s Gate 3' },
  { appId: '1203220', name: 'Naraka Bladepoint' },
  { appId: '1551360', name: 'Forza Horizon 5' },
  { appId: '1817070', name: 'Marvel\'s Spider-Man Remastered' },
  { appId: '1593500', name: 'God of War' },
  { appId: '2358720', name: 'Black Myth Wukong' },
  { appId: '553850', name: 'Helldivers 2' },
  { appId: '394360', name: 'Hearts of Iron IV' },
  { appId: '1364780', name: 'Stellaris' },
  { appId: '236390', name: 'War Thunder' },
  { appId: '381210', name: 'Dead by Daylight' },
  { appId: '1172620', name: 'Sea of Thieves' },
  { appId: '322330', name: 'Don\'t Starve Together' },
  { appId: '242760', name: 'The Forest' },
  { appId: '1928980', name: 'Sons of the Forest' },
  { appId: '105600', name: 'Terraria' },
  { appId: '1238810', name: 'Battlefield 2042' },
  { appId: '238960', name: 'Path of Exile' },
  { appId: '2694490', name: 'Path of Exile 2' },
  { appId: '578080', name: 'PUBG' },
  { appId: '1623730', name: 'Palworld' },
  { appId: '526870', name: 'Satisfactory' },
  { appId: '242760', name: 'The Forest' },
  { appId: '304930', name: 'Unturned' },
  { appId: '346110', name: 'ARK Survival Evolved' },
  { appId: '976730', name: 'Halo Infinite' },
  { appId: '1332010', name: 'Stray' },
  { appId: '427520', name: 'Factorio' },
  { appId: '387290', name: 'Ori and the Blind Forest' },
  { appId: '1113000', name: 'Persona 5 Royal' },
  { appId: '1817190', name: 'Marvel\'s Spider-Man Miles Morales' },
  { appId: '460950', name: 'Katana ZERO' },
  { appId: '632360', name: 'Risk of Rain 2' },
  { appId: '250900', name: 'The Binding of Isaac Rebirth' },
  { appId: '1237970', name: 'Titanfall 2' },
  { appId: '1222670', name: 'The Sims 4' },
  { appId: '1332010', name: 'Stray' },
  { appId: '218620', name: 'Payday 2' },
  { appId: '1272080', name: 'Payday 3' },
  { appId: '1938090', name: 'Call of Duty' },
  { appId: '990080', name: 'Hogwarts Legacy' },
  { appId: '1716740', name: 'Vampire Survivors' },
  { appId: '1794680', name: 'Vampire Survivors: Legacy of the Moonspell' },
  { appId: '1245620', name: 'Elden Ring' },
  { appId: '582010', name: 'Monster Hunter World' },
  { appId: '1118310', name: 'Monster Hunter Rise' },
  { appId: '2246340', name: 'Monster Hunter Wilds' },
  { appId: '294100', name: 'RimWorld' },
  { appId: '1284210', name: 'Guild Wars 2' },
  { appId: '1085660', name: 'Destiny 2' },
  { appId: '359550', name: 'Tom Clancy\'s Rainbow Six Siege' },
  { appId: '1938090', name: 'Call of Duty: Modern Warfare' },
  { appId: '620', name: 'Portal 2' },
  { appId: '400', name: 'Portal' },
  { appId: '4000', name: 'Garry\'s Mod' },
  { appId: '255710', name: 'Cities: Skylines' },
  { appId: '949230', name: 'Cities: Skylines II' },
  { appId: '261550', name: 'Mount & Blade II: Bannerlord' },
  { appId: '1329440', name: 'The Last of Us Part I' },
  { appId: '814380', name: 'Sekiro: Shadows Die Twice' },
  { appId: '1817230', name: 'Uncharted: Legacy of Thieves' },
  { appId: '375820', name: 'Human: Fall Flat' },
  { appId: '1097150', name: 'Fall Guys' },
  { appId: '1599340', name: 'Lost Ark' },
  { appId: '365720', name: 'Overcooked' },
  { appId: '728880', name: 'Overcooked! 2' },
  { appId: '457140', name: 'Oxygen Not Included' },
  { appId: '1063730', name: 'New World' },
  { appId: '1238840', name: 'Battlefield 1' },
  { appId: '1229490', name: 'Ultrakill' },
];

export function searchLocalGames(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return GAME_DB
    .filter(g => g.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map(g => ({
      appId: g.appId,
      name: g.name,
      coverUrl: getSteamCoverUrl(g.appId),
      headerUrl: getSteamHeaderUrl(g.appId),
    }));
}

// ── Steam tags fetching via Convex HTTP proxy ───────────────

const CONVEX_SITE = 'https://vivid-ferret-371.convex.site';

export async function fetchSteamTags(appId) {
  if (!appId) return [];
  try {
    const res = await fetch(`${CONVEX_SITE}/steam/tags?appId=${appId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags || [];
  } catch {
    return [];
  }
}
