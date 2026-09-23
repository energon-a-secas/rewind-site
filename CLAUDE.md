# CLAUDE.md: Rewind

Rewind: design-history archive: capture.py extracts snapshots from each project's git history or mirrors the live page, headless-Chrome screenshots feed a filmstrip timeline, every snapshot replays as a working page in the stage with era compare; in-browser capture to IndexedDB with export/adopt loop (rewind.neorgon.com)

Captured pages are analytics-stripped: `sanitize_html()` in `tools/capture.py` removes
Google Analytics, Plausible, GoatCounter and Cloudflare beacons from every snapshot (git
and live) and sets the header kit's `neo-analytics: off` meta, so an archived page served
under rewind.neorgon.com does not fire live tracking. Existing snapshots captured before
2026-08-21 predate this and keep their original beacons; they are dated records.

**Live:** rewind.neorgon.com · **Port:** 8862

## Run

```bash
make serve
```

Then open http://localhost:8862. It must be served over HTTP. The app is ES modules, and `file://` blocks them.

## Filling the archive

```bash
make capture     # live-capture the fleet, recording only pages that changed
make backfill    # git history for every live site, capped per site
make shots       # screenshot every snapshot that has none
make test        # the capture.py checks
```

`make capture` is the one to schedule. `--if-changed` compares the new page byte
for byte against the site's newest snapshot and records nothing when they match,
so a repeat run costs bandwidth and nothing else.

Until 2026-09-23 the archive held 33 snapshots of neorgon-site and exactly one of
everything else. Nothing was broken: `git` mode takes one project at a time and had
only ever been pointed at the hub, and `fleet` is live-only and produces one snapshot
per run. `fleet-git` is the registry-wide counterpart that was missing.

## Architecture

| Module | Lines | Owns |
|---|---:|---|
| `js/events.js` | 328 | `openModal`, `closeModal`, `applyHash`, `bindEvents` |
| `js/render.js` | 211 | `srcFor`, `dropBlobUrl`, `layoutStages`, `render` |
| `js/capture.js` | 196 | `normalizeUrl`, `captureLive`, `exportCapture` |
| `js/state.js` | 64 | `state`, `WIDTHS`, `loadSaved`, `save`, `sitesList` |
| `js/utils.js` | 58 | `$`, `escHtml`, `showToast`, `fmtDate`, `fmtBytes` |
| `js/data.js` | 55 | `loadManifest`, `localAll`, `localPut`, `localDelete` |
| `js/app.js` | 23 | none |

Vendored from `packages/neorgon-ui/`: never edit in place, run the sync script instead: `js/neorgon-footer.js`, `js/neorgon-header.js`.

## Data

- `localStorage['rewind-prefs']`
- `data/`: 1 file(s)

## Conventions

- Zero build step. Plain ES modules loaded by `js/app.js`.
- Header and footer come from the shared kits. Do not add site-local `.neo-footer` or `.header-bar` CSS.
- No single JS file over ~500 lines. It currently holds.

## Gotchas

**Headless Chrome writes the screenshot and then refuses to exit.** Measured on an
emoji-site snapshot: the PNG landed at 6.5s, the process was still alive at 120s.
`--timeout` and `--virtual-time-budget` do not end it, and this is true of
`--headless=new`, legacy `--headless` and `--run-all-compositor-stages-before-draw`
alike. `do_shots` used to wait on the process, paying a 60s timeout three times over
per snapshot, which is why snapshots accumulated faster than pictures of them.
`shoot()` watches the file and kills the process once it stops growing. If you
replace it with a plain `subprocess.run(timeout=...)`, the pipeline silently returns
to taking hours.

**`git archive` exits 128 when any pathspec matches nothing.** `git log` tolerates a
pathspec that matches nothing; `git archive` aborts the whole call. affinity-site has
no `assets/` directory, so a fixed list produces an empty tarball and no snapshot.
`design_pathspecs()` intersects the wanted list against `git ls-tree` at that commit
first. Do not pass `TREE_DIRS` straight through.

**The archive is size-bound, not material-bound.** 80 of 94 repos have enough history
for 5 or more snapshots; what limits the backfill is GitHub Pages' 1 GB ceiling on a
published site. `cmd_git` extracts design paths only for this reason (full trees ran
~2.4x larger: neorgon-site is 45 MB at HEAD, 1.7 MB lean), and `HEAVY_SITES` caps the
four repos whose own design directories dominate the total. Raising `--limit` fleet-wide
is the fastest way to blow the ceiling.

**neorgon-site's 33 snapshots predate lean extraction** and are still full repo trees,
carrying `post/`, `blog/` and `convex/`. They are ~50 MB that a re-capture would
reclaim, but re-extracting them also sanitizes beacons the older ones deliberately
kept as dated records, so it is a judgment call rather than a cleanup.

**Live snapshots taken before 2026-09-23 have broken icon paths.** `capture_live`'s
CSS rewriting emitted `css/assets/icons/*.svg` instead of `assets/icons/*.svg`, so
`neorgon-site/2026-08-30-1716-live` throws 60+ 404s when you open it in the stage.
The rewriting bug is unfixed; the affected snapshots are dated records.

## Do not touch

- `js/neorgon-*.js` and `css/neorgon-*.css`: vendored kits, regenerated by `packages/neorgon-ui/sync-*.sh`.
