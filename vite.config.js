import { defineConfig } from 'vite'

// Old/alternative URLs that should land on the Med Data Hub product page.
const REDIRECTS = {
  '/med-data-hub': '/software-gestionale-biomedicale/',
  '/med-data-hub/': '/software-gestionale-biomedicale/'
}

// Dev server: answer the redirects with a real 301 (GitHub Pages does the
// production equivalent via med-data-hub/index.html, since it has no server
// config).
const redirectPlugin = {
  name: 'med-data-hub-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = (req.url || '').split('?')[0]
      const target = REDIRECTS[path]
      if (target) {
        res.statusCode = 301
        res.setHeader('Location', target)
        res.end()
        return
      }
      next()
    })
  }
}

// Minimal Vite config. The project is a static multi-page site (the home page
// plus one folder per extra page), so we just need a dev server + a production
// build into /dist. Every page must be listed in rollupOptions.input
// (paths are relative to the project root, where the build is run).
export default defineConfig({
  plugins: [redirectPlugin],
  root: '.',
  server: {
    host: true,
    port: 3013,
    open: true
  },
  build: {
    outDir: 'dist',
    target: 'es2018',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: 'index.html',
        'software-gestionale-biomedicale': 'software-gestionale-biomedicale/index.html',
        'med-data-hub': 'med-data-hub/index.html',
        'privacy-policy': 'privacy-policy/index.html'
      }
    }
  }
})
