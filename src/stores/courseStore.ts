import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { Booking } from '@/types/booking'
import { CourseService } from '@/services/CourseService'
import { useUserStore } from './userStore'

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

  /* ---------- actions ---------- */

  async function loadCourseDetail(courseId: number) {
    const detail = await CourseService.fetchCourseDetail(courseId)
    if (detail.success && detail.data) {
      state.currentCourse = detail.data
      state.courseSession = detail.data.sessions
    }
    return detail;
  }

  async function fetchFavoriteCourses(userId: number) {
    const list = await CourseService.getUserFavorites(userId)
    if (list.success && list.data) state.favoriteCourses = list.data
  }

  async function toggleFavoriteCourse(courseId: number) {
    const result = await CourseService.toggleFavorite(courseId);
    if (result.success) {
      // 更新本地收藏列表狀態
      const index = state.favoriteCourses.findIndex(c => c.id === courseId);
      if (index >= 0) {
        // 從收藏中移除
        state.favoriteCourses.splice(index, 1);
      } else if (state.currentCourse && state.currentCourse.id === courseId) {
        state.favoriteCourses.push(state.currentCourse);
      }

      // 更新當前課程的收藏狀態
      if (state.currentCourse && state.currentCourse.id === courseId) {
        state.currentCourse.isFavorite = index < 0;
      }
    }
    return result;
  }


  // async function createCourse(course: CourseDetailDTO) {
  //   const created = await CourseService.createCourse(course)
  //   if (created.success && created.data) state.allCourses.unshift(created.data)
  // }

  // async function updateCourse(courseId: number, course: CourseDetailDTO) {
  //   const updated = await CourseService.updateCourse(courseId, course)
  //   if (updated.success && updated.data) {
  //     const idx = state.allCourses.findIndex(c => c.id === courseId)
  //     if (idx !== -1) state.allCourses[idx] = updated.data
  //     if (state.currentCourse?.id === courseId) state.currentCourse = updated.data
  //   }
  // }

  function updateAvailableSeats(sessionId: number, change: number) {
    const slot = state.courseSession.find(s => s.id === sessionId)
    if (slot) {
      slot.seatsLeft = Math.max(0, Math.min(slot.seatsLeft + change, slot.seats))
      return true
    }
    return false
  }


  /* ---------- expose ---------- */
  return {
    ...toRefs(state),
    loadCourseDetail,
    fetchFavoriteCourses,
    toggleFavoriteCourse,
    updateAvailableSeats,
  }
})
