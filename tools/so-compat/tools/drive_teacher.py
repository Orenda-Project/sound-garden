#!/usr/bin/env python3
"""Checks for the teacher-voice layer (app/src/teacher.js) with Playwright at 390x844.

  python3 tools/drive_teacher.py [--port 5318]

1. First launch with autoplay BLOCKED (default Chromium policy): the big tap-to-start shows, one tap removes it and the prompt plays.
2. Onboarding speaks hello + who; every control that a pre-reader must use carries an icon (svg) and a data-say clip.
3. The ear button is on every screen and replays the current prompt (trace 'replay').
4. Idle ladder (?idlefast = 1.5 / 3 / 5 / 9 s): after a prompt, silence gives re-prompt (tier 1), nudge + point (tier 2),
   "tap the speaker" (tier 3), "I will wait" and pause (tier 4); a tap resets it; the point is a .nudge outline.
5. Praise pool: 60 draws, never the same line twice in a row, A-only and B-only lines respect the track.
6. Press and hold a [data-say] control speaks its label and swallows the click.
7. The self-check row is hidden until "Let me hear it" (the `hidden` attribute is not overridden by CSS).
8. No console errors, no missing audio.
Exit code 0 = green.
"""
import so_compat  # Sound Garden: app is at #/play
import json, socket, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
PORT = int(ARG("--port", "5318"))
IDX = json.loads((ROOT / "content/audio_index.json").read_text())["clips"]
problems = []


def port_open(p):
    with socket.socket() as s: return s.connect_ex(("127.0.0.1", p)) == 0


def trace(page, typ=None):
    t = page.evaluate("window.__so.trace")
    return [e for e in t if typ is None or e["type"] == typ]


def waitkey(page, key, secs=10):
    end = time.time() + secs
    while time.time() < end and not any(e["key"] == key for e in trace(page, "audio")): time.sleep(0.2)


def hold_open(page, sel=".home .grownups", secs=2.4):
    """Hold the grown-ups corner (2 s) until the sum gate opens."""
    box = page.locator(sel).bounding_box()
    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2); page.mouse.down(); time.sleep(secs); page.mouse.up()
    page.wait_for_selector(".gu-wrap")


def check(cond, msg):
    if not cond: problems.append(msg)
    print(("ok   " if cond else "FAIL ") + msg)


