<template>
    <div class="flex flex-col flex-1 gap-4">
        <!-- 卡片容器 -->
        <div class="card h-full flex flex-col gap-3">
            <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" :defaultRangeDays="7"
                :showControls="false" @change="handleDateRangeChange" />
            <!-- 課程列表（按日期分組） -->
            <div v-if="bookingsInRange.length" class="flex-1 flex flex-col gap-1 overflow-auto">
                <div v-for="date in Object.keys(bookingsByDate)" :key="date" class="flex flex-col gap-1">
                    <!-- 使用 DataView 展示当天课程 -->
                    <DataView :value="bookingsByDate[date]" :layout="layout" :rows="bookingsByDate[date].length">
                        <template #header>
                            <p class="text-sm font-medium text-gray-600">{{ formatDateHeader(date) }}</p>
                        </template>
                        <!-- 列表视图 -->
                        <template #list="slotProps">
                            <div v-for="(booking, index) in slotProps.items" :key="index">
                                <div class="flex p-3 gap-4 shadow-smrounded-lg hover:bg-blue-50 transition-colors mb-2 cursor-pointer"
                                    @click="showBookingDetail(booking)">
                                    <div v-if="booking.instructor?.avatar" class="flex-shrink-0">
                                        <img :src="booking.instructor.avatar" alt="教練照片"
                                            class="w-12 h-12 rounded-full object-cover shadow-sm" />
                                    </div>
                                    <div class="flex-1 flex flex-col">
                                        <div class="text-base font-medium text-sky-600">{{ booking.courseTitle }}
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600 mb-1">
                                            <i class="pi pi-clock icon-class"></i>
                                            <span>{{ booking.time }}</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600 mb-1">
                                            <i class="pi pi-map-marker icon-class"></i>
                                            <span>{{ booking.location }}</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600">
                                            <i class="pi pi-user icon-class"></i>
                                            <span>{{ booking.instructor?.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #empty>
                            <div class="text-center p-4 bg-gray-50 rounded">
                                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                                <p class="text-gray-500">這一天沒有課程預約</p>
                            </div>
                        </template>
                    </DataView>
                </div>
            </div>
            <div v-else class="content-center block text-center p-6 bg-gray-50 flex-1">
                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">您目前沒有任何預約</p>
            </div>
            <Toast />
            <ConfirmDialog class="w-100" />
            <Dialog v-model:visible="showDetailDialog" header="課程詳情" :modal="true" :closable="true"
                :style="{ width: '500px' }">
                <div v-if="selectedBooking" class="space-y-4">
                    <div class="p-3 rounded-lg bg-gray-50">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">課程名稱：</span>
                            <span class="font-medium">{{ selectedBooking.courseTitle }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">日期：</span>
                            <span>{{ selectedBooking ? formatDateString(String(selectedBooking.date)) : '' }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">時間：</span>
                            <span>{{ selectedBooking.time }}</span>
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
                            <span class="font-bold text-primary-600">{{ selectedBooking.points }}</span>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="取消預約" icon="pi pi-times" severity="danger" outlined
                        @click="selectedBooking && cancelBooking(selectedBooking)" class="mr-2" />
                    <Button label="關閉" @click="showDetailDialog = false" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { useBookingStore } from '@/stores/bookingStore';
import { inRange, byDate, formatDateString } from '@/utils/date';
import { BookingStatus } from '@/enums/BookingStatus';
import DataView from 'primevue/dataview';
import { useToast } from 'primevue/usetoast';
import type { CourseRecord } from '@/types';
import { useConfirm } from 'primevue/useconfirm';

const bookingStore = useBookingStore();
const toast = useToast();
const confirm = useConfirm();
const layout = ref('list');

const showDetailDialog = ref(false);
const selectedBooking = ref<CourseRecord | null>(null);

// 日期範圍
const startDate = ref(new Date());
const endDate = ref(new Date());
endDate.value.setDate(startDate.value.getDate() + 7);
const range = ref<{ start: Date; end: Date } | null>(null);

const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
};

// 獲取範圍內的預約
const bookingsInRange = computed(() => {
    if (!range.value) {
        return bookingStore.bookings;
    }
    return inRange(range.value.start, range.value.end,
        bookingStore.bookings.filter(b => b.status === BookingStatus.Confirmed));
});

const bookingsByDate = computed(() => {
    return byDate(bookingsInRange.value);
});

// 显示课程详情
const showBookingDetail = (booking: CourseRecord) => {
    selectedBooking.value = booking;
    showDetailDialog.value = true;
};

// 取消课程预约
const cancelBooking = async (booking: CourseRecord) => {
    if (!booking) return;
    confirm.require({
        message: '確認取消預約？',
        header: '取消預約',
        acceptLabel: '取消',
        rejectLabel: '確認',
        rejectClass: 'p-button-secondary',
        reject: async () => {
            const result = await bookingStore.cancel(booking.id);
            if (result.success) {
                toast.add({
                    severity: 'success',
                    summary: '預約已取消',
                    detail: result.message,
                    life: 3000
                });
                showDetailDialog.value = false;
            } else {
                toast.add({
                    severity: 'error',
                    summary: '操作失敗',
                    detail: result.message,
                    life: 3000
                });
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
    bookingStore.fetchBookings();
});

// 格式化日期標題
const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
};
</script>

<style scoped>
@reference "tailwindcss";

.card {
    @apply p-4 shadow-sm bg-gray-50;
}

.icon-class {
    @apply text-sm text-blue-400 mr-1;
}

.date-header {
    @apply py-2 px-4 bg-yellow-50 rounded-lg mb-2;
}
</style>