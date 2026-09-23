#!/usr/bin/env python3
"""Checks for capture.py's two silent-failure modes. Run: python3 tools/test_capture.py

Both cases here are ones that pass review by inspection and only show up when
tripped: a change-detection guard that never fires records a duplicate every run,
and a lean extractor that quietly falls back to the whole repo puts the archive
back over the size ceiling it was written to respect.
"""
import argparse
import datetime
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import capture                                          # noqa: E402

fails = []


def check(cond, msg):
    if not cond:
        fails.append(msg)
    print(f'  {"ok  " if cond else "FAIL"}  {msg}')


def test_if_changed(tmp):
    """The guard must trip on an identical page and stay out of the way otherwise."""
    print('--if-changed guard')
    capture.ROOT, capture.SNAP_DIR = tmp, tmp / 'snapshots'
    capture.MANIFEST = tmp / 'data' / 'manifest.json'
    body = {'v': b'<html><body>one</body></html>'}

    def fake_live(url, dest):
        dest.mkdir(parents=True, exist_ok=True)
        (dest / 'index.html').write_bytes(body['v'])
        return 1, 0

    real_live, real_dt = capture.capture_live, capture.datetime.datetime
    capture.capture_live = fake_live

    def run_at(iso):
        class FakeNow(real_dt):
            @classmethod
            def now(cls, tz=None):
                return real_dt.fromisoformat(iso)
        capture.datetime.datetime = FakeNow
        try:
            capture.cmd_live(argparse.Namespace(
                target='https://example.test/', site=None, shots=False,
                width=1440, height=900, if_changed=True))
        finally:
            capture.datetime.datetime = real_dt

    def n():
        return len(json.loads(capture.MANIFEST.read_text())['snapshots'])

    try:
        run_at('2026-01-01T10:00:00')
        check(n() == 1, 'first capture is recorded')
        run_at('2026-01-01T11:00:00')
        check(n() == 1, 'identical page records nothing (guard trips)')
        check(len(list((capture.SNAP_DIR / 'example-test').iterdir())) == 1,
              'skipped capture leaves no orphan directory')
        body['v'] = b'<html><body>two</body></html>'
        run_at('2026-01-01T12:00:00')
        check(n() == 2, 'changed page is recorded (guard does not over-trip)')
        # A git tree landing later must not become the comparison target, or the
        # next scheduled run mirrors an unchanged page and records it anyway.
        man = json.loads(capture.MANIFEST.read_text())
        man['snapshots'].append({
            'id': 'example-test/2026-06-01-abc', 'site': 'example-test',
            'date': '2026-06-01T10:00:00', 'source': 'git', 'kind': 'tree',
            'commit': 'abc', 'subject': '', 'shot': None, 'bytes': 1, 'files': 1,
            'path': 'snapshots/example-test/2026-01-01-1200-live/index.html'})
        capture.save_manifest(man)
        run_at('2026-07-01T10:00:00')
        check(n() == 3, 'unchanged page still skipped when a newer git tree exists')
    finally:
        capture.capture_live = real_live


def test_lean_extract(tmp):
    """Extraction must drop repo internals and still yield a renderable page."""
    print('lean git extraction')
    repo = tmp / 'repo'
    (repo / 'css').mkdir(parents=True)
    (repo / 'post').mkdir()
    (repo / 'index.html').write_text('<html><body>hi</body></html>')
    (repo / 'css' / 'style.css').write_text('body{color:red}')
    (repo / 'post' / 'heavy.bin').write_bytes(b'x' * 200_000)
    (repo / 'CLAUDE.md').write_text('# notes')
    env = {'GIT_AUTHOR_NAME': 'T', 'GIT_AUTHOR_EMAIL': 't@t', 'GIT_COMMITTER_NAME': 'T',
           'GIT_COMMITTER_EMAIL': 't@t', 'PATH': '/usr/bin:/bin:/usr/local/bin'}
    subprocess.run(['git', 'init', '-q'], cwd=repo, check=True, env=env)
    subprocess.run(['git', 'add', '-A'], cwd=repo, check=True, env=env)
    subprocess.run(['git', 'commit', '-qm', 'init'], cwd=repo, check=True, env=env)
    sha = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=repo, capture_output=True,
                         text=True, check=True).stdout.strip()

    dest = tmp / 'out'
    capture.extract_tree(repo, sha, dest)
    check((dest / 'index.html').exists(), 'page survives extraction')
    check((dest / 'css' / 'style.css').exists(), 'stylesheet survives extraction')
    check(not (dest / 'post').exists(), 'repo internals (post/) are left behind')
    check(not (dest / 'CLAUDE.md').exists(), 'repo notes are left behind')
    check(capture.entry_html(dest) == 'index.html', 'entry page is discoverable')

    # A pathspec that matches nothing aborts `git archive` outright (exit 128),
    # which is why design_pathspecs intersects against the real tree first.
    specs = capture.design_pathspecs(repo, sha)
    check('post' not in specs and 'index.html' in specs, 'pathspecs are design-only')
    rc = subprocess.run(['git', '-C', str(repo), 'archive', sha, '--', 'assets'],
                        capture_output=True).returncode
    check(rc != 0, 'a non-matching pathspec would abort git archive (why we intersect)')


