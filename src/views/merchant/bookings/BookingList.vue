<template>
  <div>
    <!-- 頂部操作區 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <!-- 搜尋和篩選 -->
      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <span class="p-input-icon-left w-full sm:w-auto">
          <i class="pi pi-search" />
          <InputText v-model="filters.search" placeholder="搜尋客戶或課程..." class="w-full" />
        </span>
        
        <!-- 日期範圍篩選 -->
        <DateRangeFilter v-model="filters.dateRange" class="w-full sm:w-auto" />
        
        <!-- 狀態篩選 -->
        <MultiSelect v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value"
          placeholder="預約狀態" class="w-full sm:w-auto" display="chip" />
      </div>
      
      <!-- 視圖切換 -->
      <div class="flex gap-2">
        <Button icon="pi pi-calendar" :class="{ 'p-button-outlined': view !== 'calendar' }" @click="view = 'calendar'" />
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
        <DataTable :value="filteredBookings" v-model:selection="selectedBookings" 
          :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20]"
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
                <Avatar :label="getInitials(slotProps.data.customerName)" shape="circle" class="bg-blue-100 text-blue-600" />
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
              <div class="text-xs text-gray-500">{{ formatTime(slotProps.data.startTime) }} - {{ formatTime(slotProps.data.endTime) }}</div>
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
              <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="getStatusLabel(slotProps.data.status)" />
            </template>
          </Column>
          
          <!-- 操作按鈕 -->
          <Column header="操作" style="width: 150px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" text rounded @click="viewBookingDetail(slotProps.data)" />
                <Button icon="pi pi-check" text rounded severity="success" @click="confirmBooking(slotProps.data)"
                  v-if="slotProps.data.status === 'pending'" />
                <Button icon="pi pi-times" text rounded severity="danger" @click="cancelBooking(slotProps.data)"
                  v-if="['pending', 'confirmed'].includes(slotProps.data.status)" />
                <Button icon="pi pi-check-circle" text rounded severity="info" @click="completeBooking(slotProps.data)"
                  v-if="slotProps.data.status === 'confirmed'" />
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
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Card from 'primevue/card';
import ConfirmDialog from 'primevue/confirmdialog';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// 預約數據類型
interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  courseId: number;
  courseTitle: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  points: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';
}

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// 視圖類型
const view = ref<'calendar' | 'list'>('list');

// 篩選條件
const filters = ref({
  search: '',
  dateRange: {
    start: null as Date | null,
    end: null as Date | null
  },
  status: [] as string[]
});

// 狀態選項
const statusOptions = [
  { label: '待確認', value: 'pending' },
  { label: '已確認', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '未出席', value: 'noshow' }
];

// 預約數據
const bookings = ref<Booking[]>([]);
const selectedBookings = ref<Booking[]>([]);
const loading = ref(false);

// 根據篩選條件過濾預約
const filteredBookings = computed(() => {
  let result = [...bookings.value];
  
  // 搜尋過濾
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(booking => 
      booking.customerName.toLowerCase().includes(searchLower) || 
      booking.courseTitle.toLowerCase().includes(searchLower)
    );
  }
  
  // 日期範圍過濾
  if (filters.value.dateRange.start && filters.value.dateRange.end) {
    result = result.filter(booking => {
      const bookingDate = booking.date.getTime();
      const startDate = filters.value.dateRange.start!.getTime();
      const endDate = filters.value.dateRange.end!.getTime();
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }
  
  // 狀態過濾
  if (filters.value.status.length > 0) {
    result = result.filter(booking => filters.value.status.includes(booking.status));
  }
  
  return result;
});

// 日曆視圖事件
const calendarEvents = computed(() => {
  return filteredBookings.value.map(booking => {
    const startTime = new Date(booking.date);
    startTime.setHours(booking.startTime.getHours(), booking.startTime.getMinutes());
    
    const endTime = new Date(booking.date);
    endTime.setHours(booking.endTime.getHours(), booking.endTime.getMinutes());
    
    return {
      id: booking.id.toString(),
      title: `${booking.courseTitle} - ${booking.customerName}`,
      start: startTime,
      end: endTime,
      extendedProps: {
        booking
      },
      backgroundColor: getStatusColor(booking.status)
    };
  });
});

// 日曆配置
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: calendarEvents.value,
  eventClick: (info: any) => {
    const booking = info.event.extendedProps.booking;
    viewBookingDetail(booking);
  },
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  locale: 'zh-tw'
}));

// 獲取狀態標籤
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待確認',
    'confirmed': '已確認',
    'completed': '已完成',
    'cancelled': '已取消',
    'noshow': '未出席'
  };
  return statusMap[status] || status;
}

// 獲取狀態嚴重性
function getStatusSeverity(status: string): string {
  const severityMap: Record<string, string> = {
    'pending': 'warning',
    'confirmed': 'success',
    'completed': 'info',
    'cancelled': 'secondary',
    'noshow': 'danger'
  };
  return severityMap[status] || 'info';
}

