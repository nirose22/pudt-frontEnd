<template>
  <div>
    <!-- 頂部操作區 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <!-- 搜尋和篩選 -->
      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.search" placeholder="搜尋客戶或課程..." />
        </IconField>

        <!-- 日期範圍篩選 -->
        <DateRangeFilter v-model="filters.dateRange" class="w-full sm:w-auto" />

        <!-- 狀態篩選 -->
        <MultiSelect v-model="filters.status" :options="STATUS_OPTIONS" optionLabel="label" optionValue="value"
          placeholder="預約狀態" class="w-full sm:w-auto" display="chip" />
      </div>

      <!-- 視圖切換 -->
      <div class="flex gap-2">
        <Button icon="pi pi-calendar" :class="{ 'p-button-outlined': view !== 'calendar' }"
          @click="view = 'calendar'" />
        <Button icon="pi pi-list" :class="{ 'p-button-outlined': view !== 'list' }" @click="view = 'list'" />
      </div>
    </div>

    <!-- 日曆視圖 -->
    <Card v-if="view === 'calendar'" class="mb-6">
      <template #content>
        <FullCalendar :options="calendarOptions" />
      </template>
    </Card>

    <!-- 列表視圖 -->
    <Card v-else>
      <template #content>
        <DataTable :value="filteredBookings" v-model:selection="selectedBookings" :paginator="true" :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :loading="loading" stripedRows responsiveLayout="stack" breakpoint="960px"
          :globalFilterFields="['customerName', 'courseTitle', 'date', 'status']">

          <!-- 表頭 -->
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="m-0">預約列表</h3>
              <div class="flex gap-2">
                <Button icon="pi pi-refresh" @click="loadBookings" text rounded />
                <Button icon="pi pi-download" text rounded tooltip="匯出資料" tooltipOptions="{ position: 'left' }" />
              </div>
            </div>
          </template>

          <!-- 客戶姓名 -->
          <Column field="customerName" header="客戶姓名" sortable>
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <Avatar :label="getInitials(slotProps.data.customerName)" shape="circle"
                  class="bg-blue-100 text-blue-600" />
                <div>
                  <div class="font-medium">{{ slotProps.data.customerName }}</div>
                  <div class="text-xs text-gray-500">{{ slotProps.data.customerPhone }}</div>
                </div>
              </div>
            </template>
          </Column>

          <!-- 課程名稱 -->
          <Column field="courseTitle" header="課程名稱" sortable>
            <template #body="slotProps">
              <div class="font-medium">{{ slotProps.data.courseTitle }}</div>
              <div class="text-xs text-gray-500">ID: {{ slotProps.data.courseId }}</div>
            </template>
          </Column>

          <!-- 預約日期 -->
          <Column field="date" header="預約日期" sortable>
            <template #body="slotProps">
              <div>{{ formatDate(slotProps.data.date) }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(slotProps.data.start) }} - {{
                formatTime(slotProps.data.end) }}</div>
            </template>
          </Column>

          <!-- 點數 -->
          <Column field="points" header="點數" sortable style="width: 100px">
            <template #body="slotProps">
              <div class="text-center font-medium">{{ slotProps.data.points }}</div>
            </template>
          </Column>

          <!-- 狀態 -->
          <Column field="status" header="狀態" sortable style="width: 120px">
            <template #body="slotProps">
              <Tag :severity="getStatusSeverity(slotProps.data.status)"
                :value="getStatusLabel(slotProps.data.status)" />
            </template>
          </Column>

          <!-- 操作按鈕 -->
          <Column header="操作" style="width: 150px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" text rounded @click="viewBookingDetail(slotProps.data)" />
                <Button v-if="slotProps.data.status === BookingStatus.Pending"
                  icon="pi pi-check" text rounded severity="success" @click="updateBookingStatus(slotProps.data, BookingStatus.Confirmed)" />
                <Button v-if="[BookingStatus.Pending, BookingStatus.Confirmed].includes(slotProps.data.status)"
                  icon="pi pi-times" text rounded severity="danger" @click="updateBookingStatus(slotProps.data, BookingStatus.Cancelled)" />
                <Button v-if="slotProps.data.status === BookingStatus.Confirmed"
                  icon="pi pi-check-circle" text rounded severity="info" @click="updateBookingStatus(slotProps.data, BookingStatus.Completed)" />
              </div>
            </template>
          </Column>

          <!-- 無數據時顯示 -->
          <template #empty>
            <div class="text-center p-4">
              <i class="pi pi-calendar-times text-4xl text-gray-300 mb-3"></i>
              <p>未找到符合條件的預約</p>
              <p class="text-sm text-gray-500 mt-2">嘗試調整篩選條件或清除搜尋</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- 確認對話框 -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import type { MerchantBookingDetail } from '@/types/booking';
