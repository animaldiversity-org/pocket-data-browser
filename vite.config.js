import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// const getCache = ({ name, pattern }) => ({
//   urlPattern: pattern,
//   handler: "CacheFirst",
//   options: {
//     cacheName: name,
//     expiration: {
//       maxEntries: 500,
//       maxAgeSeconds: 60 * 60 * 24 * 365 * 2 // 2 years
//     },
//     cacheableResponse: {
//       statuses: [200]
//     }
//   }
// });

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/v2/',
  plugins: [
    VitePWA({ 
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ttf,wasm,jpg,json,woff,ico}'],
        runtimeCaching: [{
          urlPattern: ({request, url}) => { console.log(request, url); url.pathname.match('backstage') ? false : true },
          handler: 'NetworkFirst'
        }]
      },
      registerType: 'autoUpdate',
      manifest: {
        short_name: "ADW Pocket Guide",
        name: "ADW Pocket Guide",
        start_url: "/",
        background_color: "#1e9c9b",
        display: "standalone",
        scope: "/",
        theme_color: "#1e9c9b",
        "icons": [
          {
            "src": "/touch/icon-58x58.png",
            "type": "image/png",
            "sizes": "58x58"
          },
          {
            "src": "/touch/icon-80x80.png",
            "type": "image/png",
            "sizes": "80x80"
          },
          {
            "src": "/touch/icon-120x120.png",
            "type": "image/png",
            "sizes": "120x120"
          },
          {
            "src": "/touch/icon-192x192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "/touch/defaualt-splash.png",
            "type": "image/png",
            "sizes": "640x640"
          }
        ]
      },
      devOptions: {
        enabled: false
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
