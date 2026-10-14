// The Sound Garden website: hero with a living garden scene, then how it works, the path, the 43 sounds, for grown-ups, privacy, FAQ, footer.
// Motion = CSS keyframes + WAAPI (Sprig), transform and opacity only. One rAF-throttled scroll handler writes CSS variables; nothing reads layout in it.
import { logoMark, speaker } from '../art/art.js';
import { navTo } from '../router.js';
import { createSprig } from '../sprig/sprig.js';
import { popIn, springVal, bump, isCalm, Sp, addActor, toast } from '../motion/engine.js';
import { heroLayers, cloudSvg, sunSvg, butterfly, sproutPlant, SPROUT_COLORS } from './hero-art.js';
import sounds from './sounds.json';

const LEVELS = [
  [1, 'First sounds', 14, 'The first sounds, one at a time, and your first words.', 1],
  [2, 'Sounds together', 14, 'Two letters, one sound: sh, ch, th and friends.', 2],
  [3, 'Long vowels', 18, 'Silent e and the long vowel sounds.', 3],
  [4, 'Longer words', 16, 'More spellings, longer words, short sentences.', 3],
  [5, 'Reading practice', 16, 'Short stories you can read on your own.', 4],
  [6, 'Reading practice', 16, 'Longer stories, with questions to check.', 4],
  [7, 'Reading practice', 14, 'Stories to read out loud, with confidence.', 4],
];
const FAQ = [
  ['Is it really free?', 'Yes. Everything is free: the lessons, the sounds, the practice pages and the teacher guide. There is nothing to buy and no ads.'],
  ['Do we need an account?', 'No. There is no sign-up and no login. Progress is saved on the device you use, and nothing is sent anywhere.'],
  ['What age is it for?', 'It is made for anyone learning to read English. A child sees the garden and Sprig. A grown-up learner can choose a calmer view with no mascot. Nobody is asked their age.'],
  ['Do I need to know phonics to help?', 'No. The voice does the teaching. The teacher page has a short guide, with what to say and what not to say, and a printable practice page for every lesson.'],
  ['Does it work without internet?', 'Yes, after the first visit. Open it once online, then it works offline. You can add it to your home screen from the browser menu.'],
  ['Does my child need to type?', 'No. Children tap and listen. There is no typing for early readers, no timer, and nothing that is taken away if you miss a day.'],
];
const IC = {
  free: '<path d="M16 28C8 22 4 17 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 5-4 10-12 16Z"/>',
  nologin: '<circle cx="16" cy="11" r="6"/><path d="M5 28c1-7 6-10 11-10s10 3 11 10M6 6l20 20"/>',
  offline: '<path d="M4 14C11 7 21 7 28 14M9 19c4-4 10-4 14 0M16 25h.1"/><path d="M5 5l22 22"/>',
  noads: '<rect x="5" y="8" width="22" height="16" rx="3"/><path d="M5 5l22 22M11 14h3M17 14h4"/>',
};
const ico = (d) => `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const RING = '<svg class="rings" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="30"/></svg>';

export function mount(el) {
  document.title = 'Sound Garden - learn to read English, free';
  const L = heroLayers();
  const tiles = (arr) => arr.map(([p, g, w, id]) => `<button class="snd" type="button" data-id="${id}" data-g="${g}" data-w="${w}" aria-label="Hear the sound ${g}, as in ${w}"><b>${g}</b><i>${w}</i></button>`).join('');
  el.innerHTML = `<div class="landing" id="top"><a class="skip" href="#/" data-go="main">Skip to content</a>
<header class="nav" role="banner"><a class="brand" href="#/" data-go="top">${logoMark(34)}<span>Sound Garden</span></a>
  <nav aria-label="Sections"><a href="#/" data-go="how">How it works</a><a href="#/" data-go="see">See it</a><a href="#/" data-go="path">The course</a><a href="#/" data-go="sounds">Sounds</a><a href="#/teach">For grown-ups</a><a href="#/" data-go="faq">FAQ</a></nav>
  <a class="navgo" href="#/play">Start</a></header>

