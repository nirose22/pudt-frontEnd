<template>
    <Drawer v-model:visible="visibleMenu" header="Drawer" :pt="menuDt">
        <template #header>
            <BaseLogo class="h-full w-25" />
        </template>
        <template #contanier="{ closeCallback }">
            <Button label="Close" @click="closeCallback" />
        </template>
        <Toast position="top-center" />
        <div class="flex flex-col h-full">
            <div class="flex flex-col">
                <div class="menu-item" @click="router.push('/')">
                    <i class="pi pi-map-marker"></i>
                    <span>探索</span>
                </div>
                <div class="menu-item" @click="handleFavorite">
                    <i class="pi pi-heart"></i>
                    <span>我的最愛</span>
                </div>
                <div class="menu-item" @click="handleMyCard">
                    <i class="pi pi-ticket"></i>
                    <span>我的課卡</span>
                </div>
            </div>
            <div class="flex flex-col">
                <Divider />
                <template v-if="!authStore.isLoggedIn">
                    <div class="menu-item" @click="handleLogin">
                        <i class="pi pi-user"></i>
                        <span>登入</span>
                    </div>
                    <div class="menu-item" @click="handleRegister">
                        <i class="pi pi-user"></i>
                        <span>註冊</span>
                    </div>
                </template>
                <template v-else>
                    <div class="menu-item" @click="handleProfile">
                        <Avatar :label="profile?.name?.charAt(0)" size="large" class="!bg-green-100 !text-green-800" shape="circle" />
                        <span>{{ profile?.name }}</span>
                    </div>
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
import { ref, computed, onMounted, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import Avatar from 'primevue/avatar';

const visibleMenu = defineModel<boolean>('visible', { required: true });

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const profile = toRef(userStore, 'profile');

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

const isLoggedIn = () => {
    if (!authStore.isLoggedIn) {
        toast.add({ severity: 'error', summary: '錯誤', detail: '請先登入', life: 3000 });
        return;
    }
    return true;
}

const handleFavorite = () => {
    if (!isLoggedIn()) return;
    router.push('/favorite');
    visibleMenu.value = false;
}

const handleMyCard = () => {
    if (!isLoggedIn()) return;
    router.push('/my-card');
    visibleMenu.value = false;
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

</script>
<style scoped>
@reference "tailwindcss";

.menu-item {
    @apply flex items-center text-base font-normal rounded-md p-2 gap-5 cursor-pointer text-sky-600
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