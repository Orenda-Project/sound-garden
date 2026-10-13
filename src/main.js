import './tokens.css';
import './ui/landing.css';
import './sprig/sprig.css';
import { route } from './router.js';
import { pressable } from './motion/engine.js';
pressable();
window.__sg = window.__sg || { tapAt: null };
window.addEventListener('hashchange', route);
route();
// offline: the service worker (public/sw.js) only runs in a production build, so the dev server never serves stale files
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));

// Calm motion is one switch for the whole site: the landing page's switch, the grown-ups area's switch and prefers-reduced-motion all end in html.calm.
// The two switches share localStorage "sg-calm" (a grown-up's choice sticks across the landing page and the app). ?still=1 (test captures) never saves.
try {
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  new MutationObserver(() => {
    if (document.documentElement.dataset.still) return;
    try { if (!rm.matches) localStorage.setItem('sg-calm', document.documentElement.classList.contains('calm') ? '1' : '0'); } catch { /* private mode */ }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
} catch { /* no MutationObserver: no sync */ }
