# 04 - Mascot and motion for Sound Garden

Date: 2026-10-09. Scope: mascot design evidence, web animation tech, whether the agent-face rig can be the mascot, motion rules, asset pipeline.
Evidence grades: A = meta-analysis or peer-reviewed; B = single study or developer-published design rationale with a research citation; C = vendor blog, review analysis, or tutorial. Numbers marked (unverified) came from one secondary source. Nothing here was benchmarked on a device; see "Gaps".

## Scope: who this is for, and what the evidence covers

- Target learner: ages 6 to adult, all of them early decoders of English (learning to map letters to sounds), on a phone-class device: a 2 GB RAM Android, low-end CPU, Chrome, often slow or metered data.
- Evidence base: the studies below are on K-12 or adult learners in general multimedia learning, or on preschool story e-books. None tests early decoders (6 to adult) practising decoding with a mascot. Treat every effect size as indirect; the design rules in sections 3 to 5 are inference, not measured results for this audience.

## 1. What makes learning-product mascots work

### 1.1 The four reference mascots

| Mascot | Reacts to learner input | Idle / ambient | Emotional range | Appearance rate | Grade of source |
|---|---|---|---|---|---|
| Duo (Duolingo) | Celebrates, cheers, nags, reacts to wins and misses; in the voice-call feature, states are idle, listening, thinking, talking, plus emotional feedback | Waits, nudges on return | Wide; used as a behavioural nudge | Frequent (every lesson end, notifications) | C. Only tutorials by Rive freelancers; no Duolingo primary source found. [1][2] |
| Monster (Teach Your Monster to Read) | Child builds their own monster and takes it through a journey; the monster is the avatar inside each mini-game | Not documented | Not documented | Constant: it is the protagonist | C. Developer claims (20M children, 200M plays) only; no study isolating the monster. [3][4] |
| Kodi (Khan Academy Kids) | Built around gestures: celebration plus verbal praise on success; thinking gestures and gentle prompts when a child struggles | Guide character on all screens | Gesture-led | Constant guide | B-/C. Rationale cites gesture research (Iverson and Goldin-Meadow) but no test of Kodi himself. [5] |
| Finch's bird | Grows as real self-care tasks are completed; decoratable with earned currency; seasonal pets | Lives on home screen | Mood-linked | Daily | C. Appbot analysis of 40,294 reviews (4.59 stars) links attachment to stickiness but says it cannot show cause. Churn claims are unsourced. [6] |

Pattern worth copying: the mascot is a state machine tied to app events (idle, listening, thinking, speaking, celebrate, comfort), not a looping decoration. Finch adds a second pattern: the creature's growth is the progress bar. Both fit a sprout.

### 1.2 Does a mascot help? (what the studies say)

