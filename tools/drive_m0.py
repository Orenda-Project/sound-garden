#!/usr/bin/env python3
"""M0 drive script: mouse only, 390x844. Run `npm run build` first.
   python3 tools/drive_m0.py [--url https://.../]   (default: starts `npm run preview`)"""
import json, os, subprocess, sys, time, gzip, urllib.request
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
os.makedirs("shots/m0", exist_ok=True)
url = sys.argv[sys.argv.index("--url") + 1] if "--url" in sys.argv else "http://localhost:4173/"
srv = None
if "--url" not in sys.argv:
    srv = subprocess.Popen(["npm", "run", "preview"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try: urllib.request.urlopen(url); break
        except Exception: time.sleep(.2)
fails = []
def ck(name, ok, info=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{info}]" if info else ""), flush=True)
    if not ok: fails.append(name)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        pg = ctx.new_page()
        errs, reqs, redirects = [], [], []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("request", lambda r: (reqs.append(r.url), redirects.append(r.url) if r.redirected_from else None))
        pg.goto(url + "?test=1"); pg.wait_for_selector(".seed")
        pre_tap = list(reqs)
        ck("zero input/select/textarea (landing)", pg.locator("input, select, textarea").count() == 0)
        pg.screenshot(path="shots/m0/ours-landing.png")
        n_before = len([r for r in reqs if r.endswith(".ogg")])
        pg.click(".seed")
        pg.wait_for_selector(".opt", timeout=8000)
        time.sleep(1.2)
        ogg = [r for r in reqs if r.endswith(".ogg")]
        ck("audio .ogg requested after seed tap", len(ogg) > n_before, f"{len(ogg)} requests")
        ck("one tap from / to first lesson item", pg.url.endswith("#/lesson/L1.01"))
        ck("zero input/select/textarea (lesson)", pg.locator("input, select, textarea").count() == 0)
        pg.screenshot(path="shots/m0/ours-question.png")
        pg.locator(".opt:not([data-correct])").first.click()
        pg.wait_for_selector(".fb.wrong"); time.sleep(.3); pg.screenshot(path="shots/m0/ours-wrong.png")
        ck("no watering on a wrong answer", pg.evaluate("window.__sg.wateredAt") is None)
        pg.click(".tile.target .opt", force=True)
        pg.wait_for_function("document.querySelector('.fb') && !document.querySelector('.fb.wrong')", timeout=6000)
        pg.wait_for_selector(".opt[data-correct]"); time.sleep(.2)
        pg.click(".opt[data-correct]")
        pg.wait_for_selector(".fb.right"); time.sleep(.3); pg.screenshot(path="shots/m0/ours-right.png")
        t = pg.evaluate("[window.__sg.tapAt, window.__sg.wateredAt]")
        dt = (t[1] - t[0]) if t[0] and t[1] else None
        ck("first watering under 90 s after seed tap", dt is not None and dt < 90000, f"{dt:.0f} ms" if dt else "no watering")
        ck("garden peek shown", pg.locator(".peek").count() == 1)
        ck("right state: prompt hidden, Next shown, nothing overlays tiles", pg.locator(".prompt").evaluate("e=>getComputedStyle(e).visibility")=="hidden" and pg.locator("[data-next]").is_visible() and not pg.evaluate("(()=>{const r=document.querySelector('.opts').getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+10);return !!e.closest('.peek')})()"))
        ck("right state: tiles disabled+dimmed, Next solid hero green", pg.locator(".opt:enabled").count() == 0 and pg.locator(".tile.dim").count() == pg.locator(".tile").count() and pg.evaluate("(()=>{const b=document.querySelector('[data-next]');const r=b.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return getComputedStyle(b).backgroundColor=='rgb(76, 184, 43)' && (top===b)})()"))
        peek_alive = pg.locator(".peek").count() == 1
        before = pg.evaluate("document.querySelector('.bar i').style.transform")
        pg.click("[data-next]")
        pg.wait_for_function("document.querySelector('.fb') && !document.querySelector('.fb.right')", timeout=3000)
        ck("tap during peek cuts it and lands on Next", pg.locator(".peek").count() == 0 and pg.locator(".opt").count() >= 3, f"peek alive at click: {peek_alive}")
        # wrong state on the 2nd item: outlined tile, pill on tile, one forward button
        pg.locator(".opt:not([data-correct])").first.click(); pg.wait_for_selector(".fb.wrong")
        ck("wrong state: no buttons but the outlined tile; exactly one enabled control", pg.locator(".pill").count() == 0 and not pg.locator("[data-next]").is_visible() and pg.locator("main button:enabled").count() == 1 and pg.locator(".tile.target .opt:enabled").count() == 1)
        pg.click(".tile.target .opt", force=True); pg.wait_for_function("!document.querySelector('.fb.wrong')", timeout=4000)
        time.sleep(.3)
        ck("progress bar advanced", pg.evaluate("document.querySelector('.bar i').style.transform") != before)
        for _ in range(40):
            if pg.locator(".done").count(): break
            try:
                if pg.locator(".fb.right").count(): pg.click("[data-next]", timeout=1500)
                else: pg.wait_for_selector(".opt[data-correct]", timeout=3000); pg.click(".opt[data-correct]", timeout=1500)
            except Exception: pass
            time.sleep(.25)
        pg.goto(url + "#/home") if False else None
        ck("S5 sitting done reached", pg.locator(".done").count() == 1 and "Sitting 1 of 4 done" in pg.inner_text(".done"))
        ck("no console errors", not errs, "; ".join(errs[:3]))
        origins = {r.split("/")[2] for r in reqs if r.startswith("http")}
        ck("one origin, no redirects", len(origins) == 1 and not redirects, f"{origins} redirects={len(redirects)}")
        gz = sum(len(gzip.compress(urllib.request.urlopen(u).read())) for u in pre_tap if u.startswith("http"))
        ck("pre-tap requests under 90 KB gzip (real requests)", gz < 90 * 1024, f"{gz/1024:.1f} KB across {len(pre_tap)} requests")
        AM = json.load(open("public/data/audio-map.json")); files = {v["file"] for v in AM.values() if v["file"]}
        bad = [u for u in ogg if u.rsplit("/", 1)[1] not in files]
        ck("every requested audio file is in audio-map", not bad, str(bad[:3]))
        b.close()
finally:
    if srv: srv.terminate()
print("\nRESULT:", "GREEN" if not fails else f"RED ({', '.join(fails)})")
sys.exit(1 if fails else 0)
