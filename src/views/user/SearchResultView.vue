<template>
	<div class="flex flex-col min-h-screen overflow-y-auto">
		<!-- 主要内容區 -->
		<div class="flex-grow flex flex-col md:flex-row gap-2">
			<!-- 左側篩選區 -->
			<div class="md:w-1/4 shrink-0">
				<div class="bg-white rounded-lg shadow p-4 sticky top-4">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-xl font-bold">篩選條件</h2>
						<Badge v-if="isFiltersApplied" :value="appliedFiltersCount" severity="info" class="ml-2">
						</Badge>
					</div>

					<!-- 地区篩選 -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">地區</h3>
						<div class="flex flex-wrap gap-2">
							<Chip v-for="region in visibleRegions" :key="region.code" :label="region.name"
								:class="{ 'chip-selected': isItemInArray(selectedRegions, region.code) }"
								@click="toggleRegion(region.code)" class="chip" />
							<Button v-if="!showAllRegions && allRegions.length > visibleRegionsCount" 
								link class="text-blue-500 py-1" 
								@click="showAllRegions = true"
								label="顯示更多" />
							<Button v-else-if="showAllRegions" 
								link class="text-blue-500 py-1" 
								@click="showAllRegions = false"
								label="收起" />
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
											:class="{ 'chip-selected': isItemInArray(selectedSubCategories, subCat.code) }"
											@click="handleSubCategoryToggle(subCat.code)" class="chip" />
									</div>
								</AccordionContent>
							</AccordionPanel>
						</Accordion>
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
						<Button label="套用篩選" icon="pi pi-filter" @click="handleApplyFilters" :loading="isCoursesLoading"
							:disabled="isCoursesLoading" class="w-full" />
						<Button label="重置" icon="pi pi-refresh" outlined @click="resetFilters"
							:disabled="isCoursesLoading" class="w-full" />
					</div>
				</div>
			</div>

			<!-- 右側內容區 -->
			<div class="flex-grow overflow-hidden p-4">
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
							placeholder="選擇排序方式" class="w-40" :disabled="isCoursesLoading" />
					</div>
				</div>

				<!-- 推薦課程分頁區塊 -->
				<div class="bg-gray-100 rounded-lg p-2 mb-4">
					<div class="flex justify-between items-center px-2 mb-2">
						<h3 class="text-lg font-semibold">推薦課程</h3>
						<Button 
							:icon="isRecommendationCollapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" 
							text 
							rounded 
							@click="isRecommendationCollapsed = !isRecommendationCollapsed" 
							aria-label="收合/展開" 
							class="p-1"
						/>
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
										<AsyncCarousel :items="popularCourses" :loading="isCoursesLoading">
											<template #item="slotProps">
												<CourseCard :course="slotProps.item" @click="selectCourse(slotProps.item)"
													:disabled="isLoading(slotProps.item.courseId)"
													:loading="isLoading(slotProps.item.courseId)" />
											</template>
										</AsyncCarousel>
									</TabPanel>
									<TabPanel value="latest">
										<AsyncCarousel :items="latestCourses" :loading="isCoursesLoading">
											<template #item="slotProps">
												<CourseCard :course="slotProps.item" @click="selectCourse(slotProps.item)"
													:disabled="isLoading(slotProps.item.courseId)"
													:loading="isLoading(slotProps.item.courseId)" />
											</template>
										</AsyncCarousel>
									</TabPanel>
									<TabPanel value="recommended" v-if="isLoggedIn">
										<AsyncCarousel :items="recommendedCourses" :loading="isCoursesLoading">
											<template #item="slotProps">
												<CourseCard :course="slotProps.item" @click="selectCourse(slotProps.item)"
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
					<AsyncState :loading="isCoursesLoading" :error="coursesLoadError || ''"
						:isEmpty="filteredCourses.length === 0" loadingText="載入課程中，請稍候..." errorTitle="獲取課程數據時出錯"
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

						<DataView :value="filteredCourses" :layout="layout" paginator :rows="9"
							:rowsPerPageOptions="[9, 18, 27]">
							<template #header>
								<div class="flex justify-between">
									<h1 class="text-2xl font-bold">搜尋結果</h1>

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
										<div class="sm:w-48 h-48 sm:h-auto bg-gray-200 relative overflow-hidden">
											<img :src="course.image.imageSrc" :alt="course.title"
												class="inset-0 w-full h-full object-cover" />
											<!-- 添加加载覆盖层 -->
											<div v-if="isLoading(course.courseId)"
												class="absolute inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center">
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
											<div class="mt-2 flex-grow">
												<p class="text-sm text-gray-600 line-clamp-2">{{ course.description }}
												</p>
											</div>
											<div class="mt-4 flex justify-between items-center">
												<span
													class="border rounded-md px-2 py-1 text-xs text-primary-600 font-medium">{{
														course.pointsRequired
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
										:class="{ 'opacity-70 pointer-events-none': isLoading(course.courseId) }" />
								</div>
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
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CourseCard from '@/components/modal/CourseCard.vue';
import TabPanel from 'primevue/tabpanel';
import CourseDetail from '@/views/user/course/CourseDetail.vue';
import type { CourseDTO, Course, CourseSession } from '@/types/course';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import DataView from 'primevue/dataview';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { useBookingStore } from '@/stores/bookingStore';
import ProgressSpinner from 'primevue/progressspinner';
import { MainCategory, SubCategory } from '@/enums/CourseCategory';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionContent from 'primevue/accordioncontent';
import AccordionHeader from 'primevue/accordionheader';
import Badge from 'primevue/badge';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import { useUserStore } from '@/stores/userStore';
import { isItemInArray, toggleItem } from '@/utils/arrayUtils';
import { getMainCategories, getGroupedSubCategories } from '@/utils/categoryUtils';
import AsyncCarousel from '@/components/common/AsyncCarousel.vue';
import AsyncState from '@/components/common/AsyncState.vue';
import { useCourseStore } from '@/stores/courseStore';
import { useCourseFilters } from '@/composables/useCourseFilters';
import { useLoadingMap } from '@/composables/useLoadingMap';
import { RegionLabelMap } from '@/enums/RegionCode';
import { showError, showInfo, initToast } from '@/utils/toast-helper';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 使用 composables
const courseStore = useCourseStore();
const availableCourses = computed(() => courseStore.allCourses);
const isCoursesLoading = computed(() => courseStore.isLoading);
const coursesLoadError = computed(() => courseStore.error);
const popularCourses = computed(() => courseStore.popularCourses);
const latestCourses = computed(() => courseStore.latestCourses);
const recommendedCourses = computed(() => courseStore.recommendedCourses);
const fetchCourses = courseStore.fetchCourses;
const currentCourse = computed(() => courseStore.currentCourse);
const courseSession = computed(() => courseStore.courseSession);
const loadCourseDetail = courseStore.loadCourseDetail;

const {
	keyword,
	selectedMainCategories,
	selectedSubCategories,
	selectedRegions,
	pointsRange,
	filters,
	sortBy,
	sortOptions,
	appliedFiltersCount,
	isFiltersApplied,
	syncParamsToFilters,
	applyFilters,
	resetFilters
} = useCourseFilters(route, router);

const {
	isLoading,
	setLoading,
	clearLoadingStates
} = useLoadingMap();

// 視圖狀態
const layout = ref('grid');
const detailVisible = ref(false);
const selectedCourseId = ref(0);

// 標籤頁配置
const activeTab = ref('popular');
const tabs = [
	{ label: '熱門課程', value: 'popular', icon: 'pi pi-star' },
	{ label: '最新上架', value: 'latest', icon: 'pi pi-calendar' },
	{ label: '為您推薦', value: 'recommended', icon: 'pi pi-user' }
];

// 當前課程詳情 - 使用懶加載
const currentCourses = ref<Map<number, Course>>(new Map());
// 當前課程時間
const courseSessionMap = ref<Map<number, CourseSession[]>>(new Map());

// 主分類和子分類
const mainCategories = computed(() => getMainCategories());
const groupedSubCategories = computed(() => getGroupedSubCategories());

// 定义所有地区
const allRegions = ref(Object.entries(RegionLabelMap).map(([code, name]) => ({ code, name })));
const visibleRegionsCount = 5; // 默认显示的地区数量
const showAllRegions = ref(false);
const visibleRegions = computed(() => {
	return showAllRegions.value 
		? allRegions.value 
		: allRegions.value.slice(0, visibleRegionsCount);
});

// 过滤后的课程列表
const filteredCourses = computed(() => {
	if (!availableCourses.value.length) return [];

	return availableCourses.value.filter((course: CourseDTO) => {
		// 关键词过滤
		if (keyword.value && !course.title.toLowerCase().includes(keyword.value.toLowerCase()) &&
			!course.description?.toLowerCase().includes(keyword.value.toLowerCase())) {
			return false;
		}

		// 区域过滤
		if (selectedRegions.value.length > 0 && !selectedRegions.value.includes(course.region || '')) {
			return false;
		}

		// 类别过滤 - 移除categories检查，因为CourseDTO没有此属性
		// TODO: 如果需要添加类别过滤，请确保CourseDTO包含categories属性
		// 暂时跳过类别过滤条件

		// 点数范围过滤
		if (course.points < pointsRange.value[0] ||
			course.points > pointsRange.value[1]) {
			return false;
		}

		// 有空位过滤 (模拟)
		if (filters.value.hasOpenSlots && course.id % 3 === 0) {
			return false;
		}

		// 新上架过滤 (使用创建日期)
		if (filters.value.newCourses) {
			// 如果没有创建日期或创建日期超过14天，则不符合新上架条件
			if (!course.createdAt) return false;

			const fourteenDaysAgo = new Date();
			fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

			if (course.createdAt < fourteenDaysAgo) {
				return false;
			}
		}

		// 收藏过滤 (模拟)
		if (filters.value.favourites && course.id % 5 !== 0) {
			return false;
		}

		return true;
	}).sort((a: CourseDTO, b: CourseDTO) => {
		// 排序
		switch (sortBy.value) {
			case 'newest':
				return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
			case 'points-asc':
				return a.points - b.points;
			case 'points-desc':
				return b.points - a.points;
			case 'rating':
				// 模拟评分排序，实际应该使用课程评分
				return (b.id % 10) - (a.id % 10);
			default:
				// 默认按相关性排序 (使用ID模拟)
				if (keyword.value) {
					// 如果标题包含关键词，则排在前面
					const aHasKeyword = a.title.toLowerCase().includes(keyword.value.toLowerCase());
					const bHasKeyword = b.title.toLowerCase().includes(keyword.value.toLowerCase());

					if (aHasKeyword && !bHasKeyword) return -1;
					if (!aHasKeyword && bHasKeyword) return 1;
				}
				return a.id - b.id;
		}
	});
});

// 监听路由变化，同步URL参数到过滤条件
watchEffect(() => {
	if (route.name === 'Search') {
		// 只有在路由参数变化时才同步
		syncParamsToFilters();
		fetchCourses();
		clearLoadingStates();
	}
});

// 初始化頁面
onMounted(async () => {
	// 从 URL 获取初始筛选条件
	syncParamsToFilters();

	// 如果URL中包含分類參數，則自動選中對應分類
	if (route.query.category) {
		const catCode = route.query.category as string;
		// 檢查是否為主分類
		if (isItemInArray(Object.values(MainCategory), catCode as MainCategory)) {
			selectedMainCategories.value.push(catCode as MainCategory);
		}
		// 檢查是否為子分類
		else if (isItemInArray(Object.values(SubCategory), catCode as SubCategory)) {
			selectedSubCategories.value.push(catCode as SubCategory);
			// 同時選中對應的主分類
			const mainCat = catCode.split('_')[0] as MainCategory;
			if (!isItemInArray(selectedMainCategories.value, mainCat)) {
				selectedMainCategories.value.push(mainCat);
			}
		}
	}
	clearLoadingStates();
	// 加载数据
	await fetchCourses();
	
	// 初始化 toast
	initToast(toast);
});

// 视图查看课程详情
async function selectCourse(course: CourseDTO): Promise<void> {
	selectedCourseId.value = course.id;

	// 标记为加载中
	setLoading(course.id, true);

	try {
		// 使用 courseStore 的 loadCourseDetail 方法加載課程數據
		const result = await loadCourseDetail(course.id);

		if (result.success) {
			// 保存课程详情
			if (currentCourse.value) {
				currentCourses.value.set(course.id, currentCourse.value);
				courseSessionMap.value.set(course.id, courseSession.value);
			}

			// 成功加載後打開詳情彈窗
			detailVisible.value = true;
		} else {
			// 顯示錯誤提示
			showError(result.message || '加載課程詳情失敗', '無法查看課程詳情');
		}
	} catch (error: unknown) {
		console.error('加載課程詳情時出錯:', error);
		showError(coursesLoadError.value || '加載課程詳情時出錯，請稍後再試', '無法查看課程詳情');
	} finally {
		// 标记加载完成
		setLoading(course.id, false);
	}
}

/**
 * 處理子分類的切換狀態，並同時維護主分類的選中狀態
 */
function handleSubCategoryToggle(code: string): void {
	const isAdded = toggleItem(selectedSubCategories.value, code);
	const mainCat = code.split('_')[0] as MainCategory;
	if (isAdded) {
		if (!isItemInArray(selectedMainCategories.value, mainCat)) {
			selectedMainCategories.value.push(mainCat);
		}
	} else {
		const hasRelatedSubCategories = selectedSubCategories.value.some(
			subCat => subCat.split('_')[0] === mainCat
		);
		if (!hasRelatedSubCategories) {
			selectedMainCategories.value = selectedMainCategories.value.filter(
				cat => cat !== mainCat
			);
		}
	}

	// 立即获取过滤后的课程数据
	fetchFilteredCourses();
}

// 修改地区切换函数，点击后立即应用筛选
function toggleRegion(code: string): void {
	toggleItem(selectedRegions.value, code);
	// 立即获取课程数据
	fetchFilteredCourses();
}

// 获取过滤后的课程数据
async function fetchFilteredCourses(): Promise<void> {
	try {
		// 设置加载状态
		clearLoadingStates();
		
		// 合并分类
		const allCategories = [...selectedMainCategories.value, ...selectedSubCategories.value];
		
		// 调用API获取数据
		await fetchCourses(
			keyword.value, 
			selectedRegions.value.length > 0 ? selectedRegions.value : undefined, 
			allCategories.length > 0 ? allCategories : undefined
		);
		
		// 显示过滤结果数量
		if (filteredCourses.value.length === 0) {
			showInfo('没有找到符合条件的课程', '无搜索结果');
		}
	} catch (error) {
		console.error('获取课程失败:', error);
		showError('请稍后再试', '获取数据失败');
	}
}

// 處理應用篩選
function handleApplyFilters(): void {
	applyFilters(filteredCourses.value.length);
	// 应用筛选条件后获取数据
	fetchFilteredCourses();
}

// 推薦課程分頁區塊狀態控制
const isRecommendationCollapsed = ref(false);
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