import { BookingStatus } from '@/enums/BookingStatus';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getBookingStatusLabel, getBookingStatusSeverity, getBookingStatusColor } from '@/utils/statusUtils';
import { useMerchantBookingStore } from '@/stores/merchantBookingStore';

// 組件引入
import {
    DataTable, Column, Button, InputText, MultiSelect,
    Tag, Avatar, Card, ConfirmDialog, IconField, InputIcon
} from 'primevue';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarOptions } from '@fullcalendar/core';

const router = useRouter();
const merchantBookingStore = useMerchantBookingStore();

// 狀態
const view = ref<'calendar' | 'list'>('list');
const selectedBookings = ref<MerchantBookingDetail[]>([]);
const loading = ref(false);

// 常量
const STATUS_OPTIONS = [
    { label: '待確認', value: BookingStatus.Pending },
    { label: '已確認', value: BookingStatus.Confirmed },
    { label: '已完成', value: BookingStatus.Completed },
    { label: '已取消', value: BookingStatus.Cancelled },
    { label: '未出席', value: BookingStatus.NoShow }
];

// 篩選條件
const filters = ref({
    search: '',
    dateRange: {
        start: null as Date | null,
        end: null as Date | null
    },
    status: [] as BookingStatus[]
});

// 計算屬性
const filteredBookings = computed(() => {
    let result = merchantBookingStore.bookings;

    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        result = result.filter(booking =>
            booking.customerName?.toLowerCase().includes(searchLower) ||
            booking.courseTitle?.toLowerCase().includes(searchLower)
        );
    }

    if (filters.value.dateRange.start && filters.value.dateRange.end) {
        const { start, end } = filters.value.dateRange;
        result = result.filter(booking => {
            const bookingDate = new Date(booking.date).getTime();
            return bookingDate >= start.getTime() && bookingDate <= end.getTime();
        });
    }

    if (filters.value.status.length > 0) {
        result = result.filter(booking => filters.value.status.includes(booking.status));
    }

    return result;
});

const calendarEvents = computed(() => 
    filteredBookings.value.map(booking => ({
        id: booking.id.toString(),
        title: `${booking.courseTitle} - ${booking.customerName || ''}`,
        start: new Date(booking.date + 'T' + booking.start),
        end: new Date(booking.date + 'T' + booking.end),
        extendedProps: { booking },
        backgroundColor: getBookingStatusColor(booking.status)
    }))
);

const calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: calendarEvents.value,
    eventClick: (info) => viewBookingDetail(info.event.extendedProps.booking),
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    },
    locale: 'zh-tw'
}));

// 方法
const getInitials = (name: string): string => name.charAt(0).toUpperCase();

const loadBookings = async (): Promise<void> => {
    loading.value = true;
    try {
        await merchantBookingStore.loadBookings();
    } finally {
        loading.value = false;
    }
};

const viewBookingDetail = (booking: MerchantBookingDetail): void => {
    router.push(`/merchant/bookings/${booking.id}`);
};

const updateBookingStatus = async (booking: MerchantBookingDetail, status: BookingStatus): Promise<void> => {
    try {
        await merchantBookingStore.updateBookingStatus(booking.id, status);
    } catch (error) {
        console.error(`更新預約狀態失敗: ${status}`, error);
    }
};

// 生命週期
onMounted(loadBookings);

// 添加状态相关的工具函数
function getStatusLabel(status: string): string {
  return getBookingStatusLabel(status);
}

function getStatusSeverity(status: string): string {
  return getBookingStatusSeverity(status);
}
</script>