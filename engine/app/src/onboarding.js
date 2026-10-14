// First run. Track A (a pre-reader, nothing typed, everything spoken or pictured):
//   A0 splash (Sprig peeks up and waves) -> A1 "Who is reading?" on two picture cards -> A2 pick a friend (optional, skippable)
//   -> A3 a three-round first-sound mini-lesson that cannot be failed -> A4 stars, confetti and the first sticker -> A5 Home with a glowing first node.
// Track B (a grown-up learner, no mascot): B1 the same cards -> B2 three plain lines + "Start from the first sound" -> B4 the same mini-lesson
// without Sprig -> B5 "3 first sounds heard" and what comes next -> Home.
// No grown-up gate anywhere in the first run: nothing here spends money, links out or changes a setting (the gate guards the grown-ups corner, held for 2 s).
// Spoken lines are ALL existing clips (content/ui_lines.json). Lines the design asks for that have no clip are listed in plan/RESUME.md, not faked.
import { h, icon, btn, ICON, STICKERS, safePicture, scene, picture } from './ui.js';
import { teacher } from './teacher.js';
import { buddy } from './buddy.js';
import * as db from './db.js';
import { play, wait, mark, isFast, stop } from './audio.js';
import { choice, shuffle } from './screens/l1steps.js';
import { celebrate, countUp } from './celebrate.js';
import { ringEl } from './celebrate-plus.js';
import { sfx } from './sfx.js';
import { FACES, AVATARS, avatarById } from './avatars.js';
import { allSittings } from './path.js';
import { lessonById } from './content.js';
import { LOOKS, FAVS, applyLook, lookArt } from './buddy-look.js';
import { hatchSplash } from './hatch.js';

// A round Back arrow, top left (the ear is top right). The hardware Back button presses it (native.js), so the two can never disagree.
const backBtn = onclick => h('button', { class: 'onb-back', type: 'button', 'aria-label': 'Back', html: ICON.arrow, onclick: () => { stop(); onclick(); } });
// Backing out of the first steps (avatar / promise) undoes the profile the "Who is reading?" tap just made, so Back never leaves a stray "Child 2" behind.
async function abandon(app, p) {
  await db.del('profiles', p.id); await db.setting('active', window.__engine.prevActive ?? null); mark('onboard', { step: 'back-to-who' });
  return app.onboarding();
}

const ROUNDS = [   // the first three sounds of the course (L1.02 teaches s, a, t in that order). Round 1 has two cards, 2 and 3 have three. Oral only: no letter is shown.
  { word: 'sun', sound: 's', others: ['t'] },
  { word: 'apple', sound: 'a', others: ['s', 't'] },
  { word: 'top', sound: 't', others: ['s', 'a'] },
];

export async function onboarding(app) {
  const profiles = await db.all('profiles');
  const so = window.__engine; const fresh = !profiles.length && !so.splashDone; so.splashDone = true;
  // test hook for the drivers that are about the lessons, not about onboarding (shoot_buddy, shoot_pictures, drive_levels ...): a profile and straight into the first sitting
  so.demoDone = async track => { const p = { id: 'demo' + Date.now().toString(36), track, createdAt: Date.now(), name: 'Demo' }; await db.put('profiles', p); await db.setting('active', p.id); await app.start(p); finish(app, p, {}); return true; };   // review shots: the first celebration at real speed
  so.quickStart = async track => { const all = await db.all('profiles'); const p = { id: 'p' + Date.now().toString(36), track, createdAt: Date.now(), name: `${track === 'A' ? 'Child' : 'Grown-up'} ${all.filter(x => x.track === track).length + 1}` }; await db.put('profiles', p); await db.setting('active', p.id); so.homeVisited = true; app.firstSitting(p); return true; };   // not awaited: a sitting runs until it ends and page.evaluate would wait for it
  if (fresh) await hatchSplash(app);   // Sound Garden: the seed hatch (engine-overlay/hatch.js)
  return who(app, profiles);
}

// ---- A0: splash: the scene (sky, sun, hills, trees), Sprig waving on the hill with his shadow, one big gold Play button in the sheet ----------
async function splash(app) {
  const slot = h('div', { class: 'buddy-slot' });
  const play = btn('Play', 'play', { class: 'btn tap splash-play big', 'data-say': 'ui:hello' });
  const s = h('div', { class: 'onboard splash scene-screen' },
    h('div', { class: 'scene-area' }, scene({ h: 600 }), h('h1', { class: 'title scene-title' }, 'Sound Garden'), h('div', { class: 'scene-buddy' }, h('div', { class: 'gshadow', 'aria-hidden': 'true' }), slot)),
    h('div', { class: 'sheet' }, play));
  buddy.setTrack('A'); app.mount(s);
  buddy.dock(slot); buddy.pin('speaking'); buddy.hold('mmm');   // the raised-hand pose is the wave; a closed smile, no flapping, because nothing is said yet
  mark('onboard', { step: 'splash' }); sfx.hello();
  // a child taps Play (that tap also lets the browser play the voice); the test drivers do not wait
  const auto = isFast || new URLSearchParams(location.search).has('idlefast');
  await new Promise(res => { play.addEventListener('click', res, { once: true }); if (auto) setTimeout(res, 150); });
  buddy.hold(null); buddy.pin(null);
}

