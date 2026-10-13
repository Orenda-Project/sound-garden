import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const sh = (f) => fileURLToPath(new URL(`./src/shims/${f}`, import.meta.url));
export default defineConfig({
  base: './',
  server: { port: 5390, strictPort: true },
  // Sound Out's Capacitor imports (native shell) resolve to inert shims on the web
  resolve: { alias: { '@capacitor/core': sh('capacitor-core.js'), '@capacitor/app': sh('capacitor-app.js'), '@capacitor/status-bar': sh('capacitor-status-bar.js') } },
  build: { assetsInlineLimit: 0, rollupOptions: { input: { main: 'index.html', 'sprig-demo': 'sprig-demo.html' } } },
  test: { include: ['src/**/*.test.js', 'so-overlay/**/*.test.js'] },
});
