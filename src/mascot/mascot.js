// M0 placeholder: Sprig is a grey rounded box labelled with its pose name.
export const POSES = ['idle', 'listening', 'correct-small', 'wrong-soft', 'sitting-done'];
export function sprig(pose = 'idle') {
  const d = document.createElement('div'); d.className = 'sprig'; d.dataset.pose = pose; d.textContent = pose; return d;
}
export function setPose(el, pose) { el.dataset.pose = pose; el.textContent = pose; }