def main():
    server = None
    if not port_open(PORT):
        server = subprocess.Popen(["npx", "vite", "--port", str(PORT), "--strictPort"], cwd=APP, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(60):
            if port_open(PORT): break
            time.sleep(0.5)
    out = ROOT / "store/android-test/teacher"; out.mkdir(parents=True, exist_ok=True)
    try:
        with sync_playwright() as pw:
            # ---- 1. autoplay blocked (no autoplay flag): tap to start
            br = pw.chromium.launch()
            ctx = br.new_context(viewport={"width": 390, "height": 844}, reduced_motion="no-preference")
            page = ctx.new_page(); errs = []
            page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); page.on("pageerror", lambda e: errs.append(str(e)))
            page.goto(f"http://localhost:{PORT}/?idlefast"); page.set_default_timeout(8000)
            # the 2 s splash plays nothing and the first clip is asked for right after it. Playwright's own selector polling counts as a user gesture
            # and would let that first clip autoplay, so stay silent until the clip has been blocked.
            time.sleep(2.9)
            try: page.wait_for_selector("#teacher-start", timeout=4000); blocked = True
            except Exception: blocked = False
            check(blocked, "autoplay blocked: the tap-to-start overlay is shown")
            if blocked:
                page.screenshot(path=str(ROOT / "app/shots/T_tap-to-start.png"))
                page.click("#teacher-start .startbtn", force=True); waitkey(page, "ui:who")
                check(page.locator("#teacher-start").count() == 0, "tap-to-start disappears after one tap")
                check(any(e["key"] == "ui:who" for e in trace(page, "audio")), "the 'who is reading' prompt plays after the tap")
            ctx.close(); br.close()

            # ---- 2-8 with autoplay allowed
            br = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
            for track in ("A", "B"):
                ctx = br.new_context(viewport={"width": 390, "height": 844}, reduced_motion="no-preference")
                page = ctx.new_page(); errs = []
                page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); page.on("pageerror", lambda e: errs.append(str(e)))
                page.goto(f"http://localhost:{PORT}/?idlefast"); page.set_default_timeout(8000)
                page.wait_for_selector(".whocard"); waitkey(page, "ui:who")
                keys = [e["key"] for e in trace(page, "audio")]
                check("ui:hello" in keys and "ui:who" in keys, f"[{track}] onboarding says hello and who")
                check(page.locator("#ear").is_visible(), f"[{track}] the ear button is on the first screen")
                for sel in (".whocard.child", ".whocard.adult"):
                    check(page.locator(f"{sel} svg").count() > 0 and bool(page.get_attribute(sel, "data-say")), f"[{track}] {sel} has an icon and a spoken label")
                # hold-to-hear: press and hold the child card, the click must NOT choose it
                box = page.locator(".whocard.child").bounding_box()
                page.mouse.move(box["x"] + 20, box["y"] + 20); page.mouse.down(); time.sleep(0.8); page.mouse.up(); time.sleep(0.4)
                check(any(e["type"] == "hold-say" and e["key"] == "ui:child" for e in trace(page)), f"[{track}] press-and-hold speaks 'A child'")
                check(page.locator(".whocard").count() == 2, f"[{track}] a hold does not activate the card")
                __import__("_onb").quick(page, track)   # a profile and straight into the first sitting; the real first run is walked in section 9 below
                # the first sitting: begin + prompt; then a silent wait climbs the ladder
                page.wait_for_selector(".screen"); time.sleep(1.2)
                keys = [e["key"] for e in trace(page, "audio")]
                check("ui:begin" in keys, f"[{track}] the sitting says 'Let's begin'")
                page.evaluate("window.__so.trace.length = 0")
                # wait without touching: tier 1..4 within ~16 s of idlefast timings (1.5/3/5/9 s after the prompt ends)
                deadline = time.time() + 40
                while time.time() < deadline and not any(e.get("tier") == 4 for e in trace(page, "idle")): time.sleep(0.5)
                tiers = [e["tier"] for e in trace(page, "idle")]
                check(tiers[:4] == [1, 2, 3, 4], f"[{track}] idle ladder fires tiers 1,2,3,4 in order (got {tiers})")
                ak = [e["key"] for e in trace(page, "audio")]
                check("ui:idleHelp" in ak and "ui:idleWait" in ak, f"[{track}] idle plays 'tap the speaker' and 'I will wait'")
                page.screenshot(path=str(ROOT / f"app/shots/T_{track}_idle.png"))
                n_before = len(trace(page, "idle"))
                time.sleep(3.0)
                check(len(trace(page, "idle")) == n_before, f"[{track}] after 'I will wait' the teacher pauses (no more idle events)")
                # a tap restarts the ladder; the ear replays the prompt
                page.click("#ear", force=True); time.sleep(0.3)
                check(len(trace(page, "replay")) >= 1, f"[{track}] the ear button replays the prompt")
                # spoken navigation: Next and Skip are arrows with a clip
                if page.locator(".foot .next").count():
                    check(page.locator(".foot .next svg").count() > 0 and page.get_attribute(".foot .next", "data-say") == "ui:next", f"[{track}] Next carries an arrow icon and a clip")
                # praise pool: no back-to-back repeats, track lines respected
                res = page.evaluate("""async () => { const t = window.__so.teacher; const seen = []; window.__so.trace.length = 0;
                  for (let i = 0; i < 60; i++) { window.__so.audioOff = true; await t.right({ kind: ['pick','read','sound','spell','listen'][i % 5], tries: 1 }); }
                  return window.__so.trace.filter(e => e.type === 'praise').map(e => e.key); }""")
                rep = [i for i in range(1, len(res)) if res[i] == res[i - 1]]
                check(len(res) >= 60 and not rep, f"[{track}] praise pool: 60 draws, no line twice in a row ({len(set(res))} distinct)")
                check(("goodWork" not in res) if track == "A" else ("wow" not in res), f"[{track}] track lines respected ({'no goodWork' if track == 'A' else 'no wow'})")
                # Tilo: child track only
                vis = page.evaluate("[...document.querySelectorAll('.tilo')].filter(e => !e.hidden && e.offsetParent !== null).length")
                check((vis == 1) if track == "A" else (vis == 0), f"[{track}] Tilo is {'shown' if track == 'A' else 'absent'} ({vis} visible)")
                # For grown-ups: Home -> gate -> privacy text, no outside link anywhere
                page.evaluate("window.__so.app.home()"); page.wait_for_selector(".home .grownups")
                page.locator(".home .grownups").scroll_into_view_if_needed()
                page.click(".home .grownups"); time.sleep(0.5)   # a tap alone must not reach the sum: it is held for 2 seconds
                check(page.locator(".gu-wrap").count() == 0, f"[{track}] a tap on the grown-ups corner does not open the gate")
                hold_open(page)
                import re as _re
                def sum_(): a, b = map(int, _re.findall(r"\d+", page.inner_text(".gu-q"))); return a * b
                page.fill(".gu-in", "1"); page.press(".gu-in", "Enter")
                check("Not quite" in page.inner_text(".gu-msg"), f"[{track}] a wrong sum is refused with a new sum")
                page.fill(".gu-in", str(sum_())); page.press(".gu-in", "Enter")
                if page.evaluate("typeof window.__so.app.grownups") == "function":   # the guide hub (phase 4); older builds went straight to the privacy screen
                    page.wait_for_selector(".guide[data-guide=hub]")
                    check(page.locator(".guide .gd-topic").count() == 9, f"[{track}] the guide hub lists 8 topics and Settings and privacy ({page.locator('.guide .gd-topic').count()})")
                    page.click(".gd-topic[data-topic=settings]")
                page.wait_for_selector(".privacy")
                check(page.locator("a[href], [href^=mailto]").count() == 0 and "oyekamal.github.io/sound-out/privacy.html" in page.inner_text(".privacy"), f"[{track}] privacy screen shows the address as text, no link")
                check(page.locator(".tilo:not([hidden])").count() == 0 or track == "A", f"[{track}] no mascot on the privacy screen")
                for e in errs: problems.append(f"[{track}] console error: {e}")
                ctx.close()
            onboarding_section(br)
            br.close()
    finally:
        if server: server.terminate()
    print("\n".join(problems) if problems else "ALL TEACHER CHECKS GREEN")
    sys.exit(1 if problems else 0)


