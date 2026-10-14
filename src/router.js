// Hash router. Every screen has a shareable URL:
//   #/                      landing (tap the seed)
//   #/play                  the app (onboarding the first time, then the garden home)
//   #/play/lesson/L2.04     straight into that lesson's next open sitting (needs a profile; locked lessons stay locked)
//   #/play/practice         the Practice area      #/play/sound-it-out   Sound it out      #/play/grown-ups   the grown-ups guide
//   #/teach                 parents and teachers: the Teach guide and the printable practice pages (PDF), no sum gate
import { springVal, clamp } from './motion/engine.js';
import { disable as appCssOff } from './appcss.js';
const el = () => document.getElementById('app');
// every route change fades the page in on a spring (the app's own screens add their own slide on top)
const fadeIn = (root) => springVal(0, 1, 210, 22, (p) => { root.style.opacity = clamp(p, 0, 1); }, () => { root.style.opacity = ''; });
// Artifact build (npm run build:artifact): the viewer frame allows no location.hash beyond a plain token, no history changes and no service worker,
// so the route lives in memory and every in-page "#/..." link is turned into a click that calls navTo.
export const ART = import.meta.env.VITE_ARTIFACT === '1';
let memHash = '#/';
const curHash = () => (ART ? memHash : location.hash || '#/').split('?')[0];
export function navTo(h) {
  if (!ART) { location.hash = h; return; }
  memHash = h; route();
}
if (ART) document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#/"]');
  if (!a || a.dataset.go || e.defaultPrevented) return;      // data-go links scroll inside the landing page (landing.js)
  e.preventDefault(); navTo(a.getAttribute('href'));
}, true);
let leave = [];
export const onLeave = (fn) => leave.push(fn);
export async function route() {
  leave.forEach((f) => { try { f(); } catch { /* already gone */ } }); leave = [];
  const h = curHash();
  const root = el();
  if (ART && !h.startsWith('#/play')) appCssOff();          // artifact build: the course engine's global CSS belongs to the app screens only
  document.documentElement.classList.toggle('sg-play', h.startsWith('#/play'));
  if (h.startsWith('#/play')) { const m = await import('./play.js'); fadeIn(root); return m.mount(root, h.slice(6)); }
  root.replaceChildren(); window.scrollTo(0, 0);
  if (h === '#/teach') { fadeIn(root); return (await import('./teach/teach.js')).mount(root); }
  fadeIn(root); (await import('./ui/landing.js')).mount(root);
}
