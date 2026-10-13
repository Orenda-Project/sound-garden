// The app screen. Mounts the Sound Out engine (so/app/src, re-skinned) into #app and keeps the browser URL and the Back button in step with it.
// URL: #/play  #/play/lesson/L2.04  #/play/practice  #/play/sound-it-out  #/play/grown-ups   (see router.js)
// Back button: one logical step back, the same table the Android build uses (so/app/src/native.js backAction): a screen's own Back control,
// the grown-ups sum closes, a guide topic goes to the guide list, everything else goes Home; on Home the Back button leaves to the landing page.
let booted = null, deepUsed = false;

function parse(rest) {
  const m = /^\/lesson\/(L\d\.\d\d)$/.exec(rest || '');
  if (m) return { lesson: m[1] };
  if (rest === '/practice') return { screen: 'practice' };
  if (rest === '/sound-it-out') return { screen: 'sayit' };
  if (rest === '/grown-ups') return { screen: 'grownups' };
  return null;
}

// which URL a screen deserves, read from the DOM Sound Out just mounted
function urlFor(el) {
  const c = el.classList;
  if (el.querySelector?.('.ss-library') || c.contains('ph')) return '#/play/practice';
  if (c.contains('sayit')) return '#/play/sound-it-out';
  if (c.contains('guide') || c.contains('privacy')) return '#/play/grown-ups';
  const lesson = window.__sg.lesson;
  if ((c.contains('sitting') || c.contains('endscreen')) && lesson) return `#/play/lesson/${lesson}`;
  return '#/play';
}

export async function mount(root, rest) {
  root.replaceChildren();
  const live = document.getElementById('live') || Object.assign(document.createElement('div'), { id: 'live', className: 'sr-only', role: 'status' });
  live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true'); if (!live.parentNode) document.body.prepend(live);
  const so = await import('../so/app/src/main.js');
  const { backAction } = await import('../so/app/src/native.js');
  if (!booted) {
    booted = true;
    so.app.onScreen = (el) => {
      try { history.replaceState(history.state, '', urlFor(el)); } catch { /* file: or sandboxed frames */ }
    };
    // Sound Out's sitting keys look like L2.04:A:D; the lesson id is the URL part
    const sit = so.app.sitting.bind(so.app);
    so.app.sitting = (key) => { window.__sg.lesson = String(key).split(':')[0]; return sit(key); };
    // Back: two history entries are kept so Back always has somewhere to go; each Back does one app step, then re-arms the entry
    try { history.pushState({ sg: 1 }, '', location.hash); } catch { /* ignore */ }
    window.addEventListener('popstate', () => {
      if (!document.documentElement.classList.contains('sg-play')) return;
      const a = backAction();
      if (a === 'exit') { history.back(); return; }          // Home / first screen: leave the app (to the landing page)
      try { history.pushState({ sg: 1 }, '', location.hash); } catch { /* ignore */ }
      if (a === 'gate') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      else if (a === 'hub') so.app.grownups();
      else if (a === 'click') document.querySelector('#app .onb-back, #app .meet-skip, #app .onb-skip button, #app .ss-session .close')?.click();
      else so.app.home();
    });
  }
  window.__sg.lesson = null;
  prefetchCore();
  // a link opens the lesson it names; a reload of the page lands on Home (a half-done sitting is not resumable)
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  const reloaded = nav?.type === 'reload' && !deepUsed; deepUsed = true;
  return so.start(root, { deep: reloaded ? null : parse(rest) });
}

// Offline: ask the service worker to keep the core clips (the sounds, the spoken instructions, the names): about 3 MB, once, when idle.
// Word clips and the later levels are cached as they are played.
async function prefetchCore() {
  try {
    if (!import.meta.env.PROD || !navigator.serviceWorker) return;
    const reg = await navigator.serviceWorker.ready;
    const { audioIndex } = await import('../so/app/src/content.js');
    const urls = Object.entries(audioIndex.clips).filter(([k]) => /^(ph|ui|name|t2):/.test(k)).map(([, c]) => `audio/${c.id}.ogg`);
    (window.requestIdleCallback || setTimeout)(() => reg.active?.postMessage({ type: 'prefetch', urls }));
  } catch { /* offline caching is a bonus */ }
}
