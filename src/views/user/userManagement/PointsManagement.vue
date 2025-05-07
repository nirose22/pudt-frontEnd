<template>
    <div class="h-full w-full">
        <Toast />
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
        <ConfirmDialog class="max-w-lg w-full"/>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card v-for="pkg in pointsCards" :key="pkg.id"
                class="rounded-lg !shadow-md !bg-blue-50 transition-shadow">
                <template #title>
                    <h4 class="text-lg text-sky-600">{{ pkg.name }}</h4>
                </template>
                <template #content>
                    <p class="text-3xl font-bold">{{ pkg.points }} <span class="text-sm font-normal">點</span></p>
                    <p class="text-gray-600 my-2">{{ pkg.description }}</p>
                    <div class="flex items-baseline">
                        <span class="text-xl font-bold">NT$ {{ pkg.price }}</span>
                        <span v-if="pkg.discount" class="ml-2 text-sm text-green-600">{{ pkg.discount }}</span>
                    </div>
                </template>
                <template #footer>
                    <Button label="購買" class="w-full" @click="handlePurchase(pkg.id)"/>
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { useUserStore } from '@/stores/userStore';
import { usePointsStore } from '@/stores/pointsStore';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { formatDateString } from '@/utils/common';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const userStore = useUserStore();
const confirm = useConfirm();
const toast = useToast();
const profile = userStore.profile;
const points = userStore.points;

const pointsStore = usePointsStore();
const showHistory = ref(false);

onMounted(() => {
  pointsStore.init()  // 一次拉歷史 + 課卡包
})
// 點數套餐
const pointsCards = pointsStore.pointsCards;
// 點數歷史
const pointsHistory = pointsStore.pointsHistory;

const handlePurchase = (cardId) => {
    if (!profile.value) return;
    confirm.require({
        message: `確認購買課卡點數? 將扣除 ${pointsCards.value.find(pkg => pkg.id === cardId).price} 元`,
        header: '提示',
        acceptLabel: '確認',
        rejectLabel: '取消',
        acceptClass: 'p-button-primary p-button-lg',
        rejectClass: 'p-button-secondary p-button-lg',
        accept: async () => {
            if (cardId && profile.value) {
                const res = await pointsStore.buyPointsCard(cardId)
                if (res.success) {
                    toast.add({ 
                        severity: 'success', 
                        summary: '成功', 
                        detail: res.message, 
                        life: 3000 
                    });
                } else {
                    toast.add({ 
                        severity: 'error', 
                        summary: '失敗', 
                        detail: res.message || '購買點數失敗', 
                        life: 3000 
                    });
                }
            }
        },
        reject: () => {
            // 用戶取消，不執行任何動作
        }
    });
}

</script>