<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Hero Section -->
        <div class="pudt-banner relative overflow-hidden">
            <div class="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <div class="text-center space-y-8">
                    <!-- Logo & Branding -->
                    <div class="flex flex-col items-center space-y-4">
                        <div class="animate-float">
                            <img src="../assets/image/pudt_logo-xl.png" alt="PUDT Logo" class="h-55">
                        </div>
                        <div class="space-y-2">
                            <p class="text-2xl md:text-3xl font-light text-sky-600">Put Your Dots Together</p>
                            <h1 class="text-3xl md:text-5xl font-bold text-gray-800">整合你的學習生活</h1>
                            <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                                透過智能推薦系統，連結多元課程體驗<br>
                                <span class="text-sky-600 font-medium">讓每一次學習都成為成長的起點</span>
                            </p>
                        </div>
                    </div>

                    <!-- Search Bar -->
                    <div class="max-w-2xl mx-auto">
                        <SearchBar v-model="searchQuery" @search="handleSearch" class="border-0 shadow-none" />
                    </div>
                </div>
            </div>
            <!-- Background decorative elements -->
            <div class="absolute top-10 left-10 w-30 h-30 bg-sky-200/80 rounded-full animate-pulse"></div>
            <div class="absolute top-32 right-20 w-16 h-16 bg-yellow-200/40 rounded-full animate-pulse delay-1000"></div>
            <div class="absolute bottom-10 left-45 w-15 h-15 bg-sky-300/40 rounded-full animate-pulse delay-500"></div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto space-y-4">
            <!-- AI Recommendation Highlight -->
            <div class="text-center">
                <div class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-3xl p-4 border border-sky-100">
                    <div class="flex flex-col items-center space-y-4">
                        <div
                            class="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <i class="pi pi-sparkles text-2xl text-white"></i>
                        </div>
                        <div class="space-y-2">
                            <h2 class="text-2xl md:text-3xl font-bold text-sky-700">PUDT 智能推薦引擎</h2>
                            <p class="text-gray-600 max-w-3xl">
                                基於您的學習軌跡、興趣偏好與行為模式，運用 AI 算法為您精準推薦最適合的學習體驗
                            </p>
                        </div>
                        <div class="flex flex-wrap justify-center gap-4 text-sm">
                            <div class="bg-white/80 px-4 py-2 rounded-full flex items-center space-x-2">
                                <div class="w-2 h-2 bg-sky-500 rounded-full"></div>
                                <span class="text-gray-700">智能學習軌跡分析</span>
                            </div>
                            <div class="bg-white/80 px-4 py-2 rounded-full flex items-center space-x-2">
                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span class="text-gray-700">多維度偏好匹配</span>
                            </div>
                            <div class="bg-white/80 px-4 py-2 rounded-full flex items-center space-x-2">
                                <div class="w-2 h-2 bg-sky-600 rounded-full"></div>
                                <span class="text-gray-700">即時推薦優化</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Course Navigation Tabs -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Tabs :value="activeTab" class="course-tabs">
                    <TabList class="bg-gray-50 border-b border-gray-100">
                        <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value" @click="activeTab = tab.value"
                            class="flex-1 py-4 px-6 transition-all duration-200">
                            <div class="flex items-center justify-center space-x-2">
                                <i :class="tab.icon" class="text-lg"></i>
                                <span class="font-medium">{{ tab.label }}</span>
                            </div>
                        </Tab>
                    </TabList>

                    <TabPanels class="p-6">
                        <!-- 為您推薦標籤頁 -->
                        <TabPanel value="recommended">
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div
                                            class="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl flex items-center justify-center">
                                            <i class="pi pi-user text-white"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold text-sky-700">為您推薦</h3>
                                            <p class="text-sm text-gray-500">基於您的學習偏好智能推薦</p>
                                        </div>
                                    </div>
                                    <div v-if="userStore.user?.id" class="bg-sky-50 px-3 py-1 rounded-full">
                                        <span class="text-xs text-sky-600 font-medium">AI 個人化推薦</span>
                                    </div>
                                </div>

                                <div v-if="isCoursesLoading" class="flex justify-center items-center py-16">
                                    <div class="text-center space-y-3">
                                        <ProgressSpinner style="width:40px;height:40px" strokeWidth="3"
                                            class="text-sky-500" />
                                        <p class="text-gray-500">AI 正在為您精選課程...</p>
                                    </div>
                                </div>
                                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div v-for="course in displayCourses.recommended" :key="course.id"
                                        @click="selectCourse(course)" class="course-card-wrapper">
                                        <CourseCard :course="course" :loading="isLoading(course.id)" />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- 熱門課程標籤頁 -->
                        <TabPanel value="popular">
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div
                                            class="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                                            <i class="pi pi-star text-white"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold text-sky-700">熱門課程</h3>
                                            <p class="text-sm text-gray-500">社群最受歡迎的學習選擇</p>
                                        </div>
                                    </div>
                                    <div class="bg-amber-50 px-3 py-1 rounded-full">
                                        <span class="text-xs text-amber-600 font-medium">
                                            <i class="pi pi-users mr-1"></i>熱門推薦
                                        </span>
                                    </div>
                                </div>

                                <div v-if="isCoursesLoading" class="flex justify-center items-center py-16">
                                    <div class="text-center space-y-3">
                                        <ProgressSpinner style="width:40px;height:40px" strokeWidth="3"
                                            class="text-sky-500" />
                                        <p class="text-gray-500">載入熱門課程中...</p>
                                    </div>
                                </div>
                                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div v-for="course in displayCourses.popular" :key="course.id"
                                        @click="selectCourse(course)" class="course-card-wrapper">
                                        <CourseCard :course="course" :loading="isLoading(course.id)" />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- 最新上架標籤頁 -->
                        <TabPanel value="latest">
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div
                                            class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                            <i class="pi pi-calendar text-white"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold text-sky-700">最新上架</h3>
                                            <p class="text-sm text-gray-500">最新發布的精選學習內容</p>
                                        </div>
                                    </div>
                                    <div class="bg-green-50 px-3 py-1 rounded-full">
                                        <span class="text-xs text-green-600 font-medium">
                                            <i class="pi pi-clock mr-1"></i>最新發布
                                        </span>
                                    </div>
                                </div>

                                <div v-if="isCoursesLoading" class="flex justify-center items-center py-16">
                                    <div class="text-center space-y-3">
                                        <ProgressSpinner style="width:40px;height:40px" strokeWidth="3"
                                            class="text-sky-500" />
                                        <p class="text-gray-500">載入最新課程中...</p>
                                    </div>
                                </div>
                                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div v-for="course in displayCourses.latest" :key="course.id"
                                        @click="selectCourse(course)" class="course-card-wrapper">
                                        <CourseCard :course="course" :loading="isLoading(course.id)" />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>

            <!-- AI Features Showcase -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                    <div class="text-center space-y-4">
                        <div
                            class="w-16 h-16 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300">
                            <i class="pi pi-brain text-2xl text-white"></i>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold text-gray-800">智能學習軌跡</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                深度分析您的學習歷程與行為模式，提供個人化的學習路徑建議
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                    <div class="text-center space-y-4">
                        <div
                            class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300">
                            <i class="pi pi-chart-bar text-2xl text-white"></i>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold text-gray-800">多維度匹配</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                結合時間、地點、興趣等多重因素，精準匹配最適合的學習機會
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                    <div class="text-center space-y-4">
                        <div
                            class="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300">
                            <i class="pi pi-refresh text-2xl text-white"></i>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-lg font-bold text-gray-800">持續優化推薦</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                根據您的反饋與學習成果，持續優化推薦演算法的準確度
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="text-center bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-8 border border-sky-100">
                <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-gray-800">開始您的學習旅程</h3>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        探索更多精彩課程，讓 PUDT 陪伴您踏上成長的道路
                    </p>
                    <Button label="探索更多課程" icon="pi pi-arrow-right" iconPos="right" @click="loadMoreCourses"
                        class="bg-gradient-to-r from-sky-500 to-blue-500 border-0 px-8 py-3 text-lg rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105" />
                </div>
            </div>
        </div>

        <CourseDetail v-model:visible="visible" :courseId="selectedCourseId" />
    </div>
