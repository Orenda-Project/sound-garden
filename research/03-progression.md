# 03 - Progression: a garden that grows from mastery, with no account and no server

Round 1 research for Sound Garden. Scope: meta-progression and return hooks that work with only the device in the learner's hand. Method: skill `game-retention-design` (its `references/` for psychology and ethics), about 45 searches and fetches done 2026-10-09, and a read of lesson files `L1.01.json` and `L3.05.json` in `sound-out/content/lessons/` for shape. The course has 108 lessons (L1 14, L2 14, L3 18, L4 16, L5 16, L6 16, L7 14) and roughly 56 hours of content by the lessons' own time estimates (L1 3.8h, L2 5.8h, L3 8.5h, L4 7.6h, L5 10.1h, L6 10.1h, L7 9.8h). Lesson JSON has `appSittings`, so a lesson is already split into 3 to 5 short sittings; that matters for the first-reward timing below.

Evidence grades: **A** = peer-reviewed study, meta-analysis, or RCT, read at abstract level or better. **B** = company-published data, primary technical documentation, or a single reputable source. **C** = practitioner opinion, blog, forum, or my own prior knowledge that I did not re-fetch this session (flagged). Where I found nothing, I say so.

## Part 1 - Findings

### 1.1 Streaks, daily goals, loss aversion, variable rewards in learning apps

