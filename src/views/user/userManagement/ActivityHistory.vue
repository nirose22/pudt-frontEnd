<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold text-sky-700 flex items-center">
            <i class="pi pi-calendar-check mr-2"></i>活動記錄
        </h2>

        <!-- 活動統計卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div class="card p-4 shadow-sm rounded-lg border-l-4 bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">總課程數</div>
                        <div class="text-2xl font-bold text-sky-700">{{ activityStats.totalCourses }}</div>
                    </div>
                    <div class="bg-sky-100 p-3 rounded-full">
                        <i class="pi pi-book text-sky-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4  bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">完成課程</div>
                        <div class="text-2xl font-bold text-green-600">{{ activityStats.completedCourses }}</div>
                    </div>
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4  bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">缺席次數</div>
                        <div class="text-2xl font-bold text-red-600">{{ activityStats.absenceCourses }}</div>
                    </div>
                    <div class="bg-red-100 p-3 rounded-full">
                        <i class="pi pi-times-circle text-red-500 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="card p-4 shadow-sm rounded-lg border-l-4 bg-white border border-sky-100">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-sm text-gray-500">課程評價</div>
                        <div class="text-2xl font-bold text-purple-600">{{ activityStats.averageRating }}
                            <span class="text-sm text-gray-500">/ 5</span>
                        </div>
                    </div>
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="pi pi-star-fill text-purple-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 簡化篩選部分和標籤頁 -->
        <div class="card bg-white rounded-lg shadow-sm border border-sky-100 p-4 h-full flex flex-col gap-4">
            <!-- 簡化過濾器區域 -->
            <div class="flex flex-wrap gap-3 items-end bg-sky-50 p-3 rounded-lg border border-sky-100">
                <!-- 日期範圍篩選 -->
                <div class="flex-grow md:w-auto md:flex-grow-0">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">日期範圍</label>
                    <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate"
                        @change="handleDateRangeChange" class="w-full"  :show-controls="false"/>
                </div>

                <!-- 狀態篩選 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">狀態</label>
                    <Select v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="選擇狀態" class="w-full md:w-40" @change="applyFilters" size="small" />
                </div>

                <!-- 搜尋 -->
                <div class="w-full md:w-auto">
                    <label class="block text-sm mb-1 text-sky-700 font-medium">關鍵字搜尋</label>
                    <IconField class="w-full">
                        <InputIcon class="pi pi-search text-sky-400" />
                        <InputText v-model="filters.search" placeholder="搜尋課程名稱..." 
                            class="w-full border-sky-200 focus:border-sky-500"
                            @input="debounceSearch"  size="small" />
                    </IconField>
                </div>

                <!-- 重置按鈕 -->
                <div class="w-full md:w-auto flex items-end">
                    <Button label="重置篩選" icon="pi pi-refresh" outlined 
                        @click="resetAllFilters" class="!border-sky-500 !text-sky-500 hover:!bg-sky-50" />
                </div>
            </div>

            <!-- 標籤頁 -->
            <Tabs v-model:activeIndex="activeTabIndex" class="flex-1 flex flex-col activity-tabs" 
                  :tabindex="0" value="預約紀錄">
                <TabList>
                    <Tab v-for="tab in tabItems" :key="tab.label" :value="tab.value" class="text-sky-700">
                        <i :class="tab.icon + ' mr-2'"></i>
                        {{ tab.label }}
                        <Badge v-if="tab.count" :value="tab.count" class="ml-2 bg-sky-100 text-sky-700" />
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel :value="tabItems[0].value">
                        <!-- 預約紀錄面板 -->
                        <DataTable :value="filteredCourseHistory" stripedRows paginator :rows="10"
                            responsiveLayout="stack" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" sortable headerClass="bg-sky-50 text-sky-700" />
                            <Column field="date" header="日期" sortable headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="time" header="時間" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="instructor.name" header="講師" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="courseType" header="課程類型" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="points" header="消費點數" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="status" header="狀態" headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    <Tag :severity="getStatusSeverity(data.status)"
                                        :value="getCourseStatus(data.status)" />
                                </template>
                            </Column>
                            <Column field="action" header="操作" headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    <div class="flex gap-1">
                                        <Button icon="pi pi-eye" text rounded aria-label="查看詳情"
                                            @click="viewCourseDetail(data)" class="text-sky-500 hover:bg-sky-50" />
                                        <Button v-if="canRate(data)" icon="pi pi-star" text rounded aria-label="評價課程"
                                            @click="openRatingDialog(data)" class="text-yellow-500 hover:bg-yellow-50" />
                                    </div>
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center p-6 bg-sky-50 rounded-lg border border-sky-100">
                                    <i class="pi pi-calendar-times text-4xl text-sky-200 mb-2"></i>
                                    <p class="text-sky-600">尚無課程紀錄</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                    <TabPanel :value="tabItems[1].value">
                        <!-- 缺席紀錄面板 -->
                        <DataTable :value="filteredAbsenceRecords" stripedRows paginator :rows="10"
                            responsiveLayout="stack" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" sortable headerClass="bg-sky-50 text-sky-700" />
                            <Column field="date" header="日期" sortable headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="time" header="時間" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="courseType" header="課程類型" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="points" header="扣除點數" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="reason" header="缺席原因" headerClass="bg-sky-50 text-sky-700" />

                            <template #empty>
                                <div class="text-center p-6 bg-sky-50 rounded-lg border border-sky-100">
                                    <i class="pi pi-calendar-times text-4xl text-sky-200 mb-2"></i>
                                    <p class="text-sky-600">無缺席紀錄</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                    <TabPanel :value="tabItems[2].value">
                        <!-- 評價紀錄面板 -->
                        <DataTable :value="filteredRatingHistory" stripedRows paginator :rows="10"
                            responsiveLayout="stack" :loading="loading" class="!flex-1 flex flex-col">
                            <Column field="courseTitle" header="課程名稱" sortable headerClass="bg-sky-50 text-sky-700" />
                            <Column field="date" header="日期" sortable headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    {{ formatDateString(data.date) }}
                                </template>
                            </Column>
                            <Column field="instructor.name" header="講師" headerClass="bg-sky-50 text-sky-700" />
                            <Column field="rating" header="評分" headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    <Rating v-model="data.rating" :cancel="false" :readonly="true" />
                                </template>
                            </Column>
                            <Column field="comment" header="評論" headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    <div class="max-w-xs truncate">{{ data.comment || '無評論' }}</div>
                                </template>
                            </Column>
                            <Column field="action" header="操作" headerClass="bg-sky-50 text-sky-700">
                                <template #body="{ data }">
                                    <Button icon="pi pi-pencil" text rounded aria-label="編輯評價"
                                        @click="openRatingDialog(data, true)" class="text-sky-500 hover:bg-sky-50" />
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center p-6 bg-sky-50 rounded-lg border border-sky-100">
                                    <i class="pi pi-star text-4xl text-sky-200 mb-2"></i>
                                    <p class="text-sky-600">尚無評價紀錄</p>
                                </div>
                            </template>
                        </DataTable>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { formatDateString, inRange } from '@/utils/dateUtils';
