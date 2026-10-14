#!/usr/bin/env python3
"""Drive the Practice hub (app/src/practice-hub.js) with Playwright at 390x844. Exit 0 = green.

  python3 tools/drive_practice.py [--port 5430] [--shots DIR]

Both tracks: onboarding -> Home has the Practice tile (even before anything is learned; nothing locked) -> empty hub is a kind note.
Seed L1.01-L1.02 passed (s, a, t): chips are exactly the learned sounds; tapping one plays ph:<x>:pure; "In a word" plays the anchor;
Trace it opens the trace screen, two traces return to the hub.
Seed more: "Which word?" runs its rounds with a miss first (no scores, no failure text, the missed word is said), only learned words appear
(Track A: pictures and no letters; Track B: words), ends with Again / Back.
Sound it out card, garden / days, print pages (link resolves, 200). No score / timer words, console clean, no missing clips.
"""
import engine_compat  # Sound Garden: the app is at #/play
import sys, time, re, urllib.request
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from pathlib import Path
from playwright.sync_api import sync_playwright
import _onb

ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
PORT = int(ARG("--port", "5430")); SHOTS = Path(ARG("--shots", "")) if ARG("--shots") else None
URL = f"http://localhost:{PORT}/?fast"
problems = []
SEED = """async ([keys]) => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value;
  const p = (await get('progress', pid)) || { id: pid, sittings: {}, lessons: {}, stickers: [], village: [], days: [], sittingCount: 0 };
  for (const k of keys) p.sittings[k] = { done: true, passed: true, correct: 0, judged: 0, at: Date.now() };
  p.days = [...new Set([...(p.days || []), '2026-10-01', '2026-10-02'])];
  await new Promise(res => { const t = d.transaction('progress', 'readwrite'); t.objectStore('progress').put(p); t.oncomplete = res; });
}"""
def check(ok, msg):
    if not ok: problems.append(msg); print("FAIL", msg)
    else: print("ok  ", msg)
def clips(page): return page.evaluate("window.__engine.trace.filter(e => e.type === 'audio').map(e => e.key)")
def home(page):
    page.evaluate("window.__engine.app.home()"); page.wait_for_selector(".home")
def seed_to(page, stop_prefix):
    home(page)
    plan = page.evaluate("[...document.querySelectorAll('.home .node[data-key]')].map(b => b.dataset.key)")
    i = next(i for i, k in enumerate(plan) if k.startswith(stop_prefix))
    page.evaluate(SEED, [plan[:i]]); home(page)
def shot(page, track, name):
    if SHOTS: SHOTS.mkdir(parents=True, exist_ok=True); page.screenshot(path=str(SHOTS / f"{track}_{name}.png"))
def open_hub(page):
    page.click(".ph-tile"); page.wait_for_selector(".ph"); time.sleep(0.3)
def trace_once(page):
    page.wait_for_function("() => !!window.__engine.traceGuide")
    tg = page.evaluate("window.__engine.traceGuide"); cv = page.locator("canvas.trace").bounding_box()
    x0, y0, x1, y1 = tg["box"]; k = cv["width"] / 300
    page.mouse.move(cv["x"] + x0 * k, cv["y"] + y0 * k); page.mouse.down(); y = y0
    while y <= y1:
        page.mouse.move(cv["x"] + x0 * k, cv["y"] + y * k, steps=3); page.mouse.move(cv["x"] + x1 * k, cv["y"] + y * k, steps=6); y += 7
    page.mouse.up(); time.sleep(0.6)

