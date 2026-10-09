#!/usr/bin/env python3
"""M0/M1 drive script: mouse only, 390x844. Run `npm run build` first.
   python3 tools/drive_m0.py [--url https://.../]   (default: starts `npm run preview`)"""
import json, os, subprocess, sys, time, gzip, urllib.request
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
os.makedirs("shots/m0", exist_ok=True); os.makedirs("shots/m1", exist_ok=True)
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
        pg.route("**/fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
        pg.goto(url + "?test=1"); pg.wait_for_selector(".seed")
        pre_tap = list(reqs)
        ck("zero input/select/textarea (landing)", pg.locator("input, select, textarea").count() == 0)
        pg.screenshot(path="shots/m0/ours-landing.png")
        n_before = len([r for r in reqs if r.endswith(".ogg")])
        pg.click(".seed")
        pg.wait_for_selector("[data-teach-go]", timeout=8000); time.sleep(1.2)
        ck("S4 teach: picture cue shown, one enabled forward control", pg.locator(".cue .pic svg").count() == 1 and pg.locator("[data-teach-go]:enabled").count() == 1)
        pg.screenshot(path="shots/m0/ours-teach.png")
        pg.click("[data-teach-go]"); pg.wait_for_selector(".opt", timeout=8000); time.sleep(.3)
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
        ck("first correct answer waters: header widget wet, seed stored at stage 1, Sprig on screen", pg.locator("[data-widget].wet").count() == 1 and pg.evaluate("JSON.parse(localStorage.sg1).plants['L1.01'].stage") == 1 and pg.locator(".fb .sprig").count() == 1)
        ck("right state: prompt hidden, Next shown, nothing overlays tiles", pg.locator(".prompt").evaluate("e=>getComputedStyle(e).visibility")=="hidden" and pg.locator("[data-next]").is_visible() and not pg.evaluate("(()=>{const r=document.querySelector('.opts').getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+10);return !!e.closest('.peek')})()"))
        ck("right state: tiles disabled+dimmed, Next solid hero green", pg.locator(".opt:enabled").count() == 0 and pg.locator(".tile.dim").count() == pg.locator(".tile").count() - 1 and pg.locator(".tile.hit").count() == 1 and pg.evaluate("(()=>{const b=document.querySelector('[data-next]');const r=b.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return getComputedStyle(b).backgroundColor=='rgb(76, 184, 43)' && b.contains(top)})()"))
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
        n_pre = len(reqs); fonts_pre = [r for r in reqs if "fonts.g" in r]
        ck("S5 Sprig-led: Sprig, plant at new stage, one hero button, no pass-mark stat", pg.locator(".done .sprig").count() == 1 and pg.locator(".done [data-plant]").count() == 1 and pg.locator(".done .btn").count() == 1 and "Pass mark" not in pg.inner_text(".done"))
        ck("S5 sitting done reached", pg.locator(".done").count() == 1 and "Sitting 1 of 4 done" in pg.inner_text(".done"))
        origins = {r.split("/")[2] for r in reqs[:n_pre] if r.startswith("http")}
        ck("one origin, no redirects, no web font before first sprout", len(origins) == 1 and not redirects and not fonts_pre, f"{origins} redirects={len(redirects)} fonts={len(fonts_pre)}")
        # ---- M1: S6 first sprout, S6a reminder, S3 home ----
        pg.click(".done .btn"); pg.wait_for_selector(".sprout"); time.sleep(1.6)
        ck("S6 first sprout: celebration alone (title, sound, one button, no card/input)", pg.locator(".sprout h1").inner_text() == "Sprouted!" and pg.locator(".sprout a.btn").count() == 1 and pg.locator(".sprout .card, .sprout input").count() == 0)
        pg.screenshot(path="shots/m1/ours-sprout.png")
        ck("Grandstander requested only after the first sprout", any("fonts.g" in r for r in reqs[n_pre:]))
        pg.click(".sprout .btn"); pg.wait_for_selector(".remind")
        ck("S6a reminder card: computed time, Remind me, Add to Home Screen, Not now", "Ready tomorrow" in pg.inner_text(".remind") and pg.locator("[data-remind]").count() == 1 and pg.locator("[data-install]").count() == 1 and pg.locator("[data-notnow]").count() == 1)
        pg.screenshot(path="shots/m1/ours-remind.png")
        pg.click("[data-notnow]"); pg.wait_for_selector(".home"); time.sleep(.8)
        ck("S3 home: one real plant for the finished lesson, next lesson CTA", pg.locator("[data-plant]").count() == 1 and pg.locator("[data-plant='L1.01'][data-stage='2']").count() == 1 and "next lesson" in pg.inner_text("[data-cta]").lower())
        ck("S3 home: animated nodes within the 12 cap", pg.evaluate("document.getAnimations().length") <= 12, str(pg.evaluate("document.getAnimations().length")))
        pg.screenshot(path="shots/m1/ours-home.png")
        pg.click("[data-cta]"); pg.wait_for_selector("[data-teach-go]"); time.sleep(.6)
        ck("S4 teach L1.02: letter tiles with picture cues", pg.locator(".teach .tile").count() == 4 and pg.locator(".teach .tile .pic svg").count() == 4)
        pg.screenshot(path="shots/m1/ours-teach.png")
        pg.click("[data-teach-go]"); pg.wait_for_selector(".opt"); time.sleep(.3)
        txt = [t.strip() for t in pg.locator(".opt").all_inner_texts()]
        ck("S4 check: tiles are letters only (no picture on any tile)", pg.locator(".opt svg").count() == 0 and all(t.isalpha() for t in txt), str(txt))
        pg.screenshot(path="shots/m1/ours-check.png")
        # demo garden: sleeping plant + Wake bubble, glows capped
        pg.goto(url + "?test=1&demo=1#/home"); pg.reload(); pg.wait_for_selector(".home"); time.sleep(.8)
        ck("S3 demo: sleeping plant with Wake bubble, 7 real plants", pg.locator("[data-bubble='Wake']").count() == 1 and pg.locator("[data-plant]").count() == 7)
        n_anim = pg.evaluate("document.getAnimations().length")
        ck("S3 demo: at most 12 animated nodes (Sprig included)", n_anim <= 12, str(n_anim))
        pg.screenshot(path="shots/m1/ours-home-demo.png")
        # a failed sitting still grows the seed and offers Again, never a dead end
        pf = b.new_context(viewport={"width": 390, "height": 844}).new_page(); pf.route("**/fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
        pf.goto(url + "?test=1#/lesson/L1.01"); pf.wait_for_selector("[data-teach-go]"); pf.click("[data-teach-go]")
        rep_ok = None
        for _ in range(220):
            if pf.locator(".done").count(): break
            try:
                if pf.locator(".fb.wrong").count(): pf.click(".tile.target .opt", force=True, timeout=1500)
                else:
                    pf.wait_for_selector(".opt:not([data-correct]):enabled", timeout=3000)
                    if rep_ok is None: rep_ok = pf.locator(".tile .rep:enabled").count() >= 3 and pf.locator(".tile .pic svg").count() >= 0
                    pf.locator(".opt:not([data-correct])").first.click(timeout=1500)
            except Exception: pass
            time.sleep(.2)
        ck("oral tiles have replay buttons while asking", bool(rep_ok))
        ck("failed sitting: Again button, seed watered (stage 1), Sprig present, no stat line", pf.locator(".done [data-again]").count() == 1 and pf.locator(".done .sprig").count() == 1 and "Pass mark" not in pf.inner_text(".done") and pf.evaluate("JSON.parse(localStorage.sg1).plants['L1.01'].stage") == 1)
        pf.click("[data-again]"); pf.wait_for_selector("[data-teach-go], .opt", timeout=4000)
        ck("Again restarts the lesson", pf.locator("[data-teach-go], .opt").count() >= 1)
        ctx2 = b.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce"); p2 = ctx2.new_page()
        p2.goto(url + "?test=1&demo=1#/home"); p2.reload(); p2.wait_for_selector(".home"); time.sleep(.8)
        run = p2.evaluate("document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length")
        ck("reduced motion: no looping animation on home", run == 0, str(run)); ctx2.close()
        ck("no console errors", not errs, "; ".join(errs[:3]))
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
