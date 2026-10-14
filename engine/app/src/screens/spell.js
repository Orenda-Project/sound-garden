// E7 Spell it: a dictated sound or word; build it from a tile tray. Single-sound sittings spell the letter only.
import { play, mark } from '../audio.js';
import { h, speaker } from '../ui.js';
import { teacher } from '../teacher.js';
import { entry, g2p } from '../content.js';

const shuffle = a => [...a].sort(() => Math.random() - 0.5);
// Foils are ONLY letters the learner has met: taught so far (known) plus s and a, which the L1.01 preview already showed and said.
// Never a letter from the future: picking "the only one I have seen" would pass without any sound-letter link (pedagogy round 1, fix 5).
export const PREVIEWED = ['s', 'a'];
export const foilsFor = (letter, known, n = 2) => shuffle([...new Set([...known, ...PREVIEWED])].filter(x => x !== letter && g2p[x])).slice(0, n);

export async function spellLetter(ctx, letter, known) {
  const s = ctx.stage();
  const pid = g2p[letter];
  const pool = shuffle([letter, ...foilsFor(letter, known)]);
  s.append(h('h2', {}, 'Which letter makes this sound?'), speaker(`ph:${pid}`, { big: true, label: 'Hear the sound' }));
  const tray = h('div', { class: 'tray' });
  let first = null, tries = 0, resolve; const done = new Promise(r => { resolve = r; });
  for (const l of pool) {
    const b = h('button', { class: 'tilebtn', 'data-letter': l }, l);
    b.addEventListener('click', async () => {
      const ok = l === letter;
      if (first === null) first = ok;
      mark('spell-letter', { letter, pick: l, correct: ok });
      b.classList.add(ok ? 'right' : 'wrong');
      if (ok) { await teacher.right({ kind: 'spell', tries: tries ? 2 : 1 }); resolve(); }
      else await teacher.wrong({ first: tries++ === 0, carrier: 'ui:thisLetterSays', model: [`ph:${pid}`] });
    });
    tray.append(b);
  }
  s.append(tray);
  await ctx.instruct('ui:spellLetter', { stim: () => play(`ph:${pid}`), nudge: 'ui:idlePick', hint: () => teacher.point(tray.querySelector(`.tilebtn[data-letter='${letter}']`)) });
  await done;
  const r = { judged: true, correct: first && !teacher.consumeHinted() };
  await ctx.record(`letter:${letter}`, 'letter', r);
  return r;
}

// Judge a new letter on three on-sight trials (hear the sound, pick the letter), mixing in an older letter when there is one,
// so a sitting that teaches one sound still has enough items to decide on (fix 7: never decide on 1 item).
export async function spellLetters(ctx, letter, known, trials = 3) {
  const older = known.filter(x => x !== letter && g2p[x]);
  const out = [];
  for (let t = 0; t < trials; t++) {
    const target = t === 1 && older.length ? older[Math.floor(Math.random() * older.length)] : letter;
    out.push(await spellLetter(ctx, target, known));
  }
  return out;
}

export async function spellWord(ctx, w, known, { judgedOnly = false } = {}) {
  const e = entry(w);
  const s = ctx.stage();
  const boxes = h('div', { class: 'boxes' });
  const slots = e.g.map((_, i) => h('button', { class: 'slot', 'data-i': i, 'aria-label': `box ${i + 1}` }));
  boxes.append(...slots);
  const extras = shuffle([...known].filter(g => !e.g.includes(g))).slice(0, 2);
  const tiles = shuffle([...e.g, ...extras]).map((g, i) => h('button', { class: 'tilebtn', 'data-g': g, 'data-k': i }, g));
  const tray = h('div', { class: 'tray' }, ...tiles);
  s.append(h('h2', {}, 'Spell it'), speaker(`w:${w}`, { big: true, label: 'Hear the word' }), boxes, tray);
  const fill = t => { const slot = slots.find(x => !x.dataset.g); if (!slot) return; slot.dataset.g = t.dataset.g; slot.dataset.k = t.dataset.k; slot.textContent = t.dataset.g; t.disabled = true; check(); };
  tiles.forEach(t => t.addEventListener('click', () => fill(t)));
  slots.forEach(sl => sl.addEventListener('click', () => { if (!sl.dataset.g) return; tiles[ +sl.dataset.k ] && (tiles.find(t => t.dataset.k === sl.dataset.k).disabled = false); delete sl.dataset.g; delete sl.dataset.k; sl.textContent = ''; sl.classList.remove('wrong'); }));
  let tries = 0, first = null, resolve; const done = new Promise(r => { resolve = r; });
  async function check() {
    if (slots.some(x => !x.dataset.g)) return;
    const ok = slots.every((x, i) => x.dataset.g === e.g[i]);
    tries++; if (first === null) first = ok;
    mark('spell-word', { word: w, correct: ok, tries });
    if (ok) { slots.forEach(x => x.classList.add('right')); await teacher.right({ kind: 'spell', tries }); return resolve(); }
    slots.forEach((x, i) => { if (x.dataset.g !== e.g[i]) x.classList.add('wrong'); });
    if (tries >= 2) { slots.forEach((x, i) => { x.textContent = e.g[i]; x.dataset.g = e.g[i]; x.classList.remove('wrong'); x.classList.add('shown'); }); await play('ui:gateReview'); return resolve(); }
    await teacher.wrong({ first: tries === 1, carrier: 'ui:thisWordSays', model: [`w:${w}`] });
  }
  await ctx.instruct('ui:spellIntro', { stim: () => play(`w:${w}`), nudge: 'ui:idlePick', hint: () => teacher.point(tray.querySelector(`.tilebtn[data-g='${e.g[slots.findIndex(x => !x.dataset.g)]}']:not(:disabled)`)) });
  await done;
  const r = { judged: true, correct: first };
  await ctx.record(`spell:${w}`, 'spell', r);
  return r;
}
