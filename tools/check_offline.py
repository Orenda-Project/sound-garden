#!/usr/bin/env python3
"""Offline gate: build is served statically on its own port; first visit registers the service worker and caches the core clips; then the network is cut,
the page reloaded, and the landing page, the app (onboarding) and the teacher page must all still render. Usage: tools/check_offline.py [dist-dir]"""
import sys, subprocess, time, pathlib, socket
from playwright.sync_api import sync_playwright
dist = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent / 'dist')
port = 5431
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--directory', str(dist)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); ok = True
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
        base = f'http://localhost:{port}/'
        pg.goto(base + '?fast=1#/play'); pg.wait_for_selector('.splash-play, .whocard', timeout=20000)
        pg.evaluate('navigator.serviceWorker.ready.then(() => 1)'); time.sleep(6)   # let the core clips prefetch
        n = pg.evaluate("caches.open('sg-v1').then(c => c.keys()).then(k => k.filter(r => r.url.includes('/audio/')).length)")
        print('audio clips cached:', n); ok &= n > 200
        ctx.set_offline(True)
        for hsh, sel in [('', '.landing'), ('#/play', '.splash-play, .whocard'), ('#/teach', '.teachpage')]:
            q = ctx.new_page(); q.goto(base + '?fast=1' + hsh)   # a fresh page per route, network cut: everything must come from the service worker cache
            try: q.wait_for_selector(sel, timeout=15000); print('offline ok', hsh or '#/')
            except Exception as e: print('OFFLINE FAIL', hsh, str(e)[:80]); ok = False
        b.close()
finally:
    srv.terminate()
print('OFFLINE GATE', 'GREEN' if ok else 'RED'); sys.exit(0 if ok else 1)
