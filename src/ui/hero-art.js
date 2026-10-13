// Landing hero art: layered SVG (far hills, mid hills, near hills, front grass), sway-able flowers, drifting clouds, the sun.
// Every moving part is transform or opacity only (CSS keyframes in landing.css, driven by classes). Deterministic scatter, no filters.
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const PET = ['#FFC21A', '#F29B73', '#FFFDF6', '#F78FB3', '#6EC5FF', '#B06AD6', '#FFD84A'];

function flower(x, y, s, c, d, a) {
  const petals = Array.from({ length: 6 }, (_, i) => `<ellipse cx="0" cy="-9" rx="5.2" ry="8.6" transform="rotate(${i * 60})"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="sw" style="--d:${d}s;--a:${a}deg">
<path d="M0 0C-3-18 3-34 0-52" fill="none" stroke="#2F7D32" stroke-width="4" stroke-linecap="round"/>
<path d="M0-16C-14-20-22-14-24-6-12-4-4-8 0-16Z" fill="#5CC636" stroke="#2F7D32" stroke-width="2.4" stroke-linejoin="round"/>
<g transform="translate(0 -56)"><g fill="${c}" stroke="#7A4B16" stroke-width="2">${petals}</g><circle r="6.4" fill="#FFC21A" stroke="#B87800" stroke-width="2"/></g></g></g>`;
}
function tuft(x, y, s, col, d, a) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="sw" style="--d:${d}s;--a:${a}deg"><path d="M-10 0C-14-14-16-26-20-34M-4 0C-5-18-4-30-2-42M4 0C6-16 10-28 14-38M10 0C14-10 20-18 26-22" fill="none" stroke="${col}" stroke-width="4.4" stroke-linecap="round"/></g></g>`;
}
const hill = (pts, fill, hi) => `<path d="${pts}V900H0Z" fill="${fill}"/><path d="${pts}" transform="translate(0 12)" fill="none" stroke="${hi}" stroke-width="9" stroke-linecap="round" opacity=".28"/>`;
const treeBlob = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-6" width="8" height="26" rx="3" fill="#7A5230"/><ellipse cx="0" cy="-26" rx="26" ry="30" fill="${c}"/><ellipse cx="-8" cy="-34" rx="9" ry="12" fill="#fff" opacity=".18"/></g>`;

export function heroLayers() {
  const r = rnd(41), pick = (n) => Math.floor(r() * n);
  // far: pale blue-green hills and little round trees
  const far = `<svg class="ly ly-far" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
${hill('M0 600C180 540 300 520 480 560S800 600 1000 540 1300 500 1440 540', '#A8D77A', '#fff')}
${treeBlob(210, 548, 1, '#8CC768')}${treeBlob(272, 556, .7, '#7DBE5C')}${treeBlob(1180, 528, .9, '#8CC768')}${treeBlob(1240, 536, .62, '#7DBE5C')}${treeBlob(760, 584, .6, '#8CC768')}</svg>`;
  // mid: yellow-green hills with flowers
  let mf = '';
  for (let i = 0; i < 14; i++) mf += flower(60 + i * 100 + pick(40), 690 + (i % 3) * 22 + pick(10), .8 + r() * .3, PET[pick(PET.length)], -(r() * 4).toFixed(1), (2 + r() * 2).toFixed(1));
  const mid = `<svg class="ly ly-mid" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
${hill('M0 700C140 640 320 620 520 664S860 720 1060 660 1330 620 1440 650', '#8FCB3E', '#fff')}${mf}</svg>`;
  // near: strong green with big flowers and tufts
  let nf = '';
  for (let i = 0; i < 9; i++) nf += flower(40 + i * 170 + pick(60), 790 + (i % 2) * 24 + pick(14), 1.15 + r() * .5, PET[(i + 2) % PET.length], -(r() * 4).toFixed(1), (2.4 + r() * 2.4).toFixed(1));
  for (let i = 0; i < 10; i++) nf += tuft(30 + i * 150 + pick(70), 830 + pick(40), 1 + r() * .6, i % 2 ? '#2F7D32' : '#3E9A3F', -(r() * 4).toFixed(1), (3 + r() * 3).toFixed(1));
  const near = `<svg class="ly ly-near" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
${hill('M0 780C180 740 360 730 560 760S900 810 1120 760 1340 730 1440 750', '#4CB82B', '#C8F08A')}${nf}</svg>`;
  // front: big dark grass blades at the very bottom edge (moves fastest)
  let fg = '';
  for (let i = 0; i < 16; i++) fg += tuft(i * 96 + pick(50), 900, 2.1 + r() * 1.3, i % 3 ? '#1F5C24' : '#2F7D32', -(r() * 4).toFixed(1), (3.5 + r() * 3).toFixed(1));
  const front = `<svg class="ly ly-front" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${fg}</svg>`;
  return { far, mid, near, front };
}

export const cloudSvg = (w = 160) => `<svg viewBox="0 0 160 64" width="${w}" aria-hidden="true"><ellipse cx="80" cy="50" rx="76" ry="13" fill="#DCEFFB"/><path d="M10 48C0 28 24 16 40 26 46 4 82-2 94 20 116 8 142 24 132 48Z" fill="#fff"/></svg>`;

export function sunSvg() {
  let rays = '';
  for (let k = 0; k < 14; k++) { const t = (k / 14) * Math.PI * 2, r0 = 66, r1 = k % 2 ? 84 : 98; rays += `M${(100 + Math.cos(t) * r0).toFixed(1)} ${(100 + Math.sin(t) * r0).toFixed(1)}L${(100 + Math.cos(t) * r1).toFixed(1)} ${(100 + Math.sin(t) * r1).toFixed(1)}`; }
  return `<svg class="sun" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="98" fill="#FFE98F" opacity=".28"/><g class="rays"><path d="${rays}" stroke="#B87800" stroke-width="11" stroke-linecap="round" fill="none"/><path d="${rays}" stroke="#FFC21A" stroke-width="5" stroke-linecap="round" fill="none"/></g>
<circle cx="100" cy="100" r="50" fill="#FFC21A" stroke="#B87800" stroke-width="4"/><path d="M68 92A34 34 0 0 1 88 68" fill="none" stroke="#FFF1B3" stroke-width="8" stroke-linecap="round"/></svg>`;
}

export const butterfly = (c = '#F78FB3') => `<svg class="bf" viewBox="0 0 40 32" aria-hidden="true"><g class="wings"><path d="M20 16C12 2 2 4 3 13c1 8 10 8 17 3Z" fill="${c}" stroke="#7A3B52" stroke-width="2"/><path d="M20 16C28 2 38 4 37 13c-1 8-10 8-17 3Z" fill="${c}" stroke="#7A3B52" stroke-width="2"/></g><rect x="19" y="9" width="2.6" height="14" rx="1.3" fill="#3A2200"/></svg>`;

// a plant that grows with the scroll: --g (0..1) is set on the strip, --o staggers each plant. stage art mirrors Sprig's own plant.
export function sproutPlant(i, color) {
  return `<div class="sp" style="--o:${(i * 0.16).toFixed(2)};--c:${color}"><svg viewBox="0 0 100 190" aria-hidden="true">
<ellipse cx="50" cy="178" rx="30" ry="6" fill="#12330F" opacity=".2"/>
<path d="M18 180C22 164 40 158 50 158S78 164 82 180Z" fill="#7A5230" stroke="#4A2F14" stroke-width="3" stroke-linejoin="round"/>
<g class="seedg"><path d="M50 150C58 150 62 160 60 166 58 170 54 171 50 171 46 171 42 170 40 166 38 160 42 150 50 150Z" fill="#EFCB8A" stroke="#7A4B16" stroke-width="2.6"/></g>
<g class="stem"><path d="M50 164V70" stroke="#2F7D32" stroke-width="6" stroke-linecap="round" fill="none"/></g>
<g class="lfw"><g class="lf"><path d="M50 130C36 128 24 116 22 106 36 104 48 112 50 130Z" fill="#5CC636" stroke="#2F7D32" stroke-width="3" stroke-linejoin="round"/><path d="M50 112C64 110 76 100 78 90 64 88 52 96 50 112Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="3" stroke-linejoin="round"/></g></g>
<g class="hdw"><g transform="translate(50 62)"><g class="hd"><g fill="${color}" stroke="#7A4B16" stroke-width="2.6">${Array.from({ length: 8 }, (_, k) => `<ellipse cx="0" cy="-19" rx="10" ry="17" transform="rotate(${k * 45})"/>`).join('')}</g><circle r="11" fill="#FFC21A" stroke="#B87800" stroke-width="2.6"/></g></g></g></svg></div>`;
}
export const SPROUT_COLORS = ['#FFC21A', '#F78FB3', '#6EC5FF', '#F29B73', '#B06AD6', '#FFFDF6', '#FFD84A', '#7AD3C4'];
