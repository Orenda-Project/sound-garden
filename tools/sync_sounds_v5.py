#!/usr/bin/env python3
"""Copy the picked teacher-style isolated sounds (Kamal 2026-10-16) from Sound Out into Sound Garden.
Source of truth: ../sound-out content/audio_index.json keys ph:<snd>:pure whose src starts with "v5/" (tools/wire_sounds_v5.py there).
Copies each clip into public/audio/<id>.ogg and the key into engine/content/audio_index.json. Idempotent.
  python3 tools/sync_sounds_v5.py [path-to-sound-out]"""
import json, shutil, sys, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
SO = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R.parent / 'sound-out'
src = json.load(open(SO / 'content/audio_index.json'))['clips']
IDX = R / 'engine/content/audio_index.json'; idx = json.load(open(IDX))
n = 0
for k, c in src.items():
    if k.endswith(':pure') and str(c.get('src', '')).startswith('v5/'):
        shutil.copyfile(SO / f"app/public/audio/{c['id']}.ogg", R / f"public/audio/{c['id']}.ogg")
        idx['clips'][k] = c; n += 1
json.dump(idx, open(IDX, 'w'), indent=1, ensure_ascii=False)
assert n >= 42, n
print(f'synced {n} v5 sound clips from {SO}')
