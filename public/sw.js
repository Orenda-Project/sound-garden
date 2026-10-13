// Sound Garden service worker: makes the site work offline after the first visit. No build step, no secrets.
//  - pages and app code: network first, cache fallback (so a new deploy shows up on the next load)
//  - /audio, /img, /practice, fonts: cache first (they never change under the same name); audio is cached as it is played
//  - the app can ask for the core clips (sounds, instructions) to be fetched ahead, a few MB, once
const V = 'sg-v1';
// install: the pages plus every built script, style and font listed in asset-manifest.json (vite), so the whole app opens offline
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png']).catch(() => {});
    try {
      const m = await (await fetch('./asset-manifest.json', { cache: 'no-store' })).json(), files = new Set();
      for (const v of Object.values(m)) { files.add(v.file); (v.css || []).forEach((f) => files.add(f)); (v.assets || []).forEach((f) => files.add(f)); }
      await Promise.all([...files].map((f) => c.add(new Request('./' + f)).catch(() => {})));
    } catch { /* dev server: no manifest */ }
  })());
});
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
const STATIC = /\/(audio|img|practice|assets)\/|\.(woff2|webp|ogg|pdf)$/;
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (STATIC.test(u.pathname)) {
    e.respondWith((async () => {
      const c = await caches.open(V), hit = await c.match(u.pathname + u.search) || await c.match(r.url);
      if (hit) return hit;
      // a media request carries a Range header and gets a 206 that cannot be cached: fetch the whole file once instead
      const res = await fetch(new Request(r.url, { credentials: 'omit' }));
      if (res.ok) c.put(r.url, res.clone()).catch(() => {});
      return res;
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(V);
    try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()).catch(() => {}); return res; }
    catch { return (await c.match(r)) || (r.mode === 'navigate' ? await c.match('./index.html') : Response.error()); }
  })());
});
self.addEventListener('message', (e) => {
  if (e.data?.type !== 'prefetch') return;
  e.waitUntil((async () => {
    const c = await caches.open(V); let done = 0;
    for (let i = 0; i < e.data.urls.length; i += 8) {
      await Promise.all(e.data.urls.slice(i, i + 8).map(async (p) => { const u = new URL(p, self.registration.scope).href; if (await c.match(u)) { done++; return; } try { const res = await fetch(u); if (res.ok) { await c.put(u, res); done++; } } catch { /* offline: retry next visit */ } }));
    }
    (await self.clients.matchAll()).forEach((cl) => cl.postMessage({ type: 'prefetched', n: done }));
  })());
});
