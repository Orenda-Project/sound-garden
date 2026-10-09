# 01 Teardown: Duolingo and Teach Your Monster to Read

Captured 2026-10-09 (motion dump re-run 08:57 +05:00, `tools/teardown/motion_dump.json`) with headless Chromium (Playwright). Scripts and raw output are in `tools/teardown/`; run `python3 duo_motion_dump.py` to reproduce the motion table, canvas count and step list. Screenshots are in `shots/teardown/` (22 PNGs). "Measured" means read from the live page; "reported" means from a cited write-up. Duolingo was run as a guest on Spanish, mobile 390x844 end to end, plus desktop 1280x800 for landing and the first lesson questions.

Evidence limits, stated up front:
- Duolingo guest flow reached a real lesson with no account and no wall inside about 16 steps. I did not reach the end-of-lesson screen, so the streak and signup prompt are known only from their blog.
- Teach Your Monster (TYM) has a hard login wall in front of the game. `/account/play/tm123/go` redirects to `/account/users/sign_in` on both viewports. Everything about its in-game behaviour is from the Usborne Foundation, TYM's own pages and press, not from my play.
- Reading Eggs would not load for the search tool and I did not capture it. Khan Kids and Read Along are covered from public descriptions only.

## 1. Duolingo

### First 30 seconds
- Landing (`shots/teardown/duo-landing-m.png`, `duo-landing-d.png`): one cluster of the cast, one line ("The most fun way to learn languages, chess, and more!"), one big green GET STARTED, a quiet "I already have an account". Nothing to read, no nav competing. Desktop adds a language strip.
- GET STARTED goes to `/register` "I want to learn..." (`duo-pick-m.png`) with learner counts per language as social proof. No email field. Picking Spanish moves to `/welcome`.
- Pre-lesson questionnaire: 10 separate screens across 7 URL steps (`/welcome`, `hdyhau`, `learningReason`, `proficiency`, `courseOverview`, `dailyGoal`, `choosePath`) before the first question. I kept 7 representative screenshots (`duo-welcome-01-hi.png` to `07-motivation.png`), not all 10. The screens: Duo says hi, "Let's get this party started", "How did you hear", "Why are you learning" (reply bubble "Yay! Fun is my specialty!"), level, "Here's what you can achieve", daily goal ("That's 25 words in your first week!"), choose path, two motivation screens ("It can be hard to stay motivated... so Duolingo is designed to be fun like a game!"). Each answer gets a reactive line from Duo before CONTINUE enables.
- Then `/lesson` immediately. The first challenge is "Which one of these is 'cat'?" with three picture cards (`duo-lesson-m-1-question.png`). No account is needed. Time to first challenge was not timed with a human; my script, which includes fixed waits of 1 to 5 s per screen, took 57.2 s from picking Spanish to the first challenge (`tools/teardown/motion_dump.json`), so treat it as an upper bound and human time as untimed. Pre-lesson friction is long (10 screens) but each is a single tap.

### Feedback UI and mascot (in-lesson Duo behaviour was not observed)
What I saw in the guest lesson is the feedback UI: bottom panels, colours, counters. Duo himself did not appear in any in-lesson screenshot, so his idle, right, wrong and celebration animations are unobserved. Only the welcome-screen Duo with a typing speech bubble was seen.
- Welcome screens: Duo sits centred with a speech bubble that types in; CONTINUE stays disabled (grey) until the line finishes (`duo-welcome-01-hi.png` caught the bubble mid-load). In lesson, the picture cards carry the personality (purple cat, blue dog).
- Right: the bottom sheet turns green with a single word ("Awesome!", "Correct!", "Nice!") and a CONTINUE button (`duo-lesson-m-2-correct.png`). Selected card turns green-bordered.
- Wrong: the sheet turns pink/red, says "Correct solution:" and shows the right word, the chosen card goes blue-selected then stays; CONTINUE is red (`duo-lesson-m-3-wrong.png`). A heart is lost (5 to 4) and a modal "Each mistake costs 1 heart! Stay sharp and focused to keep your hearts. You got this!" interrupts once (`duo-lesson-m-6-hearts-modal.png`). The tone is calm, not scolding.
- Streak inside a lesson: after 2 right answers in a row a "2 IN A ROW" label appears above the progress bar (`duo-lesson-m-4-combo.png`).
- Celebration: not captured. Reported by Duolingo: a streak-extension animation plus a bigger one on milestone days raised new-learner 7-day retention by 1.7 percent [S2]. Caveat: the post does not say whether that is 1.7 percentage points or a relative 1.7 percent, and gives no baseline or sample, so use it as direction only.
- Desktop adds keyboard hints on cards (1, 2, 3), SKIP, and "TOO EASY" after a correct answer (`duo-lesson-d-1-question.png`, `duo-lesson-d-2-correct.png`).
- Tech (reported by Duolingo, not observed): characters are built in Rive with a state machine and 20+ viseme mouth shapes driven by phoneme timing from their own speech models [S1]. Measured (`motion_dump.json`): 0 `<canvas>` and 0 `<video>` elements on `/register`, `/welcome`, `/lesson` and the feedback state. That only tells us what Duo is not on those pages; I did not identify what renders him.

