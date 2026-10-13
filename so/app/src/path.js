// The path: every sitting of the playable lessons, in order. Sittings are on demand:
// the next one opens when the previous mini check passed. A failed "Show what you know" does NOT open the next lesson: the lesson reteaches
// (the check stays current). After 2 failed tries the check is parked and marked provisional so nobody is stuck for ever (session.js).
import { LESSONS, sittingsFor, lessonById } from './content.js';
export function allSittings(track) { return LESSONS.flatMap(l => sittingsFor(l, track)); }
export function states(prog, track) {
  const list = allSittings(track);
  let open = true;
  return list.map(s => {
    const rec = prog.sittings[s.key];
    const st = rec?.passed ? 'done' : open ? 'open' : 'locked';
    open = !!(rec?.passed || rec?.parked);
    return { ...s, state: st, rec };
  });
}
export function nextOpen(prog, track, afterKey) {
  const st = states(prog, track);
  const i = st.findIndex(s => s.key === afterKey);
  const n = st[i + 1];
  return n && n.state !== 'locked' ? n.key : null;
}
export const LABEL = {
  A: { A: null, B: null, C: null, D: 'Words', R: 'Read', L: 'Listen', X: 'Show what you know' },
  B: { D: 'Words and reading', X: 'Check' },
};

// ---- reteach (pedagogy round 1, fix 2): a failed check keeps the lesson current and sends the learner back to the teaching sitting first
const CHECK_STEPS = ['check', 'oralCheck', 'mastery'];
export const isCheckSitting = s => !!s && s.steps.some(x => CHECK_STEPS.includes(x));
export function checkSittingOf(lessonId, track) { const l = lessonById(lessonId); return l ? sittingsFor(l, track).find(isCheckSitting) : null; }
// the sitting that reteaches: the last one before the check that actually teaches or drills words (blend / teach / oral); else null (retry the check itself)
export function reteachKeyFor(lessonId, track) {
  const l = lessonById(lessonId); if (!l) return null;
  const all = sittingsFor(l, track), i = all.findIndex(isCheckSitting);
  const before = (i < 0 ? all : all.slice(0, i)).filter(s => s.steps.some(x => ['blend', 'teach', 'oral', 'attack'].includes(x)));
  return before.length ? before[before.length - 1].key : null;
}
// a check that failed (and is not parked) and has not been reteached since: the key to run instead of it
export function needReteach(prog, key, track) {
  const rec = prog.sittings[key]; if (!rec || rec.passed || rec.parked || !(rec.reteach > 0) || rec.reteachDone === rec.reteach) return null;
  const k = reteachKeyFor(key.split(':')[0], track); return k && k !== key ? k : null;
}
// after a reteach sitting: the check of the same lesson that is waiting for it (or null)
export function pendingCheck(prog, key, track) {
  const c = checkSittingOf(key.split(':')[0], track); if (!c || c.key === key) return null;
  const rec = prog.sittings[c.key]; return rec && !rec.passed && !rec.parked && rec.reteach > 0 ? c.key : null;
}
