// Tilo's living home (G2): one new thing for every finished sitting. It only ever adds: flower, mushroom, bird, lantern, butterfly, kite, basket, balloon, sunflower, snail, rainbow.
// Drawn in the scene's own 390x560 space (same viewBox + slice as scene() in ui.js) so the items sit on the real hills. Items 1-24 are placed by hand around Tilo,
// who stands at the left (x 40-236) and the Hello bubble at the right (y 225-285), so nothing is hidden by either. Nothing here is a counter, a timer or a goal.
import { flower, mush, sprout } from './ui.js';
import { isCalm } from './motion.js';
import { isFast } from './audio.js';

const sh = (x, y, rx = 12) => `<ellipse cx="${x}" cy="${y + 1}" rx="${rx}" ry="3.5" fill="#1F6B47" opacity=".25"/>`;
const ART = {
  flower: (x, y, c) => flower(x, y, 1.1, c),
  sunflower: x => { const y = 518; return `<g transform="translate(${x} ${y})">${sh(0, 0, 14)}<path d="M0 0Q-2 -22 0 -44" stroke="#2E9E5B" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M0 -14Q12 -18 15 -28Q4 -26 0 -14Z" fill="#43B368"/>${[...Array(10)].map((_, a) => `<ellipse cx="${(13 * Math.cos(a * .628)).toFixed(1)}" cy="${(-48 + 13 * Math.sin(a * .628)).toFixed(1)}" rx="6" ry="3.2" transform="rotate(${a * 36} ${(13 * Math.cos(a * .628)).toFixed(1)} ${(-48 + 13 * Math.sin(a * .628)).toFixed(1)})" fill="#FFC81F"/>`).join('')}<circle cx="0" cy="-48" r="8" fill="#8A5A3B"/><circle cx="-2" cy="-50" r="3" fill="#A87450"/></g>`; },
  mush: (x, y) => mush(x, y, .9),
  bird: (x, y) => `<g transform="translate(${x} ${y})"><g class="flap"><path d="M-3 -2Q-13 -16 -22 -9Q-12 -4 -2 3Z" fill="#2D78B8"/></g><ellipse cx="0" cy="0" rx="10" ry="7" fill="#4AA3E0"/><ellipse cx="-1" cy="3" rx="6" ry="3.5" fill="#CDEBFA"/><path d="M4 -3Q10 -15 18 -10Q12 -4 6 2Z" fill="#2D78B8"/><circle cx="6" cy="-2" r="1.5" fill="#3A2619"/><path d="M10 0l7 2.5-7 2z" fill="#F5A623"/><path d="M-10 0l-9 4 8 1z" fill="#2D78B8"/></g>`,
  lantern: (x, y) => `<g transform="translate(${x} ${y})">${sh(0, 0, 9)}<path d="M0 0V-62" stroke="#6E4630" stroke-width="4" stroke-linecap="round"/><path d="M0 -62H14" stroke="#6E4630" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="-44" r="26" fill="#FFE27A" opacity=".35"/><path d="M14 -62v6" stroke="#6E4630" stroke-width="2"/><rect x="5" y="-56" width="18" height="24" rx="6" fill="#FFC81F"/><rect x="9" y="-52" width="10" height="16" rx="4" fill="#FFF3B0"/><rect x="4" y="-58" width="20" height="4" rx="2" fill="#B97110"/><rect x="4" y="-34" width="20" height="4" rx="2" fill="#B97110"/></g>`,
  butterfly: (x, y, c = '#B79CFF') => `<g transform="translate(${x} ${y}) rotate(-12)"><g class="flap"><ellipse cx="-8" cy="-4" rx="9" ry="7" fill="${c}"/><ellipse cx="-6" cy="5" rx="6" ry="5" fill="#FF8FB1"/></g><ellipse cx="8" cy="-4" rx="9" ry="7" fill="${c}"/><ellipse cx="6" cy="5" rx="6" ry="5" fill="#FF8FB1"/><rect x="-1.5" y="-8" width="3" height="18" rx="1.5" fill="#3A2619"/><path d="M0 -8Q-3 -15 -7 -16M0 -8Q3 -15 7 -16" stroke="#3A2619" stroke-width="1.4" fill="none"/></g>`,
  kite: (x, y, c = '#FF7A9C') => `<g transform="translate(${x} ${y})"><path d="M0 40Q-18 80 6 120T-6 190" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/><path d="M0 -34L22 0L0 40L-22 0Z" fill="${c}"/><path d="M0 -34L22 0L0 6Z" fill="#fff" opacity=".3"/><path d="M0 -34V40M-22 0H22" stroke="#B93A5E" stroke-width="1.6" opacity=".6"/><path d="M0 40q-8 10-4 20q8-4 6 8q-4 6 6 10" stroke="#FFD54A" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
  basket: (x, y) => `<g transform="translate(${x} ${y})">${sh(0, 0, 24)}<path d="M-20 -22Q0 -48 20 -22" stroke="#8A5A3C" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-22 -22H22L17 0H-17Z" fill="#C98448"/><path d="M-22 -22H22L20 -16H-20Z" fill="#E1A263"/><path d="M-18 -10H18M-14 -4H14" stroke="#8A5A3C" stroke-width="2" opacity=".6"/><path d="M-22 -22Q-14 -34 -4 -26Q4 -34 12 -26Q18 -30 22 -22Z" fill="#E5533D"/><circle cx="-6" cy="-27" r="2" fill="#fff"/><circle cx="8" cy="-27" r="2" fill="#fff"/></g>`,
  balloon: (x, y, c = '#FFB347') => `<g transform="translate(${x} ${y})"><path d="M0 26Q-6 50 2 76" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/><ellipse cx="0" cy="0" rx="17" ry="21" fill="${c}"/><ellipse cx="-6" cy="-7" rx="4.5" ry="7" fill="#fff" opacity=".4"/><path d="M-4 21l4 6 4-6z" fill="${c}"/></g>`,
  snail: (x, y) => `<g transform="translate(${x} ${y})">${sh(0, 0, 18)}<path d="M-18 0Q-20 -8 -12 -9H10Q14 -9 14 -4Q14 0 8 0Z" fill="#E9C9A0"/><path d="M12 -8Q12 -20 18 -22" stroke="#E9C9A0" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="18" cy="-23" r="2.4" fill="#3A2619"/><circle cx="-2" cy="-14" r="12" fill="#C98448"/><circle cx="-2" cy="-14" r="7" fill="#E1A263"/><circle cx="-2" cy="-14" r="2.6" fill="#8A5A3C"/></g>`,
  rainbow: (x, y) => `<g transform="translate(${x} ${y})" opacity=".92">${['#FF6B6B', '#FFB347', '#FFE066', '#5BD173', '#5CB8FF', '#9B7BFF'].map((c, i) => `<path d="M${-96 + i * 7} 0A${96 - i * 7} ${96 - i * 7} 0 0 1 ${96 - i * 7} 0" stroke="${c}" stroke-width="7" fill="none"/>`).join('')}</g>`,
};
// [kind, x, y, arg]; y is the ground line (sky items: their centre). Order = the order things arrive.
export const ITEMS = [
  ['flower', 300, 514, '#FF8FB1'], ['mush', 352, 512], ['bird', 150, 214], ['lantern', 318, 480], ['flower', 30, 516, '#FFB347'], ['butterfly', 268, 330],
  ['basket', 244, 520], ['kite', 112, 130], ['flower', 140, 520, '#B79CFF'], ['mush', 14, 506], ['balloon', 352, 320], ['sunflower', 366],
  ['flower', 78, 522, '#7BC8FF'], ['bird', 42, 232], ['lantern', 22, 466], ['butterfly', 336, 392, '#7BC8FF'], ['flower', 192, 524, '#FF8FB1'], ['snail', 288, 468],
  ['kite', 262, 150, '#FFB347'], ['flower', 108, 524, '#FFD54A'], ['balloon', 36, 300, '#B79CFF'], ['sunflower', 226], ['flower', 326, 524, '#B79CFF'], ['rainbow', 120, 262],
];
export const MAX_ITEMS = ITEMS.length;
// the surprise: a wrapped gift waits near Tilo's feet until the next sitting is finished, then it opens into the next thing. Nothing is lost if it waits.
const gift = (x, y) => `<g transform="translate(${x} ${y}) scale(1.35)"><g class="gift">${sh(0, 0, 18)}<rect x="-15" y="-26" width="30" height="26" rx="4" fill="#FF7A9C"/><rect x="-15" y="-26" width="30" height="8" rx="3" fill="#FF9DB6"/><rect x="-3.500" y="-26" width="7" height="26" fill="#FFE066"/><path d="M0 -26Q-14 -42 -9 -29ZM0 -26Q14 -42 9 -29Z" fill="#FFE066"/><circle cx="0" cy="-27" r="3" fill="#FFC81F"/><path d="M13 -34l1.800 4 4 1.800-4 1.800-1.800 4-1.800-4-4-1.800 4-1.800z" fill="#fff" class="spark"/></g></g>`;
const SKY = new Set(['bird', 'butterfly', 'kite', 'balloon', 'rainbow']);
const draw = ([k, x, y, a]) => { const art = k === 'sunflower' ? ART.sunflower(x) : ART[k](x, y, a); const sc = SKY.has(k) ? 1.3 : 1.4; const yy = k === 'sunflower' ? 518 : y; return `<g transform="translate(${x} ${yy}) scale(${sc}) translate(${-x} ${-yy})">${art}</g>`; };