import { BookingStatus, BookingStatusLabel } from '@/enums/BookingStatus';
import { useToast } from 'primevue/usetoast';
import Badge from 'primevue/badge';
import Rating from 'primevue/rating';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { useBookingStore } from '@/stores/bookingStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import type { Booking } from '@/types/booking';
import { ActivityService, type ActivityStatsResponse } from '@/services/activityService';

// 使用 stores
const bookingStore = useBookingStore();
const userStore = useUserStore();
const authStore = useAuthStore();

// 活動統計數據
const activityStatsData = ref<ActivityStatsResponse>({
    totalCourses: 0,
    completedCourses: 0,
    absenceCourses: 0,
    averageRating: 0,
    totalPointsSpent: 0,
    monthlyActivities: 0
});

// 評價記錄數據
const ratingHistoryData = ref<Booking[]>([]);

// 缺席記錄數據
const absenceRecordsData = ref<Booking[]>([]);

// 計算屬性 - 課程歷史
const courseHistory = computed(() => {
    return bookingStore.bookings;
});

// 計算屬性 - 缺席記錄
const absenceRecords = computed(() => {
    return absenceRecordsData.value;
});

// 評價記錄
const ratingHistory = computed(() => {
    return ratingHistoryData.value;
});

// 初始化數據
onMounted(async () => {
    if (authStore.isLoggedIn) {
        await Promise.all([
            bookingStore.fetchSchedule(),
            fetchActivityStats(),
            fetchRatingHistory(),
            fetchAbsenceRecords()
        ]);
    }
});

// 狀態與過濾
const toast = useToast();
const loading = ref(false);
const selectedCourse = ref<Booking | null>(null);
const showDetailDialog = ref(false);
const showRatingDialog = ref(false);
const activeTabIndex = ref(0);
const isEditRating = ref(false);

// 日期範圍
const startDate = ref<Date>();
const endDate = ref<Date>(new Date(new Date().setDate(new Date().getDate() + 20)));
const range = ref<{ start: Date; end: Date } | null>(null);

// 篩選條件
const filters = ref({
    search: '',
    status: '',
});

// 防抖定時器
let searchTimeout: number | null = null;

// 防抖函數 - 用於搜尋
const debounceSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300) as unknown as number;
};

// 評價表單
const ratingForm = ref({
    rating: 0,
    comment: ''
});

// 狀態選項
const statusOptions = [
    { label: '全部狀態', value: '' },
    { label: '已完成', value: BookingStatus.Confirmed.toString() },
    { label: '已取消', value: BookingStatus.Cancelled.toString() },
    { label: '待處理', value: BookingStatus.Pending.toString() }
];

// 活動統計
const activityStats = computed(() => {
    return {
        totalCourses: activityStatsData.value.totalCourses,
        completedCourses: activityStatsData.value.completedCourses,
        absenceCourses: activityStatsData.value.absenceCourses,
        averageRating: activityStatsData.value.averageRating.toFixed(1)
    };
});

