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
                        <span :class="data.type === 'add' ? 'text-green-600' : 'text-red-600'">
                            {{ data.type === 'add' ? '+' : '-' }}{{ data.points }}
                        </span>
                    </template>
                </Column>
                <Column field="balance" header="餘額" />
            </DataTable>
        </div>

        <!-- 儲值對話框 -->
        <Dialog v-model:visible="showPurchaseDialog" header="儲值點數" :style="{ width: '450px' }" :modal="true">
            <div class="p-4">
                <div class="mb-4">
                    <h4 class="font-medium mb-2">選擇點數套餐</h4>
                    <div class="grid grid-cols-1 gap-3">
                        <div v-for="card in pointsCards" :key="card.id" 
                            class="border rounded-lg p-3 flex justify-between items-center cursor-pointer"
                            :class="{ 'border-primary-500 bg-primary-50': purchaseCardId === card.id }"
                            @click="purchaseCardId = card.id">
                            <div>
                                <div class="font-medium">{{ card.name }}</div>
                                <div class="text-sm text-gray-500">{{ card.points }} 點</div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold">NT$ {{ card.price }}</div>
                                <div v-if="card.discount" class="text-xs text-green-600">{{ card.discount }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-medium mb-2">選擇付款方式</h4>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="method in paymentMethods" :key="method.value"
                            class="border rounded-lg p-3 flex items-center gap-2 cursor-pointer"
                            :class="{ 'border-primary-500 bg-primary-50': paymentMethod === method.value }"
                            @click="paymentMethod = method.value">
                            <i :class="method.icon"></i>
                            <span>{{ method.label }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                    <div class="flex justify-between items-center">
                        <span>總金額:</span>
                        <span class="font-bold text-lg">NT$ {{ selectedCardPrice }}</span>
                    </div>
                </div>
                
                <div class="flex justify-end gap-2">
                    <Button label="取消" icon="pi pi-times" outlined @click="showPurchaseDialog = false" />
                    <Button label="確認購買" icon="pi pi-check" :disabled="!purchaseCardId || !paymentMethod" @click="confirmPurchase" />
                </div>
            </div>
        </Dialog>

        <!-- 點數歷史對話框 -->
        <Dialog v-model:visible="showHistoryDialog" header="點數歷史記錄" :style="{ width: '80vw' }" :modal="true">
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium">所有交易記錄</h4>
                    <div class="flex gap-2">
                        <Calendar v-model="historyFilter.dateRange" selectionMode="range" placeholder="選擇日期範圍" />
                        <Dropdown v-model="historyFilter.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="類型" />
                        <Button icon="pi pi-search" @click="applyHistoryFilter" />
                        <Button icon="pi pi-filter-slash" text @click="resetHistoryFilter" />
                    </div>
                </div>
                
                <DataTable :value="filteredHistoryRecords" stripedRows responsiveLayout="stack" :paginator="true" :rows="10"
                    class="p-datatable-sm" emptyMessage="無交易記錄">
                    <Column field="date" header="日期" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.date) }}
                        </template>
                    </Column>
                    <Column field="time" header="時間">
                        <template #body="{ data }">
                            {{ formatTime(data.date) }}
                        </template>
                    </Column>
                    <Column field="type" header="類型" sortable>
                        <template #body="{ data }">
                            <Tag :severity="getTypeSeverity(data.type)" :value="getTypeLabel(data.type)" />
                        </template>
                    </Column>
                    <Column field="description" header="說明" />
                    <Column field="points" header="點數" sortable>
                        <template #body="{ data }">
                            <span :class="data.type === 'add' ? 'text-green-600' : 'text-red-600'">
                                {{ data.type === 'add' ? '+' : '-' }}{{ data.points }}
                            </span>
                        </template>
                    </Column>
                    <Column field="balance" header="餘額" sortable />
                    <Column field="remark" header="備註" />
                </DataTable>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="showHistoryDialog = false" outlined />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
    points: {
        type: Number,
        required: true
    },
    pointsHistory: {
        type: Array as PropType<any[]>,
        required: true
    },
    pointsCards: {
        type: Array as PropType<any[]>,
        required: true
    }
});

const emit = defineEmits(['purchase']);
const toast = useToast();
const confirm = useConfirm();

// 點數相關狀態
const expiringPoints = ref(50); // 即將到期的點數
const expiryDate = ref('2023/12/31'); // 到期日期

// 卡片選擇狀態
const selectedCard = ref<number | null>(null);
const showPurchaseDialog = ref(false);
const purchaseCardId = ref<number | null>(null);
const paymentMethod = ref<string | null>(null);

// 歷史記錄對話框
const showHistoryDialog = ref(false);

// 篩選條件
const filter = ref({
    month: '',
    type: ''
});

const historyFilter = ref({
    dateRange: null,
    type: ''
});

// 月份選項
const monthOptions = [
    { label: '全部月份', value: '' },
    { label: '1月', value: '01' },
    { label: '2月', value: '02' },
    { label: '3月', value: '03' },
    { label: '4月', value: '04' },
    { label: '5月', value: '05' },
    { label: '6月', value: '06' },
    { label: '7月', value: '07' },
    { label: '8月', value: '08' },
    { label: '9月', value: '09' },
    { label: '10月', value: '10' },
    { label: '11月', value: '11' },
    { label: '12月', value: '12' }
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
const paymentMethods = [
    { label: '信用卡', value: 'credit', icon: 'pi pi-credit-card' },
    { label: '銀行轉帳', value: 'bank', icon: 'pi pi-wallet' },
    { label: '行動支付', value: 'mobile', icon: 'pi pi-mobile' }
];

// 篩選後的點數歷史
const filteredPointsHistory = computed(() => {
    let result = [...props.pointsHistory];
    
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
    
    return result.slice(0, 5); // 只顯示最近5筆
});

// 篩選後的歷史記錄
const filteredHistoryRecords = computed(() => {
    let result = [...props.pointsHistory];
    
    // 日期範圍篩選
    if (historyFilter.value.dateRange && historyFilter.value.dateRange[0] && historyFilter.value.dateRange[1]) {
        const startDate = new Date(historyFilter.value.dateRange[0]);
        const endDate = new Date(historyFilter.value.dateRange[1]);
        
        result = result.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }
    
    // 類型篩選
    if (historyFilter.value.type) {
        result = result.filter(item => item.type === historyFilter.value.type);
    }
    
    return result;
});

// 選中卡片的價格
const selectedCardPrice = computed(() => {
    if (!purchaseCardId.value) return 0;
    const card = props.pointsCards.find(card => card.id === purchaseCardId.value);
    return card ? card.price : 0;
});

// 選擇卡片
const selectCard = (cardId: number) => {
    selectedCard.value = cardId;
};

// 購買卡片
const purchaseCard = (cardId: number) => {
    purchaseCardId.value = cardId;
    showPurchaseDialog.value = true;
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
        emit('purchase', purchaseCardId.value);
        
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
const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 格式化時間
const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 獲取交易類型標籤
const getTypeLabel = (type: string) => {
    switch (type) {
        case 'add': return '儲值';
        case 'use': return '消費';
        case 'reward': return '獎勵';
        case 'expire': return '過期';
        default: return type;
    }
};

// 獲取交易類型嚴重性
const getTypeSeverity = (type: string) => {
    switch (type) {
        case 'add': return 'success';
        case 'use': return 'info';
        case 'reward': return 'warning';
        case 'expire': return 'danger';
        default: return 'secondary';
    }
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