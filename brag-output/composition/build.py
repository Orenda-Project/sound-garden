#!/usr/bin/env python3
"""Builds index.html for the Sound Garden launch video from the scene table below.
Scene lengths come from the narration clips (assets/vo/*.wav). Run: python3 build.py [--vertical]"""
import json, subprocess, sys, pathlib

HERE = pathlib.Path(__file__).resolve().parent
VERT = "--vertical" in sys.argv
W, H = (1080, 1920) if VERT else (1920, 1080)


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(HERE / p)],
                                capture_output=True, text=True).stdout.strip())


VO = {k: dur(f"assets/vo/{k}.wav") for k in [f"n{i:02d}" for i in range(1, 14)]}
OV = 0.35  # crossfade overlap
LEN = [3.7, 4.3, 7.4, 6.9, 7.4, 7.8, 5.3, 5.6, 10.6, 4.2, 6.2, 10.6, 4.2]
ST = []
t = 0.0
for L in LEN:
    ST.append(round(t, 3)); t += L
TOTAL = round(t, 2)
BANDS = json.load(open("/tmp/music_bands.json")) if pathlib.Path("/tmp/music_bands.json").exists() else json.load(open(HERE / "assets/music_bands.json"))


def T(i, local):
    return round(ST[i] + local, 3)


# ---------- layout helpers ----------
def phone(pid, x, y, w, img, cls=""):
    inner_w = w - 16
    inner_h = round(inner_w * 844 / 390)
    return (f'<div id="{pid}" class="ph {cls}" style="left:{x}px;top:{y}px;width:{w}px;height:{inner_h + 16}px">'
            f'<img src="assets/img/{img}" alt=""/></div>')


def label(pid, x, y, w, text, cls=""):
    return f'<div id="{pid}" class="lab {cls}" style="left:{x}px;top:{y}px;width:{w}px">{text}</div>'


HILLS = ('<svg class="hills" viewBox="0 0 1920 300" preserveAspectRatio="none" aria-hidden="true">'
         '<path d="M0 120C300 40 560 40 900 110S1500 190 1920 80V300H0Z" fill="#A9D96B"/>'
         '<path d="M0 190C380 110 700 130 1000 180S1600 240 1920 160V300H0Z" fill="#7CC33B"/>'
         '<path d="M0 250C400 200 800 215 1200 245S1700 280 1920 230V300H0Z" fill="#4CB82B"/></svg>')
SUN = ('<svg id="{id}" class="sun react" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="145" fill="#FFF3B0" opacity=".45"/>'
       '<g stroke="#F2A900" stroke-width="12" stroke-linecap="round">' +
       "".join(f'<path d="M150 22V50" transform="rotate({a} 150 150)"/>' for a in range(0, 360, 30)) +
       '</g><circle cx="150" cy="150" r="76" fill="#FFC21A" stroke="#C98A00" stroke-width="9"/><path d="M110 125Q125 100 150 96" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/></svg>')
LEAF = ('<svg class="lf" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#DDF3FF"/><path d="M32 52V30" stroke="#2F7D32" stroke-width="6" stroke-linecap="round"/>'
        '<path d="M32 32C18 32 12 24 12 14 24 14 32 20 32 32Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="3"/>'
        '<path d="M32 26C44 26 52 20 52 10 40 10 32 16 32 26Z" fill="#5CC636" stroke="#2F7D32" stroke-width="3"/></svg>')


def plant(stage):
    soil = '<ellipse cx="100" cy="228" rx="78" ry="16" fill="#8B5A2B"/><ellipse cx="100" cy="222" rx="70" ry="12" fill="#A9743C"/>'
    if stage == 0:
        body = '<path d="M100 196C116 196 124 214 120 226 116 232 108 234 100 234 92 234 84 232 80 226 76 214 84 196 100 196Z" fill="#EFCB8A" stroke="#7A4B16" stroke-width="5"/>'
    elif stage == 1:
        body = ('<path d="M100 222V140" stroke="#2F7D32" stroke-width="9" stroke-linecap="round"/>'
                '<path d="M100 150C72 150 56 130 54 108 82 108 100 126 100 150Z" fill="#5CC636" stroke="#2F7D32" stroke-width="5"/>'
                '<path d="M100 138C128 138 146 118 148 94 120 94 100 112 100 138Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="5"/>')
    else:
        petals = "".join(f'<ellipse cx="0" cy="-34" rx="19" ry="31" fill="#F78FB3" stroke="#7A4B16" stroke-width="4.5" transform="rotate({k * 45})"/>' for k in range(8))
        body = ('<path d="M100 222V108" stroke="#2F7D32" stroke-width="9" stroke-linecap="round"/>'
                '<path d="M100 190C76 190 62 174 60 156 84 156 100 170 100 190Z" fill="#5CC636" stroke="#2F7D32" stroke-width="5"/>'
                '<path d="M100 170C124 170 138 154 140 136 116 136 100 150 100 170Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="5"/>'
                f'<g transform="translate(100 84)">{petals}<circle r="21" fill="#FFC21A" stroke="#B87800" stroke-width="5"/></g>')
    return f'<svg viewBox="0 0 200 250" class="plantsvg" aria-hidden="true">{soil}{body}</svg>'


FEATURES = [
    ("Sounds first", "g"), ("43 sounds", "g"), ("5-step meet-a-sound", "g"), ("Blending", "g"), ("Words to stories", "g"),
    ("7 levels, 108 lessons", "g"), ("Missed? Taught again", "g"), ("Every line voiced", "o"), ("Garden grows", "p"),
    ("Garden never wilts", "p"), ("No timer for kids", "p"), ("Child track: Sprig", "p"), ("Grown-up track", "p"),
    ("Practice area", "b"), ("Trace each sound", "b"), ("Sound it out", "b"), ("108 printable pages", "v"),
    ("8-page Teach guide", "v"), ("Free, no paywall", "y"), ("No account", "y"), ("No age question", "y"),
    ("No ads, no tracking", "y"), ("Works offline", "o"), ("Install from the menu", "o"),
]
assert len(FEATURES) == 24

