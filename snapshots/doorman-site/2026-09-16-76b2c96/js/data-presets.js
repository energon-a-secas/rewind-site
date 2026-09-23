// ── Copy-a-real-site presets ─────────────────────────────────
// The cookbook's party trick: name a site everyone knows, land on
// the recipe it probably runs on, with picks tweaked to match.
//
// Preset shape:
//   label    the product name people recognise
//   recipe   RECIPES key applied first
//   picks    optional overrides applied after the recipe defaults
//            (same bypass-setPick semantics as recipe defaults)
//   frontend optional FRONTENDS override
//   wontGet  the honest line: what the copy does not buy you.
//            Shown in the glance panel until the next recipe change.

export const PRESETS = {
  airbnb: {
    label: 'Airbnb', recipe: 'marketplace',
    wontGet: 'The software is the cheap half. Supply, trust and insurance are the moat, and they took a decade.',
  },
  substack: {
    label: 'Substack', recipe: 'content',
    picks: { email: 'brevo', cms: 'decap' },
    wontGet: 'Deliverability reputation and the recommendation network are the product, not the editor. Paid posts also mean adding the payments ingredient.',
  },
  discord: {
    label: 'Discord', recipe: 'chat',
    wontGet: 'Voice infrastructure and moderation tooling at scale are each their own company.',
  },
  notion: {
    label: 'Notion', recipe: 'saas',
    frontend: 'framework',
    wontGet: 'The block editor is a multi-year engineering project. The workspace shell around it is the easy 10%.',
  },
  linktree: {
    label: 'Linktree', recipe: 'staticspa',
    wontGet: 'Nothing. This one you can actually finish by Friday.',
  },
  producthunt: {
    label: 'Product Hunt', recipe: 'social',
    wontGet: 'The community is the product; the feed is a weekend. Cold-starting the crowd is the real build.',
  },
  gumroad: {
    label: 'Gumroad', recipe: 'ecommerce',
    picks: { payments: 'lemonsqueezy' },
    wontGet: 'The checkout is easy. Fraud ops, chargebacks and payout edge cases are the decade of work.',
  },
  strava: {
    label: 'Strava', recipe: 'mobile',
    wontGet: 'GPS processing, segments and the social graph outweigh the app: the backend is the product.',
  },
};
