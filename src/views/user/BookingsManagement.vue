<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">預約行程管理</h2>
    
    <!-- 視圖切換按鈕 -->
    <div class="flex justify-end mb-4">
      <div class="p-buttonset">
        <Button :class="{ 'p-button-outlined': viewMode !== 'list' }" icon="pi pi-list" @click="viewMode = 'list'" />
        <Button :class="{ 'p-button-outlined': viewMode !== 'calendar' }" icon="pi pi-calendar" @click="viewMode = 'calendar'" />
        <Button :class="{ 'p-button-outlined': viewMode !== 'schedule' }" icon="pi pi-clock" @click="openScheduleBar" />
      </div>
    </div>
    
    <!-- 列表視圖 -->
    <div v-if="viewMode === 'list'">
      <DataTable :value="bookings" stripedRows responsiveLayout="scroll" class="mb-6">
        <Column field="courseTitle" header="課程名稱" />
        <Column field="date" header="日期">
          <template #body="{ data }">
            {{ formatDate(data.date) }}
          </template>
        </Column>
        <Column field="time" header="時間" />
        <Column field="location" header="地點" />
        <Column header="操作">
          <template #body="{ data }">
            <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text" 
                  @click="confirmCancelBooking(data.id)" />
          </template>
        </Column>
      </DataTable>
      
      <div v-if="bookings.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
        <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-500">您目前沒有任何預約</p>
      </div>
    </div>
    
    <!-- 日曆視圖 -->
    <div v-else-if="viewMode === 'calendar'" class="p-4 border rounded-lg">
      <FullCalendar :options="calendarOptions" />
    </div>
    
    <!-- 取消預約確認對話框 -->
    <Dialog v-model:visible="showCancelDialog" header="取消預約" :style="{ width: '450px' }">
      <div class="p-4">
        <p>您確定要取消這個預約嗎？取消可能會影響您的上課權益。</p>
      </div>
      <template #footer>
        <Button label="取消" class="p-button-text" @click="showCancelDialog = false" />
        <Button label="確認取消預約" class="p-button-danger" @click="cancelBooking" />
      </template>
    </Dialog>

    <!-- 日程表組件 -->
    <ScheduleBar ref="scheduleBarRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
// 注意：需要安裝 @fullcalendar/vue3 和相關依賴
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// 導入 ScheduleBar 組件
import ScheduleBar from '@/components/layout/ScheduleBar.vue';
// 導入 bookingStore
import { useBookingStore } from '@/stores/bookingStore';

const props = defineProps({
  bookings: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['cancel-booking']);

const viewMode = ref('list');
const showCancelDialog = ref(false);
const selectedBookingId = ref(null);
const scheduleBarRef = ref(null);

// 使用 bookingStore
const bookingStore = useBookingStore();

// 初始化
onMounted(() => {
  // 這裡可以加載 bookingStore 中的數據
  // bookingStore.fetchUserBookings(userId);
});

// 打開日程表側邊欄
const openScheduleBar = () => {
  scheduleBarRef.value.openScheduleBar();
};

// 日曆事件
const calendarEvents = computed(() => {
  return props.bookings.map(booking => ({
    id: booking.id.toString(),
    title: booking.courseTitle,
    start: `${booking.date}T${booking.time.split('-')[0]}:00`,
    end: `${booking.date}T${booking.time.split('-')[1]}:00`,
    extendedProps: {
      location: booking.location
    }
  }));
});

// 日曆配置
const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: calendarEvents.value,
  eventClick: (info) => {
    selectedBookingId.value = parseInt(info.event.id);
    showCancelDialog.value = true;
  },
  eventContent: (arg) => {
    return {
      html: `
        <div class="fc-content p-2">
          <div class="fc-title font-bold">${arg.event.title}</div>
          <div class="text-xs">${arg.event.extendedProps.location}</div>
        </div>
      `
    };
  },
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  locale: 'zh-tw'
};

const confirmCancelBooking = (bookingId) => {
  selectedBookingId.value = bookingId;
  showCancelDialog.value = true;
};

const cancelBooking = async () => {
  // 使用 bookingStore 取消預約
  const result = await bookingStore.cancelBooking(selectedBookingId.value);
  if (result.success) {
    emit('cancel-booking', selectedBookingId.value);
  }
  showCancelDialog.value = false;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
};
</script>
