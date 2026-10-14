// Artifact build only (vite.artifact.config.js): everything ends up in one stylesheet, but the course engine's app CSS (#app is a 480 px phone column,
// body background, tokens) must only apply on #/play, as in the normal build where it loads with the app chunk. The artifact build turns every
// `import './x.css'` under engine/app/src into addCss(text); play.js enable()s the sheet on entry and the router disable()s it on the landing and teacher pages.
const parts = []; let el = null;
export function addCss(text) { parts.push(text); if (el) el.textContent += '\n' + text; }
export function enable() { if (el) return; el = document.createElement('style'); el.id = 'sg-app-css'; el.textContent = parts.join('\n'); document.head.append(el); }
export function disable() { el?.remove(); el = null; }
