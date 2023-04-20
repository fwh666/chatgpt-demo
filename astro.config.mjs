import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'
import solidJs from '@astrojs/solid-js'

import node from '@astrojs/node'
import { VitePWA } from 'vite-plugin-pwa'
import vercel from '@astrojs/vercel/edge'
import netlify from '@astrojs/netlify/edge-functions'
import disableBlocks from './plugins/disableBlocks'
import react from '@astrojs/react';
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const webpack = require('webpack')
const envAdapter = () => {
  if (process.env.OUTPUT === 'vercel') {
    return vercel()
  } else if (process.env.OUTPUT === 'netlify') {
    return netlify()
  } else {
    return node({
      mode: 'standalone',
    })
  }
}

// https://astro.build/config
export default defineConfig({

  site: 'https://chat.fuwenhao.club',
  // outDir: './my-custom-build-directory',
  // build: {
  //   // 示例：在构建过程中生 成`page.html` 而不是 `page/index.html`。
  //   format: 'file'
  // },

  webpack: (config) => {
    // 添加 proxy 配置
    config.devServer.proxy = {
      '/api': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '',
        },
      }
    }
    // 返回修改后的配置
    return config
  },


  integrations: [
    unocss(),
    solidJs(),
  ],
  output: 'server',
  adapter: envAdapter(),
  vite: {
    plugins: [
      process.env.OUTPUT === 'vercel' && disableBlocks(),
      process.env.OUTPUT === 'netlify' && disableBlocks('netlify'),
      process.env.OUTPUT !== 'netlify' && VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'ChatGPT-API AI',
          short_name: 'ChatGPT AI',
          description: 'A demo repo based on OpenAI API',
          theme_color: '#212129',
          background_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'icon.svg',
              sizes: '32x32',
              type: 'image/svg',
              purpose: 'any maskable',
            },
          ],
        },
        client: {
          installPrompt: true,
          periodicSyncForUpdates: 20,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  },
})
