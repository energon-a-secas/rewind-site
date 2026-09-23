// ── Stack categories: auth & payments ────────────────────────
// Researched July 2026 (partially from knowledge — agent research
// cut short). Verify on the linked pricing pages before committing.

export const auth = {
  key: 'auth',
  label: 'Auth',
  icon: 'key',
  blurb: 'Login, sessions, social OAuth. Per-MAU pricing is a meter on your user table.',
  options: {
    clerk: {
      name: 'Clerk', type: 'freemium', strategy: 'managed', recommended: true,
      free: '10k MAU free',
      entry: '$25/mo Pro + per-MAU overage', url: 'https://clerk.com/pricing',
      gotcha: 'The 10k→beyond cliff: every active user past the cap has a price tag. The DX is why people pay it.',
      cost: { hobby: 0, launched: 25, scaling: 125 },
    },
    auth0: {
      name: 'Auth0 / Okta', type: 'freemium', strategy: 'managed',
      free: '~25k MAU free (limited features)',
      entry: 'from ~$35/mo Essentials', url: 'https://auth0.com/pricing',
      gotcha: 'Enterprise features (SSO/SAML) live in enterprise tiers — B2B customers will ask for exactly those.',
      cost: { hobby: 0, launched: 35, scaling: 240 },
    },
    firebaseAuth: {
      name: 'Firebase Auth', type: 'freemium', strategy: 'managed',
      free: '50k MAU free (Spark)',
      entry: 'pay-as-you-go per MAU (Blaze)', url: 'https://firebase.google.com/pricing',
      gotcha: 'Phone/SMS auth bills per verification separately — that line item surprises everyone.',
      cost: { hobby: 0, launched: 5, scaling: 55 },
    },
    cognito: {
      name: 'AWS Cognito', type: 'freemium', strategy: 'managed',
      free: '10k MAU free (Lite tier)',
      entry: 'per-MAU past the cap', url: 'https://aws.amazon.com/cognito/pricing/',
      gotcha: 'Cheap MAUs, expensive souls: the hosted UI and error messages fight every design you have.',
      cost: { hobby: 0, launched: 15, scaling: 90 },
    },
    betterAuth: {
      name: 'better-auth / Lucia (library)', type: 'oss', strategy: 'oss',
      free: 'MIT library — runs in your app, $0 forever',
      entry: '$0', url: 'https://www.better-auth.com/',
      gotcha: 'You own password resets, email verification, session security, and every CVE. No meter, no safety net.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
    keycloak: {
      name: 'Keycloak (self-host)', type: 'oss', strategy: 'oss',
      free: 'Open source identity server — you pay for the box',
      entry: '~$9+ VPS (it is a Java app)', url: 'https://www.keycloak.org/',
      gotcha: 'Enterprise-grade SAML/OIDC for $0 — and a JVM you now feed, patch, and cluster.',
      cost: { hobby: 9, launched: 18, scaling: 60 },
    },
    none: {
      name: 'No auth', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Public read-only content, or state kept on-device (localStorage). More recipes survive this than you think.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const payments = {
  key: 'payments',
  label: 'Payments',
  icon: 'card',
  blurb: 'Taking money. Revenue-share, not monthly — the cut IS the cost.',
  options: {
    stripe: {
      name: 'Stripe', type: 'revshare', strategy: 'managed', recommended: true,
      free: 'No monthly fee',
      entry: '2.9% + $0.30 per charge', url: 'https://stripe.com/pricing',
      gotcha: 'Cheapest cut, but YOU are the merchant of record — global sales tax/VAT registration is your hobby now.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
      revshare: '2.9% + 30¢',
    },
    paddle: {
      name: 'Paddle', type: 'revshare', strategy: 'managed',
      free: 'No monthly fee',
      entry: '5% + $0.50 per charge', url: 'https://www.paddle.com/pricing',
      gotcha: 'Merchant of record — they eat global tax/VAT. The extra 2% is tax-accountant insurance.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
      revshare: '5% + 50¢ (MoR)',
    },
    lemonsqueezy: {
      name: 'Lemon Squeezy (Stripe)', type: 'revshare', strategy: 'managed',
      free: 'No monthly fee',
      entry: '5% + $0.50 per charge', url: 'https://www.lemonsqueezy.com/pricing',
      gotcha: 'Acquired by Stripe — MoR simplicity with migration-risk seasoning. Digital goods + licenses are home turf.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
      revshare: '5% + 50¢ (MoR)',
    },
    polar: {
      name: 'Polar.sh', type: 'revshare', strategy: 'oss',
      free: 'No monthly fee — open-source MoR',
      entry: '4% + $0.40 per charge', url: 'https://polar.sh/',
      gotcha: 'Cheapest merchant-of-record cut and developer-first; younger platform, thinner edge-case history.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
      revshare: '4% + 40¢ (MoR)',
    },
    none: {
      name: 'No payments', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Free product. The best business model until rent is due.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};
