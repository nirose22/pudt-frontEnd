<template>
    <div class="min-h-screen space-y-7 banner-container">
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
                <SearchBar v-model="searchQuery" @search="handleSearch"/>
            </div>
        </div>
        <!-- Featured Courses -->
        <div class="max-w-7xl mx-auto">
            <h2 class="text-2xl font-semibold text-center mb-4">
                <span v-if="isLoggedIn && userPreferences.length > 0">為您推薦的課程</span>
                <span v-else>熱門課程推薦</span>
            </h2>

            <div v-if="isLoggedIn" class="flex justify-center mb-4">
                <div class="flex items-center space-x-2 mb-2">
                    <span class="text-sm text-gray-600">我的偏好：</span>
                    <Button icon="pi pi-plus" rounded text aria-label="添加偏好" @click="showPreferenceDialog = true"
                        class="p-button-sm" />
                </div>
            </div>
            <Tabs :value="categoryTabs[0].label">
                <TabList class="self-center">
                    <Tab v-for="tab in categoryTabs" :key="tab.label" :value="tab.label">
                        <i :class="tab.icon + ' mr-2'"></i>
                        {{ tab.label }}
                    </Tab>
                </TabList>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <CourseCard v-for="course in displayedCourses" :key="course.courseId" :course="course"
                        @click="selectCourse(course)" />
                    <div v-if="displayedCourses.length === 0" class="col-span-3 text-center py-8">
                        <i class="pi pi-search text-4xl text-gray-400"></i>
                        <p class="mt-2 text-gray-500">沒有找到相關課程，試試其他分類或重置篩選條件吧！</p>
                    </div>
                </div>
                <div v-if="displayedCourses.length > 0" class="flex justify-center mt-8">
                    <Button rounded label="查看更多課程" icon="pi pi-arrow-right" iconPos="right" @click="loadMoreCourses" size="large" />
                </div>
            </Tabs>
        </div>

        <!-- 偏好设置对话框 -->
        <Dialog v-model:visible="showPreferenceDialog" header="設置您的課程偏好" :modal="true" :closable="true"
            :style="{ width: '450px' }">
            <div class="p-fluid">
                <div class="field">
                    <label for="preferences">選擇您感興趣的課程類型（最多選5個）</label>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <Chip v-for="category in allCategories" :key="category" :label="category"
                            :class="{ 'preference-selected': userPreferences.includes(category) }"
                            class="cursor-pointer" @click="toggleCategorySelection(category)" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="確認" icon="pi pi-check" @click="savePreferences" />
                <Button label="取消" icon="pi pi-times" @click="showPreferenceDialog = false" outlined />
            </template>
        </Dialog>

        <CourseDetail v-model:visible="visible" :courseId="currentCourse.courseId" />
    </div>
</template>

<script setup lang="ts">
import CourseCard from '@/components/modal/CourseCard.vue'
import CourseDetail from '@/views/user/course/CourseDetail.vue'
import { ref, toRef, computed, onMounted, watch } from 'vue'
import Chip from 'primevue/chip';
import SearchBar from '@/components/layout/SearchBar.vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import { useCourseStore } from '@/stores/courseStore';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { CourseDTO } from '@/types/course';
import { CourseService } from '@/service/CourseService';

const visible = ref(false)
const showPreferenceDialog = ref(false);
const router = useRouter();
const courseStore = useCourseStore()
const userStore = useUserStore()
const toast = useToast();

const currentCourse = toRef(courseStore, 'currentCourse')
const isLoggedIn = userStore.isLoggedIn
const activeCategory = ref(0);
const searchQuery = ref('');
const showAll = ref(false);

const allCategories = ['瑜珈', '滑板', '攝影'];

// 用户偏好相关
const userPreferences = ref<string[]>([]);
const tempSelectedPreferences = ref<string[]>([]);

// 分类标签
const categoryTabs = ref([
    { label: '全部', icon: 'pi pi-th-large' },
    { label: '熱門', icon: 'pi pi-fire' },
    { label: '最新', icon: 'pi pi-calendar' },
    { label: '推薦', icon: 'pi pi-star', visible: computed(() => isLoggedIn) }
]);

