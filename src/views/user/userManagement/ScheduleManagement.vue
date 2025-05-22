<template>
    <div class="flex flex-col flex-1 gap-4">
        <!-- 卡片容器 -->
        <div class=" bg-white rounded-lg h-full flex flex-col gap-4">
            <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" :defaultRangeDays="7"
                :showControls="false" @change="handleDateRangeChange" class="border-b border-sky-100 pb-3" />

            <!-- 課程列表（按日期分組） -->
            <div v-if="bookingsInRange.length" class="flex-1 flex flex-col gap-3 overflow-auto">
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
                                <div class="flex p-3 gap-4 border border-sky-100 rounded-lg shadow-sm hover:bg-sky-50 transition-colors mb-2 cursor-pointer"
                                    @click="showBookingDetail(booking)">
                                    <div v-if="booking.instructor?.avatar" class="flex-shrink-0">
                                        <img :src="booking.instructor.avatar" alt="教練照片"
                                            class="w-12 h-12 rounded-full object-cover shadow-sm border border-sky-100" />
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
                                            <span>{{ booking.location }}</span>
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
                <i class="pi pi-calendar-times text-6xl text-sky-200 mb-4"></i>
                <p class="text-sky-600 text-lg mb-2">您目前沒有任何預約</p>
                <p class="text-gray-500 mb-4">選擇課程並預約參加吧！</p>
                <Button label="瀏覽課程" icon="pi pi-search" @click="router.push('/courses')"
                    class="!bg-sky-500 !border-sky-500" />
            </div>

            <Dialog v-model:visible="showDetailDialog" header="課程詳情" :modal="true" :closable="true"
                :style="{ width: '500px' }" :contentStyle="{ 'background-color': '#f8fafc' }">
                <div v-if="selectedBooking" class="space-y-4">
                    <div class="p-4 rounded-lg bg-white border border-sky-100">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">課程名稱：</span>
                            <span class="font-medium text-sky-700">{{ selectedBooking.courseTitle }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">日期：</span>
                            <span>{{ selectedBooking ? formatDateString(String(selectedBooking.date)) : '' }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">時間：</span>
                            <span>{{ selectedBooking.start }} - {{ selectedBooking.end }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">講師：</span>
                            <span>{{ selectedBooking.instructor?.name }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">地點：</span>
                            <span>{{ selectedBooking.merchantName }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">點數：</span>
                            <span class="font-bold text-sky-600">{{ selectedBooking.points }}</span>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="取消預約" icon="pi pi-times" severity="danger" outlined
                        @click="selectedBooking && cancelBooking(selectedBooking)" class="mr-2" />
                    <Button label="關閉" @click="showDetailDialog = false" class="!bg-sky-500 !border-sky-500" />
                </template>
            </Dialog>
            <Toast />
            <ConfirmDialog class="max-w-md w-full" group="schedule" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { useBookingStore } from '@/stores/bookingStore';
import { inRange, byDate, formatDateString } from '@/utils/dateUtils';
import { BookingStatus } from '@/enums/BookingStatus';
import DataView from 'primevue/dataview';
import type { Booking } from '@/types/booking';
import { useConfirm } from 'primevue/useconfirm';
import { showSuccess, showError } from '@/utils/toastHelper';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const router = useRouter();
const bookingStore = useBookingStore();
const confirm = useConfirm();
const layout = ref('list');
const toast = useToast();

const showDetailDialog = ref(false);
const selectedBooking = ref<Booking | null>(null);
const loading = ref(false);

// 日期範圍
const startDate = ref(new Date());
const endDate = ref(new Date());
endDate.value.setDate(startDate.value.getDate() + 7);
const range = ref<{ start: Date; end: Date } | null>(null);

const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
    // 日期變化後，重新獲取符合日期範圍的預約
    fetchFilteredBookings();
};

// 根據日期範圍過濾預約
const fetchFilteredBookings = async () => {
    try {
        loading.value = true;
        // 先獲取所有預約
        await bookingStore.fetchBookings();
    } catch (error) {
        console.error('獲取預約失敗:', error);
        showError('獲取預約數據失敗');
    } finally {
        loading.value = false;
    }
};

// 獲取範圍內的預約
const bookingsInRange = computed(() => {
    if (!range.value) {
        return bookingStore.bookings;
    }

    // 确保只筛选确认状态的预约
    const confirmedBookings = bookingStore.bookings.filter(b => b.status === BookingStatus.Confirmed);
    return inRange(
        range.value.start,
        range.value.end,
        confirmedBookings,
        // 优先使用专门的预约日期字段，如果不存在则使用创建日期
        booking => booking.date instanceof Date ? booking.date : booking.createdAt
    );
});

const bookingsByDate = computed(() => {
    return byDate(bookingsInRange.value, booking => booking.date instanceof Date ? booking.date : booking.createdAt);
});

// 显示课程详情
const showBookingDetail = (booking: Booking) => {
    selectedBooking.value = booking;
    showDetailDialog.value = true;
};

// 取消课程预约
const cancelBooking = async (booking: Booking) => {
    if (!booking) return;
    confirm.require({
        message: '確認取消預約？',
        header: '取消預約',
        acceptLabel: '確認取消',
        rejectLabel: '返回',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        group: 'schedule',
        accept: async () => {
            try {
                const result = await bookingStore.cancel(booking.id);
                if (result.success) {
                    showSuccess(result.message ?? '預約已取消', '預約已取消');
                    showDetailDialog.value = false;
                    // 重新获取数据
                    fetchFilteredBookings();
                } else {
                    showError(result.message ?? '操作失敗', '操作失敗');
                }
            } catch (error) {
                console.error('取消預約失敗:', error);
                showError('取消預約時發生錯誤');
            }
        }
    });
};

// 初始化設定日期範圍
onMounted(() => {
    range.value = {
        start: startDate.value,
        end: endDate.value
    };
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