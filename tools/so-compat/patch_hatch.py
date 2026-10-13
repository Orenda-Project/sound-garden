#!/usr/bin/env python3
"""Sound Garden's first run starts with a seed hatch (so-overlay/hatch.js): the Play button appears after a tap on the seed. This re-applies the drivers' matching tap (idempotent)."""
import pathlib
T = pathlib.Path(__file__).resolve().parent / 'tools'
TAP = '''    try:
        if page.locator(".hatch-seed").count(): page.click(".hatch-seed", force=True, timeout=1500); time.sleep(2.2)
    except Exception: pass   # a ?fast page hatches by itself
'''
p = T / '_onb.py'; s = p.read_text()
if 'hatch-seed' not in s:
    s = s.replace('    page.wait_for_selector(".splash-play, .whocard", timeout=15000)\n', '    page.wait_for_selector(".hatch-seed, .splash-play, .whocard", timeout=15000)\n' + TAP, 1); p.write_text(s)
p = T / 'check_nav.py'; s = p.read_text()
if 'hatch-seed' not in s:
    s = s.replace('    page.wait_for_selector(".splash-play, .whocard"); time.sleep(0.8)\n', '    page.wait_for_selector(".hatch-seed, .splash-play, .whocard"); time.sleep(0.8)\n' + TAP, 1)
    s = s.replace('    page.goto(f"http://localhost:{PORT}/?fast")      # the rest at test speed (the first load already made nothing: still no profile)\n    page.wait_for_selector(".splash-play, .whocard"); settle(page, "who", 20)', '    page.goto(f"http://localhost:{PORT}/?fast")      # the rest at test speed (the first load already made nothing: still no profile)\n    page.wait_for_selector(".hatch-seed, .splash-play, .whocard"); settle(page, "who", 20)', 1)
    p.write_text(s)
print('hatch tap patched')
