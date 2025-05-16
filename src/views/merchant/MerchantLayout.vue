<template>
    <div class="min-h-screen bg-gray-100">
        <!-- 使用 MerchantHeader 组件替换原来的头部 -->
        <MerchantHeader @toggle-sidebar="toggleSidebar" />
        <div class="flex">
            <!-- 側邊欄 -->
            <aside :class="['bg-white shadow-sm transition-all', isSidebarOpen ? 'w-64' : 'w-0 md:w-64']">
                <div class="sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto">
                    <nav class="p-3">
                        <ul class="space-y-1">
                            <!-- 儀表板 -->
                            <li>
                                <RouterLink to="/merchant"
                                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50"
                                    :class="{ 'bg-blue-100 text-blue-700': isActive('MerchantDashboard') }">
                                    <i class="pi pi-chart-line text-lg"></i>
                                    <span>儀表板</span>
                                </RouterLink>
                            </li>

                            <!-- 課程管理 -->
                            <li>
                                <RouterLink to="/merchant/courses"
                                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50"
                                    :class="{ 'bg-blue-100 text-blue-700': isActive(['CourseList', 'CourseCreate', 'CourseEdit']) }">
                                    <i class="pi pi-book text-lg"></i>
                                    <span>課程管理</span>
                                </RouterLink>
                            </li>

                            <!-- 預約管理 -->
                            <li>
                                <RouterLink to="/merchant/bookings"
                                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50"
                                    :class="{ 'bg-blue-100 text-blue-700': isActive(['BookingList', 'BookingDetail']) }">
                                    <i class="pi pi-calendar text-lg"></i>
                                    <span>預約管理</span>
                                </RouterLink>
                            </li>

                            <!-- 點數管理 -->
                            <li>
                                <RouterLink to="/merchant/points"
                                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50"
                                    :class="{ 'bg-blue-100 text-blue-700': isActive('PointsManagement') }">
                                    <i class="pi pi-wallet text-lg"></i>
                                    <span>點數管理</span>
                                </RouterLink>
                            </li>

                            <!-- 商家設定 -->
                            <li>
                                <RouterLink to="/merchant/settings"
                                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50"
                                    :class="{ 'bg-blue-100 text-blue-700': isActive('MerchantSettings') }">
                                    <i class="pi pi-cog text-lg"></i>
                                    <span>商家設定</span>
                                </RouterLink>
                            </li>

                            <!-- 通知中心 -->
                            <li>
                                <RouterLink to="/merchant/notifications"
                                    class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50"
                                    :class="{ 'bg-blue-100 text-blue-700': isActive('MerchantNotifications') }">
                                    <i class="pi pi-bell text-lg"></i>
                                    <span>通知中心</span>
                                </RouterLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            <!-- 主要內容區 -->
            <main class="flex-1 p-4">
                <div class="max-w-7xl mx-auto">
                    <!-- 麵包屑導航 -->
                    <div class="mb-4">
                        <Breadcrumb :model="breadcrumbItems" :home="homeItem" />
                    </div>

                    <!-- 頁面標題 -->
                    <div class="mb-6">
                        <h1 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h1>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import type { MenuItem } from 'primevue/menuitem';
import MerchantHeader from '@/components/layout/MerchantHeader.vue';

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
const homeItem = { icon: 'pi pi-home', to: '/merchant' };

// 麵包屑導航項
const breadcrumbItems = computed(() => {
    const items: MenuItem[] = [];

    // 根據當前路由動態生成麵包屑
    if (route.name === 'MerchantDashboard') {
        items.push({ label: '儀表板' });
    } else if (route.name?.toString().includes('Course')) {
        items.push({ label: '課程管理', to: '/merchant/courses' });

        if (route.name === 'CourseCreate') {
            items.push({ label: '新增課程' });
        } else if (route.name === 'CourseEdit') {
            items.push({ label: '編輯課程' });
        }
    } else if (route.name?.toString().includes('Booking')) {
        items.push({ label: '預約管理', to: '/merchant/bookings' });

        if (route.name === 'BookingDetail') {
            items.push({ label: '預約詳情' });
        }
    } else if (route.name === 'MerchantPointsManagement') {
        items.push({ label: '點數管理' });
    } else if (route.name === 'MerchantSettings') {
        items.push({ label: '商家設定' });
    } else if (route.name === 'MerchantNotifications') {
        items.push({ label: '通知中心' });
    }

    return items;
});

// 初始化
onMounted(() => {
    // 在移動裝置上默認收起側邊欄
    if (window.innerWidth < 768) {
        isSidebarOpen.value = false;
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>