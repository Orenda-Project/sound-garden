// npm run build:artifact -> /tmp/sg-artifact/build/index.html : ONE self-contained page for the claude.ai Artifact viewer.
//  * all JS (dynamic imports inlined) and CSS inline, fonts and the landing art as data: URIs
//  * no service worker, no manifest, no sprig-demo page; the route lives in memory (src/router.js, VITE_ARTIFACT)
//  * audio and word pictures stay relative files (audio/<id>.ogg, img/words/<w>.webp), staged by tools/stage_artifact.py
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const sh = (f) => fileURLToPath(new URL(`./src/shims/${f}`, import.meta.url));
const OUT = process.env.SG_ARTIFACT_OUT || '/tmp/sg-artifact/build';

// "./img/site/app-home.webp" in the landing template becomes a data URI (images may only be same-origin files or data: in the viewer)
const inlineSiteArt = () => ({
  name: 'sg-inline-site-art', enforce: 'pre',
  transform(code, id) {
    if (!/src\/ui\/landing\.js$/.test(id)) return null;
    return code.replace(/\.\/img\/site\/([\w-]+\.webp)/g, (_, f) => 'data:image/webp;base64,' + fs.readFileSync(path.resolve('public/img/site', f)).toString('base64'));
  },
});

// the course engine's CSS must not style the landing page: its css imports become addCss(text) calls (src/appcss.js), enabled only while #/play is shown
const appCssLazy = () => ({
  name: 'sg-app-css-lazy', enforce: 'pre',
  transform(code, id) {
    if (!/so\/app\/src\/.*\.js$/.test(id)) return null;
    let n = 0;
    const out = code.replace(/^import '(\.{1,2}\/[^']+\.css)';/gm, (_, f) => `import __css${n} from '${f}?inline'; addCss(__css${n++});`);
    return n ? `import { addCss } from '@sg/appcss';\n${out}` : null;
  },
});

// Published files are limited to ~511, so most of the 7,909 clips are not shipped. A request for a file that is not shipped would be a 404 and a console error,
// so this preamble (the shipped list is filled in by tools/stage_artifact.py) redirects those requests to an empty clip / a blank pixel: the app sees an
// instantly finished clip or an empty picture, exactly what a failed load does, without a network error.
const PREAMBLE = String.raw`(function(){var S=new Set(__SG_SHIPPED__),
SIL='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
PIX='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
function fix(u){u=String(u);var m=/(?:^|\/)((?:audio|img\/words)\/[^\/?#]+\.(?:ogg|webp))$/.exec(u);if(!m||S.has(m[1]))return u;return m[1].charAt(0)==='a'?SIL:PIX;}
[HTMLMediaElement,HTMLImageElement,HTMLSourceElement].forEach(function(C){var d=Object.getOwnPropertyDescriptor(C.prototype,'src');if(!d||!d.set)return;
Object.defineProperty(C.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){d.set.call(this,fix(v));}});});
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&/^(AUDIO|IMG|SOURCE)$/.test(this.tagName))v=fix(v);return sa.call(this,n,v);};
var A=window.Audio;window.Audio=function(u){var a=new A();if(u!==undefined)a.src=u;return a;};window.Audio.prototype=A.prototype;})();`;

// fold the one JS chunk and the one CSS file into index.html; drop the manifest, the icon links and the module-preload noise
const singleFile = () => ({
  name: 'sg-single-file', enforce: 'post',
  generateBundle(_, bundle) {
    const html = Object.values(bundle).find((b) => b.fileName === 'index.html');
    const js = Object.values(bundle).filter((b) => b.type === 'chunk');
    const css = Object.values(bundle).filter((b) => b.fileName.endsWith('.css'));
    if (js.length !== 1) throw new Error('artifact build must produce exactly one JS chunk, got ' + js.length);
    let src = html.source.toString();
    src = src.replace(/<link rel="(?:manifest|icon|apple-touch-icon|modulepreload|stylesheet)"[^>]*>\s*/g, '');
    src = src.replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>\s*/g, '');
    const style = css.map((c) => c.source.toString()).join('\n') + '\na[download],.dl,#tp-guide{display:none!important}';   // downloads do not exist in the viewer
    // with every dynamic import inlined Vite leaves its preload helper's dependency list as a bare __VITE_PRELOAD__ placeholder: undefined means "no deps"
    const code = 'var __VITE_PRELOAD__=void 0;\n' + js[0].code.replace(/<\/script/gi, '<\/script');
    src = src.replace('</head>', () => `<style>${style}</style>\n</head>`).replace('</body>', () => `<script>${PREAMBLE}</script>\n<script type="module">${code}</script>\n</body>`);   // function replacers: the code is full of $& and $' that a string replacement would expand
    html.source = src;
    for (const k of Object.keys(bundle)) if (k !== 'index.html' && !/\.(ogg)$/.test(k)) delete bundle[k];
  },
});

export default defineConfig({
  base: './', publicDir: false,
  define: { 'import.meta.env.VITE_ARTIFACT': '"1"' },
  resolve: { alias: { '@sg/appcss': fileURLToPath(new URL('./src/appcss.js', import.meta.url)), '@capacitor/core': sh('capacitor-core.js'), '@capacitor/app': sh('capacitor-app.js'), '@capacitor/status-bar': sh('capacitor-status-bar.js') } },
  plugins: [inlineSiteArt(), appCssLazy(), singleFile()],
  build: { outDir: OUT, emptyOutDir: true, assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false, chunkSizeWarningLimit: 100000,
    rollupOptions: { input: { main: 'index.html' }, output: { inlineDynamicImports: true } } },
});
