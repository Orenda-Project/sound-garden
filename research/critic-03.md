# Critic 03 (round-2 re-read of 03-progression.md)

**VERDICT: PASS** as the basis for the Level 1 grey-box playtest. Three text fixes must land before the build starts.

**Fixed since round 1:** the day-1 return now exists. The lesson-1 card gives a computed ready time ("blooms tomorrow after 16:00" for a 20:00 finish), the 20-hour bloom rule holds everywhere, and a single plant can fill a 12-item round. Mastery-only sprout, the speed floor and the IndexedDB mirror are all gone.

**Biggest gap (still open):** the reminder spec contradicts itself and is offered only once. Section 2.5 says the .ics is offered "on the card after the first bloom", "daily recurring, time chosen by the learner". The lesson-1 card says "Remind me" creates an event at the computed one-off time. A builder cannot implement both. A learner who dismisses the card gets no second offer, and a learner who quits before the L1.01 check never sees it.

**Fixes, by impact:**
1. Reconcile 2.5 with the card: one event, at the computed time, one-off for day 1, then offer a daily repeat only after the first bloom.
2. Re-offer "Remind me" on the Home "plant is ready" state and after lesson 2, not only once.
3. Say what a learner who quits mid-L1.01 gets: a Home line "Your seed is waiting" with the same reminder option.
4. Clarify the padding rule: "never duplicates of correct answers" conflicts with "repeat if the pool is under 12". Pick one.
5. Resolve "practice items never advance a stage" against the 80%-of-round bloom gate, which is scored on the whole round.
