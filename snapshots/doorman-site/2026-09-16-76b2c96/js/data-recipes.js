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
  hobby:    { label: 'Hobby',    note: 'Side project: free tiers should carry you.' },
  launched: { label: 'Launched', note: 'Real users: entry paid plans, no free-tier pauses.' },
  scaling:  { label: 'Scaling',  note: 'Growth: ~10× launched traffic, bills get real.' },
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
    cons: ['State + DOM get painful past ~1k lines', 'No component reuse: copy/paste creeps in'],
  },
  tailwind: {
    label: 'Vanilla + Tailwind',
    chip: 'Utility CSS',
    tokenFactor: 1.0,
    blurb: 'Same files, faster styling. AI writes Tailwind fluently.',
    pros: ['Styling speed without a framework', 'Still hosts anywhere static', 'AI models know Tailwind cold'],
    cons: ['CDN play-build is dev-only: use the CLI for prod', 'Class soup without discipline'],
  },
  framework: {
    label: 'Framework (Next/SvelteKit/Vue)',
    chip: 'Full structure',
    tokenFactor: 1.5,
    blurb: 'Components, routing, ecosystem. The default if it will grow.',
    pros: ['Component model + routing built in', 'Ecosystem for every problem', 'SSR/SEO options when you need them'],
    cons: ['Build step + Node hosting for SSR', '~1.5× the AI tokens to generate', 'Upgrade treadmill never stops'],
  },
  nocode: {
    label: 'No-code UI (Airtable Interfaces / Softr)',
    chip: 'No code at all',
    tokenFactor: 0.25,
    blurb: 'The tool that holds your data also draws the screens. Nothing to generate.',
    pros: ['Live the afternoon you start: no repo, no deploy', 'Non-developers can edit the app itself', 'Tokens go to formulas and automations, not UI'],
    cons: ['No git: no diff, no staging, no rollback', 'Priced per editor: the app gets pricier as the team grows, not as traffic does', 'The ceiling arrives without warning, and the rewrite starts from zero'],
  },
};

/**
 * Recipes. size drives the AI-build token estimate (see data-models.js):
 *   S  — a few pages, one data model
 *   M  — real CRUD + auth + one integration
 *   L  — multiple roles or a second hard subsystem
 *   XL — marketplace-class: two-sided, payments + search + ops
 * budget: true groups the recipe under "Almost free" in the picker:
 * the archetypes whose whole bill is a domain (or nothing).
 */
