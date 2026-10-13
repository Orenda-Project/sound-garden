#!/usr/bin/env python3
"""Short GIFs of the real motion for the README: python3 tools/make_gifs.py OUTDIR [BASE_URL]
hero.gif (landing, 1280 wide scaled to 640), hatch.gif (first run), celebrate.gif (end of a lesson), home.gif (garden Home). Frames are real screenshots taken back to back,
the GIF plays them at the time they were taken, so the speed is honest (screenshots cost about 80-150 ms each, so these look choppier than the live page)."""
import sys, time, pathlib, io
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / 'so-compat/tools'))
import sg_lib, _onb
from playwright.sync_api import sync_playwright
from PIL import Image
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
base = sys.argv[2] if len(sys.argv) > 2 else sg_lib.BASE
def grab(pg, secs, width, name, clip=None):
    frames, stamps = [], []; t0 = time.time()
    while time.time() - t0 < secs:
        b = pg.screenshot(type='jpeg', quality=72, clip=clip); stamps.append(time.time()); im = Image.open(io.BytesIO(b)).convert('RGB')
        frames.append(im.resize((width, int(im.height * width / im.width)), Image.LANCZOS))
    dur = [max(40, int((stamps[i + 1] - stamps[i]) * 1000)) for i in range(len(stamps) - 1)] + [200]
    pal = [f.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) for f in frames]
    pal[0].save(out / name, save_all=True, append_images=pal[1:], duration=dur, loop=0, optimize=True); print(name, len(frames), 'frames', (out / name).stat().st_size // 1024, 'KB')
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 800}); pg = ctx.new_page()
    pg.goto(base + '#/'); pg.wait_for_timeout(300); grab(pg, 4.5, 640, 'hero.gif'); ctx.close()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
    pg.goto(base + '#/play'); pg.wait_for_selector('.hatch-seed', timeout=20000); pg.wait_for_timeout(900); pg.click('.hatch-seed'); grab(pg, 3.4, 240, 'hatch.gif'); ctx.close()
    pg, errs = sg_lib.app(p, 'A', query='?fast=1', scale=1); sg_lib.seed_to(pg, 'L1.05'); pg.evaluate('window.__so.app.home()'); grab(pg, 3.0, 240, 'home.gif')
    pg.evaluate("window.__so.endDemo('L1.05:A:A', {passed:true})"); grab(pg, 5.0, 240, 'celebrate.gif'); print('errors', errs[:3])
