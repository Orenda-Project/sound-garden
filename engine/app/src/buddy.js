// OVERLAY (Sound Garden): replaces the stock buddy.js. Same API (teacher.js, home.js, session.js ... call it), but the face is Sprig,
// the seed mascot (src/sprig/sprig.js, WAAPI rig). Poses map to Sprig states; the audio bus drives "speaking".
// Track A only; Track B (grown-up) gets no mascot.
import { createSprig } from '../../../src/sprig/sprig.js';
import { bus, isFast } from './audio.js';
import { isCalm } from './motion.js';

const POSE_STATE = { greeting: 'greet', idle: 'idle', listening: 'listening', speaking: 'speaking', celebrating: 'celebrate', encouraging: 'encourage', thinking: 'thinking' };
const reduced = () => isCalm();
const still = isFast || new URLSearchParams(location.search).has('still');
const st = { beat: null, homeHost: null, track: null, mood: 'idle', emote: null, emoteKey: null, pinned: null, speaking: false, mouth: 'mid', offT: 0, emoteT: 0, hold: null, host: null, uiKey: false, stage: 1, color: null };
let el = null, stageEl = null, bubble = null, rig = null, shownState = null;

function build() {
  el = document.createElement('div'); el.className = 'buddy sprig-host corner'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
  stageEl = document.createElement('div'); stageEl.className = 'buddy-stage';
  el.append(stageEl); document.body.append(el);
  rig = createSprig(stageEl, { stage: st.stage, identityColor: st.color || undefined });
  if (still) rig.setCalm(true);
  bubble = document.createElement('div'); bubble.className = 'buddy-bubble'; bubble.setAttribute('aria-hidden', 'true');
  bus.addEventListener('start', e => onStart(e.detail?.key));
  bus.addEventListener('end', e => onEnd(e.detail?.key));
}

function pose() {
  if (st.pinned) return st.pinned;
  if (st.speaking && !st.emote) return 'speaking';
  if (st.emote) return st.emote;
  return st.mood;
}

function render() {
  if (!el) return;
  const show = st.track === 'A';
  el.hidden = !show; if (!show) return;
  const p = pose(); const was = el.dataset.pose;
  el.dataset.pose = p;
  const want = POSE_STATE[p] || 'idle';
  if (want !== shownState) { shownState = want; try { rig.setState(want); } catch { /* unknown state: keep idle */ } }
  if (was && was !== p && !reduced()) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  renderBubble(p === 'speaking' && st.uiKey);
}

const SHORT = { 'what sound does it start with?': 'First sound?', 'which word do the sounds make?': 'Which word?', 'how many sounds?': 'How many sounds?' };
function bubbleText() {
  const src = document.querySelector('.stage .screen h2, .stage .screen .prompt');
  const t = (src?.textContent || '').trim();
  if (SHORT[t.toLowerCase()]) return SHORT[t.toLowerCase()];
  return t.length > 26 ? t.slice(0, 24).replace(/\s+\S*$/, '') + '…' : t;
}
function renderBubble(on) {
  if (!bubble) return;
  const beat = st.beat && st.beat.box.isConnected ? st.beat : null;
  const hdr = beat ? beat.box : (st.host?.closest?.('header.hdr') || null);
  const text = st.track !== 'A' || !hdr ? '' : beat ? beat.text : (on ? bubbleText() : '');
  if (text) { if (bubble.parentNode !== hdr) hdr.append(bubble); bubble.textContent = text; bubble.classList.add('on'); }
  else bubble.classList.remove('on');
}

function onStart(key) {
  clearTimeout(st.offT);
  if (st.emote && key === st.emoteKey) { clearTimeout(st.emoteT); render(); return; }
  if (st.emote) { clearTimeout(st.emoteT); st.emote = null; st.emoteKey = null; }
  st.uiKey = typeof key === 'string' && key.startsWith('ui:'); st.speaking = true; render();
}
function onEnd(key) {
  if (st.emote && key === st.emoteKey) { clearTimeout(st.emoteT); st.emoteT = setTimeout(() => { st.emote = null; st.emoteKey = null; render(); }, 1100); return; }
  clearTimeout(st.offT);
  st.offT = setTimeout(() => { st.speaking = false; render(); }, 260);
}

export const buddy = {
  setTrack(t) { if (!el) build(); st.track = t; render(); },
  arrive() { if (!el || reduced()) return; el.classList.remove('arrive'); void el.offsetWidth; el.classList.add('arrive'); setTimeout(() => el.classList.remove('arrive'), 500); },
  blink() { return false; },
  screen() {
    if (!el) build();
    st.beat = null; st.uiKey = false; st.mood = 'idle'; st.emote = null; st.emoteKey = null; st.pinned = null; clearTimeout(st.emoteT);
    buddy.dock(st.homeHost && st.homeHost.isConnected ? st.homeHost : null); render();
  },
  beat(slot, box, text) { if (!el) build(); st.beat = { box, text }; buddy.dock(slot); render(); },
  endBeat() { if (!st.beat) return; st.beat = null; buddy.dock(st.homeHost && st.homeHost.isConnected ? st.homeHost : null); render(); },
  setHome(host) { st.homeHost = host; if (host) buddy.dock(host); },
  dock(host) {
    if (!el) build();
    st.host = host;
    if (host) { el.classList.remove('corner'); el.classList.add('inline'); host.replaceChildren(el); }
    else { el.classList.remove('inline'); el.classList.add('corner'); if (el.parentNode !== document.body) document.body.append(el); }
    shownState = null; render();
  },
  mood(m) { if (!el) build(); st.mood = m; render(); },
  emote(name, key, hold = 3000) { if (!el) build(); st.emote = name; st.emoteKey = key || null; clearTimeout(st.emoteT); st.emoteT = setTimeout(() => { st.emote = null; st.emoteKey = null; render(); }, hold); render(); },
  pin(name) { if (!el) build(); st.pinned = name; render(); },
  hold(n) { st.hold = n; },
  // Sprig grows as the child learns: 1 sprout .. 4 bloom (home.js passes the finished-lesson count)
  setStage(n) { st.stage = Math.max(0, Math.min(4, n | 0)); if (rig) rig.setStage(st.stage); },
  setColor(c) { st.color = c; if (stageEl) stageEl.style.setProperty('--sp-leaf', c || ''); },
  get state() { return { pose: el?.dataset.pose || null, track: st.track, speaking: st.speaking, mouth: st.mouth }; },
};
