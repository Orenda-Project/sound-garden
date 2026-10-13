// Home: Track A = Tilo, the village, stickers and the sitting path. Track B = a plain lesson list and words to remember.
import { h, icon, btn, ICON, scene, picture, hasPicture, isAmbiguous } from './ui.js';
import { teacher } from './teacher.js';
import { askGrownup } from './grownup.js';
import { printLink } from './practice.js';   // PRINT-PRACTICE block 1/2 (import)
import { tilo } from './tilo.js';
import { LESSONS, lessonById } from './content.js';
import { states, LABEL } from './path.js';
import * as db from './db.js';
import { level2Teaser } from './screens/l1home.js';
import { sfx } from './sfx.js';
import { isCalm } from './motion.js';
import { countUp } from './celebrate.js';
import { wait, isFast, mark } from './audio.js';
import { avatarById } from './avatars.js';
import { applyLook } from './tilo-look.js';
import { skyKind } from './homescene.js';
import { gardenYard, plotsFor, LEVEL_NAME as GARDEN_LEVEL, lessonLabel } from './garden-scene.js';
import { play } from './audio.js';
import './living.css';
import './bhome.css';
import { sayItTile } from './sayit.js';   // Sound it out entry
import { practiceTile } from './practice-hub.js';   // Practice hub entry