| # | Finding | Source | Grade |
|---|---|---|---|
| 1 | Duolingo: learners with a 7-day streak are 2.4x more likely to return the next day than learners with no streak. This is correlational (people who already return build streaks), so it is not evidence that a streak causes return. A later Duolingo post gives 3.6x for the same group, so the number moves between their own posts. | https://blog.duolingo.com/improving-the-streak/ ; https://blog.duolingo.com/how-duolingo-streak-builds-habit/ | B |
| 2 | Duolingo's own A/B test **separated the streak from the daily goal**, so one lesson keeps the streak alive. Result (relative changes): +3.3% Day-14 retention, +1% overall DAU, +10.5% more daily learners on a streak after 20 days, +19% on a streak among new learners. Cost: fewer learners hit their full daily goal. Their conclusion: lowering the barrier to a daily habit mattered more early on than how much was learned per day. Before the change, 40% of two-days-in-a-row users with no streak had the highest ("intense") goal, so a big goal was blocking the habit. | https://blog.duolingo.com/improving-the-streak/ | B |
| 3 | Streak **freeze** (grace) raised activity: letting learners equip two freezes instead of one gave +0.38% relative DAU. Duolingo cites a UPenn/UCLA result that "a little slack" beats rigid rules. A grace mechanism is a retention feature, not a leak. | https://blog.duolingo.com/how-duolingo-streak-builds-habit/ | B |
| 4 | Streak anxiety and number-chasing are reported by long-streak users (409-day streak: "not sure the streak itself produced learning benefit"). Hard resets with no forgiveness are a named driver of quit-in-anger. | `game-retention-design/references/live-ops-ethics.md` (cites Quora; psychology.md cites loss-aversion literature) | C |
| 5 | Gamification overall in learning: Sailer and Homner (2020) meta-analysis: small-to-moderate positive effects, g = .49 cognitive (k=19, N=1,686), .36 motivational (k=16, N=2,246), .25 behavioural (k=9, N=951). The cognitive effect was stable in the high-rigour subset; the motivational and behavioural effects were **less stable**. Game fiction (story/world) and collaboration-plus-competition were the moderators that helped; fiction is what a garden is. | https://link.springer.com/article/10.1007/s10648-019-09498-w | A |
| 6 | Li, Hew and Du (2024), intrinsic-motivation meta-analysis (35 interventions, 2,500 participants): overall g = .257 (small). Autonomy g = .638 and relatedness g = 1.776 rose, but **competence only g = .277** and the review names "lack of perceived competence" as a main failure. Lesson: a garden helps most if it makes the learner feel more competent, not if it only decorates. | https://link.springer.com/article/10.1007/s11423-023-10337-7 | A |
| 7 | 2025 meta-analysis of 182 effect sizes from 37 randomised or quasi-randomised trials: d = 0.566 overall; best element combination "Rules/Goals + Challenge + Mystery"; effect depends on learning domain and on intervention duration. Abstract only. Duration as a moderator is the honest warning that novelty fades. | https://link.springer.com/article/10.1007/s11423-025-10493-y | A |
| 8 | Variable (random) rewards: I found **no learning-specific evidence** that variable-ratio rewards improve learning. The peer-reviewed evidence on them is from gambling-adjacent games (Candy Crush near-miss raises arousal and urge to continue, Larche et al. 2016, via the retention skill's ethics reference). The effect is real and it is the wrong thing to aim at a learner. | `live-ops-ethics.md` item 13 | A (for the gambling effect) / gap (for learning) |
| 9 | There is no controlled comparison I could find of "punitive decay" (a tree dies) versus "non-punitive decay" (nothing bad happens) on retention or learning. Everything below on that choice is design reasoning from shipped products, not trial evidence. | search, none found | gap |

**Failure cases.** Gamified phonics software is not automatically effective: the Education Endowment Foundation's trial of GraphoGame Rime found "no evidence that GraphoGame Rime improves pupils' reading or spelling test scores" compared with business-as-usual, rated very high security (https://educationendowmentfoundation.org.uk/projects-and-evaluation/projects/graphogame-rime, A). So a game around a course does not make the course work. The garden must ride on a course that already teaches.

### 1.2 "Tend a living thing" mechanics

Compiled from the pages named. Numbers marked "(recall)" are from my own knowledge and were not re-verified; treat them as C.

| Game | What grows | What decays | What is revealed | First visible change | Lapsed users |
|---|---|---|---|---|---|
| **Forest** (Seekrtech, 2014) | A tree per focus session; trees collect into a forest | The tree **withers if you leave the app** mid-session. Wikipedia calls loss aversion "its core mechanism". Failure costs only that one tree. | Species and the growing forest | Within the first session (you choose a duration) | No punishment for time away; the loss is only for breaking one session (https://en.wikipedia.org/wiki/Forest_(application), B) |
| **Finch** | A bird that grows as you do self-care goals | Nothing: "no death, no neglect penalty"; go away a month and the bird is fine | Outfits, rooms, a child bird after adventures | First check-in | Designed not to punish; around 750,000 ratings near 4.9 stars per a comparison page (https://livelifehappy.com/articles/virtual-pet-games-compared/, C: a blog with its own product to sell) |
| **Neko Atsume** | A yard that cats visit | Nothing | Which cat shows up, which you cannot force | Cats arrive after you put food out, minutes to hours | "If you put food out the cats come, and if you do not, nothing bad happens" (same page, C) |
| **Tamagotchi** | A pet through life stages | **It can sicken and die** if neglected (https://en.wikipedia.org/wiki/Tamagotchi, B) | Evolutions | Minutes (hatch, first meal) | Punishes lapse; one study (via same blog, C) says children treated death as loss, not failure |
| **Habitica** | A character levelled by finishing real tasks | **HP loss and death** when Dailies are missed (https://habitica.fandom.com/wiki/Death_Mechanics, B) | Gear, pets, quests | First task completed | Users complain: "being punished for struggling really discourages me and makes me want to give up" (r/habitrpg, C) |
| **Stardew Valley** | Crops by calendar day | Crops can die at season end, no real-time penalty (game days pass only while you play) | Crop sale value, new town events | Parsnip matures in **4 days** (https://stardewvalleywiki.com/Parsnip, B) | Nothing changes while you are away because the clock stops |
| **Animal Crossing** | Town on a real-time clock | Weeds and moved-out neighbours if neglected (recall) | Seasonal events | Same day | Mild (recall); I did not verify in this session (C) |
| **Plant Nanny** | A plant that wants water | Plant "dies" if ignored (recall) | Cosmetics | not researched | not researched; I did not research it (gap) |

Pattern: the products that last for self-improvement (Finch, Neko Atsume, Forest after a failed session) make absence cost nothing, and put the reward in **showing what you built**, not in avoiding a loss. The punishing ones (Tamagotchi, Habitica, FarmVille crop rot) either target a different audience or are the ones users describe with guilt. The retention skill's own table calls crop rot "the purest come-back-or-be-punished mechanic" (red).

### 1.3 Unlock and collection pacing used by shipped games

Concrete third-party curves are thin and mostly proprietary. What I could ground:

- **Retention skill, industry rule of thumb [I]:** first unlock during or right after the first run, then every 1 to 2 runs, widening to every 3 to 5, then 10 or more. Unlocks should widen options, not raw power.
- **Duolingo:** the social threshold is a 7-day streak (data point above). Early gaps are small, late gaps large.
- **Stardew:** first crop pays back in 4 in-game days (verified), which is the template for "a small, certain, early payoff".
- **Mobile D1/D7/D30 medians** (GameAnalytics, via the retention skill): about 22%, 4%, 0.7%. A hobby learning course will not match these; what matters is that the first return has a visible reason.
- **Gap I could not close:** I found no published unlock-per-hour curves for Finch or Neko Atsume. The numbers in Part 3 are my design, not copied.

### 1.4 Adult learners and "not childish"

- Kostas, Koutromanos and Lagopati (2025), systematic review of 36 studies of gamified adult learning (higher education, corporate training, informal learning): significant learning outcomes for adults, and the motivation and self-efficacy gains appear when game elements are designed around adult learner characteristics and learning theory (https://www.jite.org/documents/Vol24/JITE-Rv24Art022Kostas11517.pdf, B: abstract-level read; mostly business and pedagogy subjects, not adult literacy).
- I found an arXiv paper titled "One Size Doesn't Fit All: Age-Aware Gamification Mechanics" (https://arxiv.org/pdf/2512.15630v1) that I could not read in this session. C until read.
- **I found no study of adult basic-literacy learners and visual tone (cute versus mature)**. Design guidance below follows from the self-determination results (autonomy and competence matter) and from the meta-analysis fact that game fiction helps. A botanical, calm garden satisfies both a 6-year-old and a 40-year-old better than a mascot. This is a hypothesis to test with real adults in the round-2 playtest.
- Adult-specific risk: embarrassment. A 40-year-old learning to read does not want a screen that says "kids". The garden should have no age label and no childish voice, and the home screen should not display lesson titles that could out them to a bystander.

### 1.5 Device-only persistence (no account)

| Fact | Source | Grade |
|---|---|---|
| `localStorage` is about **5 MiB per origin** (Web Storage capped at 10 MiB total across `localStorage` plus `sessionStorage`); over the limit it throws `QuotaExceededError`, so wrap every write in try/catch. | https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria | A (docs) |
| IndexedDB, Cache API: far larger. Chromium (Chrome, Edge) up to 60% of disk per origin; Safari/WebKit (macOS 14, iOS 17 and later) around 60% of disk for browser apps and home-screen web apps; Firefox the smaller of 10% of disk or 10 GiB in best-effort mode. | same | A |
| Data is stored "best-effort" by default; `navigator.storage.persist()` asks for persistent mode (Firefox shows a prompt; Safari and Chromium decide silently from site engagement). The Chrome team says data is very rarely deleted for sites a user visits regularly. | same | A |
| **Safari trap:** WebKit deletes all of a site's script-writable storage (including `localStorage` **and** IndexedDB; WebKit clears them together, so a second store is not a backup) after **seven days of Safari use without user interaction on the site**. The counter is days of Safari use, not calendar days. **Web apps added to the Home Screen are exempt and get their own counter.** | https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ and https://webkit.org/tracking-prevention/ | A (primary) |
| QR codes: byte-mode capacity ranges up to 2,953 bytes (version 40, level L). Our payload fits easily at a low version. | QR spec figure from my own knowledge, not re-fetched | C |

**Consequence:** a learner on iPhone Safari who studies on Monday, skips a week of Safari use, and opens the site again may find the garden gone. With no account, that is the single most damaging failure for trust. The design in Part 3 therefore pairs `persist()` with an always-visible export code and an "Add to Home Screen" nudge on iOS.

### 1.6 Reading-science constraints

- **Spacing.** Cepeda et al. (2006) meta-analysis: 839 assessments in 317 experiments, and the interval that gives the best retention **grows with the retention interval** (https://www.yorku.ca/ncepeda/publications/CPVWR2006.html, A). Cepeda et al. (2009): an optimal gap improved final recall by up to 150%, and the effect is non-monotonic: too long a gap hurts; the authors also stress the importance of cumulative reviews (https://files.eric.ed.gov/fulltext/ED505659.pdf, A). Caveat: these are vocabulary and fact studies, not decoding. Transfer to phonics is plausible, not proven here.
- **Retrieval beats re-reading** (Roediger and Karpicke, 2006). I know this result but did not re-fetch it this session; the claim here is only that the garden should be driven by retrieval events (C until verified).
- **Gaming the system.** Baker et al.: in tutoring software, students who systematically guess or spam hints "learn significantly less", replicated across classrooms; they split into a group that still learns and a group that learns very little (https://www.cs.cmu.edu/~rsbaker/gaming.html, A/B). Any reward a student can earn by guessing teaches them to guess.
- **Guess maths for our gates** (computed this session, binomial, pass = 80% or more): a 10-item check with 3 options is passed by pure guessing 0.34% of the time (2-option, 5.5%); 12 items at 80%+: 0.05% (3-option), 1.9% (2-option); 16 items: 0.01% and 1.1%. **Rule: no mastery check with fewer than 12 items, and no 2-option items in any check that gates a reward.**

### 1.7 What the evidence adds up to (five rules the design obeys)

1. **Reward the learning event, not the visit.** Goal-gradient and streak data show the hook works, but the learning evidence (meta-analyses, EEF null result, Baker) says the reward must be coupled to real mastery or it decays into decoration.
2. **Make the minimum habit tiny and separate from the goal** (Duolingo's +3.3% D14 test).
3. **Absence costs nothing owned.** Keep Finch/Neko Atsume's contract: nothing the learner earned is ever taken away.
4. **Spacing is the engine of growth, not a timer.** A plant blooms because the learner retrieved its sounds after a gap, so the thing that makes the garden grow is the thing that makes memory last.
5. **State lives in the device, and the learner holds the backup.** Treat the Safari 7-day wipe as a design input.

---

## Part 2 - PROPOSED Sound Garden progression system

Status: proposal for Kamal. Numbers marked (tune) should be set in a playtest, not argued.

### 2.1 What the learner owns

One garden, one plot, no currency, no shop. Plain words only (the retention skill says keep invented nouns to 2 or fewer): **garden** and **plant**. Everything else is a normal word.

| Object | Count | What it is | What it does for reading |
|---|---|---|---|
| **Plants and shed tools** | 98 (85 plants in Levels 1 to 6, 13 tools in Level 7) | One per teaching lesson. Tap one: it says its sound or pattern and a word. | The garden is a working **sound chart**: it is the reference sheet for what has been learned. |
| **Path stones** | 3 | One per review lesson (L1.13, L2.13, L3.17). Join the zone's plants. | Marks "I reviewed everything in this level". |
| **Landmarks** | 7 | One per level check or capstone: gate, pond, bridge, lantern, windmill, banyan courtyard, observatory. | Visible chapter ends. |
| **Visitors** | 19 | Bees, birds, a hedgehog, and so on. Arrive from **blooms** (reviewed plants), not from lessons. | Reward for returning and retrieving after a gap. Cosmetic only. |
| **Weather and time of day** | free | Follows the device clock: dawn, dusk, rain in the monsoon months. | A living feel at zero progress cost; never gates anything. |

Seven **zones** (one per level) lay out left to right, so the learner can see the whole course as terrain and the gap still to fill (goal-gradient, honest).

### 2.2 The stages of one plant (this is the whole growth model)

Every plant has four stages, and **each stage is earned only by a mastery event**:

| Stage | Trigger | What the learner sees |
|---|---|---|
| **Seed** | Starts the lesson (sitting 1) | A seed in the soil |
| **Sprout** | **Only** when the **lesson check is passed at 80% or more (12+ items)**. Sittings give a *growth step* (the seed is watered, 3 to 5 small animations matching `appSittings`), which is feedback, not a stage and not progress | A small plant, sound now tappable |
| **Bloom** | First **successful spaced review** at least **20 hours** after the sprout (the one bloom rule, used everywhere in this file) | Flowers or fruit open; a visitor can arrive |
| **Full** | Successful review again at **7 days or more** | Leaves deepen, a seed pod forms; counts as "mastered" in the field guide |

There is no fifth stage and nothing that regresses on the learner's side. If a plant is overdue (see 2.6) it is shown **dozing** (leaves folded, colour softened). One successful retrieval wakes it immediately. A dozing plant keeps its sound, is still tappable, and is never removed. This is the only "decay" and it is reversible by doing the thing the learner came to do.

Review intervals for scheduling (design choice, informed by "optimal gap grows with retention interval", Cepeda 2006): **20 hours, 3, 7, 14, 30 days**, expanding after a correct retrieval, dropping back one step after a miss (tune).

### 2.3 First visible reward

| When | What happens | Why it is honest |
|---|---|---|
| **0 to 10 seconds** | Garden opens with an empty plot and one planted seed already sitting there ("your garden starts with one seed") | Endowed progress that is true: the seed is real, it is the first plant |
| **Within about 90 seconds** (first correct blend or sound in L1.01) | The seed is **watered**: it swells and wiggles with a small sound (a growth step, not a Sprout) | The change is caused by the learner's first correct answer and claims no mastery |
| **End of L1.01 (about 15 to 20 minutes)** | Lesson check (12+ oral items) passed: first plant **sprouts** and is tappable | The garden now holds one real piece of reading knowledge |
| **20 hours or more later (2-3 minute review, usually the next day)** | The plant **blooms** and the first visitor can land | The return hook is a thing the learner can see change because they came back |

Target: first visible change (the watered seed) at **90 seconds** or sooner; measure it in the first silent playtest, with a ceiling of 3 minutes. The retention skill lists time-to-first-fun as one of the three numbers to instrument.

**The end-of-lesson-1 card (first offer, right after the L1.01 check passes; re-offers listed after the card).** The sprouted plant shows its bloom time on the plant itself: **"Ready tomorrow, about 3 minutes."** Below it: **"Your plant blooms tomorrow after 9:00. Remind me?"** with two buttons:
- **Remind me** downloads **one** `.ics` event at the computed ready time, on day 1 only (not a daily repeat; see 2.5). A daily repeat is offered only after the first bloom.
- **Add to Home Screen**: on Android (Chrome) the browser's install prompt is triggered from this button (the `beforeinstallprompt` event; a browser-API fact I did not re-verify here, C); on iOS the same button shows the manual Share, Add to Home Screen steps from 2.8.

**Re-offers (the reminder is not a one-shot).** "Remind me" appears again (a) on the Home "plant is ready" state, (b) on the card after lesson 2's check, and (c) after the first bloom, where it becomes the daily repeat. It stops appearing once the learner has accepted it or dismissed it twice.

**Quit mid-L1.01.** A learner who leaves before the check passes sees on Home: **"Your seed is waiting."** with the same "Remind me" option; the reminder in that case is a one-time `.ics` event for the time the learner picks (default: 24 hours from now), since there is no sprout and so no computed bloom time yet.

**Time rule (keeps the 20-hour bloom rule intact).** Ready time = the earliest moment that is at least 20 hours after the sprout and not before 9:00 local. The card shows the exact time it computed. If the learner finishes at 20:00 the ready time is 16:00 the next day; the card then reads "Your plant blooms tomorrow after 16:00", and the default 9:00 wording is used only when the 20 hours has already passed by 9:00. The `.ics` event is created at that computed time.


**Review pool and how a round fills to 12 items.**
- **Day-1 pool:** all 12 or more items from the L1.01 lesson check (and any items shown in its sittings) are eligible. One plant therefore supplies a full round, so the **first bloom gate can be met with a single plant**.
- **General rule:** a review round always has 12 items (16 on a lapse of 7 days or more). Fill in this order until the round is full: (1) items from plants that are due, oldest-due first; (2) items from the same lesson's plant that were missed in its check; (3) other items from due plants' lessons; (4) if still short, items from the most recently sprouted plants even if not yet due, tagged as practice. **Only items from due plants can advance a stage;** practice items never do. **Padding rule:** if the round is still under 12 items after the order above, pad with the learner's own first-attempt misses from earlier in the round; if still under 12, repeat items. **Repeats and padding never count toward stage advance.**
- **Scoring (resolves practice versus the 80% gate):** the 80% bloom/Full gate is scored on **due-plant items only**, first attempt, with practice items and padding excluded from both numerator and denominator. A gating round needs at least 12 due-plant items; every plant's pool is its lesson-check items (12 or more), so a single due plant always supplies a full gating round. A round that cannot reach 12 due-plant items runs as practice and advances nothing.

### 2.4 Daily and weekly loop

**Daily goal = one step.** Opening the garden and finishing **either one lesson sitting or one 2 to 5 minute review** counts as "tended today". It is decoupled from any bigger goal, following the Duolingo test above. A learner who wants 40 minutes can do 40 minutes; nothing requires it.

**What the learner sees, in order of priority:**
1. "Ready to tend" plants (due for review) glow softly. Reviewing them is the default first action.
2. The next lesson, with a visible size ("4 short sittings, about 20 minutes").
3. The garden, which they can just look at.

**Counter that cannot be lost:** "You have tended your garden on **N days**" is a **cumulative** total of distinct days, shown small. It never resets. There is no streak number in the main UI. A soft weekly row of 7 dots fills as days are tended; empty dots carry no colour change and no text.

**Weekly:** on any day the learner has tended 4 or more of the past 7 days, a small cosmetic event (butterflies, a rainbow) may appear (tune). It carries no learning or unlock value, so missing it costs nothing.

**Surprise, not gambling:** which visitor arrives and when is varied within a fixed set, so a return feels alive. What a learner unlocks is **never** random; visitors are cosmetic and never gate content (reasoning: finding 8, no learning evidence for random rewards, and the ethics table marks chance-based rewards red).

**No push notifications in v1** (a static site cannot send them without a server; evaluated in 2.5). Return cues are the "plant is ready" state, an opt-in `.ics` calendar event and the home-screen icon.

### 2.5 Return triggers and how we measure return (no accounts)

Three triggers ship in v1; one is rejected for now.

| Trigger | Design | Cost | Verdict |
|---|---|---|---|
| **"A plant is ready" state on Home** | When any plant is 20 hours or more past its last stage, Home shows it glowing with the line "Sunflower is ready to bloom - about 3 minutes" (the L1.02 plant from the 2.11 table). This is the primary return hook because it is the only one that works for a learner who is already on the site. | Pure local logic | **Ship** |
| **Opt-in .ics calendar event** | Day 1: one `.ics` event at the computed ready time (from the lesson-1 card). After the first bloom: "Remind me" offers a **daily recurring** `.ics` ("Tend your garden", time chosen by the learner, with a link to the site). Re-offered on Home "plant is ready", after lesson 2, and when the learner quits mid-L1.01 ("Your seed is waiting"). It lives in the learner's own calendar app, so it also works when the browser's storage is wiped. | None, no server, no permission prompt | **Ship** |
| **Add to Home Screen** | Already prompted for storage reasons (2.8); the icon on the phone is itself a daily cue and gives the learner a stable origin counter on iOS. | None | **Ship** |
| **Web Push (service worker + push relay)** | A PWA with a service worker can receive pushes, but a *send* needs something to hold each learner's push subscription and fire messages on a schedule: a relay (for example a free-tier edge function with a cron trigger). That is a server holding a per-device identifier, which breaks the "no account, no server, no tracking" promise even if no name is stored. On iOS, push works only for an installed home-screen web app (iOS 16.4 and later; my recollection, C, not re-fetched this session), so it would miss the Safari-tab learners we most worry about. A "we miss you" push is also rated amber-red in the ethics reference. | A relay to run, secure and justify | **Not in v1.** Revisit only if the D7 pilot (below) is under target *and* learners ask for it, and then make it opt-in per device with the subscription deletable in one tap. |

**Return targets (hypotheses to tune, not promises).** Context: mobile game medians are D1 about 22%, D7 about 4%, top 10% D1 about 40% (GameAnalytics figures as quoted second-hand in the `game-retention-design` skill; I did not read the report itself). A learning site with a 20-hour bloom hook and a calendar cue should beat the median; targets for the closed pilot, counted among learners who completed lesson 1's check:

| Metric | Definition | Target | Floor (rethink the loop below this) |
|---|---|---|---|
| **D1 return** | Opens the garden on the local calendar day after the first lesson check, and finishes a review round | 35% | 22% |
| **D7 return** | Any tended day on days 7 to 9 after first use | 15% | 8% |
| **First bloom rate** | Completes the first spaced review within 3 days | 50% | 30% |

**Measurement without accounts. Two layers:**

1. **Local counter (default, no network).** The device stores `firstDay` and a **30-bit bitmap of tended days** (one bit per day since first use, about 4 bytes). It is included in the full garden code and file (2.8). Pilot testers send their garden code to the team (a chat message); the team decodes D1 and D7 from the bitmap. This is privacy-safe because the learner chooses whether to share, and nothing leaves the device otherwise. Limit: it misses learners who never share, which biases results toward engaged people, so the team must say so in every number it quotes.
2. **Optional aggregate beacon (opt-in, off by default).** One checkbox in settings: "Share anonymous usage counts". If on, the page sends a request with **no identifier, no cookie, no IP stored** and only a bucket label such as `d1_return`, `d7_return`, `lesson_done_L1.05`, to a cookie-free counter (a self-hosted counter or a privacy-first analytics service; I did not evaluate vendors, C). It can count that "a D7 return happened" but cannot tie two events to one person. Because the learner is not identified, this gives rates, not cohorts, and is enough to judge the targets above. If the team cannot host or trust a counter, skip layer 2 and rely on layer 1 plus interviews.

**What would change the verdict:** if D1 is under its floor, the first thing to examine is whether the 20-hour bloom review is being reached (first bloom rate), not whether to add notifications.

### 2.6 Lapse handling

| Days away | What the learner sees | Rules |
|---|---|---|
| 0 to 2 | Normal | Nothing |
| 3 to 6 | A few plants doze. Message: "Some plants are resting. A 3-minute review wakes them." | Review queue capped at **12 items per session** (the minimum gate size) |
| 7 to 29 | More plants doze; garden still fully intact | Capped at 16 items; oldest-due first |
| 30 or more | "Welcome back. Your garden is exactly as you left it." A **12-item mixed check** across the levels they reached re-sets the review intervals | A pass resets intervals to the safe step; a miss re-seeds only the weak plants, never deletes |

Hard rules: **nothing earned is ever removed**; no "you lost" language; the daily review queue has a cap so an overdue pile cannot become a wall (the review-avalanche that makes many spaced-repetition users quit; C, practitioner experience, not verified here). A lapsed learner always has a 3-minute path back.

### 2.7 Anti-guessing and mastery gates

- **Gates are mastery, never taps or time, and every gate has 12 or more items.** A review round pools due items from several plants; a plant advances only if its own items in that round were first-try correct and the round scored 80% or more **on due-plant items only (practice items and padding excluded, see 2.3)**. A plant reaches Sprout only via the lesson check at 80% or more, Bloom and Full only via reviews at 80% or more. Level checks need 85% on cumulative content to place a landmark.
- **Minimum 12 items** per gate (lesson check, review round, level check at 20+ since cumulative, and the lapse check) and **no 2-option items** in them (guess maths in 1.6). Prefer production tasks: build the word from tiles, type it, pick the picture for a heard word.
- **First attempt counts.** A retry after a wrong answer teaches but does not score. A missed item returns later in the same sitting after at least 2 other items (a retrieval, not an echo).
- **No speed floor in v1.** An earlier draft proposed ignoring answers faster than about 600 ms; there is no data here to justify any number, and fast correct answers are what fluent readers produce. Drop it until a timed pilot (log response time on gating checks, compare with the 12-item guess maths) shows where tap-through really starts.
- **Test-out for adults:** passing a level check up front plants that level's plants straight to **Sprout**, with blooms still earned by later reviews. It saves a literate adult 8 hours of Level 1 without handing out fake mastery.
- **No time spent in the garden is ever rewarded.** Looking and rearranging are free toys, never progress.

### 2.8 Device-only persistence and multi-device without an account

**State is tiny.** Per lesson: stage (2 bits), review step (3 bits), last-reviewed day (12 bits as days since 2026-10-01, good for 11 years). That is 17 bits times 108 lessons = **1,836 bits, about 230 bytes**, plus the 4-byte tended-days bitmap and `firstDay` from 2.5; with a counter of tended days and a visitor list, roughly 300 bytes of JSON, a few KB stored. Far below the 5 MiB `localStorage` limit.

**Storage plan:**
1. Single store: `localStorage`, wrapped in try/catch (MDN: `QuotaExceededError`). No IndexedDB mirror: it would give false comfort because WebKit deletes both stores together.
2. On first save, call `navigator.storage.persist()` (Safari decides silently from engagement, so treat it as a request, not a guarantee).
3. On iPhone Safari, show an **Add to Home Screen prompt** (one-time, non-blocking, repeated after the 2nd and 5th lesson): "Add to Home Screen so Safari does not clear your garden" (WebKit exempts home-screen web apps from the 7-day rule).
4. **Show the garden code at every landmark** (the 7 level checks) as a full-screen "save your garden" card with copy, download and QR buttons, not a reminder in settings.
5. State plainly, once and in the settings page, that WebKit clears `localStorage` and IndexedDB **together**, so only the garden code, or a home-screen install, protects a Safari learner. Say also: "Your garden lives on this device only. There is no account. Save your garden code to keep it safe."

**Export and import (the backup and the multi-device story):**
- **Garden code (short):** progress only, 2 bits per lesson plus checksum = 27 bytes + 2 checksum + 1 version, encoded in Crockford base32 as groups of four (about 48 characters). Typeable, readable over a phone call, sendable in any chat. After import, all review dates are treated as due, so the new device starts with one gentle review round (pessimistic but safe).
- **Garden file or QR (full):** the roughly 230-byte payload including review timing, as a QR (a low version fits) and as a downloadable `.garden` text file. Scan or open on the second device.
- **Merge, not overwrite:** importing takes, per lesson, the **higher stage** and the **later review date**. Progress only moves forward, so importing an older code can never destroy newer progress. This is the whole multi-device sync story with no server.
- **Checksum plus version byte**, so a mistyped code says "check the last group" instead of silently loading nonsense.
- Camera scan needs `BarcodeDetector`, which is not available everywhere: always show the typed-code path as well.
- The code card appears at each of the 7 landmarks, the moment of highest attachment.

### 2.9 Adult and child, one garden

Same engine and same art; no mode switch that labels anyone. Differences are voice and density only:
- **Voice:** instructions in plain, short, adult-neutral sentences. A child hears the sounds with the same warmth because the sound is the star; praise is quiet ("Sprouted", not "Awesome!!!").
- **Art:** botanical, hand-drawn, calm light; no mascot required in the garden. (Mascot work is the other round-1 team's scope; keep any mascot out of the loop that gates progress.)
- **Field guide view:** a second tab lists every sound and pattern with its stage and last-reviewed date, so an adult who wants a dashboard can have one without a cartoon in sight.
- **Privacy:** lesson titles are not shown on the home screen by default.
- Tone hypothesis (C, untested): a 40-year-old and a 6-year-old both prefer something that looks like a real garden. Verify in the first playtest with at least three adult learners.

### 2.10 Pacing in numbers (tune)

| Moment | Cadence |
|---|---|
| First growth step (watered seed) | within 90 s |
| First sprout | end of L1.01, about 15 to 20 min |
| Level 1 (14 lessons, about 3.8 h) | a plant per lesson: **12 plants + path stones + the gate in the first 4 hours** |
| First bloom | 20 hours after the sprout |
| First visitor | after the **5th bloom** |
| Visitor rhythm | one per 5 blooms (19 visitors for 98 blooms) |
| Landmark | one per level end; level lengths are about 4, 6, 8.5, 7.5, 10, 10 and 10 hours of lessons |
| Plant sprouts per level | L1 12, L2 12, L3 16, L4 15, L5 15, L6 15, L7 13 (plus paths and landmarks) |

The cadence matches the retention skill's industry curve in spirit (a new thing early and often, wider gaps later) except that plants arrive at one per lesson throughout. That is deliberate: later lessons are 30 to 45 minutes, so a plant per lesson is already a wide gap in clock time.

### 2.11 The unlock table (all 108 lessons)

One primary garden gain per lesson. Plants (and Level 7 tools) arrive at **Sprout**; landmarks at the level check or capstone. Plant names are placeholders for the art team; each is a procedural variant inside a zone family (see Risk 5). Level 7 gains are **tools in the shed**, an adult-friendly reading of "advanced reader skills", ending in the observatory.

| # | Lesson | Title | Garden gains (at sprout) | Type | Gate (mastery, never time or taps) |
|---|---|---|---|---|---|
| 1 | L1.01 | Sounds in Words | First Sprout (the starter plot; sprouts when the L1.01 check is passed) | plant | lesson check >= 80% (12+ items) |
| 2 | L1.02 | s a t | Sunflower | plant | lesson check >= 80% (12+ items) |
| 3 | L1.03 | p i n | Pine | plant | lesson check >= 80% (12+ items) |
| 4 | L1.04 | m d | Marigold | plant | lesson check >= 80% (12+ items) |
| 5 | L1.05 | g o | Grape vine | plant | lesson check >= 80% (12+ items) |
| 6 | L1.06 | c k ck | Cactus | plant | lesson check >= 80% (12+ items) |
| 7 | L1.07 | e u | Elderberry | plant | lesson check >= 80% (12+ items) |
| 8 | L1.08 | r h | Rose | plant | lesson check >= 80% (12+ items) |
| 9 | L1.09 | b f l | Bluebell | plant | lesson check >= 80% (12+ items) |
| 10 | L1.10 | ff, ll, ss, zz (FLOSS) + the -s plural | Fern | plant | lesson check >= 80% (12+ items) |
| 11 | L1.11 | j v w | Jasmine | plant | lesson check >= 80% (12+ items) |
| 12 | L1.12 | x y z qu | Zinnia | plant | lesson check >= 80% (12+ items) |
| 13 | L1.13 | Review: All Letters, Letter Names vs. Sou... | Alphabet Path (path stones link the plants) | path | review round >= 80% (12+ items) |
| 14 | L1.14 | Level 1 Mastery Check | GARDEN GATE (landmark) | landmark | level check >= 85% (20+ items, cumulative) |
| 15 | L2.01 | sh | Shell Flower | plant | lesson check >= 80% (12+ items) |
| 16 | L2.02 | ch, tch | Chestnut | plant | lesson check >= 80% (12+ items) |
| 17 | L2.03 | th (voiced and unvoiced) | Thistle | plant | lesson check >= 80% (12+ items) |
| 18 | L2.04 | wh | Wheat | plant | lesson check >= 80% (12+ items) |
| 19 | L2.05 | ng, nk | Bell Heather | plant | lesson check >= 80% (12+ items) |
| 20 | L2.06 | Initial blends (st sp sn sm sl sw sk sc b... | Blend Hedge | plant | lesson check >= 80% (12+ items) |
| 21 | L2.07 | Final blends (-st -nd -nt -mp -sk -lt -ft... | Tall Reeds | plant | lesson check >= 80% (12+ items) |
| 22 | L2.08 | Three-letter blends (str spr scr spl squ ... | Triple Ivy | plant | lesson check >= 80% (12+ items) |
| 23 | L2.09 | Adding -s and -es (plural and 3rd-person ... | Twin Daisies | plant | lesson check >= 80% (12+ items) |
| 24 | L2.10 | Adding -ed (three sounds: /t/ /d/ /ɪd/) | Three-Tone Lily | plant | lesson check >= 80% (12+ items) |
| 25 | L2.11 | Adding -ing and -er (no base change) | Willow | plant | lesson check >= 80% (12+ items) |
| 26 | L2.12 | Compound words and closed 2-syllable words | Grafted Apple | plant | lesson check >= 80% (12+ items) |
| 27 | L2.13 | Review (everything from Level 2) | Pebble Path | path | review round >= 80% (12+ items) |
| 28 | L2.14 | Level 2 Mastery Check | STONE POND (landmark) | landmark | level check >= 85% (20+ items, cumulative) |
| 29 | L3.01 | a_e (VCe with a) | Aspen | plant | lesson check >= 80% (12+ items) |
| 30 | L3.02 | i_e (VCe with i) | Iris | plant | lesson check >= 80% (12+ items) |
| 31 | L3.03 | o_e, u_e, e_e (VCe with o, u, e) | Triple Orchid | plant | lesson check >= 80% (12+ items) |
| 32 | L3.04 | VCe + the Drop-e Rule | Birch | plant | lesson check >= 80% (12+ items) |
| 33 | L3.05 | Open Syllables | Open Lotus | plant | lesson check >= 80% (12+ items) |
| 34 | L3.06 | Y as a Vowel | Yarrow | plant | lesson check >= 80% (12+ items) |
| 35 | L3.07 | Soft c, Soft g | Cedar | plant | lesson check >= 80% (12+ items) |
| 36 | L3.08 | ar | Artichoke | plant | lesson check >= 80% (12+ items) |
| 37 | L3.09 | or, ore | Oregano | plant | lesson check >= 80% (12+ items) |
| 38 | L3.10 | ai, ay | Rain Lily | plant | lesson check >= 80% (12+ items) |
| 39 | L3.11 | ee, ea | Elm | plant | lesson check >= 80% (12+ items) |
| 40 | L3.12 | oa, ow, oe | Oak | plant | lesson check >= 80% (12+ items) |
| 41 | L3.13 | igh, ie | Night Cereus | plant | lesson check >= 80% (12+ items) |
| 42 | L3.14 | ue, ew, ui | Blueberry | plant | lesson check >= 80% (12+ items) |
| 43 | L3.15 | oo (Flex-Decoding Two Sounds) | Bamboo | plant | lesson check >= 80% (12+ items) |
| 44 | L3.16 | -ild, -ind, -old, -ost | Wild Oat | plant | lesson check >= 80% (12+ items) |
| 45 | L3.17 | Level 3 Review | Cobble Path | path | review round >= 80% (12+ items) |
| 46 | L3.18 | Level 3 Mastery Check | WOODEN BRIDGE (landmark) | landmark | level check >= 85% (20+ items, cumulative) |
| 47 | L4.01 | Cars in the Yard (ar extended) | Ash | plant | lesson check >= 80% (12+ items) |
| 48 | L4.02 | The Fork in the Road (or/ore extended + t... | Beech | plant | lesson check >= 80% (12+ items) |
| 49 | L4.03 | Her First Bird | Cherry | plant | lesson check >= 80% (12+ items) |
| 50 | L4.04 | Fair Weather, Rare Deer | Dogwood | plant | lesson check >= 80% (12+ items) |
| 51 | L4.05 | The Noisy Boy | Elder | plant | lesson check >= 80% (12+ items) |
| 52 | L4.06 | Loud Clouds, Slow Cows | Fig | plant | lesson check >= 80% (12+ items) |
| 53 | L4.07 | Paw, Pause, and the Mall | Hazel | plant | lesson check >= 80% (12+ items) |
| 54 | L4.08 | Bread and Silent Letters | Juniper | plant | lesson check >= 80% (12+ items) |
| 55 | L4.09 | Phones, Photos, and Ghosts | Larch | plant | lesson check >= 80% (12+ items) |
| 56 | L4.10 | Little Candle, Little Table | Linden | plant | lesson check >= 80% (12+ items) |
| 57 | L4.11 | A Nation's Vision | Mulberry | plant | lesson check >= 80% (12+ items) |
| 58 | L4.12 | Breaking Words Apart | Poplar | plant | lesson check >= 80% (12+ items) |
| 59 | L4.13 | Running, Happier, Hoping | Quince | plant | lesson check >= 80% (12+ items) |
| 60 | L4.14 | The Word-Attack Routine | Rowan | plant | lesson check >= 80% (12+ items) |
| 61 | L4.15 | Reading the Real World | Sycamore | plant | lesson check >= 80% (12+ items) |
| 62 | L4.16 | Level 4 Mastery Check | LANTERN (landmark) | landmark | level check >= 85% (20+ items, cumulative) |
| 63 | L5.01 | Prefixes un-, re- | Apple tree | plant | lesson check >= 80% (12+ items) |
| 64 | L5.02 | Prefixes in-/im-/ir-/il- (not), dis- | Pear tree | plant | lesson check >= 80% (12+ items) |
| 65 | L5.03 | Prefixes en-/em-, non- | Plum tree | plant | lesson check >= 80% (12+ items) |
| 66 | L5.04 | Prefixes over-, mis- | Peach tree | plant | lesson check >= 80% (12+ items) |
| 67 | L5.05 | Prefixes sub-, pre- | Orange tree | plant | lesson check >= 80% (12+ items) |
| 68 | L5.06 | Suffixes -ly, -er/-or | Lemon tree | plant | lesson check >= 80% (12+ items) |
| 69 | L5.07 | Suffixes -tion/-sion, -able/-ible | Lime tree | plant | lesson check >= 80% (12+ items) |
| 70 | L5.08 | Prefixes inter-, fore- | Pomegranate | plant | lesson check >= 80% (12+ items) |
| 71 | L5.09 | Suffixes -al, -y | Mango | plant | lesson check >= 80% (12+ items) |
| 72 | L5.10 | Prefixes de-, trans- | Guava | plant | lesson check >= 80% (12+ items) |
| 73 | L5.11 | Suffixes -ness, -ment | Apricot | plant | lesson check >= 80% (12+ items) |
| 74 | L5.12 | Prefixes super-, semi- | Date palm | plant | lesson check >= 80% (12+ items) |
| 75 | L5.13 | Suffixes -ful, -less, -ive | Olive tree | plant | lesson check >= 80% (12+ items) |
| 76 | L5.14 | Prefixes anti-, mid-, under- | Walnut tree | plant | lesson check >= 80% (12+ items) |
| 77 | L5.15 | Suffixes -ity, -ist | Almond tree | plant | lesson check >= 80% (12+ items) |
| 78 | L5.16 | Review, Integration & Extensive Reading C... | WINDMILL (landmark) | landmark | level check >= 85% (20+ items, cumulative) |
| 79 | L6.01 | How Your Body Is Built | Bamboo grove (the body) | plant | lesson check >= 80% (12+ items) |
| 80 | L6.02 | How Your Heart Keeps You Alive | Red Hibiscus (the heart) | plant | lesson check >= 80% (12+ items) |
| 81 | L6.03 | Why We Get Sick — and How the Body Fights... | Neem (fighting sickness) | plant | lesson check >= 80% (12+ items) |
| 82 | L6.04 | Clean Water, Fewer Diseases | Lotus (clean water) | plant | lesson check >= 80% (12+ items) |
| 83 | L6.05 | Salt Water and Fresh Water: Earth's Water... | Mangrove (salt and fresh) | plant | lesson check >= 80% (12+ items) |
| 84 | L6.06 | The Water Cycle: A Journey With No End | Water Lily (the cycle) | plant | lesson check >= 80% (12+ items) |
| 85 | L6.07 | Climate Change: One Cause, Many Effects | Snow Lily (climate) | plant | lesson check >= 80% (12+ items) |
| 86 | L6.08 | Floods and Droughts: Naming the Problem, ... | Rice Paddy (floods, droughts) | plant | lesson check >= 80% (12+ items) |
| 87 | L6.09 | Who's Behind This Page? Learning to Read ... | Heliotrope (reading sideways) | plant | lesson check >= 80% (12+ items) |
| 88 | L6.10 | How Money Moves: Banks, Loans, and Interest | Cotton (how money moves) | plant | lesson check >= 80% (12+ items) |
| 89 | L6.11 | How a Government Decides Where Money Goes | Date Grove (budgets) | plant | lesson check >= 80% (12+ items) |
| 90 | L6.12 | Taxes: Why We Pay Them and What They Buy | Banyan (taxes) | plant | lesson check >= 80% (12+ items) |
| 91 | L6.13 | Inflation: One Cause, Many Effects on You... | Wheat Field (inflation) | plant | lesson check >= 80% (12+ items) |
| 92 | L6.14 | The Indus Valley Civilisation: A City Bef... | Pipal (Indus Valley) | plant | lesson check >= 80% (12+ items) |
| 93 | L6.15 | From Mughal Court to Colonial Rule | Rose Court (Mughal to Colonial) | plant | lesson check >= 80% (12+ items) |
| 94 | L6.16 | Partition: One Decision, Two Countries (C... | GREAT BANYAN COURTYARD (landmark) | landmark | level check >= 85% (20+ items, cumulative) |
| 95 | L7.01 | Orientation & Baseline: What "Advanced Re... | Compass (tool shed) | plant | lesson check >= 80% (12+ items) |
| 96 | L7.02 | Reading Like a Historian I: Sourcing & Co... | Magnifier | plant | lesson check >= 80% (12+ items) |
| 97 | L7.03 | Reading Like a Historian II: Corroboration | Balance Scales | plant | lesson check >= 80% (12+ items) |
| 98 | L7.04 | Reading a Science Article I: Claim, Metho... | Soil Probe | plant | lesson check >= 80% (12+ items) |
| 99 | L7.05 | Reading a Science Article II: Correlation... | Thermometer | plant | lesson check >= 80% (12+ items) |
| 100 | L7.06 | Reading an Argumentative Essay: Claim, Re... | Pruning Shears | plant | lesson check >= 80% (12+ items) |
| 101 | L7.07 | Argument Evaluation: Logical Fallacies & ... | Spirit Level | plant | lesson check >= 80% (12+ items) |
| 102 | L7.08 | Lateral Reading & Source Credibility | Telescope | plant | lesson check >= 80% (12+ items) |
| 103 | L7.09 | Reading a Contract, Policy, or Terms of S... | Fine-Print Lens | plant | lesson check >= 80% (12+ items) |
| 104 | L7.10 | Synthesis I: Two Sources, Contrasting Vie... | Twin Lanterns | plant | lesson check >= 80% (12+ items) |
| 105 | L7.11 | Synthesis II: 3–4 Sources, One Research Q... | Grafting Knife | plant | lesson check >= 80% (12+ items) |
| 106 | L7.12 | Literary Reading I: Figurative Language, ... | Watercolour Set | plant | lesson check >= 80% (12+ items) |
| 107 | L7.13 | Literary Reading II: Unreliable Narrator ... | Quill | plant | lesson check >= 80% (12+ items) |
| 108 | L7.14 | Reading Stamina & Speed; Course Capstone ... | OBSERVATORY (landmark) | landmark | level check >= 85% (20+ items, cumulative) |

Totals: 85 plants, 13 shed tools, 3 path pieces, 7 landmarks = 108. Visitors (19) come from blooms, not lessons: one at each of the 5th, 10th, 15th ... 95th bloom.

### 2.12 Review-driven events (not lessons)

| Event | Trigger | Gain |
|---|---|---|
| Bloom | A plant's first spaced review at least 20 hours after sprout, 12+ due-plant items at 80% or more (padding excluded) | Flowers; counts toward visitors |
| Full | Second spaced review at least 7 days after the bloom | Seed pod, "Full" in the field guide |
| Visitor | Every 5th bloom | One of 19 cosmetic visitors |
| Zone in bloom | Every plant in a level at Bloom or better | The zone's landmark glows at dusk |
| Whole garden Full | All plants Full | A closing scene; the garden "sings" every sound (plays each plant's sound in turn) |

---

## Part 3 - The 5 biggest risks

1. **The garden becomes the point and the learning becomes the toll.** Evidence: GraphoGame Rime showed no gain over normal teaching in a trial rated very high security; the intrinsic-motivation meta-analysis shows the competence effect is the weak one (g = .277). If a learner can grow plants without learning, or learns to farm the plant, this fails. *Mitigation:* gates are mastery only (2.7), no currency, no reward for time in the garden, minimum 12-item checks, and a playtest measure: do learners who open the garden first (before the lesson) finish fewer lessons than those who open the lesson first? Kill any element that increases garden time but not mastery.

2. **Silent data loss destroys trust, and there is no account to recover from.** WebKit's 7-day rule can wipe a Safari learner's garden after a week without use; localStorage can also be cleared by the learner. A 40-year-old who loses months of reading work will not return. *Mitigation:* `persist()` as a request only, an Add-to-Home-Screen prompt on iOS, the garden code shown on a full-screen card at every landmark, merge-only import (2.8), and a plain statement that both browser stores are cleared together, and a plain statement of where data lives. Measure: in the first beta, how many returning visitors on iOS Safari find their garden missing?

3. **Dozing plants and review queues read as punishment or a chore pile.** I found no trial comparing punitive and non-punitive decay (finding 9). Forest-style loss works for one session, not for weeks; Habitica users report discouragement. Anki-style queues grow when someone is away. *Mitigation:* dozing is visual only and fully reversible, queue cap of 12 to 16 items per session, 3-minute return path, no "lost" language, 30-day re-placement check. Measure: return rate after a 7+ day gap, and the words learners use for the dozing state in interviews.

4. **The child/adult split: one tone cannot please both without a test.** Evidence on adult-literacy learners and visual tone is absent (1.4). A mascot-led or sugary garden may embarrass adults; a sober one may bore a 6-year-old. *Mitigation:* botanical neutral art as the default, adult-neutral copy, no age label, field guide tab, test with at least 3 adult learners and 3 children in the first silent playtest before any art is commissioned; adjust the surface layer (voice, colour) not the loop.

5. **Scope: 108 pieces of art and 19 visitors before the first learner sees a leaf.** If the reward layer is hand-drawn per lesson, it will delay or starve the course. A half-built garden at launch (empty plots after lesson 5) is worse than no garden. *Mitigation:* procedural plants (one SVG family per zone with parameters for petal count, colour and height, seeded by lesson id), ship only the Level 1 zone first (12 plants, path, gate, 2 visitors), build later zones as the course content lands, and keep `reduced motion` and colour-blind-safe palettes as day-one acceptance items.

### Not done, so Kamal knows what is still C or open

- Roediger and Karpicke (2006) retrieval-practice numbers: not re-fetched; used only as direction.
- Plant Nanny and Animal Crossing details: not verified; labelled.
- No third-party unlock-per-hour curves found; Part 2 numbers are proposals to be tuned.
- QR capacity figure and Cepeda's optimal-gap ratio are from my own knowledge, not re-fetched.
- The 2025 adult-literacy and age-aware gamification paper was not read.
- Next step I recommend: a silent playtest of a Level 1 grey-box (watered seed at 90 seconds, sprout when the L1.01 check passes, bloom 20 hours later in a 12-item round) before any art, following the retention skill's design mode.
