// First-load budget: gzip every file requested before the seed tap. Fail above 90 KB or if any web font is in the set.
// Static walk of dist/: index.html -> script/link/modulepreload -> static imports; dynamic imports are followed only for the
// landing chunk (the lesson, home and audio chunks load after the tap). tools/drive_m0.py re-checks with real browser requests.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
const DIST = 'dist', LIMIT = 90 * 1024, set = new Set();
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
set.add('index.html');
for (const m of html.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css|svg|png|webmanifest|json|ico))"/g)) walk(m[1]);
// manifest/icons referenced in html are included by the regex above
function walk(f) {
  if (set.has(f) && f !== 'index.html') return; set.add(f);
  if (!f.endsWith('.js')) return;
  const src = readFileSync(join(DIST, f), 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) walk(join(dirname(f), m[1]));
  for (const m of src.matchAll(/["'`]\.\/(landing-[^"'`]+\.js)["'`]/g)) walk(join(dirname(f), m[1]));
  for (const m of src.matchAll(/["']([^"']*assets\/[^"']+\.css)["']/g)) { /* vite css preload map */ }
}
// css pulled in by the entry's preload map: include any css the landing route needs
for (const f of readdirSync(join(DIST, 'assets'))) if (f.endsWith('.css') && !set.has('assets/' + f)) set.add('assets/' + f);
let total = 0, fonts = [];
console.log('Pre-tap files (gzip bytes):');
for (const f of [...set].sort()) {
  const p = join(DIST, f); if (!existsSync(p)) continue;
  const b = readFileSync(p), g = gzipSync(b).length; total += g;
  console.log(`  ${String(g).padStart(6)}  ${f}`);
  if (/\.(woff2?|ttf|otf)$/.test(f)) fonts.push(f);
  if (f.endsWith('.css') && /@font-face/.test(b.toString())) fonts.push(f + ' (@font-face)');
}
console.log(`Total: ${(total / 1024).toFixed(1)} KB gzip (limit 90 KB)`);
if (fonts.length) { console.error('FAIL web font in first load:', fonts); process.exit(1); }
if (total > LIMIT) { console.error('FAIL over budget'); process.exit(1); }
console.log('size budget OK');
