import { load, save } from '../store.js';
export function mount(el) {
  const s = load();
  const returning = (s.homeVisits || 0) > 0;
  save({ homeVisits: (s.homeVisits || 0) + 1 });
  el.innerHTML = `<main class="home"><h1>Your garden</h1><div class="sprig" style="margin:0 auto">seed stage ${s.stage}</div>
  <p>First day: ${s.firstDay || 'not yet'}</p>
  <a class="btn" data-cta href="#/lesson/L1.01">${returning ? 'Keep going' : 'Next sitting'}</a></main>`;
}
export function code(el) {
  el.innerHTML = `<main class="home"><a class="back" href="#/" data-back>\u2039 Back</a><h1>Garden code</h1><p>Coming in a later milestone.</p>
  <a class="btn" href="#/" data-back>Back to the seed</a></main>`;
}
