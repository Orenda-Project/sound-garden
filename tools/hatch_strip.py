#!/usr/bin/env python3
"""Frame strip of the first-run hatch: python3 tools/hatch_strip.py OUTDIR. Fresh browser, #/play, tap the seed, 12 frames over ~2.4 s."""
import sys, time, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
base = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:5390/'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(base + '#/play'); pg.wait_for_selector('.hatch-seed', timeout=20000); time.sleep(1.0)
    fs = []
    f = out / 'h-pre.png'; pg.screenshot(path=str(f)); fs.append(f)
    pg.click('.hatch-seed')
    for i in range(11):
        f = out / f'h-{i}.png'; pg.screenshot(path=str(f)); fs.append(f); time.sleep(0.16)
    time.sleep(1.2); f = out / 'h-end.png'; pg.screenshot(path=str(f)); fs.append(f)
    ims = [Image.open(f) for f in fs]; w, h = ims[0].width // 2, ims[0].height // 2
    s = Image.new('RGB', (w * 6, h * 2))
    for i, im in enumerate(ims[:12]): s.paste(im.resize((w, h)), ((i % 6) * w, (i // 6) * h))
    s.save(out / 'hatch-strip.png'); print('errors', errs[:4])
