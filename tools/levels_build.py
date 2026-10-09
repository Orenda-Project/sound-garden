"""Levels 2-7 for build_content.py. L2-4: lesson screens + 12-item gates (20 at the level check). L5-7: practice sessions, no gate.
Imported by build_content.py; never edits sound-out."""
import json, os, shutil
D = "public/data"; MIN_ITEMS = 12; PASS = 10; MASTERY_N = 20; MASTERY_PASS = 17
J = lambda p: json.load(open(p))
GATED = (2, 3, 4); PRACTICE = (5, 6, 7)
# lessons that may stay below the floor if the report says why; anything else below 12 fails the build
ALLOW_SHORT = {}

def clip_texts(S):   # same keys sound-out's tools/parse_sessions.py clip_texts() gives the app: ss:<lesson>:<block>:<n>
    out, lid = {}, S["id"]; w = S.get("warm") or {}
    for i, x in enumerate(w.get("words", []) + w.get("heart", [])): out[f"ss:{lid}:warm:w{i}"] = x
    for i, x in enumerate(w.get("prompts", [])): out[f"ss:{lid}:warm:p{i}"] = x
    wd = S.get("word") or {}
    for i, it in enumerate(wd.get("items", [])): out[f"ss:{lid}:word:{i}"] = it["word"]; out[f"ss:{lid}:word:{i}:m"] = f"{it['word']}: {it['meaning']}"
    for i, v in enumerate(wd.get("vocab", [])): out[f"ss:{lid}:vocab:{i}"] = " ".join([f"{v['word']}. {v['def']}."] + v.get("examples", []))
    pr = S.get("prime") or {}
    for i, f in enumerate(pr.get("facts", [])): out[f"ss:{lid}:prime:{i}"] = f
    if pr.get("question"): out[f"ss:{lid}:prime:q"] = pr["question"]
    for j, ps in enumerate((S.get("text") or {}).get("passages", [])):
        for i, p in enumerate(ps["paragraphs"]): out[f"ss:{lid}:text:{j}:{i}"] = p
        for i, q in enumerate(ps["questions"]): out[f"ss:{lid}:text:{j}:q{i}"] = q["q"]
    for i, r in enumerate((S.get("discuss") or {}).get("roles", [])):
        if r.get("prompt"): out[f"ss:{lid}:disc:{i}"] = r["prompt"]
    if (S.get("write") or {}).get("task"): out[f"ss:{lid}:write"] = S["write"]["task"]
    for i, it in enumerate((S.get("check") or {}).get("items", [])): out[f"ss:{lid}:check:{i}"] = it["q"]
    return out

def build(SO, pinned, L1_AM, only=None):
    C = SO + "/content"; AI = J(f"{C}/audio_index.json"); CL = AI["clips"]; missing = set(AI.get("missing", []))
    report, needed = {}, {}
    os.makedirs("public/audio/more", exist_ok=True)
    have = {v["file"] for v in L1_AM.values() if v.get("file")}
    for n in GATED:
        if only and n not in only: continue
        report[n] = build_gated(SO, C, n, pinned, CL, missing, have)
    for n in PRACTICE:
        if only and n not in only: continue
        report[n] = build_practice(C, n, pinned, needed)
    merge_needed(C, needed, only)
    return report

