import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Базовый путь для GitHub Pages (проектный сайт): https://<user>.github.io/diplom-app/
// Применяется только к production-сборке — dev-сервер и e2e работают от '/'.
const GH_PAGES_BASE = '/diplom-app/'

// SPA-фоллбэк для GitHub Pages: Pages при прямом заходе на deep-ссылку
// (например /diplom-app/equipment/БУР-12) отдаёт 404.html. Делаем её копией
// index.html, чтобы приложение загрузилось и vue-router отрисовал нужный маршрут.
function spaFallback() {
  let root = process.cwd()
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    closeBundle() {
      const indexPath = resolve(root, outDir, 'index.html')
      if (existsSync(indexPath)) {
        copyFileSync(indexPath, resolve(root, outDir, '404.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? GH_PAGES_BASE : '/',
  plugins: [vue(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
