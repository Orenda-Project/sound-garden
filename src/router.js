const app = () => document.getElementById('app');
export const TEST = new URLSearchParams(location.search).get('test') === '1';
export const DEMO = new URLSearchParams(location.search).get('demo') === '1';
window.__sg = window.__sg || { tapAt: null, wateredAt: null };
let leave = [];
export const onLeave = (fn) => leave.push(fn);   // screens register cleanup (Sprig listeners, timers)
export async function route() {
  leave.forEach((f) => { try { f(); } catch { /* already gone */ } }); leave = [];
  const h = (location.hash || '#/').split('?')[0];
  const el = app(); el.replaceChildren(); window.scrollTo(0, 0);
  if (/^#\/lesson\/L[2-7]\.\d\d$/.test(h)) (await import('./levels/enter.js')).enter(el, h.slice(9));
  else if (h.startsWith('#/lesson/')) (await import('./ui/lesson.js')).mount(el, h.slice(9));
  else if (h.startsWith('#/sprout/')) (await import('./ui/sprout.js')).mount(el, h.slice(9));
  else if (h === '#/remind') (await import('./ui/sprout.js')).remind(el);
  else if (h === '#/home') { (await import('./ui/home.js')).mount(el); import('./levels/strip.js').then((m) => m.mount(el)).catch(() => {}); }
  else if (h === '#/code') (await import('./ui/home.js')).code(el);
  else (await import('./ui/landing.js')).mount(el);
}
