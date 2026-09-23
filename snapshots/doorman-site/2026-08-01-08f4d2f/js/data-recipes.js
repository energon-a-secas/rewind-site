// ── Recipes, frontend approaches, scale tiers ────────────────
// A recipe = an app archetype: which stack categories it needs,
// the default pick per category, its build size (drives AI build
// cost), and the hard parts nobody mentions in the landing page.
//
// Bundle rule: picking an option with `bundles` in data-services.js
// (e.g. Supabase under database) claims those categories — they show
// as "bundled" and cost $0 extra. Pick a standalone option there to
// unbundle.

/** Scale tiers for infra cost display. */
export const TIERS = {
  hobby:    { label: 'Hobby',    note: 'Side project — free tiers should carry you.' },
  launched: { label: 'Launched', note: 'Real users — entry paid plans, no free-tier pauses.' },
  scaling:  { label: 'Scaling',  note: 'Growth — ~10× launched traffic, bills get real.' },
};

/**
 * Frontend approach — the compromise axis. tokenFactor scales the
 * AI build estimate: frameworks cost more tokens to generate but
 * less pain to grow.
 */
export const FRONTENDS = {
  vanilla: {
    label: 'Pure HTML/CSS/JS',
    chip: 'No build step',
    tokenFactor: 0.7,
    blurb: 'Open an editor, ship a file. The Neorgon way.',
    pros: ['Hosts free anywhere (GitHub Pages, CF Pages)', 'Cheapest to generate with AI', 'Nothing to upgrade, ever'],
    cons: ['State + DOM get painful past ~1k lines', 'No component reuse — copy/paste creeps in'],
  },
  tailwind: {
    label: 'Vanilla + Tailwind',
    chip: 'Utility CSS',
    tokenFactor: 1.0,
    blurb: 'Same files, faster styling. AI writes Tailwind fluently.',
    pros: ['Styling speed without a framework', 'Still hosts anywhere static', 'AI models know Tailwind cold'],
    cons: ['CDN play-build is dev-only — use the CLI for prod', 'Class soup without discipline'],
  },
  framework: {
    label: 'Framework (Next/SvelteKit/Vue)',
    chip: 'Full structure',
    tokenFactor: 1.5,
    blurb: 'Components, routing, ecosystem. The default if it will grow.',
    pros: ['Component model + routing built in', 'Ecosystem for every problem', 'SSR/SEO options when you need them'],
    cons: ['Build step + Node hosting for SSR', '~1.5× the AI tokens to generate', 'Upgrade treadmill never stops'],
  },
};

/**
 * Recipes. size drives the AI-build token estimate (see data-models.js):
 *   S  — a few pages, one data model
 *   M  — real CRUD + auth + one integration
 *   L  — multiple roles or a second hard subsystem
 *   XL — marketplace-class: two-sided, payments + search + ops
 */