// ---- A1 / B1: who is reading: the scene with Sprig and his bubble, and a bottom sheet holding the two big cards ---------------------------
async function who(app, profiles) {
  const s = h('div', { class: 'onboard' });
  const choose = async track => {
    const p = { id: 'p' + Date.now().toString(36), track, createdAt: Date.now(), name: `${track === 'A' ? 'Child' : 'Grown-up'} ${profiles.filter(x => x.track === track).length + 1}` };
    await db.put('profiles', p);
    window.__engine.prevActive = await db.setting('active');
    await db.setting('active', p.id);
    await app.start(p); mark('onboard', { step: 'who', track });
    return track === 'A' ? avatarStep(app, p) : promise(app, p);
  };
  const activeId = await db.setting('active');
  const face = k => h('span', { class: 'face', html: FACES[k] });
  const slot = h('div', { class: 'buddy-slot' });
  s.className = 'onboard whoscreen scene-screen';
  s.append(h('div', { class: 'scene-area' }, scene({ h: 470 }), h('div', { class: 'scene-title', 'aria-hidden': 'true' }, 'Sound Garden'),
      h('div', { class: 'scene-buddy' }, h('div', { class: 'gshadow', 'aria-hidden': 'true' }), slot), h('div', { class: 'buddy-says who-bubble' }, h('h1', {}, 'Who is reading?'))),
    h('div', { class: 'sheet' },
      h('button', { class: 'whocard child', 'data-track': 'A', 'data-say': 'ui:child', onclick: () => choose('A') }, face('child'), h('span', { class: 'lab' }, 'A child'), icon('arrow', 'go')),
      h('button', { class: 'whocard adult', 'data-track': 'B', 'data-say': 'ui:adult', onclick: () => choose('B') }, face('adult'), h('span', { class: 'lab' }, 'A grown-up'), icon('arrow', 'go')),
      profiles.length ? h('div', { class: 'existing' }, h('p', { class: 'muted' }, 'Or carry on as:'),
        ...profiles.map(p => h('button', { class: `carry${p.id === activeId ? ' now' : ''}`, type: 'button', 'data-profile': p.id, onclick: async () => { await db.setting('active', p.id); app.boot(); } },
          avatarById(p.avatar) ? h('span', { class: 'mini-face', html: avatarById(p.avatar).art }) : h('span', { class: 'mini-face', html: FACES[p.track === 'A' ? 'child' : 'adult'] }), h('span', { class: 'cn' }, p.name), p.id === activeId ? h('span', { class: 'cnow' }, 'now') : icon('arrow', 'go')))) : null));
  if (profiles.length) s.append(backBtn(() => app.boot()));   // opened from Home: a way back that makes no new profile
  app.mount(s);
  buddy.setTrack('A'); buddy.dock(slot); buddy.arrive();   // Sprig waits on the hill and points at the cards when the child stalls
  // a first launch says hello once, then asks who is reading; the cards speak when pressed and held
  const first = !profiles.length && !window.__engine.hello; window.__engine.hello = true;
  await teacher.prompt(first ? ['ui:hello', 'ui:who'] : ['ui:who'], { nudge: 'ui:who', hint: () => teacher.point(...s.querySelectorAll('.whocard')), replay: () => teacher.seq(['ui:who', 'ui:child', 'ui:adult'], 150) });
}

// ---- A2: pick a friend (optional) ------------------------------------------------------------------------------------------------
function avatarStep(app, p) {
  const go = async () => { await meetLook(app, p); await meetFav(app, p); return miniLesson(app, p); };
  const pick = async (a, el) => {
    p.avatar = a.id; await db.put('profiles', p); mark('onboard', { step: 'avatar', id: a.id });
    el.classList.add('picked'); await wait(520); go();
  };
  const s = h('div', { class: 'onboard' }, h('h1', {}, 'Pick a friend'),
    h('div', { class: 'avatars' }, ...AVATARS.map(a => { const b = h('button', { class: 'avatar', type: 'button', 'data-avatar': a.id, 'data-level': String(a.band), 'aria-label': a.name, html: a.art }); b.addEventListener('click', () => pick(a, b)); return b; })),
    h('button', { class: 'skip-pic', type: 'button', 'data-skip': '', 'aria-label': 'Skip, choose later', 'data-say': 'ui:skip', html: ICON.skip, onclick: () => { mark('onboard', { step: 'avatar', id: null }); go(); } }),
    backBtn(() => abandon(app, p)));
  app.mount(s); mark('onboard', { step: 'avatar-screen' });
}


