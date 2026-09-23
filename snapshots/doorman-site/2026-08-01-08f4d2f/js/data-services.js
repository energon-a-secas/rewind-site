// ── All stack categories, in display order ───────────────────
// Aggregator — category data lives in services-*.js by domain.

import { hosting, queue } from './services-hosting.js';
import { database, realtime, aiApi } from './services-data.js';
import { storage, cdn } from './services-edge.js';
import { auth, payments } from './services-identity.js';
import { email, search, analytics, monitoring, cms } from './services-ops.js';

export const CATEGORIES = {
  hosting, database, auth, storage, cdn, realtime, queue,
  email, search, cms, payments, analytics, monitoring, aiApi,
};

export const TYPE_META = {
  oss:      { badge: 'Open source', cls: 'badge--oss' },
  freemium: { badge: 'Freemium',    cls: 'badge--freemium' },
  paid:     { badge: 'Paid',        cls: 'badge--paid' },
  revshare: { badge: 'Rev-share',   cls: 'badge--revshare' },
  none:     { badge: 'Skip',        cls: 'badge--oss' },
};

/** The sentinel used when a category is absorbed by a BaaS pick. */
export const BUNDLED = 'bundled';
