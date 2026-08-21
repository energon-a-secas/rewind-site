#!/usr/bin/env python3
"""Rewind capture CLI — builds the snapshot archive the viewer renders.

Modes:
  git <project>      extract full working trees from the project's git history,
                     one snapshot per design-changing day (sampled to --limit)
  live <site|url>    mirror a live page: same-host assets + cdn.neorgon.org are
                     downloaded and re-pointed, everything else stays absolute
  shot [ids]         screenshot snapshots through headless Chrome (JPEG via sips)
  gif <id|site>      record an animated demo of a snapshot (scroll-through) via
                     og-studio's record-gif.mjs; filmstrip cards play it on hover
  adopt <file.html>  promote a browser-exported capture into the archive
  fleet              live-capture every registry site (filtered by --lifecycle)
  list / rm          inspect or delete manifest entries

Everything lands under snapshots/ + shots/ and is indexed in data/manifest.json,
which the viewer fetches. Python stdlib only; paths resolve from this file, so
it runs from anywhere.
"""

import argparse
import datetime
import json
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import threading
import urllib.parse
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent          # projects/rewind-site
MONO = ROOT.parent.parent                              # Personal/
REGISTRY = MONO / 'docs' / 'site-registry.json'
MANIFEST = ROOT / 'data' / 'manifest.json'
SNAP_DIR = ROOT / 'snapshots'
SHOT_DIR = ROOT / 'shots'

# Dirs stripped from extracted git trees: heavy media that is not the design,
# and metadata that has no business inside a rendered snapshot.
PRUNE_DIRS = ('assets/previews', 'node_modules', '.github', 'docs')
SPAN_HOSTS = {'cdn.neorgon.org'}                       # cross-host assets worth localizing

# An archive must not phone home. Every captured page has its analytics beacons
# stripped: old git snapshots carried Google Analytics and Plausible, and the
# live header kit carries GoatCounter and Cloudflare. Tracking is not the design.
ANALYTICS_HOSTS = ('googletagmanager.com', 'google-analytics.com', 'plausible.io',
                   'gc.zgo.at', 'goatcounter.com', 'cloudflareinsights.com')
_SCRIPT_RE = re.compile(r'<script\b[^>]*>.*?</script\s*>', re.I | re.S)

def _is_analytics_script(tag):
    low = tag.lower()
    if any(h in low for h in ANALYTICS_HOSTS):
        return True
    head = low.split('>', 1)[0]
    # Inline gtag / dataLayer / plausible / goatcounter bootstraps (no external src)
    return 'src=' not in head and bool(re.search(r'\b(gtag|datalayer|goatcounter|plausible)\b', low))

def sanitize_html(html):
    out = _SCRIPT_RE.sub(lambda m: '' if _is_analytics_script(m.group(0)) else m.group(0), html)
    # The vendored header kit self-initialises analytics on *.neorgon.com, so a
    # snapshot served under rewind.neorgon.com would fire it. Its documented
    # opt-out is a meta tag; set it as a belt beside stripping the scripts.
    if 'neorgon-header' in out.lower() and 'neo-analytics' not in out.lower():
        out = re.sub(r'(<head\b[^>]*>)', r'\1\n  <meta name="neo-analytics" content="off">',
                     out, count=1, flags=re.I)
    return out

def sanitize_dir(dest):
    n = 0
    for f in dest.rglob('*.html'):
        try:
            src = f.read_text(encoding='utf-8', errors='replace')
            cleaned = sanitize_html(src)
            if cleaned != src:
                f.write_text(cleaned)
                n += 1
        except Exception as e:
            warn(f'sanitize skipped {f}: {e}')
    return n
UA = 'Mozilla/5.0 (Macintosh) RewindCapture/1.0 (+https://rewind.neorgon.com)'
GIT_PATHSPECS = ['*.html', 'css', 'js', 'assets', 'styles', 'img', 'images', 'data']
MAX_ASSETS = 300
MAX_BYTES = 40 * 1024 * 1024


def warn(msg):
    print(f'  ! {msg}', file=sys.stderr)


