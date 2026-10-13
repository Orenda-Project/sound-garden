#!/usr/bin/env python3
"""Drive "Sound it out" (app/src/sayit.js) with Playwright at 390x844. Exit 0 = green.

  python3 tools/drive_sayit.py [--port 5391] [--shots DIR]

For both tracks: onboarding -> seed L1.02 as passed -> Home tile is open -> Sound it out opens.
  Track A: tap tiles s, a, t -> chunks s a t; press Sound it out -> clip order ph:s ph:a ph:t w:sat; the blend ends with the I-said-it button.
           seed through L2.01 -> tiles sh, i, p -> "ship" chunks sh i p, clips ph:sh ph:i ph:p w:ship; picture chooser picks a word and never shows a picture beside the printed word.
  Track B: type "sat" and "ship" (sh/i/p not taught yet -> all three greyed "not learned yet", still played); a made-up word is flagged as a best guess.
  Before L1.02 the tile is locked. Also: no console errors, no missing clips, every chunk sound exists.
"""
import so_compat  # Sound Garden: app is at #/play
import sys, time
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from pathlib import Path
from playwright.sync_api import sync_playwright
import _onb

ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
PORT = int(ARG("--port", "5391")); SHOTS = Path(ARG("--shots", "")) if ARG("--shots") else None
URL = f"http://localhost:{PORT}/?fast"
problems = []
SEED = """async ([keys]) => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-out', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value;
  const p = (await get('progress', pid)) || { id: pid, sittings: {}, lessons: {}, stickers: [], village: [], days: [], sittingCount: 0 };
  for (const k of keys) p.sittings[k] = { done: true, passed: true, correct: 0, judged: 0, at: Date.now() };
  await new Promise(res => { const t = d.transaction('progress', 'readwrite'); t.objectStore('progress').put(p); t.oncomplete = res; });
}"""
def check(ok, msg):
    if not ok: problems.append(msg); print("FAIL", msg)
    else: print("ok  ", msg)
def clips(page): return page.evaluate("window.__so.trace.filter(e => e.type === 'audio' && /^(ph|w):/.test(e.key)).map(e => e.key)")
def chunks(page): return page.evaluate("window.__so.sayit.chunks.map(c => c.g)")
def wait_state(page, s, secs=30):
    end = time.time() + secs
    while time.time() < end:
        if page.evaluate("window.__so.sayit && window.__so.sayit.state") == s: return True
        time.sleep(0.1)
    return False
def home(page):
    page.evaluate("window.__so.app.home()"); page.wait_for_selector(".home")
def seed_to(page, track, stop_prefix):
    home(page)
    plan = page.evaluate("[...document.querySelectorAll('.home .node[data-key]')].map(b => b.dataset.key)")
    i = next(i for i, k in enumerate(plan) if k.startswith(stop_prefix))
    page.evaluate(SEED, [plan[:i]]); home(page)
def shot(page, track, name):
    if SHOTS: SHOTS.mkdir(parents=True, exist_ok=True); page.screenshot(path=str(SHOTS / f"{track}_{name}.png"))
def tap_tiles(page, gs):
    for g in gs: page.click(f".sy-t[data-g='{g}']"); time.sleep(0.15)