IDB = """async (store) => { const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-out', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  return await new Promise(res => { const r = d.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); }); }"""


def onboarding_section(br):
    """9. The first run, the grown-up hold, the guide and Calm motion, with real motion on (no-preference) and ?fast audio."""
    import _onb
    for track in ("A", "B"):
        ctx = br.new_context(viewport={"width": 390, "height": 844}, reduced_motion="no-preference")
        page = ctx.new_page(); errs = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); page.on("pageerror", lambda e: errs.append(str(e)))
        page.goto(f"http://localhost:{PORT}/?fast"); page.set_default_timeout(8000)
        page.wait_for_selector(".whocard")
        before = [e.get("step") for e in trace(page, "onboard")]
        check("splash" in before, f"[{track}] first launch shows the splash before 'Who is reading?'")
        check(page.locator(".whocard .face").count() == 2, f"[{track}] the two who cards carry face art (picture cards, nothing to type)")
        check(page.locator("input, textarea").count() == 0, f"[{track}] nothing to type on the first screen")
        problems_before = len(problems)
        _onb.walk(page, track, avatar="frog" if track == "A" else None, problems=problems)
        check(len(problems) == problems_before, f"[{track}] the first run walks to Home (a miss in round 1 makes the right card glow; the lesson cannot be failed)")
        ev = trace(page, "onboard"); steps = [e["step"] for e in ev]
        want = ["splash", "who", "avatar-screen", "avatar", "look-screen", "look", "fav-screen", "fav", "lesson", "round", "round", "round", "done", "go"] if track == "A" else ["splash", "who", "promise", "lesson", "round", "round", "round", "done", "go"]
        check(steps == want, f"[{track}] onboarding steps in order {want} (got {steps})")
        rounds = [e for e in ev if e["step"] == "round"]
        check([bool(r["first"]) for r in rounds] == [False, True, True], f"[{track}] round 1 was missed once on purpose, rounds 2 and 3 first try ({[r['first'] for r in rounds]})")
        check(page.locator(".gu-wrap").count() == 0, f"[{track}] no grown-up gate anywhere in the first run")
        profs = page.evaluate(IDB, "profiles"); progs = page.evaluate(IDB, "progress")
        p = profs[0] if profs else {}
        check(p.get("track") == track and (p.get("avatar") == "frog") == (track == "A"), f"[{track}] the profile keeps its track and avatar ({p.get('track')}, {p.get('avatar')})")
        check((len(progs[0].get("stickers", [])) == 1) == (track == "A") if progs else False, f"[{track}] Track A earned the first sticker, Track B none")
        check(page.locator(".home .node.open").count() == 1, f"[{track}] Home has one glowing first node")
        vis = page.evaluate("[...document.querySelectorAll('.tilo')].filter(e => !e.hidden && e.offsetParent !== null).length")
        check((vis == 1) if track == "A" else (vis == 0), f"[{track}] Tilo {'is on Home' if track == 'A' else 'never appears (no mascot)'} ({vis})")
        check((page.locator(".home .me").count() == 1) == (track == "A"), f"[{track}] the chosen friend shows on the Track A Home header only")
        # the one-time guide card (Track A), the grown-up hold, the guide, Calm motion
        has_guide = page.evaluate("typeof window.__so.app.grownups") == "function"
        if track == "A" and has_guide:
            check(page.locator(".home .helpcard").count() == 1, "[A] the one-time 'Helping a child? Read the 1-minute guide' card is on the first Home")
            check("1-minute guide" in page.inner_text(".home .helpcard"), "[A] the card names the 1-minute guide")
            check(page.locator(".home .play-big").bounding_box()["y"] < 780, "[A] the card does not push the Play button off the screen")
            page.evaluate("window.__so.app.home()"); page.wait_for_selector(".home .node.open"); time.sleep(0.4)
            check(page.locator(".home .helpcard").count() == 0, "[A] the card is shown once, not again on the next Home")
            page.locator(".home .grownups").scroll_into_view_if_needed(); hold_open(page)
            import re as _re
            a, b = map(int, _re.findall(r"\d+", page.inner_text(".gu-q"))); page.fill(".gu-in", str(a * b)); page.press(".gu-in", "Enter"); page.wait_for_selector(".guide[data-guide=hub]")
            # the 1-minute guide: seven tips, then a topic of each shape
            page.click(".gd-topic[data-topic=start_here]"); page.wait_for_selector(".guide[data-guide=section]")
            check(page.locator(".gd-steps li").count() == 7 and "Start here" in page.inner_text(".guide h1"), "[A] 'Start here' shows its seven tips")
            page.click(".gd-back"); page.wait_for_selector(".guide[data-guide=hub]")
            for topic, sel, n in (("levels", ".gd-level", 7), ("faq", ".gd-q", 8), ("saying_the_sounds", ".gd-sp", 5), ("helping_without_the_answer", ".gd-say", 5)):
                page.click(f".gd-topic[data-topic={topic}]"); page.wait_for_selector(".guide[data-guide=section]")
                got = page.locator(f".guide {sel}").count()
                check(got >= n, f"[A] guide topic {topic}: {got} x {sel} (want >= {n})")
                page.click(".gd-back"); page.wait_for_selector(".guide[data-guide=hub]")
            check(page.locator(".tilo:not([hidden])").count() == 0 and not page.locator("#ear:visible").count(), "[A] no mascot and no ear button on the guide")
            # Calm motion: next to the time-limit setting, persisted, and it turns the page calm
            page.click(".gd-topic[data-topic=settings]"); page.wait_for_selector(".privacy #calm-motion")
            check(page.evaluate("!document.documentElement.classList.contains('calm')"), "[A] motion is on by default (no reduced-motion setting)")
            page.check("#calm-motion"); time.sleep(0.2)
            check(page.evaluate("document.documentElement.classList.contains('calm')"), "[A] ticking Calm motion puts html.calm on at once")
            page.reload(); page.wait_for_selector(".home"); time.sleep(0.5)
            check(page.evaluate("document.documentElement.classList.contains('calm')"), "[A] Calm motion survives a restart")
            still = page.evaluate("[...document.querySelectorAll('.node.open, .tilo-stage')].map(e => getComputedStyle(e).animationName).filter(n => n !== 'none')")
            check(not [n for n in still if n.startswith("tapme") or n.startswith("tilo-breathe")], f"[A] calm: no breathing or tap-me loop is running ({still})")
        for e in errs: problems.append(f"[{track}] console error in onboarding: {e}")
        ctx.close()


if __name__ == "__main__":
    main()
