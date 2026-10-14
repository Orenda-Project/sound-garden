// The "you did it" moment (sitting complete, level complete, first sticker): three stars fill one by one, paper confetti falls, a count-up
// can run beside it. 4 s at the very most, and a tap anywhere skips to the end state.
// Calm motion (motion.js): no confetti, the stars are simply filled; the chime and the voice stay.
import { h } from './ui.js';
import { sfx } from './sfx.js';
import { isCalm } from './motion.js';
import { isFast } from './audio.js';
import { enrich } from './celebrate-plus.js';

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.9 6.2 6.8.8-5 4.700 1.300 6.700L12 17.400 6 20.800l1.300-6.700-5-4.700 6.800-.8z" fill="currentColor"/></svg>';
const CONFETTI = ['#FFD54A', '#FF7A9C', '#7BE08F', '#FFFFFF', '#B79CFF', '#FF9F43'];   // bright on the teal sunburst: paper pieces and dots

// stars: how many of the three are earned. Returns { el, done, skip }. `done` resolves when the stars are in (about 1 s); confetti is gone by 2.2 s.
export function celebrate(parent, { stars = 3, confetti = true } = {}) {
  const row = h('div', { class: 'stars', role: 'img', 'aria-label': `${stars} of 3 stars` },
    ...[0, 1, 2].map(i => h('span', { class: `star${i < stars ? '' : ' empty'}`, html: STAR })));
  const el = h('div', { class: 'cele' }, row);
  parent.append(el);
  const kids = [...row.children];
  const timers = []; let layer = null, finished = false, resolve, layerT = 0;
  const done = new Promise(r => { resolve = r; });
  Promise.resolve().then(() => enrich(parent, { stars, confetti }));   // G3: second burst, sticker book, glint (celebrate-plus.js)
  // the stars are in: `done` resolves (the buttons may rise). The confetti keeps falling on its own timer; only a skip cuts it short.
  const settle = () => {
    if (finished) return; finished = true; timers.forEach(clearTimeout);
    kids.forEach((k, i) => { if (i < stars) k.classList.add('on', 'now'); });
    el.classList.add('settled'); document.removeEventListener('pointerdown', skip, true); resolve();
  };
  function skip() { clearTimeout(layerT); layer?.remove(); settle(); }
  if (isCalm() || isFast) { sfx.chime(); settle(); return { el, done, skip }; }
  kids.forEach((k, i) => { if (i < stars) timers.push(setTimeout(() => { k.classList.add('on'); sfx.star(i); }, 250 + i * 250)); });
  timers.push(setTimeout(settle, 250 + stars * 250 + 250));
  if (confetti) {
    layer = h('div', { class: 'confetti', 'aria-hidden': 'true' });
    for (let i = 0; i < 60; i++) {
      layer.append(h('i', { style: `left:${Math.round(Math.random() * 100)}%; --dx:${Math.round(Math.random() * 120 - 60)}px; --r:${Math.round(Math.random() * 720 - 360)}deg; --d:${Math.round(Math.random() * 450)}ms; --t:${(1.5 + Math.random() * 0.5).toFixed(2)}s; background:${CONFETTI[i % CONFETTI.length]}` }));
    }
    document.body.append(layer);
    layerT = setTimeout(() => layer?.remove(), 2300);
  }
  document.addEventListener('pointerdown', skip, true);
  return { el, done, skip };
}

// a number that counts up to `to` (400-600 ms); instant under calm motion
export function countUp(node, to, ms = 500) {
  if (isCalm() || isFast || !to) { node.textContent = String(to); return; }
  const t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / ms); node.textContent = String(Math.round(to * k)); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
