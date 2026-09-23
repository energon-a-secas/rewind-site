// ── Stack categories: email, search, analytics, monitoring, CMS ──
// Search/analytics/monitoring/CMS verified July 2026 via research;
// email from knowledge — verify on the linked pricing pages.

export const email = {
  key: 'email',
  label: 'Transactional Email',
  icon: 'mail',
  blurb: 'Receipts, resets, magic links. Deliverability is its own job.',
  options: {
    resend: {
      name: 'Resend', type: 'freemium', strategy: 'managed', recommended: true,
      free: '100 emails/day (~3k/mo)',
      entry: '$20/mo Pro (50k)', url: 'https://resend.com/pricing',
      gotcha: 'Developer-first DX; the daily free cap means a signup spike queues your password resets.',
      cost: { hobby: 0, launched: 20, scaling: 50 },
    },
    postmark: {
      name: 'Postmark', type: 'freemium', strategy: 'managed',
      free: '100 test emails/mo',
      entry: '$15/mo (10k emails)', url: 'https://postmarkapp.com/pricing',
      gotcha: 'Deliverability-obsessed and it shows; marketing email is explicitly banned — transactional only.',
      cost: { hobby: 0, launched: 15, scaling: 60 },
    },
    ses: {
      name: 'AWS SES', type: 'paid', strategy: 'managed',
      free: 'Effectively none worth planning around',
      entry: '$0.10 per 1,000 emails', url: 'https://aws.amazon.com/ses/pricing/',
      gotcha: '10–100× cheaper than everyone — and you assemble DKIM, bounce handling, and reputation warmup yourself.',
      cost: { hobby: 1, launched: 5, scaling: 30 },
    },
    brevo: {
      name: 'Brevo', type: 'freemium', strategy: 'managed',
      free: '300 emails/day',
      entry: '$25/mo Starter (20k)', url: 'https://www.brevo.com/pricing/',
      gotcha: 'Doubles as a newsletter tool so one bill covers both; template editor feels like 2014 because it is.',
      cost: { hobby: 0, launched: 25, scaling: 65 },
    },
    none: {
      name: 'No email', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'OAuth-only login and in-app notifications can dodge email entirely — until receipts are legally required.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const search = {
  key: 'search',
  label: 'Search',
  icon: 'search',
  blurb: 'Typo-tolerant, ranked, faceted. Postgres FTS covers more than people admit.',
  options: {
    typesense: {
      name: 'Typesense', type: 'oss', strategy: 'oss', recommended: true,
      free: 'Self-host free (GPLv3); Cloud has trial only',
      entry: 'Cloud ~$7–30/mo · or ~$5 VPS', url: 'https://cloud.typesense.org/',
      gotcha: 'HA means 3 nodes = 3× base cost, and RAM is sized to your dataset. The OSS build is the free path.',
      cost: { hobby: 5, launched: 10, scaling: 60 },
    },
    algolia: {
      name: 'Algolia', type: 'freemium', strategy: 'managed',
      free: '10k searches/mo (Build) — the only hosted search with a real free tier',
      entry: 'usage-based, ~$0.50 per 1k searches', url: 'https://www.algolia.com/pricing',
      gotcha: 'Overages bill at 1.5–2×, and search-as-you-type multiplies request counts fast.',
      cost: { hobby: 0, launched: 15, scaling: 100 },
    },
    meilisearch: {
      name: 'Meilisearch', type: 'oss', strategy: 'oss',
      free: 'Self-host free (MIT); Cloud is 14-day trial only',
      entry: 'Cloud ~$30/mo · or ~$5 VPS', url: 'https://www.meilisearch.com/pricing',
      gotcha: '"Free Meilisearch" = self-host only. Cloud starts paid — unlike Algolia there is no free ladder.',
      cost: { hobby: 5, launched: 30, scaling: 90 },
    },
    pgfts: {
      name: 'Postgres full-text search', type: 'oss', strategy: 'oss',
      free: 'Ships with your database — $0 extra',
      entry: '$0', url: 'https://www.postgresql.org/docs/current/textsearch.html',
      gotcha: 'No typo tolerance or relevance tuning, and every query burns your DB CPU. Fine to ~100k rows.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
    none: {
      name: 'No search', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Filters + a good index page beat bad search. Under ~50 items, users browse.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const analytics = {
  key: 'analytics',
  label: 'Analytics',
  icon: 'chart',
  blurb: 'Pageviews and product events. Decide early: privacy-first or full-funnel.',
  options: {
    posthog: {
      name: 'PostHog', type: 'freemium', strategy: 'managed', recommended: true,
      free: '1M events/mo + 5k replays + feature flags',
      entry: 'PAYG from ~$0.00005/event past 1M', url: 'https://posthog.com/pricing',
      gotcha: 'Each product bills separately — set per-product billing limits on day one or a retry storm invoices you.',
      cost: { hobby: 0, launched: 0, scaling: 65 },
    },
    ga4: {
      name: 'Google Analytics 4', type: 'freemium', strategy: 'managed',
      free: 'Unlimited events, $0 forever',
      entry: '$0', url: 'https://marketingplatform.google.com/about/analytics/',
      gotcha: '2–14 month retention and consent-banner homework. Free because you are the product.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
    umami: {
      name: 'Umami', type: 'freemium', strategy: 'oss',
      free: 'Cloud Hobby: 100k events/mo, 3 sites · self-host free (MIT)',
      entry: '$20/mo Pro (1M events) · or ~$5 VPS', url: 'https://umami.is/pricing',
      gotcha: 'Free Hobby tier keeps only 6 months of history. Self-host if the data matters long-term.',
      cost: { hobby: 0, launched: 5, scaling: 20 },
    },
    plausible: {
      name: 'Plausible', type: 'paid', strategy: 'managed',
      free: 'No free cloud tier (30-day trial); self-host free (AGPL)',
      entry: '$9/mo (10k pageviews)', url: 'https://plausible.io/pricing',
      gotcha: 'Price scales steeply with pageviews — $69/mo at 1M. You pay for privacy with money instead of consent banners.',
      cost: { hobby: 9, launched: 9, scaling: 69 },
    },
    cfanalytics: {
      name: 'Cloudflare Web Analytics', type: 'freemium', strategy: 'managed',
      free: 'Unlimited sites + pageviews, $0',
      entry: '$0', url: 'https://www.cloudflare.com/web-analytics/',
      gotcha: 'Pageviews only — no custom events, funnels, or users. Pairs well as the free baseline next to PostHog.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const monitoring = {
  key: 'monitoring',
  label: 'Error Tracking',
  icon: 'bell',
  blurb: 'Exceptions, uptime, logs. The thing you wish you had at 2am.',
  options: {
    sentry: {
      name: 'Sentry', type: 'freemium', strategy: 'managed', recommended: true,
      free: '5k errors/mo, 50 replays, 5 GB logs — 1 user',
      entry: '$26/mo Team (50k errors)', url: 'https://sentry.io/pricing/',
      gotcha: 'Pay-as-you-go overages explode during retry storms — set a spend cap before your first outage does.',
      cost: { hobby: 0, launched: 26, scaling: 80 },
    },
    betterstack: {
      name: 'Better Stack', type: 'freemium', strategy: 'managed',
      free: '10 monitors, 3 GB logs, 1 status page',
      entry: '~$21/mo (50 monitors)', url: 'https://betterstack.com/pricing',
      gotcha: 'Free tier alerts by email only — phone/SMS wake-ups need paid responder seats at $29 each.',
      cost: { hobby: 0, launched: 21, scaling: 60 },
    },
    uptimerobot: {
      name: 'UptimeRobot', type: 'freemium', strategy: 'managed',
      free: '50 monitors at 5-min interval — non-commercial only',
      entry: '$7/mo Solo (60-sec checks)', url: 'https://uptimerobot.com/pricing',
      gotcha: 'The famous free plan went non-commercial-only in late 2024. A business on it is a ToS violation.',
      cost: { hobby: 0, launched: 7, scaling: 15 },
    },
    grafana: {
      name: 'Grafana Cloud', type: 'freemium', strategy: 'oss',
      free: '10k metric series, 50 GB logs, 50 GB traces',
      entry: '~$19/mo + usage', url: 'https://grafana.com/pricing/',
      gotcha: 'Usage pricing spirals with label cardinality — one user_id label and the invoice has a comma.',
      cost: { hobby: 0, launched: 19, scaling: 70 },
    },
    none: {
      name: 'No monitoring', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Users are your monitoring. They will not file a ticket; they will leave.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const cms = {
  key: 'cms',
  label: 'CMS / Content',
  icon: 'doc',
  blurb: 'Who edits the words, and where they live. This decision is forever.',
  options: {
    decap: {
      name: 'Decap CMS (git-based)', type: 'oss', strategy: 'oss', recommended: true,
      free: 'Free, unlimited (MIT) — content lives in your repo',
      entry: '$0', url: 'https://decapcms.org/',
      gotcha: 'No database — every edit is a commit that triggers a rebuild. Non-technical editors will need hand-holding.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
    sanity: {
      name: 'Sanity', type: 'freemium', strategy: 'managed',
      free: '~20 seats, generous API/bandwidth allowance',
      entry: '$15/seat/mo Growth', url: 'https://www.sanity.io/pricing',
      gotcha: 'Per-seat pricing + API overages compound — a 10-editor newsroom is a real monthly line.',
      cost: { hobby: 0, launched: 15, scaling: 75 },
    },
    strapi: {
      name: 'Strapi (self-host)', type: 'oss', strategy: 'oss',
      free: 'Self-host free (MIT) — Cloud free plan killed July 2026',
      entry: 'Cloud ~$29/mo · or ~$7 VPS', url: 'https://strapi.io/pricing-cloud',
      gotcha: 'Cloud deleted free projects Sept 2026 — self-host or pay. SSO/audit logs gated behind a separate license.',
      cost: { hobby: 7, launched: 12, scaling: 40 },
    },
    payload: {
      name: 'Payload CMS (self-host)', type: 'oss', strategy: 'oss',
      free: 'Self-host free (MIT), all features',
      entry: 'Cloud ~$35/mo (signups paused)', url: 'https://payloadcms.com/cloud-pricing',
      gotcha: 'Acquired by Figma in 2025 — the MIT repo is safe, the hosted roadmap is anyone\'s guess.',
      cost: { hobby: 7, launched: 12, scaling: 40 },
    },
    contentful: {
      name: 'Contentful', type: 'freemium', strategy: 'managed',
      free: '1 space, small team, no overages allowed',
      entry: '$300/mo Lite', url: 'https://www.contentful.com/pricing/',
      gotcha: 'The $0 → $300/mo cliff with nothing in between is the most famous pricing wall in CMS.',
      cost: { hobby: 0, launched: 300, scaling: 300 },
    },
    none: {
      name: 'Hardcoded content', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Content edits are deploys. Correct for landing pages, wrong for anything with an editor.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};
