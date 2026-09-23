// ── Stack categories: storage & CDN ──────────────────────────
// Researched July 2026 (partially from knowledge — agent research
// cut short). Verify on the linked pricing pages before committing.

export const storage = {
  key: 'storage',
  label: 'File Storage',
  icon: 'archive',
  blurb: 'Images, uploads, backups. Egress fees are the silent killer.',
  options: {
    r2: {
      name: 'Cloudflare R2', type: 'freemium', strategy: 'managed', recommended: true,
      free: '10 GB storage, generous free operations/mo',
      entry: '$0.015/GB-mo — ZERO egress fees', url: 'https://developers.cloudflare.com/r2/pricing/',
      gotcha: 'Class A/B operation pricing means list-heavy apps pay for chatter, not bytes. S3-compatible API.',
      cost: { hobby: 0, launched: 3, scaling: 20 },
    },
    s3: {
      name: 'AWS S3', type: 'freemium', strategy: 'managed',
      free: '5 GB for 12 months (new accounts)',
      entry: '$0.023/GB-mo + egress', url: 'https://aws.amazon.com/s3/pricing/',
      gotcha: 'The storage is cheap; the egress is the bill. Serving 1 TB of images costs ~$90 in transfer alone.',
      cost: { hobby: 0, launched: 5, scaling: 60 },
    },
    b2: {
      name: 'Backblaze B2', type: 'freemium', strategy: 'managed',
      free: '10 GB storage free',
      entry: '$0.006/GB-mo, egress free up to 3× storage', url: 'https://www.backblaze.com/cloud-storage/pricing',
      gotcha: 'Cheapest honest storage; pair with Cloudflare in front for free egress beyond the 3× allowance.',
      cost: { hobby: 0, launched: 3, scaling: 15 },
    },
    cloudinary: {
      name: 'Cloudinary', type: 'freemium', strategy: 'managed',
      free: '~25 credits/mo (storage + transformations + bandwidth)',
      entry: '$99/mo Plus', url: 'https://cloudinary.com/pricing',
      gotcha: 'The jump from free to $99 is a cliff — the image pipeline is magic until the invoice arrives.',
      cost: { hobby: 0, launched: 99, scaling: 250 },
    },
    minio: {
      name: 'MinIO (self-host)', type: 'oss', strategy: 'oss',
      free: 'Open source (AGPL) — you pay for the box + disk',
      entry: '~$5–8 VPS', url: 'https://min.io/',
      gotcha: 'S3-compatible and solid, but you own redundancy — one dying disk is a data-loss ticket.',
      cost: { hobby: 6, launched: 10, scaling: 40 },
    },
    none: {
      name: 'No file storage', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'No user uploads. Ships more recipes than people admit — avatars can wait.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const cdn = {
  key: 'cdn',
  label: 'CDN / Proxy',
  icon: 'globe',
  blurb: 'Edge caching, DDoS shield, TLS. Cloudflare rewrote this market.',
  options: {
    cloudflare: {
      name: 'Cloudflare', type: 'freemium', strategy: 'managed', recommended: true,
      free: 'Unlimited bandwidth CDN + DDoS protection + SSL — free plan',
      entry: '$20/mo Pro', url: 'https://www.cloudflare.com/plans/',
      gotcha: 'The free plan is genuinely absurd value; the paid features (WAF rules, image resizing) are the hook.',
      cost: { hobby: 0, launched: 0, scaling: 20 },
    },
    bunny: {
      name: 'Bunny CDN', type: 'paid', strategy: 'managed',
      free: 'No free tier — $1/mo minimum',
      entry: '~$0.01/GB (EU/NA)', url: 'https://bunny.net/pricing/',
      gotcha: 'Famous $0.01/GB pricing; storage + optimizer are add-ons that sneak onto the bill.',
      cost: { hobby: 1, launched: 5, scaling: 30 },
    },
    cloudfront: {
      name: 'AWS CloudFront', type: 'freemium', strategy: 'managed',
      free: '1 TB/mo for 12 months (new accounts)',
      entry: '~$0.085/GB (US) after free tier', url: 'https://aws.amazon.com/cloudfront/pricing/',
      gotcha: 'Per-region pricing means global traffic bills differently; deep AWS lock-in on certs and origins.',
      cost: { hobby: 0, launched: 10, scaling: 80 },
    },
    fastly: {
      name: 'Fastly', type: 'paid', strategy: 'managed',
      free: 'Trial credit only',
      entry: '~$50/mo minimum spend', url: 'https://www.fastly.com/pricing/',
      gotcha: 'Real-time purging is the best in class; the minimum spend keeps hobbyists out.',
      cost: { hobby: 50, launched: 50, scaling: 120 },
    },
    none: {
      name: 'No CDN', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Origin serves everything — fine for local audiences, painful across oceans.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};
