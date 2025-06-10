<template>
	<div class="flex flex-col flex-1 gap-4">
		<div class="bg-white rounded-lg shadow p-4 mb-4 border border-sky-100">
			<div class="flex flex-wrap justify-between items-center mb-4">
				<h2 class="text-2xl font-bold text-sky-700 flex items-center">
					<i class="pi pi-heart mr-2"></i>我的收藏課程
				</h2>
				<div v-if="!loading && favoriteCourses.length > 0" class="flex items-center gap-4">
					<div class="text-sky-600 bg-sky-50 px-3 py-1 rounded-full font-medium text-sm">共 {{ favoriteCourses.length }} 門收藏課程</div>
					<div class="p-dataview-layout-options">
						<ButtonGroup>
							<Button
								:class="{ 'p-button-text !text-sky-400': layout !== 'grid', 'p-button-outlined !border-sky-500 !text-sky-500': layout === 'grid' }"
								icon="pi pi-th-large" aria-label="網格模式" @click="layout = 'grid'" />
							<Button
								:class="{ 'p-button-text !text-sky-400': layout !== 'list', 'p-button-outlined !border-sky-500 !text-sky-500': layout === 'list' }"
								icon="pi pi-list" aria-label="列表模式" @click="layout = 'list'" />
						</ButtonGroup>
					</div>
				</div>
			</div>

			<!-- 加载状态 -->
			<div v-if="loading" class="flex justify-center p-6">
				<ProgressSpinner strokeWidth="4" class="!text-sky-500" />
			</div>

			<!-- 空状态 -->
			<div v-else-if="favoriteCourses.length === 0" class="text-center p-12 bg-sky-50 rounded-lg border border-sky-100">
				<i class="pi pi-heart-fill text-4xl text-sky-200 mb-4"></i>
				<h3 class="text-xl font-semibold text-sky-600 mb-2">尚未收藏任何課程</h3>
				<p class="text-gray-500 mb-6">瀏覽課程並點擊心形圖標將它們添加到收藏</p>
				<Button label="瀏覽課程" icon="pi pi-search" @click="router.push('/courses')" class="!bg-sky-500 !border-sky-500" />
			</div>

			<!-- 使用 DataView 组件统一管理课程列表 -->
			<DataView v-else :value="favoriteCourses" :layout="layout" :paginator="favoriteCourses.length > 9" :rows="9"
				:rowsPerPageOptions="[9, 18, 27]">

				<!-- 列表视图 -->
				<template #list>
					<div class="flex flex-col gap-4 p-2">
						<div v-for="course in favoriteCourses" :key="course.id"
							class="flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-sky-100 bg-white relative"
							:class="{ 'opacity-70': isLoading(course.id) }">
							<div class="sm:w-48 h-48 sm:h-auto bg-gray-200 relative overflow-hidden">
								<img v-if="course.coverUrl" :src="course.coverUrl" :alt="course.title"
									class="inset-0 w-full h-full object-cover" />
								<img v-else src="@/assets/image/course-placeholder.jpg" :alt="course.title"
									class="inset-0 w-full h-full object-cover" />
								<!-- 加载状态覆盖层 -->
								<div v-if="isLoading(course.id)"
									class="absolute inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center">
									<ProgressSpinner style="width:40px;height:40px" strokeWidth="4" class="!text-sky-300" />
								</div>
							</div>
							<div class="flex-grow p-4 flex flex-col">
								<div class="flex justify-between items-start">
									<div>
										<h3 class="text-lg font-semibold text-sky-700">{{ course.title }}</h3>
										<div class="text-sm text-gray-600 mb-1">
											<i class="pi pi-map-marker mr-1 text-sky-500"></i>
											<span>{{ course.region || '未指定地區' }}</span>
										</div>
									</div>
									<div class="flex gap-2">
										<Button icon="pi pi-heart-fill" text rounded aria-label="取消收藏"
											class="text-red-500 hover:bg-red-50" @click.stop="removeFavorite(course.id)" />
										<Button icon="pi pi-share-alt" text rounded aria-label="分享"
											class="text-sky-500 hover:bg-sky-50" @click.stop="shareCourse(course)" />
									</div>
								</div>
								<div class="mt-2 flex-grow">
									<p class="text-sm text-gray-600 line-clamp-2">{{ course.description }}</p>
								</div>
								<div class="mt-4 flex justify-between items-center">
									<span class="border border-sky-200 bg-sky-50 rounded-md px-2 py-1 text-xs text-sky-600 font-medium">{{
										course.points }} 點數</span>
									<Button label="查看詳情" @click.stop="viewCourseDetails(course.id)"
										:loading="isLoading(course.id)" :disabled="isLoading(course.id)" 
										class="!bg-sky-500 !border-sky-500" />
								</div>
							</div>
						</div>
					</div>
				</template>

				<!-- 网格视图 -->
				<template #grid>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
						<div v-for="course in favoriteCourses" :key="course.id"
							class="course-card-container transition-all duration-200 hover:shadow-md relative border border-sky-100 rounded-lg">
							<CourseCard :course="mapCourseToDTO(course)" @click="viewCourseDetails(course.id)"
								:loading="isLoading(course.id)" :disabled="isLoading(course.id)" />
							<div class="absolute top-2 right-2 flex gap-1 z-10">
								<Button icon="pi pi-heart-fill" text rounded aria-label="取消收藏"
									class="bg-white bg-opacity-70 text-red-500 hover:bg-white hover:bg-opacity-100 hover:bg-red-50"
									@click.stop="removeFavorite(course.id)" />
								<Button icon="pi pi-share-alt" text rounded aria-label="分享"
									class="bg-white bg-opacity-70 text-sky-500 hover:bg-white hover:bg-opacity-100 hover:bg-sky-50"
									@click.stop="shareCourse(course)" />
							</div>
						</div>
					</div>
				</template>
				
				<!-- 分頁組件樣式覆寫 -->
				<template #paginatorstart>
					<div class="text-sm text-sky-600">顯示 {{ favoriteCourses.length > 0 ? 1 : 0 }}-{{ Math.min(9, favoriteCourses.length) }} 共 {{ favoriteCourses.length }} 課程</div>
				</template>
			</DataView>
		</div>

		<!-- 课程详情对话框 -->
		<CourseDetail v-model:visible="detailVisible" :courseId="selectedCourseId" />

		<!-- 通知组件 -->
		<Toast />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ButtonGroup from 'primevue/buttongroup';
