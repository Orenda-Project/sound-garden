// Runs one sitting: a list of steps from the lesson JSON (appSittings), then the mini check and rewards.
import { play, stop, mark, has } from './audio.js';
import { h, icon, btn, village, STICKERS, playButton } from './ui.js';
import { celebrate, countUp } from './celebrate.js';
import { states, reteachKeyFor, pendingCheck } from './path.js';
import { buddy } from './buddy.js';
import { teacher } from './teacher.js';
import * as db from './db.js';
import { review, due } from './scheduler.js';
import { lessonById, sittingsFor, blendItems, spellWords, entry, LESSONS, options } from './content.js';
import { hear } from './screens/hear.js';
import { meetSound } from './screens/meetsound.js';
import { meet } from './screens/meet.js';
import { trace } from './screens/trace.js';
import { blend } from './screens/blend.js';
import { spellLetters, spellWord } from './screens/spell.js';
import { tricky } from './screens/tricky.js';
import { read } from './screens/read.js';
import { listen } from './screens/listen.js';
import { check } from './screens/check.js';
import { warmLetter } from './screens/warm.js';
import { gate } from './gate.js';
import { L1_STEPS } from './screens/l1steps.js';
import { LEVEL_STEPS } from './screens/levelsteps.js';

const NUDGE = { hear: 'ui:idleTap', meet: 'ui:idleTap', teach: 'ui:idleTap', rule: 'ui:idleTap', trace: 'ui:idleTrace', blend: 'ui:idleSay', read: 'ui:idleSay', attack: 'ui:idleSay', tricky: 'ui:idleTap' };
export const MINI_BAR = 0.8;   // course mini checks are 4/5 and 7/8
export const MIN_JUDGED = 3;   // fewer items than this never decide a mini check

// Every grapheme taught before this sitting starts (track-aware), and after it ends.
export function knownBefore(track, key) {
  const out = [];
  for (const l of LESSONS) for (const s of sittingsFor(l, track)) { if (s.key === key) return out; out.push(...(s.new || [])); }
  return out;
}