export const RECIPES = {
  saas: {
    label: 'SaaS Dashboard', icon: 'gauge', size: 'M',
    blurb: 'Login, a data model, a settings page, a bill. The B2B classic.',
    categories: ['hosting', 'database', 'auth', 'email', 'payments', 'analytics', 'monitoring'],
    defaults: { hosting: 'vercel', database: 'neon', auth: 'clerk', email: 'resend', payments: 'stripe', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'Auth is a subscription, not a feature', note: 'Per-MAU pricing means your user table has a meter on it. Clerk/Auth0 get expensive exactly when you succeed, budget the 10k-MAU cliff.' },
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
      { title: 'Moderation arrives uninvited', note: 'Report queues, blocks, CSAM scanning obligations. Not optional once real humans show up, plan the tooling before you need it.' },
      { title: 'Notifications are a second app', note: 'In-app, email, push: each with preferences, rate limits, and unsubscribe law.' },
    ],
  },

  ecommerce: {
    label: 'E-commerce Store', icon: 'cart', size: 'L',
    blurb: 'Catalog, cart, checkout, orders. Money touches everything.',
    categories: ['hosting', 'database', 'storage', 'cdn', 'search', 'payments', 'email', 'analytics'],
    defaults: { hosting: 'vercel', database: 'supabase', storage: 'r2', cdn: 'cloudflare', search: 'typesense', payments: 'stripe', email: 'resend', analytics: 'ga4' },
    challenges: [
      { title: 'Payments compliance picks your processor', note: 'Merchant-of-record services (Paddle, Lemon Squeezy) eat tax/VAT for a bigger cut. Stripe is cheaper but tax is your problem.' },
      { title: 'Inventory consistency under race conditions', note: 'Two buyers, one item. Overselling is a support ticket with a refund attached, reserve stock at cart, commit at payment.' },
      { title: 'Product images are 80% of your bandwidth', note: 'An image pipeline (resize, WebP/AVIF, lazy) is not polish. It IS the page weight.' },
      { title: 'Search makes or breaks the catalog', note: 'Past ~50 SKUs, users search instead of browse. Typos, synonyms, facets, Postgres FTS works until it does not.' },
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
      { title: 'Your COGS is someone else\'s pricing page', note: 'Model prices drop ~10× a year: great, but your free tier users can still burn $50 of tokens in an afternoon. Budget caps or death.' },
      { title: 'Thin wrappers decay fast', note: 'If the value is one prompt, the platform ships it next quarter. The moat is workflow, data, or distribution, pick one.' },
      { title: 'Long generations need job infrastructure', note: 'Serverless timeouts kill 2-minute generations. Queue + polling/webhook is the pattern; it is in this recipe for a reason.' },
      { title: 'Streaming UX is table stakes', note: 'Token-by-token rendering, cancel buttons, retry-on-rate-limit. Users compare you to ChatGPT\'s polish for free.' },
    ],
  },

  internal: {
    label: 'Internal Tool / Back Office', icon: 'wrench', size: 'M',
    blurb: 'A tool for your own staff. No signup, no pricing page, no payments. It replaces a spreadsheet.',
    categories: ['hosting', 'database', 'auth', 'storage', 'email', 'analytics', 'monitoring'],
    defaults: { hosting: 'cfpages', database: 'neon', auth: 'clerk', storage: 'r2', email: 'resend', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'The MAU meter runs backwards here', note: '40 employees will never approach Clerk\'s 10k free users, so auth is effectively free. What costs money is SSO/SAML against the company directory, and every auth vendor puts exactly that in an enterprise tier. Ask IT whether Google/Microsoft OAuth is acceptable before you budget.' },
      { title: 'You are replacing a spreadsheet that fights back', note: 'The real spec is hidden in someone\'s tabs, formulas and colour conventions. Budget the extraction interview and the weeks of running both in parallel. That, not the CRUD, is the project.' },
      { title: 'No customers means no urgency means no owner', note: 'Nobody is paged when an internal tool breaks; people quietly go back to the spreadsheet and you find out a quarter later. Name an owner and one alert that reaches a human, or plan on rebuilding it in two years.' },
      { title: 'Permissions come from the org chart, not the schema', note: 'Who sees salaries, customer names, other teams\' rows. Role checks retrofitted onto a tool that already has readers is the same 2am migration as multi-tenancy, minus the revenue that would justify it.' },
    ],
  },

  docsbot: {
    label: 'Support / Docs Chatbot', icon: 'lifebuoy', size: 'M',
    blurb: 'Answers questions over your own handbook or docs. No paywall. It saves staff time instead of selling seats.',
    categories: ['hosting', 'database', 'auth', 'aiApi', 'queue', 'search', 'analytics', 'monitoring'],
    defaults: { hosting: 'cfpages', database: 'convex', auth: 'clerk', aiApi: 'anthropic', queue: 'bundled', search: 'none', analytics: 'umami', monitoring: 'sentry' },
    challenges: [
      { title: 'Retrieval is the product; the model is a commodity', note: 'Answer quality is decided by chunking, embeddings and ranking, swapping models moves it far less than fixing retrieval. The search row says skip because the vector index belongs inside the database you already pay for, not in a second service.' },
      { title: 'The bot makes your stale docs visible', note: 'It will restate the 2023 expenses policy with total confidence, and someone will act on it. Re-ingest on change, show the source next to every answer, and give the docs an owner, otherwise you shipped a machine that launders wrong information.' },
      { title: 'Ingestion is a job, not a request', note: 'Crawling and embedding a wiki blows past every serverless timeout. That is why this recipe carries a queue, bundled into the backend here, a separate bill if you unbundle it.' },
      { title: 'No paywall means no natural spend cap', note: 'Nothing throttles staff asking 200 questions a day, and there is no revenue line to compare the bill against. Per-user daily caps, a cheap model for retrieval and reranking, and the frontier model only for the final answer.' },
    ],
  },

  airtable: {
    label: 'Airtable Base + Interfaces', icon: 'grid', size: 'S', budget: true,
    blurb: 'The base is the backend and Interfaces are the frontend. Live this afternoon, and you write almost no code.',
    categories: ['database', 'storage', 'cms', 'auth', 'email'],
    defaults: { database: 'airtable', storage: 'bundled', cms: 'bundled', auth: 'bundled', email: 'none' },
    challenges: [
      { title: 'It is priced by headcount, not by usage', note: 'The free base stops at 1,000 records; the paid plan bills every editor seat. Cost tracks how many colleagues touch it, so confirm which viewer/commenter roles are free before you promise the whole company access.' },
      { title: 'No git means no staging and no revert', note: 'You edit the live base. Rename a field and every automation and interface referencing it breaks instantly, with no diff to read and nothing to roll back. Duplicating the base is your entire backup strategy, schedule it.' },
      { title: '5 requests/sec per base is the real ceiling', note: 'The moment anything public reads from the base, you need a cache in front of it. That cache is a backend, which means the no-code recipe has quietly become a different recipe.' },
      { title: 'The escape hatch is the plan, not the fallback', note: 'Exporting rows is trivial; exporting logic, formulas, automations, interface layouts, is a rewrite from zero. Decide now which signal (record count, editors, an unbuildable feature) triggers the migration, while it is still cheap to leave.' },
    ],
  },

  glue: {
    label: 'Airtable + App Backend (glue stack)', icon: 'plug', size: 'M',
    blurb: 'The team keeps editing in Airtable; a real backend serves the product. Netlify out front, a Worker in between.',
    categories: ['hosting', 'database', 'cms', 'auth', 'storage', 'cdn', 'queue', 'email', 'analytics', 'monitoring'],
    defaults: { hosting: 'netlify', database: 'convex', cms: 'airtable', auth: 'clerk', storage: 'r2', cdn: 'cloudflare', queue: 'bundled', email: 'resend', analytics: 'posthog', monitoring: 'sentry' },
    challenges: [
      { title: 'Two sources of truth is one too many', note: 'Decide the direction once and write it down: Airtable is where humans edit, the app database is a read model, and the sync is one-way and rebuildable from scratch. Bi-directional sync means conflict resolution you cannot test and cannot explain to the person whose edit vanished.' },
      { title: 'Three runtimes, one business rule', note: 'Netlify Functions, the Cloudflare Worker and the backend\'s own functions can all hold the logic, so it ends up in all three and drifts. Give rules exactly one home and let the Worker do nothing but translate webhooks.' },
      { title: 'Webhooks arrive twice, out of order, or never', note: 'Every sync mutation must be idempotent on the record ID, and you need a full-resync command for the morning you notice it silently stopped three days ago. Log what came in; a sync with no audit trail is unfixable.' },
      { title: 'Netlify behind Cloudflare bills you twice', note: 'You pay Netlify bandwidth for requests Cloudflare already cached, and you now own two cache-invalidation stories that disagree. Either host on Cloudflare Pages or drop the proxy. A CDN in front of a CDN is a bill, not an optimisation.' },
    ],
  },

  staticspa: {
    label: 'Static SPA on GitHub Pages', icon: 'globe', size: 'S', budget: true,
    blurb: 'One repo, no backend, $0 at every tier. Open source, or shared with a handful of people.',
    categories: ['hosting', 'database', 'storage', 'analytics'],
    defaults: { hosting: 'ghPages', database: 'none', storage: 'none', analytics: 'cfanalytics' },
    challenges: [
      { title: '"Privately shared" is not a GitHub Pages feature', note: 'Publishing Pages from a private repo needs GitHub Enterprise Cloud; on Free/Pro/Team the site is public even when the code is not. An unguessable URL is obscurity, not access control, put Cloudflare Access in front, or keep it local and share the repo instead.' },
      { title: 'No server means no secrets', note: 'Every key in the bundle is one view-source away, and scrapers find published keys in hours. If the app needs a key, it needs a proxy, and the day you add a Worker, this stops being the zero-cost recipe.' },
      { title: 'State lives in exactly one browser', note: 'localStorage does not sync, does not back up, and dies with the profile. The URL hash is your export format and your share button. "Can the team see my list?" is a different recipe with a database in it.' },
      { title: 'Open source is a support surface', note: 'With no LICENSE file nobody may legally use it, and with one you inherit issues and PRs forever. Pick MIT or Apache-2.0 on day one and write the README that answers the three questions everyone will open an issue about.' },
    ],
  },

  freestack: {
    label: 'Free-Stack App (Pages + Convex)', icon: 'bolt', size: 'S', budget: true,
    blurb: 'Static frontend on GitHub Pages, Convex free tier as the real backend. The domain is the only bill.',
    categories: ['hosting', 'database', 'auth', 'domains', 'analytics'],
    defaults: { hosting: 'ghPages', database: 'convex', auth: 'clerk', domains: 'porkbun', analytics: 'cfanalytics' },
    challenges: [
      { title: 'The seam is the feature', note: 'Pages serves files, Convex serves functions: two deploys, nothing to keep in sync at runtime. That separation is also the exit, since either half swaps out later without touching the other.' },
      { title: 'A public repo means a public client', note: 'Free GitHub Pages publishes from a public repo, so the frontend is open source and the Convex URL ships in it. That is by design, but it moves all access control into your Convex functions: every one must check identity, because an unchecked function on a public URL is an open API.' },
      { title: 'The meter is function calls, not users', note: 'A reactive query that re-runs on every keystroke burns the 1M free calls a chatty afternoon at a time. Let subscriptions do the work once and the free tier carries hundreds of real users.' },
      { title: 'Make the domain scriptable, then forget it', note: 'A registrar with a real DNS API turns "point the subdomain at Pages" into a script you run once per project. Buy the name before the first share: renaming later breaks every link you ever posted.' },
    ],
  },

  community: {
    label: 'Hobby Community Site', icon: 'heart', size: 'S', budget: true,
    blurb: 'A club, a guild, a running group. Double-digit members, zero budget, and it should outlive your enthusiasm.',
    categories: ['hosting', 'database', 'auth', 'storage', 'domains', 'analytics'],
    defaults: { hosting: 'cfpages', database: 'convex', auth: 'clerk', storage: 'bundled', domains: 'porkbun', analytics: 'cfanalytics' },
    challenges: [
      { title: 'Free tiers are not the constraint, your attention is', note: 'Forty members will never trouble a meter. What kills club sites is maintenance: pick boring pieces, write the one deploy command in the README, and give a second member admin access before you need to.' },
      { title: 'Do not build the login the club already has', note: 'If the community lives in Discord or WhatsApp, the site is the public window and the archive, not a second chat. Link out for conversation; every feature you skip is a feature you never moderate.' },
      { title: 'Moderation-lite still wants an audit trail', note: 'It is all people you know, until the falling-out. A one-table log of who changed what turns drama into a lookup instead of a memory contest.' },
      { title: 'Plan the handover, not the scale', note: 'The site should survive your interest in it. Keep a one-command data export, register the domain in the club\'s name, and write down where the DNS lives: the successor should inherit a repo, not a scavenger hunt.' },
    ],
  },

  airtablestatic: {
    label: 'Airtable + Static Snapshot', icon: 'camera', size: 'S', budget: true,
    blurb: 'The team edits in Airtable; visitors read a JSON snapshot committed to the repo. No server, no rate limit, $0.',
    categories: ['hosting', 'cms', 'domains', 'analytics'],
    defaults: { hosting: 'ghPages', cms: 'airtable', domains: 'platformsub', analytics: 'cfanalytics' },
    challenges: [
      { title: 'The cache is a commit, not a server', note: 'A scheduled GitHub Action pulls the base into data.json and commits it. Visitors never touch the Airtable API, so the 5 req/s cap stops mattering: the cron is the only caller it ever sees.' },
      { title: 'Staleness is the publish button', note: 'The sync interval is your editorial workflow, and hourly is plenty for a directory. Add workflow_dispatch so launch day gets a "publish now" button instead of a tighter cron you forget to relax.' },
      { title: 'The token lives in Actions secrets, never in the page', note: 'The repo and the bundle are public; the Airtable token exists only inside the workflow. The day someone wants the page to write back is the day this quietly becomes the glue-stack recipe, with a Worker and a real bill.' },
      { title: 'The free base is 1,000 records, and the snapshot is your exit', note: 'When the base fills up or the seats get expensive, the last committed data.json IS the migration file. You are never more than one commit away from leaving, which is more than most stacks can say.' },
    ],
  },

  blank: {
    label: 'Blank Canvas', icon: 'flask', size: 'M',
    blurb: 'No archetype. Pick every ingredient yourself, skip what you do not need.',
    categories: ['hosting', 'database', 'auth', 'storage', 'cdn', 'domains', 'realtime', 'queue', 'email', 'search', 'cms', 'payments', 'analytics', 'monitoring', 'aiApi'],
    defaults: {},
    challenges: [
      { title: 'Every category is a decision you now own', note: 'The recipes exist because these choices repeat. Blank means you justify each one.' },
    ],
  },
};
