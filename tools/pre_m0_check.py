#!/usr/bin/env python3
"""Pre-M0 checks A/B/C against $SOUND_OUT/content (read-only). Exit 1 on any FAIL."""
import json, os, re, sys
SO = os.environ.get("SOUND_OUT", "/home/oye/Documents/free_work/sound-out")
C = f"{SO}/content"
J = lambda p: json.load(open(p))
O = J(f"{C}/options.json"); CL = J(f"{C}/audio_index.json")["clips"]
LES = {n: J(f"{C}/lessons/L1.{n:02d}.json") for n in range(1, 15)}
fails = []
def audio_ok(key):
    c = CL.get(key)
    return bool(c) and os.path.exists(f"{SO}/app/public/audio/{c['id']}.ogg")
def opts(w):
    o = O.get(w.lower())
    return None if not o else [o["target"]] + o["foils"]

# A. audio exists for every option of every Level 1 word
words = set()
for n, l in LES.items():
    c = l["check"]
    words |= set(c.get("real", []) + c.get("pseudo", []) + c.get("dictation", []))
    bl = l.get("blendList", {})
    words |= set(bl.get("real", []) + bl.get("pseudo", []))
badA = []
for w in sorted(words):
    os_ = opts(w)
    if not os_: badA.append((w, "no options entry")); continue
    for x in os_:
        if not audio_ok(f"ipa:{x['ipa']}"): badA.append((w, f"no audio ipa:{x['ipa']}"))
print(f"A. Audio exists ({len(words)} words): {'PASS' if not badA else 'FAIL'}")
for b in badA: print("   drop:", b)
if badA: fails.append("A")

# B. oralCheck options (pool logic read from app/src/screens/l1oral.js blendWord:
#    options = [w] + 2 of pool minus w; pool = CHECK+BLEND (check) or BLEND+FIRST (blend step))
src = open(f"{SO}/app/src/screens/l1oral.js").read()
assert "pool.filter(x => x !== w)" in src, "blendWord pool logic changed"
lst = lambda name: re.search(name + r" = \[(.*?)\]", src).group(1).replace("'", "").replace(" ", "").split(",")
CHECK, BLEND, FIRST = lst("const CHECK"), lst("const BLEND"), lst("const FIRST")
print(f"   pool logic: options=[w]+2 of (pool minus w); CHECK={CHECK} BLEND={BLEND} FIRST={FIRST}")
badB = []
for w in CHECK:
    pool = set(CHECK + BLEND) - {w}
    n = 1 + min(2, len(pool))
    spoken = [x for x in pool if audio_ok(f"w:{x}")]
    if n < 3 or len(spoken) < 2 or not audio_ok(f"w:{w}"): badB.append((w, "check", n))
for w in BLEND:
    pool = set(BLEND + FIRST) - {w}
    if len(pool) < 2 or not audio_ok(f"w:{w}"): badB.append((w, "blend", len(pool) + 1))
for w in FIRST:
    p = {"s","a","t","p","i","n","m","d","g","o"}
    if not all(audio_ok(f"ph:{x}") for x in p): badB.append((w, "first", 0))
print(f"B. oralCheck options: {'PASS' if not badB else 'FAIL'}")
for b in badB: print("   fewer than 3:", b)
if badB: fails.append("B")

# C. gate counts before overlay
print("C. Gate counts (before overlay), items with 3+ options:")
print("   lesson | items | 3+opts")
for n in range(1, 15):
    c = LES[n]["check"]
    items = c.get("real", []) + c.get("pseudo", []) + c.get("dictation", [])
    k = sum(1 for w in items if opts(w) and len(opts(w)) >= 3)
    note = "free response, bar %s" % LES[n]["check"]["bar"] if not items else ""
    print(f"   L1.{n:02d} | {len(items):2d} | {k:2d} {note}")
    if 2 <= n <= 13 and k < 11: print(f"      note: L1.{n:02d} has {k}, expected 11")
sys.exit(1 if fails else 0)
