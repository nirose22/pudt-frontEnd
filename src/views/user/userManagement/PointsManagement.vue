<template>
    <div class="flex flex-col flex-1">
        <h2 class="text-2xl font-bold mb-6">點數錢包</h2>

        <!-- 點數總覽卡片 -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-300 rounded-lg shadow-lg p-6 mb-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="text-center md:text-left">
                    <h3 class="text-white text-lg font-medium mb-1">目前可用點數</h3>
                    <div class="text-white text-4xl font-bold">{{ points }}</div>
                    <div v-if="expiringPoints > 0" class="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm inline-flex items-center">
                        <i class="pi pi-exclamation-circle mr-1"></i>
                        {{ expiringPoints }} 點將於 {{ expiryDate }} 到期
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Button label="儲值點數" icon="pi pi-plus" class="p-button-raised p-button-rounded" @click="showPurchaseDialog = true" />
                    <Button label="點數歷史" icon="pi pi-history" class="p-button-raised p-button-rounded p-button-outlined" @click="showHistoryDialog = true" />
                </div>
            </div>
        </div>

        <!-- 快速儲值選項 -->
        <div class="card p-4 shadow-sm rounded-lg mb-6">
            <h3 class="text-lg font-semibold mb-4">快速儲值</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="card in pointsCards" :key="card.id" 
                    class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    :class="{ 'border-primary-500 bg-primary-50': selectedCard === card.id }"
                    @click="selectCard(card.id)">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-medium text-lg">{{ card.name }}</h4>
                            <div class="text-sm text-gray-500">{{ card.description }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-primary-600">{{ card.points }} 點</div>
                            <div class="text-sm">NT$ {{ card.price }}</div>
                        </div>
                    </div>
                    <div class="mt-3 flex justify-end">
                        <Button label="購買" icon="pi pi-shopping-cart" 
                            :class="{ 'p-button-outlined': selectedCard !== card.id }"
                            @click.stop="purchaseCard(card.id)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 交易記錄 -->
        <div class="card p-4 shadow-sm rounded-lg flex-1">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">最近交易記錄</h3>
                <div class="flex gap-2">
                    <Dropdown v-model="filter.month" :options="monthOptions" optionLabel="label" optionValue="value" placeholder="月份" />
                    <Dropdown v-model="filter.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="類型" />
                </div>
            </div>
            <DataTable :value="filteredPointsHistory" stripedRows responsiveLayout="stack" :paginator="true" :rows="5"
                class="p-datatable-sm" emptyMessage="無交易記錄">
                <Column field="date" header="日期">
                    <template #body="{ data }">
                        {{ formatDate(data.date) }}
                    </template>
                </Column>
                <Column field="type" header="類型">
                    <template #body="{ data }">
                        <Tag :severity="getTypeSeverity(data.type)" :value="getTypeLabel(data.type)" />
                    </template>
                </Column>
                <Column field="description" header="說明" />
                <Column field="points" header="點數">
                    <template #body="{ data }">
                        <span :class="isPositiveType(data.type) ? 'text-green-600' : 'text-red-600'">
                            {{ isPositiveType(data.type) ? '+' : '-' }}{{ data.points }}
                        </span>
                    </template>
                </Column>
                <Column field="balance" header="餘額" />
            </DataTable>
        </div>

        <!-- 儲值對話框組件 -->
        <PurchaseDialog
            v-model:visible="showPurchaseDialog"
            :points-cards="pointsCards"
            :purchase-card-id="purchaseCardId"
            :payment-method="paymentMethod"
            @update:purchase-card-id="purchaseCardId = $event"
            @update:payment-method="paymentMethod = $event"
            @purchase="confirmPurchase"
            @cancel="showPurchaseDialog = false"
        />

        <!-- 點數歷史對話框組件 -->
        <HistoryDialog
            v-model:visible="showHistoryDialog"
            :points-history="filteredHistoryRecords"
            :type-options="typeOptions"
            :history-filter="historyFilter"
            @update:history-filter="historyFilter = $event"
            @apply-filter="applyHistoryFilter"
            @reset-filter="resetHistoryFilter"
            @close="showHistoryDialog = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { PropType } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import PurchaseDialog from '@/components/user/PurchaseDialog.vue';
import HistoryDialog from '@/components/user/HistoryDialog.vue';

// 定義數據類型
interface PointsCard {
    id: number;
    name: string;
    description: string;
    points: number;
    price: number;
    discount?: string;
}

interface TransactionRecord {
    id: number;
    date: string | Date;
    type: string;
    description: string;
    points: number;
    balance: number;
    remark?: string;
}

interface FilterOptions {
    month: string;
    type: string;
}

interface HistoryFilterOptions {
    dateRange: null | Date[];
    type: string;
}

interface PaymentMethod {
    label: string;
    value: string;
    icon: string;
}

// 定义inject的数据类型
interface PointsDataInject {
    points: { value: number };
    pointsHistory: { value: TransactionRecord[] };
    pointsCards: { value: PointsCard[] };
    handlePurchase: (cardId: number) => void;
}

// 使用inject获取数据
const pointsData = inject<PointsDataInject>('pointsData');
const points = computed(() => pointsData?.points.value || 0);
const pointsHistory = computed(() => pointsData?.pointsHistory.value || []);
const pointsCards = computed(() => pointsData?.pointsCards.value || []);
const handlePurchase = pointsData?.handlePurchase;

// 删除emit
// const emit = defineEmits(['purchase']);
const toast = useToast();

// 點數相關狀態
const expiringPoints = ref(50); 
const expiryDate = ref('2023/12/31');

// 卡片選擇狀態
const selectedCard = ref<number | null>(null);
const showPurchaseDialog = ref(false);
const purchaseCardId = ref<number | null>(null);
const paymentMethod = ref<string | null>(null);

// 歷史記錄對話框
const showHistoryDialog = ref(false);

// 篩選條件
const filter = ref<FilterOptions>({
    month: '',
    type: ''
});

const historyFilter = ref<HistoryFilterOptions>({
    dateRange: null,
    type: ''
});

// 月份選項
const monthOptions = [
    { label: '全部月份', value: '' },
    ...Array.from({ length: 12 }, (_, i) => ({ 
        label: `${i + 1}月`, 
        value: (i + 1).toString().padStart(2, '0') 
    }))
];

// 交易類型選項
const typeOptions = [
    { label: '全部類型', value: '' },
    { label: '儲值', value: 'add' },
    { label: '消費', value: 'use' },
    { label: '獎勵', value: 'reward' },
    { label: '過期', value: 'expire' }
];

// 付款方式
const paymentMethods: PaymentMethod[] = [
    { label: '信用卡', value: 'credit', icon: 'pi pi-credit-card' },
    { label: '銀行轉帳', value: 'bank', icon: 'pi pi-wallet' },
    { label: '行動支付', value: 'mobile', icon: 'pi pi-mobile' }
];

// 判斷正向交易類型 (增加點數)
const isPositiveType = (type: string): boolean => {
    return ['add', 'reward'].includes(type);
};

// 按日期排序數據
const sortByDateDesc = (a: TransactionRecord, b: TransactionRecord): number => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
};

