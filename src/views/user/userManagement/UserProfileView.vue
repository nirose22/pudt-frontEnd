<template>
    <div class="flex-1 flex  overflow-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden min-h-7/12 grow flex flex-col">
            <!-- 頂部個人信息區 -->
            <nav class="bg-gradient-to-r from-blue-500 to-blue-300 p-6 ">
                <div class="flex flex-col md:flex-row gap-8">
                    <!-- 大頭照 -->
                    <div class="flex items-center justify-center">
                        <Avatar :label="userStore.profile?.name?.charAt(0)" size="xlarge" shape="circle"
                            class="!bg-green-100 !text-green-800" />
                        <Button icon="pi pi-camera" class="absolute bottom-0 right-0 p-1 !w-8 !h-8" rounded text
                            @click="handlePhotoUpload" />
                    </div>

                    <!-- 個人基本信息 -->
                    <div class="flex flex-col gap-2 text-center md:text-left">
                        <p class="text-2xl font-bold text-gray-100">{{ userStore.profile?.name }}</p>
                        <p class="text-gray-100">{{ userStore.profile?.email }}</p>
                        <div class="flex flex-wrap justify-center md:justify-start gap-2">
                            <Chip :label="`點數: ${userStore.points}`" class=" !text-blue-600" />
                        </div>
                    </div>
                </div>
            </nav>

            <div class="flex flex-col flex-1 sm:overflow-hidden md:flex-row">
                <!-- 左側菜單 -->
                <div class="w-full md:w-1/4 border-r border-gray-200">
                    <ul class="py-2 text-gray-700">
                        <li v-for="(menuItem, index) in menuItems" :key="index">
                            <RouterLink :to="menuItem.path" custom v-slot="{ navigate, isActive }">
                                <div @click="navigate"
                                    :class="['p-3 cursor-pointer flex items-center transition-colors duration-200',
                                        isActive ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'hover:bg-blue-100']">
                                    <i :class="['pi mr-2', menuItem.icon]"></i>
                                    {{ menuItem.label }}
                                </div>
                            </RouterLink>
                        </li>
                        <li class="p-3 cursor-pointer flex items-center text-red-500 hover:bg-gray-50"
                            @click="handleLogout">
                            <i class="pi pi-sign-out mr-2"></i>
                            登出
                        </li>
                    </ul>
                </div>

                <!-- 右側內容 - 使用路由顯示 -->
                <section class="w-full md:w-3/4 p-6 flex flex-1">
                    <RouterView v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </RouterView>
                </section>
            </div>
        </div>
        <Toast />
        <ConfirmDialog class="max-w-lg w-full" />
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

const toast = useToast();
const showPhotoDialog = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedPhoto = ref<File | null>(null);

const confirm = useConfirm();
const userStore = useUserStore();
const bookingStore = useBookingStore();
const pointsStore = usePointsStore();
const purchaseStore = usePurchaseStore();
const router = useRouter();
const route = useRoute();

// 初始化数据
onMounted(() => {
    initToast(toast);
    userStore.fetchProfile();
    pointsStore.init();
    bookingStore.fetchBookings();
    purchaseStore.fetchHistory();
})

// 菜單項目
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

const updateProfile = (updatedProfile: Partial<any>) => {
    const res = userStore.updateProfile(updatedProfile);
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
    // 在實際應用中，這裡應該調用登出 API
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

const handlePurchase = (cardId: number) => {
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
        return bookingStore.bookings.map(booking => ({
            id: booking.id,
            userId: booking.userId,
            courseTitle: booking.courseTitle || '',
            courseType: '瑜伽課',
            location: booking.location || '',
            date: booking.date ? booking.date.toISOString().split('T')[0] : '',
            time: booking.time || '',
            points: booking.points,
            status: booking.status,
            rating: booking.rating,
            comment: booking.comment,
            instructor: booking.instructor
        }));
    }),
    absenceRecords: computed(() => {
        return bookingStore.byStatus(BookingStatus.Pending).map(booking => ({
            id: booking.id,
            userId: booking.userId,
            courseTitle: booking.courseTitle || '',
            courseType: '瑜伽課',
            date: booking.date ? booking.date.toISOString().split('T')[0] : '',
            time: booking.time || '',
            points: booking.points,
            reason: '未出席'
        }));
    })
});

// 為 PurchaseHistory 提供数据
provide('purchaseData', {
    purchaseHistory: computed(() => {
        return purchaseStore.purchaseHistory.map(item => ({
            id: item.id,
            date: item.createdAt.toISOString().split('T')[0],
            cardType: CardType.Basic,
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
            cardType: CardType.Basic,
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