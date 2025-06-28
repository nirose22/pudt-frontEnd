import { ref, computed, watch } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { MainCategory, SubCategory } from '@/enums/CourseCategory';
import { useToast } from 'primevue/usetoast';
import type { SearchRequest } from '@/types/searchRequest';
import { debounce } from '@/utils/cmmonUtils';
import { RegionCode } from '@/enums/RegionCode';

export function useCourseFilters(route: RouteLocationNormalizedLoaded, router: Router) {
    const toast = useToast();

    // 統一的搜索請求對象
    const searchRequest = ref<SearchRequest>({
        keyword: route.query.keyword as string || '',
        regions: [],
        categories: [],
        minPoints: 0,
        maxPoints: 100,
        hasOpenSlots: false,
        newCourses: false,
        favourites: false,
        sortBy: 'relevance',
        sortOrder: 'desc',
        pageNum: 1,
        pageSize: 9
    });

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
        const req = searchRequest.value;

        if (req.regions && req.regions.length > 0) count++;
        if (req.categories && req.categories.length > 0) count++;
        if (req.minPoints && req.minPoints > 0) count++;
        if (req.maxPoints && req.maxPoints < 100) count++;
        if (req.hasOpenSlots) count++;
        if (req.newCourses) count++;
        if (req.favourites) count++;
        if (req.sortBy !== 'relevance') count++;

        return count;
    });

    // 判斷是否應用了篩選條件
    const isFiltersApplied = computed(() => appliedFiltersCount.value > 0);

    // 同步URL參數到搜索請求
    const syncParamsToFilters = () => {
        const params = route.query;
        searchRequest.value = {
            keyword: params.keyword as string || '',
            regions: params.regions ? String(params.regions).split(',').filter(code =>
                Object.values(RegionCode).some(r => r === code)
            ) : [],
            categories: params.categories ? String(params.categories).split(',').filter(code =>
                Object.values(SubCategory).includes(code as SubCategory) ||
                Object.values(MainCategory).includes(code as MainCategory)
            ) : [],
            minPoints: params.minPoints ? Number(params.minPoints) : 0,
            maxPoints: params.maxPoints ? Number(params.maxPoints) : 100,
            hasOpenSlots: params.hasOpenSlots === 'true',
            newCourses: params.newCourses === 'true',
            favourites: params.favourites === 'true',
            sortBy: params.sortBy as string || 'relevance',
            sortOrder: 'desc',
            pageNum: 1,
            pageSize: 9
        };
    };

    // 同步搜索請求到URL（debounced）
    const syncFiltersToParams = debounce(() => {
        const query: Record<string, string> = {};
        const req = searchRequest.value;

        if (req.keyword) query.keyword = req.keyword;
        if (req.regions && req.regions.length > 0) query.regions = req.regions.join(',');
        if (req.categories && req.categories.length > 0) query.categories = req.categories.join(',');
        if (req.minPoints && req.minPoints > 0) query.minPoints = req.minPoints.toString();
        if (req.maxPoints && req.maxPoints < 100) query.maxPoints = req.maxPoints.toString();
        if (req.hasOpenSlots) query.hasOpenSlots = 'true';
        if (req.newCourses) query.newCourses = 'true';
        if (req.favourites) query.favourites = 'true';
        if (req.sortBy !== 'relevance') query.sortBy = req.sortBy || '';
        // if (req.pageNum && req.pageNum > 1)  query.pageNum = req.pageNum.toString();

        router.replace({ query });
    }, 500);

    // 更新搜索參數的便捷方法
    const updateSearchRequest = (updates: Partial<SearchRequest>) => {
        Object.assign(searchRequest.value, updates);
        syncFiltersToParams();
    };

    // 重置篩選器
    const resetFilters = () => {
        const currentKeyword = searchRequest.value.keyword;

        searchRequest.value = {
            keyword: currentKeyword || '',
            regions: [],
            categories: [],
            minPoints: 0,
            maxPoints: 100,
            hasOpenSlots: false,
            newCourses: false,
            favourites: false,
            sortBy: 'relevance',
            sortOrder: 'desc',
            pageNum: 1,
            pageSize: 9
        };

        router.replace({
            query: currentKeyword ? { keyword: currentKeyword } : {}
        });

        toast.add({
            severity: 'info',
            summary: '篩選已重置',
            detail: '所有篩選條件已重置為默認值',
            life: 3000
        });
    };

    // 應用篩選器
    const applyFilters = (filteredCoursesCount: number) => {
        syncFiltersToParams();

        toast.add({
            severity: 'success',
            summary: '篩選已應用',
            detail: `已找到 ${filteredCoursesCount} 個符合條件的結果`,
            life: 3000
        });
    };

    // 設置搜索監聽器 - 返回一個debounced搜索函數
    const setupSearchWatcher = (searchFunction: () => Promise<void>) => {
        const debouncedSearch = debounce(searchFunction, 500);
        watch(searchRequest, () => {
            debouncedSearch();
        }, { deep: true, immediate: false });

        return debouncedSearch;
    };

    return {
        // 核心狀態
        searchRequest,

        // UI選項
        sortOptions,

        // 計算屬性
        appliedFiltersCount,
        isFiltersApplied,

        // 方法
        syncParamsToFilters,
        updateSearchRequest,
        applyFilters,
        resetFilters,
        setupSearchWatcher
    };
} 