- Pedagogical agents, Schroeder, Adesope and Gilbert 2013 meta-analysis, Journal of Educational Computing Research 49(1), doi:10.2190/EC.49.1.A (43 studies, 3,088 participants): small but significant learning benefit; larger for K-12 than for post-secondary; agents using on-screen text beat agents using narration. Grade A (DOI and journal confirmed via Crossref; study counts and moderator findings from a search summary of the abstract). [7]
- Cambridge Handbook of Multimedia Learning chapter on animated pedagogical agents: g = 0.45 transfer, g = 0.23 retention. Grade B: reported in a search summary; I did not read the chapter or confirm which edition and authors state these figures. [7]
- A later multimedia-agent meta-analysis (Educational Psychology Review 2021; 32 effect sizes, N = 2104): overall g+ = 0.20; 2D agents g+ = 0.38 vs 3D g+ = 0.11; nonverbal communication, motion and voice did not moderate effectiveness. Grade B: a meta-analysis, but I read it only through a university repository summary, not the full paper. [8] Implication: a flat 2D character is the better bet; do not pay for gesture polish expecting a learning gain.
- Caveat: none of these isolate animated mascots for young children or for decoding practice. The honest claim is "a small learning effect from a well-designed social agent, plausibly a larger motivation effect"; the motivation part is not measured in what I found.
- Seductive details hurt: Sundar and Adesope meta-analysis (58 studies, 7,500+ students) found learners given extra attractive-but-irrelevant material scored lower; the harm was larger when the detail was constant on screen next to relevant diagrams. A second analysis gives g = -0.16 (50 studies). Grade A for the existence of the meta-analysis (Sundar and Adesope 2020, doi:10.1007/s10648-020-09522-4, confirmed via Crossref); the study counts and g = -0.16 come from news and repository summaries, so treat the numbers as B. [9] A constantly moving mascot beside the letters is exactly this risk.
- E-book features, Takacs et al. meta-analysis (43 studies, 2,147 children): animation, music and sound effects tied to the story helped (comprehension g+ = 0.17, vocabulary g+ = 0.20 for technology overall); interactive hotspots, games and dictionaries hurt, most for children from less stimulating homes. Preschool UCI study: story-unrelated animation and games reduced comprehension. Grade A for Takacs et al. (Review of Educational Research 2015, doi:10.3102/0034654314566989; the g+ values, 43 studies and 2,147 children match the Crossref abstract); the UCI preschool result is B. [10][11]

Net rule: the mascot should move to carry information (right, wrong, try again, look here) and be near-still while the learner is decoding. Rich motion belongs in the gaps between items.

## 2. Technology bakeoff for the web

No source gave CPU numbers for these libraries on low-end Android web. The one Android datum found is native (not web) Lottie: per-frame render 11 to 21 ms with some frames over the 16.67 ms budget, and JSON parse about 520 ms for an 800 KB file [12]. Treat CPU as "measure on a cheap phone before committing" and use the budget in section 5.

| Option | Bundle | Low-end Android risk | Python-automatable authoring | Licence |
|---|---|---|---|---|
| lottie-web (full) | 298.7 KB min / 75.0 KB gzip (v5.13.0, depscope) [13] | CPU path parses JSON and redraws every frame in JS; canvas renderer is the faster one and can use OffscreenCanvas in a worker; SVG renderer cannot [14]. Webflow forum reports lag on Android with sub-100 KB files at 60 fps and no fix from canvas (anecdote) [15] | Yes (python-lottie, which is what agent-face uses) | MIT (lottie-web) |
| lottie-web-light (unofficial SVG-only) | 195.8 KB min / 51.4 KB gzip, 2020, stale [13] | As above | Same | Unofficial; low health score |
| dotLottie (dotlottie-web, ThorVG WASM) | JS wrapper 35 to 45 KB min+gzip per LottieFiles table; WASM engine about 500 KB compressed per docs, fetched from CDN on first use (LottieFiles marketing says about 150 KB; I trust the docs). Needs the WASM self-hosted for a no-server static site [16][17] | WASM CPU rasteriser; a WebGL2 variant exists. No device numbers | Yes: zip of Lottie JSON | MIT (verify package) |
| Rive | WASM brotli: about 222 KB canvas-lite, 567 KB canvas, 648 KB webgl2; v2.0.0 request quoted at about 261 KB (sources disagree) [18]. .riv files claimed 10 to 15x smaller than Lottie JSON by both Rive and LottieFiles (both sides uncompressed) [19] | Real state machines with inputs; no device numbers | No. Authoring is the Rive editor. I found no supported Python generator for .riv (not exhaustively checked) | Runtimes MIT; editor free to use, but exporting to apps now needs a paid plan (Cadet $9/mo annual per one source, Pro $24; check rive.app/pricing) [20] |
| Spritesheet / CSS steps() | 0 KB runtime; sheet size is the cost (one 512x512 PNG/WebP is typically tens of KB; not measured) | Cheap on CPU if the sheet is small; memory-heavy for many large frames; low frame rates look stiff | Yes: Pillow renders frames | Own assets |
| GSAP | 26.7 KB gzip / 69 KB min (depscope); Motion's page says 23.5 KB [21] | JS-driven; fine for one character, no GPU offload for non-transform props | JS, but timelines can be generated from JSON | Free for commercial use since Webflow acquisition (Webflow says all plugins included) [21] |
| Motion One / Motion `animate` mini | 2.3 KB mini (WAAPI only); 3.8 KB core; 17 KB hybrid [22] | Hardware-accelerated WAAPI for transform/opacity: the best fit for cheap CPUs | JS | MIT |
| Three.js | Large (not measured here); needs WebGL | Worst fit: GPU/driver variance on cheap phones, 3D not needed | Via Blender export | MIT |

