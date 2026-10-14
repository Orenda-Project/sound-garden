// OVERLAY (Sound Garden): the motion layer for the app screens, built on the spring engine (src/motion/engine.js).
//   screenIn   a screen slides and fades in on a spring        stagIn   its cards pop in 85 ms apart
//   homeFx     garden Home: plants grow in and sway, bloom count + ring spring up, level pill slides, butterflies, drawn checks with sparks
//   endFx      the celebration: canvas confetti, a badge that pops, "days practised" counts up, the seed -> sprout -> bloom of this lesson's plant
// Calm motion (html.calm): the engine snaps every spring, so all of this lands in its final state at once.
import { Sp, addActor, removeActor, springVal, popIn, countTo, bump, confetti, clamp, rnd, isCalm } from '../../../src/motion/engine.js';
import { butterfly, miniMeadow, cloudSvg } from '../../../src/ui/hero-art.js';
import * as db from './db.js';

const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---- screens ----
export function screenIn(el, dir = 'fwd') {
  if (isCalm()) return;
  const c = el.classList;
  if (c.contains('home') || c.contains('sitting') || c.contains('privacy') || c.contains('guide')) { return; }   // Home and the grown-up screens hold a fixed ear button a transform would drag along; sittings animate their own steps
  const d = dir === 'back' ? -1 : 1;
  el.style.opacity = 0; el.style.transform = `translateX(${d * 46}px)`;
  springVal(0, 1, 190, 17, (p) => { el.style.opacity = clamp(p * 1.6, 0, 1); el.style.transform = `translateX(${(1 - p) * d * 46}px)`; }, () => { el.style.opacity = ''; el.style.transform = ''; });
}
const POP = { onboard: '.sheet > *', home: '.home-sheet > *', endscreen: ':scope > h2, :scope > .score, :scope > .daysline, :scope > .muted, :scope > .endplant, :scope > .cele-line', 'ss-session': ':scope > *' };
export function stagIn(el) {
  if (isCalm()) return;
  const key = Object.keys(POP).find((k) => el.classList.contains(k)); if (!key) return;
  const items = $$(POP[key], el).filter((n) => !n.hidden && !n.classList.contains('buddy-slot'));
  items.forEach((n, i) => popIn(n, 160 + i * 85, 28, 0.94));
}

