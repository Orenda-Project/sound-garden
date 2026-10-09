# Sound Garden: product and visual design

Citation key: **R1** = research/01-teardown.md, **R2** = 02-colour.md, **R3** = 03-progression.md, **R4** = 04-mascot-motion.md, **C1..C4** = critic-0N.md; "§" is the section in that file. Items marked **NEW** rest on no research and need the playtest. Lead rulings (Sprig, the passed palette, the passed progression, kids' live test as a build gate) are applied, not reopened.

Bar: Duolingo web (shots `research/shots/teardown/duo-*`) and Teach Your Monster (`tmtr-*`). Beat TYM by having no wall (R1 §2: Play now leads to a login wall with a Student class-code tab; C1 says do not claim more than that). Beat Duolingo on 9 questionnaire screens, hearts, and white-on-`#58CC02` text (R1 §1, R2 §1.3). Note: R1 was re-read after `git pull --rebase` at write time; it was unchanged, and C1's fixes (unsourced TYM claims, unobserved in-lesson mascot) are respected here.

## 1. Principles
1. **Zero fields before the first sound.** One CTA, learner hears a sound in 10 s, first visible change (watered seed) by 90 s, ceiling 3 min (R1 §4.1; R3 §2.3).
2. **Reward the learning event, never the visit.** Gates are mastery; nothing earned is ever removed; no hearts, no streak number, no "you lost" (R3 §1.7, §2.6; R1 §1 avoid).
3. **Muted inside a lesson, saturated outside** (R2 §2.2b; Fisher 2014 clutter result, R2 §1.1).
4. **Sprig moves to carry information, and is near-still while the learner decodes** (R4 §1.2 net rule, decision 5).
5. **State is on the device and the learner holds the backup** (R3 §2.8).
6. **The UI must work for a non-reader.** Every instruction has audio and an icon; text is captioning, not the only channel. NEW (follows from learners who cannot yet read; R4 §4 says text plus voice beat voice alone for agents, so we keep both).

## 2. Visual system
- **Palette:** exactly R2 §2.1, §2.2, §2.2b tokens. Cream `#FBF6EA` ground, text `#2B2A26`, `--hero #4CB82B` with ink `#12330F` and edge `#2F7D32` (3 px, 6 px bottom), `--right #0F766E`, `--wrong #A84A07` (never red), `--sun #F5B301` always with a 2 px dark outline. Green text uses `--leaf-text #2A7230`. Rules R2 §2.6 apply: max 3 hues per lesson screen, target grapheme = bold + 3 px leaf underline, no per-letter colouring, `--right` never on a leaf or hero fill (R2 §2.3).
- **Ground switcher** (settings): cream / peach `#FBEBDD` / blue-grey `#EAF1F5` (R2 §1.2, §2.3).
- **Dark mode:** lesson and settings screens only, ground `#111814` (R2 §2.2). Saturated screens in dark are undesigned (R2 §4, C2 flaw 3): in dark, Home/Garden use the dark tokens with the sky band replaced by `--card`. Test `#111814` on a real OLED (R2 §4).
- **Fix from C2 flaw 2:** the "Try again" button on the wrong state is a cream button with sky outline, not hero green; hero green is for forward moves. Strip dev labels from any shared screenshot (C2 flaw 4).
- **Type:** one self-hosted literacy face with single-storey a and g (candidate: Andika, SIL OFL, subset to Latin, target under 30 KB woff2). NEW: not researched; check licence and subset at M0. Letters in a lesson at least 56 px on a 390 px screen.
- **Motion tokens** (R1 §4.4 measured Duolingo, R4 §4 Material): base 0.4 s ease for fills and colour; pop 0.2 s `cubic-bezier(0.35,1.8,0.35,0.83)`; **feedback sheet slides in 0.3 s** (R1 measured 0.5 s; R4 says over 400 ms feels slow, so we take the shorter, tune in playtest); Sprig reactions 300-600 ms; celebrations 1.5-2.5 s only for earned events; nothing routine over 0.7 s. Animate transform and opacity only (R4 decision 7).
- **Touch targets** at least 48 px; NEW (general mobile practice, not in the research).

## 3. Screens (S#), what moves, and Sprig states
State names are the 26 from R4 §3.1. "Still" = still pose only. Growth stage of Sprig (R4 decision 4) is a separate variable: seed (before L1.01 check), sprout (L1-2), sapling (L3-4), plant (L5-6), flowering (L7 capstone); the mapping is a tune item.

| # | Screen | What moves | Sprig |
|---|---|---|---|
| S1 | **Landing** (`/`, first visit) | One cluster: Sprig popping from a soil mound, 3 floating letters, sun. One line, one hero button "Start", quiet "I have a garden code". Footer line: "Free. No account. No ads. No cookies." (R1 §4.10) | wake, then idle |
| S2 | **Plant your seed** (tap 2, 10 s) | Seed colour: 4 big seeds, tap one, it drops into the soil with a pop. Below, two chips: "Big and playful / Quiet and calm" (see 4). No name, no age, no email (R1 §4.2, TYM ownership steal) | greet, tap-react |
| S3 | **Home / Garden** (saturated) | Horizontal zone strip (see 5), clouds drift (CSS, 3 elements), dawn/dusk from device clock, ready plants glow softly, a visitor lands on arrival after a bloom. Bottom: one hero button (Next lesson, or "Tend N plants") (R3 §2.4) | idle; greet first visit of the day; sleepy-return after 3+ days; stuck-wait after 20 s |
| S4 | **Lesson player shell** (calm) | Sky header band with back arrow and progress bar (0.4 s fill), "N in a row" label above the bar after 2 right (R1 §1 steal, `duo-lesson-m-4-combo.png`), cream body. Letters never animate except to highlight a sound while it plays (R4 §4) | idle-lesson (blink only), pointing |
| S4a | Listen / hear (oral L1) | Two-to-three-frame mouth pictures synced to audio; waveform-free; replay button pulses once if no tap in 6 s | speaking |
| S4b | Tap-gate (read it, pick what it says) | 2x2 option cards (spoken, not printed, per sound-out gate rule), selected card pops 0.2 s | thinking (1-2 s max), look-at |
| S4c | Blend / tiles / spell | Tiles slide into slots 0.3 s; sound-out highlighter steps through graphemes with audio | pointing |
| S4d | **Feedback sheet** (every answer) | Bottom sheet 0.3 s: right = teal tint, check icon, "Yes", the sound named ("sh as in ship", R2 §1.7 Hattie); wrong = orange tint, wobble icon, "Try again", correct example shown, soft tone, never a buzzer or X (R2 §2.6 rule 1) | correct-small; correct-streak at 3; wrong-soft then try-again; encourage after 3 misses; hint |
| S5 | **Sitting done** | The seed is watered: swells and wiggles with a sound (a growth step, not a stage, R3 §2.2); under 2 s | water |
| S6 | **Sprout / reward** (saturated, gold ground) | Plant rises from the soil, pops its sound when tapped; card "Ready tomorrow, about 3 minutes", the computed ready time, "Remind me" and "Add to Home Screen" (R3 §2.3 and C3 fixes 1-3) | level-up (2.5 s, the big one), celebrate; proud for milestones |
| S7 | **Review round** (calm) | Same player as S4, 12 items (16 after 7+ days away); on pass the plant blooms in S3 | as S4; water on finish |
| S8 | **Level landmark + Save your garden** | Landmark (gate, pond, bridge...) builds in 2 s; full-screen card with garden code, copy, download, QR (R3 §2.8) | celebrate, surprise |
| S9 | **Field guide** (second tab) | Static list: every sound or pattern, stage, last reviewed. No cartoon needed, the adult dashboard (R3 §2.9) | Still |
| S10 | **Settings** | Look (Playful/Quiet), ground, dark, calm motion, sound, reminders, "your garden code", "share anonymous counts" (off by default, R3 §2.5), reset | Still |
| S11 | **Welcome back** | 3-6 days: "Some plants are resting. A 3-minute review wakes them." 30+ days: "Your garden is exactly as you left it" then a 12-item mixed check (R3 §2.6) | sleepy-return |
| S12 | **Offline / audio missing** | Banner "Audio for this lesson is not downloaded", Download button; placeholder audio shows captions only | error-offline; hides itself if repeated |

Sleep (state 21) fires on `visibilitychange`; goodbye (25) on leaving a session. Every lesson event maps to a state, and at most 8 of 26 may be unused at M1 (R4 decision 3 reversal rule). Sprig appears at item boundaries and rewards, not on every tap (R4 §4 frequency).

## 4. Adult vs child tone (NEW, built on R3 §2.9 and R3 risk 4)
R3 says one engine, no label that names anyone as adult or child. So: **no age question anywhere.** One two-chip "Look" choice on S2, always changeable in S10, named by feel:
- **Playful (default):** Sprig at full size in the garden and beside lessons' feedback, tap-react variants, petals on celebrate (1.5 s), warm short copy.
- **Quiet:** Sprig shrinks to a corner badge, speaks only through the feedback sheet, celebrate is 0.8 s, praise is "Sprouted" not "Awesome!!!" (R3 §2.9), garden shows its botanical field-guide look first, lesson titles hidden on Home (R3 §2.9 privacy).
Same content, same gates, same palette, same garden. Adults also get the **test-out** path: a level check up front plants that level straight to Sprout, blooms still earned (R3 §2.7). Open question: nobody has tested this with adult learners (R2 §1.1 grade C, R3 risk 4). Playtest gate: at least 3 adults and 3 children; reversal if adults call Sprig childish even in Quiet (R4 decision 1).

## 5. Garden layout and growth
- **Seven zones left to right, one per level**, so the whole course is visible as terrain and the unfilled part is honest (R3 §2.1). Each zone is about 1.3 viewport widths of SVG; the view scrolls horizontally with snap, and a mini-map dot row jumps between zones.
- **Objects:** 98 plants (85 plants L1-6, 13 shed tools in L7), 3 path stones, 7 landmarks (gate, pond, bridge, lantern, windmill, banyan courtyard, observatory), 19 visitors, weather from the device clock (R3 §2.1). Layout per zone is **procedural**, seeded by lesson id (petal count, colour, height, position), from one plant family per zone (R3 risk 5). Only zone 1 plus a silhouette hint of zone 2 are drawn art-first; later zones ship generated at M2.
- **Four stages per plant**, each earned by a mastery event only (R3 §2.2): Seed (sitting 1 starts) -> Sprout (check at 80%+ over 12+ items) -> Bloom (successful spaced review 20 h or more later) -> Full (review again 7+ days later). Dozing (leaves folded, colour softened) if overdue, fully reversible with one retrieval, never removed.
- **Review schedule:** 20 h, 3, 7, 14, 30 days (R3 §2.2). Visitors: every 5th bloom; landmarks glow when a zone is all Bloom (R3 §2.12). Whole garden Full: the garden "sings" each sound in turn.
- **Tap a plant:** plays its sound and a word, shows its stage. The garden doubles as a sound chart (R3 §2.1).
- **Performance rule for the scene:** plants are `<use>` references to at most 7 symbols x 4 stages per zone; render only the current and adjacent zone; at most 6 ambient animated elements on S3; ambient animation paused when hidden (R4 §5 budget).

## 6. Onboarding without accounts (2 taps, R1 §4.2, §4.1)
S1 Start -> S2 plant seed + Look chip -> L1.01 sitting 1 plays at once. Nothing else is asked. Daily goal is one step, not a setting: finishing either one sitting or one 2-5 minute review counts as "tended today"; the cumulative "tended on N days" counter never resets (R3 §2.4). The goal promise copy is concrete, in the Duolingo style ("25 words in your first week", R1 §1): "Your first plant sprouts in about 20 minutes."
The "Remind me" and Add to Home Screen offers appear as in R3 §2.3 and §2.5, re-offered on the Home "plant is ready" state, after lesson 2, after the first bloom (becoming a daily repeat), and for a learner who quits mid-L1.01 ("Your seed is waiting") (C3 fixes 1-3). No push notifications in v1 (R3 §2.5).

## 7. Reduced motion and calm mode
- Honour `prefers-reduced-motion: reduce` **and** an in-app **Calm motion** toggle, because cheap Androids often lack the OS switch (R4 §4, decision 8; WCAG 2.3.3).
- Under calm: every state uses its still pose, plus a 150 ms opacity crossfade; the feedback sheet fades instead of sliding; no ambient motion; growth shows as a pose swap (R4 §4).
- **Auto-fallback:** if frame time exceeds 32 ms for 10 frames, Sprig drops to still poses for the session (R4 §5 budget).
- Meaning never rides on colour or motion alone: colour + icon + word + sound (R2 §2.6, §1.6 sunlight).

## 8. Offline and PWA
Hand-written service worker, no framework. Precache shell + Level 1 content + Level 1 audio (the 20-hour bloom hook needs the learner to come back offline-capable). Levels 2-7 download per level on tap ("Save Level 2 for offline"), cache-first for audio. `manifest.webmanifest` with maskable icon so the Add to Home Screen button works on Android; on iOS the button shows the manual Share steps (R3 §2.3, §2.8). No analytics, no cookies, no third-party requests (R1 §4.10). Sizes in BUILD.md.

## 9. Garden-code export and import (R3 §2.8)
- **Persistence:** single `localStorage` key `sg1` in try/catch; `navigator.storage.persist()` requested on first save; no IndexedDB mirror (WebKit wipes both together, so it gives false comfort).
- **Short code:** version byte + 2 bits per lesson stage x 108 + 2-byte checksum, Crockford base32 in groups of four, about 48 characters; typeable and readable over a phone call. Import marks all reviews due (one gentle round).
- **Full file / QR:** about 230-300 byte payload with review steps, last-reviewed days, tended-day bitmap, `firstDay`; `.garden` text file plus QR; `BarcodeDetector` scan only when available, the typed path always shown.
- **Merge, never overwrite:** per lesson take the higher stage and the later review date, so an old code cannot destroy new progress. Checksum failure says "check the last group".
- Shown as a full-screen card at each of the 7 landmarks (R3 §2.8.4) and in S10; once, plainly: "Your garden lives on this device only. Save your garden code to keep it safe." On iPhone Safari, Add to Home Screen is prompted after lessons 1, 2 and 5 (R3 §2.8.3).

## 10. Not decided here (owed, not hidden)
- No user evidence on any colour or tone choice (R2 Decisions; live test is the gate).
- Duolingo celebration, path and end-of-lesson screens were never captured (R1 limits), so those comparison screens are built from reported behaviour only.
- Whether Playful vs Quiet is the right split; whether "Sprig" reads as a seed to adults (R4 decision 1 reversal).
