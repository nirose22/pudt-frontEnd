<template>
    <div class="flex-1 flex overflow-y-auto">
        <div class="rounded-lg shadow-lg min-h-7/12 grow flex flex-col">
            <!-- 未登录状态显示 -->
            <div v-if="!authStore.isLoggedIn" class="p-6">
                <div class="text-center py-12">
                    <i class="pi pi-user text-6xl text-gray-400 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">歡迎來到會員中心</h2>
                    <p class="text-gray-600 mb-6">登入後即可查看您的個人資料、收藏課程、預約記錄等資訊</p>
                    <div class="flex justify-center gap-4">
                        <Button label="立即登入" icon="pi pi-sign-in" @click="showLoginDialog = true" />
                        <Button label="註冊新帳號" icon="pi pi-user-plus" severity="secondary" @click="goToRegister" />
                    </div>
                </div>
            </div>

            <!-- 已登录状态显示 -->
            <template v-else>
                <!-- 頂部個人信息區 - 藍色簡潔主題 -->
                <nav class="p-6 ">
                    <div class="relative z-10 md:px-10">
                        <!-- 用戶基本信息與等級 -->
                        <div class="flex flex-col md:flex-row gap-6">
                            <!-- 左側：頭像和基本信息 -->
                            <div class="flex flex-col md:flex-row items-center gap-6 md:w-1/2">
                                <!-- 頭像區域 -->
                                <div class="relative flex-shrink-0">
                                    <div class="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center bg-white relative">
                                        <Avatar :label="userStore.profile?.name?.charAt(0)" size="xlarge" shape="circle"
                                            class="!w-full !h-full !bg-blue-100 !text-blue-700" />
                                        <div class="absolute -bottom-3 -left-3 bg-gray-100 w-10 h-10 rounded-full cursor-pointer shadow-md z-10 flex items-center justify-center"
                                            @click="handlePhotoUpload">
                                            <i class="pi pi-camera text-xs"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- 基本信息 -->
                                <div class="flex flex-col gap-1 text-center md:text-left">
                                    <h2 class="text-3xl font-bold">{{ userStore.user.name || '用戶名稱' }}</h2>
                                    <p class="text-gray-700">{{ userStore.user.email || 'email@example.com' }}</p>
                                    
                                    <!-- 點數顯示 -->
                                    <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                                        <Chip :label="`點數: ${userStore.user.points}`"
                                            class="!bg-sky-400 !text-white !font-bold" />
                                    </div>
                                </div>
                            </div>

                            <!-- 右側：等級與進度展示 -->
                            <div class="md:w-1/2 mt-4 md:mt-0">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-2">
                                        <div class="flex flex-col">
                                            <span class="text-sm">PUDT 等級：</span>
                                            <span class="text-2xl text-blue-600">{{ levelNames[UserLevel.Flower] }}</span>
                                        </div>
                                    </div>
                                    <div class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-center">
                                        <!-- <span class="font-bold text-2xl">{{ userStore.user.points }} 堂</span> -->
                                        <span class="font-bold text-2xl">{{ 50 }} 堂</span>
                                    </div>
                                </div>
                                
                                <!-- 等級進度條 -->
                                <div class="mt-3">
                                    <div v-if="true" class="flex justify-between text-sm mb-2">
                                        <span class="text-gray-800">當前： </span>
                                        <span class="text-gray-800">
                                            距離 {{ levelNames[UserLevel.Flower] }} 
                                            <span class="font-bold">還差 {{ 50 }} 堂</span>
                                        </span>
                                    </div>
                                    <div v-else class="text-sm mb-2 text-center text-gray-800">
                                        <span>恭喜！您已達到最高等級 {{ levelNames[UserLevel.Flower] }}</span>
                                    </div>
                                    
                                    <div class="w-full bg-blue-500/30 rounded-full h-3 overflow-hidden">
                                        <div class="h-full bg-blue-400 rounded-full transition-all duration-500"
                                            :style="{ width: `${58}%` }"></div>
                                    </div>
                                    
                                    <!-- 進度百分比顯示 -->
                                    <div class="text-right mt-1">
                                        <span class="text-xs text-gray-800">{{ 58 }}% 完成</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <div class="flex flex-col flex-1 sm:overflow-hidden md:flex-row">
                    <!-- 左側菜單 - 藍色主題 -->
                    <div class="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0">
                        <div class="p-3 border-b border-gray-100 bg-blue-50">
                            <h3 class="font-medium text-blue-700 flex items-center">
                                <i class="pi pi-user mr-2"></i>會員中心
                            </h3>
                        </div>
                        <ul class="py-1">
                            <li v-for="(menuItem, index) in menuItems" :key="index">
                                <RouterLink :to="menuItem.path" custom v-slot="{ navigate, isActive }">
                                    <div @click="navigate"
                                        :class="['p-3 cursor-pointer flex items-center transition-colors duration-200',
                                            isActive 
                                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 font-medium' 
                                                : 'hover:bg-blue-50/50 text-gray-700']">
                                        <i :class="['pi mr-3 text-lg', menuItem.icon]"></i>
                                        {{ menuItem.label }}
                                    </div>
                                </RouterLink>
                            </li>
                            <li class="p-3 cursor-pointer flex items-center text-red-600 hover:bg-red-50"
                                @click="handleLogout">
                                <i class="pi pi-sign-out mr-3 text-lg"></i>
                                登出
                            </li>
                        </ul>
                    </div>

                    <!-- 右側內容 - 使用路由顯示 -->
                    <section class="w-full p-6 overflow-auto bg-white">
                        <RouterView v-slot="{ Component }">
                            <transition name="fade" mode="out-in">
                                <component :is="Component" />
                            </transition>
                        </RouterView>
                    </section>
                </div>
            </template>
        </div>
        
        <Toast />
        <ConfirmDialog class="max-w-lg w-full" />
        <LoginDialog v-model:visible="showLoginDialog" />
        
        <!-- 頭像上傳對話框 -->
        <Dialog v-model:visible="showPhotoDialog" header="更新頭像" :style="{ width: '450px' }">
            <div class="flex flex-col items-center gap-4">
                <div class="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                    <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
                    <p>拖拽照片到此處或點擊上傳</p>
                    <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="onPhotoSelected">
                    <Button label="選擇照片" class="mt-3" @click="triggerFileInput()" />
                </div>
                <div class="flex justify-end w-full mt-4">
                    <Button label="取消" class="p-button-text" @click="showPhotoDialog = false" />
                    <Button label="確定上傳" @click="confirmPhotoUpload" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useUserStore } from '@/stores/userStore';
