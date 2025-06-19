<template>
    <!-- 頂部導航欄 -->
    <header class="bg-white w-full shadow-sm">
        <div class="flex justify-between items-center px-4 py-2">
            <RouterLink to="/merchant" class="flex gap-2 w-40 flex-1 items-center">
                <!-- 菜單按鈕 - 始終可見 -->
                <Button icon="pi pi-bars" text rounded @click="toggleSidebar" />
                <BaseLogo class="h-7" />
                <span class="text-xl font-bold text-sky-700">PUDT 商家中心</span>
            </RouterLink>
            <!-- 右側工具欄 -->
            <div class="flex items-center gap-2">
                <!-- 通知圖標 -->
                <div class="relative">
                    <Button icon="pi pi-bell" text rounded @click="toggleNotifications" />
                    <Badge v-if="unreadNotifications > 0" :value="unreadNotifications" severity="danger"
                        class="absolute -top-1 -right-1"></Badge>

                    <!-- 通知下拉菜單 -->
                    <Menu ref="notificationsMenu" :model="notificationItems" :popup="true" />
                </div>

                <!-- 用戶菜單 -->
                <div class="relative">
                    <Button icon="pi pi-user" text rounded @click="toggleUserMenu" />
                    <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/enums/User';
import BaseLogo from '@/components/layout/BaseLogo.vue';
const router = useRouter();
const authStore = useAuthStore();

// 侧边栏状态
const toggleSidebar = () => {
    // 触发父组件的侧边栏切换事件
    emit('toggle-sidebar');
};

// 通知相关
const notificationsMenu = ref();
const unreadNotifications = ref(3); // 示例：未读通知数量
const toggleNotifications = (event: Event) => {
    notificationsMenu.value.toggle(event);
};

// 用户菜单相关
const userMenu = ref();
const toggleUserMenu = (event: Event) => {
    userMenu.value.toggle(event);
};

// 定义事件
const emit = defineEmits(['toggle-sidebar']);

// 通知菜单项
const notificationItems = ref<MenuItem[]>([
    {
        label: '新的預約請求',
        icon: 'pi pi-calendar',
        command: () => {
            router.push('/merchant/bookings');
        }
    },
    {
        label: '點數結算已完成',
        icon: 'pi pi-wallet',
        command: () => {
            router.push('/merchant/points');
        }
    },
    {
        label: '系統更新通知',
        icon: 'pi pi-info-circle',
        command: () => {
            // 處理系統通知
        }
    },
    {
        separator: true
    },
    {
        label: '查看所有通知',
        icon: 'pi pi-list',
        command: () => {
            router.push('/merchant/notifications');
        }
    }
]);

// 用户菜单项
const userMenuItems = ref<MenuItem[]>([
    {
        label: '商家資料',
        icon: 'pi pi-user-edit',
        command: () => {
            router.push('/merchant/settings');
        }
    },
    {
        label: '帳號安全',
        icon: 'pi pi-shield',
        command: () => {
            router.push('/merchant/settings');
        }
    },
    {
        separator: true
    },
    {
        label: '登出',
        icon: 'pi pi-sign-out',
        command: () => {
            // 處理登出邏輯
            authStore.logout();
            router.go(0);
        }
    }
]);
</script>