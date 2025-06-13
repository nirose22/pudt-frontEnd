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
                                    
                                    <!-- 等級徽章 -->
                                    <div class="absolute -bottom-3 -right-3 text-3xl" 
                                        v-tooltip.top="levelNames[userStore.userLevel]">
                                        {{ levelEmojis[userStore.userLevel] }}
                                    </div>
                                </div>

                                <!-- 基本信息 -->
                                <div class="flex flex-col gap-1 text-center md:text-left">
                                    <h2 class="text-3xl font-bold">{{ userStore.profile?.name || '用戶名稱' }}</h2>
                                    <p class="text-gray-700">{{ userStore.profile?.email || 'email@example.com' }}</p>
                                    
                                    <!-- 點數顯示 -->
                                    <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                                        <Chip :label="`點數: ${userStore.points}`"
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
                                            <span class="text- text-blue-600">{{ levelNames[userStore.userLevel] }}</span>
                                            <span class="text-2xl text-blue-600">{{ levelRoles[userStore.userLevel] }}</span>
                                        </div>
                                    </div>
                                    <div class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-center">
                                        <span class="font-bold text-2xl">{{ userStore.completedCoursesCount }} 堂</span>
                                    </div>
                                </div>
                                
                                <!-- 等級進度條 -->
                                <div class="mt-3">
                                    <div v-if="userStore.levelProgress.nextLevel" class="flex justify-between text-sm mb-2">
                                        <span class="text-gray-800">當前：{{ levelNames[userStore.userLevel] }}</span>
                                        <span class="text-gray-800">
                                            距離 {{ levelNames[userStore.levelProgress.nextLevel] }} 
                                            <span class="font-bold">還差 {{ userStore.levelProgress.remainingCourses }} 堂</span>
                                        </span>
                                    </div>
                                    <div v-else class="text-sm mb-2 text-center text-gray-800">
                                        <span>恭喜！您已達到最高等級 {{ levelNames[userStore.userLevel] }}</span>
                                    </div>
                                    
                                    <div class="w-full bg-blue-700/30 rounded-full h-3 overflow-hidden">
                                        <div class="h-full bg-white rounded-full transition-all duration-500"
                                            :style="{ width: `${userStore.levelProgress.progress}%` }"></div>
                                    </div>
                                    
                                    <!-- 進度百分比顯示 -->
                                    <div class="text-right mt-1">
                                        <span class="text-xs text-gray-800">{{ userStore.levelProgress.progress }}% 完成</span>
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
import { ref, onMounted, computed, provide } from 'vue';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useUserStore } from '@/stores/userStore';
import { useBookingStore } from '@/stores/bookingStore';
import { BookingStatus } from '@/enums/BookingStatus';
import { usePointsStore } from '@/stores/pointsStore';
import { usePurchaseStore } from '@/stores/orderStore';
import { useConfirm } from 'primevue/useconfirm';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useRoute } from 'vue-router';
import { showSuccess, showError, initToast } from '@/utils/toastHelper';
import { CardType } from '@/enums/Cards';
import { OrderStatus } from '@/enums/PurchaseStatus';
import { UserLevel } from '@/enums/UserLevel';
import LoginDialog from '@/components/auth/LoginDialog.vue';
import {
    levelNames,
    levelEmojis,
    levelDescriptions,
    levelRoles
} from '@/utils/userLevelUtils';

const toast = useToast();
const showPhotoDialog = ref(false);
const showLoginDialog = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedPhoto = ref<File | null>(null);

const confirm = useConfirm();
const userStore = useUserStore();
const authStore = useAuthStore();
const bookingStore = useBookingStore();
const pointsStore = usePointsStore();
const purchaseStore = usePurchaseStore();
const router = useRouter();
const route = useRoute();

// 初始化数据
onMounted(() => {
    initToast(toast);
    if (authStore.isLoggedIn) {
        userStore.fetchProfile();
        pointsStore.init();
        bookingStore.fetchBookings();
        purchaseStore.fetchHistory();
    }
})

// 菜單項目 - 更新圖示以匹配植物主題
const menuItems = [
    { id: 'profile', label: '會員資料管理', icon: 'pi-user', path: '/profile/management' },
    { id: 'favorite', label: '收藏課程', icon: 'pi-heart', path: '/profile/favorite' },
    { id: 'inbox', label: '站內收件夾', icon: 'pi-envelope', path: '/profile/inbox' },
    { id: 'points', label: '點數與課卡', icon: 'pi-wallet', path: '/profile/points' },
    { id: 'bookings', label: '預約行程管理', icon: 'pi-calendar', path: '/profile/bookings' },
    { id: 'history', label: '活動紀錄', icon: 'pi-history', path: '/profile/history' },
    { id: 'purchase', label: '購買紀錄', icon: 'pi-shopping-cart', path: '/profile/purchase' }
];

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

