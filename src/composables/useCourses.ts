import { ref, computed } from 'vue';
import type { CourseDTO } from '@/types/course';
import { generateMockCourses } from '@/service/MockService';

export function useCourses() {
	const allCourses = ref<CourseDTO[]>([]);
	const availableCourses = ref<CourseDTO[]>([]);
	const isCoursesLoading = ref(false);
	const coursesLoadError = ref<string | null>(null);

	// 熱門課程 - 按參與人數排序
	const popularCourses = computed(() => {
		return [...availableCourses.value]
			.sort((a, b) => (b.joinCount || 0) - (a.joinCount || 0))
			.slice(0, 6);
	});

	// 最新上架課程 - 按創建日期排序
	const latestCourses = computed(() => {
		return [...availableCourses.value]
			.sort((a, b) => {
				const aDate = a.createdAt;
				const bDate = b.createdAt;
				if (aDate && bDate) {
					return bDate.getTime() - aDate.getTime();
				}
				return b.courseId - a.courseId;
			})
			.slice(0, 6);
	});

	// 推薦課程 - 基於用戶偏好或熱門程度
	const recommendedCourses = computed(() => {
		return [...availableCourses.value]
			.sort((a, b) => b.pointsRequired - a.pointsRequired)
			.slice(0, 6);
	});

	// 獲取課程數據
	const fetchCourses = async (keyword?: string, regions?: string[], categories?: string[]) => {
		isCoursesLoading.value = true;
		coursesLoadError.value = null;

		try {
			// 模擬API調用
			console.log('Fetching courses with keyword:', keyword);

			// 模擬數據 - 這裡應替換為實際API調用
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const mockCourses = generateMockCourses();
					availableCourses.value = mockCourses;
					allCourses.value = mockCourses;
					isCoursesLoading.value = false;
					resolve();
				}, 1000);
			});
		} catch (error: unknown) {
			console.error('Error fetching courses:', error);
			coursesLoadError.value = error instanceof Error ? error.message : '獲取課程數據時出錯，請稍後再試';
			isCoursesLoading.value = false;
			throw error;
		}
	};

	return {
		allCourses,
		availableCourses,
		isCoursesLoading,
		coursesLoadError,
		popularCourses,
		latestCourses,
		recommendedCourses,
		fetchCourses
	};
} 