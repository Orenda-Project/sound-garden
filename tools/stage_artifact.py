#!/usr/bin/env python3
"""Stage the Artifact: /tmp/sg-artifact/index.html (the single-file build) + files/ (the clips and pictures that ship) + manifest.json.

The viewer publishes at most 511 files per version (255 per publish call), so only part of the 7,909 clips ship. Priority order:
  1 the 43 sounds the landing page plays on tap   2 every ph:* clip (all sounds, v1 and the pure/anchor/stretch forms)
  3 every clip the course drivers fetched while walking L1.01-L1.04 (both tracks), the first run, Practice and Sound it out (plan/audio-complete.json)
  4 the Level 1.01-1.04 lesson clips (lt/q/t2/read), words and option words   5 the remaining ui: lines   6 letter names
then the pictures of the L1.01-L1.04 words and scenes. Anything not shipped 404s and the app simply stays quiet for that clip.
  python3 tools/stage_artifact.py [--max-files 500] [--stage /tmp/sg-artifact]
"""
import json, re, shutil, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
ARG = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
STAGE = pathlib.Path(ARG('--stage', '/tmp/sg-artifact'))
MAX = int(ARG('--max-files', '500'))
C = ROOT / 'engine/content'
idxf = json.load(open(C / 'audio_index.json')); cl = idxf['clips']
lex = json.load(open(C / 'lexicon.json')); opts = json.load(open(C / 'options.json'))
pics = json.load(open(ROOT / 'public/img/words/pictures.json'))
L1 = ('L1.01', 'L1.02', 'L1.03', 'L1.04')

# pictures first (they are cheap to count): words of L1.01-04 and the lesson scenes
words = [w for w, e in lex.items() if set(e.get('lessons', [])) & set(L1)]
pic_files = []
for k, f in pics.items():
    if k in words or k.lower() in {w.lower() for w in words} or re.match(r'scene:L1\.0[1-4]:', k):
        if (ROOT / 'public/img/words' / f).exists() and f not in pic_files: pic_files.append(f)
pic_files = pic_files[:90]

order = []                                                       # clip keys in priority order
def add(keys):
    for k in keys:
        if k in cl and k not in order: order.append(k)
sounds = json.load(open(ROOT / 'src/ui/sounds.json'))
id2key = {v['id']: k for k, v in cl.items()}
add(id2key[s[3]] for s in sounds)
add(sorted(k for k in cl if k.startswith('ph:')))
try:
    rt = json.load(open(ROOT / 'plan/audio-complete.json')).get('runtime', {}).get('fetched_clip_keys', [])
except Exception: rt = []
add(k for k in rt if k.split(':')[0] in ('ui', 'w', 'ipa', 'lt', 'q', 't2', 'read', 'name', 'syl', 'rule', 'ex', 'exw'))
add(k for k in sorted(cl) if re.match(r'(lt|q|t2|read|rule|ex|exw):L1\.0[1-4]', k))
add(f'w:{w}' for w in words)
for w in words:
    o = opts.get(w.lower())
    if o: add(f"ipa:{x['ipa']}" for x in [o['target'], *o['foils']])
add(sorted(k for k in cl if k.startswith('ui:')))
add(sorted(k for k in cl if k.startswith('name:')))
budget = MAX - len(pic_files)
ship = order[:budget]
dropped_from_priority = len(order) - len(ship)

out_files = STAGE / 'files'; shutil.rmtree(out_files, ignore_errors=True)
(out_files / 'audio').mkdir(parents=True); (out_files / 'img/words').mkdir(parents=True)
paths = []
for k in ship:
    i = cl[k]['id']; shutil.copy(ROOT / f'public/audio/{i}.ogg', out_files / f'audio/{i}.ogg'); paths.append(f'audio/{i}.ogg')
for f in pic_files:
    shutil.copy(ROOT / 'public/img/words' / f, out_files / 'img/words' / f); paths.append(f'img/words/{f}')
shutil.copy(ROOT / 'public/img/words/pictures.json', STAGE / 'pictures.json.unused') if False else None
html = (pathlib.Path(ARG('--build', '/tmp/sg-artifact/build')) / 'index.html').read_text()
assert '__SG_SHIPPED__' in html
(STAGE / 'index.html').write_text(html.replace('__SG_SHIPPED__', json.dumps(paths)))
size = lambda p: (STAGE / 'files' / p).stat().st_size
man = {'page': 'index.html', 'page_bytes': (STAGE / 'index.html').stat().st_size, 'file_count': len(paths), 'files_bytes': sum(size(p) for p in paths),
       'limits': {'files_per_version': 511, 'files_per_publish': 255, 'page_max_bytes': 16 * 2**20},
       'publish_batches': [paths[i:i + 250] and f'files[{i}:{i + 250}]' for i in range(0, len(paths), 250)],
       'audio_clips': len(ship), 'pictures': len(pic_files), 'clips_total_unique_files': len({v['id'] for v in cl.values()}), 'clips_not_shipped': len({v['id'] for v in cl.values()}) - len({cl[k]['id'] for k in ship}),
       'keys': ship, 'files': paths}
(STAGE / 'manifest.json').write_text(json.dumps(man, indent=1))
print(f"staged {STAGE}: index.html {man['page_bytes'] / 1e6:.2f} MB + {len(paths)} files ({len(ship)} clips, {len(pic_files)} pictures, {man['files_bytes'] / 1e6:.1f} MB); "
      f"{man['clips_not_shipped']} of {man['clips_total_unique_files']} clip files not shipped ({dropped_from_priority} wanted by priority list but over budget)")
