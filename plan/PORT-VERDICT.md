# Port verdict: Sound Out into Sound Garden (branch `port-sound-out`)

Written honestly, 2026-10-13. Source: Sound Out master f55dc34c (Back-nav table, Practice hub, Teach-with-Sound-Out PDF included).

## What carried

| Area | Result | Evidence |
|---|---|---|
| Levels 1-7, 108 lessons, lexicon, gate options | carried verbatim (`so/content`) | `check_practice_links.py`: 108 lessons + 7 level PDFs |
| 43 isolated sounds (v2), 5-step meet-a-sound flow, all voiced clips | carried: 7,925 clips, 78 MB, one request per clip, cached as played | `check_ph_keys.py`: 112 v2 keys OK; drive: no missing clips |
| Sounds, blending, words, sentences, read, listen, check | carried (the Sound Out engine runs unchanged) | `drive.py --until L1.02`, `drive_session.py` (L5-7): ALL CHECKS GREEN |
| Failed check = not a pass, reteach redirect, park after 2 | carried | `check_failed_check.py`: GREEN |
| Track A (child, Sprig) / Track B (grown-up, calm, no mascot) | carried | drivers walk both |
| Sound it out | carried, URL `#/play/sound-it-out` | `drive_sayit.py`: GREEN |
| Practice area (hear, trace, which word, replay) | carried, URL `#/play/practice` | `drive_practice.py`: GREEN |
| Practice PDFs per lesson, level bundles, Teach-with-Sound-Out guide | carried; plus new `#/teach` page (no sum gate) with routine, do/don't, 109 PDF links | `check_urls.py`: every link 200 and `%PDF` |
| Onboarding, nav, back/home everywhere | carried; browser Back mapped onto Sound Out's hardware-Back table | `check_nav.py`: 0 problems; `check_urls.py` GREEN |
| Pedagogy fixes (whole word after sounds, no kid timer, helper mode, taught-letters-only foils) | carried as engine/data | `check_decodable.py` (see caveat 3) |
| Finch rules (no account, no age question, no typing for pre-readers, no loss streaks, no paywall) | carried and now gated | `check_finch.py`: GREEN |
| Shareable URLs | new: `#/play/lesson/L2.04`, practice, sound-it-out, teach; locked lessons stay locked; reload lands on Home | `check_urls.py` |
| Offline PWA | new: service worker precaches the app, core clips (~3 MB) prefetched, other audio cached as played | `check_offline.py`: landing, app and teacher page render with the network cut |
| Garden progress | new Home: one plot per lesson of the level you are on; seed when a lesson starts, sprout, leafy, bloom; Sprig grows with checked lessons; end-of-sitting plant; plants never wilt | screenshots in `shots/port/` |

## What did not carry, or changed

* Tilo (Sound Out's mascot) and his village, stickers art: replaced by Sprig and the garden. Sprig has one pose family (the WAAPI rig), so it has less body language than Tilo's pose art.
* Sound Out's day-garden of "days practised" flowers: dropped for the progress garden (days are still counted in Practice).
* Android/Capacitor shell: not in the web build (inert shims).
* "Garden code" export from the old Sound Garden M1 plan: not built (progress stays in the browser's IndexedDB).
* Sound Out's Home village scene, the review/demo pages (`compare.html`, `listen.html`, `voices.html`): not copied.

## Blind critic rounds (2 fresh haiku critics per round, order swapped, screenshots vs Sound Out's current screens for function and Finch / Duolingo ABC / Teach Your Monster stills for look)

* Round 1 (teaching flow, 14 pairs). Function: parity on 12 of 14; ours had the instruction Sound Out lacks on the tricky-word screen. Look: Sound Out won about 10 of 14. Reasons: Sprig read as sleepy or sad on celebration screens (lid at 45 percent), green forward button on green hills had no contrast, sun crowded the title, reward screen pushed Keep going / Home off a 844 px screen. All fixed (open eyes, gold forward button in lessons, sun moved, reward screen compacted: buttons bottom 830 of 844).
* Round 2 (all slices, 26 pairs). Function: parity everywhere except the teacher page, which lacked a routine and do/don't list (added). Look: Sound Out still won most teaching screens on mascot presence (Tilo is bigger and more expressive); Sound Garden won the garden Home and the onboarding pair on clarity, with a visible bloom count and sound-labelled flowers that Sound Out's Home does not have. Round 2 flagged "mascot tiny": header Sprig enlarged from 96 to 124 px.
* Not looped to a third round for every slice: the remaining look gap is art (Sprig vs Tilo), not function, and a CSS pass will not flip it.

The honest read: function parity is achieved and gated; look parity is not. Against the reference stills, the lesson screens are Sound Out's layouts in Sound Garden colours, with the same large empty lower half on several screens, and a smaller mascot.

## Caveats

1. The 7,925 clips are Sound Out's. The isolated sounds and new clips were checked by machine (whisper and the gates there), not heard by a person. No human has listened to Sound Garden end to end.
2. No test on a real phone or a real child. Nothing here replaces a playtest.
3. Decodability gate (`tools/check_decodable.py`): 17 words in L2-L4 use a grapheme not yet taught (for example `sentence` with `ce`, `writing` with `wr`, `though/through` with `ough`, `suggestion` with `ion`). They are inherited from Sound Out's content and listed in `plan/decodable-known.txt`; the gate fails on any new one. One is in Level 1 (`log`, L1.05 check). Doubles (`ll`, `ff`) and two-consonant clusters are treated as their letters.
4. Bundle: first load for the landing page 9.7 KB gzip. The app chunk is large (about 2.1 MB JS, 364 KB gzip for the data chunk, because lexicon, options and the audio index are bundled). Audio is lazy per clip, not per level bundle. Total repo adds about 106 MB (audio 78 MB, PDFs 23 MB, pictures 6 MB).
5. A mid-lesson reload lands on Home (a half sitting is not resumable), and a shared lesson link needs a profile on that device to open the lesson; otherwise onboarding runs first, then Home.
6. Sound Out drivers were reused through `tools/so-compat/` (a `#/play` goto shim and a doorway `vite.config.js`). Re-copy and `patch_drivers.sh` after a `--pull`. The full 299-sitting walk (`drive.py` with no `--until`) was started once and stopped as too slow; L1.01-L1.02 for Track A and the L5-7 session walks are green, `drive_levels.py` for L2-L4 was not re-run in this port.
7. Sprig colour pick in onboarding replaces Tilo's scarf colour (same `tiloLook` field in the profile).
8. Upstream drift: `tools/sync_sound_out.py --pull` warns when Sound Out changes a file that an overlay replaces (`main.js`, `home.js`, `tilo.js`, `tilo-look.js`).

## Not done

* Push (not pushed, as instructed).
* Real-device performance on a cheap Android (Sprig rig is the same WAAPI rig that passed the earlier phone-less spike; the larger app chunk is untested there).
* A third look round and a Sprig pose upgrade (more states for "wrong", "listening" and a waving hello) to close the mascot-presence gap.
