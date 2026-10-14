#!/usr/bin/env python3
"""Sound completeness gate for Sound Garden.

  python3 tools/check_audio_complete.py [--static] [--runtime] [--dist dist] [--port 5395] [--out plan/audio-complete.json]

1. Collect EVERY audio key the content and the app can request (UI lines, isolated sounds in all three forms, letter names, words,
   option words, Level 2-4 bundle keys, Level 1 lesson clips, Level 5-7 session clips, every key literal in the source).
2. Each must resolve in engine/content/audio_index.json (ph:<x>:pure|anchor|stretch may fall back to the v1 ph:<x>, as audio.js does),
   its .ogg must exist in dist/audio, be non-empty, look like Ogg and decode (ffmpeg). Every clip in the index is decoded too.
3. Runtime: serve dist/ and walk L1.01-L1.04 (Track A and B), the first-run mini-lesson, meet-a-sound, the Practice hub and Sound it out with
   the course drivers, recording every /audio/ response: any 404 or failed request is a failure.
Exit 0 only when nothing is missing, empty, undecodable or 404.
"""
import json, os, re, subprocess, sys, pathlib, collections, time, socket, runpy
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
DIST = ROOT / ARG('--dist', 'dist')
PORT = int(ARG('--port', '5395'))
OUT = ROOT / ARG('--out', 'plan/audio-complete.json')
C = ROOT / 'engine/content'
IDXF = json.load(open(C / 'audio_index.json'))
idx = IDXF['clips']
problems = []
report = {}


def resolve(key):
    if key in idx: return key
    m = re.match(r'^(ph:[^:]+):(pure|anchor|stretch)$', key)
    return m.group(1) if m and m.group(1) in idx else None


def collect():
    keys = collections.defaultdict(set)                      # family -> keys
    def add(k): keys[k.split(':')[0]].add(k)
    for k in json.load(open(C / 'ui_lines.json')): add(f'ui:{k}')
    for k in json.load(open(C / 'teacher_lines.json')):
        if f'ui:{k}' in idx: add(f'ui:{k}')
    gpc = json.load(open(C / 'gpc.json'))
    v2 = IDXF['soundsV2']
    phs = {p['p'] for p in gpc['order']} | set(gpc['phonemes']) | set(v2)
    for p in phs:
        add(f'ph:{p}')
        if p in v2:
            for f in ('pure', 'anchor', 'stretch'): add(f'ph:{p}:{f}')
    for l in gpc['letterNames']: add(f'name:{l}')
    for w in json.load(open(C / 'lexicon.json')): add(f'w:{w}')
    for f in sorted((C / 'levels').glob('L*.json')):
        b = json.load(open(f))
        for k in b.get('audioKeys', []): add(k)
        for w in b['lexicon']: add(f'w:{w}')
    for f in [C / 'options.json'] + sorted(C.glob('options_L*.json')):
        if 'unbuildable' in f.name: continue
        for it in json.load(open(f)).values():
            for o in [it['target'], *it['foils']]: add(f"ipa:{o['ipa']}")
    # lesson clips: the app loops until the index runs out (lt:<lid>:<i>), so every indexed clip of a lesson is a request
    lids = [f.stem for f in sorted((C / 'lessons').glob('L*.json'))]
    pre = tuple(f'{p}:{l}' for l in lids for p in ('lt', 'q', 't2', 'read', 'rule', 'ex', 'exw'))
    for k in idx:
        if k.startswith(pre): add(k)
    for f in sorted((C / 'sessions').glob('L*.json')):
        s = json.load(open(f)); i = s['id']; g = lambda a, b: (s.get(a) or {}).get(b) or []
        for n, _ in enumerate(g('warm', 'words')): add(f'ss:{i}:warm:w{n}')
        for n, _ in enumerate(g('warm', 'prompts')): add(f'ss:{i}:warm:p{n}')
        for n, _ in enumerate(g('word', 'items')): add(f'ss:{i}:word:{n}')
        for n, _ in enumerate(g('word', 'vocab')): add(f'ss:{i}:vocab:{n}')
        for n, _ in enumerate(g('fluency', 'paragraphs')): add(f'ss:{i}:flu:{n}')
        for n, _ in enumerate(g('prime', 'facts')): add(f'ss:{i}:prime:{n}')
        for n, r in enumerate(g('discuss', 'roles')):
            if r.get('prompt'): add(f'ss:{i}:disc:{n}')       # discuss.js only offers a voice button when the role has a prompt
        for n, _ in enumerate(g('check', 'items')): add(f'ss:{i}:check:{n}')
        for j, ps in enumerate(g('text', 'passages')):
            for n, _ in enumerate(ps.get('paragraphs') or []): add(f'ss:{i}:text:{j}:{n}')
            for n, _ in enumerate(ps.get('questions') or []): add(f'ss:{i}:text:{j}:q{n}')
    lit = re.compile(r"""['"`]((?:ui|ph|w|name|ipa|syl|lt|q|t2|rule|ex|exw|read):[A-Za-z0-9_.\-]+)['"`]""")
    for f in list((ROOT / 'engine/app/src').rglob('*.js')) + list((ROOT / 'src').rglob('*.js')) + list((ROOT / 'engine-overlay').glob('*.js')):
        for k in lit.findall(f.read_text()): keys['src-literal'].add(k)
    return keys


def decode_ok(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'null', '-'], capture_output=True, text=True)
    return r.returncode == 0 and not r.stderr.strip(), r.stderr.strip()[:120]


