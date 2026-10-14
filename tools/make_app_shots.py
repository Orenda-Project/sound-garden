#!/usr/bin/env python3
"""Real app screenshots for the landing page's 'see it' section -> public/img/site/*.webp (390x844 @ 1x). Needs the dev server on :5390.
Uses the real app (still mode, so a frame is stable); nothing is mocked."""
import sys, time, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from sg_lib import *
from playwright.sync_api import sync_playwright
from PIL import Image
OUT = pathlib.Path(__file__).resolve().parent.parent / 'public/img/site'; OUT.mkdir(parents=True, exist_ok=True)
def save(name):
    Image.open(SHOTS / f'{name}.png').convert('RGB').save(OUT / f'{name}.webp', quality=80, method=6); print(name, (OUT / f'{name}.webp').stat().st_size // 1024, 'KB')
with sync_playwright() as p:
    pg, errs = app(p, 'A', query='?fast=1&still=1', scale=1)
    seed_to(pg, 'L1.05'); time.sleep(1.5); shot(pg, 'app-home'); save('app-home')
    pg.click('.play-big'); time.sleep(3); shot(pg, 'app-hear'); save('app-hear')
    pg.evaluate('window.__engine.app.home()'); time.sleep(0.8)
    pg.evaluate("window.__engine.endDemo('L1.05:A:A', {passed:true})"); time.sleep(6); shot(pg, 'app-done'); save('app-done')
    print(errs[:3])
