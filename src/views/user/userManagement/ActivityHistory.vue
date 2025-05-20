<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold">活動記錄</h2>

        <!-- 活動統計卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-blue-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">總課程數</div>
                        <div class="text-2xl font-bold">{{ activityStats.totalCourses }}</div>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="pi pi-book text-blue-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-green-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">完成課程</div>
                        <div class="text-2xl font-bold">{{ activityStats.completedCourses }}</div>
                    </div>
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-red-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">缺席次數</div>
                        <div class="text-2xl font-bold">{{ activityStats.absenceCourses }}</div>
                    </div>
                    <div class="bg-red-100 p-3 rounded-full">
                        <i class="pi pi-times-circle text-red-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 border-purple-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">課程評價</div>
                        <div class="text-2xl font-bold">{{ activityStats.averageRating }}
                            <span class="text-sm text-gray-500">/ 5</span>
                        </div>
                    </div>
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="pi pi-star-fill text-purple-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选部分 -->
        <div class="card h-full flex flex-col gap-4">
            <!-- 過濾器區域 -->
            <div class="flex flex-wrap gap-3 items-end">
                <!-- 日期範圍篩選 -->
                <div class="flex-grow md:w-auto md:flex-grow-0">
                    <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate"
                        @change="handleDateRangeChange" @apply="applyFilters" @reset="resetFilters" />
                </div>

                <!-- 狀態篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1">狀態</label>
                    <Select v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="選擇狀態" class="w-full md:w-40" />
                </div>

                <!-- 搜尋 -->
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="filters.search" placeholder="搜尋課程名稱..." />
                </IconField>

                <!-- 應用按鈕 -->
                <div class="w-full md:w-auto">
                    <Button label="應用篩選" icon="pi pi-filter" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" outlined class="ml-2" @click="resetAllFilters" />
                </div>
            </div>

            <!-- 標籤頁 -->
            <Tabs v-model:activeIndex="activeTabIndex" class="flex-1 flex flex-col" :value="tabItems[0].label">
                <TabList>
                    <Tab v-for="tab in tabItems" :key="tab.label" :value="tab.label">
                        <i :class="tab.icon + ' mr-2'"></i>
                        {{ tab.label }}
                        <Badge v-if="tab.count" :value="tab.count" class="ml-2" />
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel :value="tabItems[0].label">
                        <!-- 預約紀錄面板 -->
                        <DataTable :value="filteredCourseHistory" stripedRows paginator :rows="10"
                            responsiveLayout="stack" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" sortable />
                            <Column field="date" header="日期" sortable>
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="time" header="時間" />
                            <Column field="instructor.name" header="講師" />
                            <Column field="courseType" header="課程類型" />
                            <Column field="points" header="消費點數" />
                            <Column field="status" header="狀態">
                                <template #body="{ data }">
                                    <Tag :severity="getStatusSeverity(data.status)"
                                        :value="getCourseStatus(data.status)" />
                                </template>
                            </Column>
                            <Column field="action" header="操作">
                                <template #body="{ data }">
                                    <div class="flex gap-1">
                                        <Button icon="pi pi-eye" text rounded aria-label="查看詳情"
                                            @click="viewCourseDetail(data)" />
                                        <Button v-if="canRate(data)" icon="pi pi-star" text rounded aria-label="評價課程"
                                            @click="openRatingDialog(data)" />
                                    </div>
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
                            responsiveLayout="stack" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" sortable />
                            <Column field="date" header="日期" sortable>
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="time" header="時間" />
                            <Column field="courseType" header="課程類型" />
                            <Column field="points" header="扣除點數" />
                            <Column field="reason" header="缺席原因" />

                            <template #empty>
                                <div class="text-center p-6 bg-gray-50 rounded-lg">
                                    <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-500">無缺席紀錄</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                    <TabPanel :value="tabItems[2].label">
                        <!-- 評價紀錄面板 -->
                        <DataTable :value="filteredRatingHistory" stripedRows paginator :rows="10"
                            responsiveLayout="stack" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" sortable />
                            <Column field="date" header="日期" sortable>
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="instructor.name" header="講師" />
                            <Column field="rating" header="評分">
                                <template #body="{ data }">
                                    <Rating v-model="data.rating" :cancel="false" :readonly="true" />
                                </template>
                            </Column>
                            <Column field="comment" header="評論">
                                <template #body="{ data }">
                                    <div class="max-w-xs truncate">{{ data.comment || '無評論' }}</div>
                                </template>
                            </Column>
                            <Column field="action" header="操作">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" text rounded aria-label="編輯評價"
                                        @click="openRatingDialog(data, true)" />
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center p-6 bg-gray-50 rounded-lg">
                                    <i class="pi pi-star text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-500">尚無評價紀錄</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <!-- 课程详情对话框 -->
            <Dialog v-model:visible="showDetailDialog" header="課程詳情" :modal="true" :closable="true"
                :style="{ width: '500px' }">
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
                            <span class="text-gray-600">課程類型：</span>
                            <span>{{ selectedCourse.courseType }}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">地點：</span>
                            <span>{{ selectedCourse.location }}</span>
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

                    <!-- 講師資訊 -->
                    <div v-if="selectedCourse.instructor" class="p-3 border rounded-lg">
                        <h3 class="font-medium mb-2">講師資訊</h3>
                        <div class="flex items-center gap-3">
                            <Avatar :label="selectedCourse.instructor.name.charAt(0)" shape="circle" size="large" />
                            <div>
                                <div class="font-medium">{{ selectedCourse.instructor.name }}</div>
                                <div class="text-sm text-gray-500">{{ selectedCourse.instructor.title || '資深講師' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 課程評價 -->
                    <div v-if="selectedCourse.rating" class="p-3 border rounded-lg">
                        <h3 class="font-medium mb-2">您的評價</h3>
                        <div class="mb-2">
                            <Rating v-model="selectedCourse.rating" :cancel="false" :readonly="true" />
                        </div>
                        <div class="text-sm italic text-gray-600 bg-gray-50 p-2 rounded">
                            {{ selectedCourse.comment || '無評論' }}
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" outlined />
                    <Button v-if="selectedCourse && canRate(selectedCourse)" label="評價課程" icon="pi pi-star"
                        @click="openRatingDialogFromDetail" />
                </template>
            </Dialog>

            <!-- 評價對話框 -->
            <Dialog v-model:visible="showRatingDialog" :header="isEditRating ? '編輯評價' : '評價課程'" :modal="true"
                :closable="true" :style="{ width: '450px' }">
                <div v-if="selectedCourse" class="space-y-4">
                    <div class="mb-3">
                        <h3 class="font-medium">{{ selectedCourse.courseTitle }}</h3>
                        <div class="text-sm text-gray-500">{{ formatDateString(selectedCourse.date) }} {{
                            selectedCourse.time }}
                        </div>
                        <div class="text-sm text-gray-500">講師: {{ selectedCourse.instructor?.name }}</div>
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm mb-2">評分</label>
                        <Rating v-model="ratingForm.rating" :cancel="false" />
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm mb-2">評論 (選填)</label>
                        <Textarea v-model="ratingForm.comment" rows="3" class="w-full" placeholder="分享您對課程的感受..." />
                    </div>
                </div>
                <template #footer>
                    <Button label="取消" icon="pi pi-times" @click="showRatingDialog = false" outlined />
                    <Button label="提交評價" icon="pi pi-check" @click="submitRating" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { PropType } from 'vue';
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
import Badge from 'primevue/badge';
import Rating from 'primevue/rating';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import Avatar from 'primevue/avatar';
import type { AbsenceRecord } from '@/types/activity';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// 定义数据接口
interface CourseRecord {
    id: number;
    userId: number;
    courseTitle: string;
    courseType: string;
    location: string;
    date: string;
    time: string;
    points: number;
    status: BookingStatus;
    rating?: number;
    comment?: string;
    instructor?: {
        name: string;
        avatar?: string;
        title?: string;
    };
}

// 定义注入数据接口
interface ActivityDataInject {
    courseHistory: { value: CourseRecord[] };
    absenceRecords: { value: AbsenceRecord[] };
}

// 使用inject获取数据
const activityData = inject<ActivityDataInject>('activityData');
const courseHistory = computed(() => activityData?.courseHistory.value || []);
const absenceRecords = computed(() => activityData?.absenceRecords.value || []);

// 添加评分记录数据 - 因为现在没有通过props传入，所以需要从课程历史中提取
const ratingHistory = computed(() => {
    return courseHistory.value.filter(course => course.rating && course.rating > 0);
});

// 狀態與過濾
const toast = useToast();
const loading = ref(false);
const selectedCourse = ref<CourseRecord | null>(null);
const showDetailDialog = ref(false);
const showRatingDialog = ref(false);
const activeTabIndex = ref(0);
const isEditRating = ref(false);

// 日期範圍
const startDate = ref<Date>();
const endDate = ref<Date>();
const range = ref<{ start: Date; end: Date } | null>(null);

// 篩選條件
const filters = ref({
    search: '',
    status: '',
});

// 評價表單
const ratingForm = ref({
    rating: 0,
    comment: ''
});

// 狀態選項
const statusOptions = [
    { label: '全部狀態', value: '' },
    { label: '已完成', value: BookingStatus.Confirmed.toString() },
    { label: '已取消', value: BookingStatus.Canceled.toString() },
    { label: '待處理', value: BookingStatus.Pending.toString() }
];

// 活動統計
const activityStats = computed(() => {
    return {
        totalCourses: courseHistory.value.length,
        completedCourses: courseHistory.value.filter(c => c.status === BookingStatus.Confirmed).length,
        absenceCourses: absenceRecords.value.length,
        averageRating: calculateAverageRating()
    };
});

// 標籤頁菜單
const tabItems = computed(() => [
    {
        label: '預約紀錄',
        icon: 'pi pi-calendar',
        count: filteredCourseHistory.value.length
    },
    {
        label: '缺席紀錄',
        icon: 'pi pi-calendar-times',
        count: filteredAbsenceRecords.value.length
    },
    {
        label: '評價紀錄',
        icon: 'pi pi-star',
        count: filteredRatingHistory.value.length
    }
]);

// 計算平均評分
function calculateAverageRating(): string {
    if (!ratingHistory.value || ratingHistory.value.length === 0) {
        return '0.0';
    }

    const sum = ratingHistory.value.reduce((total, item) => total + (item.rating || 0), 0);
    return (sum / ratingHistory.value.length).toFixed(1);
}

// 過濾後的課程歷史
const filteredCourseHistory = computed(() => {
    let filtered = [...courseHistory.value];

    // 日期範圍過濾
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered);
    }

    // 搜尋過濾
    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filtered = filtered.filter(item =>
            item.courseTitle.toLowerCase().includes(searchLower) ||
            (item.instructor?.name && item.instructor.name.toLowerCase().includes(searchLower))
        );
    }

    // 狀態過濾
    if (filters.value.status) {
        filtered = filtered.filter(item => item.status.toString() === filters.value.status);
    }


    return filtered;
});

