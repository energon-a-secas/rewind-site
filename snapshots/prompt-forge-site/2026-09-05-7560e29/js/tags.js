const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'with', 'without', 'of', 'in', 'on', 'at', 'to', 'for',
  'from', 'by', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'she', 'her', 'he',
  'him', 'his', 'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my'
]);

const NORMALIZE_VERBS = {
  sitting: 'sit', standing: 'stand', lying: 'lie', walking: 'walk', running: 'run',
  looking: 'look', smiling: 'smile', holding: 'hold', wearing: 'wear', reading: 'read',
  sleeping: 'sleep', talking: 'talk', dancing: 'dance', eating: 'eat', drinking: 'drink',
  playing: 'play', working: 'work', waiting: 'wait', watching: 'watch', thinking: 'think'
};

const QUALITY_NEGATIVE = [
  'lowres', 'bad anatomy', 'bad hands', 'text', 'error', 'missing fingers',
  'extra digit', 'fewer digits', 'cropped', 'worst quality', 'low quality',
  'normal quality', 'jpeg artifacts', 'signature', 'watermark', 'username',
  'blurry', 'artist name', 'mutation', 'deformed', 'ugly', 'disfigured'
];

export const NEGATIVE_PRESETS = {
  standard: '',
  anime: 'bad anatomy, bad hands, missing fingers, extra digits, fewer digits, blurry, lowres, bad proportions, disfigured, mutation, deformed, watermark, signature, text, logo',
  photorealistic: 'painting, drawing, illustration, sketch, cartoon, anime, 3d render, doll, plastic, oversaturated, oversharpened, airbrushed, duplicate, morbid, mutated',
  nsfwSafety: 'child, loli, shota, minor, underage, cp, bestiality, scat, gore, amputee, obese, text, watermark, signature, bad anatomy',
  portrait: 'bad anatomy, extra limbs, extra fingers, malformed hands, missing arms, missing legs, extra face, double head, extra head, watermark, signature, text, logo, cropped'
};

function stripPunctuation(word) {
  return word.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
}

function tokenize(text) {
  return text
    .split(/[,.;:!?()\[\]{}\n\r]+/)
    .flatMap(part => part.split(/\s+/))
    .map(stripPunctuation)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function normalizeTag(tag, normalizeVerbs) {
  if (normalizeVerbs && NORMALIZE_VERBS[tag]) {
    return NORMALIZE_VERBS[tag];
  }
  return tag;
}

export function formatTags(input, options = {}) {
  const {
    normalize = true,
    dedupe = true,
    quality = true,
    qualityList = 'masterpiece, best quality, highly detailed'
  } = options;

  const raw = tokenize(input);
  const tags = raw.map(t => normalizeTag(t, normalize));

  const unique = dedupe ? Array.from(new Set(tags)) : tags;
  const ordered = unique.filter(Boolean);

  const base = ordered.join(', ');
  const qualityTags = quality ? qualityList.trim() : '';

  if (!base && !qualityTags) return '';
  if (!base) return qualityTags;
  if (!qualityTags) return base;
  return `${qualityTags}, ${base}`;
}

function parseTagList(input) {
  return input
    .split(/[,;\n]+/)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
}

export function formatNegative(input, options = {}) {
  const { uncensored = false } = options;
  const userTags = parseTagList(input);
  const base = userTags.join(', ');
  const qualityNeg = uncensored ? [] : QUALITY_NEGATIVE;

  if (!base && qualityNeg.length === 0) return '';
  if (!base) return qualityNeg.join(', ');
  if (qualityNeg.length === 0) return base;

  const seen = new Set(qualityNeg.map(t => t.toLowerCase()));
  const combined = [...qualityNeg];
  for (const tag of userTags) {
    if (!seen.has(tag)) {
      combined.push(tag);
      seen.add(tag);
    }
  }
  return combined.join(', ');
}
