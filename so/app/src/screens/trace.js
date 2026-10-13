// Trace: finger-trace the letter over a faint guide. Score = share of the guide covered by the stroke.
import { h } from '../ui.js';
import { mark, play, wait, isFast } from '../audio.js';
import { teacher } from '../teacher.js';
import { tilo } from '../tilo.js';
import { sfx } from '../sfx.js';
import { isCalm } from '../motion.js';

const SIZE = 300, PEN = 44, R = 2;   // SIZE = logical canvas (drivers read it); R = backing-store scale so the fat letter stays crisp
const FONT = '"Andika", "Comic Neue", "Trebuchet MS", sans-serif';
const BURST = ['#E1A263', '#207712', '#FFC53D', '#FF8FA3', '#7FD1A0', '#8EC5FF'];
// Where the letter sits: scaled so it FILLS the card (a big bold letter is the whole screen), centred by its real ink box.
function metrics(letter) {
  const c = document.createElement('canvas').getContext('2d'); c.font = `700 100px ${FONT}`;
  const m = c.measureText(letter);
  const asc = m.actualBoundingBoxAscent || 70, desc = m.actualBoundingBoxDescent || 0, w = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) || 60;
  const s = Math.min(SIZE * 0.62 / (asc + desc), SIZE * 0.74 / w);
  return { px: 100 * s, base: SIZE * 0.5 + (asc - desc) / 2 * s, x: SIZE / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 * s, top: SIZE * 0.5 + (asc - desc) / 2 * s - asc * s, s, asc };
}

