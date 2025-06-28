import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { Booking } from '@/types/booking'
import { CourseService } from '@/services/CourseService'
import { withLoading, clearError as clearStateError } from '@/utils/storeUtils'
import { debounce } from '@/utils/cmmonUtils'

interface State {
  myBookings: Booking[]
  favoriteCourses: Course[]
  currentCourse: CourseDetailDTO | null
  courseSession: CourseSession[]
  loading: boolean
  error: string | null
}

/**
 * Course Store
 * 1. 統一 withLoading 封裝 loading / error
 * 2. 專注狀態管理，資料請求全部委派 CourseService
 * 3. 優化狀態更新邏輯和錯誤處理
 */
export const useCourseStore = defineStore('course', () => {
  /* ---------- state ---------- */
  const state = reactive<State>({
    currentCourse: null,
    myBookings: [],
    favoriteCourses: [],
    courseSession: [],
    loading: false,
    error: null
  })

  /* ---------- computed ---------- */
  const isFavoriteCourse = computed(() => (courseId: number) => {
    return state.favoriteCourses.some(course => course.id === courseId)
  })

  const currentCourseIsFavorite = computed(() => {
    return state.currentCourse ? isFavoriteCourse.value(state.currentCourse.id) : false
  })

  /* ---------- helpers ---------- */
  
  /**
   * 清除錯誤狀態
   */
  function clearError() {
    clearStateError(state)
  }

  /* ---------- actions ---------- */

  async function loadCourseDetail(courseId: number) {
    return await withLoading(
      state,
      () => CourseService.fetchCourseDetail(courseId),
      (data: CourseDetailDTO) => {
        state.currentCourse = data
        state.courseSession = data.sessions
      },
      '載入課程詳情失敗'
    )
  }

  async function fetchFavoriteCourses(userId: number) {
    return await withLoading(
      state,
      () => CourseService.getUserFavorites(userId),
      (data: Course[]) => {
        state.favoriteCourses = data
      },
      '載入收藏課程失敗'
    )
  }

  async function toggleFavoriteCourse(courseId: number) {
    const isCurrentlyFavorite = isFavoriteCourse.value(courseId) || state.currentCourse?.isFavorite
    const result = await withLoading(
      state,
      () => isCurrentlyFavorite
        ? CourseService.removeFavorite(courseId)
        : CourseService.addFavorite(courseId),
      () => {
        updateFavoriteState(courseId, !isCurrentlyFavorite)
      },
      isCurrentlyFavorite ? '取消收藏失敗' : '添加收藏失敗'
    )
    return result
  }

  /**
   * 更新收藏狀態的輔助方法
   */
  function updateFavoriteState(courseId: number, isFavorite: boolean) {
    if (isFavorite) {
      // 添加到收藏
      if (state.currentCourse && state.currentCourse.id === courseId) {
        // 如果是當前課程，直接添加到收藏列表
        const existingIndex = state.favoriteCourses.findIndex(c => c.id === courseId)
        if (existingIndex === -1) {
          state.favoriteCourses.push({
            id: state.currentCourse.id,
            title: state.currentCourse.title,
            description: state.currentCourse.description,
            merchantId: state.currentCourse.merchant.id,
            coverUrl: state.currentCourse.coverUrl,
            region: state.currentCourse.region,
            createdAt: state.currentCourse.createdAt,
            points: state.currentCourse.points,
            mainCategory: state.currentCourse.mainCategory,
            subCategory: state.currentCourse.subCategory,
            joinCount: state.currentCourse.joinCount,
            recommended: state.currentCourse.recommended,
            status: state.currentCourse.status
          })
        }
      }
    } else {
      // 從收藏中移除
      const index = state.favoriteCourses.findIndex(c => c.id === courseId)
      if (index >= 0) {
        state.favoriteCourses.splice(index, 1)
      }
    }

    // 更新當前課程的收藏狀態
    if (state.currentCourse && state.currentCourse.id === courseId) {
      state.currentCourse.isFavorite = isFavorite
    }
  }

  /**
   * 更新座位數量
   */
  function updateAvailableSeats(sessionId: number, change: number): boolean {
    const session = state.courseSession.find(s => s.id === sessionId)
    if (!session) {
      console.warn(`Session with id ${sessionId} not found`)
      return false
    }

    const newSeatsLeft = session.seatsLeft + change
    const clampedSeats = Math.max(0, Math.min(newSeatsLeft, session.seats))
    
    session.seatsLeft = clampedSeats
    return true
  }

  /**
   * 重置 store 狀態
   */
  function resetState() {
    state.currentCourse = null
    state.myBookings = []
    state.favoriteCourses = []
    state.courseSession = []
    state.loading = false
    state.error = null
  }

  /* ---------- expose ---------- */
  return {
    // 狀態
    ...toRefs(state),
    
    // 計算屬性
    isFavoriteCourse,
    currentCourseIsFavorite,
    
    // 方法
    loadCourseDetail,
    fetchFavoriteCourses,
    toggleFavoriteCourse,
    updateAvailableSeats,
    clearError,
    resetState,
  }
})
