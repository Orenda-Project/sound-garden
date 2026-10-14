// G3: the bigger celebration. celebrate.js calls enrich() once with the screen it belongs to (.endscreen or .onb-done); everything here is added on top of the existing markup.
// Track A: a second confetti burst when the sticker lands (paper + dots), a glint across the sticker, the sticker book as dots (no digits), Sprig says "We did it!".
// Track B: calm. A check ring that draws itself and a soft sage pulse. No mascot, no confetti. Calm motion and ?fast: the final state at once.
import * as db from './db.js';
import { isCalm } from './motion.js';
import { isFast } from './audio.js';
import { sfx } from './sfx.js';
import './celebrate-plus.css';

const COLORS = ['#FFD54A', '#FF7A9C', '#7BE08F', '#FFFFFF', '#B79CFF', '#FF9F43'];
const BOOK = 12;   // the sticker book shows 12 places; it wraps after that, nothing is ever "lost"

function burst(n, spread = 100) {
  const layer = document.createElement('div'); layer.className = 'confetti second'; layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${Math.round(20 + Math.random() * 60)}%; --dx:${Math.round(Math.random() * spread * 2 - spread)}px; --r:${Math.round(Math.random() * 720 - 360)}deg; --d:${Math.round(Math.random() * 300)}ms; --t:${(1.3 + Math.random() * 0.5).toFixed(2)}s; background:${COLORS[i % COLORS.length]}`;
    layer.append(p);
  }
  document.body.append(layer); setTimeout(() => layer.remove(), 2200);
  return layer;
}

export function dots(n) {
  const k = n ? ((n - 1) % BOOK) + 1 : 0;
  const el = document.createElement('div'); el.className = 'sticker-book'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', `Sticker book: ${n} sticker${n === 1 ? '' : 's'}`);
  for (let i = 0; i < BOOK; i++) { const d = document.createElement('i'); if (i < k) d.className = 'on'; if (i === k - 1) d.classList.add('last'); el.append(d); }
  return el;
}

export function ringEl() {   // Track B: a check ring that draws itself (static under calm motion and ?fast)
  const ring = document.createElement('div'); ring.className = 'ring-draw'; ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="rg-track"/><circle cx="50" cy="50" r="42" class="rg-arc"/><path d="M30 52l14 14 27-30" class="rg-tick"/></svg>';
  return ring;
}

export function enrich(parent, { stars, confetti, finished }) {
  const root = parent.closest?.('.endscreen, .onb-done'); if (!root) return;
  root.classList.add('cele-plus');
  const A = root.classList.contains('track-A'), B = root.classList.contains('track-B');
  if (B) {   // calm: the ring draws itself, the wash pulses once
    if (!root.querySelector('.ring-draw') && !root.querySelector('.check-big')) {
      root.prepend(ringEl());
    }
    root.classList.add('sage-pulse'); return;
  }
  if (!A) return;
  const h2 = root.querySelector('h2'); if (h2 && /^(well done|you did it)!?$/i.test(h2.textContent.trim())) h2.textContent = 'We did it!';
  if (root.classList.contains('endscreen') && !root.querySelector('.hook')) { const hk = document.createElement('p'); hk.className = 'cele-line hook'; hk.textContent = "I'll be here when you want to play again."; root.querySelector('.row')?.before(hk); }   // a tomorrow hook with nothing to lose
  for (const m of root.querySelectorAll('p.muted')) if (/^you earned a sticker!?$/i.test(m.textContent.trim())) m.textContent = 'We earned a sticker!';   // G6: first person, text only (the clip stays)
  const st = root.querySelector('.sticker');
  if (st) {
    st.append(Object.assign(document.createElement('span'), { className: 'glint', ariaHidden: 'true' }));
    db.setting('active').then(pid => db.progress(pid)).then(prog => {
      const n = (prog.stickers || []).length; if (!n || !st.isConnected) return;
      const d = dots(n); st.after(d);
    }).catch(() => {});
  }
  if (!confetti || isCalm() || isFast) return;
  setTimeout(() => { if (!root.isConnected) return; burst(34); sfx.star?.(1); }, 950);
}
