<template>
    <div class="flex flex-col flex-1 overflow-y-auto">
        <h2 class="text-2xl font-bold mb-3 text-sky-700 flex items-center">
            <i class="pi pi-calendar-plus mr-2"></i>預約行程管理
        </h2>

        <!-- 即將到來的預約 - 橫向滾動卡片 -->
        <Carousel :value="upcomingBookings" :responsiveOptions="responsiveOptions" :showIndicators="false" :numVisible="4" :numScroll="1"
            class="mb-2">
            <template #item="slotProps">
                <div class="p-2">
                    <div class=" bg-white p-4 shadow-sm rounded-lg border-l-4 hover:shadow-md transition-all duration-200 cursor-pointer border-sky-100"
                        @click="viewBookingDetail(slotProps.data)">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-lg text-sky-700 truncate">
                                {{ slotProps.data.courseTitle }}
                            </h4>
                            <div class="text-sm text-gray-600 mt-1">
                                <i class="pi pi-calendar mr-1"></i>
                                {{ formatDateString((slotProps.data.date || slotProps.data.createdAt).toString()) }}
                            </div>
                            <div class="text-sm text-gray-600">
                                <i class="pi pi-clock mr-1"></i>
                                {{ slotProps.data.start }}
                            </div>
                            <div class="text-sm text-gray-600">
                                <i class="pi pi-map-marker mr-1"></i>
                                {{ slotProps.data.merchantName }}
                            </div>
                        </div>
                        <Tag :value="getTimeLeftLabel(slotProps.data)"
                            :severity="getTimeLeftSeverity(slotProps.data)" />
                    </div>

                    <div class="flex justify-end gap-2">
                        <Button icon="pi pi-map-marker" text rounded size="small" aria-label="查看地圖"
                            @click.stop="showLocationMap(slotProps.data)" class="hover:bg-sky-50" />
                        <Button icon="pi pi-eye" text rounded size="small" aria-label="查看詳情"
                            @click.stop="viewBookingDetail(slotProps.data)" class="hover:bg-sky-50" />
                        <Button v-if="canCancel(slotProps.data)" icon="pi pi-times" text rounded size="small"
                            aria-label="取消預約" @click.stop="showCancelDialog = true"
                            class="hover:bg-red-50" />
                        </div>
                    </div>
                </div>
            </template>
        </Carousel>


        <!-- 視圖切換按鈕 -->
        <div class="flex justify-between items-center mb-4">
            <ButtonGroup class="h-10">
                <Button
                    :class="{ 'p-button-outlined !border-sky-500 !text-sky-500': viewMode !== 'list', '!bg-sky-500 !border-sky-500': viewMode === 'list' }"
                    icon="pi pi-list" label="列表" @click="viewMode = 'list'" v-tooltip.top="'切換至列表視圖'" />
                <Button
                    :class="{ 'p-button-outlined !border-sky-500 !text-sky-500': viewMode !== 'calendar', '!bg-sky-500 !border-sky-500': viewMode === 'calendar' }"
                    icon="pi pi-calendar" label="日曆" @click="viewMode = 'calendar'" v-tooltip.top="'切換至日曆視圖'" />
            </ButtonGroup>

            <div class="flex gap-2">
                <Button icon="pi pi-sync" label="同步至行事曆" outlined @click="showCalendarSyncDialog = true"
                    class="!border-sky-500 !text-sky-500 hover:!bg-sky-50" v-tooltip.left="'將預約同步到您的行事曆'" />
                <Select v-model="filter.status" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="狀態" class="border-sky-200 focus:border-sky-500" />
            </div>
        </div>

        <!-- 列表視圖 -->
        <div v-if="viewMode === 'list'" class="flex flex-col flex-1 overflow-hidden">
            <DataTable :value="filteredBookings" stripedRows responsiveLayout="stack" paginator :rows="10"
                class="p-datatable-sm" emptyMessage="無預約記錄">
                <Column field="courseTitle" header="課程名稱" headerClass="bg-sky-50 text-sky-700" />
                <Column field="date" header="日期" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        {{ formatDateString(data.date) }}
                    </template>
                </Column>
                <Column field="time" header="時間" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        {{ data.start }} - {{ data.end }}
                    </template>
                </Column>
                <Column field="merchantName" header="地點" headerClass="bg-sky-50 text-sky-700" />
                <Column field="instructor.name" header="講師" headerClass="bg-sky-50 text-sky-700" />
                <Column field="status" header="狀態" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <Tag :severity="getBookingStatusSeverity(data.status)"
                            :value="getBookingStatusLabel(data.status)" />
                    </template>
                </Column>
                <Column header="操作" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="flex gap-1">
                            <Button icon="pi pi-eye" text rounded aria-label="查看詳情" @click="viewBookingDetail(data)"
                                class="text-sky-500 hover:bg-sky-50" />
                            <Button v-if="canCancel(data)" icon="pi pi-times" text rounded aria-label="取消預約"
                                @click="confirmCancelBooking(data.id)" class="text-red-500 hover:bg-red-50" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            <div v-if="filteredBookings.length === 0"
                class="content-center block text-center p-6 bg-sky-50 flex-1 rounded-lg border border-sky-100">
                <i class="pi pi-calendar-times text-4xl text-sky-200 mb-2"></i>
                <p class="text-sky-600">您目前沒有任何預約</p>
            </div>
        </div>

        <!-- 日曆視圖 -->
        <div v-else-if="viewMode === 'calendar'" class="flex-1 rounded-lg border border-sky-100 p-2">
            <FullCalendar :options="calendarOptions" class="w-full h-full">
                <template v-slot:eventContent='arg'>
                    <div class="fc-content rounded-md p-1 whitespace-normal cursor-pointer">
                        <div class="fc-title text-sm text-sky-600"> {{ arg.event.title }}</div>
                        <div class="text-xs text-gray-500"> {{ arg.event.extendedProps.location }}</div>
                    </div>
                </template>
            </FullCalendar>
        </div>

        <!-- 預約詳情對話框 -->
        <BookingDetailDialog  v-model:showDetailDialog="showDetailDialog"
            v-model:selectedBooking="selectedBooking" @refresh="loadBookings" />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import ButtonGroup from 'primevue/buttongroup';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useToast } from 'primevue/usetoast';
