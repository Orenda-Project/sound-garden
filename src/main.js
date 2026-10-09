import './tokens.css';
import './ui/ui.css';
import './sprig/sprig.css';
import { route } from './router.js';
window.addEventListener('hashchange', route);
route();