def run(br, track):
    ctx = br.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, reduced_motion="reduce")
    page = ctx.new_page(); errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); page.on("pageerror", lambda e: errs.append(str(e)))
    page.set_default_timeout(8000)
    page.goto(URL); _onb.walk(page, track); page.wait_for_selector(".home .node")
    T = f"[{track}]"
    check(page.locator(".ph-tile").count() == 1, f"{T} Home has the Practice entry before anything is learned")
    check(page.locator(".ph-tile .lock, .ph-tile.locked").count() == 0, f"{T} the entry is not locked")
    shot(page, track, "0_home")
    open_hub(page)
    check(page.locator(".ph-empty").count() == 1, f"{T} empty hub is a kind note, not a lock")
    shot(page, track, "1_empty")
    page.click(".ph-empty .btn"); page.wait_for_selector(".home")
    # --- s a t learned ---
    seed_to(page, "L1.03")
    open_hub(page)
    chips = page.evaluate("[...document.querySelectorAll('.ph-chip')].map(c => c.dataset.g)")
    learned = page.evaluate("window.__engine.practice.sounds")
    check(chips == learned and set(["s", "a", "t"]) <= set(chips) and not set(chips) & {"sh", "ee", "oa"}, f"{T} chips are the learned sounds only: {chips}")
    check(page.locator(".ph-stage .ph-letter").count() == 1, f"{T} a sound is on the stage")
    shot(page, track, "2_hub")
    page.evaluate("window.__engine.trace.length = 0")
    page.click(".ph-chip[data-g='s']"); time.sleep(0.3)
    check(any(k.startswith("ph:s") for k in clips(page)), f"{T} tapping a sound chip plays it: {clips(page)}")
    check(page.evaluate("window.__engine.practice.sound") == "s", f"{T} chip selects the sound")
    page.evaluate("window.__engine.trace.length = 0"); page.click(".ph-act[data-act=word]"); time.sleep(0.3)
    check(any(k.startswith("ph:s:anchor") or k == "ph:s" or k.startswith("w:s") for k in clips(page)), f"{T} 'In a word' plays the anchor: {clips(page)}")
    if track == "A":
        check(page.locator(".ph-stage .ph-pic img").count() == 1, f"{T} Track A stage leads with the picture")
    else:
        check(page.locator(".ph-stage .ph-word").count() == 1 and page.locator(".ph-stage .ph-pic").count() == 0, f"{T} Track B stage is plain: letter + word, no picture")
    page.click(".ph-act[data-act=trace]"); page.wait_for_selector("canvas.trace"); page.wait_for_function("() => !!window.__engine.traceGuide")
    check(page.evaluate("window.__engine.traceGuide.letter") == "s", f"{T} Trace it opens the trace screen for s")
    shot(page, track, "3_trace")
    trace_once(page); page.wait_for_function("() => document.querySelector('.trace-status')?.textContent.includes('2 of 2')"); time.sleep(0.5); trace_once(page)
    page.wait_for_selector(".ph-hub", timeout=8000)
    check(page.evaluate("window.__engine.practice.sound") == "s", f"{T} after two traces: back on the hub, same sound")
    page.click(".ph-act[data-act=trace]"); page.wait_for_selector("canvas.trace"); page.click(".ph-close"); page.wait_for_selector(".ph-hub")
    check(True, f"{T} Back from the trace screen returns to Practice")
    w3 = page.evaluate("window.__engine.practice.words.length")
    check((page.locator(".ph-card.words.soft").count() == 1) == (w3 < 2) and page.locator(".ph-card.words .icon").count() == 0, f"{T} with 3 sounds ({w3} words) the word game is open, or a soft 'later' card, never a lock")
    # --- more sounds: the word game ---
    seed_to(page, "L1.07")
    open_hub(page)
    words = page.evaluate("window.__engine.practice.words")
    check(len(words) >= 3, f"{T} words learned so far: {words[:12]}")
    check(page.locator(".ph-card.si").count() == 1, f"{T} Sound it out card is offered")
    check(page.locator(".ph-garden").count() == 1 and (page.locator(".ph-garden .daygarden").count() == 1 if track == "A" else page.locator(".ph-days").count() == 1), f"{T} garden / days practised")
    page.evaluate("document.querySelector('.ph-print').open = true")
    pr = page.locator(".ph-print a.print-practice")
    check(pr.count() >= 2, f"{T} print pages listed ({pr.count()})")
    href = pr.first.get_attribute("href")
    code = urllib.request.urlopen(f"http://localhost:{PORT}/{href.lstrip('./')}").status if href else 0
    check(code == 200, f"{T} first print link resolves: {href}")
    shot(page, track, "4_hub_words")
    page.click(".ph-card.words"); page.wait_for_selector(".ph-game .ph-choice")
    shot(page, track, "5_game")
    rounds = page.evaluate("window.__engine.practice.game.rounds")
    for r in range(rounds):
        page.wait_for_function("(r) => window.__engine.practice.game.round === r && document.querySelectorAll('.ph-choice').length >= 2", arg=r)
        target = page.evaluate("window.__engine.practice.game.target")
        opts = page.evaluate("[...document.querySelectorAll('.ph-choice')].map(b => b.dataset.w)")
        check(target in opts and all(w in words for w in opts), f"{T} round {r+1}: only learned words {opts}")
        if track == "A": check(page.locator(".ph-choice .wd").count() == 0 and page.locator(".ph-choice img").count() == len(opts), f"{T} round {r+1}: pictures only, no letters")
        else: check(page.locator(".ph-choice .wd").count() == len(opts), f"{T} round {r+1}: written words")
        if r == 0:
            wrong = next(w for w in opts if w != target); page.evaluate("window.__engine.trace.length = 0")
            page.click(f".ph-choice[data-w='{wrong}']"); time.sleep(0.4)
            check(page.locator(f".ph-choice[data-w='{wrong}'].soft").count() == 1 and any(k == f"w:{wrong}" for k in clips(page)), f"{T} a miss goes soft and says the word it was (no buzzer): {clips(page)}")
            check(not re.search(r"wrong|incorrect|fail|score|point", page.inner_text(".ph"), re.I), f"{T} no shaming or score words after a miss")
            shot(page, track, "6_miss")
        page.click(f".ph-choice[data-w='{target}']"); time.sleep(0.3)
    page.wait_for_selector(".ph-done")
    check(page.locator(".ph-pips i.on").count() == rounds, f"{T} all rounds filled in (a miss costs nothing)")
    shot(page, track, "7_done")
    page.click(".ph-done [data-act=again]"); page.wait_for_selector(".ph-game .ph-choice")
    check(True, f"{T} Again starts a fresh run")
    page.click(".ph-close"); page.wait_for_selector(".ph-hub")
    text = page.inner_text(".ph")
    check(not re.search(r"\b(score|points|timer|seconds|streak|locked)\b", text, re.I), f"{T} no score / timer / locked words on the hub")
    page.click(".ph-card.si"); page.wait_for_selector(".sayit")
    check(True, f"{T} Sound it out opens from Practice")
    home(page); open_hub(page)
    page.click(".ph-close"); page.wait_for_selector(".home")
    check(True, f"{T} close returns Home")
    missing = page.evaluate("window.__engine.missing")
    check(not missing, f"{T} no missing clips {missing}")
    check(not errs, f"{T} console clean {errs[:3]}")
    ctx.close()

with sync_playwright() as pw:
    br = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    for t in ("A", "B"): run(br, t)
    br.close()
print("\n".join(problems) if problems else "PRACTICE DRIVER GREEN")
sys.exit(1 if problems else 0)