CSS = """
@font-face{font-family:"Fredoka";src:url(assets/fonts/Fredoka-var.woff2) format("woff2");font-weight:300 700}
@font-face{font-family:"Nunito";src:url(assets/fonts/Nunito-var.woff2) format("woff2");font-weight:200 1000}
*{box-sizing:border-box}
html,body{margin:0;background:#FBF6E6}
#root{position:relative;width:100%;height:100%;overflow:hidden;font-family:"Nunito",sans-serif;color:#12330F}
.scene{position:absolute;inset:0;overflow:hidden}
.in{position:absolute;inset:0}
.sky{background:linear-gradient(#5BBCF0 0%,#9AD5F5 45%,#D6EFFB 80%,#EAF7FF 100%)}
.cream{background:#FBF6E6}
.dkgreen{background:linear-gradient(#236A30,#123D1C)}
.hills{position:absolute;left:0;bottom:0;width:100%;height:300px}
.sun{position:absolute;width:300px;height:300px;right:150px;top:60px}
.ph{position:absolute;border:8px solid #12330F;border-radius:46px;overflow:hidden;background:#fff;box-shadow:0 26px 50px rgba(18,51,15,.30)}
.ph img{display:block;width:100%;height:100%;object-fit:cover}
.lab{position:absolute;text-align:center;font:600 36px/1.1 "Fredoka",sans-serif;color:#12330F}
.lab.wp{background:#fff;border:4px solid #2F7D32;border-radius:28px;padding:10px 0 12px}
.lab b{display:inline-block;width:52px;height:52px;line-height:52px;border-radius:50%;background:#2F7D32;color:#fff;margin-right:12px;font-weight:700}
.h1{position:absolute;font:600 86px/1.05 "Fredoka",sans-serif;color:#12330F}
.h2{position:absolute;font:600 64px/1.1 "Fredoka",sans-serif;color:#12330F}
.sub{position:absolute;font:800 38px/1.25 "Nunito",sans-serif;color:#2B5A27}
.pill{position:absolute;display:inline-block;padding:12px 28px;border-radius:999px;background:#fff;border:4px solid #2F7D32;font:600 34px/1 "Fredoka",sans-serif;color:#12330F;white-space:nowrap}
.pill.y{background:#FFC21A;border-color:#B87800}
.pill.dk{background:#12330F;border-color:#12330F;color:#fff}
.card{position:absolute;background:#fff;border:5px solid #2F7D32;border-radius:36px;box-shadow:0 14px 30px rgba(18,51,15,.16)}
.shot{position:absolute;border-radius:22px;border:6px solid #12330F;overflow:hidden;box-shadow:0 22px 44px rgba(18,51,15,.28);background:#fff}
.shot img{display:block;width:100%;height:100%;object-fit:cover}
.pdf{position:absolute;border:3px solid #cfc7ae;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 18px 36px rgba(18,51,15,.25)}
.pdf img{display:block;width:100%}
.spr{position:absolute}
.spr img{display:block;width:100%}
.tile{position:absolute;width:170px;height:170px;border-radius:38px;background:#fff;border:8px solid #2F7D32;box-shadow:0 8px 0 #1E5A22;text-align:center;font:600 118px/150px "Fredoka",sans-serif;color:#12330F}
.op{position:absolute;font:600 46px/1 "Fredoka",sans-serif;color:#2B5A27}
.bigw{position:absolute;font:600 150px/1 "Fredoka",sans-serif}
.chip{position:absolute;width:290px;height:92px;border-radius:26px;border:4px solid;font:600 28px/84px "Fredoka",sans-serif;text-align:center;color:#12330F;white-space:nowrap}
.chip.g{background:#E3F6D6;border-color:#2F7D32}.chip.o{background:#FFE9D6;border-color:#C9692C}.chip.p{background:#FFE0EC;border-color:#C74B7C}
.chip.b{background:#DCEEFF;border-color:#2F78C4}.chip.v{background:#EADFFB;border-color:#7447B8}.chip.y{background:#FFF0B8;border-color:#B87800}
.ico{position:absolute;width:150px;height:150px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.ico svg{width:96px;height:96px}
.ctext{position:absolute;font:600 52px/1.12 "Fredoka",sans-serif;color:#12330F}
.ctext small{display:block;font:700 34px/1.25 "Nunito",sans-serif;color:#2B5A27;margin-top:10px}
.vwrap{position:absolute;z-index:50}
.vwrap .frame{position:absolute;inset:0;border:8px solid #12330F;border-radius:46px;overflow:hidden;background:#000}
.vwrap video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.vwrap.br .frame{border-radius:24px;border-width:6px}
.bar{position:absolute;left:0;right:0;top:0;height:34px;background:#12330F;display:flex;align-items:center;gap:8px;padding-left:14px;z-index:2}
.bar i{display:block;width:12px;height:12px;border-radius:50%;background:#FFC21A}
.plantcard{position:absolute;width:330px;height:440px;background:#FFFBEF;border:5px solid #2F7D32;border-radius:36px;box-shadow:0 14px 30px rgba(18,51,15,.16);text-align:center}
.plantcard svg{position:absolute;left:35px;top:20px;width:260px;height:325px}
.plantcard div{position:absolute;left:0;right:0;bottom:24px;font:600 48px/1 "Fredoka",sans-serif}
.ring{position:absolute;border-radius:50%;border:8px solid #2F7D32;opacity:0}
"""


