import { load, save } from '../store.js';
import { scene, defs, plant, mound, PLANT_COLORS, cloud } from '../art/art.js';
import { createSprig } from '../sprig/sprig.js';
import { LESSONS, plantState, HOUR } from '../progression.js';
import { unlock, play } from '../audio.js';
import { DEMO, onLeave } from '../router.js';
import { loadDisplayFont } from './sprout.js';
import { label } from './btn.js';

// Slots: front row 3, middle 4, back 5 (further = smaller). Lessons fill front to back.
const ROWS = [{ y: 462, s: 1, xs: [58, 158, 258] }, { y: 346, s: .82, xs: [100, 190, 280, 358] }, { y: 252, s: .66, xs: [42, 118, 194, 270, 346] }];
const SLOTS = ROWS.flatMap((r) => r.xs.map((x) => ({ x, y: r.y, s: r.s })));
const demo = () => { const now = Date.now(), p = (stage, h) => ({ stage, at: now - h * HOUR });
  return { sprouted: true, plants: { 'L1.01': p(4, 2), 'L1.02': p(4, 5), 'L1.03': p(3, 26), 'L1.04': p(3, 6), 'L1.05': p(2, 100), 'L1.06': p(2, 3), 'L1.07': p(2, 1) } }; };

export function mount(el) {
  const s = DEMO ? demo() : load(); if (!DEMO) save({ homeVisits: (s.homeVisits || 0) + 1 });
  if (s.sprouted) loadDisplayFont();
  const done = LESSONS.filter(([id]) => s.plants?.[id]);
  const states = Object.fromEntries(done.map(([id]) => [id, plantState(s.plants[id])]));
  const needs = done.filter(([id]) => states[id] !== 'fresh');
  const nextL = LESSONS.find(([id]) => !s.plants?.[id]) || LESSONS[LESSONS.length - 1];
  let glows = 0, svg = '';
  LESSONS.forEach(([id, name, label], i) => {
    const sl = SLOTS[i], col = PLANT_COLORS[i % PLANT_COLORS.length];
    if (s.plants?.[id]) {
      const st = states[id], p = s.plants[id];
      const g = st === 'ready' && glows < 2 ? (glows++, true) : false;
      svg += plant({ ...sl, id, label, color: col, stage: st === 'sleeping' ? 'zz' : p.stage, glow: g, ring: st === 'ready' && !g });
    } else {   // a plot waiting for its lesson: soil mound, the next one has a seed on it
      svg += `<g data-plot="${id}" transform="translate(${sl.x} ${sl.y + 40}) scale(${sl.s})" opacity="${id === nextL[0] ? 1 : .7}"><g transform="scale(.5)">${mound(1)}</g><g opacity=".5"><rect x="-13" y="-26" width="26" height="28" rx="4" fill="#E9B872" stroke="#8A5A1E" stroke-width="2.4"/>${label ? `<text y="-5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="19" fill="#12330F">${label}</text>` : ''}<path d="M0 2v8" stroke="#8A5A1E" stroke-width="3"/></g></g>`;
    }
  });
  const sleeper = done.find(([id]) => states[id] === 'sleeping'), ready = done.find(([id]) => states[id] === 'ready');
  const pickBub = sleeper ? ['Wake', sleeper] : ready ? ['Tend', ready] : null;
  let bub = '';
  if (pickBub) {
    const [verb, [id, name, label]] = pickBub, i = LESSONS.findIndex((l) => l[0] === id), sl = SLOTS[i];
    const text = `${verb} ${label || name}`, w = text.length * 9 + 28, bx = Math.max(6, Math.min(384 - w, sl.x - w / 2)), by = sl.y - 100 * sl.s - 36;
    bub = `<g data-bubble="${verb}"><rect x="${bx}" y="${by}" width="${w}" height="30" rx="15" fill="#fff" stroke="#12330F" stroke-width="3"/><path d="M${sl.x - 7} ${by + 29}l7 10 7-10" fill="#fff" stroke="#12330F" stroke-width="3" stroke-linejoin="round"/><path d="M${sl.x - 5} ${by + 28}h10" stroke="#fff" stroke-width="5"/><text x="${bx + w / 2}" y="${by + 20}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="15" fill="#12330F">${text}</text></g>`;
  }
  const zz = sleeper ? (() => { const sl = SLOTS[LESSONS.findIndex((l) => l[0] === sleeper[0])]; return `<g transform="translate(${sl.x + 22 * sl.s} ${sl.y - 78 * sl.s})"><ellipse rx="20" ry="11" fill="#fff" stroke="#2A74B8" stroke-width="2.6"/><text y="5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="13" fill="#2A74B8">zz</text></g>`; })() : '';
  const n = needs.length;
  el.innerHTML = `${defs()}<main class="home">${scene('day', { hill: 250, sunAt: [318, 120, 40], clouds: false })}
    <div class="top"><h1 class="disp">Your garden</h1><p class="sub">${done.length} of ${LESSONS.length} plants growing</p></div>
    <div class="yard"><svg viewBox="0 0 390 520" preserveAspectRatio="xMidYMax meet" role="group" aria-label="Your garden">${svg}${zz}${bub}</svg><div class="helper" style="left:${(304 / 390) * 100}%;top:${(396 / 520) * 100}%"></div></div>
    <div class="hero"><a class="btn" data-cta href="#/lesson/${n ? needs[0][0] : nextL[0]}">${n ? label('water', `Tend ${n} plant${n > 1 ? 's' : ''}`) : label('next', 'Next lesson', false)}</a></div></main>`;
  el.querySelector('.top').insertAdjacentHTML('afterend', `<div style="position:absolute;left:0;top:110px;z-index:1;width:100%;pointer-events:none;overflow:hidden;height:80px"><svg viewBox="0 0 390 80" width="100%" height="80" aria-hidden="true">${cloud(24, 12)}</svg></div>`);
  const sp = createSprig(el.querySelector('.helper'), { stage: Math.max(1, Math.min(4, done.length ? 2 : 1)) });
  onLeave(() => sp.destroy()); sp.setState(sleeper ? 'sleepy-return' : 'greet');
  el.querySelector('.yard').addEventListener('click', (e) => {
    const g = e.target.closest('[data-plant]'); if (!g) return;
    unlock(); g.classList.remove('pop'); void g.getBoundingClientRect(); g.classList.add('pop');
    const lab = LESSONS.find((l) => l[0] === g.dataset.plant)?.[2]; play(lab ? `ph:${lab}` : 'ui:good');
  });
}
export function code(el) {
  el.innerHTML = `<main class="codepage"><a class="back" href="#/" data-back>‹ Back</a><h1>Garden code</h1><p>Coming soon.</p><a class="btn" href="#/" data-back>Back to the seed</a></main>`;
}