Reading of the table: the runtime cost gap is two orders of magnitude (2.3 KB vs about 75 KB vs about 500 KB WASM). For a 2D character with a dozen to two dozen parts, a transform/opacity-only rig animated by WAAPI does the job at the lowest CPU cost, because those two properties can be composited off the main thread.

## 3. Can agent-face be the mascot?

What exists (inspected):
- /home/oye/Documents/free_work/agent-face: MIT licensed, python-lottie rig, 25-line YAML identity profile, 93 states, 5 identities. The Kamil pack is 93 Lottie files, 5.0 MB total, 36.6 KB to 74.6 KB each (thinking is the largest at 74.6 KB). README says 20 to 70 KB per file.
- It is a dark LED display face (eyes and mouth only, no body). Emotion is in eye and mouth shape. That reads as "robot assistant", not "garden".
- /home/oye/Documents/free_work/kamil-blob/index.html (7.4 KB): a blob body plus Rumi mark face, 21 states, pure SVG with CSS keyframes from the blobatar library. This is the closest existing thing to the recommended architecture: an SVG body, a swappable face group, CSS motion.
- The lottie-motion skill gives the timing table we should reuse (rest at least 40% of loop, blink 100/50/100 ms every 3 to 5 s, mouth morph 200 to 300 ms, eyes 150 to 200 ms, anticipation 10 to 15%, overshoot 5 to 10%, secondary action lags 50 to 100 ms, Material easing curves).

Why not ship agent-face as is:
1. Wrong fit: a glowing LED panel does not say "garden", and learners are meant to feel growth.
2. Cost: 93 files at about 50 KB each is 5 MB. We need about 26 states; even at 50 KB that is 1.2 MB plus the player (75 KB gzip lottie-web or 500 KB WASM). Too heavy for the first-load budget on cheap phones.
3. Lottie cannot cheaply blend or react to input: look-at-the-tapped-letter, eye follow, and "grow one stage" need runtime control, which is the reason the Rive/Duolingo example exists [2].

Recommendation: rework, do not reuse the files. Keep three things from agent-face: the idea of a profile-driven rig (a short YAML describes the creature, a script emits every state), the state vocabulary, and the lottie-motion timing table. Make a new character, "Sprig": a seed that becomes a sprout, then leaves, then a small plant over the learner's progress (3 to 5 growth stages, changing silhouette, not just size). Face = two eyes and a small mouth in the Rumi/blob grammar (eyes, mouth, at most one prop) so existing face work carries over.

### 3.1 State list (26 states), tied to app events

Growth stage is a separate variable (seed, sprout, sapling, small plant, flowering) and multiplies every state. States:

