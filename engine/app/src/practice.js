// Printable practice pages (tools/practice_pdf.py -> app/public/practice/*.pdf, bundled, so they work offline).
// A plain <a download> everywhere. Inside the Android app a WebView does not save a download, so there the tap first tries the
// system share dialog with the PDF as a file (Web Share level 2); if that is not available the plain link still opens it.
// (Capacitor Filesystem + Share are not installed; add them if the share dialog turns out to be missing on a device.)
import { Capacitor } from '@capacitor/core';
import { h } from './ui.js';
import './practice.css';

const BASE = import.meta.env.BASE_URL || './';   // '/' on the web build, './' in the Android build
export const practiceUrl = file => `${BASE}practice/${file}`;

async function shareNative(url, name, ev) {
  if (!Capacitor.isNativePlatform() || !navigator.share) return;
  try {
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], name, { type: 'application/pdf' });
    if (!navigator.canShare?.({ files: [file] })) return;
    ev.preventDefault();
    await navigator.share({ files: [file], title: name });
  } catch { /* the plain link still works */ }
}

// one link: id is a lesson like 'L1.02', or 'level-1-all'
export function printLink(id, label = 'Print practice', cls = 'btn ghost small') {
  const name = `${id}.pdf`;
  const url = practiceUrl(name);
  const a = h('a', { class: `${cls} print-practice`, href: url, download: `sound-garden-practice-${id}.pdf`, 'data-practice': id, 'aria-label': `${label}, PDF to print` }, label);
  a.addEventListener('click', ev => { shareNative(url, `sound-garden-practice-${id}.pdf`, ev); });
  return a;
}

// the grown-up guide card: pick a lesson and print its pages; plus one combined PDF per level
export function printCard(levels = [1, 2, 3, 4, 5, 6, 7]) {
  const card = h('div', { class: 'gd-card print-card' }, h('b', {}, 'Print practice'),
    h('p', {}, 'One or two pages per lesson, made for A4 or Letter. They work without internet and in black and white.'));
  const slot = h('div', { class: 'row print-one' });
  const sel = h('select', { 'aria-label': 'Pick a lesson to print' });
  const show = () => { slot.replaceChildren(printLink(sel.value, `Print lesson ${sel.value.slice(1)}`, 'btn primary small')); };
  sel.addEventListener('change', show);
  fetch(practiceUrl('index.json')).then(r => r.json()).then(ix => {
    for (const id of Object.keys(ix).filter(k => /^L\d/.test(k))) sel.append(h('option', { value: id }, `Lesson ${id.slice(1)}`));
    show();
  }).catch(() => { sel.hidden = true; });
  card.append(sel, slot);
  const all = h('div', { class: 'row' });
  for (const lv of levels) all.append(printLink(`level-${lv}-all`, `Level ${lv}, all lessons`, 'btn ghost small'));
  card.append(all);
  return card;
}
