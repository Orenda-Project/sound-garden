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
