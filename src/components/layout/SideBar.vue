<template>
    <Drawer v-model:visible="visibleMenu" header="Drawer" :pt="menuDt">
        <template #header>
            <BaseLogo class="h-full w-25" />
        </template>
        <Toast position="top-center" />
        <div class="flex flex-col h-full  justify-between">
            <div class="flex flex-col">
                <ul class="py-2 text-gray-700">
                    <li v-for="(menuItem, index) in menuItems" :key="index">
                        <RouterLink :to="menuItem.path" custom v-slot="{ navigate, isActive }">
                            <div @click="navigate" :class="['p-3 cursor-pointer flex items-center transition-colors duration-200 rounded-md',
                                isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-100']">
                                <i :class="['pi mr-2', menuItem.icon]"></i>
                                {{ menuItem.label }}
                            </div>
                        </RouterLink>
                    </li>
                </ul>
            </div>
            <div class="flex flex-col">
                <Divider />
                <template v-if="!authStore.isLoggedIn">
                    <RouterLink to="/login" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" @click="navigate">
                            <i class="pi pi-user"></i>
                            <span>登入</span>
                        </div>
                    </RouterLink>
                    <RouterLink to="/register" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" @click="navigate">
                            <i class="pi pi-user"></i>
                            <span>註冊</span>
                        </div>
                    </RouterLink>
                </template>
                <template v-else>
                    <RouterLink to="/profile/management" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" @click="navigate">
                            <Avatar :label="profile?.name?.charAt(0)" size="large" class="!bg-green-100 !text-green-800"
                                shape="circle" />
                            <span>{{ profile?.name }}</span>
                        </div>
                    </RouterLink>
                    <!-- <div class="menu-item" @click="handleLogout">
                        <i class="pi pi-user"></i>
                        <span>登出</span>
                    </div> -->
                </template>
            </div>
        </div>
    </Drawer>
</template>
<script setup lang="ts">
import Drawer from 'primevue/drawer';
import Divider from 'primevue/divider';
import BaseLogo from '@/components/layout/BaseLogo.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import { showError, initToast } from '@/utils/toastHelper';

const visibleMenu = defineModel<boolean>('visible', { required: true });

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const profile = computed(() => userStore.profile);

const toast = useToast();

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

onMounted(() => {
    initToast(toast);
});
// 菜單項目
const menuItems = [
    { id: 'search', label: '探索', icon: 'pi-map-marker', path: '/search' },
    { id: 'favorite', label: '我的收藏', icon: 'pi-heart', path: '/profile/favorite' },
    { id: 'points', label: '點數管理', icon: 'pi-wallet', path: '/profile/points' },
    { id: 'bookings', label: '預約行程管理', icon: 'pi-calendar', path: '/profile/bookings' },
    { id: 'history', label: '活動紀錄', icon: 'pi-history', path: '/profile/history' },
];


const isLoggedIn = () => {
    if (!authStore.isLoggedIn) {
        showError('請先登入', '錯誤');
        return false;
    }
    return true;
}

const handleLogin = () => {
    router.push('/login');
    visibleMenu.value = false;
}

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
    visibleMenu.value = false;
}

const handleRegister = () => {
    router.push('/register');
    visibleMenu.value = false;
}

const handleProfile = () => {
    if (!isLoggedIn()) return;
    router.push('/profile');
    visibleMenu.value = false;
}

const handleNavigation = (item: any, level: number) => {
    if (item.requireLogin && userStore.displayName === 'Guest') {
        showError('請先登入', '錯誤');
    }

    // 原有代碼...
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