export async function home(app, profile) {
  const prog = await db.progress(profile.id);
  const track = profile.track;
  const st = states(prog, track);
  const s = h('div', { class: `home track-${track}` });
  // nodes that opened because of the sitting just finished: drawn locked first, then the lock wobbles and pops (motion.css, #11). Calm motion and the test drivers get the final state at once.
  const fresh = new Set(window.__so.justUnlocked || []); window.__so.justUnlocked = [];
  const animate = fresh.size && !isCalm() && !isFast; if (fresh.size && !animate) sfx.unlock();
  const days = (prog.days || []).length;
  const av = track === 'A' ? avatarById(profile.avatar) : null;   // the friend picked in onboarding (optional)
  const hdr = h('header', { class: 'homehdr' },
    av ? h('div', { class: 'me', 'data-level': String(av.band), role: 'img', 'aria-label': `Your friend: ${av.name}`, html: av.art }) : null,
    h('div', { class: 'brand' }, 'Sound Garden'),
    track === 'A' ? null : h('div', { class: 'days', title: 'Days practised (never resets)' }, h('b', {}, String(days)), ' ', h('span', { class: 'dl' }, days === 1 ? 'day practised' : 'days practised')),
    btn('Who is reading?', 'child', { class: 'btn ghost small', say: 'ui:who', onclick: () => app.onboarding() }));
  const openX = st.find(x => x.state === 'open');
  const go = track === 'A' ? 'ui:homeGoA' : 'ui:homeGoB';
  let playBtn = null, newItems = 0, gFresh = false;
  if (track === 'A') {
    // the first view: a scene with Tilo and the garden, and a sheet with ONE big Play button and a short path (at most two locked nodes)
    s.classList.add('scene-home');
    playBtn = openX ? btn('Play', 'play', { class: 'btn tap play-big', say: go, onclick: () => app.sitting(openX.key) }) : null;
    // The garden: one plot per lesson of the level you are on. A seed is planted when a lesson is started, it sprouts as sittings are done and flowers
    // when the lesson is finished. Sprig (the seed friend) stands in the yard and grows with you. Nothing is a counter, a timer or a loss.
    const level = window.__so.gardenLevel || (openX ? (lessonById(openX.lessonId).level || 1) : Math.max(...LESSONS.map(l => l.level || 1)));
    const plots = plotsFor(level, st, LESSONS);
    const grown = plots.filter(p => p.stage === 4).length, started = plots.filter(p => p.stage > 0).length;
    const wasSeen = prog.gardenSeen2 || {}; const freshId = (plots.find(p => p.stage === 4 && wasSeen[p.id] !== 4) || {}).id;
    if (plots.some(p => wasSeen[p.id] !== p.stage)) { prog.gardenSeen2 = Object.fromEntries(plots.map(p => [p.id, p.stage])); db.saveProgress(prog); }
    const back0 = days > 0 && !window.__so.homeVisited;
    const hello = h('button', { class: 'tilo-says home-bubble', type: 'button', 'aria-label': 'Hear it again', onclick: () => teacher.seq([go]) }, !started && !days ? 'This is my garden!' : freshId ? 'Look, it bloomed!' : back0 ? 'Welcome back!' : "Let's grow!");
    const yard = gardenYard(plots, {
      freshId,
      onPick: (p, g) => {
        g.classList.remove('pop'); void g.getBoundingClientRect(); g.classList.add('pop');
        if (p.open && !p.locked) { teacher.say?.('ui:good'); return app.sitting(p.open); }   // an open plot: go and plant it
        if (p.stage > 0 && p.label) play(`ph:${p.label.replace(/_/g, '')}:pure`);              // a grown plant says its sound
        else if (p.locked) teacher.say('ui:lockedNote');
      },
    });
    const lv = h('nav', { class: 'garden-levels', 'aria-label': 'Garden levels' }, ...[...new Set(LESSONS.map(l => l.level || 1))].filter(n => n <= 4).map(n => {
      const first = LESSONS.find(l => (l.level || 1) === n); const openL = st.some(x => x.lessonId === first.id && x.state !== 'locked');
      const b = h('button', { class: `lvchip${n === level ? ' on' : ''}${openL ? '' : ' shut'}`, type: 'button', 'aria-label': `Level ${n}, ${GARDEN_LEVEL[n]}${openL ? '' : ', not open yet'}`, 'aria-pressed': String(n === level) }, String(n));
      b.addEventListener('click', () => { window.__so.gardenLevel = n; app.home(); });
      return b;
    }));
    s.classList.add('scene-home', 'garden-home');
    playBtn = openX ? btn('Play', 'play', { class: 'btn tap play-big', say: go, onclick: () => app.sitting(openX.key) }) : null;
    s.append(h('div', { class: 'home-top' },
      h('div', { class: 'scene-area' }, scene({ h: 560 }), h('div', { class: `sky-tint ${skyKind()}`, 'aria-hidden': 'true' }), hdr, h('h1', { class: 'garden-title' }, 'Your garden'), h('p', { class: 'garden-sub' }, `${grown} of ${plots.length} flowers in bloom`), lv, yard, h('div', { class: 'scene-tilo' }, h('div', { class: 'gshadow', 'aria-hidden': 'true' }), h('div', { class: 'tilo-slot' })), hello),
      h('div', { class: 'sheet home-sheet' }, h('span', { class: 'tag' }, 'Today'), playBtn, miniPath(st), practiceTile(app, prog, track)),
    ), h('h2', { class: 'allsounds' }, 'All sounds'));
    newItems = freshId ? 1 : 0; gFresh = false;
  } else {
    // Track B: a cool landscape header with the big numeral and the words as chips, then an Up-next card, then the lessons (no mascot)
    s.classList.add('b-home');
    const words = readWords(prog);
    const nextL = openX && lessonById(openX.key.split(':')[0]);
    const lsOf = nextL ? st.filter(x => x.lessonId === nextL.id) : [];
    const doneL = lsOf.filter(x => x.state === 'done').length;
    const ring = pct => `<svg viewBox="0 0 60 60" width="64" height="64" aria-hidden="true"><circle cx="30" cy="30" r="25" stroke="#DCE6E4" stroke-width="7" fill="none"/><circle cx="30" cy="30" r="25" stroke="#176B6A" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="${(157 * (1 - pct)).toFixed(0)}" transform="rotate(-90 30 30)"/></svg>`;
    s.append(h('div', { class: 'b-head' }, scene({ kind: 'cool', h: 372 }), hdr,
      h('div', { class: 'b-hero' }, h('div', { class: 'eyebrow' }, 'Words you can read now'), words.length ? h('div', { class: 'num', 'aria-label': `${words.length} words` }, h('span', { class: 'count' }, '0')) : h('div', { class: 'num soon' }, 'Your first words are 3 sounds away'),
        words.length ? h('div', { class: 'chips', 'aria-label': 'Some of your words' }, ...words.slice(0, 7).map(w => h('span', {}, w)), words.length > 7 ? h('span', { class: 'more' }, `+${words.length - 7}`) : null) : null)));
    const started = Object.keys(prog.sittings || {}).length > 0;
    if (openX && nextL) s.append(h('button', { class: `b-up hero${started ? '' : ' first'}`, type: 'button', 'aria-label': `${started ? 'Continue' : 'Start'}: Lesson ${nextL.id.slice(1)}, ${nextL.title}`, onclick: () => app.sitting(openX.key) },
      h('span', { class: 'ring', html: ring(lsOf.length ? doneL / lsOf.length : 0) }, h('b', {}, started ? `${doneL}/${lsOf.length}` : '', started ? null : h('i', { class: 'pg', html: ICON.play }))),
      h('span', { class: 'ct' }, h('span', { class: 'k' }, `Lesson ${nextL.id.slice(1)}`), h('span', { class: 't' }, started ? `Continue: ${nextL.title}` : `Start: ${nextL.title}`)), h('span', { class: 'go', html: ICON.arrow })));
    s.append(practiceTile(app, prog, track));   // Practice hub (practice-hub.js)
    s.append(h('h1', { class: 'lessons-title' }, 'Lessons'));
  }
  // --- Sound it out entry (sayit.js): one tile, unlocked after L1.02 ---
  s.append(sayItTile(app, prog, track));
  // --- end Sound it out entry ---
  const LEVEL_NAME = { 2: 'Sounds Together', 3: 'Long Vowels', 4: 'Longer Words' };
  let lastLevel = 1, bOpenN = 0;
  for (const l of LESSONS) {
    if ((l.level || 1) !== lastLevel) {   // a level card before the first lesson of Level 2, 3, 4 (locked until the level before is checked)
      lastLevel = l.level || 1;
      const open = st.some(x => x.lessonId === l.id && x.state !== 'locked') && !(animate && st.some(x => x.lessonId === l.id && fresh.has(x.key)));
      s.append(h('section', { class: `level-card${open ? '' : ' locked'}`, 'data-level': String(lastLevel) },
        h('h2', { 'data-say': `ui:lvl${lastLevel}${open ? '' : ',ui:lockedNote'}` }, `Level ${lastLevel}${LEVEL_NAME[lastLevel] ? ` · ${LEVEL_NAME[lastLevel]}` : ''}`),
        h('p', { class: 'muted small' }, open ? 'Open. Pick up where you stopped.' : `Opens when you pass the Level ${lastLevel - 1} check.`)));
    }
    const ls = st.filter(x => x.lessonId === l.id);
    const lstate = prog.lessons[l.id]?.state;
    const doneN = ls.filter(x => x.state === 'done').length, pct = ls.length ? Math.round(100 * doneN / ls.length) : 0;
    const bHead = track === 'B' ? [h('span', { class: 'ico' + (pct === 100 && l.title.length > 9 ? ' ok' : doneN === 0 && ls.every(x => x.state === 'locked') ? ' lock' : doneN && pct < 100 ? ' prog' : ''), html: pct === 100 && l.title.length > 9 ? ICON.check : doneN === 0 && ls.every(x => x.state === 'locked') ? ICON.lock : '' }, (pct === 100 && l.title.length > 9) || (doneN === 0 && ls.every(x => x.state === 'locked')) ? null : h('span', {}, l.title.length <= 9 ? l.title : l.id.slice(1))),
      h('span', { class: 'lt' }, h('b', {}, `Lesson ${l.id.slice(1)}`), h('span', { class: 'sub' }, l.title), h('span', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: `width:${pct}%` + (pct < 100 && doneN ? ';background:linear-gradient(#F4B466,#E39A4A)' : '') }))), h('em', {}, `${pct}%`)] : null;
    // Track B: finished lessons fold into one line, the next two stay open, the rest are quiet one-liners (their sittings stay in the page, just folded)
    let bMode = null;
    if (track === 'B') { if (pct === 100) bMode = 'done'; else { bOpenN = (bOpenN || 0) + 1; bMode = bOpenN <= 2 ? null : 'quiet'; } }
    const sec = h('section', { class: 'lesson' + (bMode ? ` fold ${bMode}` : ''), 'data-level': String(l.level || 1) }, h('h3', { class: track === 'B' ? 'lhead' : null }, ...(bHead || [`Sounds: ${l.title}`]),
      lstate === 'checked' ? h('span', { class: 'badge' }, 'checked by tapping') : lstate === 'still_learning' ? h('span', { class: 'badge soft' }, 'still learning') : null));
    if (track === 'B') sec.append(printLink(l.id, 'Print practice'));   // PRINT-PRACTICE block 2/2 (Track B lesson row)
    const path = h('div', { class: track === 'A' ? 'path winding' : 'list' });
    let ni = 0;
    for (const x of ls) {
      const label = x.label || (x.new?.length ? x.new.join(' ') : LABEL[track][x.id] || x.id);
      const say = x.new?.length ? `name:${x.new[0]}` : ({ D: 'ui:lblWords', R: 'ui:lblRead', L: 'ui:lblListen', X: track === 'A' ? 'ui:lblCheck' : 'ui:lblCheckB' })[x.id] || null;
      // a locked node stays focusable (aria-disabled, not disabled) and carries its reason as a description; pressing it just says the reason
      const locked = x.state === 'locked' || (animate && fresh.has(x.key));
      const why = locked ? h('span', { class: 'sr-only', id: `why-${x.key.replace(/[^\w]/g, '-')}` }, 'Locked. It opens after the check before it.') : null;
      const glyph = track === 'A' && !x.new?.length ? glyphFor(x, label) : null;   // Track A: a picture on the node, never a word (the word stays as the accessible name)
      const off = track === 'A' ? WIND[ni++ % WIND.length] : 0;
      const b = h('button', { class: `node ${locked ? 'locked' : x.state}${x.new?.length || track === 'A' ? '' : ' wide'}`, 'data-key': x.key, 'data-say': locked ? (say ? `${say},ui:lockedNote` : 'ui:lockedNote') : say, 'aria-disabled': locked ? 'true' : null, 'aria-describedby': why?.id || null, style: track === 'A' ? `--off:${off}px` : null },
        locked ? icon('lock') : x.state === 'done' ? icon('check') : null,
        glyph ? h('span', { class: 'gl', html: ICON[glyph] }) : null,
        glyph ? h('span', { class: 'sr-only' }, label) : h('span', { class: x.new?.length ? `letters${label.length > 3 ? ' long' : ''}` : '' }, label));
      b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') { teacher.say('ui:lockedNote'); return; } app.sitting(x.key); });
      // the next node stands in a row with Tilo beside it and its name underneath
      if (track === 'A' && x.state === 'open' && !locked) {
        const stand = h('div', { class: 'stand', style: `--off:${off}px` }, b, h('span', { class: 'openlabel', 'aria-hidden': 'true' }, glyph ? label : `Sound: ${label}`));
        path.append(stand); if (why) path.append(why); continue;
      }
      path.append(b); if (why) path.append(why);
    }
    sec.append(path); s.append(sec);
  }
  const teaser = level2Teaser(prog, track); if (teaser) s.append(teaser);   // (appending null drew the word "null" on Home once Level 2 shipped)
  if (track === 'B' && (prog.words || []).length) s.append(h('section', { class: 'lesson' }, h('h3', {}, 'Words to remember'), h('p', { class: 'wordlist' }, prog.words.join(' · '))));
  if (track === 'A') {   // below the path: the village, the stickers and (once) the grown-up guide card, so the child's first view is the path and the glowing node
    s.append(h('div', { class: 'stickers', 'aria-label': 'Stickers' }, ...(prog.stickers || []).map(x => h('span', {}, x))));
    if (!(await db.setting('guideCardSeen'))) { db.setting('guideCardSeen', true); s.append(helpCard(app)); }
  }
  s.append(holdGate(() => askGrownup().then(ok => { if (ok) app.grownups(); })));
  app.mount(s);
  if (track === 'A') {
    const slot = s.querySelector('.scene-tilo .tilo-slot');
    tilo.dock(slot); applyLook(profile.tiloLook?.scarf); tilo.setStage(Math.min(4, 1 + Math.floor(Object.values(prog.lessons || {}).filter(x => x.state === 'checked').length / 3))); tilo.arrive(); if (newItems && !isCalm()) tilo.emote('celebrating', null, 1700);
  }
  if (animate) unlockSequence(s, st, fresh, track);
  if (track === 'B') { const c = s.querySelector('.b-hero .count'); if (c) countUp(c, readWords(prog).length, 700); }
  // Home speaks: "Welcome back" on a return visit, then which node to tap; a stall points at that node
  const so = window.__so; const back = days > 0 && !so.homeVisited; so.homeVisited = true;
  const openNode = () => playBtn || s.querySelector('.node.open');
  teacher.track(track);
  teacher.prompt(back ? ['ui:welcomeBack', go] : [go], { nudge: go, hint: () => { const n = openNode(); n?.scrollIntoView?.({ block: 'center' }); teacher.point(n); }, replay: () => teacher.seq([go]) });
}

