# Pre-M0 checks (run 2026-10-09, sound-out pinned 3283e35)

Environment: Node v20.19.3, Python 3.12.3, playwright + pillow importable. `tools/pre_m0_check.py` output below (exits 1 because of A).

```
A. Audio exists (207 words): FAIL
   drop: ('qov', 'no options entry')
   drop: ('tio', 'no options entry')
   pool logic: options=[w]+2 of (pool minus w); CHECK=['sat', 'top', 'pig', 'dog', 'mat'] BLEND=['at', 'sat', 'it', 'on', 'mat'] FIRST=['sun', 'top', 'mat', 'pig', 'dog']
B. oralCheck options: PASS
C. Gate counts (before overlay), items with 3+ options:
   lesson | items | 3+opts
   L1.01 |  0 |  0 free response, bar {'pass': 4, 'of': 5, 'source': 'lesson', 'raw': '≥4/5'}
   L1.02 | 11 | 11 
   L1.03 | 11 | 11 
   L1.04 | 11 | 11 
   L1.05 | 11 | 11 
   L1.06 | 11 | 11 
   L1.07 | 11 | 11 
   L1.08 | 11 | 11 
   L1.09 | 11 | 11 
   L1.10 | 11 | 11 
   L1.11 | 11 | 11 
   L1.12 | 11 | 11 
   L1.13 | 11 |  9 
      note: L1.13 has 9, expected 11
   L1.14 |  0 |  0 free response, bar {'ratio': 0.9, 'source': 'lesson', 'raw': '≥90%'}
```

## Findings
- **A FAIL, handled as the checklist says:** `qov` and `tio` (L1.13 pseudo words) have no `options.json` entry. They are dropped from the pool; no audio recorded. L1.13 therefore starts at 9 items and the overlay adds 3.
- **B PASS:** `blendWord` builds options as `[w] + 2 of (pool minus w)`. Pool is CHECK+BLEND (check) or BLEND+FIRST (blend step), so every item gets 3 distinct spoken options, all with `w:` audio. Real constants differ slightly from the checklist: BLEND = at, sat, it, on, mat; FIRST = sun, top, mat, pig, dog.
- **C:** L1.02-L1.12 have 11 slots with 3+ options, but L1.02 and others repeat words inside the 11 (L1.02: `at` and `sat` appear twice, only 8 distinct). We keep sound-out's slot counting and add 1 overlay word per lesson. Worth fixing in the real overlay if repeats feel bad in playtest.
- All overlay words came from existing `options.json` entries with existing audio. `gen_options.py` was not needed and no worktree of sound-out was created.
