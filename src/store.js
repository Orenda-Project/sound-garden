// localStorage key sg1, always in try/catch (private windows throw).
const KEY = 'sg1';
export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { stage: 0, firstDay: null }; }
  catch { return { stage: 0, firstDay: null }; }
}
export function save(patch) {
  const s = { ...load(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked: page still works */ }
  return s;
}
