import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { User, Course, Result } from '@/types'
import { UserRole } from '@/enums/User'
import { calculateUserLevel, calculateNextLevelProgress } from '@/utils/userLevelUtils'
import { userService } from '@/services/userService'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES } from '@/utils/apiConfig'

interface State {
  profile: User | null
  points: number
  favs: Course[]
  interests: string[]
  completedCoursesCount: number
  error: string | null
}

/**
 * User Store
 * 1. 用 reactive 統一狀態
 * 2. withLoading 封裝 API 錯誤與狀態
 */
export const useUserStore = defineStore('user', () => {
  /* ---------- state ---------- */
  const state = reactive<State>({
    profile: null,
    points: 0,
    favs: [],
    interests: [],
    completedCoursesCount: 50,
    error: null
  })

  /* ---------- getters ---------- */
  const isLoggedIn = computed(() => !!state.profile)
  const displayName = computed(() => state.profile?.name ?? UserRole.Guest)
  const userId = computed(() => state.profile?.id)
  const favoriteCourses = computed(() => state.favs)
  const userInterests = computed(() => state.interests)
  const userLevel = computed(() => calculateUserLevel(state.completedCoursesCount))
  const levelProgress = computed(() => calculateNextLevelProgress(state.completedCoursesCount))
  const isFavorite = (id: number) => state.favs.some(c => c.id === id)

  /* ---------- utilities ---------- */
  async function withLoading<T>(fn: () => Promise<Result<T>>): Promise<T | undefined> {
    try {
      const res = await fn()
      if (!res.success) throw new Error(res.message || '操作失敗')
      return res.data
    } catch (e) {
      state.error = e instanceof Error ? e.message : ERROR_MESSAGES.USER_ERROR ?? '操作失敗'
      errorHandler.handleBusinessError(e, state.error)
      return undefined
    }
  }

  /* ---------- actions ---------- */
  async function fetchProfile(id?: number) {
    const data = await withLoading(() => userService.fetchProfile(id))
    if (data) {
      state.profile = data
      state.points = data.points ?? 0
    }
    // 讀取本地興趣 backup
    const cached = localStorage.getItem('userInterests')
    if (cached) {
      try {
        const arr = JSON.parse(cached)
        if (Array.isArray(arr)) state.interests = arr
      } catch {}
    }
  }

  async function fetchFavoriteCourses() {
    if (!userId.value) return
    const list = await withLoading(() => userService.fetchFavoriteCourses(userId.value!))
    if (list) state.favs = list
  }

  async function addFavorite(course: Course) {
    if (!userId.value) return
    if (isFavorite(course.id)) return
    const ok = await withLoading(() => userService.addFavorite(userId.value!, course.id))
    if (ok !== undefined) state.favs.push({ ...course })
  }

  async function removeFavorite(id: number) {
    if (!userId.value) return
    const ok = await withLoading(() => userService.removeFavorite(userId.value!, id))
    if (ok !== undefined) state.favs = state.favs.filter(c => c.id !== id)
  }

  function adjustPoints(amount: number) {
    if (!state.profile) return { success: false, message: '用户未登录' }
    state.points += amount
    return { success: true, data: state.points }
  }

  async function updateProfile(data: Partial<User>) {
    if (!userId.value) return
    const updated = await withLoading(() => userService.updateProfile(userId.value!, data))
    if (updated) state.profile = { ...state.profile!, ...updated }
  }

  function updateUserInterests(newInterests: string[]) {
    state.interests = newInterests
    localStorage.setItem('userInterests', JSON.stringify(newInterests))
  }

  function increaseCompletedCourses(count = 1) {
    state.completedCoursesCount += count
  }

  function setCompletedCoursesCount(count: number) {
    state.completedCoursesCount = count
  }

  /* ---------- expose ---------- */
  return {
    ...toRefs(state),
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
    pick: ['profile', 'points', 'favs', 'interests']
  }
})
 