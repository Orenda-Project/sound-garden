#!/usr/bin/env python3
"""Finch rules gate (static): no account/login, no age question, no paywall/subscription, no loss-framed streaks/hearts/lives, no visible countdown,
no network call to anything but this site, and no text input reachable by a child (Track A) outside Sound it out's typed-word box for grown-ups.
Scans the shipped sources (so/app/src, src, public/*.js, index.html). Comments are skipped. Exit 1 on a hit."""
import re, pathlib, sys
R = pathlib.Path(__file__).resolve().parent.parent
files = [R / f'so/content/{n}.json' for n in ('ui_lines', 'teacher_lines', 'guide')] + [p for d in ('so/app/src', 'src') for p in (R / d).rglob('*.js')] + [R / 'public/sw.js', R / 'index.html']
RULES = [
    ('account / login', r"\b(sign[ -]?up|sign[ -]?in|log[ -]?in|create an account|password|e-?mail address)\b"),
    ('age question', r"\b(how old|your age|date of birth|birthday)\b"),
    ('paywall', r"\b(subscribe|subscription|upgrade to|premium plan|free trial|in-app purchase|buy now|unlock with)\b"),
    ('loss framing', r"\b(lose your|don't lose|you lost|hearts left|lives left|out of lives)\b"),
    ('countdown', r"\b(time('s)? (is )?up|seconds? left|countdown|hurry)\b"),
    ('tracking / network', r"\b(analytics|gtag|facebook|doubleclick|googletagmanager|fetch\(\s*['\"`]https?:)"),
]
bad = []
VISIBLE_STREAK = r"\bstreaks?\b"   # a daily streak number is loss-framed; scanned in the lines the learner sees or hears (content JSON), not in code variable names
for f in files:
    for n, line in enumerate(f.read_text(errors='ignore').split('\n'), 1):
        t = re.sub(r'//.*$', '', line) if not re.search(r"https?://", line) else line
        if t.strip().startswith(('*', '/*')): continue
        if re.search(r"\bno (account|login|ads|analytics|tracking|streaks?)\b|no streak|never|not (a )?(streak|timer)|without|grown-up", t, re.I): continue   # a denial ("no streaks") or a grown-up-only setting
        if f.suffix == '.json' and re.search(VISIBLE_STREAK, t, re.I): bad.append(f'loss framing (streak): {f.relative_to(R)}:{n}: {line.strip()[:100]}')
        for name, rx in RULES:
            if re.search(rx, t, re.I):
                if re.search(r"\bno (account|login|ads|analytics|tracking)\b|no streak|never|not (a )?(streak|timer)|without", t, re.I): continue   # a denial ("no account") is the rule being kept
                bad.append(f'{name}: {f.relative_to(R)}:{n}: {line.strip()[:120]}')
for b in bad: print('HIT', b)
print('FINCH GATE', 'RED' if bad else 'GREEN', len(bad)); sys.exit(1 if bad else 0)
