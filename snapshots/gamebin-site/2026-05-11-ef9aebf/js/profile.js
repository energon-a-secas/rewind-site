// ── Profile management ───────────────────────────────────────

const AVATARS = [
  'warrior', 'mage', 'rogue', 'healer', 'ranger',
  'paladin', 'necro', 'bard', 'monk', 'druid',
];

const AVATAR_COLORS = {
  warrior: '#ef4444',
  mage: '#8b5cf6',
  rogue: '#6b7280',
  healer: '#10b981',
  ranger: '#22c55e',
  paladin: '#f59e0b',
  necro: '#66c0f4',
  bard: '#ec4899',
  monk: '#f97316',
  druid: '#14b8a6',
};

const BANNER_PRESETS = [
  { id: 'midnight', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'ember', gradient: 'linear-gradient(135deg, #1a0000, #4a1010, #1a0000)' },
  { id: 'ocean', gradient: 'linear-gradient(135deg, #000428, #004e92, #000428)' },
  { id: 'forest', gradient: 'linear-gradient(135deg, #0a1f0a, #1e4d2b, #0a1f0a)' },
  { id: 'void', gradient: 'linear-gradient(135deg, #0d0015, #1a0033, #0d0015)' },
  { id: 'sunset', gradient: 'linear-gradient(135deg, #1a0a00, #4a2000, #1a0a00)' },
  { id: 'arctic', gradient: 'linear-gradient(135deg, #0a1628, #1e3a5f, #0a1628)' },
  { id: 'neon', gradient: 'linear-gradient(135deg, #0a000f, #2d0040, #0a000f)' },
];

const CURRENCIES = [
  { code: 'cl', label: 'CLP', symbol: '$' },
  { code: 'us', label: 'USD', symbol: '$' },
  { code: 'eu', label: 'EUR', symbol: '€' },
  { code: 'uk', label: 'GBP', symbol: '£' },
  { code: 'br', label: 'BRL', symbol: 'R$' },
  { code: 'ar', label: 'ARS', symbol: '$' },
  { code: 'mx', label: 'MXN', symbol: '$' },
  { code: 'co', label: 'COP', symbol: '$' },
  { code: 'jp', label: 'JPY', symbol: '¥' },
  { code: 'au', label: 'AUD', symbol: '$' },
  { code: 'ca', label: 'CAD', symbol: '$' },
];

export { AVATARS, AVATAR_COLORS, BANNER_PRESETS, CURRENCIES };

export function getProfile(username) {
  try {
    const raw = localStorage.getItem('gamebin_profile_' + username);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    username,
    avatar: 'warrior',
    bio: '',
    banner: 'midnight',
    currency: 'cl',
    joinedAt: Date.now(),
  };
}

export function saveProfile(username, profile) {
  localStorage.setItem('gamebin_profile_' + username, JSON.stringify(profile));
}

export function renderAvatarSvg(type, size = 40) {
  const color = AVATAR_COLORS[type] || '#6b7280';
  const paths = {
    warrior: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M8 4l4-3 4 3" stroke="${color}" fill="none" stroke-width="1.5"/>`,
    mage: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M12 1l1 3h3l-2.5 2 1 3L12 7.5 9.5 9l1-3L8 4h3z" fill="${color}"/>`,
    rogue: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M9 6h6M8 8h8" stroke="#000" stroke-width="0.8" opacity="0.4"/>`,
    healer: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M11 5h2v6h-2zM9 7h6v2H9z" fill="#fff" opacity="0.8"/>`,
    ranger: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M7 3l5 4 5-4" stroke="${color}" fill="none" stroke-width="1.5"/>`,
    paladin: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><circle cx="12" cy="8" r="2" fill="#fff" opacity="0.5"/>`,
    necro: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M10 7h4v3h-1v2h-2v-2h-1z" fill="#000" opacity="0.5"/>`,
    bard: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M10 5c0 0 2 1 4 0" stroke="#fff" fill="none" stroke-width="1" opacity="0.7"/>`,
    monk: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><circle cx="12" cy="8" r="1.5" fill="none" stroke="#fff" opacity="0.6"/>`,
    druid: `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="${color}" opacity="0.6"/><path d="M12 4c-1 2 1 3 0 5" stroke="#fff" fill="none" stroke-width="1" opacity="0.6"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${paths[type] || paths.warrior}</svg>`;
}

export function getBannerGradient(bannerId) {
  const preset = BANNER_PRESETS.find(b => b.id === bannerId);
  return preset ? preset.gradient : BANNER_PRESETS[0].gradient;
}