// Track A path: the picture on a node. An ear for listen, a book for read, a speech bubble for words, a trophy for a check, a speaker for sound games.
const WIND = [0, 46, 70, 46, 0, -46, -70, -46];   // the winding path: each node steps sideways (px) from the centre line
function glyphFor(x, label) {
  if (x.id === 'L') return 'ear';
  if (x.id === 'R') return 'book';
  if (x.id === 'D') return 'chat';
  if (x.id === 'X' || /check/i.test(label)) return 'trophy';
  return 'speaker';
}

function readWords(prog) {
  // real words from passed lessons' blend lists (Track B "words you can read now")
  const done = new Set(Object.keys(prog.sittings).filter(k => prog.sittings[k].passed).map(k => k.split(':')[0]));
  return [...new Set(LESSONS.filter(l => done.has(l.id)).flatMap(l => l.blendList?.real || []))];
}

// the unlock moment: lock wobbles (300 ms), pops off (250 ms), the node takes its colour, pops, and a ring grows; the level card opens with it
async function unlockSequence(s, st, fresh, track) {
  await wait(650);
  for (const key of fresh) {
    const b = s.querySelector(`.node[data-key="${key}"]`); if (!b) continue;
    const x = st.find(y => y.key === key); const lock = b.querySelector('.icon');
    lock?.classList.add('wobble'); await wait(300); lock?.classList.add('pop'); sfx.unlock(); await wait(250);
    lock?.remove(); b.classList.remove('locked'); b.classList.add(x.state); b.removeAttribute('aria-disabled'); b.removeAttribute('aria-describedby'); b.nextElementSibling?.classList.contains('sr-only') && b.nextElementSibling.remove();
    b.dataset.say = (b.dataset.say || '').split(',').filter(k => k !== 'ui:lockedNote').join(',') || '';
    if (!b.dataset.say) b.removeAttribute('data-say');
    b.classList.add('unlocked-now'); setTimeout(() => b.classList.remove('unlocked-now'), 900);
    const card = b.closest('.lesson')?.previousElementSibling; if (card?.classList.contains('level-card') && card.classList.contains('locked')) { card.classList.remove('locked'); const p = card.querySelector('p'); if (p) p.textContent = 'Open. Pick up where you stopped.'; }
  }
}

