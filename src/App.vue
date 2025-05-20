<template>
  <div class="min-h-screen h-full overflow-y-auto flex flex-col max-h-screen items-center bg-gray-50">
    <Header v-if="route.name !== 'MerchantLayout'" />
    <div class="w-full grow mx-auto flex flex-col" :class="{ 'max-w-11/12': route.name !== 'MerchantLayout' }">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>
<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import MerchantHeader from '@/components/layout/MerchantHeader.vue'
import Footer from '@/components/layout/Footer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
</style>
