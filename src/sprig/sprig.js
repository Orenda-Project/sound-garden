// Sprig, the seed friend: a spring-driven mascot. Every part (squash, tilt, leaves, eyes, mouth, shadow, thought bubble) is a spring, nothing is a canned clip.
//   idle: breathing, random blinks, eye glances, plant sway     pointer: eyes follow while dragging, a poke squashes and tilts it and sends hearts
//   moods: idle happy cheer sleepy thinking oops listening speaking surprise      one-shots: hop (with a shadow that answers it), wave, stars, hearts, petals, puffs, drops, zzz
// API (the same names Sound Out's mascot code already calls): createSprig(el,{stage,identityColor}) -> {setState, setStage, lookAt, setCalm, destroy}
import { Sp, addActor, removeActor, clamp, rnd, NS, isCalm } from '../motion/engine.js';

export const STAGES = ['seed', 'sprout', 'leafy', 'budding', 'bloom'];
const STAGE_SCALE = [0, 0.55, 0.85, 1, 1];
const f2 = (v) => v.toFixed(2);

// mood targets: eh = happy eyes, sl = sleepy lids, mw/mc/mo = mouth half width / curve / openness, lL lR = leaf angles, tilt, th = thought bubble, br = brow angle (0 none)
const MOODS = {
  idle: { eh: 0, sl: 0, mw: 9, mc: 8, mo: 0, lL: 0, lR: 0, tilt: 0, th: 0, br: 0, wide: 0 },
  happy: { eh: 1, sl: 0, mw: 13, mc: 11, mo: 0.9, lL: 22, lR: -22, tilt: 0, th: 0, br: 0, wide: 0 },
  cheer: { eh: 1, sl: 0, mw: 15, mc: 12, mo: 1, lL: 36, lR: -36, tilt: 0, th: 0, br: 0, wide: 0 },
  sleepy: { eh: 0, sl: 1, mw: 4, mc: 0, mo: 0.35, lL: -22, lR: 22, tilt: -6, th: 0, br: 0, wide: 0 },
  thinking: { eh: 0, sl: 0, mw: 6, mc: -1, mo: 0, lL: 0, lR: -36, tilt: 5, th: 1, br: 0.6, wide: 0 },
  oops: { eh: 0, sl: 0.18, mw: 7, mc: -3, mo: 0, lL: -18, lR: 18, tilt: 6, th: 0, br: 1, wide: 0 },
  listening: { eh: 0, sl: 0, mw: 8, mc: 6, mo: 0, lL: 16, lR: -16, tilt: 6, th: 0, br: 0, wide: 1 },
  speaking: { eh: 0, sl: 0, mw: 10, mc: 7, mo: 0.4, lL: 4, lR: -4, tilt: 0, th: 0, br: 0, wide: 0 },
  surprise: { eh: 0, sl: 0, mw: 7, mc: 6, mo: 0.9, lL: 28, lR: -28, tilt: 0, th: 0, br: -0.6, wide: 1 },
};

