<template>
    <div class="flex flex-col flex-1 overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 text-sky-700 flex items-center">
            <i class="pi pi-calendar-plus mr-2"></i>預約行程管理
        </h2>

        <!-- 即將到來的預約 -->
        <div v-if="upcomingBookings.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-sky-700 flex items-center">
                <i class="pi pi-clock mr-2"></i>即將到來的預約
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="booking in upcomingBookings" :key="booking.id" 
                    class="card p-4 shadow-sm rounded-lg border-l-4 border border-sky-100 hover:shadow-md transition-shadow"
                    :class="getUpcomingBorderClass(booking)">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-medium text-lg text-sky-700">{{ booking.courseTitle }}</h4>
                            <div class="text-sm text-gray-500 mt-1">{{ formatDateString(booking.createdAt.toISOString()) }} {{ booking.time }}</div>
                            <div class="text-sm text-gray-500">{{ booking.merchantName || booking.location }}</div>
                        </div>
                        <Tag :value="getTimeLeftLabel(booking.createdAt, booking.time || '')" 
                            :severity="getTimeLeftSeverity(booking.createdAt, booking.time || '')" />
                    </div>
                    <div class="mt-3 flex justify-end gap-2">
                        <Button icon="pi pi-map-marker" text rounded aria-label="查看地圖" 
                            @click="showLocationMap(booking)" class="text-sky-500 hover:bg-sky-50" />
                        <Button icon="pi pi-eye" text rounded aria-label="查看詳情" 
                            @click="viewBookingDetail(booking)" class="text-sky-500 hover:bg-sky-50" />
                        <Button icon="pi pi-times" text rounded aria-label="取消預約"
                            @click="confirmCancelBooking(booking.id)" class="text-red-500 hover:bg-red-50" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 視圖切換按鈕 -->
        <div class="flex justify-between items-center mb-4">
            <ButtonGroup class="h-10">
                <Button :class="{ 'p-button-outlined !border-sky-500 !text-sky-500': viewMode !== 'list', '!bg-sky-500 !border-sky-500': viewMode === 'list' }" 
                    icon="pi pi-list" label="列表" @click="viewMode = 'list'" 
                    v-tooltip.top="'切換至列表視圖'" />
                <Button :class="{ 'p-button-outlined !border-sky-500 !text-sky-500': viewMode !== 'calendar', '!bg-sky-500 !border-sky-500': viewMode === 'calendar' }" 
                    icon="pi pi-calendar" label="日曆" @click="viewMode = 'calendar'" 
                    v-tooltip.top="'切換至日曆視圖'" />
            </ButtonGroup>
            
            <div class="flex gap-2">
                <Button icon="pi pi-sync" label="同步至行事曆" outlined 
                    @click="showCalendarSyncDialog = true" class="!border-sky-500 !text-sky-500 hover:!bg-sky-50" 
                    v-tooltip.left="'將預約同步到您的行事曆'" />
                <Select v-model="filter.status" :options="statusOptions" optionLabel="label" optionValue="value" 
                    placeholder="狀態" class="border-sky-200 focus:border-sky-500" />
            </div>
        </div>

        <!-- 列表視圖 -->
        <div v-if="viewMode === 'list'" class="flex flex-col flex-1 overflow-hidden">
            <DataTable :value="filteredBookings" stripedRows responsiveLayout="stack" paginator :rows="10" 
                class="p-datatable-sm" emptyMessage="無預約記錄">
                <Column field="courseTitle" header="課程名稱" headerClass="bg-sky-50 text-sky-700" />
                <Column field="createdAt" header="日期" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        {{ formatDateString(data.createdAt.toISOString()) }}
                    </template>
                </Column>
                <Column field="time" header="時間" headerClass="bg-sky-50 text-sky-700" />
                <Column field="location" header="地點" headerClass="bg-sky-50 text-sky-700" />
                <Column field="instructor.name" header="講師" headerClass="bg-sky-50 text-sky-700" />
                <Column field="status" header="狀態" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
                    </template>
                </Column>
                <Column header="操作" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="flex gap-1">
                            <Button icon="pi pi-eye" text rounded aria-label="查看詳情" 
                                @click="viewBookingDetail(data)" class="text-sky-500 hover:bg-sky-50" />
                            <Button v-if="canCancel(data)" icon="pi pi-times" text rounded aria-label="取消預約"
                                @click="confirmCancelBooking(data.id)" class="text-red-500 hover:bg-red-50" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            <div v-if="filteredBookings.length === 0" class="content-center block text-center p-6 bg-sky-50 flex-1 rounded-lg border border-sky-100">
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
        <Dialog v-model:visible="showDetailDialog" :header="selectedBooking?.courseTitle || '預約詳情'" 
            :modal="true" :closable="true" :style="{ width: '500px' }" 
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div v-if="selectedBooking" class="space-y-4">
                <div class="p-3 border rounded-lg bg-white border-sky-100">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">課程名稱：</span>
                        <span class="font-medium text-sky-700">{{ selectedBooking.courseTitle }}</span>
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
                        <span class="font-bold text-sky-600">{{ selectedBooking.points }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">狀態：</span>
                        <Tag :severity="getStatusSeverity(selectedBooking.status)" :value="getStatusLabel(selectedBooking.status)" />
                    </div>
                </div>
                
                <!-- 講師資訊 -->
                <div v-if="selectedBooking.instructor" class="p-3 border rounded-lg border-sky-100 bg-white">
                    <h3 class="font-medium mb-2 text-sky-700">講師資訊</h3>
                    <div class="flex items-center gap-3">
                        <Avatar :label="selectedBooking.instructor.name.charAt(0)" 
                            shape="circle" size="large" class="!bg-sky-100 !text-sky-700" />
                        <div>
                            <div class="font-medium">{{ selectedBooking.instructor.name }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 地圖 -->
                <div v-if="selectedBooking.location" class="p-3 border rounded-lg border-sky-100 bg-white">
                    <h3 class="font-medium mb-2 text-sky-700">上課地點</h3>
                    <div class="h-40 bg-sky-50 flex items-center justify-center border border-sky-100 rounded-lg">
                        <i class="pi pi-map-marker text-4xl text-sky-300"></i>
                        <span class="ml-2 text-sky-600">{{ selectedBooking.location }}</span>
                    </div>
                    <div class="mt-2 text-sm text-gray-500">
                        請提前 15 分鐘到達上課地點
                    </div>
                </div>
                
                <!-- 注意事項 -->
                <div class="p-3 border rounded-lg bg-sky-50 border-sky-100">
                    <h3 class="font-medium mb-2 flex items-center text-sky-700">
                        <i class="pi pi-info-circle mr-2 text-sky-500"></i>
                        課程注意事項
                    </h3>
                    <ul class="list-disc pl-5 text-sm text-gray-600">
                        <li>請提前 15 分鐘到達教室</li>
                        <li>請攜帶個人用品（如瑜珈墊、毛巾等）</li>
                        <li>如需取消預約，請至少提前 24 小時</li>
                        <li>遲到超過 15 分鐘將無法參與課程</li>
                    </ul>
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" 
                    outlined class="!border-gray-300 !text-gray-700" />
                <Button v-if="selectedBooking && canCancel(selectedBooking)" label="取消預約" icon="pi pi-times" 
                    severity="danger" @click="confirmCancelSelectedBooking" />
                <Button label="加入行事曆" icon="pi pi-calendar-plus" @click="addToCalendar" 
                    class="!bg-sky-500 !border-sky-500" />
            </template>
        </Dialog>
        
        <!-- 取消預約確認對話框 -->
        <Dialog v-model:visible="showCancelDialog" header="取消預約" :style="{ width: '450px' }"
            :contentStyle="{ 'background-color': '#f8fafc' }">
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
                <Button label="確認取消預約" icon="pi pi-check" severity="danger" @click="cancelBooking()" />
            </template>
        </Dialog>
        
        <!-- 行事曆同步對話框 -->
        <Dialog v-model:visible="showCalendarSyncDialog" header="同步至行事曆" :style="{ width: '450px' }"
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="p-4">
                <p class="mb-4">選擇您要同步的行事曆平台：</p>
                <div class="grid grid-cols-1 gap-3">
                    <Button label="Google 行事曆" icon="pi pi-google" 
                        class="p-button-raised !bg-sky-500 !border-sky-500" @click="syncToCalendar('google')" />
                    <Button label="Apple 行事曆" icon="pi pi-apple" 
                        class="p-button-raised !bg-sky-600 !border-sky-600" @click="syncToCalendar('apple')" />
                    <Button label="Outlook 行事曆" icon="pi pi-microsoft" 
                        class="p-button-raised !bg-sky-700 !border-sky-700" @click="syncToCalendar('outlook')" />
                    <Button label="下載 .ics 檔案" icon="pi pi-download" 
                        class="p-button-raised !bg-gray-600 !border-gray-600" @click="downloadIcsFile()" />
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showCalendarSyncDialog = false" 
                    outlined class="!border-gray-300 !text-gray-700" />
            </template>
        </Dialog>
        
        <!-- 地點地圖對話框 -->
        <Dialog v-model:visible="showMapDialog" header="課程地點" :style="{ width: '600px' }"
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="p-4">
                <div class="h-64 bg-sky-50 flex items-center justify-center mb-3 border border-sky-100 rounded-lg">
                    <i class="pi pi-map-marker text-4xl text-sky-300"></i>
                    <span class="ml-2 text-sky-600">{{ selectedBooking?.location }}</span>
                </div>
                <div class="text-sm">
                    <p class="font-medium text-sky-700">{{ selectedBooking?.location }}</p>
                    <p class="text-gray-600 mt-1">課程將於 {{ formatDateString((selectedBooking?.createdAt || new Date()).toISOString()) }} {{ selectedBooking?.time }} 開始</p>
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showMapDialog = false" 
                    outlined class="!border-gray-300 !text-gray-700" />
                <Button label="導航" icon="pi pi-directions" @click="openNavigation" 
                    class="!bg-sky-500 !border-sky-500" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import ButtonGroup from 'primevue/buttongroup';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useToast } from 'primevue/usetoast';
import { BookingStatus } from '@/enums/BookingStatus';
import { formatDateString } from '@/utils/dateUtils';
import type { CalendarOptions, EventClickArg  } from '@fullcalendar/core';
import type { Booking } from '@/types/booking';

// 定义inject数据接口
interface BookingsDataInject {
    bookings: { value: Booking[] };
    cancelBooking: (id: number) => Promise<any>;
}

// 使用inject获取数据
const bookingsData = inject<BookingsDataInject>('bookingsData');
const bookings = computed(() => bookingsData?.bookings.value || []);
const cancelBookingFn = bookingsData?.cancelBooking;

const toast = useToast();

// 视图模式
const viewMode = ref('list');
const showDetailDialog = ref(false);
const showCancelDialog = ref(false);
const showCalendarSyncDialog = ref(false);
const showMapDialog = ref(false);
const selectedBookingId = ref<number | null>(null);
const selectedBooking = ref<Booking | null>(null);
const loading = ref(false);

// 确认是否是即将到来的预约
const isUpcoming = (date: Date, time: string): boolean => {
    const now = new Date();
    const bookingDate = new Date(date);
    
    // 设置时分秒
    if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        bookingDate.setHours(hours || 0, minutes || 0, 0, 0);
    }
    
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    return bookingDate >= now && bookingDate <= sevenDaysLater;
};

