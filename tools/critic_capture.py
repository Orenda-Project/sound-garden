#!/usr/bin/env python3
"""Capture our five M0 screens from the LIVE site and pair them with the Duolingo bar shots.
   python3 tools/critic_capture.py [--url https://orenda-project.github.io/sound-garden/]"""
import json, os, shutil, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
URL = sys.argv[sys.argv.index("--url") + 1] if "--url" in sys.argv else "https://orenda-project.github.io/sound-garden/"
OUT = "shots/m0"; OUT1 = "shots/m1"; BAR = "research/shots/teardown"; os.makedirs(OUT, exist_ok=True); os.makedirs(OUT1, exist_ok=True)
Q = "Which screen makes it clearer what to do next? Answer A, B, or equal, then one sentence."
PAIRS = [  # (id, our screen, bar source file); bar names are the ones in M0-CHECKLIST section 9
    ("01", "our-01-seed.png", "duo-landing-m.png", "bar-01-landing.png"),
    ("02", "our-02-home.png", "duo-welcome-01-hi.png", "bar-02-welcome.png"),
    ("03", "our-03-sitting-end.png", "duo-lesson-m-1-question.png", "bar-03-question.png"),
    ("04", "our-04-right.png", "duo-lesson-m-2-correct.png", "bar-04-correct.png"),
    ("05", "our-05-wrong.png", "duo-lesson-m-3-wrong.png", "bar-05-wrong.png"),
]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={"width": 390, "height": 844}).new_page()
    shot = lambda n: pg.screenshot(path=f"{OUT}/{n}")
    pg.goto(URL + "?test=1"); pg.wait_for_selector(".seed"); time.sleep(.3); shot("our-01-seed.png")
    pg.route("**/fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
    pg.click(".seed"); pg.wait_for_selector("[data-teach-go]"); pg.click("[data-teach-go]"); pg.wait_for_selector(".opt")
    pg.locator(".opt:not([data-correct])").first.click(); pg.wait_for_selector(".fb.wrong"); time.sleep(.3); shot("our-05-wrong.png")
    pg.click(".tile.target .opt", force=True); pg.wait_for_function("!document.querySelector('.fb.wrong')", timeout=6000); pg.wait_for_selector(".opt[data-correct]"); time.sleep(.2)
    pg.click(".opt[data-correct]"); pg.wait_for_selector(".fb.right"); time.sleep(.3); shot("our-04-right.png")
    pg.click("[data-next]")
    for _ in range(60):
        if pg.locator(".done").count(): break
        try:
            if pg.locator(".fb.right").count(): pg.click("[data-next]", timeout=1500)
            else: pg.wait_for_selector(".opt[data-correct]", timeout=3000); pg.click(".opt[data-correct]", timeout=1500)
        except Exception: pass
        time.sleep(.25)
    pg.wait_for_selector(".done"); time.sleep(1.8); shot("our-03-sitting-end.png")
    pg.click(".done .btn"); pg.wait_for_selector(".sprout"); time.sleep(1.8); pg.screenshot(path=f"{OUT1}/our-06-sprout.png")
    pg.click(".sprout .btn"); pg.wait_for_selector(".remind"); time.sleep(.5); pg.screenshot(path=f"{OUT1}/our-07-remind.png")
    pg.click("[data-notnow]"); pg.wait_for_selector(".home"); time.sleep(.8); shot("our-02-home.png"); pg.screenshot(path=f"{OUT1}/our-03-home.png")
    pg.click("[data-cta]"); pg.wait_for_selector("[data-teach-go]"); time.sleep(.8); pg.screenshot(path=f"{OUT1}/our-04-teach.png")
    pg.goto(URL + "?test=1&demo=1#/home"); pg.reload(); pg.wait_for_selector(".home"); time.sleep(.9); pg.screenshot(path=f"{OUT1}/our-05-home-garden.png")
    b.close()
pairs = []
for i, ours, src, bar in PAIRS:
    shutil.copy(f"{BAR}/{src}", f"{OUT}/{bar}")
    for f in (ours,):
        kb = os.path.getsize(f"{OUT}/{f}") / 1024
        assert kb < 300, f"{f} is {kb:.0f} KB"
    pairs.append(dict(id=i, ours=f"{OUT}/{ours}", bar=f"{OUT}/{bar}", question=Q))
json.dump(pairs, open(f"{OUT}/pairs.json", "w"), indent=1)
print("wrote", len(pairs), "pairs;", ", ".join(f"{p['ours'].split('/')[-1]}={os.path.getsize(p['ours'])//1024}KB" for p in pairs))

# ---- M1 pairs: criteria are clarity, delight, calm of the text area, hierarchy (BUILD.md, from M1) ----
Q1 = "Which screen is better on (1) clarity of the next action, (2) delight, (3) calm of the text area, (4) hierarchy? Answer A or B or equal for each, then one sentence."
M1 = [  # (id, our shot, bar source file, bar copy name)
    ("06", "our-06-sprout.png", "duo-lesson-m-4-combo.png", "bar-06-celebration.png"),
    ("04", "our-04-teach.png", "duo-lesson-m-1-question.png", "bar-04-question.png"),
    ("03", "our-03-home.png", "tmtr-landing-m.png", "bar-03-landing.png"),
]
m1 = []
for i, ours, src, bar in M1:
    shutil.copy(f"{BAR}/{src}", f"{OUT1}/{bar}")
    assert os.path.getsize(f"{OUT1}/{ours}") < 300 * 1024, ours
    m1.append(dict(id=i, ours=f"{OUT1}/{ours}", bar=f"{OUT1}/{bar}", question=Q1))
# pair 05 (wrong state) is carried over from M0 into the M1 blind test, as asked
shutil.copy(f"{OUT}/our-05-wrong.png", f"{OUT1}/our-05-wrong.png"); shutil.copy(f"{OUT}/bar-05-wrong.png", f"{OUT1}/bar-05-wrong.png")
m1.append(dict(id="05", ours=f"{OUT1}/our-05-wrong.png", bar=f"{OUT1}/bar-05-wrong.png", question="Which screen makes it clearer what to do next? Answer A, B, or equal, then one sentence."))
json.dump(m1, open(f"{OUT1}/pairs.json", "w"), indent=1)
print("wrote", len(m1), "m1 pairs")
