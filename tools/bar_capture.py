#!/usr/bin/env python3
"""Fetch the live bar pages and the Cookling prototype, capture full-page + hero frame strips. python3 tools/bar_capture.py OUTDIR"""
import sys, pathlib, time
from playwright.sync_api import sync_playwright
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
COOK = 'file:///home/oye/.claude/projects/-home-oye-Documents-free-work-personal-agent-v2/6d0c4282-9887-4864-9326-46cb2dbad5f7/tool-results/artifact-8472a8be-1791909067-24e0.html'
SITES = {'finch': 'https://finchcare.com/', 'duolingo-abc': 'https://www.duolingoabc.com/', 'tmtr': 'https://www.teachyourmonster.org/', 'khan-kids': 'https://learn.khanacademy.org/khan-academy-kids/'}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, url in SITES.items():
        for w, h in ((390, 844), (1280, 800)):
            try:
                pg = b.new_page(viewport={'width': w, 'height': h}); pg.goto(url, timeout=45000, wait_until='domcontentloaded'); pg.wait_for_timeout(3500)
                for i in range(6): pg.screenshot(path=str(out / f'{name}-{w}-strip{i}.png')); pg.wait_for_timeout(330)
                H = pg.evaluate('document.documentElement.scrollHeight'); y = 0
                while y < min(H, 9000): pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(350); y += h * 0.7
                pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(500)
                pg.screenshot(path=str(out / f'{name}-{w}-full.png'), full_page=True); print(name, w, 'ok', H); pg.close()
            except Exception as e: print(name, w, 'FAILED', str(e)[:90])
    pg = b.new_page(viewport={'width': 390, 'height': 844}); pg.goto(COOK); pg.wait_for_timeout(1200)
    for i in range(8): pg.screenshot(path=str(out / f'cookling-strip{i}.png')); pg.wait_for_timeout(300)
    pg.evaluate("window.cookling && window.cookling.go(2)"); pg.wait_for_timeout(300)
    for i in range(6): pg.screenshot(path=str(out / f'cookling-home-strip{i}.png')); pg.wait_for_timeout(400)
    b.close()
