<template>
    <Drawer v-model:visible="visibleMenu" header="Drawer" :pt="menuDt">
        <template #header>
            <BaseLogo class="h-full w-25" />
        </template>
        <Toast position="top-center" group="sidebar" />
        <ConfirmDialog style="width: 450px;" />
        <div class="flex flex-col h-full  justify-between">
            <div class="flex flex-col">
                <ul class="py-2 text-gray-700">
                    <li v-for="(menuItem, index) in menuItems" :key="index">
                        <RouterLink :to="menuItem.path" custom v-slot="{ navigate, isActive }">
                            <a @click="(event) => handleMenuClick(event, menuItem, navigate)" :class="['p-3 cursor-pointer flex items-center transition-colors duration-200 rounded-md',
                                isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-100']">
                                <i :class="['pi mr-2', menuItem.icon]"></i>
                                {{ menuItem.label }}
                            </a>
                        </RouterLink>
                    </li>
                </ul>
            </div>
            <div class="flex flex-col">
                <Divider />
                <template v-if="!isLoggedIn">
                    <div class="menu-item" @click="showLoginDialog = true">
                        <i class="pi pi-user"></i>
                        <span>登入</span>
                    </div>
                    <RouterLink to="/register" custom v-slot="{ navigate }">
                        <div class="menu-item" @click="navigate">
                            <i class="pi pi-user"></i>
                            <span>註冊</span>
                        </div>
                    </RouterLink>
                </template>
                <template v-else>
                    <RouterLink to="/profile/management" custom v-slot="{ navigate }">
                        <div class="menu-item" @click="navigate">
                            <Avatar :label="profile?.name?.charAt(0)" size="large" class="!bg-green-100 !text-green-800"
                                shape="circle" />
                            <span>{{ profile?.name }}</span>
                        </div>
                    </RouterLink>
                    <div v-if="isLoggedIn" class="menu-item" @click="logout">
                        <span>登出</span>
                    </div>
                </template>
            </div>
        </div>
    </Drawer>
</template>
<script setup lang="ts">
import Drawer from 'primevue/drawer';
import Divider from 'primevue/divider';
import BaseLogo from '@/components/layout/BaseLogo.vue';
import { ref, computed, type Ref, inject } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import Avatar from 'primevue/avatar';

import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const visibleMenu = defineModel<boolean>('visible', { required: true });

const userStore = useUserStore();
const authStore = useAuthStore();
const profile = computed(() => userStore.user);
const isLoggedIn = computed(() => authStore.isLoggedIn);

const menuDt = ref({
    mask: {
        class: ' bg-primary  !bg-transparent'
    },
    root: {
        class: '!bg-white !border-0'
    },
    closeButton: {
        class: 'text-red-500 hover:text-red-700'
    }
})

const confirm = useConfirm();

const logout = async () => {
    confirm.require({
        message: '確定要登出嗎？',
        header: '登出確認',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-warning',
        accept: async () => {
            await authStore.logout();
            router.go(0);
        }
    });
}

const showLoginDialog = inject('showLoginDialog') as Ref<boolean>;

// 菜單項目
const menuItems = [
    { id: 'search', label: '探索', icon: 'pi-map-marker', path: '/search' },
    { id: 'favorite', label: '我的收藏', icon: 'pi-heart', path: '/profile/favorite' },
    { id: 'points', label: '點數管理', icon: 'pi-wallet', path: '/profile/points' },
    { id: 'bookings', label: '預約行程管理', icon: 'pi-calendar', path: '/profile/bookings' },
    { id: 'history', label: '活動紀錄', icon: 'pi-history', path: '/profile/history' },
];

// 處理菜單項點擊
const handleMenuClick = (event: Event, menuItem: any, navigate: () => void) => {
    console.log(1111111);
    
    // 如果是探索頁面，直接跳轉
    if (menuItem.id === 'search') {
        navigate();
        return;
    }
    
    // 阻止默認行為
    event.preventDefault();
    
    // 其他頁面需要檢查登入狀態
    if (!isLoggedIn.value) {
        // 顯示登入確認弹窗
        confirm.require({
            message: '此功能需要登入才能使用，是否要前往登入？',
            header: '需要登入',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: '前往登入',
            rejectLabel: '取消',
            acceptClass: 'p-button-primary',
            rejectClass: 'p-button-text',
            accept: () => {
                // 打開登入對話框
                showLoginDialog.value = true;
                visibleMenu.value = false; // 關閉側邊欄
            },
            reject: () => {
                // 用戶取消，什麼都不做
            }
        });
    } else {
        // 已登入，正常跳轉
        navigate();
        visibleMenu.value = false; // 關閉側邊欄
    }
};
</script>
<style scoped>
@reference "tailwindcss";

.menu-item {
    @apply flex items-center text-base font-normal rounded-md p-2 gap-5 cursor-pointer text-gray-800
}

.menu-item>i {
    @apply text-xl;
}

.menu-item>span {
    line-height: 1.5;
}

.menu-item:hover {
    @apply bg-sky-100;
}
</style>