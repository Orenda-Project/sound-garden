import { describe, it, expect } from 'vitest';
import { Gate } from './gate.js';
import { validItem } from './check.js';
const items = Array.from({ length: 12 }, (_, i) => ({ options: [{ ok: true }, { ok: false }, { ok: false }], word: 'w' + i }));
describe('Gate', () => {
  it('has 12 items and valid options', () => { const g = new Gate(items); expect(g.of).toBe(12); expect(items.every(validItem)).toBe(true); });
  it('passes at 10 of 12 first-attempt correct', () => {
    const g = new Gate(items, { pass: 10 });
    for (let k = 0; k < 12; k++) g.answer(k >= 10 ? false : true);   // 10 right, 2 wrong
    expect(g.scored).toBe(12); expect(g.correctFirst).toBe(10);
    while (!g.done) g.answer(true);                                   // retries
    expect(g.passed).toBe(true);
  });
  it('fails at 9 of 12', () => {
    const g = new Gate(items);
    for (let k = 0; k < 12; k++) g.answer(k < 9);
    while (!g.done) g.answer(true);
    expect(g.correctFirst).toBe(9); expect(g.passed).toBe(false);
  });
  it('scores first attempt only: a correct retry does not add', () => {
    const g = new Gate(items);
    g.answer(false);                       // item 0 wrong, first attempt
    expect(g.correctFirst).toBe(0);
    g.answer(true); g.answer(true);        // items 1, 2
    expect(g.current()).toMatchObject({ i: 0, attempt: 2 });  // back after 2 others
    g.answer(true);                        // retry correct
    expect(g.correctFirst).toBe(2); expect(g.scored).toBe(3);
  });
  it('second wrong goes to review, no more retries', () => {
    const g = new Gate([items[0]]);
    g.answer(false); g.answer(false);
    expect(g.done).toBe(true); expect(g.review).toEqual([0]);
  });
});
