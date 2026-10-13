#!/usr/bin/env python3
"""Build blind side-by-side pairs for the critics.
  python3 tools/critic_pairs.py OUTDIR  ours1.png=theirs1.png  ours2.png=theirs2.png ...
Writes OUTDIR/order1/pair_NN.png (A = ours, B = Sound Out) and OUTDIR/order2/pair_NN.png (A = Sound Out, B = ours), labels are just 'A' and 'B',
plus OUTDIR/key.json (which side is ours in which order, never shown to the critic) and OUTDIR/bar.png (a contact sheet of the look references)."""
import sys, json, pathlib
from PIL import Image, ImageDraw, ImageFont
out = pathlib.Path(sys.argv[1]); pairs = [a.split('=') for a in sys.argv[2:]]
H = 760
def fit(f):
    im = Image.open(f).convert('RGB'); return im.resize((int(im.width * H / im.height), H))
def side(l, r):
    a, b = fit(l), fit(r); W = a.width + b.width + 60
    s = Image.new('RGB', (W, H + 50), 'white'); d = ImageDraw.Draw(s)
    s.paste(a, (20, 40)); s.paste(b, (40 + a.width, 40))
    d.text((20, 10), 'A', fill='black'); d.text((40 + a.width, 10), 'B', fill='black'); return s
key = {}
for o in (1, 2):
    (out / f'order{o}').mkdir(parents=True, exist_ok=True)
    for i, (ours, theirs) in enumerate(pairs, 1):
        side(*( (ours, theirs) if o == 1 else (theirs, ours) )).save(out / f'order{o}' / f'pair_{i:02d}.png')
        key[f'order{o}/pair_{i:02d}'] = {'ours': 'A' if o == 1 else 'B', 'names': [ours, theirs]}
(out / 'key.json').write_text(json.dumps(key, indent=1))
refs = pathlib.Path.home() / 'Documents/free_work/sound-out/plan/design/research/refs'
files = [refs / d / f'shot{n}.jpg' for d in ('finch', 'duolingo', 'teach-your-monster') for n in (1, 2, 3, 4)]
tiles = [Image.open(f).convert('RGB') for f in files if f.exists()]
h = 520; tiles = [t.resize((int(t.width * h / t.height), h)) for t in tiles]
W = sum(t.width for t in tiles[:4]) + 50
sheet = Image.new('RGB', (W, h * 3 + 40), 'white'); y = 10
for r in range(3):
    x = 10
    for t in tiles[r * 4:(r + 1) * 4]: sheet.paste(t, (x, y)); x += t.width + 10
    y += h + 10
sheet.save(out / 'bar.png'); print('pairs', len(pairs), '->', out)
