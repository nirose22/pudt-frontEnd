import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Component from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    mode !== 'production' && vueDevTools(),
    tailwindcss(),
    Component({
      dts: mode !== 'production',
      resolvers: [PrimeVueResolver()]
    })
  ].filter(Boolean),
  
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      external: mode === 'production' ? [] : undefined,
      output: {
        manualChunks: undefined
      }
    }
  },
  
  css: {
    postcss: {
      plugins: [autoprefixer()]
    }
  },
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },

  // 針對 PrimeVue Editor 的特殊處理
  optimizeDeps: {
    include: ['quill']
  }
}))