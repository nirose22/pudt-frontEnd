import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { Booking } from '@/types/booking'
import { CourseService } from '@/services/CourseService'
import { useUserStore } from './userStore'

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
  const userStore = useUserStore();
  const userId = computed(() => userStore.userId);

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
  const recommendedCourses = computed(() => CourseService.getRecommendedCourses(userId.value, 6))
  const hasAvailableSeats = computed(() => !!state.selectedSession && state.selectedSession.seatsLeft > 0)

  /* ---------- actions ---------- */
  async function fetchCourses(keyword?: string, regions?: string[], categories?: string[]) {
    const data = await CourseService.getCourse(keyword, regions, categories)
    if (data.success && data.data) state.allCourses = data.data
  }

  async function loadCourseDetail(courseId: number) {
    const detail = await CourseService.fetchCourseDetail(courseId)
    console.log('loadCourseDetail', detail);
    if (detail.success && detail.data) {
      state.currentCourse = detail.data
      const sessions = await CourseService.getSessionsForCourse(courseId)
      if (sessions.success && sessions.data) state.courseSession = sessions.data
    }
    return detail;
  }

  async function fetchFavoriteCourses(userId: number) {
    const list = await CourseService.getUserFavorites(userId)
    if (list.success && list.data) state.favoriteCourses = list.data
  }

  async function addFavoriteCourse(courseId: number, userId: number) {
    const ok = await CourseService.addFavorite(userId, courseId)
    if (ok.success) {
      const course = state.allCourses.find(c => c.id === courseId)
      if (course && !state.favoriteCourses.some(c => c.id === courseId)) state.favoriteCourses.push(course)
    }
  }

  async function removeFavoriteCourse(courseId: number, userId: number) {
    const ok = await CourseService.removeFavorite(userId, courseId)
    if (ok.success) state.favoriteCourses = state.favoriteCourses.filter(c => c.id !== courseId)
  }

  function isFavorite(courseId: number) {
    return state.favoriteCourses.some(c => c.id === courseId)
  }

  async function createCourse(course: CourseDetailDTO) {
    const created = await CourseService.createCourse(course)
    if (created.success && created.data) state.allCourses.unshift(created.data)
  }

  async function updateCourse(courseId: number, course: CourseDetailDTO) {
    const updated = await CourseService.updateCourse(courseId, course)
    if (updated.success && updated.data) {
      const idx = state.allCourses.findIndex(c => c.id === courseId)
      if (idx !== -1) state.allCourses[idx] = updated.data
      if (state.currentCourse?.id === courseId) state.currentCourse = updated.data
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