def build_gated(SO, C, n, pinned, CL, missing, have):
    L = J(f"{C}/levels/L{n}.json"); O = J(f"{C}/options_L{n}.json"); GI = L["gateItems"]
    def item(w, kind):
        o = O.get(w.lower())
        if not o or len(o["foils"]) < 2: return None
        opts = [dict(w=x["w"], ipa=x["ipa"], cell=x["cell"], key="ipa:" + x["ipa"], ok=(i == 0)) for i, x in enumerate([o["target"]] + o["foils"])]
        return dict(kind=kind, word=w, printed=True, options=opts)
    lessons, own, nopt = {}, {}, {}
    for w, g in GI.items():
        o = O.get(w.lower())
        if not o or len(o["foils"]) < 2: nopt[g["lesson"]] = nopt.get(g["lesson"], 0) + 1
    ids = [l["id"] for l in L["lessons"]]
    for l in L["lessons"]:
        c = l.get("check") or {}; words = []
        for kind in ("real", "pseudo", "dictation"):
            for w in c.get(kind, []): words.append((w, "real" if kind == "dictation" else kind))
        words += [(w, g["kind"]) for w, g in GI.items() if g["lesson"] == l["id"]]
        seen, items = set(), []
        for w, k in words:
            if w.lower() in seen: continue
            seen.add(w.lower()); it = item(w, k)
            if it: items.append(it)
        own[l["id"]] = items
    for idx, l in enumerate(L["lessons"]):
        lid = l["id"]; t = l["title"]
        kind = "mastery" if idx == len(ids) - 1 else "review" if t.lower().startswith(("review", "level")) and "review" in t.lower() else "lesson"
        carried = 0
        if kind == "mastery":   # cumulative: round-robin across the whole level
            pools = [list(own[i]) for i in ids]; items = []
            while len(items) < MASTERY_N and any(pools):
                for p in pools:
                    if p and len(items) < MASTERY_N: items.append(p.pop(0))
            bar = dict(pass_=MASTERY_PASS, of=MASTERY_N); of_own = len(own[lid])
        else:
            items = list(own[lid][:MIN_ITEMS]); of_own = len(own[lid])
            if len(items) < MIN_ITEMS or kind == "review":
                have_w = {i["word"].lower() for i in items}
                prior = ids[:idx] if kind != "review" else ids   # review rounds draw from the whole level
                pools = [[i for i in own[p] if i["word"].lower() not in have_w] for p in reversed(prior) if p != lid]
                while len(items) < MIN_ITEMS and any(pools):
                    for p in pools:
                        while p and p[0]["word"].lower() in have_w: p.pop(0)
                        if p and len(items) < MIN_ITEMS: it = p.pop(0); have_w.add(it["word"].lower()); items.append(it); carried += 1
            bar = dict(pass_=PASS, of=MIN_ITEMS)
        need = MASTERY_N if kind == "mastery" else MIN_ITEMS
        slim = dict(id=lid, noOptions=nopt.get(lid, 0), level=n, title=t, goal=l["goal"], newToday=l["newToday"], heartLine=l.get("heartLine"), kind=kind,
                    heart=[h["word"] if isinstance(h, dict) else h for h in l.get("heart", [])], blendList=l.get("blendList"),
                    read={k: v["text"] for k, v in (l.get("read") or {}).items() if v and v.get("text")})
        if len(items) >= need:
            slim["gate"] = dict(items=items, bar=bar, own=of_own, carried=carried)
        else:
            slim["gate"] = None; slim["unbuildable"] = f"only {len(items)} of {need} items buildable ({of_own} own)"
        lessons[lid] = slim
    # audio map for this level: every key a gate item asks for; real only if sound-out has the clip file
    keys = set()
    for l in lessons.values():
        for it in (l["gate"] or dict(items=[]))["items"]:
            keys |= {f"w:{it['word']}"} | {o["key"] for o in it["options"]}
    AM, copied = {}, 0
    for k in sorted(keys):
        src = f"{SO}/app/public/audio/{CL[k]['id']}.ogg" if k in CL and k not in missing else None
        if not src or not os.path.exists(src): AM[k] = dict(file=None, status="placeholder"); continue
        f = CL[k]["id"] + ".ogg"
        if f in have: AM[k] = dict(file=f, status="real")
        else:
            dst = f"public/audio/more/{f}"
            if not os.path.exists(dst): shutil.copy(src, dst); copied += 1
            AM[k] = dict(file=f, dir="more", status="real")
    json.dump(dict(soundOutCommit=pinned, level=n, dev=True, lessons=lessons), open(f"{D}/L{n}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(AM, open(f"{D}/audio-map-L{n}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    real = sum(1 for v in AM.values() if v["status"] == "real")
    return dict(kind="gated", lessons=lessons, keys=len(AM), real=real)

def build_practice(C, n, pinned, needed):
    index = [s for s in J(f"{C}/sessions/index.json") if s["level"] == n]; out = {}
    for s in index:
        S = J(f"{C}/sessions/{s['id']}.json"); T = clip_texts(S)
        for k, v in T.items(): needed[k] = dict(text=v, levels=[n])
        wd = S.get("word") or {}
        out[S["id"]] = dict(id=S["id"], title=S["title"], goal=S.get("goal"), screens=s["screens"],
            warm=S.get("warm"), word=dict(items=wd.get("items", []), vocab=wd.get("vocab", []), affixes=wd.get("affixes", [])),
            prime=S.get("prime") and dict(facts=S["prime"].get("facts", []), question=S["prime"].get("question")),
            text=[dict(title=p.get("title"), paragraphs=p["paragraphs"], questions=[q["q"] for q in p["questions"]]) for p in (S.get("text") or {}).get("passages", [])],
            discuss=[dict(role=r["role"], prompt=r["prompt"]) for r in (S.get("discuss") or {}).get("roles", [])],
            write=(S.get("write") or {}).get("task"), check=[i["q"] for i in (S.get("check") or {}).get("items", [])], clips=len(T))
    json.dump(dict(soundOutCommit=pinned, level=n, dev=True, practice=True, sessions=out), open(f"{D}/L{n}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    return dict(kind="practice", sessions=out, clips=sum(s["clips"] for s in out.values()))

def merge_needed(C, needed, only):
    A = J(f"{C}/audio_needed.json")
    for n in GATED:
        if only and n not in only: continue
        a = A[f"L{n}"]
        for k, v in list(a["clips"].items()) + list(a["iso"].items()):
            e = needed.setdefault(k, dict(**{kk: vv for kk, vv in v.items()}, levels=[]))
            if n not in e["levels"]: e["levels"].append(n)
    p = f"{D}/audio_needed.json"
    if only and os.path.exists(p):   # partial run: keep other levels' entries
        old = J(p)["keys"]
        for k, v in old.items():
            if k in needed: needed[k]["levels"] = sorted(set(needed[k]["levels"]) | set(v["levels"]))
            else: needed[k] = v
    for e in needed.values(): e["levels"] = sorted(e["levels"])
    json.dump(dict(note="Clips the later render job must produce (merged and de-duplicated across Levels 2-7). Keys match audio-map-L*.json (L2-4) and ss:<lesson>:<block>:<n> (L5-7 practice). From sound-out audio_needed.json + clip_texts().",
        count=len(needed), keys=dict(sorted(needed.items()))), open(p, "w"), ensure_ascii=False, separators=(",", ":"))

def report_md(rep):
    s = "\n## Levels 2-7 (dev-only until audio is rendered)\n\n"
    for n in sorted(rep):
        r = rep[n]
        if r["kind"] == "gated":
            s += f"### Level {n}: {len(r['lessons'])} lessons, {r['keys']} audio keys, {r['real']} real, {r['keys']-r['real']} placeholder\n\n| lesson | kind | own items (3+ opts) | words with no 3+ option set | carried from level | gate | bar |\n|---|---|---|---|---|---|---|\n"
            for lid, l in r["lessons"].items():
                g = l["gate"]
                s += f"| {lid} | {l['kind']} | {g['own'] if g else '-'} | {l['noOptions']} | {g['carried'] if g else '-'} | {len(g['items']) if g else 'UNBUILDABLE: ' + l['unbuildable']} | {g['bar']['pass_']}/{g['bar']['of']} |\n" if g else f"| {lid} | {l['kind']} | - | - | UNBUILDABLE: {l['unbuildable']} | - |\n"
            s += "\n"
        else:
            s += f"### Level {n}: practice, no gate. {len(r['sessions'])} sessions, {r['clips']} audio clips needed, all placeholder\n\n"
    return s

def check():
    fails = []
    for n in GATED:
        if not os.path.exists(f"{D}/L{n}.json"): fails.append(f"L{n}.json missing"); continue
        L = J(f"{D}/L{n}.json"); AM = J(f"{D}/audio-map-L{n}.json")
        for lid, l in L["lessons"].items():
            g = l["gate"]
            if g is None:
                if lid not in ALLOW_SHORT: fails.append(f"{lid}: gate below floor and not in ALLOW_SHORT")
                continue
            need = MASTERY_N if l["kind"] == "mastery" else MIN_ITEMS
            k = sum(1 for it in g["items"] if len(it["options"]) >= 3)
            if k < need: fails.append(f"{lid}: {k} items with 3+ options (< {need})")
            for it in g["items"]:
                for key in [f"w:{it['word']}"] + [o["key"] for o in it["options"]]:
                    if key not in AM: fails.append(f"{lid}: audio key {key} not in audio-map-L{n}")
        for k, v in AM.items():
            if v["status"] == "real" and not os.path.exists(f"public/audio/{v.get('dir','L1')}/{v['file']}"): fails.append(f"missing file {v['file']}")
    for n in PRACTICE:
        if not os.path.exists(f"{D}/L{n}.json"): fails.append(f"L{n}.json missing"); continue
        L = J(f"{D}/L{n}.json")
        if not L["sessions"] or any("gate" in s for s in L["sessions"].values()): fails.append(f"L{n}: practice sessions must exist and carry no gate")
    if not os.path.exists(f"{D}/audio_needed.json"): fails.append("audio_needed.json missing")
    return fails
