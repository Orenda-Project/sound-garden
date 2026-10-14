// Sound Garden's scenery for the engine's scene() calls (ui.js is patched to delegate here): Sound Garden's own sky, sun, clouds, painted hills and flowers
// (src/art/art.js). 'day' = Track A, 'sky' = the page colour fade-out, 'cool' = the calm Track B header (same hills, softer colour).
import { scene as sgScene } from '../../../src/art/art.js';

export function gardenScene({ h = 560, kind = 'day', sun = true } = {}) {
  const el = document.createElement('div'); el.className = `scene scene-${kind}`; el.setAttribute('aria-hidden', 'true');
  const hill = Math.max(200, h - 250);
  let svg = sgScene('day', { hill, sunAt: [322, Math.round(h * 0.3), 34], clouds: kind !== 'cool', flowers: kind === 'day' });
  svg = svg.replace('viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"', `viewBox="0 0 390 ${h}" preserveAspectRatio="xMidYMax slice"`);
  if (!sun) svg = svg.replace(/<circle cx="322"[^>]*\/>/g, '');
  el.innerHTML = svg;
  return el;
}
