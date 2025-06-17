<template>
    <Dialog v-model:visible="showCancelDialog" header="取消預約" :style="{ width: '450px' }"
        :contentStyle="{ 'background-color': '#f8fafc' }">
        <div class="p-4">
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
                <p class="font-medium">您確定要取消這個預約嗎？</p>
            </div>
            <p class="text-gray-600">取消可能會影響您的上課權益，且可能產生以下結果：</p>
            <ul class="list-disc pl-5 mt-2 text-sm text-gray-600">
                <li>提前 24 小時取消：點數全額退還</li>
                <li>提前 12-24 小時取消：點數退還 50%</li>
                <li>提前不到 12 小時取消：不退還點數</li>
            </ul>
        </div>
        <template #footer>
            <Button label="返回" icon="pi pi-arrow-left" class="p-button-text" @click="showCancelDialog = false" />
            <Button label="確認取消預約" icon="pi pi-check" severity="danger" @click="handleCancelBooking" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showCancelDialog = defineModel<boolean>('showCancelDialog', { required: true });

const emit = defineEmits(['cancel']);

const handleCancelBooking = () => {
    emit('cancel');
    showCancelDialog.value = false;
};
</script>
