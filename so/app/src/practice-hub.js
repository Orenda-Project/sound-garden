// Practice: one place, reachable from Home, separate from the lesson path. Nothing here is locked and nothing is scored.
// Only what the learner has been taught is offered (progress read from the db):
//   a sound stage    pick any learned sound: hear it (ph:<x>:pure), hear it in a word (ph:<x>:anchor / :stretch), trace it (screens/trace.js)
//   Which word?      a replay game for the words they can already read (Track A: pictures only; Track B: printed words)
//   Sound it out     the sayit.js screen, if it is open
//   My garden        the days practised (Track A flowers; Track B a plain count)
//   Print sheets     the per-lesson PDFs, for the lessons begun
// No timers, no points, no "wrong": a miss just plays the word the learner tapped, and they try again.
import './practice-hub.css';
import * as db from './db.js';
import { h, btn, ICON, picture, hasPicture, isAmbiguous } from './ui.js';
import { play, stop, wait, mark, isFast } from './audio.js';
import { teacher } from './teacher.js';
import { tilo } from './tilo.js';
import { sfx } from './sfx.js';
import { isCalm } from './motion.js';
import { announce } from './a11y.js';
import { LESSONS, sittingsFor, entry, g2p, audioIndex, lexicon } from './content.js';
import { states } from './path.js';
import { dayGarden } from './homescene.js';
import { printLink, practiceUrl } from './practice.js';
import { learnedFor, sayItOpen } from './sayit.js';
import { makeSplitter, NOT_FOR_GUESSING } from './sayit-split.js';
import { trace } from './screens/trace.js';

// names and rare course words that a learner would not know as words (they stay in the lessons, not in the replay game)
const OBSCURE = new Set(['bob', 'dan', 'pam', 'sam', 'nat', 'tat', 'kin', 'pip', 'nag', 'sap', 'vat', 'vex', 'jab', 'jot', 'fib', 'dam', 'gut', 'cot', 'cog', 'yum', 'sag', 'rid', 'nip', 'zap', 'tack', 'hid']);
const hasClip = k => !!audioIndex.clips[k];
const S = makeSplitter({ entry, g2p, hasClip });
const SKIP = new Set([...NOT_FOR_GUESSING, 'ə']);
const isTile = g => g in g2p && !/[_.]/.test(g) && !SKIP.has(g);

// the sounds the learner can practise: taught, with a recorded pure sound (the older ph:<x> clip counts)
export function practiceSounds(prog, track) {
  const learned = learnedFor(prog, track);
  return { learned, sounds: learned.order.filter(g => isTile(g) && (hasClip(`ph:${g2p[g]}:pure`) || hasClip(`ph:${g2p[g]}`))) };
}
// real course words whose every sound is taught, with a whole-word clip (Track A also needs a picture a child can rely on alone)
export function practiceWords(learned, track) {
  const out = [];
  for (const [w, e] of Object.entries(lexicon)) {
    if (e.kind !== 'real' || OBSCURE.has(w) || !/^[a-z]+$/.test(w) || w.length < 2 || w.length > 6 || !hasClip(`w:${w}`)) continue;
    if (track === 'A' && (!hasPicture(w) || isAmbiguous(w))) continue;
    const r = S.annotate(S.fromWord(w), learned.set);
    if (r.allKnown && r.chunks.length <= 6 && r.chunks.every(c => !c.silent)) out.push(w);
  }
  return out.sort((a, b) => a.length - b.length || a.localeCompare(b));
}
const lessonsBegun = (prog, track) => {
  const st = states(prog, track); const ids = [];
  for (const l of LESSONS) { const ls = st.filter(x => x.lessonId === l.id); if (ls.some(x => x.state === 'done' || (x.state === 'open' && ls.some(y => y.state === 'done')))) ids.push(l.id); }
  return ids;
};

// ---- Home entry (the only thing home.js touches) ----------------------------------------------------------------------
export function practiceTile(app, prog, track) {
  const { sounds } = practiceSounds(prog, track);
  const art = h('span', { class: 'ph-tile-art', 'aria-hidden': 'true' }, ...(sounds.length ? sounds.slice(-3) : ['a']).map((g, i) => h('i', { class: i % 2 ? 'v' : 'c' }, g)));
  const b = h('button', { class: 'ph-tile', type: 'button', 'data-practice-tile': '' },
    art,
    h('span', { class: 'ph-tile-txt' }, h('b', {}, 'Practice'), h('small', {}, sounds.length ? 'Hear, trace and play with the sounds you know.' : 'Your sounds will wait here.')),
    h('span', { class: 'ph-tile-go', 'aria-hidden': 'true', html: ICON.arrow }));
  b.addEventListener('click', () => app.practice());
  return b;
}