<section class="hero" aria-labelledby="h1">
  <div class="sky" aria-hidden="true"></div>
  <div class="ly ly-sun" aria-hidden="true">${sunSvg()}</div>
  <div class="ly ly-clouds" aria-hidden="true"><span class="cl c1">${cloudSvg(190)}</span><span class="cl c2">${cloudSvg(130)}</span><span class="cl c3">${cloudSvg(220)}</span><span class="cl c4">${cloudSvg(110)}</span></div>
  ${L.far}${L.mid}
  <div class="ly ly-bf" aria-hidden="true"><span class="bfw b1">${butterfly('#F78FB3')}</span><span class="bfw b2">${butterfly('#FFC21A')}</span></div>
  ${L.near}
  <div class="herocopy">
    <p class="eyebrow">Free reading lessons for children and grown-ups</p>
    <h1 id="h1">Learn to read English, <em>one sound at a time.</em></h1>
    <p class="lede">Hear a sound. Say it. Read the word. Your garden grows with every lesson, and nothing ever wilts.</p>
    <div class="cta"><button class="seed start" type="button">Start <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 16h18M17 8l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <a class="ghost" href="#/teach">For parents and teachers</a></div>
    <p class="fine">No account. No ads. Works offline.</p>
  </div>
  <button class="sprigwrap" type="button" aria-label="Say hello to Sprig"><span class="sprigspot" id="heroSprig"></span><span class="hello" aria-hidden="true">Hi!</span></button>
  ${L.front}
</section>

<div class="meadow" aria-hidden="true"><svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 70C160 20 340 20 520 56S900 100 1100 56 1360 10 1440 40V120H0Z" fill="#FBF6EA"/><path d="M0 70C160 20 340 20 520 56S900 100 1100 56 1360 10 1440 40" fill="none" stroke="#C8F08A" stroke-width="8" stroke-linecap="round" transform="translate(0 -6)"/></svg>
  <div class="row">${SPROUT_COLORS.map((c, i) => sproutPlant(i, c)).join('')}</div></div>

<main id="main">
<section class="sec how" id="how" aria-labelledby="how-h"><div class="wrap">
  <p class="kick rv">How it works</p><h2 id="how-h" class="rv">Three small steps, again and again</h2>
  <ol class="steps">
    <li class="step rv" style="--d:0s"><div class="art art-hear"><button class="bigtile" type="button" data-id="${sounds[0][3]}" data-g="s" data-w="sun" aria-label="Hear the sound s">${RING}<b>s</b></button></div><h3><span>1</span> Hear</h3><p>Tap the speaker. A clear voice says one sound, then a word that has it. Tap the tile to try.</p></li>
    <li class="step rv" style="--d:.12s"><div class="art art-say"><svg viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="108" rx="52" ry="7" fill="#12330F" opacity=".14"/><g class="mouthg"><path d="M22 58C40 28 120 28 138 58 124 92 36 92 22 58Z" fill="#F29B73" stroke="#A8643A" stroke-width="5" stroke-linejoin="round"/><ellipse class="mouth" cx="80" cy="60" rx="34" ry="12" fill="#7A2E1B"/><path d="M52 52h56" stroke="#fff" stroke-width="9" stroke-linecap="round"/></g><g class="say-waves" fill="none" stroke="#2F7D32" stroke-width="5" stroke-linecap="round"><path d="M148 38q10 20 0 40"/><path d="M158 28q16 30 0 60" opacity=".6"/></g></svg></div><h3><span>2</span> Say</h3><p>Say it back. Sounds come first, never letter names, so reading starts to make sense.</p></li>
    <li class="step rv" style="--d:.24s"><div class="art art-read"><div class="slide"><b class="t1">s</b><b class="t2">a</b><b class="t3">t</b></div><div class="word" aria-hidden="true">sat</div></div><h3><span>3</span> Read</h3><p>Slide the sounds together into a word, then into a short sentence. The whole word is always said.</p></li>
  </ol></div></section>

<section class="sec show" id="see" aria-labelledby="see-h"><div class="wrap">
  <p class="kick rv">See it</p><h2 id="see-h" class="rv">What a lesson feels like</h2>
  <p class="sub rv">Real screens from the app. Tap a card, hear a sound, watch your garden grow. Sprig reacts to every answer.</p>
  <div class="phones" id="phones">
    <figure class="phone p1"><div class="screenwrap"><img src="./img/site/app-hear.webp" width="390" height="844" loading="lazy" decoding="async" alt="A lesson screen: the sound m, the word mountain, and Sprig saying let's begin."></div><figcaption>Hear it, say it</figcaption></figure>
    <figure class="phone p2"><div class="screenwrap"><img src="./img/site/app-home.webp" width="390" height="844" loading="lazy" decoding="async" alt="The garden: three flowers in bloom, a seed ready to plant, and a big Play button."></div><figcaption>Your garden grows</figcaption></figure>
    <figure class="phone p3"><div class="screenwrap"><img src="./img/site/app-done.webp" width="390" height="844" loading="lazy" decoding="async" alt="The lesson is done: three stars, Sprig cheering, a sticker, and the plant that grew."></div><figcaption>Every lesson blooms</figcaption></figure>
  </div></div></section>

