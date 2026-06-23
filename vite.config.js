import { defineConfig } from 'vite'

// Minimal Vite config. The project is a static single-page site,
// so we just need a dev server + a production build into /dist.
export default defineConfig({
  root: '.',
  server: {
    host: true,
    port: 3013,
    open: true
  },
  build: {
    outDir: 'dist',
    target: 'es2018',
    assetsInlineLimit: 0
  }
})
