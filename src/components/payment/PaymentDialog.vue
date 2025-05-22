<template>
    <Dialog 
        v-model:visible="visible" 
        :modal="true" 
        :closable="true" 
        :style="{ width: '450px' }" 
        :header="'付款 - ' + (paymentItem?.courseTitle || '未知項目')"
        :draggable="false"
    >
        <div class="space-y-4">
            <!-- 付款信息 -->
            <div class="p-3 border rounded-lg bg-gray-50">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">項目名稱：</span>
                    <span class="font-medium">{{ paymentItem?.courseTitle }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">使用日期：</span>
                    <span>{{ formatDate(paymentItem?.date) }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">應付金額：</span>
                    <span class="font-bold text-primary-600">NT$ {{ paymentItem?.amount }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">繳款期限：</span>
                    <span>{{ formatDate(paymentItem?.dueDate) }}</span>
                </div>
            </div>

            <!-- 付款方式选择 -->
            <div>
                <h3 class="font-medium mb-2">選擇付款方式</h3>
                <div class="grid grid-cols-2 gap-2">
                    <div 
                        v-for="method in paymentMethods" 
                        :key="method.code"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-primary-500 bg-primary-50': selectedMethod === method.code, 'hover:border-gray-400': selectedMethod !== method.code }"
                        @click="selectedMethod = method.code"
                    >
                        <div class="flex items-center space-x-2">
                            <i :class="method.icon" class="text-xl"></i>
                            <span>{{ method.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 信用卡表单 -->
            <div v-if="selectedMethod === PaymentMethod.CreditCard" class="space-y-3">
                <InputText v-model="cardNumber" placeholder="卡號" class="w-full" />
                <div class="flex gap-2">
                    <InputText v-model="cardExpiry" placeholder="有效期限 (MM/YY)" class="w-1/2" />
                    <InputText v-model="cardCVC" placeholder="安全碼" class="w-1/2" type="password" />
                </div>
                <InputText v-model="cardHolder" placeholder="持卡人姓名" class="w-full" />
            </div>

            <!-- 银行转账信息 -->
            <div v-if="selectedMethod === PaymentMethod.BankTransfer" class="p-3 border rounded-lg bg-blue-50">
                <p class="font-medium text-blue-700 mb-2">銀行轉帳資訊</p>
                <p class="mb-1">戶名：PUDT課程平台</p>
                <p class="mb-1">銀行：國泰世華銀行</p>
                <p class="mb-1">帳號：1234-5678-9012-3456</p>
                <p class="text-sm text-blue-600 mt-2">* 請於轉帳後上傳交易憑證</p>
                <FileUpload 
                    mode="basic" 
                    :auto="true" 
                    :maxFileSize="1000000"
                    accept="image/*" 
                    chooseLabel="上傳憑證" 
                    class="mt-2"
                    @upload="onUpload" 
                />
            </div>

            <!-- 行动支付选项 -->
            <div v-if="selectedMethod === PaymentMethod.MobilePayment" class="p-3 border rounded-lg bg-green-50">
                <div class="flex justify-center mb-3">
                    <div class="h-32 w-32 bg-gray-200 flex items-center justify-center">
                        <i class="pi pi-qrcode text-5xl text-gray-500"></i>
                    </div>
                </div>
                <p class="text-center text-green-700">請使用行動支付APP掃描上方QR碼完成付款</p>
                <div class="flex justify-center gap-4 mt-4">
                    <div class="p-2 bg-gray-100 rounded-lg flex items-center justify-center w-20 h-10">
                        <span class="text-xs font-bold">Line Pay</span>
                    </div>
                    <div class="p-2 bg-gray-100 rounded-lg flex items-center justify-center w-20 h-10">
                        <span class="text-xs font-bold">台灣 Pay</span>
                    </div>
                    <div class="p-2 bg-gray-100 rounded-lg flex items-center justify-center w-20 h-10">
                        <span class="text-xs font-bold">Apple Pay</span>
                    </div>
                </div>
            </div>

            <!-- 现金付款提示 -->
            <div v-if="selectedMethod === PaymentMethod.Cash" class="p-3 border rounded-lg bg-yellow-50">
                <p class="font-medium text-yellow-700 mb-2">現金付款說明</p>
                <p class="mb-1">請於課程開始前30分鐘至現場櫃檯繳交現金。</p>
                <p class="mb-1">地址：台北市信義區松高路123號5樓</p>
                <p class="mb-1">營業時間：週一至週五 10:00-21:00，週六至週日 09:00-18:00</p>
                <p class="text-sm text-yellow-600 mt-2">* 請務必在課程開始前完成付款，否則將無法參加課程</p>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between w-full">
                <Button 
                    label="取消" 
                    icon="pi pi-times" 
                    @click="closeDialog" 
                    outlined
                />
                <Button 
                    :label="getPayButtonLabel()" 
                    icon="pi pi-check" 
                    @click="handlePayment" 
                    :disabled="!canProceed()"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import { useToast } from 'primevue/usetoast';
import { formatDateString } from '@/utils/dateUtils';
import { PaymentMethod, PaymentMethodLabel } from '@/enums/PurchaseStatus';

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
    paymentItem?: {
        id: number;
        courseTitle: string;
        date: Date;
        amount: number;
        dueDate: Date;
    };
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'payment-completed', data: { itemId: number, method: PaymentMethod }): void;
}>();

const toast = useToast();
const selectedMethod = ref<PaymentMethod | null>(null);

// 信用卡表单数据
const cardNumber = ref('');
const cardExpiry = ref('');
const cardCVC = ref('');
const cardHolder = ref('');

// 付款方式列表
const paymentMethods = [
    { 
        name: PaymentMethodLabel[PaymentMethod.CreditCard], 
        code: PaymentMethod.CreditCard,
        icon: 'pi pi-credit-card'
    },
    { 
        name: PaymentMethodLabel[PaymentMethod.BankTransfer], 
        code: PaymentMethod.BankTransfer,
        icon: 'pi pi-wallet'
    },
    { 
        name: PaymentMethodLabel[PaymentMethod.MobilePayment], 
        code: PaymentMethod.MobilePayment,
        icon: 'pi pi-mobile'
    },
    { 
        name: PaymentMethodLabel[PaymentMethod.Cash], 
        code: PaymentMethod.Cash,
        icon: 'pi pi-money-bill'
    }
];

// 关闭对话框
const closeDialog = () => {
    emit('update:visible', false);
    // 重置表单
    selectedMethod.value = null;
    cardNumber.value = '';
    cardExpiry.value = '';
    cardCVC.value = '';
    cardHolder.value = '';
};

// 检查是否可以进行支付
const canProceed = () => {
    if (!selectedMethod.value) return false;
    
    if (selectedMethod.value === PaymentMethod.CreditCard) {
        return cardNumber.value && cardExpiry.value && cardCVC.value && cardHolder.value;
    }
    
    return true;
};

// 获取支付按钮的文本
const getPayButtonLabel = () => {
    if (!selectedMethod.value) return '確認付款';
    
    switch (selectedMethod.value) {
        case PaymentMethod.CreditCard:
            return '確認付款';
        case PaymentMethod.BankTransfer:
            return '已完成轉帳';
        case PaymentMethod.MobilePayment:
            return '已掃碼支付';
        case PaymentMethod.Cash:
            return '我了解了';
        default:
            return '確認付款';
    }
};

// 处理付款
const handlePayment = () => {
    if (!selectedMethod.value || !props.paymentItem) return;
    
    // 模拟支付处理
    setTimeout(() => {
        // 支付成功
        toast.add({ 
            severity: 'success', 
            summary: '付款成功', 
            detail: `已使用${PaymentMethodLabel[selectedMethod.value!]}完成付款`, 
            life: 3000 
        });
        
        // 通知父组件支付完成
        emit('payment-completed', { 
            itemId: props.paymentItem!.id, 
            method: selectedMethod.value! 
        });
        
        // 关闭对话框
        closeDialog();
    }, 1500);
};

// 文件上传处理
const onUpload = () => {
    toast.add({ 
        severity: 'info', 
        summary: '上傳成功', 
        detail: '交易憑證已上傳', 
        life: 3000 
    });
};

// 格式化日期显示
const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return formatDateString(date.toISOString());
};
</script>

<style scoped>
/* 样式调整 */
:deep(.p-fileupload-buttonbar) {
    padding: 0;
}

:deep(.p-fileupload-content) {
    padding: 8px 0 0 0;
}
</style> 