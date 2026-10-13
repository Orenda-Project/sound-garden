// #/teach: the page for parents and teachers. Outside the app, no sum gate (it is plain information, nothing here is a child's screen).
// The Teach guide and every practice page are the same PDFs Sound Out ships (public/practice/*.pdf), so they print offline once the page has loaded.
import './teach.css';
import { scene } from '../art/art.js';

const LEVELS = [
  [1, 'First sounds', 'L1'], [2, 'Sounds together', 'L2'], [3, 'Long vowels', 'L3'], [4, 'Longer words', 'L4'],
  [5, 'Reading practice 1', 'L5'], [6, 'Reading practice 2', 'L6'], [7, 'Reading practice 3', 'L7'],
];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB');

export async function mount(el) {
  document.title = 'For parents and teachers - Sound Garden';
  el.innerHTML = `<main class="teachpage">
  <div class="tp-sky" aria-hidden="true">${scene('day', { hill: 215, sunAt: [318, 80, 30], clouds: true, flowers: false }).replace('viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"', 'viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice"')}</div>
  <header class="tp-head"><a class="tp-back" href="#/" aria-label="Back to the garden">‹ Garden</a><h1>For parents and teachers</h1>
    <p>Sound Garden teaches reading with the sounds first. No sign-up, no ads, nothing to buy. You do not need to know phonics.</p></header>

  <section class="tp-card tp-hero"><h2>Teach with Sound Out</h2>
    <p>An 8-page guide for a parent or teacher: how a lesson runs, what to say, what to do when a child gets stuck, and how to tell it is working.</p>
    <a class="tp-btn" id="tp-guide" href="./practice/guide-teach.pdf" download="teach-with-sound-out.pdf">Download the guide (PDF)</a>
    <a class="tp-btn ghost" href="#/play/grown-ups">Read the grown-up guide in the app</a></section>

  <section class="tp-card"><h2>How a lesson goes</h2>
    <ol class="tp-steps">
      <li><b>Hear the sound.</b> A child taps the speaker, hears one sound, then the sound inside a word.</li>
      <li><b>Blend.</b> Two or three sounds slide into a word. The whole word is always said after the sounds.</li>
      <li><b>Read words, then a short story.</b> Only letters the child has already met are used.</li>
      <li><b>Show what you know.</b> A short tap-check. A check that is not passed is not a pass: the lesson is taught again first.</li>
    </ol>
    <p class="tp-note">There is no timer for children and no score to lose. The garden only grows. A grown-up can switch to the calm grown-up view at the start (Who is reading?).</p></section>

  <section class="tp-card"><h2>Your first five minutes</h2>
    <ol class="tp-steps"><li>Sit next to the learner. Hold the phone or tablet flat between you, or let them hold it.</li>
      <li>Tap <b>Play</b>. Let the voice do the teaching. You only listen, smile and point.</li>
      <li>One sitting is about five minutes. Stop when the learner stops. Come back tomorrow.</li></ol>
    <div class="tp-dd"><div><h3>Do</h3><ul class="tp-list"><li>Let them tap, even a wrong answer. The app says the right one.</li><li>Say the sound, not the letter name: <i>sss</i>, not <i>ess</i>.</li><li>Celebrate trying. Ask them to read the word again, out loud.</li></ul></div>
      <div><h3>Don't</h3><ul class="tp-list"><li>Don't tell them the answer before they tap.</li><li>Don't add "uh" to sounds (say <i>mmm</i>, not <i>muh</i>).</li><li>Don't hurry. There is no clock for children.</li></ul></div></div></section>

  <section class="tp-card"><h2>Print practice pages</h2>
    <p>One or two pages per lesson, made for A4 or Letter. They print in black and white and match the order in the app.</p>
    <div id="tp-levels" class="tp-levels" aria-live="polite"><p class="tp-note">Loading the list&hellip;</p></div></section>

  <section class="tp-card"><h2>Good to know</h2>
    <ul class="tp-list"><li>Progress stays on this device. There is no account and nothing is sent anywhere.</li>
    <li>Share a lesson with a link such as <code>#/play/lesson/L2.04</code>. It opens when that lesson is open for the learner.</li>
    <li>It works offline after the first visit. Install it from the browser menu (Add to Home screen).</li></ul>
    <a class="tp-btn" href="#/play">Open the app</a></section>
  </main>`;
  try {
    const ix = await (await fetch('./practice/index.json')).json();
    const box = el.querySelector('#tp-levels'); box.replaceChildren();
    for (const [n, name, pre] of LEVELS) {
      const ids = Object.keys(ix).filter((k) => k.startsWith(pre + '.'));
      const all = ix[`level-${n}-all`];
      const d = document.createElement('details'); d.className = 'tp-level'; if (n === 1) d.open = true;
      d.innerHTML = `<summary><span class="tp-lv">Level ${n}</span> ${esc(name)} <em>${ids.length} lessons</em></summary>
        <div class="tp-grid">${all ? `<a class="tp-pdf all" href="./${esc(all.file)}" download>All of level ${n} <small>${kb(all.bytes)}</small></a>` : ''}
        ${ids.map((id) => `<a class="tp-pdf" href="./${esc(ix[id].file)}" download>Lesson ${id.slice(1)} <small>${ix[id].pages} page${ix[id].pages > 1 ? 's' : ''}</small></a>`).join('')}</div>`;
      box.append(d);
    }
  } catch { el.querySelector('#tp-levels').innerHTML = '<p class="tp-note">The list could not be loaded. Try again when you are online.</p>'; }
}