// 過濾後的缺席記錄
const filteredAbsenceRecords = computed(() => {
    let filtered = [...absenceRecords.value];

    // 日期範圍過濾
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered);
    }

    // 搜尋過濾
    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filtered = filtered.filter(item =>
            item.courseTitle.toLowerCase().includes(searchLower)
        );
    }
    return filtered;
});

// 過濾後的評價記錄
const filteredRatingHistory = computed(() => {
    let filtered = [...ratingHistory.value];

    // 日期範圍過濾
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered);
    }

    // 搜尋過濾
    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filtered = filtered.filter(item =>
            item.courseTitle.toLowerCase().includes(searchLower) ||
            (item.instructor?.name && item.instructor.name.toLowerCase().includes(searchLower))
        );
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
    range.value = null;
    startDate.value = undefined;
    endDate.value = undefined;
    loading.value = true;
    setTimeout(() => loading.value = false, 500);
};

// 重置所有篩選器
const resetAllFilters = () => {
    resetFilters();
    filters.value = {
        search: '',
        status: '',
    };
    applyFilters();
};

// 查看课程详情
const viewCourseDetail = (course: CourseRecord) => {
    selectedCourse.value = course;
    showDetailDialog.value = true;
};

// 判斷是否可以評價
const canRate = (course: CourseRecord): boolean => {
    // 只有已完成的課程才能評價，且未評價過
    return course.status === BookingStatus.Confirmed &&
        (!course.rating || course.rating === 0);
};

