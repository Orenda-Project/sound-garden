#!/usr/bin/env python3
"""Navigation gate: every screen a learner or grown-up can reach has a way out, and the exits go where they should. Exit 0 = green.

  python3 tools/check_nav.py [--port 5421] [--vp 390x844] [--shots DIR]

Walks the real app with Playwright (static build served on its own port, like drive.py), both tracks:
  first run (splash, Who is reading?, avatar, Sprig's colour, favourite sound | the grown-up promise, mini-lesson, celebration) -> Home -> the
  grown-up sum gate -> guide hub -> every topic -> Settings and privacy -> Who is reading? opened from Home -> a sitting -> the end screens
  -> Sound it out -> (Track B) Library and a practice session.
On EVERY screen it asserts:
  1. an enabled, visible control that leaves the screen (Back / Home / Close / Skip / All topics / Go on / Keep going ...) exists, unless the screen
     is the one place the app is left from (Home, the splash, the very first Who is reading?)
  2. the hardware Back button (window.__engine.backAction(), native.js) is defined and, when performed, lands on the screen the table below says
     (one step back; the sum gate closes in place; Home exits the app)
  3. Back from the first steps leaves no stray profile behind; Back from Who is reading? (opened from Home) makes no new profile
  4. a sitting reopened after a reload (mid-lesson) comes back to Home with its node still open (nothing half-saved)
Also a static pass: every `app.<fn>(` called in app/src exists on the app object in main.js, and each fn has a UI caller (test-only ones are listed).
"""
import engine_compat  # Sound Garden: the app is at #/play
import json, re, socket, subprocess, sys, tempfile, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import _onb

ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
PORT = int(ARG("--port", "5421"))
VP = dict(zip(("width", "height"), map(int, ARG("--vp", "390x844").split("x"))))
SHOTS = Path(ARG("--shots")) if ARG("--shots") else None
problems, SEEN = [], {}

SEED = """async ([keys]) => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value;
  const p = (await get('progress', pid)) || { id: pid, sittings: {}, lessons: {}, stickers: [], village: [], days: [], sittingCount: 0 };
  for (const k of keys) p.sittings[k] = { done: true, passed: true, correct: 0, judged: 0, at: Date.now() };
  await new Promise(res => { const t = d.transaction('progress', 'readwrite'); t.objectStore('progress').put(p); t.oncomplete = res; });
}"""
PROFILES = """async () => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const all = st => new Promise(res => { const r = d.transaction(st).objectStore(st).getAll(); r.onsuccess = () => res(r.result); });
  const act = await new Promise(res => { const r = d.transaction('settings').objectStore('settings').get('active'); r.onsuccess = () => res(r.result && r.result.value); });
  return { n: (await all('profiles')).length, active: act };
}"""

# screen name -> selector that is true only on that screen (first match wins, top to bottom)
SCREENS = [
    ("gate", ".gu-wrap"), ("splash", "#app .splash"), ("who", "#app .whocard"), ("avatar", "#app .avatars"), ("look", "#app .meet-look"),
    ("fav", "#app .meet-fav"), ("promise", "#app .promise"), ("mini-lesson", "#app .onb-lesson"), ("first-done", "#app .onb-done"),
    ("library", "#app .ss-library"), ("practice", "#app .ss-session"), ("home", "#app .home"), ("hub", "#app .guide[data-guide=hub]"),
    ("topic", "#app .guide[data-guide=section]"), ("privacy", "#app .privacy"), ("sitting", "#app .sitting"), ("end", "#app .endscreen"),
    ("sayit", "#app .sayit"),
]
# screens that are legitimately left only by the hardware button / leaving the app
NO_EXIT_CONTROL_OK = {"home", "splash", "gate"}   # Home: nothing behind it; the gate has Close; the splash has Play
EXIT_RE = re.compile(r"(back|home|close|skip|all topics|go on|keep going|stop|who is reading|play|try again|practise first|done|next|continue)", re.I)


def port_open(p):
    with socket.socket() as s: return s.connect_ex(("127.0.0.1", p)) == 0


def ok(c, msg):
    if not c: problems.append(msg)
    print(("ok   " if c else "FAIL ") + msg)
    return c


def where(page):
    return page.evaluate("(S) => { for (const [n, s] of S) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width > 0) return n; } return 'unknown'; }", SCREENS)


def settle(page, want, secs=8):
    end = time.time() + secs
    while time.time() < end:
        w = where(page)
        if w == want: time.sleep(0.25); return True
        time.sleep(0.12)
    return False


def exits(page):
    """Visible, enabled, labelled controls on the screen that look like a way out."""
    return page.evaluate("""() => { const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      return [...document.querySelectorAll('button, a[href], [role=button]')].filter(b => vis(b) && !b.disabled && b.getAttribute('aria-disabled') !== 'true')
        .map(b => (b.getAttribute('aria-label') || b.innerText || '').trim().replace(/\\s+/g, ' ')).filter(Boolean); }""")


