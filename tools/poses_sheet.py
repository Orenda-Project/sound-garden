#!/usr/bin/env python3
"""Contact sheets of mascot poses (blind-critic material): Sprig's moods from /sprig-demo.html, and the Cookling prototype's moods. python3 tools/poses_sheet.py OUTDIR"""
import sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
COOK = 'file:///home/oye/.claude/projects/-home-oye-Documents-free-work-personal-agent-v2/6d0c4282-9887-4864-9326-46cb2dbad5f7/tool-results/artifact-8472a8be-1791909067-24e0.html'
SP = ['idle', 'greet', 'speaking', 'listening', 'thinking', 'encourage', 'cheer', 'oops-soft', 'surprise', 'sleepy']
CK = ['idle', 'happy', 'cheer', 'sleepy', 'thinking', 'eating']
def sheet(files, name, cols=5):
    ims = [Image.open(f).convert('RGB') for f in files]; w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
    s = Image.new('RGB', (w * min(cols, len(ims)), h * rows), 'white')
    for i, im in enumerate(ims): s.paste(im, ((i % cols) * w, (i // cols) * h))
    s.save(out / name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 420, 'height': 700}); pg.goto('http://localhost:5390/sprig-demo.html'); pg.wait_for_timeout(600)
    fs = []
    for n in SP:
        pg.evaluate(f"window.sprig.setState('{n}')"); pg.wait_for_timeout(1050 if n not in ('cheer', 'encourage') else 380)
        f = out / f'sprig-{n}.png'; pg.locator('#stage').screenshot(path=str(f)); fs.append(f)
    sheet(fs, 'sprig-poses.png', 5)
    # a hop, frame by frame (cheer): 6 frames 110 ms apart
    pg.evaluate("window.sprig.setState('idle')"); pg.wait_for_timeout(700); pg.evaluate("window.sprig.setState('cheer')")
    hs = []
    for i in range(6): pg.wait_for_timeout(95); f = out / f'sprig-hop{i}.png'; pg.locator('#stage').screenshot(path=str(f)); hs.append(f)
    sheet(hs, 'sprig-hop.png', 6)
    pg2 = b.new_page(viewport={'width': 390, 'height': 844}); pg2.goto(COOK); pg2.wait_for_timeout(1000); pg2.evaluate('window.cookling.go(2)'); pg2.wait_for_timeout(2500)
    fs = []
    for n in CK:
        pg2.evaluate(f"window.cookling.C.m.setMood('{n}')"); pg2.wait_for_timeout(1000 if n != 'cheer' else 450)
        f = out / f'cook-{n}.png'; pg2.locator('#crHome').screenshot(path=str(f)); fs.append(f)
    sheet(fs, 'cookling-poses.png', 5)
    pg2.evaluate("window.cookling.C.m.setMood('idle')"); pg2.wait_for_timeout(700); pg2.evaluate("window.cookling.C.m.setMood('cheer')"); hs = []
    for i in range(6): pg2.wait_for_timeout(95); f = out / f'cook-hop{i}.png'; pg2.locator('#crHome').screenshot(path=str(f)); hs.append(f)
    sheet(hs, 'cookling-hop.png', 6); print('ok')