| # | State | App event | Loop? | Notes |
|---|---|---|---|---|
| 1 | idle | Waiting on screen | loop | breath 3 s, blink every 3 to 5 s, rest at least 40% |
| 2 | idle-lesson | During decoding (reduced presence) | loop | near-still, only blink; the "do not distract" state |
| 3 | wake | App opens | once | pops up from soil |
| 4 | greet | First visit of the day | once | wave leaf |
| 5 | listening | Mic open (read-aloud) | loop | leaf cups toward the learner |
| 6 | thinking | Checking the answer | loop, 1 to 2 s max | tilt, small wobble |
| 7 | speaking | Playing a sound or word | loop | mouth cycles synced to audio (2 to 3 mouth shapes) |
| 8 | pointing | Prompt "look here" | once | leaf points at a letter or word |
| 9 | tap-react | Learner taps the mascot | once, 3 variants | giggle, squish, spin; never blocks input |
| 10 | look-at | Pointer or target letter | continuous | pupils only, clamped, no layout cost |
| 11 | correct-small | Right answer | once, 0.6 s | nod plus sparkle |
| 12 | correct-streak | 3 right in a row | once | grow a leaf |
| 13 | celebrate | Item or level cleared | once, 1.5 s | bounce, petals |
| 14 | level-up | Stage change | once, 2.5 s | grow animation to the next stage; the big reward |
| 15 | wrong-soft | Wrong answer | once, 0.5 s | head tilt, no sad face, no red |
| 16 | try-again | Second attempt prompt | once | gentle lean, pointing at correct example |
| 17 | encourage | 3 misses or long pause | once | warm, offers a hint |
| 18 | hint | Hint shown | once | lightbulb sprout or leaf point |
| 19 | stuck-wait | 20 s no input | loop | slow breathing, looks at the screen |
| 20 | sleepy-return | Returning after days away | once then idle | droopy, then perks up with water splash |
| 21 | sleep | App backgrounded or session over | loop | closed eyes, z, stops all motion |
| 22 | water | Learner finishes the day's goal | once | rain or watering, growth tick |
| 23 | surprise | New unlock or discovery | once | wide eyes, pop |
| 24 | proud | Weekly goal or milestone | once | stands tall, flower bud |
| 25 | goodbye | Session end | once | waves, folds leaves |
| 26 | error-offline | Asset or audio failed | once | shrug; hides itself if repeated |

Not a 27th state, a rule: every state has a still pose (one frame) for reduced motion, and for slow phones.

Design rule: 2 or 3 of the states do all the work during a lesson (idle-lesson, correct-small, wrong-soft). The expensive ones (level-up, celebrate, water) appear between items.

## 4. Motion principles for this product

- Durations: Material mobile guidance is about 300 ms for typical transitions, 225 ms entering, 195 ms exiting, with anything over 400 ms starting to feel slow; scale duration with distance and size [23]. Use 150 to 300 ms for feedback (correct, wrong), 300 to 600 ms for mascot reactions, 1.5 to 2.5 s only for earned celebrations. The lottie-motion table above covers micro-timing.
- Easing: standard (0.4,0,0.2,1); decelerate (0,0,0.2,1) for entering; accelerate (0.4,0,1,1) for exiting; linear only for mechanical spins [23].
- Rest: at least 40% of any loop is rest (lottie-motion rule); idle loops never run while the learner is mid-decode.
- Reduced motion: honour `prefers-reduced-motion: reduce`. WCAG 2.3.3 (AAA) requires interaction-triggered motion to be disableable unless essential, and names the CSS media query and a user setting as sufficient techniques [24][25]. We should also ship an in-app "calm mode" toggle because many cheap Android devices do not expose the OS setting, and slow devices benefit too. Under reduced motion keep only meaning-carrying changes (a still pose swap, a colour or opacity fade of 150 ms).
- Attention in learning: constant decorative motion next to the task is the seductive-details failure [9]; story-relevant animation helps while games and hotspots hurt [10][11]. Therefore: mascot pointing/reacting counts as relevant; mascot idle bounce during decoding does not. Never animate the letters or words being learned except to highlight a sound while it plays.
- Sound: pair mascot reactions with the audio the learner needs; agents using text did better than narration in Schroeder [7], so keep captions of the spoken word visible during speaking.
- Frequency: appear at item boundaries, not on every tap. A mascot that talks over every action is the pattern the research warns about; the Duolingo nag style [1] is a retention tactic for adults and should not be copied wholesale for beginners.

