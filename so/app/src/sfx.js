// Tiny synthesized feedback sounds (Web Audio, no files, no network). Spoken lines always come from the recorded clips; these are only
// the "ding" around them: a rising two-note chime for a right answer, a soft low "hmm" for a miss (never a buzzer), a note per star.
// Silent in the test drivers (?fast) and whenever the browser has no AudioContext. They are NOT recorded in window.__so.trace.
import { isFast } from './audio.js';

const AC = window.AudioContext || window.webkitAudioContext;
let ctx = null;
function ac() {
  if (isFast || !AC || window.__so?.audioOff) return null;
  // a browser that has not had a tap yet would only log "AudioContext not allowed to start" and, worse, hold the spoken clips back: wait for a first tap
  // (the Android app's WebView plays without one)
  if (!window.Capacitor?.isNativePlatform?.() && navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  try { ctx = ctx || new AC(); if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; } catch { return null; }
}
// one soft note: sine, quick attack, exponential tail
function note(c, freq, at, dur, { gain = 0.11, to = null, type = 'sine' } = {}) {
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
const NOTES = [523.25, 659.25, 783.99, 1046.5];   // C5 E5 G5 C6
export const sfx = {
  chime() { const c = ac(); if (!c) return; note(c, NOTES[0], 0, 0.18); note(c, NOTES[2], 0.09, 0.3, { gain: 0.1 }); },
  hmm() { const c = ac(); if (!c) return; note(c, 247, 0, 0.32, { gain: 0.07, to: 208 }); },
  star(i = 0) { const c = ac(); if (!c) return; note(c, NOTES[Math.min(i, 3)], 0, 0.28, { gain: 0.1 }); },
  unlock() { const c = ac(); if (!c) return; note(c, NOTES[1], 0, 0.14); note(c, NOTES[2], 0.1, 0.14); note(c, NOTES[3], 0.2, 0.34, { gain: 0.1 }); },
  hello() { const c = ac(); if (!c) return; note(c, NOTES[0], 0, 0.22); note(c, NOTES[1], 0.16, 0.22); note(c, NOTES[2], 0.32, 0.4, { gain: 0.1 }); },   // the splash jingle
};
