// Capacitor shell glue. Does nothing in a normal browser (Pages build): only runs inside the Android app.
import { Capacitor } from '@capacitor/core';

// What the hardware Back button does on the screen that is showing. A pure lookup so tools/check_nav.py can ask it on every screen
// (window.__so.backAction()) without a phone. One step back, never a jump out of the app unless you are on the first screen.
//   exit    Home, the first-run splash, or the very first "Who is reading?" (nothing behind it)
//   gate    the grown-up sum is open: close it, stay where you are
//   click   press the screen's own back / skip button (.onb-back, .meet-skip, .onb-skip button, .ss-session .close), so Back and the button can never disagree
//   hub     a guide topic or the settings page: back to the topic list (its Home button is one more tap)
//   home    everything else (a sitting, Sound it out, the Library, the end screens)
export function backAction() {
  const el = document.getElementById('app');
  if (document.querySelector('.gu-wrap')) return 'gate';
  if (el.querySelector('.ss-library')) return 'home';          // the Library reuses .home for its look: it is not Home
  if (el.querySelector('.home')) return 'exit';
  if (el.querySelector('.guide[data-guide=section]') || el.querySelector('.privacy')) return 'hub';
  if (el.querySelector('.onb-back, .meet-skip, .onb-skip button, .ss-session .close')) return 'click';
  if (el.querySelector('.splash, .whocard')) return 'exit';
  return 'home';
}
window.__so = window.__so || { trace: [], missing: [] };
window.__so.backAction = backAction;

export async function initNative(app) {
  if (!Capacitor.isNativePlatform()) return;
  const [{ App }, { StatusBar, Style }] = await Promise.all([import('@capacitor/app'), import('@capacitor/status-bar')]);
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#FFF6E5' }).catch(() => {});
  App.addListener('backButton', () => {
    const a = backAction();
    if (a === 'exit') return App.exitApp();
    if (a === 'gate') return document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if (a === 'hub') return app.grownups();
    if (a === 'click') return document.querySelector('#app .onb-back, #app .meet-skip, #app .onb-skip button, #app .ss-session .close')?.click();
    app.home();
  });
}
