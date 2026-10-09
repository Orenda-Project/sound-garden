import { unlock } from '../audio.js';

export function mount(el) {
  el.innerHTML = `<main class="landing">
  <div><h1>Sound Garden</h1><p class="tag">Tap the seed.</p></div>
  <button class="seed" aria-label="Seed. Tap to plant it and hear the first sound">
    <svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="150" rx="86" ry="36" fill="#7a5a3a"/><ellipse cx="100" cy="132" rx="62" ry="22" fill="#8c6a47"/>
    <g class="s"><ellipse cx="100" cy="104" rx="22" ry="30" fill="#4CB82B" stroke="#2F7D32" stroke-width="4"/><path d="M100 80 q4 18 0 48" stroke="#2F7D32" stroke-width="3" fill="none"/></g></svg>
  </button>
  <div><button class="linkbtn" data-code>I have a garden code</button><br><small>Free. No account. No ads. No cookies.</small></div></main>`;
  el.querySelector('.seed').addEventListener('click', () => {
    unlock();                                   // AudioContext.resume() inside the gesture
    window.__sg.tapAt = performance.now();
    location.hash = '#/lesson/L1.01';
  }, { once: true });
  el.querySelector('[data-code]').addEventListener('click', () => { location.hash = '#/code'; });
}
