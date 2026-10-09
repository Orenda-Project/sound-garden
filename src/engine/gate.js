// Gate engine (logic only, ported from sound-out app/src/gate.js ideas, no DOM).
// - first attempt of each item is scored; a retry is not
// - a wrong pick brings the item back after 2 other items (or at the end if fewer remain)
// - an item is retried once; a second wrong ends it (to be reviewed later)
export class Gate {
  constructor(items, { pass = 10 } = {}) {
    this.items = items; this.pass = pass; this.of = items.length;
    this.queue = items.map((_, i) => ({ i, attempt: 1 }));
    this.scored = 0; this.correctFirst = 0; this.review = [];
  }
  current() { return this.queue.length ? this.queue[0] : null; }
  get done() { return this.queue.length === 0; }
  answer(correct) {
    const q = this.queue.shift();
    if (q.attempt === 1) { this.scored++; if (correct) this.correctFirst++; }
    if (!correct) {
      if (q.attempt === 1) this.queue.splice(Math.min(2, this.queue.length), 0, { i: q.i, attempt: 2 });
      else this.review.push(q.i);
    }
    return { correct, attempt: q.attempt, finished: this.done };
  }
  get passed() { return this.done && this.correctFirst >= this.pass; }
}
