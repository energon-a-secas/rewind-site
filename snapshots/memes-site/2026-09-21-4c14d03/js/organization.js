// Shared taxonomy rules. Keep labels short, consistent, and searchable.
export const MAX_LABELS = 8;
export const MAX_LABEL_LENGTH = 32;
export const MAX_CATEGORY_LENGTH = 40;

export function normalizeCategory(value) {
  const normalize = text => text.normalize('NFKC').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
  const normalized = normalize(value);
  // Typing a friendly built-in name should select it, not create a duplicate.
  return Object.entries(CATEGORY_NAMES).find(([, name]) => normalize(name) === normalized)?.[0] || normalized;
}

export function normalizeLabel(value) {
  return value.normalize('NFKC').trim().replace(/^#+/, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function validateOrganization(category, labels) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory || normalizedCategory === 'all' || normalizedCategory.length > MAX_CATEGORY_LENGTH) {
    throw new Error('Choose a category of 1–40 characters (other than “all”).');
  }
  const normalizedLabels = [...new Set(labels.map(normalizeLabel).filter(Boolean))];
  if (normalizedLabels.length > MAX_LABELS) throw new Error('Use up to 8 labels per meme.');
  if (normalizedLabels.some(label => label.length > MAX_LABEL_LENGTH)) {
    throw new Error('Keep each label to 32 characters or fewer.');
  }
  return { category: normalizedCategory, labels: normalizedLabels };
}

const CATEGORY_NAMES = {
  anime: 'Anime', country: 'Countries', games: 'Games', general: 'General',
  mood: 'Moods & reactions', 'movie-reference': 'Movies',
  'other-references': 'Other references', series: 'TV & series',
  simpsons: 'The Simpsons', talent: 'Talent', templates: 'Templates',
};

export function categoryName(category) {
  return CATEGORY_NAMES[category] || category.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function selectMemes(memes, { category = 'all', labels = [], query = '', sort = 'recent', votes = {} } = {}) {
  const words = query.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const result = memes.filter(meme => {
    const haystack = [meme.name.replace(/[-_]/g, ' '), meme.name, meme.category, categoryName(meme.category), ...(meme.labels || [])].join(' ').toLowerCase();
    return (category === 'all' || meme.category === category)
      && labels.every(label => (meme.labels || []).includes(label))
      && words.every(word => haystack.includes(word));
  });
  if (sort === 'votes') result.sort((a, b) => (votes[b.name] || 0) - (votes[a.name] || 0));
  if (sort === 'recent') result.sort((a, b) => (b._creationTime ?? -b.id) - (a._creationTime ?? -a.id));
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