def visit(page, track, name, shot=None):
    """Assert the screen has an exit control + a defined hardware Back, record it."""
    key = f"{track}:{name}"; SEEN[key] = True
    if SHOTS: time.sleep(0.7); SHOTS.mkdir(parents=True, exist_ok=True); page.screenshot(path=str(SHOTS / f"{track}_{shot or name}.png"))
    ba = page.evaluate("window.__engine.backAction && window.__engine.backAction()")
    ok(ba in ("exit", "gate", "click", "hub", "home"), f"[{track}] {name}: hardware Back is defined ({ba})")
    ex = [e for e in exits(page) if EXIT_RE.search(e)]
    if name not in NO_EXIT_CONTROL_OK and not (name == "who" and ba == "exit"):
        ok(bool(ex), f"[{track}] {name}: has a visible way out ({', '.join(ex[:3]) or 'NONE'})")
    return ba


def hardware_back(page):
    """What native.js does on the Back button, performed on the real DOM."""
    a = page.evaluate("window.__engine.backAction()")
    if a == "exit": return "exit"
    if a == "gate": page.keyboard.press("Escape")
    elif a == "hub": page.evaluate("window.__engine.app.grownups()")
    elif a == "click": page.evaluate("document.querySelector('#app .onb-back, #app .meet-skip, #app .onb-skip button, #app .ss-session .close').click()")
    else: page.evaluate("window.__engine.app.home()")
    return a


def back_lands(page, track, frm, to, timeout=8):
    a = hardware_back(page)
    ok(settle(page, to, timeout), f"[{track}] hardware Back on {frm} ({a}) lands on {to} (now {where(page)})")


def gate_open(page):
    page.evaluate("document.querySelector('.grownups').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))")
    page.wait_for_selector(".gu-wrap")


def gate_solve(page):
    q = page.inner_text(".gu-q"); a, b = map(int, re.findall(r"\d+", q)[:2])
    page.fill(".gu-in", str(a * b)); page.click(".gu-wrap .btn.primary")


def home_to_hub(page, track):
    gate_open(page); gate_solve(page); ok(settle(page, "hub"), f"[{track}] sum gate -> guide hub")


def static_pass():
    src = "\n".join(p.read_text() for p in (ROOT / "app/src").rglob("*.js"))
    main = (ROOT / "app/src/main.js").read_text()
    defined = set(re.findall(r"^\s{2}(?:async\s+)?(\w+)\s*\(", main[main.index("const app = {"):main.index("window.__engine = window.__engine")], re.M)) | {"nextOpen"}
    called = set(re.findall(r"\bapp(?:\(\))?\.(\w+)\(", src))
    for fn in sorted(called):
        if fn in ("mount", "start", "boot"): continue
        ok(fn in defined, f"static: app.{fn}() is called and exists on the app object")
    test_only = {"firstSitting", "nextOpen"}
    for fn in sorted(defined - called - {"mount", "start", "boot"} - test_only):
        ok(False, f"static: app.{fn}() has no caller (orphan route)")


