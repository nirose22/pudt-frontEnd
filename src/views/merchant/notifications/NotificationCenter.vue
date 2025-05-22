<template>
  <div>
    <!-- 頂部操作區 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <!-- 搜尋和篩選 -->
      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.search" placeholder="搜尋通知..." />
        </IconField>
        <Select v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value"
          placeholder="通知類型" class="w-full sm:w-auto" />
      </div>
      
      <!-- 操作按鈕 -->
      <div class="flex gap-2">
        <Button label="全部標為已讀" icon="pi pi-check" outlined @click="markAllAsRead" :disabled="!hasUnread" />
        <Button label="清除全部" icon="pi pi-trash" severity="danger" outlined @click="confirmClearAll" :disabled="!notifications.length" />
      </div>
    </div>
    
    <!-- 通知列表 -->
    <Card>
      <template #content>
        <DataView :value="filteredNotifications" :layout="'list'" :paginator="true" :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20]" :loading="loading">
          
          <!-- 列表項目 -->
          <template #list="slotProps">
            <div class="grid grid-cols-1 gap-4">
              <div v-for="notification in slotProps.items" :key="notification.id"
                :class="['p-4 border rounded-lg', notification.read ? 'bg-white' : 'bg-blue-50']">
                <div class="flex items-start gap-4">
                  <!-- 通知圖標 -->
                  <div :class="['p-3 rounded-full', getTypeIconBgClass(notification.type)]">
                    <i :class="['text-white', getTypeIcon(notification.type)]"></i>
                  </div>
                  
                  <!-- 通知內容 -->
                  <div class="flex-grow">
                    <div class="flex justify-between items-start">
                      <h3 class="text-lg font-medium" :class="{'font-bold': !notification.read}">{{ notification.title }}</h3>
                      <div class="text-sm text-gray-500">{{ formatDateTime(notification.time) }}</div>
                    </div>
                    <p class="mt-1 text-gray-600">{{ notification.message }}</p>
                    
                    <!-- 相關連結 -->
                    <div v-if="notification.link" class="mt-2">
                      <Button :label="notification.linkText || '查看詳情'" link @click="navigateTo(notification.link)" />
                    </div>
                  </div>
                  
                  <!-- 操作按鈕 -->
                  <div class="flex flex-col gap-2">
                    <Button v-if="!notification.read" icon="pi pi-check" text rounded @click="markAsRead(notification)" tooltip="標為已讀" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteNotification(notification)" tooltip="刪除" />
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <!-- 無數據時顯示 -->
          <template #empty>
            <div class="text-center p-6">
              <i class="pi pi-bell-slash text-5xl text-gray-300 mb-3"></i>
              <h3 class="text-xl font-medium text-gray-600 mb-2">沒有通知</h3>
              <p class="text-gray-500">您目前沒有任何通知</p>
            </div>
          </template>
        </DataView>
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
import Card from 'primevue/card';
import DataView from 'primevue/dataview';
import Select from 'primevue/select';
import ConfirmDialog from 'primevue/confirmdialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import type { Notification, NotificationType } from '@/types/message';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// 篩選條件
const filters = ref({
  search: '',
  type: ''
});

// 通知類型選項
const typeOptions = [
  { label: '全部類型', value: '' },
  { label: '預約通知', value: 'booking' },
  { label: '系統通知', value: 'system' },
  { label: '結算通知', value: 'settlement' },
  { label: '活動通知', value: 'promotion' }
];

// 通知數據
const notifications = ref<Notification[]>([]);
const loading = ref(false);

// 是否有未讀通知
const hasUnread = computed(() => {
  return notifications.value.some(notification => !notification.read);
});

// 根據篩選條件過濾通知
const filteredNotifications = computed(() => {
  let result = [...notifications.value];
  
  // 搜尋過濾
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(notification => 
      notification.title.toLowerCase().includes(searchLower) || 
      notification.message.toLowerCase().includes(searchLower)
    );
  }
  
  // 類型過濾
  if (filters.value.type) {
    result = result.filter(notification => notification.type === filters.value.type);
  }
  
  // 按時間排序，最新的在前面
  return result.sort((a, b) => b.time.getTime() - a.time.getTime());
});