// ---- the screen -----------------------------------------------------------------------------------------------------------
const PENCIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-5L16.5 3.5a2.1 2.1 0 013 3L8 18z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 6l4 4" stroke="currentColor" stroke-width="2.4"/></svg>';
const PRINTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="7" y="14" width="10" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';
const WORDS = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="4" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="3" y="14" width="8" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="13" y="14" width="8" height="6" rx="2" fill="currentColor"/></svg>';
const SOUNDIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2.6" fill="currentColor"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><circle cx="19" cy="12" r="2.6" fill="currentColor"/></svg>';
const FLOWER = '<svg viewBox="-17 -40 34 44" aria-hidden="true"><path d="M0 0Q-2 -12 0 -26" stroke="#2E9E5B" stroke-width="3" fill="none" stroke-linecap="round"/>' + [0, 1, 2, 3, 4].map(a => `<circle cx="${(9 * Math.cos(a * 1.2566)).toFixed(1)}" cy="${(-26 + 9 * Math.sin(a * 1.2566)).toFixed(1)}" r="6.5" fill="#FF8FB1"/>`).join('') + '<circle cx="0" cy="-26" r="5.5" fill="#FFD54A"/></svg>';

const BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const rootFor = (track, extra = '') => h('div', { class: `ph track-${track} ${extra}`.trim() });
const closeBtn = (label, onclick, name = 'home') => h('button', { class: 'close ph-close', type: 'button', 'aria-label': label, 'data-say': 'ui:goHome', onclick }, h('span', { class: 'icon', html: name === 'back' ? BACK : ICON.home }));
const sceneSvg = A => '<svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" aria-hidden="true"><defs><radialGradient id="phg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs><circle cx="326" cy="70" r="62" fill="url(#phg)"/><circle cx="326" cy="70" r="26" fill="#FFE27A"/>' +
  (A ? '<g fill="#fff" opacity=".92"><ellipse cx="64" cy="96" rx="40" ry="13"/><circle cx="52" cy="85" r="15"/><circle cx="78" cy="82" r="18"/></g>' : '<g fill="#fff" opacity=".18"><ellipse cx="80" cy="90" rx="52" ry="9"/><ellipse cx="260" cy="130" rx="60" ry="8"/></g>') +
  '<path style="fill:var(--ph-h1)" d="M0 220c70-40 150-52 230-26s110 22 160-6v112H0z"/><path style="fill:var(--ph-h2)" d="M0 252c80-30 150-30 230-8s110 12 160-14v70H0z"/></svg>';

