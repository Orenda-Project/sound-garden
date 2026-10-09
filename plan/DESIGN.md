# Sound Garden: product and visual design

Citation key: **R1** = research/01-teardown.md, **R2** = 02-colour.md, **R3** = 03-progression.md, **R4** = 04-mascot-motion.md, **C1..C4** = critic-0N.md; "§" is the section in that file. Items marked **NEW** rest on no research and need the playtest. Lead rulings (Sprig, the passed palette, the passed progression, kids' live test as a build gate) are applied, not reopened.

Bar: Duolingo web (shots `research/shots/teardown/duo-*`) and Teach Your Monster (`tmtr-*`). Beat TYM by having no wall (R1 §2: Play now leads to a login wall with a Student class-code tab; C1 says do not claim more than that). Beat Duolingo on 9 questionnaire screens, hearts, and white-on-`#58CC02` text (R1 §1, R2 §1.3). **Revision 2** answers `plan/critic-design.md` (CD) and the coordinator's lead rulings (LR a-i). R1 was re-read after its revision: its §4 Decisions now say Sprig is the owned creature and give a metric per decision. **LR(d) overrides R1 decisions 3 and 5** (bottom panel, "N in a row"): we do not copy Duolingo's lesson grammar; see §3 S4d.

## 1. Principles
1. **Zero fields, one tap, before the first sound.** One tap on a pre-planted seed (R3 §2.3 "one seed already sitting there"); that tap also unlocks audio (browsers block autoplay until a tap; CD fix 5). Sound within 10 s. **The first correct answer inside lesson 1 waters the seed, under 90 s, followed by a 2 s garden peek**, ceiling 3 min (R3 §2.3; LR a; CD fix 1). The end-of-sitting beat is separate (S5).
2. **Reward the learning event, never the visit.** Gates are mastery; nothing earned is ever removed; no hearts, no streak number, no "you lost" (R3 §1.7, §2.6; R1 §1 avoid).
3. **Muted inside a lesson, saturated outside** (R2 §2.2b; Fisher 2014 clutter result, R2 §1.1).
4. **Sprig moves to carry information, and is near-still while the learner decodes** (R4 §1.2 net rule, decision 5).
5. **State is on the device and the learner holds the backup** (R3 §2.8).
6. **The UI must work for a non-reader.** Every instruction has audio and an icon; text is captioning, not the only channel. NEW (follows from learners who cannot yet read; R4 §4 says text plus voice beat voice alone for agents, so we keep both).

## 2. Visual system
- **Palette:** exactly R2 §2.1, §2.2, §2.2b tokens. Cream `#FBF6EA` ground, text `#2B2A26`, `--hero #4CB82B` with ink `#12330F` and edge `#2F7D32` (3 px, 6 px bottom), `--right #0F766E`, `--wrong #A84A07` (never red), `--sun #F5B301` always with a 2 px dark outline. Green text uses `--leaf-text #2A7230`. Rules R2 §2.6 apply: max 3 hues per lesson screen, target grapheme = bold + 3 px leaf underline, no per-letter colouring, `--right` never on a leaf or hero fill (R2 §2.3).
- **Ground switcher** (settings): cream / peach `#FBEBDD` / blue-grey `#EAF1F5` (R2 §1.2, §2.3).
- **Dark mode:** lesson and settings screens only, ground `#111814` (R2 §2.2). Saturated screens in dark are undesigned (R2 §4, C2 flaw 3): in dark, Home/Garden use the dark tokens with the sky band replaced by `--card`. Test `#111814` on a real OLED (R2 §4).
- **Fix from C2 flaw 2:** "Try again" is a cream button with sky outline, not hero green; hero green is for forward moves. Strip dev labels from shared screenshots (C2 flaw 4). The R2 sky band stays but only as the lesson header strip (back arrow, small plant-stage icon, a thin item-progress bar); it is not a copied Duolingo progress bar with a combo label.
- **Type:** system font stack until the first sprout (LR f), then one self-hosted literacy face lazy-loaded with single-storey a and g (candidate: Andika, SIL OFL, subset to Latin, target under 30 KB woff2). NEW: not researched; check licence and subset at M0. Letters in a lesson at least 56 px on a 390 px screen.
- **Motion tokens** (R1 §4 measured Duolingo, R4 §4 Material). **Only `transform` and `opacity` animate** (R4 decision 7; CD fix 4). State colour is never tweened: a tinted layer fades in by opacity. Progress fills by `scaleX`. Day/dusk sky is two pre-rendered layers swapped once at load, never recoloured live. Tokens: base 0.3 s `ease` for fades and moves; pop 0.2 s `cubic-bezier(0.35,1.8,0.35,0.83)`; feedback pose swap is a 150 ms crossfade; Sprig reactions 300-600 ms; celebrations 1.5-2.5 s only for earned events; nothing routine over 0.5 s (R1 §4 decision 4). Under 400 ms keeps cheap phones feeling fast (R4 §4).
- **Touch targets** at least 48 px; NEW (general mobile practice, not in the research).

## 3. Screens (S#), what moves, and Sprig states
State names are the 26 from R4 §3.1. **Rule (CD fix 3, LR c): every answer gets a Sprig pose (a still pose is fine); motion happens only on rewards and at item boundaries.** Sprig's growth stages (seed, sprout, sapling, plant, flowering by level) are **cosmetic only** (LR c, overriding R4 decision 4). **The one visible growth meter is the plant's four stages** (§5); a small icon of the current plant stage sits in the lesson header, and nothing else is styled as progress except the thin item bar.

| # | Screen | What moves | Sprig |
|---|---|---|---|
| S1 | **Landing + Start** (`/`, first visit) | A pre-planted seed in a soil mound, Sprig tucked beside it, 3 static letters. Nothing animates except Sprig's wake (one pop, 0.2 s). One hero button "Start" and a quiet "I have a garden code". Footer: "Free. No account. No ads. No cookies." (R1 §4 dec. 10). **Start resumes `AudioContext` and plays the first clip**, then goes straight into L1.01 sitting 1. No colour choice, no chips, no text before the first sprout (LR b; CD fix 2) | wake, then idle |
| S3 | **Home / Garden** (saturated) | Horizontal zone strip (§5). Animated-node budget below. Bottom: one hero button (Next lesson, or "Tend N plants") (R3 §2.4) | idle; greet once a day; sleepy-return after 3+ days |
| S3p | **Garden peek** (S3 reduced) | After the first correct answer: the lesson dims by opacity, a small soil patch with the swelling seed shows 2 s, then returns. First time only; later waterings are a 0.6 s seed pulse in the header icon | water |
| S4 | **Lesson player shell** (calm) | Cream body, thin header strip as above. Letters never animate except to highlight a sound while it plays (R4 §4) | idle-lesson (blink only), pointing |
| S4a | Listen / hear (oral L1) | Mouth pictures synced to audio; replay button pulses once if no tap in 6 s | speaking |
| S4b | Tap-gate | Option cards in a 2x2 grid (spoken, not printed); the picked card pops 0.2 s | thinking (1-2 s max), look-at |
| S4c | Blend / tiles / spell | Tiles slide 0.3 s; highlighter steps through graphemes with audio | pointing |
| S4d | **Feedback area** (every answer; **no bottom sheet, no "N in a row"**, LR d) | A fixed region above the options. Sprig's pose leads: right = nod pose, teal-tint layer fades in (150 ms), check icon, the sound named ("sh as in ship", R2 §1.7 Hattie); wrong = head-tilt pose pointing at the correct example, orange-tint layer, wobble icon, "Try again", soft tone, never a buzzer or X (R2 §2.6 rule 1). Streak of 3 right: Sprig grows a leaf at the next item boundary (0.6 s), no counter | correct-small; correct-streak at 3; wrong-soft then try-again; encourage after 3 misses; hint |
| S5 | **Sitting done** (separate from first watering) | The seed swells and wiggles with a sound, under 2 s; shows "Sitting 1 of 4 done" | water |
| S6 | **Sprout / reward** (saturated, gold ground) | Plant rises from the soil, pops its sound when tapped; card "Ready tomorrow, about 3 minutes" with the computed ready time, "Remind me", "Add to Home Screen" (R3 §2.3; C3 fixes 1-3). **First time only, below the card: pick Sprig's colour (4 swatches, no words) and the Look chip with icons (§4)**; both skippable (R1 §4 dec. 2 kept: one tap, colour only, same session) | level-up (2.5 s), celebrate |
| S7 | **Review round** (calm) | Same player as S4, 12 items (16 after 7+ days away); on pass the plant blooms in S3 | as S4; water on finish |
| S8 | **Level landmark + Save your garden** | Landmark builds in 2 s; full-screen card with garden code, copy, download, QR (R3 §2.8) | celebrate, surprise |
| S9 | **Field guide** | Static list: every sound, its stage, last reviewed (R3 §2.9) | Still |
| S10 | **Settings** | Look, ground, dark, calm motion, sound, reminders, garden code, "share anonymous counts" (off, R3 §2.5), reset | Still |
| S11 | **Welcome back** | 3-6 days: "Some plants are resting. A 3-minute review wakes them." 30+ days: "Your garden is exactly as you left it" then a 12-item mixed check (R3 §2.6) | sleepy-return |
| S12 | **Offline / audio missing** | Banner with Download button; placeholder audio shows captions only | error-offline |

**S3 animated-node budget (LR c; CD fix 4), cap 12 nodes counted together with Sprig.** Sprig idle: 4 nodes (body breathe, one leaf, eyelid group, tail leaf). One cloud layer (a single group): 1. Ready-to-tend plants: at most 2 glow-pulse at once (opacity): 2; any further ready plants show a static glow ring. Visitor landing: 1, only during the 1 s landing. Tap-a-plant pop: 1. **Total 9, 3 spare for transitions.** Cut from revision 1: 3 clouds (now 1), the generic "6 ambient elements", live sky recolour. Sleep (21) fires on `visibilitychange`, goodbye (25) on session end. At most 8 of 26 states may be unused at M1 (R4 decision 3).

## 4. Adult vs child tone (NEW, built on R3 §2.9 and R3 risk 4)
R3 says one engine, no label that names anyone as adult or child. So: **no age question anywhere.** One two-chip "Look" choice, **shown once on S6 after the first sprout** (LR b; CD fix 2: text chips are unreadable to a non-reader and "Quiet and calm" must not sort adults before they have a reason), icon plus word, audio-read, always changeable in S10, named by feel:
- **Playful (default until chosen):** Sprig at full size in the garden and in the feedback area, tap-react variants, petals on celebrate (1.5 s), warm short copy.
- **Quiet:** Sprig shrinks to a corner badge, speaks only through the feedback area, celebrate is 0.8 s, praise is "Sprouted" not "Awesome!!!" (R3 §2.9), garden shows its botanical field-guide look first, lesson titles hidden on Home (R3 §2.9 privacy).
Same content, same gates, same palette, same garden. Adults also get the **test-out** path: a level check up front plants that level straight to Sprout, blooms still earned (R3 §2.7). Open question: nobody has tested this with adult learners (R2 §1.1 grade C, R3 risk 4). Playtest gate: at least 3 adults and 3 children; reversal if adults call Sprig childish even in Quiet (R4 decision 1).

## 5. Garden layout and growth
- **Seven zones left to right, one per level**, so the whole course is visible as terrain and the unfilled part is honest (R3 §2.1). Each zone is about 1.3 viewport widths of SVG; the view scrolls horizontally with snap, and a mini-map dot row jumps between zones.
- **Objects:** 98 plants (85 plants L1-6, 13 shed tools in L7), 3 path stones, 7 landmarks (gate, pond, bridge, lantern, windmill, banyan courtyard, observatory), 19 visitors, weather from the device clock (R3 §2.1). Layout per zone is **procedural**, seeded by lesson id (petal count, colour, height, position), from one plant family per zone (R3 risk 5). Only zone 1 plus a silhouette hint of zone 2 are drawn art-first; later zones ship generated at M2.
- **Four stages per plant**, each earned by a mastery event only (R3 §2.2): Seed (sitting 1 starts) -> Sprout (check at 80%+ over 12+ items) -> Bloom (successful spaced review 20 h or more later) -> Full (review again 7+ days later). Dozing (leaves folded, colour softened) if overdue, fully reversible with one retrieval, never removed.
- **Review schedule:** 20 h, 3, 7, 14, 30 days (R3 §2.2). Visitors: every 5th bloom; landmarks glow when a zone is all Bloom (R3 §2.12). Whole garden Full: the garden "sings" each sound in turn.
- **Tap a plant:** plays its sound and a word, shows its stage. The garden doubles as a sound chart (R3 §2.1).
- **Performance rule for the scene:** plants are `<use>` references to at most 7 symbols x 4 stages per zone; render only the current and adjacent zone; animated nodes on S3 counted against the 12-node cap (see S3 budget); ambient animation paused when hidden (R4 §5 budget).

## 6. Onboarding without accounts (one tap, LR b, R1 §4 dec. 1)
S1 Start (one tap on a pre-planted seed; unlocks audio) -> L1.01 sitting 1 plays at once -> first correct answer waters the seed (<90 s) -> garden peek -> lesson continues -> first sprout (S6) -> only then Sprig colour and Look chip. Nothing is asked before that. Daily goal is one step, not a setting: one sitting or one 2-5 minute review counts as "tended today"; the cumulative "tended on N days" never resets (R3 §2.4). Concrete promise (R1 §1 steal): "Your first plant sprouts in about 20 minutes." "Remind me" and Add to Home Screen are offered as in R3 §2.3 and §2.5 and re-offered on Home "plant is ready", after lesson 2, after the first bloom (daily repeat) and for a learner who quits mid-L1.01 ("Your seed is waiting") (C3 fixes 1-3). No push in v1 (R3 §2.5).

## 7. Reduced motion and calm mode
- Honour `prefers-reduced-motion: reduce` **and** an in-app **Calm motion** toggle, because cheap Androids often lack the OS switch (R4 §4, decision 8; WCAG 2.3.3).
- Under calm: every state uses its still pose, plus a 150 ms opacity crossfade; no ambient motion; growth shows as a pose swap (R4 §4). Feedback already crossfades, so calm only removes Sprig motion and the garden peek zoom.
- **Auto-fallback:** if frame time exceeds 32 ms for 10 frames, Sprig drops to still poses for the session (R4 §5 budget).
- Meaning never rides on colour or motion alone: colour + icon + word + sound (R2 §2.6, §1.6 sunlight).

## 8. Offline and PWA
Hand-written service worker, no framework. Precache shell + Level 1 content + Level 1 audio (the 20-hour bloom hook needs the learner to come back offline-capable). Levels 2-7 download per level on tap ("Save Level 2 for offline"), cache-first for audio. `manifest.webmanifest` with maskable icon so the Add to Home Screen button works on Android; on iOS the button shows the manual Share steps (R3 §2.3, §2.8). No analytics, no cookies, no third-party requests (R1 §4.10). Sizes in BUILD.md. System font until the first sprout, then Andika lazy-loads (LR f).

## 9. Garden-code export and import (R3 §2.8)
- **Persistence:** single `localStorage` key `sg1` in try/catch; `navigator.storage.persist()` requested on first save; no IndexedDB mirror (WebKit wipes both together, so it gives false comfort).
- **Short code:** version byte + 2 bits per lesson stage x 108 + 2-byte checksum, Crockford base32 in groups of four, about 48 characters; typeable and readable over a phone call. Import marks all reviews due (one gentle round).
- **Full file / QR:** about 230-300 byte payload with review steps, last-reviewed days, tended-day bitmap, `firstDay`; `.garden` text file plus QR; `BarcodeDetector` scan only when available, the typed path always shown.
- **Merge, never overwrite:** per lesson take the higher stage and the later review date, so an old code cannot destroy new progress. Checksum failure says "check the last group".
- Shown as a full-screen card at each of the 7 landmarks (R3 §2.8.4) and in S10; once, plainly: "Your garden lives on this device only. Save your garden code to keep it safe." On iPhone Safari, Add to Home Screen is prompted after lessons 1, 2 and 5 (R3 §2.8.3).

## 10. Not decided here (owed, not hidden)
- No user evidence on any colour or tone choice (R2 Decisions; live test is the gate).
- Duolingo celebration, path and in-lesson Duo were never captured (R1 limits), so those comparisons rest on reported behaviour only.
- We deliberately drop Duolingo's combo label and bottom sheet (LR d); if Gate 1 shows learners miss feedback, restore a pose-led sheet before a combo counter (R4 decision 6 reversal).
- Whether Playful vs Quiet is the right split; whether "Sprig" reads as a seed to adults (R4 decision 1 reversal).
