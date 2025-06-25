<template>
	<div class="flex flex-col min-h-screen overflow-y-auto">
		<!-- 主要内容區 -->
		<div class="flex-grow flex flex-col md:flex-row gap-2">
			<!-- 左側篩選區 -->
			<div class="md:w-1/4 shrink-0">
				<div class="bg-white rounded-lg shadow p-4 sticky top-4">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-xl font-bold">篩選條件</h2>
						<div v-if="isFiltersApplied">
							<Badge :value="appliedFiltersCount" severity="info" class="mr-2">
							</Badge>
							<Button icon="pi pi-times" text rounded size="small"  v-tooltip.right="'重置篩選條件'"  @click="resetFilters" class="badge-tooltip" />
						</div>
					</div>

					<!-- 地区篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">地區</h3>
						<div class="flex flex-wrap gap-2">
							<Chip v-for="region in visibleRegions" :key="region.code" :label="region.name"
								:class="{ 'chip-selected': searchRequest.regions?.includes(region.code) }"
								@click="toggleRegion(region.code)" class="chip" />
							<Button v-if="!showAllRegions && allRegions.length > visibleRegionsCount" link
								class="text-blue-500py-1" @click="showAllRegions = true" label="顯示更多" />
							<Button v-else-if="showAllRegions" link class="text-blue-500py-1"
								@click="showAllRegions = false" label="收起" />
						</div>
					</div>

					<!-- 課程分類篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">課程分類</h3>
						<Accordion :multiple="true">
							<AccordionPanel v-for="mainCat in mainCategories" :value="mainCat.code" :key="mainCat.code">
								<AccordionHeader>{{ mainCat.name }}</AccordionHeader>
								<AccordionContent>
									<div class="flex flex-wrap gap-2 mt-2">
										<Chip v-for="subCat in groupedSubCategories[mainCat.code]" :key="subCat.code"
											:label="subCat.name"
											:class="{ 'chip-selected': searchRequest.categories?.includes(subCat.code) }"
											@click="handleSubCategoryToggle(subCat.code)" class="chip" />
									</div>
								</AccordionContent>
							</AccordionPanel>
						</Accordion>
					</div>

					<!-- 點數區間篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">點數區間</h3>
						<Slider v-model="pointsRangeModel" range class="my-4"
							@change="updateSearchRequest({ minPoints: pointsRangeModel[0], maxPoints: pointsRangeModel[1] })" />
						<div class="flex justify-around">
							<InputNumber v-model="pointsRangeModel[0]" :min="0" :max="pointsRangeModel[1]"
								@input="updateSearchRequest({ minPoints: pointsRangeModel[0] })" />
							<span class="self-center">至</span>
							<InputNumber v-model="pointsRangeModel[1]" :min="pointsRangeModel[0]" :max="100"
								@input="updateSearchRequest({ maxPoints: pointsRangeModel[1] })" />
						</div>
					</div>

					<!-- 其他篩選條件 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">更多篩選</h3>
						<div class="flex flex-col gap-2">
							<div class="flex items-center">
								<Checkbox v-model="searchRequest.hasOpenSlots" :binary="true" inputId="hasOpenSlots"
									@change="updateSearchRequest({ hasOpenSlots: searchRequest.hasOpenSlots })" />
								<label for="hasOpenSlots" class="ml-2 cursor-pointer">有空位課程</label>
							</div>
							<div class="flex items-center">
								<Checkbox v-model="searchRequest.newCourses" :binary="true" inputId="newCourses"
									@change="updateSearchRequest({ newCourses: searchRequest.newCourses })" />
								<label for="newCourses" class="ml-2 cursor-pointer">新上架 (14天內)</label>
							</div>
							<div class="flex items-center">
								<Checkbox v-model="searchRequest.favourites" :binary="true" inputId="favourites"
									@change="updateSearchRequest({ favourites: searchRequest.favourites })" />
								<label for="favourites" class="ml-2 cursor-pointer">我的收藏</label>
							</div>
						</div>
					</div>

					<!-- 篩選按鈕 -->
					<div class="flex gap-2">
						<!-- 使用 loading 状态禁用按钮防止重复点击 -->
						<Button label="套用篩選" icon="pi pi-filter" @click="handleApplyFilters" :loading="isSearchLoading"
							:disabled="isSearchLoading" class="w-full" />
						<Button label="重置" icon="pi pi-refresh" outlined @click="resetFilters"
							:disabled="isSearchLoading" class="w-full" />
					</div>
				</div>
			</div>

			<!-- 右側內容區 -->
			<div class="flex-grow overflow-hidden p-4">
				<!-- 搜尋結果概要 -->
				<div class="mb-4 flex flex-wrap justify-between items-center">
					<div v-if="searchRequest.keyword">
						<h1 class="text-2xl font-bold">「{{ searchRequest.keyword }}」的搜尋結果</h1>
						<p class="text-gray-600">共找到 {{ searchResultsTotal }} 個符合的課程</p>
					</div>

					<!-- 排序選項 -->
					<div class="flex items-center gap-2">
						<label for="sortBy" class="whitespace-nowrap">排序方式：</label>
						<Select v-model="searchRequest.sortBy" :options="sortOptions" optionLabel="label"
							optionValue="value" placeholder="選擇排序方式" class="w-40" :disabled="isSearchLoading"
							@change="updateSearchRequest({ sortBy: $event.value })" />
					</div>
				</div>

				<!-- 推薦課程分頁區塊 -->
				<div class="bg-gray-100rounded-lg p-2 mb-4">
					<div class="flex justify-between items-center px-2 mb-2">
						<h3 class="text-lg font-semibold">推薦課程</h3>
						<Button :icon="isRecommendationCollapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" text
							rounded @click="isRecommendationCollapsed = !isRecommendationCollapsed" aria-label="收合/展開"
							class="p-1" />
					</div>

					<Transition name="fade">
						<div v-show="!isRecommendationCollapsed">
							<Tabs :value="activeTab">
								<TabList>
									<Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
										{{ tab.label }}
									</Tab>
								</TabList>
								<TabPanels class="!p-2">
									<TabPanel value="popular">
										<AsyncCarousel :items="popularCourses" :loading="isRecommendationLoading">
											<template #item="slotProps">
												<CourseCard :course="slotProps.item"
													@click="selectCourse(slotProps.item)"
													:disabled="isLoading(slotProps.item.courseId)"
													:loading="isLoading(slotProps.item.courseId)" />
											</template>
										</AsyncCarousel>
									</TabPanel>
									<TabPanel value="latest">
										<AsyncCarousel :items="latestCourses" :loading="isRecommendationLoading">
											<template #item="slotProps">
												<CourseCard :course="slotProps.item"
													@click="selectCourse(slotProps.item)"
													:disabled="isLoading(slotProps.item.courseId)"
													:loading="isLoading(slotProps.item.courseId)" />
											</template>
										</AsyncCarousel>
									</TabPanel>
									<TabPanel value="recommended" v-if="isLoggedIn">
										<AsyncCarousel :items="recommendedCourses" :loading="isRecommendationLoading">
											<template #item="slotProps">
												<CourseCard :course="slotProps.item"
													@click="selectCourse(slotProps.item)"
													:disabled="isLoading(slotProps.item.courseId)"
													:loading="isLoading(slotProps.item.courseId)" />
											</template>
										</AsyncCarousel>
									</TabPanel>
								</TabPanels>
							</Tabs>
						</div>
					</Transition>
				</div>

				<!-- 課程列表 -->
				<div class="mt-4">
					<AsyncState :loading="isSearchLoading" :error="searchError || ''"
						:isEmpty="searchResults.length === 0" loadingText="載入課程中，請稍候..." errorTitle="獲取課程數據時出錯"
						emptyTitle="未找到符合的課程" emptyMessage="請嘗試以下操作：" :retryAction="null">
						<template #empty-content>
							<ul class="text-left inline-block mx-auto mb-4">
								<li class="mb-2"><i class="pi pi-check-circle mr-2 text-green-500"></i>調整篩選條件，例如擴大點數範圍
								</li>
								<li class="mb-2"><i class="pi pi-check-circle mr-2 text-green-500"></i>更換其他分類或地區</li>
								<li class="mb-2"><i class="pi pi-check-circle mr-2 text-green-500"></i>使用更一般性的關鍵詞</li>
							</ul>
							<Button label="重置所有篩選" icon="pi pi-filter-slash" @click="resetFilters" />
						</template>

						<DataView :value="searchResults" :layout="layout" :paginator="true" :rows="searchRequest.pageSize || 9"
						 :totalRecords="searchResultsTotal">
							<template #header>
								<div class="flex justify-between">
									<div class="flex flex-col">
										<h1 class="text-2xl font-bold" v-if="searchRequest.keyword">搜尋結果</h1>
										<h1 class="text-2xl font-bold" v-else-if="!isFiltersApplied && isLoggedIn">個人化推薦</h1>
										<h1 class="text-2xl font-bold" v-else>篩選結果</h1>
										<p class="text-sm text-gray-600 mt-1">
											共 {{ searchResultsTotal }} 個結果，第 {{ searchRequest.pageNum || 1 }} / {{
												searchResultsPages }} 頁
										</p>
									</div>

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
								<div class="flex flex-col gap-2 p-4">
									<div v-for="course in slotProps.items" :key="course.courseId"
										class="flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
										:class="{ 'opacity-70': isLoading(course.courseId) }">
										<div class=" bg-gray-200relative overflow-hidden flex-shrink-0 w-56 h-48">
											<img :src="course.coverUrl" :alt="course.title"
												class="inset-0w-full h-full object-cover" />
											<!-- 添加加载覆盖层 -->
											<div v-if="isLoading(course.courseId)"
												class="absolute inset-0bg-gray-800bg-opacity-40flex items-center justify-center">
												<ProgressSpinner style="width:40px;height:40px" strokeWidth="4" />
											</div>
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
											<div class="mt-2 flex-grow overflow-hidden max-h-12">
												<p class="text-sm text-gray-600 line-clamp-2">{{ course.description }}
												</p>
											</div>
											<div class="mt-4 flex justify-between items-center">
												<span
													class="border rounded-md px-2 py-1 text-xs text-primary-600font-medium">{{
														course.points
													}} 點數</span>
												<!-- 详情按钮禁用状态 -->
												<Button label="查看詳情" @click="selectCourse(course)"
													:loading="isLoading(course.courseId)"
													:disabled="isLoading(course.courseId)" />
											</div>
										</div>
									</div>
								</div>
							</template>

							<!-- 網格視圖 -->
							<template #grid="slotProps">
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
									<CourseCard v-for="course in slotProps.items" :key="course.courseId"
										:course="course" @click="selectCourse(course)"
										:disabled="isLoading(course.courseId)" :loading="isLoading(course.courseId)"
										:class="{ 'opacity-70pointer-events-none': isLoading(course.courseId) }" />
								</div>
							</template>
							<template #paginatorcontainer="{ rows, totalRecords }">
								<Paginator 
									:rows="rows"
									:totalRecords="totalRecords"
									:first="paginatorFirst"
									@page="onPage"
									template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown">
								</Paginator>
							</template>
						</DataView>
					</AsyncState>
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
import TabPanel from 'primevue/tabpanel';
import CourseDetail from '@/components/user/CourseDetail.vue';
import type { Course, CourseSession } from '@/types/course';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import DataView from 'primevue/dataview';
import Select from 'primevue/select';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { SubCategory } from '@/enums/CourseCategory';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionContent from 'primevue/accordioncontent';
import AccordionHeader from 'primevue/accordionheader';
import Badge from 'primevue/badge';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import { getMainCategories, getGroupedSubCategories } from '@/utils/categoryUtils';
import AsyncCarousel from '@/components/common/AsyncCarousel.vue';
import AsyncState from '@/components/common/AsyncState.vue';
import { useCourseStore } from '@/stores/courseStore';
import { useCourseFilters } from '@/composables/useCourseFilters';
import { useLoadingMap } from '@/composables/useLoadingMap';
import { RegionCodeLabel } from '@/enums/RegionCode';
import { showError, showInfo, initToast } from '@/utils/toastHelper';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/authStore';
import { CourseService } from '@/services/CourseService';
import Paginator from 'primevue/paginator';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isLoggedIn } = useAuthStore();

