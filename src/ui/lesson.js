import { Gate } from '../engine/gate.js';
import { createSprig } from '../sprig/sprig.js';
import { peek } from './peek.js';
import { unlock, seq, play, stop, wait, loadMap } from '../audio.js';
import { load, save } from '../store.js';
import { TEST, onLeave } from '../router.js';
import { speaker, picture, hasPicture, mound, seedShape, defs, plant, scene } from '../art/art.js';
import { label } from './btn.js';
import { LESSONS } from '../progression.js';

// What the first sitting teaches, with a picture cue. Check screens never show these pictures on a tile.
const TEACH = {
  'L1.01': { oral: true, word: 'pig', seq: ['ph:p', 'ph:i', 'ph:g', 'w:pig'], title: 'Words are made of sounds' },
  'L1.02': { letter: 's', word: 'sun', say: ['ph:s', 'w:sun'], tiles: [['s', 'sun'], ['m', 'moon'], ['a', 'apple'], ['t', 'tent']] },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WAVE = '<svg class="wave" viewBox="0 0 390 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 16Q50 0 120 8T260 6T390 4V16Z" fill="#FBF6EA"/></svg>';
const BACK = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M19 5L9 15l10 10" fill="none" stroke="#12330F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHIP = `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="cc"><circle cx="32" cy="34" r="25"/></clipPath></defs><circle cx="32" cy="34" r="27" fill="#FBF6EA" stroke="#2F7D32" stroke-width="3"/>
<g clip-path="url(#cc)"><g transform="translate(32 52)"><g class="cs"><g transform="scale(.36)">${mound(1)}<g transform="translate(0 -18) scale(.8)">${seedShape}</g></g></g><g class="sl"><path d="M0-22q-1-6 0-9" stroke="#2F7D32" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M0-30c-7 0-9-4-9-7 6 0 9 3 9 7zM0-30c0-5 3-7 8-7 0 5-3 7-8 7z" fill="#4CB82B" stroke="#2F7D32" stroke-width="1.6"/></g></g><g class="dropwrap"><path d="M32 6q8 11 0 16-8-5 0-16z" fill="#6EC5FF" stroke="#2A74B8" stroke-width="2"/></g></g></svg>`;
const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v10M3 8l5 5 5-5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export async function mount(el, lid) {
  unlock();   // no-op if the seed tap already did it; a direct visit unlocks on first tap anywhere
  document.addEventListener('pointerdown', unlock, { once: true });
  const [data] = await Promise.all([fetch('./data/L1.json').then(r => r.json()), loadMap()]);
  const lesson = data.lessons[lid]; if (!lesson) { el.textContent = 'Lesson not found'; return; }
  const gate = new Gate(lesson.gate.items, { pass: lesson.gate.bar.pass_ });
  el.innerHTML = `<main class="lesson">
    <div class="lh"><a class="back" href="#/home" data-back aria-label="Back to the garden">${BACK}</a><div class="bar" role="progressbar" aria-label="Progress"><i></i></div><div class="chip" data-widget aria-label="This lesson's seed">${CHIP}</div>${WAVE}</div>
    <div class="cue"></div>
    <div class="fb" aria-live="polite"><div class="tint"></div><div class="mascot"></div><div class="say"><p class="word"></p><p class="sound"></p></div></div>
    <p class="prompt"></p>
    <div class="opts"></div>
    <div class="cta"><button class="btn" type="button" hidden></button></div></main>`;
  const $ = (s) => el.querySelector(s);
  const main = $('main'), fb = $('.fb'), opts = $('.opts'), prog = $('.bar i'), prompt = $('.prompt'), cta = $('.cta .btn'), cue = $('.cue'),
    word = $('.word'), snd = $('.sound'), chip = $('.chip');
  const sp = createSprig($('.mascot'), { stage: Math.max(1, load().stage) });
  onLeave(() => sp.destroy());
  const setCta = (icon, text, arrow = true) => { cta.innerHTML = label(icon, text, arrow); cta.setAttribute('aria-label', text); };
  let watered = false, token = 0, state = 'ask', target = null, streak = 0;
  const progress = () => { prog.style.transform = `scaleX(${(gate.of - gate.queue.filter(q => q.attempt === 1).length) / gate.of})`; };

  // ---------- teach: one picture-cued card before the check ----------
  function teach(T) {
    main.classList.add('teach'); state = 'teach'; progress();
    const heard = () => { main.classList.remove('teach'); stop(); show(); };
    fb.className = 'fb'; sp.setState('speaking');
    if (T.oral) {
      main.classList.add('oral');
      cue.innerHTML = `<div class="pic">${picture(T.word)}</div><div class="row"><button class="say" type="button" aria-label="Hear it again">${speaker(40)}</button><div class="beads" aria-hidden="true"><i></i><i></i><i></i></div></div>`;
      word.textContent = T.title; snd.innerHTML = 'Listen to the sounds, then the word.'; opts.replaceChildren(); prompt.textContent = '';
    } else {
      cue.innerHTML = `<button class="say" type="button" aria-label="Hear it again">${speaker(40)}</button>`;
      word.textContent = 'New sound'; snd.innerHTML = `<u>${T.letter}</u> as in ${T.word}`;
      snd.insertAdjacentHTML('beforeend', `<span class="meter" aria-hidden="true">${'<svg viewBox="0 0 20 20"><path d="M3 17C3 8 8 3 17 3c0 9-5 14-14 14Z" fill="none" stroke="#2F7D32" stroke-width="1.6"/></svg>'.repeat(6).replace('fill="none"', 'fill="#4CB82B"')}</span>`);
      opts.replaceChildren(); prompt.textContent = '';
      T.tiles.forEach(([l, w], i) => {
        const t = document.createElement('div'); t.className = 'tile';
        t.innerHTML = `<button class="opt" type="button" aria-label="Sound ${l}"><span class="pic">${picture(w)}</span><span class="w">${l}</span></button>`;
        t.querySelector('button').addEventListener('click', () => { stop(); seq([`ph:${l}`], 0); });
        opts.append(t);
      });
    }
    cta.hidden = false; cta.disabled = false; setCta('heard', 'I heard it'); cta.dataset.teachGo = '1'; cta.onclick = heard;
    const say = async () => {
      const my = ++token; stop();
      if (T.oral) {
        const beads = [...cue.querySelectorAll('.beads i')];
        beads.forEach(b => b.classList.remove('on'));
        for (let i = 0; i < 3; i++) { if (my !== token) return; beads[i].classList.add('on'); await seq([T.seq[i]], 0); await wait(120); }
        if (my === token) await seq([T.seq[3]], 0);
      } else await seq(T.say, 350);
    };
    cue.querySelector('.say').onclick = say; say();
  }

  // ---------- check: letter-only tiles, picture of the spoken word as the prompt ----------
  function show() {
    const q = gate.current(); if (!q) return finish();
    const it = gate.items[q.i], my = ++token;
    state = 'ask'; target = null; stop(); progress();
    fb.className = 'fb'; sp.setState('listening'); word.textContent = ''; snd.textContent = '';
    prompt.textContent = 'Listen. Tap the one that matches.'; prompt.style.visibility = 'visible';
    cta.hidden = true; cta.disabled = true; cta.removeAttribute('data-next'); cta.removeAttribute('data-teach-go'); cta.onclick = () => { if (state !== 'ask') show(); };
    const pic = it.printed && hasPicture(it.word);
    const keys = it.prompt?.length ? it.prompt : [`w:${it.word}`];
    cue.innerHTML = `<button class="say" type="button" aria-label="Hear it again">${speaker(40)}</button>${pic ? `<div class="pic" data-prompt-pic>${picture(it.word)}</div>` : ''}${it.printed ? '' : `<div class="beads" aria-hidden="true">${keys.map(() => '<i></i>').join('')}</div>`}`;
    const beads = [...cue.querySelectorAll('.beads i')];
    const playPrompt = async (me) => {   // the item's sounds one by one, a bead lights per sound, Sprig speaks
      sp.setState('speaking'); beads.forEach(b => b.classList.remove('on'));
      for (let k = 0; k < keys.length; k++) { if (me !== token || state !== 'ask') return false; beads[k]?.classList.add('on'); if (!await seq([keys[k]], 0)) return false; await wait(300); }
      return true;
    };
    cue.querySelector('.say').onclick = () => { if (state === 'ask') { stop(); const me = ++token; playPrompt(me).then(() => { if (me === token && state === 'ask') sp.setState('listening'); }); } };
    opts.replaceChildren();
    const order = it.options.map((o, i) => [o, i]).sort((a, b) => ((a[1] * 7 + q.i) % 5) - ((b[1] * 7 + q.i) % 5));  // stable shuffle
    order.forEach(([o], n) => {
      const t = document.createElement('div'); t.className = 'tile';
      const b = document.createElement('button'); b.className = 'opt'; b.type = 'button';
      b.setAttribute('aria-label', it.printed ? `Option ${n + 1}: ${o.w}` : `Option ${n + 1}`);
      b.innerHTML = it.printed ? `<span class="w${o.w.length > 3 ? ' long' : ''}">${esc(o.w)}</span>` : `${hasPicture(o.w) ? `<span class="pic">${picture(o.w, 46)}</span>` : ''}<span class="n">${n + 1}</span>`;
      if (TEST && o.ok) b.dataset.correct = 'true';
      b.addEventListener('click', () => pick(it, o, t, my));
      t.insertAdjacentHTML('beforeend', `<div class="tap">${ARROW}<span>Tap this one</span></div><div class="tag" aria-hidden="true">${speaker(20)}</div>`);
      if (!it.printed) {   // oral tiles: a separate speaker button replays the sound before answering
        const r = document.createElement('button'); r.className = 'rep'; r.type = 'button'; r.setAttribute('aria-label', `Hear option ${n + 1}`); r.innerHTML = speaker(26);
        r.addEventListener('click', async () => { if (state !== 'ask') return; stop(); token++; const me = token; b.classList.add('playing'); sp.setState('listening'); await seq([o.key], 0); b.classList.remove('playing'); });
        t.append(r);
      }
      t.__opt = o; t.prepend(b); opts.append(t);
    });
    (async () => {   // prompt first, then each option in turn; any tap cancels via stop()
      if (!await playPrompt(my)) return;
      const bs = [...opts.querySelectorAll('.opt')];
      for (let n = 0; n < order.length; n++) {
        if (my !== token || state !== 'ask') return; bs[n]?.classList.add('playing'); sp.setState('listening');
        const ok = await seq([order[n][0].key], 0); bs[n]?.classList.remove('playing'); if (!ok) return; await wait(200);
      }
    })();
  }

  function pick(it, o, tile, my) {
    if (my !== token) return;
    if (state === 'wrong') {                             // the outlined tile is the only enabled control: it is the retry
      if (!o.ok) return;
      state = 'retry'; sp.setState('try-again'); play(target.key).then(() => wait(250)).then(() => { if (state === 'retry') show(); });
      return;
    }
    if (state !== 'ask') return;                         // locked: only the one CTA moves on
    stop(); state = o.ok ? 'right' : 'wrong';
    gate.answer(o.ok); progress();
    target = it.options.find(x => x.ok);
    prompt.style.visibility = 'hidden'; cue.querySelector('.say').disabled = true; opts.querySelectorAll('.rep').forEach(r => { r.disabled = true; });
    opts.querySelectorAll('.opt').forEach(x => { x.disabled = !(!o.ok && x.parentElement.__opt.ok); });
    if (o.ok) { [...opts.children].forEach(t => t.classList.add('dim')); tile.classList.remove('dim'); tile.classList.add('hit'); }
    if (o.ok) { cta.hidden = false; cta.disabled = false; cta.dataset.next = '1'; }
    if (o.ok) {
      fb.className = 'fb right'; streak++; sp.setState(streak === 3 ? 'correct-streak' : !watered ? 'water' : 'correct-small'); word.textContent = 'Yes!';
      snd.innerHTML = it.printed ? `<u>${esc(target.w)}</u>` : '';   // oral items (L1.01): no letters on screen
      setCta('next', 'Next'); play('ui:good');
      if (!watered) {
        watered = true; window.__sg.wateredAt = performance.now(); chip.classList.add('wet');
        { const L = load(); save({ stage: Math.max(1, L.stage), firstDay: L.firstDay || new Date().toISOString().slice(0, 10), plants: { ...L.plants, [lid]: L.plants?.[lid] || { stage: 1, at: Date.now() } } }); }
        peek(document.body);
      }
    } else {
      streak = 0;
      const ci = [...opts.children].findIndex(t => t.__opt?.ok), ct = opts.children[ci];
      fb.className = 'fb wrong'; sp.setState('wrong-soft', { point: ci % 2 ? 'right' : 'left' });
      word.textContent = it.printed ? `That was ${o.w}.` : 'Not that one.';
      snd.innerHTML = it.printed ? `Listen, this one is <u>${esc(target.w)}</u>` : 'Listen to this one.';
      setCta('again', 'Try again');
      [...opts.children].forEach(t => t.classList.toggle('dim', t !== ct && t !== tile)); tile.classList.add('miss');
      ct.classList.add('target'); play(target.key);   // auto-plays once; tile pulses, is the only enabled control
    }
  }

  function finish() {
    stop(); token++; sp.destroy();
    const st = load(), passed = gate.passed, was = st.plants?.[lid];
    // a finished sitting never ends at zero: the seed is watered (stage 1) even on a fail; a pass sprouts it (stage 2, on the S6 route)
    const stage = passed ? 2 : Math.max(1, was?.stage || 1);
    save({ stage: st.stage + (passed ? 1 : 0), plants: { ...st.plants, [lid]: { stage: was?.stage > stage ? was.stage : stage, at: Date.now() } } });
    const lab = LESSONS.find((l) => l[0] === lid)?.[2] || '';
    el.innerHTML = `${defs()}<main class="done">${scene('day', { hill: 360, sunAt: [322, 250, 34], clouds: true })}
      <h1 class="disp">Sitting 1 of 4 done</h1>
      <div class="stagebox"><div class="mascot"></div><svg class="pot" viewBox="-50 -100 100 160" aria-hidden="true">${plant({ x: 0, y: 0, stage, label: lab, id: lid, hit: false })}</svg></div>
      <p class="line">${passed ? 'Your seed grew a leaf.' : 'Your seed had a drink.'}</p>
      <div class="hero">${passed ? `<a class="btn" data-done href="#/sprout/${lid}">${label('garden', 'See my garden')}</a>` : `<button class="btn" type="button" data-done data-again>${label('again', 'Again')}</button>`}</div></main>`;
    const s2 = createSprig(el.querySelector('.mascot'), { stage: Math.max(1, st.stage) }); onLeave(() => s2.destroy());
    s2.setState(passed ? 'celebrate' : 'encourage');
    el.querySelector('[data-again]')?.addEventListener('click', () => import('../router.js').then((m) => m.route()));
    window.__sg.doneAt = performance.now();
    play('ui:checkPass');
  }
  if (TEACH[lid]) teach(TEACH[lid]); else show();
}
