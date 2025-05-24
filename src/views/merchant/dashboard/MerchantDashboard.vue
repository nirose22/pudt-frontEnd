<template>
    <div>
        <!-- 關鍵指標卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- 今日預約 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-gray-500 text-sm">今日預約</h3>
                        <p class="text-2xl font-bold mt-1">{{ dashboardData.todayBookings }}</p>
                    </div>
                    <div class="bg-blue-100 p-2 rounded-full">
                        <i class="pi pi-calendar text-blue-600"></i>
                    </div>
                </div>
                <div class="mt-2 text-xs flex items-center"
                    :class="dashboardData.bookingTrend >= 0 ? 'text-green-600' : 'text-red-600'">
                    <i :class="dashboardData.bookingTrend >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                    <span class="ml-1">{{ Math.abs(dashboardData.bookingTrend) }}% 相比上週</span>
                </div>
            </div>

            <!-- 本月營收 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-gray-500 text-sm">本月營收 (點數)</h3>
                        <p class="text-2xl font-bold mt-1">{{ dashboardData.monthlyRevenue }}</p>
                    </div>
                    <div class="bg-green-100 p-2 rounded-full">
                        <i class="pi pi-wallet text-green-600"></i>
                    </div>
                </div>
                <div class="mt-2 text-xs flex items-center"
                    :class="dashboardData.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'">
                    <i :class="dashboardData.revenueTrend >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                    <span class="ml-1">{{ Math.abs(dashboardData.revenueTrend) }}% 相比上月</span>
                </div>
            </div>

            <!-- 課程總數 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-gray-500 text-sm">課程總數</h3>
                        <p class="text-2xl font-bold mt-1">{{ dashboardData.totalCourses }}</p>
                    </div>
                    <div class="bg-purple-100 p-2 rounded-full">
                        <i class="pi pi-book text-purple-600"></i>
                    </div>
                </div>
                <div class="mt-2 text-xs flex items-center">
                    <span>{{ dashboardData.activeCourses }} 個上架中</span>
                </div>
            </div>

            <!-- 取消率 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-gray-500 text-sm">取消率</h3>
                        <p class="text-2xl font-bold mt-1">{{ dashboardData.cancellationRate }}%</p>
                    </div>
                    <div class="bg-orange-100 p-2 rounded-full">
                        <i class="pi pi-times-circle text-orange-600"></i>
                    </div>
                </div>
                <div class="mt-2 text-xs flex items-center"
                    :class="dashboardData.cancellationTrend <= 0 ? 'text-green-600' : 'text-red-600'">
                    <i :class="dashboardData.cancellationTrend <= 0 ? 'pi pi-arrow-down' : 'pi pi-arrow-up'"></i>
                    <span class="ml-1">{{ Math.abs(dashboardData.cancellationTrend) }}% 相比上月</span>
                </div>
            </div>
        </div>

        <!-- 圖表區域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- 營收趨勢圖 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h3 class="text-lg font-semibold mb-4">營收趨勢</h3>
                <Chart type="line" :data="revenueChartData" :options="revenueChartOptions" class="h-64" />
            </div>

            <!-- 預約分佈圖 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h3 class="text-lg font-semibold mb-4">預約分佈</h3>
                <Chart type="doughnut" :data="bookingChartData" :options="bookingChartOptions" class="h-64" />
            </div>
        </div>

        <!-- 熱門課程 & 待處理預約 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 熱門課程 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">熱門課程</h3>
                    <Button label="查看全部" link icon="pi pi-arrow-right" iconPos="right"
                        @click="navigateTo('/merchant/courses')" />
                </div>

                <DataTable :value="topCourses" responsiveLayout="scroll" class="p-datatable-sm" stripedRows>
                    <Column field="title" header="課程名稱"></Column>
                    <Column field="bookings" header="預約數">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.bookings" severity="info"></Badge>
                        </template>
                    </Column>
                    <Column field="revenue" header="營收 (點數)"></Column>
                    <Column field="rating" header="評分">
                        <template #body="slotProps">
                            <Rating :modelValue="slotProps.data.rating" readonly :cancel="false" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- 待處理預約 -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">待處理預約</h3>
                    <Button label="查看全部" link icon="pi pi-arrow-right" iconPos="right"
                        @click="navigateTo('/merchant/bookings')" />
                </div>

                <DataTable :value="pendingBookings" responsiveLayout="scroll" class="p-datatable-sm" stripedRows>
                    <Column field="customerName" header="客戶姓名"></Column>
                    <Column field="courseTitle" header="課程名稱" class="truncate max-w-[150px]"></Column>
                    <Column field="date" header="預約日期">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.date) }}
                        </template>
                    </Column>
                    <Column field="status" header="狀態">
                        <template #body="slotProps">
                            <Tag :severity="getStatusSeverity(slotProps.data.status)"
                                :value="getStatusLabel(slotProps.data.status)" />
                        </template>
                    </Column>
                    <Column header="操作">
                        <template #body="slotProps">
                            <Button icon="pi pi-check" rounded text @click="confirmBooking(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Rating from 'primevue/rating';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { showSuccess, showError, showInfo } from '@/utils/toastHelper';
