<template>
    <aside 
        class="merchant-sidebar transition-all duration-450 h-[calc(100vh-4rem)] bg-white shadow-sm z-10"
        :class="[isSidebarOpen ? 'w-64' : 'w-16', {'hover-expand': !isSidebarOpen}]"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div class="flex flex-col h-full">
            <div class="p-2 flex justify-between items-center">
                <div v-if="isSidebarOpen || isHovering" class="text-lg font-bold text-gray-700 px-2 py-3">
                    菜單
                </div>
                <div v-if="isSidebarOpen" class="cursor-pointer p-2" @click="toggleSidebar">
                    <i class="pi pi-angle-left"></i>
                </div>
            </div>

            <nav class="p-2 flex-1 overflow-y-auto">
                <ul class="space-y-1">
                    <li v-for="(item, index) in menuItems" :key="index">
                        <RouterLink 
                            :to="item.to" 
                            class="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                            :class="{ 
                                'bg-blue-100 text-blue-700': isActive(item.routeName),
                                'justify-center': !isSidebarOpen && !isHovering,
                                'justify-start': isSidebarOpen || isHovering
                            }"
                        >
                            <i :class="['text-lg', item.icon]"></i>
                            <span v-if="isSidebarOpen || isHovering" class="whitespace-nowrap">{{ item.label }}</span>
                        </RouterLink>
                    </li>
                </ul>
            </nav>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue']);

const route = useRoute();
const isHovering = ref(false);

const isSidebarOpen = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const handleMouseEnter = () => {
    if (!isSidebarOpen.value) {
        isHovering.value = true;
    }
};

const handleMouseLeave = () => {
    isHovering.value = false;
};

// 檢查當前路由是否激活
const isActive = (routeName: string | string[]) => {
    if (Array.isArray(routeName)) {
        return routeName.includes(route.name as string);
    }
    return route.name === routeName;
};

// 菜單項配置
const menuItems = [
    {
        label: '儀表板',
        icon: 'pi pi-chart-line',
        to: '/merchant',
        routeName: 'MerchantDashboard'
    },
    {
        label: '課程管理',
        icon: 'pi pi-book',
        to: '/merchant/courses',
        routeName: ['CourseList', 'CourseCreate', 'CourseEdit']
    },
    {
        label: '預約管理',
        icon: 'pi pi-calendar',
        to: '/merchant/bookings',
        routeName: ['BookingList', 'BookingDetail']
    },
    {
        label: '點數管理',
        icon: 'pi pi-wallet',
        to: '/merchant/points',
        routeName: 'PointsManagement'
    },
    {
        label: '商家設定',
        icon: 'pi pi-cog',
        to: '/merchant/settings',
        routeName: 'MerchantSettings'
    },
    {
        label: '通知中心',
        icon: 'pi pi-bell',
        to: '/merchant/notifications',
        routeName: 'MerchantNotifications'
    }
];
</script>

<style scoped>
.merchant-sidebar {
    position: relative;
}

.hover-expand {
    position: relative;
}

.hover-expand:hover {
    width: 16rem !important;
}

.hover-expand:hover .pi {
    margin-right: 0.5rem;
}
</style> 