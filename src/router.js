const app = () => document.getElementById('app');
export const TEST = new URLSearchParams(location.search).get('test') === '1';
window.__sg = window.__sg || { tapAt: null, wateredAt: null };
export async function route() {
  const h = location.hash || '#/';
  const el = app(); el.replaceChildren();
  if (h.startsWith('#/lesson/')) (await import('./ui/lesson.js')).mount(el, h.slice(9));
  else if (h === '#/home') (await import('./ui/home.js')).mount(el);
  else if (h === '#/code') (await import('./ui/home.js')).code(el);
  else (await import('./ui/landing.js')).mount(el);
}
