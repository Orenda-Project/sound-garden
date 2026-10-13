// The garden on Home (Track A): one plot per lesson of the level you are on. Progress is things growing, never a counter and never a loss:
//   not started   an empty mound (the next one has a seed on it and a soft glow)
//   in progress   a seed was planted: sprout, then leafy as more sittings are done
//   finished      a flower in a pot, labelled with the sound it taught
// Plants never wilt, sleep or go away. The garden only grows. Art comes from Sound Garden's own SVG set (src/art/art.js).
import { defs, plant, mound, PLANT_COLORS, seedShape } from '../../../src/art/art.js';
import { lessonById } from './content.js';
import { h } from './ui.js';

export const LEVEL_NAME = { 1: 'First sounds', 2: 'Sounds together', 3: 'Long vowels', 4: 'Longer words', 5: 'Reading practice', 6: 'Reading practice', 7: 'Reading practice' };

// labels: the sound(s) a lesson teaches, from its sittings ('' = review or practice lesson, drawn with the speaker icon)
export function lessonLabel(l) {
  const g = (l.sittings || []).flatMap(s => s.new || []);
  return g.length ? [...new Set(g)].slice(0, 2).join('').replace(/_/g, '') : '';
}

// back row small, front row big. Lessons fill front to back, so the garden grows away from you.
export function slots(n) {
  const per = n <= 8 ? 4 : n <= 15 ? 5 : 6;
  const rows = Math.ceil(n / per), out = [];
  for (let r = 0; r < rows; r++) {
    const t = rows === 1 ? 1 : r / (rows - 1);                        // 0 = front row, 1 = back row
    const y = 452 - t * (rows > 3 ? 230 : 200), s = +(0.98 - t * 0.5).toFixed(2);
    const inRow = Math.min(per, n - r * per);
    for (let i = 0; i < inRow; i++) {
      const span = 330, x = 30 + span * ((i + 0.5 + (r % 2 ? 0.28 : 0)) / (per + 0.28));
      out.push({ x: Math.round(x), y: Math.round(y), s });
    }
  }
  return out;
}

// st = states(prog, track) rows. Returns one record per lesson of `level`.
export function plotsFor(level, st, lessons) {
  return lessons.filter(l => (l.level || 1) === level).map(l => {
    const ls = st.filter(x => x.lessonId === l.id);
    const done = ls.filter(x => x.state === 'done').length, total = ls.length || 1;
    const open = ls.find(x => x.state === 'open');
    const stage = done >= total ? 4 : done === 0 ? 0 : done / total < 0.5 ? 2 : 3;
    return { id: l.id, label: lessonLabel(l), done, total, stage, open: open?.key || null, locked: !open && done === 0, title: l.title };
  });
}

// the SVG yard. `onPick(plot)` is called for a tapped plot.
export function gardenYard(plots, { onPick, freshId } = {}) {
  const sl = slots(plots.length);
  let svg = '', next = plots.findIndex(p => p.open && p.stage === 0);
  const order = plots.map((p, i) => i).sort((a, b) => sl[a].y - sl[b].y);     // paint far first
  for (const i of order) {
    const p = plots[i], s = sl[i], col = PLANT_COLORS[i % PLANT_COLORS.length];
    const name = p.label ? `Sound ${p.label}` : `Lesson ${p.id.slice(1)}`;
    if (p.stage === 0) {
      const isNext = i === next;
      svg += `<g class="plot${isNext ? ' next' : ''}${p.locked ? ' shut' : ''}" data-plot="${p.id}" tabindex="0" role="button" aria-label="${name}, ${p.locked ? 'not open yet' : 'ready to plant'}" transform="translate(${s.x} ${s.y + 40}) scale(${(s.s * 0.72).toFixed(2)})">
        ${isNext ? '<ellipse class="gl" cx="0" cy="-14" rx="64" ry="56" fill="#FFE98F" opacity=".55"/>' : ''}${mound(1)}${isNext ? `<g transform="translate(0 -22) scale(.62)">${seedShape}</g>` : ''}</g>`;
    } else {
      svg += plant({ ...s, id: p.id, label: p.label, color: col, stage: p.stage });
    }
  }
  const el = h('div', { class: 'yard garden-yard', role: 'group', 'aria-label': 'Your garden' });
  el.innerHTML = `${defs()}<svg viewBox="0 0 390 520" preserveAspectRatio="xMidYMax meet">${svg}</svg>`;
  if (freshId) el.querySelector(`[data-plant="${freshId}"]`)?.classList.add('pop');
  el.addEventListener('click', e => { const g = e.target.closest('[data-plant],[data-plot]'); if (!g) return; const id = g.dataset.plant || g.dataset.plot; onPick?.(plots.find(p => p.id === id), g); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const g = e.target.closest('[data-plant],[data-plot]'); if (g) { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); } } });
  return el;
}

export const lessonsOf = () => null;   // (kept so a future caller can import without touching content.js)
void lessonById;
