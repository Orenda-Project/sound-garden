#!/usr/bin/env python3
"""Pedagogy round 1, fix 2: a FAILED "Show what you know" is not a pass.

  python3 tools/check_failed_check.py [--port 5317]     (needs the app served on the port: dev server or a static build)

Track B, L1.02 (seeded: its teaching sittings passed). The check is answered wrong on purpose:
  1. try 1 fails -> end screen: 'Practise first', NO 'Keep going?'; L1.03 stays locked; the check stays open; reteach count 1
  2. home -> tapping the check goes to the reteach sitting first (trace 'reteach-redirect'), not straight back into it
  3. (reteach simulated as done) try 2 fails -> the check is PARKED + provisional: L1.03 opens, helperFlag is set, and the end screen says so
Exit 0 = green.
"""
import engine_compat  # Sound Garden: the app is at #/play
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from playwright.sync_api import sync_playwright
import _onb
ROOT = Path(__file__).resolve().parent.parent
LEX = json.loads((ROOT / "content/lexicon.json").read_text())
PORT = int(sys.argv[sys.argv.index("--port") + 1]) if "--port" in sys.argv else 5317
problems = []
def ok(cond, msg):
    print(("ok   " if cond else "FAIL ") + msg)
    if not cond: problems.append(msg)

SEED = """async ([keys]) => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value;
  const p = (await get('progress', pid)) || { id: pid, sittings: {}, lessons: {}, stickers: [], village: [], days: [], sittingCount: 0 };
  for (const k of keys) p.sittings[k] = { done: true, passed: true, correct: 0, judged: 0, at: Date.now() };
  await new Promise(res => { const t = d.transaction('progress', 'readwrite'); t.objectStore('progress').put(p); t.oncomplete = res; });
}"""
PATCH = """async ([key, patch]) => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value;
  const p = await get('progress', pid); Object.assign(p.sittings[key], patch);
  await new Promise(res => { const t = d.transaction('progress', 'readwrite'); t.objectStore('progress').put(p); t.oncomplete = res; });
}"""
PROG = """async () => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value; return await get('progress', pid);
}"""

def fail_check(page):
    """answer every gate wrong (both attempts), dictation right, until the end screen"""
    end = time.time() + 240
    while time.time() < end:
        time.sleep(0.2)
        if page.locator(".endscreen").count(): return
        nx = page.locator(".foot .btn.next:not([disabled]):not([hidden])")
        if nx.count(): nx.first.click(); continue
        picks = page.locator(".options:not(.three):not(.l1-opts) .opt-pick:not([disabled])")
        if picks.count() in (3, 4):
            page.locator(".opt:not([data-cell=target]) .opt-pick").first.click(); time.sleep(0.3); continue
        if page.locator(".slot").count() and page.locator(".tray .tilebtn[data-g]:not([disabled])").count():
            wd = page.get_attribute(".speaker.big", "data-key").split(":", 1)[1]
            empty = page.locator(".slot:not([data-g])").count()
            if empty:
                i = len(LEX[wd]["g"]) - empty
                page.locator(f".tray .tilebtn[data-g='{LEX[wd]['g'][i]}']:not([disabled])").first.click(); time.sleep(0.15)
            continue
    raise AssertionError("no end screen")

with sync_playwright() as pw:
    br = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    page = br.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce").new_page()
    errs = []; page.on("pageerror", lambda e: errs.append(str(e)))
    page.goto(f"http://localhost:{PORT}/?fast"); page.set_default_timeout(8000)
    _onb.walk(page, "B")
    plan = page.evaluate("[...document.querySelectorAll('.home .node[data-key]')].map(b => b.dataset.key)")
    X = "L1.02:B:X"; NEXT = "L1.03:B:ABC"
    i0 = plan.index(X)
    # L1.01 and L1.02's teaching sittings passed
    page.evaluate(SEED, [plan[:i0]]); page.evaluate("window.__engine.app.home()"); page.wait_for_selector(".home .node", state="attached"); time.sleep(0.3)
    ok(page.locator(f".node[data-key='{X}']").count() == 1 and not page.locator(f".node.locked[data-key='{X}']").count(), "check is open")
    ok(page.locator(f".node.locked[data-key='{NEXT}']").count() == 1, "next lesson locked before the check")
    page.click(f".node[data-key='{X}']"); page.wait_for_selector(".sitting")
    fail_check(page)
    ok(page.locator(".endscreen .retry").count() == 1, "try 1 failed: 'Practise first' offered")
    ok(page.locator(".endscreen .keepgoing").count() == 0, "try 1 failed: no 'Keep going?'")
    ok("Well done" not in page.inner_text(".endscreen"), "try 1 failed: no 'Well done!'")
    p = page.evaluate(PROG); rec = p["sittings"][X]
    ok(rec["passed"] is False and rec["reteach"] == 1 and not rec.get("parked"), f"record: passed False, reteach 1, not parked ({rec})")
    page.click(".endscreen .btn.ghost"); page.wait_for_selector(".home .node", state="attached"); time.sleep(0.3)
    ok(page.locator(f".node.locked[data-key='{NEXT}']").count() == 1, "try 1 failed: next lesson STILL locked on Home")
    ok(page.locator(f".node.locked[data-key='{X}']").count() == 0, "try 1 failed: the check stays current (open)")
    page.evaluate("window.__engine.trace.length = 0")
    page.click(f".node[data-key='{X}']"); page.wait_for_selector(".sitting")
    rd = page.evaluate("window.__engine.trace.filter(e => e.type === 'reteach-redirect')")
    ok(len(rd) == 1 and rd[0]["to"] != X, f"tapping the check goes to the reteach sitting first ({rd})")
    page.evaluate("window.__engine.app.home()"); page.wait_for_selector(".home .node", state="attached")
    page.evaluate("window.__engine.trace.length = 0")
    page.evaluate(PATCH, [X, {"reteachDone": 1}])   # the reteach sitting itself is covered by drive.py; here only the gate logic
    page.click(f".node[data-key='{X}']"); page.wait_for_selector(".sitting")
    ok(page.evaluate("!window.__engine.trace.some(e => e.type === 'reteach-redirect')"), "after the reteach the check runs itself")
    fail_check(page)
    p = page.evaluate(PROG); rec = p["sittings"][X]
    ok(rec["parked"] is True and rec["provisional"] is True and rec["reteach"] == 2 and not rec["passed"], f"try 2 failed: parked + provisional ({rec})")
    ok(bool(p.get("helperFlag")) and p["helperFlag"]["lessonId"] == "L1.02", "helper flag raised for the grown-up")
    ok("taking longer" in page.inner_text(".endscreen"), "end screen: 'This one is taking longer. That is common.'")
    page.click(".endscreen .btn.ghost"); page.wait_for_selector(".home .node", state="attached"); time.sleep(0.3)
    ok(page.locator(f".node.locked[data-key='{NEXT}']").count() == 0, "parked: the next lesson opens (a way forward)")
    ok(not errs, f"no page errors {errs}")
    br.close()
print("\n".join(["FAILED: " + x for x in problems]) if problems else "FAILED-CHECK PROOF GREEN")
sys.exit(1 if problems else 0)
