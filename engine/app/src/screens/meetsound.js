// Meet a sound: the compact teaching flow for one new sound (plan/sounds/proposal.md section 3, Read Write Inc. pure sounds + UFLI).
//   1 picture anchor   "sss ... snake"        (ph:<x>:anchor)
//   2 the pure sound   played once (v5 clips are already long or repeated), plus the mouth cue line   (ph:<x>:pure, the lesson's mouth-cue clip)
//   3 inside its word  "s ... un"             (ph:<x>:stretch; vowels have none, that beat is skipped)
//   4 your turn        say it out loud, never graded: a grown-up / "I said it" tick, then the model again
//   5 pick             two confusable sounds, tap the letter that makes the sound you hear (never blocks)
// About 40 s per sound. Next is on screen the whole time: a learner can leave any beat at once. Nothing here is recorded as a result.
// A sound with no v2 anchor clip falls back to the old Hear-it screen, so nothing goes silent.
import { play, wait, mark, isFast } from '../audio.js';
import { h, icon, btn, speaker, picture, hasPicture } from '../ui.js';
import { g2p, audioIndex } from '../content.js';
import { teacher } from '../teacher.js';
import { hear } from './hear.js';
import LINES from '../../../content/teacher_lines.json';
import '../meetsound.css';

export const hasMeetSound = pid => !!(pid && audioIndex.clips[`ph:${pid}:anchor`] && audioIndex.soundsV2?.[pid]);
// sounds a 5-year-old mixes up (RWI/UFLI contrast pairs); the partner is used when the learner already knows its letter
const PAIRS = { t: 'd', d: 't', p: 'b', b: 'p', k: 'g', g: 'k', f: 'v', v: 'f', s: 'z', z: 's', sh: 's', m: 'n', n: 'm', a: 'e', e: 'i', i: 'e', o: 'u', u: 'o', ng: 'n', ch: 'sh', j: 'ch', th: 'f' };
const LIPS = '<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M3 16c6-9 13-10 21-6 8-4 15-3 21 6-6 10-13 12-21 12S9 26 3 16z" fill="currentColor"/><path d="M5 16c12 3 26 3 38 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';

const reps = () => 1;   // v5 teacher-style clips are already long or repeated ("mmmm", "tuh, tuh, tuh"): play once
function captionFor(letter, cls) {   // the sounds as the learner sees them: held sounds stretched (s -> sss, sh -> shhh), the rest repeated
  return cls.startsWith('held') ? `${letter + letter.slice(-1).repeat(2)} …` : `${letter}, ${letter}, ${letter} …`;
}
const bold = (letter, word) => { const n = word.toLowerCase().startsWith(letter.toLowerCase()) ? letter.length : 1; return [h('b', {}, word.slice(0, n)), word.slice(n)]; };

function foilFor(ctx, letter, pid) {
  const ok = g => g && g2p[g] && g2p[g] !== pid && audioIndex.clips[`ph:${g2p[g]}:pure`];
  const known = ctx.known().filter(g => g !== letter);
  const partner = PAIRS[pid] && known.find(g => g2p[g] === PAIRS[pid]);
  if (ok(partner)) return partner;
  // the real confusable, even before its own lesson: this pick is by ear and is never scored (RWI/UFLI contrast pairs)
  const unseen = PAIRS[pid] && Object.keys(g2p).filter(g => g2p[g] === PAIRS[pid]).sort((a, b) => a.length - b.length)[0];
  if (ok(unseen)) return unseen;
  const last = [...known].reverse().find(ok);
  if (last) return last;
  const sib = (ctx.lesson.sittings || []).flatMap(s => s.new || []).find(ok);   // a letter of this same lesson (taught a sitting later): the ear alone tells them apart
  return ok(sib) ? sib : null;
}

