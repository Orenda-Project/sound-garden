import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { ZONES } from './garden-data.js';
const all = ZONES.flatMap((z) => z.items);
describe('garden zones (research 2.11)', () => {
  it('has 7 zones and all 108 lessons once', () => { expect(ZONES.length).toBe(7); expect(all.length).toBe(108); expect(new Set(all.map((i) => i[0])).size).toBe(108); });
  it('counts: 85 plants, 13 shed tools, 3 paths, 7 landmarks', () => {
    const c = (t) => all.filter((i) => i[2] === t).length;
    expect([c('p'), c('t'), c('r'), c('l')]).toEqual([85, 13, 3, 7]);
  });
  it('each zone ends in its landmark and holds only its own level', () => ZONES.forEach((z) => { expect(z.items.at(-1)[2]).toBe('l'); expect(z.items.every((i) => +i[0][1] === z.n)).toBe(true); }));
  it('Level 7 is tools only (plus the observatory)', () => expect(ZONES[6].items.filter((i) => i[2] === 'p').length).toBe(0));
});
describe('built level data', () => {
  const J = (p) => JSON.parse(readFileSync(p, 'utf8'));
  it('every gated lesson has the 12-item floor (20 at the level check), 3+ options each', () => {
    for (const n of [2, 3, 4]) for (const l of Object.values(J(`public/data/L${n}.json`).lessons)) {
      const need = l.kind === 'mastery' ? 20 : 12; expect(l.gate.items.length).toBeGreaterThanOrEqual(need);
      expect(l.gate.items.every((i) => i.options.length >= 3)).toBe(true);
    }
  });
  it('practice levels carry no gate; audio_needed is merged', () => {
    for (const n of [5, 6, 7]) expect(Object.values(J(`public/data/L${n}.json`).sessions).every((s) => !('gate' in s))).toBe(true);
    expect(existsSync('public/data/audio_needed.json')).toBe(true);
  });
});
