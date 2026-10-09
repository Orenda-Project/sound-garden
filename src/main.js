import './tokens.css';
import './ui/ui.css';
import { route } from './router.js';
window.addEventListener('hashchange', route);
route();