// ---- A2b / A2c: the pet bond (G1). Two picture choices about Sprig, no reading, no typing: his colour, then his favourite sound. Both skippable. -------------
const meetShell = (cls, bubbleText, sheetKids) => {
  const slot = h('div', { class: 'buddy-slot' });
  const bubble = h('div', { class: 'buddy-says meet-bubble', 'aria-live': 'polite' }, h('span', { class: 'mb' }, bubbleText));
  const s = h('div', { class: `onboard meet scene-screen ${cls}` },
    h('div', { class: 'scene-area' }, scene({ h: 470 }), h('div', { class: 'scene-buddy' }, h('div', { class: 'gshadow', 'aria-hidden': 'true' }), slot), bubble),
    h('div', { class: 'sheet' }, ...sheetKids));
  return { s, slot, bubble };
};
const skipBtn = step => h('button', { class: 'skip-pic meet-skip', type: 'button', 'data-skip': '', 'aria-label': 'Skip, choose later', 'data-say': 'ui:skip', html: ICON.skip, onclick: () => { mark('onboard', { step, id: null }); stop(); done(); } });
let done = () => {};

function meetLook(app, p) {
  return new Promise(async resolve => {
    done = resolve;
    const grid = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': 'Pick my colour' });
    const next = h('button', { class: 'btn primary next meet-next', type: 'button', 'aria-label': 'Next', 'data-say': 'ui:next', hidden: true, html: ICON.arrow, onclick: () => resolve() });
    const { s, slot, bubble } = meetShell('meet-look', 'Pick my colour!', [grid, h('div', { class: 'meet-actions' }, skipBtn('look'), next)]);
    for (const l of LOOKS) {
      const b = h('button', { class: 'swatch', type: 'button', role: 'radio', 'aria-checked': 'false', 'aria-label': l.name, 'data-look': l.id, style: `--c:${l.hex}` },
        h('span', { class: 'sw-art', style: `background:${l.hex}` }), h('span', { class: 'sw-ck', html: ICON.check }));
      b.addEventListener('click', async () => {
        grid.querySelectorAll('.swatch').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
        applyLook(l.id); p.buddyLook = { scarf: l.id }; await db.put('profiles', p); mark('onboard', { step: 'look', id: l.id });
        bubble.querySelector('.mb').textContent = 'I love it!'; buddy.emote('celebrating', 'ui:wow', 2200); play('ui:wow');
        next.hidden = false; next.classList.add('up');
      });
      grid.append(b);
    }
    app.mount(s); buddy.setTrack('A'); buddy.dock(slot); buddy.arrive(); applyLook(p.buddyLook?.scarf);
    mark('onboard', { step: 'look-screen' });
    teacher.prompt(['ui:idlePick'], { nudge: 'ui:idlePick', hint: () => teacher.point(...grid.querySelectorAll('.swatch')) });
  });
}

function meetFav(app, p) {
  return new Promise(async resolve => {
    done = resolve;
    const row = h('div', { class: 'favs', role: 'group', 'aria-label': 'My favourite sound' });
    const next = h('button', { class: 'btn primary next meet-next', type: 'button', 'aria-label': 'Next', 'data-say': 'ui:next', hidden: true, html: ICON.arrow, onclick: () => resolve() });
    const { s, slot, bubble } = meetShell('meet-fav', 'Pick my sound!', [row, h('div', { class: 'meet-actions' }, skipBtn('fav'), next)]);
    for (const f of FAVS) {
      const b = h('button', { class: 'favcard', type: 'button', 'data-fav': f.id, 'aria-label': `Sound ${f.id}`, 'aria-pressed': 'false' }, picture(f.word) || h('span', { class: 'favltr' }, f.id), h('span', { class: 'fav-spk', html: ICON.speaker }));
      b.addEventListener('click', async () => {
        row.querySelectorAll('.favcard').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        p.buddyFav = f.id; await db.put('profiles', p); mark('onboard', { step: 'fav', id: f.id });
        bubble.querySelector('.mb').textContent = `I love ${f.id.repeat(3)}!`; buddy.emote('celebrating', `ph:${f.id}`, 1800); play(`ph:${f.id}`);
        next.hidden = false; next.classList.add('up');
      });
      row.append(b);
    }
    app.mount(s); buddy.setTrack('A'); buddy.dock(slot); buddy.arrive(); applyLook(p.buddyLook?.scarf);
    mark('onboard', { step: 'fav-screen' });
    teacher.prompt(['ui:idlePick'], { nudge: 'ui:idlePick', hint: () => teacher.point(...row.querySelectorAll('.favcard')) });
  });
}

