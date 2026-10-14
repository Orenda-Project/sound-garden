// "Sound it out": the learner puts in a word, the app divides it into the sounds the course teaches (Read Write Inc. "Fred Talk"
// sound buttons: a dot under a one-letter sound, a dash under a digraph), says each sound in turn while its button lights, slides
// the sounds together, then says the whole word. Tap any button to hear it, then say it yourself.
// Audio is only the pre-rendered clips: ph:<sound> for the parts, w:<word> for the whole word. A word with no clip gets the sounds, the
// slide and the printed word big, never a fake voice. Splitting logic lives in sayit-split.js (pure, self-checked by tools/sayit_selfcheck.mjs).
import './sayit.css';
import * as db from './db.js';
import { h, icon, btn, hasPicture, picture } from './ui.js';
import { play, stop, wait, mark } from './audio.js';
import { teacher } from './teacher.js';
import { buddy } from './buddy.js';
import { LESSONS, sittingsFor, entry, g2p, audioIndex, lexicon } from './content.js';
import { isCalm } from './motion.js';
import { announce } from './a11y.js';
import { makeSplitter, markOf, isVowelSound, NOT_FOR_GUESSING } from './sayit-split.js';

const hasClip = k => !!audioIndex.clips[k];                                  // real clips only: never the "audio coming" placeholder
const S = makeSplitter({ entry, g2p, hasClip });
const MAX_TILES = 8;
const TILE_SKIP = new Set([...NOT_FOR_GUESSING, 'ə']);                        // context and suffix spellings are not tap-in tiles
const isTile = g => g in g2p && !/[_.]/.test(g) && !TILE_SKIP.has(g);

// ---- what the learner has been taught -------------------------------------------------------------------------------
// Taught = the graphemes of every sitting the learner passed, in course order.
export function learnedFor(prog, track) {
  const order = [];
  for (const l of LESSONS) for (const s of sittingsFor(l, track)) if (prog.sittings?.[s.key]?.passed) for (const g of s.new || []) if (!order.includes(g)) order.push(g);
  return { set: new Set(order), order };
}
export const sayItOpen = learned => ['s', 'a', 't'].every(g => learned.set.has(g));   // unlocked once L1.02 has taught s, a, t

// Words the picture shelf offers: real course words whose every sound is taught, with a picture and a whole-word clip.
function pictureWords(learned) {
  const out = [];
  for (const [w, e] of Object.entries(lexicon)) {
    if (e.kind !== 'real' || !/^[a-z]+$/.test(w) || w.length < 3 || w.length > 6 || !hasPicture(w) || !hasClip(`w:${w}`)) continue;
    const r = S.annotate(S.fromWord(w), learned.set);
    if (r.allKnown && r.chunks.length <= 6 && r.chunks.every(c => !c.silent)) out.push(w);
  }
  return out.sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, 30);
}

