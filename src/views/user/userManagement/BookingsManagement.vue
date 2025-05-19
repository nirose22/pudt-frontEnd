<template>
    <div class="flex flex-col flex-1 overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">預約行程管理</h2>

        <!-- 即將到來的預約 -->
        <div v-if="upcomingBookings.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold mb-3">即將到來的預約</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="booking in upcomingBookings" :key="booking.id" 
                    class="card p-4 shadow-sm rounded-lg border-l-4"
                    :class="getUpcomingBorderClass(booking)">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-medium text-lg">{{ booking.courseTitle }}</h4>
                            <div class="text-sm text-gray-500 mt-1">{{ formatDateString(booking.createdAt.toISOString()) }} {{ booking.time }}</div>
                            <div class="text-sm text-gray-500">{{ booking.merchantName || booking.location }}</div>
                        </div>
                        <Tag :value="getTimeLeftLabel(booking.createdAt, booking.time || '')" 
                            :severity="getTimeLeftSeverity(booking.createdAt, booking.time || '')" />
                    </div>
                    <div class="mt-3 flex justify-end gap-2">
                        <Button icon="pi pi-map-marker" text rounded aria-label="查看地圖" @click="showLocationMap(booking)" />
                        <Button icon="pi pi-eye" text rounded aria-label="查看詳情" @click="viewBookingDetail(booking)" />
                        <Button icon="pi pi-times" class="p-button-danger" text rounded aria-label="取消預約"
                            @click="confirmCancelBooking(booking.id)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 視圖切換按鈕 -->
        <div class="flex justify-between items-center mb-4">
            <ButtonGroup class="h-10">
                <Button :class="{ 'p-button-outlined': viewMode !== 'list' }" icon="pi pi-list" label="列表"
                    @click="viewMode = 'list'" />
                <Button :class="{ 'p-button-outlined': viewMode !== 'calendar' }" icon="pi pi-calendar" label="日曆"
                    @click="viewMode = 'calendar'" />
            </ButtonGroup>
            
            <div class="flex gap-2">
                <Button icon="pi pi-sync" label="同步至行事曆" outlined @click="showCalendarSyncDialog = true" />
                <Dropdown v-model="filter.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="狀態" />
            </div>
        </div>

        <!-- 列表視圖 -->
        <div v-if="viewMode === 'list'" class="flex flex-col flex-1 overflow-hidden">
            <DataTable :value="filteredBookings" stripedRows responsiveLayout="stack" paginator :rows="10" 
                class="p-datatable-sm" emptyMessage="無預約記錄">
                <Column field="courseTitle" header="課程名稱" />
                <Column field="createdAt" header="日期">
                    <template #body="{ data }">
                        {{ formatDateString(data.createdAt.toISOString()) }}
                    </template>
                </Column>
                <Column field="time" header="時間" />
                <Column field="location" header="地點" />
                <Column field="instructor.name" header="講師" />
                <Column field="status" header="狀態">
                    <template #body="{ data }">
                        <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
                    </template>
                </Column>
                <Column header="操作">
                    <template #body="{ data }">
                        <div class="flex gap-1">
                            <Button icon="pi pi-eye" text rounded aria-label="查看詳情" @click="viewBookingDetail(data)" />
                            <Button v-if="canCancel(data)" icon="pi pi-times" class="p-button-danger" text rounded aria-label="取消預約"
                                @click="confirmCancelBooking(data.id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            <div v-if="filteredBookings.length === 0" class="content-center block text-center p-6 bg-gray-50 flex-1">
                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">您目前沒有任何預約</p>
            </div>
        </div>

        <!-- 日曆視圖 -->
        <div v-else-if="viewMode === 'calendar'" class="flex-1 rounded-lg">
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
        <Dialog v-model:visible="showDetailDialog" :header="selectedBooking?.courseTitle || '預約詳情'" :modal="true" :closable="true"
            :style="{ width: '500px' }">
            <div v-if="selectedBooking" class="space-y-4">
                <div class="p-3 border rounded-lg bg-gray-50">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">課程名稱：</span>
                        <span class="font-medium">{{ selectedBooking.courseTitle }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">日期：</span>
                        <span>{{ formatDateString(selectedBooking.createdAt.toISOString()) }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">時間：</span>
                        <span>{{ selectedBooking.time }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">地點：</span>
                        <span>{{ selectedBooking.location }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">講師：</span>
                        <span>{{ selectedBooking.instructor?.name }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">點數：</span>
                        <span class="font-bold text-primary-600">{{ selectedBooking.points }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">狀態：</span>
                        <Tag :severity="getStatusSeverity(selectedBooking.status)" :value="getStatusLabel(selectedBooking.status)" />
                    </div>
                </div>
                
                <!-- 講師資訊 -->
                <div v-if="selectedBooking.instructor" class="p-3 border rounded-lg">
                    <h3 class="font-medium mb-2">講師資訊</h3>
                    <div class="flex items-center gap-3">
                        <Avatar :label="selectedBooking.instructor.name.charAt(0)" shape="circle" size="large" />
                        <div>
                            <div class="font-medium">{{ selectedBooking.instructor.name }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 地圖 -->
                <div v-if="selectedBooking.location" class="p-3 border rounded-lg">
                    <h3 class="font-medium mb-2">上課地點</h3>
                    <div class="h-40 bg-gray-200 flex items-center justify-center">
                        <i class="pi pi-map-marker text-4xl text-gray-400"></i>
                        <span class="ml-2">{{ selectedBooking.location }}</span>
                    </div>
                    <div class="mt-2 text-sm text-gray-500">
                        請提前 15 分鐘到達上課地點
                    </div>
                </div>
                
                <!-- 注意事項 -->
                <div class="p-3 border rounded-lg bg-blue-50">
                    <h3 class="font-medium mb-2 flex items-center">
                        <i class="pi pi-info-circle mr-2 text-blue-500"></i>
                        課程注意事項
                    </h3>
                    <ul class="list-disc pl-5 text-sm">
                        <li>請提前 15 分鐘到達教室</li>
                        <li>請攜帶個人用品（如瑜珈墊、毛巾等）</li>
                        <li>如需取消預約，請至少提前 24 小時</li>
                        <li>遲到超過 15 分鐘將無法參與課程</li>
                    </ul>
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" outlined />
                <Button v-if="selectedBooking && canCancel(selectedBooking)" label="取消預約" icon="pi pi-times" 
                    class="p-button-danger" @click="confirmCancelSelectedBooking" />
                <Button label="加入行事曆" icon="pi pi-calendar-plus" @click="addToCalendar" />
            </template>
        </Dialog>
        
        <!-- 取消預約確認對話框 -->
        <Dialog v-model:visible="showCancelDialog" header="取消預約" :style="{ width: '450px' }">
            <div class="p-4">
                <div class="flex items-center gap-3 mb-4">
                    <i class="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
                    <p class="font-medium">您確定要取消這個預約嗎？</p>
                </div>
                <p class="text-gray-600">取消可能會影響您的上課權益，且可能產生以下結果：</p>
                <ul class="list-disc pl-5 mt-2 text-sm text-gray-600">
                    <li>提前 24 小時取消：點數全額退還</li>
                    <li>提前 12-24 小時取消：點數退還 50%</li>
                    <li>提前不到 12 小時取消：不退還點數</li>
                </ul>
            </div>
            <template #footer>
                <Button label="返回" icon="pi pi-arrow-left" class="p-button-text" @click="showCancelDialog = false" />
                <Button label="確認取消預約" icon="pi pi-check" class="p-button-danger" @click="cancelBooking()" />
            </template>
        </Dialog>
        
        <!-- 行事曆同步對話框 -->
        <Dialog v-model:visible="showCalendarSyncDialog" header="同步至行事曆" :style="{ width: '450px' }">
            <div class="p-4">
                <p class="mb-4">選擇您要同步的行事曆平台：</p>
                <div class="grid grid-cols-1 gap-3">
                    <Button label="Google 行事曆" icon="pi pi-google" class="p-button-raised p-button-info" @click="syncToCalendar('google')" />
                    <Button label="Apple 行事曆" icon="pi pi-apple" class="p-button-raised" @click="syncToCalendar('apple')" />
                    <Button label="Outlook 行事曆" icon="pi pi-microsoft" class="p-button-raised p-button-help" @click="syncToCalendar('outlook')" />
                    <Button label="下載 .ics 檔案" icon="pi pi-download" class="p-button-raised p-button-secondary" @click="downloadIcsFile()" />
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showCalendarSyncDialog = false" outlined />
            </template>
        </Dialog>
        
        <!-- 地點地圖對話框 -->
        <Dialog v-model:visible="showMapDialog" header="課程地點" :style="{ width: '600px' }">
            <div class="p-4">
                <div class="h-64 bg-gray-200 flex items-center justify-center mb-3">
                    <i class="pi pi-map-marker text-4xl text-gray-400"></i>
                    <span class="ml-2">{{ selectedBooking?.location }}</span>
                </div>
                <div class="text-sm">
                    <p class="font-medium">{{ selectedBooking?.location }}</p>
                    <p class="text-gray-600 mt-1">課程將於 {{ formatDateString((selectedBooking?.createdAt || new Date()).toISOString()) }} {{ selectedBooking?.time }} 開始</p>
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showMapDialog = false" outlined />
                <Button label="導航" icon="pi pi-directions" @click="openNavigation" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ButtonGroup from 'primevue/buttongroup';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import { formatDateString } from '@/utils/date';
import type { CalendarOptions, EventClickArg  } from '@fullcalendar/core';
import { BookingStatus, BookingStatusLabel } from '@/enums/BookingStatus';
import { useToast } from 'primevue/usetoast';
import type { Booking } from '@/types';

/**
 * 扩展预约接口，用于显示需要的附加信息
 */
 interface ExtendedBooking extends Booking {
    // 显示需要的附加信息
    courseTitle: string;
    merchantName?: string;
    location?: string;
    time?: string;
    instructor?: {
        name: string;
        avatar: string;
    };
}

const props = defineProps({
    bookings: {
        type: Array as PropType<ExtendedBooking[]>,
        required: true
    }
});

const emit = defineEmits(['cancel-booking']);
const toast = useToast();

// 列表視圖
const viewMode = ref('list');
const showDetailDialog = ref(false);
const showCancelDialog = ref(false);
const showCalendarSyncDialog = ref(false);
const showMapDialog = ref(false);
const selectedBookingId = ref<number | null>(null);
const selectedBooking = ref<ExtendedBooking | null>(null);

// 過濾條件
const filter = ref({
    status: ''
});

// 狀態選項
const statusOptions = [
    { label: '全部', value: '' },
    { label: '已確認', value: BookingStatus.Confirmed },
    { label: '已取消', value: BookingStatus.Canceled },
    { label: '待處理', value: BookingStatus.Pending }
];

// 過濾後的預約
const filteredBookings = computed(() => {
    let result = [...props.bookings];
    
    // 狀態過濾
    if (filter.value.status) {
        result = result.filter(booking => booking.status === filter.value.status);
    }
    
    return result;
});

// 即將到來的預約（最近7天）
const upcomingBookings = computed(() => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    return props.bookings.filter(booking => {
        if (booking.status !== BookingStatus.Confirmed) return false;
        
        // createdAt 先前是 Date 類型
        return booking.createdAt >= now && booking.createdAt <= sevenDaysLater;
    }).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
});

// 日曆事件 - 需要根據新的接口調整
const events = computed(() =>
    filteredBookings.value.map((booking: ExtendedBooking) => ({
        id: booking.id.toString(),
        title: booking.courseTitle || `u9810u7ea6 #${booking.id}`,
        start: booking.createdAt, // createdAtu5df2u7ecfu662fDateu7c7bu578b
        extendedProps: {
            location: booking.merchantName || booking.location || 'u672au6307u5b9a',
            status: booking.status
        },
        classNames: getEventClassNames(booking.status)
    }))
);

// 日曆配置
const calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: events.value,
    headerToolbar: {
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: (info: EventClickArg) => {
        const bookingId = parseInt(info.event.id);
        const booking = props.bookings.find(b => b.id === bookingId);
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
    locale: 'zh-tw',
};

// 獲取日曆事件樣式
function getEventClassNames(status: BookingStatus): string[] {
    switch (status) {
        case BookingStatus.Confirmed:
            return ['bg-blue-100', 'border-blue-500', 'text-blue-800'];
        case BookingStatus.Canceled:
            return ['bg-gray-100', 'border-gray-500', 'text-gray-800'];
        case BookingStatus.Pending:
            return ['bg-yellow-100', 'border-yellow-500', 'text-yellow-800'];
        default:
            return [];
    }
}

// 獲取狀態標籤
function getStatusLabel(status: BookingStatus): string {
    return BookingStatusLabel[status] || status;
}

// 獲取狀態嚴重性
function getStatusSeverity(status: BookingStatus): string {
    switch (status) {
        case BookingStatus.Confirmed:
            return 'success';
        case BookingStatus.Canceled:
            return 'danger';
        case BookingStatus.Pending:
            return 'warning';
        default:
            return 'info';
    }
}

// 獲取即將到來的預約邊框顏色
function getUpcomingBorderClass(booking: ExtendedBooking): string {
    const daysLeft = getDaysLeft(booking.createdAt); // createdAtu5df2u7ecfu662fDateu7c7bu578b
    
    if (daysLeft <= 1) return 'border-red-500';
    if (daysLeft <= 3) return 'border-orange-500';
    return 'border-green-500';
}

// 獲取剩餘時間標籤
function getTimeLeftLabel(date: Date, time: string): string {
    const daysLeft = getDaysLeft(date);
    
    if (daysLeft === 0) return 'u4f15u5929';
    if (daysLeft === 1) return 'u660eu5929';
    return `${daysLeft} u5929u5f6c`;
}

// 獲取剩餘時間嚴重性
function getTimeLeftSeverity(date: Date, time: string): string {
    const daysLeft = getDaysLeft(date);
    
    if (daysLeft <= 1) return 'danger';
    if (daysLeft <= 3) return 'warning';
    return 'success';
}

// 計算剩餘天數
function getDaysLeft(date: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    const diffTime = bookingDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 是否可以取消預約
function canCancel(booking: ExtendedBooking): boolean {
    return booking.status === BookingStatus.Confirmed;
}

// 查看預約詳情
function viewBookingDetail(booking: ExtendedBooking): void {
    selectedBooking.value = booking;
    showDetailDialog.value = true;
}

// 查看地點地圖
function showLocationMap(booking: ExtendedBooking): void {
    selectedBooking.value = booking;
    showMapDialog.value = true;
}

// 確認取消預約
function confirmCancelBooking(bookingId: number): void {
    selectedBookingId.value = bookingId;
    showCancelDialog.value = true;
}

// 確認取消選中的預約
function confirmCancelSelectedBooking(): void {
    if (selectedBooking.value) {
        selectedBookingId.value = selectedBooking.value.id;
        showDetailDialog.value = false;
        showCancelDialog.value = true;
    }
}

// 取消預約
function cancelBooking(): void {
    if (selectedBookingId.value) {
        emit('cancel-booking', selectedBookingId.value);
        showCancelDialog.value = false;
        
        // 顯示取消成功提示
        toast.add({
            severity: 'success',
            summary: '取消成功',
            detail: '預約已取消',
            life: 3000
        });
    }   
}

// 同步至行事曆
function syncToCalendar(platform: string): void {
    // 顯示同步中提示
    toast.add({
        severity: 'info',
        summary: '指定',
        detail: `指定到 ${platform} 行事曆...`,
        life: 2000
    });
    
    setTimeout(() => {
        toast.add({
            severity: 'success',
            summary: '已同步',
            detail: `已同步到 ${platform} 行事曆`,
            life: 3000
        });
        showCalendarSyncDialog.value = false;
    }, 1500);
}

// 下載 .ics 檔案
function downloadIcsFile(): void {
    // 顯示處理中提示
    toast.add({
        severity: 'info',
        summary: '處理中',
        detail: '正在生成行事曆文件...',
        life: 2000
    });
    
    setTimeout(() => {
        toast.add({
            severity: 'success',
            summary: '成功',
            detail: '行事曆文件已生成，正在下載...',
            life: 3000
        });
        showCalendarSyncDialog.value = false;
    }, 1500);
}

// 加入行事曆
function addToCalendar(): void {
    showCalendarSyncDialog.value = true;
}

// 打開導航
function openNavigation(): void {
    if (selectedBooking.value) {
        // 模擬打開導航
        toast.add({
            severity: 'info',
            summary: '導航',
            detail: `正在導航至 ${selectedBooking.value.location}`,
            life: 3000
        });
        showMapDialog.value = false;
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
    @apply bg-white border border-gray-100;
}

:deep(a.fc-event) {
    @apply rounded-md p-2 overflow-hidden;
}

:deep(.fc-event):hover {
    @apply bg-blue-200;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}
</style>