def build():
    s = []
    A = s.append
    # ---------------- SCENE 1: hook ----------------
    i = 0
    A(f'<section id="s1" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in sky" id="s1in">'
      + SUN.format(id="s1sun").replace("<svg ","<svg style=\"right:auto;left:80px;top:420px;width:240px;height:240px\" ") + HILLS +
      '<div class="h1" id="s1h" style="left:160px;top:70px;width:1600px;text-align:center;font-size:104px">Every reader starts with<br>one small sound.</div>'
      '<div class="ring" id="s1r1" style="left:710px;top:400px;width:500px;height:500px"></div><div class="ring" id="s1r2" style="left:710px;top:400px;width:500px;height:500px"></div>'
      '<div class="tile" id="s1t" style="left:710px;top:400px;width:500px;height:500px;border-radius:110px;border-width:16px;box-shadow:0 18px 0 #1E5A22;font-size:380px;line-height:470px">s</div>'
      '<div class="spr" id="s1sp" style="left:1290px;top:560px;width:360px"><img src="assets/sprig/listening.png" alt=""/></div>'
      '</div></section>')
    # ---------------- SCENE 2: reveal ----------------
    i = 1
    A(f'<section id="s2" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in sky" id="s2in" style="opacity:0">'
      + SUN.format(id="s2sun").replace("sun react", "sun react s2sun") + HILLS +
      f'<div id="s2logo" style="position:absolute;left:100px;top:170px;width:110px;height:110px">{LEAF}</div>'
      '<div class="bigw" id="s2t" style="left:235px;top:176px;color:#12330F;font-size:104px">Sound Garden</div>'
      '<div class="sub" id="s2s" style="left:104px;top:360px;width:760px;font-size:50px;font-family:Fredoka;font-weight:500">Free reading lessons, one sound at a time.</div>'
      '<div class="spr" id="s2sp" style="left:130px;top:560px;width:330px"><img src="assets/sprig/greet.png" alt=""/></div>'
      '<div class="pill y" id="s2p1" style="left:520px;top:640px">Free</div><div class="pill" id="s2p2" style="left:520px;top:730px">No account</div><div class="pill" id="s2p3" style="left:520px;top:820px">Works offline</div>'
      '</div></section>')
    # ---------------- SCENE 3: sounds first ----------------
    i = 2
    A(f'<section id="s3" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in cream" id="s3in" style="opacity:0">'
      '<div class="pill dk" id="s3k" style="left:90px;top:90px;font-size:36px">Taught like a real teacher</div>'
      '<div class="h1" id="s3a" style="left:90px;top:230px;width:820px;font-size:112px">Sounds first.</div>'
      '<div class="h1" id="s3b" style="left:90px;top:370px;width:820px;font-size:112px;color:#2F7D32">Never letter names.</div>'
      '<div id="s3c" style="position:absolute;left:90px;top:610px;width:360px;height:360px;border-radius:50%;background:#2F7D32;border:10px solid #12330F;text-align:center;color:#fff">'
      '<div id="s3n" style="font:600 180px/1 Fredoka;margin-top:56px">43</div><div style="font:600 46px/1 Fredoka;margin-top:6px">letter sounds</div></div>'
      '<div class="sub" id="s3d" style="left:500px;top:690px;width:400px;font-size:42px">one at a time, in the order that makes first words easy</div>'
      '<div class="shot" id="s3img" style="left:960px;top:190px;width:900px;height:563px"><img src="assets/img/el-sounds.png" alt=""/></div>'
      '<div class="spr" id="s3sp" style="left:1500px;top:640px;width:300px"><img src="assets/sprig/speaking.png" alt=""/></div>'
      '</div></section>')
    # ---------------- SCENE 4: five steps ----------------
    i = 3
    names = ["See it", "Hear the sound", "In a word", "Say it", "Pick it"]
    ph = "".join(phone(f"s4p{k}", 85 + k * 358, 190, 318, f"step{k + 1}.png") for k in range(5))
    lb = "".join(label(f"s4l{k}", 85 + k * 358, 884, 318, f"<b>{k + 1}</b>{names[k]}") for k in range(5))
    A(f'<section id="s4" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in sky" id="s4in" style="opacity:0">'
      + HILLS +
      '<div class="h1" id="s4h" style="left:0;top:50px;width:1920px;text-align:center;font-size:84px">Meeting a new sound: five small steps</div>'
      + ph + lb + '</div></section>')
    # ---------------- SCENE 5: blend + levels ----------------
    i = 4
    A(f'<section id="s5" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in cream" id="s5in" style="opacity:0">'
      '<div id="s5A">'
      + phone("s5p1", 150, 130, 380, "app-sayit2.png") + phone("s5p2", 150, 130, 380, "app-sayit3.png") + phone("s5p3", 150, 130, 380, "app-sayit4.png") +
      '<div class="tile" id="s5ta" style="left:700px;top:300px">s</div><div class="op" id="s5o1" style="left:890px;top:360px">+</div>'
      '<div class="tile" id="s5tb" style="left:960px;top:300px">a</div><div class="op" id="s5o2" style="left:1150px;top:360px">+</div>'
      '<div class="tile" id="s5tc" style="left:1220px;top:300px">t</div><div class="op" id="s5o3" style="left:1410px;top:360px">=</div>'
      '<div class="tile" id="s5td" style="left:1480px;top:300px;width:330px;background:#FFF0B8;border-color:#B87800;box-shadow:0 8px 0 #8A5B00">sat</div>'
      '<div class="pill" id="s5w1" style="left:760px;top:600px;font-size:46px">words</div><div class="pill" id="s5w2" style="left:1000px;top:600px;font-size:46px">sentences</div><div class="pill" id="s5w3" style="left:1340px;top:600px;font-size:46px">stories</div>'
      '</div><div id="s5B">'
      '<div class="h1" id="s5h" style="left:0;top:70px;width:1920px;text-align:center;font-size:100px">A garden that grows from seed to story</div>'
      '<div class="shot" id="s5lv" style="left:110px;top:270px;width:1700px;height:638px"><img src="assets/img/el-levels.png" alt=""/></div>'
      '<div class="pill y" id="s5n1" style="left:360px;top:945px;font-size:52px;padding:14px 40px">7 levels</div><div class="pill y" id="s5n2" style="left:1060px;top:945px;font-size:52px;padding:14px 40px">108 lessons</div>'
      '</div></div></section>')
    # ---------------- SCENE 6: gentle ----------------
    i = 5
    ICO_RE = '<svg viewBox="0 0 96 96"><path d="M20 48a28 28 0 0 1 50-17M76 48a28 28 0 0 1-50 17" fill="none" stroke="#2F7D32" stroke-width="9" stroke-linecap="round"/><path d="M72 14v22H50M24 82V60h22" fill="none" stroke="#2F7D32" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ICO_CL = '<svg viewBox="0 0 96 96"><circle cx="48" cy="52" r="32" fill="none" stroke="#C74B7C" stroke-width="9"/><path d="M48 32v22l14 8M40 10h16" fill="none" stroke="#C74B7C" stroke-width="9" stroke-linecap="round"/><path d="M14 86L84 16" stroke="#C74B7C" stroke-width="10" stroke-linecap="round"/></svg>'
    ICO_FL = '<svg viewBox="0 0 96 96"><g transform="translate(48 34)">' + "".join(f'<ellipse cx="0" cy="-15" rx="9" ry="14" fill="#F78FB3" stroke="#7A4B16" stroke-width="3" transform="rotate({k * 60})"/>' for k in range(6)) + '<circle r="9" fill="#FFC21A" stroke="#B87800" stroke-width="3"/></g><path d="M48 46V88" stroke="#2F7D32" stroke-width="7" stroke-linecap="round"/><path d="M48 76C34 76 28 68 28 60 38 60 48 66 48 76Z" fill="#5CC636" stroke="#2F7D32" stroke-width="3"/></svg>'
    cards = [("s6c1", 150, "#E3F6D6", ICO_RE, "A missed check never counts as a pass", "The lesson is taught again, gently."),
             ("s6c2", 430, "#FFE0EC", ICO_CL, "No timer for children", "Nobody is racing anything."),
             ("s6c3", 710, "#FFF0B8", ICO_FL, "The garden never wilts", "No streaks to lose. Nothing is taken away.")]
    cd = ""
    for cid, y, col, ic, tx, sm in cards:
        cd += (f'<div class="card" id="{cid}" style="left:720px;top:{y}px;width:1090px;height:240px"></div>'
               f'<div class="ico" id="{cid}i" style="left:760px;top:{y + 45}px;background:{col}">{ic}</div>'
               f'<div class="ctext" id="{cid}t" style="left:950px;top:{y + 44}px;width:830px">{tx}<small>{sm}</small></div>')
    A(f'<section id="s6" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in cream" id="s6in" style="opacity:0">'
      + phone("s6p", 160, 110, 400, "mini.png") + label("s6l", 60, 972, 600, "A mini check after every sitting")
      + cd + '</div></section>')
    # ---------------- SCENE 7: two tracks ----------------
    i = 6
    A(f'<section id="s7" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in sky" id="s7in" style="opacity:0">' + HILLS
      + phone("s7pa", 330, 40, 400, "app-home-grown.png") + phone("s7pb", 1190, 40, 400, "b-home.png")
      + label("s7la", 230, 935, 600, "Child track<br><span style='font:700 30px Nunito;color:#2B5A27'>with Sprig, the seed friend</span>", "wp")
      + label("s7lb", 1090, 935, 600, "Grown-up track<br><span style='font:700 30px Nunito;color:#2B5A27'>calm, with no mascot</span>", "wp")
      + '<div class="spr" id="s7sp" style="left:30px;top:560px;width:330px"><img src="assets/sprig/greet.png" alt=""/></div>'
      + '</div></section>')
    # ---------------- SCENE 8: practice ----------------
    i = 7
    A(f'<section id="s8" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in cream" id="s8in" style="opacity:0">'
      + phone("s8pa", 250, 90, 380, "app-practice.png") + phone("s8pb", 770, 90, 380, "app-trace.png")
      + phone("s8pc1", 1290, 90, 380, "app-sayit2.png") + phone("s8pc2", 1290, 90, 380, "app-sayit3.png") + phone("s8pc3", 1290, 90, 380, "app-sayit4.png")
      + label("s8la", 220, 925, 440, "Practice area<br><span style='font:700 30px Nunito;color:#2B5A27'>hear any sound you know</span>")
      + label("s8lb", 740, 925, 440, "Trace it<br><span style='font:700 30px Nunito;color:#2B5A27'>follow the letter with a finger</span>")
      + label("s8lc", 1260, 925, 440, "Sound it out<br><span style='font:700 30px Nunito;color:#2B5A27'>build a word, hear it blend</span>")
      + '</div></section>')
    # ---------------- SCENE 9: print + teach ----------------
    i = 8
    A(f'<section id="s9" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in cream" id="s9in" style="opacity:0">'
      '<div class="h1" id="s9h" style="left:70px;top:36px;width:700px;font-size:60px">Print it. Teach with it.</div>'
      '<div class="pdf" id="s9a" style="left:70px;top:160px;width:620px"><img src="assets/img/pdf-sheet.jpg" alt=""/></div>'
      '<div class="pill y" id="s9n" style="left:110px;top:900px;font-size:44px">108 printable pages</div>'
      '<div class="pdf" id="s9d" style="left:740px;top:150px;width:540px"><img src="assets/img/pdf-say.jpg" alt=""/></div>'
      '<div class="pdf" id="s9e" style="left:1310px;top:150px;width:540px"><img src="assets/img/pdf-check.jpg" alt=""/></div>'
      '<div class="pdf" id="s9b" style="left:1030px;top:520px;width:600px"><img src="assets/img/pdf-routine.jpg" alt=""/></div>'
      '<div class="pill dk" id="s9la" style="left:1050px;top:470px;z-index:3;font-size:34px">5-minute daily routine</div>'
      '<div class="pill dk" id="s9lb" style="left:790px;top:100px;font-size:32px;padding:8px 20px;z-index:3">Every sound, no extra "uh"</div>'
      '<div class="pill dk" id="s9lc" style="left:1500px;top:100px;font-size:32px;padding:8px 20px;z-index:3">Progress checklist</div>'
      '<div class="pill" id="s9g" style="left:1000px;top:984px;font-size:36px;border-color:#7447B8">Teach guide: 8 pages, free PDF</div>'
      '</div></section>')
    # ---------------- SCENE 10: garden ----------------
    i = 9
    stages = ["Seed", "Sprout", "Bloom"]
    pc = "".join(f'<div class="plantcard" id="s10c{k}" style="left:{780 + k * 350}px;top:450px">{plant(k)}<div>{stages[k]}</div></div>' for k in range(3))
    A(f'<section id="s10" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in sky" id="s10in" style="opacity:0">' + HILLS
      + '<div class="h1" id="s10h" style="left:760px;top:130px;width:1100px;font-size:84px">Every lesson grows your garden.</div>'
      + pc +
      '<div class="pill y" id="s10p" style="left:760px;top:940px;font-size:42px">Plants never wilt.</div>'
      '</div></section>')
    # ---------------- SCENE 11: 24 features ----------------
    i = 10
    chips = ""
    for k, (txt, col) in enumerate(FEATURES):
        r, c = divmod(k, 6)
        chips += f'<div class="chip {col}" id="s11c{k}" style="left:{35 + c * 312}px;top:{398 + r * 114}px">{txt}</div>'
    A(f'<section id="s11" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in cream" id="s11in" style="opacity:0">'
      '<div class="bigw" id="s11n" style="left:0;top:50px;width:900px;text-align:right;font-size:230px;color:#2F7D32">0</div>'
      '<div class="h1" id="s11t" style="left:940px;top:96px;width:900px;font-size:100px">features<br><span style="color:#B87800">all free</span></div>'
      '<div class="pill dk" id="s11f" style="left:480px;top:900px;font-size:40px">No account. No ads. No paywall. No tracking.</div>'
      + chips + '</div></section>')
    # ---------------- SCENE 12: offline ----------------
    i = 11
    A(f'<section id="s12" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i] + OV, 2)}"><div class="in dkgreen" id="s12in" style="opacity:0">'
      '<div class="pill y" id="s12k" style="left:100px;top:100px;font-size:40px">The best part</div>'
      '<div id="s12A"><div class="h1" id="s12h" style="left:100px;top:210px;width:900px;font-size:92px;color:#fff">Every single line is already voiced.</div>'
      '<div class="bigw" id="s12n" style="left:100px;top:520px;color:#FFC21A;font-size:230px">0</div>'
      '<div class="sub" id="s12nl" style="left:108px;top:780px;font-size:56px;font-family:Fredoka;font-weight:500;color:#fff">voiced clips, built right in</div></div>'
      '<div id="s12B"><div class="bigw" id="s12o" style="left:100px;top:400px;color:#fff;font-size:190px;line-height:1.05">Works<br>offline.</div>'
      '<div class="sub" id="s12os" style="left:108px;top:790px;width:880px;font-size:54px;font-family:Fredoka;font-weight:500;color:#FFF0B8">Anywhere in the world.</div></div>'
      '<div class="pill" id="s12ap" style="left:1130px;top:100px;font-size:36px;padding:12px 28px 12px 74px">'
      '<svg viewBox="0 0 64 64" style="position:absolute;left:18px;top:8px;width:44px;height:44px"><path d="M6 30L58 8 44 56 32 40 22 48 24 36Z" fill="#2F7D32"/></svg>Airplane mode</div>'
      '<div class="pill" id="s12wf" style="left:1560px;top:100px;font-size:36px;padding:12px 28px 12px 74px">'
      '<svg viewBox="0 0 64 64" style="position:absolute;left:16px;top:6px;width:48px;height:48px"><path d="M6 24C20 10 44 10 58 24M16 34C26 24 38 24 48 34M30 46h4" fill="none" stroke="#C74B7C" stroke-width="6" stroke-linecap="round"/><path d="M8 8L56 56" stroke="#C74B7C" stroke-width="7" stroke-linecap="round"/></svg>No wifi</div>'
      '<div class="shot" id="s12lap" style="left:1050px;top:260px;width:780px;height:488px"><div class="bar"><i></i><i></i><i></i></div><img src="assets/img/land-d-hero.png" alt="" style="padding-top:34px;background:#12330F"/></div>'
      + phone("s12ph", 1560, 440, 260, "step3.png") +
      '<div class="pill" id="s12in2" style="left:100px;top:920px;font-size:40px">Open it once. Install it from the browser menu.</div>'
      '</div></section>')
    # ---------------- SCENE 13: CTA ----------------
    i = 12
    A(f'<section id="s13" class="scene clip" data-start="{ST[i]}" data-duration="{round(LEN[i], 2)}"><div class="in sky" id="s13in" style="opacity:0">'
      + SUN.format(id="s13sun") + HILLS +
      '<div class="spr" id="s13sp" style="left:760px;top:60px;width:400px"><img src="assets/sprig/greet.png" alt=""/></div>'
      f'<div class="bigw" id="s13t" style="left:0;top:480px;width:1920px;text-align:center;font-size:150px;color:#12330F">Sound Garden</div>'
      '<div class="h2" id="s13s" style="left:0;top:660px;width:1920px;text-align:center;font-size:84px;color:#12330F;font-weight:500">Plant your first seed.</div>'
      '<div style="position:absolute;left:0;right:0;top:810px;display:flex;justify-content:center;gap:24px"><div class="pill y" id="s13p1" style="position:static;font-size:40px">Free</div><div class="pill" id="s13p2" style="position:static;font-size:40px">No account</div><div class="pill" id="s13p3" style="position:static;font-size:40px">Works offline</div></div>'
      '</div></section>')
    return "\n".join(s)


