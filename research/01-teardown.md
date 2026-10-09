# 01 Teardown: Duolingo and Teach Your Monster to Read

Captured 2026-10-09 with headless Chromium (Playwright). Screenshots are in `shots/teardown/` (22 PNGs). "Measured" means read from the live page; "reported" means from a cited write-up. Duolingo was run as a guest on Spanish, mobile 390x844 end to end, plus desktop 1280x800 for landing and the first lesson questions.

Evidence limits, stated up front:
- Duolingo guest flow reached a real lesson with no account and no wall inside about 16 steps. I did not reach the end-of-lesson screen, so the streak and signup prompt are known only from their blog.
- Teach Your Monster (TYM) has a hard login wall in front of the game. `/account/play/tm123/go` redirects to `/account/users/sign_in` on both viewports. Everything about its in-game behaviour is from the Usborne Foundation, TYM's own pages and press, not from my play.
- Reading Eggs would not load for the search tool and I did not capture it. Khan Kids and Read Along are covered from public descriptions only.

## 1. Duolingo

### First 30 seconds
- Landing (`shots/teardown/duo-landing-m.png`, `duo-landing-d.png`): one cluster of the cast, one line ("The most fun way to learn languages, chess, and more!"), one big green GET STARTED, a quiet "I already have an account". Nothing to read, no nav competing. Desktop adds a language strip.
- GET STARTED goes to `/register` "I want to learn..." (`duo-pick-m.png`) with learner counts per language as social proof. No email field. Picking Spanish moves to `/welcome`.
- Pre-lesson questionnaire, all measured, 9 screens before the first question (`duo-welcome-01-hi.png` to `07-motivation.png`): Duo says hi, "How did you hear", "Why are you learning" (reply bubble "Yay! Fun is my specialty!"), level, "Here's what you can achieve", daily goal ("That's 25 words in your first week!"), choose path, two motivation screens ("It can be hard to stay motivated... so Duolingo is designed to be fun like a game!"). Each answer gets a reactive line from Duo before CONTINUE enables.
- Then `/lesson` immediately. The first challenge is "Which one of these is 'cat'?" with three picture cards (`duo-lesson-m-1-question.png`). The learner is playing within about 40 seconds of landing, with no account. Pre-lesson friction is long (9 screens) but each one is a single tap.

### Mascot behaviour
- Idle: Duo sits centred with a speech bubble that types in; CONTINUE stays disabled (grey) until the line finishes (`duo-welcome-01-hi.png` caught the bubble mid-load). In lesson, Duo is absent on the guest web challenges; the picture cards carry the personality (purple cat, blue dog).
- Right: the bottom sheet turns green with a single word ("Awesome!", "Correct!", "Nice!") and a CONTINUE button (`duo-lesson-m-2-correct.png`). Selected card turns green-bordered.
- Wrong: the sheet turns pink/red, says "Correct solution:" and shows the right word, the chosen card goes blue-selected then stays; CONTINUE is red (`duo-lesson-m-3-wrong.png`). A heart is lost (5 to 4) and a modal "Each mistake costs 1 heart! Stay sharp and focused to keep your hearts. You got this!" interrupts once (`duo-lesson-m-6-hearts-modal.png`). The tone is calm, not scolding.
- Streak inside a lesson: after 2 right answers in a row a "2 IN A ROW" label appears above the progress bar (`duo-lesson-m-4-combo.png`).
- Celebration: not captured. Reported: a streak-extension animation plus a bigger one on milestone days raised new-learner 7-day retention by 1.7 percent [S2].
- Desktop adds keyboard hints on cards (1, 2, 3), SKIP, and "TOO EASY" after a correct answer (`duo-lesson-d-1-question.png`, `duo-lesson-d-2-correct.png`).
- Tech (reported): characters are built in Rive with a state machine and 20+ viseme mouth shapes driven by phoneme timing from their own speech models [S1]. Measured on the web guest flow: zero `<canvas>` elements on `/register`, `/welcome` and `/lesson`, so the web guest flow shows Duo as image or video assets, not a live Rive canvas.

### Motion inventory (measured from computed styles on the live pages)
| What | Duration | Easing |
|---|---|---|
| Progress bar fill | width 0.4 s | ease |
| Button/card state change (background, color, opacity, clip-path) | 0.4 s | ease |
| Feedback bottom sheet slide-in | 0.5 s | ease |
| Pop with overshoot (fires on feedback) | 0.2 s | cubic-bezier(0.35, 1.8, 0.35, 0.83) |
| Welcome screen transform | 0.7 s | ease-in-out |
| Modal / collapse (max-height) | 0.3 s | ease-in-out |
| Fade of new element | 0.4 s | ease-in-out |
So the base unit is 0.4 s ease, a single 0.2 s overshoot spring for emphasis, and nothing over 0.7 s on a common action. The 3D press look on buttons is a chunky bottom border (see every CTA), not a shadow blur.