export const RECIPES = {
  saas: {
    label: 'SaaS Dashboard', icon: 'gauge', size: 'M',
    blurb: 'Login, a data model, a settings page, a bill. The B2B classic.',
    categories: ['hosting', 'database', 'auth', 'email', 'payments', 'analytics', 'monitoring'],
    defaults: { hosting: 'vercel', database: 'neon', auth: 'clerk', email: 'resend', payments: 'stripe', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'Auth is a subscription, not a feature', note: 'Per-MAU pricing means your user table has a meter on it. Clerk/Auth0 get expensive exactly when you succeed — budget the 10k-MAU cliff.' },
      { title: 'The billing edge cases own you', note: 'Trials, proration, failed cards, plan changes mid-cycle. Stripe handles the math; you handle the states.' },
      { title: 'Multi-tenancy from day one', note: 'Every query needs a tenant filter. Retrofitting row-level isolation is the classic 2am migration.' },
      { title: 'Email deliverability is its own job', note: 'SPF/DKIM/DMARC setup, warmup, bounce handling. Transactional email that lands in spam is a silent churn machine.' },
    ],
  },

  social: {
    label: 'Social / Community App', icon: 'users', size: 'L',
    blurb: 'Profiles, a feed, likes, notifications. Cheap to start, brutal to scale.',
    categories: ['hosting', 'database', 'auth', 'storage', 'cdn', 'realtime', 'analytics', 'monitoring'],
    defaults: { hosting: 'cfpages', database: 'firebase', auth: 'bundled', storage: 'bundled', cdn: 'cloudflare', realtime: 'bundled', analytics: 'ga4', monitoring: 'sentry' },
    challenges: [
      { title: 'The feed is the product and the problem', note: 'Chronological is easy; ranked feeds are a data pipeline. Every engagement feature multiplies write volume.' },
      { title: 'Media storage compounds', note: 'User uploads grow forever and egress is where clouds bill you. R2/B2 exist largely because of this recipe.' },
      { title: 'Moderation arrives uninvited', note: 'Report queues, blocks, CSAM scanning obligations. Not optional once real humans show up — plan the tooling before you need it.' },
      { title: 'Notifications are a second app', note: 'In-app, email, push — each with preferences, rate limits, and unsubscribe law.' },
    ],
  },

  ecommerce: {
    label: 'E-commerce Store', icon: 'cart', size: 'L',
    blurb: 'Catalog, cart, checkout, orders. Money touches everything.',
    categories: ['hosting', 'database', 'storage', 'cdn', 'search', 'payments', 'email', 'analytics'],
    defaults: { hosting: 'vercel', database: 'supabase', storage: 'r2', cdn: 'cloudflare', search: 'typesense', payments: 'stripe', email: 'resend', analytics: 'ga4' },
    challenges: [
      { title: 'Payments compliance picks your processor', note: 'Merchant-of-record services (Paddle, Lemon Squeezy) eat tax/VAT for a bigger cut. Stripe is cheaper but tax is your problem.' },
      { title: 'Inventory consistency under race conditions', note: 'Two buyers, one item. Overselling is a support ticket with a refund attached — reserve stock at cart, commit at payment.' },
      { title: 'Product images are 80% of your bandwidth', note: 'An image pipeline (resize, WebP/AVIF, lazy) is not polish — it IS the page weight.' },
      { title: 'Search makes or breaks the catalog', note: 'Past ~50 SKUs, users search instead of browse. Typos, synonyms, facets — Postgres FTS works until it does not.' },
    ],
  },

  content: {
    label: 'Blog / Content Site', icon: 'news', size: 'S',
    blurb: 'Posts, pages, an archive, maybe a newsletter. The honest starter.',
    categories: ['hosting', 'cms', 'cdn', 'search', 'analytics', 'email'],
    defaults: { hosting: 'cfpages', cms: 'decap', cdn: 'cloudflare', search: 'none', analytics: 'umami', email: 'none' },
    challenges: [
      { title: 'The CMS decision is forever', note: 'Git-based (markdown in repo) is free and portable; hosted CMS gives editors a real UI at a monthly price. Migrating content later is the pain.' },
      { title: 'SEO is the actual feature', note: 'Meta tags, sitemaps, structured data, Core Web Vitals. A blog nobody finds is a diary.' },
      { title: 'Newsletter double opt-in law', note: 'GDPR/CAN-SPAM consent flows and unsubscribe handling are legal requirements, not settings.' },
    ],
  },

  chat: {
    label: 'Realtime Chat', icon: 'bubble', size: 'M',
    blurb: 'Rooms, presence, typing indicators, history. Websockets all the way down.',
    categories: ['hosting', 'database', 'auth', 'realtime', 'storage', 'monitoring'],
    defaults: { hosting: 'cfpages', database: 'convex', auth: 'clerk', realtime: 'bundled', storage: 'r2', monitoring: 'sentry' },
    challenges: [
      { title: 'Fan-out billing is the trap', note: 'One message to 100 subscribers counts as ~100 messages on Ably/Pusher. The free tier evaporates in one busy room.' },
      { title: 'Presence is harder than messages', note: 'Who is online right now across reconnects, tabs, and flaky mobile networks. Every realtime service half-solves this differently.' },
      { title: 'History means you are a database company', note: 'Scrollback, search, retention policy, GDPR deletion. Storage grows forever.' },
      { title: 'Abuse finds chat first', note: 'Spam, raids, illegal content. Rate limits and report tooling before launch, not after.' },
    ],
  },

  marketplace: {
    label: 'Marketplace', icon: 'store', size: 'XL',
    blurb: 'Two-sided: sellers list, buyers pay, you take a cut. The boss fight.',
    categories: ['hosting', 'database', 'auth', 'storage', 'search', 'payments', 'email', 'analytics', 'monitoring'],
    defaults: { hosting: 'render', database: 'supabase', auth: 'bundled', storage: 'r2', search: 'algolia', payments: 'stripe', email: 'postmark', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'You are a payments company now', note: 'Split payouts (Stripe Connect), KYC for sellers, refunds, chargebacks, 1099/DAC7 tax reporting. This subsystem alone is recipe-sized.' },
      { title: 'Cold start has no algorithmic fix', note: 'No sellers → no buyers → no sellers. The software is the easy half; seeded supply is the real launch plan.' },
      { title: 'Trust infrastructure is a feature set', note: 'Reviews, disputes, escrow-ish holds, verification badges. Each is a table, a flow, and a moderation surface.' },
      { title: 'Search + discovery carries conversion', note: 'Facets, ranking, availability windows. Buyers who cannot find it cannot buy it.' },
    ],
  },

  mobile: {
    label: 'Mobile App Backend', icon: 'phone', size: 'M',
    blurb: 'The API + data behind an iOS/Android app. No frontend here.',
    categories: ['database', 'auth', 'storage', 'analytics', 'monitoring'],
    defaults: { database: 'supabase', auth: 'bundled', storage: 'bundled', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'App-store release lag shapes your API', note: 'Users run old app versions for months. Version every endpoint; you can never break v1.' },
      { title: 'Push is free, push infra is not', note: 'FCM/APNs cost $0, but token management, topics, and per-user preferences are yours to build.' },
      { title: 'Offline sync is where estimates die', note: 'If the app must work offline, you are building conflict resolution, not CRUD. Say no unless it is the product.' },
      { title: 'Store privacy labels expose your analytics', note: 'Every SDK you embed shows up on the label. Minimal tracking is a marketing feature now.' },
    ],
  },

  aiwrapper: {
    label: 'AI Wrapper App', icon: 'sparkles', size: 'M',
    blurb: 'Your UI + prompts on top of a model API, with accounts and a paywall.',
    categories: ['hosting', 'database', 'auth', 'aiApi', 'payments', 'queue', 'analytics', 'monitoring'],
    defaults: { hosting: 'vercel', database: 'convex', auth: 'clerk', aiApi: 'anthropic', payments: 'stripe', queue: 'inngest', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'Your COGS is someone else\'s pricing page', note: 'Model prices drop ~10× a year — great — but your free tier users can still burn $50 of tokens in an afternoon. Budget caps or death.' },
      { title: 'Thin wrappers decay fast', note: 'If the value is one prompt, the platform ships it next quarter. The moat is workflow, data, or distribution — pick one.' },
      { title: 'Long generations need job infrastructure', note: 'Serverless timeouts kill 2-minute generations. Queue + polling/webhook is the pattern; it is in this recipe for a reason.' },
      { title: 'Streaming UX is table stakes', note: 'Token-by-token rendering, cancel buttons, retry-on-rate-limit. Users compare you to ChatGPT\'s polish for free.' },
    ],
  },

  blank: {
    label: 'Blank Canvas', icon: 'flask', size: 'M',
    blurb: 'No archetype. Pick every ingredient yourself, skip what you do not need.',
    categories: ['hosting', 'database', 'auth', 'storage', 'cdn', 'realtime', 'queue', 'email', 'search', 'cms', 'payments', 'analytics', 'monitoring', 'aiApi'],
    defaults: {},
    challenges: [
      { title: 'Every category is a decision you now own', note: 'The recipes exist because these choices repeat. Blank means you justify each one.' },
    ],
  },
};
