<template>
    <div class="flex-1 flex py-4 px-4 sm:px-6 lg:px-8 overflow-auto">
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

            <!-- 主要內容區域 -->
            <div class="flex flex-col flex-1 sm:overflow-hidden md:flex-row">
                <!-- 左側菜單 -->
                <div class="w-full md:w-1/4 border-r border-gray-200">
                    <ul class="py-2 text-gray-700">
                        <li v-for="(menuItem, index) in menuItems" :key="index" @click="activeTab = menuItem.id"
                            :class="['p-3 cursor-pointer flex items-center transition-colors duration-200',
                                activeTab === menuItem.id ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'hover:bg-blue-100']">
                            <i :class="['pi mr-2', menuItem.icon]"></i>
                            {{ menuItem.label }}
                        </li>
                        <li class="p-3 cursor-pointer flex items-center text-red-500 hover:bg-gray-50"
                            @click="handleLogout">
                            <i class="pi pi-sign-out mr-2"></i>
                            登出
                        </li>
                    </ul>
                </div>

                <!-- 右側內容 -->
                <section class="w-full md:w-3/4 p-6 flex flex-1">
                    <!-- 1. 個人資料管理 -->
                    <template v-if="activeTab === 'profile'">
                        <ProfileManagement :profile="userStore.profile" @update-profile="updateProfile" />
                    </template>

                    <!-- 2. 點數管理與課卡購買 -->
                    <template v-if="activeTab === 'points'">
                        <PointsManagement />
                    </template>

                    <!-- 3. 預約行程管理 -->
                    <template v-if="activeTab === 'bookings'">
                        <BookingsManagement :bookings="userActiveBookings" @cancel-booking="cancelBooking" />
                    </template>

                    <!-- 4. 活動紀錄 -->
                    <template v-if="activeTab === 'history'">
                        <ActivityHistory :courseHistory="userBookings" :purchaseHistory="purchaseHistory"
                            :absenceRecords="absenceRecords" :unpaidRecords="unpaidRecords" />
                    </template>
                </section>
            </div>
        </div>
    </div>
    <Toast />

    <!-- 頭像上傳對話框 -->
    <Dialog v-model:visible="showPhotoDialog" header="更新頭像" :style="{ width: '450px' }">
        <div class="flex flex-col items-center gap-4">
            <div class="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
                <p>拖拽照片到此處或點擊上傳</p>
                <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="onPhotoSelected">
                <Button label="選擇照片" class="mt-3" @click="$refs.fileInput.click()" />
            </div>
            <div class="flex justify-end w-full mt-4">
                <Button label="取消" class="p-button-text" @click="showPhotoDialog = false" />
                <Button label="確定上傳" @click="confirmPhotoUpload" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';
import { useUserStore } from '@/stores/userStore';
// 子組件導入
import ProfileManagement from '@/views/user/userManagement/ProfileManagement.vue';
import PointsManagement from '@/views/user/userManagement/PointsManagement.vue';
import BookingsManagement from '@/views/user/userManagement/BookingsManagement.vue';
import ActivityHistory from '@/views/user/userManagement/ActivityHistory.vue';
import type { User, CourseBooking } from '@/types';
import { useBookingStore } from '@/stores/bookingStore';
import { BookingStatus } from '@/enums/BookingStatus';
import { usePointsStore } from '@/stores/pointsStore';
import { usePurchaseStore } from '@/stores/purchaseStore';
const toast = useToast();
const activeTab = ref('profile');
const showPhotoDialog = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedPhoto = ref<File | null>(null);

const userStore = useUserStore();
const bookingStore = useBookingStore();
const pointsStore = usePointsStore();
const purchaseStore = usePurchaseStore();
// 購買歷史
const purchaseHistory = purchaseStore.purchaseHistory;
// 用戶資料
onMounted(async () => {
    await userStore.fetchProfile();
    await pointsStore.fetchPointsHistory();
    await bookingStore.fetchBookings();
})
const userBookings = bookingStore.bookings;

// 菜單項目
const menuItems = [
    { id: 'profile', label: '會員資料管理', icon: 'pi-user' },
    { id: 'points', label: '點數與課卡', icon: 'pi-wallet' },
    { id: 'bookings', label: '預約行程管理', icon: 'pi-calendar' },
    { id: 'history', label: '活動紀錄', icon: 'pi-history' }
];


const userActiveBookings = computed(() => {
    return bookingStore.byStatus(BookingStatus.Confirmed)
})

// 缺席記錄
const absenceRecords = ref([
    { id: 1, courseTitle: '高級瑜珈', date: '2025-04-10', time: '14:00-16:00', points: 12 }
]);

// 未付費記錄
const unpaidRecords = ref([
    ...bookingStore.byStatus(BookingStatus.Pending)
]);

const handlePhotoUpload = () => {
    showPhotoDialog.value = true;
};

const onPhotoSelected = (event: Event) => {
    selectedPhoto.value = (event.target as HTMLInputElement).files?.[0] ?? null;
};

// 確認上傳頭像
// API: /api/user/update-avatar
const confirmPhotoUpload = () => {
    if (selectedPhoto.value) {
        // 在實際應用中，這裡應該上傳照片到服務器
        const reader = new FileReader();
        reader.onload = (e) => {
            if (userStore.profile) {
                userStore.profile.avatar = e.target?.result as string;
                showPhotoDialog.value = false;
                toast.add({ severity: 'success', summary: '成功', detail: '頭像已更新', life: 3000 });
            }
        };
        reader.readAsDataURL(selectedPhoto.value);
    }
};

const updateProfile = (updatedProfile: Partial<User>) => {
    const res = userStore.updateProfile(updatedProfile);
    if (res.success) {
        toast.add({ severity: 'success', summary: '成功', detail: res.message, life: 3000 });

    } else {
        toast.add({ severity: 'error', summary: '失敗', detail: res.message, life: 3000 });
    }
};

const cancelBooking = async (bookingId: number) => {
    const res = await bookingStore.cancel(bookingId);
    if (res.success) {
        toast.add({ severity: 'success', summary: '成功', detail: res.message, life: 3000 });

    } else {
        toast.add({ severity: 'error', summary: '失敗', detail: res.message, life: 3000 });
    }
};

const handleLogout = () => {
    // 在實際應用中，這裡應該調用登出 API
    toast.add({ severity: 'info', summary: '登出', detail: '您已成功登出', life: 3000 });
    // 導航到登入頁面
    // router.push('/login');
};
</script>