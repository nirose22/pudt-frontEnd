import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// 簡化配置，用於解決構建問題
export default defineConfig({
  plugins: [vue()],
  
  build: {
    sourcemap: false,
    minify: false, // 禁用壓縮避免錯誤
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
