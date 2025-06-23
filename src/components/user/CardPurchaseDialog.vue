<template>
    <Dialog v-model:visible="visible" header="購買課卡" :style="{ width: '600px' }" :modal="true" class="p-fluid">
        <div class="p-1">
            <!-- 選擇課卡 -->
            <div class="mb-6">
       
                <div v-if="selectedCard" class="bg-gradient-to-r rounded-xl p-4 border border-sky-50">
                    <div class="flex justify-between items-center">
                        <div class="flex-1">
                            <div class="font-bold text-sky-700 text-lg">{{ selectedCard.name }}</div>
                            <div class="text-sm text-gray-600 mt-1">{{ selectedCard.description }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-sky-700">{{ selectedCard.points }}點</div>
                            <div class="font-bold text-lg text-gray-700">NT$ {{ selectedCard.price.toLocaleString() }}</div>
                        </div>
                    </div>
                    <div v-if="selectedCard.discount" class="mt-2">
                        <Badge :value="selectedCard.discount" severity="warning" />
                    </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                    <i class="pi pi-exclamation-circle mr-2"></i>
                    未選擇課卡
                </div>
            </div>
            
            <!-- 購買方式選擇 -->
            <div class="mb-6">
                <h4 class="font-medium mb-3 text-sky-700 flex items-center">
                    <i class="pi pi-shopping-cart mr-2"></i>選擇購買方式
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- 直接購買 -->
                    <div class="border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                        :class="{ 
                            'border-sky-500 bg-sky-50 shadow-md': localPurchaseType === 'direct',
                            'border-gray-200': localPurchaseType !== 'direct'
                        }"
                        @click="setPurchaseType('direct')">
                        <div class="flex items-center mb-2">
                            <i class="pi pi-credit-card text-blue-600 mr-2 text-lg"></i>
                            <span class="font-bold text-gray-800">直接購買</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-3">使用信用卡、銀行轉帳或行動支付直接購買</p>
                        <div class="text-xs text-green-600 font-medium">✓ 立即到帳</div>
                    </div>
                    
                    <!-- 第三方購買 -->
                    <div class="border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                        :class="{ 
                            'border-sky-500 bg-sky-50 shadow-md': localPurchaseType === 'thirdparty',
                            'border-gray-200': localPurchaseType !== 'thirdparty'
                        }"
                        @click="setPurchaseType('thirdparty')">
                        <div class="flex items-center mb-2">
                            <i class="pi pi-users text-purple-600 mr-2 text-lg"></i>
                            <span class="font-bold text-gray-800">第三方購買</span>
                            <Badge value="推薦" severity="warning" class="ml-2 text-xs" />
                        </div>
                        <p class="text-sm text-gray-600 mb-3">請朋友、家人或企業代為購買課卡</p>
                        <div class="text-xs text-orange-600 font-medium">✓ 支援禮品卡功能</div>
                    </div>
                </div>
            </div>

            <!-- 直接購買 - 付款方式 -->
            <div v-if="localPurchaseType === 'direct'" class="mb-6">
                <h4 class="font-medium mb-3 text-sky-700 flex items-center">
                    <i class="pi pi-wallet mr-2"></i>選擇付款方式
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div v-for="method in paymentMethods" :key="method.value"
                        class="border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition-all hover:shadow-sm"
                        :class="{ 
                            'border-sky-500 bg-sky-50': localPaymentMethod === method.value,
                            'border-gray-200': localPaymentMethod !== method.value
                        }"
                        @click="setPaymentMethod(method.value)">
                        <i :class="method.icon" :style="{ color: method.color }"></i>
                        <span class="text-sm font-medium">{{ method.label }}</span>
                    </div>
                </div>
            </div>

            <!-- 第三方購買 - 收件人資訊 -->
            <div v-if="localPurchaseType === 'thirdparty'" class="mb-6">
                <h4 class="font-medium mb-3 text-sky-700 flex items-center">
                    <i class="pi pi-user mr-2"></i>收件人資訊
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="recipientName" class="text-sm font-medium text-gray-700">收件人姓名</label>
                        <InputText id="recipientName" v-model="localRecipientInfo.name" placeholder="請輸入收件人姓名" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="recipientEmail" class="text-sm font-medium text-gray-700">收件人信箱</label>
                        <InputText id="recipientEmail" v-model="localRecipientInfo.email" placeholder="請輸入收件人信箱" />
                    </div>
                    <div class="flex flex-col gap-2 sm:col-span-2">
                        <label for="giftMessage" class="text-sm font-medium text-gray-700">贈送訊息（選填）</label>
                        <Textarea id="giftMessage" v-model="localRecipientInfo.message" 
                            placeholder="為這份課卡寫下祝福或說明..." 
                            :rows="3" 
                            :autoResize="true" />
                    </div>
                </div>
                
                <!-- 第三方購買付款方式 -->
                <div class="mt-4">
                    <h5 class="font-medium mb-2 text-gray-700">付款方式</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div v-for="method in thirdPartyPaymentMethods" :key="method.value"
                            class="border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition-all hover:shadow-sm"
                            :class="{ 
                                'border-sky-500 bg-sky-50': localPaymentMethod === method.value,
                                'border-gray-200': localPaymentMethod !== method.value
                            }"
                            @click="setPaymentMethod(method.value)">
                            <i :class="method.icon" :style="{ color: method.color }"></i>
                            <span class="text-sm font-medium">{{ method.label }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 價格總覽 -->
            <div class="bg-gradient-to-r from-sky-50 to-sky-100 p-4 rounded-xl mb-6 border border-sky-200">
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">課卡價格:</span>
                        <span class="font-medium">NT$ {{ selectedCardPrice.toLocaleString() }}</span>
                    </div>
                    <div v-if="localPurchaseType === 'thirdparty'" class="flex justify-between items-center">
                        <span class="text-gray-600">處理費用:</span>
                        <span class="font-medium">NT$ {{ processingFee.toLocaleString() }}</span>
                    </div>
                    <hr class="border-sky-300">
                    <div class="flex justify-between items-center text-lg">
                        <span class="font-bold text-sky-700">總金額:</span>
                        <span class="font-bold text-sky-700">NT$ {{ totalPrice.toLocaleString() }}</span>
                    </div>
                </div>
            </div>
            
            <!-- 操作按鈕 -->
            <div class="flex justify-end gap-3">
                <Button label="取消" icon="pi pi-times" severity="secondary" outlined @click="onCancel" />
                <Button 
                    :label="localPurchaseType === 'thirdparty' ? '確認贈送' : '確認購買'" 
                    icon="pi pi-check" 
                    :disabled="!canPurchase" 
                    :loading="purchasing"
                    @click="onPurchase" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PropType } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Badge from 'primevue/badge';

