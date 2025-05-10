<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold">活動記錄</h2>

        <!-- 筛选部分 -->
        <div class="card h-full flex flex-col gap-4">
            <!-- 日期範圍篩選 -->
            <div class="w-2/3">
                <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate" @change="handleDateRangeChange"
                    @apply="applyFilters" @reset="resetFilters" />
            </div>

            <!-- 標籤頁 -->
            <Tabs :value="tabItems[0].label" class="flex-1 flex flex-col">
                <TabList>
                    <Tab v-for="tab in tabItems" :key="tab.label" :value="tab.label">
                        <i :class="tab.icon + ' mr-2'"></i>
                        {{ tab.label }}
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel :value="tabItems[0].label">
                        <!-- 預約紀錄面板 -->
                            <DataTable :value="filteredCourseHistory" stripedRows paginator :rows="10"
                            responsiveLayout="scroll" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" />
                            <Column field="date" header="日期">
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="instructor.name" header="講師" />
                            <Column field="points" header="消費點數" />
                            <Column field="status" header="狀態">
                                <template #body="{ data }">
                                    <Tag :severity="getStatusSeverity(data.status)"
                                        :value="getCourseStatus(data.status)" />
                                </template>
                            </Column>
                            <Column field="action" header="操作">
                                <template #body="{ data }">
                                    <Button icon="pi pi-eye" text rounded aria-label="查看详情"
                                        @click="viewCourseDetail(data)" />
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center p-6 bg-gray-50 rounded-lg">
                                    <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-500">尚無課程紀錄</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                    <TabPanel :value="tabItems[1].label">
                        <!-- 缺席紀錄面板 -->
                            <DataTable :value="filteredAbsenceRecords" stripedRows paginator :rows="10"
                            responsiveLayout="scroll" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" />
                            <Column field="date" header="日期">
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="time" header="時間" />
                            <Column field="points" header="扣除點數" />

                            <template #empty>
                                <div class="text-center p-6 bg-gray-50 rounded-lg">
                                    <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-500">無缺席紀錄</p>
                                </div>
                            </template>
                            </DataTable>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <!-- 课程详情对话框 -->
            <Dialog v-model:visible="showDetailDialog" header="課程詳情" :modal="true" :closable="true"
                :style="{ width: '50vw' }">
                <div v-if="selectedCourse" class="space-y-4">
                    <!-- 课程详情内容 -->
                    <div class="p-3 border rounded-lg bg-gray-50">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">課程名稱：</span>
                            <span class="font-medium">{{ selectedCourse.courseTitle }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">日期：</span>
                            <span>{{ formatDateString(selectedCourse.date) }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">時間：</span>
                            <span>{{ selectedCourse.time }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">講師：</span>
                            <span>{{ selectedCourse.instructor?.name }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">點數：</span>
                            <span class="font-bold text-primary-600">{{ selectedCourse.points }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">狀態：</span>
                            <Tag :severity="getStatusSeverity(selectedCourse.status)"
                                :value="getCourseStatus(selectedCourse.status)" />
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" outlined />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { formatDateString, inRange } from '@/utils/date';
import { BookingStatus, BookingStatusLabel } from '@/enums/BookingStatus';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    courseHistory: {
        type: Array,
        required: true
    },
    absenceRecords: {
        type: Array,
        required: true
    }
});

// 狀態與過濾
const toast = useToast();
const loading = ref(false);
const selectedCourse = ref<any>(null);
const showDetailDialog = ref(false);
const activeTabIndex = ref(0);

// 日期範圍
const startDate = ref<Date>();
const endDate = ref<Date>();
const range = ref<{ start: Date; end: Date } | null>(null);

// 標籤頁菜單
const tabItems = [
    { label: '預約紀錄', icon: 'pi pi-calendar' },
    { label: '缺席紀錄', icon: 'pi pi-calendar-times' }
];

// 過濾後的課程歷史
const filteredCourseHistory = computed(() => {
    let filtered = [...props.courseHistory];
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered);
    }
    return filtered;
});

// 過濾後的缺席記錄
const filteredAbsenceRecords = computed(() => {
    let filtered = [...props.absenceRecords];
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered);
    }

    return filtered;
});

// 處理日期範圍變更
const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
};

// 應用篩選器
const applyFilters = () => {
    loading.value = true;
    setTimeout(() => loading.value = false, 500);
};

// 重置篩選器
const resetFilters = () => {
    loading.value = true;
    setTimeout(() => loading.value = false, 500);
};

// 查看课程详情
const viewCourseDetail = (course: any) => {
    selectedCourse.value = course;
    showDetailDialog.value = true;
};

const getCourseStatus = (status: BookingStatus) => {
    return BookingStatusLabel[status];
}

const getStatusSeverity = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Confirmed:
            return 'success';
        case BookingStatus.Canceled:
            return 'danger';
        case BookingStatus.Pending:
            return 'info';
        default:
            return 'secondary';
    }
};
</script>

<style scoped>
@reference "tailwindcss";
::v-deep(.p-datatable > .p-datatable-table-container) {
    flex: 1;
}

</style>