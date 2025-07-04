<template>
    <div>
        <!-- 頂部操作區 -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <!-- 搜尋和篩選 -->
            <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="filters.search" placeholder="搜尋課程..." />
                </IconField>

                <Select v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="課程狀態" class="w-full sm:w-auto" />

                <Select v-model="filters.sortBy" :options="sortOptions" optionLabel="label" optionValue="value"
                    placeholder="排序方式" class="w-full sm:w-auto" />
            </div>

            <!-- 新增課程按鈕 -->
            <Button label="新增課程" icon="pi pi-plus" @click="navigateTo('/merchant/courses/create')" />
        </div>

        <!-- 課程數據表格 -->
        <DataTable :value="filteredCourses" v-model:selection="selectedCourses" :paginator="true" :rows="10"
            :rowsPerPageOptions="[5, 10, 20]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :loading="loading" stripedRows responsiveLayout="stack" breakpoint="960px"
            :globalFilterFields="['title', 'status', 'price', 'availableSlots', 'totalSlots', 'startDate']"
            @row-dblclick="handleRowDblClick">

            <!-- 表頭 -->
            <template #header>
                <div class="flex justify-between items-center">
                    <h3 class="m-0">課程列表</h3>
                    <div class="flex gap-2">
                        <Button icon="pi pi-refresh" @click="loadCourses" text rounded />
                        <Button icon="pi pi-trash" severity="danger" text rounded :disabled="!selectedCourses.length"
                            @click="confirmDeleteSelected" />
                    </div>
                </div>
            </template>

            <!-- 選擇列 -->
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <!-- 課程圖片-->
            <Column field="coverUrl" header="圖片" style="width: 100px">
                <template #body="slotProps">
                    <img :src="slotProps.data.coverUrl" :alt="slotProps.data.title"
                        class="w-16 h-16 object-cover rounded-md" />
                </template>
            </Column>

            <!-- 課程標題 -->
            <Column field="title" header="課程名稱" sortable>
                <template #body="slotProps">
                    <div class="font-medium">{{ slotProps.data.title }}</div>
                    <div class="text-xs text-gray-500 mt-1">ID: {{ slotProps.data.id }}</div>
                </template>
            </Column>

            <!-- 課程狀態 -->
            <Column field="status" header="狀態" sortable style="width: 120px">
                <template #body="slotProps">
                    <Tag :severity="getCourseStatusSeverity(slotProps.data.status)"
                        :value="getCourseStatusLabel(slotProps.data.status)" />
                </template>
            </Column>

            <!-- 報名情況 -->
            <Column field="availableSlots" header="報名情況" sortable style="width: 120px">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <div class="text-sm">{{ slotProps.data.bookedSlots }}/{{ slotProps.data.totalSlots }}</div>
                        <ProgressBar :value="(slotProps.data.bookedSlots / slotProps.data.totalSlots) * 100"
                            class="h-1.5 flex-grow" :class="getBookingProgressClass(slotProps.data)" />
                    </div>
                </template>
            </Column>

            <!-- 點數價格 -->
            <Column field="points" header="點數" sortable style="width: 100px">
                <template #body="slotProps">
                    <div class="text-center font-medium">{{ slotProps.data.points }}</div>
                </template>
            </Column>

            <!-- 開課日期 -->
            <Column field="startDate" header="開課日期" sortable style="width: 150px">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.startDate) }}
                </template>
            </Column>

            <!-- 操作按鈕 -->
            <Column header="操作" style="width: 150px">
                <template #body="slotProps">
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" text rounded @click="editCourse(slotProps.data)" />
                        <Button icon="pi pi-copy" text rounded @click="duplicateCourse(slotProps.data)" />
                        <Button :icon="slotProps.data.status === CourseStatus.ACTIVE ? 'pi pi-eye-slash' : 'pi pi-eye'" text
                            rounded @click="toggleCourseStatus(slotProps.data)" />
                        <Button icon="pi pi-trash" severity="danger" text rounded
                            @click="confirmDelete(slotProps.data)" />
                    </div>
                </template>
            </Column>

            <!-- 無數據時顯示 -->
            <template #empty>
                <div class="text-center p-4">
                    <i class="pi pi-search text-4xl text-gray-300 mb-3"></i>
                    <p>未找到符合條件的課程</p>
                    <Button label="新增課程" icon="pi pi-plus" @click="navigateTo('/merchant/courses/create')"
                        class="mt-3" />
                </div>
            </template>
        </DataTable>

        <!-- 刪除確認對話框 -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { showSuccess, showError, showInfo } from '@/utils/toastHelper';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import ConfirmDialog from 'primevue/confirmdialog';
import { CourseStatus } from '@/enums/Course';
import type { CourseListItem } from '@/types/course';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getCourseStatusLabel, getCourseStatusSeverity } from '@/utils/statusUtils';

const router = useRouter();
const confirm = useConfirm();

// 篩選條件
const filters = ref({
    search: '',
    status: '',
    sortBy: ''
});

// 狀態選項
const statusOptions = [
    { label: '全部狀態', value: '' },
    { label: '已上架', value: CourseStatus.ACTIVE },
    { label: '已下架', value: CourseStatus.INACTIVE },
    { label: '草稿', value: CourseStatus.DRAFT }
];

// 排序選項
const sortOptions = [
    { label: '預設排序', value: '' },
    { label: '最新建立', value: 'newest' },
    { label: '最早建立', value: 'oldest' },
    { label: '點數高至低', value: 'points-desc' },
    { label: '點數低至高', value: 'points-asc' },
    { label: '報名率高至低', value: 'booking-desc' }
];

// 課程數據
const courses = ref<CourseListItem[]>([]);
const selectedCourses = ref<CourseListItem[]>([]);
const loading = ref(false);

