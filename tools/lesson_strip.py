#!/usr/bin/env python3
"""A lesson as a child sees it, with the real audio on: python3 tools/lesson_strip.py OUTDIR
Starts the first sitting after L1.04 (not ?fast, autoplay allowed), grabs 8 frames over 4 s, then taps the forward arrow twice and grabs 4 more."""
import sys, time, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import sg_lib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / 'engine-compat/tools'))
from playwright.sync_api import sync_playwright
from PIL import Image
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
def strip(files, name, scale=0.5):
    ims = [Image.open(f) for f in files]; w, h = int(ims[0].width * scale), int(ims[0].height * scale); s = Image.new('RGB', (w * len(ims), h))
    for i, im in enumerate(ims): s.paste(im.resize((w, h)), (i * w, 0))
    s.save(out / name)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(sg_lib.BASE + '?fast=1#/play')
    import _onb; _onb.walk(pg, 'A'); pg.wait_for_selector('.home', timeout=30000)
    pg.goto(sg_lib.BASE + '#/play'); time.sleep(3)
    pg.evaluate(sg_lib.SEED, [[k for k in pg.evaluate("[...document.querySelectorAll('.home .node[data-key]')].map(b => b.dataset.key)") if k < 'L1.04'][:8]])
    pg.evaluate('window.__engine.app.home()'); time.sleep(1.2)
    pg.click('.play-big'); fs = []
    for i in range(8): f = out / f'les-{i}.png'; pg.screenshot(path=str(f)); fs.append(f); time.sleep(0.5)
    for n in range(2):
        try: pg.click('.sitting .btn.tap, .sitting .btn.next', timeout=3000)
        except Exception: pass
        for i in range(2): f = out / f'les-n{n}{i}.png'; pg.screenshot(path=str(f)); fs.append(f); time.sleep(0.6)
    strip(fs[:6], 'lesson-strip.png'); strip(fs[6:], 'lesson-strip2.png'); print('errors', errs[:3], len(fs))