def run(args, **kw):
    return subprocess.run(args, check=True, capture_output=True, text=True, **kw).stdout


# ── Manifest ─────────────────────────────────────────────────────────────────

def load_manifest():
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {'generated': None, 'sites': {}, 'snapshots': []}


def save_manifest(m):
    m['generated'] = now_iso()
    m['snapshots'].sort(key=lambda s: (s['site'], s['date']))
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    tmp = MANIFEST.with_suffix('.tmp')
    tmp.write_text(json.dumps(m, indent=1) + '\n')
    tmp.replace(MANIFEST)


def now_iso():
    return datetime.datetime.now().astimezone().isoformat(timespec='seconds')


def dir_stats(path):
    files = [p for p in path.rglob('*') if p.is_file()]
    return sum(p.stat().st_size for p in files), len(files)


# ── Site resolution (registry-aware, tolerant when it is missing) ────────────

def registry_sites():
    if not REGISTRY.exists():
        return []
    return json.loads(REGISTRY.read_text()).get('sites', [])


def resolve_site(name):
    """Accept 'neorgon-site', 'neorgon', a domain, or a URL. -> (id, domain, title)"""
    host = None
    if '://' in name:
        host = urllib.parse.urlsplit(name).hostname
    for s in registry_sites():
        sid, dom = s.get('id', ''), s.get('domain') or ''
        if name in (sid, sid.removesuffix('-site'), dom) or (host and host == dom):
            return sid, dom, s.get('display_name') or sid
    if host:                                           # arbitrary URL, no registry match
        return host.replace('.', '-'), host, host
    sid = name if name.endswith(('-site', '-api')) else f'{name}-site'
    return sid, '', name


def remember_site(m, sid, domain, title):
    entry = m['sites'].setdefault(sid, {})
    entry['title'] = title or entry.get('title') or sid
    if domain:
        entry['domain'] = domain


def add_snapshot(m, entry):
    if any(s['id'] == entry['id'] for s in m['snapshots']):
        return False
    m['snapshots'].append(entry)
    return True


# ── git mode ─────────────────────────────────────────────────────────────────

def design_commits(repo):
    out = run(['git', '-C', str(repo), 'log', '--format=%H%x09%cI%x09%s', '--'] + GIT_PATHSPECS)
    commits = [line.split('\t', 2) for line in out.splitlines() if line.strip()]
    commits.reverse()                                  # oldest first
    return commits


def bucket_last_per(commits, every):
    if every == 'all':
        return commits
    buckets = {}
    for sha, ciso, subj in commits:
        day = datetime.date.fromisoformat(ciso[:10])
        key = day.isocalendar()[:2] if every == 'week' else day
        buckets[key] = (sha, ciso, subj)               # later commit wins the bucket
    return [buckets[k] for k in sorted(buckets)]


def sample(items, limit):
    if limit <= 0 or len(items) <= limit:
        return items
    idxs = sorted({round(i * (len(items) - 1) / (limit - 1)) for i in range(limit)})
    return [items[i] for i in idxs]


def extract_tree(repo, sha, dest):
    raw = subprocess.run(['git', '-C', str(repo), 'archive', sha],
                         check=True, capture_output=True).stdout
    dest.mkdir(parents=True, exist_ok=True)
    with tarfile.open(fileobj=BytesIO(raw)) as tf:
        try:
            tf.extractall(dest, filter='data')
        except TypeError:                              # < 3.12: no filter kwarg
            tf.extractall(dest)
    for d in PRUNE_DIRS:
        target = dest / d
        if target.exists():
            shutil.rmtree(target)


def entry_html(dest):
    if (dest / 'index.html').exists():
        return 'index.html'
    found = sorted(dest.glob('*.html'))
    return found[0].name if found else None