import { BookingStatus } from '@/enums/BookingStatus';
import { formatDateString } from '@/utils/dateUtils';
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import type { Booking } from '@/types/booking';
import { useBookingStore } from '@/stores/bookingStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { BookingService } from '@/services/UserBookingService';
import { showSuccess, showError } from '@/utils/toastHelper';
import { getBookingStatusLabel, getBookingStatusSeverity } from '@/utils/statusUtil';
import BookingDetailDialog from '@/components/user/BookingDetailDialog.vue';
import Carousel from 'primevue/carousel';


// 使用 stores 和 composables
const bookingStore = useBookingStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const toast = useToast();

// 響應式數據
const bookings = ref<Booking[]>([]);
const loading = ref(false);

// 初始化數據
onMounted(async () => {
    if (authStore.isLoggedIn) {
        await loadBookings();
    }
});

// 業務方法 - 載入預約記錄
const loadBookings = async () => {
    loading.value = true;
    try {
        const res = await bookingStore.fetchSchedule({status: BookingStatus.Confirmed});
        if (res.success) {
            bookings.value = res.data as Booking[];
        }
    } catch (error) {
        console.error('載入預約記錄失敗:', error);
    } finally {
        loading.value = false;
    }
};

const responsiveOptions = [
    {
        breakpoint: '1200px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '992px',
        numVisible: 2,
        numScroll: 1
    }
]


// 视图模式
const viewMode = ref('list');
const showDetailDialog = ref(false);
const showCalendarSyncDialog = ref(false);
const selectedBooking = ref<Booking>({} as Booking);
const showCancelDialog = ref(false);

// 确认是否是即将到来的预约
const isUpcoming = (date: Date | string, time: string | Date): boolean => {
    const now = new Date();

    // 統一處理日期格式
    const bookingDate = typeof date === 'string' ? new Date(date) : new Date(date);

    // 设置时分秒
    if (time) {
        if (typeof time === 'string') {
            const [hours, minutes] = time.split(':').map(Number);
            bookingDate.setHours(hours || 0, minutes || 0, 0, 0);
        } else if (time instanceof Date) {
            bookingDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
        }
    }

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    return bookingDate >= now && bookingDate <= sevenDaysLater;
};

