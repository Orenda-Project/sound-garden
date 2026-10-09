import { unlock } from '../audio.js';
import { scene, mound, seedShape, speaker, logoMark } from '../art/art.js';

export function mount(el) {
  el.innerHTML = `<main class="landing">${scene('day', { hill: 400 })}
  <h1 class="brand">${logoMark(34)}Sound Garden</h1>
  <div class="stack">
    <div class="sign" role="note"><i class="post"></i><span>${speaker(26)}<b>Tap the seed</b></span></div>
    <div class="seedwrap">
      <button class="seed" aria-label="Plant the seed and hear the first sound">
        <svg viewBox="-100 -90 200 120" aria-hidden="true"><ellipse class="ring" cx="0" cy="-12" rx="94" ry="40" fill="none" stroke="#FFC21A" stroke-width="5"/>
        <g transform="translate(0 0)">${mound(1.3)}</g><g transform="translate(0 -20) scale(1.35)">${seedShape}</g><path d="M-78 4C-50-10 50-10 78 4V10H-78Z" fill="#7A5230" opacity=".0"/></svg>
      </button>
    </div>
    <div class="blocks" aria-hidden="true"><i>s</i><i>a</i><i>t</i></div>
  </div>
  <footer><p>Free. No account. No ads. No cookies.</p><button class="linkbtn" data-code>I have a garden code</button></footer></main>`;
  el.querySelector('.seed').addEventListener('click', () => {
    unlock();                                   // AudioContext.resume() inside the gesture
    window.__sg.tapAt = performance.now();
    location.hash = '#/lesson/L1.01';
  }, { once: true });
  el.querySelector('[data-code]').addEventListener('click', () => { location.hash = '#/code'; });
}