def test_prune(tmp):
    """Prune must respect the cap, keep the earliest, and never drop what is current."""
    print('prune')
    capture.ROOT, capture.SNAP_DIR = tmp, tmp / 'snapshots'
    capture.MANIFEST = tmp / 'data' / 'manifest.json'
    snaps = []
    # one site, three snapshots in March and two in April
    for date in ('2026-03-02', '2026-03-11', '2026-03-24', '2026-04-05', '2026-04-19'):
        sid = f'demo-site/{date}-aaaaaaa'
        d = capture.SNAP_DIR / 'demo-site' / f'{date}-aaaaaaa'
        d.mkdir(parents=True)
        (d / 'index.html').write_text('<html></html>')
        shot = tmp / 'shots' / 'demo-site' / f'{date}.jpg'
        shot.parent.mkdir(parents=True, exist_ok=True)
        shot.write_bytes(b'\xff\xd8jpg')
        snaps.append({'id': sid, 'site': 'demo-site', 'date': f'{date}T10:00:00',
                      'source': 'git', 'kind': 'tree', 'commit': 'aaaaaaa', 'subject': '',
                      'path': f'snapshots/demo-site/{date}-aaaaaaa/index.html',
                      'shot': f'shots/demo-site/{date}.jpg', 'bytes': 1000, 'files': 1})
    capture.MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    capture.save_manifest({'generated': None, 'sites': {}, 'snapshots': snaps})

    ns = argparse.Namespace(per_month=1, site=None, apply=False, drop_live=False)
    capture.cmd_prune(ns)
    left = json.loads(capture.MANIFEST.read_text())['snapshots']
    check(len(left) == 5, 'dry run deletes nothing')

    ns.apply = True
    capture.cmd_prune(ns)
    left = json.loads(capture.MANIFEST.read_text())['snapshots']
    dates = sorted(s['date'][:10] for s in left)
    check(dates == ['2026-03-02', '2026-04-05', '2026-04-19'],
          f'keeps earliest per month plus the newest overall (got {dates})')
    check(not (capture.SNAP_DIR / 'demo-site' / '2026-03-11-aaaaaaa').exists(),
          'pruned snapshot directory is gone')
    check(not (tmp / 'shots' / 'demo-site' / '2026-03-11.jpg').exists(),
          'pruned screenshot is gone')
    check((capture.SNAP_DIR / 'demo-site' / '2026-04-19-aaaaaaa').exists(),
          'the site current state survives even though its month was full')


def test_prune_keeps_live(tmp):
    """A live mirror must survive a month whose earliest snapshot is a git tree."""
    print('prune keeps live mirrors')
    capture.ROOT, capture.SNAP_DIR = tmp, tmp / 'snapshots'
    capture.MANIFEST = tmp / 'data' / 'manifest.json'
    snaps = []
    # March: git on the 2nd, git on the 11th, LIVE on the 30th. April: git, so the
    # live one is not the site's newest and only the source rule can save it.
    for date, src in (('2026-03-02', 'git'), ('2026-03-11', 'git'),
                      ('2026-03-30', 'live'), ('2026-04-05', 'git')):
        stamp = f'{date}-x'
        d = capture.SNAP_DIR / 'demo-site' / stamp
        d.mkdir(parents=True)
        (d / 'index.html').write_text('<html></html>')
        snaps.append({'id': f'demo-site/{stamp}', 'site': 'demo-site',
                      'date': f'{date}T10:00:00', 'source': src, 'kind': 'tree',
                      'commit': None, 'subject': '',
                      'path': f'snapshots/demo-site/{stamp}/index.html',
                      'shot': None, 'bytes': 1000, 'files': 1})
    capture.MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    capture.save_manifest({'generated': None, 'sites': {}, 'snapshots': snaps})

    capture.cmd_prune(argparse.Namespace(per_month=1, site=None, apply=True, drop_live=False))
    left = sorted(s['date'][:10] for s in json.loads(capture.MANIFEST.read_text())['snapshots'])
    check(left == ['2026-03-02', '2026-03-30', '2026-04-05'],
          f'live mirror survives a month it did not start (got {left})')
    check('2026-03-11' not in left, 'the redundant git tree is still pruned')


def main():
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        test_if_changed(tmp / 'a')
        test_lean_extract(tmp / 'b')
        test_prune(tmp / 'c')
        test_prune_keeps_live(tmp / 'd')
    print()
    if fails:
        print(f'{len(fails)} FAILED')
        return 1
    print('all checks passed')
    return 0


if __name__ == '__main__':
    sys.exit(main())
