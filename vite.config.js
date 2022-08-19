import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

const getCache = ({ name, pattern }) => ({
  urlPattern: pattern,
  handler: "CacheFirst",
  options: {
    cacheName: name,
    expiration: {
      maxEntries: 500,
      maxAgeSeconds: 60 * 60 * 24 * 365 * 2 // 2 years
    },
    cacheableResponse: {
      statuses: [200]
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: [
        '/fonts/**/*.ttf',
        '/bootstrap-1.9.1/fonts/*.woff',
        '/**/*.css',
        '/**/*.wasm',
        '/*.png',
        '/example_data.json'
      ],
      devOptions: {
        enabled: false
      },
      workbox: {
        runtimeCaching: [
          getCache({
            pattern: '/sql-wasm/',
            name: "local-sqlwasm"
          })
        ]
      }
    }),
    svelte()
  ],
  server: {
    proxy: {
      '/api-token-auth': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '^/api/*': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '^/images/*': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '^/.*\.db$': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
