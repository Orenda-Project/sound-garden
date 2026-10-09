// localStorage key sg1, always in try/catch (private windows throw).
const KEY = 'sg1';
const blank = () => ({ stage: 0, firstDay: null, plants: {} });
export function load() {
  try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY)) }; }
  catch { return blank(); }
}
export function save(patch) {
  const s = { ...load(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked: page still works */ }
  return s;
}
// A passed check sprouts that lesson's plant (stage 2).
export function sprout(lid) {
  const s = load(); const plants = { ...s.plants, [lid]: { stage: 2, at: Date.now() } };
  return save({ plants, sprouted: true });
}