// 即将到来的预约
const upcomingBookings = computed(() => {
    return bookings.value
        .filter(b => isUpcoming(b.createdAt, b.time || ''))
        .slice(0, 3);
});

// 状态选项
const statusOptions = [
    { label: '全部', value: '' },
    { label: '已确认', value: BookingStatus.Confirmed.toString() },
    { label: '已取消', value: BookingStatus.Canceled.toString() },
    { label: '待处理', value: BookingStatus.Pending.toString() }
];

// 过滤条件
const filter = ref({
    status: ''
});

// 过滤后的预约
const filteredBookings = computed(() => {
    let result = [...bookings.value];
    
    // 状态过滤
    if (filter.value.status) {
        result = result.filter(booking => booking.status.toString() === filter.value.status);
    }
    
    return result;
});

// 日历事件 - 需要根据新的接口调整
const events = computed(() =>
    filteredBookings.value.map((booking: Booking) => ({
        id: booking.id.toString(),
        title: booking.courseTitle || `预约 #${booking.id}`,
        start: booking.createdAt,
        extendedProps: {
            location: booking.merchantName || booking.location || '未指定',
            status: booking.status
        },
        classNames: getEventClassNames(booking.status)
    }))
);

// 日历配置
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
    locale: 'zh-tw',
};

