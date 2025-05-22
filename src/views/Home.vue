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
                    <TabPanel value="recommended" v-if="isLoggedIn">
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
import CourseDetail from '@/views/user/course/CourseDetail.vue'
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
import { CourseService } from '@/service/CourseService';
import { useBookingStore } from '@/stores/bookingStore';
import { MainCategory } from '@/enums/CourseCategory';
import { showError, initToast } from '@/utils/toastHelper';

// 一次性解構 userStore
const { isLoggedIn } = useUserStore();
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
const allCourses = ref<Course[]>([]);
const selectedCourseId = ref<number>(0);

// 標籤頁配置
const activeTab = ref('popular');
const tabs = [
    { label: '熱門課程', value: 'popular', icon: 'pi pi-star' },
    { label: '最新上架', value: 'latest', icon: 'pi pi-calendar' },
    { label: '為您推薦', value: 'recommended', icon: 'pi pi-user' }
];

// 熱門課程 - 按參與人數排序
const popularCourses = computed(() => {
    return [...allCourses.value]
        .sort((a, b) => (b.joinCount || 0) - (a.joinCount || 0))
        .slice(0, 6);
});

// 最新上架課程 - 按創建日期排序
const latestCourses = computed(() => {
    return [...allCourses.value]
        .sort((a, b) => {
            const aDate = a.createdAt;
            const bDate = b.createdAt;
            if (aDate && bDate) {
                return bDate.getTime() - aDate.getTime();
            }
            return b.id - a.id;
        })
        .slice(0, 6);
});

// TODO: 推薦課程 - 使用 API 獲取推薦課程
// const res = await api.get(`/api/courses/recommendations?age=${age}&tags=${interests.join(',')}`)
const recommendedCourses = computed(() => {
    // 如果沒有推薦課程，顯示熱門課程
    if (!allCourses.value.filter(c => c.recommended).length) {
        return popularCourses.value;
    }

    return allCourses.value
        .filter(course => course.recommended)
        .slice(0, 6);
});

// 判断课程是否正在加载
function isLoading(courseId: number): boolean {
    return loadingMap.value.get(courseId) === true;
}

// 模拟获取课程数据，包括推薦課程
async function fetchCourses() {
    isCoursesLoading.value = true;
    try {
        // 获取课程数据
        const courses = await CourseService.getCourse();

        // 添加推薦標記（實際應用中應由後端返回）
        const userAge = localStorage.getItem('userAge');
        // 优先使用 userStore 的兴趣标签，如果不存在则尝试从 localStorage 获取
        const userInterests = userStore.interests || [];
        let age: number | null = null;
        let interests: string[] = userInterests;

        try {
            if (userAge) {
                age = parseInt(userAge);
            }
            
            // 如果 userStore 中没有兴趣标签，则尝试从 localStorage 获取
            if (interests.length === 0) {
                const localInterests = localStorage.getItem('userInterests');
                if (localInterests) {
                    interests = JSON.parse(localInterests);
                }
            }
        } catch (e) {
            console.error('解析用戶偏好錯誤', e);
        }

        if (interests.length > 0 || age) {
            fetchRecommendations(age, interests);
        } else {
            allCourses.value = courses;
        }
    } catch (error) {
        console.error('獲取課程數據失敗:', error);
        showError('無法載入課程數據，請稍後再試', '獲取課程失敗');
    } finally {
        isCoursesLoading.value = false;
    }
}

// 模擬 API 請求推薦課程
async function fetchRecommendations(age: number | null, interests: string[]) {
    // TODO: 推薦課程 
    //  實際應用：const res = await api.get(`/api/courses/recommendations?age=${age}&tags=${interests.join(',')}`)
    console.log(`請求推薦課程: age=${age}, interests=${interests.join(',')}`);

    // 模擬後端處理邏輯
    const courses = await CourseService.getCourse();
    courses.forEach(course => {
        // 標記推薦課程，這部分邏輯在實際應用中應在後端處理
        course.recommended = false;

        if (interests.length > 0) {
            // 標記推薦課程（實際邏輯應在後端）
            const courseTitle = course.title.toLowerCase();
            interests.forEach(interest => {
                if (interest === MainCategory.SportsFitness && /瑜[珈|伽]|健身|運動|滑板|游泳|健康/.test(courseTitle)) {
                    course.recommended = true;
                } else if (interest === MainCategory.CookingCuisine && /料理|烹飪|烘[焙|培]|甜點|廚藝|美食/.test(courseTitle)) {
                    course.recommended = true;
                } else if (interest === MainCategory.ArtDesign && /藝術|設計|繪畫|攝影|插畫|陶藝|手作/.test(courseTitle)) {
                    course.recommended = true;
                } // ... 其他分類匹配邏輯，實際應在後端處理
            });
        }
    });

    allCourses.value = courses;
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
        // 使用 bookingStore.loadCourseBookingDetail 加載課程詳情
        const result = await bookingStore.loadCourseBookingDetail(courseId);
        if (result.success) {
            // 成功加載後打開詳情彈窗
            visible.value = true;
        } else {
            showError(result.message || '加載課程詳情失敗', '無法查看課程');
        }
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