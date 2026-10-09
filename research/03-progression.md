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
| 6 | Intrinsic-motivation meta-analysis (35 interventions, 2,500 participants): overall g = .257 (small). Autonomy g = .638 and relatedness g = 1.776 rose, but **competence only g = .277** and the review names "lack of perceived competence" as a main failure. Lesson: a garden helps most if it makes the learner feel more competent, not if it only decorates. | https://link.springer.com/article/10.1007/s11423-023-10337-7 | A |
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
| **Safari trap:** WebKit deletes all of a site's script-writable storage (including `localStorage`, IndexedDB) after **seven days of Safari use without user interaction on the site**. The counter is days of Safari use, not calendar days. **Web apps added to the Home Screen are exempt and get their own counter.** | https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ and https://webkit.org/tracking-prevention/ | A (primary) |
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
| **Sprout** | Each completed sitting adds a visible growth step (3 to 5 steps, matching `appSittings`); full sprout when the **lesson check is passed at 80% or more** | A small plant, sound now tappable |
| **Bloom** | First **successful spaced review** at 1 day or more after the sprout (design: at least 20 hours, so "next morning" qualifies) | Flowers or fruit open; a visitor can arrive |
| **Full** | Successful review again at **7 days or more** | Leaves deepen, a seed pod forms; counts as "mastered" in the field guide |

There is no fifth stage and nothing that regresses on the learner's side. If a plant is overdue (see 2.5) it is shown **dozing** (leaves folded, colour softened). One successful retrieval wakes it immediately. A dozing plant keeps its sound, is still tappable, and is never removed. This is the only "decay" and it is reversible by doing the thing the learner came to do.

Review intervals for scheduling (design choice, informed by "optimal gap grows with retention interval", Cepeda 2006): **1, 3, 7, 14, 30 days**, expanding after a correct retrieval, dropping back one step after a miss (tune).

### 2.3 First visible reward

| When | What happens | Why it is honest |
|---|---|---|
| **0 to 10 seconds** | Garden opens with an empty plot and one planted seed already sitting there ("your garden starts with one seed") | Endowed progress that is true: the seed is real, it is the first plant |
| **Within about 90 seconds** (first correct blend or sound in L1.01) | The seed **sprouts on screen** with a small sound | The first change is caused by the learner's first correct answer |
| **End of L1.01 (about 15 to 20 minutes)** | First plant reaches Sprout and is tappable | The garden now holds one real piece of reading knowledge |
| **Next day (2-3 minute review)** | The plant **blooms** and the first visitor can land | The return hook is a thing the learner can see change because they came back |

Target: first visible change at **90 seconds** or sooner; measure it in the first silent playtest, with a ceiling of 3 minutes. The retention skill lists time-to-first-fun as one of the three numbers to instrument.

### 2.4 Daily and weekly loop

**Daily goal = one step.** Opening the garden and finishing **either one lesson sitting or one 2 to 5 minute review** counts as "tended today". It is decoupled from any bigger goal, following the Duolingo test above. A learner who wants 40 minutes can do 40 minutes; nothing requires it.

**What the learner sees, in order of priority:**
1. "Ready to tend" plants (due for review) glow softly. Reviewing them is the default first action.
2. The next lesson, with a visible size ("4 short sittings, about 20 minutes").
3. The garden, which they can just look at.

**Counter that cannot be lost:** "You have tended your garden on **N days**" is a **cumulative** total of distinct days, shown small. It never resets. There is no streak number in the main UI. A soft weekly row of 7 dots fills as days are tended; empty dots carry no colour change and no text.

**Weekly:** on any day the learner has tended 4 or more of the past 7 days, a small cosmetic event (butterflies, a rainbow) may appear (tune). It carries no learning or unlock value, so missing it costs nothing.

**Surprise, not gambling:** which visitor arrives and when is varied within a fixed set, so a return feels alive. What a learner unlocks is **never** random; visitors are cosmetic and never gate content (reasoning: finding 8, no learning evidence for random rewards, and the ethics table marks chance-based rewards red).

