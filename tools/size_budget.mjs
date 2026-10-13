// Landing page weight budget, static (no browser): gzip of everything the landing page at #/ needs to render, from dist/.
//   index.html, the entry script, its static imports, the landing chunks it loads on demand (landing, hero-art, art, engine, sprig),
//   the CSS files, and the web fonts the landing CSS names (Fredoka and Nunito; the app's Andika is loaded later, by the app).
// Not counted: audio (never fetched before a tap), lazy images (reported), the lesson engine and lesson data (loaded after Start).
// Limit 300 KB gzip. tools/landing_budget.py measures the same thing with a real browser and real requests.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
const DIST = 'dist', LIMIT = 300 * 1024, A = join(DIST, 'assets');
const set = new Set(['index.html']);
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const walk = (f) => {   // an entry file, its static imports, and the landing chunks it loads on demand
  if (set.has(f)) return; set.add(f); if (!f.endsWith('.js')) return;
  const src = readFileSync(join(DIST, f), 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) walk('assets/' + m[1]);
  for (const m of src.matchAll(/["']\.\/((?:landing|hero-art|art|sprig|engine)-[^"']+\.js)["']/g)) walk('assets/' + m[1]);
};
for (const m of html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.(?:js|css))"/g)) walk(m[1]);
for (const f of [...set]) {   // CSS that a landing chunk names
  if (!f.endsWith('.js')) continue;
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/["']\.\/([^"']+\.css)["']/g)) if (/^(landing|sprig|engine|hero-art|art|main)-/.test(m[1]) && existsSync(join(A, m[1]))) set.add('assets/' + m[1]);
}
for (const f of [...set]) {   // fonts named by the landing CSS
  if (!f.endsWith('.css')) continue;
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/url\((?:\.\/|\.\.\/assets\/|\/assets\/)?([^)"']+\.woff2)\)/g)) { const n = m[1].split('/').pop(); if (/^(Fredoka|Nunito)/.test(n) && existsSync(join(A, n))) set.add('assets/' + n); }
}
let total = 0, code = 0, css = 0, font = 0;
console.log('Landing files (gzip bytes):');
for (const f of [...set].sort()) {
  const raw = readFileSync(join(DIST, f)), g = f.endsWith('.woff2') ? raw.length : gzipSync(raw, { level: 9 }).length;   // woff2 is already compressed
  total += g; if (f.endsWith('.css')) css += g; else if (f.endsWith('.woff2')) font += g; else code += g;
  console.log(`  ${String(g).padStart(7)}  ${f}`);
}
const imgs = existsSync(join(DIST, 'img/site')) ? readdirSync(join(DIST, 'img/site')).reduce((n, f) => n + statSync(join(DIST, 'img/site', f)).size, 0) : 0;
console.log(`\nTotal: ${(total / 1024).toFixed(1)} KB gzip (code ${(code / 1024).toFixed(1)}, css ${(css / 1024).toFixed(1)}, fonts ${(font / 1024).toFixed(1)}; limit ${LIMIT / 1024} KB). Lazy phone screens: ${(imgs / 1024).toFixed(0)} KB (webp), loaded as the section scrolls near.`);
if (total > LIMIT) { console.error('FAIL over budget'); process.exit(1); }
console.log('size budget OK');
