<template>
	<div class="flex flex-col min-h-screen overflow-hidden ">
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
								:class="isRegionSelected(region.code) ? 'bg-primary-100' : 'bg-gray-100'"
								@click="toggleRegion(region.code)"
								class="cursor-pointer hover:bg-primary-50 transition-colors" />
						</div>
					</div>

					<!-- 類別篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">課程類別</h3>
						<div class="flex flex-wrap gap-2">
							<Chip v-for="category in categories" :key="category.code" :label="category.name"
								:class="isCategorySelected(category.code) ? 'bg-primary-100' : 'bg-gray-100'"
								@click="toggleCategory(category.code)"
								class="cursor-pointer hover:bg-primary-50 transition-colors" />
						</div>
					</div>

					<!-- 點數區間篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">點數區間</h3>
						<div class="px-2">
							<Slider v-model="pointsRange" range class="my-4" />
							<div class="flex justify-between">
								<InputNumber v-model="pointsRange[0]" showButtons :min="0" :max="pointsRange[1]" />
								<span class="self-center">至</span>
								<InputNumber v-model="pointsRange[1]" showButtons :min="pointsRange[0]" :max="100" />
							</div>
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
						<Button label="套用篩選" icon="pi pi-filter" @click="applyFilters" class="w-full" />
						<Button label="重置" icon="pi pi-refresh" outlined @click="resetFilters" class="w-full" />
					</div>
				</div>
			</div>

			<!-- 右側內容區 -->
			<div class="flex-grow">
				<!-- 搜尋結果概要 -->
				<div class="mb-4 flex flex-wrap justify-between items-center">
					<div>
						<h1 class="text-2xl font-bold">「{{ keyword }}」的搜尋結果</h1>
						<p class="text-gray-600">共找到 {{ filteredCourses.length }} 個符合的課程</p>
					</div>

					<!-- 排序選項 -->
					<div class="flex items-center gap-2">
						<label for="sortBy" class="whitespace-nowrap">排序方式：</label>
						<Dropdown v-model="sortBy" :options="sortOptions" optionLabel="label" optionValue="value"
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
					<DataView :value="filteredCourses" :layout="layout" paginator :rows="9"
						:rowsPerPageOptions="[9, 18, 27]">
						<template #header>
							<div class="flex justify-end">
								<div class="p-dataview-layout-options">
									<Button icon="pi pi-th-large" @click="layout = 'grid'" :text="layout === 'grid'" :outlined="layout !== 'grid'" />
									<Button icon="pi pi-list" @click="layout = 'list'" :text="layout === 'list'" :outlined="layout !== 'list'" />
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
											<Button label="查看詳情" @click="viewCourseDetail(course)" />
										</div>
									</div>
								</div>
							</div>
						</template>

						<!-- 網格視圖 -->
						<template #grid="slotProps">
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<CourseCard v-for="course in slotProps.items" :key="course.courseId" :course="course"
									@click="viewCourseDetail(course)" />
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
import { useRoute, useRouter } from 'vue-router';
import CourseCard from '@/components/modal/CourseCard.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import CourseDetail from '@/views/user/course/CourseDetail.vue';
import type { CourseDTO } from '@/types/course';
import { useCourseStore } from '@/stores/courseStore';
import InputText from 'primevue/inputtext';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import DataView from 'primevue/dataview';
import Dropdown from 'primevue/dropdown';
import { CourseService } from '@/service/CourseService';

const route = useRoute();

// 視圖狀態
const layout = ref('grid');
const detailVisible = ref(false);
const selectedCourseId = ref(0);

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
    if (newKeyword) {
        keyword.value = newKeyword as string;
        fetchCourses();  // 重新獲取課程數據
    }
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

// 模擬獲取課程數據
async function fetchCourses() {
	// 實際應用中應調用API
	return CourseService.getCourseData();

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

function applyFilters(): void {
	// 實際應用中應重新請求篩選後的數據
	console.log('Apply filters', {
		regions: selectedRegions.value,
		categories: selectedCategories.value,
		pointsRange: pointsRange.value,
		filters: filters.value,
		sortBy: sortBy.value
	});
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
}

function viewCourseDetail(course: CourseDTO): void {
	selectedCourseId.value = course.courseId;
	detailVisible.value = true;
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

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
