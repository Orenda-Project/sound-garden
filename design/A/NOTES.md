# Direction A: Living garden
1. Painterly layered SVG world: sky bands, sun with halo, three cool-to-warm hill layers with displaced edges, hand-placed grass strokes, a paper grain over everything.
2. Depth does the work: far hills go blue-green, front hills go full hero leaf, so the garden reads as a place you could walk into.
3. Sprig is a seed with a two-leaf sprout, big eyes and blush. Poses: idle (open eyes), happy (closed arcs), tilt (brows up, arm points at the example), cheer (arms up).
4. Palette exactly as passed: leaf #4CB82B, edge #2F7D32, ink #12330F, sun #FFC21A, sky #2FA8F2, cream #FBF6EA, right #0F766E, wrong #A84A07, no red. Lesson screens use only sky strip, one state tint and the leaf underline.
5. Heading font: Grandstander 800 (Google Fonts, one link). Chunky, slightly wobbly, reads as hand-lettered next to the painted hills; body stays system-ui. It appears only on S6 and S3 and is lazy-after-first-sprout (S1 and S4 use the system stack, as plan sec. 2 requires). Caveat: it is two-storey a and g, so letters being taught never use it; Andika stays the literacy face.
6. Motion is transform and opacity only: Sprig breathe, leaf sway, blink, watering drop, sprout pop, cloud drift, seed ring pulse, sun-ray spin, petals. All stop under prefers-reduced-motion.
7. Shapes are deliberately imperfect (uneven corner radii, wobble filter on plants), not default rounded cards. Hero button keeps the 3px edge and 7px bottom lip.
8. Every instruction has an icon (speaker) so it works for non-readers; "Try again" is a cream sky-outlined button, never hero green.
9. Cost: the grain and displacement filters are static but heavy on cheap Androids. Ship pre-rendered hill layers as images if frame time suffers.
10. Cut for the 12-node cap (S3 budget is 9): sun-ray spin, falling petals (S6 only), the second ring pulse and the sway on back-row plants; keep Sprig 4, one cloud, two glowing plants, tap pop.

## Round 2 (after blind judge round 1: A won 3-2)
- Picture cues only where the learner is being taught: new screen 06-meet-teaching shows sun/moon/apple/tent on the tiles. The check screens (02, 03) stay letter-only, and each screen carries a small label saying which kind it is. The gate must test sound-to-letter, so no cue there.
- Wrong state: Sprig (flipped, on the right) points with a dotted arrow at the correct s tile; that tile gets an ink outline, a dashed ring and a speaker badge to replay its sound. The old floating example card is gone. "Try again" stays cream and now sits clear of the grid.
- Seed tap: instruction moved onto a wooden sign planted at the seed (speaker icon plus "Tap the seed"); letter tiles are now 78 px wooden blocks with 62 px letters.
- Home: stake letters grew to about 30 px; bubble "Tend n" is anchored to the plant that needs attention with a tail pointing at it, replacing the loose "3 plants are ready" line.
- First sprout: sunburst replaced by a low outlined sun, painted gold bands, two clouds, warm distant hills and tiny flowers in the same illustration style as the garden.
- Lesson-right: the water droplet is now clipped inside the plant-stage chip and removed from the static frame, so it cannot read as a stray bug.
- 12-node cap: S6 petals and sun-ray-style extras are decoration only; drop the 6 falling petals first if the budget is tight. S3 is unchanged at 9 animated nodes.

## Round 3 (craft pass after judge round 2)
- Ship blocker fixed: the CHECK / WRONG / TEACH annotations are gone from inside the phone frames; they now live in a caption strip under each phone in index.html.
- Graded screens 02 and 03: the prompt shows the spoken word as a picture (a sun on a warm card) beside the replay speaker. Tiles stay letter-only; the picture is the prompt, not a cue on the answer.
- 01: seed redrawn with a lit top-left edge, shaded right side, crease and speckles; it sits in soil with a cast shadow, crumb texture and soil covering its base. Sign post shortened so it no longer pokes the seed; the helper Sprig no longer touches a tile.
- 05: stake letters raised to about 34-42 px; the "Tend i" bubble sits above plant i in clear sky with 12+ px to every stake; back row re-spaced so Sprig and the dozing plant no longer collide.
- 04: the cloud was cropped at the top-left because a CSS animation overrode its transform; wrapped so it now sits where placed. The mound has a lit rim, shaded flank and crumbs. Petals kept off the frame edges.
- Light comes from the top-left on every object; outlines are 3 to 4 px throughout. I looked at all six screenshots before committing.
- Open: the Grandstander link needs network, so offline renders fall back to the system bold in headings.

## Round 4 (closing the three round-3 losses)
- 01: sky and hills repainted in the first-sprout style: brush-stroke bands, a low outlined sun with halo discs, two clouds, warm distant hills, small flowers. Letter tiles and the sign now share wood grain, nail heads and a lit top edge.
- 05: the stray "z" ghost is gone (the dozing plant shows folded, greyed leaves only). Stake rows sit on three fixed baselines (back, middle, front), the dozing plant is the same scale as its row, and the right edge is filled with a leafy bush and a short fence.
- 06: progress hook added under the sound: six leaf outlines, the first filled, with "1 of 6", so the card reads as one step in a loop.
- 03: the pointer is now a 3 px dashed line with a 3 px arrowhead, matching the tile and ring weight.
- I looked at 01, 03, 05 and 06 after the last render; 02 and 04 were not touched this round.

## Round 5
- 05: the dozing plant is now a sleeping plant on purpose: grey-green bud with a face and closed eyes, drooped leaves, a "zz" in a soft thought bubble beside it, and a single "Wake o" bubble whose tail points at it. It is drawn at 0.9 scale so the face reads. No ghost glyph remains.
- 06: no hearts and no streak number (ruling). The teaching card gets a small garden widget in its corner: a water drop that fills as sounds are learned (drawn at 1 of 6) above the lesson's seed in its mound, so the lesson visibly feeds the garden. The six-leaf meter and "1 of 6" stay. Card text shortened to "New sound" to keep 12 px clear of the widget.
- Looked at 05 and 06 after the final render.