// 獲取狀態顏色 (用於日曆)
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'pending': '#F59E0B', // amber-500
    'confirmed': '#22C55E', // green-500
    'completed': '#3B82F6', // blue-500
    'cancelled': '#9CA3AF', // gray-400
    'noshow': '#EF4444' // red-500
  };
  return colorMap[status] || '#3B82F6';
}

// 獲取姓名縮寫
function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

// 格式化日期
function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// 格式化時間
function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 加載預約數據
async function loadBookings(): Promise<void> {
  loading.value = true;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模擬預約數據
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    bookings.value = [
      {
        id: 101,
        customerName: '張小明',
        customerPhone: '0912-345-678',
        courseId: 1,
        courseTitle: '瑜珈初階班',
        date: today,
        startTime: new Date(today.setHours(14, 0)),
        endTime: new Date(today.setHours(16, 0)),
        points: 25,
        status: 'pending'
      },
      {
        id: 102,
        customerName: '李小華',
        customerPhone: '0923-456-789',
        courseId: 2,
        courseTitle: '烹飪課程：義式料理',
        date: tomorrow,
        startTime: new Date(tomorrow.setHours(10, 0)),
        endTime: new Date(tomorrow.setHours(12, 0)),
        points: 30,
        status: 'confirmed'
      },
      {
        id: 103,
        customerName: '王大偉',
        customerPhone: '0934-567-890',
        courseId: 3,
        courseTitle: '水彩畫入門',
        date: dayAfterTomorrow,
        startTime: new Date(dayAfterTomorrow.setHours(15, 30)),
        endTime: new Date(dayAfterTomorrow.setHours(17, 30)),
        points: 20,
        status: 'completed'
      },
      {
        id: 104,
        customerName: '陳美玲',
        customerPhone: '0945-678-901',
        courseId: 1,
        courseTitle: '瑜珈初階班',
        date: yesterday,
        startTime: new Date(yesterday.setHours(14, 0)),
        endTime: new Date(yesterday.setHours(16, 0)),
        points: 25,
        status: 'cancelled'
      },
      {
        id: 105,
        customerName: '林志明',
        customerPhone: '0956-789-012',
        courseId: 2,
        courseTitle: '烹飪課程：義式料理',
        date: lastWeek,
        startTime: new Date(lastWeek.setHours(10, 0)),
        endTime: new Date(lastWeek.setHours(12, 0)),
        points: 30,
        status: 'noshow'
      }
    ];
  } catch (error) {
    console.error('加載預約失敗:', error);
    toast.add({
      severity: 'error',
      summary: '加載失敗',
      detail: '無法加載預約數據，請稍後再試',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

// 查看預約詳情
function viewBookingDetail(booking: Booking): void {
  router.push(`/merchant/bookings/${booking.id}`);
}

// 確認預約
function confirmBooking(booking: Booking): void {
  confirm.require({
    message: `確定要確認 ${booking.customerName} 的 "${booking.courseTitle}" 預約嗎？`,
    header: '確認預約',
    icon: 'pi pi-check-circle',
    acceptLabel: '確認',
    rejectLabel: '取消',
    accept: () => {
      // 實際應用中應該調用 API 確認預約
      booking.status = 'confirmed';
      
      toast.add({
        severity: 'success',
        summary: '預約已確認',
        detail: `${booking.customerName} 的預約已成功確認`,
        life: 3000
      });
    }
  });
}

// 取消預約
function cancelBooking(booking: Booking): void {
  confirm.require({
    message: `確定要取消 ${booking.customerName} 的 "${booking.courseTitle}" 預約嗎？`,
    header: '取消預約',
    icon: 'pi pi-times-circle',
    acceptLabel: '確認取消',
    rejectLabel: '返回',
    accept: () => {
      // 實際應用中應該調用 API 取消預約
      booking.status = 'cancelled';
      
      toast.add({
        severity: 'info',
        summary: '預約已取消',
        detail: `${booking.customerName} 的預約已取消`,
        life: 3000
      });
    }
  });
}

// 完成預約
function completeBooking(booking: Booking): void {
  confirm.require({
    message: `確定要將 ${booking.customerName} 的 "${booking.courseTitle}" 預約標記為已完成嗎？`,
    header: '完成預約',
    icon: 'pi pi-check-square',
    acceptLabel: '確認完成',
    rejectLabel: '取消',
    accept: () => {
      // 實際應用中應該調用 API 完成預約
      booking.status = 'completed';
      
      toast.add({
        severity: 'success',
        summary: '預約已完成',
        detail: `${booking.customerName} 的預約已標記為完成`,
        life: 3000
      });
    }
  });
}

// 初始化
onMounted(() => {
  loadBookings();
});

// 輔助變數 - 昨天和上週日期
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
</script>