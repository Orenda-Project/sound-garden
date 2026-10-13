import sys; sys.path.insert(0, 'tools')
from sg_lib import *
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    pg, errs = app(p, "A")
    shot(pg, "home0"); seed_to(pg, "L1.05"); shot(pg, "home1"); shot(pg, "home1full", full=True)
    seed_to(pg, "L2.04"); shot(pg, "home2")
    print(errs[:4])
