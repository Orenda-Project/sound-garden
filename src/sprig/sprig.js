// Sprig rig: dependency-free. SVG drawn from design/A (seed body, big eyes, leaf), WAAPI on transform + opacity only.
// Animated nodes (12): shadow root body pupils lids mouth mouthO plant leafL leafR fxa fxb.
const E_STD = 'cubic-bezier(0.4,0,0.2,1)', E_DEC = 'cubic-bezier(0,0,0.2,1)', E_ACC = 'cubic-bezier(0.4,0,1,1)';
const E_POP = 'cubic-bezier(0.35,1.8,0.4,1)', E_LIN = 'linear', E_STEP = 'steps(1,end)';
export const STAGES = ['seed', 'sprout', 'leafy', 'budding', 'bloom'];
export const NODES = ['shadow', 'root', 'body', 'pupils', 'lids', 'mouth', 'mouthO', 'plant', 'leafL', 'leafR', 'fxa', 'fxb'];

// frame: [offset, transform, opacity]
const K = (a) => a.map(([offset, t, o]) => { const f = { offset }; if (t != null) f.transform = t; if (o != null) f.opacity = o; return f; });
const BLINK = K([[0, 'scaleY(0)'], [0.93, 'scaleY(0)'], [0.96, 'scaleY(1)'], [1, 'scaleY(0)']]);
const BREATH = K([[0, 'scale(1,1)'], [0.3, 'scale(1.025,0.968)'], [0.6, 'scale(1,1)'], [1, 'scale(1,1)']]);
const SWAY = K([[0, 'rotate(-3deg)'], [0.3, 'rotate(4.5deg)'], [0.6, 'rotate(-3deg)'], [1, 'rotate(-3deg)']]);
const HOLD = (t, o) => K([[0, t, o], [1, t, o]]);
const SPARK = K([[0, 'scale(0.3)', 0], [0.4, 'scale(1)', 1], [1, 'scale(1.25)', 0]]);
const WAVE = (d) => K([[0, 'rotate(0)'], [0.15, `rotate(${d * 35}deg)`], [0.3, `rotate(${d * -10}deg)`], [0.45, `rotate(${d * 35}deg)`], [0.6, `rotate(${d * -10}deg)`], [0.75, `rotate(${d * 25}deg)`], [1, 'rotate(0)']]);
const POINT = (deg, s = 1.12) => K([[0, 'rotate(0) scale(1)'], [0.25, `rotate(${deg}deg) scale(${s})`], [0.8, `rotate(${deg}deg) scale(${s})`], [1, 'rotate(0) scale(1)']]);
const HAPPY = K([[0, 'scaleY(0)'], [0.2, 'scaleY(0.45)'], [0.8, 'scaleY(0.45)'], [1, 'scaleY(0)']]);