def vwraps():
    # root-level videos (timed media cannot sit inside a timed scene wrapper)
    hs = round(ST[1] + 0.9, 2); hd = round(ST[2] - hs + 0.35, 2)
    gs = round(ST[9] + 0.05, 2); gd = round(LEN[9] + 0.3, 2)
    return (
        f'<div class="vwrap br" id="vw-hero" style="left:1010px;top:200px;width:830px;height:520px"><div class="frame">'
        f'<video id="vhero" src="assets/vid/hero.mp4" muted playsinline data-start="{hs}" data-duration="{hd}" data-media-start="3.0" data-track-index="1" style="top:34px;height:calc(100% - 34px)"></video></div>'
        f'<div class="bar" style="border-radius:18px 18px 0 0"><i></i><i></i><i></i></div></div>'
        f'<div class="vwrap" id="vw-hatch" style="left:180px;top:100px;width:400px;height:864px"><div class="frame">'
        f'<video id="vhatch" src="assets/vid/hatch.mp4" muted playsinline data-start="{gs}" data-duration="{gd}" data-media-start="1.5" data-track-index="2"></video></div></div>'
    )


def script():
    j = []
    A = j.append
    A("const tl = gsap.timeline({ paused: true });")
    A("""function pop(sel,t,o){o=o||{};tl.fromTo(sel,{opacity:0,scale:o.s===undefined?0.7:o.s,y:o.y===undefined?36:o.y,x:o.x||0,rotation:o.r0||0},{opacity:1,scale:1,y:0,x:0,rotation:o.r||0,duration:o.d||0.55,ease:o.e||"back.out(1.5)"},t);}
function fadeIn(sel,t,d){tl.fromTo(sel,{opacity:0},{opacity:1,duration:d||0.35,ease:"power1.out"},t);}
function fadeOut(sel,t,d){tl.to(sel,{opacity:0,duration:d||0.3,ease:"power1.in"},t);}
function count(sel,t,to,d,fmt){var o={v:0};tl.to(o,{v:to,duration:d,ease:"power2.out",onUpdate:function(){var n=Math.round(o.v);document.querySelector(sel).textContent=fmt?n.toLocaleString("en-US"):n;}},t);}
""")
    # scene crossfades
    for k in range(1, 13):
        A(f'fadeIn("#s{k + 1}in",{ST[k]},{OV});')
    # ---- S1
    A(f'pop("#s1sun",{T(0, 0.0)},{{d:0.9,s:0.4,y:0}});')
    A(f'pop("#s1h",{T(0, 0.25)},{{d:0.6,y:30}});')
    A(f'pop("#s1t",{T(0, 0.55)},{{d:0.7,s:0.3,y:0}});')
    A(f'pop("#s1sp",{T(0, 1.0)},{{d:0.6,x:80,y:0,s:0.8}});')
    A(f'tl.to("#s1t",{{scale:1.1,duration:0.18,yoyo:true,repeat:1,ease:"power2.out"}},{T(0, 2.4)});')
    for r, dl in (("#s1r1", 0), ("#s1r2", 0.25)):
        A(f'tl.fromTo("{r}",{{scale:0.8,opacity:0.8}},{{scale:2.1,opacity:0,duration:1.1,ease:"power2.out"}},{T(0, 2.4 + dl)});')
    # ---- S2   beat-locked: S2 start 3.70s = strong cue 3.70
    A(f'pop("#s2sun",{T(1, 0.0)},{{d:0.8,s:0.5,y:0}});')
    A(f'pop("#s2logo",{T(1, 0.2)},{{d:0.5}}); pop("#s2t",{T(1, 0.38)},{{d:0.6,y:50}});')
    A(f'pop("#s2s",{T(1, 1.1)},{{d:0.5,y:24}});')
    A(f'pop("#s2sp",{T(1, 0.8)},{{d:0.6,y:60}});')
    for k, d in ((1, 2.0), (2, 2.35), (3, 2.7)):
        A(f'pop("#s2p{k}",{T(1, d)},{{d:0.4}});')
    A(f'pop("#vw-hero",{T(1, 0.9)},{{d:0.7,x:120,y:0,s:0.9}}); fadeOut("#vw-hero",{round(ST[2] + 0.0, 2)},0.3);')
    # ---- S3
    A(f'pop("#s3k",{T(2, 0.2)}); pop("#s3img",{T(2, 0.45)},{{d:0.7,x:120,y:0}});')
    A(f'pop("#s3a",{T(2, 2.5)},{{d:0.5,y:40}}); pop("#s3b",{T(2, 3.5)},{{d:0.5,y:40}});')
    A(f'pop("#s3c",{T(2, 5.0)},{{d:0.6,s:0.4,y:0}}); count("#s3n",{T(2, 5.05)},43,1.1); pop("#s3d",{T(2, 5.9)},{{d:0.5}});')
    A(f'pop("#s3sp",{T(2, 1.0)},{{d:0.6,y:60}});')
    # ---- S4  (cues from silence analysis of n04)
    A(f'pop("#s4h",{T(3, 0.25)},{{d:0.5,y:20}});')
    cues = [2.35, 2.85, 3.5, 4.3, 5.0]
    for k, c in enumerate(cues):
        A(f'pop("#s4p{k}",{T(3, c + 0.0)},{{d:0.55,y:70,s:0.85}}); pop("#s4l{k}",{T(3, c + 0.25)},{{d:0.4,y:20}});')
    # ---- S5
    A(f'pop("#s5p1",{T(4, 0.2)},{{d:0.5,y:60}}); fadeIn("#s5p2",{T(4, 1.5)},0.3); fadeIn("#s5p3",{T(4, 2.5)},0.3);')
    A(f'pop("#s5ta",{T(4, 0.5)},{{d:0.4}}); pop("#s5o1",{T(4, 0.8)},{{d:0.3}}); pop("#s5tb",{T(4, 1.0)},{{d:0.4}}); pop("#s5o2",{T(4, 1.3)},{{d:0.3}}); pop("#s5tc",{T(4, 1.5)},{{d:0.4}});')
    A(f'pop("#s5o3",{T(4, 2.2)},{{d:0.3}}); pop("#s5td",{T(4, 2.5)},{{d:0.55,s:0.5}});')
    for k, d in ((1, 2.9), (2, 3.15), (3, 3.4)):
        A(f'pop("#s5w{k}",{T(4, d)},{{d:0.4}});')
    A(f'tl.to("#s5A",{{opacity:0,x:-80,duration:0.4,ease:"power2.in"}},{T(4, 4.0)});')
    A(f'tl.set("#s5B",{{opacity:0}},0); tl.fromTo("#s5B",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.5,ease:"power2.out"}},{T(4, 4.05)});')
    A(f'pop("#s5h",{T(4, 4.2)},{{d:0.5,y:-20}}); pop("#s5lv",{T(4, 4.35)},{{d:0.6,y:50,s:0.92}});')
    A(f'pop("#s5n1",{T(4, 4.55)},{{d:0.45}}); pop("#s5n2",{T(4, 5.6)},{{d:0.45}});')
    # ---- S6
    A(f'pop("#s6p",{T(5, 0.2)},{{d:0.6,y:60}}); pop("#s6l",{T(5, 0.6)},{{d:0.4,y:20}});')
    for cid, d in (("s6c1", 0.4), ("s6c2", 5.0), ("s6c3", 6.0)):
        A(f'pop("#{cid}",{T(5, d)},{{d:0.5,x:90,y:0,s:0.95}}); pop("#{cid}i",{T(5, d + 0.15)},{{d:0.5,s:0.4,y:0}}); pop("#{cid}t",{T(5, d + 0.2)},{{d:0.5,x:50,y:0,s:1}});')
    # ---- S7
    A(f'pop("#s7pa",{T(6, 0.25)},{{d:0.6,y:80,s:0.9}}); pop("#s7la",{T(6, 0.55)},{{d:0.45,y:20}}); pop("#s7sp",{T(6, 0.7)},{{d:0.6,x:-60,y:0}});')
    A(f'pop("#s7pb",{T(6, 2.9)},{{d:0.6,y:80,s:0.9}}); pop("#s7lb",{T(6, 3.2)},{{d:0.45,y:20}});')
    # ---- S8
    A(f'pop("#s8pa",{T(7, 0.25)},{{d:0.55,y:80,s:0.9}}); pop("#s8la",{T(7, 0.5)},{{d:0.4,y:20}});')
    A(f'pop("#s8pb",{T(7, 1.35)},{{d:0.55,y:80,s:0.9}}); pop("#s8lb",{T(7, 1.6)},{{d:0.4,y:20}});')
    A(f'pop("#s8pc1",{T(7, 2.35)},{{d:0.55,y:80,s:0.9}}); pop("#s8lc",{T(7, 2.6)},{{d:0.4,y:20}}); fadeIn("#s8pc2",{T(7, 3.4)},0.3); fadeIn("#s8pc3",{T(7, 4.3)},0.3);')
    # ---- S9
    A(f'pop("#s9h",{T(8, 0.2)},{{d:0.5,y:-20}}); pop("#s9a",{T(8, 0.35)},{{d:0.6,y:60,r0:-5,r:-2}}); pop("#s9n",{T(8, 1.2)},{{d:0.45}});')
    A(f'pop("#s9b",{T(8, 5.5)},{{d:0.6,y:60,r0:4,r:1}}); pop("#s9la",{T(8, 5.9)},{{d:0.4,y:12}});')
    A(f'pop("#s9d",{T(8, 7.6)},{{d:0.6,y:60,r0:6,r:2}}); pop("#s9lb",{T(8, 9.1)},{{d:0.4,y:12}});')
    A(f'pop("#s9e",{T(8, 9.3)},{{d:0.6,y:60,r0:-6,r:-2}}); pop("#s9lc",{T(8, 9.6)},{{d:0.4,y:12}}); pop("#s9g",{T(8, 2.8)},{{d:0.5,y:20}});')
    # ---- S10 (hatch video lives at root level: #vw-hatch)
    A(f'pop("#s10h",{T(9, 0.3)},{{d:0.5,y:30}}); pop("#vw-hatch",{T(9, 0.05)},{{d:0.6,y:70,s:0.9}}); fadeOut("#vw-hatch",{round(ST[10], 2)},0.3);')
    for k, d in enumerate((0.25, 1.35, 2.45)):
        A(f'pop("#s10c{k}",{T(9, d + 0.3)},{{d:0.55,y:50}});')
    A(f'pop("#s10p",{T(9, 3.0)},{{d:0.45}});')
    A(f'tl.fromTo("#s10c2 svg",{{scale:0.8,transformOrigin:"50% 90%"}},{{scale:1.04,duration:0.5,ease:"back.out(2)"}},{T(9, 2.75)});')
    # ---- S11  chips + counter
    A(f'tl.set("#s11n",{{opacity:1}},0);')
    A(f'count("#s11n",{T(10, 0.4)},24,2.7); pop("#s11t",{T(10, 0.5)},{{d:0.5,x:60,y:0}});')
    for k in range(24):
        A(f'pop("#s11c{k}",{T(10, round(0.35 + k * 0.115, 3))},{{d:0.4,y:24,s:0.8}});')
    A(f'pop("#s11f",{T(10, 3.6)},{{d:0.5,y:20}});')
    A(f'tl.to("#s11n",{{scale:1.12,duration:0.2,yoyo:true,repeat:1,ease:"power2.out"}},{T(10, 3.05)});')
    # ---- S12
    A(f'pop("#s12k",{T(11, 0.25)},{{d:0.5,y:20}}); pop("#s12h",{T(11, 1.1)},{{d:0.6,y:40}});')
    A(f'pop("#s12n",{T(11, 3.45)},{{d:0.5,y:40}}); count("#s12n",{T(11, 3.55)},7909,1.5,true); pop("#s12nl",{T(11, 3.9)},{{d:0.5,y:20}});')
    A(f'tl.to("#s12A",{{opacity:0,y:-30,duration:0.4,ease:"power2.in"}},{T(11, 5.0)});')
    A(f'tl.set("#s12B",{{opacity:0}},0); tl.fromTo("#s12B",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.5,ease:"power2.out"}},{T(11, 5.35)});')
    A(f'pop("#s12ap",{T(11, 5.5)},{{d:0.45,y:20}}); pop("#s12wf",{T(11, 5.9)},{{d:0.45,y:20}});')
    A(f'pop("#s12lap",{T(11, 6.4)},{{d:0.7,y:60,s:0.9}}); pop("#s12ph",{T(11, 8.2)},{{d:0.6,y:80,s:0.9}}); pop("#s12in2",{T(11, 6.9)},{{d:0.5,y:20}});')
    # ---- S13
    A(f'pop("#s13sun",{T(12, 0.0)},{{d:0.8,s:0.5,y:0}}); pop("#s13sp",{T(12, 0.1)},{{d:0.7,y:80}});')
    A(f'pop("#s13t",{T(12, 0.45)},{{d:0.6,y:40}}); pop("#s13s",{T(12, 1.1)},{{d:0.6,y:30}});')
    for k, d in ((1, 2.0), (2, 2.3), (3, 2.6)):
        A(f'pop("#s13p{k}",{T(12, d)},{{d:0.4}});')
    A(f'tl.to("#s13sp",{{y:-18,duration:0.55,yoyo:true,repeat:5,ease:"sine.inOut"}},{T(12, 0.9)});')
    # fade whole video out at the end
    A(f'tl.to("#s13in",{{opacity:0,duration:0.6,ease:"power1.in"}},{round(TOTAL - 0.6, 2)});')
    # audio-reactive: music bass -> sun scale / warm glow (subtle)
    A("var MB=" + json.dumps(BANDS, separators=(",", ":")) + ";")
    A("""var reactEls=[].slice.call(document.querySelectorAll('.react'));
for(var f=0;f<MB.n;f++){(function(fr,i){tl.call(function(){var bass=fr[0],mid=fr[1];reactEls.forEach(function(e){e.style.setProperty('--b',(1+bass*0.045).toFixed(3));e.style.filter='brightness('+(1+mid*0.06).toFixed(3)+')';e.style.scale=(1+bass*0.045).toFixed(3);});},[],i/MB.fps);})(MB.b[f],f);}
window.__timelines["main"] = tl;""")
    return "\n".join(j)


