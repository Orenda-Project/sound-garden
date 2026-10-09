import { describe, it, expect } from 'vitest';
import { STATES, STATE_NAMES, NODES, stateSpec } from './sprig.js';

const R26 = ['idle', 'idle-lesson', 'wake', 'greet', 'listening', 'thinking', 'speaking', 'pointing', 'tap-react', 'look-at', 'correct-small', 'correct-streak', 'celebrate', 'level-up', 'wrong-soft', 'try-again', 'encourage', 'hint', 'stuck-wait', 'sleepy-return', 'sleep', 'water', 'surprise', 'proud', 'goodbye', 'error-offline'];
const ALLOWED = new Set(['offset', 'transform', 'opacity']);

describe('sprig states', () => {
  it('has exactly the 26 research states', () => { expect(STATE_NAMES).toEqual(R26); });
  for (const name of R26) {
    it(`${name} maps to a keyframe set touching only transform/opacity`, () => {
      for (const dir of [1, -1]) {
        const { variants, dur } = stateSpec(name, dir);
        expect(dur).toBeGreaterThan(0);
        expect(variants.length).toBeGreaterThan(0);
        for (const tracks of variants) {
          const ids = Object.keys(tracks); expect(ids.length).toBeGreaterThan(0);
          for (const id of ids) {
            expect(NODES).toContain(id);
            const v = tracks[id], frames = Array.isArray(v[0]) ? v[0] : v;
            expect(frames.length).toBeGreaterThan(1);
            for (const f of frames) for (const k of Object.keys(f)) expect(ALLOWED.has(k), `${name}.${id} animates ${k}`).toBe(true);
          }
        }
      }
    });
  }
  it('uses at most 12 animated nodes', () => { expect(NODES.length).toBeLessThanOrEqual(12); });
  it('every STATES entry is a function', () => { for (const n of STATE_NAMES) expect(typeof STATES[n]).toBe('function'); });
});
