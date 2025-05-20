<template>
    <Dialog v-model:visible="visible" header="儲值點數" :style="{ width: '450px' }" :modal="true">
        <div class="p-4">
            <div class="mb-4">
                <h4 class="font-medium mb-2">選擇點數套餐</h4>
                <div class="grid grid-cols-1 gap-3">
                    <div v-for="card in pointsCards" :key="card.id" 
                        class="border rounded-lg p-3 flex justify-between items-center cursor-pointer"
                        :class="{ 'border-primary-500 bg-primary-50': localPurchaseCardId === card.id }"
                        @click="setCardId(card.id)">
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
                        :class="{ 'border-primary-500 bg-primary-50': localPaymentMethod === method.value }"
                        @click="setPaymentMethod(method.value)">
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
                <Button label="取消" icon="pi pi-times" outlined @click="onCancel" />
                <Button label="確認購買" icon="pi pi-check" :disabled="!localPurchaseCardId || !localPaymentMethod" @click="onPurchase" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PropType } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

// 定義數據類型
interface PointsCard {
    id: number;
    name: string;
    description: string;
    points: number;
    price: number;
    discount?: string;
}

// 付款方式
const paymentMethods = [
    { label: '信用卡', value: 'credit', icon: 'pi pi-credit-card' },
    { label: '銀行轉帳', value: 'bank', icon: 'pi pi-wallet' },
    { label: '行動支付', value: 'mobile', icon: 'pi pi-mobile' }
];

const props = defineProps({
    pointsCards: {
        type: Array as PropType<PointsCard[]>,
        required: true
    },
    purchaseCardId: {
        type: Number,
        default: null
    },
    paymentMethod: {
        type: String,
        default: null
    }
});

const visible = defineModel<boolean>('visible', { required: true });

const emit = defineEmits([
    'update:purchase-card-id',
    'update:payment-method',
    'purchase',
    'cancel'
]);

// 本地狀態，用於雙向綁定
const localPurchaseCardId = ref<number | null>(props.purchaseCardId);
const localPaymentMethod = ref<string | null>(props.paymentMethod);

// 監聽父組件傳入的數據變化
watch(() => props.purchaseCardId, (newValue) => {
    localPurchaseCardId.value = newValue;
});

watch(() => props.paymentMethod, (newValue) => {
    localPaymentMethod.value = newValue;
});

// 監聽visible屬性，重置本地狀態
watch(() => visible.value, (newValue) => {
    if (newValue === false) {
        // 對話框關閉時重置本地狀態
        localPurchaseCardId.value = null;
        localPaymentMethod.value = null;
    }
});

// 選中卡片的價格
const selectedCardPrice = computed(() => {
    if (!localPurchaseCardId.value) return 0;
    const card = props.pointsCards.find(card => card.id === localPurchaseCardId.value);
    return card ? card.price : 0;
});

// 設置卡片ID
const setCardId = (cardId: number) => {
    localPurchaseCardId.value = cardId;
    emit('update:purchase-card-id', cardId);
};

// 設置付款方式
const setPaymentMethod = (method: string) => {
    localPaymentMethod.value = method;
    emit('update:payment-method', method);
};

// 取消購買
const onCancel = () => {
    emit('cancel');
};

// 確認購買
const onPurchase = () => {
    emit('purchase');
};
</script>

<style scoped>
@reference "tailwindcss";
</style>