// 即将到来的预约 - 過濾掉已取消和待處理的狀態
const upcomingBookings = computed(() => {
    return bookings.value
        .filter(booking => {
            // 過濾掉已取消和待處理的狀態
            if (booking.status === BookingStatus.Cancelled || booking.status === BookingStatus.Pending) {
                return false;
            }

            // 使用預約日期而不是創建日期
            const bookingDate = booking.date || booking.createdAt;
            return isUpcoming(bookingDate, booking.start || '');
        })
        .sort((a, b) => {
            // 按日期和時間排序
            const dateA = new Date(`${a.date || a.createdAt}T${a.start || '00:00'}`);
            const dateB = new Date(`${b.date || b.createdAt}T${b.start || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);
});

// 状态选项 - 移除已取消和待處理選項
const statusOptions = [
    { label: '全部', value: '' },
    { label: '已确认', value: BookingStatus.Confirmed.toString() },
    { label: '已完成', value: BookingStatus.Completed.toString() }
];

// 过滤条件
const filter = ref({
    status: ''
});

// 过滤后的预约 - 過濾掉已取消和待處理的狀態
const filteredBookings = computed(() => {
    let result = bookings.value.filter(booking =>
        booking.status !== BookingStatus.Cancelled &&
        booking.status !== BookingStatus.Pending
    );

    // 状态过滤
    if (filter.value.status) {
        result = result.filter(booking => booking.status.toString() === filter.value.status);
    }

    // 按日期排序（最新的在前）
    result.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });

    return result;
});

// 日历事件 - 過濾掉已取消和待處理的狀態
const events = computed(() =>
    filteredBookings.value.map((booking: Booking) => {
        // 確保日期格式正確
        const eventDate = booking.date || booking.createdAt;
        const dateString = typeof eventDate === 'string' ? eventDate : eventDate.toISOString().split('T')[0];
        const startDateTime = `${dateString}T${booking.start || '09:00'}`;
        const endDateTime = `${dateString}T${booking.end || '10:00'}`;

        return {
            id: booking.id.toString(),
            title: booking.courseTitle || `預約 #${booking.id}`,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            extendedProps: {
                location: booking.merchantName || '未指定',
                status: booking.status,
                instructor: booking.instructor?.name || '未指定',
                points: booking.points || 0
            },
            backgroundColor: getEventBackgroundColor(booking.status),
            textColor: '#ffffff'
        };
    })
);

// 日历配置
const calendarOptions = computed((): CalendarOptions => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: events.value,
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: (info: EventClickArg) => {
        const bookingId = parseInt(info.event.id);
        const booking = bookings.value.find(b => b.id === bookingId);
        if (booking) {
            selectedBooking.value = booking;
            showDetailDialog.value = true;
        }
    },
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    },
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    },
    locale: 'zh-tw',
    height: 'auto',
    aspectRatio: 1.5,
    dayMaxEvents: true,
    eventDisplay: 'block',
    displayEventTime: true,
    eventDidMount: (info) => {
        // 添加工具提示
        info.el.setAttribute('title',
            `${info.event.title}\n地點: ${info.event.extendedProps.location}\n狀態: ${getBookingStatusLabel(info.event.extendedProps.status)}`
        );
    }
}));

// 獲取事件背景顏色
function getEventBackgroundColor(status: BookingStatus): string {
    switch (status) {
        case BookingStatus.Confirmed:
            return '#0ea5e9'; // sky-500
        case BookingStatus.Completed:
            return '#10b981'; // green-500
        default:
            return '#8b5cf6'; // purple-500
    }
}


// 获取剩余时间标签
function getTimeLeftLabel(booking: Booking): string {
    const bookingDate = booking.date || booking.createdAt;
    const daysLeft = getDaysLeft(bookingDate);

    if (daysLeft === 0) return '今天';
    if (daysLeft === 1) return '明天';
    if (daysLeft < 0) return '已過期';
    return `${daysLeft} 天後`;
}

