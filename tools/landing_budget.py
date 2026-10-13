#!/usr/bin/env python3
"""Landing page weight budget, measured the way a visitor loads it (real browser, real requests) against a built dist/.
  python3 tools/landing_budget.py [BASE_URL] [--limit-kb 300]
Loads #/ , scrolls to the bottom (so lazy images load), and sums the gzip size of every response from this site, split into:
  code+fonts+css (what the budget limits), images (lazy, reported), audio (excluded: never fetched until a tap).
The gzip size is computed from the file on disk in dist/ (the preview/static server may not gzip). Exit 1 over the limit."""
import sys, gzip, pathlib, time
from urllib.parse import urlparse, unquote
from playwright.sync_api import sync_playwright
R = pathlib.Path(__file__).resolve().parent.parent
base = next((a for a in sys.argv[1:] if a.startswith('http')), 'http://localhost:5390/')
limit = 300
if '--limit-kb' in sys.argv: limit = int(sys.argv[sys.argv.index('--limit-kb') + 1])
seen = {}
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('response', lambda r: seen.__setitem__(r.url, r.status))
    pg.goto(base + '#/', wait_until='load'); pg.wait_for_timeout(2500)
    H = pg.evaluate('document.documentElement.scrollHeight'); y = 0
    while y < H: pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(300); y += 500
    pg.wait_for_timeout(1500); b.close()
rows = {'code': [], 'font': [], 'css': [], 'image': [], 'audio': [], 'other': []}
site = urlparse(base).netloc
for url, st in seen.items():
    u = urlparse(url)
    if u.netloc != site or st >= 400: continue
    rel = unquote(u.path).lstrip('/') or 'index.html'
    f = R / 'dist' / rel
    if not f.is_file(): continue
    raw = f.read_bytes(); gz = len(gzip.compress(raw, 9))
    kind = 'audio' if rel.startswith('audio/') or rel.endswith('.ogg') else 'image' if rel.endswith(('.webp', '.png', '.jpg', '.svg')) else 'font' if rel.endswith('.woff2') else 'css' if rel.endswith('.css') else 'code' if rel.endswith(('.js', '.html', '.json', '.webmanifest')) else 'other'
    rows[kind].append((rel, len(raw), gz))
tot = 0
for k, v in rows.items():
    if not v: continue
    s = sum(x[2] for x in v); print(f'{k:6} {s / 1024:7.1f} KB gzip  ({len(v)} files)')
    for rel, raw, gz in sorted(v, key=lambda x: -x[2])[:6]: print(f'         {gz / 1024:6.1f} KB  {rel}')
    if k in ('code', 'font', 'css'): tot += s
img = sum(x[2] for x in rows['image'])
print(f'\nBUDGET code+fonts+css: {tot / 1024:.1f} KB gzip (limit {limit} KB); lazy images {img / 1024:.1f} KB; audio fetched before a tap: {len(rows["audio"])} files')
print('console errors:', errs[:3])
bad = tot / 1024 > limit or rows['audio'] or errs
print('LANDING BUDGET', 'RED' if bad else 'GREEN'); sys.exit(1 if bad else 0)