// ---- B2: one calm screen --------------------------------------------------------------------------------------------------------
function promise(app, p) {
  const mouth = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12.5c2.5-3.700 5-5 7-4.200l2.500 1 2.500-1c2-.8 4.500.5 7 4.200-2.500 4.500-5.500 6-9.500 6s-7-1.500-9.500-6z" fill="currentColor"/><path d="M4 12.800q8 2.400 16 0" stroke="#fff" stroke-width="1.600" fill="none" stroke-linecap="round"/></svg>';
  const s = h('div', { class: 'onboard promise promise-b track-B' },
    h('div', { class: 'pb-head' }, scene({ kind: 'cool', h: 270 }), h('div', { class: 'pb-badges', 'aria-hidden': 'true' }, h('span', { html: ICON.ear }), h('span', { html: mouth }), h('span', { html: ICON.book }))),
    h('div', { class: 'pb-body' }, h('h1', {}, 'Welcome'), h('p', { class: 'pb-sub' }, "Let's start with the first sound."),
      h('ul', {}, ...['Works with no internet.', 'No account.', 'Nothing leaves this phone.'].map(t => h('li', {}, icon('check'), h('span', {}, t))))),
    btn('Start from the first sound', 'arrow', { class: 'btn primary', 'data-start': '', onclick: () => miniLesson(app, p) }), backBtn(() => abandon(app, p)));
  app.mount(s); mark('onboard', { step: 'promise' });
}