def cmd_git(a):
    sid, domain, title = resolve_site(a.project)
    repo = Path(a.repo).resolve() if a.repo else MONO / 'projects' / sid
    if not (repo / '.git').exists():
        sys.exit(f'not a git repo: {repo}')
    commits = sample(bucket_last_per(design_commits(repo), a.every), a.limit)
    if not commits:
        sys.exit(f'no design-touching commits found in {repo}')
    print(f'{sid}: {len(commits)} snapshots from git history ({commits[0][1][:10]} -> {commits[-1][1][:10]})')
    m = load_manifest()
    remember_site(m, sid, domain, title)
    new_ids = []
    for sha, ciso, subj in commits:
        stamp = f'{ciso[:10]}-{sha[:7]}'
        snap_id = f'{sid}/{stamp}'
        dest = SNAP_DIR / sid / stamp
        if dest.exists() and any(s['id'] == snap_id for s in m['snapshots']):
            print(f'  = {stamp} (already captured)')
            continue
        if dest.exists():
            shutil.rmtree(dest)
        extract_tree(repo, sha, dest)
        sanitize_dir(dest)
        page = entry_html(dest)
        if not page:
            warn(f'{stamp}: no HTML file in tree, skipping')
            shutil.rmtree(dest)
            continue
        size, files = dir_stats(dest)
        add_snapshot(m, {
            'id': snap_id, 'site': sid, 'date': ciso, 'source': 'git', 'kind': 'tree',
            'commit': sha[:7], 'subject': subj,
            'path': (PurePosixPath('snapshots') / sid / stamp / page).as_posix(),
            'shot': None, 'bytes': size, 'files': files,
        })
        new_ids.append(snap_id)
        print(f'  + {stamp}  {files} files, {size // 1024} KB  "{subj[:50]}"')
    save_manifest(m)
    print(f'{len(new_ids)} new snapshots recorded in {MANIFEST.relative_to(ROOT)}')
    if a.shots and new_ids:
        do_shots(new_ids, a.width, a.height)


# ── live mode ────────────────────────────────────────────────────────────────

CSS_URL_RE = re.compile(r'url\(\s*([\'"]?)([^)\'"]+)\1\s*\)')
CSS_IMPORT_RE = re.compile(r'@import\s+([\'"])([^\'"]+)\1')
SKIP_SCHEMES = ('data:', 'blob:', 'mailto:', 'javascript:', 'tel:', '#')


class RefFinder(__import__('html.parser', fromlist=['HTMLParser']).HTMLParser):
    """Collect raw attribute values that reference assets or navigation."""

    ASSET_ATTRS = {'script': ['src'], 'img': ['src', 'srcset'], 'source': ['src', 'srcset'],
                   'video': ['src', 'poster'], 'audio': ['src'], 'input': ['src']}
    LINK_RELS = {'stylesheet', 'icon', 'shortcut', 'apple-touch-icon', 'manifest', 'preload', 'modulepreload'}

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.assets, self.styles, self.navs = [], [], []   # (value, is_css) / css text / href
        self._in_style = False

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'style':
            self._in_style = True
        elif tag == 'link' and d.get('href'):
            rels = set((d.get('rel') or '').lower().split())
            if rels & self.LINK_RELS:
                self.assets.append((d['href'], 'stylesheet' in rels))
        elif tag in ('a', 'area', 'form'):
            v = d.get('href') or d.get('action')
            if v:
                self.navs.append(v)
        else:
            for attr in self.ASSET_ATTRS.get(tag, []):
                if d.get(attr):
                    self.assets.append((d[attr], False))
        if d.get('style'):
            self.styles.append(d['style'])

    def handle_endtag(self, tag):
        if tag == 'style':
            self._in_style = False

    def handle_data(self, data):
        if self._in_style:
            self.styles.append(data)


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(), r.headers.get_content_type()


def classify(raw, base_url, page_host):
    """-> (absolute_url, local_rel_path | None). None = leave untouched / tethered."""
    v = raw.strip()
    if not v or v.startswith(SKIP_SCHEMES):
        return None, None
    absu = urllib.parse.urljoin(base_url, v)
    parts = urllib.parse.urlsplit(absu)
    if parts.scheme not in ('http', 'https'):
        return None, None
    path = parts.path.lstrip('/') or 'index.html'
    if parts.hostname == page_host:
        return absu, path
    if parts.hostname in SPAN_HOSTS:
        return absu, f'_ext/{parts.hostname}/{path}'
    return absu, None


