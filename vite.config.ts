import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * The hosted micro-frontend apps are static builds under /mfe/. A request for one
 * of their folders must return that folder's index.html, not the portfolio's
 * single-page fallback.
 */
function mfeDirectoryIndex(): Plugin {
  const rewrite = (req: { url?: string }) => {
    if (!req.url?.startsWith('/mfe/')) return
    const [path = '', query] = req.url.split('?')
    if (path.endsWith('/')) req.url = `${path}index.html${query ? `?${query}` : ''}`
  }
  // Returns nothing on purpose: Vite treats a returned function as a post-middleware hook.
  const install = (server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => unknown } }) => {
    server.middlewares.use((req, _res, next) => {
      rewrite(req)
      next()
    })
  }
  return {
    name: 'mfe-directory-index',
    configureServer(server) {
      install(server)
    },
    configurePreviewServer(server) {
      install(server)
    },
  }
}

export default defineConfig({
  plugins: [vue(), mfeDirectoryIndex()],
  // three.js is split into its own lazily loaded chunk (~140 kB gzip).
  build: { chunkSizeWarningLimit: 600 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