// 使用 composables
const courseStore = useCourseStore();
const currentCourse = computed(() => courseStore.currentCourse);
const courseSession = computed(() => courseStore.courseSession);
const loadCourseDetail = courseStore.loadCourseDetail;

// 搜索和篩選
const {
	searchRequest,
	sortOptions,
	appliedFiltersCount,
	isFiltersApplied,
	syncParamsToFilters,
	updateSearchRequest,
	applyFilters,
	resetFilters,
	setupSearchWatcher
} = useCourseFilters(route, router);

const { isLoading, setLoading, clearLoadingStates } = useLoadingMap();

// 組件狀態
const searchResults = ref<Course[]>([]);
const searchResultsTotal = ref(0);
const searchResultsPages = ref(0);
const isSearchLoading = ref(false);
const searchError = ref<string | null>(null);

const popularCourses = ref<Course[]>([]);
const latestCourses = ref<Course[]>([]);
const recommendedCourses = ref<Course[]>([]);
const isRecommendationLoading = ref(false);

const layout = ref('grid');
const detailVisible = ref(false);
const selectedCourseId = ref(0);
// 設置搜索監聽器 - 使用 debounced 搜索
const debouncedSearch = setupSearchWatcher(fetchFilteredCourses);

// 標籤頁配置
const activeTab = ref('popular');
const tabs = [
	{ label: '熱門課程', value: 'popular', icon: 'pi pi-star' },
	{ label: '最新上架', value: 'latest', icon: 'pi pi-calendar' },
	{ label: '為您推薦', value: 'recommended', icon: 'pi pi-user' }
];

