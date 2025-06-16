<template>
    <div class="flex flex-col flex-1">
        <h2 class="text-2xl font-bold mb-6 text-sky-700">點數錢包</h2>

        <!-- 點數總覽卡片 -->
        <div class="bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg shadow-md p-6 mb-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="text-center md:text-left">
                    <h3 class="text-white text-lg font-medium mb-1">目前可用點數</h3>
                    <div class="text-white text-4xl font-bold">{{ currentPoints }}</div>
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

        <!-- PUDT 課卡儲值方案 -->
        <div class="mb-8">
            <h3 class="text-lg font-bold mb-4 text-sky-700 flex items-center">
                <i class="pi pi-ticket mr-2"></i>PUDT 課卡儲值方案
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- 新手卡 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden border border-sky-100 hover:shadow-lg transition-all">
                    <div class="bg-sky-50 p-4 relative overflow-hidden">
                        <div class="absolute top-0 right-0 text-4xl opacity-10 transform rotate-12">🌱</div>
                        <h4 class="text-lg font-bold text-sky-700">新手卡</h4>
                        <div class="text-sm text-sky-600">輕量探索</div>
                        <div class="mt-2 flex items-end">
                            <span class="text-3xl font-bold text-sky-700">15</span>
                            <span class="ml-1 text-sky-600">點數</span>
                        </div>
                        <div class="mt-1 text-xs text-sky-500">NT$ 1,500</div>
                    </div>
                    <div class="p-4">
                        <p class="text-sm text-gray-600 mb-4">適合偶而上課的你，輕鬆探索各種課程</p>
                        <div class="text-xs text-gray-500 mb-3 flex items-center">
                            <i class="pi pi-users mr-1"></i>
                            <span>適合對象：偶爾體驗、初次使用者</span>
                        </div>
                        <div class="flex justify-end">
                            <Button label="購買課卡" icon="pi pi-shopping-cart" 
                                class="p-button-sm"
                                @click="handlePurchaseCard(1)" />
                        </div>
                    </div>
                </div>
                
                <!-- 標準卡 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden border border-sky-100 hover:shadow-lg transition-all">
                    <div class="bg-sky-100 p-4 relative overflow-hidden">
                        <div class="absolute top-0 right-0 text-4xl opacity-10 transform rotate-12">🍃</div>
                        <h4 class="text-lg font-bold text-sky-700">標準卡</h4>
                        <div class="text-sm text-sky-600">穩定學習</div>
                        <div class="mt-2 flex items-end">
                            <span class="text-3xl font-bold text-sky-700">30</span>
                            <span class="ml-1 text-sky-600">點數</span>
                        </div>
                        <div class="mt-1 text-xs text-sky-500">NT$ 2,800</div>
                    </div>
                    <div class="p-4">
                        <p class="text-sm text-gray-600 mb-4">每週一堂，打造穩定的學習節奏 💪</p>
                        <div class="text-xs text-gray-500 mb-3 flex items-center">
                            <i class="pi pi-users mr-1"></i>
                            <span>適合對象：每週固定學習者</span>
                        </div>
                        <div class="flex justify-end">
                            <Button label="購買課卡" icon="pi pi-shopping-cart" 
                                class="p-button-sm"
                                @click="handlePurchaseCard(2)" />
                        </div>
                    </div>
                </div>
                
                <!-- 進階卡 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden border border-sky-200 hover:shadow-lg transition-all">
                    <div class="bg-sky-200 p-4 relative overflow-hidden">
                        <div class="absolute top-0 right-0 text-4xl opacity-10 transform rotate-12">🌼</div>
                        <h4 class="text-lg font-bold text-sky-700">進階卡</h4>
                        <div class="text-sm text-sky-600">持續進修</div>
                        <div class="mt-2 flex items-end">
                            <span class="text-3xl font-bold text-sky-700">60</span>
                            <span class="ml-1 text-sky-600">點數</span>
                        </div>
                        <div class="mt-1 text-xs text-sky-500">NT$ 5,400</div>
                    </div>
                    <div class="p-4">
                        <p class="text-sm text-gray-600 mb-4">每週 2–3 堂課的你，持續累積實力 🔥</p>
                        <div class="text-xs text-gray-500 mb-3 flex items-center">
                            <i class="pi pi-users mr-1"></i>
                            <span>適合對象：一週多堂、持續進修者</span>
                        </div>
                        <div class="flex justify-end">
                            <Button label="購買課卡" icon="pi pi-shopping-cart" 
                                class="p-button-sm"
                                @click="handlePurchaseCard(3)" />
                        </div>
                    </div>
                </div>
                
                <!-- 無限卡 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden border border-sky-300 hover:shadow-lg transition-all">
                    <div class="bg-gradient-to-r from-sky-300 to-sky-400 p-4 relative overflow-hidden">
                        <div class="absolute top-0 right-0 text-4xl opacity-10 transform rotate-12">🌲</div>
                        <div class="absolute top-2 left-2 text-xs bg-yellow-400 text-sky-800 px-2 py-0.5 rounded-full font-bold">最划算</div>
                        <h4 class="text-lg font-bold text-white">無限卡</h4>
                        <div class="text-sm text-white">高效學習</div>
                        <div class="mt-2 flex items-end">
                            <span class="text-3xl font-bold text-white">100</span>
                            <span class="ml-1 text-white">點數</span>
                        </div>
                        <div class="mt-1 text-xs text-sky-100">NT$ 8,000</div>
                    </div>
                    <div class="p-4">
                        <p class="text-sm text-gray-600 mb-4">高效學習、自由預約，享受最划算的成長方案 ✨</p>
                        <div class="text-xs text-gray-500 mb-3 flex items-center">
                            <i class="pi pi-users mr-1"></i>
                            <span>適合對象：重度學習者／密集預約者</span>
                        </div>
                        <div class="flex justify-end">
                            <Button label="購買課卡" icon="pi pi-shopping-cart" 
                                class="p-button-sm"
                                @click="handlePurchaseCard(4)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 交易記錄 -->
        <div class="bg-white rounded-lg shadow-md border border-gray-100 p-4 flex-1">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 class="text-lg font-bold text-sky-700 flex items-center">
                    <i class="pi pi-history mr-2"></i>最近交易記錄
                </h3>
                <div class="flex flex-wrap gap-2">
                    <Select v-model="filter.month" :options="monthOptions" optionLabel="label" optionValue="value" placeholder="月份" class="w-24" />
                    <Select v-model="filter.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="類型" class="w-28" />
                </div>
            </div>
            <DataTable :value="filteredPointsHistory" stripedRows responsiveLayout="stack" :paginator="true" :rows="5"
                class="p-datatable-sm" emptyMessage="無交易記錄" :rowHover="true">
                <Column field="date" header="日期" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700">
                    <template #body="{ data }">
                        {{ formatDate(data.date) }}
                    </template>
                </Column>
                <Column field="type" header="類型" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700">
                    <template #body="{ data }">
                        <Tag :severity="getTypeSeverity(data.type)" :value="getTypeLabel(data.type)" />
                    </template>
                </Column>
                <Column field="description" header="說明" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700" />
                <Column field="points" header="點數" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700">
                    <template #body="{ data }">
                        <span :class="isPositiveType(data.type) ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                            {{ isPositiveType(data.type) ? '+' : '-' }}{{ data.points }}
                        </span>
                    </template>
                </Column>
                <Column field="balance" header="餘額" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700 font-medium" />
            </DataTable>
        </div>

        <!-- 儲值對話框組件 -->
        <PurchaseDialog
            v-model:visible="showPurchaseDialog"
            :points-cards="availablePointsCards"
            :purchase-card-id="purchaseCardId"
            :payment-method="paymentMethod"
            @update:purchase-card-id="purchaseCardId = $event"
            @update:payment-method="paymentMethod = $event"
            @purchase="confirmPurchase"
            @cancel="cancelPurchase"
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
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PurchaseDialog from '@/components/user/PurchaseDialog.vue';
import HistoryDialog from '@/components/user/HistoryDialog.vue';
import { useUserStore } from '@/stores/userStore';
import { usePointsStore } from '@/stores/pointsStore';
import { usePurchaseStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { showSuccess, showError } from '@/utils/toastHelper';

// 定義數據類型
interface PointsCard {
    id: number;
    name: string;
    type: string;
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

// 使用 stores
const userStore = useUserStore();
const pointsStore = usePointsStore();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

// 初始化數據
onMounted(() => {
    if (authStore.isLoggedIn) {
        pointsStore.init();
    }
});

// 計算屬性 - 當前點數
const currentPoints = computed(() => userStore.user?.points || 0);

// 計算屬性 - 點數歷史記錄
const pointsHistory = computed(() => {
    return pointsStore.pointsHistory.map(txn => ({
        id: txn.id,
        date: txn.createdAt,
        type: txn.kind,
        description: txn.note || '點數交易',
        points: txn.amount,
        balance: txn.balance,
        remark: txn.refType?.toString()
    }));
});

// 計算屬性 - 可用點數卡
const availablePointsCards = computed(() => {
    return pointsStore.pointsCards.map(card => ({
        id: card.id,
        name: `${card.points}點數卡`,
        description: card.description,
        points: card.points,
        price: card.price,
        discount: card.discount
    }));
});

// 響應式狀態
const expiringPoints = ref(50); 
const expiryDate = ref('2023/12/31');
const selectedCard = ref<number | null>(null);
const showPurchaseDialog = ref(false);
const purchaseCardId = ref<number | undefined>(undefined);
const paymentMethod = ref<string | undefined>(undefined);
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

// 業務邏輯方法
const isPositiveType = (type: string): boolean => {
    return ['add', 'reward'].includes(type);
};

const sortByDateDesc = (a: TransactionRecord, b: TransactionRecord): number => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
};

// 篩選後的點數歷史
const filteredPointsHistory = computed(() => {
    let result = [...pointsHistory.value];
    
    if (filter.value.month) {
        result = result.filter(item => {
            const itemDate = new Date(item.date);
            const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
            return itemMonth === filter.value.month;
        });
    }
    
    if (filter.value.type) {
        result = result.filter(item => item.type === filter.value.type);
    }
    
    return result.sort(sortByDateDesc);
});

// 篩選後的歷史記錄
const filteredHistoryRecords = computed(() => {
    let result = [...pointsHistory.value];
    
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
    
    if (historyFilter.value.type) {
        result = result.filter(item => item.type === historyFilter.value.type);
    }
    
    return result.sort(sortByDateDesc);
});

// 業務方法
const handlePurchaseCard = (cardId: number) => {
    if (!authStore.isLoggedIn) {
        showError('請先登入', '未登入');
        return;
    }
    
    confirm.require({
        message: '確認購買此點數卡？',
        header: '購買確認',
        acceptLabel: '確認購買',
        rejectLabel: '取消',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-primary',
        accept: async () => {
            try {
                const res = await purchaseStore.buyPointsCard(cardId);
                if (res.success) {
                    showSuccess(res.message || '點數卡購買成功', '成功');
                    // 重新載入用戶點數
                    await userStore.fetchProfile();
                } else {
                    showError(res.message || '購買點數失敗', '失敗');
                }
            } catch (error) {
                console.error('處理購買請求時出錯:', error);
                showError('處理您的購買請求時出錯', '錯誤');
            }
        }
    });
};

const confirmPurchase = () => {
    if (!purchaseCardId.value) return;
    
    showPurchaseDialog.value = false;
    
    toast.add({
        severity: 'info',
        summary: '處理中',
        detail: '正在處理您的付款...',
        life: 2000
    });
    
    setTimeout(() => {
        purchaseCardId.value = undefined;
        paymentMethod.value = undefined;
    }, 2000);
};

const cancelPurchase = () => {
    showPurchaseDialog.value = false;
    purchaseCardId.value = undefined;
    paymentMethod.value = undefined;
};

const applyHistoryFilter = () => {
    toast.add({
        severity: 'info',
        summary: '已應用篩選',
        detail: '已更新交易記錄',
        life: 2000
    });
};

const resetHistoryFilter = () => {
    historyFilter.value = {
        dateRange: null,
        type: ''
    };
};

// 格式化方法
const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        'add': '儲值',
        'use': '消費',
        'reward': '獎勵',
        'expire': '過期'
    };
    return typeMap[type] || type;
};

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

:deep(.p-datatable-header) {
    @apply bg-sky-50 text-sky-800;
}

:deep(.p-datatable > .p-datatable-table-container) {
    @apply flex-1;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm font-semibold;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr:hover) {
    @apply bg-sky-50/50;
}
</style>