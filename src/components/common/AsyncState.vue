<template>
    <div>
        <!-- 加載狀態 -->
        <div v-if="loading" class="text-center py-8">
            <ProgressSpinner style="width:50px;height:50px" :strokeWidth="spinnerStrokeWidth" />
            <p v-if="loadingText" class="mt-3 text-gray-600">{{ loadingText }}</p>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="p-6 text-center bg-white rounded-lg shadow">
            <i class="pi pi-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">{{ errorTitle }}</h3>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <Button v-if="retryAction" :label="retryLabel" icon="pi pi-refresh" @click="retryAction" />
        </div>

        <!-- 空狀態 -->
        <div v-else-if="isEmpty" class="p-6 text-center">
            <i class="pi pi-search text-5xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">{{ emptyTitle }}</h3>
            <p v-if="emptyMessage" class="text-gray-600 mb-4">{{ emptyMessage }}</p>
            <slot name="empty-content"></slot>
        </div>

        <!-- 正常狀態 -->
        <div v-else>
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    isEmpty: {
        type: Boolean,
        default: false
    },
    loadingText: {
        type: String,
        default: '載入中，請稍候...'
    },
    errorTitle: {
        type: String,
        default: '發生錯誤'
    },
    emptyTitle: {
        type: String,
        default: '沒有找到資料'
    },
    emptyMessage: {
        type: String,
        default: ''
    },
    retryLabel: {
        type: String,
        default: '重試'
    },
    retryAction: {
        type: [() => {}, null],
        default: null
    },
    spinnerStrokeWidth: {
        type: String,
        default: '5'
    }
});
</script>