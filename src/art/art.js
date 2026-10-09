// Living-garden art (direction A). Hand-shaped SVG strings, no filters, so cheap Androids stay smooth.
// Static unless a class in ui.css animates it with transform/opacity.
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Grass strokes: deterministic scatter inside y0..y1
function grass(seed, n, y0, y1, col) {
  const r = rnd(seed); let d = '';
  for (let i = 0; i < n; i++) { const x = r() * 390, y = y0 + r() * (y1 - y0), h = 6 + r() * 9, l = (r() - .5) * 5; d += `M${x | 0} ${y | 0}q${l.toFixed(1)} ${(-h / 2) | 0} ${(l * 2).toFixed(1)} ${-h | 0}`; }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`;
}
export const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="cloud"><ellipse cx="46" cy="30" rx="48" ry="13" fill="#DCEFFB"/><path d="M8 28C4 14 22 8 32 14 36 0 62-2 68 12 82 6 96 16 90 28Z" fill="#fff"/></g></g>`;
const sun = (cx, cy, r) => { let rays = ''; for (let k = 0; k < 12; k++) { const t = (k / 12) * Math.PI * 2 + (k % 2 ? .05 : -.03), r0 = r * 1.28, r1 = r * (k % 2 ? 1.52 : 1.7), x0 = cx + Math.cos(t) * r0, y0 = cy + Math.sin(t) * r0, x1 = cx + Math.cos(t) * r1, y1 = cy + Math.sin(t) * r1; rays += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`; }
  return `<circle cx="${cx}" cy="${cy}" r="${r * 2.5}" fill="#FFE98F" opacity=".25"/><circle cx="${cx}" cy="${cy}" r="${r * 1.8}" fill="#FFE98F" opacity=".4"/><path d="${rays}" stroke="#B87800" stroke-width="${Math.max(9, r * .2)}" stroke-linecap="round" fill="none"/><path d="${rays}" stroke="#FFC21A" stroke-width="${Math.max(3.4, r * .07)}" stroke-linecap="round" fill="none"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFC21A" stroke="#B87800" stroke-width="3"/><path d="M${cx - r * .62} ${cy - r * .2}A${r * .66} ${r * .66} 0 0 1 ${cx - r * .2} ${cy - r * .62}" fill="none" stroke="#FFF1B3" stroke-width="6" stroke-linecap="round"/><path d="M${cx + r * .1} ${cy + r * .72}A${r * .74} ${r * .74} 0 0 0 ${cx + r * .62} ${cy + r * .3}" fill="none" stroke="#E8A000" stroke-width="5" stroke-linecap="round" opacity=".7"/>`; };
const flower = (x, y, c) => `<path d="M${x} ${y}v14" stroke="#2F7D32" stroke-width="2.4"/><g transform="translate(${x} ${y})"><circle r="5.5" fill="${c}" stroke="#7A4B16" stroke-width="1.2"/><circle r="2.4" fill="#FFC21A"/></g>`;

// kind: 'day' (S1, S3) or 'gold' (S6). hill = y of the far hill's crest.
export function scene(kind = 'day', { hill = 400, sunAt = [270, 256, 50], clouds = true, flowers = true } = {}) {
  const gold = kind === 'gold';
  const bg = gold ? '#FFC21A' : '#2FA8F2', band = gold ? '#FFE07A' : '#fff';
  const h = (dy) => hill + dy;
  const hills = gold
    ? [['#C9D24A', 0], ['#8FCB3E', 40], ['#4CB82B', 90]] : [['#B9D45A', 0], ['#8FCB3E', 40], ['#4CB82B', 90]];
  const paths = hills.map(([c, dy], i) => { const crest = `M-20 ${h(dy)}C${60 + i * 20} ${h(dy) - 42} ${140 + i * 30} ${h(dy) - 28} 200 ${h(dy) - 8}C${270 - i * 20} ${h(dy) + 14} ${330 - i * 10} ${h(dy) - 34} 410 ${h(dy) - 42}`;
    return `<path d="${crest}V860H-20Z" fill="${c}"/><path d="${crest}" transform="translate(0 10)" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".22"/><path d="${crest}" transform="translate(0 24)" fill="none" stroke="#12330F" stroke-width="12" opacity=".07"/>`; }).join('');
  const fl = flowers ? [[28, h(60), '#fff'], [78, h(48), '#F4A261'], [338, h(40), '#6EC5FF'], [364, h(68), '#fff'], [118, h(78), '#fff']].map(([x, y, c]) => flower(x, y, c)).join('') : '';
  return `<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="390" height="844" fill="${bg}"/>`
    + [110, 200, 290, 370].map((y, i) => `<path d="M0 ${y}Q100 ${y - 16} 200 ${y + 6}T390 ${y - 8}V${y + 110}H0Z" fill="${band}" opacity="${[.16, .18, .22, .26][i]}"/>`).join('')
    + (gold ? '' : '<path d="M20 160q60-10 120 0M230 230q70-12 140 0M10 300q80-10 150 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>')
    + sun(...sunAt) + (clouds ? cloud(24, 200) + (gold ? cloud(250, 168, .8) : '') : '')
    + paths + grass(7, 70, h(30), 800, '#2F7D32') + grass(11, 46, h(40), 800, '#C8F08A') + fl + '</svg>';
}

// Soil mound with a seed (S1 hero, chips, S3 plots)
export const mound = (w = 1) => `<g transform="scale(${w})"><ellipse cx="0" cy="6" rx="58" ry="11" fill="#12330F" opacity=".2"/><path d="M-62 4C-48-26 -20-34 0-34S48-26 62 4Z" fill="#7A5230" stroke="#4A2F14" stroke-width="3.4" stroke-linejoin="round"/><path d="M24-30C48-24 60-8 62 4H18C32-8 34-22 24-30Z" fill="#4A2F14" opacity=".32"/><path d="M-44-12C-30-26-10-30 8-28" fill="none" stroke="#B88A4A" stroke-width="4" stroke-linecap="round"/><g fill="#4A2F14" opacity=".55"><ellipse cx="-30" cy="-4" rx="3" ry="1.8"/><ellipse cx="22" cy="-8" rx="3" ry="1.8"/><ellipse cx="40" cy="-1" rx="2.4" ry="1.5"/></g></g>`;
export const seedShape = `<path d="M0-52C22-50 30-24 27-6 25 8 13 12 0 12-13 12-25 8-27-6-30-24-22-50 0-52Z" fill="#EFCB8A" stroke="#7A4B16" stroke-width="3.6" stroke-linejoin="round"/><path d="M-14-34C-10-44-4-48 4-48-4-44-9-38-11-30Z" fill="#FBE8BB"/><path d="M12-8C8 2-2 6-12 6 0 8 10 4 14-6Z" fill="#D5A25A" opacity=".8"/><path d="M0-48q-2 18 0 56" stroke="#B07A3A" stroke-width="2" fill="none" opacity=".6"/>`;

export const speaker = (s = 34) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><path d="M5.5 12.5h5l8.5-6.5v20l-8.5-6.5h-5A1.5 1.5 0 0 1 4 18v-4.5a1.5 1.5 0 0 1 1.5-1Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M23.5 11.5q3.5 4.5 0 9M27 8q6 8 0 16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>`;
export const logoMark = (s = 34) => `<svg width="${s}" height="${s}" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="#fff" opacity=".55"/><path d="M17 28V16" stroke="#2F7D32" stroke-width="3.4" stroke-linecap="round"/><path d="M17 17C9 17 7 11 7 8c6 0 10 2 10 9Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="2.2" stroke-linejoin="round"/><path d="M17 15c0-5 3-8 9-8 0 5-3 8-9 8Z" fill="#5CC636" stroke="#2F7D32" stroke-width="2.2" stroke-linejoin="round"/></svg>`;

// Picture cues (54x54). Only words that have one are drawn; the check uses them as the PROMPT, never on an answer tile.
const P = {
  sun: '<g fill="#FFC21A" stroke="#B87800" stroke-width="3" stroke-linejoin="round"><path d="M27 3l-3.4 7h6.8Z"/><path d="M27 51l-3.4-7h6.8Z"/><path d="M3 27l7-3.4v6.8Z"/><path d="M51 27l-7-3.4v6.8Z"/><path d="M10 10l7.6 2.6-5 5Z"/><path d="M44 10l-2.6 7.6-5-5Z"/><path d="M10 44l2.6-7.6 5 5Z"/><path d="M44 44l-7.6-2.6 5-5Z"/></g><circle cx="27" cy="27" r="12" fill="#FFC21A" stroke="#B87800" stroke-width="3"/><path d="M20 25a8 8 0 0 1 5-6" fill="none" stroke="#FFF1B3" stroke-width="3" stroke-linecap="round"/>',
  moon: '<path d="M36 8A20 20 0 1 0 46 36 16 16 0 0 1 36 8Z" fill="#FFE18A" stroke="#B87800" stroke-width="3" stroke-linejoin="round"/><path d="M13 22a14 14 0 0 1 7-9" fill="none" stroke="#FFF6CC" stroke-width="3" stroke-linecap="round"/>',
  apple: '<path d="M27 15C18 10 8 16 9 29c1 12 9 21 18 18 9 3 17-6 18-18 1-13-9-19-18-14Z" fill="#E4572E" stroke="#8C2A12" stroke-width="3" stroke-linejoin="round"/><path d="M27 15q0-7 5-9" fill="none" stroke="#5A3810" stroke-width="3" stroke-linecap="round"/><path d="M29 10c5-4 11-2 12 1-4 3-9 3-12-1Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="3" stroke-linejoin="round"/><path d="M14 27a9 9 0 0 1 4-8" fill="none" stroke="#FF9A78" stroke-width="3" stroke-linecap="round"/>',
  tent: '<path d="M27 6L5 46h44Z" fill="#E9B872" stroke="#8A5A1E" stroke-width="3" stroke-linejoin="round"/><path d="M27 6l-9 40h18Z" fill="#B9793B" stroke="#8A5A1E" stroke-width="3" stroke-linejoin="round"/><path d="M21 22l-9 18" fill="none" stroke="#F8DDAA" stroke-width="3" stroke-linecap="round"/>',
  pig: '<ellipse cx="27" cy="30" rx="19" ry="16" fill="#F7B5B5" stroke="#A64B4B" stroke-width="3"/><path d="M12 18L9 8l11 5ZM42 18l3-10-11 5Z" fill="#F29B9B" stroke="#A64B4B" stroke-width="3" stroke-linejoin="round"/><ellipse cx="27" cy="34" rx="8" ry="6" fill="#F29B9B" stroke="#A64B4B" stroke-width="3"/><circle cx="24" cy="34" r="1.6" fill="#7A2E2E"/><circle cx="30" cy="34" r="1.6" fill="#7A2E2E"/><circle cx="19" cy="25" r="2.4" fill="#2A1A0A"/><circle cx="35" cy="25" r="2.4" fill="#2A1A0A"/><path d="M13 27a11 11 0 0 1 4-8" fill="none" stroke="#FFE0E0" stroke-width="3" stroke-linecap="round"/>',
  dog: '<ellipse cx="27" cy="30" rx="16" ry="15" fill="#D9A25E" stroke="#7A4B16" stroke-width="3"/><path d="M13 16C6 18 5 32 10 38 14 32 14 24 16 18ZM41 16c7 2 8 16 3 22-4-6-4-14-6-20Z" fill="#8A5A1E" stroke="#5A3810" stroke-width="3" stroke-linejoin="round"/><ellipse cx="27" cy="36" rx="7" ry="5" fill="#F3D9A8" stroke="#7A4B16" stroke-width="3"/><ellipse cx="27" cy="34" rx="3" ry="2.2" fill="#2A1A0A"/><circle cx="21" cy="26" r="2.4" fill="#2A1A0A"/><circle cx="33" cy="26" r="2.4" fill="#2A1A0A"/><path d="M17 24a10 10 0 0 1 4-6" fill="none" stroke="#F3D9A8" stroke-width="3" stroke-linecap="round"/>',
  top: '<path d="M27 6v8M17 14h20" stroke="#8A5A1E" stroke-width="3" stroke-linecap="round"/><path d="M12 22C12 14 42 14 42 22 42 34 33 42 27 49 21 42 12 34 12 22Z" fill="#4FA3E8" stroke="#1F6FB2" stroke-width="3" stroke-linejoin="round"/><path d="M14 25h26" stroke="#FFC21A" stroke-width="3"/><path d="M17 20a9 9 0 0 1 5-3" fill="none" stroke="#B5DCFF" stroke-width="3" stroke-linecap="round"/>',
  mat: '<path d="M6 22L44 20 49 38 10 42Z" fill="#E9B872" stroke="#8A5A1E" stroke-width="3" stroke-linejoin="round"/><path d="M16 28L41 27M17 34L43 32" stroke="#B9793B" stroke-width="3" stroke-linecap="round"/><path d="M10 26l1-1" stroke="#F8DDAA" stroke-width="3" stroke-linecap="round"/>',
  sound: '<path d="M32 7C22 7 16 14 17 24c0 6 4 8 4 13 0 7 6 11 12 9 5-2 3-6 7-9 6-5 8-13 4-21-3-6-7-9-12-9Z" fill="#F7C9A0" stroke="#A8643A" stroke-width="3" stroke-linejoin="round"/><path d="M28 21c0-6 9-6 9 1 0 6-6 6-7 12" fill="none" stroke="#A8643A" stroke-width="3" stroke-linecap="round"/><path d="M22 18a8 8 0 0 1 5-7" fill="none" stroke="#FFE3C8" stroke-width="3" stroke-linecap="round"/><path d="M10 20q-3 7 0 14M4 15q-7 12 0 24" fill="none" stroke="#2A74B8" stroke-width="3" stroke-linecap="round"/>',
};
export const hasPicture = (w) => w in P;
export const picture = (w, s = 54) => `<svg width="${s}" height="${s}" viewBox="0 0 54 54" aria-hidden="true">${P[w] || P.sound}</svg>`;

// ---- plants (S3). Symbols defined once; colour comes in through --pc ----
const LV = (a, s = 1, c = '#4CB82B') => `<g transform="rotate(${a}) scale(${s})"><path d="M0 0C10-22 36-28 48-16 42 2 16 8 0 0Z" fill="${c}" stroke="#2F7D32" stroke-width="3" stroke-linejoin="round"/></g>`;
const HEAD = (n, r, k) => `<g fill="var(--pc,#FFC21A)" stroke="#7A4B16" stroke-width="2">${Array.from({ length: n }, (_, i) => `<ellipse cx="0" cy="${-r}" rx="${r * .62}" ry="${r}" transform="rotate(${(360 / n) * i})"/>`).join('')}</g><circle r="${k}" fill="#FFC21A" stroke="#B87800" stroke-width="2"/>`;
export const defs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="pl1" overflow="visible" viewBox="-40 -80 80 80"><path d="M-14 0C-10-12 10-12 14 0Z" fill="#8A5A1E"/><path d="M0-8q-1-5 0-9" stroke="#2F7D32" stroke-width="3" stroke-linecap="round" fill="none"/></symbol>
<symbol id="pl2" overflow="visible" viewBox="-40 -80 80 80"><path d="M0 0V-26" stroke="#2F7D32" stroke-width="4.4" stroke-linecap="round"/><g transform="translate(0 -24)">${LV(-150, .62)}${LV(-30, .68, '#5CC636')}</g></symbol>
<symbol id="pl3" overflow="visible" viewBox="-40 -80 80 80"><path d="M0 0V-44" stroke="#2F7D32" stroke-width="4.6" stroke-linecap="round"/><g transform="translate(0 -14)">${LV(-155, .6)}${LV(-25, .6, '#5CC636')}</g><g transform="translate(0 -52)">${HEAD(7, 12, 6)}</g></symbol>
<symbol id="pl4" overflow="visible" viewBox="-40 -80 80 80"><path d="M0 0V-52" stroke="#2F7D32" stroke-width="5" stroke-linecap="round"/><g transform="translate(0 -14)">${LV(-155, .72)}${LV(-25, .72, '#5CC636')}</g><g transform="translate(0 -62)">${HEAD(9, 15, 7.5)}</g></symbol>
<symbol id="plz" overflow="visible" viewBox="-40 -80 80 80"><path d="M0 0V-26C0-34 8-40 12-38" stroke="#6E8F62" stroke-width="4.4" stroke-linecap="round" fill="none"/><g transform="translate(-2 -10)"><path d="M0 0C-4 12-24 14-34 8 -26-2-10-6 0 0Z" fill="#8BA67E" stroke="#5E7B52" stroke-width="3"/></g><g transform="translate(2 -10)"><path d="M0 0C4 12 24 14 34 8 26-2 10-6 0 0Z" fill="#8BA67E" stroke="#5E7B52" stroke-width="3"/></g><g transform="translate(12 -44)"><ellipse rx="10" ry="12" fill="#A9BF9B" stroke="#5E7B52" stroke-width="3"/><path d="M-6-2q3 3 6 0M2-2q3 3 6 0" stroke="#33422D" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-3 5q3 2 6 0" stroke="#33422D" stroke-width="1.8" fill="none" stroke-linecap="round"/></g></symbol>
<symbol id="spk" viewBox="0 0 32 32"><path d="M5.5 12.5h5l8.5-6.5v20l-8.5-6.5h-5A1.5 1.5 0 0 1 4 18v-4.5a1.5 1.5 0 0 1 1.5-1Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M23.5 11.5q3.5 4.5 0 9M27 8q6 8 0 16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></symbol>
</defs></svg>`;
export const PLANT_COLORS = ['#FFC21A', '#4FA3E8', '#FFFDF6', '#F29B73', '#B06AD6', '#E4572E', '#FFD84A', '#7AD3C4', '#F78FB3', '#9BE06E', '#C98CF0', '#F4A261'];
// One plant: wood box with stake letter, soil lip, stage symbol. stage 1-4, or 'zz' (dozing). label '' = sound icon.
export function plant({ x, y, s = 1, stage = 1, label = '', color, id, glow = false, ring = false, hit = true }) {
  const t = label ? `<text x="0" y="31" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="${label.length > 1 ? 24 : 32}" fill="#12330F">${label}</text>` : '<g color="#12330F" transform="translate(-13 6)"><use href="#spk" width="26" height="26"/></g>';
  return `<g class="pl${glow ? ' glow' : ''}" data-plant="${id}" data-stage="${stage}" ${hit ? 'tabindex="0" role="button"' : ''} aria-label="${label || 'First sound'} plant, ${stage === 'zz' ? 'resting' : 'stage ' + stage}" style="--pc:${color || PLANT_COLORS[0]}" transform="translate(${x} ${y}) scale(${s})">
<g class="pi"><ellipse cx="0" cy="48" rx="34" ry="6" fill="#12330F" opacity=".2"/>${glow || ring ? `<ellipse class="gl" cx="0" cy="-8" rx="50" ry="62" fill="#FFE98F" opacity="${ring ? .5 : 0}"/>` : ''}
<use href="#pl${stage === 'zz' ? 'z' : stage}" x="-40" y="-80" width="80" height="80"/>
<path d="M-23 0H23L19 8H-19Z" fill="#A5632A" stroke="#6B3C14" stroke-width="3" stroke-linejoin="round"/>
<rect x="-19" y="8" width="38" height="38" rx="5" fill="#E9B872" stroke="#8A5A1E" stroke-width="3"/>${t}</g></g>`;
}