def static_check():
    keys = collect()
    total = sum(len(v) for k, v in keys.items() if k != 'src-literal')
    unresolved = sorted(k for fam, ks in keys.items() if fam != 'src-literal' for k in ks if resolve(k) is None)
    lits = sorted(k for k in keys['src-literal'] if resolve(k) is None)
    files = {v['id']: k for k, v in idx.items()}
    def chk(i):
        p = DIST / 'audio' / f'{i}.ogg'
        if not p.exists(): return (i, 'file missing')
        if p.stat().st_size == 0: return (i, 'empty file')
        with open(p, 'rb') as fh:
            if fh.read(4) != b'OggS': return (i, 'not an Ogg file')
        ok, err = decode_ok(p)
        return None if ok else (i, 'decode error ' + err)
    t = time.time(); bad = []
    with ThreadPoolExecutor(3) as ex:
        for r in ex.map(chk, list(files)):
            if r: bad.append({'id': r[0], 'key': files[r[0]], 'why': r[1]})
    extra = [f for f in os.listdir(DIST / 'audio') if f[:-4] not in files]
    fam = {k: len(v) for k, v in sorted(keys.items())}
    print(f'[static] request keys collected: {total} {fam}')
    print(f'[static] request keys not in audio_index: {len(unresolved)}', unresolved[:15])
    print(f'[static] source-literal keys not in audio_index (advisory; many are prefixes): {len(lits)}', lits[:12])
    print(f'[static] index clips {len(files)}; missing/empty/undecodable files in {DIST.name}/audio: {len(bad)} ({time.time() - t:.0f}s)', bad[:10])
    print(f'[static] files in {DIST.name}/audio not in the index: {len(extra)}')
    report['static'] = {'keys_by_family': fam, 'total_request_keys': total, 'unresolved': unresolved, 'unresolved_source_literals': lits,
                        'index_clips': len(files), 'bad_files': bad, 'dist_extra_files': len(extra)}
    problems.extend(f'unresolved key {k}' for k in unresolved)
    problems.extend(f"bad file {b['key']} ({b['id']}): {b['why']}" for b in bad)


def port_open(p):
    with socket.socket() as s: s.settimeout(0.3); return s.connect_ex(('127.0.0.1', p)) == 0


def runtime_check():
    from playwright.sync_api import BrowserContext, Browser
    seen, fails = collections.Counter(), []
    def hook(page):
        def on_resp(r):
            if '/audio/' in r.url and r.url.endswith('.ogg'):
                seen[r.url.rsplit('/', 1)[1][:-4]] += 1
                if r.status >= 400: fails.append((r.url, r.status))
        def on_fail(rq):
            if '/audio/' in rq.url and 'aborted' not in (rq.failure or '').lower(): fails.append((rq.url, rq.failure))
        page.on('response', on_resp); page.on('requestfailed', on_fail)
    o1 = BrowserContext.new_page
    BrowserContext.new_page = lambda self, *a, **k: (lambda p: (hook(p), p)[1])(o1(self, *a, **k))
    o2 = Browser.new_page
    Browser.new_page = lambda self, *a, **k: (lambda p: (hook(p), p)[1])(o2(self, *a, **k))
    server = None
    if not port_open(PORT):
        server = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '-d', str(DIST)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(40):
            if port_open(PORT): break
            time.sleep(0.25)
    drv = ROOT / 'tools/engine-compat/tools'
    sys.path.insert(0, str(drv)); os.chdir(drv)
    runs = [('walk L1.01-L1.04 Track A and B (first run, meet-a-sound sittings)', 'drive.py', ['--until', 'L1.04', '--no-sessions']),
            ('Practice hub', 'drive_practice.py', []), ('Sound it out', 'drive_sayit.py', [])]
    results = {}
    try:
        for name, script, extra in runs:
            sys.argv = [script, '--port', str(PORT)] + extra
            before = len(seen)
            try: runpy.run_path(str(drv / script), run_name='__main__'); code = 0
            except SystemExit as e: code = e.code or 0
            print(f'[runtime] {name}: driver exit {code}; distinct audio files requested so far {len(seen)} (+{len(seen) - before}); failures so far {len(fails)}')
            results[name] = {'exit': code, 'new_audio_files': len(seen) - before}
            if code: problems.append(f'driver failed: {script} exit {code}')
    finally:
        if server: server.terminate(); server.wait()
    id2key = {v['id']: k for k, v in idx.items()}
    fam = collections.Counter(id2key.get(i, '?').split(':')[0] for i in seen)
    ph = sorted({id2key[i] for i in seen if id2key.get(i, '').startswith('ph:') and id2key[i].count(':') == 2})
    print(f'[runtime] distinct audio files fetched: {len(seen)}; by family: {dict(fam)}; v2 sound forms fetched: {len(ph)}')
    print(f'[runtime] 404 or failed audio requests: {len(fails)}', fails[:10])
    report['runtime'] = {'drivers': results, 'distinct_files': len(seen), 'families': dict(fam), 'v2_forms_fetched': len(ph), 'failed_requests': fails, 'fetched_clip_keys': sorted(id2key.get(i, i) for i in seen)}
    problems.extend(f'audio request failed {u} {s}' for u, s in fails)


if __name__ == '__main__':
    if '--runtime' not in sys.argv: static_check()
    if '--static' not in sys.argv: runtime_check()
    try: old = json.load(open(OUT))
    except Exception: old = {}
    old.update(report); OUT.write_text(json.dumps(old, indent=1, default=str))   # --static and --runtime runs merge into one report
    print('\n'.join(problems[:40]) if problems else 'AUDIO COMPLETE: GREEN')
    sys.exit(1 if problems else 0)
