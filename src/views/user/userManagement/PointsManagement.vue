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
                    <Button label="點數歷史" icon="pi pi-history" class="p-button-raised p-button-rounded p-button-outlined" @click="loadHistoryAndShow" />
                </div>
            </div>
        </div>

        <!-- PUDT 課卡儲值方案 -->
        <div class="mb-8">
            <h3 class="text-lg font-bold mb-4 text-sky-700 flex items-center">
                <i class="pi pi-ticket mr-2"></i>PUDT 課卡儲值方案
            </h3>
            
            <!-- 載入狀態 -->
            <div v-if="loadingPointsCards" class="flex justify-center items-center py-8">
                <i class="pi pi-spinner pi-spin text-2xl text-sky-600"></i>
                <span class="ml-2 text-sky-600">載入點數卡中...</span>
            </div>
            
            <!-- 點數卡列表 -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="card in pointsCards" :key="card.id" 
                     class="bg-white rounded-xl shadow-md overflow-hidden border border-sky-100 hover:shadow-lg transition-all">
                    <div :class="getCardHeaderClass(card.points)" class="p-4 relative overflow-hidden">
                        <div class="absolute top-0 right-0 text-4xl opacity-10 transform rotate-12">{{ getCardEmoji(card.points) }}</div>
                        <div v-if="card.points === 100" class="absolute top-2 left-2 text-xs bg-yellow-400 text-sky-800 px-2 py-0.5 rounded-full font-bold">最划算</div>
                        <h4 class="text-lg font-bold" :class="card.points === 100 ? 'text-white' : 'text-sky-700'">{{ card.name }}</h4>
                        <div class="text-sm" :class="card.points === 100 ? 'text-white' : 'text-sky-600'">{{ getCardType(card.points) }}</div>
                        <div class="mt-2 flex items-end">
                            <span class="text-3xl font-bold" :class="card.points === 100 ? 'text-white' : 'text-sky-700'">{{ card.points }}</span>
                            <span class="ml-1" :class="card.points === 100 ? 'text-white' : 'text-sky-600'">點數</span>
                        </div>
                        <div class="mt-1 text-xs" :class="card.points === 100 ? 'text-sky-100' : 'text-sky-500'">NT$ {{ card.price.toLocaleString() }}</div>
                    </div>
                    <div class="p-4">
                        <p class="text-sm text-gray-600 mb-4">{{ card.description }}</p>
                        <div class="text-xs text-gray-500 mb-3 flex items-center">
                            <i class="pi pi-users mr-1"></i>
                            <span>{{ getCardTarget(card.points) }}</span>
                        </div>
                        <div class="flex justify-end">
                            <Button label="購買課卡" icon="pi pi-shopping-cart" 
                                class="p-button-sm"
                                :loading="purchasingCardId === card.id"
                                :disabled="purchasing"
                                @click="handlePurchaseCard(card.id)" />
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
                    <Button icon="pi pi-refresh" class="p-button-outlined p-button-sm" @click="loadPointsHistory" :loading="loadingHistory" />
                </div>
            </div>
            
            <!-- 載入狀態 -->
            <div v-if="loadingHistory" class="flex justify-center items-center py-8">
                <i class="pi pi-spinner pi-spin text-xl text-sky-600"></i>
                <span class="ml-2 text-sky-600">載入交易記錄中...</span>
            </div>
            
            <!-- 交易記錄表格 -->
            <DataTable v-else :value="filteredPointsHistory" stripedRows responsiveLayout="stack" :paginator="true" :rows="5"
                class="p-datatable-sm" emptyMessage="無交易記錄" :rowHover="true">
                <Column field="createdAt" header="日期" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700">
                    <template #body="{ data }">
                        {{ formatDate(data.createdAt) }}
                    </template>
                </Column>
                <Column field="kind" header="類型" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700">
                    <template #body="{ data }">
                        <Tag :severity="getTypeSeverity(data.kind)" :value="getTypeLabel(data.kind)" />
                    </template>
                </Column>
                <Column field="note" header="說明" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700" />
                <Column field="amount" header="點數" headerClass="text-sky-700 bg-sky-50" bodyClass="text-gray-700">
                    <template #body="{ data }">
                        <span :class="isPositiveType(data.kind) ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                            {{ isPositiveType(data.kind) ? '+' : '-' }}{{ data.amount }}
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
import { ref, computed, onMounted, watch } from 'vue';
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
import { useAuthStore } from '@/stores/authStore';
import { showSuccess, showError } from '@/utils/toastHelper';
import { pointsApi, type PointsCard, type PointTransaction } from '@/services/pointsApi';
import { PointKind, PointKindLabel } from '@/enums/Point';
// 定義數據類型
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
const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

// 響應式狀態
const pointsCards = ref<PointsCard[]>([]);
const pointsHistory = ref<PointTransaction[]>([]);
const loadingPointsCards = ref(false);
const loadingHistory = ref(false);
const purchasing = ref(false);
const purchasingCardId = ref<number | null>(null);

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

// 計算屬性 - 當前點數
const currentPoints = computed(() => userStore.user?.points || 0);

// 計算屬性 - 可用點數卡
const availablePointsCards = computed(() => {
    return pointsCards.value.map(card => ({
        id: card.id,
        name: `${card.points}點數卡`,
        description: card.description,
        points: card.points,
        price: card.price,
        discount: undefined
    }));
});