// 获取剩余时间严重性
function getTimeLeftSeverity(booking: Booking): string {
    const bookingDate = booking.date || booking.createdAt;
    const daysLeft = getDaysLeft(bookingDate);

    if (daysLeft < 0) return 'danger';
    if (daysLeft <= 1) return 'danger';
    if (daysLeft <= 3) return 'warning';
    return 'success';
}

// 计算剩余天数
function getDaysLeft(date: Date | string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 是否可以取消预约
const canCancel = (booking: Booking) => {
    return booking.status === BookingStatus.Confirmed;
};

// 查看预约详情
function viewBookingDetail(booking: Booking): void {
    selectedBooking.value = booking;
    showDetailDialog.value = true;
}

// 查看地点地图
function showLocationMap(booking: Booking): void {
    selectedBooking.value = booking;
}



// 確認取消預約
const confirmCancelBooking = async (bookingId: number) => {
    const booking = bookings.value.find(b => b.id === bookingId);
    if (!booking) return;
    
    try {
        const confirmed = confirm('確定要取消這個預約嗎？');
        if (!confirmed) return;
        
        // 這裡可以調用取消預約的 API
        // await BookingService.cancelBooking(bookingId);
        
        showSuccess('預約已取消', '成功');
        await loadBookings(); // 重新載入預約列表
    } catch (error) {
        console.error('取消預約失敗:', error);
        showError('取消預約失敗，請稍後再試', '錯誤');
    }
};

// 打開導航
function openNavigation(): void {
    if (selectedBooking.value) {
        toast.add({
            severity: 'info',
            summary: '導航',
            detail: `正在導航至 ${selectedBooking.value.merchantName}`,
            life: 3000
        });
    }
}

// 監聽篩選條件變化
watch(() => filter.value, () => {
    // 可以在這裡添加額外的處理邏輯
}, { deep: true });
</script>

<style scoped>
@reference "tailwindcss";

.card {
    @apply bg-white;
}

/* DataTable 樣式 */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-tbody > tr:hover) {
    @apply bg-sky-50/50;
}

/* 下拉選單樣式 */
:deep(.p-dropdown:not(.p-disabled).p-focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

/* 分頁器樣式 */
:deep(.p-paginator) {
    @apply border-t border-sky-100 bg-white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    @apply bg-sky-500 text-white;
}

/* 對話框樣式 */
:deep(.p-dialog-header) {
    @apply bg-sky-50 text-sky-700;
}

:deep(.p-dialog-footer) {
    @apply bg-gray-50;
}

/* 按鈕樣式 */
:deep(.p-button.p-button-outlined) {
    @apply border-sky-500 text-sky-500;
}

:deep(.p-button.p-button-outlined:hover) {
    @apply bg-sky-50;
}

/* FullCalendar 樣式 */
:deep(.fc .fc-button-primary) {
    @apply bg-sky-500 border-sky-500;
}

:deep(.fc .fc-button-primary:hover) {
    @apply bg-sky-600 border-sky-600;
}

:deep(.fc .fc-button-primary.fc-button-active) {
    @apply bg-sky-700 border-sky-700;
}

:deep(.fc-theme-standard .fc-scrollgrid) {
    @apply border-sky-200;
}

:deep(.fc-theme-standard th) {
    @apply border-sky-200 bg-sky-50 text-sky-700;
}

:deep(.fc-theme-standard td) {
    @apply border-sky-100;
}

:deep(.fc-daygrid-day.fc-day-today) {
    @apply bg-sky-50;
}

:deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
    @apply bg-sky-500 text-white rounded-full font-bold;
}

/* 日曆事件樣式 */
:deep(.fc-event) {
    @apply rounded-md overflow-hidden shadow-sm cursor-pointer;
}

:deep(.fc-event:hover) {
    @apply shadow-md transform scale-105;
    transition: all 0.2s ease-in-out;
}

/* 橫向滾動樣式 */
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    @apply bg-gray-100 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    @apply bg-sky-300 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    @apply bg-sky-400;
}

/* 響應式設計 */
@media (max-width: 768px) {
    :deep(.fc-toolbar) {
        flex-direction: column;
        gap: 10px;
    }

    :deep(.fc-toolbar-chunk) {
        display: flex;
        justify-content: center;
    }

    .flex-none.w-80 {
        @apply w-72;
    }
}
</style>