// ---- A3 / B4: the mini-lesson ---------------------------------------------------------------------------------------------------
async function miniLesson(app, p) {
  const track = p.track;
  const bar = h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Progress', 'aria-valuemin': '0', 'aria-valuemax': '3', 'aria-valuenow': '0' }, h('i'));
  const dots = track === 'A' ? h('div', { class: 'dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')) : null;
  const body = h('main', { class: 'stage' });
  let abort = null; const aborted = new Promise(r => { abort = r; });
  const skip = btn('Skip', 'skip', { class: 'btn ghost small', say: 'ui:skip', onclick: () => { stop(); abort(true); } });
  const root = h('div', { class: `onb-lesson track-${track}` }, h('header', { class: 'hdr' }, track === 'A' ? h('div', { class: 'buddy-slot hdr-buddy' }) : null, bar), dots, body, h('footer', { class: 'foot onb-skip' }, skip));
  app.mount(root);
  if (track === 'A') { buddy.setTrack('A'); buddy.setHome(root.querySelector('.hdr-buddy')); }
  mark('onboard', { step: 'lesson' });
  const endBeat = () => { root.classList.remove('has-beat'); root.querySelector('.beat')?.remove(); buddy.endBeat(); };
  const setBar = n => { bar.firstChild.style.transform = `scaleX(${n / 4})`; bar.setAttribute('aria-valuenow', String(Math.min(n, 3))); bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump'); };

  const round = async i => {
    const r = ROUNDS[i];
    teacher.newScreen(); body.replaceChildren(); setBar(i + 1); if (i > 0) endBeat();   // the big-Sprig beat belongs to round 1; later rounds go back to the header Sprig and his question bubble
    const s = h('div', { class: 'screen enter-fwd', 'data-step': 'onboard-first' }); body.append(s);
    let beat = false;
    if (track === 'A' && i === 0) { const slot = h('div', { class: 'buddy-slot' }); const box = h('div', { class: 'beat' }, slot); s.append(box); buddy.beat(slot, box, avatarById(p.avatar) ? `Hello, ${avatarById(p.avatar).name}! Let's play!` : "Let's play!"); root.classList.add('has-beat'); beat = true; }
    const pic = safePicture(r.word, { n: i });
    s.append(h('h2', {}, 'What sound does it start with?'), ...(pic ? [h('div', { class: 'pics one' }, pic)] : []));
    const cards = shuffle([r.sound, ...r.others]).map(ph => ({ key: `ph:${ph}`, ok: ph === r.sound, id: ph }));
    const c = choice(s, cards, { cls: cards.length === 2 ? 'two' : 'three', model: [`ph:${r.sound}`] });
    const row = s.querySelector('.options');
    const rightPill = () => row.querySelector('.opt[data-ok] .opt-pick');
    // a miss: the right card glows at once (and Sprig still says "not quite ... <the sound> ... now you try")
    row.addEventListener('click', e => {
      const pill = e.target.closest('.opt-pick'); const card = pill?.closest('.opt'); if (!card || card.dataset.ok) return;
      setTimeout(() => { row.querySelector('.opt[data-ok]')?.classList.add('glow'); teacher.point(rightPill()); }, 0);
    });
    if (beat && root.getBoundingClientRect().height > window.innerHeight + 1) endBeat();   // a full screen has no room for a big Sprig
    const prompt = i === 0
      ? teacher.prompt(['ui:letsDoOne'], { stim: async () => { if ((await play(`w:${r.word}`)) === false) return false; await wait(300); if ((await play(`ph:${r.sound}`)) === false) return false; await wait(200); return teacher.say('ui:yourTurn'); }, nudge: 'ui:idlePick' })
      : teacher.prompt(['ui:l1OralFirst'], { stim: () => play(`w:${r.word}`), nudge: 'ui:idlePick' });
    await prompt;
    // round 1 has a free nudge: nothing tapped for 5 s and the right card glows, whatever the idle ladder is doing
    let nudge = null;
    if (i === 0) nudge = setTimeout(() => { row.querySelector('.opt[data-ok]')?.classList.add('glow'); teacher.point(rightPill()); }, isFast ? 400 : 5000);
    const res = await c.start();
    clearTimeout(nudge); mark('onboard', { step: 'round', i, first: !!res.correct });
    dots?.children[i]?.classList.add('on');
  };

  const run = async () => { for (let i = 0; i < ROUNDS.length; i++) await round(i); return false; };
  const skipped = await Promise.race([run(), aborted]);
  if (skipped) { mark('onboard', { step: 'skipped' }); await finish(app, p, { skipped: true }); return; }
  setBar(4);
  await finish(app, p, {});
}

// ---- A4 / B5: the first celebration, then Home ------------------------------------------------------------------------------------
async function finish(app, p, { skipped = false }) {
  const track = p.track; window.__engine.homeVisited = true;   // Home must not say "welcome back" after the very first lesson
  if (skipped) return app.home();
  const prog = await db.progress(p.id);
  const sticker = STICKERS[0];
  if (track === 'A' && !(prog.stickers || []).length) prog.stickers = [sticker];
  const today = new Date().toISOString().slice(0, 10); prog.days = [...new Set([...(prog.days || []), today])];
  await db.saveProgress(prog);
  const first = allSittings(track)[0]; const lesson = first && lessonById(first.key.split(':')[0]);
  const go = btn('Go on', 'arrow', { class: 'btn primary next', say: 'ui:next', onclick: () => { mark('onboard', { step: 'go' }); app.home(); } });
  const s = h('div', { class: `onb-done track-${track}` });
  if (track === 'A') {
    s.append(h('div', { class: 'buddy-slot' }), h('h2', {}, 'We did it!'));
    app.mount(s); buddy.dock(s.querySelector('.buddy-slot')); buddy.pin('celebrating'); buddy.arrive();
    const cele = celebrate(s, { stars: 3 });
    s.append(h('p', { class: 'cele-line' }, 'We heard sss, aaa and ttt together!'), h('div', { class: 'sticker land', 'aria-label': 'Our first sticker' }, sticker), h('p', { class: 'muted' }, 'Our first sticker!'));
    teacher.prompt(['ui:miniPass', 'ph:s', 'ph:a', 'ph:t', 'ui:sticker'], { nudge: 'ui:keepGoing', hint: () => teacher.point(go), replay: () => teacher.seq(['ui:miniPass', 'ph:s', 'ph:a', 'ph:t', 'ui:sticker']) });
    cele.done.then(() => { go.classList.add('up'); s.append(h('div', { class: 'row' }, go)); });
  } else {
    const n = h('span', { class: 'count' }, '0');
    s.append(ringEl(), h('h2', {}, h('span', { class: 'count-wrap' }, n, ' first sounds learned')),
      h('p', { class: 'next-up' }, lesson ? `Next: Lesson ${lesson.id.slice(1)} · ${lesson.title}` : 'Next: the first lesson'));
    app.mount(s); countUp(n, 3, 400); sfx.chime();
    s.append(h('div', { class: 'row' }, go));
    teacher.prompt(['ui:miniPass'], { nudge: 'ui:next', hint: () => teacher.point(go), replay: () => teacher.say('ui:miniPass') });
  }
  mark('onboard', { step: 'done', track });
}
