"""Shared by the drivers: walk the first-run onboarding (app/src/onboarding.js) with Playwright.

  from _onb import walk, to_first_sitting

  walk(page, "A")                      # who -> (avatar -> look -> favourite sound | promise) -> 3-round first-sound mini-lesson -> celebration -> Home
  walk(page, "A", shot=shot)           # shot(name) is called on every onboarding screen (the drivers' own screenshot helper)
  to_first_sitting(page, "B")          # walk() then tap the glowing first node: you are in the first sitting (.sitting)

The mini-lesson cannot be failed, so the walk deliberately misses once in round 1 (miss=True) and checks that the right card then glows.
Every selector here is a contract with onboarding.js: .whocard[data-track], .avatars .avatar[data-avatar], .skip-pic, .promise .btn.primary,
.onb-lesson .options .opt[data-ok] .opt-pick, .opt.glow, .onb-done .btn.next.
"""
import time


def _wait_trace(page, step, secs=20, **kw):
    end = time.time() + secs
    while time.time() < end:
        hit = page.evaluate("(a) => window.__so.trace.some(e => e.type === 'onboard' && e.step === a.step && Object.entries(a.kw).every(([k, v]) => e[k] === v))", {"step": step, "kw": kw})
        if hit: return True
        time.sleep(0.15)
    return False


def pass_splash(page):
    """The splash waits for a tap on its big Play button (the drivers' ?fast pages move on by themselves)."""
    page.wait_for_selector(".splash-play, .whocard", timeout=15000)
    if page.locator(".splash-play").count():
        try: page.click(".splash-play", force=True, timeout=1500)
        except Exception: pass   # a ?fast page moves on by itself after 150 ms: the button may be gone already


def walk(page, track, shot=None, miss=True, avatar="skip", problems=None):
    """From the 'Who is reading?' screen to Home. Returns the list of onboarding screens seen (for the caller's asserts)."""
    seen = []
    snap = lambda n: (shot(n) if shot else None, seen.append(n))
    def bad(msg):
        if problems is not None: problems.append(f"[{track}] onboarding: {msg}")
        else: raise AssertionError(msg)
    pass_splash(page)
    page.wait_for_selector(".whocard", timeout=15000)
    page.click(f".whocard[data-track={track}]")
    if track == "B":   # Tilo waits in the corner of the shared "Who is reading?" screen; from the moment a grown-up is chosen he must never show again
        page.evaluate("() => { window.__tiloSeen = false; if (window.__poses) window.__poses.clear(); }")
    if track == "A":
        page.wait_for_selector(".avatars .avatar"); time.sleep(0.4); snap("avatar")
        if avatar == "skip": page.click(".skip-pic")
        else: page.click(f".avatar[data-avatar={avatar}]")
        # G1 pet bond: Tilo's colour, then his favourite sound (two picture taps, each with a Next arrow and a Skip)
        page.wait_for_selector(".meet-look .swatch"); time.sleep(0.4); snap("look")
        page.click(".meet-look .swatch[data-look=pink]"); page.wait_for_selector(".meet-look .meet-next:not([hidden])"); time.sleep(0.25); snap("look-picked")
        page.click(".meet-look .meet-next")
        page.wait_for_selector(".meet-fav .favcard"); time.sleep(0.4); snap("fav")
        page.click(".meet-fav .favcard[data-fav=s]"); page.wait_for_selector(".meet-fav .meet-next:not([hidden])"); time.sleep(0.25); snap("fav-picked")
        page.click(".meet-fav .meet-next")
    else:
        page.wait_for_selector(".promise .btn.primary"); time.sleep(0.35); snap("promise")   # past the 160 ms fade-in
        page.click(".promise .btn.primary")
    for r in range(3):
        page.wait_for_selector(".onb-lesson .options .opt-pick:not([disabled])", timeout=60000)
        time.sleep(0.2); snap(f"round{r + 1}")
        if r == 0 and miss:
            page.locator(".onb-lesson .options .opt:not([data-ok]) .opt-pick:not([disabled])").first.click()
            try: page.wait_for_selector(".onb-lesson .opt[data-ok].glow", timeout=3000)
            except Exception: bad("round 1: after a miss the right card does not glow")
            if track == "B" and "Not this one" not in page.inner_text(".onb-lesson .fb"): bad("Track B: no plain 'Not this one. Listen again.' line after a miss")
            time.sleep(0.2); snap("round1-miss")
        page.locator(".onb-lesson .options .opt[data-ok] .opt-pick:not([disabled])").first.click()
        if not _wait_trace(page, "round", i=r): bad(f"round {r + 1} did not finish")
    page.wait_for_selector(".onb-done .btn.next", timeout=20000); time.sleep(0.3); snap("done")
    page.click(".onb-done .btn.next")
    page.wait_for_selector(".home .node.open", timeout=15000); time.sleep(0.3); snap("home")
    return seen


def to_first_sitting(page, track, **kw):
    walk(page, track, **kw)
    page.click(".home .node.open")
    page.wait_for_selector(".sitting", timeout=25000)


def quick(page, track):
    """A profile and straight into the first sitting (the pre-onboarding behaviour): for drivers about lessons, not about the first run.
    The real onboarding is walked by drive.py, drive_teacher.py and shoot_review.py."""
    pass_splash(page); page.wait_for_selector(".whocard", timeout=15000)
    if page.evaluate("typeof window.__so.quickStart") == "function": page.evaluate("t => window.__so.quickStart(t)", track)
    else: page.click(f".whocard[data-track={track}]")   # an older build (before the first-run flow): choosing a card started the first sitting itself
    page.wait_for_selector(".sitting", timeout=25000)
