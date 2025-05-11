<template>
	<div class="flex flex-col min-h-screen overflow-hidden">
		<!-- Toast 组件用于显示错误消息 -->
		<Toast />
		
		<!-- 主要内容區 -->
		<div class="container mx-auto p-4 flex-grow flex flex-col md:flex-row gap-6">
			<!-- 左側篩選區 -->
			<div class="md:w-1/4 shrink-0">
				<div class="bg-white rounded-lg shadow p-4 sticky top-4">
					<h2 class="text-xl font-bold mb-4">篩選條件</h2>
					<!-- 地區篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">地區</h3>
						<div class="flex flex-wrap gap-2">
							<Chip v-for="region in regions" :key="region.code" :label="region.name"
								:class="{ 'chip-selected': isRegionSelected(region.code) }"
								@click="toggleRegion(region.code)" class="chip" />
						</div>
					</div>

					<!-- 類別篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">課程類別</h3>
						<div class="flex flex-wrap gap-2">
							<Chip v-for="category in categories" :key="category.code" :label="category.name"
								:class="{ 'chip-selected': isCategorySelected(category.code) }"
								@click="toggleCategory(category.code)" class="chip" />
						</div>
					</div>

					<!-- 點數區間篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">點數區間</h3>
						<Slider v-model="pointsRange" range class="my-4" />
						<div class="flex justify-around">
							<InputNumber v-model="pointsRange[0]" :min="0" :max="pointsRange[1]" />
							<span class="self-center">至</span>
							<InputNumber v-model="pointsRange[1]" :min="pointsRange[0]" :max="100" />
						</div>
					</div>

					<!-- 其他篩選條件 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">更多篩選</h3>
						<div class="flex flex-col gap-2">
							<div class="flex items-center">
								<Checkbox v-model="filters.hasOpenSlots" :binary="true" inputId="hasOpenSlots" />
								<label for="hasOpenSlots" class="ml-2 cursor-pointer">有空位課程</label>
							</div>
							<div class="flex items-center">
								<Checkbox v-model="filters.newCourses" :binary="true" inputId="newCourses" />
								<label for="newCourses" class="ml-2 cursor-pointer">新上架 (14天內)</label>
							</div>
							<div class="flex items-center">
								<Checkbox v-model="filters.favourites" :binary="true" inputId="favourites" />
								<label for="favourites" class="ml-2 cursor-pointer">我的收藏</label>
							</div>
						</div>
					</div>

					<!-- 篩選按鈕 -->
					<div class="flex gap-2">
						<!-- 使用 loading 状态禁用按钮防止重复点击 -->
						<Button label="套用篩選" icon="pi pi-filter" @click="applyFilters" 
							:loading="isCoursesLoading" :disabled="isCoursesLoading" 
							class="w-full" />
						<Button label="重置" icon="pi pi-refresh" outlined @click="resetFilters" 
							:disabled="isCoursesLoading"
							class="w-full" />
					</div>
				</div>
			</div>

			<!-- 右側內容區 -->
			<div class="flex-grow">
				<!-- 搜尋結果概要 -->
				<div class="mb-4 flex flex-wrap justify-between items-center">
					<div v-if="keyword">
						<h1 class="text-2xl font-bold">「{{ keyword }}」的搜尋結果</h1>
						<p class="text-gray-600">共找到 {{ filteredCourses.length }} 個符合的課程</p>
					</div>

					<!-- 排序選項 -->
					<div class="flex items-center gap-2">
						<label for="sortBy" class="whitespace-nowrap">排序方式：</label>
						<Select v-model="sortBy" :options="sortOptions" optionLabel="label" optionValue="value"
							placeholder="選擇排序方式" class="w-40" />
					</div>
				</div>

				<!-- 推薦課程分頁區塊 -->
				<div class="mb-6">
					<Card>
						<template #content>
							<TabView>
								<TabPanel header="推薦課程" value="recommended">
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
										<CourseCard v-for="course in recommendedCourses" :key="course.courseId"
											:course="course" @click="viewCourseDetail(course)" />
									</div>
								</TabPanel>
								<TabPanel header="最新上架" value="latest">
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
										<CourseCard v-for="course in latestCourses" :key="course.courseId"
											:course="course" @click="viewCourseDetail(course)" />
									</div>
								</TabPanel>
							</TabView>
						</template>
					</Card>
				</div>

				<!-- 課程列表 -->
				<div>
					<!-- 加载状态显示 -->
					<div v-if="isCoursesLoading" class="text-center py-8">
						<ProgressSpinner style="width:50px;height:50px" strokeWidth="5" />
						<p class="mt-3 text-gray-600">載入課程中，請稍候...</p>
					</div>
					
					<!-- 错误状态显示 -->
					<div v-else-if="coursesLoadError" class="p-6 text-center bg-white rounded-lg shadow">
						<i class="pi pi-exclamation-triangle text-5xl text-red-500 mb-4"></i>
						<h3 class="text-xl font-semibold mb-2">獲取課程數據時出錯</h3>
						<p class="text-gray-600 mb-4">{{ coursesLoadError }}</p>
						<Button label="重試" icon="pi pi-refresh" @click="fetchCourses" />
					</div>
					
					<!-- 正常状态显示数据 -->
					<DataView v-else :value="filteredCourses" :layout="layout" paginator :rows="9"
						:rowsPerPageOptions="[9, 18, 27]">
						<template #header>
							<div class="flex justify-end">
								<div class="p-dataview-layout-options">
									<Button icon="pi pi-th-large" @click="layout = 'grid'" :text="layout === 'grid'"
										:outlined="layout !== 'grid'" />
									<Button icon="pi pi-list" @click="layout = 'list'" :text="layout === 'list'"
										:outlined="layout !== 'list'" />
								</div>
							</div>
						</template>

						<!-- 列表視圖 -->
						<template #list="slotProps">
							<div class="grid grid-cols-1 gap-4">
								<div v-for="course in slotProps.items" :key="course.courseId"
									class="flex flex-col sm:flex-row border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
									<div class="sm:w-48 h-48 sm:h-auto bg-gray-200 relative overflow-hidden">
										<img :src="course.image.imageSrc" :alt="course.image.alt"
											class="absolute inset-0 w-full h-full object-cover" />
									</div>
									<div class="flex-grow p-4 flex flex-col">
										<div class="flex justify-between items-start">
											<div>
												<h3 class="text-lg font-semibold">{{ course.title }}</h3>
												<p class="text-sm text-gray-600">
													<i class="pi pi-map-marker mr-1"></i>{{ course.merchantName }}
												</p>
											</div>
											<div class="flex gap-2">
												<Button icon="pi pi-heart" text rounded aria-label="收藏" />
												<Button icon="pi pi-share-alt" text rounded aria-label="分享" />
											</div>
										</div>
										<div class="mt-2 flex-grow">
											<p class="text-sm text-gray-600 line-clamp-2">{{ course.description }}</p>
										</div>
										<div class="mt-4 flex justify-between items-center">
											<span class="text-lg font-bold text-primary-700">
												{{ course.pointsRequired }} 點數
											</span>
											<!-- 详情按钮禁用状态 -->
											<Button label="查看詳情" @click="viewCourseDetail(course)" 
												:loading="courseStore.loading && selectedCourseId === course.courseId"
												:disabled="courseStore.loading" />
										</div>
									</div>
								</div>
							</div>
						</template>

						<!-- 網格視圖 -->
						<template #grid="slotProps">
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<CourseCard v-for="course in slotProps.items" :key="course.courseId" :course="course"
									@click="viewCourseDetail(course)"
									:disabled="courseStore.loading"
									:class="{'opacity-70 pointer-events-none': courseStore.loading && selectedCourseId === course.courseId}" />
							</div>
						</template>

						<!-- 空結果 -->
						<template #empty>
							<div class="p-6 text-center">
								<i class="pi pi-search text-5xl text-gray-300 mb-4"></i>
								<h3 class="text-xl font-semibold mb-2">未找到符合的課程</h3>
								<p class="text-gray-600">嘗試調整搜尋條件或篩選器</p>
							</div>
						</template>
					</DataView>
				</div>
			</div>
		</div>

		<!-- 課程詳情彈窗 -->
		<CourseDetail v-model:visible="detailVisible" :courseId="selectedCourseId" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import CourseCard from '@/components/modal/CourseCard.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import CourseDetail from '@/views/user/course/CourseDetail.vue';