def run(br, track, slow=False):
    ctx = br.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, reduced_motion="reduce")
    page = ctx.new_page(); errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); page.on("pageerror", lambda e: errs.append(str(e)))
    page.set_default_timeout(8000)
    page.goto(URL)
    _onb.walk(page, track); page.wait_for_selector(".home .node")
    check(page.locator(".sy-tile.locked").count() == 1, f"[{track}] tile is locked before L1.02")
    seed_to(page, track, "L1.03")                                  # everything before L1.03 passed: s a t taught
    check(page.locator(".sy-tile:not(.locked)").count() == 1, f"[{track}] tile opens after L1.02")
    if slow:   # real timing for the screenshots: reload without ?fast (the profile lives in IndexedDB)
        page.goto(f"http://localhost:{PORT}/"); page.wait_for_selector(".home")
        page.evaluate("document.querySelector('#teacher-start button')?.click()")
    shot(page, track, "0_home")
    page.click(".sy-tile"); page.wait_for_selector(".sayit")
    check(page.evaluate("window.__so.sayit.state") == "empty", f"[{track}] opens empty")
    shot(page, track, "1_empty")
    page.evaluate("window.__so.trace.length = 0")
    if track == "A":
        tap_tiles(page, ["s", "a", "t"])
    else:
        page.fill("#sy-in", "sat"); page.click(".sy-type button[type=submit]")
    check(chunks(page) == ["s", "a", "t"], f"[{track}] 'sat' splits s a t")
    check(page.locator(".sb.on").count() == 0, f"[{track}] nothing lit before the run")
    shot(page, track, "2_built")
    page.evaluate("window.__so.trace.length = 0")
    page.click(".sy-go")
    if slow:
        page.wait_for_selector(".sb.on", timeout=15000); shot(page, track, "3_playing")
    check(wait_state(page, "blended"), f"[{track}] run reaches blended")
    if slow: time.sleep(1.0)
    page.wait_for_selector(".sy-said:not([hidden])"); time.sleep(0.5); shot(page, track, "4_blended")
    seq = clips(page)
    check(seq == ["ph:s", "ph:a", "ph:t"], f"[{track}] sounds only until the child blends (got {seq})")
    # tap a chunk: it plays its own sound
    page.evaluate("window.__so.trace.length = 0"); page.click(".sb[data-g='a']"); time.sleep(0.4)
    check(clips(page) == ["ph:a"], f"[{track}] tapping a chunk plays only its sound")
    page.evaluate("window.__so.trace.length = 0"); page.click(".sy-said"); wait_state(page, "said"); time.sleep(0.4)
    check(clips(page) == ["w:sat"], f"[{track}] after 'I said it' the whole word w:sat plays as the check (got {clips(page)})")
    if track == "A":
        check(page.evaluate("[...document.querySelectorAll('.sy-t')].every(t => window.__so.sayit.learned.set.has(t.dataset.g))"), "[A] child track offers only taught sounds as tiles")
        seed_to(page, track, "L2.02"); page.click(".sy-tile"); page.wait_for_selector(".sayit")
        page.evaluate("window.__so.trace.length = 0"); tap_tiles(page, ["sh", "i", "p"])
        check(chunks(page) == ["sh", "i", "p"], "[A] 'ship' from tiles sh i p")
        check(page.evaluate("window.__so.sayit.chunks.every(c => c.known)"), "[A] ship: every part taught")
        page.evaluate("window.__so.trace.length = 0"); page.click(".sy-go"); wait_state(page, "blended"); page.wait_for_selector(".sy-said:not([hidden])"); page.click(".sy-said"); wait_state(page, "said"); time.sleep(0.4)
        check(clips(page) == ["ph:sh", "ph:i", "ph:p", "w:ship"], f"[A] ship clip order (got {clips(page)})")
        check(page.locator(".sb[data-g='sh'] .sb-m.dash").count() == 1 and page.locator(".sb[data-g='i'] .sb-m.dot").count() == 1, "[A] dash under sh, dot under i")
        page.click(".sy-pics"); page.wait_for_selector(".sy-pic"); time.sleep(0.4); shot(page, track, "8_pictures")
        check(page.locator(".sy-pic-ov").count() == 1, "[A] picture chooser opens")
        offered = page.evaluate("[...document.querySelectorAll('.sy-pic')].map(b => b.dataset.w)")
        bad = page.evaluate("""(ws) => ws.filter(w => !window.__so.sayit.S.annotate(window.__so.sayit.S.fromWord(w), window.__so.sayit.learned.set).allKnown)""", offered)
        check(offered and not bad and "elephant" not in offered and "beetle" not in offered, f"[A] picture chooser offers only words whose sounds are all taught (offered {offered}, bad {bad})")
        check(page.locator(".sy-type, .sy-input").count() == 0, "[A] no keyboard / 'Or type a word' on the child track")
        w = page.locator(".sy-pic").first.get_attribute("data-w"); page.locator(".sy-pic").first.click()
        check(page.locator(".sy-pic-ov").count() == 0 and page.evaluate("window.__so.sayit.word") == w, f"[A] picture chooses the word ({w})")
        check(page.locator(".sayit .picture").count() == 0, "[A] no picture on screen beside the printed word")
        shot(page, track, "9_picked")
    else:
        seed_to(page, track, "L1.03"); page.click(".sy-tile"); page.wait_for_selector(".sayit")
        page.evaluate("window.__so.trace.length = 0"); page.fill("#sy-in", "ship"); page.click(".sy-type button[type=submit]")
        check(chunks(page) == ["sh", "i", "p"], "[B] 'ship' splits sh i p")
        check(page.locator(".sb.unk").count() == 3 and "not learned" in page.inner_text(".sy-caption"), "[B] ship: three greyed parts, caption says not learned yet")
        shot(page, track, "5_untaught")
        page.evaluate("window.__so.trace.length = 0"); page.click(".sy-go"); wait_state(page, "blended"); page.wait_for_selector(".sy-said:not([hidden])"); page.click(".sy-said"); wait_state(page, "said"); time.sleep(0.4)
        check(clips(page) == ["ph:sh", "ph:i", "ph:p", "w:ship"], f"[B] untaught parts still play (got {clips(page)})")
        page.fill("#sy-in", "the"); page.click(".sy-type button[type=submit]")
        check(page.evaluate("window.__so.sayit.chunks.length") == 2 and page.locator(".sb.tricky").count() == 2 and "tricky" in page.inner_text(".sy-caption"), "[B] 'the' is a tricky word: heart parts, never sounded out")
        check(page.inner_text(".sy-go") .strip() == "Hear the word", "[B] tricky word: the button says Hear the word")
        check(page.locator(".sb.tricky .sb-m.dash").count() == 1, "[B] 'the': a dash under th")
        shot(page, track, "7_tricky")
        page.evaluate("window.__so.trace.length = 0"); page.click(".sy-go"); wait_state(page, "blended"); time.sleep(0.3)
        check(clips(page) == ["w:the"], f"[B] tricky word plays only the whole word (got {clips(page)})")
        page.fill("#sy-in", "blep"); page.click(".sy-type button[type=submit]")
        check(chunks(page) == ["b", "l", "e", "p"] and "guess" in page.inner_text(".sy-caption"), "[B] made-up word: split + flagged best guess")
        page.evaluate("window.__so.trace.length = 0"); page.click(".sy-go"); wait_state(page, "blended"); page.wait_for_selector(".sy-said:not([hidden])"); page.click(".sy-said"); wait_state(page, "said"); time.sleep(0.4)
        check(clips(page) == ["ph:b", "ph:l", "ph:e", "ph:p"], f"[B] no whole-word clip for a word with none (got {clips(page)})")
        check("say it together" in page.inner_text(".sy-caption"), "[B] 'Let's say it together' shown instead of fake audio")
        shot(page, track, "6_nonclip")
    missing = page.evaluate("window.__so.missing")
    check(not missing, f"[{track}] no missing clips {missing}")
    check(not errs, f"[{track}] console clean {errs[:2]}")
    ctx.close()

with sync_playwright() as pw:
    br = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    for t in ("A", "B"): run(br, t, slow=bool(SHOTS))
    br.close()
print("\n".join(problems) if problems else "SAYIT DRIVER GREEN")
sys.exit(1 if problems else 0)
