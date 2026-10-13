// Small DOM helpers, the speaker button and the village strip.
import { play } from './audio.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(kid));
  return el;
}

export const ICON = {
  speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  child: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="22" r="11" fill="currentColor"/><path d="M14 58c2-14 9-21 18-21s16 7 18 21z" fill="currentColor"/></svg>',
  adult: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="17" r="10" fill="currentColor"/><path d="M12 60c1-19 9-29 20-29s19 10 20 29z" fill="currentColor"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>',
};
Object.assign(ICON, {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.5 12 4l8.5 7.5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V20h12v-9.5" fill="currentColor"/><rect x="10" y="14" width="4" height="6" fill="#fff"/></svg>',
  skip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5 14 12l-9 6.5z" fill="currentColor"/><path d="M18 5v14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5 20 12 7 19.5z" fill="currentColor"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5c3-1 6-.8 8.5 1 2.5-1.800 5.500-2 8.500-1V19c-3-1-6-.8-8.500 1-2.500-1.800-5.500-2-8.500-1z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 6.500V20" stroke="currentColor" stroke-width="2.200"/></svg>',
  question: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.500 9a3.500 3.500 0 1 1 5 3.100c-1 .6-1.500 1.200-1.500 2.400" stroke="currentColor" stroke-width="2.600" fill="none" stroke-linecap="round"/><circle cx="12" cy="19" r="1.600" fill="currentColor"/></svg>',
  ear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9.500a4.500 4.500 0 0 1 9 0c0 2.600-2 3.400-3 4.700-.7.900-.7 1.600-.7 2.300a2.800 2.800 0 0 1-5.300 1.200" stroke="currentColor" stroke-width="2.200" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.800 9.800a1.800 1.800 0 0 1 3.600 0c0 1-.7 1.400-1.300 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3.300 8.500a8 8 0 0 1 2-3.200M2 12.500a11 11 0 0 1 .5-2.300" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
});
Object.assign(ICON, {
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.9 6.2 6.8.8-5 4.700 1.300 6.700L12 17.400 6 20.800l1.300-6.700-5-4.700 6.800-.8z" fill="currentColor"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.500h10V9a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5.500H4V8a3.500 3.500 0 0 0 3.200 3.500M17 5.500h3V8a3.500 3.500 0 0 1-3.200 3.500" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="10.500" y="13.500" width="3" height="3.500" fill="currentColor"/><rect x="7.500" y="17" width="9" height="3.500" rx="1.200" fill="currentColor"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a1.500 1.500 0 0 1 1.500 1.500v8A1.500 1.500 0 0 1 20 16h-8l-5 4v-4H4a1.500 1.500 0 0 1-1.500-1.500v-8A1.500 1.500 0 0 1 4 5z" fill="currentColor"/></svg>',
});
Object.assign(ICON, {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
});
ICON.flower = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 27V15" stroke="#2E9E5B" stroke-width="2.6" stroke-linecap="round"/><circle cx="14" cy="8" r="4" fill="#FF8FB1"/><circle cx="9" cy="12" r="4" fill="#FF8FB1"/><circle cx="19" cy="12" r="4" fill="#FF8FB1"/><circle cx="14" cy="13" r="3.4" fill="#FFD54A"/></svg>';
export const icon = (name, cls = 'icon') => h('span', { class: cls, html: ICON[name] });

// A button that carries an icon as well as its word. `say` = the clip a press-and-hold speaks (teacher.js).
export function btn(label, name, attrs = {}) {
  const say = attrs.say; delete attrs.say;
  return h('button', { ...attrs, 'data-say': say || null }, name ? icon(name, 'icon bi') : null, h('span', { class: 'bl' }, label));
}

// A large round play/replay button for intro screens that start by themselves: a big, obvious tap target.
export const playButton = (onclick, label = 'Play') => h('button', { class: 'startplay', type: 'button', 'aria-label': label, 'data-say': 'ui:hearAgain', onclick }, icon('play'));

// A speaker button: plays one clip (or a sequence via onplay) and pulses while playing.
export function speaker(key, { label = 'Hear it again', big = false, onplay } = {}) {
  const b = h('button', { class: 'speaker' + (big ? ' big' : ''), 'aria-label': label, 'data-key': key || '' }, icon('speaker'));
  b.addEventListener('click', async () => {
    b.classList.add('playing');
    try { await (onplay ? onplay() : play(key)); } finally { b.classList.remove('playing'); }
  });
  return b;
}

