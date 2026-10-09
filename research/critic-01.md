# Critic 01: Teardown review (second pass)

VERDICT: FAIL (narrow; fixable in minutes)

**Biggest gap:** the motion table is only partly supported by `tools/teardown/motion_dump.json`. The "Welcome screen transform 0.7 s ease-in-out" row does not appear anywhere in the dump; `0.7s` is absent from the file. The "nothing over 0.7 s" rule and decision 4's ceiling rest on that row. The "Fade of new element 0.4 s" row is mislabelled: the only fade in the dump is `onetrust-fade-in`, the cookie banner.

**Supported by the dump:** the 0.4 s ease transitions (lesson and feedback), `width 0.4s`, the 0.5 s feedback keyframe, the 0.2 s overshoot cubic-bezier keyframe, the 0.3 s max-height collapse, and 0 canvas and 0 video on register, welcome, lesson and feedback. The "57.2 s" figure is now honestly labelled as a scripted upper bound.

**Fixed from pass one:** unsourced TYM claims are removed or qualified; the Duo-in-lesson gap is stated; decisions 2 and 7 use one metaphor; each decision has a metric; the streak caveat is in.

**Fixes by impact:**
1. Delete the 0.7 s welcome row, or add a dump that samples the welcome transition and includes it. Re-check decision 4's "nothing over 0.7 s" against the dump.
2. Relabel the "Fade of new element" row as the OneTrust cookie-banner fade, or remove it.
3. Mark the metric targets (80 percent, 70 percent, 85 percent, 90 percent) as author targets with no baseline. The metrics are fine; the numbers look sourced when they are not.
4. Still-unsourced TYM phrasing: "one-eyed king tree as the quest giver" and "the game objects are the characters" are inference from a landing image. Say so.
5. Duolingo Path claims (pulsing ring, segmented progress ring, celebrations) cite S3 and S4, which I did not check. Either check them or flag them as unverified.
