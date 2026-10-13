#!/usr/bin/env python3
"""Frame-time check under a throttled CPU (a mid phone is about 4x slower than a laptop): python3 tools/fps_check.py [BASE] [--cpu 4]
Measures requestAnimationFrame intervals for 5 s on the landing hero, while scrolling the landing page, and on the garden Home. Reports fps, p95 frame time and frames over 33 ms.
Pass (a 30 fps floor at 4x slower CPU, which is what this laptop-with-no-GPU test can honestly show; 60 fps on a real phone GPU is NOT demonstrated here):
hero and garden Home >= 30 fps, scroll and celebration >= 25 fps. For reference the Cookling prototype scores about 49 fps in the same run."""
import sys, time, pathlib, statistics
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / 'so-compat/tools'))
import sg_lib, _onb
from playwright.sync_api import sync_playwright
base = next((a for a in sys.argv[1:] if a.startswith('http')), sg_lib.BASE); cpu = int(sys.argv[sys.argv.index('--cpu') + 1]) if '--cpu' in sys.argv else 4
JS = """async (ms) => new Promise(res => { const d = []; let last = performance.now(), t0 = last; const f = (t) => { d.push(t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else res(d); }; requestAnimationFrame(f); })"""
def report(name, d):
    d = d[3:]; d.sort(); fps = 1000 / (sum(d) / len(d)); p95 = d[int(len(d) * .95)]; over = sum(1 for x in d if x > 33.4) / len(d)
    print(f'{name:28} fps {fps:5.1f}  p95 {p95:5.1f} ms  >33ms {100 * over:4.1f}%  worst {d[-1]:5.1f} ms'); return fps
bad = False
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2); pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
    pg.goto(base + '#/'); pg.wait_for_timeout(2500)
    f = report(f'landing hero (cpu x{cpu})', pg.evaluate(JS, 5000)); bad |= f < 30
    pg.evaluate("(async()=>{const H=document.documentElement.scrollHeight;let y=0;const t0=performance.now();while(y<H-800){window.scrollTo(0,y);y+=14;await new Promise(r=>requestAnimationFrame(r))}})()")
    d = pg.evaluate("""async () => new Promise(res => { const d = []; let last = performance.now(), y = 0; const H = document.documentElement.scrollHeight; const f = (t) => { d.push(t - last); last = t; y += 16; window.scrollTo(0, y); if (y < H - 900) requestAnimationFrame(f); else res(d); }; window.scrollTo(0, 0); requestAnimationFrame(f); })""")
    f = report(f'landing scroll (cpu x{cpu})', d); bad |= f < 25
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    pg.goto(base + '?fast=1#/play'); _onb.walk(pg, 'A'); pg.wait_for_selector('.home'); sg_lib.seed_to(pg, 'L1.05'); pg.wait_for_timeout(2500)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
    f = report(f'garden Home (cpu x{cpu})', pg.evaluate(JS, 5000)); bad |= f < 30
    pg.evaluate("window.__so.endDemo('L1.05:A:A', {passed:true})"); pg.wait_for_timeout(600)
    f = report(f'celebration (cpu x{cpu})', pg.evaluate(JS, 4000)); bad |= f < 25
    b.close()
print('FPS CHECK', 'RED' if bad else 'GREEN'); sys.exit(1 if bad else 0)