export async function meetSound(ctx, letter) {
  const pid = g2p[letter];
  if (!hasMeetSound(pid)) return hear(ctx, letter);
  const info = audioIndex.soundsV2[pid], cls = info.cls, word = info.word;
  const stretchWord = info.stretchWord || null;
  const src = ctx.lessonSitting(letter);
  const cueKey = `mouth_${ctx.lesson.id}_${src?.id}`;
  const cue = LINES[cueKey]?.text || null;
  const hasCue = !!cue && ctx.hasClip(`ui:${cueKey}`);
  const hasStretch = !!audioIndex.clips[`ph:${pid}:stretch`];
  const foil = foilFor(ctx, letter, pid);
  const beats = ['anchor', 'sound', hasStretch ? 'word' : null, 'turn', foil ? 'pick' : null].filter(Boolean);
  const dots = i => h('div', { class: 'sm-dots', 'aria-hidden': 'true' }, ...beats.map((b, j) => h('i', { class: j < i ? 'done' : j === i ? 'now' : '' })));
  const pure = () => play(`ph:${pid}:pure`);
  const pureN = async n => { for (let i = 0; i < n; i++) { if ((await pure()) === false) return false; if (i < n - 1) await wait(450); } return true; };
  const nudgeNext = { nudge: 'ui:idleArrow' };
  mark('meet-sound', { letter, pid, beats });

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const s = ctx.stage(); s.classList.add('sm', `smb-${b}`);
    const last = i === beats.length - 1;
    s.append(dots(i));
    let narrate;
    if (b === 'anchor') {
      const pic = hasPicture(word) ? picture(word) : null;
      const card = h('button', { class: 'sm-card sm-anchor', type: 'button', 'aria-label': `${letter}, ${word}. Tap to hear it again` },
        pic || h('div', { class: 'sm-bigword' }, word),
        h('span', { class: 'sm-chip', 'aria-hidden': 'true' }, letter),
        h('span', { class: 'sm-cap', 'aria-hidden': 'true' }, captionFor(letter, cls), ' ', ...bold(letter, word)));
      const say = async () => { card.classList.add('pop'); const r = await play(`ph:${pid}:anchor`); card.classList.remove('pop'); return r; };
      card.addEventListener('click', say);
      s.append(h('h2', {}, 'A new sound'), card, h('div', { class: 'sm-ear' }, speaker(null, { label: 'Hear it again', onplay: say })));
      narrate = () => ctx.instruct([], { stim: say, ...nudgeNext });
    } else if (b === 'sound') {
      const ring = h('div', { class: 'sm-ring' }, h('span', {}, letter));
      const say = async () => { ring.classList.add('on'); try { return await pureN(reps(cls)); } finally { ring.classList.remove('on'); } };
      ring.addEventListener('click', say); ring.setAttribute('role', 'button'); ring.tabIndex = 0;
      ring.setAttribute('aria-label', `The sound ${letter}. Tap to hear it`);
      s.append(h('h2', {}, 'Listen to the sound'), ring, h('div', { class: 'sm-ear' }, speaker(null, { big: true, label: 'Hear the sound', onplay: say })),
        cue ? h('div', { class: 'cue sm-cue' }, h('span', { class: 'sm-lips', html: LIPS }), h('span', {}, cue)) : null);
      const all = async () => {
        if ((await say()) === false) return false;
        if (!hasCue) return true;
        await wait(300);
        if ((await play('ui:mouthLead')) === false) return false;
        return play(`ui:${cueKey}`);
      };
      narrate = () => ctx.instruct('ui:hearIntro', { stim: all, ...nudgeNext });
    } else if (b === 'word') {
      const w = stretchWord || word;
      const n = w.toLowerCase().startsWith(letter.toLowerCase()) ? letter.length : 1;
      const tiles = h('div', { class: 'sm-word', 'aria-label': w }, ...[...w].map((c, k) => h('span', { class: 'sm-l' + (k < n ? ' hl' : '') }, c)));
      const say = async () => { tiles.classList.add('on'); try { return await play(`ph:${pid}:stretch`); } finally { tiles.classList.remove('on'); } };
      tiles.addEventListener('click', say);
      s.append(h('h2', {}, 'Inside a word'), tiles, h('p', { class: 'prompt sm-sub' }, 'You hear it at the start.'), h('div', { class: 'sm-ear' }, speaker(null, { big: true, label: 'Hear the word', onplay: say })));
      narrate = () => ctx.instruct('ui:hearExample', { stim: say, ...nudgeNext });
    } else if (b === 'turn') {
      const tick = btn(ctx.track === 'A' ? 'I said it' : 'Heard it', 'star', { class: 'btn small sm-tick', say: 'ui:goodSounding', type: 'button' });
      const again = btn('Again', 'play', { class: 'btn ghost small sm-again', say: 'ui:hearAgain', type: 'button' });
      const pill = h('div', { class: 'btn primary myturn sm-pill', role: 'status' }, icon('mic', 'icon bi'), h('span', { class: 'bl' }, 'Your turn: say it'));
      const wave = h('div', { class: 'sm-wave', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'), h('i'));
      tick.addEventListener('click', () => { tick.classList.add('ticked'); tick.disabled = true; mark('say-tick', { pid }); });
      const turn = async () => {
        pill.classList.add('listening');
        await wait(2600);                       // the learner says it aloud: the app never listens, never scores
        pill.classList.remove('listening');
        if ((await pure()) === false) return false;   // then the model again, to compare with
        return true;
      };
      again.addEventListener('click', () => turn());
      s.append(h('h2', {}, 'Your turn'), h('div', { class: 'sm-big', 'aria-hidden': 'true' }, letter), wave, pill,
        h('p', { class: 'prompt sm-sub' }, 'Say it out loud. No “uh” at the end.'), h('div', { class: 'row' }, tick, again),
        cue ? h('div', { class: 'cue sm-cue' }, h('span', { class: 'sm-lips', html: LIPS }), h('span', {}, cue)) : null);
      narrate = () => ctx.instruct('ui:yourTurn', { stim: turn, nudge: 'ui:idleSay' });
    } else {   // pick
      const cards = [{ g: letter, ok: true }, { g: foil, ok: false }].sort(() => Math.random() - .5);
      const row = h('div', { class: 'sm-pick', role: 'group', 'aria-label': 'Which letter makes the sound?' });
      let done = false;
      for (const c of cards) {
        const el = h('button', { class: 'sm-opt', type: 'button', 'data-letter': c.g, ...(c.ok ? { 'data-ok': '1' } : {}), 'aria-label': `Letter ${c.g}` }, c.g);
        el.addEventListener('click', async () => {
          if (done) return;
          mark('meet-pick', { letter, pick: c.g, ok: c.ok });
          if (c.ok) { done = true; el.classList.add('right'); row.classList.add('done'); await teacher.right({ kind: 'pick' }); }
          else { el.classList.add('wrong'); el.disabled = true; row.querySelector('[data-ok]').classList.add('glow'); await play('ui:notQuite'); await pure(); }   // a miss is never a result: listen again, the right card glows
        });
        row.append(el);
      }
      s.append(h('h2', {}, 'Which letter says it?'), h('div', { class: 'sm-ear' }, speaker(null, { big: true, label: 'Hear the sound', onplay: pure })), row);
      narrate = () => ctx.instruct('ui:soundTap', { stim: async () => { await wait(200); return pure(); }, nudge: 'ui:idlePick', hint: () => teacher.point(row.querySelector('[data-ok]')) });
    }
    await ctx.next({}, narrate);
    void last;
  }
}
