# M0 checklist (grey-box Level 1, spike, deploy, blind test)

Self-contained: a builder can run this next session without reading DESIGN.md or BUILD.md. Work in `/home/oye/Documents/free_work/sound-garden`. Course source is `/home/oye/Documents/free_work/sound-out`, **read-only, never edit it**. Tick each box as you finish. Stop and report if any "STOP" line triggers.

## 0. Before anything
- [ ] **Device name (STOP if missing):** open `plan/spike.md`; it must contain a line `Device: <phone model>, Android <v>, Chrome <v>` written by Kamal. If not, ask Kamal for the model of his own Android phone and wait.
- [ ] `export SOUND_OUT=/home/oye/Documents/free_work/sound-out`; `git -C $SOUND_OUT rev-parse --short HEAD` must print `3283e35`. Write it to `.sound-out-commit`. (STOP if different, unless Kamal says to accept drift.)
- [ ] Node 20+, Python 3.10+, `pip install playwright pillow` and `playwright install chromium` work.

## 1. Pre-M0 checks (write results to `plan/pre-m0.md`)
Create `tools/pre_m0_check.py` that reads `$SOUND_OUT/content/` and prints PASS/FAIL per check, exit 1 on any FAIL:
- [ ] **A. Audio exists.** For every Level 1 lesson (`content/lessons/L1.01..L1.14.json`) and every word it uses, every option in `content/options.json` (target and foils) has a clip key in `content/audio_index.json` under `clips` (keys look like `w:sat`, `ph:s`), and the file `app/public/audio/<clips[key].id>.ogg` exists.
- [ ] **B. oralCheck options.** Read `app/src/screens/l1oral.js` function `blendWord`: find what it passes as the option `pool`. For each word in `CHECK` (sat, top, pig, dog, mat), `BLEND` (at, it, on) and `FIRST` (sun, top, pig, dog) confirm 3 or more distinct spoken options. Print any item with fewer.
- [ ] **C. Gate counts.** For each of L1.01..L1.14 count gate items with 3+ options. Expected: L1.02-L1.13 have 11 (5 real, 5 pseudo, 1 dictation), L1.01 has none listed (free response, bar 4/5), L1.14 no count. Save the table; this is the "before overlay" column.
- [ ] If A or B fails for an item, drop it from the pool and note it; do not record new audio.

## 2. Repo skeleton
- [ ] `npm create vite@latest . -- --template vanilla` (keep existing `research/` and `plan/`), then `npm i`; `npm i -D vitest`. In `vite.config.js` set `base: './'`.
- [ ] Create folders and empty files exactly: `src/{main.js,router.js,store.js,tokens.css}`, `src/engine/{gate.js,check.js}`, `src/ui/{lesson.js,peek.js,landing.js}`, `src/mascot/mascot.js`, `sprig/spike-rig.svg`, `tools/{build_content.py,pre_m0_check.py,size_budget.mjs,critic_capture.py,drive_m0.py}`, `content-overlay/`, `.github/workflows/{ci.yml,pages.yml}`, `public/data/`, `public/audio/`.
- [ ] `src/tokens.css` `:root` tokens: `--bg #FBF6EA`, `--card #FFFCF4`, `--text #2B2A26`, `--muted #5B574E`, `--border #8A8372`, `--leaf #2F7D32`, `--leaf-text #2A7230`, `--hero #4CB82B`, `--hero-edge #2F7D32`, `--hero-ink #12330F`, `--sky #1F6FB2`, `--right #0F766E`, `--wrong #A84A07`, `--sun #F5B301`, tints `#DDF1EE` `#FBE9D6` `#DCEEF9`, sky band `#8ED2F5`-`#BFE6FA`. Buttons: 3 px `--hero-edge` outline, 6 px bottom edge, `--hero-ink` label. System font stack only. Animate only `transform` and `opacity`.