// Each state: (d, o) => {loop, dur, ease, pose, fx, tracks: {node: frames | [frames, dur, ease]}}. d = +1 right / -1 left.
export const STATES = {
  'idle': () => ({ loop: 1, dur: 3000, pose: 0, tracks: { body: BREATH, plant: SWAY, lids: [BLINK, 4000], leafL: K([[0, 'rotate(0)'], [0.3, 'rotate(-3deg)'], [0.6, 'rotate(0)'], [1, 'rotate(0)']]) } }),
  'idle-lesson': () => ({ loop: 1, dur: 5000, pose: 0, tracks: { lids: BLINK } }),
  'wake': () => ({ dur: 600, ease: E_POP, pose: 1, tracks: { root: K([[0, 'translateY(40px) scale(0.6)', 0], [0.6, 'translateY(-6px) scale(1.06)', 1], [1, 'none', 1]]), shadow: K([[0, 'scaleX(0.3)', 0], [1, 'scaleX(1)', 1]]) } }),
  'greet': (d) => ({ dur: 1200, pose: 0.3, tracks: { [d < 0 ? 'leafL' : 'leafR']: WAVE(-d), lids: HAPPY, root: K([[0, 'rotate(0)'], [0.5, `rotate(${d * 4}deg)`], [1, 'rotate(0)']]) } }),
  'listening': (d) => ({ loop: 1, dur: 2400, ease: E_STD, pose: 0, tracks: { root: HOLD(`rotate(${d * 6}deg) translateY(-2px)`), leafL: K([[0, 'rotate(18deg) scale(1.1)'], [0.5, 'rotate(24deg) scale(1.15)'], [1, 'rotate(18deg) scale(1.1)']]), leafR: K([[0, 'rotate(-18deg) scale(1.1)'], [0.5, 'rotate(-24deg) scale(1.15)'], [1, 'rotate(-18deg) scale(1.1)']]), lids: [BLINK, 4000] } }),
  'thinking': (d) => ({ loop: 1, dur: 1500, pose: 0.25, tracks: { root: K([[0, 'rotate(0)'], [0.25, `rotate(${d * -7}deg)`], [0.5, `rotate(${d * -5}deg)`], [0.75, `rotate(${d * -7}deg)`], [1, 'rotate(0)']]), pupils: HOLD('translate(-3px,-4px)'), mouth: HOLD('scaleX(0.7)') } }),
  'speaking': () => ({ loop: 1, dur: 600, ease: E_STEP, pose: 0.3, tracks: { mouth: K([[0, null, 1], [0.25, null, 0], [0.5, null, 1], [0.75, null, 0], [1, null, 1]]), mouthO: K([[0, null, 0], [0.25, null, 1], [0.5, null, 0], [0.75, null, 1], [1, null, 0]]), body: [K([[0, 'translateY(0)'], [0.5, 'translateY(-2px)'], [1, 'translateY(0)']]), 1200, E_STD] } }),
  'pointing': (d) => ({ dur: 1000, pose: 0.5, tracks: { [d < 0 ? 'leafL' : 'leafR']: POINT(d * 38), root: K([[0, 'rotate(0)'], [0.25, `rotate(${d * 5}deg)`], [0.8, `rotate(${d * 5}deg)`], [1, 'rotate(0)']]), pupils: K([[0, 'translate(0,0)'], [0.25, `translate(${d * 5}px,2px)`], [0.8, `translate(${d * 5}px,2px)`], [1, 'translate(0,0)']]) } }),
  'tap-react': (d, o) => {
    const v = o.variant == null ? 0 : o.variant % 3;
    return { dur: 500, ease: v === 2 ? E_LIN : E_POP, pose: 0.5, tracks: [
      { root: K([[0, 'rotate(0)'], [0.2, 'rotate(-7deg)'], [0.4, 'rotate(7deg)'], [0.6, 'rotate(-5deg)'], [0.8, 'rotate(3deg)'], [1, 'rotate(0)']]), lids: HAPPY, mouthO: K([[0, null, 0], [0.1, null, 1], [0.9, null, 1], [1, null, 0]]) },
      { body: K([[0, 'scale(1,1)'], [0.3, 'scale(1.18,0.78)'], [0.6, 'scale(0.94,1.1)'], [1, 'scale(1,1)']]), root: K([[0, 'translateY(0)'], [0.55, 'translateY(-8px)'], [1, 'translateY(0)']]) },
      { root: K([[0, 'rotate(0)'], [1, 'rotate(360deg)']]), shadow: K([[0, 'scaleX(1)'], [0.5, 'scaleX(0.8)'], [1, 'scaleX(1)']]) }][v] };
  },
  'look-at': () => ({ loop: 1, dur: 4000, pose: 0, tracks: { lids: BLINK, body: [BREATH, 3000] } }),
  'correct-small': () => ({ dur: 600, pose: 0.6, fx: '', tracks: { root: K([[0, 'translateY(0)'], [0.3, 'translateY(5px)'], [0.6, 'translateY(-6px)'], [1, 'translateY(0)']]), fxa: SPARK, lids: HAPPY } }),
  'correct-streak': () => ({ dur: 1000, ease: E_POP, pose: 0.4, tracks: { plant: K([[0, 'scale(1)'], [0.4, 'scale(1.18)'], [0.7, 'scale(1.05)'], [1, 'scale(1)']]), leafL: K([[0, 'rotate(0) scale(1)'], [0.4, 'rotate(-14deg) scale(1.3)'], [1, 'rotate(0) scale(1)']]), leafR: K([[0, 'rotate(0) scale(1)'], [0.4, 'rotate(14deg) scale(1.3)'], [1, 'rotate(0) scale(1)']]), fxa: SPARK, lids: HAPPY } }),
  'celebrate': () => ({ dur: 1500, pose: 0.15, fx: 'petals', tracks: { root: K([[0, 'translateY(0) scale(1,1)'], [0.08, 'translateY(0) scale(1.08,0.88)'], [0.22, 'translateY(-26px) scale(0.96,1.06)'], [0.38, 'translateY(0) scale(1.06,0.92)'], [0.55, 'translateY(-14px)'], [0.72, 'translateY(0)'], [0.85, 'translateY(-5px)'], [1, 'translateY(0)']]), plant: WAVE(1), mouthO: K([[0, null, 0], [0.1, null, 1], [0.7, null, 1], [0.8, null, 0], [1, null, 0]]), fxa: [K([[0, 'scale(0.3)', 0], [0.25, 'scale(1)', 1], [0.7, 'scale(1.2)', 1], [1, 'scale(1.3)', 0]]), 1500], fxb: K([[0, 'translateY(-20px)', 0], [0.2, null, 1], [1, 'translateY(40px)', 0]]), lids: HAPPY } }),
  'level-up': (d, o) => ({ dur: 2500, ease: E_STD, pose: 0.7, fx: '', swapAt: 0.4, tracks: { root: K([[0, 'scale(1,1)'], [0.15, 'scale(1.1,0.88)'], [0.3, 'scale(0.9,0.84)'], [0.5, 'translateY(-30px) scale(1.06,1.18)'], [0.7, 'translateY(0) scale(1.12,0.92)'], [0.85, 'scale(0.98,1.03)'], [1, 'scale(1,1)']]), plant: K([[0, 'scale(1)', 1], [0.36, 'scale(0.2)', 0], [0.4, 'scale(0.2)', 0], [0.7, 'scale(1.25)', 1], [0.85, 'scale(0.95)'], [1, 'scale(1)', 1]]), fxa: [K([[0, 'scale(0.3)', 0], [0.5, 'scale(0.9)', 1], [0.8, 'scale(1.3)', 0.9], [1, 'scale(1.6)', 0]]), 2500], shadow: K([[0, 'scaleX(1)'], [0.5, 'scaleX(0.7)'], [0.7, 'scaleX(1.15)'], [1, 'scaleX(1)']]), lids: HAPPY } }),
  'wrong-soft': (d) => ({ dur: 500, pose: 0.6, tracks: { root: K([[0, 'rotate(0)'], [0.4, `rotate(${d * 9}deg)`], [0.8, `rotate(${d * 9}deg)`], [1, 'rotate(0)']]), [d < 0 ? 'leafL' : 'leafR']: POINT(d * 34, 1.08), pupils: K([[0, 'translate(0,0)'], [0.4, `translate(${d * 5}px,2px)`], [0.8, `translate(${d * 5}px,2px)`], [1, 'translate(0,0)']]), mouth: K([[0, 'scaleX(1)'], [0.4, 'scaleX(0.65)'], [0.8, 'scaleX(0.65)'], [1, 'scaleX(1)']]) } }),
  'try-again': (d) => ({ dur: 900, pose: 0.5, tracks: { root: K([[0, 'translateX(0) rotate(0)'], [0.35, `translateX(${d * 6}px) rotate(${d * 5}deg)`], [0.8, `translateX(${d * 6}px) rotate(${d * 5}deg)`], [1, 'translateX(0) rotate(0)']]), [d < 0 ? 'leafL' : 'leafR']: POINT(d * 38), pupils: K([[0, 'translate(0,0)'], [0.35, `translate(${d * 5}px,1px)`], [0.8, `translate(${d * 5}px,1px)`], [1, 'translate(0,0)']]) } }),
  'encourage': () => ({ dur: 1400, pose: 0.4, tracks: { body: K([[0, 'scale(1,1)'], [0.2, 'scale(1.05,0.95)'], [0.4, 'scale(1,1.03)'], [0.6, 'scale(1.05,0.95)'], [0.8, 'scale(1,1)'], [1, 'scale(1,1)']]), leafL: K([[0, 'rotate(0)'], [0.3, 'rotate(-14deg)'], [0.8, 'rotate(-14deg)'], [1, 'rotate(0)']]), leafR: K([[0, 'rotate(0)'], [0.3, 'rotate(14deg)'], [0.8, 'rotate(14deg)'], [1, 'rotate(0)']]), lids: HAPPY, fxa: K([[0, 'scale(0.4)', 0], [0.5, 'scale(0.9)', 0.7], [1, 'scale(1)', 0]]) } }),
  'hint': (d) => ({ dur: 1000, ease: E_POP, pose: 0.5, fx: 'bulb', tracks: { fxb: K([[0, 'translateY(6px) scale(0.3)', 0], [0.3, 'translateY(0) scale(1.1)', 1], [0.8, 'scale(1)', 1], [1, 'scale(1)', 0]]), [d < 0 ? 'leafL' : 'leafR']: POINT(d * 30, 1.08) } }),
  'stuck-wait': (d) => ({ loop: 1, dur: 5000, pose: 0, tracks: { body: [BREATH, 5000], plant: [SWAY, 5000], pupils: K([[0, 'translate(0,0)'], [0.3, `translate(${d * 4}px,0)`], [0.5, `translate(${d * 4}px,0)`], [0.8, 'translate(0,0)'], [1, 'translate(0,0)']]), lids: [BLINK, 4000] } }),
  'sleepy-return': () => ({ dur: 3000, pose: 0.9, fx: 'drops', tracks: { body: K([[0, 'scale(1,0.9)'], [0.45, 'scale(1,0.9)'], [0.65, 'scale(1.04,1.05)'], [1, 'scale(1,1)']]), plant: K([[0, 'rotate(22deg)'], [0.45, 'rotate(22deg)'], [0.65, 'rotate(-6deg)'], [0.8, 'rotate(4deg)'], [1, 'rotate(0)']]), lids: K([[0, 'scaleY(0.7)'], [0.45, 'scaleY(0.7)'], [0.6, 'scaleY(0)'], [1, 'scaleY(0)']]), fxb: K([[0, 'translateY(-20px)', 0], [0.45, 'translateY(-20px)', 0], [0.55, 'translateY(-8px)', 1], [0.85, 'translateY(14px)', 0], [1, 'translateY(14px)', 0]]) } }),
  'sleep': () => ({ loop: 1, dur: 4000, pose: 0, fx: 'zzz', tracks: { lids: HOLD('scaleY(1)'), body: [K([[0, 'scale(1,1)'], [0.5, 'scale(1.02,0.97)'], [1, 'scale(1,1)']]), 4000, E_STD], plant: HOLD('rotate(12deg)'), fxb: K([[0, 'translate(0,6px)', 0], [0.5, 'translate(8px,-8px)', 1], [1, 'translate(14px,-20px)', 0]]) } }),
  'water': () => ({ dur: 2000, pose: 0.8, fx: 'drops', tracks: { fxb: K([[0, 'translateY(-24px)', 0], [0.2, null, 1], [0.7, 'translateY(8px)', 1], [0.85, 'translateY(10px)', 0], [1, null, 0]]), plant: K([[0, 'scale(1)'], [0.6, 'scale(1)'], [0.8, 'scale(1.12)'], [1, 'scale(1)']]), body: K([[0, 'scale(1,1)'], [0.7, 'scale(1,1)'], [0.8, 'scale(1.06,0.94)'], [1, 'scale(1,1)']]), lids: HAPPY } }),
  'surprise': () => ({ dur: 700, ease: E_POP, pose: 0.3, tracks: { root: K([[0, 'translateY(0) scale(1)'], [0.3, 'translateY(-10px) scale(1.1,1.12)'], [1, 'translateY(0) scale(1)']]), pupils: K([[0, 'scale(1)'], [0.2, 'scale(0.72)'], [0.85, 'scale(0.72)'], [1, 'scale(1)']]), mouth: K([[0, null, 1], [0.1, null, 0], [0.9, null, 0], [1, null, 1]]), mouthO: K([[0, null, 0], [0.1, null, 1], [0.9, null, 1], [1, null, 0]]), leafL: K([[0, 'rotate(0)'], [0.3, 'rotate(-16deg)'], [1, 'rotate(0)']]), leafR: K([[0, 'rotate(0)'], [0.3, 'rotate(16deg)'], [1, 'rotate(0)']]) } }),
  'proud': () => ({ dur: 1800, pose: 0.4, tracks: { root: K([[0, 'scale(1,1)'], [0.3, 'scale(0.96,1.08)'], [0.8, 'scale(0.96,1.08)'], [1, 'scale(1,1)']]), plant: K([[0, 'scale(1)'], [0.3, 'scale(1.1)'], [0.8, 'scale(1.1)'], [1, 'scale(1)']]), lids: HAPPY, fxa: [K([[0, 'scale(0.4)', 0], [0.4, 'scale(1)', 1], [0.8, 'scale(1)', 1], [1, 'scale(1.1)', 0]]), 1800] } }),
  'goodbye': () => ({ dur: 1800, pose: 0.9, tracks: { leafR: K([[0, 'rotate(0)'], [0.1, 'rotate(-35deg)'], [0.2, 'rotate(10deg)'], [0.3, 'rotate(-35deg)'], [0.4, 'rotate(10deg)'], [0.6, 'rotate(0)'], [0.8, 'rotate(-45deg)'], [1, 'rotate(-45deg)']]), leafL: K([[0, 'rotate(0)'], [0.6, 'rotate(0)'], [0.8, 'rotate(45deg)'], [1, 'rotate(45deg)']]), root: K([[0, 'translateY(0)'], [0.6, 'translateY(0)'], [0.75, 'translateY(4px)'], [1, 'translateY(4px)']]), lids: K([[0, 'scaleY(0)'], [0.6, 'scaleY(0.45)'], [1, 'scaleY(0.7)']]) } }),
  'error-offline': (d) => ({ dur: 800, pose: 0.4, tracks: { root: K([[0, 'scaleY(1)'], [0.3, 'scale(1.03,0.94)'], [0.7, 'scale(1.03,0.94)'], [1, 'scaleY(1)']]), leafL: K([[0, 'rotate(0)'], [0.3, 'rotate(-26deg)'], [0.7, 'rotate(-26deg)'], [1, 'rotate(0)']]), leafR: K([[0, 'rotate(0)'], [0.3, 'rotate(26deg)'], [0.7, 'rotate(26deg)'], [1, 'rotate(0)']]), mouth: K([[0, 'scaleX(1)'], [0.3, 'scaleX(0.6)'], [0.7, 'scaleX(0.6)'], [1, 'scaleX(1)']]), pupils: K([[0, 'translate(0,0)'], [0.3, `translate(${d * 4}px,-3px)`], [0.7, `translate(${d * 4}px,-3px)`], [1, 'translate(0,0)']]) } }),
};
export const STATE_NAMES = Object.keys(STATES);