// 當前課程詳情 - 使用懶加載
const currentCourses = ref<Map<number, Course>>(new Map());
const courseSessionMap = ref<Map<number, CourseSession[]>>(new Map());

// 主分類和子分類
const mainCategories = computed(() => getMainCategories());
const groupedSubCategories = computed(() => getGroupedSubCategories());

// 地區選項
const allRegions = ref(Object.entries(RegionCodeLabel).map(([code, name]) => ({ code, name })));
const visibleRegionsCount = 5;
const showAllRegions = ref(false);
const visibleRegions = computed(() => {
	return showAllRegions.value
		? allRegions.value
		: allRegions.value.slice(0, visibleRegionsCount);
});

// 推薦課程分頁區塊狀態控制
const isRecommendationCollapsed = ref(false);

const POINTS_RANGE = { MIN: 0, MAX: 100 } as const;

const pointsRangeModel = computed({
	get(): [number, number] {
		return [
			searchRequest.value.minPoints ?? POINTS_RANGE.MIN,
			searchRequest.value.maxPoints ?? POINTS_RANGE.MAX
		];
	},

	set([minPoints, maxPoints]: [number, number]) {
		// 邊界檢查
		const safeMin = Math.max(POINTS_RANGE.MIN, minPoints);
		const safeMax = Math.min(POINTS_RANGE.MAX, maxPoints);

		updateSearchRequest({
			minPoints: safeMin,
			maxPoints: Math.max(safeMin, safeMax)
		});
	}
});

