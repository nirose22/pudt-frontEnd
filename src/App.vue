<template>
  <div class="h-full min-h-screen bg-gray-50">
    <Toast position="top-right" group="global" />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <LoginDialog v-model:visible="showLoginDialog" />
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Toast from 'primevue/toast'
import LoginDialog from '@/components/user/LoginDialog.vue'
import { ref, watch, provide } from 'vue'

const route = useRoute()
const authStore = useAuthStore()
const showLoginDialog = ref(false)



// 监听路由变化，检查是否需要显示登录对话框
watch(
  () => route.meta.requiresAuth,
  (requiresAuth) => {
    if (requiresAuth && !authStore.isLoggedIn) {
      showLoginDialog.value = true;
    }
  },
  { immediate: true }
)

provide('showLoginDialog', showLoginDialog)
</script>
<style>
@reference "tailwindcss";

.card {
  @apply flex-1 p-4 shadow-sm bg-gray-50;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: light;
  }
}

:root {
  color-scheme: light;
  --font-color: #1d1d1f;
  --p-surface-900: #fefefd;
  --p-surface-800: #fbfbfa;
}

#app {
  background-color: #fefefd;
  user-select: none;
  color: var(--font-color);
}

html {
  font-size: 14px;
}

.p-autocomplete input {
  width: 100% !important;
}


/* 
button.p-button, button.p-button:not(:disabled):hover {
  color: #fff;
} */

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
}

.form-field-frame {
  display: flex;
  gap: 0.5rem;
}

.p-tab-active {
  @apply !bg-blue-100;
}

/* transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

div {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}

div::-webkit-scrollbar {
  width: 4px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
</style>
