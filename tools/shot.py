#!/usr/bin/env python3
"""Quick screenshot: python3 tools/shot.py <url-hash> <out.png> [--w 390 --h 844] [--click sel ...]"""
import sys, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('hash'); ap.add_argument('out'); ap.add_argument('--w', type=int, default=390); ap.add_argument('--h', type=int, default=844)
ap.add_argument('--base', default='http://localhost:5390/'); ap.add_argument('--click', action='append', default=[]); ap.add_argument('--wait', type=int, default=1500)
a = ap.parse_args()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': a.w, 'height': a.h}, device_scale_factor=2)
    errs = []; pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(a.base + '?still=1&fast=1' + a.hash); pg.wait_for_timeout(a.wait)
    for c in a.click: pg.click(c); pg.wait_for_timeout(a.wait)
    pg.screenshot(path=a.out); print('errors:', errs[:5]); b.close()
