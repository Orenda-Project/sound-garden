import sys; sys.path.insert(0, 'tools')
from sg_lib import *
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    pg, errs = app(p, "A")
    shot(pg, "home0"); seed_to(pg, "L1.05"); shot(pg, "home1")
    seed_to(pg, "L2.07"); shot(pg, "home2"); seed_to(pg, "L3.10"); shot(pg, "home3")
    pg.evaluate("window.__so.gardenLevel = 2"); home(pg); shot(pg, "home3-lv2")
    print(errs[:4])
    pg2, e2 = app(p, "B"); seed_to(pg2, "L1.05"); shot(pg2, "homeB"); shot(pg2, "homeBfull", full=True); print(e2[:3])
