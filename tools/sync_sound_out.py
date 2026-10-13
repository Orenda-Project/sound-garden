#!/usr/bin/env python3
"""Keep Sound Garden's copy of the Sound Out engine in sync.

  python3 tools/sync_sound_out.py            # re-apply the overlay + patches to so/ (no network, no Sound Out repo needed)
  python3 tools/sync_sound_out.py --pull     # first re-copy app/src, content and audio from ~/Documents/free_work/sound-out, then apply

so/app/src/  = Sound Out's app/src (verbatim after --pull), then:
  so-overlay/*.js   replace the file of the same name (tilo.js and tilo-look.js: Sprig instead of Tilo; main.js: boots into a page; home.js: the garden home)
  PATCHES           small string replacements on files we keep verbatim otherwise
Nothing else in so/ is edited by hand, so a --pull never loses work.
"""
import shutil, sys, os, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SO = pathlib.Path(os.path.expanduser('~/Documents/free_work/sound-out'))
SRC = ROOT / 'so/app/src'

def pull():
    shutil.rmtree(SRC, ignore_errors=True); shutil.copytree(SO / 'app/src', SRC)
    for f in ['audio_index', 'gpc', 'guide', 'lexicon', 'options', 'ui_lines', 'teacher_lines']:
        shutil.copy(SO / f'content/{f}.json', ROOT / f'so/content/{f}.json')
    for d in ['lessons', 'levels', 'sessions']:
        shutil.rmtree(ROOT / f'so/content/{d}', ignore_errors=True); shutil.copytree(SO / f'content/{d}', ROOT / f'so/content/{d}')
    for g in ['options_L*.json', 'options_unbuildable*.json', 'audio_needed*.json', 'audio_still_needed.json', 'foil_check.json']:   # drivers read these; the app bundles only what it imports
        for p in (SO / 'content').glob(g): shutil.copy(p, ROOT / 'so/content' / p.name)
    shutil.copy(SO / 'content/audio_sounds_v2/gate.json', ROOT / 'so/content/audio_sounds_v2/gate.json')
    for f in DRIVERS: shutil.copy(SO / f'tools/{f}.py', ROOT / f'tools/so-compat/tools/{f}.py')   # then re-run tools/so-compat/patch_drivers.sh
    for f in ['pictures.json', 'pictures.meta.json']: shutil.copy(SO / 'app/public/img/words' / f, ROOT / 'so/app/public/img/words' / f)
    ids = {v['id'] for v in json.load(open(SO / 'content/audio_index.json'))['clips'].values()}
    out = ROOT / 'public/audio'; out.mkdir(parents=True, exist_ok=True)
    for i in ids:
        if not (out / f'{i}.ogg').exists(): shutil.copy(SO / f'app/public/audio/{i}.ogg', out / f'{i}.ogg')
    shutil.rmtree(ROOT / 'public/practice', ignore_errors=True); shutil.copytree(SO / 'app/public/practice', ROOT / 'public/practice')
    shutil.rmtree(ROOT / 'public/img/words', ignore_errors=True); shutil.copytree(SO / 'app/public/img/words', ROOT / 'public/img/words')
    print('pulled; audio clips', len(ids))

DRIVERS = ['_onb', 'drive', 'drive_levels', 'drive_practice', 'drive_sayit', 'drive_session', 'drive_teacher', 'check_nav', 'check_failed_check', 'check_ph_keys', 'check_practice_links', 'check_foils']
# (file, old, new) in PATCH_LIST below: each old must match exactly once, or the sync stops (a changed upstream line is a decision for a human)

import re, colorsys
def to_leaf(m):
    # Sound Out's hard-coded teal (hue 155-200 degrees) becomes Sound Garden's leaf green at the same lightness and saturation, so contrast is unchanged.
    # (The var(--good) feedback tokens stay teal on purpose: right = teal in Sound Garden's palette; they are set in so-overlay/garden.css.)
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
    for f in (ROOT / 'so-overlay').glob('*.js'): shutil.copy(f, SRC / f.name)
    for f in (ROOT / 'so-overlay').glob('*.css'): shutil.copy(f, SRC / f.name)
    for name, old, new, *flag in PATCH_LIST:
        p = SRC / name; t = p.read_text()
        if new in t: continue                           # already applied (new may contain old)
        if flag and flag[0] == 'all' and old in t: p.write_text(t.replace(old, new)); continue
        if t.count(old) != 1: sys.exit(f'PATCH FAILED {name}: {old[:60]!r} found {t.count(old)}x')
        p.write_text(t.replace(old, new))
    print('overlay + patches applied')

PATCH_LIST = [
    ('session.js', "if (track === 'A') s.append(village(prog.village, { justAdded: piece }));", "if (track === 'A') s.append(endPlant(lid, states(prog, track), passed));   // Sound Garden: the lesson's plant, not Tilo's village"),
    ('session.js', "async function endScreen(app,", "import { endPlant } from './garden-scene.js';\nasync function endScreen(app,"),
    ('ui.js', "export function scene({ h = 560, kind = 'day', sun = true, trees = true, extra = '' } = {}) {", "import { gardenScene } from './garden-art.js';\nexport const scene = (o = {}) => gardenScene(o);   // Sound Garden scenery; the Sound Out original is kept below as sceneSO\nexport function sceneSO({ h = 560, kind = 'day', sun = true, trees = true, extra = '' } = {}) {"),
    ('sayit.css', 'url(/fonts/', 'url(./fonts/', 'all'),   # absolute font path breaks under a sub-path host
    ('avatars.js', "child: `<img src=\"${import.meta.env.BASE_URL}img/tilo/face_happy_2x.webp\" alt=\"\" width=\"102\" height=\"102\">`,", "child: SPRIG_FACE,"),
    ('avatars.js', "const EYE = (x, y", "import { SPRIG_FACE } from './sprig-face.js';\nconst EYE = (x, y"),
    ('onboarding.js', "style: `background-image:url(${lookArt('idle', l.id) || import.meta.env.BASE_URL + 'img/tilo/idle_2x.webp'})` }", "style: `background:${l.hex}` }"),
    ('onboarding.js', "h('h1', { class: 'title scene-title' }, 'Sound Out')", "h('h1', { class: 'title scene-title' }, 'Sound Garden')"),
    ('onboarding.js', "{ class: 'scene-title', 'aria-hidden': 'true' }, 'Sound Out')", "{ class: 'scene-title', 'aria-hidden': 'true' }, 'Sound Garden')"),
    ('a11y.js', "const BRAND = 'Sound Out';", "const BRAND = 'Sound Garden';"),
    ('privacy.js', "'Sound Out works completely offline.", "'Sound Garden works offline once it has loaded.", ),
]

if __name__ == '__main__':
    if '--pull' in sys.argv: pull()
    apply()
