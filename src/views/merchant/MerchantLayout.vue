<template>
    <div class="h-full overflow-hidden flex flex-col">
        <!-- 顶部导航栏 -->
        <MerchantHeader @toggle-sidebar="toggleSidebar" />
        <div class="flex overflow-hidden">
            <MerchantSidebar v-model="isSidebarOpen" />
            <!-- 主要內容區 -->
            <main class="flex-1 p-3 overflow-auto">
                <div class="max-w-7xl mx-auto">
                    <!-- 麵包屑導航 -->
                    <div class="mb-4">
                        <Breadcrumb :model="breadcrumbItems" :home="homeItem" />
                    </div>

                    <!-- 頁面標題 -->
                    <div class="mb-6">
                        <h1 class="text-2xl font-bold text-gray-700">{{ pageTitle }}</h1>
                    </div>

                    <!-- 路由視圖 -->
                    <RouterView v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </RouterView>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import type { MenuItem } from 'primevue/menuitem';
import MerchantHeader from '@/components/layout/MerchantHeader.vue';
import MerchantSidebar from '@/components/layout/MerchantSidebar.vue';


const route = useRoute();
const router = useRouter();

// 側邊欄狀態
const isSidebarOpen = ref(true);
const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

// 頁面標題
const pageTitle = computed(() => {
    return route.meta.title as string || '商家中心';
});

// 檢查當前路由是否激活
const isActive = (routeName: string | string[]) => {
    if (Array.isArray(routeName)) {
        return routeName.includes(route.name as string);
    }
    return route.name === routeName;
};

// 麵包屑首頁項
const homeItem = { icon: 'pi pi-home', to: '/merchant', label: '首頁' };

// 用於調試
const routeNameDisplay = computed(() => {
    const name = route.name;
    console.log("當前路由名稱:", name);
    return name;
});

// 麵包屑導航項
const breadcrumbItems = computed(() => {
    const items: MenuItem[] = [];
    const path = route.path;


    // 根據當前路由動態生成麵包屑
    if (path === '/merchant') {
        items.push({ label: '儀表板', to: '/merchant/dashboard' });
    } else if (path.includes('/merchant/courses')) {
        items.push({ label: '課程管理', to: '/merchant/courses' });
    } else if (path.includes('/merchant/courses/create')) {
        items.push({ label: '課程管理', to: '/merchant/courses' });
        items.push({ label: '新增課程', to: '/merchant/courses/create' });
    } else if (path.includes('/merchant/courses/edit')) {
        items.push({ label: '課程管理', to: '/merchant/courses' });
        items.push({ label: '編輯課程', to: `/merchant/courses/edit/${route.params.id}` });
    } else if (path.includes('/merchant/bookings')) {
        items.push({ label: '預約管理', to: '/merchant/bookings' });
    } else if (path.includes('/merchant/bookings/')) {
        items.push({ label: '預約管理', to: '/merchant/bookings' });
        items.push({ label: '預約詳情', to: `/merchant/bookings/${route.params.id}` });
    } else if (path.includes('/merchant/points')) {
        items.push({ label: '點數管理', to: '/merchant/points' });
    } else if (path.includes('/merchant/settings')) {
        items.push({ label: '商家設定', to: '/merchant/settings' });
    } else if (path.includes('/merchant/notifications')) {
        items.push({ label: '通知中心', to: '/merchant/notifications' });
    }

    console.log("生成的面包屑項目:", items);
    return items;
});

// 監視路由變化
watch(
    () => route.fullPath,
    () => {
        console.log("路由變化，當前路由:", route.name);
    }
);

// 初始化
onMounted(() => {
    // 在移動裝置上默認收起側邊欄
    if (window.innerWidth < 768) {
        isSidebarOpen.value = false;
    }
    console.log("組件掛載，當前路由:", route.name);
});
</script>

<style scoped></style>