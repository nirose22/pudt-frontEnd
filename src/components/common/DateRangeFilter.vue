<template>
    <div class="flex gap-4 items-center">
        <div class="flex gap-2 items-center w-full">
            <DatePicker v-model="localStartDate" :showIcon="true" placeholder="開始日期" dateFormat="yy-mm-dd"
                class="w-full min-w-32" size="small" @blur="emitChange" />
            <span>至</span>
            <DatePicker v-model="localEndDate" :showIcon="true" placeholder="結束日期" dateFormat="yy-mm-dd"
                class="w-full min-w-32" size="small" @blur="emitChange" />
        </div>
        <div v-if="showControls" class="flex gap-2 flex-shrink-0">
            <Button icon="pi pi-filter" :label="applyLabel" @click="applyFilter" size="small" />
            <Button icon="pi pi-refresh" :label="resetLabel" @click="resetFilter" outlined size="small" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';

// 组件属性
const props = defineProps({
    startDate: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            return date;
        }
    },
    endDate: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate());
            return date;
        }
    },
    defaultRangeDays: {
        type: Number,
        default: 5
    },
    showControls: {
        type: Boolean,
        default: true
    },
    applyLabel: {
        type: String,
        default: '篩選'
    },
    resetLabel: {
        type: String,
        default: '重置'
    },
    autoApply: {
        type: Boolean,
        default: true
    }
});

// 事件
const emit = defineEmits([
    'update:startDate',
    'update:endDate',
    'change',
    'apply',
    'reset'
]);

// 本地状态
const localStartDate = ref(new Date(props.startDate));
const localEndDate = ref(new Date(props.endDate));

// 监听属性变化
watch(() => props.startDate, (newValue) => {
    localStartDate.value = new Date(newValue);
});

watch(() => props.endDate, (newValue) => {
    localEndDate.value = new Date(newValue);
});

// 发送更改事件
const emitChange = () => {
    if (props.autoApply) {
        applyFilter();
    }
};

const applyFilter = () => {
    emit('update:startDate', localStartDate.value);
    emit('update:endDate', localEndDate.value);
    emit('apply', {
        start: localStartDate.value,
        end: localEndDate.value
    });
    emit('change', {
        start: localStartDate.value,
        end: localEndDate.value
    });
};

const resetFilter = () => {
    console.log(222222);

    // 重置为当前日期和默认范围
    localStartDate.value = new Date();
    localStartDate.value.setDate(localStartDate.value.getDate() - props.defaultRangeDays);
    localEndDate.value = new Date();

    emit('update:startDate', localStartDate.value);
    emit('update:endDate', localEndDate.value);
    emit('reset', {
        start: localStartDate.value,
        end: localEndDate.value
    });
    emit('change', {
        start: localStartDate.value,
        end: localEndDate.value
    });
};

// 初始化
onMounted(() => {
    if (props.autoApply) {
        emit('change', {
            start: localStartDate.value,
            end: localEndDate.value
        });
    }
});

// 暴露方法给父组件
defineExpose({
    applyFilter,
    resetFilter
});
</script>