// Sound Out's pose names -> a mood, how long it lasts (ms, 0 = stays), and what happens when it starts. c = the rig.
const STATES = {
  'idle': { m: 'idle', base: 1 }, 'idle-lesson': { m: 'idle', base: 1 }, 'look-at': { m: 'idle', base: 1 }, 'stuck-wait': { m: 'idle', base: 1 },
  'wake': { m: 'idle', base: 1, go: (c) => c.emerge() },
  'greet': { m: 'happy', ms: 1500, go: (c, d) => { c.wave(d); c.later(() => c.hop(260), 120); c.hearts(1); } },
  'listening': { m: 'listening', base: 1 },
  'thinking': { m: 'thinking', base: 1 },
  'speaking': { m: 'speaking', base: 1 },
  'pointing': { m: 'idle', ms: 1000, go: (c, d) => c.point(d, 1000) },
  'tap-react': { m: 'happy', ms: 900, go: (c) => c.poke() },
  'correct-small': { m: 'happy', ms: 800, go: (c) => { c.hop(300); c.burst(4); } },
  'correct-streak': { m: 'cheer', ms: 1100, go: (c) => { c.hop(380); c.burst(9); } },
  'celebrate': { m: 'cheer', base: 1, go: (c) => c.party(Infinity) },
  'cheer': { m: 'cheer', ms: 1900, go: (c) => c.party(1700) },
  'level-up': { m: 'cheer', ms: 2400, go: (c, d, o) => { c.hop(560); c.burst(16); c.petals(10); if (o.toStage != null) c.later(() => c.setStage(o.toStage, true), 420); c.party(2000); } },
  'wrong-soft': { m: 'oops', ms: 1000, go: (c) => c.droop() },
  'oops-soft': { m: 'oops', ms: 1000, go: (c) => c.droop() },
  'try-again': { m: 'oops', ms: 1000, go: (c) => c.droop() },
  'error-offline': { m: 'oops', ms: 1400, go: (c) => c.droop() },
  'encourage': { m: 'happy', ms: 1500, go: (c) => { c.hearts(2); c.burst(3); } },
  'hint': { m: 'thinking', ms: 1100, go: (c) => c.burst(2) },
  'sleepy-return': { m: 'sleepy', ms: 1400, go: (c) => c.later(() => { c.emerge(); }, 1300) },
  'sleep': { m: 'sleepy', base: 1 }, 'sleepy': { m: 'sleepy', base: 1 },
  'water': { m: 'happy', ms: 1800, go: (c) => c.rain(1600) },
  'surprise': { m: 'surprise', ms: 800, go: (c) => c.hop(240) },
  'proud': { m: 'happy', ms: 1800, go: (c) => { c.burst(6); c.hearts(2); } },
  'goodbye': { m: 'sleepy', base: 1, go: (c, d) => c.wave(d) },
};
export const STATE_NAMES = Object.keys(STATES);
export const MOOD_NAMES = Object.keys(MOODS);
export const STATE_TABLE = STATES;