// 获取日历事件样式
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

// 获取状态标签
const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Pending:
            return '待确认';
        case BookingStatus.Confirmed:
            return '已确认';
        case BookingStatus.Completed:
            return '已完成';
        case BookingStatus.Canceled:
            return '已取消';
        default:
            return '未知状态';
    }
};

// 获取状态严重性
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

// 获取即将到来的预约边框颜色
function getUpcomingBorderClass(booking: Booking): string {
    const daysLeft = getDaysLeft(booking.createdAt); // createdAtu5df2u7ecfu662fDateu7c7bu578b
    
    if (daysLeft <= 1) return 'border-red-500';
    if (daysLeft <= 3) return 'border-orange-500';
    return 'border-green-500';
}

// 获取剩余时间标签
function getTimeLeftLabel(date: Date, time: string): string {
    const daysLeft = getDaysLeft(date);
    
    if (daysLeft === 0) return 'u4f15u5929';
    if (daysLeft === 1) return 'u660eu5929';
    return `${daysLeft} u5929u5f6c`;
}

// 获取剩余时间严重性
function getTimeLeftSeverity(date: Date, time: string): string {
    const daysLeft = getDaysLeft(date);
    
    if (daysLeft <= 1) return 'danger';
    if (daysLeft <= 3) return 'warning';
    return 'success';
}

