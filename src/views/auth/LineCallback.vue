<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          LINE 登入處理中...
        </h2>
        <div class="mt-4">
          <div v-if="isLoading" class="flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
          <div v-else-if="error" class="text-red-600">
            {{ error }}
            <button 
              @click="goToHome" 
              class="mt-4 block w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              返回首頁
            </button>
          </div>
          <div v-else-if="success" class="text-green-600">
            登入成功！正在跳轉...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string
    const errorParam = route.query.error as string

    if (errorParam) {
      throw new Error('使用者取消了LINE登入或發生錯誤')
    }

    if (!code || !state) {
      throw new Error('缺少必要的授權參數')
    }

    // 處理LINE登入回調
    const result = await authStore.handleLineCallback(code, state)

    if (result.success) {
      success.value = true
      // 延遲一點時間讓用戶看到成功消息
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      throw new Error(result.message || 'LINE登入失敗')
    }
  } catch (err: any) {
    console.error('LINE登入回調處理失敗:', err)
    error.value = err.message || 'LINE登入失敗'
  } finally {
    isLoading.value = false
  }
})

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 可以添加額外的樣式 */
</style> 