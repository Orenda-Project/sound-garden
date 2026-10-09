import { Gate } from '../engine/gate.js';
import { sprig, setPose } from '../mascot/mascot.js';
import { peek } from './peek.js';
import { unlock, seq, play, stop, wait, loadMap } from '../audio.js';
import { load, save } from '../store.js';
import { TEST } from '../router.js';

export async function mount(el, lid) {
  unlock();   // no-op if the seed tap already did it; a direct visit unlocks on first tap anywhere
  document.addEventListener('pointerdown', unlock, { once: true });
  const [data] = await Promise.all([fetch('./data/L1.json').then(r => r.json()), loadMap()]);
  const lesson = data.lessons[lid]; if (!lesson) { el.textContent = 'Lesson not found'; return; }
  const gate = new Gate(lesson.gate.items, { pass: lesson.gate.bar.pass_ });
  el.innerHTML = `<main class="lesson">
    <div class="lh"><span class="stage-icon" title="plant stage" data-stage></span><div class="bar"><i></i></div></div>
    <div class="fb" aria-live="polite"><div class="tint"></div></div>
    <p class="prompt">Listen. Tap the one that matches.</p>
    <div class="opts"></div></main>`;
  const fb = el.querySelector('.fb'), opts = el.querySelector('.opts'), prog = el.querySelector('.bar i'), root = el.firstElementChild;
  const sp = sprig('listening'); fb.append(sp);
  const word = Object.assign(document.createElement('p'), { className: 'word' }), snd = Object.assign(document.createElement('p'), { className: 'sound' });
  fb.append(word, snd);
  let watered = false, token = 0;
  const progress = () => { prog.style.transform = `scaleX(${(gate.of - gate.queue.filter(q => q.attempt === 1).length) / gate.of})`; };
  progress();

  function show() {
    const q = gate.current(); if (!q) return finish();
    const it = gate.items[q.i], my = ++token;
    fb.className = 'fb'; setPose(sp, 'listening'); word.textContent = ''; snd.textContent = '';
    fb.querySelector('.example')?.remove();
    opts.replaceChildren(); root.classList.remove('lock');
    const order = it.options.map((o, i) => [o, i]).sort((a, b) => ((a[1] * 7 + q.i) % 5) - ((b[1] * 7 + q.i) % 5));  // stable shuffle
    order.forEach(([o], n) => {
      const b = document.createElement('button'); b.className = 'opt'; b.type = 'button';
      b.setAttribute('aria-label', `Option ${n + 1}`); b.textContent = '\u{1F50A} ' + (n + 1);
      if (TEST && o.ok) b.dataset.correct = 'true';
      b.addEventListener('click', () => answer(it, o, b, q, my));
      opts.append(b);
    });
    (async () => {   // prompt first, then each option in turn; any tap cancels via stop()
      if (!await seq(it.prompt?.length ? it.prompt : [`w:${it.word}`], 350)) return;
      const bs = [...opts.children];
      for (let n = 0; n < order.length; n++) {
        if (my !== token) return; bs[n]?.classList.add('playing');
        const ok = await seq([order[n][0].key], 0); bs[n]?.classList.remove('playing'); if (!ok) return; await wait(200);
      }
    })();
  }

  async function answer(it, o, btn, q, my) {
    if (my !== token || root.classList.contains('lock')) return;
    root.classList.add('lock'); stop();
    const r = gate.answer(o.ok);
    progress();
    const target = it.options.find(x => x.ok);
    if (o.ok) {
      fb.className = 'fb right'; setPose(sp, 'correct-small'); word.textContent = 'Yes';
      snd.textContent = it.printed ? `the word “${target.w}”` : "";   // oral items (L1.01): no letters on screen
      play('ui:good');
      if (!watered && !load().firstDay) { /* first ever */ }
      if (!watered) {
        watered = true; window.__sg.wateredAt = performance.now();
        save({ stage: Math.max(1, load().stage), firstDay: load().firstDay || new Date().toISOString().slice(0, 10) });
        peek(document.body);
      }
      await wait(650);
    } else {
      fb.className = 'fb wrong'; setPose(sp, 'wrong-soft'); word.textContent = 'Try again';
      snd.textContent = it.printed ? `it was “${target.w}”` : "Listen to the right one";
      const ex = Object.assign(document.createElement('button'), { className: 'example', type: 'button', textContent: '\u{1F50A}' });
      ex.addEventListener('click', () => play(target.key)); fb.append(ex);
      await play(target.key); await wait(500);
    }
    show();
  }

  function finish() {
    stop(); token++;
    const st = load();
    el.innerHTML = `<main class="done"><div class="big" aria-hidden="true"></div><h1>Sitting 1 of 4 done</h1>
      <p>${gate.correctFirst} of ${gate.of} first try. Pass mark ${gate.pass}.</p><a class="btn" style="text-decoration:none" href="#/home">See my garden</a></main>`;
    save({ stage: st.stage + (gate.passed ? 1 : 0) });
    window.__sg.doneAt = performance.now();
    play('ui:checkPass');
  }
  show();
}
