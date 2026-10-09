import { load } from '../store.js';
export function mount(el) {
  const s = load();
  el.innerHTML = `<main class="home"><h1>Your garden</h1><div class="sprig" style="margin:0 auto">seed stage ${s.stage}</div>
  <p>First day: ${s.firstDay || 'not yet'}</p><a class="btn" style="display:inline-block;text-decoration:none" href="#/lesson/L1.01">Water again</a></main>`;
}
export function code(el) {
  el.innerHTML = `<main class="home"><h1>Garden code</h1><p>Coming in a later milestone.</p><a href="#/">Back</a></main>`;
}
