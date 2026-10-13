#!/usr/bin/env python3
"""Short GIFs of the real motion for the README: python3 tools/make_gifs.py OUTDIR [BASE_URL]
hero.gif (landing, 1280 wide scaled to 640), hatch.gif (first run), home.gif (garden Home), celebrate.gif (end of a lesson).
Playwright records a real video of each scene (about 25 frames per second) and ffmpeg turns the useful seconds into a GIF (15 fps, 96 colours)."""
import sys, time, pathlib, subprocess, tempfile, shutil
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / 'so-compat/tools'))
import sg_lib, _onb
from playwright.sync_api import sync_playwright
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
base = next((a for a in sys.argv[2:] if a.startswith('http')), sg_lib.BASE)
tmp = pathlib.Path(tempfile.mkdtemp(prefix='sggif'))
def gif(webm, name, start, secs, width, fps=15):
    vf = f'fps={fps},scale={width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=none'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(start), '-t', str(secs), '-i', str(webm), '-vf', vf, '-loop', '0', str(out / name)], check=True)
    print(name, (out / name).stat().st_size // 1024, 'KB')
T = {}
def newctx(b, w, h):
    T['t0'] = time.time(); d = tmp / f'v{time.time_ns()}'; return b.new_context(viewport={'width': w, 'height': h}, record_video_dir=str(d), record_video_size={'width': w, 'height': h}), d
def finish(ctx, pg, d):
    ctx.close(); v = pg.video; return pathlib.Path(v.path())
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx, d = newctx(b, 1280, 800); pg = ctx.new_page(); t0 = time.time()
    pg.goto(base + '#/'); pg.wait_for_timeout(500); pg.mouse.move(900, 500); pg.wait_for_timeout(1200); pg.mouse.move(300, 560, steps=25); pg.wait_for_timeout(900); pg.mouse.move(1000, 520, steps=25); pg.wait_for_timeout(1600)
    gif(finish(ctx, pg, d), 'hero.gif', 0.4, 5.5, 520, fps=12)
    ctx, d = newctx(b, 390, 844); pg = ctx.new_page()
    pg.goto(base + '#/play'); pg.wait_for_selector('.hatch-seed', timeout=20000); pg.wait_for_timeout(1500); ts = time.time() - T['t0']; pg.click('.hatch-seed'); pg.wait_for_timeout(3300)
    gif(finish(ctx, pg, d), 'hatch.gif', max(0, ts - 0.9), 4.6, 260)
    # garden Home and the celebration: build a profile quickly in a normal context first, then record in a fresh context that shares the storage
    pg0, _e = sg_lib.app(p, 'A', query='?fast=1', scale=1); sg_lib.seed_to(pg0, 'L1.05')
    idb = pg0.evaluate("(async () => { const d = await new Promise(r => { const q = indexedDB.open('sound-out', 1); q.onsuccess = () => r(q.result); }); const all = (s) => new Promise(r => { const q = d.transaction(s).objectStore(s).getAll(); q.onsuccess = () => r(q.result); }); return { settings: await all('settings'), profiles: await all('profiles'), progress: await all('progress') }; })()")
    pg0.context.close()
    import json
    SET = "async (data) => { const d = await new Promise(r => { const q = indexedDB.open('sound-out', 1); q.onupgradeneeded = () => { for (const s of ['settings','profiles','progress']) if (!q.result.objectStoreNames.contains(s)) q.result.createObjectStore(s, { keyPath: s === 'settings' ? 'key' : 'id' }); }; q.onsuccess = () => r(q.result); }); for (const s of ['settings','profiles','progress']) await new Promise(r => { const t = d.transaction(s, 'readwrite'); for (const v of data[s]) t.objectStore(s).put(v); t.oncomplete = r; }); }"
    ctx, d = newctx(b, 390, 844); pg = ctx.new_page(); pg.goto(base + '?fast=1#/play'); pg.wait_for_timeout(800)
    try: pg.evaluate(SET, idb); pg.goto(base + '#/play'); pg.wait_for_selector('.home', timeout=30000)
    except Exception as e: print('state restore failed, falling back to a fresh walk', str(e)[:80])
    pg.wait_for_timeout(2600)
    ts = time.time() - T['t0']; pg.evaluate("window.__so.app.home()"); pg.wait_for_timeout(3600)
    gif(finish(ctx, pg, d), 'home.gif', max(0, ts - 0.2), 3.6, 260)
    ctx, d = newctx(b, 390, 844); pg = ctx.new_page(); pg.goto(base + '?fast=1#/play'); pg.wait_for_timeout(800)
    try: pg.evaluate(SET, idb); pg.goto(base + '#/play'); pg.wait_for_selector('.home', timeout=30000)
    except Exception as e: print('state restore failed', str(e)[:80])
    pg.wait_for_timeout(1500); ts = time.time() - T['t0']; pg.evaluate("window.__so.endDemo('L1.05:A:A', {passed:true})"); pg.wait_for_timeout(5200)
    gif(finish(ctx, pg, d), 'celebrate.gif', max(0, ts - 0.2), 5.0, 260)
    b.close()
shutil.rmtree(tmp, ignore_errors=True)