// 獲取通知類型圖標
function getTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'booking': 'pi pi-calendar',
    'system': 'pi pi-info-circle',
    'settlement': 'pi pi-wallet',
    'promotion': 'pi pi-megaphone'
  };
  return iconMap[type] || 'pi pi-bell';
}

// 獲取通知類型圖標背景顏色
function getTypeIconBgClass(type: string): string {
  const bgMap: Record<string, string> = {
    'booking': 'bg-blue-500',
    'system': 'bg-purple-500',
    'settlement': 'bg-green-500',
    'promotion': 'bg-orange-500'
  };
  return bgMap[type] || 'bg-gray-500';
}

// 格式化日期時間
function formatDateTime(date: Date): string {
  // 如果是今天，只顯示時間
  const today = new Date();
  if (date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  // 如果是昨天
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && 
      date.getMonth() === yesterday.getMonth() && 
      date.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  // 其他日期
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 導航到指定頁面
function navigateTo(link: string): void {
  router.push(link);
}

// 標記為已讀
function markAsRead(notification: Notification): void {
  notification.read = true;
  
  toast.add({
    severity: 'info',
    summary: '已標記為已讀',
    detail: `"${notification.title}" 已標記為已讀`,
    life: 3000
  });
}

// 標記全部為已讀
function markAllAsRead(): void {
  confirm.require({
    message: '確定要將所有通知標記為已讀嗎？',
    header: '標記全部為已讀',
    icon: 'pi pi-check-circle',
    acceptLabel: '確認',
    rejectLabel: '取消',
    accept: () => {
      notifications.value.forEach(notification => {
        notification.read = true;
      });
      
      toast.add({
        severity: 'info',
        summary: '已全部標記為已讀',
        detail: '所有通知已標記為已讀',
        life: 3000
      });
    }
  });
}

// 確認刪除通知
function confirmDeleteNotification(notification: Notification): void {
  confirm.require({
    message: `確定要刪除通知 "${notification.title}" 嗎？`,
    header: '確認刪除',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確認刪除',
    rejectLabel: '取消',
    accept: () => {
      notifications.value = notifications.value.filter(n => n.id !== notification.id);
      
      toast.add({
        severity: 'success',
        summary: '通知已刪除',
        detail: `通知 "${notification.title}" 已成功刪除`,
        life: 3000
      });
    }
  });
}

// 確認清除全部通知
function confirmClearAll(): void {
  confirm.require({
    message: '確定要清除所有通知嗎？此操作無法復原。',
    header: '清除全部通知',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確認清除',
    rejectLabel: '取消',
    accept: () => {
      notifications.value = [];
      
      toast.add({
        severity: 'success',
        summary: '通知已清除',
        detail: '所有通知已成功清除',
        life: 3000
      });
    }
  });
}

// 加載通知數據
async function loadNotifications(): Promise<void> {
  loading.value = true;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模擬通知數據
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    notifications.value = [
      {
        id: 1,
        title: '新預約通知',
        message: '張小明已預約您的「瑜珈初階班」課程，請盡快確認。',
        type: 'booking',
        time: now,
        read: false,
        link: '/merchant/bookings',
        linkText: '查看預約'
      },
      {
        id: 2,
        title: '點數結算完成',
        message: '您申請的 500 點結算已完成，款項將於 1-3 個工作天內匯入您的帳戶。',
        type: 'settlement',
        time: oneHourAgo,
        read: false,
        link: '/merchant/points',
        linkText: '查看點數明細'
      },
      {
        id: 3,
        title: '系統更新通知',
        message: 'PUDT 商家管理系統將於本週六凌晨 2:00-4:00 進行系統維護，期間可能無法使用部分功能。',
        type: 'system',
        time: threeDaysAgo,
        read: true
      },
      {
        id: 4,
        title: '活動推廣機會',
        message: '我們正在舉辦「夏季課程推廣」活動，您可以提交課程參與特別推廣，獲得更多曝光機會。',
        type: 'promotion',
        time: oneWeekAgo,
        read: true,
        link: '/merchant/promotions',
        linkText: '參與活動'
      }
    ];
  } catch (error) {
    console.error('加載通知失敗:', error);
    toast.add({
      severity: 'error',
      summary: '加載失敗',
      detail: '無法加載通知數據，請稍後再試',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

// 初始化
onMounted(() => {
  loadNotifications();
});
</script> 