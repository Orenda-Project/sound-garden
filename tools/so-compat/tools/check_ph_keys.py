#!/usr/bin/env python3
"""Every ph:* key the app can ask for resolves, and a missing v2 clip falls back to the v1 clip.
Checks: (1) each ph: clip in content/audio_index.json has its file in app/public/audio; (2) every phoneme in gpc.json and
every Level 2-4 g2p sound still has its v1 ph:<p> key (blends, answer buttons, sound-out); (3) every ph:<p>:pure|anchor|stretch
has a v1 ph:<p> to fall back to (audio.js resolveKey); (4) app/src/audio.js contains the fallback; (5) gate.json passes for each wired v2 clip."""
import so_compat  # Sound Garden: app is at #/play
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
idx = json.load(open(R / 'content/audio_index.json')); c = idx['clips']; bad = []
for k, v in c.items():
    if k.startswith('ph:') and not (R / 'app/public/audio' / f"{v['id']}.ogg").exists(): bad.append(f'file missing: {k}')
need = {o['p'] for o in json.load(open(R / 'content/gpc.json'))['order']}
for f in (R / 'content/levels').glob('L*.json'): need |= set(json.load(open(f))['g2p'].values())
for p in sorted(need):
    if f'ph:{p}' not in c and p != '_': bad.append(f'v1 key missing: ph:{p}')
gate = json.load(open(R / 'content/audio_sounds_v2/gate.json')); n = 0
for k in c:
    m = re.fullmatch(r'ph:([^:]+):(pure|anchor|stretch)', k)
    if not m: continue
    n += 1
    if f'ph:{m[1]}' not in c: bad.append(f'no v1 fallback for {k}')
    if not gate.get(m[1], {}).get(m[2], {}).get('pass'): bad.append(f'gate not pass: {k}')
if 'v1Fallback' not in (R / 'app/src/audio.js').read_text(): bad.append('audio.js has no v1 fallback')
print(f'{n} v2 keys checked;', 'OK' if not bad else '\n'.join(bad)); sys.exit(1 if bad else 0)
