# Critic: BUILD.md

**VERDICT: FAIL**

**Biggest gap:** the 12-item gate cannot be built from sound-out as written, and BUILD.md understates it. L1.02 to L1.13 checks have 11 items each (5 real, 5 pseudo, 1 dictation) with bars of 9/11 or 10/11. L1.01 has no item list at all (`freeResponse`, bar 4/5). L1.14 has no item count. So 13 of 14 Level 1 gates break the plan's own rule. Section 3 flags only L1.01.

**Resolution for M0:** add items, do not lower the bar. Author one extra non-2-option item per lesson into a sound-garden overlay (`content-overlay/L1.NN.json`, sound-out untouched), and author 12 oral items for L1.01 from its `oralCheck` sitting. `build_content.py` exits non-zero below 12.

**Other findings:**
- First-load arithmetic fails: shell JS 45 + CSS 12 + font 30 = 87 KB, against a 60 KB target before Sprig's 15 KB.
- "898 .ogg, 6.2 MB" is wrong. sound-out has 2,898 files, 14.6 MB.
- M0 says "no Sprig art", but its day-1 spike needs a 12-node Sprig rig. Name a throwaway rig.
- The spike device is "to be named". M0 cannot start until it is named.
- M0 greybox vs polished Duolingo cannot win on delight or hierarchy, so the gauntlet never converges.
- `01-teardown` is unwritten (PROGRESS.md: "waiting on 01-teardown"), so the named shots have no analysis behind them.
- No CI exists, yet budgets "fail CI". "3G-fast" is undefined.

**Fixes by impact:**
1. Overlay pool plus a hard fail in `build_content.py` below 12 items. Author the L1.01 pool.
2. Recompute the first-load budget (for example, at most 90 KB gz for shell plus Sprig stage 1, or drop the font from first load). Lock it in `size_budget.mjs`.
3. Write `01-teardown.md`. Name the spike device with model, Chrome version, 4x CPU throttle, and a 60 s capture method before M0 day 1.
4. Limit the M0 blind test to clarity of next action and the no-wall check. Move delight to M1.
5. Add a CI workflow for `size_budget`. Fix the audio numbers. Pin the `SOUND_OUT` commit (currently 3283e35) in `content-report.md`.
