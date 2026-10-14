# Site verdict: Sound Garden as a real website 

Written honestly, 2026-10-13. The owner's complaint was that the port "does not feel like a proper website" and that the look lagged the course (Sprig smaller and less
expressive than the old mascot). This pass built a home page, a spring-driven motion system, a more expressive Sprig, an animated first run, a garden that grows and a celebration,
then judged each slice with blind critics against live bars.

## What was built

| Slice | What | Where |
|---|---|---|
| Motion engine | Spring physics (one value, target, stiffness, damping), one rAF loop that sleeps, `popIn`/`stagger`/`countTo`/`bump`, press-squash on every button, canvas confetti, toast. Calm motion snaps every spring. | `src/motion/engine.js` |
| Sprig | Rebuilt as a spring-driven rig (was WAAPI clips). Breathing, random blinks, glances, pointer-follow, poke (squash, tilt, hearts), 9 moods, 29 pose names, hop with a shadow that answers it, stars, hearts, petals, drops, zzz, thought bubble, brows, happy-arc eyes. API unchanged, so the course engine's mascot code runs on it. | `src/sprig/sprig.js` |
| Landing hero | Parallax garden (sky, sun, clouds, 3 hills, ~50 flowers, butterflies) that moves with scroll and pointer; Sprig large, waving, following the finger; headline and buttons spring in; seeds in the meadow pop up when it scrolls into view. | `src/ui/landing.js`, `hero-art.js`, `landing.css` |
| Landing sections | How it works (hear, say, read, each with a live mini animation), real app screens in phones that lean to the pointer, the course L1-L7 as seven plants that grow in, the 43 sounds with tap-to-hear, practice sheets and teacher guide downloads, privacy and free, FAQ, dusk footer with sleeping Sprig. 360 px to desktop. | same |
| App motion | Screens slide in on springs, cards pop in 85 ms apart, lesson steps spring in, lesson screens have a living meadow edge, Sprig 190 px in lessons, 168 px on Home. | `engine-overlay/fx.js`, `main.js` |
| First run | Seed on a hill: tap, squash, shake, three cracks draw themselves, flash, shell pieces fly and bounce, Sprig pops out, waves, Play rises in. | `engine-overlay/hatch.js` |
| Garden | Plants grow in on springs and sway, bloom count and ring spring up, level pill slides, butterflies and clouds drift, a newly bloomed plant pops and throws petals, finished steps draw their check with sparks. | `engine-overlay/fx.js`, `home.js` |
| Celebration | Canvas confetti, Sprig cheers and keeps hopping, sticker pops, "N days practised" counts up (never a loss), mini-check seeds pop, the lesson's plant grows seed to sprout to bloom. | `engine-overlay/fx.js`, `garden-scene.js` |