// 篩選後的點數歷史
const filteredPointsHistory = computed(() => {
    let result = [...pointsHistory.value];
    
    // 月份篩選
    if (filter.value.month) {
        result = result.filter(item => {
            const itemDate = new Date(item.date);
            const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
            return itemMonth === filter.value.month;
        });
    }
    
    // 類型篩選
    if (filter.value.type) {
        result = result.filter(item => item.type === filter.value.type);
    }
    
    // 按日期降序排序
    return result.sort(sortByDateDesc);
});

// 篩選後的歷史記錄
const filteredHistoryRecords = computed(() => {
    let result = [...pointsHistory.value];
    
    // 日期範圍篩選
    if (historyFilter.value.dateRange && historyFilter.value.dateRange[0] && historyFilter.value.dateRange[1]) {
        const startDate = new Date(historyFilter.value.dateRange[0]);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(historyFilter.value.dateRange[1]);
        endDate.setHours(23, 59, 59, 999);
        
        result = result.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }
    
    // 類型篩選
    if (historyFilter.value.type) {
        result = result.filter(item => item.type === historyFilter.value.type);
    }
    
    // 按日期降序排序
    return result.sort(sortByDateDesc);
});

// 選中卡片的價格
const selectedCardPrice = computed(() => {
    if (!purchaseCardId.value) return 0;
    const card = pointsCards.value.find(card => card.id === purchaseCardId.value);
    return card ? card.price : 0;
});

// 選擇卡片
const selectCard = (cardId: number) => {
    selectedCard.value = cardId;
};

// 購買卡片
const purchaseCard = (cardId: number) => {
    if (!handlePurchase) return;
    handlePurchase(cardId);
};

// 確認購買
const confirmPurchase = () => {
    if (!purchaseCardId.value) return;
    
    showPurchaseDialog.value = false;
    
    // 模擬付款流程
    toast.add({
        severity: 'info',
        summary: '處理中',
        detail: '正在處理您的付款...',
        life: 2000
    });
    
    // 延遲模擬付款完成
    setTimeout(() => {
        // 重置狀態
        purchaseCardId.value = null;
        paymentMethod.value = null;
    }, 2000);
};

// 應用歷史記錄篩選
const applyHistoryFilter = () => {
    // 已通過 computed 自動應用篩選
    toast.add({
        severity: 'info',
        summary: '已應用篩選',
        detail: '已更新交易記錄',
        life: 2000
    });
};

// 重置歷史記錄篩選
const resetHistoryFilter = () => {
    historyFilter.value = {
        dateRange: null,
        type: ''
    };
};

// 格式化日期
const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 格式化時間
const formatTime = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 獲取交易類型標籤
const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        'add': '儲值',
        'use': '消費',
        'reward': '獎勵',
        'expire': '過期'
    };
    return typeMap[type] || type;
};

// 獲取交易類型嚴重性
const getTypeSeverity = (type: string): string => {
    const severityMap: Record<string, string> = {
        'add': 'success',
        'use': 'info',
        'reward': 'warning',
        'expire': 'danger'
    };
    return severityMap[type] || 'secondary';
};
</script>

<style scoped>
@reference "tailwindcss";

.card {
    @apply bg-white border border-gray-100;
}

:deep(.p-datatable > .p-datatable-table-container) {
    @apply flex-1;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}
</style>