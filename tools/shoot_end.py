import sys, time; sys.path.insert(0, 'tools')
from sg_lib import *
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    pg, errs = app(p, "A"); seed_to(pg, "L1.04")
    pg.evaluate("window.__engine.endDemo('L1.04:A:A', {passed:true})"); time.sleep(4); shot(pg, "end1")
    print(errs[:3])
