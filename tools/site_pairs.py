#!/usr/bin/env python3
"""Blind A/B pairs for the critics (labels are just A and B; the key stays with the lead).
  python3 tools/site_pairs.py OUTDIR  spec.json
spec.json = [{"name": "hero-1280-finch", "ours": ["a.png", "b.png", ...], "theirs": [...], "mode": "strip"|"still"|"page"}]
  strip : each side is a row of up to 6 frames (the motion), the two rows stacked, A on top
  still : one frame per side, side by side
  page  : each side is a tall full-page capture, shrunk to the same height, side by side
Order 1 puts ours on A, order 2 on B. Writes OUTDIR/order1/<name>.png, OUTDIR/order2/<name>.png, OUTDIR/key.json."""
import sys, json, pathlib
from PIL import Image, ImageDraw
out = pathlib.Path(sys.argv[1]); spec = json.load(open(sys.argv[2]))
def load(f): return Image.open(f).convert('RGB')
def row(files, fh=420):
    ims = [load(f) for f in files]; ims = [i.resize((max(1, int(i.width * fh / i.height)), fh)) for i in ims]
    r = Image.new('RGB', (sum(i.width for i in ims) + 6 * (len(ims) - 1), fh), 'white'); x = 0
    for i in ims: r.paste(i, (x, 0)); x += i.width + 6
    return r
def label(im, t):
    d = ImageDraw.Draw(im); d.rectangle((0, 0, 34, 30), fill='black'); d.text((11, 8), t, fill='white'); return im
sp_crop = [None]
def compose(mode, a, b):
    if mode == 'strip':
        ra, rb = row(a), row(b); W = max(ra.width, rb.width); s = Image.new('RGB', (W, ra.height + rb.height + 20), 'white'); s.paste(label(ra, 'A'), (0, 0)); s.paste(label(rb, 'B'), (0, ra.height + 20)); return s
    H = 900 if mode == 'page' else 760
    ia, ib = [load(x[0]) for x in (a, b)]
    if mode == 'page':
        c = sp_crop[0] or 6200; ia, ib = ia.crop((0, 0, ia.width, min(ia.height, c))), ib.crop((0, 0, ib.width, min(ib.height, c)))
    ia, ib = [i.resize((max(1, int(i.width * H / i.height)), H)) for i in (ia, ib)]
    s = Image.new('RGB', (ia.width + ib.width + 30, H), 'white'); s.paste(label(ia, 'A'), (0, 0)); s.paste(label(ib, 'B'), (ia.width + 30, 0)); return s
key = {}
for o in (1, 2):
    (out / f'order{o}').mkdir(parents=True, exist_ok=True)
    for sp in spec:
        a, b = (sp['ours'], sp['theirs']) if o == 1 else (sp['theirs'], sp['ours'])
        sp_crop[0] = sp.get('crop'); compose(sp['mode'], a, b).save(out / f'order{o}' / f"{sp['name']}.png"); key[f"order{o}/{sp['name']}"] = {'ours': 'A' if o == 1 else 'B'}
(out / 'key.json').write_text(json.dumps(key, indent=1)); print('pairs', len(spec), '->', out)