def rel_from(css_local, target_local):
    """Relative path from the dir of css_local to target_local (posix)."""
    import posixpath
    return posixpath.relpath(target_local, posixpath.dirname(css_local) or '.')


def rewrite_css(text, css_url, css_local, page_host, queue, seen):
    def sub(match, quote_group, url_group):
        raw = match.group(url_group)
        absu, local = classify(raw, css_url, page_host)
        if not local:
            return match.group(0)
        if absu not in seen:
            seen.add(absu)
            queue.append((absu, local, raw.lower().endswith('.css')))
        return match.group(0).replace(raw, rel_from(css_local, local))

    text = CSS_URL_RE.sub(lambda mo: sub(mo, 1, 2), text)
    text = CSS_IMPORT_RE.sub(lambda mo: sub(mo, 1, 2), text)
    return text


def capture_live(url, dest):
    """Mirror one page into dest/. Returns (saved_count, tethered_count)."""
    page_host = urllib.parse.urlsplit(url).hostname
    html_bytes, _ = fetch(url)
    html = html_bytes.decode('utf-8', errors='replace')
    if re.search(r'<base\s', html, re.I):
        warn('page uses <base>; relative mirroring may be off')

    finder = RefFinder()
    finder.feed(html)

    replacements = {}                       # raw value -> new value (in HTML text)
    queue, seen = [], set()                 # (abs_url, local_rel, is_css)

    for raw, is_css in finder.assets:
        if ' ' in raw.strip() and ',' in raw:          # srcset composite value
            parts = []
            for chunk in raw.split(','):
                bits = chunk.strip().split(None, 1)
                if not bits:
                    continue
                absu, local = classify(bits[0], url, page_host)
                if local and absu not in seen:
                    seen.add(absu)
                    queue.append((absu, local, False))
                bits[0] = local if local else bits[0]
                parts.append(' '.join(bits))
            replacements[raw] = ', '.join(parts)
            continue
        absu, local = classify(raw, url, page_host)
        if local:
            if absu not in seen:
                seen.add(absu)
                queue.append((absu, local, is_css or raw.split('?')[0].lower().endswith('.css')))
            if raw.strip() != local:
                replacements[raw] = local
    for css_text in finder.styles:                     # style attrs + <style> blocks
        for mo in CSS_URL_RE.finditer(css_text):
            raw = mo.group(2)
            absu, local = classify(raw, url, page_host)
            if local:
                if absu not in seen:
                    seen.add(absu)
                    queue.append((absu, local, False))
                if raw != local:
                    replacements[raw] = local
    for raw in finder.navs:                            # keep navigation on the live site
        v = raw.strip()
        if v and not v.startswith(SKIP_SCHEMES) and '://' not in v and not v.startswith('//'):
            replacements[raw] = urllib.parse.urljoin(url, v)

    saved = tethered = 0
    total = 0
    while queue:
        absu, local, is_css = queue.pop(0)
        if saved >= MAX_ASSETS or total >= MAX_BYTES:
            warn('asset budget reached, remaining assets stay tethered')
            break
        try:
            data, _ = fetch(absu)
        except Exception as e:
            warn(f'tethered (fetch failed): {absu} ({e})')
            tethered += 1
            continue
        total += len(data)
        target = dest / PurePosixPath(local)
        target.parent.mkdir(parents=True, exist_ok=True)
        if is_css:
            css = rewrite_css(data.decode('utf-8', errors='replace'), absu, local, page_host, queue, seen)
            target.write_text(css)
        else:
            target.write_bytes(data)
        saved += 1

    for raw, new in sorted(replacements.items(), key=lambda kv: -len(kv[0])):
        for q in ('"', "'"):
            html = html.replace(f'{q}{raw}{q}', f'{q}{new}{q}')
        html = html.replace(f'({raw})', f'({new})')
    html = sanitize_html(html)
    stamp_note = f'<!-- Rewind capture of {url} on {now_iso()} -->\n'
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'index.html').write_text(stamp_note + html)
    return saved, tethered


