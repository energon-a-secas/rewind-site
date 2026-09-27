// ── Full-size snapshot viewer (view.html) ────────────────────
// Open ↗ lands here with #<snapshot id>. Only ids in the committed manifest
// are shown, and always inside the stage's sandbox (js/frame.js): loaded
// top-level instead, the snapshot would run on rewind's own origin.

import { loadManifest } from './data.js';
import { FRAME_SANDBOX, FRAME_ALLOW } from './frame.js';
import { fmtDate } from './utils.js';

const SNAP_PATH = /^snapshots\/[\w.-]+\/[\w.-]+\/index\.html$/;

function wantedId() {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return '';
  }
}

function show(manifest) {
  const id = wantedId();
  const label = document.getElementById('viewLabel');
  const stage = document.getElementById('viewStage');
  const snap = manifest && manifest.snapshots.find((s) => s.id === id);
  stage.replaceChildren();
  if (!snap || !SNAP_PATH.test(snap.path)) {
    label.textContent = id ? `No archived snapshot is called "${id}".` : 'No snapshot chosen.';
    return;
  }
  const info = manifest.sites[snap.site] || {};
  const tag = snap.source === 'git' ? snap.commit : snap.source;
  label.textContent = `${info.title || snap.site} · ${fmtDate(snap.date)} · ${tag}`;
  document.title = `${info.title || snap.site}, ${fmtDate(snap.date)} | Rewind`;
  document.getElementById('viewBack').href = `./#${snap.id}`;

  // Attributes before src, so the first load is already sandboxed.
  const frame = document.createElement('iframe');
  frame.className = 'rw-view-frame';
  frame.title = `Snapshot ${snap.id}`;
  frame.setAttribute('sandbox', FRAME_SANDBOX);
  frame.setAttribute('allow', FRAME_ALLOW);
  frame.allowFullscreen = true;
  frame.src = snap.path;
  stage.append(frame);
}

async function init() {
  const manifest = await loadManifest();
  show(manifest);
  window.addEventListener('hashchange', () => show(manifest));
}

init();
