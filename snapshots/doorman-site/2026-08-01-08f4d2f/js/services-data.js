// ── Stack categories: data layer ─────────────────────────────
// Researched July 2026 — verify on the linked pricing pages.
//
// Option shape:
//   name      display name
//   type      'oss' | 'freemium' | 'paid' | 'revshare'  (badge)
//   strategy  'oss' | 'managed'  — which quick-swap strategy claims it
//   free      free-tier summary, concrete limits ('' if none)
//   entry     entry paid price, display string
//   url       pricing page
//   gotcha    the one thing that bites people
//   cost      { hobby, launched, scaling } — editorial $/mo estimates
//   bundles   optional: category keys this pick absorbs (BaaS effect)
//   recommended  the balanced-default pick (one per category)

export const database = {
  key: 'database',
  label: 'Database',
  icon: 'database',
  blurb: 'Where the data lives. BaaS picks here absorb auth + storage + realtime.',
  options: {
    neon: {
      name: 'Neon (Postgres)', type: 'freemium', strategy: 'managed',
      free: '100 CU-hrs/mo compute, 0.5 GB/project, 10 projects',
      entry: 'usage-based, from ~$0', url: 'https://neon.com/pricing',
      gotcha: 'Forced scale-to-zero after 5 min idle — first request cold-starts. Databricks-owned since 2025.',
      cost: { hobby: 0, launched: 19, scaling: 69 },
    },
    supabase: {
      name: 'Supabase', type: 'freemium', strategy: 'managed',
      free: '500 MB DB + auth + 1 GB files + realtime, 2 projects',
      entry: '$25/mo Pro', url: 'https://supabase.com/pricing',
      gotcha: 'Free projects pause after 7 days inactivity — DB, auth and realtime all go down together.',
      bundles: ['auth', 'storage', 'realtime'],
      cost: { hobby: 0, launched: 25, scaling: 125 },
    },
    firebase: {
      name: 'Firebase (Firestore)', type: 'freemium', strategy: 'managed',
      free: '1 GB storage, 50k reads + 20k writes per DAY, auth 50k MAU, hosting 10 GB',
      entry: 'Blaze pay-as-you-go', url: 'https://firebase.google.com/pricing',
      gotcha: 'Spark hits hard daily caps (app just stops); Blaze has no spend cap — runaway loops = bill shock.',
      bundles: ['auth', 'storage', 'realtime'],
      cost: { hobby: 0, launched: 10, scaling: 120 },
    },
    convex: {
      name: 'Convex', type: 'freemium', strategy: 'managed', recommended: true,
      free: '1M function calls/mo, 1 GB DB, 1 GB files — DB + backend functions + realtime + cron in one',
      entry: '$25/dev/mo Professional', url: 'https://convex.dev/pricing',
      gotcha: 'Per-seat pricing — a 5-person team pays $125/mo regardless of traffic. Functions are the only runtime.',
      bundles: ['realtime', 'queue'],
      cost: { hobby: 0, launched: 25, scaling: 125 },
    },
    turso: {
      name: 'Turso (SQLite/libSQL)', type: 'freemium', strategy: 'managed',
      free: '~9 GB total, 500 DBs, ~1B row reads/mo',
      entry: '$4.99/mo Developer', url: 'https://turso.tech/pricing',
      gotcha: 'Exact free limits are fuzzy mid-migration to the new engine — verify before committing.',
      cost: { hobby: 0, launched: 5, scaling: 30 },
    },
    mongo: {
      name: 'MongoDB Atlas', type: 'freemium', strategy: 'managed',
      free: 'M0: 512 MB, ~100 ops/sec, shared',
      entry: 'Flex ~$8/mo (capped $30)', url: 'https://mongodb.com/pricing',
      gotcha: 'M0 has NO managed backups and auto-pauses after 30 days idle. Serverless tier was retired Jan 2026.',
      cost: { hobby: 0, launched: 9, scaling: 60 },
    },
    dynamodb: {
      name: 'DynamoDB', type: 'freemium', strategy: 'managed',
      free: '25 GB + 25 RCU/WCU — always-free, not 12-month',
      entry: 'on-demand, $0 min', url: 'https://aws.amazon.com/dynamodb/pricing/',
      gotcha: 'Free tier only applies to provisioned-capacity tables; scans and egress burn through it silently.',
      cost: { hobby: 0, launched: 8, scaling: 80 },
    },
    pocketbase: {
      name: 'PocketBase', type: 'oss', strategy: 'oss',
      free: 'Entire backend free — single Go binary + SQLite',
      entry: '$0 + ~$5 VPS', url: 'https://pocketbase.io/',
      gotcha: 'Single-node SQLite only — no replication, no horizontal scale. Backups are your cron job.',
      bundles: ['auth', 'storage', 'realtime'],
      cost: { hobby: 5, launched: 5, scaling: 12 },
    },
    vpsPg: {
      name: 'Self-host Postgres (VPS)', type: 'oss', strategy: 'oss',
      free: 'Postgres is free — you pay for the box',
      entry: '~$4–6 VPS (Hetzner/DO)', url: 'https://www.hetzner.com/cloud/',
      gotcha: 'You own backups, HA, patching, and the 3am pages. Snapshot backups cost extra.',
      cost: { hobby: 5, launched: 9, scaling: 40 },
    },
    none: {
      name: 'No database', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Static/read-only data shipped as JSON with the frontend. Fine until data changes.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const realtime = {
  key: 'realtime',
  label: 'Realtime',
  icon: 'bolt',
  blurb: 'Websockets, presence, live updates. Fan-out billing is the trap.',
  options: {
    partykit: {
      name: 'PartyKit / CF Durable Objects', type: 'freemium', strategy: 'managed', recommended: true,
      free: '100k requests/day, generous DO duration on free Workers',
      entry: '$5/mo Workers Paid', url: 'https://developers.cloudflare.com/durable-objects/platform/pricing/',
      gotcha: 'WebSocket messages bill 20:1 as requests; enable hibernation or idle connections burn duration.',
      cost: { hobby: 0, launched: 5, scaling: 30 },
    },
    ably: {
      name: 'Ably', type: 'freemium', strategy: 'managed',
      free: '6M messages/mo, 200 concurrent connections',
      entry: '$29/mo Standard', url: 'https://ably.com/pricing',
      gotcha: 'Fan-out billing: 1 publish to 100 subscribers = 101 messages. The #1 bill-shock cause in chat.',
      cost: { hobby: 0, launched: 29, scaling: 99 },
    },
    pusher: {
      name: 'Pusher Channels', type: 'freemium', strategy: 'managed',
      free: '100 concurrent connections, 200k messages/day',
      entry: '$49/mo Startup', url: 'https://pusher.com/channels/pricing',
      gotcha: 'Hard caps — connections are refused at the limit, no overage option.',
      cost: { hobby: 0, launched: 49, scaling: 119 },
    },
    socketio: {
      name: 'Socket.IO (self-host)', type: 'oss', strategy: 'oss',
      free: 'Library is MIT — you pay for the server',
      entry: '~$5 VPS or existing backend', url: 'https://socket.io/',
      gotcha: 'Sticky sessions + Redis adapter required the moment you run a second node.',
      cost: { hobby: 5, launched: 9, scaling: 40 },
    },
    none: {
      name: 'No realtime', type: 'none', strategy: null,
      free: '', entry: '$0', url: '',
      gotcha: 'Polling every 30s covers more use cases than people admit.',
      cost: { hobby: 0, launched: 0, scaling: 0 },
    },
  },
};

export const aiApi = {
  key: 'aiApi',
  label: 'AI Model API',
  icon: 'cpu',
  blurb: 'The model behind the feature. Usage-based — your COGS lives here.',
  options: {
    anthropic: {
      name: 'Anthropic (Claude)', type: 'paid', strategy: 'managed', recommended: true,
      free: 'No free tier — $5 credit gets you started',
      entry: 'usage-based, per Mtok', url: 'https://www.anthropic.com/pricing',
      gotcha: 'Best-in-class reasoning costs best-in-class prices — route cheap tasks to Haiku or watch margins die.',
      cost: { hobby: 10, launched: 50, scaling: 400 },
    },
    openai: {
      name: 'OpenAI (GPT)', type: 'paid', strategy: 'managed',
      free: 'No free tier',
      entry: 'usage-based, per Mtok', url: 'https://openai.com/api/pricing/',
      gotcha: 'The default everyone benchmarks against; batch API halves cost for non-realtime work.',
      cost: { hobby: 10, launched: 50, scaling: 400 },
    },
    gemini: {
      name: 'Google Gemini', type: 'freemium', strategy: 'managed',
      free: 'AI Studio free tier with rate limits',
      entry: 'usage-based, per Mtok', url: 'https://ai.google.dev/pricing',
      gotcha: 'Cheapest frontier-class tokens; free-tier prompts may train the model — read the data terms.',
      cost: { hobby: 0, launched: 30, scaling: 250 },
    },
    openweight: {
      name: 'Open-weight (DeepSeek/Qwen/Kimi via OpenRouter or Groq)', type: 'freemium', strategy: 'oss',
      free: 'Groq/OpenRouter free tiers; models are downloadable',
      entry: 'usage-based, ~5–10× cheaper than frontier', url: 'https://openrouter.ai/models',
      gotcha: 'Quality gap is real on long reasoning chains; self-hosting means GPU bills instead of token bills.',
      cost: { hobby: 0, launched: 10, scaling: 100 },
    },
  },
};
