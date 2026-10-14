#!/usr/bin/env python3
"""Frame strips of the app's motion: python3 tools/motion_strip.py OUTDIR  (dev server on :5390)
Writes OUTDIR/home-strip.png (garden Home growing in: 6 frames over 2.4 s), end-strip.png (celebration: 8 frames over 4 s), and a sitting frame strip.
Needs no still flag: this is the real motion."""
import sys, time, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from sg_lib import *
from playwright.sync_api import sync_playwright
from PIL import Image
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)

def strip(frames, name, scale=0.5):
    ims = [Image.open(f) for f in frames]; w, h = int(ims[0].width * scale), int(ims[0].height * scale)
    s = Image.new('RGB', (w * len(ims), h))
    for i, im in enumerate(ims): s.paste(im.resize((w, h)), (i * w, 0))
    s.save(out / name)

def grab(pg, n, gap, tag):
    fs = []
    for i in range(n):
        f = out / f'{tag}-{i}.png'; pg.screenshot(path=str(f)); fs.append(f); time.sleep(gap)
    return fs

with sync_playwright() as p:
    pg, errs = app(p, "A", query="?fast=1", scale=1)
    seed_to(pg, "L1.04")
    pg.evaluate("window.__engine.app.home()")
    strip(grab(pg, 6, 0.4, 'home'), 'home-strip.png')
    pg.evaluate("window.__engine.endDemo('L1.04:A:A', {passed:true})")
    strip(grab(pg, 8, 0.5, 'end'), 'end-strip.png')
    pg.evaluate("window.__engine.app.home()"); time.sleep(0.8)
    pg.click('.play-big'); time.sleep(0.2)
    strip(grab(pg, 6, 0.35, 'sit'), 'sit-strip.png')
    print('errors', errs[:4])
