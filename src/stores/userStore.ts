import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Course, Result } from '@/types'
import { UserRole } from '@/enums/User';
import { calculateUserLevel, calculateNextLevelProgress } from '@/utils/userLevelUtils';
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
    /* ---------- state (auto‑persist) ---------- */
    const profile = ref<User | null>(null)
    const points = ref<number>(0)
    const favs = ref<Course[]>([])
    const interests = ref<string[]>([]) // 用户兴趣标签 (主分类)
    const completedCoursesCount = ref<number>(50) // 用戶已完成的課程總數，默認為50

    /* ---------- getters ---------- */
    const isLoggedIn = computed(() => !!profile.value)
    const displayName = computed(() => profile.value?.name ?? UserRole.Guest)
    // 获取用户ID
    const userId = computed(() => profile.value?.id)

    // 收藏课程列表 - 通过计算属性使其响应式
    const favoriteCourses = computed(() => favs.value)

    // 判断课程是否被收藏
    const isFavorite = (id: number) => favs.value.some(c => c.id === id)
    const userInterests = computed(() => interests.value)
    
    // 用戶等級相關計算
    const userLevel = computed(() => calculateUserLevel(completedCoursesCount.value))
    const levelProgress = computed(() => calculateNextLevelProgress(completedCoursesCount.value))

    /* ---------- actions ---------- */
    async function fetchProfile(id?: number) {
        const result = await userService.fetchProfile(id)
        if (result.success && result.data) {
            profile.value = result.data
            points.value = result.data.points ?? 0
        }
        // 取得完成課程數
        // const completed = await apiClient.get<{ completedCoursesCount: number }>(API_ROUTES.USER.COMPLETED_COURSES(id ?? 'me'))
        // completedCoursesCount.value = completed.completedCoursesCount ?? 0

        // 取得收藏
        // const favsData = await apiClient.get<Course[]>(API_ROUTES.COURSE.FAVORITES(id ?? 'me'))
        // favs.value = favsData

        // 取得興趣標籤
        // const interestsData = await apiClient.get<string[]>(API_ROUTES.USER.INTERESTS(id ?? 'me'))
        // interests.value = interestsData

        // 兼容本地 localStorage
        const savedInterests = localStorage.getItem('userInterests');
        if (savedInterests) {
            try {
                const parsedInterests = JSON.parse(savedInterests);
                if (Array.isArray(parsedInterests)) {
                    interests.value = parsedInterests;
                }
            } catch (e) {
                console.error('解析用户兴趣数据失败:', e);
            }
        }

        return result
    }

    async function fetchFavoriteCourses(): Promise<Result<Course[]>> {
        if (!isLoggedIn.value || !userId.value) {
            return { success: false, message: '用户未登录' }
        }
        const result = await userService.fetchFavoriteCourses(userId.value)
        if (result.success && result.data) {
            favs.value = result.data
        }
        return result
    }

    async function addFavorite(course: Course): Promise<Result<boolean>> {
        if (!isLoggedIn.value || !userId.value) {
            return { success: false, message: '请先登录再收藏课程' }
        }
        if (isFavorite(course.id)) {
            return { success: true, message: '该课程已在收藏中' }
        }
        const result = await userService.addFavorite(userId.value, course.id)
        if (result.success) {
            favs.value.push({ ...course })
        }
        return result
    }

    async function removeFavorite(id: number): Promise<Result<boolean>> {
        if (!isLoggedIn.value || !userId.value) {
            return { success: false, message: '请先登录' }
        }
        const result = await userService.removeFavorite(userId.value, id)
        if (result.success) {
            favs.value = favs.value.filter(c => c.id !== id)
        }
        return result
    }

    /**
     * 调整用户点数
     * @param amount 要调整的点数
     */
    function adjustPoints(amount: number) {
        if (!profile.value) return { success: false, message: '用户未登录' }
        points.value += amount
        // 可選：同步到後端
        // await apiClient.post(API_ROUTES.USER.ADJUST_POINTS(userId.value), { amount })
        return { success: true, message: '點數調整成功', data: points.value }
    }

    async function updateProfile(data: Partial<User>) {
        if (!profile.value || !userId.value) return { success: false, message: '用户未登录' }
        const result = await userService.updateProfile(userId.value, data)
        if (result.success && result.data) {
            profile.value = { ...profile.value, ...result.data }
        }
        return result
    }

    async function updateUserInterests(newInterests: string[]) {
        if (!profile.value || !userId.value) return { success: false, message: '用户未登录' }
        // 若有API則調用，否則只本地儲存
        // const result = await userService.updateUserInterests(userId.value, newInterests)
        interests.value = newInterests
        localStorage.setItem('userInterests', JSON.stringify(newInterests))
        return { success: true, message: '用户兴趣已更新' }
    }

    /**
     * 增加已完成課程數量
     * @param count 要增加的課程數量，默認為1
     */
    function increaseCompletedCourses(count: number = 1) {
        completedCoursesCount.value += count;
        // TODO: 同步到API
    }
    
    /**
     * 設定已完成課程數量
     * @param count 新的課程總數
     */
    function setCompletedCoursesCount(count: number) {
        completedCoursesCount.value = count;
        // TODO: 同步到API
    }

    return {
        profile,
        points,
        favs,
        interests,
        completedCoursesCount,
        isLoggedIn,
        displayName,
        userId,
        favoriteCourses,
        userInterests,
        userLevel,
        levelProgress,
        isFavorite,
        fetchProfile,
        fetchFavoriteCourses,
        addFavorite,
        removeFavorite,
        adjustPoints,
        increaseCompletedCourses,
        setCompletedCoursesCount,
        updateProfile,
        updateUserInterests
    }
}, {
    persist: {
        key: 'user',
        storage: sessionStorage,
        pick: ['profile', 'points', 'favs', 'interests'],
    }
})
