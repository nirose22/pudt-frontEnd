<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold">購買紀錄</h2>

        <!-- 消費統計卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-blue-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">總消費金額</div>
                        <div class="text-2xl font-bold">NT$ {{ purchaseStats.totalAmount }}</div>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="pi pi-dollar text-blue-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-green-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">總購買點數</div>
                        <div class="text-2xl font-bold">{{ purchaseStats.totalPoints }}</div>
                    </div>
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="pi pi-ticket text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-purple-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">購買次數</div>
                        <div class="text-2xl font-bold">{{ purchaseStats.totalOrders }}</div>
                    </div>
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="pi pi-shopping-cart text-purple-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选选项 -->
        <div class="card h-full flex flex-col gap-4">
            <!-- 過濾器區域 -->
            <div class="flex flex-wrap gap-3 items-end">
                <!-- 日期範圍篩選 -->
                <div class="flex-grow md:w-auto md:flex-grow-0">
                    <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" @change="handleDateRangeChange"
                        @apply="applyFilters" @reset="resetFilters" />
                </div>
                
                <!-- 課卡類型篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1">課卡類型</label>
                    <Dropdown v-model="filters.cardType" :options="cardTypeOptions" 
                        optionLabel="label" optionValue="value" placeholder="選擇課卡類型" class="w-full md:w-40" />
                </div>
                
                <!-- 狀態篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1">狀態</label>
                    <Dropdown v-model="filters.status" :options="statusOptions" 
                        optionLabel="label" optionValue="value" placeholder="選擇狀態" class="w-full md:w-40" />
                </div>
                
                <!-- 付款方式篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1">付款方式</label>
                    <Dropdown v-model="filters.paymentMethod" :options="paymentMethodOptions" 
                        optionLabel="label" optionValue="value" placeholder="選擇付款方式" class="w-full md:w-40" />
                </div>
                
                <!-- 搜尋 -->
                <div class="w-full md:w-auto flex-grow md:flex-grow-0">
                    <span class="p-input-icon-left w-full">
                        <i class="pi pi-search" />
                        <InputText v-model="filters.search" placeholder="搜尋訂單編號" class="w-full" />
                    </span>
                </div>
                
                <!-- 應用按鈕 -->
                <div class="w-full md:w-auto">
                    <Button label="應用篩選" icon="pi pi-filter" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" outlined class="ml-2" @click="resetAllFilters" />
                </div>
            </div>

            <!-- 數據表格 -->
            <div class="flex flex-col flex-1 overflow-hidden">
                <DataTable :value="filteredPurchaseHistory" stripedRows paginator :rows="10" responsiveLayout="stack"
                    :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    class="!flex-1 flex flex-col p-datatable-sm">
                    <Column field="id" header="訂單編號" sortable />
                    <Column field="cardType" header="課卡名稱" sortable>
                        <template #body="{ data }">
                            {{ getCardType(data.cardType) }}
                        </template>
                    </Column>
                    <Column field="points" header="點數" sortable />
                    <Column field="amount" header="金額" sortable>
                        <template #body="{ data }">
                            NT$ {{ data.amount }}
                        </template>
                    </Column>
                    <Column field="date" header="購買日期" sortable>
                        <template #body="{ data }">
                            {{ formatDateString(data.date) }}
                        </template>
                    </Column>
                    <Column field="paymentMethod" header="付款方式" sortable>
                        <template #body="{ data }">
                            <Tag :severity="getPaymentSeverity(data.paymentMethod)"
                                :value="getPaymentMethod(data.paymentMethod)" />
                        </template>
                    </Column>
                    <Column field="status" header="狀態" sortable>
                        <template #body="{ data }">
                            <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
                        </template>
                    </Column>
                    <Column field="action" header="操作">
                        <template #body="{ data }">
                            <div class="flex gap-1">
                                <Button icon="pi pi-eye" text rounded aria-label="查看詳情" @click="viewPurchaseDetail(data)" />
                                <Button icon="pi pi-file-pdf" text rounded aria-label="下載發票" 
                                    :disabled="!data.invoiceAvailable" @click="downloadInvoice(data)" />
                            </div>
                        </template>
                    </Column>

                    <template #empty>
                        <div class="text-center p-6 bg-gray-50 rounded-lg">
                            <i class="pi pi-shopping-bag text-4xl text-gray-400 mb-2"></i>
                            <p class="text-gray-500">尚無購買紀錄</p>
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
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { formatDateString, inRange } from '@/utils/date';
import { OrderStatus, PaymentMethod, OrderStatusLabel, PaymentMethodLabel } from '@/enums/PurchaseStatus';
import { CardType, CardTypeLabel } from '@/enums/Cards';
import type { PurchaseItem } from '@/types/purchaseItem';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

// 定義介面
interface FilterOption {
    label: string;
    value: string | number | null;
}

// 扩展 PurchaseItem 类型
interface ExtendedPurchaseItem extends PurchaseItem {
    invoiceAvailable?: boolean;
    invoiceNumber?: string;
    invoiceDate?: string;
    paymentDate?: string;
    expiry?: string;
}

const props = defineProps<{
    purchaseHistory: ExtendedPurchaseItem[]
}>();

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

// 課卡類型選項
const cardTypeOptions = Object.entries(CardTypeLabel).map(([value, label]) => ({
    label,
    value: parseInt(value)
}));

// 狀態選項
const statusOptions = [
    { label: '全部狀態', value: null },
    ...Object.entries(OrderStatusLabel).map(([value, label]) => ({
        label,
        value: parseInt(value)
    }))
];

// 付款方式選項
const paymentMethodOptions = [
    { label: '全部付款方式', value: null },
    ...Object.entries(PaymentMethodLabel).map(([value, label]) => ({
        label,
        value: parseInt(value)
    }))
];

// 購買統計
const purchaseStats = computed(() => {
    const totalAmount = props.purchaseHistory.reduce((sum, item) => sum + item.amount, 0);
    const totalPoints = props.purchaseHistory.reduce((sum, item) => sum + item.points, 0);
    const totalOrders = props.purchaseHistory.length;
    
    return {
        totalAmount: totalAmount.toLocaleString(),
        totalPoints: totalPoints.toLocaleString(),
        totalOrders
    };
});

// 篩選後的數據
const filteredPurchaseHistory = computed(() => {
    let filtered = [...props.purchaseHistory];
    
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

// 處理日期範圍變更
const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
};

// 應用篩選器
const applyFilters = () => {
    loading.value = true;
    setTimeout(() => loading.value = false, 500);
};

// 重置篩選器
const resetFilters = () => {
    range.value = null;
    startDate.value = undefined;
    endDate.value = undefined;
    loading.value = true;
    setTimeout(() => loading.value = false, 500);
};

// 重置所有篩選器
const resetAllFilters = () => {
    resetFilters();
    filters.value = {
        search: '',
        cardType: null,
        status: null,
        paymentMethod: null
    };
    applyFilters();
};

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
    // 使用数字枚举值进行比较
    switch (Number(cardType)) {
        case 0: // CardType.Standard
            return '標準課卡，適用於所有常規課程';
        case 1: // CardType.Premium
            return '高級課卡，包含專屬課程與優先預約';
        case 2: // CardType.Limited
            return '限時課卡，有效期限較短但價格優惠';
        case 3: // CardType.Special
            return '特別課卡，針對特定活動或課程設計';
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
    @apply bg-white border border-gray-100 rounded-lg p-4;
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
</style>