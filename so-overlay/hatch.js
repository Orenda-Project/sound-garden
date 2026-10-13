// OVERLAY (Sound Garden): the first-run hatch. A seed sits on the hill; a tap cracks it (squash, shake, three cracks that draw themselves, a flash), the shell
// pieces fly and bounce, and Sprig pops out and waves. Then the big Play button rises in. Everything is a spring (src/motion/engine.js); calm motion shows the
// hatched Sprig at once. Nothing is typed. The colour and the favourite sound are picked in the next steps (onboarding.js: meetLook, meetFav).
import { h, btn, scene } from './ui.js';
import { tilo } from './tilo.js';
import { mark, isFast } from './audio.js';
import { sfx } from './sfx.js';
import { createSprig } from '../../../src/sprig/sprig.js';
import { Sp, addActor, removeActor, springVal, popIn, clamp, rnd, NS, isCalm } from '../../../src/motion/engine.js';

const ZIG = [[8, 100], [26, 86], [40, 102], [56, 88], [70, 104], [84, 88], [98, 102], [114, 90]];
const BODY = 'M60 28 C92 30 106 66 101 94 C97 116 79 123 60 123 C41 123 23 116 19 94 C14 66 28 30 60 28Z';
const poly = (pts) => pts.map((p) => p.join(',')).join(' ');
const topPoly = poly([[-20, -20], [140, -20], [140, 92], ...ZIG.slice().reverse(), [-20, 100]]);
const botPoly = poly([[-20, 100], ...ZIG, [140, 92], [140, 200], [-20, 200]]);
const CRACKS = [
  [[60, 90], [55, 76], [63, 64], [56, 50], [60, 38]], [[92, 94], [88, 82], [96, 72], [91, 60]], [[28, 94], [32, 82], [24, 72], [29, 62]],
];

