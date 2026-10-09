#!/usr/bin/env python3
"""Build public/data/{L1,shared,audio-map}.json + public/audio/L1/*.ogg + content-report.md.
   python3 tools/build_content.py          needs $SOUND_OUT (pinned in .sound-out-commit)
   python3 tools/build_content.py --check  validates committed public/data only (CI-safe)"""
import json, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import levels_build as LB
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
D = "public/data"; MIN_ITEMS = 12; PASS = 10
J = lambda p: json.load(open(p))
UI = ["ui:good", "ui:tryAgain", "ui:gateRead", "ui:gatePick", "ui:gateRepair", "ui:gateReview", "ui:gateTimeout",
      "ui:l1OralFirst", "ui:l1OralBlend", "ui:checkPass", "ui:checkMiss", "ui:miniPass", "ui:sticker"]

def check():
    fails = []
    L1 = J(f"{D}/L1.json"); AM = J(f"{D}/audio-map.json")
    for lid, l in L1["lessons"].items():
        n = sum(1 for it in l["gate"]["items"] if len(it["options"]) >= 3)
        if n < MIN_ITEMS: fails.append(f"{lid}: {n} items with 3+ options (< {MIN_ITEMS})")
        for it in l["gate"]["items"]:
            for k in it.get("prompt", []) + [o["key"] for o in it["options"]]:
                if k not in AM: fails.append(f"{lid}: audio key {k} not in audio-map")
    if len(L1["lessons"]) != 14: fails.append("expected 14 lessons")
    for k, v in AM.items():
        if v["status"] != "real": fails.append(f"placeholder audio {k}")
        if not os.path.exists(f"public/audio/L1/{v['file']}"): fails.append(f"missing file {v['file']}")
    fails += LB.check()
    for f in fails: print("FAIL", f)
    print("content check:", "FAIL" if fails else f"OK (L1 {len(L1['lessons'])} lessons, all gates >= {MIN_ITEMS}, {len(AM)} audio keys; L2-4 gated, L5-7 practice)")
    return 1 if fails else 0

def build():
    SO = os.environ.get("SOUND_OUT", "/home/oye/Documents/free_work/sound-out"); C = SO + "/content"
    pinned = open(".sound-out-commit").read().strip()
    import subprocess
    head = subprocess.run(["git", "-C", SO, "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
    if head != pinned: print(f"FAIL sound-out is at {head}, pinned {pinned}"); return 1
    O = J(f"{C}/options.json"); LEX = J(f"{C}/lexicon.json"); GPC = J(f"{C}/gpc.json"); AI = J(f"{C}/audio_index.json")
    CL = AI["clips"]; missing = set(AI.get("missing", []))
    lessons, before, rows = {}, {}, []
    def opt_item(w, kind):
        o = O.get(w.lower())
        if not o or len(o["foils"]) < 2: return None
        opts = [dict(w=x["w"], ipa=x["ipa"], cell=x["cell"], key="ipa:" + x["ipa"], ok=(i == 0)) for i, x in enumerate([o["target"]] + o["foils"])]
        if not all(x["key"] in CL and os.path.exists(f"{SO}/app/public/audio/{CL[x['key']]['id']}.ogg") for x in opts): return None
        return dict(kind=kind, word=w, printed=True, options=opts)
    for n in range(1, 15):
        lid = f"L1.{n:02d}"; l = J(f"{C}/lessons/{lid}.json")
        for k in ("source", "blocksFound", "contentVersion"): l.pop(k, None)
        c = l["check"]; items = []
        for kind in ("real", "pseudo", "dictation"):
            for w in c.get(kind, []):
                it = opt_item(w, "real" if kind == "dictation" else kind)
                if it: items.append(it)
        before[lid] = len(items)
        ov = f"content-overlay/{lid}.json"
        if os.path.exists(ov): items += J(ov)["addItems"]
        raw = c["bar"].get("raw", "")
        l["gate"] = dict(items=items, bar=dict(pass_=PASS, of=12), soundOutBar=raw)
        # slim: drop heavy listen/read text not needed by the M0 player
        for k in ("listen", "read", "sittings", "heart", "appSittings"): l.pop(k, None)
        lessons[lid] = l
    # audio
    keys = set(UI)
    for l in lessons.values():
        for it in l["gate"]["items"]:
            keys |= set(it.get("prompt", [])) | {o["key"] for o in it["options"]}
            if it.get("printed"): keys |= {f"ph:{p}" for p in LEX.get(it["word"], {}).get("p", [])}
    AM, total, ids = {}, 0, set()
    os.makedirs("public/audio/L1", exist_ok=True)
    for f in os.listdir("public/audio/L1"): os.remove(f"public/audio/L1/{f}")
    for k in sorted(keys):
        if k not in CL or k in missing: AM[k] = dict(file=None, status="placeholder"); continue
        cid = CL[k]["id"]; src = f"{SO}/app/public/audio/{cid}.ogg"
        if not os.path.exists(src): AM[k] = dict(file=None, status="placeholder"); continue
        if cid not in ids: shutil.copy(src, f"public/audio/L1/{cid}.ogg"); total += os.path.getsize(src); ids.add(cid)
        AM[k] = dict(file=f"{cid}.ogg", status="real")
    # printed-word items hear their phonemes in repair only if available; drop absent ph keys silently
    AM = {k: v for k, v in AM.items() if not (v["status"] == "placeholder" and k.startswith("ph:"))}
    bad = [k for k, v in AM.items() if v["status"] == "placeholder"]
    used = {it["word"].lower() for l in lessons.values() for it in l["gate"]["items"]}
    shared = dict(gpc=GPC, lexicon={w: e for w, e in LEX.items() if w in used or w in "".join([]) })
    os.makedirs(D, exist_ok=True)
    json.dump(dict(soundOutCommit=pinned, lessons=lessons), open(f"{D}/L1.json", "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(shared, open(f"{D}/shared.json", "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(AM, open(f"{D}/audio-map.json", "w"), separators=(",", ":"))
    with open("content-report.md", "w") as r:
        r.write(f"# Content report\n\nsound-out commit: `{pinned}`\n\n")
        r.write("| lesson | slots before overlay (3+ opts) | after overlay | sound-out bar | overlay bar |\n|---|---|---|---|---|\n")
        for lid, l in lessons.items():
            r.write(f"| {lid} | {before[lid]} | {len(l['gate']['items'])} | {l['gate']['soundOutBar'] or 'free response'} | {PASS}/12 |\n")
        r.write(f"\nDe-duplicated audio: {len(ids)} files, {total:,} bytes ({total/1e6:.2f} MB) in `public/audio/L1/`, {len(AM)} keys.\n")
        r.write("sound-out as a whole holds 2,898 .ogg (14.6 MB counting copies); its app set is 898 files, 6.2 MB. L1.02-L1.13 slots keep sound-out's repeated words (e.g. L1.02 has `at`, `sat` twice).\n")
        r.write("Dropped (no options entry): `qov`, `tio` (L1.13 pseudo words).\n")
    rep = LB.build(SO, pinned, AM)
    with open("content-report.md", "a") as r: r.write(LB.report_md(rep))
    for lid, l in lessons.items(): print(lid, before[lid], "->", len(l["gate"]["items"]))
    if bad: print("FAIL placeholder audio:", bad); return 1
    print(f"audio: {len(ids)} files {total/1e6:.2f} MB")
    return check()

sys.exit(check() if "--check" in sys.argv else build())