// 載入推薦課程
const loadRecommendationCourses = async () => {
	try {
		isRecommendationLoading.value = true;

		const [popularResult, latestResult, recommendedResult] = await Promise.allSettled([
			CourseService.getPopularCourses(6),
			CourseService.getLatestCourses(6),
			CourseService.getRecommendedCourses(6)
		]);

		if (popularResult.status === 'fulfilled' && popularResult.value.success) {
			popularCourses.value = popularResult.value.data || [];
		}

		if (latestResult.status === 'fulfilled' && latestResult.value.success) {
			latestCourses.value = latestResult.value.data || [];
		}

		if (recommendedResult.status === 'fulfilled' && recommendedResult.value.success) {
			recommendedCourses.value = recommendedResult.value.data || [];
		}
	} catch (error) {
		console.error('載入推薦課程失敗:', error);
	} finally {
		isRecommendationLoading.value = false;
	}
};

// 處理分頁切換
function onPage(event: { page: number, first: number, rows: number, pageCount?: number }): void {
	const pageNum = event.page + 1; // PrimeVue 分頁器的 page 從 0 開始，需要 +1
	
	// 只更新 searchRequest，不管理 first 狀態
	if (pageNum >= 1 && pageNum <= searchResultsPages.value) {
		updateSearchRequest({ pageNum: pageNum });
	}
}