// 標籤頁菜單
const tabItems = computed(() => [
    {
        label: '預約紀錄',
        icon: 'pi pi-calendar',
        count: filteredCourseHistory.value.length,
        value: '預約紀錄'
    },
    {
        label: '缺席紀錄',
        icon: 'pi pi-calendar-times',
        count: filteredAbsenceRecords.value.length,
        value: '缺席紀錄'
    },
    {
        label: '評價紀錄',
        icon: 'pi pi-star',
        count: filteredRatingHistory.value.length,
        value: '評價紀錄'
    }
]);

// 過濾後的課程歷史
const filteredCourseHistory = computed(() => {
    let filtered = [...courseHistory.value];

    // 日期範圍過濾
    if (range.value) {
        filtered = inRange(range.value.start, range.value.end, filtered, (item) => new Date(item.date));
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
        filtered = inRange(range.value.start, range.value.end, filtered, (item) => new Date(item.date));
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

// 處理日期範圍變更 - 立即應用篩選
const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    range.value = dateRange;
    applyFilters();
};

// 應用篩選器
const applyFilters = async () => {
    loading.value = true;
    try {
        await Promise.all([
            fetchActivityStats(),
            fetchRatingHistory(),
            fetchAbsenceRecords()
        ]);
    } finally {
        loading.value = false;
    }
};

// 重置篩選器
const resetFilters = () => {
    range.value = null;
    startDate.value = undefined;
    endDate.value = undefined;
    applyFilters();
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

// 監聽篩選條件變更 - 立即應用篩選
watch(() => [filters.value.status, filters.value.search], () => {
    applyFilters();
}, { deep: true });

// 查看课程详情
const viewCourseDetail = (course: Booking) => {
    selectedCourse.value = course;
    showDetailDialog.value = true;
};

// 判斷是否可以評價
const canRate = (course: Booking): boolean => {
    // 只有已完成的課程才能評價，且未評價過
    return course.status === BookingStatus.Confirmed &&
        (!course.rating || course.rating === 0);
};

// 打開評價對話框
const openRatingDialog = (course: Booking, isEdit = false) => {
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
        case BookingStatus.Cancelled:
            return 'danger';
        case BookingStatus.Pending:
            return 'info';
        default:
            return 'secondary';
    }
};

// 獲取活動統計數據
const fetchActivityStats = async () => {
    if (!authStore.isLoggedIn || !userStore.profile?.userId) return;
    
    try {
        const query = {
            startDate: startDate.value?.toISOString().split('T')[0],
            endDate: endDate.value?.toISOString().split('T')[0],
            search: filters.value.search,
            status: filters.value.status
        };
        
        const result = await ActivityService.getActivityStats(userStore.profile.userId, query);
        if (result.success && result.data) {
            activityStatsData.value = result.data;
        }
    } catch (error) {
        console.error('獲取活動統計失敗:', error);
    }
};

// 獲取評價記錄
const fetchRatingHistory = async () => {
    if (!authStore.isLoggedIn || !userStore.profile?.userId) return;
    
    try {
        const query = {
            startDate: startDate.value?.toISOString().split('T')[0],
            endDate: endDate.value?.toISOString().split('T')[0],
            search: filters.value.search
        };
        
        const result = await ActivityService.getRatingHistory(userStore.profile.userId, query);
        if (result.success && result.data) {
            ratingHistoryData.value = result.data;
        }
    } catch (error) {
        console.error('獲取評價記錄失敗:', error);
    }
};

// 獲取缺席記錄
const fetchAbsenceRecords = async () => {
    if (!authStore.isLoggedIn || !userStore.profile?.userId) return;
    
    try {
        const query = {
            startDate: startDate.value?.toISOString().split('T')[0],
            endDate: endDate.value?.toISOString().split('T')[0],
            search: filters.value.search
        };
        
        const result = await ActivityService.getAbsenceRecords(userStore.profile.userId, query);
        if (result.success && result.data) {
            absenceRecordsData.value = result.data;
        }
    } catch (error) {
        console.error('獲取缺席記錄失敗:', error);
    }
};
</script>

<style scoped>
@reference "tailwindcss";

.card {
    @apply bg-white border border-sky-100 rounded-lg p-4;
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

:deep(.p-datatable-tbody > tr:hover) {
    @apply bg-sky-50/50;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-paginator) {
    @apply border-t border-sky-100 bg-white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    @apply bg-sky-500 text-white;
}

:deep(.p-button.p-button-outlined) {
    @apply border-sky-500 text-sky-500;
}

:deep(.p-button.p-button-outlined:hover) {
    @apply bg-sky-50;
}

:deep(.activity-tabs .p-tabview-nav) {
    @apply border-b border-sky-100;
}

:deep(.activity-tabs .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
    @apply text-sky-700 border-b-2 border-sky-500;
}

:deep(.activity-tabs .p-tabview-nav li .p-tabview-nav-link:not(.p-disabled):focus) {
    @apply shadow-none ring-sky-200;
}

:deep(.p-inputtext:enabled:focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-rating .p-rating-item.p-rating-item-active .p-rating-icon) {
    @apply text-yellow-500;
}
</style>