export async function practiceScreen(app, profile, opts = {}) {
  const track = profile.track, A = track === 'A';
  const prog = await db.progress(profile.id);
  const { learned, sounds } = practiceSounds(prog, track);
  const words = practiceWords(learned, track);
  const days = (prog.days || []).length;
  let sel = opts.sound && sounds.includes(opts.sound) ? opts.sound : sounds[0] || null;   // the first sound is on the stage until they pick another
  let tok = 0;
  const so = window.__so.practice = { get sound() { return sel; }, sounds, words, track, view: 'hub', games: 0 };

  const view = (el, name) => { tok++; stop(); so.view = name; app.mount(el); };
  const head = (title, back) => h('header', { class: 'hdr ph-hdr' }, closeBtn(back ? 'Back to Practice' : 'Go home', back || (() => { tok++; stop(); app.home(); }), back ? 'back' : 'home'), h('h1', {}, title));
  const shell = (title, back, cls) => { const r = rootFor(track, cls); r.append(h('div', { class: 'ph-scene', html: sceneSvg(A) }), head(title, back)); return r; };

  // ======== the hub ========
  function hub() {
    const root = shell('Practice', null, 'ph-hub');
    const beat = A ? h('div', { class: 'beat ph-beat' }, h('div', { class: 'tilo-slot' })) : null;
    if (beat) root.append(beat);
    else if (sounds.length) root.append(h('p', { class: 'ph-sum' }, h('b', {}, String(sounds.length)), sounds.length === 1 ? ' sound learned' : ' sounds learned', words.length ? [' \u00b7 ', h('b', {}, String(words.length)), ' words you can read'] : null));

    if (!sounds.length) {   // nothing taught yet: a kind note, no locks
      root.append(h('section', { class: 'ph-empty' }, h('b', {}, A ? 'Play your first sounds with Tilo.' : 'Your first sounds are not learned yet.'), h('p', {}, 'Come back after the first lesson. Everything you learn will be here to play again.'), btn(A ? 'Play' : 'Go to the lessons', 'arrow', { class: 'btn primary', type: 'button', onclick: () => app.home() })));
      mountHub(root, beat); return;
    }

    // -- the sound stage --
    const stage = h('section', { class: 'ph-stage', 'aria-label': 'A sound to practise' });
    const chips = h('div', { class: 'ph-chips', role: 'group', 'aria-label': 'Your sounds' });
    const paint = () => {
      const g = sel, p = g2p[g], info = audioIndex.soundsV2?.[p] || null;
      const word = info?.word || null;
      // Track A leads with a picture whose spoken word we really have: the anchor word if it has a picture, else a learned word that starts with this sound
      const okPic = w => w && hasPicture(w) && !isAmbiguous(w);
      const picWord = !A ? null : okPic(word) ? word : words.find(w => w.startsWith(g) && okPic(w)) || null;
      const pic = picWord ? picture(picWord) : null;
      const hasAnchor = hasClip(`ph:${p}:anchor`), hasStretch = hasClip(`ph:${p}:stretch`);
      const hear = async k => { const m = ++tok; stage.classList.add('playing'); mark('practice-hear', { g, key: k }); try { await play(k); } finally { if (m === tok || true) stage.classList.remove('playing'); } };
      const pureKey = hasClip(`ph:${p}:pure`) ? `ph:${p}:pure` : `ph:${p}`;
      stage.replaceChildren(
        h('div', { class: 'ph-big' + (pic ? ' with-pic' : '') },
          pic ? h('div', { class: 'ph-pic' }, pic) : null,
          h('button', { class: 'ph-letter', type: 'button', 'aria-label': `The sound ${g}. Tap to hear it.`, onclick: () => hear(pureKey) }, h('span', {}, g)),
          !A && word ? h('div', { class: 'ph-word' }, word.toLowerCase().startsWith(g) ? [h('b', {}, word.slice(0, g.length)), word.slice(g.length)] : word) : null),
        h('div', { class: 'ph-acts' },
          h('button', { class: 'ph-act hear', type: 'button', 'data-act': 'hear', onclick: () => hear(pureKey) }, h('i', { html: ICON.speaker }), h('span', {}, 'Hear it')),
          (hasAnchor || picWord) ? h('button', { class: 'ph-act word', type: 'button', 'data-act': 'word', onclick: () => hear(picWord && picWord !== word ? `w:${picWord}` : `ph:${p}:anchor`) }, h('i', { html: ICON.book }), h('span', {}, 'In a word')) : null,
          h('button', { class: 'ph-act trace', type: 'button', 'data-act': 'trace', onclick: () => traceView(g) }, h('i', { html: PENCIL }), h('span', {}, 'Trace it'))));
      chips.querySelectorAll('.ph-chip').forEach(c => { const on = c.dataset.g === sel; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    };
    for (const g of sounds) {
      const vow = ['a', 'e', 'i', 'o', 'u'].includes(g2p[g]) || /^(a|e|i|o|u)/.test(g2p[g] || '');
      chips.append(h('button', { class: `ph-chip ${vow ? 'v' : 'c'}`, type: 'button', 'data-g': g, 'aria-pressed': 'false', 'aria-label': `Sound ${g}`, onclick: () => { sel = g; mark('practice-pick', { g }); paint(); const p = g2p[g]; play(hasClip(`ph:${p}:pure`) ? `ph:${p}:pure` : `ph:${p}`); } }, g));
    }
    root.append(stage, h('div', { class: 'ph-sec' }, h('h2', {}, 'Your sounds'), chips));
    paint();

    // -- the play cards --
    const cards = h('div', { class: 'ph-cards' });
    const wordsOk = words.length >= 2;
    cards.append(h('button', { class: `ph-card words${wordsOk ? '' : ' soft'}`, type: 'button', 'data-card': 'words', 'aria-describedby': wordsOk ? null : 'ph-w-why', onclick: () => { if (wordsOk) gameView(); else { announce('Learn a few more sounds, then this opens up with words.'); mark('practice-words-soon'); } } },
      A && wordsOk ? h('i', { class: 'minis', 'aria-hidden': 'true' }, ...words.filter((w, k, a) => a.findIndex(x => x[0] === w[0]) === k).slice(0, 3).map(w => picture(w))) : h('i', { html: WORDS }), h('span', { class: 'tx' }, h('b', {}, 'Which word?'), h('small', {}, wordsOk ? (A ? 'Listen, then tap the picture.' : 'Listen, then tap the word.') : 'Words show up as you learn more sounds.')),
      wordsOk ? null : h('span', { class: 'sr-only', id: 'ph-w-why' }, 'Learn a few more sounds, then words appear here.')));
    if (sayItOpen(learned)) cards.append(h('button', { class: 'ph-card si', type: 'button', 'data-card': 'sayit', onclick: () => app.sayIt() }, h('i', { html: SOUNDIT }), h('span', { class: 'tx' }, h('b', {}, 'Sound it out'), h('small', {}, 'Put in a word. Hear its sounds.'))));
    root.append(h('div', { class: 'ph-sec' }, h('h2', {}, 'Play'), cards));

    // -- the garden --
    const dg = A ? dayGarden(prog.days || [], false) : null;
    root.append(h('section', { class: 'ph-garden', 'data-card': 'garden' },
      A ? [h('h2', {}, 'My garden'), dg] : [h('h2', {}, 'Days practised'), h('p', { class: 'ph-days' }, h('b', {}, String(days)), ' ', days === 1 ? 'day. It never goes back to zero.' : 'days. It never goes back to zero.')],
      A ? h('p', { class: 'ph-note' }, days ? 'One flower for every day we played. It only grows.' : 'A flower grows for every day we play.') : null));

    // -- print sheets (grown-ups can print; a child can ask) --
    const begun = lessonsBegun(prog, track);
    const pr = h('details', { class: 'ph-print', 'data-card': 'print' }, h('summary', {}, h('i', { html: PRINTER }), h('span', { class: 'tx' }, h('b', {}, 'Print sheets'), h('small', {}, begun.length ? 'Paper practice for the lessons you have started.' : 'Paper practice appears once a lesson is started.'))),
      h('div', { class: 'ph-prints' }, ...begun.map(id => printLink(id, `Lesson ${id.slice(1)}`, 'ph-pchip')), begun.length ? printLink('level-1-all', 'Level 1, all lessons', 'ph-pchip all') : null));
    if (begun.length) root.append(pr);
    mountHub(root, beat);
  }
  function mountHub(root, beat) {
    view(root, 'hub');
    if (A) { tilo.setHome(null); tilo.arrive(); tilo.beat(beat.querySelector('.tilo-slot'), beat, sounds.length ? 'What shall we play?' : 'Soon we will have sounds to play with!'); }
    window.__so.practice.view = 'hub';
  }

  // ======== trace one sound ========
  async function traceView(g) {
    const root = shell('Trace', () => { hub(); }, 'ph-trace');
    const stageEl = h('div', { class: 'stage screen ph-tracestage' });
    root.append(stageEl);
    view(root, 'trace');
    mark('practice-trace', { g });
    const ctx = { track, stage: () => stageEl, instruct: (k, o) => (o && o.stim ? Promise.resolve(o.stim()) : Promise.resolve()), next: async o => { await o?.waitFor; } };
    try { await trace(ctx, g); } catch (e) { console.error(e); }
    if (so.view !== 'trace' || !root.isConnected) return;   // they left
    mark('practice-trace-done', { g });
    // finished both traces: back to the sound they traced, never a score
    await wait(isFast ? 0 : 700);
    if (root.isConnected) { sel = g; hub(); }
  }

  // ======== Which word? ========
  function gameView() {
    const ROUNDS = Math.min(5, words.length);
    const root = shell('Which word?', () => hub(), 'ph-game');
    const pips = h('div', { class: 'ph-pips', 'aria-hidden': 'true' }, ...Array.from({ length: ROUNDS }, () => h('i')));
    const ear = h('button', { class: 'ph-ear', type: 'button', 'aria-label': 'Hear the word again', 'data-act': 'ear', html: ICON.speaker });
    const grid = h('div', { class: `ph-grid n${Math.min(3, words.length)}`, role: 'group', 'aria-label': 'Choices' });
    const msg = h('p', { class: 'ph-msg', role: 'status', 'aria-live': 'polite' }, '');
    const count = A ? null : h('p', { class: 'ph-count' }, '');
    const beat = A ? h('div', { class: 'beat ph-beat' }, h('div', { class: 'tilo-slot' })) : null;
    root.append(...(beat ? [beat] : []), h('div', { class: 'ph-gstage' }, pips, count, ear, msg, grid));
    view(root, 'game'); so.games++;
    const me = tok;
    const alive = () => me === tok && root.isConnected;
    const say = line => { msg.textContent = A ? '' : line; if (A) tilo.beat(beat.querySelector('.tilo-slot'), beat, line); announce(line); };
    if (A) { tilo.setHome(null); tilo.arrive(); }
    // the rounds: a shuffled run through the words learned, the newest ones first in the pile
    const pool = [...words].sort(() => Math.random() - .5);
    const pick = [...pool.slice(0, ROUNDS)];
    let i = 0, target = null;
    window.__so.practice.game = { get target() { return target; }, get round() { return i; }, rounds: ROUNDS };
    const hearTarget = () => play(`w:${target}`);
    ear.addEventListener('click', () => { mark('practice-ear', { word: target }); hearTarget(); });
    const card = w => {
      const b = h('button', { class: `ph-choice${A ? ' pic' : ''}`, type: 'button', 'data-w': w, 'aria-label': A ? 'A picture. Tap it if it is the word you heard.' : w }, A ? picture(w) : h('span', { class: 'wd' }, w));
      b.addEventListener('click', async () => {
        if (b.classList.contains('right')) return;
        mark('practice-choice', { word: w, target, ok: w === target });
        if (w === target) {
          grid.querySelectorAll('.ph-choice').forEach(x => x.disabled = true); b.classList.add('right'); pips.children[i]?.classList.add('on');
          sfx.chime(); if (A && !isCalm()) tilo.emote('celebrating', null, 1800);
          say(A ? 'Yes!' : 'Yes. That is the word.'); await play(`w:${w}`); if (!alive()) return;
          await wait(isFast ? 0 : 500); if (!alive()) return;
          i++; next();
        } else {   // no buzzer, no counting: the card goes soft and says its own word, so the ear learns the difference
          b.classList.add('soft'); say(A ? 'That one says ' + w + '.' : `That one says "${w}". Listen again.`);
          await play(`w:${w}`); if (!alive()) return; await wait(isFast ? 0 : 250); if (alive()) hearTarget();
        }
      });
      return b;
    };
    function next() {
      if (!alive()) return;
      if (i >= ROUNDS) return done();
      target = pick[i]; if (count) count.textContent = `Word ${i + 1} of ${ROUNDS}`;
      // foils that look and sound clearly different from the target (another first sound first), so a miss is the ear's, never a coin toss
      const foils = pool.filter(w => w !== target).sort(() => Math.random() - .5).sort((a, b) => (a[0] === target[0]) - (b[0] === target[0])).slice(0, Math.min(2, words.length - 1));
      const opts = [target, ...foils].sort(() => Math.random() - .5);
      grid.className = `ph-grid n${opts.length}`; grid.replaceChildren(...opts.map(card)); msg.textContent = '';
      say(A ? 'Listen, then tap the picture.' : 'Listen. Tap the word you hear.');
      wait(isFast ? 0 : 300).then(() => alive() && hearTarget());
    }
    function done() {
      mark('practice-game-done', { rounds: ROUNDS });
      grid.className = 'ph-grid done';
      grid.replaceChildren(h('div', { class: 'ph-done' }, h('i', { html: FLOWER }), h('b', {}, A ? 'You found them all!' : 'All done.'),
        h('div', { class: 'ph-donebtns' }, btn('Again', 'play', { class: 'btn primary', type: 'button', 'data-act': 'again', onclick: () => gameView() }), btn('Back to Practice', 'home', { class: 'btn ghost', type: 'button', 'data-act': 'back', onclick: () => hub() }))));
      ear.hidden = true; msg.textContent = ''; say(A ? 'You found them all!' : 'All done.');
      if (!isCalm() && A) tilo.emote('celebrating', null, 2200);
    }
    next();
  }

  hub();
  return so;
}
