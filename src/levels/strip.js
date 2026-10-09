// Zone strip under the garden: zone 1 is the live garden above, zones 2-7 are procedural terrain (seeded by lesson id).
// Public build: locked, with a soft sign. ?dev=1: each plot opens its lesson. Lazy: loaded only on #/home.
import { ZONES } from './garden-data.js';
import { DEV } from './enter.js';
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const W = 300, H = 190;
function terrain(z) {
  const items = z.items.filter((it) => it[2] !== 'l'), cols = Math.ceil(items.length / 3);
  let g = '';
  items.forEach(([id, name, type], k) => {
    const r = hash(id), row = k % 3, col = Math.floor(k / 3);
    const x = 26 + (col + 0.5 * (row % 2)) * ((W - 52) / cols) + (r % 9) - 4, y = 96 + row * 30 + ((r >> 4) % 7), sc = 0.8 + row * 0.12;
    const c = z.palette[r % z.palette.length], hgt = 14 + ((r >> 8) % 12);
    let shape;
    if (type === 'r') shape = `<ellipse cx="0" cy="-2" rx="11" ry="4" fill="#BDB394"/>`;
    else if (type === 't') shape = `<rect x="-2" y="${-hgt}" width="4" height="${hgt}" fill="#8A5A1E"/><rect x="-8" y="${-hgt - 4}" width="16" height="6" rx="2" fill="${c}"/>`;
    else shape = `<path d="M0 0V${-hgt}" stroke="#2F7D32" stroke-width="2.4" stroke-linecap="round"/><circle cy="${-hgt - 4}" r="${5 + (r >> 12) % 3}" fill="${c}" stroke="#12330F" stroke-width="1.2"/>`;
    const body = `<ellipse cy="2" rx="13" ry="5" fill="#6B4416"/>${shape}`;
    g += DEV ? `<a class="plot" href="#/lesson/${id}" aria-label="${name}, ${id}"><g transform="translate(${x.toFixed(1)} ${y}) scale(${sc.toFixed(2)})">${body}</g></a>`
      : `<g transform="translate(${x.toFixed(1)} ${y}) scale(${sc.toFixed(2)})" aria-hidden="true">${body}</g>`;
  });
  const lm = `<rect x="${W - 54}" y="52" width="36" height="30" rx="5" fill="none" stroke="#8A8372" stroke-width="2.2" stroke-dasharray="4 4"/>`;   // landmark: data only for now
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${z.name}: ${DEV ? 'open for testing' : 'not grown yet'}"><rect width="${W}" height="${H}" fill="#DCEEF9"/><path d="M0 70Q70 40 140 62T300 50V${H}H0Z" fill="#A9C96A"/><path d="M0 110Q90 84 180 104T300 92V${H}H0Z" fill="#8FBF57"/>${lm}${g}</svg>`;
}
export function mount(home) {
  if (!home.querySelector('.home')) return;
  const sec = document.createElement('section'); sec.className = 'zones'; sec.setAttribute('aria-label', 'The rest of the garden');
  sec.innerHTML = `<h2>More of the garden</h2><div class="strip" tabindex="0">${ZONES.map((z) => z.n === 1
    ? `<div class="zone live" data-zone="1"><div class="cap"><b>1 · ${z.name}</b><span>Your garden, above.</span></div></div>`
    : `<div class="zone locked" data-zone="${z.n}"><div class="art" data-art="${z.n}"></div><div class="cap"><b>${z.n} · ${z.name}</b><span>${z.items.length} lessons${DEV ? ', open for testing' : ''}</span></div>${DEV ? '' : '<div class="soft-sign" style="margin:0 12px 12px;padding:8px 12px;font-size:14px">Sounds being recorded</div>'}</div>`).join('')}</div></section>`;
  home.append(sec);
  const draw = (a) => { if (a.firstChild) return; a.innerHTML = terrain(ZONES[a.dataset.art - 1]); };
  const arts = [...sec.querySelectorAll('[data-art]')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { draw(e.target); io.unobserve(e.target); } }), { root: sec.querySelector('.strip'), rootMargin: '0px 300px' }); arts.forEach((a) => io.observe(a)); }
  else arts.forEach(draw);
}
