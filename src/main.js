import './tokens.css';
import './ui/landing.css';
import './sprig/sprig.css';
import { route } from './router.js';
window.__sg = window.__sg || { tapAt: null };
window.addEventListener('hashchange', route);
route();