// One village piece per learned sound. Simple shapes; real art comes later.
const PIECES = {
  s: ['sun', '<circle cx="20" cy="20" r="10" fill="#f4b73b"/><g stroke="#f4b73b" stroke-width="3">' + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${20 + 13 * Math.cos(a * Math.PI / 180)}" y1="${20 + 13 * Math.sin(a * Math.PI / 180)}" x2="${20 + 18 * Math.cos(a * Math.PI / 180)}" y2="${20 + 18 * Math.sin(a * Math.PI / 180)}"/>`).join('') + '</g>'],
  a: ['apple tree', '<rect x="17" y="22" width="6" height="16" fill="#8a5a3b"/><circle cx="20" cy="17" r="13" fill="#5f9e5a"/><circle cx="14" cy="16" r="2.5" fill="#d9483b"/><circle cx="25" cy="12" r="2.5" fill="#d9483b"/><circle cx="23" cy="22" r="2.5" fill="#d9483b"/>'],
  t: ['tent', '<path d="M4 36 L20 6 L36 36 Z" fill="#e0794a"/><path d="M20 36 L20 18 L27 36 Z" fill="#7b3a22"/>'],
  p: ['pond', '<ellipse cx="20" cy="28" rx="17" ry="8" fill="#5aa6c9"/><ellipse cx="14" cy="26" rx="5" ry="2" fill="#9fd3ea"/>'],
  i: ['ink pot', '<rect x="11" y="14" width="18" height="22" rx="4" fill="#3b4f8a"/><rect x="15" y="9" width="10" height="6" fill="#3b4f8a"/>'],
  n: ['nest', '<ellipse cx="20" cy="28" rx="15" ry="8" fill="#a07444"/><circle cx="15" cy="23" r="4" fill="#e9e4d4"/><circle cx="24" cy="23" r="4" fill="#e9e4d4"/>'],
  m: ['mountain', '<path d="M2 36 L16 10 L24 22 L30 14 L39 36 Z" fill="#8c8f9e"/><path d="M16 10 L12 18 L20 18 Z" fill="#fff"/>'],
  d: ['dog house', '<path d="M6 18 L20 6 L34 18 Z" fill="#c0563f"/><rect x="9" y="18" width="22" height="18" fill="#e3b86c"/><path d="M16 36 v-9 a4 4 0 0 1 8 0 v9z" fill="#5b4a3a"/>'],
};
export function village(letters, { justAdded } = {}) {
  const strip = h('div', { class: 'village', 'aria-label': 'Your village' });
  strip.append(h('div', { class: 'ground' }));
  for (const l of letters) {
    const p = PIECES[l]; if (!p) continue;
    strip.append(h('div', { class: 'piece' + (l === justAdded ? ' new' : ''), title: `${p[0]} (${l})`, html: `<svg viewBox="0 0 40 40">${p[1]}</svg>` }));
  }
  if (!letters.length) strip.append(h('div', { class: 'piece empty', html: '<svg viewBox="0 0 40 40"><circle cx="20" cy="30" r="3" fill="#b9a993"/></svg>' }));
  return strip;
}

export const STICKERS = ['★', '♥', '☀', '☘', '♪', '✿', '☂', '⚑'];

// Real word / scene pictures: public/img/words/pictures.json maps concept -> file ("sun", "scene:L1.01:0").
// pictures.meta.json flags concepts a child could read two ways (ambiguous): those are never a picture-only choice.
import PICS from '../public/img/words/pictures.json';
import PICMETA from '../public/img/words/pictures.meta.json';
const BASE = import.meta.env.BASE_URL;
export const hasPicture = key => !!PICS[key];
export const isAmbiguous = key => !!PICMETA[key]?.ambiguous;
// null when there is no file for the concept (the caller then shows no picture, never a placeholder)
export function picture(key, { n = 0 } = {}) {
  const f = PICS[key]; if (!f) return null;
  const img = new Image(); img.src = `${BASE}img/words/${f}`; img.alt = ''; img.width = 256; img.height = 256; img.decoding = 'async';
  return h('div', { class: 'picture', 'data-key': key, 'data-chunk': n }, img);
}
// a picture a child may rely on alone: null for ambiguous concepts (the spoken word carries the choice instead)
export const safePicture = (key, opts) => (isAmbiguous(key) ? null : picture(key, opts));

// Big letter rendering with graphemes as separate spans (for highlight and tap).
export function wordTiles(graphemes, cls = 'tile') {
  return graphemes.map((g, i) => h('span', { class: cls, 'data-i': i }, g));
}

// ---- The scene kit (plan/design/premium/SYSTEM.md section 4): sky gradient, sun with glow, clouds, three hill bands, trees, mushrooms, grass.
// One owned illustration style: flat shapes, two-tone shade, no outlines. Used behind Tilo on splash / who / Home and the worked examples.
let sceneN = 0;
const cloud = (x, y, s = 1, o = .96) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="12" rx="46" ry="14" fill="#fff"/><circle cx="-16" cy="2" r="16" fill="#fff"/><circle cx="8" cy="-6" r="21" fill="#fff"/><circle cx="28" cy="4" r="14" fill="#fff"/><ellipse cx="2" cy="16" rx="40" ry="6" fill="#C4E8E8" opacity=".7"/></g>`;
const tree = (x, y, s = 1, c1 = '#2E9E5B', c2 = '#52BF6E', c3 = '#237F4A') => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="34" ry="7" fill="#1F6B47" opacity=".25"/><path d="M-6 0L-4 -44H5L7 0Z" fill="#8A5A3B"/><path d="M1 0L5 -44H-1Z" fill="#6E4630" opacity=".5"/><circle cx="-22" cy="-62" r="26" fill="${c3}"/><circle cx="22" cy="-62" r="26" fill="${c3}"/><circle cx="0" cy="-82" r="32" fill="${c1}"/><circle cx="-18" cy="-60" r="24" fill="${c1}"/><circle cx="20" cy="-58" r="24" fill="${c1}"/><circle cx="-8" cy="-92" r="14" fill="${c2}" opacity=".85"/><circle cx="-24" cy="-68" r="9" fill="${c2}" opacity=".8"/><circle cx="14" cy="-70" r="7" fill="${c2}" opacity=".7"/></g>`;
export const mush = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="1" rx="16" ry="4" fill="#1F6B47" opacity=".25"/><path d="M-6 0Q-7 -14 -5 -18H5Q7 -14 6 0Z" fill="#FFF1D6"/><path d="M-20 -17Q-18 -38 0 -38Q18 -38 20 -17Q0 -11 -20 -17Z" fill="#E5533D"/><path d="M-20 -17Q-18 -38 0 -38Q-12 -30 -12 -14Q-16 -14 -20 -17Z" fill="#F27A63" opacity=".7"/><circle cx="-6" cy="-27" r="3.4" fill="#fff"/><circle cx="8" cy="-30" r="2.8" fill="#fff"/><circle cx="10" cy="-21" r="2.4" fill="#fff"/></g>`;
export const flower = (x, y, s = 1, c = '#FF8FB1', c2 = '#FFD54A') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0Q-2 -12 0 -26" stroke="#2E9E5B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M0 -8Q-10 -12 -12 -20Q-2 -18 0 -8Z" fill="#43B368"/>${[0, 1, 2, 3, 4].map(a => `<circle cx="${(9 * Math.cos(a * 1.2566)).toFixed(1)}" cy="${(-26 + 9 * Math.sin(a * 1.2566)).toFixed(1)}" r="6.5" fill="${c}"/>`).join('')}<circle cx="0" cy="-26" r="5.5" fill="${c2}"/></g>`;
export const sprout = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="13" ry="4" fill="#7A5232" opacity=".55"/><path d="M0 0Q0 -8 0 -12" stroke="#2E9E5B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M0 -10Q-10 -12 -11 -20Q-1 -19 0 -10Z" fill="#6ED08A"/><path d="M0 -10Q10 -12 11 -20Q1 -19 0 -10Z" fill="#43B368"/></g>`;
const tuft = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0Q-8 -10 -12 -16Q-4 -10 -2 0ZM-2 0Q-1 -14 2 -20Q5 -12 4 0ZM4 0Q8 -10 14 -14Q10 -6 10 0Z" fill="#3E9F55"/></g>`;
// kind: 'day' (green hills, sun) | 'sky' (sky and clouds only, fades to the page colour) | 'cool' (Track B teal landscape header)
import { gardenScene } from './garden-art.js';
export const scene = (o = {}) => gardenScene(o);   // Sound Garden scenery; the Sound Out original is kept below as sceneSO
export function sceneSO({ h = 560, kind = 'day', sun = true, trees = true, extra = '' } = {}) {
  const u = 'sc' + (++sceneN); const el = document.createElement('div'); el.className = `scene scene-${kind}`; el.setAttribute('aria-hidden', 'true');
  let body;
  if (kind === 'sky') {
    body = `<defs><linearGradient id="${u}q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ACFD6"/><stop offset=".42" stop-color="#CDEEEB"/><stop offset=".7" stop-color="#FFF8EA"/></linearGradient></defs><rect width="390" height="${h}" fill="url(#${u}q)"/>${cloud(310, 170, .8, .9)}${cloud(60, 250, .6, .8)}`;
  } else if (kind === 'cool') {
    const tt = (x, y, sc, c1, c2) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-3 0L-2 -26H3L4 0Z" fill="#134745"/><circle cx="-12" cy="-38" r="16" fill="${c2}"/><circle cx="12" cy="-38" r="16" fill="${c2}"/><circle cx="0" cy="-52" r="20" fill="${c1}"/><circle cx="-10" cy="-40" r="15" fill="${c1}"/><circle cx="11" cy="-38" r="15" fill="${c1}"/><circle cx="-6" cy="-58" r="8" fill="#6FC0B4" opacity=".6"/></g>`;
    body = `<defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14585A"/><stop offset=".7" stop-color="#3C8F8E"/><stop offset="1" stop-color="#9FD2CC"/></linearGradient><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58AAA4"/><stop offset="1" stop-color="#3C8D8E"/></linearGradient><linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#348382"/><stop offset="1" stop-color="#256E70"/></linearGradient><radialGradient id="${u}s"><stop offset="0" stop-color="#FFF3C4"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient></defs>
<rect width="390" height="${h}" fill="url(#${u}a)"/><circle cx="312" cy="${h - 276}" r="92" fill="url(#${u}s)" opacity=".7"/><circle cx="312" cy="${h - 276}" r="30" fill="#FFE9A0"/>
<path d="M-10 ${h - 72}Q70 ${h - 120} 170 ${h - 82}T400 ${h - 102}V${h}H-10Z" fill="url(#${u}b)"/><path d="M-10 ${h - 36}Q110 ${h - 80} 240 ${h - 42}T400 ${h - 52}V${h}H-10Z" fill="url(#${u}c)"/>
${tt(40, h - 42, 1, '#2B7C7B', '#1F6463')}${tt(78, h - 30, .7, '#348382', '#2B7C7B')}${tt(350, h - 46, .9, '#2B7C7B', '#1F6463')}`;
  } else {
    const sunsvg = sun ? `<circle cx="318" cy="92" r="118" fill="url(#${u}g)"/><circle cx="318" cy="92" r="40" fill="url(#${u}f)"/>` : '';
    const t = trees ? tree(46, h - 212, 1.05) + tree(344, h - 196, .8, '#35A862', '#5CC97A', '#27874E') : '';
    body = `<defs><linearGradient id="${u}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2FA3B5"/><stop offset=".6" stop-color="#B5E8E6"/><stop offset="1" stop-color="#E6F7F1"/></linearGradient><radialGradient id="${u}g"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient><radialGradient id="${u}f" cx=".38" cy=".34"><stop offset="0" stop-color="#FFF6C4"/><stop offset="1" stop-color="#FFD23F"/></radialGradient>
<linearGradient id="${u}1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9DCA4"/><stop offset="1" stop-color="#8CCB93"/></linearGradient><linearGradient id="${u}2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED66F"/><stop offset="1" stop-color="#62BC5E"/></linearGradient><linearGradient id="${u}3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6CC85F"/><stop offset="1" stop-color="#3F9F54"/></linearGradient></defs>
<rect width="390" height="${h}" fill="url(#${u}k)"/>${sunsvg}${cloud(70, 86, 1)}${cloud(236, 150, .7, .9)}${cloud(380, 60, .8, .85)}
<path d="M-10 ${h - 150}Q80 ${h - 230} 190 ${h - 170}T400 ${h - 190}V${h}H-10Z" fill="url(#${u}1)"/><path d="M-10 ${h - 110}Q110 ${h - 190} 250 ${h - 120}T400 ${h - 140}V${h}H-10Z" fill="url(#${u}2)"/><path d="M-10 ${h - 70}Q60 ${h - 120} 170 ${h - 86}T400 ${h - 100}V${h}H-10Z" fill="url(#${u}3)"/>
<path d="M-10 ${h - 110}Q110 ${h - 190} 250 ${h - 120}T400 ${h - 140}" fill="none" stroke="#B8EE95" stroke-width="3" opacity=".7"/>${t}${mush(330, h - 96, 1)}${mush(300, h - 84, .6)}${tuft(24, h - 60)}${tuft(360, h - 52, 1.1)}${tuft(110, h - 40, .8)}${extra}`;
  }
  el.innerHTML = `<svg viewBox="0 0 390 ${h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  return el;
}
// the garden on the near hill: one flower or mushroom per finished sitting, a sprout for each empty slot. It only ever adds.
const GARDEN = [['f', 30, '#FF8FB1'], ['m', 72], ['f', 118, '#FFB347'], ['f', 262, '#B79CFF'], ['m', 306], ['f', 350, '#FF8FB1'], ['f', 160, '#7BC8FF'], ['f', 216, '#FFD54A']];
export function garden(n) {
  const el = document.createElement('div'); el.className = 'garden'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', `Your garden: ${Math.min(n, GARDEN.length)} grown`);
  el.innerHTML = `<svg viewBox="0 0 390 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${GARDEN.map(([k, x, c], i) => i < n ? (k === 'f' ? flower(x, 54, 1.1, c) : mush(x, 54, .9)) : sprout(x, 54, 1.1)).join('')}</svg>`;
  return el;
}
// Tilo's contact shadow: a soft ellipse on the ground, 0.8 x his width (SYSTEM.md section 4)
export const groundShadow = () => h('div', { class: 'gshadow', 'aria-hidden': 'true' });