/** Frames of a state as one flat list per track (used by tests and by the player). */
export function stateSpec(name, dir = 1, opts = {}) {
  const fn = STATES[name]; if (!fn) throw new Error('unknown sprig state: ' + name);
  const s = fn(dir, opts);
  return { ...s, variants: Array.isArray(s.tracks) ? s.tracks : [s.tracks] };
}

const eyeW = (cx) => `<ellipse cx="${cx}" cy="73" rx="17" ry="20" fill="#FFFDF6" stroke="#2A1A0A" stroke-width="3"/>`;
const eyeP = (cx) => `<ellipse cx="${cx - 2}" cy="76" rx="10.5" ry="13" fill="#1E1408"/><circle cx="${cx - 6}" cy="70" r="4.2" fill="#fff"/><circle cx="${cx + 2}" cy="82" r="2" fill="#fff"/>`;
const LEAF = (s) => `<path class="lf1" d="M0 0 C-8 -22 -34 -26 -46 -14 C-40 4 -16 8 0 0Z" stroke="#2F7D32" stroke-width="3.4" stroke-linejoin="round" transform="scale(${s})"/>`;
const LEAFR = (s) => `<path class="lf2" d="M0 0 C10 -26 36 -32 50 -20 C44 0 18 8 0 0Z" stroke="#2F7D32" stroke-width="3.4" stroke-linejoin="round" transform="scale(${s})"/>`;
const svgMarkup = () => `<svg viewBox="-30 -62 180 200" aria-hidden="true" focusable="false">
<ellipse class="sp-shadow" cx="60" cy="124" rx="44" ry="7" fill="#12330F" opacity=".22"/>
<g class="sp-root"><g class="sp-body">
<path d="M60 28 C92 30 106 66 101 94 C97 116 79 123 60 123 C41 123 23 116 19 94 C14 66 28 30 60 28Z" fill="#EFCB8A" stroke="#7A4B16" stroke-width="3.8" stroke-linejoin="round"/>
<path d="M30 100 C34 114 48 120 62 120 C80 120 94 112 98 96 C88 108 70 112 54 108 C42 105 34 103 30 100Z" fill="#D5A25A" opacity=".75"/>
<path d="M32 54 C38 40 50 33 62 33 C50 38 42 46 38 60Z" fill="#FBE8BB" opacity=".9"/>
<ellipse cx="29" cy="92" rx="8" ry="5.5" fill="#F29B73" opacity=".6"/><ellipse cx="91" cy="92" rx="8" ry="5.5" fill="#F29B73" opacity=".6"/>
${eyeW(43)}${eyeW(77)}<g class="sp-pupils">${eyeP(43)}${eyeP(77)}</g>
<g class="sp-lids"><ellipse cx="43" cy="73" rx="18.5" ry="21.5" fill="#EFCB8A"/><ellipse cx="77" cy="73" rx="18.5" ry="21.5" fill="#EFCB8A"/></g>
<path class="sp-mouth" d="M51 93 Q60 101 69 93" fill="none" stroke="#2A1A0A" stroke-width="3.4" stroke-linecap="round"/>
<ellipse class="sp-mouthO" cx="60" cy="96" rx="6" ry="7" fill="#7A2E1B" stroke="#2A1A0A" stroke-width="2.6"/>
<g class="sp-plant"><g class="x0"><path d="M60 30 q-1 -7 5 -10" fill="none" stroke="#2F7D32" stroke-width="4" stroke-linecap="round"/></g>
<g class="lv" data-s><path d="M60 34 C60 22 60 16 60 8" fill="none" stroke="#2F7D32" stroke-width="5" stroke-linecap="round"/>
<g class="x2"><g transform="translate(60 26) rotate(-38) scale(.55)"><path class="lf2" d="M0 0 C-8 -22 -34 -26 -46 -14 C-40 4 -16 8 0 0Z" stroke="#2F7D32" stroke-width="3.4"/></g><g transform="translate(60 26) rotate(38) scale(.55)"><path class="lf1" d="M0 0 C10 -26 36 -32 50 -20 C44 0 18 8 0 0Z" stroke="#2F7D32" stroke-width="3.4"/></g></g>
<g class="x3"><ellipse cx="60" cy="-2" rx="7" ry="11" fill="#F29B73" stroke="#A84A07" stroke-width="3"/></g>
<g class="x4"><g fill="#FFD84A" stroke="#B87800" stroke-width="2.6"><circle cx="60" cy="-12" r="8"/><circle cx="70" cy="-4" r="8"/><circle cx="66" cy="8" r="8"/><circle cx="54" cy="8" r="8"/><circle cx="50" cy="-4" r="8"/></g><circle cx="60" cy="-1" r="6" fill="#F29B73" stroke="#A84A07" stroke-width="2.4"/></g>
<g transform="translate(60 12)"><g class="sp-leafL">${LEAF(1)}</g><g class="sp-leafR">${LEAFR(1)}</g></g></g></g>
</g></g>
<g class="sp-fxa" fill="#F5B301" stroke="#B87800" stroke-width="1.6"><path d="M-6 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M128 6l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/><path d="M134 66l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M-10 78l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>
<g class="sp-fxb fxb"><g class="drops" fill="#6EC5FF" stroke="#2A74B8" stroke-width="2"><path d="M30 -20q5 8 0 11q-5 -3 0 -11z"/><path d="M60 -30q5 8 0 11q-5 -3 0 -11z"/><path d="M90 -20q5 8 0 11q-5 -3 0 -11z"/></g>
<g class="zzz" fill="#2A74B8" font-family="system-ui,sans-serif" font-weight="800"><text x="96" y="24" font-size="22">z</text><text x="112" y="6" font-size="16">z</text></g>
<g class="bulb"><circle cx="104" cy="2" r="11" fill="#FFE98F" stroke="#B87800" stroke-width="3"/><rect x="99" y="13" width="10" height="6" rx="2" fill="#B87800"/></g>
<g class="petals" fill="#F29B73"><circle cx="10" cy="-10" r="4"/><circle cx="50" cy="-30" r="4"/><circle cx="100" cy="-14" r="4"/><circle cx="124" cy="20" r="4"/><circle cx="-4" cy="26" r="4"/></g></g>
</svg>`;
const STAGE_SCALE = [0, 0.55, 0.85, 1, 1];