def audio():
    a = []
    n = [0]

    def add(file, start, d, vol, track, extra=""):
        n[0] += 1
        d = min(d, dur(file) - 0.001) if not file.endswith("bed.mp3") else d
        a.append(f'<audio id="au{n[0]}" src="{file}" data-start="{round(start, 3)}" data-duration="{round(d, 3)}" data-track-index="{track}" data-volume="{vol}" {extra}></audio>')

    add("assets/music/bed.mp3", 0, TOTAL, 0.2, 10,
        extra=f'data-automation=\'{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":1.5,"v":1}},{{"t":{round(TOTAL - 4, 2)},"v":1}},{{"t":{round(TOTAL - 0.2, 2)},"v":0}}]}}]}}\'')
    for k in range(1, 14):
        d = VO[f"n{k:02d}"]
        add(f"assets/vo/n{k:02d}.wav", ST[k - 1] + (0.4 if k == 13 else 0.3), d, 1, 3)
    # product audio: the real voice clips
    add("assets/clips/s_pure.ogg", T(0, 2.4), 1.2, 0.95, 4)
    add("assets/clips/w_sat.ogg", T(4, 2.55), 0.7, 0.9, 4)
    # sfx
    sf = "assets/sfx/"
    add(sf + "impactSoft_medium_001.ogg", T(0, 0.5), 0.4, 0.5, 5)
    add(sf + "impactSoft_medium_002.ogg", T(1, 0.4), 0.4, 0.55, 5)
    add(sf + "drop_001.ogg", T(1, 2.0), 0.3, 0.4, 5); add(sf + "drop_002.ogg", T(1, 2.35), 0.3, 0.4, 5); add(sf + "drop_003.ogg", T(1, 2.7), 0.3, 0.4, 5)
    add(sf + "card-slide-1.ogg", T(2, 0.45), 0.5, 0.45, 5)
    add(sf + "impactGlass_light_001.ogg", T(2, 5.0), 0.6, 0.45, 5)
    for k, c in enumerate([2.35, 2.85, 3.5, 4.3, 5.0]):
        add(sf + "drop_001.ogg" if k % 2 == 0 else sf + "drop_002.ogg", T(3, c), 0.3, 0.45, 5)
    for k, d in enumerate((0.5, 1.0, 1.5)):
        add(sf + "click_003.ogg", T(4, d), 0.2, 0.4, 5)
    add(sf + "impactSoft_medium_001.ogg", T(4, 4.1), 0.4, 0.4, 5)
    for d in (0.4, 5.0, 6.0):
        add(sf + "card-slide-1.ogg", T(5, d), 0.5, 0.4, 5)
    add(sf + "card-slide-1.ogg", T(6, 0.25), 0.5, 0.4, 5); add(sf + "card-slide-1.ogg", T(6, 2.9), 0.5, 0.4, 5)
    for d in (0.25, 1.35, 2.35):
        add(sf + "drop_001.ogg", T(7, d), 0.3, 0.45, 5)
    for d in (0.35, 5.5, 7.6, 9.3):
        add(sf + "card-place-1.ogg", T(8, d), 0.4, 0.4, 5)
    for d in (0.55, 1.65, 2.75):
        add(sf + "drop_003.ogg", T(9, d), 0.3, 0.45, 5)
    add(sf + "bong_001.ogg", T(9, 2.75), 0.4, 0.4, 6)
    for k in range(24):
        if k % 3 == 0:
            add(sf + "click_003.ogg", T(10, 0.35 + k * 0.115), 0.2, 0.35, 5)
    add(sf + "impactGlass_light_001.ogg", T(10, 3.05), 0.6, 0.5, 5)
    add(sf + "impactSoft_medium_002.ogg", T(11, 3.45), 0.4, 0.45, 5)
    add(sf + "select_008.ogg", T(11, 5.5), 0.3, 0.45, 5)
    add(sf + "card-slide-1.ogg", T(11, 6.4), 0.5, 0.4, 5); add(sf + "card-slide-1.ogg", T(11, 8.2), 0.5, 0.4, 5)
    add(sf + "impactBell_heavy_000.ogg", T(12, 0.45), 0.8, 0.55, 5)
    return "\n".join(a)


html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width={W}, height={H}"/>
<title>Sound Garden launch video</title>
<script src="assets/gsap.min.js"></script>
<style>{CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="{W}" data-height="{H}" data-duration="{TOTAL}">
{build()}
{vwraps()}
{audio()}
</div>
<script>
{script()}
</script>
</body>
</html>
"""
(HERE / ("index.html")).write_text(html)
print("scenes", len(LEN), "total", TOTAL, "starts", ST)
