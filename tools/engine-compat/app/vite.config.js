// The stock drivers start `vite` in app/. Here app/ is only a doorway: serve and build the real Sound Garden root.
import { fileURLToPath } from 'node:url';
import cfg from '../../../vite.config.js';
export default { ...cfg, root: fileURLToPath(new URL('../../../', import.meta.url)), cacheDir: fileURLToPath(new URL('../../../node_modules/.vite-driver', import.meta.url)) };
