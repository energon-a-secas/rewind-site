// ── Card templates ────────────────────────────────────────────────────────────
// Ready-made battle cards. Loading one replaces the whole card state
// (sections + title + brand), keeping the visitor's theme choice.

export const TEMPLATES = [
  {
    id: 'neorgon',
    name: 'Neorgon (demo)',
    desc: 'Full demo card: positioning, objection handling, competitors, pricing',
    card: {
      title: 'NEORGON — SALES BATTLECARD',
      columns: 3,
      brand: { company: 'Neorgon', logoDataUrl: '', font: 'sans' },
      sections: [
        {
          id: 't1', title: 'Elevator Pitch', icon: 'business', accentColor: '#0063e5',
          colSpan: 2, rowSpan: 1, layout: 'free', subsections: [],
          content: 'Neorgon is a suite of 40+ zero-setup web tools for engineering teams: planning canvases, interview scorecards, incident runbooks, and learning labs. No accounts, no installs, free forever — open a URL and work.'
        },
        {
          id: 't2', title: 'Why We Win', icon: 'cybersecurity', accentColor: '#16a34a',
          colSpan: 1, rowSpan: 2, layout: 'numbered',
          content: '',
          subsections: [
            { title: '01', content: 'Zero friction: no signup, no seat licenses, no procurement cycle' },
            { title: '02', content: 'Data stays local: state lives in the browser, nothing to audit' },
            { title: '03', content: 'One consistent design system across every tool' },
            { title: '04', content: 'Ships fast: static sites, no vendor lock-in, exportable data' }
          ]
        },
        {
          id: 't3', title: 'Objection Handling', icon: 'tech-stories', accentColor: '#d97706',
          colSpan: 2, rowSpan: 2, layout: 'pairs',
          content: '',
          subsections: [
            { title: 'We already have Notion / Confluence for this', content: 'Those are documents. Neorgon tools are purpose-built interactive apps — a strategy canvas with gap detection beats a table template.' },
            { title: 'Free tools mean no support or roadmap', content: 'Every tool is open source with public repos and a shared component kit — fixes land fleet-wide in one push.' },
            { title: 'Is our data safe?', content: 'Nothing leaves the browser unless you export it. No backend, no tracking of card content, no account to breach.' },
            { title: 'What about enterprise features?', content: 'Import/export gives you portability; the roadmap adds shareable links and team presets without ever requiring accounts.' }
          ]
        },
        {
          id: 't4', title: 'Competitive Landscape', icon: 'startups', accentColor: '#9333ea',
          colSpan: 1, rowSpan: 1, layout: 'qa',
          content: '',
          subsections: [
            { title: 'vs. Miro / FigJam?', content: 'They price per seat and gate exports. Pathfinder and Loadout are free and export to JSON, Markdown, and PNG.' },
            { title: 'vs. spreadsheets?', content: 'Purpose-built UI beats generic grids — scoring, gap detection, and visual output come built in.' }
          ]
        },
        {
          id: 't5', title: 'Pricing', icon: 'finance', accentColor: '#0284c7',
          colSpan: 1, rowSpan: 1, layout: 'columns',
          content: '',
          subsections: [
            { title: 'Tools', content: 'Free' },
            { title: 'Export', content: 'Free' },
            { title: 'Support', content: 'GitHub issues' }
          ]
        },
        {
          id: 't6', title: 'Proof Points', icon: 'technology', accentColor: '#0d9488',
          colSpan: 2, rowSpan: 1, layout: 'columns',
          content: '',
          subsections: [
            { title: '40+', content: 'Live tools on one design system' },
            { title: '0', content: 'Accounts required to use any of them' },
            { title: '<1s', content: 'Static-site load, no build steps' }
          ]
        }
      ]
    }
  },
  {
    id: 'saas',
    name: 'SaaS vs. rival',
    desc: 'Classic head-to-head: Acme Analytics against an incumbent',
    card: {
      title: 'ACME ANALYTICS vs DATARIVAL',
      columns: 3,
      brand: { company: 'Acme Analytics', logoDataUrl: '', font: 'sans' },
      sections: [
        {
          id: 'a1', title: 'The One-Liner', icon: 'business', accentColor: '#0063e5',
          colSpan: 3, rowSpan: 1, layout: 'free', subsections: [],
          content: 'Acme turns raw product events into decisions in minutes — self-serve dashboards your PMs actually build themselves, at half the cost of DataRival.'
        },
        {
          id: 'a2', title: 'Where We Win', icon: 'cybersecurity', accentColor: '#16a34a',
          colSpan: 1, rowSpan: 2, layout: 'numbered', content: '',
          subsections: [
            { title: '01', content: 'Setup in one afternoon vs. a 6-week implementation' },
            { title: '02', content: 'Usage-based pricing — no seat minimums' },
            { title: '03', content: 'SQL escape hatch for the data team' }
          ]
        },
        {
          id: 'a3', title: 'Landmines to Plant', icon: 'startups', accentColor: '#dc2626',
          colSpan: 1, rowSpan: 2, layout: 'numbered', content: 'Questions that expose the rival’s gaps:',
          subsections: [
            { title: '01', content: 'Ask how long their last schema migration took' },
            { title: '02', content: 'Ask what a 10-seat expansion costs mid-contract' }
          ]
        },
        {
          id: 'a4', title: 'Objections', icon: 'tech-stories', accentColor: '#d97706',
          colSpan: 1, rowSpan: 2, layout: 'pairs', content: '',
          subsections: [
            { title: 'DataRival is the safe choice', content: 'Safe for whom? Their per-seat model penalizes exactly the adoption you want.' },
            { title: 'Migration sounds painful', content: 'Our importer replays your event history — median migration is 4 days, we staff it.' }
          ]
        },
        {
          id: 'a5', title: 'Pricing Cheat Sheet', icon: 'finance', accentColor: '#0284c7',
          colSpan: 3, rowSpan: 1, layout: 'columns', content: '',
          subsections: [
            { title: 'Starter', content: '$99/mo — 1M events' },
            { title: 'Growth', content: '$499/mo — 20M events' },
            { title: 'Scale', content: 'Custom — unlimited, SSO, DPA' }
          ]
        }
      ]
    }
  },
  {
    id: 'blank',
    name: 'Blank',
    desc: 'Three empty sections to start from scratch',
    card: {
      title: 'SALES BATTLECARD',
      columns: 3,
      brand: { company: '', logoDataUrl: '', font: 'sans' },
      sections: [
        { id: 'b1', title: 'Overview',   icon: 'business',   accentColor: '#0063e5', colSpan: 3, rowSpan: 1, layout: 'free', content: 'What you sell, in two sentences.', subsections: [] },
        { id: 'b2', title: 'Why We Win', icon: 'cybersecurity', accentColor: '#16a34a', colSpan: 1, rowSpan: 1, layout: 'numbered', content: '', subsections: [{ title: '01', content: 'First differentiator' }] },
        { id: 'b3', title: 'Objections', icon: 'tech-stories', accentColor: '#d97706', colSpan: 2, rowSpan: 1, layout: 'pairs', content: '', subsections: [{ title: 'Too expensive', content: 'Reframe around cost of the status quo.' }] }
      ]
    }
  }
];