// The grown-ups corner: HOLD it for 2 seconds to reach the sum (a toddler's random tap never gets near it). A tap only shows how.
// A keyboard or screen-reader activation (click with detail 0) cannot hold, so it opens the sum straight away.
function holdGate(open) {
  const fill = h('span', { class: 'fill', 'aria-hidden': 'true' });
  const b = btn('For grown-ups', 'lock', { class: 'btn ghost small grownups holdbtn', say: 'ui:forGrownups', 'aria-describedby': 'hold-hint' });
  b.prepend(fill);
  const hint = h('p', { class: 'muted small hold-hint', id: 'hold-hint' }, 'Hold for 2 seconds.');
  let t = 0, fired = false;
  const cancel = () => { clearTimeout(t); b.classList.remove('holding'); };
  b.addEventListener('pointerdown', e => {
    if (e.button > 0) return; fired = false; b.classList.add('holding');
    t = setTimeout(() => { fired = true; b.classList.remove('holding'); mark('grownup-hold'); open(); }, 2000);
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, cancel);
  b.addEventListener('click', e => { if (e.detail === 0) return open(); if (!fired) hint.textContent = 'Keep holding for 2 seconds.'; fired = false; });
  return h('div', { class: 'foot-note hold-wrap' }, b, hint);
}

function helpCard(app) {
  const c = h('div', { class: 'helpcard', role: 'note' },
    h('p', {}, 'Helping a child? Read the 1-minute guide'),
    btn('Read it', null, { class: 'btn primary small', onclick: async () => { if (await askGrownup()) app.guide('start_here'); } }),
    printLink('guide-teach', 'Print the guide', 'btn ghost small'),   // TEACH-GUIDE
    h('button', { class: 'x', type: 'button', 'aria-label': 'Not now', onclick: () => c.remove() }, '\u00d7'));
  return c;
}

// The short path in the Home sheet: the last two finished nodes, the open one, and at most two locked ones. Decorative (Play is the control); the full map is under "All sounds".
function miniPath(st) {
  const i = st.findIndex(x => x.state === 'open');
  const from = i < 0 ? Math.max(0, st.filter(x => x.state === 'done').length - 3) : Math.max(0, i - 2);
  const items = st.slice(from, i < 0 ? undefined : i + 3);
  const el = h('div', { class: 'mini-path', 'aria-hidden': 'true' });
  items.forEach((x, k) => {
    if (k) el.append(h('i', { class: 'd' + (x.state === 'locked' ? ' off' : '') }));
    const letters = x.new?.length ? x.new.join('') : null;
    const pic = x.state === 'open' && letters ? nodePicture(x) : null;   // the lesson's picture word (s -> sun), not a bare letter
    const inner = x.state === 'done' ? icon('check') : x.state === 'locked' ? icon('lock') : pic || (letters ? h('b', { class: 'ltr' }, letters) : h('span', { class: 'gl', html: ICON[glyphFor(x, x.label || '')] }));
    el.append(h('div', { class: `pn ${x.state === 'open' ? 'now' : x.state}` }, inner));
  });
  return el;
}

// a picture for the open node: a plain object word that starts with the new sound (s -> sun), else the letter itself
const OBJECTS = ['sun', 'sock', 'mat', 'top', 'pan', 'pin', 'apple', 'ant', 'dog', 'cat', 'map', 'net', 'pig', 'hen', 'cup', 'bus', 'bed', 'fish', 'hat', 'jam', 'kite', 'lamp', 'nut', 'rat', 'tent', 'van', 'web', 'box', 'zip'];
function nodePicture(x) {
  const c = x.new[0];
  const w = OBJECTS.find(v => v[0] === c && !isAmbiguous(v) && hasPicture(v));
  return w ? picture(w) : null;
}