// 打開評價對話框
const openRatingDialog = (course: CourseRecord, isEdit = false) => {
    selectedCourse.value = course;
    isEditRating.value = isEdit;

    // 如果是編輯，則填入現有評價
    if (isEdit && course.rating) {
        ratingForm.value.rating = course.rating;
        ratingForm.value.comment = course.comment || '';
    } else {
        // 新評價，重置表單
        ratingForm.value.rating = 0;
        ratingForm.value.comment = '';
    }

    showRatingDialog.value = true;
};

// 從詳情頁打開評價對話框
const openRatingDialogFromDetail = () => {
    if (selectedCourse.value) {
        showDetailDialog.value = false;
        const course = selectedCourse.value;
        setTimeout(() => {
            openRatingDialog(course);
        }, 300);
    }
};

// 自定义事件，用于提交评价
const emit = defineEmits(['submit-rating']);

// 提交评价
const submitRating = () => {
    if (ratingForm.value.rating === 0) {
        toast.add({
            severity: 'warn',
            summary: '提示',
            detail: '請至少給出星級評分',
            life: 3000
        });
        return;
    }

    if (!selectedCourse.value) {
        return;
    }

    // 触发评价提交事件
    emit('submit-rating', {
        courseId: selectedCourse.value.id,
        rating: ratingForm.value.rating,
        comment: ratingForm.value.comment
    });

    // 更新本地數據
    if (isEditRating.value) {
        // 更新現有評價
        selectedCourse.value.rating = ratingForm.value.rating;
        selectedCourse.value.comment = ratingForm.value.comment;

        toast.add({
            severity: 'success',
            summary: '成功',
            detail: '評價已更新',
            life: 3000
        });
    } else {
        // 添加新評價
        selectedCourse.value.rating = ratingForm.value.rating;
        selectedCourse.value.comment = ratingForm.value.comment;

        toast.add({
            severity: 'success',
            summary: '成功',
            detail: '感謝您的評價',
            life: 3000
        });
    }

    showRatingDialog.value = false;
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

.card {
    @apply bg-white border border-gray-100 rounded-lg p-4;
}

:deep(.p-datatable > .p-datatable-table-container) {
    flex: 1;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}
</style>