## 3. Content pipeline (`tools/build_content.py`)
- [ ] Reads `$SOUND_OUT/content/{lessons/L1.*.json,options.json,lexicon.json,gpc.json,audio_index.json}`; strips `source`, `blocksFound`, `contentVersion`; writes `public/data/L1.json` and `public/data/shared.json`.
- [ ] Merges `content-overlay/L1.NN.json` (`{"lesson":"L1.05","addItems":[{"kind":"real","word":"...","options":[...3+...]}]}`). Count only items with 3+ options.
- [ ] **Overlay authoring (time-box one working day):** first pick overlay words that already have an `options.json` entry and audio (from checks A, C). Only if none exist, run `sound-out/tools/gen_options.py` inside a throwaway worktree: `git -C $SOUND_OUT worktree add $SCRATCH/so 3283e35` then `cd $SCRATCH/so && python3 tools/gen_options.py` (it writes `content/options.json` and `options_report.md` there, never in the real sound-out); copy the new entries into `content-overlay/`; remove the worktree.
- [ ] **L1.01 oral pool of 12** in `content-overlay/L1.01.json`: blend-and-pick `sat, top, pig, dog, mat` (5) + blends `at, it, on` (3) + first-sound picks `sun, top, pig, dog` (4); each with 3+ spoken options from check B.
- [ ] Exit non-zero if any of the 14 Level 1 gates has fewer than 12 items with 3+ options. Pass mark = 10 of 12.
- [ ] Copies only needed audio to `public/audio/L1/` (dedupe by clip id) and writes `public/data/audio-map.json` (key -> file, `real`|`placeholder`); fail if any Level 1 key is placeholder.
- [ ] Writes `content-report.md`: sound-out commit, **both bars per lesson (sound-out 9/11 or 10/11, and overlay 10/12)**, items before and after overlay, de-duplicated audio count and bytes (sound-out holds 2,898 `.ogg`, 14.6 MB counting copies; the app set is 898 files, 6.2 MB).
- [ ] Run: `python3 tools/build_content.py` then `python3 tools/build_content.py --check` (must exit 0).

## 4. Spike rig (day 1)
- [ ] `sprig/spike-rig.svg`: a plant-creature with exactly 12 animated nodes, each animated by WAAPI with only `transform` and `opacity`, in a looping "thinking plus look-at" state; a page `spike.html` loads it.
- [ ] On Kamal's phone (Chrome remote debugging) record 60 s in the Performance panel. Pass: 30 fps held and at most 5% of frames over 33 ms. Write frame stats and the device line into `plan/spike.md`. Desktop with 4x CPU throttle and DevTools "Fast 3G" is a smoke test only, not a go.
- [ ] No-go: reduce to 8 nodes, then still poses plus 150 ms crossfade, then one pre-rendered 2 s WebP per reward (never Lottie or Rive). Note the result.

## 5. Grey-box screens S1 to S5 (grey boxes and plain text; no art)
Hash router (`#/`, `#/lesson/L1.01`, `#/home`). Sprig is a grey rounded box with its pose name as a label. Add `?test=1` which puts `data-correct="true"` on the right option and exposes `window.__sg = {tapAt, wateredAt}` for the drive script.
- [ ] **S1 landing:** a pre-planted seed in a soil mound is the **one big tap target, no Start button**, plus a small "I have a garden code" link and the footer "Free. No account. No ads. No cookies." Tap = `AudioContext.resume()`, play the first clip, route to `#/lesson/L1.01`, set `__sg.tapAt = performance.now()`. No form fields anywhere.
- [ ] **S4 lesson player** for L1.01 sitting 1: audio prompt, 2x2 spoken option cards (3+ options where needed), thin item-progress bar (`transform: scaleX`), small plant-stage icon in the header. Port the logic of `$SOUND_OUT/app/src/gate.js` (read it first): options spoken not printed, a wrong pick replays and returns after 2 other items. No DOM code is copied, only the logic.
- [ ] **S4d feedback area** (fixed region above the options, **no bottom sheet, no "N in a row" counter**): Sprig pose label (`correct-small` or `wrong-soft`), word "Yes" or "Try again", sound named, tint layer that fades in by opacity (150 ms). Wrong state shows one example card at most 120 px square and 30% of the area's height on `--card`, no extra hue.
- [ ] **First watering:** on the first correct answer set `__sg.wateredAt = performance.now()` and show **S3p garden peek**: lesson dims by opacity, a soil patch with a swelling seed shows 2 s. It never covers the next item: the next item is already loaded, and **any tap cuts the peek and still lands on the item**.
- [ ] **S5 sitting done:** seed swell, "Sitting 1 of 4 done", under 2 s.
- [ ] Store: `localStorage` key `sg1` in try/catch, saves the seed's stage and `firstDay`.
- [ ] Gate engine unit tests (Vitest): 12 items, pass at 10, first attempt scored, retry not scored.

