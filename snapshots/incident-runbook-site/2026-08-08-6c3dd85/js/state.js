import { chapters, sectionIndex } from './content/index.js';
import { sectionText } from './utils.js';

export const state = {
  activeSection: '',
  query: '',
  drawerOpen: false
};

export const searchCorpus = sectionIndex.map(section => ({
  id: section.id,
  chapterId: section.chapterId,
  haystack: sectionText(section)
}));

export const chapterIds = chapters.map(c => c.id);

export function matchingSectionIds(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return null;
  return new Set(
    searchCorpus
      .filter(entry => terms.every(term => entry.haystack.includes(term)))
      .map(entry => entry.id)
  );
}
