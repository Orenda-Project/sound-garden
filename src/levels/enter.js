// Entry for Levels 2-7 lessons. Public build: a soft locked screen. ?dev=1: Levels 2-4 reuse the Level 1 player (its one data
// fetch is pointed at that level's file), Levels 5-7 open the practice player. No file under src/ui/ is touched.
import { extendMap } from '../audio.js';
import './levels.css';
export const DEV = new URLSearchParams(location.search).get('dev') === '1';
export const levelOf = (lid) => +lid[1];
export const isLater = (lid) => /^L[2-7]\.\d\d$/.test(lid);
let pill;
function audioComing() {   // 'audio coming' state: a quiet pill whenever a clip is a placeholder
  if (pill) return; let t;
  pill = document.createElement('div'); pill.className = 'sg-coming'; pill.setAttribute('role', 'status'); pill.hidden = true; pill.textContent = 'Audio coming: this clip is not recorded yet';
  document.body.append(pill);
  window.addEventListener('sg-audio-missing', () => { pill.hidden = false; clearTimeout(t); t = setTimeout(() => { pill.hidden = true; }, 1800); });
}
export const soft = (el, lid) => {
  el.innerHTML = `<main class="sg-soft"><div class="soft-sign" role="note"><b>Sounds being recorded</b><span>Level ${levelOf(lid)} is still growing. Come back soon.</span></div><a class="btn" data-back href="#/home">Back to the garden</a></main>`;
};
export async function enter(el, lid) {
  if (!DEV) return soft(el, lid);
  audioComing();
  const n = levelOf(lid);
  if (n >= 5) return (await import('./practice.js')).mount(el, lid);
  await extendMap(`./data/audio-map-L${n}.json`);
  const real = window.fetch, mod = await import('../ui/lesson.js');
  window.fetch = (u, ...a) => real(typeof u === 'string' && u.endsWith('data/L1.json') ? `./data/L${n}.json` : u, ...a);
  try { const p = mod.mount(el, lid); window.fetch = real; await p; } finally { window.fetch = real; }
}
