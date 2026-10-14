#!/usr/bin/env python3
"""Maintain the course engine tree (engine/) and its data.

  python3 tools/sync_engine.py                      # re-apply engine-overlay/* over engine/app/src (no network, no other checkout needed)
  python3 tools/sync_engine.py --source <path>      # first refresh content, audio, practice PDFs and word pictures from another checkout
                                                    # of the same course data (expects <path>/content, <path>/app/public), then apply

engine/app/src is maintained in place: the overlay files (engine-overlay/*.js, *.css) replace the file of the same name,
and the teal -> leaf-green recolour is idempotent. --source never touches engine/app/src, only data.
"""
import shutil, sys, pathlib, json, re, colorsys
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'engine/app/src'
DRIVERS = ['_onb', 'drive', 'drive_levels', 'drive_practice', 'drive_sayit', 'drive_session', 'drive_teacher', 'check_nav', 'check_failed_check', 'check_ph_keys', 'check_practice_links', 'check_foils']


def pull(SO):
    for f in ['audio_index', 'gpc', 'guide', 'lexicon', 'options', 'ui_lines', 'teacher_lines']:
        shutil.copy(SO / f'content/{f}.json', ROOT / f'engine/content/{f}.json')
    for d in ['lessons', 'levels', 'sessions']:
        shutil.rmtree(ROOT / f'engine/content/{d}', ignore_errors=True); shutil.copytree(SO / f'content/{d}', ROOT / f'engine/content/{d}')
    for g in ['options_L*.json', 'options_unbuildable*.json', 'audio_needed*.json', 'audio_still_needed.json', 'foil_check.json']:   # drivers read these; the app bundles only what it imports
        for p in (SO / 'content').glob(g): shutil.copy(p, ROOT / 'engine/content' / p.name)
    shutil.copy(SO / 'content/audio_sounds_v2/gate.json', ROOT / 'engine/content/audio_sounds_v2/gate.json')
    for f in ['pictures.json', 'pictures.meta.json']: shutil.copy(SO / 'app/public/img/words' / f, ROOT / 'engine/app/public/img/words' / f)
    ids = {v['id'] for v in json.load(open(SO / 'content/audio_index.json'))['clips'].values()}
    out = ROOT / 'public/audio'; out.mkdir(parents=True, exist_ok=True); changed = 0
    for i in ids:
        src, dst = SO / f'app/public/audio/{i}.ogg', out / f'{i}.ogg'
        if not dst.exists() or dst.read_bytes() != src.read_bytes(): shutil.copy(src, dst); changed += 1   # re-voiced clips keep their id but change bytes
    shutil.rmtree(ROOT / 'public/practice', ignore_errors=True); shutil.copytree(SO / 'app/public/practice', ROOT / 'public/practice')
    shutil.rmtree(ROOT / 'public/img/words', ignore_errors=True); shutil.copytree(SO / 'app/public/img/words', ROOT / 'public/img/words')
    print('pulled; audio clips', len(ids), 'copied or replaced', changed)


def to_leaf(m):
    # hard-coded teal (hue 155-200 degrees) becomes the leaf green at the same lightness and saturation, so contrast is unchanged.
    # (The var(--good) feedback tokens stay teal on purpose: right = teal in the palette; they are set in engine-overlay/garden.css.)
    hx = m.group(1); r, g, b = [int(hx[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    hh, l, sat = colorsys.rgb_to_hls(r, g, b)
    if not (0.43 < hh < 0.56 and sat > 0.15): return m.group(0)
    r2, g2, b2 = colorsys.hls_to_rgb(0.31, l, sat)
    return '#%02X%02X%02X' % (round(r2 * 255), round(g2 * 255), round(b2 * 255))


def recolor():
    for f in list(SRC.rglob('*.css')) + list(SRC.rglob('*.js')):
        t = f.read_text(); n = re.sub(r'#([0-9A-Fa-f]{6})\b', to_leaf, t)
        if n != t: f.write_text(n)


def apply():
    recolor()
    for f in (ROOT / 'engine-overlay').glob('*.js'): shutil.copy(f, SRC / f.name)
    for f in (ROOT / 'engine-overlay').glob('*.css'): shutil.copy(f, SRC / f.name)
    print('overlay applied')


if __name__ == '__main__':
    if '--source' in sys.argv:
        i = sys.argv.index('--source')
        if i + 1 >= len(sys.argv): sys.exit('--source needs a path')
        pull(pathlib.Path(sys.argv[i + 1]).expanduser())
    apply()
