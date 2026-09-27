// ── How archived pages are framed ────────────────────────────
// Snapshots are frozen copies of old pages, and some carry sinks their live
// sites have since fixed (the archived emoji pages wrote stored names into
// innerHTML). Without allow-same-origin a framed snapshot runs in an opaque
// origin: its scripts still run, but it cannot read rewind's localStorage,
// cookies or IndexedDB (browser captures), reach parent.document, or strip
// its own sandbox attribute. The stage (render.js) and the full-size viewer
// (view.js) both frame with these values; neither loads a snapshot top-level.
//
// Never add allow-same-origin. Never add allow-popups-to-escape-sandbox
// either: a popup that opens the same snapshot URL would then run
// unsandboxed on rewind's origin. The cost is that a new tab opened from a
// snapshot inherits the sandbox, so a live site opened that way loses its
// storage and breaks (CLAUDE.md, Gotchas).
export const FRAME_SANDBOX = 'allow-scripts allow-popups allow-forms';

// The frame is cross-origin to rewind, so features whose permissions policy
// defaults to 'self' are off unless delegated. Copy buttons and fullscreen are
// what archived pages use, and neither reads anything back from rewind.
// fullscreen needs the * allowlist: Firefox does not match the default 'src'
// against the frame's opaque origin and leaves fullscreen off, and there the
// allow attribute overrides allowfullscreen. Chromium accepts either form.
export const FRAME_ALLOW = 'clipboard-write; fullscreen *';