// 根據篩選條件過濾課程
const filteredCourses = computed(() => {
    let result = [...courses.value];

    // 搜尋過濾
    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        result = result.filter(course =>
            course.title.toLowerCase().includes(searchLower) ||
            course.description.toLowerCase().includes(searchLower)
        );
    }

    // 狀態過濾
    if (filters.value.status) {
        result = result.filter(course => course.status === filters.value.status);
    }

    // 排序
    if (filters.value.sortBy) {
        switch (filters.value.sortBy) {
            case 'newest':
                result.sort((a, b) => b.id - a.id);
                break;
            case 'oldest':
                result.sort((a, b) => a.id - b.id);
                break;
            case 'points-desc':
                result.sort((a, b) => b.points - a.points);
                break;
            case 'points-asc':
                result.sort((a, b) => a.points - b.points);
                break;
            case 'booking-desc':
                result.sort((a, b) => (b.bookedSlots / b.totalSlots) - (a.bookedSlots / a.totalSlots));
                break;
        }
    }

    return result;
});

// 獲取預訂進度條樣式
function getBookingProgressClass(course: CourseListItem): string {
    const ratio = course.bookedSlots / course.totalSlots;
    if (ratio >= 0.9) return 'bg-red-500';
    if (ratio >= 0.7) return 'bg-orange-500';
    return 'bg-green-500';
}

// 加載課程數據
async function loadCourses(): Promise<void> {
    loading.value = true;

    try {
        // 模擬 API 請求
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模擬課程數據
        courses.value = [
            {
                id: 1,
                title: '瑜珈初階班',
                description: '適合初學者的瑜珈課程',
                coverUrl: '/images/courses/yoga.jpg',
                status: CourseStatus.ACTIVE,
                points: 500,
                totalSlots: 20,
                bookedSlots: 15,
                startDate: new Date('2024-03-01')
            },
            {
                id: 2,
                title: '烹飪課程：義式料理',
                description: '學習正宗義大利料理',
                coverUrl: 'https://via.placeholder.com/150?text=Cooking',
                status: CourseStatus.ACTIVE,
                points: 30,
                bookedSlots: 5,
                totalSlots: 12,
                startDate: new Date(2023, 5, 20)
            },
            {
                id: 3,
                title: '水彩畫入門',
                description: '基礎水彩技巧教學',
                coverUrl: 'https://via.placeholder.com/150?text=Art',
                status: CourseStatus.DRAFT,
                points: 20,
                bookedSlots: 0,
                totalSlots: 8,
                startDate: new Date(2023, 6, 1)
            },
            {
                id: 4,
                title: '攝影基礎課程',
                description: '學習基本攝影技巧',
                coverUrl: 'https://via.placeholder.com/150?text=Photo',
                status: CourseStatus.INACTIVE,
                points: 35,
                bookedSlots: 0,
                totalSlots: 15,
                startDate: new Date(2023, 6, 5)
            },
            {
                id: 5,
                title: '手工皂製作工作坊',
                description: '學習製作天然手工皂',
                coverUrl: 'https://via.placeholder.com/150?text=Soap',
                status: CourseStatus.ACTIVE,
                points: 15,
                bookedSlots: 12,
                totalSlots: 15,
                startDate: new Date(2023, 5, 25)
            }
        ];
    } catch (error) {
        console.error('加載課程失敗:', error);
        showError('加載失敗');
    } finally {
        loading.value = false;
    }
}

// 編輯課程
function editCourse(course: CourseListItem): void {
    router.push(`/merchant/courses/${course.id}/edit`);
}

// 複製課程
function duplicateCourse(course: CourseListItem): void {
    // 模擬 API 請求
    setTimeout(() => {
        showSuccess('課程已複製');
        loadCourses(); // 重新加載課程列表
    }, 500);
}

// 切換課程狀態
function toggleCourseStatus(course: CourseListItem): void {
    const newStatus = course.status === CourseStatus.ACTIVE ? CourseStatus.INACTIVE : CourseStatus.ACTIVE;
    const action = newStatus === CourseStatus.ACTIVE ? '上架' : '下架';
    
    // 模擬 API 請求
    setTimeout(() => {
        course.status = newStatus;
        showSuccess(`課程已${action}`);
    }, 500);
}

// 刪除課程
function deleteCourse(course: CourseListItem): void {
    // 模擬 API 請求
    setTimeout(() => {
        courses.value = courses.value.filter(c => c.id !== course.id);
        showSuccess('課程已刪除');
    }, 500);
}

// 確認刪除課程
function confirmDelete(course: CourseListItem): void {
    confirm.require({
        message: '確定要刪除這門課程嗎？此操作無法撤銷。',
        header: '刪除確認',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteCourse(course)
    });
}

// 刪除選中的課程
function deleteSelectedCourses(): void {
    // 模擬 API 請求
    setTimeout(() => {
        const selectedIds = selectedCourses.value.map(course => course.id);
        courses.value = courses.value.filter(course => !selectedIds.includes(course.id));
        selectedCourses.value = [];
        showSuccess('已刪除選中的課程');
    }, 500);
}

// 確認刪除選中的課程
function confirmDeleteSelected(): void {
    confirm.require({
        message: `確定要刪除選中的 ${selectedCourses.value.length} 門課程嗎？此操作無法撤銷。`,
        header: '刪除確認',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteSelectedCourses()
    });
}

// 導航到指定頁面
function navigateTo(path: string): void {
    router.push(path);
}

// 雙擊行處理
function handleRowDblClick(event: any): void {
    editCourse(event.data);
}

// 初始化
onMounted(() => {
    loadCourses();
});
</script>