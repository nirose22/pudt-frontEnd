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
:root {
  --font-color: #1d1d1f;
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
</style>
