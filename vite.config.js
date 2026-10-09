import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 0, rollupOptions: { input: { main: 'index.html', spike: 'spike.html', 'sprig-demo': 'sprig-demo.html' } } },
  test: { include: ['src/**/*.test.js'] },
});
