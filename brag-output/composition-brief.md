# Hyperframes Composition Brief: Sound Garden

Objective: ~84 s narrated explainer-brag, landscape 1920x1080 (owner override of the 15-25 s default), Kokoro voice (af_heart), music bed + sparse sfx.
Source: product screens captured from the running site with Playwright (see capture/ and composition/assets/img), product copy from src/ui/landing.js and the in-app screens, numbers verified in brag-plan.md.
Tone: app-store polish with warm garden storybook colour. Sprig the seed friend, sprouting and blooming. Not parody.
Build: composition/build.py generates composition/index.html from the scene table (lengths come from the narration WAV durations). Gate: `npx hyperframes check`.
