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
                            <a @click="navigate" :class="['p-3 cursor-pointer flex items-center transition-colors duration-200 rounded-md',
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

const router = useRouter();

const visibleMenu = defineModel<boolean>('visible', { required: true });
const { isLoggedIn } = useAuthStore();

const userStore = useUserStore();
const authStore = useAuthStore();
const profile = computed(() => userStore.profile);

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