// 篩選後的點數歷史
const filteredPointsHistory = computed(() => {
    let result = [...pointsHistory.value];
    
    if (filter.value.month) {
        result = result.filter(item => {
            const itemDate = new Date(item.createdAt);
            const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
            return itemMonth === filter.value.month;
        });
    }
    
    if (filter.value.type) {
        result = result.filter(item => item.kind === filter.value.type);
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
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }
    
    if (historyFilter.value.type) {
        result = result.filter(item => item.kind === historyFilter.value.type);
    }
    
    return result.sort(sortByDateDesc);
});

// API 調用方法
const loadPointsCards = async () => {
    loadingPointsCards.value = true;
    try {
        const response = await pointsApi.getPointsCards();
        if (response.success) {
            pointsCards.value = response.data || [];
        } else {
            showError(response.message || '載入點數卡失敗', '錯誤');
        }
    } catch (error) {
        console.error('載入點數卡失敗:', error);
        showError('載入點數卡時發生網路錯誤', '錯誤');
    } finally {
        loadingPointsCards.value = false;
    }
};

const loadPointsHistory = async () => {
    if (!authStore.isLoggedIn) return;
    
    loadingHistory.value = true;
    try {
        const response = await pointsApi.getPointsHistory();
        if (response.success) {
            pointsHistory.value = response.data || [];
        } else {
            showError(response.message || '載入交易記錄失敗', '錯誤');
        }
    } catch (error) {
        console.error('載入交易記錄失敗:', error);
        showError('載入交易記錄時發生網路錯誤', '錯誤');
    } finally {
        loadingHistory.value = false;
    }
};

const purchasePointsCard = async (cardId: number) => {
    purchasing.value = true;
    purchasingCardId.value = cardId;
    
    try {
        const response = await pointsApi.buyPointsCard(cardId);
        if (response.success) {
            showSuccess(response.message || '點數卡購買成功', '成功');
            // 重新載入用戶資料和交易記錄
            await Promise.all([
                userStore.fetchUserProfile(userStore.user.id),
                loadPointsHistory()
            ]);
        } else {
            showError(response.message || '購買點數失敗', '失敗');
        }
    } catch (error: any) {
        console.error('購買點數卡失敗:', error);
        if (error.response?.status === 401) {
            showError('請先登入再進行購買', '未授權');
        } else if (error.response?.status >= 500) {
            showError('伺服器錯誤，請稍後再試', '錯誤');
        } else {
            showError('購買點數卡時發生錯誤', '錯誤');
        }
    } finally {
        purchasing.value = false;
        purchasingCardId.value = null;
    }
};

// 業務邏輯方法
const isPositiveType = (type: string): boolean => {
    type = type.toLowerCase();
    return ['add', 'reward'].includes(type);
};

const sortByDateDesc = (a: PointTransaction, b: PointTransaction): number => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

const getCardHeaderClass = (points: number): string => {
    const classMap: Record<number, string> = {
        15: 'bg-sky-50',
        30: 'bg-sky-100',
        60: 'bg-sky-200',
        100: 'bg-gradient-to-r from-sky-300 to-sky-400'
    };
    return classMap[points] || 'bg-sky-50';
};

const getCardEmoji = (points: number): string => {
    const emojiMap: Record<number, string> = {
        15: '🌱',
        30: '🍃',
        60: '🌼',
        100: '🌲'
    };
    return emojiMap[points] || '🎁';
};

const getCardType = (points: number): string => {
    const typeMap: Record<number, string> = {
        15: '輕量探索',
        30: '穩定學習',
        60: '持續進修',
        100: '高效學習'
    };
    return typeMap[points] || '課卡方案';
};

const getCardTarget = (points: number): string => {
    const targetMap: Record<number, string> = {
        15: '適合對象：偶爾體驗、初次使用者',
        30: '適合對象：每週固定學習者',
        60: '適合對象：一週多堂、持續進修者',
        100: '適合對象：重度學習者／密集預約者'
    };
    return targetMap[points] || '適合所有學習者';
};

// 業務方法
const handlePurchaseCard = (cardId: number) => {
    if (!authStore.isLoggedIn) {
        showError('請先登入', '未登入');
        return;
    }
    
    if (purchasing.value) {
        return;
    }
    
    const card = pointsCards.value.find(c => c.id === cardId);
    if (!card) {
        showError('找不到指定的點數卡', '錯誤');
        return;
    }
    
    confirm.require({
        message: `確認購買 ${card.name}（${card.points}點數，NT$ ${card.price.toLocaleString()}）？`,
        header: '購買確認',
        acceptLabel: '確認購買',
        rejectLabel: '取消',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-primary',
        accept: () => {
            purchasePointsCard(cardId);
        }
    });
};

const loadHistoryAndShow = async () => {
    showHistoryDialog.value = true;
    if (pointsHistory.value.length === 0) {
        await loadPointsHistory();
    }
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
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

const getTypeLabel = (type: string): string => {
    let label = PointKindLabel[type as PointKind];
    if (!label) {
        label = type;
    }
    return label;
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

// 初始化
onMounted(async () => {
    if (authStore.isLoggedIn) {
        await Promise.all([
            loadPointsCards(),
            loadPointsHistory()
        ]);
    }
});

// 監聽登入狀態變化
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
        loadPointsCards();
        loadPointsHistory();
    } else {
        pointsCards.value = [];
        pointsHistory.value = [];
    }
});
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