import type { CourseDTO } from '@/types/course';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import DataView from 'primevue/dataview';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { CourseService } from '@/service/CourseService';
import { useCourseStore } from '@/stores/courseStore';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';

const route = useRoute();
const courseStore = useCourseStore();
const toast = useToast();

// 視圖狀態
const layout = ref('grid');
const detailVisible = ref(false);
const selectedCourseId = ref(0);

// 數據加載狀態
const isCoursesLoading = ref(false);
const coursesLoadError = ref<string | null>(null);

// 搜尋與篩選狀態
const keyword = ref('');
const selectedRegions = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const pointsRange = ref([0, 50]);
const filters = ref({
	hasOpenSlots: false,
	newCourses: false,
	favourites: false
});
const sortBy = ref('relevance');

// 監聽路由變化，更新搜尋關鍵字
watch(() => route.query.keyword, (newKeyword) => {
	keyword.value = newKeyword as string;
	fetchCourses();  // 重新獲取課程數據
}, { immediate: true });

// 排序選項
const sortOptions = [
	{ label: '相關性優先', value: 'relevance' },
	{ label: '點數低至高', value: 'pointsAsc' },
	{ label: '點數高至低', value: 'pointsDesc' },
	{ label: '新上架優先', value: 'newest' },
	{ label: '評分高至低', value: 'ratingDesc' }
];