// 定義數據類型
interface PointsCard {
    id: number;
    name: string;
    description: string;
    points: number;
    price: number;
    discount?: string;
}

interface RecipientInfo {
    name: string;
    email: string;
    message?: string;
}

// 直接購買付款方式
const paymentMethods = [
    { label: '信用卡', value: 'credit', icon: 'pi pi-credit-card', color: '#3b82f6' },
    { label: '銀行轉帳', value: 'bank', icon: 'pi pi-wallet', color: '#10b981' },
    { label: '行動支付', value: 'mobile', icon: 'pi pi-mobile', color: '#8b5cf6' }
];

// 第三方購買付款方式
const thirdPartyPaymentMethods = [
    { label: '信用卡', value: 'credit', icon: 'pi pi-credit-card', color: '#3b82f6' },
    { label: '銀行轉帳', value: 'bank', icon: 'pi pi-wallet', color: '#10b981' },
    { label: 'PayPal', value: 'paypal', icon: 'pi pi-paypal', color: '#0070ba' }
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
    },
    purchaseType: {
        type: String,
        default: 'direct'
    },
    recipientInfo: {
        type: Object as PropType<RecipientInfo>,
        default: () => ({ name: '', email: '', message: '' })
    },
    purchasing: {
        type: Boolean,
        default: false
    }
});