// A centre-line of the letter (Zhang-Suen thinning of the guide, 2x down-sampled) as ordered strokes: [[x, y], ...] in canvas pixels.
// Components (the dot of i and j) are separate strokes; a branch is walked and walked back so the finger never jumps inside a stroke.
function strokesOf(guide) {
  const N = SIZE / 2, d = guide.getContext('2d').getImageData(0, 0, SIZE, SIZE).data;
  const b = new Uint8Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) b[y * N + x] = d[((y * 2) * SIZE + x * 2) * 4 + 3] > 128 ? 1 : 0;
  const at = (x, y) => b[y * N + x];
  for (let changed = true; changed;) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const del = [];
      for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
        if (!at(x, y)) continue;
        const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
        const B = p.reduce((a, v) => a + v, 0); if (B < 2 || B > 6) continue;
        let A = 0; for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) A++;
        if (A !== 1) continue;
        if (pass === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
        del.push(y * N + x);
      }
      for (const i of del) b[i] = 0;
      if (del.length) changed = true;
    }
  }
  const seen = new Uint8Array(N * N), strokes = [];
  const nb = i => { const x = i % N, y = (i / N) | 0, o = []; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < N && Y < N && b[Y * N + X]) o.push(Y * N + X); } return o; };
  const starts = []; for (let i = 0; i < N * N; i++) if (b[i]) starts.push(i);   // top to bottom, left to right
  const endpoints = starts.filter(i => nb(i).length === 1);
  for (const s0 of [...endpoints, ...starts]) {
    if (seen[s0]) continue;
    const path = []; const stack = [[s0, null]]; seen[s0] = 1;
    // iterative DFS that records the walk and the walk back
    const walk = [s0]; const it = [[s0, nb(s0).filter(n => !seen[n])]];
    while (it.length) {
      const [cur, rest] = it[it.length - 1];
      const nxt = rest.find(n => !seen[n]);
      if (nxt === undefined) { it.pop(); if (it.length) walk.push(it[it.length - 1][0]); continue; }
      seen[nxt] = 1; walk.push(nxt); it.push([nxt, nb(nxt).filter(n => !seen[n])]);
    }
    for (const i of walk) path.push([(i % N) * 2 + 1, ((i / N) | 0) * 2 + 1]);
    if (path.length > 3) strokes.push(path);
  }
  // draw the biggest stroke first (the dot of an i comes last), keep the order stable otherwise
  return strokes.sort((a, c) => c.length - a.length);
}
export async function trace(ctx, letter) {
  const s = ctx.stage();
  const isB = document.documentElement.classList.contains('track-B');
  const cv = h('canvas', { class: 'trace', width: SIZE * R, height: SIZE * R, 'aria-label': `Trace the letter ${letter}` });
  const meter = h('div', { class: 'meter' }, h('i'));
  const status = h('p', { class: 'muted trace-status' }, 'Trace 1 of 2');
  const pips = h('div', { class: 'pips', 'aria-hidden': 'true' }, h('i'), h('i'));
  const burst = h('div', { class: 'burst', 'aria-hidden': 'true' });
  const wrap = h('div', { class: 'trace-wrap' }, cv, burst);
  s.append(h('h2', { class: 'trace-title' }, 'Trace the letter'), wrap, meter, pips, status);
  // Track A: Tilo stands under the letter (big) and cheers when it is done; no room (a short phone) = he stays in the header
  const root = s.closest?.('.sitting.track-A');
  if (root && !root.classList.contains('has-beat')) {
    const slot = h('div', { class: 'tilo-slot coach-slot' }); const box = h('div', { class: 'coach', 'aria-hidden': 'true' }, slot);
    s.append(box); root.classList.add('has-beat'); tilo.beat(slot, box, null);
    if (root.getBoundingClientRect().height > window.innerHeight + 1) { box.remove(); root.classList.remove('has-beat'); tilo.endBeat(); }
  }
  try { await Promise.race([document.fonts?.load(`700 100px ${FONT}`, letter), wait(400)]); } catch {}
  const g = cv.getContext('2d'); g.setTransform(R, 0, 0, R, 0, 0);
  const C = isB ? { rail: '#DCE3EA', dots: '#76848F', ink: '#2F5573', win: '#2F5573', mark: '#2F5573', line: '#D9DEE4' }
                : { rail: '#E9DCC4', dots: '#8C7860', ink: '#28A014', win: '#FFC53D', mark: '#C2571F', line: '#E3D6BF' };
  const M = metrics(letter);
  // the fat letter: fill + a round outline, so the target is wide enough for a small finger
  const paint = (c, color, outline = 10) => {
    c.font = `700 ${M.px}px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.lineJoin = 'round'; c.lineWidth = outline; c.strokeStyle = color; c.fillStyle = color;
    c.strokeText(letter, M.x, M.base); c.fillText(letter, M.x, M.base);
  };
  const guide = document.createElement('canvas'); guide.width = guide.height = SIZE;   // analysis only (centre-line, coverage points): logical pixels
  paint(guide.getContext('2d'), '#000', 8);
  const gd = guide.getContext('2d').getImageData(0, 0, SIZE, SIZE).data;
  const guidePts = [];
  for (let y = 0; y < SIZE; y += 4) for (let x = 0; x < SIZE; x += 4) if (gd[(y * SIZE + x) * 4 + 3] > 128) guidePts.push([x, y]);
  window.__so.traceGuide = { letter, box: (() => { const xs = guidePts.map(p => p[0]), ys = guidePts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; })() };
  const ink = document.createElement('canvas'); ink.width = ink.height = SIZE * R;
  const ig = ink.getContext('2d'); ig.setTransform(R, 0, 0, R, 0, 0);
  const demoInk = document.createElement('canvas'); demoInk.width = demoInk.height = SIZE * R;
  let finger = null, won = false, started = false, pulse = 0;   // finger = {x, y} while the demonstration runs
  let centre = null; const strokes = () => centre || (centre = strokesOf(guide));
  const inked = (x, y) => ig.getImageData(Math.round(x * R), Math.round(y * R), 1, 1).data[3] > 0;
  // the stroke whose start is not covered yet: that start gets the numbered dot and the arrow
  const marker = () => { const st = strokes().slice(0, 3); const i = st.findIndex(p => !inked(p[0][0], p[0][1])); return i < 0 ? null : { n: i + 1, st: st[i] }; };
  const redraw = () => {
    g.clearRect(0, 0, SIZE, SIZE);
    // handwriting lines: top, dashed middle, baseline
    g.strokeStyle = C.line; g.lineCap = 'round'; g.lineWidth = 4;
    const L = [M.top, M.base]; for (const y of L) { g.beginPath(); g.moveTo(14, y); g.lineTo(SIZE - 14, y); g.stroke(); }
    g.setLineDash([2, 12]); g.beginPath(); g.moveTo(14, (M.top + M.base) / 2); g.lineTo(SIZE - 14, (M.top + M.base) / 2); g.stroke(); g.setLineDash([]);
    paint(g, C.rail, 10);
    if (!won) {   // the thick dotted path down the middle of the rail
      g.strokeStyle = C.dots; g.lineWidth = 6; g.setLineDash([0.1, 13]); g.lineCap = 'round';
      for (const st of strokes()) { g.beginPath(); st.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
      g.setLineDash([]);
    }
    if (won) paint(g, C.win, 10); else g.drawImage(ink, 0, 0, SIZE, SIZE);
    g.drawImage(demoInk, 0, 0, SIZE, SIZE);
    const mk = !won && !started && !down && !demoing ? marker() : null;
    if (mk) {   // numbered start dot + arrow along the first move
      const [x, y] = mk.st[0], q = mk.st[Math.min(10, mk.st.length - 1)], a = Math.atan2(q[1] - y, q[0] - x), r = 17 + (isB ? 0 : Math.sin(pulse) * 2.5);
      g.fillStyle = C.mark; g.strokeStyle = '#fff'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(x + Math.cos(a) * (r + 20), y + Math.sin(a) * (r + 20)); g.lineTo(x + Math.cos(a + 2.5) * (r + 8) + Math.cos(a) * (r + 2), y + Math.sin(a + 2.5) * (r + 8) + Math.sin(a) * (r + 2)); g.lineTo(x + Math.cos(a - 2.5) * (r + 8) + Math.cos(a) * (r + 2), y + Math.sin(a - 2.5) * (r + 8) + Math.sin(a) * (r + 2)); g.closePath(); g.fill();
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.font = `800 ${r * 1.15}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(mk.n), x, y + 1);
    }
    if (finger) { g.fillStyle = '#E0794A'; g.beginPath(); g.arc(finger.x, finger.y, PEN * 0.45, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke(); }
  };
  const coverage = () => {
    const d = ig.getImageData(0, 0, SIZE * R, SIZE * R).data, W = SIZE * R;
    let hit = 0; for (const [x, y] of guidePts) if (d[((y * R) * W + x * R) * 4 + 3] > 0) hit++;
    return guidePts.length ? hit / guidePts.length : 0;
  };
  ig.strokeStyle = C.ink; ig.lineWidth = PEN; ig.lineCap = ig.lineJoin = 'round';
  let down = false, last = null, demoing = false;
  // a gentle pulse on the start dot (Track A, motion allowed); it stops by itself when the screen goes
  const still = () => isFast || isCalm() || isB || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!still()) (function loop() { if (!cv.isConnected) return; pulse += 0.12; if (!won && !started && !down && !demoing) redraw(); setTimeout(loop, 60); })();
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * SIZE / r.width, (e.clientY - r.top) * SIZE / r.height]; };
  cv.addEventListener('pointerdown', e => { if (demoing || won) return; down = true; started = true; last = pt(e); ig.beginPath(); ig.moveTo(...last); ig.lineTo(last[0] + 0.01, last[1]); ig.stroke(); cv.setPointerCapture(e.pointerId); redraw(); });
  cv.addEventListener('pointermove', e => { if (!down || demoing) return; const p = pt(e); ig.beginPath(); ig.moveTo(...last); ig.lineTo(...p); ig.stroke(); last = p; redraw(); meter.firstChild.style.width = Math.round(coverage() * 100) + '%'; });
  const scores = [];
  let round = 1, done;
  const finished = new Promise(r => { done = r; });
  let helpAt = 0, drew = 0;
  cv.addEventListener('pointermove', () => { if (down) drew++; });
  const cheer = () => {   // the letter fills in gold, stars burst off it, Tilo cheers; calm motion: the fill and the voice only
    won = true; started = true; redraw();
    pips.children[round - 1]?.classList.add('on');
    if (isB) return;
    sfx.chime(); tilo.emote('celebrating', null, 2600);
    if (isCalm() || isFast || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    wrap.classList.remove('win'); void wrap.offsetWidth; wrap.classList.add('win');
    burst.replaceChildren(...Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 6.283 + Math.random() * 0.4, d = 110 + Math.random() * 70; return h('i', { style: `--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d)}px;--d:${Math.round(Math.random() * 120)}ms;background:${BURST[i % BURST.length]}` }); }));
    setTimeout(() => burst.replaceChildren(), 1500);
  };
  cv.addEventListener('pointerup', async () => {
    if (!down) return;
    down = false;
    const c = coverage();
    if (c < 0.7) {   // a stroke that stops short: say how to do it, never "wrong" (at most once every 6 s, and only after a real stroke)
      started = false; redraw();
      if (drew > 6 && Date.now() - helpAt > 6000) { helpAt = Date.now(); drew = 0; mark('trace-help', { letter, coverage: c }); teacher.miss(); await teacher.say('ui:traceHelp'); }
      return;
    }
    scores.push(Math.round(c * 100) / 100);
    mark('trace', { letter, coverage: c, round });
    cheer();
    await play('ui:traceGood');
    if (round >= 2) return done();
    await wait(isFast ? 0 : 1100);
    round++; status.textContent = 'Trace 2 of 2'; won = false; started = false;
    ig.clearRect(0, 0, SIZE, SIZE); redraw(); meter.firstChild.style.width = '0%';
    await teacher.say('ui:traceAgain');
  });
  // "Watch me first": a finger draws the letter once over the faint guide, then "Trace the letter with your finger."
  const demo = async () => {
    if (demoing) return true;
    demoing = true; mark('trace-demo', { letter });
    const dg = demoInk.getContext('2d'); dg.setTransform(R, 0, 0, R, 0, 0); dg.clearRect(0, 0, SIZE, SIZE); dg.strokeStyle = isB ? 'rgba(47,85,115,.55)' : 'rgba(20,160,143,.6)'; dg.lineWidth = PEN * 0.7; dg.lineCap = dg.lineJoin = 'round';
    try {
      const total = strokes().map(st => st.filter((_, i) => i % 3 === 0 || i === st.length - 1));
      const frames = isFast ? 1 : 2200 / 16, reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const pts = total.reduce((a, st) => a + st.length, 0);
      if (reduce || isFast) { for (const st of total) { dg.beginPath(); st.forEach(([x, y], i) => i ? dg.lineTo(x, y) : dg.moveTo(x, y)); dg.stroke(); } redraw(); if (!isFast) await wait(1400); }
      else for (const st of total) {
        const per = Math.max(2, Math.round(frames * st.length / pts / (st.length - 1)) );
        for (let i = 1; i < st.length; i++) {
          for (let k = 1; k <= per; k++) {
            const t = k / per, x = st[i - 1][0] + (st[i][0] - st[i - 1][0]) * t, y = st[i - 1][1] + (st[i][1] - st[i - 1][1]) * t;
            finger = { x, y }; dg.beginPath(); dg.moveTo(st[i - 1][0] + (st[i][0] - st[i - 1][0]) * (k - 1) / per, st[i - 1][1] + (st[i][1] - st[i - 1][1]) * (k - 1) / per); dg.lineTo(x, y); dg.stroke(); redraw();
            await new Promise(r => requestAnimationFrame(r));
          }
        }
        finger = null; redraw(); await wait(120);
      }
    } finally { finger = null; demoInk.getContext('2d').clearRect(0, 0, SIZE, SIZE); demoing = false; redraw(); }
    return true;
  };
  window.__so.traceDemo = demo; window.__so.traceStrokes = () => strokes();   // test hooks
  redraw();
  await ctx.instruct('ui:watchMe', { stim: async () => { if ((await demo()) === false) return false; return teacher.say('ui:traceIntro'); }, nudge: 'ui:idleTrace', hint: () => teacher.point(cv) });
  await ctx.next({ waitFor: finished, skippable: true });
  return { scores };
}