// 篩選選項數據
const regions = [
	{ code: 'TPE', name: '台北' },
	{ code: 'TAI', name: '台中' },
	{ code: 'KHH', name: '高雄' },
	{ code: 'TNN', name: '台南' },
	{ code: 'HSZ', name: '新竹' }
];

const categories = [
	{ code: 'YOGA', name: '瑜珈' },
	{ code: 'SKATING', name: '滑板' },
	{ code: 'COOK', name: '廚藝' },
	{ code: 'PHOTO', name: '攝影' },
	{ code: 'PAINT', name: '繪畫' },
	{ code: 'MUSIC', name: '音樂' },
	{ code: 'DANCE', name: '舞蹈' },
	{ code: 'CRAFT', name: '手作' }
];

// 課程數據
const allCourses = ref<CourseDTO[]>([]);

// 初始化頁面
onMounted(async () => {
	// 從URL獲取初始搜尋關鍵字
	keyword.value = route.query.keyword as string || '';

	// 模擬獲取課程數據
	await fetchCourses();
});

// 獲取課程數據
async function fetchCourses() {
	// 設置 loading 狀態
	isCoursesLoading.value = true;
	coursesLoadError.value = null;
	
	try {
		// 獲取課程數據
		const data = await CourseService.getCourse();
		allCourses.value = data;
	} catch (err) {
		// 處理錯誤
		console.error('獲取課程列表失敗:', err);
		coursesLoadError.value = err instanceof Error ? err.message : '獲取課程列表失敗';
		
		// 顯示錯誤提示
		toast.add({ 
			severity: 'error', 
			summary: '獲取課程失敗', 
			detail: coursesLoadError.value, 
			life: 5000 
		});
	} finally {
		// 完成後重置 loading 狀態
		isCoursesLoading.value = false;
	}
}

// 處理函數
function isRegionSelected(code: string): boolean {
	return selectedRegions.value.includes(code);
}

