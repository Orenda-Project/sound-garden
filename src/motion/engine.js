// Sound Garden motion engine: a tiny spring-physics core that drives every moving thing (the idea is a spring per value, one ticker).
//   Sp          one value with a target, a stiffness k and a damping d (semi-implicit Euler, sub-stepped at 240 Hz)
//   springVal   run a spring from -> to and call fn(x) each frame; one-shot, auto-removed
//   popIn       entrance: translateY + scale spring with opacity; stagger() delays them 85 ms apart
//   countTo     number spring for counters      bump() a scale pulse      pressable() squash springs on every button
// One requestAnimationFrame loop for the whole page. It sleeps when nothing is moving and wakes when a spring or an actor is added.
// Calm motion (html.calm, or prefers-reduced-motion): every spring snaps to its target, nothing loops, nothing is thrown.
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rnd = (a, b) => a + Math.random() * (b - a);
export const NS = 'http://www.w3.org/2000/svg';
const HAS_DOM = typeof document !== 'undefined';
const SLOW = HAS_DOM ? (+(new URLSearchParams(location.search).get('slow')) || 1) : 1;

let calm = false;
const mq = HAS_DOM && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const root = HAS_DOM ? document.documentElement : null;
const readCalm = () => { calm = !!((root && root.classList.contains('calm')) || (mq && mq.matches)); };
readCalm();
if (root) new MutationObserver(readCalm).observe(root, { attributes: true, attributeFilter: ['class'] });
if (mq) (mq.addEventListener ? mq.addEventListener('change', readCalm) : mq.addListener?.(readCalm));
export const isCalm = () => calm;

export class Sp {
  constructor(x = 0, k = 170, d = 14) { this.x = x; this.v = 0; this.t = x; this.k = k; this.d = d; }
  step(h) { if (calm) { this.x = this.t; this.v = 0; return; } this.v += (this.k * (this.t - this.x) - this.d * this.v) * h; this.x += this.v * h; }
  kick(v) { if (!calm) this.v += v; }
  get rest() { const s = 1 + Math.abs(this.t); return Math.abs(this.t - this.x) < 1e-3 * s && Math.abs(this.v) < 1e-2 * s; }
}

const live = new Set();      // one-shot springs {sp, fn, done}
const actors = new Set();    // things that need update(dt,h,n,now) every frame while active (the mascot, the scene)
let running = false, last = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 / SLOW); last = now;
  const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
  live.forEach((o) => {
    const sp = o.sp; for (let i = 0; i < n; i++) sp.step(h);
    if (sp.rest) { sp.x = sp.t; sp.v = 0; live.delete(o); o.fn(sp.x); o.done && o.done(); } else o.fn(sp.x);
  });
  let any = live.size > 0;
  actors.forEach((a) => { if (a.active) { any = true; a.update(dt, h, n, now / 1000); } });
  if (any && !document.hidden) requestAnimationFrame(frame); else running = false;
}
export function wake() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
if (HAS_DOM) document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
export const addActor = (a) => { actors.add(a); wake(); };
export const removeActor = (a) => actors.delete(a);

export function drive(sp, fn, done) { const o = { sp, fn, done }; live.add(o); wake(); return o; }
export function springVal(from, to, k, d, fn, done) {
  const sp = new Sp(from, k, d); sp.t = to;
  if (calm) { fn(to); done && done(); return sp; }
  drive(sp, fn, done); return sp;
}
export function popIn(el, delay = 0, y = 26, s0 = 0.88) {
  if (!el) return;
  if (calm) { el.style.opacity = ''; el.style.transform = ''; return; }
  el.style.opacity = 0; el.style.transform = `translateY(${y}px) scale(${s0})`;
  setTimeout(() => springVal(0, 1, 230, 17, (p) => {
    el.style.opacity = clamp(p * 1.5, 0, 1); el.style.transform = `translateY(${(1 - p) * y}px) scale(${s0 + (1 - s0) * p})`;
  }, () => { el.style.transform = ''; el.style.opacity = ''; }), delay * SLOW);
}
export function stagger(els, base = 200, step = 85, y = 26) { [...els].forEach((e, i) => popIn(e, base + i * step, y)); }
export function countTo(el, from, to, k = 120, d = 15, fmt = (v) => Math.round(v)) {
  if (!el) return;
  if (el.__c) el.__c.t = to;
  else el.__c = springVal(from, to, k, d, (v) => { el.textContent = fmt(v); }, () => { el.__c = null; });
}
export function bump(el, amt = 0.28) { if (calm || !el) return; springVal(1 + amt, 1, 260, 12, (s) => { el.style.transform = `scale(${s})`; }, () => { el.style.transform = ''; }); }

