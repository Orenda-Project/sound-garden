// Listen & Talk: the passage is read TO the learner; a picture appears AFTER each chunk.
// Then one Tier-2 word with its English meaning, then 2 questions answered by tapping the part of the story (not graded, no praise); saying it aloud is optional.
import { play, wait, mark, stop } from '../audio.js';
import { h, speaker, picture, icon, playButton } from '../ui.js';
import { teacher } from '../teacher.js';
import { buddy } from '../buddy.js';


export async function listen(ctx) {
  const li = ctx.lesson.listen; const lid = ctx.lesson.id;
  const s = ctx.stage({ beat: "Let's listen to a story!" });
  const pics = h('div', { class: 'pics story' });
  // the first scene fills the room under the title while Sprig introduces the story (no dead space); it hands over to the story grid below
  const first = picture(`scene:${lid}:0`); const hero = first ? h('div', { class: 'intro-hero' }, first) : null;
  s.append(h('h2', {}, li.title || 'Listen'), h('p', { class: 'muted' }, 'You don\'t need to read this. Just listen.'), ...(hero ? [hero, playButton(() => teacher.replay(), 'Play the story introduction')] : []), pics);
  await ctx.instruct('ui:listenIntro', { nudge: 'ui:idleTap' });
  s.querySelector('.startplay')?.remove();
  ctx.endBeat();   // Sprig's intro is done; the story pictures need the room, so he goes back to the header
  if (ctx.hasClip(`lt:${lid}:title`)) await play(`lt:${lid}:title`);
  for (let i = 0; ctx.hasClip(`lt:${lid}:${i}`); i++) {
    await play(`lt:${lid}:${i}`);
    const pc = picture(`scene:${lid}:${i}`, { n: i }); if (pc) pics.append(pc);
    hero?.remove();
    mark('picture', { chunk: i });
    await wait(300);
  }
  await ctx.next();
  const t2 = li.tier2?.[0];
  if (t2) {
    const s2 = ctx.stage();
    s2.append(h('h2', {}, 'A new word'), h('div', { class: 'tier2' }, h('b', {}, t2.word), h('p', {}, t2.def)), speaker(`t2:${lid}:0`, { big: true, label: 'Hear the word and its meaning' }));
    await ctx.instruct('ui:listenWord', { stim: () => play(`t2:${lid}:0`), nudge: 'ui:idleTap' });
    await ctx.next();
  }
  // Questions. With nobody to hear the answer, a spoken reply is unverifiable, so the beginner's path is a PICK: tap the part of the story
  // (a scene picture, played with its own story clip) that answers the question, then the model part is played and lit. Not graded, no praise:
  // it is for thinking and for hearing the answer said. Saying it out loud stays as a clearly OPTIONAL extra for a learner with a helper.
  // (pedagogy round 1, fix 8; only existing clips and pictures: lt:<lesson>:<i> and scene:<lesson>:<i>.)
  const scenes = []; for (let i = 0; ctx.hasClip(`lt:${lid}:${i}`) && picture(`scene:${lid}:${i}`); i++) scenes.push(i);
  for (let j = 0; j < 2 && ctx.hasClip(`q:${lid}:${j}`); j++) {
    const s3 = ctx.stage();
    const q = li.questions[j];
    s3.append(h('h2', {}, `Question ${j + 1}`), h('p', { class: 'question' }, q), speaker(`q:${lid}:${j}`, { label: 'Hear the question' }));
    buddy.pin('listening');
    if (scenes.length >= 2) {
      const model = li.answerScene?.[j] ?? Math.min(j, scenes.length - 1);   // default: the part of the story the question is about (same pairing the screen always used)
      const ids = shuffle([model, ...shuffle(scenes.filter(x => x !== model)).slice(0, 2)]);
      const row = h('div', { class: 'lq-row' });
      const cards = ids.map((i, k) => {
        const b = h('button', { class: 'lq-card', type: 'button', 'data-scene': i, 'aria-label': `Part ${k + 1} of the story` }, picture(`scene:${lid}:${i}`, { n: i }));
        b.addEventListener('click', async () => {
          if (row.dataset.done) return; row.dataset.done = '1';
          mark('listen-pick', { q: j, pick: i, model, hit: i === model });
          cards.forEach(c => { c.disabled = true; if (+c.dataset.scene !== model) c.classList.add('off'); });
          b.classList.add('picked'); cards.find(c => +c.dataset.scene === model).classList.add('model');
          stop();
          await wait(250);
          if (i !== model) await play(`lt:${lid}:${i}`);   // hear what they chose first, then the part that answers it
          await play(`lt:${lid}:${model}`);
          s3.append(h('p', { class: 'muted small lq-opt' }, 'This is the part that tells us. Want to say your answer out loud too? That is optional.'));
          ctx.enableNext();
        });
        return b;
      });
      row.append(...cards);
      s3.append(h('p', { class: 'prompt' }, 'Which part of the story tells us? Tap a picture.'), row);
      mark('listen-talk', { q: j, mode: 'pick' });
      await ctx.instruct([`q:${lid}:${j}`], { nudge: 'ui:idleTap', hint: () => teacher.point(...cards) });
      await ctx.next({ disabledUntil: () => !!row.dataset.done });
    } else {
      s3.append(h('div', { class: 'talk optional', 'aria-label': 'Optional: say your answer out loud' }, h('span', { class: 'talk-say' }, 'Optional: say your answer out loud.')));
      mark('listen-talk', { q: j, mode: 'optional' });
      await ctx.instruct([`q:${lid}:${j}`], { nudge: 'ui:idleArrow' });
      await ctx.next();
    }
    await wait(300);
  }
}
const shuffle = a => [...a].sort(() => Math.random() - 0.5);
