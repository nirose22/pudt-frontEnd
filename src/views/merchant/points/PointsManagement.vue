<template>
  <div>
    <!-- 點數概覽卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- 累積點數 -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-gray-500 text-sm">累積點數</h3>
            <p class="text-2xl font-bold mt-1">{{ pointsStats.totalPoints }}</p>
          </div>
          <div class="bg-blue-100 p-2 rounded-full">
            <i class="pi pi-wallet text-blue-600"></i>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          自開店以來累積
        </div>
      </div>
      
      <!-- 已結算點數 -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-gray-500 text-sm">已結算點數</h3>
            <p class="text-2xl font-bold mt-1">{{ pointsStats.settledPoints }}</p>
          </div>
          <div class="bg-green-100 p-2 rounded-full">
            <i class="pi pi-check-circle text-green-600"></i>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          約 NT$ {{ formatCurrency(pointsStats.settledPoints * 10) }}
        </div>
      </div>
      
      <!-- 待結算點數 -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-gray-500 text-sm">待結算點數</h3>
            <p class="text-2xl font-bold mt-1">{{ pointsStats.pendingPoints }}</p>
          </div>
          <div class="bg-orange-100 p-2 rounded-full">
            <i class="pi pi-clock text-orange-600"></i>
          </div>
        </div>
        <div class="mt-2 text-xs flex items-center gap-1">
          <Button v-if="pointsStats.pendingPoints >= 100" label="申請結算" icon="pi pi-money-bill" size="small" @click="showSettlementDialog = true" />
          <span v-else class="text-gray-500">需滿 100 點才可申請結算</span>
        </div>
      </div>
    </div>
    
    <!-- 點數趨勢圖 -->
    <Card class="mb-6">
      <template #title>
        <div class="flex justify-between items-center">
          <span>點數趨勢</span>
          <Select v-model="chartPeriod" :options="periodOptions" optionLabel="label" optionValue="value" />
        </div>
      </template>
      <template #content>
        <Chart type="line" :data="pointsChartData" :options="chartOptions" class="h-64" />
      </template>
    </Card>
    
    <!-- 交易記錄 -->
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <span>交易記錄</span>
          <div class="flex gap-2">
            <DateRangeFilter v-model="filters.dateRange" />
            <Select v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="交易類型" />
          </div>
        </div>
      </template>
      <template #content>
        <DataTable :value="filteredTransactions" 
          :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :loading="loading" stripedRows responsiveLayout="stack" breakpoint="960px">
          
          <!-- 交易編號 -->
          <Column field="id" header="交易編號" style="width: 120px">
            <template #body="slotProps">
              <div class="font-mono">#{{ slotProps.data.id.toString().padStart(6, '0') }}</div>
            </template>
          </Column>
          
          <!-- 交易日期 -->
          <Column field="date" header="交易日期" sortable>
            <template #body="slotProps">
              <div>{{ formatDate(slotProps.data.date) }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(slotProps.data.date) }}</div>
            </template>
          </Column>
          
          <!-- 交易描述 -->
          <Column field="description" header="交易描述">
            <template #body="slotProps">
              <div>{{ slotProps.data.description }}</div>
              <div v-if="slotProps.data.orderId" class="text-xs text-gray-500">
                訂單: #{{ slotProps.data.orderId.toString().padStart(6, '0') }}
              </div>
            </template>
          </Column>
          
          <!-- 交易類型 -->
          <Column field="type" header="類型" style="width: 120px">
            <template #body="slotProps">
              <Tag :severity="getTypeSeverity(slotProps.data.type)" :value="getTypeLabel(slotProps.data.type)" />
            </template>
          </Column>
          
          <!-- 點數 -->
          <Column field="points" header="點數" sortable style="width: 100px">
            <template #body="slotProps">
              <div class="text-right font-medium" :class="slotProps.data.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ slotProps.data.type === 'income' ? '+' : '-' }}{{ slotProps.data.points }}
              </div>
            </template>
          </Column>
          
          <!-- 狀態 -->
          <Column field="status" header="狀態" sortable style="width: 120px">
            <template #body="slotProps">
              <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="getStatusLabel(slotProps.data.status)" />
            </template>
          </Column>
          
          <!-- 無數據時顯示 -->
          <template #empty>
            <div class="text-center p-4">
              <i class="pi pi-money-bill text-4xl text-gray-300 mb-3"></i>
              <p>未找到符合條件的交易記錄</p>
              <p class="text-sm text-gray-500 mt-2">嘗試調整篩選條件或清除搜尋</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
    
    <!-- 結算申請對話框 -->
    <Dialog v-model:visible="showSettlementDialog" header="申請點數結算" :style="{ width: '450px' }" :modal="true">
      <div class="p-4">
        <div class="mb-4">
          <label for="settlementAmount" class="block mb-1 font-medium">結算點數 <span class="text-red-500">*</span></label>
          <InputNumber id="settlementAmount" v-model="settlementAmount" class="w-full" :min="100" :max="pointsStats.pendingPoints" />
          <small class="text-gray-500">可結算點數: {{ pointsStats.pendingPoints }}</small>
        </div>
        
        <div class="mb-4">
          <label for="bankCode" class="block mb-1 font-medium">銀行代碼 <span class="text-red-500">*</span></label>
          <InputText id="bankCode" v-model="bankInfo.code" class="w-full" placeholder="例如: 012" />
        </div>
        
        <div class="mb-4">
          <label for="bankAccount" class="block mb-1 font-medium">銀行帳號 <span class="text-red-500">*</span></label>
          <InputText id="bankAccount" v-model="bankInfo.account" class="w-full" placeholder="例如: 1234-5678-9012-3456" />
        </div>
        
        <div class="mb-4">
          <label for="accountName" class="block mb-1 font-medium">戶名 <span class="text-red-500">*</span></label>
          <InputText id="accountName" v-model="bankInfo.name" class="w-full" placeholder="請輸入銀行帳戶戶名" />
        </div>
        
        <div class="bg-gray-100 p-3 rounded-lg mb-4">
          <div class="flex justify-between items-center">
            <span>預計結算金額:</span>
            <span class="font-bold">NT$ {{ formatCurrency(settlementAmount * 10) }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            結算金額 = 點數 × 10，將於 3-5 個工作天內匯款
          </div>
        </div>
        
        <div class="flex justify-end gap-2">
          <Button label="取消" icon="pi pi-times" outlined @click="showSettlementDialog = false" />
          <Button label="確認申請" icon="pi pi-check" @click="submitSettlement" :loading="submitting" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { showSuccess, showError, showInfo } from '@/utils/toastHelper';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import type { PointTransaction, PointTransactionType, PointTransactionStatus } from '@/types/point';

// 點數統計
const pointsStats = ref({
  totalPoints: 3750,
  settledPoints: 2500,
  pendingPoints: 1250
});

// 圖表週期
const chartPeriod = ref('month');
const periodOptions = [
  { label: '本週', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' },
  { label: '本年', value: 'year' }
];

// 篩選條件
const filters = ref({
  dateRange: {
    start: null as Date | null,
    end: null as Date | null
  },
  type: ''
});

// 交易類型選項
const typeOptions = [
  { label: '全部類型', value: '' },
  { label: '收入', value: 'income' },
  { label: '結算', value: 'settlement' },
  { label: '退款', value: 'refund' }
];

// 交易數據
const transactions = ref<PointTransaction[]>([]);
const loading = ref(false);

// 結算對話框
const showSettlementDialog = ref(false);
const settlementAmount = ref(100);
const bankInfo = ref({
  code: '',
  account: '',
  name: ''
});
const submitting = ref(false);

// 點數趨勢圖數據
const pointsChartData = ref({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '收入點數',
      data: [350, 450, 550, 600, 750, 850],
      borderColor: '#22C55E',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: '結算點數',
      data: [0, 300, 0, 400, 0, 500],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
});

// 圖表選項
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

// 根據篩選條件過濾交易
const filteredTransactions = computed(() => {
  let result = [...transactions.value];
  
  // 日期範圍過濾
  if (filters.value.dateRange.start && filters.value.dateRange.end) {
    result = result.filter(transaction => {
      const transactionDate = transaction.date.getTime();
      const startDate = filters.value.dateRange.start!.getTime();
      const endDate = filters.value.dateRange.end!.getTime();
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }
  
  // 交易類型過濾
  if (filters.value.type) {
    result = result.filter(transaction => transaction.type === filters.value.type);
  }
  
  return result;
});

// 獲取交易類型標籤
function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'income': '收入',
    'settlement': '結算',
    'refund': '退款'
  };
  return typeMap[type] || type;
}

// 獲取交易類型嚴重性
function getTypeSeverity(type: string): string {
  const severityMap: Record<string, string> = {
    'income': 'success',
    'settlement': 'info',
    'refund': 'warning'
  };
  return severityMap[type] || 'info';
}

// 獲取狀態標籤
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'completed': '已完成',
    'pending': '待處理',
    'processing': '處理中',
    'rejected': '已拒絕'
  };
  return statusMap[status] || status;
}

