// WebAudio player. unlock() must run inside the seed tap (user gesture).
let ctx = null, map = null, gen = 0, cur = null;
const bufs = new Map();
export const unlock = () => {
  try { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch { /* no audio */ }
};
export async function loadMap() { map ||= await (await fetch('./data/audio-map.json')).json(); return map; }
async function buf(key) {
  if (bufs.has(key)) return bufs.get(key);
  const m = await loadMap(); const e = m[key];
  if (!e || !e.file) return null;
  const p = fetch(`./audio/L1/${e.file}`).then(r => r.arrayBuffer()).then(a => ctx.decodeAudioData(a)).catch(() => null);
  bufs.set(key, p); return p;
}
export function stop() { gen++; try { cur?.stop(); } catch { /* already stopped */ } cur = null; }
export async function play(key) {
  if (!ctx) return;
  const my = gen, b = await buf(key);
  if (!b || my !== gen) return;
  await new Promise(res => {
    const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); cur = s;
    s.onended = res; s.start(); setTimeout(res, b.duration * 1000 + 300);
  });
}
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const alive = () => gen;
// play keys in order; aborts if stop() or another sequence started
export async function seq(keys, gap = 300) {
  stop(); const my = gen;
  for (const k of keys) { if (my !== gen) return false; await play(k); await wait(gap); }
  return my === gen;
}
