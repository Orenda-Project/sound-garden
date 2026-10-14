import { describe, it, expect } from 'vitest';
import { STATE_NAMES, STATE_TABLE, MOOD_NAMES, STAGES } from './sprig.js';
import { Sp } from '../motion/engine.js';

// the pose names the engine's mascot code (buddy.js, session, home) and the demo ask for
const NEEDED = ['idle', 'idle-lesson', 'wake', 'greet', 'listening', 'thinking', 'speaking', 'pointing', 'tap-react', 'look-at', 'correct-small', 'correct-streak', 'celebrate', 'level-up', 'wrong-soft', 'try-again', 'encourage', 'hint', 'stuck-wait', 'sleepy-return', 'sleep', 'water', 'surprise', 'proud', 'goodbye', 'error-offline'];
const NEW = ['cheer', 'oops-soft', 'sleepy'];

describe('sprig states', () => {
  for (const n of [...NEEDED, ...NEW]) it(`${n} exists and points at a real mood`, () => { expect(STATE_NAMES).toContain(n); expect(MOOD_NAMES).toContain(STATE_TABLE[n].m); });
  it('every state is either a loop (base) or reverts after ms', () => { for (const n of STATE_NAMES) { const s = STATE_TABLE[n]; expect(!!s.base || s.ms > 0, n).toBe(true); } });
  it('has five growth stages', () => { expect(STAGES.length).toBe(5); });
});
describe('spring engine', () => {
  it('settles on its target without exploding', () => {
    const s = new Sp(0, 230, 17); s.t = 1; for (let i = 0; i < 2400; i++) s.step(1 / 240);
    expect(Math.abs(s.x - 1)).toBeLessThan(0.01); expect(Math.abs(s.v)).toBeLessThan(0.05);
  });
  it('overshoots when under-damped (that is the springiness)', () => {
    const s = new Sp(0, 230, 11); s.t = 1; let max = 0; for (let i = 0; i < 480; i++) { s.step(1 / 240); max = Math.max(max, s.x); }
    expect(max).toBeGreaterThan(1.02);
  });
});
