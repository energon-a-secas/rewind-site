// ── Stack categories: hosting & background work ──────────────
// Researched July 2026 (partially from knowledge — agent research
// cut short). Verify on the linked pricing pages before committing.

export const hosting = {
  key: 'hosting',
  label: 'Hosting',
  icon: 'server',
  blurb: 'Where the frontend and server code run.',
  options: {
    cfpages: {
      name: 'Cloudflare Pages + Workers', type: 'freemium', strategy: 'managed', recommended: true,
      free: 'Unlimited static requests, 500 builds/mo, Workers 100k req/day',
      entry: '$5/mo Workers Paid', url: 'https://pages.cloudflare.com/',
      gotcha: 'Static is unbeatable; long-running server work needs Durable Objects or a real backend elsewhere.',
      cost: { hobby: 0, launched: 5, scaling: 25 },
    },
    vercel: {
      name: 'Vercel', type: 'freemium', strategy: 'managed',
      free: 'Hobby: generous bandwidth + serverless — non-commercial only',
      entry: '$20/mo per member Pro', url: 'https://vercel.com/pricing',
      gotcha: 'Commercial use on Hobby is against ToS — the moment you charge users, you owe $20. Bandwidth overages sting.',
      cost: { hobby: 0, launched: 20, scaling: 100 },
    },
    netlify: {
      name: 'Netlify', type: 'freemium', strategy: 'managed',
      free: '100 GB bandwidth/mo, 300 build minutes',
      entry: '$19/mo per member Pro', url: 'https://www.netlify.com/pricing/',
      gotcha: 'Bandwidth overages are billed automatically and have produced famous four-figure surprise bills.',
      cost: { hobby: 0, launched: 19, scaling: 90 },
    },
    ghPages: {
      name: 'GitHub Pages', type: 'freemium', strategy: 'managed',
      free: '100% free static hosting from a repo',
      entry: '$0', url: 'https://pages.github.com/',
      gotcha: 'Static only, no server code, soft 100 GB/mo bandwidth cap. Perfect for zero-cost recipes.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
    render: {
      name: 'Render', type: 'freemium', strategy: 'managed',
      free: 'Free web services that spin down on idle (cold starts)',
      entry: '$7/mo Starter', url: 'https://render.com/pricing',
      gotcha: 'Free instances sleep — first hit takes ~30s. Fine for demos, embarrassing for products.',
      cost: { hobby: 0, launched: 7, scaling: 50 },
    },
    railway: {
      name: 'Railway', type: 'paid', strategy: 'managed',
      free: 'No real free tier — one-time trial credit',
      entry: '$5/mo Hobby (usage credit)', url: 'https://railway.com/pricing',
      gotcha: 'Pure usage billing — real bills routinely exceed the $5 floor once anything runs 24/7.',
      cost: { hobby: 5, launched: 12, scaling: 60 },
    },
    vps: {
      name: 'VPS + Coolify/Dokploy', type: 'oss', strategy: 'oss',
      free: 'Panels are open source — you pay for the box',
      entry: '~$4–6/mo (Hetzner CX22, DO basic)', url: 'https://www.hetzner.com/cloud/',
      gotcha: 'One box = one point of failure. You own updates, backups, and the 3am disk-full page.',
      cost: { hobby: 5, launched: 9, scaling: 40 },
    },
  },
};

export const queue = {
  key: 'queue',
  label: 'Jobs / Queue',
  icon: 'clock',
  blurb: 'Background work: long generations, scheduled tasks, webhooks.',
  options: {
    inngest: {
      name: 'Inngest', type: 'freemium', strategy: 'managed', recommended: true,
      free: 'Generous free tier for event-driven functions',
      entry: 'from ~$20/mo', url: 'https://www.inngest.com/pricing',
      gotcha: 'Step-based billing rewards chatty functions less than you think — still, count steps in loops.',
      cost: { hobby: 0, launched: 20, scaling: 75 },
    },
    triggerdev: {
      name: 'Trigger.dev', type: 'freemium', strategy: 'managed',
      free: 'Free tier for long-running tasks, no timeouts',
      entry: 'from ~$10/mo', url: 'https://trigger.dev/pricing',
      gotcha: 'Long-running AI tasks are its home turf; heavy parallel runs scale the bill fast.',
      cost: { hobby: 0, launched: 10, scaling: 60 },
    },
    qstash: {
      name: 'Upstash QStash', type: 'freemium', strategy: 'managed',
      free: '500 messages/day',
      entry: 'pay-as-you-go', url: 'https://upstash.com/pricing/qstash',
      gotcha: 'HTTP-based — your endpoint must be public and idempotent; retries multiply message counts.',
      cost: { hobby: 0, launched: 5, scaling: 30 },
    },
    sqs: {
      name: 'AWS SQS + Lambda', type: 'freemium', strategy: 'managed',
      free: '1M SQS requests + 1M Lambda invocations/mo (always-free)',
      entry: '$0.40 per 1M requests', url: 'https://aws.amazon.com/sqs/pricing/',
      gotcha: 'Cheapest at scale and the most wiring — dead-letter queues and visibility timeouts are yours to configure.',
      cost: { hobby: 0, launched: 3, scaling: 25 },
    },
    bullmq: {
      name: 'BullMQ + Redis (self-host)', type: 'oss', strategy: 'oss',
      free: 'Library is MIT — you pay for Redis',
      entry: '~$5 VPS or Upstash free tier', url: 'https://docs.bullmq.io/',
      gotcha: 'You run the workers, the dashboard, and the retry policy. Great DX, real ops burden.',
      cost: { hobby: 5, launched: 5, scaling: 15 },
    },
    none: {
      name: 'No background jobs', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Everything synchronous. Hits the wall the day something takes >10s or must run at 3am.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};