import ProgressSpinner from 'primevue/progressspinner';
import CourseCard from '@/components/modal/CourseCard.vue';
import CourseDetail from '@/components/user/CourseDetail.vue';
import DataView from 'primevue/dataview';
import type { Course } from '@/types/course';
import { showSuccess, showError, showInfo, initToast } from '@/utils/toastHelper';
import { generateMockCourses } from '@/services/MockService';
import { useAuthStore } from '@/stores/authStore';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const { isLoggedIn } = useAuthStore();

// 視圖控制
const layout = ref('grid');
const detailVisible = ref(false);
const selectedCourseId = ref(0);

// 加載狀態控制
const loadingStates = ref<Map<number, boolean>>(new Map());

// 判斷課程是否正在加載中
const isLoading = (courseId: number): boolean => {
	return loadingStates.value.get(courseId) || false;
};

// 設置課程加載狀態
const setLoading = (courseId: number, state: boolean): void => {
	loadingStates.value.set(courseId, state);
};

// 計算屬性 - 收藏課程列表
const favoriteCourses = computed(() => {
	return userStore.favoriteCourses || [];
});

// 監聽收藏課程變化
watch(() => userStore.favoriteCourses, (newValue) => {
	// 當收藏課程變更時，清除所有課程的加載狀態
	loadingStates.value.clear();
	console.log('收藏課程已更新', newValue);
}, { deep: true });

// 將 Course 物件映射為 Course 物件
const mapCourseToDTO = (course: any): Course => {
	return {
		id: course.id,
		title: course.title,
		description: course.description || '',
		points: course.points || 0,
		region: course.region || '',
		coverUrl: course.coverUrl || '/assets/course-placeholder.jpg',
		merchantId: course.merchantId || 0,
		createdAt: course.createdAt || new Date(),
		joinCount: course.joinCount || 0,
		recommended: course.recommended || false
	};
};

// 在組件掛載時加載收藏課程
onMounted(async () => {
	// 初始化 toast
	// 加載收藏課程
	loading.value = true;
	try {
		if (isLoggedIn && (!userStore.favoriteCourses || userStore.favoriteCourses.length === 0)) {
			await userStore.fetchFavoriteCourses();

			// 如果没有收藏课程数据，生成 mock 数据（仅用于演示）
			if (!userStore.favoriteCourses.length) {
				// 注：在实际应用中，应该移除以下模拟数据代码
				const mockCourses = generateMockCourses();
				const randomFavorites = mockCourses
					.filter((_, index) => index % 3 === 0) // 随机选择三分之一的课程
					.slice(0, 8); // 最多8个收藏

				// 将模拟数据添加到收藏
				for (const course of randomFavorites) {
					await userStore.addFavorite(course);
				}
			}
		}
	} catch (error) {
		showError('載入收藏課程失敗，請稍後再試', '錯誤');
	} finally {
		loading.value = false;
	}
});

// 移除收藏課程
const removeFavorite = async (courseId: number) => {
	setLoading(courseId, true);
	try {
		// 使用 userStore 的 removeFavorite 方法
		const result = await userStore.removeFavorite(courseId);
		if (result?.success) {
			showSuccess('課程已從收藏中移除', '成功');
		} else {
			showError(result?.message || '移除收藏失敗', '錯誤');
		}
	} catch (error) {
		showError(error as string, '錯誤');
	} finally {
		setLoading(courseId, false);
	}
};

// 查看課程詳情
const viewCourseDetails = (courseId: number) => {
	// 設置加載狀態
	setLoading(courseId, true);

	// 設置選中的課程ID
	selectedCourseId.value = courseId;

	// 打開詳情彈窗
	detailVisible.value = true;

	// 延遲清除加載狀態，模擬數據加載時間
	setTimeout(() => {
		setLoading(courseId, false);
	}, 500);
};

// 分享課程
const shareCourse = (course: any) => {
	// 模擬複製課程連結到剪貼簿
	const courseUrl = `${window.location.origin}/courses/${course.id}`;
	navigator.clipboard.writeText(courseUrl)
		.then(() => {
			showSuccess('課程連結已複製到剪貼簿', '分享成功');
		})
		.catch(() => {
			showInfo(`分享課程: ${course.title}`, '分享功能');
		});
};
</script>

<style scoped>
@reference "tailwindcss";

.course-card-container {
	position: relative;
	border-radius: 0.5rem;
	overflow: hidden;
}

.course-card-container:hover {
	transform: translateY(-4px);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:deep(.p-datatable-header),
:deep(.p-dataview-header) {
	@apply bg-sky-50 text-sky-700 border-sky-100;
}

:deep(.p-paginator) {
	@apply border-t border-sky-100 bg-white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
	@apply bg-sky-500 text-white;
}

:deep(.p-button.p-highlight) {
	@apply bg-sky-50 text-sky-600 border-sky-200;
}

:deep(.p-progressspinner-circle) {
	@apply text-sky-500;
}

:deep(.p-dataview-content) {
	@apply border-0;
}
</style>
