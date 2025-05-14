import { ref, computed } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { MainCategory, SubCategory } from '@/enums/CourseCategory';
import { mockRegions } from '@/service/MockService';
import { useToast } from 'primevue/usetoast';

export function useCourseFilters(route: RouteLocationNormalizedLoaded, router: Router) {
  const toast = useToast();
  
  // 搜尋與篩選狀態
  const keyword = ref(route.query.keyword as string || '');
  const selectedMainCategories = ref<string[]>([]);
  const selectedSubCategories = ref<string[]>([]);
  const selectedRegions = ref<string[]>([]);
  const pointsRange = ref([0, 50]);
  const filters = ref({
    hasOpenSlots: false,
    newCourses: false,
    favourites: false
  });
  const sortBy = ref('relevance');

  // 排序選項
  const sortOptions = [
    { label: '相關性優先', value: 'relevance' },
    { label: '點數低至高', value: 'points-asc' },
    { label: '點數高至低', value: 'points-desc' },
    { label: '新上架優先', value: 'newest' },
    { label: '評分高至低', value: 'rating' }
  ];

  // 計算已應用的篩選器數量
  const appliedFiltersCount = computed(() => {
    let count = 0;

    // 区域筛选
    if (selectedRegions.value.length > 0) count++;

    // 类别筛选
    if (selectedMainCategories.value.length > 0) count++;
    if (selectedSubCategories.value.length > 0) count++;

    // 点数筛选
    if (pointsRange.value[0] > 0 || pointsRange.value[1] < 50) count++;

    // 高级筛选
    if (filters.value.hasOpenSlots) count++;
    if (filters.value.newCourses) count++;
    if (filters.value.favourites) count++;

    // 排序
    if (sortBy.value !== 'relevance') count++;

    return count;
  });

  // 判断是否应用了筛选条件
  const isFiltersApplied = computed(() => appliedFiltersCount.value > 0);

  // 同步URL参数到过滤条件
  const syncParamsToFilters = () => {
    const params = route.query;

    // 关键词
    keyword.value = String(params.keyword);

    // 区域
    if (params.regions) {
      const regionCodes = String(params.regions).split(',');
      selectedRegions.value = regionCodes.filter(code =>
        mockRegions.some((r) => r.code === code)
      );
    }

    // 类别
    if (params.categories) {
      const categoryCodes = String(params.categories).split(',');
      
      // 分離主分類和子分類
      selectedMainCategories.value = categoryCodes.filter(code => 
        Object.values(MainCategory).includes(code as MainCategory)
      );
      
      selectedSubCategories.value = categoryCodes.filter(code => 
        Object.values(SubCategory).includes(code as SubCategory)
      );
    }

    // 点数范围
    if (params.minPoints) {
      pointsRange.value[0] = Number(params.minPoints);
    }
    if (params.maxPoints) {
      pointsRange.value[1] = Number(params.maxPoints);
    }

    // 高级过滤
    if (params.hasOpenSlots) {
      filters.value.hasOpenSlots = params.hasOpenSlots === 'true';
    }
    if (params.newCourses) {
      filters.value.newCourses = params.newCourses === 'true';
    }
    if (params.favourites) {
      filters.value.favourites = params.favourites === 'true';
    }

    // 排序
    if (params.sortBy) {
      const sortValue = String(params.sortBy);
      if (sortOptions.some((opt) => opt.value === sortValue)) {
        sortBy.value = sortValue;
      }
    }
  };

  // 同步过滤条件到URL
  const syncFiltersToParams = () => {
    const query: Record<string, string> = {};

    // 基本搜索条件
    query.keyword = keyword.value;

    // 区域
    if (selectedRegions.value.length > 0) {
      query.regions = selectedRegions.value.join(',');
    }

    // 类别 - 合併主分類和子分類
    const allCategories = [...selectedMainCategories.value, ...selectedSubCategories.value];
    if (allCategories.length > 0) {
      query.categories = allCategories.join(',');
    }

    // 点数范围
    if (pointsRange.value[0] > 0) {
      query.minPoints = pointsRange.value[0].toString();
    }
    if (pointsRange.value[1] < 100) {
      query.maxPoints = pointsRange.value[1].toString();
    }

    // 高级过滤
    if (filters.value.hasOpenSlots) {
      query.hasOpenSlots = 'true';
    }
    if (filters.value.newCourses) {
      query.newCourses = 'true';
    }
    if (filters.value.favourites) {
      query.favourites = 'true';
    }

    // 排序
    if (sortBy.value !== 'relevance') {
      query.sortBy = sortBy.value;
    }

    // 使用router.replace而不是push，避免创建新的历史记录
    router.replace({ query });
  };

  // 应用过滤器
  const applyFilters = (filteredCoursesCount: number) => {
    // 同步到URL
    syncFiltersToParams();

    // 显示成功提示
    toast.add({
      severity: 'success',
      summary: '篩選已應用',
      detail: `已找到 ${filteredCoursesCount} 個符合條件的結果`,
      life: 3000
    });
  };

  // 重置过滤器
  const resetFilters = () => {
    // 重置所有筛选条件，但保留关键词
    const currentKeyword = keyword.value;
    
    keyword.value = route.query.keyword as string || '';
    selectedRegions.value = [];
    selectedMainCategories.value = [];
    selectedSubCategories.value = [];
    pointsRange.value = [0, 100];
    filters.value = {
      hasOpenSlots: false,
      newCourses: false,
      favourites: false
    };
    sortBy.value = 'relevance';

    // 同步到URL - 只保留关键词
    router.replace({
      query: currentKeyword ? { keyword: currentKeyword } : {}
    });

    // 显示重置提示
    toast.add({
      severity: 'info',
      summary: '篩選已重置',
      detail: '所有篩選條件已重置為默認值',
      life: 3000
    });
  };

  return {
    // 狀態
    keyword,
    selectedMainCategories,
    selectedSubCategories,
    selectedRegions,
    pointsRange,
    filters,
    sortBy,
    sortOptions,
    
    // 計算屬性
    appliedFiltersCount,
    isFiltersApplied,
    
    // 方法
    syncParamsToFilters,
    syncFiltersToParams,
    applyFilters,
    resetFilters
  };
} 