// n finished sittings -> n items (capped at 24). `fresh` = how many of the newest are brand new (they pop in; the rest are simply there).
export function living(n, fresh = 0) {
  const c = Math.min(MAX_ITEMS, Math.max(0, n)); const first = c - fresh;
  const el = document.createElement('div'); el.className = 'living'; el.dataset.count = String(c);
  el.setAttribute('role', 'img'); el.setAttribute('aria-label', c ? `Tilo's home: ${c} thing${c === 1 ? '' : 's'} so far, and a surprise is waiting. It only grows.` : "Tilo's home, and a surprise is waiting");
  // paint far (small y) first so near things overlap the far ones
  const order = ITEMS.slice(0, c).map((it, i) => ({ it, i })).sort((a, b) => (a.it[2] || 500) - (b.it[2] || 500));
  const showGift = c < MAX_ITEMS;
  el.innerHTML = `<svg viewBox="0 0 390 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${showGift ? gift(176, 512) : ''}${order.map(({ it, i }) => `<g class="li${i >= first ? ' new' : ''}" data-i="${i}">${draw(it)}</g>`).join('')}</svg>`;
  return el;
}

// sky colour by the local hour: morning and evening add a soft wash on the top of the scene. Day under ?fast and calm motion, so a screenshot is always the same.
export function skyKind(d = new Date()) {
  if (isFast || isCalm()) return 'day';
  const hr = d.getHours();
  return hr >= 5 && hr < 10 ? 'morning' : hr >= 16 && hr < 20 ? 'evening' : 'day';
}