// 觸發文件輸入點擊
const triggerFileInput = () => {
    const input = fileInput.value as HTMLInputElement;
    input?.click();
};

// 確認上傳頭像
// API: /api/user/update-avatar
const confirmPhotoUpload = () => {
    if (selectedPhoto.value) {
        // 在實際應用中，這裡應該上傳照片到服務器
        const reader = new FileReader();
        reader.onload = (e) => {
            if (userStore.profile) {
                userStore.profile.avatarUrl = e.target?.result as string;
                showPhotoDialog.value = false;
                showSuccess('頭像已更新', '成功');
            }
        };
        reader.readAsDataURL(selectedPhoto.value);
    }
};

const updateProfile = async (updatedProfile: Partial<any>) => {
    const res = await userStore.updateProfile(updatedProfile);
    if (res.success) {
        showSuccess(res.message || '個人資料更新成功', '成功');
    } else {
        showError(res.message || '個人資料更新失敗', '失敗');
    }
};

const cancelBooking = async (bookingId: number) => {
    const res = await bookingStore.cancel(bookingId);
    if (res.success) {
        showSuccess(res.message || '預約取消成功', '成功');
    } else {
        showError(res.message || '預約取消失敗', '失敗');
    }
};

const handleLogout = () => {
    confirm.require({
        message: '確認登出?',
        header: '提示',
        acceptLabel: '確認',
        rejectLabel: '取消',
        accept: () => {
            useAuthStore().logout().then(() => {
                router.push('/login');
            });
        }
    });
};

const goToRegister = () => {
    router.push('/register');
};

const handlePurchase = (cardId: number) => {
    if (!authStore.isLoggedIn) {
        showLoginDialog.value = true;
        return;
    }
    
    confirm.require({
        message: '確認購買此點數卡？',
        header: '購買確認',
        acceptLabel: '確認購買',
        rejectLabel: '取消',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-primary',
        accept: async () => {
            try {
                const res = await purchaseStore.buyPointsCard(cardId)
                if (res.success) {
                    showSuccess(res.message || '點數卡購買成功', '成功');
                } else {
                    showError(res.message || '購買點數失敗', '失敗');
                }
            } catch (error) {
                console.error('處理購買請求時出錯:', error);
                showError('處理您的購買請求時出錯', '錯誤');
            }
        }
    });
}

// 為 ProfileManagement 提供数据
provide('profileData', {
    profile: computed(() => userStore.profile),
    updateProfile: updateProfile
});

// 為 PointsManagement 提供数据
provide('pointsData', {
    points: computed(() => userStore.points),
    pointsHistory: computed(() => {
        return pointsStore.pointsHistory.map(txn => ({
            id: txn.id,
            date: txn.createdAt,
            type: txn.kind,
            description: txn.note || '點數交易',
            points: txn.amount,
            balance: txn.balance,
            remark: txn.refType?.toString()
        }));
    }),
    pointsCards: computed(() => {
        return pointsStore.pointsCards.map(card => ({
            id: card.id,
            name: `${card.points}點數卡`,
            description: card.description,
            points: card.points,
            price: card.price,
            discount: card.discount
        }));
    }),
    handlePurchase: handlePurchase
});

// 為 BookingsManagement 提供数据
provide('bookingsData', {
    bookings: computed(() => bookingStore.byStatus(BookingStatus.Confirmed)),
    cancelBooking: cancelBooking
});

// 為 ActivityHistory 提供数据
provide('activityData', {
    courseHistory: computed(() => {
        return bookingStore.bookings
    }),
    absenceRecords: computed(() => {
        return bookingStore.byStatus(BookingStatus.Pending)
    })
});

// 為 PurchaseHistory 提供数据
provide('purchaseData', {
    purchaseHistory: computed(() => {
        return purchaseStore.purchaseHistory.map(item => ({
            id: item.id,
            date: item.createdAt.toISOString().split('T')[0],
            cardType: item.cardType as CardType,
            amount: item.total,
            points: 0,
            status: item.status,
            paymentMethod: item.payMethod,
            invoiceNo: item.invoiceNo,
            invoiceAvailable: !!item.invoiceNo,
            invoiceNumber: item.invoiceNo,
            paymentDate: item.createdAt.toISOString().split('T')[0],
        }));
    }),
    unpaidRecords: computed(() => {
        return purchaseStore.byStatus(OrderStatus.Pending).map(item => ({
            id: item.id,
            date: item.createdAt.toISOString().split('T')[0],
            cardType: item.cardType as CardType,
            amount: item.total,
            points: 0,
            status: item.status,
            paymentMethod: item.payMethod,
            invoiceNo: item.invoiceNo,
            invoiceAvailable: false,
            invoiceNumber: '',
            paymentDate: '',
            expiry: ''
        }));
    })
});
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