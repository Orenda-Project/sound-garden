// "For grown-ups": the privacy policy as plain text, reached from Home behind the grown-up gate. No links: the address is text.
import { h, btn } from './ui.js';
import * as db from './db.js';
import { calmSetting, setCalm } from './motion.js';

const ROWS = [
  ['A learner profile: an automatic label such as "Child 1" or "Grown-up 1", and the track chosen (child or grown-up)', 'So progress stays separate when more than one person uses a phone'],
  ['Lesson progress, check results, review cards for sounds and words, days practised, stickers', 'To pick the next lesson, bring back what was missed, and show progress'],
  ['Two small flags: whether the first-time demo was shown, and the active profile', 'So the demo is not repeated'],
];

// grown-up setting: no countdown on the Level 1 reading check (stored with the other settings as `noTimeLimit`)
function timeLimitToggle() {
  const cb = h('input', { type: 'checkbox', id: 'no-time-limit', class: 'chk' });
  db.setting('noTimeLimit').then(v => { cb.checked = !!v; }).catch(() => {});
  cb.addEventListener('change', () => { db.setting('noTimeLimit', cb.checked).catch(() => {}); });
  return h('label', { class: 'chkrow', for: 'no-time-limit' }, cb, h('span', {}, 'No time limit on the reading check'));
}

// grown-up setting: "I'll listen" (stored as `helperMode`). On: after a learner blends a word aloud, the grown-up taps Said it right / Not yet.
// Those taps are the only judgement of the learner's own voice the app can have (it does not listen); without it every result is tap-only.
function helperToggle() {
  const cb = h('input', { type: 'checkbox', id: 'helper-mode', class: 'chk' });
  db.setting('helperMode').then(v => { cb.checked = !!v; }).catch(() => {});
  cb.addEventListener('change', () => { db.setting('helperMode', cb.checked).catch(() => {}); });
  return h('label', { class: 'chkrow', for: 'helper-mode' }, cb, h('span', {}, "I'll listen (grown-up helper)"));
}

// grown-up setting: Calm motion (stored as `calmMotion`). On: no bouncing, sparkles, confetti, slides or breathing; colour and sound feedback stay.
function calmToggle() {
  const cb = h('input', { type: 'checkbox', id: 'calm-motion', class: 'chk' });
  cb.checked = calmSetting();
  cb.addEventListener('change', () => setCalm(cb.checked));
  return h('label', { class: 'chkrow', for: 'calm-motion' }, cb, h('span', {}, 'Calm motion'));
}

export function privacyScreen(app) {
  const s = h('div', { class: 'privacy track-B' },
    h('header', { class: 'hdr' }, btn('All topics', 'arrow', { class: 'btn ghost small gd-back', onclick: () => app.grownups() })),
    h('h1', {}, 'Privacy'),
    h('h2', { class: 'left' }, 'Settings for grown-ups'),
    timeLimitToggle(),
    h('p', { class: 'muted small left' }, 'For a grown-up learner the reading check waits 40 seconds for each answer (a child never sees a countdown). Tick this to take away the countdown. Without it, the learner can also tap More time.'),
    helperToggle(),
    h('p', { class: 'muted small left' }, 'Sit with the learner. After they sound out a word and say it, you tap Said it right or Not yet. Those taps count towards the check. Without this, results come from tapping only, and the app says so.'),
    calmToggle(),
    h('p', { class: 'muted small left' }, 'Tick this to stop the bouncing, sparkles, confetti, sliding screens and Tilo\'s breathing. Colours and sounds stay. It is also on when the phone is set to reduce motion.'),
    h('h2', { class: 'left' }, 'The short version'),
    h('p', {}, 'Sound Garden works offline once it has loaded. It has no account, no login, no ads, no analytics and no tracking. Everything a learner does stays on this phone. The developer never sees it.'),
    h('h2', { class: 'left' }, 'What the app stores on this phone'),
    h('table', { class: 'mastery' }, ...ROWS.map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', { class: 'muted' }, b)))),
    h('p', {}, 'The app never asks for a real name, an email, an age or a birthday. Words typed in a writing exercise are compared on screen and not saved.'),
    h('h2', { class: 'left' }, 'What the app does not do'),
    h('p', {}, 'It does not use the internet, show ads, record or listen to anyone, or ask for the microphone, camera, location, contacts or files. Deleting the app deletes everything.'),
    h('h2', { class: 'left' }, 'Full policy'),
    h('p', {}, 'The full privacy policy is at this address (type it into a browser):'),
    h('p', { class: 'url' }, 'oyekamal.github.io/sound-out/privacy.html'));
  app.mount(s);
  return s;
}