// ---- Home tile (the only thing home.js touches) ---------------------------------------------------------------------
export function sayItTile(app, prog, track) {
  const open = sayItOpen(learnedFor(prog, track));
  const b = h('button', { class: `sy-tile${open ? '' : ' locked'}`, type: 'button', 'aria-disabled': open ? null : 'true', 'aria-describedby': open ? null : 'sy-why' },
    h('span', { class: 'sy-tile-art', 'aria-hidden': 'true' }, open ? tileArt() : icon('lock')),
    h('span', { class: 'sy-tile-txt' }, h('b', {}, 'Sound it out'), h('small', {}, open ? 'Put in a word. Hear its sounds, then the word.' : 'Opens after the first sounds: s, a, t.')),
    open ? h('span', { class: 'sy-tile-go', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' }) : null);
  if (!open) b.append(h('span', { class: 'sr-only', id: 'sy-why' }, 'Locked. It opens after the first sounds, s a t.'));
  b.addEventListener('click', () => { if (!open) { teacher.say('ui:lockedNote'); return; } app.sayIt(); });
  return b;
}
const tileArt = () => h('span', { class: 'sy-mini' }, ...['s', 'a', 't'].map((g, i) => h('i', { class: i === 1 ? 'v' : 'c' }, g)));

// ---- the screen ---------------------------------------------------------------------------------------------------------
export async function sayItScreen(app, profile) {
  const track = profile.track, A = track === 'A';
  const learned = learnedFor(await db.progress(profile.id), track);
  if (!sayItOpen(learned)) return app.home();
  const tiles = [];                 // the grapheme tiles the learner tapped (Track A and B)
  let cur = null;                   // the split result on screen
  let state = 'empty';              // empty | built | playing | blended | said
  let token = 0;                    // a newer run cancels an older one
  let told = false;                 // "Watch and listen" is said on the first run only

  const root = h('div', { class: `sayit track-${track}${A ? ' has-beat' : ''}`, 'data-state': 'empty' });
  const close = h('button', { class: 'close sy-close', 'aria-label': 'Go home', type: 'button', 'data-say': 'ui:goHome', onclick: () => { token++; stop(); app.home(); } }, icon('home'));
  const title = h('h1', {}, 'Sound it out');
  const hdr = h('header', { class: 'hdr sy-hdr' }, close, title);
  const row = h('div', { class: 'sy-row', 'aria-live': 'off' });
  const caption = h('p', { class: 'sy-caption', role: 'status' });
  const tray = h('div', { class: 'sy-tray' }, h('div', { class: 'sy-empty', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), row);
  const status = h('p', { class: 'sy-status', 'aria-live': 'polite' });
  const go = btn('Sound it out', 'play', { class: 'btn primary sy-go', type: 'button', disabled: true });
  const said = btn('I said it', 'check', { class: 'btn sy-said', type: 'button', hidden: true });
  const undo = h('button', { class: 'sy-undo', type: 'button', 'aria-label': 'Take the last letter away', disabled: true, html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' });
  const acts = h('div', { class: 'sy-acts' }, go, undo);
  const shelf = h('div', { class: 'sy-shelf', role: 'group', 'aria-label': 'Your sounds' });
  const sheet = h('section', { class: 'sy-sheet' }, h('div', { class: 'sy-grab', 'aria-hidden': 'true' }));

  // ---- Sprig's line (Track A) / a caption (Track B) ----
  const beatBox = h('div', { class: 'beat sy-beat' }, h('div', { class: 'buddy-slot' }));
  const LINES = { empty: 'Tap a sound to start a word.', built: 'Tap Sound it out.', playing: 'Watch and listen.', blended: 'Now slide the sounds together and say it out loud.', said: 'Good sounding out!' };
  function say(line) { status.textContent = line; if (A) buddy.beat(beatBox.querySelector('.buddy-slot'), beatBox, line); announce(line); }
  function setState(s) { state = s; root.dataset.state = s; say(cur?.tricky && (s === 'built' || s === 'playing') ? 'Tricky word. Stop and think.' : LINES[s]); }

  // ---- build the sound buttons for the word on screen ----
  function renderRow() {
    row.replaceChildren(); row.classList.remove('joined', 'said'); row.removeAttribute('data-n');
    root.classList.toggle('has-word', !!cur);
    if (!cur) { caption.textContent = ''; return; }
    const items = [];
    cur.chunks.forEach((c, i) => {
      if (c.kind === 'split') c.letters.forEach((_, k) => items.push({ c, i, text: c.g[k === 0 ? 0 : 2], part: k === 0 ? 'a' : 'b' }));
      else items.push({ c, i, text: c.g, part: null });
    });
    items.sort((a, b) => a.c.letters[a.part === 'b' ? 1 : 0] - b.c.letters[b.part === 'b' ? 1 : 0]);
    row.dataset.n = String(items.length);
    for (const it of items) {
      const { c, i } = it;
      const cls = ['sb', isVowelSound(c) ? 'v' : 'c', c.tricky ? 'tricky' : '', !c.known ? 'unk' : '', c.silent ? 'silent' : '', c.kind === 'split' ? `split split-${it.part}` : ''].filter(Boolean).join(' ');
      const nameOf = `${c.g.replace('_', ' ... ')}${c.tricky ? ', tricky part' : ''}${!c.known ? ', not learned yet' : ''}`;
      const b = h('button', { class: cls, type: 'button', 'data-chunk': i, 'data-g': c.g, 'data-p': c.p || '', 'aria-label': `Sound ${nameOf}. Tap to hear it.` },
        h('span', { class: 'sb-l', 'aria-hidden': 'true' }, it.text),
        c.tricky ? h('span', { class: 'sb-heart', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>' }) : null,
        h('span', { class: `sb-m ${c.silent ? 'none' : c.tricky && c.letters.length < 2 ? 'none' : markOf(c)}`, 'aria-hidden': 'true' }));
      b.addEventListener('click', () => chunkTap(i));
      row.append(b);
    }
    // a split digraph (a ... e): a bracket under the two letters that make ONE sound
    requestAnimationFrame(() => cur?.chunks.forEach((c, i) => {
      if (c.kind !== 'split') return;
      const [a, b] = ['a', 'b'].map(p => row.querySelector(`.sb[data-chunk="${i}"].split-${p}`)); if (!a || !b) return;
      const r = row.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      row.append(h('i', { class: 'sy-bridge', style: `left:${ra.left - r.left + ra.width / 2}px;width:${rb.left - ra.left - ra.width / 2 + rb.width / 2}px` }));
    }));
    const notes = [];
    if (cur.chunks.some(c => !c.known)) notes.push('Greyed parts are not learned yet.');
    if (cur.tricky) notes.push('A tricky word: the heart part does not sound the way you expect.');
    if (cur.guess) notes.push(...cur.notes.filter(n => /guess/.test(n)).length ? cur.notes : ['Best guess. English spells some sounds more than one way.']);
    else if (cur.source === 'tiles' && !cur.real) notes.push('A made-up word. Sound it out anyway.');
    caption.textContent = [...new Set(notes)].join(' ');
    caption.classList.toggle('guess', !!cur.guess);
  }

  const light = (i, on) => row.querySelectorAll(`.sb[data-chunk="${i}"]`).forEach(b => b.classList.toggle('on', on));
  const setWord = res => { token++; stop(); cur = res && S.annotate(res, learned.set); renderRow(); setState(cur ? 'built' : 'empty'); sync(); said.hidden = true; };
  function sync() {
    go.disabled = !cur; undo.disabled = !tiles.length; root.classList.toggle('has-word', !!cur);
    go.querySelector('.bl').textContent = state === 'blended' || state === 'said' ? 'Again' : cur?.tricky ? 'Hear the word' : 'Sound it out';
    for (const t of shelf.querySelectorAll('.sy-t')) t.disabled = tiles.length >= MAX_TILES && !t.classList.contains('keep');
  }

  // ---- play ----
  async function say1(key) { return hasClip(key) ? play(key) : true; }
  async function chunkTap(i) {
    if (state === 'playing') token++;           // a tap during the run takes over (the pointerdown already stopped the clip)
    const c = cur.chunks[i]; mark('sayit-chunk', { g: c.g, p: c.p });
    light(i, true);
    if (c.tricky || (!c.clip && cur.wholeClip)) await say1(cur.wholeClip || c.clip || '');
    else if (c.clip) await play(c.clip);
    light(i, false);
    if (state === 'playing') setState(cur ? 'built' : 'empty');
  }
  async function run() {
    if (!cur) return;
    const me = ++token; stop(); mark('sayit-run', { word: cur.word, source: cur.source });
    renderRow(); said.hidden = true; setState('playing'); sync();
    const alive = () => me === token;
    if (cur.tricky) {                                           // a heart word is never "sounded out": the course says so, so does Fred Talk
      await teacher.say(A ? 'ui:trickyIntroA' : 'ui:trickyIntroB'); if (!alive()) return;
      row.querySelectorAll('.sb').forEach(b => b.classList.add('on')); if (cur.wholeClip) await play(cur.wholeClip); row.querySelectorAll('.sb').forEach(b => b.classList.remove('on'));
      if (alive()) finish(); return;
    }
    if (!told) { told = true; await teacher.say('ui:blendModel'); if (!alive()) return; await wait(150); }
    for (let i = 0; i < cur.chunks.length; i++) {              // each sound in turn, its button lit; pure sounds, no "uh" added by us
      const c = cur.chunks[i]; if (c.silent) continue;
      light(i, true);
      const ok = c.clip ? await play(c.clip) : (await wait(600), true);
      light(i, false); if (ok === false || !alive()) return;
      await wait(260); if (!alive()) return;
    }
    row.classList.add('joined'); say('Now slide them together.');   // the sounds slide into one word (the printed word, no voice yet)
    await wait(isCalm() ? 200 : 700); if (!alive()) return;
    row.classList.add('said'); setState('blended'); sparkle();
    // Fred Talk: the CHILD does the blend. The app only sounds the parts, then waits; the whole-word clip comes after "I said it" as the check.
    said.hidden = false; sync();
    caption.textContent = 'Tap each sound and say it. Then say the whole word.';
    await teacher.say('ui:blendSay'); if (!alive()) return;
  }
  function finish() { setState('blended'); said.hidden = false; sync(); }   // heart word: told it is tricky, heard the whole word, then the child says it
  function sparkle() {
    if (isCalm()) return;
    const r = tray.getBoundingClientRect();
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, d = 70 + (i % 3) * 22; const e = h('i', { class: 'sy-spark', style: `left:${r.width / 2 - 9}px;top:${r.height / 2 - 9}px;--dx:${Math.cos(a) * d * 1.4}px;--dy:${Math.sin(a) * d * 0.9}px;animation-delay:${i * 30}ms` }); tray.append(e); setTimeout(() => e.remove(), 1200); }
  }
  // after the child said it: the recorded word is the answer key. No clip for this word: the printed word big and "Let's say it together", no fake voice.
  async function check() {
    const me = token; said.hidden = true; setState('said'); sync();
    if (cur.wholeClip) { caption.textContent = ''; await play(cur.wholeClip); }
    else { caption.textContent = "Let's say it together."; }
    if (me !== token) return;
    await teacher.ack('sound');
  }
  // ---- input: tiles ----
  function addTile(g) {
    if (state === 'blended' || state === 'said' || (cur && cur.source !== 'tiles')) tiles.length = 0;   // a finished or typed word: the next letter starts a new one
    if (tiles.length >= MAX_TILES) return;
    tiles.push(g); mark('sayit-tile', { g });
    token++; stop();
    const c = g2p[g]; if (hasClip(`ph:${c}`)) play(`ph:${c}`);
    setWord(S.fromTiles(tiles));
  }
  undo.addEventListener('click', () => { if (!tiles.length) return; tiles.pop(); setWord(tiles.length ? S.fromTiles(tiles) : null); });
  go.addEventListener('click', run);
  said.addEventListener('click', check);

  // ---- the shelf: the sounds taught so far, in course order ----
  const shelfG = learned.order.filter(isTile);
  const consonantFirst = shelfG;   // course order is already the order the learner met them
  for (const g of consonantFirst) {
    const p = g2p[g]; const vow = isVowelSound({ p });
    shelf.append(h('button', { class: `sy-t ${vow ? 'v' : 'c'}`, type: 'button', 'data-g': g, 'aria-label': `Sound ${g}`, onclick: () => addTile(g) }, h('span', {}, g)));
  }
  sheet.append(h('div', { class: 'sy-shead' }, h('h2', {}, 'Your sounds'), A ? picsButton() : null), shelf);
  if (!A) sheet.append(typeBox());

  // ---- Track A: a picture shelf. A picture only CHOOSES the word; it is never on screen with the printed word (decoding is not guessing from a picture) ----
  function picsButton() {
    const words = pictureWords(learned);
    const b = btn('Pictures', 'book', { class: 'btn small sy-pics', type: 'button', disabled: !words.length ? true : null });
    b.addEventListener('click', () => openPictures(words));
    return b;
  }
  function openPictures(words) {
    token++; stop();
    const ov = h('div', { class: 'sy-pic-ov', role: 'dialog', 'aria-label': 'Pick a word' });
    const cards = h('div', { class: 'sy-pic-grid' });
    for (const w of words) {
      const card = h('button', { class: 'sy-pic', type: 'button', 'data-w': w, 'aria-label': w }, picture(w));
      card.addEventListener('click', () => { ov.remove(); tiles.length = 0; mark('sayit-picture', { word: w }); setWord(S.fromWord(w)); if (cur?.wholeClip) play(cur.wholeClip); });   // hear the word you chose first: this is segmenting (word -> sounds), not decoding from the picture
      cards.append(card);
    }
    ov.append(h('div', { class: 'sy-pic-head' }, h('h2', {}, 'Pick a picture'), h('button', { class: 'close', type: 'button', 'aria-label': 'Close', onclick: () => ov.remove(), html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' })), cards);
    root.append(ov);
  }

  // ---- Track B: a keyboard field ----
  function typeBox() {
    const input = h('input', { class: 'sy-input', type: 'text', id: 'sy-in', inputmode: 'text', enterkeyhint: 'go', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', maxlength: '14', placeholder: 'a word' });
    const f = h('form', { class: 'sy-type' }, h('label', { for: 'sy-in' }, 'Or type a word'), h('div', {}, input, btn('Split it', 'arrow', { class: 'btn primary small', type: 'submit' })));
    f.addEventListener('submit', e => {
      e.preventDefault(); const r = S.fromText(input.value); if (!r) return;
      tiles.length = 0; mark('sayit-typed', { word: r.word, source: r.source }); setWord(r);
    });
    return f;
  }

  root.append(hdr);
  if (A) root.append(beatBox);
  root.append(h('div', { class: 'sy-stage' }, status, tray, caption, acts, said), sheet);
  root.prepend(h('div', { class: 'sy-scene', 'aria-hidden': 'true', html: '<svg viewBox="0 0 390 440" preserveAspectRatio="xMidYMin slice" width="100%" height="100%">' +
    '<defs><radialGradient id="syg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="318" cy="92" r="74" fill="url(#syg)"/><circle cx="318" cy="92" r="30" fill="#FFE27A"/>' +
    (A ? '<g fill="#fff" opacity=".92"><ellipse cx="70" cy="118" rx="42" ry="14"/><circle cx="58" cy="106" r="16"/><circle cx="84" cy="102" r="20"/><ellipse cx="236" cy="168" rx="34" ry="11" opacity=".8"/><circle cx="228" cy="158" r="13"/><circle cx="248" cy="156" r="15"/></g>' : '') +
    '<path style="fill:var(--sy-h1)" d="M0 330c70-40 150-52 230-26s110 22 160-6v142H0z"/><path style="fill:var(--sy-h2)" d="M0 362c80-30 150-30 230-8s110 12 160-14v100H0z"/><path style="fill:var(--sy-h3)" d="M0 392c90-22 170-12 240 4s100 6 150-10v54H0z"/>' +
    '<g><rect x="338" y="300" width="7" height="30" style="fill:var(--sy-trunk)"/><circle cx="341" cy="288" r="22" style="fill:var(--sy-leaf)"/><circle cx="333" cy="283" r="11" style="fill:var(--sy-leaf2)"/></g>' +
    '</svg>' }));
  app.mount(root);
  if (A) { buddy.setHome(null); buddy.arrive(); }
  setState('empty'); sync();
  const first = () => shelf.querySelector('.sy-t');
  teacher.prompt(['ui:meetIntro'], { nudge: 'ui:idleTap', hint: () => teacher.point(first()), replay: () => teacher.seq(['ui:meetIntro']) });
  window.__engine.sayit = { get word() { return cur?.word || null; }, get chunks() { return cur ? cur.chunks.map(c => ({ g: c.g, p: c.p, clip: c.clip, known: c.known, kind: c.kind })) : []; }, get state() { return state; }, S, learned };
}
