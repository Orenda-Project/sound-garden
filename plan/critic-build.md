# Critic: BUILD.md (revision 2, commit 9389c36)

**VERDICT: PASS, with conditions before M0 day 1**

**Biggest gap:** M0 has no numeric pass condition for its blind test. Section 6 limits M0 to clarity and the no-wall check, but gives no win rule (the "3 of 4" rule starts at M1). The overlay authoring work (13 lessons plus 12 L1.01 items) is also unsized and has no owner.

**What now holds (checked against sound-out):**
- Pinned commit `3283e35` exists. `l1oral.js` `FIRST`, `BLEND` and `CHECK` match the 12-item oral pool recipe (5 + 3 + 4).
- First-load arithmetic is correct: 45 + 12 + 15 + 8 = 80 KB against a 90 KB cap.
- Audio figures are split correctly: 898 files and 6.2 MB in `app/public/audio`, 2,898 files overall.
- The 12-item rule is applied to all 14 Level 1 gates, and the device is a named precondition.

**Fixes by impact:**
1. Write the M0 win rule: both critics prefer ours or call it equal on clarity, and no-wall passes. State it as a numeric check.
2. Size the overlay work. Name the option-generator command, put a time box on it, and check that every L1 foil word has real audio in `audio_index.json` before M0 day 1.
3. Verify that every `oralCheck` item has 3 or more spoken options, by reading `blendWord`. If any item has fewer, the L1.01 pool is invalid.
4. Add the device name to the M0 day-1 checklist. The spike cannot run without it.
5. Fix the risk numbering (7 sits before 6). State that the overlay bar is 10/12, which differs from the 9/11 shown in sound-out's bars, so `content-report.md` shows both.
