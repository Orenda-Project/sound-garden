import { scene, mound, speaker } from '../art/art.js';
import { createSprig } from '../sprig/sprig.js';
import { load, sprout } from '../store.js';
import { LESSONS } from '../progression.js';
import { play, unlock } from '../audio.js';
import { onLeave } from '../router.js';
import { label } from './btn.js';

export function loadDisplayFont() {   // Grandstander: lazy, only after the first sprout; headings use the system stack until it lands
  if (document.getElementById('sg-font')) return;
  const l = Object.assign(document.createElement('link'), { id: 'sg-font', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Grandstander:wght@800&display=swap' });
  document.head.append(l);
}
const LABEL = Object.fromEntries(LESSONS.map(([id, , l]) => [id, l]));
const WORD = { 'L1.02': 'sun' };

// S6: the celebration, alone. Title, the sound, the plant rising from the soil, one button.
export function mount(el, lid) {
  const first = !load().sprouted;
  sprout(lid); loadDisplayFont();
  const l = LABEL[lid], sound = l ? `<u>${l}</u>${WORD[lid] ? ` as in ${WORD[lid]}` : ' sound'}` : 'Words are made of sounds';
  el.innerHTML = `<main class="sprout">${scene('gold', { hill: 540, sunAt: [195, 330, 60], flowers: false })}
    <h1 class="disp">Sprouted!</h1>
    <button class="snd" type="button" aria-label="Hear it again">${speaker(26)}<span>${sound}</span></button>
    <div class="hero"><div class="rise"><div class="sp"></div></div></div>
    <svg class="bigmound" viewBox="-195 -100 390 240" aria-hidden="true"><path d="M-195 6Q-110 -8 0 -6T195 6V140H-195Z" fill="#6B4416"/><path d="M-195 6Q-110 -8 0 -6T195 6" fill="none" stroke="#4A2F14" stroke-width="3.4"/>${mound(2.2)}<g fill="#4A2F14" opacity=".5"><ellipse cx="-120" cy="50" rx="9" ry="4"/><ellipse cx="110" cy="64" rx="10" ry="4"/><ellipse cx="-30" cy="78" rx="8" ry="3.4"/><ellipse cx="150" cy="30" rx="7" ry="3"/></g><g fill="#B88A4A" opacity=".6"><ellipse cx="-150" cy="30" rx="8" ry="3.4"/><ellipse cx="70" cy="40" rx="8" ry="3.4"/></g></svg>
    <a class="btn" data-sprout-go href="${first ? '#/remind' : '#/home'}">${label('garden', 'See my garden')}</a></main>`;
  const sp = createSprig(el.querySelector('.sp'), { stage: 1 });
  onLeave(() => sp.destroy());
  sp.setState('level-up', { toStage: 2 });
  const sayIt = () => { unlock(); play(l ? `ph:${l}` : 'ui:good'); sp.setState('tap-react'); };
  el.querySelector('.snd').addEventListener('click', sayIt);
  el.querySelector('.hero').addEventListener('click', sayIt);
  play('ui:checkPass');
}

// S6a: its own screen right after S6. Ready time is computed, never a guess.
export function remind(el) {
  const at = new Date(Date.now() + 20 * 3600e3), pad = (n) => String(n).padStart(2, '0');
  const when = at.toLocaleString([], { weekday: 'long', hour: 'numeric', minute: '2-digit' });
  el.innerHTML = `<main class="remind"><div class="card"><div class="sp"></div><h1>Ready tomorrow, about 3 minutes</h1><p>Your plant is ready for a drink from <b>${when}</b>.</p></div>
    <div class="acts"><button class="btn" type="button" data-remind>${label('bell', 'Remind me', false)}</button><button class="btn ghost" type="button" data-install>${label('house', 'Add to Home Screen', false)}</button><a class="linkbtn" data-notnow href="#/home" style="text-align:center">Not now</a></div></main>`;
  const sp = createSprig(el.querySelector('.sp'), { stage: 2 }); onLeave(() => sp.destroy()); sp.setState('proud');
  const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  el.querySelector('[data-remind]').addEventListener('click', (e) => {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sound Garden//EN', 'BEGIN:VEVENT', `UID:sg-${Date.now()}@sound-garden`, `DTSTAMP:${ymd(new Date())}`, `DTSTART:${ymd(at)}`, `DTEND:${ymd(new Date(+at + 3 * 60e3))}`, 'SUMMARY:Water your Sound Garden (3 minutes)', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'sound-garden.ics' });
    a.click(); e.target.textContent = 'Added'; e.target.disabled = true;
  });
  let deferred = null; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  el.querySelector('[data-install]').addEventListener('click', async (e) => {
    if (deferred) { deferred.prompt(); } else e.target.textContent = 'Use your browser menu: Add to Home Screen';
  });
}
