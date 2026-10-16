# Sound Garden: to do later

Last updated 2026-10-14. Nothing here is in progress.

## Ship it
- [ ] Put the site live. Fix `.github/workflows/pages.yml` for this repo's address (`orenda-project.github.io/sound-garden`), set the Vite base path, then enable Pages from Actions.
- [ ] Android app: add a Capacitor shell (app id `com.orenda.soundgarden`, "Sound Garden: Read English"), Sprig icon and splash, no INTERNET permission, all audio bundled. Build a debug APK, install it on the emulator, walk onboarding, one lesson and Practice.
- [ ] Store pack: listing text, data safety form, 8 screenshots from the real Android app.
- [ ] Remove the old project name from the public git history (needs a force-push of master; decide first).

## Verify
- [ ] Run the checks that were skipped: `check_failed_check`, `drive_levels` (levels 2 to 4), and the 390 and 1280 width console-error crawl of landing, play, teach, practice and sound-it-out.
- [ ] Find the one lesson-1 picture that renders blank in the artifact preview.
- [ ] Open the preview in the real claude.ai viewer and confirm it runs.
- [ ] Test on a real phone: 60 fps, installing from the browser menu, offline use.

## Sounds
- [x] 2026-10-16: the 43 isolated sounds were replaced with the teacher-style set Kamal picked by ear (synced from Sound Out with tools/sync_sounds_v5.py). Still open: v is provisional (Kamal to pick from 4 new versions); the 65-clip sample in tools/voice_review.html is still unheard.
- [ ] Weak sounds: ng, n, m, v, w, l, z (quiet on phone speakers), h, p, b, g (may thud).
- [ ] 26 clips of 21 real words still sound off to the speech checker (vat, dat, thur, whiff, tin, pap and others).
- [ ] Some scripts say symbols aloud ("slash", "equals", "right arrow"). Rewrite the text, then re-record.

## Look and motion
- [ ] Lesson screens look static next to Duolingo ABC and Teach Your Monster. Give them more life and a bigger Sprig.
- [ ] Sprig's hop needs a landing impact (Cookling's hop still wins).
- [ ] Add a night theme, a spring-driven lesson progress bar and the garden steam.
- [ ] The Play card on Home covers the lower third of the garden scene.
- [ ] A reload in the middle of a lesson lands on Home. A shared lesson link needs a profile on that device first.

## Teaching
- [ ] "Meet a sound" got NEEDS WORK from the phonics critic: the picture shows only on step 1, step 4 never checks the child made the sound, and the s or z pick uses a z not yet taught.
- [ ] 17 words in levels 1 to 4 use a letter pattern not yet taught (sentence, writing, through). They are baselined in `plan/decodable-known.txt`.
- [ ] Practice sheets for levels 5 to 7 are thin.
- [ ] Placement test, word chains and sentence dictation are not built.

## Brag video
- [ ] Two critics scored it 6.0 and 6.5 out of 10. Make the 24-feature wall readable on a phone, enlarge the app mockup text, add a web address to the end card, fix the "0 day practised" screen, and use a real phone in airplane mode for the offline scene.
- [ ] Attach `sound-garden-brag.mp4` (15 MB) to a GitHub release.
- [ ] Make the vertical 1080 x 1920 cut.