<section class="sec path" id="path" aria-labelledby="path-h"><div class="wrap">
  <p class="kick rv">The course</p><h2 id="path-h" class="rv">A garden that grows from seed to story</h2>
  <p class="sub rv">Seven levels, 108 lessons. Each lesson plants a seed, and it blooms when the lesson is done.</p>
  <ol class="levels">${LEVELS.map(([n, name, count, text, st], i) => `<li class="lvl rv" style="--i:${i};--d:${(i * 0.09).toFixed(2)}s;--c:${SPROUT_COLORS[i]}"><div class="plantbox">${levelPlant(st, i)}</div><div class="lvtext"><span class="lvn">Level ${n}</span><h3>${name}</h3><p>${text}</p><small>${count} lessons</small></div></li>`).join('')}</ol></div></section>

<section class="sec snds" id="sounds" aria-labelledby="sn-h"><div class="wrap">
  <p class="kick rv">The 43 sounds</p><h2 id="sn-h" class="rv">Tap a sound to hear it</h2>
  <p class="sub rv">English has 43 sounds. Sound Garden teaches them one at a time, in the order that makes the first words easy.</p>
  <div class="nowp" role="status" aria-live="polite"><span class="nowicon">${speaker(22)}</span><span id="nowp">Tap any tile</span></div>
  <h3 class="sg rv">Consonant sounds</h3><div class="sgrid rv">${tiles(sounds.slice(0, 26))}</div>
  <h3 class="sg rv">Vowel sounds</h3><div class="sgrid vow rv">${tiles(sounds.slice(26))}</div></div></section>

<section class="sec adults" id="grownups" aria-labelledby="ad-h"><div class="wrap two">
  <div class="rv"><p class="kick">For parents and teachers</p><h2 id="ad-h">Print it. Teach with it.</h2>
    <p class="sub">You do not need to know phonics. The voice teaches, you sit beside the learner. There is a one-page practice sheet for every lesson and a short teaching guide.</p>
    <ul class="dl"><li><a href="./practice/guide-teach.pdf" download="teach-with-sound-garden.pdf"><b>Teach guide</b><span>8 pages, PDF</span></a></li><li><a href="./practice/level-1-all.pdf" download><b>Level 1 practice sheets</b><span>All 14 lessons, PDF</span></a></li><li><a href="#/teach"><b>All 108 practice sheets</b><span>Every lesson, on the teacher page</span></a></li></ul>
    <a class="btn2" href="#/teach">Open the teacher page</a></div>
  <div class="sheets rv" aria-hidden="true"><div class="sheet s1"><i></i><b>s</b><u></u><u></u><u></u></div><div class="sheet s2"><i></i><b>a</b><u></u><u></u><u></u></div><div class="sheet s3"><i></i><b>sat</b><u></u><u></u><u></u></div></div></div></section>

<section class="sec privacy" id="privacy" aria-labelledby="pv-h"><div class="wrap">
  <h2 id="pv-h" class="rv">Free, private, and always there</h2>
  <ul class="pills">
    <li class="rv" style="--d:0s">${ico(IC.free)}<b>Free</b><span>No price, no trial, no upgrade.</span></li>
    <li class="rv" style="--d:.08s">${ico(IC.nologin)}<b>No account</b><span>No sign-up. No age question.</span></li>
    <li class="rv" style="--d:.16s">${ico(IC.offline)}<b>Works offline</b><span>Open it once, use it anywhere.</span></li>
    <li class="rv" style="--d:.24s">${ico(IC.noads)}<b>No ads, no tracking</b><span>Progress stays on your device.</span></li></ul></div></section>

