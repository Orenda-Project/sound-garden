#!/usr/bin/env python3
"""One-off generator for content-overlay/*.json from existing sound-out options+audio (no new audio,
no gen_options.py needed: every gap was fillable from existing options.json entries)."""
import json, os
SO = os.environ.get("SOUND_OUT", "/home/oye/Documents/free_work/sound-out"); C = SO + "/content"
J = lambda p: json.load(open(p))
O = J(f"{C}/options.json"); CL = J(f"{C}/audio_index.json")["clips"]; LEX = J(f"{C}/lexicon.json")
LES = {n: J(f"{C}/lessons/L1.{n:02d}.json") for n in range(1, 15)}
ok = lambda k: k in CL and os.path.exists(f"{SO}/app/public/audio/{CL[k]['id']}.ogg")
def usable(w):
    o = O.get(w.lower())
    return o and len(o["foils"]) >= 2 and all(ok("ipa:" + x["ipa"]) for x in [o["target"]] + o["foils"])
def item(w):
    o = O[w.lower()]
    opts = [dict(w=x["w"], ipa=x["ipa"], cell=x["cell"], key="ipa:" + x["ipa"], ok=(i == 0)) for i, x in enumerate([o["target"]] + o["foils"])]
    return dict(kind=o["kind"], word=w, options=opts)
def base(n):
    c = LES[n]["check"]; return c.get("real", []) + c.get("pseudo", []) + c.get("dictation", [])  # slots, repeats counted like sound-out
def pool(n, kind):
    out = []
    for m in range(n, 1, -1):
        bl = LES[m].get("blendList", {})
        out += [w for w in bl.get(kind, []) if w not in out]
    # then any lexicon word of the same kind taught in this lesson (kind from options.json)
    out += [w for w, e in LEX.items() if f"L1.{n:02d}" in e.get("lessons", []) and len(w) > 1
            and w.lower() in O and O[w.lower()]["kind"] == kind and w not in out]
    return out
os.makedirs("content-overlay", exist_ok=True)
for n in range(2, 15):
    have = [w for w in base(n) if usable(w)]
    need = 12 - len(have)
    want = {"real": need, "pseudo": 0} if n < 14 else {"real": 6, "pseudo": 6}
    add = []
    for kind, k in want.items():
        for w in pool(n, kind):
            if k == 0: break
            if w in base(n) or w in [a["word"] for a in add] or not usable(w): continue
            add.append(item(w)); k -= 1
    if len(have) + len(add) < 12:  # tiny vocab (L1.02): allow either kind
        for kind in ("pseudo", "real"):
            for w in pool(n, kind):
                if len(have) + len(add) >= 12: break
                if w in base(n) or w in [a["word"] for a in add] or not usable(w): continue
                add.append(item(w))
    assert len(have) + len(add) >= 12, (n, len(have), len(add))
    json.dump(dict(lesson=f"L1.{n:02d}", addItems=add), open(f"content-overlay/L1.{n:02d}.json", "w"), indent=1, ensure_ascii=False)
    print(n, len(have), "+", [a["word"] for a in add])

# L1.01 oral pool of 12 (all options spoken; prompt = what is played)
CHECK = ["sat", "top", "pig", "dog", "mat"]; BLEND = ["at", "it", "on"]; FIRST = ["sun", "top", "pig", "dog"]
WP = CHECK + BLEND + FIRST; PH = ["s", "a", "t", "p", "i", "n", "m", "d", "g", "o"]
def blend(w, pl):
    others = [x for x in pl if x != w][:2]
    assert all(ok(f"w:{x}") for x in [w] + others)
    return dict(kind="blend", word=w, prompt=[f"ph:{p}" for p in LEX[w]["p"]],
                options=[dict(w=x, key=f"w:{x}", ok=(x == w)) for x in [w] + others])
def first(w):
    t = LEX[w]["p"][0]; others = [p for p in PH if p != t][:2]
    return dict(kind="first", word=w, prompt=[f"w:{w}"],
                options=[dict(w=p, key=f"ph:{p}", ok=(p == t)) for p in [t] + others])
items = [blend(w, [x for x in CHECK + BLEND if x != w][i % 3:] + CHECK + BLEND) for i, w in enumerate(CHECK)]
items += [blend(w, CHECK + FIRST) for w in BLEND] + [first(w) for w in FIRST]
json.dump(dict(lesson="L1.01", addItems=items), open("content-overlay/L1.01.json", "w"), indent=1, ensure_ascii=False)
print(1, len(items))