// 獲取狀態嚴重性
function getStatusSeverity(status: string): string {
  const severityMap: Record<string, string> = {
    'completed': 'success',
    'pending': 'warning',
    'processing': 'info',
    'rejected': 'danger'
  };
  return severityMap[status] || 'info';
}

// 格式化日期
function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// 格式化時間
function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 格式化貨幣
function formatCurrency(value: number): string {
  return value.toLocaleString('zh-TW');
}

// 加載交易數據
async function loadTransactions(): Promise<void> {
  loading.value = true;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模擬交易數據
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    transactions.value = [
      {
        id: 1001,
        date: today,
        description: '瑜珈初階班預約',
        orderId: 5001,
        type: 'income',
        points: 25,
        status: 'completed'
      },
      {
        id: 1002,
        date: yesterday,
        description: '烹飪課程：義式料理預約',
        orderId: 5002,
        type: 'income',
        points: 30,
        status: 'completed'
      },
      {
        id: 1003,
        date: lastWeek,
        description: '水彩畫入門預約',
        orderId: 5003,
        type: 'income',
        points: 20,
        status: 'completed'
      },
      {
        id: 1004,
        date: lastWeek,
        description: '攝影基礎課程預約',
        orderId: 5004,
        type: 'income',
        points: 35,
        status: 'completed'
      },
      {
        id: 1005,
        date: lastMonth,
        description: '手工皂製作工作坊預約',
        orderId: 5005,
        type: 'income',
        points: 15,
        status: 'completed'
      },
      {
        id: 1006,
        date: lastMonth,
        description: '點數結算申請',
        type: 'settlement',
        points: 500,
        status: 'completed'
      },
      {
        id: 1007,
        date: today,
        description: '點數結算申請',
        type: 'settlement',
        points: 300,
        status: 'processing'
      },
      {
        id: 1008,
        date: yesterday,
        description: '攝影基礎課程退款',
        orderId: 5004,
        type: 'refund',
        points: 35,
        status: 'completed'
      }
    ];
  } catch (error) {
    console.error('加載交易失敗:', error);
    showError('無法加載交易數據，請稍後再試', '加載失敗');
  } finally {
    loading.value = false;
  }
}