def cmd_live(a):
    sid, domain, title = resolve_site(a.target)
    if a.site:
        sid = a.site
    url = a.target if '://' in a.target else f'https://{domain or a.target}/'
    now = datetime.datetime.now()
    stamp = f'{now:%Y-%m-%d}-{now:%H%M}-live'
    snap_id = f'{sid}/{stamp}'
    dest = SNAP_DIR / sid / stamp
    print(f'{sid}: capturing {url}')
    saved, tethered = capture_live(url, dest)
    size, files = dir_stats(dest)
    m = load_manifest()
    remember_site(m, sid, domain or urllib.parse.urlsplit(url).hostname, title)
    add_snapshot(m, {
        'id': snap_id, 'site': sid, 'date': now.astimezone().isoformat(timespec='seconds'),
        'source': 'live', 'kind': 'tree', 'commit': None,
        'subject': f'Live capture of {url}',
        'path': (PurePosixPath('snapshots') / sid / stamp / 'index.html').as_posix(),
        'shot': None, 'bytes': size, 'files': files,
    })
    save_manifest(m)
    print(f'  + {stamp}  {files} files, {size // 1024} KB  ({saved} assets saved, {tethered} tethered)')
    if a.shots:
        do_shots([snap_id], a.width, a.height)


# ── shot mode ────────────────────────────────────────────────────────────────

CHROME_CANDIDATES = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
]


def find_chrome():
    import os
    if os.environ.get('CHROME_BIN'):
        return os.environ['CHROME_BIN']
    for c in CHROME_CANDIDATES:
        if Path(c).exists():
            return c
    for name in ('google-chrome', 'chromium', 'chromium-browser'):
        if shutil.which(name):
            return shutil.which(name)
    return None


def serve_root():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a, **k: None
    srv = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]


def do_shots(ids, width, height):
    chrome = find_chrome()
    if not chrome:
        warn('no Chrome/Chromium found (set CHROME_BIN) — skipping screenshots')
        return
    m = load_manifest()
    by_id = {s['id']: s for s in m['snapshots']}
    targets = [by_id[i] for i in ids if i in by_id]
    if not targets:
        warn('nothing to screenshot')
        return
    srv, port = serve_root()
    sips = shutil.which('sips')
    print(f'screenshots via headless Chrome ({width}x{height}, port {port})')
    try:
        with tempfile.TemporaryDirectory(prefix='rewind-shot-') as td:
            for n, s in enumerate(targets):
                png = Path(td) / f'shot-{n}.png'
                url = f'http://127.0.0.1:{port}/{s["path"]}'
                # A fresh profile per attempt: Chrome's SingletonLock lingers
                # after exit, and a reused profile makes launches silently no-op.
                for attempt in range(3):
                    flag = '--headless=new' if attempt < 2 else '--headless'
                    args = [chrome, flag, '--disable-gpu', '--hide-scrollbars',
                            '--no-first-run', '--no-default-browser-check', '--disable-extensions',
                            '--mute-audio', f'--user-data-dir={td}/p{n}-{attempt}',
                            '--force-device-scale-factor=1', f'--window-size={width},{height}',
                            '--virtual-time-budget=7000', '--timeout=20000',
                            f'--screenshot={png}', url]
                    try:
                        subprocess.run(args, capture_output=True, timeout=60, check=False)
                    except subprocess.TimeoutExpired:
                        warn(f'{s["id"]}: Chrome timed out (attempt {attempt + 1})')
                    if png.exists():
                        break
                if not png.exists():
                    warn(f'{s["id"]}: no screenshot produced after 3 attempts')
                    continue
                out_dir = SHOT_DIR / s['site']
                out_dir.mkdir(parents=True, exist_ok=True)
                stamp = s['id'].split('/', 1)[1]
                if sips:
                    out = out_dir / f'{stamp}.jpg'
                    subprocess.run([sips, '-s', 'format', 'jpeg', '-s', 'formatOptions', '80',
                                    str(png), '--out', str(out)], capture_output=True, check=True)
                else:
                    out = out_dir / f'{stamp}.png'
                    shutil.copy2(png, out)
                png.unlink(missing_ok=True)
                s['shot'] = (PurePosixPath('shots') / s['site'] / out.name).as_posix()
                print(f'  📷 {s["id"]} -> {s["shot"]} ({out.stat().st_size // 1024} KB)')
    finally:
        srv.shutdown()
    save_manifest(m)


