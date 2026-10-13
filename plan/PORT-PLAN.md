# Port plan: Sound Out into Sound Garden

Branch `port-sound-out` (worktree `~/Documents/free_work/sound-garden-port`). Source: `~/Documents/free_work/sound-out` master f55dc34c
(Sound Out 02ea192a plus Back-nav fixes, Practice hub, Teach-with-Sound-Out PDF).

## 1. Audit of Sound Garden before the port (master 8dcae1a)

Stack: Vite 8, vanilla JS modules, hash router, localStorage `sg1`, WAAPI Sprig rig (26 states x 5 growth stages, 6 KB gz), SVG art in `src/art`.
Screens that existed: landing (tap the seed), garden home (12 plots), lesson (teach + 12-item tap gate + wrong/right feedback), sprout (reward), remind.
Content: Level 1 lessons L1.01-L1.12 only, 1.7 MB of old audio (hash names, no isolated v2 sounds), 124 KB of JSON.
Not there: Levels 2-7, blending/words/sentences, Track B, Sound it out, Practice area, PDFs, onboarding, helper mode, reteach logic, nav table.
Gates it had: `gate.test.js` (unit), `drive_m0.py`, size budget (first load 90 KB gz).

## 2. Approach: reuse the Sound Out engine, re-skin it, keep it sync-able

`so/` holds Sound Out's `app/src` and `content/` verbatim. Only two things differ from upstream, both mechanical:

* `so-overlay/` replaces whole files: `tilo.js` and `tilo-look.js` (Sprig is the face), `main.js` (boots into a page, deep links, URL hook), `home.js` (garden home), `garden.css` (palette/skin).
* `tools/sync_sound_out.py` holds a small PATCH_LIST of one-line replacements (brand name, Tilo art in avatars/onboarding, font path).

`python3 tools/sync_sound_out.py --pull` re-copies upstream and re-applies both, so Sound Out fixes flow in. Shell code (`src/`) is Sound Garden only:
router with shareable URLs, landing, teacher/parent page, PWA service worker, garden art. Capacitor imports resolve to inert shims.

## 3. Gap table

| Sound Out feature | State in Sound Garden before | Port action | Slice |
|---|---|---|---|
| Levels 1-7, 108 lessons, lexicon, options, gpc | L1 only (12) | copy `so/content`, engine reads it | 1 |
| 43 isolated sounds v2 (pure/anchor/stretch), 5-step meet-a-sound flow | no | engine + audio (7,925 clips, one request per clip, lazy by play) | 1, 2 |
| Teaching flow sounds, blending, words, sentences | single teach + gate | engine session (warm, blend, tricky, spell, read, listen, check) | 2 |
| Failed check = not a pass, reteach redirect | no | `path.js needReteach` (engine) + `check_failed_check.py` gate | 2 |
| Track A child / Track B grown-up | no | engine; Track B calm palette, no mascot | 2 |
| Sound it out (place/build, split, speak) | no | `sayit.js` (engine), URL `#/play/sound-it-out` | 4 |
| Practice area (hear/trace sounds, replay words) | no | `practice-hub.js` (engine), URL `#/play/practice` | 3 |
| Practice PDFs per lesson + Teach guide PDF | no | `public/practice/*.pdf`, new `#/teach` page (no sum gate) plus the engine's guide | 5 |
| Onboarding, who is reading, look, favourite sound | no | engine; Sprig colour replaces Tilo scarf | 6 |
| Back/home everywhere, hardware-Back table | partial | `backAction` table + browser Back through history, `check_nav.py` adapted | 6 |
| Pedagogy fixes: whole word after sounds, no timer for kids, helper mode, taught-letters-only foils | no | engine (data + code) | 2 |
| Finch rules: no account, no age question, no typing for pre-readers, no loss streak, no paywall | partly | engine + privacy text, grep gate | 6 |
| Garden progress (seeds planted, things growing) | 12 plots, L1 | new `home.js` overlay: a plant per lesson across 7 levels, seed per sound, Sprig grows with lessons | 7 |
| Shareable URLs | hash | `#/play/lesson/L2.04` etc. (see `src/router.js`) | 6 |
| Offline PWA | no | service worker: shell + data precached, audio cached as played, level-1 audio prefetched | 6 |

## 4. Slices and gates

1. content + audio (copy, sound key check, decodability gate)
2. teaching flow (engine runs end to end, Sprig mascot, skin)
3. practice area
4. Sound it out
5. PDFs + teacher/parent page
6. onboarding, navigation, URLs, PWA
7. garden progress

After each slice: Playwright drive (adapted Sound Out drivers in `tools/so/`), two fresh haiku critics (order swapped) on screenshots against
Sound Out's current screens for function and Finch / Duolingo ABC / Teach Your Monster stills for look, up to 3 rounds. Machine gates:
`check_ph_keys.py` (sound key check), `local_gate.py`-style decodability, `check_nav.py`.