export async function runSitting(app, profile, key) {
  const [lid, track, sid] = key.split(':');
  const lesson = lessonById(lid);
  const sitting = sittingsFor(lesson, track).find(s => s.key === key);
  const prog = await db.progress(profile.id);
  const results = [];
  const known = knownBefore(track, key);
  const root = h('div', { class: `sitting track-${track}` });
  const bar = h('div', { class: 'progress' }, h('i'));
  const close = h('button', { class: 'close', 'aria-label': 'Stop and go home', 'data-say': 'ui:goHome', onclick: () => { stop(); app.home(); } }, icon('close'));
  const body = h('main', { class: 'stage' });
  const foot = h('footer', { class: 'foot' });
  root.append(h('header', { class: 'hdr' }, close, h('div', { class: 'buddy-slot hdr-buddy' }), bar), body, foot);
  app.mount(root);
  if (track === 'A') { buddy.setHome(root.querySelector('.hdr-buddy')); buddy.arrive(); }
  let stepN = 0; const totalSteps = sitting.steps.length;
  const ctx = {
    track, lesson, sitting, profile,
    // opts.beat = a line for Sprig's speech bubble: Track A shows him big in the body beside it (intro / demo screens); the first screen of every sitting is one too.
    // The header Sprig hides while a beat is up (root.has-beat), so there are never two. Track B has no mascot, so no beat.
    endBeat() { root.classList.remove('has-beat'); root.querySelector('.beat')?.remove(); buddy.endBeat(); },
    stage(opts = {}) {
      teacher.newScreen(); body.replaceChildren(); foot.replaceChildren();
      const s = h('div', { class: 'screen enter-fwd', 'data-step': ctx.step || '' }); body.append(s);
      const line = track === 'A' ? (opts.beat || (ctx.beaten ? null : "Let's begin!")) : null; ctx.beaten = true;
      root.classList.toggle('has-beat', !!line);
      if (line) { const slot = h('div', { class: 'buddy-slot' }); const box = h('div', { class: 'beat' }, slot); s.append(box); buddy.beat(slot, box, line); }
      return s;
    },
    // say what to do (then the stimulus); the ear button and the idle ladder say it again. A pending arc line
    // ("halfway", "last one") goes in front of the first prompt of its step.
    async instruct(k, opts) {
      if (root.classList.contains('has-beat') && root.getBoundingClientRect().height > window.innerHeight + 1) ctx.endBeat();   // a full screen (answer cards) has no room for a big Sprig: he goes back to the header
      // the first screen of a sitting that starts by itself and has no visible control gets one big play/replay button
      if (!ctx.startShown) { ctx.startShown = true; const sc = body.querySelector('.screen'); if (sc && !sc.querySelector('.speaker, .options, .lettercard, canvas, .startplay, .btn')) sc.append(playButton(() => teacher.replay(), 'Play the instructions')); }
      const pre = ctx.pre; ctx.pre = null;
      const keys = [...(pre ? [`ui:${pre}`] : []), ...(Array.isArray(k) ? k : [k])];
      return teacher.prompt(keys, { nudge: NUDGE[String(ctx.step).split('-')[0]] || 'ui:idlePick', ...opts });
    },
    enableNext: () => {},
    next({ disabledUntil, waitFor, skippable } = {}, narrate) {
      return new Promise(res => {
        const nb = btn('Next', 'arrow', { class: 'btn primary next', say: 'ui:next', 'aria-label': 'Next' });
        let was = false;
        const update = () => {
          nb.disabled = disabledUntil ? !disabledUntil() : false;
          if (!nb.disabled && !was && !nb.hidden) { was = true; arrowHelp(); }
        };
        // the first Next of a sitting is explained once: "Tap the arrow to go on."; later ones are pointed at when the learner stalls
        const arrowHelp = () => {
          teacher.setIdle({ nudge: 'ui:idleArrow', hint: () => teacher.point(nb) });
          if (!ctx.arrowTold) { ctx.arrowTold = true; teacher.say('ui:tapArrow'); }
        };
        ctx.enableNext = update; update();
        nb.addEventListener('click', () => { stop(); res(); });
        if (waitFor) {
          nb.hidden = true;
          const skip = btn('Skip', 'skip', { class: 'btn ghost skip', say: 'ui:skip' });
          skip.addEventListener('click', () => { stop(); mark('skip', { step: ctx.step }); res(); });
          foot.append(skip);
          waitFor.then(() => { skip.remove(); nb.hidden = false; update(); });
        }
        foot.append(nb);
        if (narrate) Promise.resolve(narrate()).catch(e => console.error(e));   // narration that runs while Next is already on screen
      });
    },
    async record(item, kind, r) {
      if (!r.judged) return;
      results.push({ item, kind, correct: !!r.correct, mode: r.mode || 'tap' });
      await review(profile.id, item, kind, !!r.correct, prog.sittingCount || 0);
    },
    lessonSitting: letter => (lesson.sittings || []).find(s => (s.new || []).includes(letter)),
    known: () => [...known, ...(sitting.new || [])],
    rememberWord: w => { prog.words = [...new Set([...(prog.words || []), w])]; },
    hasClip: has,
  };
  const step = n => {
    ctx.step = n; stepN++;
    if (totalSteps >= 4 && stepN === Math.ceil(totalSteps / 2) + 1) ctx.pre = 'halfway';        // session arc: halfway ...
    else if (totalSteps >= 3 && stepN === totalSteps) ctx.pre = 'lastOne';                       // ... and the last step
    bar.firstChild.style.transform = `scaleX(${(stepN / (totalSteps + 1)).toFixed(3)})`; bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump'); mark('step', { key, step: n });
  };
  let checkResult = null;
  teacher.track(track);
  let began = false;
  for (const st of sitting.steps) {
    step(st);
    if (!began) { began = true; ctx.pre = 'begin'; }   // "Let's begin." leads the first prompt of every sitting
    if (st === 'warm') {
      const cards = (await due(profile.id, prog.sittingCount || 0, track === 'A' ? 3 : 6));
      const letters = [...new Set([...cards.filter(c => c.kind === 'letter').map(c => c.item.split(':')[1]), ...known.slice(-2)])].filter(l => known.includes(l)).slice(0, track === 'A' ? 3 : 6);
      for (const l of letters) await warmLetter(ctx, l, known);
      const word = cards.find(c => (c.kind === 'real' || c.kind === 'pseudo') && entry(c.item) && options[c.item.toLowerCase()]);   // words without tap-gate options (Levels 2-4 unbuildable) are not warm-up gates
      if (word) { const r = await gate(ctx, word.item, word.kind); await ctx.record(word.item, word.kind, r); }
    } else if (st === 'hear' || st === 'meet' || st === 'trace') {
      // the new-sound steps run letter by letter: hear s, meet s, trace s, then the next letter
      if (ctx.didIntro) continue;
      ctx.didIntro = true;
      const intro = sitting.steps.filter(x => x === 'hear' || x === 'meet' || x === 'trace');
      for (const l of sitting.new) for (const x of intro) {
        ctx.step = x; mark('step', { key, step: x, letter: l });
        if (x === 'hear') await meetSound(ctx, l);   // v2 "meet a sound" flow; falls back to the old hear screen when a sound has no v2 clips
        if (x === 'meet') await meet(ctx, l);
        if (x === 'trace') await trace(ctx, l);
      }
    } else if (st === 'blend') {
      await blend(ctx, blendItems(lesson, sitting));
    } else if (st === 'spell') {
      let words = spellWords(lesson, sitting);
      if (track === 'B' && sitting.new?.length) words = (lesson.check?.dictation || []).slice(0, 1).concat((lesson.blendList?.real || []).slice(-1));
      if (!words.length) for (const l of sitting.new) await spellLetters(ctx, l, ctx.known());
      for (const w of words) await spellWord(ctx, w, ctx.known());
    } else if (st === 'tricky') {
      for (const hw of lesson.heart || []) if (entry(hw.word)) await tricky(ctx, hw.word);
    } else if ((lesson.level || 1) > 1 && LEVEL_STEPS[st]) {   // Levels 2-4 screens (teach, rule, attack, check, mastery)
      const r = await LEVEL_STEPS[st](ctx); if (r?.result) checkResult = r;
    } else if (st === 'read') await read(ctx);
    else if (st === 'listen') await listen(ctx);
    else if (st === 'check') checkResult = await check(ctx);
    else if (L1_STEPS[st]) checkResult = (await L1_STEPS[st](ctx)) || checkResult;
  }
  // mini check = first attempts on everything judged in this sitting
  const judged = results.length, correct = results.filter(r => r.correct).length;
  // a check passes only when it was PASSED: a miss or an unfinished check is not a pass (pedagogy round 1, fix 2)
  // a mini check decides only on enough evidence: >= MIN_JUDGED first-try items AND the bar; one item (or none) never passes a sitting that teaches a sound.
  // Sittings with nothing to assess (hear / read / listen only, or fewer than MIN_JUDGED items and no mini flag) are done by completing them.
  const assessed = judged >= MIN_JUDGED;
  const passed = checkResult ? checkResult.result === 'checked' : sitting.mini ? (assessed && correct / judged >= MINI_BAR) : (!assessed || correct / judged >= MINI_BAR);
  const today = new Date().toISOString().slice(0, 10);
  const firstToday = !(prog.days || []).includes(today);
  prog.days = [...new Set([...(prog.days || []), today])];
  prog.sittingCount = (prog.sittingCount || 0) + 1;
  const before = states(prog, track);   // which nodes were locked before this sitting, for the unlock moment on Home
  const prev = prog.sittings[key];
  // failed check -> reteach count; the 2nd failed try parks the check (provisional) so the path opens again and nobody is stuck for ever
  const failedCheck = checkResult?.result === 'miss' && !prev?.passed;
  const reteach = (prev?.reteach || 0) + (checkResult?.result === 'miss' ? 1 : 0);
  const mode = results.some(r => r.mode === 'helper') ? 'helper' : 'tap';   // tap = recognition only (the app never hears the learner); helper = a grown-up judged the voice
  const attempts = (prev?.attempts || 0) + 1;
  // a check parks on its 2nd failed try; a mini sitting after its 3rd unpassed run: either way there is a way forward, marked provisional
  const parked = !passed && !prev?.passed && (!!prev?.parked || (failedCheck && reteach >= 2) || (!checkResult && attempts >= 3));
  prog.sittings[key] = { ...prev, done: true, passed: passed || !!prev?.passed, correct, judged, at: Date.now(), check: checkResult?.result, reteach, attempts, mode, parked, provisional: parked || (passed && !!checkResult && mode === 'tap') };
  if (!checkResult) { const c = pendingCheck(prog, key, track); if (c) prog.sittings[c] = { ...prog.sittings[c], reteachDone: prog.sittings[c].reteach }; }
  if (parked) prog.helperFlag = { lessonId: lid, key, at: Date.now(), reteach };
  if (checkResult && !(prev?.passed && !passed)) prog.lessons[lid] = { state: passed ? 'checked' : parked ? 'parked' : checkResult.result === 'miss' ? 'still_learning' : 'unfinished', correct: checkResult.correct, judged: checkResult.judged, reteach, mode, provisional: parked || (passed && mode === 'tap') };
  let sticker = null, piece = null;
  if (track === 'A') {
    sticker = STICKERS[prog.stickers.length % STICKERS.length]; prog.stickers.push(sticker); // never withheld
    for (const l of sitting.new || []) if (!prog.village.includes(l)) { prog.village.push(l); piece = l; }
  }
  const after = states(prog, track);
  window.__engine.justUnlocked = after.filter((x, i) => before[i]?.state === 'locked' && x.state !== 'locked').map(x => x.key);
  await db.saveProgress(prog);
  mark('sitting-end', { key, judged, correct, passed, reteach, parked });
  return endScreen(app, profile, key, { judged, correct, passed, sticker, piece, prog, checkResult, firstToday, failedCheck: failedCheck && !parked, parked });
}

