const DEFAULT_STATE = {
  title: 'SALES BATTLECARD',
  columns: 3,
  theme: 'dark',
  sections: [
    {
      id: 's1',
      title: 'Company Overview',
      icon: 'business',
      accentColor: '#0063e5',
      colSpan: 2,
      rowSpan: 1,
      content: 'Describe the company, its mission, and key differentiators.',
      layout: 'numbered',
      subsections: [
        { title: '01', content: 'Key differentiator one' },
        { title: '02', content: 'Key differentiator two' },
        { title: '03', content: 'Key differentiator three' }
      ]
    },
    {
      id: 's2',
      title: 'Requirements',
      icon: 'writing',
      accentColor: '#ef4444',
      colSpan: 1,
      rowSpan: 2,
      content: 'List the customer requirements and buying criteria. What must the solution do?',
      layout: 'free',
      subsections: []
    },
    {
      id: 's3',
      title: 'Product',
      icon: 'technology',
      accentColor: '#6366f1',
      colSpan: 1,
      rowSpan: 1,
      content: 'Product highlights and key capabilities.',
      layout: 'columns',
      subsections: [
        { title: 'ONE', content: 'First advantage' },
        { title: 'TWO', content: 'Second advantage' }
      ]
    },
    {
      id: 's4',
      title: 'Strengths',
      icon: 'cybersecurity',
      accentColor: '#8b5cf6',
      colSpan: 1,
      rowSpan: 1,
      content: 'Where you win and why customers choose you.',
      layout: 'free',
      subsections: []
    },
    {
      id: 's5',
      title: 'FAQs / Answers',
      icon: 'tech-stories',
      accentColor: '#475569',
      colSpan: 1,
      rowSpan: 2,
      content: '',
      layout: 'qa',
      subsections: [
        { title: 'What is your pricing model?', content: 'We offer flexible subscription tiers for all team sizes.' },
        { title: 'How does onboarding work?', content: 'Full setup and training in under 24 hours.' },
        { title: 'Do you have enterprise options?', content: 'Yes, with dedicated support and custom contracts.' }
      ]
    },
    {
      id: 's6',
      title: 'Pricing',
      icon: 'finance',
      accentColor: '#0284c7',
      colSpan: 1,
      rowSpan: 1,
      content: 'Pricing tiers and value propositions.',
      layout: 'columns',
      subsections: [
        { title: 'Starter', content: '$0/mo' },
        { title: 'Pro', content: '$49/mo' },
        { title: 'Enterprise', content: 'Custom' }
      ]
    },
    {
      id: 's7',
      title: 'Weaknesses',
      icon: 'startups',
      accentColor: '#dc2626',
      colSpan: 1,
      rowSpan: 1,
      content: 'Known limitations to address proactively in your pitch.',
      layout: 'numbered',
      subsections: [
        { title: '01', content: 'Limitation one' },
        { title: '02', content: 'Limitation two' }
      ]
    }
  ]
};

function loadState() {
  try {
    const saved = localStorage.getItem('briefcard-v1');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export const state = loadState();

export function saveState() {
  try {
    localStorage.setItem('briefcard-v1', JSON.stringify(state));
  } catch (_) {}
}

export function resetState() {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
  state.title = fresh.title;
  state.columns = fresh.columns;
  state.theme = fresh.theme;
  state.sections = fresh.sections;
  saveState();
}

export function uid() {
  return 's' + Math.random().toString(36).slice(2, 9);
}
