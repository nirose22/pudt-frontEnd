<template>
    <div class="flex flex-col flex-1 gap-4">
        <!-- 卡片容器 -->
        <div class=" bg-white rounded-lg h-full flex flex-col gap-4">
            <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" :defaultRangeDays="7"
                :showControls="false" @change="handleDateRangeChange" class="border-b border-sky-100 pb-3" />

            <!-- 課程列表（按日期分組） -->
            <div v-if="bookingsInRange.length && isLoggedIn" class="flex-1 flex flex-col gap-3 overflow-auto">
                <div v-for="date in Object.keys(bookingsByDate)" :key="date" class="flex flex-col gap-1">
                    <!-- 使用 DataView 展示当天课程 -->
                    <DataView :value="bookingsByDate[date]" :layout="layout" :rows="bookingsByDate[date].length">
                        <template #header>
                            <p class="text-sm font-medium bg-sky-50 text-sky-700 py-2 px-3 rounded-md">
                                {{ formatDateHeader(date) }}
                            </p>
                        </template>
                        <!-- 列表视图 -->
                        <template #list="slotProps">
                            <div v-for="(booking, index) in slotProps.items" :key="index">
                                <div class="flex p-3 gap-6 border border-sky-100 rounded-lg shadow-sm hover:bg-sky-50 transition-colors mb-2 cursor-pointer"
                                    @click="showBookingDetail(booking)">
                                    <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 self-center">
                                        <div v-if="booking.instructor?.avatar"
                                            class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                            <img :src="booking.instructor.avatar" alt="教練照片"
                                                class="w-full h-full object-cover bg-gray-200" />
                                        </div>
                                        <div v-else
                                            class="w-full h-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                                            <i class="pi pi-user text-white text-sm"></i>
                                        </div>
                                    </div>

                                    <div class="flex-1 flex flex-col">
                                        <div class="text-base font-medium text-sky-700">{{ booking.courseTitle }}
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600 mb-1">
                                            <i class="pi pi-clock text-sky-500 mr-1"></i>
                                            <span>{{ booking.start }} - {{ booking.end }}</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600 mb-1">
                                            <i class="pi pi-map-marker text-sky-500 mr-1"></i>
                                            <span>{{ booking.merchantName }}</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600">
                                            <i class="pi pi-user text-sky-500 mr-1"></i>
                                            <span>{{ booking.instructor?.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          
                        </template>


                        <template #empty>
                            <div class="text-center p-4 bg-sky-50 rounded-lg border border-sky-100">
                                <i class="pi pi-calendar-times text-4xl text-sky-200 mb-2"></i>
                                <p class="text-sky-600">這一天沒有課程預約</p>
                            </div>
                        </template>
                    </DataView>
                </div>
            </div>
            <div v-else class="content-center block text-center p-8 bg-sky-50 flex-1 rounded-lg border border-sky-100">
                <div v-if="!isLoggedIn">
                    <i class="pi pi-calendar-times text-6xl text-sky-200 mb-4"></i>
                    <p class="text-sky-600 text-lg mb-2">尚未登入</p>
                    <p class="text-gray-500 mb-4">快登入預約參加吧！</p>
                    <Button label="登入" icon="pi pi-sign-in" @click="handleLogin"
                        class="!bg-sky-500 !border-sky-500" />
                </div>
                <div v-else>
                    
                    <i class="pi pi-calendar-times text-6xl text-sky-200 mb-4"></i>
                    <p class="text-sky-600 text-lg mb-2">您目前沒有任何預約</p>
                    <p class="text-gray-500 mb-4">選擇課程並預約參加吧！</p>
                    <Button label="瀏覽課程" icon="pi pi-search" @click="router.push('/courses')"
                        class="!bg-sky-500 !border-sky-500" />
                </div>
            </div>

            <Toast />
            <BookingDetailDialog v-model:showDetailDialog="showDetailDialog" v-model:selectedBooking="selectedBooking" @confirmCancelSelectedBooking="confirmCancelBooking" /> 
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, type Ref } from 'vue';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { useBookingStore } from '@/stores/bookingStore';
import { byDate } from '@/utils/dateUtils';
import { BookingStatus } from '@/enums/BookingStatus';
import DataView from 'primevue/dataview';
import type { Booking } from '@/types/booking';
import { useConfirm } from 'primevue/useconfirm';
import { showError, showSuccess } from '@/utils/toastHelper';
import Dialog from 'primevue/dialog';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import BookingDetailDialog from '@/components/user/BookingDetailDialog.vue';

const showLoginDialog = inject('showLoginDialog') as Ref<boolean>;

const router = useRouter();
const bookingStore = useBookingStore();
const confirm = useConfirm();
const layout = ref('list');

const showDetailDialog = ref(false);
const selectedBooking = ref<Booking>({} as Booking);
const loading = ref(false);
const showCancelDialog = ref(false);
// 日期範圍
const startDate = ref(new Date());
const endDate = ref(new Date(startDate.value.getTime() + 7 * 24 * 60 * 60 * 1000));
const range = ref<{ start: Date; end: Date } | null>(null);
const bookingsInRange = ref<Booking[]>([]);
const isLoggedIn = computed(() => useAuthStore().isLoggedIn);

const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
    // 日期變化後，重新獲取符合日期範圍的預約
    fetchFilteredBookings();
};

// 根據日期範圍過濾預約
const fetchFilteredBookings = async () => {
    if (!isLoggedIn) {
        return;
    }
    try {
        loading.value = true;
        // 先獲取所有預約
        const dateRange = range.value?.start.toISOString() + '~' + range.value?.end.toISOString();
        const status = BookingStatus.Confirmed;
        const result = await bookingStore.fetchSchedule({ dateRange: dateRange, status: status });
        if (result.success) {
            bookingsInRange.value = result.data as Booking[];
        }
    } catch (error) {
        console.error('獲取預約失敗:', error);
        showError('獲取預約數據失敗');
    } finally {
        loading.value = false;
    }
};


const bookingsByDate = computed(() => {
    return byDate(bookingsInRange.value, booking => new Date(booking.date));
});

// 显示课程详情
const showBookingDetail = (booking: Booking) => {
    selectedBooking.value = booking;
    showDetailDialog.value = true;
};

const confirmCancelBooking = async () => {
    showCancelDialog.value = true;
};


const handleLogin = () => {
    showLoginDialog.value = true;
};

// 初始化設定日期範圍
onMounted(() => {
    range.value = {
        start: startDate.value,
        end: endDate.value
    };
    console.log(1111);
    
    // 獲取預約數據
    fetchFilteredBookings();
});

// 格式化日期標題
const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
};
</script>

<style scoped>
@reference "tailwindcss";

.icon-class {
    @apply text-sm text-sky-500 mr-1;
}

:deep(.p-dataview-header) {
    @apply bg-transparent border-0 p-0 mb-2;
}

:deep(.p-dialog-content) {
    @apply p-4;
}

:deep(.p-dialog-header) {
    @apply bg-sky-50 text-sky-700;
}

:deep(.p-dialog-footer) {
    @apply bg-gray-50;
}
</style>