def cmd_shot(a):
    if a.ids:
        ids = a.ids
    else:
        m = load_manifest()
        ids = [s['id'] for s in m['snapshots']
               if (a.site is None or s['site'] == a.site) and (not a.missing or not s['shot'])]
    do_shots(ids, a.width, a.height)


# ── gif mode ─────────────────────────────────────────────────────────────────

RECORDER = MONO / 'projects' / 'og-studio-site' / 'scripts' / 'record-gif.mjs'


def cmd_gif(a):
    m = load_manifest()
    snap = next((s for s in m['snapshots'] if s['id'] == a.target), None)
    if snap is None:                                   # site name -> latest snapshot
        candidates = [s for s in m['snapshots'] if s['site'] in (a.target, f'{a.target}-site')]
        snap = candidates[-1] if candidates else None
    if snap is None:
        sys.exit(f'no snapshot matches "{a.target}" — try: capture.py list')
    if not RECORDER.exists():
        sys.exit(f'recorder not found: {RECORDER} (og-studio owns it)')
    stamp = snap['id'].split('/', 1)[1]
    out = SHOT_DIR / snap['site'] / f'{stamp}.gif'
    out.parent.mkdir(parents=True, exist_ok=True)
    srv, port = serve_root()
    try:
        cmd = ['node', str(RECORDER), f'http://127.0.0.1:{port}/{snap["path"]}',
               '--out', str(out), '--fps', str(a.fps), '--size', a.size]
        if a.scenario:
            cmd += ['--scenario', a.scenario]
        r = subprocess.run(cmd, text=True)
        if r.returncode != 0 or not out.exists():
            sys.exit('recording failed')
    finally:
        srv.shutdown()
    snap['gif'] = (PurePosixPath('shots') / snap['site'] / out.name).as_posix()
    save_manifest(m)
    print(f'  🎞 {snap["id"]} -> {snap["gif"]} ({out.stat().st_size // 1024} KB)')


# ── adopt / fleet / list / rm ────────────────────────────────────────────────

def cmd_adopt(a):
    src = Path(a.file).resolve()
    if not src.exists():
        sys.exit(f'no such file: {src}')
    sid, domain, title = resolve_site(a.site)
    when = datetime.datetime.fromisoformat(a.date) if a.date else \
        datetime.datetime.fromtimestamp(src.stat().st_mtime)
    stamp = f'{when:%Y-%m-%d}-{when:%H%M}-import'
    dest = SNAP_DIR / sid / stamp
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest / 'index.html')
    size, files = dir_stats(dest)
    m = load_manifest()
    remember_site(m, sid, domain, title)
    snap_id = f'{sid}/{stamp}'
    add_snapshot(m, {
        'id': snap_id, 'site': sid, 'date': when.astimezone().isoformat(timespec='seconds'),
        'source': 'browser', 'kind': 'single', 'commit': None,
        'subject': a.note or f'Imported browser capture ({src.name})',
        'path': (PurePosixPath('snapshots') / sid / stamp / 'index.html').as_posix(),
        'shot': None, 'bytes': size, 'files': files,
    })
    save_manifest(m)
    print(f'adopted {src.name} as {snap_id}')
    if a.shots:
        do_shots([snap_id], a.width, a.height)


def cmd_fleet(a):
    sites = [s for s in registry_sites()
             if s.get('lifecycle') == a.lifecycle and s.get('domain')]
    print(f'fleet live capture: {len(sites)} sites (lifecycle={a.lifecycle})')
    for s in sites:
        ns = argparse.Namespace(target=s['id'], site=None, shots=a.shots,
                                width=a.width, height=a.height)
        try:
            cmd_live(ns)
        except Exception as e:
            warn(f'{s["id"]}: capture failed ({e})')


