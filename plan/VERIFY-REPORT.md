# Verify report (2026-10-14)

Honest status. Under heavy machine load (load average 30-40) steps were cut short at the owner's request.

## A. Sync with upstream course (88e82d30)
PASS. `tools/sync_engine.py --source <path>` ran. No upstream change to the four overlaid files (no overlay conflicts). 430 re-voiced or new clips copied (new ids), 446 stale clips removed, new index, practice PDFs and Teach guide, pictures refreshed. Drivers re-patched. `npm run build` OK, 33 unit tests pass. The sync tool now also replaces clips whose bytes changed. Commit e9317bc.

## B. Sound completeness (`tools/check_audio_complete.py`, report `plan/audio-complete.json`)
* Static: 8,549 request keys collected (ui 188, ph 197, name 26, w 2106, ipa 2957, syl 702, ss 1593, lt/q/t2/read/rule/ex ...). All resolve in the index after one collector fix (5 session discussion keys are never requested: the role has no prompt). 7,909 clip files: 0 missing, 0 empty, 0 undecodable (ffmpeg), 0 extra files. PASS.
* Runtime (production dist, port 5395): drivers walked L1.01-L1.04 Track A and B with first run and meet-a-sound sittings, Practice hub, Sound it out. All driver exits 0. 253 distinct clips fetched, 0 failed or 404 audio requests. PASS.
* Nothing missing; no clip had to be recreated.

## C. Full run-check on production build
PARTIAL. Run and green: the audio gate above (which runs the walk, practice and sound-it-out drivers), `npm run build`, 33 unit tests. NOT run in this pass: check_urls, check_offline, check_nav, check_finch, check_decodable, check_ph_keys, drive_session, check_failed_check, and the console-error crawl at 390 and 1280 across landing, #/play, #/teach, #/play/practice, #/play/sound-it-out. (Earlier green on the previous build: see SITE-VERDICT.) The artifact check below covers a console/CSP crawl of landing, Start, onboarding, a lesson and the teacher page only.

## D. Artifact preview
Reproduced the blank page: with every dynamic import inlined, Vite left an undefined `__VITE_PRELOAD__` and the script died. Fixed, plus: the course engine's global CSS leaked onto the landing page (a 448 px column) so it now only applies on the app screens; routing is in memory (no location.hash, no history, no service worker, no manifest); unshipped clips and pictures are redirected to an empty clip / blank pixel so there are no 404 console errors; downloads are hidden; the teacher page shows a note instead of the PDF list.
* `npm run build:artifact` (vite.artifact.config.js + tools/stage_artifact.py) -> `/tmp/sg-artifact/` : `index.html` (3.24 MB, one inline script, inline CSS, fonts and landing art as data URIs), `files/` (500 files: 473 clips, 27 pictures, 2.4 MB), `manifest.json` (file list; publish in 2 batches of at most 250).
* `tools/check_artifact.py` serves it wrapped in the publish skeleton with the exact CSP: GREEN at 390 and 1280. Landing renders and animates, Start works, seed hatches, onboarding finishes, a lesson plays with 9 clips fetched, zero CSP violations, zero console errors, no failed requests. Screenshots in `shots/artifact/`.

## Still missing / known limits
* Only 473 of 7,909 clips ship in the preview (file-count limit): all sounds (ph:*), the L1.01-L1.04 clips and most ui lines. Later lessons are silent in the preview.
* Only 27 word pictures ship; at least one lesson-1 picture slot rendered blank in the preview (picture not shipped). Not investigated which one.
* The preview has no browser Back, no offline mode, no PDF downloads. Not tested in the real claude.ai viewer (sandbox iframe, IndexedDB behaviour unverified).
* Step C items listed above still need a run.

## TODO (stopped here; remaining work)
- Run the rest of step C on the production build: check_urls, check_offline, check_nav, check_finch, check_decodable, check_ph_keys, drive_session, check_failed_check, and the console-error crawl at 390 and 1280 (landing, #/play, #/teach, #/play/practice, #/play/sound-it-out).
- Find and ship the lesson-1 picture that renders blank in the artifact preview; ship more pictures and clips if the file budget allows.
- Test the artifact in the real claude.ai viewer (sandboxed iframe, IndexedDB).
- Remove the upstream project name from existing files (scrub pass).
