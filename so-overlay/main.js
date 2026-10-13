import './style.css';
import * as db from './db.js';
import { onboarding } from './onboarding.js';
import { home } from './home.js';
import { runSitting, demoEnd } from './session.js';
import { nextOpen, allSittings, needReteach, states } from './path.js';
import { stop } from './audio.js';
import { initNative } from './native.js';
import { teacher } from './teacher.js';
import { tilo } from './tilo.js';
import { growthStage } from './garden-scene.js';
import { privacyScreen } from './privacy.js';
import { guideHub, guideSection } from './guide.js';
import { initMotion } from './motion.js';
import { screenIn, stagIn, endFx, watchSteps, meadowIn } from './fx.js';
import { sayItScreen } from './sayit.js';   // Sound it out
import { practiceScreen } from './practice-hub.js';   // Practice hub
import './screens/session/index.js'; // Levels 5-7 practice (Library + session screens)
import './motion.css';       // last: motion, onboarding and guide styles win the cascade
import './onboarding.css';
import './guide.css';
import './path.css';
import './premium.css';  // the look layer: scenes, tiles, home, celebration (wins the cascade over every sheet above)
import './garden.css';   // Sound Garden skin: palette tokens, seed/garden art, Sprig (wins over everything above)

let root = null;   // set by start(): Sound Garden mounts the Sound Out engine into the page's #app
let profile = null;
let nextDir = 'fwd';   // the direction of the next mount: Home and "back" screens slide in from the left
const app = {
  // A new screen. Forward = slide in from the right (220 ms), back = from the left (180 ms); Track B cross-fades; the sitting's header never moves
  // (its steps animate their own .screen). Home and the grown-up screens only fade: they hold the fixed ear button, which a transform would drag along.
  mount(el) {
    tilo.setHome(null); root.replaceChildren(el); window.scrollTo(0, 0); teacher.newScreen();
    const c = el.classList;
    if (c.contains('home') || c.contains('privacy') || c.contains('guide')) c.add('enter-fade');
    screenIn(el, nextDir); stagIn(el); meadowIn(el);
    if (c.contains('endscreen') || c.contains('onb-done')) endFx(el, { passed: !/practice/i.test(el.querySelector('h2')?.textContent || '') });
    nextDir = 'fwd';
    app.onScreen?.(el);   // Sound Garden shell: keep the URL and the browser Back button in step (src/play.js)
  },
  // the profile for the rest of this launch (onboarding creates it)
  async start(p) { profile = p; teacher.track(p.track); },
  async boot() {
    await initMotion();
    const id = await db.setting('active');
    profile = id ? await db.get('profiles', id) : null;
    if (!profile) { tilo.setTrack(null); return onboarding(app); }
    teacher.track(profile.track);
    tilo.setStage(growthStage(await db.progress(profile.id)));
    const d = app.deep; app.deep = null;
    if (d?.lesson) { const k = states(await db.progress(profile.id), profile.track).find(x => x.lessonId === d.lesson && x.state === 'open'); if (k) return app.sitting(k.key); }
    if (d?.screen === 'practice') return app.practice();
    if (d?.screen === 'sayit') return app.sayIt();
    if (d?.screen === 'grownups') return app.grownups();
    return home(app, profile);
  },
  home() { stop(); nextDir = 'back'; return home(app, profile); },
  privacyInfo() { stop(); return privacyScreen(app); },
  grownups() { stop(); return guideHub(app); },                                  // the guide hub, behind the sum gate
  guide(key) { stop(); return key ? guideSection(app, key) : guideHub(app); },
  sayIt() { stop(); return sayItScreen(app, profile); },   // Sound it out (sayit.js)
  practice(o) { stop(); return practiceScreen(app, profile, o); },   // Practice hub (practice-hub.js)
  onboarding() { stop(); teacher.track(null); return onboarding(app); },
  async firstSitting(p) { profile = p; teacher.track(p.track); return app.sitting(allSittings(p.track)[0].key); },
  async sitting(key) { stop(); try { const rt = needReteach(await db.progress(profile.id), key, profile.track); if (rt) { window.__so.trace.push({ type: 'reteach-redirect', from: key, to: rt }); key = rt; } await runSitting(app, profile, key); } catch (e) { console.error(e); app.home(); } },
  nextOpen: (prog, track, key) => nextOpen(prog, track, key),
};
window.__so = window.__so || { trace: [], missing: [] };
window.__so.app = app;
window.__so.endDemo = (key, o) => { demoEnd(app, profile, key, o); return true; };   // not awaited: the end screen's spoken lines run for seconds
let started = false;
// Called by the Sound Garden shell (src/play.js). Idempotent: a second call just boots again into the same page.
export async function start(el, { deep } = {}) {
  root = el; watchSteps(el);
  if (!started) { started = true; teacher.start(); initNative(app); }
  app.deep = deep || null;
  return app.boot();
}
export { app };