def cmd_list(a):
    m = load_manifest()
    snaps = [s for s in m['snapshots'] if a.site is None or s['site'] == a.site]
    if not snaps:
        print('no snapshots yet — try: capture.py git neorgon-site')
        return
    for s in snaps:
        shot = '📷' if s['shot'] else '  '
        ref = s['commit'] or s['source']
        print(f'{shot} {s["id"]:<48} {s["date"][:10]}  {ref:<8} {s["bytes"] // 1024:>6} KB  {s["subject"][:44]}')
    print(f'{len(snaps)} snapshots, {sum(s["bytes"] for s in snaps) // (1024 * 1024)} MB total')


def cmd_rm(a):
    m = load_manifest()
    keep, dropped = [], []
    for s in m['snapshots']:
        (dropped if s['id'] in a.ids else keep).append(s)
    for s in dropped:
        d = ROOT / PurePosixPath(s['path']).parent
        if d.exists():
            shutil.rmtree(d)
        if s['shot'] and (ROOT / s['shot']).exists():
            (ROOT / s['shot']).unlink()
        print(f'removed {s["id"]}')
    m['snapshots'] = keep
    save_manifest(m)
    if not dropped:
        warn('no matching snapshot ids')


# ── argparse wiring ──────────────────────────────────────────────────────────

def add_shot_flags(p):
    p.add_argument('--shots', action='store_true', help='screenshot new snapshots afterwards')
    p.add_argument('--width', type=int, default=1440)
    p.add_argument('--height', type=int, default=900)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)

    p = sub.add_parser('git', help='snapshot a project\'s git history')
    p.add_argument('project')
    p.add_argument('--limit', type=int, default=20, help='max snapshots after day-bucketing (default 20)')
    p.add_argument('--every', choices=['day', 'week', 'all'], default='day')
    p.add_argument('--repo', help='explicit repo path (default: ../../projects/<project>)')
    add_shot_flags(p)
    p.set_defaults(fn=cmd_git)

    p = sub.add_parser('live', help='mirror a live page')
    p.add_argument('target', help='registry site id, domain, or full URL')
    p.add_argument('--site', help='override the site id the snapshot files under')
    add_shot_flags(p)
    p.set_defaults(fn=cmd_live)

    p = sub.add_parser('shot', help='screenshot snapshots')
    p.add_argument('ids', nargs='*')
    p.add_argument('--site')
    p.add_argument('--missing', action='store_true', help='only snapshots without a shot')
    p.add_argument('--width', type=int, default=1440)
    p.add_argument('--height', type=int, default=900)
    p.set_defaults(fn=cmd_shot, missing_default=True)

    p = sub.add_parser('gif', help='record an animated demo of a snapshot')
    p.add_argument('target', help='snapshot id, or a site name (uses its latest snapshot)')
    p.add_argument('--fps', type=int, default=10)
    p.add_argument('--size', default='646x300')
    p.add_argument('--scenario', help='JSON step file passed through to record-gif.mjs')
    p.set_defaults(fn=cmd_gif)

    p = sub.add_parser('adopt', help='import a browser-exported capture')
    p.add_argument('file')
    p.add_argument('--site', required=True)
    p.add_argument('--date', help='ISO datetime override')
    p.add_argument('--note')
    add_shot_flags(p)
    p.set_defaults(fn=cmd_adopt)

    p = sub.add_parser('fleet', help='live-capture every registry site')
    p.add_argument('--lifecycle', default='live')
    add_shot_flags(p)
    p.set_defaults(fn=cmd_fleet)

    p = sub.add_parser('list', help='print the manifest')
    p.add_argument('--site')
    p.set_defaults(fn=cmd_list)

    p = sub.add_parser('rm', help='delete snapshots by id')
    p.add_argument('ids', nargs='+')
    p.set_defaults(fn=cmd_rm)

    a = ap.parse_args()
    if a.cmd == 'shot' and not a.ids and not a.site:
        a.missing = True
    a.fn(a)


if __name__ == '__main__':
    main()
