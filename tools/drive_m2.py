#!/usr/bin/env python3
"""M2 drive: all 14 Level 1 lessons, one lesson each of L2/L3/L4 in ?dev=1, one L5 practice session, public lock + zone strip.
   Mouse only, 390x844. Run `npm run build` first.  python3 tools/drive_m2.py [--url https://.../]"""
import os, subprocess, sys, time, urllib.request
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
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

def walk(pg, lid, q, maxn=80):
    """answer every item correctly until the 'done' screen; returns items answered"""
    pg.goto(f"{url}?test=1{q}#/lesson/{lid}"); pg.reload()
    pg.wait_for_selector("[data-teach-go], .opt, .sg-soft", timeout=8000)
    if pg.locator("[data-teach-go]").count(): pg.click("[data-teach-go]"); pg.wait_for_selector(".opt", timeout=6000)
    n = 0
    for _ in range(maxn * 3):
        if pg.locator(".done").count(): break
        try:
            if pg.locator(".fb.right").count(): pg.click("[data-next]", timeout=1500)
            else: pg.wait_for_selector(".opt[data-correct]:enabled", timeout=3000); pg.click(".opt[data-correct]", timeout=1500); n += 1
        except Exception: pass
        time.sleep(.12)
    return n
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page()
        errs = []; pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.route("**/fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
        # ---- Level 1, every lesson ----
        for k in range(1, 15):
            lid = f"L1.{k:02d}"; n = walk(pg, lid, "")
            ck(f"{lid} walked to the done screen", pg.locator(".done").count() == 1, f"{n} answers")
        # ---- public build: later lessons are locked, zone strip shows 6 locked zones ----
        pg.goto(f"{url}?test=1#/lesson/L2.01"); pg.reload(); pg.wait_for_selector(".sg-soft")
        ck("public: L2.01 shows the soft sign, no player", "Sounds being recorded" in pg.inner_text(".sg-soft") and pg.locator(".opt").count() == 0)
        pg.goto(f"{url}?test=1#/home"); pg.reload(); pg.wait_for_selector(".zones"); time.sleep(.5)
        ck("public: 7 zone cards, 6 locked with a soft sign, no lesson links", pg.locator(".zone").count() == 7 and pg.locator(".zone.locked").count() == 6 and pg.locator(".zone .soft-sign").count() == 6 and pg.locator(".zones a.plot").count() == 0)
        pg.locator(".strip").evaluate("e => e.scrollTo(e.scrollWidth, 0)"); time.sleep(.6)
        ck("zone 7 terrain drawn lazily on scroll", pg.locator("[data-art='7'] svg").count() == 1)
        # ---- dev mode: one lesson each of L2, L3, L4 ----
        for lid in ("L2.01", "L3.01", "L4.01", "L2.14"):
            n = walk(pg, lid, "&dev=1")
            need = 20 if lid == "L2.14" else 12
            ck(f"dev {lid}: walked to the done screen, {need} items", pg.locator(".done").count() == 1 and n >= need, f"{n} answers")
        # audio coming pill appears when a placeholder clip plays
        pg.goto(f"{url}?test=1&dev=1#/lesson/L2.02"); pg.reload(); pg.wait_for_selector(".opt"); pg.click(".opt[data-correct]")
        try: pg.wait_for_selector(".sg-coming:not([hidden])", timeout=6000); got = True
        except Exception: got = False
        ck("dev L2: 'Audio coming' state shown for a placeholder clip", got)
        pg.goto(f"{url}?test=1&dev=1#/home"); pg.reload(); pg.wait_for_selector(".zones a.plot")
        ck("dev: zone plots link to lessons", pg.locator(".zones a.plot").count() >= 1)
        # ---- L5 practice session ----
        pg.goto(f"{url}?test=1&dev=1#/lesson/L5.01"); pg.reload(); pg.wait_for_selector("[data-practice]")
        steps = 0
        while pg.locator("[data-next]").count() and steps < 14: pg.click("[data-next]"); steps += 1; time.sleep(.08)
        ck("L5.01 practice session walked to the end, no pass mark", pg.locator("[data-step='done']").count() == 1 and "pass" not in pg.inner_text("main").lower(), f"{steps} screens")
        ck("L5.01 marked practised in the store", pg.evaluate("!!JSON.parse(localStorage.sg1).practice['L5.01']"))
        pg.goto(f"{url}?test=1#/lesson/L5.01"); pg.reload(); pg.wait_for_selector(".sg-soft")
        ck("public: L5.01 is locked", pg.locator("[data-practice]").count() == 0)
        ck("no console errors", not errs, "; ".join(errs[:3]))
        b.close()
finally:
    if srv: srv.terminate()
print("\nRESULT:", "GREEN" if not fails else f"RED ({', '.join(fails)})")
sys.exit(1 if fails else 0)
