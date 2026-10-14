// "Calm motion": one switch for every movement the app adds. It is ON when the phone asks for reduced motion OR when a grown-up
// turns it on in the grown-ups area (setting `calmMotion`). The page then carries <html class="calm"> and style.css/motion.css
// keep colour and opacity feedback but drop movement, loops, sparkles and confetti.
import * as db from './db.js';

let setting = false;
const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const apply = () => document.documentElement.classList.toggle('calm', !!(setting || mq?.matches));

export const isCalm = () => document.documentElement.classList.contains('calm');
export const calmSetting = () => setting;
export async function initMotion() {
  try { setting = !!(await db.setting('calmMotion')); } catch { setting = false; }
  apply();
  if (mq?.addEventListener) mq.addEventListener('change', apply); else mq?.addListener?.(apply);
}
export function setCalm(v) { setting = !!v; db.setting('calmMotion', setting).catch(() => {}); apply(); }
