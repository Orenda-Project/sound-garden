#!/usr/bin/env python3
"""Every lesson the app lists (L1-L4 on Home, L5-L7 in content/lessons) must have a bundled practice PDF that
exists, is a PDF, and is what the 'Print practice' link (app/src/practice.js: <BASE>practice/<id>.pdf) points to.
Also: one combined PDF per level, index.json agrees with the files, and the link is wired in the two app places.
Optional: pass a dist dir (npm run build) to check the built bundle has them too.  Exit 1 on any miss.
"""
import engine_compat  # Sound Garden: app is at #/play
import sys, os, json, glob, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'app/public/practice')
bad = []
ix = json.load(open(os.path.join(PUB, 'index.json')))
ids = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'content/lessons/L*.json')))
levels = sorted({int(i[1]) for i in ids})
want = ids + [f'level-{l}-all' for l in levels]
roots = [PUB] + ([os.path.join(sys.argv[1], 'practice')] if len(sys.argv) > 1 else [])
for r in roots:
    for w in want:
        f = os.path.join(r, f'{w}.pdf')
        if not os.path.exists(f):
            bad.append(f'missing {f}')
        elif open(f, 'rb').read(5) != b'%PDF-':
            bad.append(f'not a pdf {f}')
for i in ids:
    if i not in ix:
        bad.append(f'index.json lacks {i}')
guide = open(os.path.join(ROOT, 'app/src/guide.js')).read()
home = open(os.path.join(ROOT, 'app/src/home.js')).read()
if 'printCard()' not in guide:
    bad.append('guide.js does not render printCard()')
if "printLink(l.id" not in home:
    bad.append('home.js Track B row has no printLink')
pr = open(os.path.join(ROOT, 'app/src/practice.js')).read()
if 'practice/${file}' not in pr:
    bad.append('practice.js url shape changed')
gt = os.path.join(PUB, 'guide-teach.pdf')
for r in roots:
    f = os.path.join(r, 'guide-teach.pdf')
    if not os.path.exists(f):
        bad.append(f'missing {f}')
    elif open(f, 'rb').read(5) != b'%PDF-':
        bad.append(f'not a pdf {f}')
    elif os.path.getsize(f) > 1_500_000:
        bad.append(f'guide-teach.pdf over 1.5 MB: {os.path.getsize(f)}')
if os.path.exists(gt):
    import subprocess
    try:
        npg = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', gt], capture_output=True, text=True).stdout).group(1))
        if npg < 6:
            bad.append(f'guide-teach.pdf has only {npg} pages')
    except Exception:
        pass
if "printLink('guide-teach'" not in guide:
    bad.append('guide.js does not link guide-teach.pdf')
if "printLink('guide-teach'" not in home:
    bad.append('home.js does not link guide-teach.pdf')
print(f'{len(ids)} lessons + {len(levels)} level PDFs checked in {len(roots)} place(s)')
if bad:
    print('\n'.join(bad[:30]))
    sys.exit(1)
print('PRINT LINKS OK')
