#!/usr/bin/env python3
"""Full-page screenshots + frame strips of the landing page. python3 tools/site_shots.py OUTDIR [--base URL]
Scrolls the page once so scroll-triggered springs fire, then shoots the full page at 390 and 1280. Frame strip: 6 frames over 2 s of the hero."""
import sys, argparse, pathlib
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--base', default='http://localhost:5390/'); a = ap.parse_args()
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 844), (1280, 800)):
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto(a.base + '#/'); pg.wait_for_timeout(1500)
        for i in range(6):
            pg.screenshot(path=str(out / f'strip-{w}-{i}.png')); pg.wait_for_timeout(350)
        H = pg.evaluate('document.documentElement.scrollHeight')
        y = 0
        while y < H:
            pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(450); y += h * 0.7
        pg.wait_for_timeout(1500); pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(600)
        pg.screenshot(path=str(out / f'full-{w}.png'), full_page=True); print(w, 'height', H, 'errors', errs[:4]); pg.close()
    b.close()
