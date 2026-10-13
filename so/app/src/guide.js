// The grown-up guide: content/guide.json as readable screens, behind the sum gate (grownup.js). Reached from Home -> "For grown-ups"
// (held for 2 s) -> sum -> this hub. One screen per topic, plain text, Track B colours, no mascot. A "1-minute guide" (start_here) comes first.
import GUIDE from '../../content/guide.json';
import { h, btn, icon, ICON } from './ui.js';
import { teacher } from './teacher.js';
import { tilo } from './tilo.js';
import { play, stop, has } from './audio.js';
import { g2p } from './content.js';
import * as db from './db.js';
import { printCard, printLink } from './practice.js';   // PRINT-PRACTICE block 1/2 (import)

const S = GUIDE.sections;
const ORDER = ['start_here', 'how_a_sitting_works', 'helping_without_the_answer', 'levels', 'saying_the_sounds', 'teachers', 'grown_up_learners', 'faq'];
const BLURB = {
  start_here: 'Seven things to know before the first sitting.',
  how_a_sitting_works: 'The nine steps, and when to stop.',
  helping_without_the_answer: 'What to say, and what not to say.',
  levels: 'What each level teaches, and an off-screen game for each.',
  saying_the_sounds: 'How to say each sound, short and clean.',
  teachers: 'Sharing one phone with a small group.',
  grown_up_learners: 'When the learner is an adult.',
  faq: 'Quick answers.',
};
const ul = (items, cls = '') => h('ul', { class: `gd-list ${cls}` }, ...items.map(t => h('li', {}, t)));
const ol = items => h('ol', { class: 'gd-list gd-steps' }, ...items.map(t => h('li', {}, t)));
const card = (...kids) => h('div', { class: 'gd-card' }, ...kids);
const sub = t => h('h2', { class: 'gd-h' }, t);
// TEACH-GUIDE: link to the printable parent + teacher guide (tools/guide_teach_pdf.py -> practice/guide-teach.pdf)
const teachCard = () => h('div', { class: 'gd-card print-card' }, h('b', {}, 'Teach with Sound Out'), h('p', {}, 'A printable guide for parents and teachers: the 5-minute routine, how to say all 43 sounds, a progress checklist. 8 pages, works offline.'), h('div', { class: 'row' }, printLink('guide-teach', 'Open the guide (PDF)', 'btn primary small')));

function frame(app, kind, title, ...body) {
  const back = kind === 'hub'
    ? btn('Home', 'home', { class: 'btn ghost small', onclick: () => { stop(); app.home(); } })
    : btn('All topics', 'arrow', { class: 'btn ghost small gd-back', onclick: () => { stop(); app.grownups(); } });
  const s = h('div', { class: 'guide track-B', 'data-guide': kind }, h('header', { class: 'hdr gd-hdr' }, back), h('h1', {}, title), ...body);
  document.documentElement.classList.add('track-B'); tilo.setTrack(null);
  app.mount(s); teacher.hideEar();
  return s;
}

// ---- one renderer per section shape ------------------------------------------------------------------------------------
const RENDER = {
  start_here: sec => [h('p', { class: 'gd-badge' }, 'A 1-minute read'), ol(sec.tips), teachCard()],
  how_a_sitting_works: sec => [h('p', {}, sec.intro), ol(sec.steps), sub('When to stop'), ul(sec.when_to_stop)],
  helping_without_the_answer: sec => [
    sub('Do'), ul(sec.do, 'gd-do'), sub('Do not'), ul(sec.dont, 'gd-dont'),
    sub('Words that help'), ...sec.phrases.map(p => card(h('p', { class: 'gd-when' }, p.when), h('p', { class: 'gd-say' }, `“${p.say}”`))),
    h('p', { class: 'gd-note' }, sec.after_reading)],
  levels: sec => [h('p', {}, sec.note), ...sec.items.map((l, i) => h('section', { class: 'gd-level', 'data-level': String(i + 1) },
    h('h2', { class: 'gd-h' }, `${l.id} · ${l.name}`),
    h('p', {}, h('b', {}, 'It teaches. '), l.learns), h('p', {}, h('b', {}, 'Off-screen game. '), l.offscreen), h('p', {}, h('b', {}, 'Ready to move on when. '), l.ready)))],
  saying_the_sounds: sec => [h('p', {}, sec.intro), ...sec.rows.map(r => card(
    h('div', { class: 'gd-sound' }, h('b', { class: 'gd-letter' }, r.sound), soundButton(r.sound)),
    h('p', {}, r.say_like), h('p', { class: 'gd-note' }, r.tip)))],
  teachers: sec => [ul(sec.points)],
  grown_up_learners: sec => [ul(sec.points)],
  faq: sec => sec.items.map(q => h('details', { class: 'gd-q' }, h('summary', {}, q.q), h('p', {}, q.a))),
};
// a speaker beside a single-letter sound, when the app has that clip (so an adult can hear the sound before saying it)
function soundButton(sound) {
  const key = g2p[sound] && `ph:${g2p[sound]}`;
  if (!key || !has(key)) return null;
  return h('button', { class: 'speaker gd-sp', type: 'button', 'aria-label': `Hear the sound ${sound}`, onclick: () => play(key) }, icon('speaker'));
}

export function guideHub(app) {
  const items = ORDER.filter(k => S[k]).map(k => {
    const first = k === 'start_here';
    return h('button', { class: `gd-topic${first ? ' gd-first' : ''}`, type: 'button', 'data-topic': k, onclick: () => guideSection(app, k) },
      h('span', { class: 'gd-t' }, S[k].title, S[k].minute ? h('em', {}, '1 minute') : null), h('span', { class: 'gd-b' }, BLURB[k] || ''), h('span', { class: 'gd-go', html: ICON.arrow }));
  });
  const settings = h('button', { class: 'gd-topic', type: 'button', 'data-topic': 'settings', onclick: () => app.privacyInfo() },
    h('span', { class: 'gd-t' }, 'Settings and privacy'), h('span', { class: 'gd-b' }, 'Time limit, calm motion, and what the app stores.'), h('span', { class: 'gd-go', html: ICON.arrow }));
  const page = frame(app, 'hub', GUIDE.title, h('p', { class: 'gd-intro' }, GUIDE.intro), h('div', { class: 'gd-topics' }, ...items, settings), teachCard(), printCard());   // PRINT-PRACTICE block 2/2 (card under the topic list)
  // a parked lesson (2 failed checks) leaves a quiet note here: the learner went on, but this one needs a listening grown-up (pedagogy round 1, fix 2)
  (async () => {
    try {
      const id = await db.setting('active'); const f = id ? (await db.progress(id)).helperFlag : null; if (!f) return;
      page.querySelector('.gd-intro')?.after(h('div', { class: 'gd-card helperflag' }, h('b', {}, `Lesson ${String(f.lessonId).slice(1)} is taking longer`),
        h('p', {}, 'The check was missed twice, so the learner moved on and it is marked provisional. Sit with them, let them sound out the words and tell them if each one is right. Then open that check again.')));
    } catch { /* no db: no note */ }
  })();
  return page;
}
export function guideSection(app, key) {
  const sec = S[key]; if (!sec) return guideHub(app);
  return frame(app, 'section', sec.title, ...RENDER[key](sec), h('div', { class: 'row' }, btn('All topics', 'arrow', { class: 'btn primary', onclick: () => app.grownups() })));
}