<section class="sec faq" id="faq" aria-labelledby="fq-h"><div class="wrap narrow">
  <p class="kick rv">Questions</p><h2 id="fq-h" class="rv">Good to know</h2>
  <div class="qs">${FAQ.map(([q, a], i) => `<details class="q rv" style="--d:${(i * 0.05).toFixed(2)}s"><summary>${q}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><div class="ans"><div><p>${a}</p></div></div></details>`).join('')}</div></div></section>
</main>

<footer class="foot"><div class="stars" aria-hidden="true"></div>
  <div class="wrap fcta"><span class="sprigspot" id="footSprig" aria-hidden="true"></span><h2>Ready to plant the first seed?</h2><button class="seed start big" type="button">Start <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 16h18M17 8l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
  <div class="wrap flinks"><a href="#/teach">For parents and teachers</a><a href="#/play/grown-ups">Privacy</a><button type="button" id="calm" aria-pressed="false">Calm motion: <b>off</b></button></div>
  <p class="wrap legal">Sound Garden is free. No account. No ads. No cookies.</p></footer></div>`;
  wire(el);
}

// stage art for the course path: same plant language as Sprig (seed, sprout, leafy, flower), grown by CSS when the row scrolls in
function levelPlant(st, i) {
  const big = 1 + i * 0.045;
  const stem = st >= 2 ? `<path class="stem" d="M50 150V${st === 2 ? 98 : st === 3 ? 74 : 56}" stroke="#2F7D32" stroke-width="6" stroke-linecap="round" fill="none"/>` : '';
  const lv = st >= 2 ? `<g class="lvs"><path d="M50 128C36 126 24 114 22 104 36 102 48 110 50 128Z" fill="#5CC636" stroke="#2F7D32" stroke-width="3"/><path d="M50 112C64 110 76 100 78 90 64 88 52 96 50 112Z" fill="#4CB82B" stroke="#2F7D32" stroke-width="3"/></g>` : '';
  const head = st >= 3 ? `<g transform="translate(50 ${st === 3 ? 66 : 48}) scale(${st === 3 ? 0.62 : 1})"><g class="hd"><g fill="var(--c)" stroke="#7A4B16" stroke-width="2.8">${Array.from({ length: 8 }, (_, k) => `<ellipse cx="0" cy="-19" rx="10" ry="17" transform="rotate(${k * 45})"/>`).join('')}</g><circle r="11" fill="#FFC21A" stroke="#B87800" stroke-width="2.8"/></g></g>` : '';
  const seed = st === 1 ? '<path d="M50 138C58 138 62 148 60 154 58 158 54 159 50 159 46 159 42 158 40 154 38 148 42 138 50 138Z" fill="#EFCB8A" stroke="#7A4B16" stroke-width="2.6"/>' : '';
  return `<svg viewBox="0 0 100 180" style="--s:${big.toFixed(2)}" aria-hidden="true"><ellipse cx="50" cy="168" rx="32" ry="6" fill="#12330F" opacity=".18"/><path d="M16 170C22 156 40 150 50 150S78 156 84 170Z" fill="#7A5230" stroke="#4A2F14" stroke-width="3" stroke-linejoin="round"/><g class="pg">${seed}${stem}${lv}${head}</g></svg>`;
}

function wire(el) {
  const root = el.querySelector('.landing');
  const calmOn = () => document.documentElement.classList.contains('calm');
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const stored = () => { try { return localStorage.getItem('sg-calm') === '1'; } catch { return false; } };
  const still = /[?&]still=1/.test(location.href) || /[?&]still=1/.test(location.search);
  if (still) document.documentElement.dataset.still = '1';
  const applyCalm = () => { document.documentElement.classList.toggle('calm', stored() || !!mq?.matches || still); setCalmBtn(); };
  const calmBtn = root.querySelector('#calm');
  function setCalmBtn() { const on = stored() || !!mq?.matches; calmBtn.setAttribute('aria-pressed', String(on)); calmBtn.querySelector('b').textContent = on ? 'on' : 'off'; }
  calmBtn.addEventListener('click', () => { try { localStorage.setItem('sg-calm', stored() ? '0' : '1'); } catch { /* private mode */ } applyCalm(); heroSprig?.setCalm(calmOn()); footSprig?.setCalm(calmOn()); toast(stored() ? 'Calm motion is on' : 'Calm motion is off'); });
  applyCalm();

  // start: the tap is the user gesture the browser wants before the first sound plays in the app
  root.querySelectorAll('.start').forEach((b) => b.addEventListener('click', () => { window.__sg.tapAt = performance.now(); navTo('#/play'); }));
  // in-page links scroll smoothly (the hash belongs to the router)
  root.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); const t = document.getElementById(a.dataset.go); if (!t) return;
    root.classList.add('full'); setTimeout(() => root.classList.remove('full'), 1400);   // real section heights while the page scrolls there
    t.scrollIntoView({ behavior: calmOn() ? 'auto' : 'smooth', block: 'start' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
  }));

  // Sprig: waves hello now and then, blinks and breathes between, looks at the pointer, jumps when poked
  const heroSprig = mountSprig(root.querySelector('#heroSprig'), 3);
  const footSprig = mountSprig(root.querySelector('#footSprig'), 2, 'sleep');
  [...root.querySelectorAll('.herocopy > *')].forEach((n, i) => popIn(n, 120 + i * 85, 28, 0.94));
  heroSprig?.setState('wake');
  const wrap = root.querySelector('.sprigwrap'); let greetT = 0;
  root.querySelector('.stars').innerHTML = Array.from({ length: 18 }, (_, i) => `<i style="left:${(i * 37 + 11) % 100}%;top:${(i * 53 + 7) % 70}%;--d:${(i % 7) * 0.5}s"></i>`).join('');
  const hello = () => { if (!calmOn()) heroSprig?.setState('greet'); greetT = setTimeout(hello, 6500 + Math.random() * 3000); };
  greetT = setTimeout(hello, 1200);
  wrap.addEventListener('click', (e) => { if (e.detail === 0) heroSprig?.setState('tap-react'); });   // a keyboard press (a mouse or finger press is already handled by the rig)
  const hero = root.querySelector('.hero');
  // the hills slide against each other as the pointer moves (a spring on one number, written as a CSS variable; far layers move least)
  const par = new Sp(0, 60, 12); let parOn = false;
  const parAct = { get active() { return parOn && !isCalm() && hero.isConnected; }, update(dt, h, n) { for (let i = 0; i < n; i++) par.step(h); hero.style.setProperty('--px', par.x.toFixed(3)); if (par.rest && par.t === 0) parOn = false; } };
  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); par.t = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)); if (!parOn) { parOn = true; addActor(parAct); } }, { passive: true });
  hero.addEventListener('pointerleave', () => { par.t = 0; });
  hero.addEventListener('pointermove', (e) => heroSprig?.lookAtClient(e.clientX, e.clientY), { passive: true });
  // the footer Sprig wakes when it scrolls in
  const wake = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !calmOn()) { footSprig?.setState('idle'); footSprig?.setState('wake'); } }), { threshold: 0.6 }); wake.observe(root.querySelector('.fcta'));

  // sounds: one shared audio element, the tile bounces and the "now playing" line shows the sound and its word
  const au = new Audio(); au.preload = 'none'; let curBtn = null;
  const nowp = root.querySelector('#nowp');
  const playSound = (b) => {
    au.pause(); curBtn?.classList.remove('on'); curBtn = b; b.classList.add('on');
    au.src = `./audio/${b.dataset.id}.ogg`; au.currentTime = 0; au.play().catch(() => {});
    nowp.textContent = `${b.dataset.g}  as in  ${b.dataset.w}`; bump(b, 0.18); bump(b, 0.18);
    heroSprig?.setState('speaking');
  };
  au.addEventListener('ended', () => { curBtn?.classList.remove('on'); heroSprig?.setState('idle'); });
  root.querySelectorAll('.snd, .bigtile').forEach((b) => b.addEventListener('click', () => playSound(b)));

  // reveal on scroll: cards spring in (translateY + scale), 85 ms apart when several arrive together; level plants grow with a spring; one observer
  const pre = [...root.querySelectorAll('.rv')].filter((n) => n.getBoundingClientRect().top > innerHeight * 0.96);
  pre.forEach((n) => n.classList.add('pre'));
  const grow = (li) => {
    const pg = li.querySelector('.pg'), hd = li.querySelector('.hd'); if (!pg) return;
    if (!isCalm()) pg.style.transform = 'scale(0)';
    springVal(0, 1, 150, 8.5, (v) => { pg.style.transform = `scale(${v})`; }, () => { pg.style.transform = ''; });
    if (hd) setTimeout(() => springVal(0, 1, 120, 7, (v) => { hd.style.transform = `scale(${Math.max(0, v)}) rotate(${(1 - v) * -80}deg)`; }, () => { hd.style.transform = ''; }), 420);
  };
  const fan = (n) => n.querySelectorAll('.sheet').forEach((sh, i) => { const x = [-96, 96, 0][i], r = [-12, 11, -1][i]; springVal(0, 1, 120, 9, (v) => { sh.style.transform = `translateX(${x * v}px) translateY(${i === 2 ? -8 * v : 0}px) rotate(${r * v}deg)`; }); });
  const io = new IntersectionObserver((es) => {
    es.filter((e) => e.isIntersecting).forEach((e, k) => {
      const n = e.target; io.unobserve(n);
      if (n.classList.contains('pre')) { n.classList.remove('pre'); popIn(n, k * 85, 30, 0.92); }
      n.classList.add('in'); if (n.classList.contains('lvl')) grow(n);
      if (n.classList.contains('sheets')) fan(n);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  root.querySelectorAll('.rv').forEach((n) => io.observe(n));
  // the phones lean toward the pointer (a spring per phone, transform only)
  const phones = [...root.querySelectorAll('.phone')];
  if (phones.length && matchMedia('(hover: hover)').matches) {
    const st = phones.map(() => ({ x: new Sp(0, 90, 11), y: new Sp(0, 90, 11) })); let on = false;
    const act = { get active() { return on && !isCalm() && root.isConnected; }, update(dt, h, n) { phones.forEach((ph, i) => { for (let k = 0; k < n; k++) { st[i].x.step(h); st[i].y.step(h); } ph.style.setProperty('--rx', st[i].y.x.toFixed(2) + 'deg'); ph.style.setProperty('--ry', st[i].x.x.toFixed(2) + 'deg'); }); if (!st.some((q) => Math.abs(q.x.x) > 0.05 || Math.abs(q.y.x) > 0.05 || Math.abs(q.x.t) > 0)) on = false; } };
    const sec = root.querySelector('#see'); sec.addEventListener('pointermove', (e) => { const r = sec.getBoundingClientRect(); const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5; st.forEach((q, i) => { q.x.t = nx * (8 + i * 2); q.y.t = -ny * 6; }); on = true; addActor(act); }, { passive: true });
    sec.addEventListener('pointerleave', () => st.forEach((q) => { q.x.t = 0; q.y.t = 0; }));
  }
  // seeds in the meadow pop up one after another when it scrolls into view
  const meadowPlants = [...root.querySelectorAll('.sp')];
  const mio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; mio.disconnect(); meadowPlants.forEach((pl, i) => setTimeout(() => springVal(0, 1, 150, 8, (v) => pl.style.setProperty('--p', v.toFixed(3))), isCalm() ? 0 : i * 150)); }), { threshold: 0.35 });
  mio.observe(root.querySelector('.meadow'));

  // scroll: parallax (hero only), nav background, the meadow's seeds sprout as the strip rises into view. Variables only, no layout reads inside the frame.
  const nav = root.querySelector('.nav'), meadow = root.querySelector('.meadow');
  let vh = innerHeight, heroH = hero.offsetHeight, mTop = 0, ticking = false;
  const measure = () => { vh = innerHeight; heroH = hero.offsetHeight; mTop = meadow.offsetTop; };
  const frame = () => {
    ticking = false; const y = scrollY;
    nav.classList.toggle('solid', y > 30);
    if (y < heroH + 40) hero.style.setProperty('--sy', String(Math.min(y, heroH)));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  measure(); frame();
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', () => { measure(); frame(); }, { passive: true });
  // pause the endless loops when the hero is off screen (cheaper on phones)
  const pauser = new IntersectionObserver((es) => es.forEach((e) => hero.classList.toggle('off', !e.isIntersecting)), { threshold: 0 }); pauser.observe(hero);

  import('../router.js').then(({ onLeave }) => onLeave(() => {
    clearTimeout(greetT); removeEventListener('scroll', onScroll); io.disconnect(); wake.disconnect(); pauser.disconnect(); au.pause();
    heroSprig?.destroy(); footSprig?.destroy(); mio.disconnect(); mio.disconnect();
  }));
}

function mountSprig(host, stage, state) {
  if (!host) return null;
  try { const s = createSprig(host, { stage }); if (state) s.setState(state); return s; } catch { return null; }
}
