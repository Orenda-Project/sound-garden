# Critic: DESIGN.md (senior Duolingo-style product designer)

VERDICT: FAIL

**Biggest gap:** The design breaks its own first-90-seconds promise. Principle 1 says the seed is watered by 90 s, but S5 waters it only at "Sitting done" (about 15-20 min in). R3 §2.3 says the first correct answer waters it. Until then the learner has seen no garden, because S3 is never placed in the first session. A 6-year-old gets Start, four seed colours, and a Look chip of text before any sound.

**Fixes by impact:**
1. Move the watering to the first correct answer inside S4 (R3 §2.3, under 90 s). Show a garden peek, with the seed, right after it. Rewrite S5 as the end-of-sitting beat only.
2. Cut S2 to one tap on a pre-planted seed (R3 §2.3 "one planted seed already sitting there"). Move the Playful/Quiet "Look" chip to after the first sprout or to S10. Text chips are unreadable for a non-reader, and "Quiet and calm" tells adults they are being sorted.
3. Resolve the Sprig contradiction. §3 says a feedback state on every answer, but the last paragraph says Sprig reacts "not on every tap". Make it explicit: every answer gets a Sprig pose (still is fine), and only rewards and item boundaries get motion.
4. Fix the motion contradictions with R4 decision 7 (transform and opacity only). §2 animates fills and colour, and dawn/dusk recolours the sky. S3 also stacks 3 clouds, 6 ambient elements, Sprig, glowing ready plants and visitors. Count against the 12-node cap. Pick one visible growth meter: Sprig's 5 stages or the plant's 4 stages.
5. Stop copying Duolingo's lesson feel. The "N in a row" combo label, the saturated sky band, and the green-hero bottom sheet are Duolingo's lesson grammar. Use a Sprig-pose-led feedback area, and make S1's Start tap also unlock audio, since browsers block autoplay until a tap.
