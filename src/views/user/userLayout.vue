<template>
    <div class="h-full flex flex-col min-h-screen">
        <!-- 顶部导航栏 -->
        <Header />
        <!-- 路由視圖 -->
        <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </RouterView>
    </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import { useRoute } from 'vue-router'

const route = useRoute();

</script>