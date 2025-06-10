<template>
    <div class="min-h-screen space-y-7 pudt-banner">
        <div class="space-y-4 flex flex-col justify-center items-center">
            <!-- Logo & Branding -->
            <div class="flex flex-col items-center">
                <div class="inline-flex max-w-xl text-center sm: w-7/12 mt-6">
                    <img src="../assets/image/pudt_logo-xl.png" alt="logo">
                </div>
                <p class="text-3xl">Put Your Dots Together</p>
            </div>
            <!-- Hero Section -->
            <div class="text-center space-y-4">
                <h1 class="text-4xl font-bold">整合你的學習生活</h1>
                <p class="text-lg">
                    多元課程・點數預約・個人化行事曆
                </p>
            </div>
            <!-- Search Bar -->
            <div class="searchbar-container flex flex-col md:flex-row items-center gap-4 max-w-2xl w-full">
                <SearchBar v-model="searchQuery" @search="handleSearch" />
            </div>
        </div>
        <!-- Featured Courses -->
        <div class="max-w-7xl mx-auto">
            <Tabs :value="activeTab">
                <TabList class="self-center">
                    <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
                        <i :class="tab.icon + ' mr-2'"></i>
                        {{ tab.label }}
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="popular">
                        <CourseCarousel title="熱門課程推薦" :items="popularCourses" :loading="isCoursesLoading"
                            :is-loading="isLoading" @select-course="selectCourse" />
                    </TabPanel>
                    <TabPanel value="latest">
                        <CourseCarousel title="最新上架" :items="latestCourses" :loading="isCoursesLoading"
                            :is-loading="isLoading" @select-course="selectCourse" />
                    </TabPanel>
                    <TabPanel value="recommended">
                        <CourseCarousel title="為您推薦的課程" :items="recommendedCourses" :loading="isCoursesLoading"
                            :is-loading="isLoading" @select-course="selectCourse" />
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <div class="flex justify-center mt-8">
                <Button rounded label="查看更多課程" icon="pi pi-arrow-right" iconPos="right" @click="loadMoreCourses"
                    size="large" />
            </div>
        </div>
        <CourseDetail v-model:visible="visible" :courseId="selectedCourseId" />
    </div>
</template>

<script setup lang="ts">
import CourseDetail from '@/components/user/CourseDetail.vue'
import { ref, computed, onMounted } from 'vue'
import SearchBar from '@/components/layout/SearchBar.vue';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import Button from 'primevue/button';
import CourseCarousel from '@/components/modal/CourseCarousel.vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { Course } from '@/types/course';
import { CourseService } from '@/services/CourseService';
import { useBookingStore } from '@/stores/bookingStore';
import { showError, initToast } from '@/utils/toastHelper';
import { useCourseStore } from '@/stores/courseStore';

// 一次性解構 userStore
const userStore = useUserStore();

const visible = ref(false);
const router = useRouter();
const bookingStore = useBookingStore();
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

// 標籤頁配置
const activeTab = ref('popular');
const tabs = [
    { label: '熱門課程', value: 'popular', icon: 'pi pi-star' },
    { label: '最新上架', value: 'latest', icon: 'pi pi-calendar' },
    { label: '為您推薦', value: 'recommended', icon: 'pi pi-user' }
];

// 熱門課程 - 按參與人數排序
const popularCourses = ref<Course[]>([]);
const latestCourses = ref<Course[]>([]);
const recommendedCourses = ref<Course[]>([]);

// 获取课程数据
const fetchCourses = async () => {
    isCoursesLoading.value = true;
    try {
        // 获取热门课程
        const popularResult = await CourseService.getPopularCourses(6);
        console.log(popularResult);

        if (popularResult.success && popularResult.data) {
            popularCourses.value = popularResult.data;
        }

        // 获取最新课程
        const latestResult = await CourseService.getLatestCourses(6);
        if (latestResult.success && latestResult.data) {
            latestCourses.value = latestResult.data;
        }

        // 如果用户已登录，获取推荐课程
        if (userStore.userId) {
            const recommendedResult = await CourseService.getRecommendedCourses(userStore.userId, 6);
            if (recommendedResult.success && recommendedResult.data) {
                recommendedCourses.value = recommendedResult.data;
            }
        }
    } catch (error) {
        console.error('获取课程数据失败:', error);
        showError('获取课程数据失败，请稍后重试', '错误');
    } finally {
        isCoursesLoading.value = false;
    }
}

// 判断课程是否正在加载
function isLoading(courseId: number): boolean {
    return loadingMap.value.get(courseId) === true;
}
// 跳转到搜索页面
function loadMoreCourses() {
    router.push({ name: 'Search' });
}

async function selectCourse(course: Course) {
    const courseId = course.id;
    selectedCourseId.value = courseId;

    // 标记为加载中
    loadingMap.value.set(courseId, true);

    try {
        console.log('loadCourseDetail', courseId);
        
        await useCourseStore().loadCourseDetail(courseId).then(res => {
            if (res.success && res.data) {
                visible.value = true;
            } else {
                showError(res.message || '加載課程詳情失敗', '無法查看課程');
            }
        })
        } catch (error: unknown) {
        console.error('加載課程詳情失敗:', error);
        showError(bookingStore.error || '加載課程詳情時出錯，請稍後再試', '錯誤');
    } finally {
        // 标记加载完成
        loadingMap.value.set(courseId, false);
    }
}

function handleSearch() {
    router.push({
        name: 'Search',
        query: {
            keyword: searchQuery.value
        }
    });
}

// 組件掛載時載入課程數據
onMounted(async () => {
    await fetchCourses();
});

</script>
<style scoped>
.pudt-banner {
    background-image: url('../assets/image/pudt_bg.png');
    background-size: 85%;
    background-position: center;
    background-repeat: no-repeat;
    background-position-y: 180px;
}

.preference-selected {
    background-color: var(--primary-color);
    color: white;
}
</style>