<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold text-sky-700 flex items-center">
            <i class="pi pi-shopping-cart mr-2"></i>購買紀錄
        </h2>

        <!-- 消費統計卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-sky-500 bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">總消費金額</div>
                        <div class="text-2xl font-bold text-sky-700">NT$ {{ purchaseStats.totalAmount }}</div>
                    </div>
                    <div class="bg-sky-100 p-3 rounded-full">
                        <i class="pi pi-dollar text-sky-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-green-500 bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">總購買點數</div>
                        <div class="text-2xl font-bold text-green-600">{{ purchaseStats.totalPoints }}</div>
                    </div>
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="pi pi-ticket text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-purple-500 bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">購買次數</div>
                        <div class="text-2xl font-bold text-purple-600">{{ purchaseStats.totalOrders }}</div>
                    </div>
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="pi pi-shopping-cart text-purple-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 篩選條件和數據表格 -->
        <div class="card h-full flex flex-col gap-4 bg-white rounded-lg shadow-sm border border-sky-100 p-4">
            <!-- 優化的過濾器區域 -->
            <div class="flex flex-wrap gap-3 items-end bg-sky-50 p-3 rounded-lg border border-sky-100">
                <!-- 日期範圍篩選 - 改為即時篩選 -->
                <div class="flex-grow md:w-auto md:flex-grow-0">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">日期範圍</label>
                    <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" 
                        @change="handleDateRangeChange" :show-controls="false"
                        class="w-full" />
                </div>
                
                <!-- 課卡類型篩選 - 改為即時篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">課卡類型</label>
                    <Select v-model="filters.cardType" :options="cardTypeOptions" 
                        optionLabel="label" optionValue="value" placeholder="選擇課卡類型" 
                        class="w-full md:w-40" @change="applyFilters"  size="small" />
                </div>
                
                <!-- 狀態篩選 - 改為即時篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">狀態</label>
                    <Select v-model="filters.status" :options="statusOptions" 
                        optionLabel="label" optionValue="value" placeholder="選擇狀態" 
                        class="w-full md:w-40" @change="applyFilters"  size="small" />
                </div>
                
                <!-- 付款方式篩選 - 改為即時篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">付款方式</label>
                    <Select v-model="filters.paymentMethod" :options="paymentMethodOptions" 
                        optionLabel="label" optionValue="value" placeholder="選擇付款方式" 
                        class="w-full md:w-40" @change="applyFilters"  size="small" />
                </div>
                
                <!-- 搜尋 - 調整為防抖立即查詢 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">關鍵字搜尋</label>
                    <IconField class="w-full">
                        <InputIcon class="pi pi-search text-sky-400" />
                        <InputText v-model="filters.search" placeholder="搜尋訂單編號..." 
                            class="w-full border-sky-200 focus:border-sky-500"
                            @input="debounceSearch"  size="small" />
                    </IconField>
                </div>
                
                <!-- 只保留重置按鈕 -->
                <div class="w-full md:w-auto flex items-end">
                    <Button label="重置篩選" icon="pi pi-refresh" outlined 
                        @click="resetAllFilters" class="!border-sky-500 !text-sky-500 hover:!bg-sky-50" />
                </div>
            </div>

            <!-- 數據表格 -->
            <div class="flex flex-col flex-1 overflow-hidden">
                <DataTable :value="filteredPurchaseHistory" stripedRows paginator :rows="10" responsiveLayout="stack"
                    :loading="loading" 
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    class="!flex-1 flex flex-col p-datatable-sm">
                    <Column field="id" header="訂單編號" sortable headerClass="bg-sky-50 text-sky-700" />
                    <Column field="cardType" header="課卡名稱" sortable headerClass="bg-sky-50 text-sky-700">
                            <template #body="{ data }">
                                {{ getCardType(data.cardType) }}
                            </template>
                        </Column>
                    <Column field="points" header="點數" sortable headerClass="bg-sky-50 text-sky-700" />
                    <Column field="amount" header="金額" sortable headerClass="bg-sky-50 text-sky-700">
                            <template #body="{ data }">
                                NT$ {{ data.amount }}
                            </template>
                        </Column>
                    <Column field="date" header="購買日期" sortable headerClass="bg-sky-50 text-sky-700">
                            <template #body="{ data }">
                                {{ formatDateString(data.date) }}
                            </template>
                        </Column>
                    <Column field="paymentMethod" header="付款方式" sortable headerClass="bg-sky-50 text-sky-700">
                        <template #body="{ data }">
                            <Tag :severity="getPaymentSeverity(data.paymentMethod)"
                                :value="getPaymentMethod(data.paymentMethod)" />
                        </template>
                    </Column>
                    <Column field="status" header="狀態" sortable headerClass="bg-sky-50 text-sky-700">
                        <template #body="{ data }">
                            <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
                        </template>
                    </Column>
                    <Column field="action" header="操作" headerClass="bg-sky-50 text-sky-700">
                            <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" text rounded aria-label="查看詳情" 
                                    @click="viewPurchaseDetail(data)" class="text-sky-500 hover:bg-sky-50" />
                                <Button icon="pi pi-file-pdf" text rounded aria-label="下載發票" 
                                    :disabled="!data.invoiceAvailable" @click="downloadInvoice(data)" 
                                    class="text-sky-500 hover:bg-sky-50" />
                            </div>
                            </template>
                        </Column>

                    <template #empty>
                        <div class="text-center p-6 bg-sky-50 rounded-lg border border-sky-100">
                            <i class="pi pi-shopping-bag text-4xl text-sky-200 mb-2"></i>
                            <p class="text-sky-600">尚無購買紀錄</p>
                        </div>
                    </template>
                    </DataTable>
            </div>

            <!-- 详情对话框 -->
            <Dialog v-model:visible="showDetailDialog" header="購買詳情" :modal="true" :closable="true"
                :style="{ width: '500px' }">
                <div v-if="selectedPurchase" class="space-y-4">
                    <!-- 訂單狀態標籤 -->
                    <div class="flex justify-center mb-2">
                        <Tag :severity="getStatusSeverity(selectedPurchase.status)" 
                            :value="getStatusLabel(selectedPurchase.status)" 
                            class="text-lg px-4 py-2" />
                    </div>

                    <!-- 訂單基本信息 -->
                    <div class="p-3 border rounded-lg bg-gray-50">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">訂單編號：</span>
                            <span class="font-medium">{{ selectedPurchase.id }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">課卡名稱：</span>
                            <span>{{ getCardType(selectedPurchase.cardType) }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">點數：</span>
                            <span>{{ selectedPurchase.points }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">金額：</span>
                            <span class="font-bold text-primary-600">NT$ {{ selectedPurchase.amount }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">購買日期：</span>
                            <span>{{ formatDateString(String(selectedPurchase.date)) }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">付款方式：</span>
                            <Tag v-if="selectedPurchase.paymentMethod !== undefined" 
                                :severity="getPaymentSeverity(selectedPurchase.paymentMethod)"
                                :value="getPaymentMethod(selectedPurchase.paymentMethod)" />
                            <span v-else>未指定</span>
                        </div>
                        <div class="flex justify-between mb-2" v-if="selectedPurchase.paymentDate">
                            <span class="text-gray-600">付款日期：</span>
                            <span>{{ formatDateString(selectedPurchase.paymentDate) }}</span>
                        </div>
                        <div class="flex justify-between" v-if="selectedPurchase.invoiceNumber">
                            <span class="text-gray-600">發票號碼：</span>
                            <span>{{ selectedPurchase.invoiceNumber }}</span>
                        </div>
                    </div>

                    <!-- 課卡詳情 -->
                    <div class="p-3 border rounded-lg">
                        <h3 class="font-medium mb-2">課卡詳情</h3>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="bg-primary-100 p-2 rounded-full">
                                <i class="pi pi-ticket text-primary-500 text-xl"></i>
                            </div>
                            <div>
                                <div class="font-medium">{{ getCardType(selectedPurchase.cardType) }}</div>
                                <div class="text-sm text-gray-500">{{ getCardDescription(selectedPurchase.cardType) }}</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div class="bg-gray-50 p-2 rounded">
                                <div class="text-gray-500">點數</div>
                                <div class="font-medium">{{ selectedPurchase.points }} 點</div>
                            </div>
                            <div class="bg-gray-50 p-2 rounded">
                                <div class="text-gray-500">有效期限</div>
                                <div class="font-medium">{{ selectedPurchase.expiry || '無限期' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 發票資訊 -->
                    <div class="p-3 border rounded-lg" v-if="selectedPurchase.invoiceAvailable">
                        <h3 class="font-medium mb-2">發票資訊</h3>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">發票號碼：</span>
                            <span>{{ selectedPurchase.invoiceNumber || '處理中' }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">開立日期：</span>
                            <span>{{ selectedPurchase.invoiceDate ? formatDateString(selectedPurchase.invoiceDate) : (selectedPurchase ? formatDateString(String(selectedPurchase.date)) : '') }}</span>
                        </div>
                        <div class="flex justify-center mt-3">
                            <Button icon="pi pi-file-pdf" label="下載電子發票" 
                                @click="downloadInvoice(selectedPurchase)" 
                                :disabled="!selectedPurchase.invoiceNumber" />
                        </div>
                    </div>

                    <!-- 交易憑證 -->
                    <div class="p-3 border rounded-lg">
                        <h3 class="font-medium mb-2">交易憑證</h3>
                        <div class="flex justify-center">
                            <div class="h-40 w-60 bg-gray-200 flex items-center justify-center">
                                <i class="pi pi-image text-4xl text-gray-400"></i>
                                <span class="ml-2 text-gray-500">無憑證圖片</span>
                            </div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" outlined />
                    <Button v-if="selectedPurchase?.status === OrderStatus.Pending" label="重新支付" icon="pi pi-credit-card"
                        @click="repayPurchase" />
                    <Button v-if="selectedPurchase?.status === OrderStatus.Paid && selectedPurchase?.invoiceAvailable" 
                        label="下載發票" icon="pi pi-file-pdf" @click="downloadInvoice(selectedPurchase)" />
                            </template>
            </Dialog>

            <!-- 發票預覽對話框 -->
            <Dialog v-model:visible="showInvoiceDialog" header="電子發票預覽" :modal="true" :closable="true"
                :style="{ width: '600px' }">
                <div class="p-4">
                    <div class="bg-gray-100 p-6 rounded-lg border border-gray-300">
                        <div class="text-center mb-4">
                            <h3 class="text-xl font-bold">電子發票</h3>
                            <div class="text-sm text-gray-500">{{ selectedPurchase?.invoiceNumber || 'AW-12345678' }}</div>
                        </div>
                        
                        <div class="border-b border-gray-300 pb-3 mb-3">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <div class="text-sm text-gray-600">開立日期</div>
                                    <div>{{ selectedPurchase?.invoiceDate ? formatDateString(selectedPurchase.invoiceDate) : (selectedPurchase ? formatDateString(String(selectedPurchase.date)) : '') }}</div>
                                </div>
                                <div>
                                    <div class="text-sm text-gray-600">賣方統一編號</div>
                                    <div>12345678</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="border-b border-gray-300 pb-3 mb-3">
                            <div class="font-medium mb-2">商品明細</div>
                            <table class="w-full text-sm">
                                <thead class="bg-gray-200">
                                    <tr>
                                        <th class="p-2 text-left">品項</th>
                                        <th class="p-2 text-right">數量</th>
                                        <th class="p-2 text-right">單價</th>
                                        <th class="p-2 text-right">小計</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="p-2">{{ selectedPurchase ? getCardType(selectedPurchase.cardType) : '標準課卡' }}</td>
                                        <td class="p-2 text-right">1</td>
                                        <td class="p-2 text-right">NT$ {{ selectedPurchase?.amount || 0 }}</td>
                                        <td class="p-2 text-right">NT$ {{ selectedPurchase?.amount || 0 }}</td>
                                    </tr>
                                </tbody>
                                <tfoot class="border-t border-gray-300">
                                    <tr>
                                        <td colspan="3" class="p-2 text-right font-medium">總計</td>
                                        <td class="p-2 text-right font-bold">NT$ {{ selectedPurchase?.amount || 0 }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div class="text-center text-sm text-gray-500">
                            <p>本發票已存入雲端，可至財政部電子發票整合服務平台查詢</p>
                            <p>https://www.einvoice.nat.gov.tw</p>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="關閉" icon="pi pi-times" @click="showInvoiceDialog = false" outlined />
                    <Button label="下載 PDF" icon="pi pi-download" @click="downloadInvoicePDF" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue';
import type { PropType } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { formatDateString, inRange } from '@/utils/date';
import { OrderStatus, PaymentMethod, OrderStatusLabel, PaymentMethodLabel } from '@/enums/PurchaseStatus';
import { CardType, CardTypeLabel } from '@/enums/Cards';
import type { PurchaseItem, ExtendedPurchaseItem } from '@/types/purchaseItem';
import { PurchaseService } from '@/service/PurchaseService';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button';

// 定义inject数据接口
interface PurchaseDataInject {
    purchaseHistory: { value: ExtendedPurchaseItem[] };
    unpaidRecords: { value: ExtendedPurchaseItem[] };
}

// 使用inject获取数据
const purchaseData = inject<PurchaseDataInject>('purchaseData');
const purchaseHistory = computed(() => purchaseData?.purchaseHistory.value || []);
const unpaidRecords = computed(() => purchaseData?.unpaidRecords.value || []);

const toast = useToast();
const loading = ref(false);
const selectedPurchase = ref<ExtendedPurchaseItem | null>(null);
const showDetailDialog = ref(false);
const showInvoiceDialog = ref(false);

// 日期範圍
const startDate = ref<Date>();
const endDate = ref<Date>();
const range = ref<{ start: Date; end: Date } | null>(null);

// 篩選條件
const filters = ref({
    search: '',
    cardType: null as CardType | null,
    status: null as OrderStatus | null,
    paymentMethod: null as PaymentMethod | null
});

// 防抖定時器
let searchTimeout: number | null = null;

// 防抖函數 - 用於搜尋
const debounceSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300) as unknown as number;
};

// 課卡類型選項
const cardTypeOptions = Object.entries(CardTypeLabel).map(([value, label]) => ({
    label,
    value: value
}));

// 狀態選項
const statusOptions = [
    { label: '全部狀態', value: null },
    ...Object.entries(OrderStatusLabel).map(([value, label]) => ({
        label,
        value: value
    }))
];

// 付款方式選項
const paymentMethodOptions = [
    { label: '全部付款方式', value: null },
    ...Object.entries(PaymentMethodLabel).map(([value, label]) => ({
        label,
        value: value
    }))
];

// 購買統計
const purchaseStats = computed(() => {
    return {
        totalAmount: calculateTotalAmount(),
        totalPoints: calculateTotalPoints(),
        totalOrders: purchaseHistory.value.length
    };
});

// 計算總消費金額
const calculateTotalAmount = () => {
    return purchaseHistory.value.reduce((total, item) => total + item.amount, 0);
};

// 計算總購買點數
const calculateTotalPoints = () => {
    return purchaseHistory.value.reduce((total, item) => total + item.points, 0);
};

// 篩選後的數據
const filteredPurchaseHistory = computed(() => {
    let filtered = [...purchaseHistory.value];
    
    // 日期範圍過濾
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered);
    }
    
    // 搜尋過濾
    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filtered = filtered.filter(item => 
            item.id.toString().toLowerCase().includes(searchLower)
        );
    }
    
    // 課卡類型過濾
    if (filters.value.cardType !== null) {
        filtered = filtered.filter(item => item.cardType === filters.value.cardType);
    }
    
    // 狀態過濾
    if (filters.value.status !== null) {
        filtered = filtered.filter(item => item.status === filters.value.status);
    }
    
    // 付款方式過濾
    if (filters.value.paymentMethod !== null) {
        filtered = filtered.filter(item => item.paymentMethod === filters.value.paymentMethod);
    }
    
    return filtered;
});

// 處理日期範圍變更 - 立即應用篩選
const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
    applyFilters();
};

// 應用篩選器
const applyFilters = () => {
    loading.value = true;
    setTimeout(() => loading.value = false, 300);
};

// 重置所有篩選器
const resetAllFilters = () => {
    range.value = null;
    startDate.value = undefined;
    endDate.value = undefined;
    
    filters.value = {
        search: '',
        cardType: null,
        status: null,
        paymentMethod: null
    };
    
    loading.value = true;
    setTimeout(() => loading.value = false, 300);
};

// 監聽篩選條件變更 - 立即應用篩選
watch(() => [filters.value.cardType, filters.value.status, filters.value.paymentMethod], () => {
    applyFilters();
}, { deep: true });

// 查看购买详情
const viewPurchaseDetail = (purchase: ExtendedPurchaseItem) => {
    selectedPurchase.value = purchase;
    showDetailDialog.value = true;
};

// 下載發票
const downloadInvoice = (purchase: ExtendedPurchaseItem) => {
    if (!purchase.invoiceAvailable) {
        toast.add({
            severity: 'warn',
            summary: '無法下載',
            detail: '此訂單尚未生成發票',
            life: 3000
        });
        return;
    }
    
    selectedPurchase.value = purchase;
    showInvoiceDialog.value = true;
};

// 下載發票 PDF
const downloadInvoicePDF = () => {
    toast.add({
        severity: 'info',
        summary: '處理中',
        detail: '正在生成 PDF 檔案...',
        life: 2000
    });
    
    setTimeout(() => {
    toast.add({
        severity: 'success',
            summary: '成功',
            detail: '發票 PDF 已下載',
            life: 3000
        });
        showInvoiceDialog.value = false;
    }, 1500);
};

// 重新支付
const repayPurchase = () => {
    toast.add({
        severity: 'info',
        summary: '功能開發中',
        detail: '重新支付功能正在開發中，請稍後再試',
        life: 3000
    });
};

// 卡片类型名称
const getCardType = (cardType: CardType) => {
    return CardTypeLabel[cardType];
};

// 卡片描述
const getCardDescription = (cardType: CardType) => {
    // 根据卡片类型返回描述文字
    switch (cardType) {
        case CardType.Basic:
            return '基本課卡，適用於所有常規課程';
        case CardType.Advanced:
            return '進階課卡，包含專屬課程與優先預約';
        case CardType.Professional:
            return '專業課卡，有效期限較長並享受優惠';
        case CardType.VIP:
            return 'VIP課卡，針對特定活動或課程設計';
        default:
            return '課卡詳情';
    }
};

// 支付方式名称
const getPaymentMethod = (paymentMethod: PaymentMethod) => {
    return PaymentMethodLabel[paymentMethod] || '未知';
};

// 支付方式样式
const getPaymentSeverity = (paymentMethod: PaymentMethod) => {
    switch (paymentMethod) {
        case PaymentMethod.CreditCard:
            return 'info';
        case PaymentMethod.BankTransfer:
            return 'success';
        case PaymentMethod.MobilePayment:
            return 'warning';
        case PaymentMethod.Cash:
            return 'secondary';
        default:
            return 'info';
    }
};

// 状态标签
const getStatusLabel = (status: OrderStatus) => {
    return OrderStatusLabel[status] || '未知';
};

// 状态样式
const getStatusSeverity = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.Paid:
            return 'success';
        case OrderStatus.Pending:
            return 'warning';
        case OrderStatus.Refunded:
            return 'danger';
        case OrderStatus.Cancelled:
            return 'info';
        default:
            return 'secondary';
    }
};
</script>

<style scoped>
 @reference "tailwindcss";

.card {
    @apply bg-white;
}

:deep(.p-datatable > .p-datatable-table-container) {
    flex: 1;
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

:deep(.p-datepicker:not(.p-disabled):focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-inputtext:enabled:focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-inputtext) {
    @apply border-sky-200;
}

:deep(.p-button.p-button-outlined) {
    @apply border-sky-500 text-sky-500;
}

:deep(.p-button.p-button-outlined:hover) {
    @apply bg-sky-50;
}
</style>