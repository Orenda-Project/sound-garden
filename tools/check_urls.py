#!/usr/bin/env python3
"""URL + browser-Back gate (needs the dev server on :5390 or --base). Landing seed -> #/play; Home -> a lesson changes the URL; the browser Back
button goes back one app step (lesson -> Home -> landing); shared links open the right screen; a reload mid-lesson lands on Home; the teacher page links resolve."""
import sys, time; sys.path.insert(0, 'tools')
from sg_lib import *
from playwright.sync_api import sync_playwright
bad = []
def ok(c, m):
    print(('ok   ' if c else 'FAIL ') + m); 
    if not c: bad.append(m)
def hsh(pg): return pg.evaluate("location.hash")
with sync_playwright() as p:
    pg, errs = app(p, "A", walk=False, query="?fast=1&still=1")
    pg.goto(BASE + "?fast=1&still=1"); pg.wait_for_selector(".landing .seed")
    pg.click(".landing .seed"); pg.wait_for_selector(".splash-play, .whocard", timeout=30000); ok(hsh(pg) == "#/play", f"seed tap goes to #/play ({hsh(pg)})")
    import _onb; _onb.walk(pg, "A"); pg.wait_for_selector(".home"); time.sleep(0.5); ok(hsh(pg) == "#/play", "Home URL is #/play")
    pg.evaluate("document.querySelector('.play-big').click()"); pg.wait_for_selector(".sitting", timeout=20000); time.sleep(0.5)
    ok(hsh(pg).startswith("#/play/lesson/L"), f"a sitting has a lesson URL ({hsh(pg)})")
    pg.go_back(); time.sleep(1.2); ok(pg.locator(".home").count() == 1, "browser Back from a sitting lands on Home")
    ok(hsh(pg) == "#/play", f"... and the URL is #/play again ({hsh(pg)})")
    pg.evaluate("window.__engine.app.practice()"); pg.wait_for_selector(".ph"); time.sleep(0.4); ok(hsh(pg) == "#/play/practice", f"Practice URL ({hsh(pg)})")
    pg.go_back(); time.sleep(1.2); ok(pg.locator(".home").count() == 1, "browser Back from Practice lands on Home")
    seed_to(pg, "L1.03")   # Sound it out opens after L1.02
    pg.evaluate("window.__engine.app.sayIt()"); pg.wait_for_selector(".sayit", timeout=10000); time.sleep(0.5); ok(hsh(pg) == "#/play/sound-it-out", f"Sound it out URL ({hsh(pg)})")
    pg.go_back(); time.sleep(1.2); ok(pg.locator(".home").count() == 1, "browser Back from Sound it out lands on Home")
    # a shared link, same browser (profile exists)
    seed_to(pg, "L1.03")
    pg.goto(BASE + "?fast=1&still=1#/play/lesson/L1.03"); pg.reload(); time.sleep(2)   # reload = Home, by design
    ok(pg.locator(".home").count() == 1, "reload on a lesson link lands on Home (a half sitting is not resumable)")
    pg.goto("about:blank"); pg.goto(BASE + "?fast=1&still=1#/play/lesson/L1.03"); pg.wait_for_selector(".sitting, .home, .splash-play", timeout=20000); time.sleep(1.5)
    ok(pg.locator(".sitting").count() == 1, "a shared link opens that lesson's sitting")
    pg.goto("about:blank"); pg.goto(BASE + "?fast=1&still=1#/play/lesson/L4.16"); time.sleep(2.5)
    ok(pg.locator(".sitting").count() == 0, "a link to a locked lesson does NOT open it (Home instead)")
    pg.goto("about:blank"); pg.goto(BASE + "?fast=1&still=1#/play/practice"); pg.wait_for_selector(".ph", timeout=20000); ok(True, "#/play/practice opens the Practice area")
    pg.goto("about:blank"); pg.goto(BASE + "?fast=1&still=1#/teach"); pg.wait_for_selector("#tp-levels details", timeout=20000)
    links = pg.evaluate("[...document.querySelectorAll('.teachpage a[href$=\".pdf\"], #tp-guide')].map(a => a.href)")
    ok(len(links) > 100, f"teacher page lists {len(links)} PDF links")
    r = pg.request.get(links[0]); ok(r.status == 200 and r.body()[:4] == b"%PDF", "the Teach guide PDF is served")
    miss = [u for u in links if pg.request.get(u).status != 200]; ok(not miss, f"every PDF link resolves ({len(miss)} missing)")
    ok(not errs, f"no console errors {errs[:2]}")
print("URL GATE", "RED" if bad else "GREEN"); sys.exit(1 if bad else 0)
