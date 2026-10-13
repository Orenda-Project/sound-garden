// Hash router. Every screen has a shareable URL:
//   #/                      landing (tap the seed)
//   #/play                  the app (onboarding the first time, then the garden home)
//   #/play/lesson/L2.04     straight into that lesson's next open sitting (needs a profile; locked lessons stay locked)
//   #/play/practice         the Practice area      #/play/sound-it-out   Sound it out      #/play/grown-ups   the grown-ups guide
//   #/teach                 parents and teachers: the Teach guide and the printable practice pages (PDF), no sum gate
const el = () => document.getElementById('app');
let leave = [];
export const onLeave = (fn) => leave.push(fn);
export async function route() {
  leave.forEach((f) => { try { f(); } catch { /* already gone */ } }); leave = [];
  const h = (location.hash || '#/').split('?')[0];
  const root = el();
  document.documentElement.classList.toggle('sg-play', h.startsWith('#/play'));
  if (h.startsWith('#/play')) { const m = await import('./play.js'); return m.mount(root, h.slice(6)); }
  root.replaceChildren(); window.scrollTo(0, 0);
  if (h === '#/teach') return (await import('./teach/teach.js')).mount(root);
  (await import('./ui/landing.js')).mount(root);
}
