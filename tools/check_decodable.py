#!/usr/bin/env python3
"""Decodability gate (Levels 1-4): every word a learner is asked to blend or spell in a sitting is made only of graphemes already taught
by that sitting (taught = every earlier lesson + this lesson's sittings up to and including this one). Heart (tricky) words are exempt: they
are taught whole. Reads so/content (the Sound Out data bundled in the app). Exit 1 on a miss; --warn prints without failing."""
import json, glob, pathlib, sys
C = pathlib.Path(__file__).resolve().parent.parent / 'so/content'
lex = json.load(open(C / 'lexicon.json'))
lessons = [json.load(open(f)) for f in sorted(glob.glob(str(C / 'lessons/L1.*.json')))]
for f in sorted(glob.glob(str(C / 'levels/L*.json'))):
    b = json.load(open(f))
    for k, v in b['lexicon'].items():
        if k not in lex or (v['kind'] == 'heart' and lex[k]['kind'] != 'heart'): lex[k] = v
    lessons += b['lessons']
lessons.sort(key=lambda l: [int(x) for x in l['id'][1:].split('.')])
bad, taught, checked = [], set(), 0
def ok_cluster(x, seen):
    """A double ('ll', 'ff', 'zz') or a two-consonant cluster ('nt') is just its letters, taught earlier; digraphs and longer ('wr', 'ough', 'ion') are not."""
    return len(x) == 2 and all(c in seen for c in x) and (x[0] == x[1] or not any(c in 'aeiou' for c in x) and x not in ('wr', 'kn', 'gn', 'ph', 'wh', 'sh', 'ch', 'th', 'ck', 'ng', 'qu'))
def graphemes(w):
    e = lex.get(w) or lex.get(w.lower())
    return (e['g'], e['kind']) if e else (None, None)
for l in lessons:
    seen = set(taught)
    sit = l.get('sittings') or []
    for i, s in enumerate(sit):
        seen |= set(s.get('new') or [])
        words = list((s.get('blend') or {}).get('real', [])) + list((s.get('blend') or {}).get('pseudo', [])) + list((s.get('spell') or {}).get('words', []))
        if not s.get('blend') and i == len(sit) - 1:
            words += list((l.get('blendList') or {}).get('real', [])) + list((l.get('blendList') or {}).get('pseudo', []))
        for w in words:
            g, kind = graphemes(w); checked += 1
            if g is None or kind in ('heart', 'syllable'): continue
            miss = [x for x in g if x not in seen and not ok_cluster(x, seen)]
            if miss: bad.append(f"{l['id']}:{s['id']} word '{w}' uses untaught {miss}")
    for s in sit: taught |= set(s.get('new') or [])
    taught |= set(l.get('newToday') if isinstance(l.get('newToday'), list) else [])
KNOWN = pathlib.Path(__file__).resolve().parent.parent / 'plan/decodable-known.txt'   # misses inherited from Sound Out's content, reviewed once; new ones fail
known = set(KNOWN.read_text().split('\n')) if KNOWN.exists() else set()
if '--baseline' in sys.argv: KNOWN.write_text('\n'.join(sorted(bad)) + '\n'); print('baseline written', len(bad)); sys.exit(0)
new = [b for b in bad if b not in known]
for b in new[:60]: print('NEW MISS', b)
print(f'{checked} words checked in {len(lessons)} lessons; {len(bad)} untaught-grapheme uses, {len(known & set(bad))} known (plan/decodable-known.txt), {len(new)} new')
sys.exit(1 if new and '--warn' not in sys.argv else 0)
