// Levels 5-7 practice sessions: guided screens, no gate, no pass mark. Audio keys are ss:<lesson>:<block>:<n> (all placeholder for now).
import { unlock, play, stop, loadMap } from '../audio.js';
import { load, save } from '../store.js';
import { label } from '../ui/btn.js';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hear = (key, text, cls = '') => `<button class="say ${cls}" type="button" data-k="${esc(key)}" aria-label="Hear it">${esc(text)}</button>`;

export async function mount(el, lid) {
  unlock(); document.addEventListener('pointerdown', unlock, { once: true });
  const n = lid[1], [data] = await Promise.all([fetch(`./data/L${n}.json`).then((r) => r.json()), loadMap()]);
  const S = data.sessions[lid]; if (!S) { el.textContent = 'Session not found'; return; }
  const steps = [['intro']].concat(S.screens.filter((s) => s !== 'fluency' || S.text.length).map((s) => [s])).concat([['done']]);
  let i = 0;
  const render = () => {
    stop(); const [k] = steps[i]; let b = '';
    if (k === 'intro') b = `<h2>Practice session</h2><h1>${esc(S.title)}</h1><p>${esc(S.goal)}</p>`;
    if (k === 'warm') b = `<h2>Warm up</h2><div class="words">${[...S.warm.words, ...S.warm.heart].map((w, j) => hear(`ss:${lid}:warm:w${j}`, w)).join('')}</div>${S.warm.prompts.map((p, j) => `<p>${hear(`ss:${lid}:warm:p${j}`, p)}</p>`).join('')}`;
    if (k === 'word') b = `<h2>Words</h2>${S.word.items.length ? `<div class="words">${S.word.items.map((w, j) => hear(`ss:${lid}:word:${j}`, w.word)).join('')}</div>` : ''}<ul>${S.word.items.slice(0, 8).map((w) => `<li><b>${esc(w.word)}</b>: ${esc(w.meaning)}</li>`).join('')}</ul>${S.word.vocab.map((v, j) => `<div class="card">${hear(`ss:${lid}:vocab:${j}`, v.word)}<p>${esc(v.def)}</p></div>`).join('')}`;
    if (k === 'prime') b = `<h2>Before you read</h2>${S.prime.facts.map((f, j) => `<p>${hear(`ss:${lid}:prime:${j}`, f)}</p>`).join('')}<p><b>${esc(S.prime.question)}</b></p>`;
    if (k === 'text') b = S.text.map((t, j) => `<h2>Read</h2><h1>${esc(t.title)}</h1>${t.paragraphs.map((p, x) => `<p>${hear(`ss:${lid}:text:${j}:${x}`, 'Hear', 'sm')} ${esc(p)}</p>`).join('')}<ul>${t.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>`).join('');
    if (k === 'fluency') b = `<h2>Read it smoothly</h2><p>Read the passage once more, in phrases, without stopping.</p>`;
    if (k === 'discuss') b = `<h2>Talk it over</h2>${S.discuss.map((r) => `<div class="card"><b>${esc(r.role)}</b><p>${esc(r.prompt)}</p></div>`).join('')}`;
    if (k === 'write') b = `<h2>Write</h2><p>${esc(S.write)}</p>`;
    if (k === 'check') b = `<h2>Check yourself</h2><ul>${S.check.map((q) => `<li>${esc(q)}</li>`).join('')}</ul><p>No score. Tell yourself honestly what you can do.</p>`;
    if (k === 'done') b = `<h1>Practice done</h1><p>${esc(S.title)}</p>`;
    const last = k === 'done';
    el.innerHTML = `<main class="prac" data-practice="${lid}" data-step="${k}"><div class="ph"><a class="back" href="#/home" data-back aria-label="Back to the garden">&lsaquo;</a><div class="bar" role="progressbar"><i style="transform:scaleX(${i / (steps.length - 1)})"></i></div></div>${b}
      <div class="cta">${last ? `<a class="btn" data-done href="#/home">${label('garden', 'Back to the garden')}</a>` : `<button class="btn" type="button" data-next>${label('next', i ? 'Next' : 'Start')}</button>`}</div></main>`;
    el.querySelectorAll('[data-k]').forEach((x) => x.addEventListener('click', () => { stop(); play(x.dataset.k); }));
    el.querySelector('[data-next]')?.addEventListener('click', () => { i++; if (steps[i][0] === 'done') { save({ practice: { ...(load().practice || {}), [lid]: Date.now() } }); } render(); window.scrollTo(0, 0); });
  };
  render();
}
