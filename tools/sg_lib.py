"""Small Playwright helpers for Sound Garden (the app is at #/play). Used by tools/shoot_*.py and the slice drivers.

    from sg_lib import app, seed_to, shot
    with sync_playwright() as p:
        pg, errs = app(p, "A")            # onboarding walked, on Home, 390x844
        seed_to(pg, "L2.03")              # every sitting before L2.03 passed, lessons marked checked, back on Home
"""
import sys, time, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / "engine-compat/tools"))
import _onb  # noqa: E402

import os
BASE = os.environ.get("SG_BASE", "http://localhost:5390/")   # set SG_BASE to point the helpers at another port
SHOTS = pathlib.Path("/tmp/sgshots")
SEED = """async ([keys]) => {
  const d = await new Promise((res, rej) => { const r = indexedDB.open('sound-garden', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const get = (st, k) => new Promise(res => { const r = d.transaction(st).objectStore(st).get(k); r.onsuccess = () => res(r.result); });
  const pid = (await get('settings', 'active')).value;
  const p = (await get('progress', pid)) || { id: pid, sittings: {}, lessons: {}, stickers: [], village: [], days: [], sittingCount: 0 };
  for (const k of keys) { p.sittings[k] = { done: true, passed: true, correct: 0, judged: 0, at: Date.now() }; const L = k.split(':')[0]; p.lessons[L] = p.lessons[L] || { state: 'checked' }; }
  p.days = [...new Set([...(p.days || []), '2026-10-01', '2026-10-02'])]; p.sittingCount = keys.length;
  await new Promise(res => { const t = d.transaction('progress', 'readwrite'); t.objectStore('progress').put(p); t.oncomplete = res; });
}"""


def app(p, track="A", vp=(390, 844), base=BASE, query="?fast=1&still=1", walk=True, scale=2):
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": vp[0], "height": vp[1]}, device_scale_factor=scale)
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(base + query + "#/play")
    if walk: _onb.walk(pg, track); pg.wait_for_selector(".home", timeout=30000)
    return pg, errs


def home(pg):
    pg.evaluate("window.__engine.app.home()"); pg.wait_for_selector(".home"); time.sleep(0.5)


def plan(pg):
    return pg.evaluate("[...document.querySelectorAll('.home .node[data-key]')].map(b => b.dataset.key)")


def seed_to(pg, prefix):
    home(pg)
    keys = plan(pg)
    i = next(i for i, k in enumerate(keys) if k.startswith(prefix))
    pg.evaluate(SEED, [keys[:i]]); home(pg)
    return keys


def shot(pg, name, full=False):
    SHOTS.mkdir(parents=True, exist_ok=True)
    f = SHOTS / f"{name}.png"; pg.screenshot(path=str(f), full_page=full); return f