import { useConfirm } from 'primevue/useconfirm';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { showSuccess, initToastSafely } from '@/utils/toastHelper';
import { UserLevel } from '@/enums/UserLevel';
import LoginDialog from '@/components/auth/LoginDialog.vue';
import {
    levelNames
} from '@/utils/userLevelUtils';

const toast = useToast();
const showPhotoDialog = ref(false);
const showLoginDialog = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedPhoto = ref<File | null>(null);

const confirm = useConfirm();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

// 初始化数据
onMounted(async () => {
    // 安全地初始化 toast
    try {
        await initToastSafely(toast);
    } catch (error) {
        console.error('Toast 初始化失敗:', error);
    }
    
    if (authStore.isLoggedIn) {
        userStore.fetchProfile(userStore.user.id);
    } else {
        router.push('/Search');
    }
});

// 菜單項目
const menuItems = [
    { id: 'profile', label: '會員資料管理', icon: 'pi-user', path: '/profile/management' },
    { id: 'favorite', label: '收藏課程', icon: 'pi-heart', path: '/profile/favorite' },
    { id: 'inbox', label: '站內收件夾', icon: 'pi-envelope', path: '/profile/inbox' },
    { id: 'points', label: '點數與課卡', icon: 'pi-wallet', path: '/profile/points' },
    { id: 'bookings', label: '預約行程管理', icon: 'pi-calendar', path: '/profile/bookings' },
    { id: 'history', label: '活動紀錄', icon: 'pi-history', path: '/profile/history' },
    // { id: 'purchase', label: '購買紀錄', icon: 'pi-shopping-cart', path: '/profile/purchase' }
];

// 頭像相關方法
const handlePhotoUpload = () => {
    if (!authStore.isLoggedIn) {
        showLoginDialog.value = true;
        return;
    }
    showPhotoDialog.value = true;
};

const onPhotoSelected = (event: Event) => {
    selectedPhoto.value = (event.target as HTMLInputElement).files?.[0] ?? null;
};

const triggerFileInput = () => {
    const input = fileInput.value as HTMLInputElement;
    input?.click();
};

const confirmPhotoUpload = () => {
    if (selectedPhoto.value) {
        // 在實際應用中，這裡應該上傳照片到服務器
        const reader = new FileReader();
        reader.onload = (e) => {
            if (userStore.profile) {
                userStore.user.avatarUrl = e.target?.result as string;
                showPhotoDialog.value = false;
                showSuccess('頭像已更新', '成功');
            }
        };
        reader.readAsDataURL(selectedPhoto.value);
    }
};

// 認證相關方法
const handleLogout = () => {
    confirm.require({
        message: '確認登出?',
        header: '提示',
        acceptLabel: '確認',
        rejectLabel: '取消',
        accept: () => {
            authStore.logout().then(() => {
                router.push('/login');
            });
        }
    });
};

const goToRegister = () => {
    router.push('/register');
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>