function isCategorySelected(code: string): boolean {
	return selectedCategories.value.includes(code);
}

function toggleRegion(code: string): void {
	const index = selectedRegions.value.indexOf(code);
	if (index >= 0) {
		selectedRegions.value.splice(index, 1);
	} else {
		selectedRegions.value.push(code);
	}
}

function toggleCategory(code: string): void {
	const index = selectedCategories.value.indexOf(code);
	if (index >= 0) {
		selectedCategories.value.splice(index, 1);
	} else {
		selectedCategories.value.push(code);
	}
}

// 應用篩選器 - 現在可以顯示加載狀態
function applyFilters(): void {
	// 實際應用中應重新請求篩選後的數據
	console.log('Apply filters', {
		regions: selectedRegions.value,
		categories: selectedCategories.value,
		pointsRange: pointsRange.value,
		filters: filters.value,
		sortBy: sortBy.value
	});
	
	// 在這裡可以調用 fetchCourses() 或專門的篩選 API
	fetchCourses();
}

function resetFilters(): void {
	selectedRegions.value = [];
	selectedCategories.value = [];
	pointsRange.value = [0, 50];
	filters.value = {
		hasOpenSlots: false,
		newCourses: false,
		favourites: false
	};
	sortBy.value = 'relevance';
	
	// 重置後重新獲取數據
	fetchCourses();
}

/**
 * 查看課程詳情
 * 使用courseStore加載課程詳情並打開彈窗
 */
async function viewCourseDetail(course: CourseDTO): Promise<void> {
	selectedCourseId.value = course.courseId;
	
	// 使用courseStore的loadCourseDetail方法加載課程數據
	const success = await courseStore.loadCourseDetail(course.courseId);
	
	if (success) {
		// 成功加載後打開詳情彈窗
		detailVisible.value = true;
	} else if (courseStore.error) {
		// 顯示錯誤提示
		toast.add({ 
			severity: 'error', 
			summary: '無法查看課程詳情', 
			detail: courseStore.error, 
			life: 3000 
		});
	}
}

// 計算屬性
const filteredCourses = computed(() => {
	let result = [...allCourses.value];

	// 關鍵字篩選
	if (keyword.value.trim()) {
		const searchTerm = keyword.value.toLowerCase();
		result = result.filter(course =>
			course.title.toLowerCase().includes(searchTerm) ||
			course.merchantName.toLowerCase().includes(searchTerm)
		);
	}

	// 點數範圍篩選
	result = result.filter(course =>
		course.pointsRequired >= pointsRange.value[0] &&
		course.pointsRequired <= pointsRange.value[1]
	);

	// 排序
	if (sortBy.value === 'pointsAsc') {
		result.sort((a, b) => a.pointsRequired - b.pointsRequired);
	} else if (sortBy.value === 'pointsDesc') {
		result.sort((a, b) => b.pointsRequired - a.pointsRequired);
	} else if (sortBy.value === 'newest') {
		// 假設有創建日期，實際應用需要相應字段c
		result.sort((a, b) => b.courseId - a.courseId);
	}

	return result;
});

// 推薦課程
const recommendedCourses = computed(() => {
	// 實際應用中應基於用戶興趣進行推薦
	return allCourses.value.slice(0, 3);
});

// 最新上架課程
const latestCourses = computed(() => {
	// 假設ID越大代表越新，實際應用需要創建日期
	return [...allCourses.value].sort((a, b) => b.courseId - a.courseId).slice(0, 3);
});
</script>

<style scoped>
@reference "tailwindcss";

::v-deep(.p-inputnumber > input) {
	width: 100px !important;
}

.chip {
	@apply cursor-pointer hover:bg-blue-200 ! transition-colors
}


.chip:hover:not(.chip-selected) {
	@apply bg-blue-100 !
}

.chip-selected {
	@apply bg-blue-400 ! text-white !
}

.chip.chip-selected:hover {
	@apply bg-blue-500 !
}
</style>