// ---- garden Home ----
export function homeFx(s, { prog } = {}) {
  const yard = s.querySelector('.garden-yard'); if (!yard) return;
  const pls = $$('.pl', yard).map((g, i) => {
    const pi = g.querySelector('.pi'); if (!pi) return null;
    pi.style.transformBox = 'fill-box'; pi.style.transformOrigin = '50% 100%';
    return { g, pi, sp: new Sp(isCalm() ? 1 : 0, 150, 8.5), ph: Math.random() * 6, i, fresh: g.dataset.plant === s.dataset.freshPlant, bloomed: false };
  }).filter(Boolean);
  const actor = {
    get active() { return yard.isConnected && !document.hidden && !isCalm(); },
    update(dt, h, n, now) {
      const settled = pls.every((p) => p.sp.rest);
      if (settled && (this.fr = (this.fr || 0) + 1) % 2) return;   // everything has grown: sway at 30 fps (half the SVG repaints)
      for (const p of pls) {
        for (let k = 0; k < n; k++) p.sp.step(h);
        const sc = p.sp.x, sway = p.sp.x > 0.9 ? Math.sin(now * 1.4 + p.ph) * 1.8 : 0;
        p.pi.style.transform = `scale(${Math.max(0.001, sc).toFixed(3)}) rotate(${sway.toFixed(2)}deg)`;
      }
    },
  };
  if (isCalm()) { pls.forEach((p) => { p.pi.style.transform = ''; }); } else { pls.forEach((p) => { p.pi.style.transform = 'scale(0.001)'; setTimeout(() => { p.sp.t = 1; }, 250 + p.i * 80); }); addActor(actor); }
  const stop = new MutationObserver(() => { if (!yard.isConnected) { removeActor(actor); stop.disconnect(); } }); stop.observe(document.getElementById('app') || document.body, { childList: true });
  // a plant that just bloomed pops again and throws petals
  const f = pls.find((p) => p.fresh);
  if (f) setTimeout(() => { if (!yard.isConnected) return; springVal(1.35, 1, 200, 7, (v) => { f.pi.style.transform = `scale(${v}) rotate(0deg)`; }); const r = f.g.getBoundingClientRect(); confetti(document.body, [[0, 26, (r.left + r.width / 2) / innerWidth, (r.top + r.height * 0.35) / Math.max(innerHeight, 1), 0.6]]); }, 900 + f.i * 80);

  // bloom count + ring
  const sub = s.querySelector('.garden-sub');
  if (sub) {
    const m = /^(\d+) of (\d+)/.exec(sub.textContent.trim());
    if (m) {
      const n = +m[1], tot = +m[2], R = 15, C = 2 * Math.PI * R;
      sub.setAttribute('aria-label', sub.textContent); sub.classList.add('with-ring');
      sub.innerHTML = `<svg class="gring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${R}" class="gr-t"/><circle cx="20" cy="20" r="${R}" class="gr-a" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" transform="rotate(-90 20 20)"/><g class="gr-f" transform="translate(20 20)"><circle r="4" fill="#FFC21A"/></g></svg><span aria-hidden="true"><b class="gn">0</b> of ${tot} flowers in bloom</span>`;
      const arc = sub.querySelector('.gr-a'), fl = sub.querySelector('.gr-f');
      setTimeout(() => { countTo(sub.querySelector('.gn'), 0, n, 110, 14); springVal(0, tot ? n / tot : 0, 90, 13, (v) => { arc.setAttribute('stroke-dashoffset', (C * (1 - clamp(v, 0, 1.02))).toFixed(1)); fl.setAttribute('transform', `translate(20 20) scale(${(0.5 + clamp(v, 0, 1) * 1.1).toFixed(2)})`); }); }, 350);
    }
  }
  // the level chips: a green pill slides to the chosen level on a spring
  const nav = s.querySelector('.garden-levels');
  if (nav) {
    const chips = $$('.lvchip', nav), on = chips.findIndex((c) => c.classList.contains('on')), prev = window.__engine.lvPrev ?? on;
    window.__engine.lvPrev = on;
    if (on >= 0) {
      const pill = document.createElement('i'); pill.className = 'lvpill'; pill.setAttribute('aria-hidden', 'true'); nav.prepend(pill); nav.classList.add('has-pill');
      const x = (i) => chips[i].offsetLeft;
      pill.style.transform = `translateX(${x(prev)}px)`;
      if (prev !== on) springVal(x(prev), x(on), 240, 16, (v) => { pill.style.transform = `translateX(${v}px)`; }, () => { pill.style.transform = `translateX(${x(on)}px)`; }); else pill.style.transform = `translateX(${x(on)}px)`;
    }
  }
  // butterflies drift over the garden
  const area = s.querySelector('.scene-area');
  if (area) { const cl = document.createElement('div'); cl.className = 'hclouds'; cl.setAttribute('aria-hidden', 'true'); cl.innerHTML = `<span class="c1">${cloudSvg(120)}</span><span class="c2">${cloudSvg(80)}</span>`; area.prepend(cl); }
  if (area && !isCalm()) { const b = document.createElement('div'); b.className = 'hbf'; b.setAttribute('aria-hidden', 'true'); b.innerHTML = `<span class="b1">${butterfly('#F78FB3')}</span><span class="b2">${butterfly('#FFC21A')}</span>`; area.append(b); }
  // checks of finished steps draw themselves once, with sparks
  if (prog) {
    const seen = new Set(prog.doneSeen || []), fresh = $$('.node.done', s).filter((n) => n.dataset.key && !seen.has(n.dataset.key));
    if (fresh.length) {
      if (seen.size || prog.doneSeenInit) fresh.forEach((n, i) => setTimeout(() => drawCheck(n), 700 + i * 160));
      prog.doneSeen = [...new Set([...(prog.doneSeen || []), ...fresh.map((n) => n.dataset.key)])]; prog.doneSeenInit = true; db.saveProgress(prog);
    }
  }
}