import { formatDateTime } from '@/utils/dateUtils';

const router = useRouter();

// 儀表板數據
const dashboardData = ref({
    todayBookings: 12,
    bookingTrend: 5.2,
    monthlyRevenue: 2450,
    revenueTrend: 8.7,
    totalCourses: 24,
    activeCourses: 18,
    cancellationRate: 3.2,
    cancellationTrend: -1.5
});

// 營收圖表數據
const revenueChartData = ref({
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [
        {
            label: '營收 (點數)',
            data: [1200, 1900, 1500, 2200, 2700, 2450],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }
    ]
});

// 營收圖表選項
const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                display: true,
                drawBorder: false
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    }
};

// 預約分佈圖數據
const bookingChartData = ref({
    labels: ['已確認', '待確認', '已完成', '已取消'],
    datasets: [
        {
            data: [65, 15, 40, 10],
            backgroundColor: ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444'],
            hoverBackgroundColor: ['#16A34A', '#D97706', '#2563EB', '#DC2626']
        }
    ]
});

// 預約分佈圖選項
const bookingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom'
        }
    }
};

// 熱門課程數據
const topCourses = ref([
    { id: 1, title: '瑜珈初階班', bookings: 24, revenue: 600, rating: 4.8 },
    { id: 2, title: '烹飪課程：義式料理', bookings: 18, revenue: 450, rating: 4.5 },
    { id: 3, title: '水彩畫入門', bookings: 15, revenue: 375, rating: 4.7 }
]);

// 待處理預約數據
const pendingBookings = ref([
    { id: 101, customerName: '張小明', courseTitle: '瑜珈初階班', date: new Date(2023, 5, 15, 14, 0), status: 'pending' },
    { id: 102, customerName: '李小華', courseTitle: '烹飪課程：義式料理', date: new Date(2023, 5, 16, 10, 0), status: 'pending' },
    { id: 103, customerName: '王大偉', courseTitle: '水彩畫入門', date: new Date(2023, 5, 16, 15, 30), status: 'pending' }
]);

// 確認預約
function confirmBooking(bookingId: number): void {
    // 模擬 API 請求
    setTimeout(() => {
        showSuccess('預約已確認');
        // 更新預約列表
        pendingBookings.value = pendingBookings.value.filter(booking => booking.id !== bookingId);
    }, 500);
}

// 導航到指定頁面
function navigateTo(path: string): void {
    router.push(path);
}

// 獲取狀態標籤樣式
function getStatusSeverity(status: string): string {
    const severityMap: Record<string, string> = {
        'pending': 'warning',
        'confirmed': 'success',
        'cancelled': 'danger'
    };
    return severityMap[status] || 'info';
}

// 獲取狀態標籤文字
function getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
        'pending': '待確認',
        'confirmed': '已確認',
        'cancelled': '已取消'
    };
    return labelMap[status] || status;
}

// 格式化日期
function formatDate(date: Date): string {
    return formatDateTime(date);
}

// 加載儀表板數據
async function loadDashboardData(): Promise<void> {
    try {
        // 模擬 API 請求
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 更新數據
        dashboardData.value = {
            todayBookings: 12,
            bookingTrend: 5.2,
            monthlyRevenue: 2450,
            revenueTrend: 8.7,
            totalCourses: 24,
            activeCourses: 18,
            cancellationRate: 3.2,
            cancellationTrend: -1.5
        };
    } catch (error) {
        console.error('加載儀表板數據失敗:', error);
        showError('加載失敗');
    }
}

// 初始化
onMounted(() => {
    loadDashboardData();
});
</script>

<style scoped>
:deep(.p-datatable-sm) .p-datatable-thead>tr>th,
:deep(.p-datatable-sm) .p-datatable-tbody>tr>td {
    padding: 0.5rem;
}
</style>