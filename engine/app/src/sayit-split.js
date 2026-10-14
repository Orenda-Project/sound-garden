// "Sound it out": split a word into the sounds (graphemes) the course teaches. Pure logic, no DOM and no imports, so the
// same file runs in the app and in tools/sayit_selfcheck.mjs.
//
// Three sources, from most to least certain:
//   tiles    the learner built the word from grapheme tiles: the chunks ARE what they tapped (nothing to guess)
//   lexicon  the course lexicon knows the word (content/lexicon.json + levels): its grapheme/phoneme split, split digraphs and heart parts
//   guess    any other typed word: greedy longest-match over the course's grapheme table; always flagged `guess`
// A chunk: { g, letters:[i..], p, clip:'ph:<p>'|null, kind:'single'|'digraph'|'split', tricky, silent, ambiguous, known }
//   `known` is filled by annotate(): is this grapheme taught yet? Unknown parts are still returned (and still play when a clip exists).

// Spellings the course lists but that are context rules or suffix rules, not safe to match blindly in a made-up word.
export const NOT_FOR_GUESSING = new Set(['ce', 'ge', 'dge', 'le', 'tion', 'sion', 'ture', 'ous', 'cial', 'tial', 'es', 'ed', 'ing', 'al', 'all', 'gh', 'ey']);
// Spellings that say more than one thing in English: a guess with one of these is flagged so the screen can say so.
const AMBIGUOUS = new Set(['oo', 'ow', 'ea', 'ou', 'ie', 'y', 'c', 'g', 'ch', 'ar', 'or', 'oe', 'ui', 'ew', 'ue', 'a', 'o', 'i', 'u', 'e', 's']);

const isSplit = g => /^[aeiou]_[aeiou]$/.test(g);

