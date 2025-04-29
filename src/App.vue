<template>
  <Header />
  <div class="max-w-7xl mx-auto pt-20">
    <router-view></router-view>
  </div>
  <Footer />
</template>
<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>
<style>

@media (prefers-color-scheme: dark) {
  :root { color-scheme: light; }
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


button.p-button, button.p-button:not(:disabled):hover {
  color: #fff;
}

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

</style>