// 提交結算申請
async function submitSettlement(): Promise<void> {
  if (!validateSettlementForm()) {
    return;
  }

  submitting.value = true;
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新點數統計
    pointsStats.value.pendingPoints -= settlementAmount.value;
    pointsStats.value.settledPoints += settlementAmount.value;
    
    // 添加交易記錄
    const newTransaction: PointTransaction = {
      id: transactions.value.length + 1,
      date: new Date(),
      type: 'settlement',
      points: settlementAmount.value,
      description: '點數結算',
      status: 'pending'
    };
    transactions.value.unshift(newTransaction);
    
    // 重置表單
    settlementAmount.value = 100;
    bankInfo.value = { code: '', account: '', name: '' };
    showSettlementDialog.value = false;
    
    showSuccess('您的結算申請已送出，將於 3-5 個工作天內處理', '申請成功');
  } catch (error) {
    console.error('提交結算申請失敗:', error);
    showError('請稍後再試', '申請失敗');
  } finally {
    submitting.value = false;
  }
}

// 驗證結算表單
function validateSettlementForm(): boolean {
  if (settlementAmount.value < 100) {
    showError('結算點數不能少於 100 點', '驗證失敗');
    return false;
  }
  
  if (!bankInfo.value.code || !bankInfo.value.account || !bankInfo.value.name) {
    showError('請填寫完整的銀行帳戶資訊', '驗證失敗');
    return false;
  }
  
  return true;
}

// 初始化
onMounted(() => {
  loadTransactions();
});
</script> 