**No notifications** (a static site cannot send them without a server, and "we miss you" pushes are rated amber-red). Optional: a downloadable **.ics calendar event** ("Tend your garden", daily at a time the learner picks) that lives in their own calendar app. No server, no permission prompt.

### 2.5 Lapse handling

| Days away | What the learner sees | Rules |
|---|---|---|
| 0 to 2 | Normal | Nothing |
| 3 to 6 | A few plants doze. Message: "Some plants are resting. A 3-minute review wakes them." | Review queue capped at **10 items per session** |
| 7 to 29 | More plants doze; garden still fully intact | Capped at 12 items; oldest-due first; add 1 optional extra round |
| 30 or more | "Welcome back. Your garden is exactly as you left it." A **10-item mixed check** across the levels they reached re-sets the review intervals | A pass resets intervals to the safe step; a miss re-seeds only the weak plants, never deletes |

Hard rules: **nothing earned is ever removed**; no "you lost" language; the daily review queue has a cap so an overdue pile cannot become a wall (the review-avalanche that makes many spaced-repetition users quit; C, practitioner experience, not verified here). A lapsed learner always has a 3-minute path back.

### 2.6 Anti-guessing and mastery gates

- **Gates are mastery, never taps or time.** A plant reaches Sprout only via the lesson check at 80% or more, Bloom and Full only via reviews at 80% or more. Level checks need 85% on cumulative content to place a landmark.
- **Minimum 12 items** per gating check and **no 2-option items** in them (guess maths in 1.6). Prefer production tasks: build the word from tiles, type it, pick the picture for a heard word.
- **First attempt counts.** A retry after a wrong answer teaches but does not score. A missed item returns later in the same sitting after at least 2 other items (a retrieval, not an echo).
- **Speed floor** (tune): an answer under about 600 ms to a novel item is treated as a tap-through, shown a gentle "take your time", and not scored. No penalty beyond not scoring it. (Baker: guessing and hint-spamming correlates with learning less.)
- **Test-out for adults:** passing a level check up front plants that level's plants straight to **Sprout**, with blooms still earned by later reviews. It saves a literate adult 8 hours of Level 1 without handing out fake mastery.
- **No time spent in the garden is ever rewarded.** Looking and rearranging are free toys, never progress.

### 2.7 Device-only persistence and multi-device without an account

**State is tiny.** Per lesson: stage (2 bits), review step (3 bits), last-reviewed day (12 bits as days since 2026-10-01, good for 11 years). That is 17 bits times 108 lessons = **1,836 bits, about 230 bytes**; with a counter of tended days and a visitor list, roughly 300 bytes of JSON, a few KB stored. Far below the 5 MiB `localStorage` limit.

**Storage plan:**
1. Primary write: `localStorage`, wrapped in try/catch (MDN: `QuotaExceededError`).
2. Mirror: IndexedDB copy on every save, so a browser clearing one store does not erase both.
3. On first save, call `navigator.storage.persist()`.
4. On iPhone Safari, show a one-time, non-blocking note: "Add to Home Screen so Safari does not clear your garden" (WebKit exempts home-screen web apps from the 7-day rule).
5. Say plainly, once and in the settings page: "Your garden lives on this device only. There is no account. Save your garden code to keep it safe."

**Export and import (the backup and the multi-device story):**
- **Garden code (short):** progress only, 2 bits per lesson plus checksum = 27 bytes + 2 checksum + 1 version, encoded in Crockford base32 as groups of four (about 48 characters). Typeable, readable over a phone call, sendable in any chat. After import, all review dates are treated as due, so the new device starts with one gentle review round (pessimistic but safe).
- **Garden file or QR (full):** the roughly 230-byte payload including review timing, as a QR (a low version fits) and as a downloadable `.garden` text file. Scan or open on the second device.
- **Merge, not overwrite:** importing takes, per lesson, the **higher stage** and the **later review date**. Progress only moves forward, so importing an older code can never destroy newer progress. This is the whole multi-device sync story with no server.
- **Checksum plus version byte**, so a mistyped code says "check the last group" instead of silently loading nonsense.
- Camera scan needs `BarcodeDetector`, which is not available everywhere: always show the typed-code path as well.
- Remind the learner to save the code after each level landmark (the moment of highest attachment).

