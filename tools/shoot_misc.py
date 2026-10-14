import sys, time; sys.path.insert(0, 'tools')
from sg_lib import *
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    pg, errs = app(p, "A"); seed_to(pg, "L1.05")
    pg.evaluate("window.__engine.app.practice()"); pg.wait_for_selector(".ph"); time.sleep(0.8); shot(pg, "practiceA")
    pg.click(".ph-act[data-act=trace]"); pg.wait_for_selector("canvas.trace"); time.sleep(0.8); shot(pg, "traceA")
    pg.evaluate("window.__engine.app.sayIt()"); pg.wait_for_selector(".sayit"); time.sleep(1.0); shot(pg, "sayitA")
    pg.evaluate("window.__engine.app.grownups()"); time.sleep(1.0); shot(pg, "gate")
    print(errs[:3])
    pg2, e2 = app(p, "B"); seed_to(pg2, "L1.05")
    pg2.evaluate("window.__engine.app.practice()"); pg2.wait_for_selector(".ph"); time.sleep(0.8); shot(pg2, "practiceB")
    pg2.evaluate("window.__engine.app.sayIt()"); pg2.wait_for_selector(".sayit"); time.sleep(1.0); shot(pg2, "sayitB")
    print(e2[:3])