const art = () => `<svg viewBox="-30 -62 180 200" aria-hidden="true" focusable="false">
<defs><clipPath id="hT"><polygon points="${topPoly}"/></clipPath><clipPath id="hB"><polygon points="${botPoly}"/></clipPath>
<clipPath id="hL"><polygon points="-40,-40 46,-40 40,200 -40,200"/></clipPath><clipPath id="hM"><polygon points="46,-40 78,-40 82,200 40,200"/></clipPath><clipPath id="hR"><polygon points="78,-40 160,-40 160,200 82,200"/></clipPath>
<radialGradient id="hG" cx=".36" cy=".3" r=".9"><stop offset="0" stop-color="#E6B97A"/><stop offset="1" stop-color="#B87F3E"/></radialGradient>
<g id="hArt"><path d="${BODY}" fill="url(#hG)" stroke="#6B3F12" stroke-width="3.8" stroke-linejoin="round"/><path d="M32 54 C38 40 50 33 62 33 C50 38 42 46 38 60Z" fill="#F3D39C" opacity=".85"/><path d="M60 30 q-2 36 0 90" stroke="#8A5A1E" stroke-width="2" fill="none" opacity=".45"/><g fill="#6B3F12" opacity=".4"><circle cx="40" cy="70" r="2"/><circle cx="82" cy="60" r="1.8"/><circle cx="72" cy="104" r="2.2"/><circle cx="36" cy="106" r="1.8"/></g></g></defs>
<ellipse id="hSh" cx="60" cy="124" rx="40" ry="7" fill="#12330F" opacity=".22"/>
<g id="hRig"><g id="hIn"><g id="hPB"><g clip-path="url(#hB)"><use href="#hArt"/></g></g>
${['L', 'M', 'R'].map((k) => `<g id="hP${k}"><g clip-path="url(#hT)"><g clip-path="url(#h${k})"><use href="#hArt"/></g></g></g>`).join('')}
<g id="hCr" fill="none" stroke="#3A2200" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${CRACKS.map((c) => `<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" d="M${c.map((p) => p.join(' ')).join('L')}"/>`).join('')}</g></g></g>
<circle id="hFl" cx="60" cy="76" r="120" fill="#fff" opacity="0"/><g id="hFx"></g></svg>`;

export async function hatchSplash(app) {
  const hint = h('button', { class: 'hatch-hint', type: 'button' }, 'Tap the seed');
  const seed = h('button', { class: 'hatch-seed', type: 'button', 'aria-label': 'A seed. Tap it to wake it up.', html: art() });
  const spot = h('div', { class: 'hatch-sprig', 'aria-hidden': 'true' });
  const play = btn('Play', 'play', { class: 'btn tap splash-play big', 'data-say': 'ui:hello' });
  const sheet = h('div', { class: 'sheet' }, play); sheet.hidden = true;
  const s = h('div', { class: 'onboard splash scene-screen hatch' },
    h('div', { class: 'scene-area' }, scene({ h: 600 }), h('h1', { class: 'title scene-title' }, 'Sound Garden'),
      h('div', { class: 'scene-tilo hatch-stage' }, seed, spot), hint), sheet);
  tilo.setTrack(null); app.mount(s); mark('onboard', { step: 'splash' });
  const auto = isFast || new URLSearchParams(location.search).has('idlefast');
  const q = (id) => seed.querySelector('#' + id);
  const N = { rig: q('hRig'), inn: q('hIn'), sh: q('hSh'), pB: q('hPB'), pL: q('hPL'), pM: q('hPM'), pR: q('hPR'), cr: q('hCr'), fl: q('hFl'), fx: q('hFx') };
  const cracks = [...N.cr.children];
  const sp = { rot: new Sp(0, 95, 4.2), sy: new Sp(1, 220, 10), shake: new Sp(0, 80, 14), k1: new Sp(0, 120, 18), k2: new Sp(0, 120, 18), k3: new Sp(0, 120, 18), fl: new Sp(0, 140, 12), shellY: new Sp(0, 100, 13) };
  const st = { phase: 'egg', pieces: [], parts: [], nextWob: 1.4, rig: null };
  let sprig = null;

  const spawnStar = (x, y, o) => { if (isCalm()) return; const n = document.createElementNS(NS, 'path'); n.setAttribute('d', 'M0 -1 L.28 -.28 L1 0 L.28 .28 L0 1 L-.28 .28 L-1 0 L-.28 -.28Z'); n.setAttribute('fill', ['#FFC21A', '#fff', '#F78FB3', '#7FE0D6'][Math.floor(rnd(0, 4))]); N.fx.appendChild(n); st.parts.push({ n, x, y, age: 0, ...o }); };
  const actor = {
    get active() { return s.isConnected; },
    update(dt, h2, n, now) {
      if (st.phase === 'egg' && now > st.nextWob) { sp.rot.kick(Math.random() < 0.5 ? 150 : -150); sp.sy.x = 0.94; st.nextWob = now + rnd(1.8, 3); }
      for (let i = 0; i < n; i++) { for (const k in sp) sp[k].step(h2); sp.rot.t = 0; }
      const sh = sp.shake.x * Math.sin(now * 42), sy = sp.sy.x, sx = clamp(1 / Math.sqrt(sy), 0.8, 1.3);
      N.inn.setAttribute('transform', `translate(60 123) rotate(${(sh + sp.rot.x).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-60 -123)`);
      cracks.forEach((c, i) => c.setAttribute('stroke-dashoffset', (1 - clamp(sp['k' + (i + 1)].x, 0, 1)).toFixed(3)));
      N.fl.setAttribute('opacity', clamp(sp.fl.x, 0, 1).toFixed(2));
      if (st.phase === 'live') { const y = sp.shellY.x; N.pB.setAttribute('transform', `translate(0 ${(y * 34).toFixed(1)})`); N.pB.setAttribute('opacity', clamp(1 - y * 1.2, 0, 1).toFixed(2)); }
      for (const p of st.pieces) {
        if (p.rest) { p.rt = (p.rt || 0) + dt; if (p.rt > 1.2) { const o = Math.max(0, 1 - (p.rt - 1.2) * 1.4); p.el.setAttribute('opacity', o.toFixed(2)); if (o <= 0) p.el.style.display = 'none'; } continue; }
        p.vy += 1100 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt * 57;
        const gy = 70; if (p.y > gy && p.vy > 0) { if (p.b < 1) { p.vy *= -0.35; p.vx *= 0.5; p.vr *= 0.4; p.b++; p.y = gy; } else { p.y = gy; p.rest = true; } }
        p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.r.toFixed(1)} ${p.cx} ${p.cy})`);
      }
      for (let i = st.parts.length - 1; i >= 0; i--) {
        const p = st.parts[i]; p.age += dt; const u = p.age / p.life; if (u >= 1) { p.n.remove(); st.parts.splice(i, 1); continue; }
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.n.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(p.size * Math.sin(Math.PI * Math.min(1, u * 1.1))).toFixed(2)})`);
      }
    },
  };
  addActor(actor);
  const L = (fn, ms) => setTimeout(() => { if (s.isConnected) fn(); }, isCalm() ? Math.round(ms / 6) : ms);

  function pop() {
    st.phase = 'live'; sp.shake.t = 0; sp.shake.x = 0; sp.rot.x = 0; sp.rot.v = 0; sp.sy.x = 1; sp.sy.t = 1; sp.fl.x = 0.5; sp.fl.t = 0; sp.shellY.t = 1;
    N.cr.style.display = 'none';
    [['pL', 60, 70, -210, -330, -6], ['pM', 100, 56, 150, -430, 3], ['pR', 140, 70, 240, -300, 7]].forEach(([k, cx, cy, vx, vy, vr]) => st.pieces.push({ el: N[k], cx: cx - 40, cy, x: 0, y: 0, r: 0, vx: vx + rnd(-30, 30), vy, vr, rest: false, b: 0 }));
    for (let i = 0; i < 14; i++) spawnStar(60 + rnd(-40, 40), rnd(20, 90), { vx: rnd(-50, 50), vy: rnd(-130, -50), g: 90, life: rnd(0.8, 1.3), size: rnd(5, 10) });
    spot.style.opacity = 1; spot.classList.add('on');
    sprig = createSprig(spot, { stage: 1 }); sprig.setState('wake'); sfx.hello?.();
    L(() => sprig.setState('greet'), 700);
    L(() => { sheet.hidden = false; popIn(sheet, 0, 70, 0.96); popIn(play, 120, 40, 0.9); sprig.setState('idle'); }, 1500);
    hint.hidden = true; mark('onboard', { step: 'hatched' });
  }
  function crack() {
    if (st.phase !== 'egg') return; st.phase = 'hatching'; hint.hidden = true;
    if (isCalm()) { pop(); return; }
    sp.sy.t = 0.8;
    L(() => { sp.sy.t = 1.07; sp.shake.t = 5; sp.k1.t = 1; spawnStar(60, 40, { vx: 20, vy: -70, g: 60, size: 6, life: 0.7 }); }, 150);
    L(() => { sp.shake.t = 9; sp.k2.t = 1; sp.sy.t = 1.03; spawnStar(96, 70, { vx: 60, vy: -60, g: 60, size: 6, life: 0.7 }); }, 360);
    L(() => { sp.shake.t = 14; sp.k3.t = 1; sp.sy.t = 1; spawnStar(26, 70, { vx: -60, vy: -60, g: 60, size: 6, life: 0.7 }); sp.fl.t = 0.16; }, 570);
    L(pop, 740);
  }
  // a poke before the hatch: the seed rocks (and hatches)
  seed.addEventListener('pointerdown', () => { if (st.phase !== 'egg') return; sp.rot.kick(Math.random() < 0.5 ? 240 : -240); sp.sy.x = 0.88; crack(); });
  seed.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); crack(); } });
  hint.addEventListener('click', crack);
  if (isCalm() && !auto) { /* the child still taps once; calm only removes the movement */ }
  await new Promise((res) => {
    play.addEventListener('click', res, { once: true });
    if (auto) setTimeout(() => { crack(); setTimeout(res, 120); }, 150);
  });
  sprig?.destroy(); removeActor(actor);
}