### 2.8 Adult and child, one garden

Same engine and same art; no mode switch that labels anyone. Differences are voice and density only:
- **Voice:** instructions in plain, short, adult-neutral sentences. A child hears the sounds with the same warmth because the sound is the star; praise is quiet ("Sprouted", not "Awesome!!!").
- **Art:** botanical, hand-drawn, calm light; no mascot required in the garden. (Mascot work is the other round-1 team's scope; keep any mascot out of the loop that gates progress.)
- **Field guide view:** a second tab lists every sound and pattern with its stage and last-reviewed date, so an adult who wants a dashboard can have one without a cartoon in sight.
- **Privacy:** lesson titles are not shown on the home screen by default.
- Tone hypothesis (C, untested): a 40-year-old and a 6-year-old both prefer something that looks like a real garden. Verify in the first playtest with at least three adult learners.

### 2.9 Pacing in numbers (tune)

| Moment | Cadence |
|---|---|
| First sprout | within 90 s |
| Level 1 (14 lessons, about 3.8 h) | a plant per lesson: **12 plants + path stones + the gate in the first 4 hours** |
| First bloom | next day (1 day) |
| First visitor | after the **5th bloom** |
| Visitor rhythm | one per 5 blooms (19 visitors for 98 blooms) |
| Landmark | one per level end; level lengths are about 4, 6, 8.5, 7.5, 10, 10 and 10 hours of lessons |
| Plant sprouts per level | L1 12, L2 12, L3 16, L4 15, L5 15, L6 15, L7 13 (plus paths and landmarks) |

The cadence matches the retention skill's industry curve in spirit (a new thing early and often, wider gaps later) except that plants arrive at one per lesson throughout. That is deliberate: later lessons are 30 to 45 minutes, so a plant per lesson is already a wide gap in clock time.

### 2.10 The unlock table (all 108 lessons)

One primary garden gain per lesson. Plants (and Level 7 tools) arrive at **Sprout**; landmarks at the level check or capstone. Plant names are placeholders for the art team; each is a procedural variant inside a zone family (see Risk 5). Level 7 gains are **tools in the shed**, an adult-friendly reading of "advanced reader skills", ending in the observatory.

| # | Lesson | Title | Garden gains (at sprout) | Type | Gate (mastery, never time or taps) |
|---|---|---|---|---|---|
| 1 | L1.01 | Sounds in Words | First Sprout (the starter plot; sprouts on your first correct answer) | plant | lesson check >= 80% |
| 2 | L1.02 | s a t | Sunflower | plant | lesson check >= 80% |
| 3 | L1.03 | p i n | Pine | plant | lesson check >= 80% |
| 4 | L1.04 | m d | Marigold | plant | lesson check >= 80% |
| 5 | L1.05 | g o | Grape vine | plant | lesson check >= 80% |
| 6 | L1.06 | c k ck | Cactus | plant | lesson check >= 80% |
| 7 | L1.07 | e u | Elderberry | plant | lesson check >= 80% |
| 8 | L1.08 | r h | Rose | plant | lesson check >= 80% |
| 9 | L1.09 | b f l | Bluebell | plant | lesson check >= 80% |
| 10 | L1.10 | ff, ll, ss, zz (FLOSS) + the -s plural | Fern | plant | lesson check >= 80% |
| 11 | L1.11 | j v w | Jasmine | plant | lesson check >= 80% |
| 12 | L1.12 | x y z qu | Zinnia | plant | lesson check >= 80% |
| 13 | L1.13 | Review: All Letters, Letter Names vs. Sou... | Alphabet Path (path stones link the plants) | path | review round >= 80% |
| 14 | L1.14 | Level 1 Mastery Check | GARDEN GATE (landmark) | landmark | level check >= 85% (cumulative) |
| 15 | L2.01 | sh | Shell Flower | plant | lesson check >= 80% |
| 16 | L2.02 | ch, tch | Chestnut | plant | lesson check >= 80% |
| 17 | L2.03 | th (voiced and unvoiced) | Thistle | plant | lesson check >= 80% |
| 18 | L2.04 | wh | Wheat | plant | lesson check >= 80% |
| 19 | L2.05 | ng, nk | Bell Heather | plant | lesson check >= 80% |
| 20 | L2.06 | Initial blends (st sp sn sm sl sw sk sc b... | Blend Hedge | plant | lesson check >= 80% |
| 21 | L2.07 | Final blends (-st -nd -nt -mp -sk -lt -ft... | Tall Reeds | plant | lesson check >= 80% |
| 22 | L2.08 | Three-letter blends (str spr scr spl squ ... | Triple Ivy | plant | lesson check >= 80% |
| 23 | L2.09 | Adding -s and -es (plural and 3rd-person ... | Twin Daisies | plant | lesson check >= 80% |
| 24 | L2.10 | Adding -ed (three sounds: /t/ /d/ /ɪd/) | Three-Tone Lily | plant | lesson check >= 80% |
| 25 | L2.11 | Adding -ing and -er (no base change) | Willow | plant | lesson check >= 80% |
| 26 | L2.12 | Compound words and closed 2-syllable words | Grafted Apple | plant | lesson check >= 80% |
| 27 | L2.13 | Review (everything from Level 2) | Pebble Path | path | review round >= 80% |
| 28 | L2.14 | Level 2 Mastery Check | STONE POND (landmark) | landmark | level check >= 85% (cumulative) |
| 29 | L3.01 | a_e (VCe with a) | Aspen | plant | lesson check >= 80% |
| 30 | L3.02 | i_e (VCe with i) | Iris | plant | lesson check >= 80% |
| 31 | L3.03 | o_e, u_e, e_e (VCe with o, u, e) | Triple Orchid | plant | lesson check >= 80% |
| 32 | L3.04 | VCe + the Drop-e Rule | Birch | plant | lesson check >= 80% |
| 33 | L3.05 | Open Syllables | Open Lotus | plant | lesson check >= 80% |
| 34 | L3.06 | Y as a Vowel | Yarrow | plant | lesson check >= 80% |
| 35 | L3.07 | Soft c, Soft g | Cedar | plant | lesson check >= 80% |
| 36 | L3.08 | ar | Artichoke | plant | lesson check >= 80% |
| 37 | L3.09 | or, ore | Oregano | plant | lesson check >= 80% |
| 38 | L3.10 | ai, ay | Rain Lily | plant | lesson check >= 80% |
| 39 | L3.11 | ee, ea | Elm | plant | lesson check >= 80% |
| 40 | L3.12 | oa, ow, oe | Oak | plant | lesson check >= 80% |
| 41 | L3.13 | igh, ie | Night Cereus | plant | lesson check >= 80% |
| 42 | L3.14 | ue, ew, ui | Blueberry | plant | lesson check >= 80% |
| 43 | L3.15 | oo (Flex-Decoding Two Sounds) | Bamboo | plant | lesson check >= 80% |
| 44 | L3.16 | -ild, -ind, -old, -ost | Wild Oat | plant | lesson check >= 80% |
| 45 | L3.17 | Level 3 Review | Cobble Path | path | review round >= 80% |
| 46 | L3.18 | Level 3 Mastery Check | WOODEN BRIDGE (landmark) | landmark | level check >= 85% (cumulative) |
| 47 | L4.01 | Cars in the Yard (ar extended) | Ash | plant | lesson check >= 80% |
| 48 | L4.02 | The Fork in the Road (or/ore extended + t... | Beech | plant | lesson check >= 80% |
| 49 | L4.03 | Her First Bird | Cherry | plant | lesson check >= 80% |
| 50 | L4.04 | Fair Weather, Rare Deer | Dogwood | plant | lesson check >= 80% |
| 51 | L4.05 | The Noisy Boy | Elder | plant | lesson check >= 80% |
| 52 | L4.06 | Loud Clouds, Slow Cows | Fig | plant | lesson check >= 80% |
| 53 | L4.07 | Paw, Pause, and the Mall | Hazel | plant | lesson check >= 80% |
| 54 | L4.08 | Bread and Silent Letters | Juniper | plant | lesson check >= 80% |
| 55 | L4.09 | Phones, Photos, and Ghosts | Larch | plant | lesson check >= 80% |
| 56 | L4.10 | Little Candle, Little Table | Linden | plant | lesson check >= 80% |
| 57 | L4.11 | A Nation's Vision | Mulberry | plant | lesson check >= 80% |
| 58 | L4.12 | Breaking Words Apart | Poplar | plant | lesson check >= 80% |
| 59 | L4.13 | Running, Happier, Hoping | Quince | plant | lesson check >= 80% |
| 60 | L4.14 | The Word-Attack Routine | Rowan | plant | lesson check >= 80% |
| 61 | L4.15 | Reading the Real World | Sycamore | plant | lesson check >= 80% |
| 62 | L4.16 | Level 4 Mastery Check | LANTERN (landmark) | landmark | level check >= 85% (cumulative) |
| 63 | L5.01 | Prefixes un-, re- | Apple tree | plant | lesson check >= 80% |
| 64 | L5.02 | Prefixes in-/im-/ir-/il- (not), dis- | Pear tree | plant | lesson check >= 80% |
| 65 | L5.03 | Prefixes en-/em-, non- | Plum tree | plant | lesson check >= 80% |
| 66 | L5.04 | Prefixes over-, mis- | Peach tree | plant | lesson check >= 80% |
| 67 | L5.05 | Prefixes sub-, pre- | Orange tree | plant | lesson check >= 80% |
| 68 | L5.06 | Suffixes -ly, -er/-or | Lemon tree | plant | lesson check >= 80% |
| 69 | L5.07 | Suffixes -tion/-sion, -able/-ible | Lime tree | plant | lesson check >= 80% |
| 70 | L5.08 | Prefixes inter-, fore- | Pomegranate | plant | lesson check >= 80% |
| 71 | L5.09 | Suffixes -al, -y | Mango | plant | lesson check >= 80% |
| 72 | L5.10 | Prefixes de-, trans- | Guava | plant | lesson check >= 80% |
| 73 | L5.11 | Suffixes -ness, -ment | Apricot | plant | lesson check >= 80% |
| 74 | L5.12 | Prefixes super-, semi- | Date palm | plant | lesson check >= 80% |
| 75 | L5.13 | Suffixes -ful, -less, -ive | Olive tree | plant | lesson check >= 80% |
| 76 | L5.14 | Prefixes anti-, mid-, under- | Walnut tree | plant | lesson check >= 80% |
| 77 | L5.15 | Suffixes -ity, -ist | Almond tree | plant | lesson check >= 80% |
| 78 | L5.16 | Review, Integration & Extensive Reading C... | WINDMILL (landmark) | landmark | level check >= 85% (cumulative) |
| 79 | L6.01 | How Your Body Is Built | Bamboo grove (the body) | plant | lesson check >= 80% |
| 80 | L6.02 | How Your Heart Keeps You Alive | Red Hibiscus (the heart) | plant | lesson check >= 80% |
| 81 | L6.03 | Why We Get Sick — and How the Body Fights... | Neem (fighting sickness) | plant | lesson check >= 80% |
| 82 | L6.04 | Clean Water, Fewer Diseases | Lotus (clean water) | plant | lesson check >= 80% |
| 83 | L6.05 | Salt Water and Fresh Water: Earth's Water... | Mangrove (salt and fresh) | plant | lesson check >= 80% |
| 84 | L6.06 | The Water Cycle: A Journey With No End | Water Lily (the cycle) | plant | lesson check >= 80% |
| 85 | L6.07 | Climate Change: One Cause, Many Effects | Snow Lily (climate) | plant | lesson check >= 80% |
| 86 | L6.08 | Floods and Droughts: Naming the Problem, ... | Rice Paddy (floods, droughts) | plant | lesson check >= 80% |
| 87 | L6.09 | Who's Behind This Page? Learning to Read ... | Heliotrope (reading sideways) | plant | lesson check >= 80% |
| 88 | L6.10 | How Money Moves: Banks, Loans, and Interest | Cotton (how money moves) | plant | lesson check >= 80% |
| 89 | L6.11 | How a Government Decides Where Money Goes | Date Grove (budgets) | plant | lesson check >= 80% |
| 90 | L6.12 | Taxes: Why We Pay Them and What They Buy | Banyan (taxes) | plant | lesson check >= 80% |
| 91 | L6.13 | Inflation: One Cause, Many Effects on You... | Wheat Field (inflation) | plant | lesson check >= 80% |
| 92 | L6.14 | The Indus Valley Civilisation: A City Bef... | Pipal (Indus Valley) | plant | lesson check >= 80% |
| 93 | L6.15 | From Mughal Court to Colonial Rule | Rose Court (Mughal to Colonial) | plant | lesson check >= 80% |
| 94 | L6.16 | Partition: One Decision, Two Countries (C... | GREAT BANYAN COURTYARD (landmark) | landmark | level check >= 85% (cumulative) |
| 95 | L7.01 | Orientation & Baseline: What "Advanced Re... | Compass (tool shed) | plant | lesson check >= 80% |
| 96 | L7.02 | Reading Like a Historian I: Sourcing & Co... | Magnifier | plant | lesson check >= 80% |
| 97 | L7.03 | Reading Like a Historian II: Corroboration | Balance Scales | plant | lesson check >= 80% |
| 98 | L7.04 | Reading a Science Article I: Claim, Metho... | Soil Probe | plant | lesson check >= 80% |
| 99 | L7.05 | Reading a Science Article II: Correlation... | Thermometer | plant | lesson check >= 80% |
| 100 | L7.06 | Reading an Argumentative Essay: Claim, Re... | Pruning Shears | plant | lesson check >= 80% |
| 101 | L7.07 | Argument Evaluation: Logical Fallacies & ... | Spirit Level | plant | lesson check >= 80% |
| 102 | L7.08 | Lateral Reading & Source Credibility | Telescope | plant | lesson check >= 80% |
| 103 | L7.09 | Reading a Contract, Policy, or Terms of S... | Fine-Print Lens | plant | lesson check >= 80% |
| 104 | L7.10 | Synthesis I: Two Sources, Contrasting Vie... | Twin Lanterns | plant | lesson check >= 80% |
| 105 | L7.11 | Synthesis II: 3–4 Sources, One Research Q... | Grafting Knife | plant | lesson check >= 80% |
| 106 | L7.12 | Literary Reading I: Figurative Language, ... | Watercolour Set | plant | lesson check >= 80% |
| 107 | L7.13 | Literary Reading II: Unreliable Narrator ... | Quill | plant | lesson check >= 80% |
| 108 | L7.14 | Reading Stamina & Speed; Course Capstone ... | OBSERVATORY (landmark) | landmark | level check >= 85% (cumulative) |

Totals: 85 plants, 13 shed tools, 3 path pieces, 7 landmarks = 108. Visitors (19) come from blooms, not lessons: one at each of the 5th, 10th, 15th ... 95th bloom.

### 2.11 Review-driven events (not lessons)

| Event | Trigger | Gain |
|---|---|---|
| Bloom | A plant's first spaced review at 1 day or more, 80% or more | Flowers; counts toward visitors |
| Full | Second spaced review at 7 days or more | Seed pod, "Full" in the field guide |
| Visitor | Every 5th bloom | One of 19 cosmetic visitors |
| Zone in bloom | Every plant in a level at Bloom or better | The zone's landmark glows at dusk |
| Whole garden Full | All plants Full | A closing scene; the garden "sings" every sound (plays each plant's sound in turn) |

---

## Part 3 - The 5 biggest risks

1. **The garden becomes the point and the learning becomes the toll.** Evidence: GraphoGame Rime showed no gain over normal teaching in a trial rated very high security; the intrinsic-motivation meta-analysis shows the competence effect is the weak one (g = .277). If a learner can grow plants without learning, or learns to farm the plant, this fails. *Mitigation:* gates are mastery only (2.6), no currency, no reward for time in the garden, minimum 12-item checks, and a playtest measure: do learners who open the garden first (before the lesson) finish fewer lessons than those who open the lesson first? Kill any element that increases garden time but not mastery.

2. **Silent data loss destroys trust, and there is no account to recover from.** WebKit's 7-day rule can wipe a Safari learner's garden after a week without use; localStorage can also be cleared by the learner. A 40-year-old who loses months of reading work will not return. *Mitigation:* `persist()`, IndexedDB mirror, Add-to-Home-Screen nudge on iOS, a short garden code shown after every landmark, merge-only import (2.7), and a plain statement of where data lives. Measure: in the first beta, how many returning visitors on iOS Safari find their garden missing?

3. **Dozing plants and review queues read as punishment or a chore pile.** I found no trial comparing punitive and non-punitive decay (finding 9). Forest-style loss works for one session, not for weeks; Habitica users report discouragement. Anki-style queues grow when someone is away. *Mitigation:* dozing is visual only and fully reversible, queue cap of 10 to 12 items per session, 3-minute return path, no "lost" language, 30-day re-placement check. Measure: return rate after a 7+ day gap, and the words learners use for the dozing state in interviews.

4. **The child/adult split: one tone cannot please both without a test.** Evidence on adult-literacy learners and visual tone is absent (1.4). A mascot-led or sugary garden may embarrass adults; a sober one may bore a 6-year-old. *Mitigation:* botanical neutral art as the default, adult-neutral copy, no age label, field guide tab, test with at least 3 adult learners and 3 children in the first silent playtest before any art is commissioned; adjust the surface layer (voice, colour) not the loop.

5. **Scope: 108 pieces of art and 19 visitors before the first learner sees a leaf.** If the reward layer is hand-drawn per lesson, it will delay or starve the course. A half-built garden at launch (empty plots after lesson 5) is worse than no garden. *Mitigation:* procedural plants (one SVG family per zone with parameters for petal count, colour and height, seeded by lesson id), ship only the Level 1 zone first (12 plants, path, gate, 2 visitors), build later zones as the course content lands, and keep `reduced motion` and colour-blind-safe palettes as day-one acceptance items.

### Not done, so Kamal knows what is still C or open

- Roediger and Karpicke (2006) retrieval-practice numbers: not re-fetched; used only as direction.
- Plant Nanny and Animal Crossing details: not verified; labelled.
- No third-party unlock-per-hour curves found; Part 2 numbers are proposals to be tuned.
- QR capacity figure and Cepeda's optimal-gap ratio are from my own knowledge, not re-fetched.
- The 2025 adult-literacy and age-aware gamification paper was not read.
- Next step I recommend: a silent playtest of a Level 1 grey-box (first sprout in 90 seconds, next-day bloom) before any art, following the retention skill's design mode.
