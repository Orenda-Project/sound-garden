# Brag Plan: Sound Garden (explainer-brag, ~84 s)

## What is this app?
A free website that teaches English reading the way a real teacher does: sounds first, then blending, words, sentences and stories, with every line voiced so the whole course works offline.

## The angle
Owner override of the skill defaults: a longer, warm explainer-brag (about 84 s, not 15-25 s), narrated, with music and sfx. The film follows the learning path itself (one sound, five steps, blend, levels, gentle checks, two tracks, practice, printables, garden) and then lands on the best part: all 7,909 lines are already voiced, so it works offline anywhere.

## Hook (first 3.7 s)
A giant "s" tile on a sunny hill. Narration: "Every reader starts with one small sound." Then the product's own voice clip says the sound, "sss", and Sprig reacts.

## Verified numbers used (counted from the repo)
- 43 letter sounds (src/ui/sounds.json: 26 consonant + 17 vowel tiles; so/content/gpc.json order of 31 graphemes feeds Level 1)
- 7 levels, 108 lessons (14, 14, 18, 16, 16, 16, 14) = 108 lesson JSON files = 108 practice PDFs
- 7,909 voiced clips (public/audio/*.ogg = 7,909 unique ids in so/content/audio_index.json). The README says 7,925: stale. The video says "nearly eight thousand" aloud and shows 7,909.
- 5-step meet-a-sound: A new sound / Listen to the sound / Inside a word / Your turn / Which letter says it? (captured from the running app, lesson 1.02)
- Teach guide: 8 pages (pdfinfo). Contents quoted: 5-minute routine, "no uh" sound table, progress checklist.
- 24 features (counted list below).

## Feature list (the "24 features" scene)
1 Sounds first; 2 43 letter sounds; 3 5-step meet-a-sound; 4 Blending; 5 Words to stories; 6 7 levels, 108 lessons; 7 Missed check is taught again; 8 Every line voiced; 9 Garden grows; 10 Garden never wilts; 11 No timer for kids; 12 Child track with Sprig; 13 Grown-up track; 14 Practice area; 15 Trace each sound; 16 Sound it out; 17 108 printable pages; 18 8-page Teach guide; 19 Free, no paywall; 20 No account; 21 No age question; 22 No ads, no tracking; 23 Works offline; 24 Install from the menu.

## Tone
- Preset: app-store (polished, feature-card clean) with warm, child-friendly storybook colour
- Creative direction: garden theme, Sprig the seed friend, sprouting and blooming; not parody
- Interpretation: soft crossfades, springy pop-ins, fast-in-then-hold text, real product screens only

## Format: landscape 1920x1080 (vertical 1080x1920 cut if time allows)
## Duration: 84.2 s

## Visual identity (from the project)
- Sky #5BBCF0 to #EAF7FF, cream #FBF6E6, leaf green #2F7D32, deep green #12330F, sun yellow #FFC21A
- Display font: Fredoka (bundled by the product); body: Nunito
- Strongest visual element: Sprig and the three-hill flower garden

## Voiceover script (Kokoro, af_heart, 1.05x)
1. Every reader starts with one small sound.
2. Meet Sound Garden. Free reading lessons, one sound at a time.
3. It teaches the way a real teacher does. Sounds first, never letter names. Forty-three sounds, one at a time.
4. Every new sound takes five small steps. See it. Hear it. Hear it in a word. Say it. Then pick it.
5. Then the sounds slide together into words, sentences and stories. Seven levels. One hundred and eight lessons.
6. If a check is missed, it never counts as a pass. The lesson is taught again, gently. No timers. And the garden never wilts.
7. Children get Sprig, the seed friend. Grown-ups get a calm view, with no mascot.
8. Practice any sound. Trace it. Or build a word, split it into sounds, and hear it blend.
9. Every lesson has a printable practice page. And a short guide helps parents and teachers: a five-minute daily routine, and how to say every sound, with no extra uh.
10. Every lesson grows your garden. A seed. A sprout. A bloom.
11. No account. No ads. No paywall. Twenty-four features, all free.
12. And the best part. Every single line is already voiced. Nearly eight thousand clips. So the whole course works offline, anywhere in the world, on a phone or a laptop.
13. Sound Garden. Plant your first seed.

## Storyboard (start s / length s)
1. Hook 0.0 / 3.7: giant "s" tile, real "sss" clip, ring pulse, Sprig listening
2. Reveal 3.7 / 4.3: wordmark, tagline, hero page in a browser frame (real motion capture); beat-locked: scene start 3.70 s = strong cue
3. Sounds first 8.0 / 7.4: "Sounds first. Never letter names." and the 43-sound grid, counter 0 to 43
4. Five steps 15.4 / 6.9: five real phone screens appear one by one on the narrated words
5. Blend + levels 22.3 / 7.4: s + a + t = sat (real "Sound it out" screens, real "sat" clip), then the seven-plant course path, "7 levels", "108 lessons"
6. Gentle 29.7 / 7.8: mini-check phone; three cards: missed check taught again, no timer, garden never wilts
7. Two tracks 37.5 / 5.3: child (Sprig) phone and grown-up (calm, no mascot) phone
8. Practice 42.8 / 5.6: practice area, trace, Sound it out (s a t to sat)
9. Print + teach 48.4 / 10.6: practice page, 5-minute routine, "no extra uh" table, progress checklist; "108 printable pages"
10. Garden 59.0 / 4.2: real seed-hatch capture, seed / sprout / bloom
11. 24 features 63.2 / 6.2: 24 chips pop in, counter to 24
12. Offline finale 69.4 / 10.6: "Every single line is already voiced", 7,909 counter, "Works offline.", airplane mode, no wifi, laptop and phone
13. CTA 80.0 / 4.2: Sprig, "Sound Garden. Plant your first seed.", Free / No account / Works offline

## Audio direction
- Role: warm bed under narration; light sfx layer (drops, card slides, one bell)
- Music: bundled happy-beats vol-11 (114.8 BPM, 87.6 s), volume 0.2 with fade in/out
- Music cue guidance: preset read; reveal in scene 2 locked to strong cue 3.70 s; other timing follows narration for readability
- Audio-reactive treatment: subtle; bass and mids from the track gently scale and brighten the suns only
- SFX posture: sparse, motion-matched, all at 0.35-0.55 volume
- Restraint rule: no sfx stacked on speech peaks; no waveform visuals

## Footage
Fresh Playwright captures of the running site (390x844 and 1280x800, deviceScaleFactor 2): landing hero, seed hatch (screen recording), meet-a-sound five steps, mini check, garden, practice, trace, Sound it out, grown-up track, 43 sound grid, course path; teacher PDFs rendered to PNG and cropped below their header bands (headers carry old brand names and a mascot). Sprig art rendered with transparent background from the repo's Sprig rig.

## Share copy (draft)
See share-copy.txt.