def run(br, track):
    ctx = br.new_context(viewport=VP, reduced_motion="reduce"); page = ctx.new_page(); errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); page.on("pageerror", lambda e: errs.append(str(e)))
    page.set_default_timeout(15000)
    # --- splash (real timing: it waits for a tap) ---
    page.goto(f"http://localhost:{PORT}/?still")
    page.wait_for_selector(".hatch-seed, .splash-play, .whocard"); time.sleep(0.8)
    try:
        if page.locator(".hatch-seed").count(): page.click(".hatch-seed", force=True, timeout=1500); time.sleep(2.2)
    except Exception: pass   # a ?fast page hatches by itself
    if page.locator("#teacher-start button").count():     # autoplay blocked: one big tap-to-start sits over the splash (it has exactly one control, and it leaves)
        ok(page.locator("#teacher-start button").count() == 1, f"[{track}] tap-to-start overlay offers one big way on"); page.click("#teacher-start button")
    if where(page) == "splash": visit(page, track, "splash", "00-splash"); page.click(".splash-play", force=True)
    ok(settle(page, "who", 20), f"[{track}] splash -> Who is reading? by tapping Play")
    page.goto(f"http://localhost:{PORT}/?fast")      # the rest at test speed (the first load already made nothing: still no profile)
    page.wait_for_selector(".hatch-seed, .splash-play, .whocard"); settle(page, "who", 20)
    visit(page, track, "who", "01-who-first")
    ok(page.evaluate("window.__engine.backAction()") == "exit", f"[{track}] first Who is reading? has nothing behind it: Back leaves the app")
    ok(page.locator(".onb-back").count() == 0, f"[{track}] first Who is reading? shows no Back arrow (nothing to go back to)")
    # --- first steps: Back undoes the profile ---
    page.click(f".whocard[data-track={track}]")
    if track == "A":
        page.wait_for_selector(".avatars .avatar"); settle(page, "avatar"); visit(page, track, "avatar", "02-avatar")
        back_lands(page, track, "avatar", "who")
        ok(page.evaluate(PROFILES)["n"] == 0, f"[{track}] Back from the avatar step leaves no stray profile")
        page.click(f".whocard[data-track={track}]"); page.wait_for_selector(".avatars .avatar"); page.click(".skip-pic")
        page.wait_for_selector(".meet-look .swatch"); visit(page, track, "look", "03-look")
        back_lands(page, track, "look", "fav")        # Back on the colour step = Skip: on to the sound step
        visit(page, track, "fav", "04-fav")
        back_lands(page, track, "fav", "mini-lesson")
    else:
        page.wait_for_selector(".promise .btn.primary"); settle(page, "promise"); visit(page, track, "promise", "02-promise")
        back_lands(page, track, "promise", "who")
        ok(page.evaluate(PROFILES)["n"] == 0, f"[{track}] Back from the promise step leaves no stray profile")
        page.click(f".whocard[data-track={track}]"); page.wait_for_selector(".promise .btn.primary"); page.click(".promise .btn.primary")
    page.wait_for_selector(".onb-lesson .options .opt-pick:not([disabled])", timeout=30000)
    visit(page, track, "mini-lesson", "05-mini-lesson")
    for r in range(3):
        page.wait_for_selector(".onb-lesson .options .opt-pick:not([disabled])", timeout=30000)
        page.locator(".onb-lesson .options .opt[data-ok] .opt-pick:not([disabled])").first.click()
        _onb._wait_trace(page, "round", i=r)
    page.wait_for_selector(".onb-done .btn.next", timeout=20000); time.sleep(0.3)
    visit(page, track, "first-done", "06-first-done")
    page.click(".onb-done .btn.next"); ok(settle(page, "home"), f"[{track}] celebration -> Home"); time.sleep(0.4)
    visit(page, track, "home", "07-home"); ok(page.evaluate(PROFILES)["n"] == 1, f"[{track}] one profile after the first run")
    active0 = page.evaluate(PROFILES)["active"]
    # --- grown-up gate ---
    gate_open(page); visit(page, track, "gate", "08-gate")
    back_lands(page, track, "gate", "gate" if False else "home")      # Escape closes the sum, Home stays
    ok(page.locator(".gu-wrap").count() == 0, f"[{track}] hardware Back closes the sum gate")
    gate_open(page); page.click(".gu-wrap .btn.ghost"); ok(page.locator(".gu-wrap").count() == 0 and where(page) == "home", f"[{track}] gate Close button returns to Home")
    home_to_hub(page, track); visit(page, track, "hub", "09-hub")
    topics = page.evaluate("[...document.querySelectorAll('.gd-topic')].map(b => b.dataset.topic)")
    ok(len(topics) >= 8, f"[{track}] guide hub lists its topics ({len(topics)})")
    for t in topics:
        page.click(f".gd-topic[data-topic={t}]")
        dest = "privacy" if t == "settings" else "topic"
        if not settle(page, dest): ok(False, f"[{track}] topic {t} opens ({where(page)})"); page.evaluate("window.__engine.app.grownups()"); settle(page, "hub"); continue
        visit(page, track, dest, f"10-{t}" if t in ("start_here", "settings") else None)
        back_lands(page, track, dest, "hub")
    page.click(".guide[data-guide=hub] .hdr .btn"); ok(settle(page, "home"), f"[{track}] hub Home button -> Home")
    home_to_hub(page, track); back_lands(page, track, "hub", "home")
    # --- Who is reading? from Home: Back makes no profile ---
    page.evaluate("[...document.querySelectorAll('.homehdr button')].find(b => /Who/.test(b.innerText + b.getAttribute('aria-label'))).click()")
    ok(settle(page, "who"), f"[{track}] Home -> Who is reading?"); visit(page, track, "who", "11-who-from-home")
    ok(page.locator(".onb-back").count() == 1, f"[{track}] Who is reading? opened from Home has a Back arrow")
    back_lands(page, track, "who (from Home)", "home")
    p = page.evaluate(PROFILES); ok(p["n"] == 1 and p["active"] == active0, f"[{track}] Back from Who is reading? made no profile and kept the same learner")
    # pick the other track, then back out of the first step: still one profile, same learner
    other = "B" if track == "A" else "A"
    page.evaluate("[...document.querySelectorAll('.homehdr button')].find(b => /Who/.test(b.innerText + b.getAttribute('aria-label'))).click()"); settle(page, "who")
    page.click(f".whocard[data-track={other}]"); settle(page, "avatar" if other == "A" else "promise")
    ok(page.evaluate(PROFILES)["n"] == 2, f"[{track}] a second learner starts (2 profiles)")
    back_lands(page, track, "second learner's first step", "who"); back_lands(page, track, "who (from Home)", "home")
    p = page.evaluate(PROFILES); ok(p["n"] == 1 and p["active"] == active0, f"[{track}] backing out of a second learner restores the first (profiles {p['n']})")
    # --- a sitting: close, hardware Back, reopen mid-lesson ---
    page.evaluate("(document.querySelector('.play-big') || document.querySelector('.b-up')).click()"); ok(settle(page, "sitting", 20), f"[{track}] Home -> sitting")
    visit(page, track, "sitting", "12-sitting")
    back_lands(page, track, "sitting", "home")
    page.evaluate("(document.querySelector('.play-big') || document.querySelector('.b-up')).click()"); settle(page, "sitting", 20)
    page.click(".sitting .close"); ok(settle(page, "home"), f"[{track}] sitting Close -> Home")
    page.evaluate("(document.querySelector('.play-big') || document.querySelector('.b-up')).click()"); settle(page, "sitting", 20)
    page.reload(); page.wait_for_selector(".home", timeout=20000); time.sleep(0.8)
    if page.locator("#teacher-start button").count(): page.click("#teacher-start button")   # a cold start has no tap yet: audio waits for one
    ok(page.locator(".home .node.open, .home .play-big, .home .b-up").count() >= 1, f"[{track}] reopened mid-lesson: Home with the same next step open")
    # --- end screens ---
    for label, o in (("pass", {}), ("fail", {"passed": False}), ("level check missed", {"mastery": True, "passed": False})):
        page.evaluate("(o) => window.__engine.endDemo('L1.02:%s', o)" % track, o); settle(page, "end"); time.sleep(0.8)
        visit(page, track, "end", f"13-end-{label.split()[0]}")
        back_lands(page, track, f"end ({label})", "home")
    # --- Sound it out ---
    page.evaluate(SEED, [[k for k in page.evaluate("[...document.querySelectorAll('.home .node[data-key]')].map(b => b.dataset.key)") if k.startswith("L1.02")]])
    page.evaluate("window.__engine.app.home()"); page.wait_for_selector(".home"); time.sleep(0.4)
    if page.locator(".sy-tile:not(.locked)").count():
        page.evaluate("document.querySelector('.sy-tile').click()"); ok(settle(page, "sayit"), f"[{track}] Home -> Sound it out"); visit(page, track, "sayit", "14-sayit")
        back_lands(page, track, "sayit", "home")
    else: ok(False, f"[{track}] Sound it out tile opens after L1.02")
    # --- Library and a practice session (Track B shows them; Track A has no Library button) ---
    if page.locator(".ss-libbtn").count():
        page.evaluate("document.querySelector('.ss-libbtn').click()"); ok(settle(page, "library"), f"[{track}] Home -> Library"); visit(page, track, "library", "15-library")
        page.evaluate("document.querySelector('.ss-lesson').click()"); ok(settle(page, "practice"), f"[{track}] Library -> practice session")
        visit(page, track, "practice", "16-practice"); back_lands(page, track, "practice", "library")
        page.click(".ss-library .ss-home"); ok(settle(page, "home"), f"[{track}] Library Home button -> Home")
        page.evaluate("document.querySelector('.ss-libbtn').click()"); settle(page, "library"); back_lands(page, track, "library", "home")
    # --- reopen app at each first-run step is covered by: profile exists after step 1 -> boot lands on Home ---
    ok(not errs, f"[{track}] no console errors ({errs[:2]})")
    ctx.close()


def main():
    static_pass()
    server = None
    if not port_open(PORT):
        dist = Path(tempfile.mkdtemp(prefix="nav-dist-"))
        subprocess.run(["npx", "vite", "build", "--base=/", "--outDir", str(dist), "--emptyOutDir", "--logLevel", "error"], cwd=ROOT / "app", check=True)
        server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "-d", str(dist)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            if port_open(PORT): break
            time.sleep(0.1)
    try:
        with sync_playwright() as pw:
            br = pw.chromium.launch()
            for t in ("A", "B"): run(br, t)
            br.close()
    finally:
        if server: server.terminate()
    need = {"splash", "who", "avatar", "look", "fav", "promise", "mini-lesson", "first-done", "home", "gate", "hub", "topic", "privacy", "sitting", "end", "sayit", "library", "practice"}
    seen = {k.split(":")[1] for k in SEEN}
    ok(need <= seen, f"every known screen was reached and checked (missing: {sorted(need - seen) or 'none'})")
    print(f"\n{len(problems)} problem(s)"); [print("  -", p) for p in problems]
    sys.exit(1 if problems else 0)


if __name__ == "__main__": main()