const eyeW = (cx) => `<ellipse cx="${cx}" cy="73" rx="17" ry="20" fill="#FFFDF6" stroke="#2A1A0A" stroke-width="3"/>`;
const eyeP = (cx) => `<g class="sp-pu" data-cx="${cx}"><ellipse cx="${cx - 2}" cy="76" rx="10.5" ry="13" fill="#1E1408"/><circle cx="${cx - 6}" cy="70" r="4.2" fill="#fff"/><circle cx="${cx + 2}" cy="82" r="2" fill="#fff"/></g>`;
const LEAF = '<path class="lf1" d="M0 0 C-8 -22 -34 -26 -46 -14 C-40 4 -16 8 0 0Z" stroke="#2F7D32" stroke-width="3.4" stroke-linejoin="round"/>';
const LEAFR = '<path class="lf2" d="M0 0 C10 -26 36 -32 50 -20 C44 0 18 8 0 0Z" stroke="#2F7D32" stroke-width="3.4" stroke-linejoin="round"/>';
const svgMarkup = () => `<svg viewBox="-30 -62 180 200" aria-hidden="true" focusable="false">
<ellipse class="sp-sh" cx="60" cy="124" rx="44" ry="7" fill="#12330F" opacity=".22"/>
<g class="sp-rig"><g class="sp-body">
<path d="M60 28 C92 30 106 66 101 94 C97 116 79 123 60 123 C41 123 23 116 19 94 C14 66 28 30 60 28Z" fill="#EFCB8A" stroke="#7A4B16" stroke-width="3.8" stroke-linejoin="round"/>
<path d="M30 100 C34 114 48 120 62 120 C80 120 94 112 98 96 C88 108 70 112 54 108 C42 105 34 103 30 100Z" fill="#D5A25A" opacity=".75"/>
<path d="M32 54 C38 40 50 33 62 33 C50 38 42 46 38 60Z" fill="#FBE8BB" opacity=".9"/>
<g class="sp-face"><ellipse class="sp-chL" cx="29" cy="92" rx="8" ry="5.5" fill="#F29B73" opacity=".6"/><ellipse class="sp-chR" cx="91" cy="92" rx="8" ry="5.5" fill="#F29B73" opacity=".6"/>
${eyeW(43)}${eyeW(77)}${eyeP(43)}${eyeP(77)}
<ellipse class="sp-lidL" cx="43" cy="73" rx="19.8" ry="22.8" fill="#EFCB8A"/><ellipse class="sp-lidR" cx="77" cy="73" rx="19.8" ry="22.8" fill="#EFCB8A"/>
<path class="sp-arcL" d="M28 78 Q43 58 58 78" fill="none" stroke="#2A1A0A" stroke-width="4.6" stroke-linecap="round" opacity="0"/><path class="sp-arcR" d="M62 78 Q77 58 92 78" fill="none" stroke="#2A1A0A" stroke-width="4.6" stroke-linecap="round" opacity="0"/>
<path class="sp-brL" d="M30 50 L54 47" stroke="#7A4B16" stroke-width="4" stroke-linecap="round" opacity="0"/><path class="sp-brR" d="M66 47 L90 50" stroke="#7A4B16" stroke-width="4" stroke-linecap="round" opacity="0"/>
<path class="sp-mo" d="" fill="#7A2E1B" stroke="#2A1A0A" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/></g>
<g class="sp-plant"><g class="x0"><path d="M60 30 q-1 -7 5 -10" fill="none" stroke="#2F7D32" stroke-width="4" stroke-linecap="round"/></g>
<g class="lv" data-s><path d="M60 34 C60 22 60 16 60 8" fill="none" stroke="#2F7D32" stroke-width="5" stroke-linecap="round"/>
<g class="x2"><g transform="translate(60 26) rotate(-38) scale(.55)"><path class="lf2" d="M0 0 C-8 -22 -34 -26 -46 -14 C-40 4 -16 8 0 0Z" stroke="#2F7D32" stroke-width="3.4"/></g><g transform="translate(60 26) rotate(38) scale(.55)"><path class="lf1" d="M0 0 C10 -26 36 -32 50 -20 C44 0 18 8 0 0Z" stroke="#2F7D32" stroke-width="3.4"/></g></g>
<g class="x3"><ellipse cx="60" cy="-2" rx="7" ry="11" fill="#F29B73" stroke="#A84A07" stroke-width="3"/></g>
<g class="x4"><g fill="#FFD84A" stroke="#B87800" stroke-width="2.6"><circle cx="60" cy="-12" r="8"/><circle cx="70" cy="-4" r="8"/><circle cx="66" cy="8" r="8"/><circle cx="54" cy="8" r="8"/><circle cx="50" cy="-4" r="8"/></g><circle cx="60" cy="-1" r="6" fill="#F29B73" stroke="#A84A07" stroke-width="2.4"/></g>
<g transform="translate(60 12)"><g class="sp-lL">${LEAF}</g><g class="sp-lR">${LEAFR}</g></g></g></g>
</g>
<g class="sp-th" opacity="0"><circle cx="106" cy="40" r="3" fill="#fff" stroke="#8A8372" stroke-width="1.4"/><circle cx="113" cy="28" r="4.4" fill="#fff" stroke="#8A8372" stroke-width="1.4"/><ellipse cx="126" cy="8" rx="21" ry="15" fill="#fff" stroke="#8A8372" stroke-width="1.6"/><circle class="sp-t1" cx="116" cy="8" r="3" fill="#5B574E"/><circle class="sp-t2" cx="126" cy="8" r="3" fill="#5B574E"/><circle class="sp-t3" cx="136" cy="8" r="3" fill="#5B574E"/></g>
</g><g class="sp-fx"></g></svg>`;