## 5. Asset pipeline: pick one

Options:
A. python-lottie to Lottie JSON, played by lottie-web or dotLottie. Existing skill and rig. Cost: 75 KB gzip or about 500 KB WASM, JSON parse time, weak runtime input control. Licence: python-lottie is AGPL-3.0+ [26]. Does it matter here? Little. We would not ship python-lottie, only the JSON it writes. AGPL conditions apply to conveying or network-serving the program and modified versions of it, and a program's output is generally not covered unless it embeds the program's own copyrighted code (not checked for python-lottie output; not legal advice). agent-face already lists it as a dependency, not bundled, under MIT. So licence is not the deciding factor against A; runtime weight and weak input control are. If the generator script is published, list python-lottie as an install-time dependency and do not vendor its source.
B. Rive via its editor. Best state machine, small files. Not automatable from Python, editor-only authoring, WASM 222 to 567 KB, and export needs a paid plan [18][20]. Blocks "generate 25 states by script".
C. Layered SVG generated by a Python script (our code, MIT), animated in the browser by a small state machine that plays WAAPI keyframes or CSS transforms (Motion `animate` mini at 2.3 KB, or hand-written WAAPI), swapping face groups for expressions.

Pick C.

Reasons: (1) runtime cost is about 2 KB, versus 75 KB to 500 KB for A and B, which matters most on cheap phones and first load; (2) transform and opacity animations run on the compositor, the cheapest path on weak CPUs; (3) the character is a handful of SVG groups (body, two leaves, eyes, mouth, props), which Python can emit per growth stage from a YAML profile, matching the agent-face "profile to all states" idea; (4) look-at, tap reactions and stage growth need runtime control that Lottie only fakes; (5) the whole mascot ships inline as static SVG, no WASM and no extra requests; (6) kamil-blob already proves the SVG plus CSS approach at 7.4 KB for 21 states. Keep GSAP (about 25 KB gzip, free) out unless a scripted multi-part sequence such as level-up proves too fiddly in WAAPI. Use Lottie only if a one-off full-screen celebration is wanted, and then via dotLottie lazily loaded on demand, never at first paint.

Pipeline: `sprig.yaml` (palette, proportions, stage list) -> `make_sprig.py` emits one `sprig-stageN.svg` with named groups (`#eyes`, `#mouth-open`, `#leaf-l`...) plus `states.json` (per state: keyframes by group, duration, easing, loop, rest) -> a small `mascot.js` state machine consumes `states.json`; a Python check renders each state's first and last frame to PNG for review (reuse the agent-face contact-sheet approach).

Performance budget (to be verified on a real cheap phone): mascot SVG at most 15 KB per stage gzipped; no more than 12 animated nodes; animate only transform and opacity; one rAF-free runtime (WAAPI); pause everything when the tab is hidden; cap to one mascot animation at a time; fall back to still poses if frame time exceeds 32 ms for 10 frames.

## Gaps

- No benchmark of any option on a low-end Android browser. Run a 1-day spike: 12-node SVG sprout under WAAPI vs the same in lottie-web canvas, on the cheapest phone available, record frame times via Performance panel.
- No study isolates mascot effect on engagement for beginning readers or adults; effect claims for Duo, Kodi, monster and Finch are developer or vendor statements.
- dotLottie WASM size conflicts (about 500 KB vs about 150 KB); Rive WASM figures conflict (222 to 567 KB vs 261 KB).
- Rive Python authoring: none found, not exhaustively searched.

## Decisions for the build

Owner is lead for all ten; date is 2026-10-09. Each has a reversal trigger.

