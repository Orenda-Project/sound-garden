import './tokens.css';
import './ui/landing.css';
import './sprig/sprig.css';
import { route } from './router.js';
window.__sg = window.__sg || { tapAt: null };
window.addEventListener('hashchange', route);
route();
// offline: the service worker (public/sw.js) only runs in a production build, so the dev server never serves stale files
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
