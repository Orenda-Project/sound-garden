// S3p garden peek: dims the lesson by opacity, soil patch with a swelling seed for 2 s.
// pointer-events:none so it never covers the next item; any tap ends it and still lands on the item.
import { mound, seedShape } from '../art/art.js';
export function peek(host) {
  const p = document.createElement('div'); p.className = 'peek'; p.dataset.peek = '1';
  p.innerHTML = `<div class="dim"></div><div class="patch"><svg viewBox="-80 -80 160 100" aria-hidden="true">${mound(1.2)}<g transform="translate(0 -14)"><g class="sd"><g transform="scale(.9)">${seedShape}</g></g></g></svg></div>`;
  host.append(p);
  let gone = false;
  const end = () => { if (gone) return; gone = true; p.remove(); document.removeEventListener('pointerdown', end, true); clearTimeout(t); };
  const t = setTimeout(end, 2000);
  document.addEventListener('pointerdown', end, true);   // capture, no preventDefault: the tap continues to the item
  return end;
}