export function createSprig(el, { stage = 1, identityColor } = {}) {
  el.classList.add('sprig'); el.innerHTML = svgMarkup();
  if (identityColor) el.style.setProperty('--sp-leaf', identityColor);
  const q = (n) => el.querySelector('.sp-' + n);
  const N = {};
  ['sh', 'rig', 'body', 'face', 'chL', 'chR', 'lidL', 'lidR', 'arcL', 'arcR', 'brL', 'brR', 'mo', 'plant', 'lL', 'lR', 'th', 't1', 't2', 't3', 'fx'].forEach((k) => { N[k] = q(k); });
  const pus = el.querySelectorAll('.sp-pu'), lv = el.querySelector('.lv');
  const S = (x, k, d) => new Sp(x, k, d);
  const sp = { sy: S(1, 230, 11), tilt: S(0, 130, 9), lx: S(0, 170, 16), ly: S(0, 170, 16), blink: S(0, 700, 50), eh: S(0, 300, 28), sl: S(0, 200, 24), wide: S(0, 260, 20),
    mw: S(9, 200, 18), mc: S(8, 180, 15), mo: S(0, 230, 19), lL: S(0, 180, 10), lR: S(0, 180, 10), cheek: S(1, 220, 12), th: S(0, 160, 16), pop: S(1, 190, 11), br: S(0, 240, 18), stg: S(STAGE_SCALE[clamp(stage, 0, 4)] || 1, 150, 9) };
  const c = { mood: 'idle', base: 'idle', tok: 0, timers: [], hy: 0, hv: 0, sq: 0, breath: 0, follow: false, pokes: 0, nextBlink: 1.2, nextGlance: 2, nextFun: 5, nextWig: 2, accZ: 0, accP: 0, parts: [], active: false, dead: false, visible: true, curStage: 0, state: 'idle', talk: 0, waving: null, pointing: null, partyEnd: 0, rainEnd: 0, nextHop: 0, ft: 0, dir: 1, tkn: 0 };
  c.curStage = clamp(stage | 0, 0, 4); el.dataset.stage = c.curStage;
  const put = (node, attr, val) => { const key = '_' + attr; if (node[key] !== val) { node[key] = val; node.setAttribute(attr, val); } };

  // ---- the rig methods (called by state handlers) ----
  c.later = (fn, ms) => { const t = c.tok; const id = setTimeout(() => { if (t === c.tok && !c.dead) fn(); }, isCalm() ? Math.min(ms, 60) : ms); c.timers.push(id); };
  c.setMood = (m, base) => {
    c.tok++; c.timers.forEach(clearTimeout); c.timers = []; c.mood = m; if (base) c.base = m;
    if (m !== 'sleepy') for (let i = c.parts.length - 1; i >= 0; i--) if (c.parts[i].type === 'zzz') { c.parts[i].n.remove(); c.parts.splice(i, 1); }
    const t = MOODS[m] || MOODS.idle;
    sp.eh.t = t.eh; sp.sl.t = t.sl; sp.mw.t = t.mw; sp.mc.t = t.mc; sp.mo.t = t.mo; sp.lL.t = t.lL; sp.lR.t = t.lR; sp.th.t = t.th; sp.br.t = t.br; sp.wide.t = t.wide; c.baseTilt = t.tilt; c.mouthBase = t;
    if (m === 'thinking') { sp.lx.t = -0.9; sp.ly.t = -0.8; } else if (m === 'oops') { sp.lx.t = -0.4; sp.ly.t = 0.7; } else if (!c.follow) { sp.lx.t = 0; sp.ly.t = 0; }
  };
  c.revert = (ms) => c.later(() => c.setMood(c.base), ms);
  c.hop = (power = 400) => { if (isCalm()) return; c.sq = -0.2; c.later(() => { c.sq = 0; c.hv = power; c.hy = 0.01; }, 130); };
  c.droop = () => { sp.sy.x = 0.9; sp.tilt.kick(40); sp.lL.kick(-120); sp.lR.kick(120); };
  c.partyStart = 0; c.wave = (d = 1) => { c.waving = { t: 0, dur: 1.2, d: d < 0 ? -1 : 1 }; };
  c.point = (d, ms) => { c.pointing = { d: d < 0 ? -1 : 1, until: performance.now() + ms }; sp.lx.t = d < 0 ? -1 : 1; sp.ly.t = 0.3; c.later(() => { c.pointing = null; sp.lx.t = 0; sp.ly.t = 0; }, ms); };
  c.party = (ms) => { c.partyStart = performance.now(); c.partyEnd = ms === Infinity ? Infinity : performance.now() + ms; c.nextHop = 0; };
  c.rain = (ms) => { c.rainEnd = performance.now() + ms; };
  c.emerge = () => { if (isCalm()) { sp.pop.x = sp.pop.t = 1; return; } sp.pop.x = 0.35; sp.pop.t = 1; sp.sy.x = 1.35; sp.sy.v = 0; c.burst(8); };
  c.poke = () => {
    c.pokes++; sp.sy.x = 0.7; sp.sy.v = 0; sp.tilt.kick(Math.random() < 0.5 ? 90 : -90); sp.lL.kick(-260); sp.lR.kick(260); sp.cheek.x = 1.4; sp.mo.x = 1; sp.eh.x = 1; c.hearts(2);
    if (c.mood === 'sleepy') c.setMood('idle');
  };
  c.lookAt = (cx, cy) => {
    const r = el.getBoundingClientRect(); if (!r.width) return;
    sp.lx.t = clamp((cx - (r.left + r.width * 0.5)) / (r.width * 0.5), -1, 1); sp.ly.t = clamp((cy - (r.top + r.height * 0.4)) / (r.height * 0.5), -1, 1);
    c.follow = true; clearTimeout(c.ft); c.ft = setTimeout(() => { c.follow = false; if (c.mood !== 'thinking') { sp.lx.t = 0; sp.ly.t = 0; } }, 1100);
  };
  c.burst = (n = 6) => { for (let i = 0; i < n; i++) spawn('star', 60 + rnd(-45, 45), rnd(20, 90), { vx: rnd(-50, 50), vy: rnd(-130, -50), g: 90, life: rnd(0.8, 1.3), size: rnd(5, 10) }); };
  c.hearts = (n = 2) => { for (let i = 0; i < n; i++) spawn('heart', 60 + rnd(-30, 40), 30 + rnd(-10, 10), { vx: rnd(-30, 40), vy: rnd(-90, -60), g: 0, life: 1.1, size: rnd(7, 11) }); };
  c.petals = (n = 8) => { for (let i = 0; i < n; i++) spawn('petal', 60 + rnd(-20, 20), -10 + rnd(-10, 10), { vx: rnd(-70, 70), vy: rnd(-120, -40), g: 120, life: rnd(1.2, 1.9), size: rnd(4, 7) }); };
  c.setStage = (n, pop) => {
    c.curStage = clamp(n | 0, 0, 4); el.dataset.stage = c.curStage; sp.stg.t = STAGE_SCALE[c.curStage] || 1;
    if (pop && !isCalm()) { sp.stg.x = (STAGE_SCALE[c.curStage] || 1) * 0.3; }
    el.setAttribute('aria-label', 'Sprig, ' + STAGES[c.curStage]);
  };

  // ---- particles (stars, hearts, petals, puffs, drops, zzz), SVG, capped ----
  function spawn(type, x, y, o) {
    if (isCalm() || c.parts.length > 40) return; let n;
    if (type === 'star') { n = document.createElementNS(NS, 'path'); n.setAttribute('d', 'M0 -1 L.28 -.28 L1 0 L.28 .28 L0 1 L-.28 .28 L-1 0 L-.28 -.28Z'); n.setAttribute('fill', ['#FFC21A', '#FFFFFF', '#F78FB3', '#7FE0D6'][Math.floor(rnd(0, 4))]); }
    else if (type === 'heart') { n = document.createElementNS(NS, 'path'); n.setAttribute('d', 'M0 .8 C-1.3 -.1 -.9 -1 -.3 -1 C0 -1 0 -.6 0 -.5 C0 -.6 0 -1 .3 -1 C.9 -1 1.3 -.1 0 .8Z'); n.setAttribute('fill', '#F2708F'); }
    else if (type === 'petal') { n = document.createElementNS(NS, 'ellipse'); n.setAttribute('rx', '.6'); n.setAttribute('ry', '1'); n.setAttribute('fill', ['#F29B73', '#F78FB3', '#FFD84A', '#fff'][Math.floor(rnd(0, 4))]); }
    else if (type === 'drop') { n = document.createElementNS(NS, 'path'); n.setAttribute('d', 'M0 -1 C.7 0 .8 .5 0 .9 C-.8 .5 -.7 0 0 -1Z'); n.setAttribute('fill', '#6EC5FF'); }
    else if (type === 'puff') { n = document.createElementNS(NS, 'circle'); n.setAttribute('r', '1'); n.setAttribute('fill', '#fff'); }
    else { n = document.createElementNS(NS, 'text'); n.textContent = 'z'; n.setAttribute('font-family', 'Fredoka,system-ui,sans-serif'); n.setAttribute('font-weight', '700'); n.setAttribute('font-size', '1'); n.setAttribute('fill', '#2A74B8'); n.setAttribute('text-anchor', 'middle'); }
    N.fx.appendChild(n); c.parts.push({ n, type, x, y, vx: 0, vy: 0, g: 0, age: 0, life: 1, size: 8, rot: 0, vr: rnd(-2, 2), ...o });
  }
  function stepParts(dt) {
    for (let i = c.parts.length - 1; i >= 0; i--) {
      const p = c.parts[i]; p.age += dt; const u = p.age / p.life; if (u >= 1) { p.n.remove(); c.parts.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt * 57; let sc = p.size, op = 1;
      if (p.type === 'star') sc = p.size * Math.sin(Math.PI * Math.min(1, u * 1.1));
      else if (p.type === 'heart') { sc = p.size * (u < 0.2 ? u * 5 : 1); op = 1 - Math.max(0, (u - 0.6) / 0.4); }
      else if (p.type === 'puff') { sc = p.size * (1 + u * 1.6); op = 0.75 * (1 - u); }
      else if (p.type === 'zzz') { sc = p.size * (0.5 + u * 0.8); op = Math.sin(Math.PI * u); }
      else if (p.type === 'petal' || p.type === 'drop') op = 1 - Math.max(0, (u - 0.7) / 0.3);
      p.n.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.type === 'zzz' ? -12 : p.rot.toFixed(0)}) scale(${sc.toFixed(2)})`); p.n.setAttribute('opacity', op.toFixed(2));
    }
  }

  // ---- per frame ----
  const actor = {
    get active() { return c.active && c.visible && !c.dead; },
    update(dt, h, n, now) {
      const m = c.mood, calm = isCalm(), tnow = performance.now();
      if (!calm) {
        c.breath = Math.sin(now * (m === 'sleepy' ? 1.4 : 2.4)) * (m === 'sleepy' ? 0.034 : 0.032);
        if (m !== 'sleepy') {
          if (now > c.nextBlink) { sp.blink.t = 1; c.blinkAt = now; c.nextBlink = now + rnd(2, 5); if (Math.random() < 0.22) c.nextBlink = now + 0.32; }
          if (c.blinkAt && now > c.blinkAt + 0.11) { sp.blink.t = 0; c.blinkAt = 0; }
          if (!c.follow && !c.pointing && m === 'idle' && now > c.nextGlance) { if (Math.random() < 0.4) { sp.lx.t = 0; sp.ly.t = 0; c.nextGlance = now + rnd(0.6, 1.4); } else { sp.lx.t = rnd(-1, 1); sp.ly.t = rnd(-0.5, 0.5); c.nextGlance = now + rnd(1.2, 2.8); } }
        }
        // idle fun: a small hop, a leaf wiggle, now and then (only while it is idle and nobody is touching it)
        if (m === 'idle' && !c.follow && !c.pointing && !c.waving) {
          if (now > c.nextFun) { c.nextFun = now + rnd(6, 11); if (Math.random() < 0.55) { c.hop(240); } else { sp.tilt.kick(Math.random() < 0.5 ? 60 : -60); } sp.lL.kick(-90); sp.lR.kick(90); }
          if (now > c.nextWig) { c.nextWig = now + rnd(2.5, 5); sp.lL.kick(rnd(-120, 120)); sp.lR.kick(rnd(-120, 120)); }
        }
        // leaves: a little life of their own, a wave overrides the swing
        const t = c.mouthBase || MOODS.idle;
        sp.lL.t = t.lL + Math.sin(now * 1.9) * 2.4; sp.lR.t = t.lR + Math.sin(now * 1.7 + 1) * 2.4;
        if (m === 'cheer' || m === 'happy') { sp.lL.t = t.lL + 14 * Math.sin(now * 13); sp.lR.t = t.lR - 14 * Math.sin(now * 13 + 1); }
        if (c.waving) { c.waving.t += dt; const w = c.waving; if (w.t > w.dur) c.waving = null; else { const a = 30 + 24 * Math.sin(w.t * 17); if (w.d > 0) sp.lR.t = -a; else sp.lL.t = a; } }
        if (c.pointing) { if (c.pointing.d > 0) sp.lR.t = -62; else sp.lL.t = 62; }
        if (m === 'speaking') { c.talk += dt; if (c.talk > 0.11) { c.talk = 0; sp.mo.t = rnd(0.05, 0.95); sp.mw.t = rnd(7, 12); } }
        if (m === 'sleepy') { c.accZ += dt; if (c.accZ > 1.25) { c.accZ = 0; spawn('zzz', 96, 40, { vx: 14, vy: -26, size: rnd(15, 20), life: 2 }); } }
        if (tnow < c.partyEnd) { if (tnow > c.nextHop) { const early = tnow - c.partyStart < 1800; c.nextHop = tnow + (early ? 520 : 1250); c.hop(early ? 430 : 330); c.burst(early ? 5 : 3); c.petals(early ? 4 : 2); } }
        if (tnow < c.rainEnd) { c.accP += dt; if (c.accP > 0.09) { c.accP = 0; spawn('drop', 60 + rnd(-40, 40), -26, { vx: 0, vy: rnd(60, 100), g: 260, size: rnd(4, 6), life: 0.9 }); } }
      }
      sp.tilt.t = c.baseTilt + (c.follow ? sp.lx.t * 3.5 : 0);
      const air = c.hy > 0 ? Math.min(0.24, Math.abs(c.hv) / 1800) : 0;
      sp.sy.t = 1 + c.breath + c.sq + air;
      for (let i = 0; i < n; i++) {
        for (const k in sp) sp[k].step(h);
        if (c.hy > 0 || c.hv > 0) { c.hv -= 1500 * h; c.hy += c.hv * h; if (c.hy <= 0) { const imp = -c.hv; c.hy = 0; c.hv = 0; if (imp > 120) { sp.sy.x = 1 - Math.min(0.36, imp / 1100); sp.sy.v = 0; sp.lL.kick(-120); sp.lR.kick(120); sp.cheek.x = 1.2; } } }
      }
      stepParts(dt);
      // idle and nothing moving but the breathing: draw every other frame (half the SVG work, same look)
      if (!c.hy && !c.parts.length && c.mood === 'idle' && !c.follow && !c.waving && !c.pointing && !dragging && (c.fr = (c.fr || 0) + 1) % 2) return;
      apply(now);
      if (calm && !c.parts.length && !c.hy) c.active = false;   // calm: draw once, then sleep
    },
  };
  function apply(now = 0) {
    const sy = sp.sy.x, sx = clamp(1 / Math.sqrt(Math.max(0.4, sy)), 0.75, 1.35), pop = sp.pop.x;
    put(N.rig, 'transform', `translate(0 ${f2(-c.hy)})`);
    put(N.body, 'transform', `translate(60 123) rotate(${f2(sp.tilt.x)}) scale(${(sx * pop).toFixed(3)} ${(sy * pop).toFixed(3)}) translate(-60 -123)`);
    const lift = clamp(c.hy / 70, 0, 1); put(N.sh, 'rx', f2(44 * (1 - lift * 0.55) * (0.4 + 0.6 * clamp(pop, 0, 1)))); put(N.sh, 'opacity', f2(0.24 * (1 - lift * 0.7)));
    const lx = sp.lx.x, ly = sp.ly.x, eh = clamp(sp.eh.x, 0, 1), sl = sp.sl.x, bl = sp.blink.x;
    put(N.face, 'transform', `translate(${f2(lx * 3.5)} ${f2(ly * 2.4)})`);
    pus.forEach((p) => put(p, 'transform', `translate(${f2(lx * 3.2)} ${f2(ly * 3)}) scale(${f2(1 + sp.wide.x * 0.1)})`));
    const lid = clamp(Math.max(bl, sl * 0.72, eh), 0, 1);
    ['L', 'R'].forEach((s) => { put(N['lid' + s], 'transform', `translate(0 50.2) scale(1 ${Math.max(0.001, lid).toFixed(3)}) translate(0 -50.2)`); put(N['arc' + s], 'opacity', f2(eh)); });
    const b = sp.br.x, bo = Math.min(1, Math.abs(b) * 1.4);
    put(N.brL, 'opacity', f2(bo)); put(N.brR, 'opacity', f2(bo));
    put(N.brL, 'transform', `rotate(${f2(-b * 16)} 42 48)`); put(N.brR, 'transform', `rotate(${f2(b * 16)} 78 48)`);
    const w = sp.mw.x, mcv = sp.mc.x, mov = clamp(sp.mo.x, 0, 1.2), y = 93;
    put(N.mo, 'd', `M${f2(60 - w)} ${y} Q60 ${f2(y + mcv)} ${f2(60 + w)} ${y} Q60 ${f2(y + mcv + mov * 20)} ${f2(60 - w)} ${y}Z`);
    const ch = sp.cheek.x; put(N.chL, 'transform', `translate(29 92) scale(${f2(ch)}) translate(-29 -92)`); put(N.chR, 'transform', `translate(91 92) scale(${f2(ch)}) translate(-91 -92)`);
    put(N.lL, 'transform', `rotate(${f2(sp.lL.x)})`); put(N.lR, 'transform', `rotate(${f2(sp.lR.x)})`);
    put(N.plant, 'transform', `rotate(${f2(sp.tilt.x * -0.3 + Math.sin(now * 1.3) * 1.2)} 60 30)`);
    lv.setAttribute('transform', `translate(60 30) scale(${(sp.stg.x || 0.01).toFixed(3)}) translate(-60 -30)`);
    const th = sp.th.x; put(N.th, 'opacity', f2(clamp(th, 0, 1)));
    if (th > 0.05) ['t1', 't2', 't3'].forEach((id, i) => put(N[id], 'r', f2(2.4 + 1.3 * (0.5 + 0.5 * Math.sin(now * 4 - i * 1.1)))));
  }

  // ---- pointer: poke on press, eyes follow while dragging ----
  let dragging = false;
  const onDown = (e) => { c.poke(); c.lookAt(e.clientX, e.clientY); dragging = true; c.active = true; addActor(actor); try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ } };
  const onMove = (e) => { if (dragging) c.lookAt(e.clientX, e.clientY); };
  const onUp = () => { dragging = false; };
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp);

  // ---- visibility: no frames for a mascot nobody can see ----
  let io = null;
  if ('IntersectionObserver' in window) { io = new IntersectionObserver((es) => { c.visible = es[es.length - 1].isIntersecting; if (c.visible && !c.dead) { c.active = true; addActor(actor); } }); io.observe(el); }

  function go(name, dir, o = {}) {
    if (c.dead) return; const s = STATES[name] || STATES.idle; c.state = name; el.dataset.state = name;
    c.setMood(s.m, !!s.base); c.active = true; addActor(actor);
    s.go && s.go(c, dir, o);
    if (s.ms) c.revert(s.ms);
    if (isCalm()) { for (const k in sp) { sp[k].x = sp[k].t; sp[k].v = 0; } apply(0); }
  }
  c.setStage(c.curStage); lv.setAttribute('transform', `translate(60 30) scale(${(sp.stg.t || 1).toFixed(3)}) translate(-60 -30)`);
  apply(0); go('idle', 1);
  return {
    setState(name, o = {}) { const dir = o.point === 'left' ? -1 : 1; go(name, dir, o); },
    setStage(n) { c.setStage(n, true); c.active = true; addActor(actor); },
    lookAt(x, y) { sp.lx.t = clamp(x, -1, 1); sp.ly.t = clamp(y, -1, 1); c.follow = true; clearTimeout(c.ft); c.ft = setTimeout(() => { c.follow = false; if (c.mood !== 'thinking') { sp.lx.t = 0; sp.ly.t = 0; } }, 1100); c.active = true; addActor(actor); },
    lookAtClient(cx, cy) { c.lookAt(cx, cy); c.active = true; addActor(actor); },
    setCalm(v) { if (v) { for (const k in sp) { sp[k].x = sp[k].t; sp[k].v = 0; } apply(0); } else { c.active = true; addActor(actor); } },
    wave(d = 1) { c.wave(d); c.active = true; addActor(actor); },
    hop(p) { c.hop(p); }, burst: (n) => c.burst(n), hearts: (n) => c.hearts(n), petals: (n) => c.petals(n),
    get stage() { return c.curStage; }, get state() { return c.state; }, get mood() { return c.mood; }, springs: sp,
    destroy() { c.dead = true; c.timers.forEach(clearTimeout); removeActor(actor); io && io.disconnect(); el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.innerHTML = ''; el.classList.remove('sprig'); },
  };
}