// press squash: pointerdown pulls the control to 0.9 with a spring, release lets it overshoot back. Uses the CSS `scale` property so it never fights a transform.
const PRESS = 'button, a.btn, [role="button"], .btn, .tile, .chip, .snd, summary, .whocard, .lvchip';
export function pressable() {
  if (pressable.on) return; pressable.on = true;
  const down = new Set();
  const sq = (b, t) => {
    if (calm) return;
    if (!b.__p) { b.__p = new Sp(1, 380, 13); b.__o = null; }
    b.__p.t = t;
    if (!b.__o) b.__o = drive(b.__p, (s) => { b.style.scale = s.toFixed(3); }, () => { b.__o = null; b.style.scale = ''; });
  };
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest?.(PRESS);
    if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
    down.add(b); sq(b, 0.9);
  }, { passive: true });
  const release = () => { down.forEach((b) => sq(b, 1)); down.clear(); };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
}

// canvas confetti (one canvas per call site, removed when the last piece is gone)
export function confetti(host, bursts) {
  if (calm) return null;
  const cv = document.createElement('canvas'); cv.className = 'sg-confetti'; cv.setAttribute('aria-hidden', 'true');
  const fixed = host === document.body, dpr = Math.min(2, devicePixelRatio || 1), W = fixed ? innerWidth : (host.clientWidth || innerWidth), H = fixed ? innerHeight : (host.clientHeight || innerHeight);
  cv.width = W * dpr; cv.height = H * dpr; Object.assign(cv.style, { position: fixed ? 'fixed' : 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 });
  host.appendChild(cv); const cx = cv.getContext('2d'); const ps = []; let run = false;
  const cols = ['#FFC21A', '#F29B73', '#4CB82B', '#6EC5FF', '#F78FB3', '#B06AD6'];
  const burst = (n, x, y, spread = 1) => {
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + rnd(-1.2, 1.2) * spread, sp = rnd(260, 620); ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(0, 6), vr: rnd(-9, 9), w: rnd(6, 11), h: rnd(4, 8), c: cols[i % 6], life: rnd(2.2, 3.6), age: 0, petal: Math.random() < 0.3 }); }
    if (!run) { run = true; let l = performance.now(); const f = (now) => { const dt = Math.min(0.04, (now - l) / 1000); l = now; draw(dt); if (ps.length) requestAnimationFrame(f); else { run = false; cv.remove(); } }; requestAnimationFrame(f); }
  };
  function draw(dt) {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]; p.age += dt; if (p.age > p.life || p.y > H + 30) { ps.splice(i, 1); continue; }
      p.vy += 900 * dt; p.vx *= 1 - 1.6 * dt; p.vy *= 1 - 0.9 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = clamp((p.life - p.age) * 2, 0, 1); cx.fillStyle = p.c;
      const sq = Math.abs(Math.cos(p.r * 1.3));
      if (p.petal) { cx.beginPath(); cx.ellipse(0, 0, p.w / 2, p.h * sq / 1.4 + 1, 0, 0, 7); cx.fill(); } else cx.fillRect(-p.w / 2, -p.h / 2 * sq, p.w, p.h * sq + 1);
      cx.restore();
    }
  }
  (bursts || []).forEach(([delay, n, x, y, s]) => setTimeout(() => burst(n, x * W, y * H, s), delay));
  return { burst };
}

// a small message that springs up from the bottom and away again (role=status, so a screen reader hears it)
export function toast(text, ms = 1800) {
  if (typeof document === 'undefined') return;
  let t = document.getElementById('sg-toast');
  if (!t) { t = document.createElement('div'); t.id = 'sg-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.append(t); }
  t.textContent = text; clearTimeout(t.__h);
  if (calm) { t.style.opacity = 1; t.style.transform = ''; t.__h = setTimeout(() => { t.style.opacity = 0; }, ms); return; }
  springVal(0, 1, 260, 17, (p) => { t.style.opacity = clamp(p * 1.5, 0, 1); t.style.transform = `translateX(-50%) translateY(${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`; });
  t.__h = setTimeout(() => springVal(1, 0, 200, 24, (p) => { t.style.opacity = clamp(p, 0, 1); }), ms);
}