## 6. Budget and CI
- [ ] `tools/size_budget.mjs`: gzip every file requested before the seed tap (HTML, CSS, JS, SVG, manifest, icons); **fail above 90 KB**; also fail if any web font is in that set. Print the breakdown.
- [ ] `.github/workflows/ci.yml` on push: `npm ci`, `npm run build`, `node tools/size_budget.mjs`, `python3 tools/build_content.py --check`, `npx vitest run`. (The sound-out checkout is not on the runner, so keep `public/data` committed and make `--check` validate the committed data only.)

## 7. Drive script (`tools/drive_m0.py`, Playwright, mouse only, 390x844)
- [ ] Starts `npm run preview`, opens `/?test=1`; asserts: zero `input, select, textarea` elements; URL stays on one origin with no redirects; no console errors; after clicking the seed an audio request for a `.ogg` is made; clicks the `data-correct` option; asserts `wateredAt - tapAt < 90000` ms (log the real value); the peek does not cover the next item (click during the peek reaches the item); every requested audio key exists in `audio-map.json`.
- [ ] Saves screenshots to `shots/m0/`: `ours-landing.png`, `ours-question.png`, `ours-right.png`, `ours-wrong.png`. Exit 0 = green.

## 8. Deploy to GitHub Pages
- [ ] `.github/workflows/pages.yml`: on push to master, build, `actions/upload-pages-artifact` of `dist`, `actions/deploy-pages`. Ask Kamal once to set Settings > Pages > Source to "GitHub Actions". Record the URL in `plan/M0-demo.md`.
- [ ] Open the URL on Kamal's phone: seed tap plays a sound; confirm the 90 KB first-load number from DevTools Network (transferred).

## 9. Blind test (clarity of next action only, plus the no-wall check)
- [ ] `tools/critic_capture.py` builds five pairs from our `shots/m0/` image and this named bar shot in `research/shots/teardown/`:
  1. `ours-landing.png` vs `duo-landing-m.png`
  2. `ours-landing.png` vs `duo-welcome-01-hi.png`
  3. `ours-question.png` vs `duo-lesson-m-1-question.png`
  4. `ours-right.png` vs `duo-lesson-m-2-correct.png`
  5. `ours-wrong.png` vs `duo-lesson-m-3-wrong.png`
- [ ] For each pair, randomise which image is A or B with a recorded seed, and strip filenames and any labels. Spawn **two separate critic agents (haiku)**; each sees only the two images and answers one question: "Which screen makes it clearer what to do next? Answer A, B, or equal, then one sentence." Save raw answers to `plan/m0-blind.json` with the A/B mapping.
- [ ] **Win rule:** all 5 pairs x 2 critics = 10 verdicts must be "ours" or "equal". Any "theirs": fix that screen, recapture, rerun that pair with fresh critics, record every round. Do not judge delight or hierarchy at M0.
- [ ] **No-wall check (pass/fail):** compare with `tmtr-play-wall-m.png` by the drive script facts: zero form fields, zero redirects, one tap from `/` to the first sound. Record PASS in `plan/m0-blind.json`.
- [ ] Commit `plan/m0-blind.json`, `plan/spike.md`, `plan/pre-m0.md`, `content-report.md`, `plan/M0-demo.md`. Never `git add -A`; add files by name. Then hand to Kamal for Playtest Gate 1: **seed tap to first watering under 90 s is the go/no-go.**