### Progression visualisation
- A linear segmented progress bar per lesson that fills green and fills with `width 0.4s` (`duo-lesson-m-5-pairs.png` shows it about 40 percent through).
- Hearts (5) as a visible cost of error.
- Across lessons (not reached as guest): the Path, a vertical winding trail of circular nodes grouped into Units and Sections, one level per node, chests and "Jump here" [S3, S4]. Active node has a pulsing ring; multi-session nodes show a segmented progress ring; finishing a node and a unit each get their own celebration [S4].

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
- Lesson in under 40 s (`duo-lesson-m-1-question.png`), single-tap onboarding, but cut it to 2 screens.
- Feedback sheet that carries the answer and a one-word reaction, green/pink, 0.5 s slide (`duo-lesson-m-2-correct.png`, `-3-wrong.png`).
- "N in a row" counter above the bar (`duo-lesson-m-4-combo.png`).
- Disabled CONTINUE until the mascot line finishes only if the line is short.
- 0.4 s ease base plus one 0.2 s overshoot pop.
- Concrete goal promise ("25 words in your first week") (`duo-welcome-05-dailygoal.png`).
Avoid:
- 9 questionnaire screens before play (`duo-welcome-*`); a child cannot do this.
- Hearts that punish errors (`duo-lesson-m-6-hearts-modal.png`); wrong for beginner readers.
- First lesson that is words and pictures with a translation, not sound practice; for reading we start at letter-sound.

## 2. Teach Your Monster to Read

### First 30 seconds
- Desktop landing (`tmtr-landing-d.png`): purple hero, a tablet mock showing a monster under a tree with letter apples, hand-drawn plants, a friendly cloud with eyes, one pink "Play now for free". Rich illustration, warm and calm. Cookie banner covers the lower right.
- Mobile landing (`tmtr-landing-m.png`, `tmtr-game-page-m.png`): headline and an illustrated tablet; the game page says "FREE to play on laptops and computers", so the mobile web is not where the game is played (apps cost money on iOS/Android).
- Play now leads to a wall: "You need to login or sign up before continuing" with Student (class code) / Teacher / Home tabs (`tmtr-play-wall-m.png`, `tmtr-play-wall-d.png`). A child cannot start without a parent email confirm. This is the opposite of Duolingo's flow and the clearest thing to beat.

### Mascot behaviour (reported, not played)
- The player builds their own monster, takes it to a magical world, meets characters, plays mini-games and wins prizes [S5, S6]. The player's own creation is the mascot, which gives ownership no fixed mascot has.
- The screenshot on the landing page shows the monster as a character in the scene, a large one-eyed king tree as the quest giver, and letters as apples on a tree: the game objects are the characters.
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
- The child makes the creature (ownership); for us, a first-session choice of a seed or sprout colour that then grows.
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
1. Zero fields before the first sound plays: landing has one CTA, one tap puts the learner in a lesson inside 10 seconds. Duolingo takes about 40 s with 9 screens; TYM never gets there without an email.
2. One named creature the child grows (our garden), chosen by a single tap in session one. This copies TYM's ownership and gives the progression picture.
3. Feedback panel on every answer: bottom sheet, 0.5 s ease slide, one word, the right answer shown on a miss, calm tone. No lives, no hearts, no failing.
4. Motion tokens: 0.4 s ease as base, one 0.2 s overshoot `cubic-bezier(0.35,1.8,0.35,0.83)` for pops, nothing over 0.7 s for routine actions, `prefers-reduced-motion` honoured.
5. "N in a row" counter above the progress bar and a progress bar that fills on a 0.4 s width transition.
6. Streak and daily goal live in `localStorage`, labelled "on this device", with an export/import code; do not promise cross-device.
7. Progress as geography plus growth: sounds become plants in the garden; a lesson completion visibly grows something, so a return visit has something new to see.
8. Start at letter-sound, not word translation; keep the first three tasks to one sound each with picture cards, as in Duolingo's single-tap picture choice.
9. Return hook without accounts: PWA install, an optional notification, and an .ics reminder; a "come back, your garden has grown" state computed from elapsed time.
10. No cookies, no tracking banner, no login, no ads on the first screen; say so in one line.

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
- Live captures: duolingo.com/register, /welcome, /lesson; teachyourmonster.org (2026-10-09)