</template>

<script setup lang="ts">
import CourseDetail from '@/components/user/CourseDetail.vue'
import CourseCard from '@/components/user/CourseCard.vue'
import { ref, computed, onMounted } from 'vue'
import SearchBar from '@/components/layout/SearchBar.vue';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { Course } from '@/types/course';
import { CourseService } from '@/services/CourseService';
import { useBookingStore } from '@/stores/bookingStore';
import { showError, initToast } from '@/utils/toastHelper';

// 一次性解構 userStore
const userStore = useUserStore();

const visible = ref(false);
const router = useRouter();
const toast = useToast();
// 初始化toast
onMounted(() => {
    initToast(toast);
});

// 數據狀態
const isCoursesLoading = ref(false);
const loadingMap = ref<Map<number, boolean>>(new Map());
const searchQuery = ref('');
const selectedCourseId = ref<number>(0);

// 標籤頁配置 - 調整順序，將推薦放第一
const activeTab = ref('recommended');
const tabs = [
    { label: '為您推薦', value: 'recommended', icon: 'pi pi-user' },
    { label: '熱門課程', value: 'popular', icon: 'pi pi-star' },
    { label: '最新上架', value: 'latest', icon: 'pi pi-calendar' }
];

// 課程數據
const popularCourses = ref<Course[]>([]);
const latestCourses = ref<Course[]>([]);
const recommendedCourses = ref<Course[]>([]);

