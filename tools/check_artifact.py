#!/usr/bin/env python3
"""Verify the Artifact build (npm run build:artifact) the way the claude.ai viewer will serve it.

  python3 tools/check_artifact.py [--stage /tmp/sg-artifact] [--port 5390] [--shots shots/artifact]

Serves <stage>/index.html wrapped in the publish skeleton ('<!doctype html><html><head><meta charset=utf8></head><body>' + page + '</body></html>',
a nested doctype exactly as the viewer does) and <stage>/files/* next to it, with the viewer's Content-Security-Policy on every response.
Then, in Chromium at 390 and 1280 wide: the landing page renders and animates, Start works (no location.hash change), the seed hatches,
onboarding runs, a lesson plays and its audio requests succeed. Fails on any CSP violation, console error, page error or failed request
other than audio/pictures that the manifest says are not shipped.
"""
import sys, os, json, time, pathlib, threading, http.server, socketserver, mimetypes
ROOT = pathlib.Path(__file__).resolve().parent.parent
ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
STAGE = pathlib.Path(ARG('--stage', '/tmp/sg-artifact')); PORT = int(ARG('--port', '5390')); SHOTS = ROOT / ARG('--shots', 'shots/artifact')
CSP = ("default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; "
       "style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; img-src 'self' data: blob:; "
       "media-src 'self' data: blob:; connect-src 'self'")
PRE, POST = '<!doctype html><html><head><meta charset=utf8></head><body>', '</body></html>'
MANIFEST = json.load(open(STAGE / 'manifest.json'))
SHIPPED = set(MANIFEST['files'])
sys.path.insert(0, str(ROOT / 'tools/engine-compat/tools'))


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        path = self.path.split('?')[0]
        if path in ('/', '/index.html'):
            body = (PRE + (STAGE / 'index.html').read_text() + POST).encode(); ctype = 'text/html; charset=utf-8'
        else:
            f = STAGE / 'files' / path.lstrip('/')
            if not f.is_file() or '..' in path:
                self.send_response(404); self.send_header('Content-Security-Policy', CSP); self.end_headers(); return
            body = f.read_bytes(); ctype = mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
        self.send_response(200); self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(body)))
        self.send_header('Content-Security-Policy', CSP); self.end_headers(); self.wfile.write(body)


class S(socketserver.ThreadingTCPServer): allow_reuse_address = True; daemon_threads = True


problems, notes = [], []
def check(ok, msg):
    (notes if ok else problems).append(('PASS ' if ok else 'FAIL ') + msg); print(('PASS ' if ok else 'FAIL ') + msg)