1. Build a new mascot, "Sprig" (seed to plant); do not ship agent-face Lottie files, keep its profile-driven generator idea and the lottie-motion timing table. Reverse if: five 6-to-adult learners in a quick test read Sprig as childish or confusing, or the lead rejects the look after the first stage render.
2. Pipeline = Python-generated layered SVG plus a small WAAPI/CSS state machine (Motion mini 2.3 KB or hand-rolled); no Lottie player or Rive runtime at first paint. Reverse if: the decision 9 spike fails with SVG/WAAPI (then see its fallback), or an animator needs shapes SVG groups cannot express.
3. Implement the 26 states in the table; four matter most in lessons: idle-lesson, correct-small, wrong-soft, pointing. Reverse if: after the first build more than 8 states are unused by any app event (cut them) or a lesson event has no state (add one).
4. Growth stage (3 to 5 stages, silhouette changes) is the progress indicator; level-up is the biggest animation. Reverse if: learners misread growth as a score they can lose, or art cost for stage silhouettes exceeds one day per stage.
5. Mascot stays near-still while the learner decodes; rich motion only at item boundaries and in rewards. Reverse if: playtest shows learners ignore feedback they cannot see, or an A/B shows no difference in accuracy between still and moving idle.
6. No sad or red wrong-answer reaction; head tilt plus pointing at the correct example. Reverse if: learners fail to notice they were wrong in playtest.
7. Animate only transform and opacity; at most 12 animated nodes; pause when hidden. Reverse if: a needed expression (for example mouth shapes for speaking) cannot be done with transforms or swapped groups; allow one extra node type, re-run the spike.
8. Honour `prefers-reduced-motion` and add an in-app calm mode; every state has a still pose. No reversal: accessibility floor. Revisit only the calm mode default if more than half of first-session users switch it on.
9. Spike go/no-go before locking the budget. Device: cheapest 2 GB RAM Android on hand, Chrome; a desktop run with Chrome DevTools 4x CPU throttle at 390x844 is a smoke test only and is NOT a go: the budget does not lock until a real 2 GB Android (Kamal's own or a named rental device) passes. Test: the Sprig rig with 12 animated nodes looping in a non-trivial state, 30 fps held for 60 s, frame time from the Performance panel (no more than 5% of frames over 33 ms). Go: pass. No-go: switch to the fallback ladder: (a) cut to 8 animated nodes and drop shadow or blur, retest; (b) if still failing, mascot shows still poses only plus a 150 ms opacity crossfade between them (the reduced-motion path becomes the default); (c) rich motion only as one pre-rendered 2 s WebP loop per reward. Do not move to Lottie or Rive, since both are heavier. Reverse if: Lottie canvas passes the same test and SVG fails (then reconsider A).
10. Optional Lottie via dotLottie, lazily loaded, only for rare celebrations and only if the spike shows headroom. Reverse if: the page crosses its first-load budget or a 2 GB device runs out of memory with the WASM loaded.

## Sources

1. Duolingo-style mascot build and behaviours (Rive freelancer tutorial, C): https://dev.to/uianimation/how-i-built-a-duolingo-style-mascot-animation-in-rive-41fm
2. Lottie vs Rive for state-driven characters (C): https://dev.to/uianimation/stop-using-lottie-for-characters-why-rive-is-the-future-of-app-animation-1hjf
3. Usborne Foundation, Teach Your Monster to Read: https://www.usbornefoundation.org.uk/teachyourmonstertoread
4. Games and Learning, development and marketing of Teach Your Monster to Read: https://www.gamesandlearning.org/tag/reading
5. Khan Academy, supporting English language acquisition with Khan Academy Kids (Kodi design): https://blog.khanacademy.org/supporting-english-language-acquisition-with-khan-academy-kids/
6. Appbot, Finch app reviews and emotional attachment: https://appbot.co/blog/finch-app-reviews-emotional-attachment-user-retention-product-loyalty/
7. Schroeder, Adesope and Gilbert 2013, How Effective are Pedagogical Agents for Learning? A Meta-Analytic Review, JECR 49(1): https://doi.org/10.2190/EC.49.1.A ; Cambridge Handbook of Multimedia Learning chapter (g = 0.45 / 0.23, unread, Grade B): https://resolve.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/multimedia-learning-with-animated-pedagogical-agents/B629E8948494D949DB818B4AB31F3B4F . Correction: the earlier version cited doi 10.1177/07356331211041701, which is a different 2021 paper (an analysis framework for pedagogical-agent studies).
8. Effectiveness of Multimedia Pedagogical Agents Predicted by Diverse Theories: a Meta-Analysis, Educ Psychol Rev 2021 (repository summary, Grade B): https://doi.org/10.1007/s10648-020-09587-1 ; https://research.birmingham.ac.uk/en/publications/effectiveness-of-multimedia-pedagogical-agents-predicted-by-diver/
9. Sundar and Adesope 2020, Keep it Coherent: A Meta-Analysis of the Seductive Details Effect: https://doi.org/10.1007/s10648-020-09522-4 ; summaries: https://news.wsu.edu/2020/03/19/seductive-details-inhibit-learning/ and https://par.nsf.gov/biblio/10637927
10. Takacs, Swart and Bus 2015, Benefits and Pitfalls of Multimedia and Interactive Features in Technology-Enhanced Storybooks, Rev Educ Res: https://doi.org/10.3102/0034654314566989 ; secondary summary: https://bop.unibe.ch/JEMR/article/download/11237/14708/54338
11. UCI, enhanced e-book features may reduce learning for preschoolers: https://news.uci.edu/research/enhanced-e-book-features-unrelated-to-narrative-may-reduce-learning-for-preschoolers
12. vivo engineering, native Android Lottie frame times (as found via): https://www.besthub.dev/articles/avoid-animation-pitfalls-comparing-multiple-android-animation-solutions-and-choosing-the-right-one-1ae39e1ebfd1
13. lottie-web and lottie-web-light sizes: https://depscope.dev/pkg/npm/lottie-web and https://mcp.depscope.dev/pkg/npm/lottie-web-light
14. lottie-web renderers, OffscreenCanvas: https://hackernoon.com/developer-puts-lottie-under-the-microscope
15. Lottie lag on mobile (anecdote): https://discourse.webflow.com/t/lottie-animations-lag-on-mobile/118672
16. dotLottie players and bundle table: https://docs.lottiefiles.com/en/runtimes
17. dotLottie web player internals (WASM about 500 KB): https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts
18. Rive runtime sizes: https://rive.app/docs/runtimes/runtime-sizes.md and https://rive.app/docs/runtimes/web/migrating-from-v1-to-v2
19. Rive as a Lottie alternative; LottieFiles comparison: https://rive.app/blog/rive-as-a-lottie-alternative and https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive
20. Rive pricing and MIT runtimes: https://rive.app/blog/new-pricing and https://rive.app/pricing
21. GSAP free and size: https://webflow.com/blog/gsap-becomes-free and https://depscope.dev/pkg/npm/gsap
22. Motion bundle sizes: https://motion.dev/docs/quick-start and https://motion.dev/docs/feature-comparison
23. Material motion duration and easing: https://m1.material.io/motion/duration-easing.html
24. WCAG 2.3.3 Animation from Interactions: https://w3c.github.io/wcag/understanding/animation-from-interactions
25. web.dev prefers-reduced-motion: https://web.dev/articles/prefers-reduced-motion
26. python-lottie licence (AGPLv3+): https://pypi.org/project/lottie/ and https://depscope.dev/pkg/pypi/lottie

Local files inspected: /home/oye/Documents/free_work/agent-face/README.md, /home/oye/Documents/free_work/agent-face/packs/agt-kamil-001/lottie/, /home/oye/Documents/free_work/kamil-blob/index.html, /home/oye/Documents/free_work/personal-agent-v2/.claude/skills/lottie-motion/SKILL.md.
