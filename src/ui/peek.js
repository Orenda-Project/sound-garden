// S3p garden peek: dims the lesson by opacity, soil patch with a swelling seed for 2 s.
// pointer-events:none so it never covers the next item; any tap ends it and still lands on the item.
import { mound, seedShape } from '../art/art.js';
export function peek(host, anchor) {   // anchor: the feedback card; the patch sits in its free right half, never over tiles or the Next bar
  const p = document.createElement('div'); p.className = 'peek'; p.dataset.peek = '1';
  p.innerHTML = `<div class="dim"></div><div class="patch"><svg viewBox="-60 -100 120 120" aria-hidden="true"><defs><clipPath id="pk"><circle cx="0" cy="-40" r="56"/></clipPath></defs><circle cx="0" cy="-40" r="58" fill="#FBF6EA" stroke="#2F7D32" stroke-width="3"/><g clip-path="url(#pk)"><g transform="translate(0 4)">${mound(1.2)}</g><g transform="translate(0 -10)"><g class="sd"><g transform="scale(.9)">${seedShape}</g></g></g><g transform="translate(0 -62)"><g class="lf"><path d="M0 0q-2-10 0-16" stroke="#2F7D32" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M0-14c-12 0-16-7-16-12 10 0 16 5 16 12zM0-14c0-9 6-12 14-12 0 8-6 12-14 12z" fill="#4CB82B" stroke="#2F7D32" stroke-width="2.6" stroke-linejoin="round"/></g></g><g class="dr"><path d="M0-86q9 13 0 19-9-6 0-19z" fill="#6EC5FF" stroke="#2A74B8" stroke-width="3"/></g></g></svg></div>`;
  host.append(p);
  if (anchor) { const r = anchor.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(anchor.querySelector('.say')); const lim = rg.getBoundingClientRect().right + 14, d = Math.max(72, Math.min(104, r.height - 28, r.right - 16 - lim)), q = p.querySelector('.patch'); q.style.cssText = `position:absolute;margin:0;width:${d}px;height:${d}px;left:${Math.round(r.right - d - 16)}px;top:${Math.round(r.top + (r.height - d) / 2)}px`; }
  let gone = false;
  const end = () => { if (gone) return; gone = true; p.remove(); document.removeEventListener('pointerdown', end, true); clearTimeout(t); };
  const t = setTimeout(end, 2000);
  document.addEventListener('pointerdown', end, true);   // capture, no preventDefault: the tap continues to the item
  return end;
}
