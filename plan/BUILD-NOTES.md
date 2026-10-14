# Build notes: the course engine inside Sound Garden

Written 2026-10-13, trimmed 2026-10-14. This replaces the earlier build-plan and verdict notes. It describes how Sound Garden is put together and what was checked, on its own terms.

## 1. Layout

Stack: Vite 8, vanilla JS modules, hash router, IndexedDB profile store, a spring-driven Sprig rig, SVG art in `src/art`.

* `engine/app/src/` and `engine/content/`: the course engine (screens, session flow, gates, practice, Sound it out, onboarding) and its data (Levels 1-7, 108 lessons, lexicon, options, gpc, audio index). Maintained in place.
* `engine-overlay/`: whole files that replace the engine file of the same name after `python3 tools/sync_engine.py`: `buddy.js` and `buddy-look.js` (Sprig is the guide), `main.js` (boots into a page, deep links, URL hook), `home.js` (the garden Home), `garden.css` (palette and skin), plus the hatch, fx and scene files.
* `src/`: the Sound Garden shell: router with shareable URLs, landing, teacher/parent page, PWA service worker, garden art, Sprig rig. Capacitor imports resolve to inert shims on the web.
* `tools/engine-compat/`: the Playwright drivers and checks, with a `#/play` goto shim (`engine_compat.py`) and a doorway `vite.config.js`, so they run against the Sound Garden root.
* `engine/VERSION`: short hash of the course-data checkout the content was built from.
* `tools/sync_engine.py --source <path>` refreshes content, audio, practice PDFs and word pictures from another checkout of the same course data, then re-applies the overlay. Without `--source` it only re-applies the overlay.

## 2. What the app covers

| Area | Evidence |
|---|---|
| Levels 1-7, 108 lessons, lexicon, gate options | `check_practice_links.py`: 108 lessons + 7 level PDFs |
| 43 isolated sounds (pure/anchor/stretch), 5-step meet-a-sound flow, 7,925 voiced clips (78 MB, one request per clip, cached as played) | `check_ph_keys.py`: 112 v2 keys OK; drive: no missing clips |
| Sounds, blending, words, sentences, read, listen, check | `drive.py --until L1.02`, `drive_session.py` (L5-7) |
| Failed check = not a pass, reteach redirect, park after 2 | `check_failed_check.py` |
| Track A (child, Sprig) / Track B (grown-up, calm, no mascot) | drivers walk both |
| Sound it out, URL `#/play/sound-it-out` | `drive_sayit.py` |
| Practice area (hear, trace, which word, replay), URL `#/play/practice` | `drive_practice.py` |
| Practice PDFs per lesson, level bundles, Teach guide; `#/teach` page (no sum gate) with routine, do/don't, 109 PDF links | `check_urls.py`: every link 200 and `%PDF` |
| Onboarding, nav, back/home everywhere; browser Back mapped onto the hardware-Back table | `check_nav.py`, `check_urls.py` |
| Pedagogy rules (whole word after sounds, no kid timer, helper mode, taught-letters-only foils) | `check_decodable.py` (see caveat 3) |
| Kid-safety rules (no account, no age question, no typing for pre-readers, no loss streaks, no paywall) | `check_finch.py` |
| Shareable URLs: `#/play/lesson/L2.04`, practice, sound-it-out, teach; locked lessons stay locked; reload lands on Home | `check_urls.py` |
| Offline PWA: service worker precaches the app, core clips (~3 MB) prefetched, other audio cached as played | `check_offline.py` |
| Garden progress: one plot per lesson of the current level; seed, sprout, leafy, bloom; Sprig grows with checked lessons; plants never wilt | screenshots in `shots/` |

Not in the web build: the Android/Capacitor shell, a "garden code" export (progress stays in the browser's IndexedDB), a village scene, review/demo pages.

## 3. Blind critic rounds

Two fresh critics per round, order swapped, on screenshots against reference stills (Finch, Duolingo ABC, Teach Your Monster).

* Round 1 (teaching flow, 14 pairs): Sprig read as sleepy or sad on celebration screens (lid at 45 percent), the green forward button on green hills had no contrast, the sun crowded the title, the reward screen pushed Keep going / Home off an 844 px screen. All fixed (open eyes, gold forward button in lessons, sun moved, reward screen compacted).
* Round 2 (all slices, 26 pairs): the teacher page lacked a routine and do/don't list (added). Garden Home and onboarding won on clarity. "Mascot tiny": header Sprig enlarged from 96 to 124 px.
* Not looped to a third round for every slice: the remaining look gap is art (the mascot's body language), not function.

Function is gated; look parity against the references is not reached. Lesson screens still have a large empty lower half on several screens.

## 4. Caveats

1. The 7,925 clips were checked by machine (whisper and the gates), not heard by a person. No human has listened to Sound Garden end to end.
2. No test on a real phone or a real child. Nothing here replaces a playtest.
3. Decodability gate (`tools/check_decodable.py`): 17 words in L2-L4 use a grapheme not yet taught (for example `sentence` with `ce`, `writing` with `wr`, `though/through` with `ough`, `suggestion` with `ion`). They are listed in `plan/decodable-known.txt`; the gate fails on any new one. One is in Level 1 (`log`, L1.05 check). Doubles (`ll`, `ff`) and two-consonant clusters are treated as their letters.
4. Bundle: first load for the landing page 9.7 KB gzip. The app chunk is large (about 2.1 MB JS, 364 KB gzip for the data chunk). Audio is lazy per clip. Total repo adds about 106 MB (audio 78 MB, PDFs 23 MB, pictures 6 MB).
5. A mid-lesson reload lands on Home; a shared lesson link needs a profile on that device, otherwise onboarding runs first, then Home.
6. The full 299-sitting walk (`drive.py` with no `--until`) was started once and stopped as too slow; L1.01-L1.02 for Track A and the L5-7 session walks are green.
7. The Sprig colour pick in onboarding is stored in the profile as `buddyLook`.

## 5. Not done

* Real-device performance on a cheap Android.
* A third look round and a Sprig pose upgrade (more states for "wrong", "listening" and a waving hello).