def run():
    from playwright.sync_api import sync_playwright
    import _onb
    SHOTS.mkdir(parents=True, exist_ok=True)
    srv = S(('127.0.0.1', PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{PORT}/'
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for w, h, name in [(390, 844, 'phone'), (1280, 800, 'desktop')]:
            ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='no-preference')
            page = ctx.new_page(); page.set_default_timeout(30000)
            errs, csp, bad, audio_ok, audio_404, pics_404 = [], [], [], [], [], []
            page.add_init_script("window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+e.blockedURI+' '+(e.sourceFile||'')))")
            page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            page.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
            def on_resp(r):
                u = r.url.replace(url, '')
                if r.status >= 400:
                    if u.startswith('audio/'): audio_404.append(u)
                    elif u.startswith('img/words/'): pics_404.append(u)
                    else: bad.append((u, r.status))
                elif u.startswith('audio/'): audio_ok.append(u)
            page.on('response', on_resp)
            page.on('requestfailed', lambda rq: bad.append((rq.url, rq.failure)) if 'aborted' not in (rq.failure or '').lower() else None)
            page.goto(url)
            page.wait_for_selector('.landing .start', timeout=60000); time.sleep(1.5)
            check(page.locator('.landing').count() == 1 and page.locator('.sprig, .hero svg').count() > 0, f'[{name}] landing and hero art render inside the wrapper')
            anim = page.evaluate('document.getAnimations().length'); check(anim > 0, f'[{name}] landing animates ({anim} running animations)')
            a1 = page.screenshot(); time.sleep(1.2); a2 = page.screenshot(); check(a1 != a2, f'[{name}] two frames 1.2 s apart differ (it is moving)')
            page.screenshot(path=str(SHOTS / f'{name}-landing.png'))
            check(page.evaluate("location.hash === '' || location.hash === '#'"), f'[{name}] address has no route hash')
            page.locator('.start').first.click()
            page.wait_for_selector('.hatch-seed, .splash-play, .whocard', timeout=60000); time.sleep(0.6)
            check(page.evaluate("document.documentElement.classList.contains('sg-play')") and page.evaluate("location.hash === ''"), f'[{name}] Start opens the app with no hash change')
            page.screenshot(path=str(SHOTS / f'{name}-seed.png'))
            if page.locator('.hatch-seed').count():
                page.click('.hatch-seed', force=True); time.sleep(2.4); page.screenshot(path=str(SHOTS / f'{name}-hatched.png'))
                check(page.locator('.splash-play, .hatch-play, .whocard').count() > 0, f'[{name}] seed hatches, Play appears')
            if name == 'phone':
                _onb.walk(page, 'A', shot=lambda n: page.screenshot(path=str(SHOTS / f'{name}-onb-{n}.png')), problems=problems)
                check(page.locator('.home .node.open').count() > 0, f'[{name}] onboarding finishes on the garden Home')
                page.screenshot(path=str(SHOTS / f'{name}-home.png'))
                page.evaluate('window.__engine.trace.length = 0'); n0 = len(audio_ok)
                page.click('.home .node.open'); page.wait_for_selector('.sitting', timeout=30000)
                end = time.time() + 90
                while time.time() < end and len(audio_ok) - n0 < 3: time.sleep(0.5)
                played = page.evaluate("window.__engine.trace.filter(e=>e.type==='audio').length")
                check(played > 0 and len(audio_ok) - n0 >= 1, f'[{name}] a lesson plays: {played} clips played, {len(audio_ok) - n0} audio files fetched OK in the lesson')
                page.screenshot(path=str(SHOTS / f'{name}-lesson.png'))
                miss = page.evaluate('window.__engine.missing')
                check(not [m for m in miss if m.split(' ')[0] in {k for k in MANIFEST.get('keys', [])}], f'[{name}] no shipped clip reported missing (all missing keys: {len(miss)})')
                notes.append(f'[{name}] clips not shipped (404 by design): {len(set(audio_404))}')
                # a link-driven route inside the app: grown-ups guide via Home button is app-internal; also test the landing -> teach click route below
            else:
                page.goto(url); page.wait_for_selector('.landing a[href="#/teach"]'); page.evaluate("document.querySelector('.landing a[href=\"#/teach\"]').click()")
                page.wait_for_selector('.tp-head, .tp-card', timeout=20000); time.sleep(0.8)
                check(page.evaluate("location.hash===''"), f'[{name}] landing -> teacher page by click, no hash change')
                page.screenshot(path=str(SHOTS / f'{name}-teach.png'))
                page.evaluate("document.querySelector('.tp-back').click()"); page.wait_for_selector('.landing .start', timeout=20000)
                check(True, f'[{name}] teacher page Back returns to the landing page')
            v = page.evaluate('window.__csp')
            check(not v, f'[{name}] zero CSP violations ({len(v)}) {v[:3]}')
            check(not errs, f'[{name}] zero console/page errors ({len(errs)}) {errs[:3]}')
            check(not bad, f'[{name}] no failed requests apart from unshipped audio/pictures ({len(bad)}) {bad[:3]}')
            notes.append(f'[{name}] audio files fetched OK: {len(set(audio_ok))}; unshipped audio requested: {len(set(audio_404))}; unshipped pictures requested: {len(set(pics_404))}')
            unexpected = [u for u in set(audio_404) | set(pics_404) if u in SHIPPED]
            check(not unexpected, f'[{name}] every shipped file that was requested resolved ({len(unexpected)} shipped files 404)')
            ctx.close()
        br.close()
    srv.shutdown()


if __name__ == '__main__':
    run()
    print('\n'.join(n for n in notes if not n.startswith('PASS')))
    print('ARTIFACT CHECK:', 'GREEN' if not problems else f'{len(problems)} problem(s)')
    for p in problems: print(p)
    sys.exit(1 if problems else 0)