const visible = defineModel<boolean>('visible', { required: true });

const emit = defineEmits([
    'update:purchase-card-id',
    'update:payment-method',
    'update:purchase-type',
    'update:recipient-info',
    'purchase',
    'cancel'
]);

// 本地狀態
const localPurchaseCardId = ref<number | null>(props.purchaseCardId);
const localPaymentMethod = ref<string | null>(props.paymentMethod);
const localPurchaseType = ref<string>(props.purchaseType);
const localRecipientInfo = ref<RecipientInfo>({ ...props.recipientInfo });

// 監聽父組件傳入的數據變化
watch(() => props.purchaseCardId, (newValue) => {
    localPurchaseCardId.value = newValue;
});

watch(() => props.paymentMethod, (newValue) => {
    localPaymentMethod.value = newValue;
});

watch(() => props.purchaseType, (newValue) => {
    localPurchaseType.value = newValue;
});

watch(() => props.recipientInfo, (newValue) => {
    localRecipientInfo.value = { ...newValue };
});

// 監聽visible屬性，重置本地狀態
watch(() => visible.value, (newValue) => {
    if (newValue === false) {
        // 對話框關閉時重置本地狀態
        localPurchaseCardId.value = null;
        localPaymentMethod.value = null;
        localPurchaseType.value = 'direct';
        localRecipientInfo.value = { name: '', email: '', message: '' };
    }
});

// 計算屬性
const selectedCard = computed(() => {
    if (!localPurchaseCardId.value) return null;
    return props.pointsCards.find(card => card.id === localPurchaseCardId.value) || null;
});

const selectedCardPrice = computed(() => {
    if (!selectedCard.value) return 0;
    return selectedCard.value.price;
});

const processingFee = computed(() => {
    if (localPurchaseType.value === 'thirdparty') {
        return Math.ceil(selectedCardPrice.value * 0.03); // 3% 處理費
    }
    return 0;
});

const totalPrice = computed(() => {
    return selectedCardPrice.value + processingFee.value;
});

const canPurchase = computed(() => {
    const hasCard = !!localPurchaseCardId.value;
    const hasPayment = !!localPaymentMethod.value;
    
    if (localPurchaseType.value === 'direct') {
        return hasCard && hasPayment;
    } else {
        const hasRecipientInfo = localRecipientInfo.value.name && localRecipientInfo.value.email;
        return hasCard && hasPayment && hasRecipientInfo;
    }
});

// 方法
const setCardId = (cardId: number) => {
    localPurchaseCardId.value = cardId;
    emit('update:purchase-card-id', cardId);
};

const setPaymentMethod = (method: string) => {
    localPaymentMethod.value = method;
    emit('update:payment-method', method);
};

const setPurchaseType = (type: string) => {
    localPurchaseType.value = type;
    localPaymentMethod.value = null; // 重置付款方式
    emit('update:purchase-type', type);
    emit('update:payment-method', null);
};

const onCancel = () => {
    emit('cancel');
};

const onPurchase = () => {
    // 發送更新的收件人資訊
    if (localPurchaseType.value === 'thirdparty') {
        emit('update:recipient-info', localRecipientInfo.value);
    }
    
    emit('purchase', {
        cardId: localPurchaseCardId.value,
        paymentMethod: localPaymentMethod.value,
        purchaseType: localPurchaseType.value,
        recipientInfo: localPurchaseType.value === 'thirdparty' ? localRecipientInfo.value : null,
        totalPrice: totalPrice.value
    });
};
</script>

<style scoped>
.p-fluid .p-inputtext,
.p-fluid .p-inputtextarea {
    width: 100%;
}
</style> 