// Tilo's life on Home: he waves when you come back, cheers when something new has appeared, and waves again every ~12 s. Nothing under calm motion or ?fast.
export function homeLife(root, tilo, fresh) {
  if (isFast || isCalm() || new URLSearchParams(location.search).has('still')) return;
  let t = 0;
  const wave = () => { if (!root.isConnected) return; if (tilo.state.speaking) return; tilo.hold('mmm'); tilo.emote('speaking', null, 1500); setTimeout(() => tilo.hold(null), 1550); };
  const tick = () => { if (!root.isConnected) { clearTimeout(t); return; } wave(); t = setTimeout(tick, 12000); };
  setTimeout(() => { if (!root.isConnected) return; if (fresh) { tilo.emote('celebrating', null, 1700); } else wave(); }, 1100);
  t = setTimeout(tick, 13000);
}

// ---- G4: the practice garden. One flower for every day the child practised, in order, never removed, never greyed, never a streak. An empty day shows nothing. ----
const FLOWERS = ['#FF8FB1', '#FFB347', '#B79CFF', '#7BC8FF', '#FFD54A', '#FF7A9C'];
const SHOW = 42;   // beyond this the newest 42 are drawn and a plain count says how many days in all; nothing is lost from the record
export function dayGarden(days, fresh = false) {
  const n = days.length; const el = document.createElement('div'); el.className = 'daygarden';
  el.setAttribute('role', 'img'); el.setAttribute('aria-label', `My garden: ${n} flower${n === 1 ? '' : 's'}, one for each day we practised. It only grows.`);
  if (!n) { el.classList.add('empty'); el.innerHTML = '<span class="dg-hint" aria-hidden="true">My garden grows when we play</span>'; return el; }
  const shown = days.slice(-SHOW); const off = n - shown.length;
  el.innerHTML = `<span class="dg-cap" aria-hidden="true">My garden</span><span class="dg-flowers" aria-hidden="true">${shown.map((_, i) => { const c = FLOWERS[(off + i) % FLOWERS.length]; const last = fresh && i === shown.length - 1; return `<svg class="dg-f${last ? ' new' : ''}" viewBox="-17 -40 34 44">${flower(0, 0, 1.15, c)}</svg>`; }).join('')}</span>${off ? `<b class="dg-n">${n}</b>` : ''}`;
  el.querySelector('.dg-flowers').insertAdjacentHTML('beforeend', `<svg class="dg-f dg-next" viewBox="-17 -40 34 44" aria-hidden="true">${sprout(0, 0, 1.3)}</svg>`);   // the next one is already on its way (a sprout, never an empty circle)
  return el;
}
