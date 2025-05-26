import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { Booking } from '@/types/booking'
import type { Result } from '@/types'
import { CourseService } from '@/services/CourseService'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES } from '@/utils/apiConfig'

interface State {
  allCourses: Course[]
  myBookings: Booking[]
  favoriteCourses: Course[]
  currentCourse: CourseDetailDTO | null
  courseSession: CourseSession[]
  selectedSession: CourseSession | null
  loading: boolean
  error: string | null
}

/**
 * Course Store
 * 1. 統一 withLoading 封裝 loading / error
 * 2. 專注狀態管理，資料請求全部委派 CourseService
 */
export const useCourseStore = defineStore('course', () => {
  /* ---------- state ---------- */
  const state = reactive<State>({
    currentCourse: null,
    allCourses: [],
    myBookings: [],
    favoriteCourses: [],
    courseSession: [],
    selectedSession: null,
    loading: false,
    error: null
  })

  /* ---------- getters ---------- */
  const popularCourses = computed(() =>
    [...state.allCourses].sort((a, b) => (b.joinCount || 0) - (a.joinCount || 0)).slice(0, 6)
  )
  const latestCourses = computed(() =>
    [...state.allCourses]
      .sort((a, b) => {
        const ad = a.createdAt?.getTime() || 0
        const bd = b.createdAt?.getTime() || 0
        return bd - ad
      })
      .slice(0, 6)
  )
  const recommendedCourses = computed(() => state.allCourses.filter(c => c.recommended).slice(0, 6))
  const hasAvailableSeats = computed(() => !!state.selectedSession && state.selectedSession.seatsLeft > 0)

  /* ---------- utilities ---------- */
  async function withLoading<T>(fn: () => Promise<Result<T>>): Promise<T | undefined> {
    state.loading = true
    state.error = null
    try {
      const res = await fn()
      if (!res.success) throw new Error(res.message || '操作失敗')
      return res.data
    } catch (e) {
      state.error = e instanceof Error ? e.message : ERROR_MESSAGES.COURSE_ERROR
      errorHandler.handleBusinessError(e, state.error)
      return undefined
    } finally {
      state.loading = false
    }
  }

  /* ---------- actions ---------- */
  async function fetchCourses(keyword?: string, regions?: string[], categories?: string[]) {
    const data = await withLoading(() => CourseService.getCourse(keyword, regions, categories))
    if (data) state.allCourses = data
  }

  async function loadCourseDetail(courseId: number) {
    const detail = await withLoading(() => CourseService.fetchCourseDetail(courseId))
    if (detail) {
      state.currentCourse = detail
      const sessions = await withLoading(() => CourseService.getSessionsForCourse(courseId))
      if (sessions) state.courseSession = sessions
    }
  }

  async function fetchFavoriteCourses(userId: number) {
    const list = await withLoading(() => CourseService.getUserFavorites(userId))
    if (list) state.favoriteCourses = list
  }

  async function addFavoriteCourse(courseId: number, userId: number) {
    const ok = await withLoading(() => CourseService.addFavorite(userId, courseId))
    if (ok !== undefined) {
      const course = state.allCourses.find(c => c.id === courseId)
      if (course && !state.favoriteCourses.some(c => c.id === courseId)) state.favoriteCourses.push(course)
    }
  }

  async function removeFavoriteCourse(courseId: number, userId: number) {
    const ok = await withLoading(() => CourseService.removeFavorite(userId, courseId))
    if (ok !== undefined) state.favoriteCourses = state.favoriteCourses.filter(c => c.id !== courseId)
  }

  function isFavorite(courseId: number) {
    return state.favoriteCourses.some(c => c.id === courseId)
  }

  async function createCourse(course: CourseDetailDTO) {
    const created = await withLoading(() => CourseService.createCourse(course))
    if (created) state.allCourses.unshift(created)
  }

  async function updateCourse(courseId: number, course: CourseDetailDTO) {
    const updated = await withLoading(() => CourseService.updateCourse(courseId, course))
    if (updated) {
      const idx = state.allCourses.findIndex(c => c.id === courseId)
      if (idx !== -1) state.allCourses[idx] = updated
      if (state.currentCourse?.id === courseId) state.currentCourse = updated
    }
  }

  function updateAvailableSeats(sessionId: number, change: number) {
    const slot = state.courseSession.find(s => s.id === sessionId)
    if (slot) {
      slot.seatsLeft = Math.max(0, Math.min(slot.seatsLeft + change, slot.seats))
      return true
    }
    return false
  }

  function getSessionById(sessionId: number) {
    return state.courseSession.find(s => s.id === sessionId) || null
  }

  function selectSession(sessionId: number) {
    const slot = getSessionById(sessionId)
    if (slot) {
      state.selectedSession = slot
      return true
    }
    return false
  }

  /* ---------- expose ---------- */
  return {
    ...toRefs(state),
    popularCourses,
    latestCourses,
    recommendedCourses,
    hasAvailableSeats,
    fetchCourses,
    loadCourseDetail,
    fetchFavoriteCourses,
    addFavoriteCourse,
    removeFavoriteCourse,
    isFavorite,
    createCourse,
    updateCourse,
    updateAvailableSeats,
    getSessionById,
    selectSession
  }
})