// 獲取搜索結果
async function fetchFilteredCourses(): Promise<void> {
	try {
		isSearchLoading.value = true;
		searchError.value = null;
		clearLoadingStates();
		
		// 準備搜索請求，過濾掉空值，但保留分頁參數
		const cleanRequest = Object.fromEntries(
			Object.entries(searchRequest.value).filter(([_, value]) => {
				if (Array.isArray(value)) return value.length > 0;
				if (typeof value === 'boolean') return value;
				if (typeof value === 'number') return value > 0;
				return value !== undefined && value !== null && value !== '';
			})
		);

		const result = await CourseService.searchCourses(cleanRequest);

		if (result.success && result.data) {
			searchResults.value = result.data.list || [];
			searchResultsTotal.value = result.data.total || 0;
			searchResultsPages.value = result.data.pages || 0;			
			if (searchResults.value.length === 0) {
				showInfo('沒有找到符合條件的課程', '無搜索結果');
			}
		} else {
			searchError.value = result.message || '搜索失敗';
			showError(searchError.value, '搜索錯誤');
		}
	} catch (error) {
		searchError.value = '網絡錯誤，請稍後再試: ' + error;
		showError(searchError.value, '獲取數據失敗');
	} finally {
		isSearchLoading.value = false;
	}
}

// 檢視課程詳情
async function selectCourse(course: Course): Promise<void> {
	selectedCourseId.value = course.id;
	setLoading(course.id, true);
	try {
		const result = await loadCourseDetail(course.id);

		if (result.success) {
			if (currentCourse.value) {
				currentCourses.value.set(course.id, currentCourse.value);
				courseSessionMap.value.set(course.id, courseSession.value);
			}
			detailVisible.value = true;
		} else {
			showError(result.message || '載入課程詳情失敗', '無法查看課程詳情');
		}
	} catch (error: unknown) {
		console.error('載入課程詳情時出錯:', error);
		showError('載入課程詳情時出錯，請稍後再試', '無法查看課程詳情');
	} finally {
		setLoading(course.id, false);
	}
}

// 處理子分類切換
function handleSubCategoryToggle(code: string): void {
	const categories = [...(searchRequest.value.categories || [])];
	const index = categories.indexOf(code);
	searchRequest.value.pageNum = 1;

	if (index > -1) {
		categories.splice(index, 1);
	} else {
		categories.push(code);
	}

	updateSearchRequest({ categories });
}

// 處理地區切換
function toggleRegion(code: string): void {
	const regions = [...(searchRequest.value.regions || [])];
	const index = regions.indexOf(code);
	searchRequest.value.pageNum = 1;
	if (index > -1) {
		regions.splice(index, 1);
	} else {
		regions.push(code);
	}
	updateSearchRequest({ regions });
}

// 處理應用篩選
function handleApplyFilters(): void {
	applyFilters(searchResults.value.length);
}
const paginatorFirst = computed(() => {
	const pageNum = searchRequest.value.pageNum || 1;
	const pageSize = searchRequest.value.pageSize || 9;
	const first = (pageNum - 1) * pageSize;
	return first;
});
// 初始化頁面
onMounted(async () => {
	// 同步URL參數到搜索請求
	syncParamsToFilters();
	// 載入推薦課程
	await loadRecommendationCourses();

	// 如果URL中包含分類參數，則自動選中對應分類
	if (route.query.category) {
		const catCode = route.query.category as string;
		if (Object.values(SubCategory).includes(catCode as SubCategory)) {
			updateSearchRequest({
				categories: [...(searchRequest.value.categories || []), catCode]
			});
		}
	}
	clearLoadingStates();

	// 載入初始搜索結果
	await fetchFilteredCourses();

	// 初始化 toast
	initToast(toast);
});

// 監聽路由參數變化，當從 Header 搜尋時重新觸發搜尋
watch(() => route.query.keyword , (newQuery, oldQuery) => {
	// 檢查是否為搜尋相關的參數變化
	if (newQuery !== oldQuery) {
		console.log('路由搜尋參數變化，重新同步並搜尋:', newQuery);
		// 同步新的 URL 參數到搜索請求
		syncParamsToFilters();
		// 重新執行搜尋
		fetchFilteredCourses();
	}
}, { deep: true });

</script>


<style scoped>
@reference "tailwindcss";

:deep(.p-inputnumber > input) {
	width: 100%;
	max-width: 100px !important;
}

.chip {
	@apply cursor-pointer hover:bg-blue-200! transition-colors
}

.chip:hover:not(.chip-selected) {
	@apply bg-blue-100!
}

.chip-selected {
	@apply bg-blue-400! text-white!
}

.chip.chip-selected:hover {
	@apply bg-blue-500!
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease, max-height 0.3s ease;
	max-height: 1000px;
	overflow: hidden;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	max-height: 0;
}
</style>
