#!/usr/bin/env python3
"""python3 tools/contact.py out.png cols w img1 img2 ... : a labelled contact sheet (for critics and for me)."""
import sys
from PIL import Image, ImageDraw
out, cols, w, *files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), *sys.argv[4:]
ims = []
for f in files:
    im = Image.open(f).convert('RGB'); h = int(im.height * w / im.width); ims.append((f, im.resize((w, h))))
rows = (len(ims) + cols - 1) // cols; rh = max(i.height for _, i in ims) + 18
sheet = Image.new('RGB', (cols * (w + 8) + 8, rows * rh + 8), 'white'); d = ImageDraw.Draw(sheet)
for n, (f, im) in enumerate(ims):
    x, y = 8 + (n % cols) * (w + 8), 8 + (n // cols) * rh
    sheet.paste(im, (x, y + 16)); d.text((x, y), f.split('/')[-1][:34], fill='black')
sheet.save(out); print(out, sheet.size)