// 计算剩余天数
function getDaysLeft(date: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    const diffTime = bookingDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 是否可以取消预约
const canCancel = (booking: Booking) => {
    return booking.status === BookingStatus.Pending || 
           booking.status === BookingStatus.Confirmed;
};

// 查看预约详情
function viewBookingDetail(booking: Booking): void {
    selectedBooking.value = booking;
    showDetailDialog.value = true;
}

// 查看地点地图
function showLocationMap(booking: Booking): void {
    selectedBooking.value = booking;
    showMapDialog.value = true;
}

// 确认取消预约
function confirmCancelBooking(bookingId: number): void {
    selectedBookingId.value = bookingId;
    showCancelDialog.value = true;
}

// 确认取消选中的预约
function confirmCancelSelectedBooking(): void {
    if (selectedBooking.value) {
        selectedBookingId.value = selectedBooking.value.id;
        showDetailDialog.value = false;
        showCancelDialog.value = true;
    }
}

// 取消预约
const cancelBooking = async () => {
    if (!selectedBookingId.value || !cancelBookingFn) return;
    
    try {
        await cancelBookingFn(selectedBookingId.value);
        showCancelDialog.value = false;
        selectedBookingId.value = null;
        
        // 可以加入成功提示
        toast.add({ severity: 'success', summary: '成功', detail: '預約已取消', life: 3000 });
    } catch (error) {
        console.error('取消預約失败', error);
        toast.add({ severity: 'error', summary: '错误', detail: '取消預約失败', life: 3000 });
    }
};

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
    @apply bg-white;
}

:deep(a.fc-event) {
    @apply rounded-md p-2 overflow-hidden;
}

:deep(.fc-event):hover {
    @apply bg-sky-200;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-tbody > tr:hover) {
    @apply bg-sky-50/50;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-paginator) {
    @apply border-t border-sky-100 bg-white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    @apply bg-sky-500 text-white;
}

:deep(.p-dialog-header) {
    @apply bg-sky-50 text-sky-700;
}

:deep(.p-dialog-footer) {
    @apply bg-gray-50;
}

:deep(.p-button.p-button-outlined) {
    @apply border-sky-500 text-sky-500;
}

:deep(.p-button.p-button-outlined:hover) {
    @apply bg-sky-50;
}

:deep(.fc .fc-button-primary) {
    @apply bg-sky-500 border-sky-500;
}

:deep(.fc .fc-button-primary:hover) {
    @apply bg-sky-600 border-sky-600;
}

:deep(.fc .fc-button-primary.fc-button-active) {
    @apply bg-sky-700 border-sky-700;
}

:deep(.fc .fc-button-primary:disabled) {
    @apply bg-sky-300 border-sky-300;
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

:deep(.fc-event.bg-blue-100) {
    @apply bg-sky-100 border-sky-500;
}
</style>