// a check mark that draws itself: path dash spring + a pop + a few sparks (lesson steps, practice ticks)
export function drawCheck(host) {
  const path = host.querySelector('svg path'); if (!path || isCalm()) return;
  let L = 30; try { L = path.getTotalLength(); } catch { /* ignore */ }
  path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
  springVal(L, 0, 150, 17, (v) => { path.style.strokeDashoffset = clamp(v, 0, L); }, () => { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; });
  bump(host, 0.2); sparks(host);
}
export function sparks(host, n = 7) {
  if (isCalm()) return;
  const r = host.getBoundingClientRect(), lay = document.createElement('div'); lay.setAttribute('aria-hidden', 'true');
  Object.assign(lay.style, { position: 'fixed', left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px', width: 0, height: 0, pointerEvents: 'none', zIndex: 60 });
  document.body.append(lay);
  const cols = ['#FFC21A', '#F29B73', '#4CB82B', '#6EC5FF'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); Object.assign(s.style, { position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: cols[i % 4], left: '-4px', top: '-4px' }); lay.append(s);
    const a = (i / n) * Math.PI * 2 + rnd(-0.2, 0.2), dist = rnd(22, 34);
    springVal(0, 1, 120, 12, (p) => { const q = clamp(p, 0, 1.2); s.style.transform = `translate(${Math.cos(a) * dist * q}px,${Math.sin(a) * dist * q}px) scale(${clamp(1.1 - p * 0.6, 0, 1)})`; s.style.opacity = clamp(1.05 - p, 0, 1); }, () => { s.remove(); if (!lay.childElementCount) lay.remove(); });
  }
}

// ---- the celebration (Track A) ----
export async function endFx(s, { passed } = {}) {
  if (!s.classList.contains('track-A')) return;
  if (passed) { confetti(s.ownerDocument.body, [[250, 70, 0.5, 0.36, 1.1], [700, 36, 0.14, 0.5, 0.7], [700, 36, 0.86, 0.5, 0.7], [1500, 46, 0.5, 0.34, 1.3], [3300, 26, 0.3, 0.45, 0.9], [3300, 26, 0.7, 0.45, 0.9]]); }
  const st = s.querySelector('.sticker'); if (st && !isCalm()) { st.style.opacity = 0; setTimeout(() => springVal(0, 1, 170, 8, (p) => { st.style.opacity = clamp(p * 2, 0, 1); st.style.scale = String(Math.max(p, 0.01)); st.style.rotate = `${7 + (1 - p) * -22}deg`; }, () => { st.style.scale = ''; st.style.rotate = ''; st.style.opacity = ''; }), 1100); }
  // "days practised": counts up, never resets, never framed as a loss
  try {
    const pid = await db.setting('active'), prog = await db.progress(pid), days = (prog.days || []).length; if (!days || !passed) return;
    const p = document.createElement('p'); p.className = 'daysline cele-line'; p.innerHTML = `<b>0</b> ${days === 1 ? 'day' : 'days'} practised`;
    (s.querySelector('.score') || s.querySelector('.cele-box'))?.after(p); popIn(p, 1300, 24, 0.9); setTimeout(() => countTo(p.querySelector('b'), 0, days, 100, 12), 1450);
  } catch { /* progress not readable: skip the line */ }
  // the mini-check dots pop in as seeds
  $$('.dots i', s).forEach((d, i) => { if (isCalm()) return; d.style.transform = 'scale(0)'; setTimeout(() => springVal(0, 1, 260, 10, (v) => { d.style.transform = `scale(${v})`; }, () => { d.style.transform = ''; }), 900 + i * 85); });
}

// the lesson's plant on the end screen: seed -> sprout -> bloom, each stage a squash-and-spring pop
export function growEnd(el, from, to, passed) {
  const use = el.querySelector('svg use'), pi = el.querySelector('.pi'); if (!use || !pi || isCalm()) return;
  pi.style.transformBox = 'fill-box'; pi.style.transformOrigin = '50% 100%';
  const set = (st) => use.setAttribute('href', '#pl' + st);
  const pop = (hold) => springVal(0.35, 1, 200, 8, (v) => { pi.style.transform = `scale(${1 / Math.sqrt(Math.max(v, 0.4))},${v})`; }, () => { pi.style.transform = ''; hold && hold(); });
  set(from); pi.style.transform = 'scale(0.01)';
  setTimeout(() => { pop(); }, 500);
  let t = 1250; if (from === to) return;
  for (let st = from + 1; st <= to; st++) { const k = st; setTimeout(() => { set(k); pop(); sparks(pi, 6); if (k === 4) confetti(document.body, [[0, 30, 0.5, 0.6, 0.8]]); }, t); t += 800; }
}

// ---- lessons: every new step card springs in (the prompt, the picture card, the buttons), 70 ms apart ----
export function watchSteps(root) {
  if (watchSteps.on) return; watchSteps.on = true;
  new MutationObserver((muts) => {
    if (isCalm()) return;
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1 || !n.classList?.contains('screen') || !n.closest('.sitting')) continue;
      [...n.children].filter((c) => !c.hidden).slice(0, 7).forEach((c, i) => popIn(c, 40 + i * 70, 22, 0.94));
    }
  }).observe(root, { childList: true, subtree: true });
}

// lesson and Practice screens get a living lower edge: swaying flowers and grass, and a butterfly (Track A only; calm motion: flowers only, not moving)
export function meadowIn(el) {
  const c = el.classList; if (!c.contains('track-A') || !(c.contains('sitting') || c.contains('onb-lesson'))) return;
  const d = document.createElement('div'); d.className = 'sg-meadow-wrap'; d.setAttribute('aria-hidden', 'true');
  d.innerHTML = miniMeadow() + (isCalm() ? '' : `<div class="hbf"><span class="b1">${butterfly('#F78FB3')}</span></div>`);
  el.prepend(d);
}
