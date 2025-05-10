import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Component from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    Component({ 
      dts: true,
    })
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
  }
  }
})
