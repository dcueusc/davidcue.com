import { defineConfig } from 'vite';

// Images in public/ keep their names when they change, and Cloudflare tells browsers to cache them
// for hours. Each build stamps a version onto image URLs (see bust() in main.js) so visitors get
// the new ones right away.
export default defineConfig({
  define: { __BUILD__: JSON.stringify(Date.now().toString(36)) },
});