// 获取用户偏好
onMounted(async () => {
    if (isLoggedIn) {
        await fetchUserPreferences();
    }
    fetchCourses();
});

// 监控登录状态变化
watch(() => isLoggedIn, async (newValue) => {
    if (newValue) {
        await fetchUserPreferences();
    }
});

// 获取用户偏好（模拟）
async function fetchUserPreferences() {
    // 实际应用中，这应该是API调用
    // 模拟从后端获取用户偏好
    userPreferences.value = ['瑜珈', '攝影']; // 示例数据
    tempSelectedPreferences.value = [...userPreferences.value];
}


function toggleCategorySelection(category: string) {
    const index = tempSelectedPreferences.value.indexOf(category);
    if (index >= 0) {
        tempSelectedPreferences.value.splice(index, 1);
    } else {
        if (tempSelectedPreferences.value.length < 5) {
            tempSelectedPreferences.value.push(category);
        }
    }
}

function savePreferences() {
    userPreferences.value = [...tempSelectedPreferences.value];
    showPreferenceDialog.value = false;
    toast.add({
        severity: 'success',
        summary: '偏好已更新',
        detail: '您的偏好設置已成功保存',
        life: 3000
    });
    // 这里应该有API调用保存用户偏好
    // 重新获取课程推荐
    fetchCourses();
}

// 课程相关
const allCourses = ref<CourseDTO[]>([]);
const displayedCourses = computed(() => {
    let filtered = [...allCourses.value];

    // 根据当前选中的分类标签筛选
    if (activeCategory.value === 1) { // 热门
        filtered = filtered.sort((a, b) => b.pointsRequired - a.pointsRequired);
    } else if (activeCategory.value === 2) { // 最新
        // 假设按ID排序，较新的课程ID较大
        filtered = filtered.sort((a, b) => b.courseId - a.courseId);
    } else if (activeCategory.value === 3 && isLoggedIn) { // 推荐
        // 根据用户偏好筛选课程
        if (userPreferences.value.length > 0) {
            // 否則使用所有偏好
            filtered = filtered.filter(course =>
                userPreferences.value.some(pref =>
                    matchCourseToPreference(course, pref)
                )
            );
        }
    }

    return showAll.value ? filtered.slice(0, 6) : filtered.slice(0, 3)
    // return filtered;
});

// 匹配課程與偏好，使用更精確的匹配模式
function matchCourseToPreference(course: CourseDTO, preference: string) {
    // 標題精確匹配
    if (course.title.includes(preference)) {
        return true;
    }

    // 商家名稱精確匹配
    if (course.merchantName.includes(preference)) {
        return true;
    }

    // 可以添加更多匹配邏輯，例如課程類型、標籤等

    return false;
}

// 匹配課程與搜索標籤
function matchCourseToTag(course: CourseDTO, tag: string) {
    // 實現更精確的搜索匹配邏輯
    const tagLower = tag.toLowerCase();
    const titleLower = course.title.toLowerCase();
    const merchantLower = course.merchantName.toLowerCase();

    // 標題包含標籤
    if (titleLower.includes(tagLower)) {
        return true;
    }

    // 商家名稱包含標籤
    if (merchantLower.includes(tagLower)) {
        return true;
    }

    return false;
}

// 模拟获取课程数据
async function fetchCourses() {
    // api
    allCourses.value = CourseService.getCourseData();
}

function loadMoreCourses() {
    if (!showAll.value) {
        showAll.value = true;
    } else {
        router.push('/search');
    }
}

function selectCourse(course: CourseDTO) {
    // 设置当前选中的课程
    courseStore.currentCourse = {
        ...courseStore.currentCourse,
        courseId: course.courseId,
        title: course.title,
        pointsRequired: course.pointsRequired
    };
    visible.value = true;
}


function handleSearch() {
    if (searchQuery.value.trim()) {
        router.push({
            path: '/search',
            query: {
                keyword: searchQuery.value
            }
        });
    }
}

</script>
<style scoped>
.banner-container {
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