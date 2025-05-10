<template>
    <div class="h-full w-full">
        <h2 class="text-2xl font-bold mb-6">點數與課卡管理</h2>

        <div class="bg-blue-50 p-6 rounded-lg mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-base font-medium text-gray-800">目前點數餘額</h3>
                    <p class="text-2xl font-bold text-sky-600 mt-2">{{ points }} 點</p>
                </div>
                <Button label="查看點數歷史" icon="pi pi-history" class="p-button-outlined" @click="showHistory = true" />
            </div>
        </div>
        <h3 class="text-lg font-medium mb-4">購買課卡點數</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card v-for="pc in pointsCards" :key="pc.id"
                class="rounded-lg !shadow-md !bg-blue-50 transition-shadow">
                <template #title>
                    <h4 class="text-lg text-sky-600">{{ cardsLabel(pc.type) }}</h4>
                </template>
                <template #content>
                    <p class="text-3xl font-bold">{{ pc.points }} <span class="text-sm font-normal">點</span></p>
                    <p class="text-gray-600 my-2">{{ pc.description }}</p>
                    <div class="flex items-baseline">
                        <span class="text-xl font-bold">NT$ {{ pc.price }}</span>
                        <span v-if="pc.discount" class="ml-2 text-sm text-green-600">{{ pc.discount }}</span>
                    </div>
                </template>
                <template #footer>
                    <Button label="購買" class="w-full" @click="handlePurchase(pc.id)"/>
                </template>
            </Card>
        </div>

        <!-- 點數歷史對話框 -->
        <Dialog v-model:visible="showHistory" header="點數使用歷史" :style="{ width: '80%' }">
            <DataTable :value="pointsHistory" stripedRows paginator :rows="5">
                <Column field="date" header="日期">
                    <template #body="{ data }">
                        {{ formatDateString(data.date) }}
                    </template>
                </Column>
                <Column field="type" header="類型" />
                <Column field="description" header="描述" />
                <Column field="points" header="點數變動">
                    <template #body="{ data }">
                        <span :class="data.points > 0 ? 'text-green-600' : 'text-red-600'">
                            {{ data.points > 0 ? '+' : '' }}{{ data.points }}
                        </span>
                    </template>
                </Column>
                <Column field="balance" header="餘額" />
            </DataTable>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, toRef, type PropType } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { formatDateString } from '@/utils/date';
import type { PointsCard, PointHistoryItem } from '@/types';
import { CardTypeLabel, CardType } from '@/enums/Cards';

const props = defineProps({
    points: {
        type: Number,
        required: true
    },
    pointsCards: {
        type: Array as PropType<PointsCard[]>,
        required: true
    },
    pointsHistory: {
        type: Array as PropType<PointHistoryItem[]>,
        required: true
    }
})
const points = toRef(props, 'points');
const pointsCards = toRef(props, 'pointsCards');
const pointsHistory = toRef(props, 'pointsHistory');

const showHistory = ref(false);
const emit = defineEmits(['purchase']);

const handlePurchase = (cardId: number) => {
    emit('purchase', cardId);
}

const cardsLabel = (type: CardType) => {
    return CardTypeLabel[type];
}
</script>