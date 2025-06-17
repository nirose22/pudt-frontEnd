<template>
    <Dialog v-model:visible="visible" header="點數歷史記錄" :style="{ width: '80vw' }" :modal="true">
        <div class="p-4">
            <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium">所有交易記錄</h4>
                <div class="flex gap-2">
                    <Calendar v-model="localHistoryFilter.dateRange" selectionMode="range" placeholder="選擇日期範圍" />
                    <Select v-model="localHistoryFilter.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="類型" />
                    <Button icon="pi pi-search" @click="onApplyFilter" />
                    <Button icon="pi pi-filter-slash" text @click="onResetFilter" />
                </div>
            </div>
            
            <DataTable :value="pointsHistory" stripedRows responsiveLayout="stack" :paginator="true" :rows="10"
                class="p-datatable-sm" emptyMessage="無交易記錄">
                <Column field="createdAt" header="日期" sortable>
                    <template #body="{ data }">
                        {{ formatDate(data.createdAt) }}
                    </template>
                </Column>
                <Column field="createdAt" header="時間">
                    <template #body="{ data }">
                        {{ formatTime(data.createdAt) }}
                    </template>
                </Column>
                <Column field="kind" header="類型" sortable>
                    <template #body="{ data }">
                        <Tag :severity="getTypeSeverity(data.kind)" :value="getTypeLabel(data.kind)" />
                    </template>
                </Column>
                <Column field="note" header="說明" />
                <Column field="amount" header="點數" sortable>
                    <template #body="{ data }">
                        <span :class="isPositiveType(data.kind) ? 'text-green-600' : 'text-red-600'">
                            {{ isPositiveType(data.kind) ? '+' : '-' }}{{ data.amount }}
                        </span>
                    </template>
                </Column>
                <Column field="balance" header="餘額" sortable />
                <Column field="refType" header="關聯類型" />
            </DataTable>
        </div>
        <template #footer>
            <Button label="關閉" icon="pi pi-times" @click="onClose" outlined />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';

// 定義數據類型
interface PointTransaction {
    id: number;
    userId: number;
    kind: string;
    amount: number;
    balance: number;
    refType: string;
    refId?: number;
    note: string;
    createdAt: string;
}

interface HistoryFilterOptions {
    dateRange: null | Date[];
    type: string;
}

interface FilterOption {
    label: string;
    value: string;
}

const visible = defineModel<boolean>('visible', { required: true });

const props = defineProps({
    pointsHistory: {
        type: Array as PropType<PointTransaction[]>,
        required: true
    },
    typeOptions: {
        type: Array as PropType<FilterOption[]>,
        required: true
    },
    historyFilter: {
        type: Object as PropType<HistoryFilterOptions>,
        required: true
    }
});

const emit = defineEmits([
    'update:history-filter',
    'apply-filter',
    'reset-filter',
    'close'
]);

// 本地過濾器狀態
const localHistoryFilter = ref<HistoryFilterOptions>({
    dateRange: props.historyFilter.dateRange,
    type: props.historyFilter.type
});

// 監聽父組件傳入的過濾器變化
watch(() => props.historyFilter, (newValue) => {
    localHistoryFilter.value = {
        dateRange: newValue.dateRange,
        type: newValue.type
    };
}, { deep: true });

// 判斷正向交易類型 (增加點數)
const isPositiveType = (type: string): boolean => {
    return ['add', 'reward'].includes(type);
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

// 格式化日期
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 格式化時間
const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 應用過濾器
const onApplyFilter = () => {
    emit('update:history-filter', localHistoryFilter.value);
    emit('apply-filter');
};

// 重置過濾器
const onResetFilter = () => {
    localHistoryFilter.value = {
        dateRange: null,
        type: ''
    };
    emit('update:history-filter', localHistoryFilter.value);
    emit('reset-filter');
};

// 關閉對話框
const onClose = () => {
    emit('close');
};
</script>

<style scoped>
@reference "tailwindcss";

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