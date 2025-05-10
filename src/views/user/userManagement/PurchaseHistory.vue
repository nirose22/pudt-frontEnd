<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold">購買紀錄</h2>
        <!-- 筛选选项 -->
        <div class="card h-full flex flex-col gap-4">
            <div class="w-2/3">
                <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" @change="handleDateRangeChange"
                    @apply="applyFilters" @reset="resetFilters" />
            </div>
            <!-- 數據表格 -->
            <div class="flex flex-col flex-1 overflow-hidden">
                <DataTable :value="filteredPurchaseHistory" stripedRows paginator :rows="12" responsiveLayout="scroll"
                    filterDisplay="menu" :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    class="!flex-1 flex flex-col">
                    <Column field="id" header="訂單編號" />
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
                    <Column field="action" header="查看详情">
                        <template #body="{ data }">
                            <Button icon="pi pi-eye" text rounded aria-label="查看详情" @click="viewPurchaseDetail(data)" />
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
                :style="{ width: '50vw' }">
                <div v-if="selectedPurchase" class="space-y-4">
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
                            <span>{{ formatDateString(selectedPurchase.date as string) }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">付款方式：</span>
                            <Tag :severity="getPaymentSeverity(selectedPurchase.paymentMethod as PurchasePaymentMethod)"
                                :value="getPaymentMethod(selectedPurchase.paymentMethod as PurchasePaymentMethod)" />
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">狀態：</span>
                            <Tag :severity="getStatusSeverity(selectedPurchase.status)"
                                :value="getStatusLabel(selectedPurchase.status)" />
                        </div>
                    </div>

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
                    <Button v-if="selectedPurchase?.status === PurchaseStatus.Unpaid" label="重新支付" icon="pi pi-credit-card"
                        @click="repayPurchase" />
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
import { PurchasePaymentMethod, PurchasePaymentMethodLabel, PurchaseStatus, PurchaseStatusLabel } from '@/enums/Purchase';
import { CardType, CardTypeLabel } from '@/enums/Cards';
import type { PurchaseItem } from '@/types/purchaseItem';

const props = defineProps<{
    purchaseHistory: any[]
}>();

const toast = useToast();
const loading = ref(false);
const selectedPurchase = ref<PurchaseItem | null>(null);
const showDetailDialog = ref(false);

// 日期範圍
const startDate = ref<Date>();
const endDate = ref<Date>();
const range = ref<{ start: Date; end: Date } | null>(null);

// 篩選後的數據
const filteredPurchaseHistory = computed(() => {
    if (!range.value) {
        return props.purchaseHistory;
    }
    // 使用 utils/date.ts 中的 inRange 函數進行日期範圍篩選
    return inRange(range.value.start, range.value.end, props.purchaseHistory);
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
    loading.value = true;
    setTimeout(() => loading.value = false, 500);
};

// 查看购买详情
const viewPurchaseDetail = (purchase: PurchaseItem) => {
    selectedPurchase.value = purchase;
    showDetailDialog.value = true;
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

// 支付方式名称
const getPaymentMethod = (paymentMethod: PurchasePaymentMethod) => {
    return PurchasePaymentMethodLabel[paymentMethod] || '未知';
};

// 支付方式样式
const getPaymentSeverity = (paymentMethod: PurchasePaymentMethod) => {
    switch (paymentMethod) {
        case PurchasePaymentMethod.CreditCard:
            return 'info';
        case PurchasePaymentMethod.BankTransfer:
            return 'success';
        case PurchasePaymentMethod.MobilePayment:
            return 'warning';
        case PurchasePaymentMethod.Cash:
            return 'secondary';
        default:
            return 'info';
    }
};

// 状态标签
const getStatusLabel = (status: PurchaseStatus) => {
    return PurchaseStatusLabel[status] || '未知';
};

// 状态样式
const getStatusSeverity = (status: PurchaseStatus) => {
    switch (status) {
        case PurchaseStatus.Paid:
            return 'success';
        case PurchaseStatus.Unpaid:
            return 'warning';
        case PurchaseStatus.Refunded:
            return 'danger';
        case PurchaseStatus.Cancelled:
            return 'info';
        default:
            return 'secondary';
    }
};

onMounted(() => {
    // 如果需要，可以在这里加载初始数据
});
</script>

<style scoped>
::v-deep(.p-datatable > .p-datatable-table-container) {
    flex: 1;
}
</style>