### Motion inventory (measured from computed styles on the live pages; raw dump in `tools/teardown/motion_dump.json`)
Note: it lists transitions and animations present in the DOM at capture time. Which element each belongs to was not mapped, so the "What" labels are my reading, not confirmed.
| What | Duration | Easing |
|---|---|---|
| Progress bar fill | width 0.4 s | ease |
| Button/card state change (background, color, opacity, clip-path) | 0.4 s | ease |
| Feedback bottom sheet slide-in | 0.5 s | ease |
| Pop with overshoot (fires on feedback) | 0.2 s | cubic-bezier(0.35, 1.8, 0.35, 0.83) |
| Modal / collapse (max-height) | 0.3 s | ease-in-out |
| OneTrust cookie-banner fade-in (not Duolingo UI) | 0.4 s | ease-in-out |
So, from this dump, the base unit is 0.4 s ease, with a single 0.2 s overshoot pop for emphasis; the longest duration the dump supports is 0.5 s (the feedback panel). An earlier ad-hoc run also saw a 0.7 s ease-in-out transform on the welcome screen, but the committed `motion_dump.json` does not sample it, so it is dropped here. The 3D press look on buttons is a chunky bottom border (see every CTA), not a shadow blur.

### Progression visualisation
- A linear segmented progress bar per lesson that fills green and fills with `width 0.4s` (`duo-lesson-m-5-pairs.png` shows it about 40 percent through).
- Hearts (5) as a visible cost of error.
- Across lessons (not reached as guest; unverified by me): the Path, a vertical trail of circular nodes grouped into Units, one level per node, with practice built in and a guidebook per unit [S3, supported by S3's overview list: "The home screen is now designed as a path that you'll follow step by step", "lessons are grouped into smaller units"]. S4 is a designer's case study of proposed interactions: "Adding a pulsating ring around the active node", "Segmenting the progress ring into lesson chunks", "Interactive Chests", "Jump Here", "Completing an Entire Node ... celebrating learners' progress". S4 says these were in internal dogfooding at the time of writing, so the pulsing ring, segmented ring and node celebrations are proposed or internal, not confirmed as shipped. Treat them as ideas, not as observed behaviour.

### Return-visit hooks
- Daily goal chosen in onboarding (5/10/15/20 min), shown with a concrete promise ("25 words in your first week").
- Streak: designed so extending it early feels big (2 to 3 days is +50 percent, 200 to 201 is +0.5 percent), then loss aversion takes over for veterans [S2]. Over 6 million people were on a 7+ day streak when they wrote it.
- Hearts, gems, chests, quests, leagues (reported) [S2, S4].

### What a no-login site cannot copy, and the nearest equivalent
| Duolingo | Needs | No-login equivalent |
|---|---|---|
| Streak that survives devices | Account | Streak in `localStorage`, shown honestly as "on this device", with an export/import code for moving |
| Friends, leagues, quests | Server and identity | A local "garden" that fills; optional shareable link of the garden state encoded in the URL |
| Push/email reminders | Contact channel | A "Come back tomorrow, your seeds will have grown" card plus PWA install and optional Notification permission; calendar (.ics) reminder download |
| Server-side adaptive path | Account data | Local mastery per sound in `localStorage` driving the next lesson |
| Subscription hearts gate | Billing | Do not copy. No hearts. Mistakes cost nothing but a gentle retry |

### Steal / avoid
Steal:
- One CTA landing; no account to start (`duo-landing-m.png`).
- Lesson reachable with no account (`duo-lesson-m-1-question.png`), single-tap onboarding, but cut it to at most 2 screens.
- Feedback sheet that carries the answer and a one-word reaction, green/pink, 0.5 s slide (`duo-lesson-m-2-correct.png`, `-3-wrong.png`).
- "N in a row" counter above the bar (`duo-lesson-m-4-combo.png`).
- Disabled CONTINUE until the mascot line finishes only if the line is short.
- 0.4 s ease base plus one 0.2 s overshoot pop.
- Concrete goal promise ("25 words in your first week") (`duo-welcome-05-dailygoal.png`).
Avoid:
- 10 questionnaire screens before play (`duo-welcome-*`); a child cannot do this.
- Hearts that punish errors (`duo-lesson-m-6-hearts-modal.png`); wrong for beginner readers.
- First lesson that is words and pictures with a translation, not sound practice; for reading we start at letter-sound.

## 2. Teach Your Monster to Read

### First 30 seconds
- Desktop landing (`tmtr-landing-d.png`): purple hero, a tablet mock showing a monster under a tree with letter apples, hand-drawn plants, a friendly cloud with eyes, one pink "Play now for free". Rich illustration, warm and calm. Cookie banner covers the lower right.
- Mobile landing (`tmtr-landing-m.png`, `tmtr-game-page-m.png`): headline and an illustrated tablet; the game page says "FREE to play on laptops and computers", so the page itself directs play to computers. The page also links to iOS and Android apps; I did not check their price or content.
- Play now leads to a wall: "You need to login or sign up before continuing" with Student (class code) / Teacher / Home tabs (`tmtr-play-wall-m.png`, `tmtr-play-wall-d.png`). The Student tab shows class-code entry; I did not go past the wall, so the rest of the signup flow (Home tab, email, confirmation) is unobserved. TYM's own page says account creation involves choosing an account type and confirming an email [S5], but I did not verify it. Either way there is no play before an account, the opposite of Duolingo's flow.

### Creature and characters (reported, not played; no in-game behaviour observed)
- The player builds their own monster, takes it to a magical world, meets characters, plays mini-games and wins prizes [S5, S6]. The player's own creation is the mascot, which gives ownership no fixed mascot has.
- Inference from the landing image only (`tmtr-landing-d.png`), not from play: the tablet mock appears to show a monster in a scene, a large one-eyed king-like tree that looks like a quest giver, and letters on apples. If that reading is right, the game objects are the characters; I did not verify it.
- Right/wrong reactions and celebration animation timing: not captured (walled). Marked unknown.

### Motion inventory
Not measurable (no canvas access). Only the site's own animation on landing: the cloud and plants are static illustrations in the hero.

### Progression visualisation
- Three stages: First Steps, Fun with Words, Champion Reader, covering 31 letter-sound combos, then 18 more plus 30 tricky words and sentences, then alternative spellings and little books [S5]. It is a journey through places with prizes, so progress is geography plus a creature, not a bar.
- Practice Mode lets a grown-up choose specific sounds [S7].

### Return-visit hooks (reported)
- The owned monster and its collected prizes; progress saved to the player profile; teacher/parent view of progress. No streak mechanic found in their pages.

### What a no-login site cannot copy, and the nearest equivalent
- Saved player profiles and class codes: replace with localStorage "garden" and a printable/shareable progress card.
- Teacher dashboard: replace with a print/share "what I learned this week" page generated locally.

### Steal / avoid
Steal:
- The child makes the creature (ownership); for us, a first-session choice of Sprig's colour, Sprig then living in and growing the garden.
- Letters as objects in the world (apples on a tree) rather than flat flashcards (`tmtr-landing-d.png`).
- Three named stages with plain-language "what this covers" (`tmtr-game-page-m.png`).
- Warm, hand-drawn palette with calm backgrounds.
Avoid:
- Login wall in front of the first game (`tmtr-play-wall-m.png`). We start playing with zero fields.
- Desktop-only claim on mobile web.
- Cookie banner dominating the first mobile screen (`tmtr-landing-m.png`); we ship with no cookies at all.

## 3. Secondary (thin evidence)
- Khan Kids: five-animal cast with Kodi Bear as narrator who welcomes and guides; free, no ads [S8, S9]. Steal: one narrator voice that guides.
- Read Along (Google): the assistant Diya listens as the child reads aloud and gives corrective and encouraging feedback; web version exists [S10]. Steal: listening feedback; but needs a microphone and speech model, outside a v1.
- Reading Eggs: not captured.

## 4. Decisions for the build
All numeric metric targets below (80, 70, 85, 90 percent and the like) are the author's own targets with no baseline; replace them with measured values after the first week of data.
Metaphor ruling: the learner owns one creature, Sprig, who lives in a garden and grows it. Every progression and return decision uses that.
1. Zero fields before the first sound plays: one CTA, one tap into a lesson. Metric: time to first sound under 10 s on a mid phone (median, measured in-app); over 90 percent of sessions hear a sound.
2. Sprig is the creature the child owns, chosen with one tap in session one (colour only), and Sprig lives in and grows the garden. Metric: share of first sessions that pick a Sprig colour (target over 80 percent); Sprig interactions in the day-2 session.
3. Feedback panel on every answer: bottom panel, 0.5 s ease slide, one word, the right answer shown on a miss, calm tone. No lives. Metric: retry-after-miss rate (target over 70 percent) and quit-after-miss rate under 10 percent.
4. Motion tokens: 0.4 s ease base, one 0.2 s overshoot `cubic-bezier(0.35,1.8,0.35,0.83)` for pops, nothing over 0.5 s for routine actions, `prefers-reduced-motion` honoured. Metric: tokens used for 100 percent of transitions (lint check); zero animations over 0.5 s except celebrations.
5. "N in a row" counter above a progress bar that fills on a 0.4 s width transition. Metric: lesson completion rate (target over 85 percent of started lessons).
6. Streak and daily goal in `localStorage`, labelled "on this device", with an export/import code. Metric: day-2 return rate on the same device (baseline in week one, then track); share of day-7 returners who used the export code.
7. Progression is Sprig growing the garden: each learned sound becomes a plant Sprig tends, and finishing a lesson visibly grows something. Metric: plants grown per session, and day-2 return rate for learners who saw a new plant versus those who did not.
8. Start at letter-sound, not word translation: first three tasks are one sound each with picture cards. Metric: correct-on-first-try rate on the first 3 tasks (target 80 percent or more; below 60 percent means too hard).
9. Return hook without accounts: PWA install, optional notification, .ics reminder, and a "Sprig's garden has grown" state computed from elapsed time. Metric: share of day-1 learners who install, allow notification or download the reminder; day-7 return rate.
10. No cookies, tracking banner, login or ads; one line says so. Metric: zero third-party requests and zero cookies on first load (automated check in the verify gate).

## Sources
- S1 How Duolingo Animates Its World Characters (Rive, visemes): https://blog.duolingo.com/world-character-visemes/
- S2 How the Duolingo streak builds habit (+1.7 percent 7-day retention): https://blog.duolingo.com/how-duolingo-streak-builds-habit/
- S3 The science behind the Duolingo home screen redesign (Path): https://blog.duolingo.com/new-duolingo-home-screen-design/
- S4 Delight on Path, design case study by a Duolingo designer: https://devansh.design/delight-on-path
- S5 Teach Your Monster to Read game page: https://www.teachyourmonster.org/teach-your-monster-to-read/
- S6 Usborne Foundation, Teach Your Monster to Read: https://www.usbornefoundation.org.uk/teachyourmonstertoread/
- S7 Practice Mode: https://www.teachyourmonster.org/teachers/helpful-articles-for-teachers/practice-mode/
- S8 Khan Academy Kids characters: https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids
- S9 Khan Academy Kids: https://www.khanacademy.org/kids
- S10 Read Along on the web: https://blog.google/products-and-platforms/products/education/read-along-web/
- Reproducibility: `research/tools/teardown/` (scripts, `motion_dump.json`)
- Live captures: duolingo.com/register, /welcome, /lesson; teachyourmonster.org (2026-10-09)
