// Garden gains per lesson, from research/03-progression.md 2.11 (Level 1 plants; Level 2 names for later zones).
export const LESSONS = [
  ['L1.01', 'First Sprout', ''], ['L1.02', 'Sunflower', 's'], ['L1.03', 'Pine', 'p'], ['L1.04', 'Marigold', 'm'],
  ['L1.05', 'Grape vine', 'g'], ['L1.06', 'Cactus', 'c'], ['L1.07', 'Elderberry', 'e'], ['L1.08', 'Rose', 'r'],
  ['L1.09', 'Bluebell', 'b'], ['L1.10', 'Fern', 'ff'], ['L1.11', 'Jasmine', 'j'], ['L1.12', 'Zinnia', 'x'],
];
export const NAME = Object.fromEntries(LESSONS.map(([id, n]) => [id, n]));
export const HOUR = 3600e3;
// Review schedule (hours since last stage): ready after 20 h, dozing after 3 days.
export function plantState(p, now = Date.now()) {
  if (!p) return 'none';
  const age = now - p.at;
  return age > 72 * HOUR ? 'sleeping' : age > 20 * HOUR ? 'ready' : 'fresh';
}