export function makeSplitter({ entry, g2p, hasClip }) {
  const clipFor = p => (p && hasClip(`ph:${p}`) ? `ph:${p}` : null);
  const mk = (g, letters, p, extra = {}) => ({
    g, letters, p, clip: clipFor(p), kind: isSplit(g) ? 'split' : g.length > 1 ? 'digraph' : 'single',
    tricky: false, silent: false, ambiguous: false, known: true, ...extra,
  });

  // candidate multi-letter graphemes for guessing: every taught spelling of 2-4 letters except the context/suffix ones
  const MULTI = Object.keys(g2p).filter(g => /^[a-z]{2,4}$/.test(g) && !NOT_FOR_GUESSING.has(g)).sort((a, b) => b.length - a.length);
  const SINGLE = Object.keys(g2p).filter(g => /^[a-z]$/.test(g));

  function fromEntry(e, word) {
    const chunks = []; const ends = new Set((e.split || []).map(s => s[1])); const starts = new Map((e.split || []).map(s => [s[0], s[1]]));
    let pos = 0; const at = [];   // at[i] = index of the first letter of grapheme i inside the written word
    for (const g of e.g) { at.push(pos); pos += g.length; }
    e.g.forEach((g, i) => {
      if (ends.has(i)) return;                                          // the silent e of a split digraph: already inside the a_e chunk
      const heart = (e.heartIdx || []).includes(i) || e.kind === 'heart' && !(e.heartIdx) ;
      if (starts.has(i)) { const b = starts.get(i); chunks.push(mk(`${g}_${e.g[b]}`, [at[i], at[b]], e.p[i], { tricky: heart })); return; }
      const p = e.p[i];
      if (p === '_') { chunks.push(mk(g, [at[i]], null, { silent: true, tricky: heart })); return; }
      const letters = Array.from({ length: g.length }, (_, k) => at[i] + k);
      chunks.push(mk(g, letters, p, { tricky: heart }));
    });
    if (e.kind === 'heart') {   // a tricky word keeps its digraphs as one button (th in "the"), so a dash still means "2 letters, 1 sound"
      for (let i = 0; i + 1 < chunks.length; i++) {
        const a = chunks[i], b = chunks[i + 1], g = a.g + b.g;
        if (a.kind === 'single' && b.kind === 'single' && a.tricky && b.tricky && /^(th|sh|ch|ng|ck|qu|wh|ph)$/.test(g) && g2p[g] !== undefined) { chunks.splice(i, 2, mk(g, [...a.letters, ...b.letters], g2p[g], { tricky: true })); }
      }
    }
    const real = e.kind === 'real' || e.kind === 'heart';
    return { word, source: 'lexicon', chunks, guess: false, real, tricky: e.kind === 'heart', wholeClip: hasClip(`w:${word}`) ? `w:${word}` : null, notes: [] };
  }

  function fromTiles(gs) {
    const word = gs.join('');
    const e = entry(word);
    // same split as the course -> use the course's sounds for those graphemes (as -> /az/, was, the...); otherwise the tiles' default sounds
    if (e && e.g.join('|') === gs.join('|') && !(e.split || []).length) return { ...fromEntry(e, word), source: 'tiles' };
    let pos = 0;
    const chunks = gs.map(g => { const c = mk(g, Array.from({ length: g.length }, (_, k) => pos + k), g2p[g] ?? null); pos += g.length; return c; });
    return { word, source: 'tiles', chunks, guess: false, real: !!e && (e.kind === 'real' || e.kind === 'heart'), tricky: false, wholeClip: hasClip(`w:${word}`) ? `w:${word}` : null, notes: [] };
  }

  function guess(word) {
    const chunks = []; const notes = [];
    let i = 0, end = word.length;
    // magic e at the end (cVCe): one split chunk a_e / i_e / o_e / u_e
    const m = /([aiou])([^aeiouywq])e$/.exec(word);
    let splitChunk = null;
    if (m && g2p[`${m[1]}_e`] && m.index >= 0) { end = word.length - 2; splitChunk = { v: m.index, e: word.length - 1, c: m.index + 1 }; }
    const stop = splitChunk ? splitChunk.v : word.length;
    while (i < stop) {
      let hit = null;
      for (const g of MULTI) if (word.startsWith(g, i) && i + g.length <= stop) { hit = g; break; }
      if (!hit && SINGLE.includes(word[i])) hit = word[i];
      if (hit) { chunks.push(mk(hit, Array.from({ length: hit.length }, (_, k) => i + k), g2p[hit], { ambiguous: AMBIGUOUS.has(hit) })); i += hit.length; }
      else { chunks.push(mk(word[i], [i], null, { unknown: true })); notes.push(`No taught sound for "${word[i]}" on its own.`); i++; }
    }
    if (splitChunk) {
      chunks.push(mk(`${word[splitChunk.v]}_e`, [splitChunk.v, splitChunk.e], g2p[`${word[splitChunk.v]}_e`], { ambiguous: false }));
      const cg = word[splitChunk.c]; chunks.push(mk(cg, [splitChunk.c], g2p[cg] ?? null));
    }
    // sound order = reading order of the first letter (the consonant between a split vowel comes after the vowel sound)
    chunks.sort((a, b) => a.letters[0] - b.letters[0]);
    if (chunks.some(c => c.ambiguous)) notes.push('Some spellings can say more than one sound. This is a best guess.');
    return { word, source: 'guess', chunks, guess: true, real: false, tricky: false, wholeClip: hasClip(`w:${word}`) ? `w:${word}` : null, notes };
  }

  function fromText(raw) {
    const word = String(raw || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return null;
    const e = entry(word);
    if (e && e.kind !== 'syllable') return fromEntry(e, word);
    return guess(word);
  }
  const fromWord = w => { const e = entry(w); return e ? fromEntry(e, w.toLowerCase()) : fromText(w); };

  // mark which chunks the learner has been taught (split digraph a_e counts as taught when the lessons teach "a_e")
  function annotate(res, learned) {
    for (const c of res.chunks) c.known = c.silent || learned.has(c.g);
    res.allKnown = res.chunks.every(c => c.known);
    return res;
  }
  return { fromTiles, fromText, fromWord, annotate };
}

// Fred Talk marks: a dot under a one-letter sound, a dash under a spelling of 2+ letters (digraph, trigraph, split digraph).
export const markOf = c => (c.letters.length > 1 || c.g.length > 1 ? 'dash' : 'dot');
const CONSONANT_P = new Set(['s', 't', 'p', 'n', 'm', 'd', 'g', 'k', 'r', 'h', 'b', 'f', 'l', 'j', 'v', 'w', 'y', 'z', 'ks', 'kw', 'sh', 'dh', 'ch', 'th', 'ng', 'zh']);
// a sound is "vowel" when any part of its phoneme id is not a consonant (a, ey, aa-r, ih-z...); used only to colour the button
export const isVowelSound = c => !!c.p && c.p.split('-').some(x => !CONSONANT_P.has(x));