// 計算顯示的課程（每個分類顯示9個）
const displayCourses = computed(() => ({
    recommended: recommendedCourses.value.slice(0, 9),
    popular: popularCourses.value.slice(0, 9),
    latest: latestCourses.value.slice(0, 9)
}));

// 獲取課程數據
const loadCourses = async () => {
    isCoursesLoading.value = true;
    try {
        // 增加獲取數量以便有更多選擇
        const [popularResult, latestResult, recommendedResult] = await Promise.all([
            CourseService.getPopularCourses(12),
            CourseService.getLatestCourses(12),
            userStore.user?.id ? CourseService.getRecommendedCourses(12) : null
        ]);

        if (popularResult.success && Array.isArray(popularResult.data)) {
            popularCourses.value = popularResult.data;
        }

        if (latestResult.success && Array.isArray(latestResult.data)) {
            latestCourses.value = latestResult.data;
        }

        if (recommendedResult && recommendedResult.success && Array.isArray(recommendedResult.data)) {
            recommendedCourses.value = recommendedResult.data;
        } else {
            // 如果用戶未登入或推薦API失敗，使用熱門課程作為推薦
            recommendedCourses.value = popularCourses.value;
        }
    } catch (error) {
        console.error('獲取課程數據失敗:', error);
        showError('獲取課程數據失敗，請稍後重試', '錯誤');
    } finally {
        isCoursesLoading.value = false;
    }
};

// 判斷課程是否正在載入
const isLoading = (courseId: number) => {
    return loadingMap.value.has(courseId);
};

// 跳轉到搜尋頁面
function loadMoreCourses() {
    router.push({ name: 'Search' });
}

async function selectCourse(course: Course) {
    const courseId = course.id;
    selectedCourseId.value = courseId;
    visible.value = true;
}

function handleSearch(keyword: string) {
    router.push({
        name: 'Search',
        query: {
            keyword: keyword || searchQuery.value
        }
    });
}

// 組件掛載時載入課程數據
onMounted(async () => {
    await loadCourses();
});

</script>

<style scoped>
.pudt-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../assets/image/pudt_bg.png');
    background-size: 70%;
    background-position: center bottom;
    background-repeat: no-repeat;
    z-index: 1;
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }
}

.course-card-wrapper {
    transform: scale(1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-card-wrapper:hover {
    transform: scale(1.02) translateY(-4px);
}

/* 標籤頁樣式 */
:deep(.course-tabs .p-tablist) {
    background: transparent;
    border: none;
}

:deep(.course-tabs .p-tab) {
    background: transparent;
    border: none;
    color: #6b7280;
    font-weight: 500;
    transition: all 0.3s ease;
}

:deep(.course-tabs .p-tab:hover) {
    background: #f8fafc;
    color: #0ea5e9;
}

:deep(.course-tabs .p-tab[data-p-active="true"]) {
    background: linear-gradient(135deg, #0ea5e9, #3b82f6);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

:deep(.course-tabs .p-tabpanels) {
    background: transparent;
}

/* Loading spinner 顏色調整 */
:deep(.p-progress-spinner-circle) {
    stroke: #0ea5e9;
}

/* 裝飾性動畫 */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delay-500 {
    animation-delay: 0.5s;
}

.delay-1000 {
    animation-delay: 1s;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* 響應式調整 */
@media (max-width: 768px) {
    .pudt-banner::before {
        background-size: 80%;
    }
}
</style>