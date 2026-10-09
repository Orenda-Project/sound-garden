// S3p garden peek: dims the lesson by opacity, soil patch with a swelling seed for 2 s.
// pointer-events:none so it never covers the next item; any tap ends it and still lands on the item.
export function peek(host) {
  const p = document.createElement('div'); p.className = 'peek'; p.dataset.peek = '1';
  p.innerHTML = '<div class="dim"></div><div class="patch"><i></i></div>';
  host.append(p);
  let gone = false;
  const end = () => { if (gone) return; gone = true; p.remove(); document.removeEventListener('pointerdown', end, true); clearTimeout(t); };
  const t = setTimeout(end, 2000);
  document.addEventListener('pointerdown', end, true);   // capture, no preventDefault: the tap continues to the item
  return end;
}
