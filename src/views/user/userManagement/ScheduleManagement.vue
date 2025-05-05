<template>
    <div class="p-2">
        <!-- 日期範圍選擇 -->
        <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">選擇日期範圍</h3>
            <div class="flex items-center gap-2">
                <DatePicker v-model="startDate" :showIcon="true" placeholder="開始日期" dateFormat="yy-mm-dd" class="w-full"
                    size="small" @blur="applyDateRange" />
                <span>至</span>
                <DatePicker v-model="endDate" :showIcon="true" placeholder="結束日期" dateFormat="yy-mm-dd" class="w-full"
                    size="small" @blur="applyDateRange" />
            </div>
            <!-- <Button label="篩選" icon="pi pi-check" variant="secondary" class="mt-2 w-full" @click="applyDateRange" size="small"/> -->
        </div>

        <!-- 課程列表 -->
        <div>
            <h3 class="text-lg font-semibold mb-2">即將到來的課程</h3>
            <div v-if="bookingsInRange.length === 0" class="text-center p-4 bg-gray-50 rounded">
                <p class="text-gray-500">所選範圍內沒有課程預約</p>
            </div>
            <div v-else class="flex flex-col gap-2">
                <div v-for="date in Object.keys(bookingsByDate)" :key="date" class="flex flex-col gap-2">
                    <div class="text-yellow-600">{{ formatDateHeader(date) }}</div>
                    <div v-for="booking in bookingsByDate[date]" :key="booking.id"
                        class="rounded-2xl bg-blue-50 p-3 cursor-pointer hover:bg-blue-100">
                        <div class="flex gap-5 items-center">
                            <div v-if="booking.instructor?.avatar" class="flex-shrink-0">
                                <img :src="booking.instructor.avatar" alt="教練照片"
                                    class="w-12 h-12 rounded-full object-cover" />
                            </div>
                            <div class="flex-1">
                                <div class="text-lg font-medium">{{ booking.courseTitle }}</div>
                                <div class="flex items-center text-sm text-gray-600 mb-1">
                                    <i class="pi pi-clock icon-class"></i>
                                    <span>{{ booking.time }}</span>
                                </div>
                                <div class="flex items-center text-sm text-gray-600 mb-1">
                                    <i class="pi pi-map-marker icon-class"></i>
                                    <span>{{ booking.location }}</span>
                                </div>
                                <div class="flex items-center text-sm text-gray-600">
                                    <i class="pi pi-user icon-class"></i>
                                    <span>{{ booking.instructor?.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import { ref, computed, onMounted } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';

// 使用 bookingStore
const bookingStore = useBookingStore();

// 日期範圍
const startDate = ref(new Date());
const endDate = ref(new Date());

// 初始化設定日期範圍
onMounted(() => {
    // 設置結束日期為開始日期後5天
    endDate.value = startDate.value;
    endDate.value.setDate(startDate.value.getDate() + 5);
    bookingStore.setRange(startDate.value, endDate.value);
});



// 應用日期範圍
const applyDateRange = () => {
    bookingStore.setRange(startDate.value, endDate.value);
};

// 獲取範圍內的預約
const bookingsInRange = computed(() => bookingStore.inRange);

// 按日期分組的預約
const bookingsByDate = computed(() => bookingStore.byDate);

// 格式化日期標題
const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
};

</script>
<style>
@reference "tailwindcss";
.icon-class {
    @apply text-sm text-blue-400 mr-1;
}
</style>