Kept: no account, no age question, no typing for children, no loss-framed streaks, no paywall (`check_finch.py` green). Calm motion (one switch shared by the home page,
the grown-ups area and the phone's reduce-motion setting).

## Blind critic rounds

Method: two fresh haiku critics per batch, one sees ours as A, the other as B; they pick a winner for each pair and name the loser's biggest gap. A result counts only if both orders agree. Frame strips are real frames of the running pages.
Bars fetched live: Finch, Duolingo ABC, Teach Your Monster to Read, Khan Academy Kids (pages), and the Cookling prototype the owner likes (motion). Round 1 used bars with cookie banners
covering them; that round is thrown away (the critics said so).

| Slice | Bar | Round | Result (a win counts only when both orders agree; haiku critics lean toward "B", so a split means no reliable preference) |
|---|---|---|---|
| Landing hero (look and motion, frame strips, 390 and 1280) | Finch, Teach Your Monster, Duolingo ABC, Khan Kids | 2 (clean bars) | **Ours won 16 of 16** |
| | | 4 (final build) | **Ours won 16 of 16** (hero Sprig bigger, flowers off the main thread) |
| Landing page, first screens (tall crop) | same four | 3 | Ours won vs Finch and Khan Kids at both widths; split vs Teach Your Monster and Duolingo ABC |
| | | 4 (final) | Ours won vs Khan Kids (both widths), vs Finch 1280, vs Teach Your Monster 1280. **Lost vs Duolingo ABC at 390** (Start button small against a busy garden). Split: Finch 390, TMTR 390, Duolingo 1280 |
| Sprig and app motion vs the Cookling prototype | Cookling (hatch, home, poses, hop) | 3 | Cookling won the hop (both orders); split on hatch, home, poses |
| | | 4 (final) | Cookling won the **hop** again ("a bob with no landing impact"); split on hatch, home, poses |
| Celebration vs Cookling | Cookling | 3 and 4 | **Ours won, both rounds** |
| Lesson screens | Teach Your Monster, Duolingo stills | 3 | Theirs won Duolingo, split TMTR |
| | | 4 (final) | Split on both. Repeated gap: "static panel, mascot does not react" (in a still capture without sound) |
| Garden Home vs Finch | Finch stills | 3 | Theirs won |
| | | 4 (final) | Split ("the Play card dominates the lower half") |

What the critics kept saying, and what was done: the first hero round was thrown out because cookie banners covered every bar; hatch "has no burst" (shell pieces,
stars and a confetti burst were added, the seed now rocks while it waits); the Home mascot "small, behind the card" (168 px, standing in the garden, greets on arrival);
lesson screens "flat green" (a swaying meadow edge with a butterfly, Sprig 190 px); "no product shown" on the page (a real-screens section); celebration "flatlines after
the burst" (Sprig keeps cheering, more bursts at 1.5 s and 3.3 s, a day counter). Not fixed, still the loser's gap: the hop (weight and landing), Duolingo ABC's mobile hero
Start button, the lesson screens next to full-page illustration worlds.

Machine gates, all green on the final build: `check_urls.py`, `check_offline.py`, `check_nav.py` (0 problems), `check_finch.py`, `check_decodable.py` (17 inherited, 0 new),
`check_ph_keys.py`, `drive.py --until L1.02` + `drive_session.py` (46/46 first screens, L5-L7 walks), `drive_practice.py`, `drive_sayit.py`, `check_failed_check.py`, 33 unit tests.
(The drivers were last run on the build just before three small additions: route fade, the toast and the hero pointer parallax; `check_urls`, `check_offline` and `check_nav` were re-run on the final build.)

## Performance and weight

| What | Number |
|---|---|
| Home page weight before any tap (gzip): code, CSS, fonts | **97.9 KB** (24.6 + 6.0 + 67.2); limit 300 KB (`tools/size_budget.mjs`, `tools/landing_budget.py` measures the same in a real browser) |
| Audio fetched before a tap | 0 files |
| Real app screens (webp, lazy) | 67 KB for three |
| App chunk and lesson data (loaded after Start) | unchanged from the port: about 2.1 MB JS, 364 KB gzip of data |
| Frame rate at a 4x slower CPU, production build (`tools/fps_check.py`) | hero **43.7 fps**, scroll 36.8, garden Home 31.0, celebration 30.0. The Cookling prototype scores about 49 in the same run |
| What made the hero fast enough | the swaying flowers are tiny separate elements (compositor-only rotate); the three big hill graphics never repaint; `content-visibility` on off-screen sections (halved paint and layer work); a filter shadow on Sprig removed; Sprig draws every other frame while idle; clouds on Home moved out of the scene graphic |

These numbers come from a laptop under a load average of about 44 (other jobs running) with software rasterisation, so they are pessimistic in one way and say nothing about a real phone GPU
in another. **60 fps on a mid phone is not demonstrated.** What is demonstrated: no layout work in the frame loop, only transform and opacity move, and the hero holds above 40 fps at a 4x CPU slowdown.

## What is not done, honestly

* **No real phone, no child.** Nothing here replaces a playtest; frame rates are from a throttled laptop. Nobody has listened to the 7,925 clips end to end.
* **Look gap that remains:** Cookling is still ahead on the hop (landing weight) and Finch and Duolingo are ahead on full-screen illustrated worlds inside lessons: the lesson screens are the course engine's layouts with a better mascot and a meadow edge, not new art per screen.
* **Sprig's mouth only moves with real audio.** In captures without sound (and on a muted phone) the lesson screens look quiet; the critics saw exactly that.
* **Garden Home:** the Play sheet still covers the lower third of the scene; Sprig stands in the garden (168 px) but the sheet competes with it.
* **Not built from the Cookling list:** a dark or night theme (only the dusk footer), steam, an XP bar (replaced on purpose by a "days practised" counter that only goes up, which is the Finch rule), the lesson progress bar is still the course engine's CSS transition rather than a spring, and tick draw-on is used on Home steps, not on every Practice tick.
* **No testimonials, awards or press** on the page because none exist; the critics asked for them. Not invented.
* **Calm motion** is verified in code paths (springs snap, loops stop) and by `check_nav.py`, which runs the whole first-run walk with reduced motion on; it was not walked screen by screen by a person.
* **Not pushed**, as instructed. The critic pair images and bar captures (about 100 MB) are kept out of git (see `.gitignore`); the README media (`shots/site/final`) and this table are the record.
* `dist/` is 108 MB (audio and PDFs); hosting limits matter for free plans (GitHub Pages allows 1 GB; check Netlify and Vercel plan limits).
