// S3p garden peek: dims the lesson by opacity, soil patch with a swelling seed for 2 s.
// pointer-events:none so it never covers the next item; any tap ends it and still lands on the item.
import { mound, seedShape } from '../art/art.js';
export function peek(host) {
  const p = document.createElement('div'); p.className = 'peek'; p.dataset.peek = '1';
  p.innerHTML = `<div class="dim"></div><div class="patch"><svg viewBox="-80 -100 160 120" aria-hidden="true">${mound(1.2)}<g transform="translate(0 -14)"><g class="sd"><g transform="scale(.9)">${seedShape}</g></g></g><g transform="translate(0 -70)"><g class="lf"><path d="M0 0q-2-10 0-16" stroke="#2F7D32" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M0-14c-12 0-16-7-16-12 10 0 16 5 16 12zM0-14c0-9 6-12 14-12 0 8-6 12-14 12z" fill="#4CB82B" stroke="#2F7D32" stroke-width="2.6" stroke-linejoin="round"/></g></g><g class="dr"><path d="M0-78q9 13 0 19-9-6 0-19z" fill="#6EC5FF" stroke="#2A74B8" stroke-width="2.6"/></g></svg></div>`;
  host.append(p);
  let gone = false;
  const end = () => { if (gone) return; gone = true; p.remove(); document.removeEventListener('pointerdown', end, true); clearTimeout(t); };
  const t = setTimeout(end, 2000);
  document.addEventListener('pointerdown', end, true);   // capture, no preventDefault: the tap continues to the item
  return end;
}