// test/review hook (window.__engine.endDemo): draws the real end screen for `key` with a seeded result and writes nothing to the database
export async function demoEnd(app, profile, key, { passed = true, mastery = false, judged = 5, correct = 5, sticker = '\u2605', failed = false, parked = false } = {}) {
  const prog = await db.progress(profile.id);
  return endScreen(app, profile, key, { judged: mastery ? 0 : judged, correct, passed, sticker, piece: null, prog, checkResult: mastery ? { mastery: true, result: passed ? 'checked' : 'miss' } : null, firstToday: false, failedCheck: !!failed && !passed, parked: !!parked });
}

import { endPlant } from './garden-scene.js';
async function endScreen(app, profile, key, { judged, correct, passed, sticker, piece, prog, checkResult, firstToday, failedCheck = false, parked = false }) {
  const [lid, track] = key.split(':');
  // a failed check keeps the lesson current: no celebration, the next lesson stays locked, "Practise first" goes to the reteach sitting
  const retry = failedCheck ? (reteachKeyFor(lid, track) || key) : (!passed && !parked && !checkResult ? key : null);   // a failed mini sitting: run it again
  const next = failedCheck ? null : (pendingCheck(prog, key, track) || app.nextOpen(prog, track, key));
  const levelDone = !!(checkResult?.mastery && passed);   // the mastery check of a level was passed: the big moment (a level opens)
  const lvl = lessonById(lid)?.level || 1;
  const s = h('div', { class: `endscreen track-${track}` });
  if (track === 'A') s.append(h('div', { class: 'buddy-slot' }));
  s.append(h('h2', {}, levelDone ? `Level ${lvl} done!` : passed ? 'Well done!' : 'Good practice'));
  if (parked) s.append(h('p', { class: 'prompt parked' }, 'This one is taking longer. That is common. You can go on, and we will come back to it.'));
  const celeBox = h('div', { class: 'cele-box' }); s.append(celeBox);
  let num = null;
  if (judged && !checkResult) {
    num = h('span', { class: 'num' }, String(correct));
    s.append(h('div', { class: 'dots' }, ...Array.from({ length: judged }, (_, i) => h('i', { class: i < correct ? 'on' : '' }))),
      h('p', { class: 'score' }, 'Mini check: ', num, ` of ${judged} on the first try`));
  }
  if (levelDone && track === 'B') s.append(h('p', { class: 'cele-line' }, `Level ${lvl} done. Level ${lvl + 1} is open.`));
  if (!passed) s.append(h('p', { class: 'prompt' }, failedCheck ? "Let's practise these words first. Then we try the check again." : parked ? 'Your grown-up can see this one in their corner.' : "Let's practise this sitting again next time."));
  if (sticker && !failedCheck) s.append(h('div', { class: 'sticker land' }, sticker), h('p', { class: 'muted' }, 'You earned a sticker!'));
  if (track === 'A') s.append(endPlant(lid, states(prog, track), passed));   // Sound Garden: the lesson's plant, not Sprig's village
  const row = h('div', { class: 'row' });
  // Track B fast track: "Keep going?" only after a >= 90% mini check (course fast-track note); the path still opens at 80%
  const offer = next && (track === 'A' || checkResult || !judged || correct / judged >= 0.9);
  if (retry) mark('reteach-offer', { key, retry });
  if (retry) row.append(btn(failedCheck ? 'Practise first' : 'Try again', 'play', { class: 'btn primary retry', say: 'ui:keepGoing', onclick: () => app.sitting(retry === key ? key : retry) }));
  if (offer) row.append(btn('Keep going?', 'play', { class: 'btn primary keepgoing', say: 'ui:keepGoing', onclick: () => app.sitting(next) }));
  row.append(btn('Home', 'home', { class: 'btn ghost', say: 'ui:homeBtn', onclick: async () => { await teacher.say('ui:seeYou'); app.home(); } }));
  s.append(row);
  app.mount(s);
  if (track === 'A') { buddy.dock(s.querySelector('.buddy-slot')); buddy.pin(passed ? 'celebrating' : 'encouraging'); buddy.arrive(); }
  // stars, confetti (not for a miss, not under calm motion), the count-up; the buttons rise in last and a tap anywhere skips to them
  const cele = celebrate(celeBox, { stars: passed ? 3 : failedCheck ? 1 : 2, confetti: passed && track === 'A' });   // Track B: stars and a plain line, no confetti
  if (num) countUp(num, correct, 600);
  row.hidden = true; cele.done.then(() => { row.hidden = false; row.classList.add('up'); });
  const lines = [passed ? 'ui:miniPass' : 'ui:miniMiss'];
  if (piece) lines.push('ui:village'); else if (sticker && !failedCheck) lines.push('ui:sticker');
  if (firstToday) lines.push('ui:practisedToday');
  if (offer) lines.push('ui:keepGoing');
  await teacher.prompt(lines, { nudge: offer ? 'ui:keepGoing' : 'ui:homeBtn', replay: () => teacher.say(offer ? 'ui:keepGoing' : 'ui:seeYou'), hint: () => teacher.point(s.querySelector('.keepgoing') || s.querySelector('.btn')) });
}