export function createSprig(el, { stage = 1, identityColor } = {}) {
  el.classList.add('sprig'); el.innerHTML = svgMarkup();
  if (identityColor) el.style.setProperty('--sp-leaf', identityColor);
  const q = (n) => el.querySelector('.sp-' + n), nodes = Object.fromEntries(NODES.map((n) => [n, q(n)]));
  const lv = el.querySelector('.lv'), mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let anims = [], base = 'idle', cur = 'idle', calm = false, token = 0, timer = 0, errCount = 0, tapN = 0, look = [0, 0], curStage = 0, dead = false;
  const reduced = () => calm || !!(mq && mq.matches);
  const clear = () => { anims.forEach((a) => a.cancel()); anims = []; clearTimeout(timer); for (const n of NODES) { nodes[n].style.transform = ''; nodes[n].style.opacity = ''; } };
  const applyLook = () => { nodes.pupils.style.transform = `translate(${look[0]}px,${look[1]}px)`; };
  const still = (s) => {
    const t = Array.isArray(s.tracks) ? s.tracks[0] : s.tracks;
    for (const n in t) { const fr = Array.isArray(t[n][0]) ? t[n][0] : t[n]; const f = fr.reduce((a, b) => (Math.abs(b.offset - s.pose) < Math.abs(a.offset - s.pose) ? b : a)); if (f.transform) nodes[n].style.transform = f.transform; if (f.opacity != null) nodes[n].style.opacity = f.opacity; }
    nodes.root.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 150, easing: E_STD });
  };
  function play(name, dir, o) {
    const s = STATES[name](dir, o), tracks = Array.isArray(s.tracks) ? s.tracks[o.variant == null ? 0 : o.variant % 3] : s.tracks;
    const sp = { ...s, tracks }; clear(); const my = ++token; cur = name; el.dataset.state = name; el.dataset.fx = s.fx || '';
    if (name === 'look-at') applyLook();
    if (name === 'error-offline' && ++errCount > 1) { nodes.root.style.opacity = '0'; return; }
    const r = reduced();
    if (r) { still(sp); if (o.toStage != null) setStage(o.toStage); if (!s.loop) timer = setTimeout(() => { if (my === token && !dead) { clear(); el.dataset.fx = ''; go(base, 1, {}); } }, 600); return; }
    let longest = null;
    for (const n in tracks) {
      const v = tracks[n], frames = Array.isArray(v[0]) ? v[0] : v, dur = Array.isArray(v[0]) ? (v[1] || s.dur) : s.dur, ease = Array.isArray(v[0]) && v[2] ? v[2] : (s.ease || E_STD);
      const a = nodes[n].animate(frames, { duration: dur, iterations: s.loop ? Infinity : 1, easing: ease, fill: 'none' }); anims.push(a);
      if (!s.loop && (!longest || dur > longest.d)) longest = { a, d: dur };
    }
    if (o.toStage != null && s.swapAt != null) timer = setTimeout(() => setStage(o.toStage), s.dur * s.swapAt);
    if (longest) longest.a.onfinish = () => { if (my !== token || dead) return; if (name === 'sleep') return; clear(); el.dataset.fx = ''; go(base, 1, {}); };
    else if (!s.loop) go(base, 1, {});
  }
  function go(name, dir, o) { if (dead) return; if (STATES[name](dir, o).loop) base = name; play(name, dir, o); }
  function setStage(n) {
    curStage = Math.max(0, Math.min(4, n | 0)); el.dataset.stage = curStage;
    const k = STAGE_SCALE[curStage]; lv.setAttribute('transform', `translate(60 30) scale(${k || 1}) translate(-60 -30)`);
    el.setAttribute('aria-label', 'Sprig, ' + STAGES[curStage]);
  }
  setStage(stage); go('idle', 1, {});
  const onMq = () => { if (!dead) play(cur, 1, {}); };
  if (mq && mq.addEventListener) mq.addEventListener('change', onMq);
  return {
    setState(name, o = {}) {
      if (!STATES[name]) throw new Error('unknown sprig state: ' + name);
      const dir = o.point === 'left' ? -1 : 1; if (name === 'tap-react' && o.variant == null) o = { ...o, variant: tapN++ };
      go(name, dir, o);
    },
    setStage,
    lookAt(x, y) { look = [Math.max(-4.5, Math.min(4.5, x * 4.5)), Math.max(-4.5, Math.min(4.5, y * 4.5))]; if (cur === 'look-at') applyLook(); },
    setCalm(v) { calm = !!v; play(cur, 1, {}); },
    get stage() { return curStage; }, get state() { return cur; },
    destroy() { dead = true; clear(); if (mq && mq.removeEventListener) mq.removeEventListener('change', onMq); el.innerHTML = ''; el.classList.remove('sprig'); },
  };
}
