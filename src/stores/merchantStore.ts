import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { Merchant, MerchantStats, Instructor, Course, Result } from '@/types'
import { MerchantService } from '@/services/MerchantService'
import { showSuccess, showError } from '@/utils/toastHelper'
import { withLoading, clearError as clearStateError } from '@/utils/storeUtils'

interface State {
  profile: Merchant | null
  stats: MerchantStats | null
  instructors: Instructor[]
  courses: Course[]
  loading: boolean
  error: string | null
}

/**
 * 商家 Store
 * 負責管理商家相關的狀態和操作
 */
export const useMerchantStore = defineStore('merchant', () => {
  const state = reactive<State>({
    profile: null,
    stats: null,
    instructors: [],
    courses: [],
    loading: false,
    error: null
  })

  const isVerified = computed(() => Boolean(state.profile?.email && state.profile?.phone))
  const hasCompleteProfile = computed(() => {
    const m = state.profile
    return !!(m && m.name && m.address && m.bizHours && m.category)
  })

  /**
   * 清除錯誤狀態
   */
  function clearError() {
    clearStateError(state)
  }

  /**
   * 重置 store 狀態
   */
  function resetState() {
    state.profile = null
    state.stats = null
    state.instructors = []
    state.courses = []
    state.loading = false
    state.error = null
  }


  async function fetchMerchant(id: number) {
    return await withLoading(
      state,
      () => MerchantService.fetchMerchant(id),
      (data: Merchant) => {
        state.profile = data
      },
      '無法加載商家資料'
    )
  }

  async function updateMerchant(payload: Partial<Merchant>) {
    if (!state.profile) {
      showError('尚未載入商家資料')
      return
    }
    
    const result = await withLoading(
      state,
      () => MerchantService.updateMerchant(state.profile!.id, payload),
      (data: Merchant) => {
        state.profile = data
        showSuccess('商家資料已更新')
      },
      '更新商家資料失敗'
    )
    
    return result
  }

  async function fetchMerchantCourses(id: number) {
    return await withLoading(
      state,
      () => MerchantService.fetchMerchantCourses(id),
      (data: Course[]) => {
        state.courses = data
      },
      '無法加載課程資料'
    )
  }

  async function fetchMerchantStats(id: number) {
    return await withLoading(
      state,
      () => MerchantService.fetchMerchantStats(id),
      (data: MerchantStats) => {
        state.stats = data
      },
      '無法加載統計資料'
    )
  }

  async function fetchInstructors(id: number) {
    return await withLoading(
      state,
      () => MerchantService.fetchInstructors(id),
      (data: Instructor[]) => {
        state.instructors = data
      },
      '無法加載講師資料'
    )
  }

  async function addInstructor(id: number, payload: Omit<Instructor, 'id' | 'merchantId'>) {
    const result = await withLoading(
      state,
      () => MerchantService.addInstructor(id, payload),
      (data: Instructor) => {
        state.instructors.push(data)
        showSuccess('講師已新增')
      },
      '新增講師失敗'
    )
    
    return result
  }

  async function updateInstructor(id: number, instructorId: number, payload: Partial<Instructor>) {
    const result = await withLoading(
      state,
      () => MerchantService.updateInstructor(id, instructorId, payload),
      (data: Instructor) => {
        const idx = state.instructors.findIndex(i => i.id === instructorId)
        if (idx !== -1) {
          state.instructors[idx] = data
          showSuccess('講師資料已更新')
        }
      },
      '更新講師資料失敗'
    )
    
    return result
  }

  async function deleteInstructor(id: number, instructorId: number) {
    const result = await withLoading(
      state,
      () => MerchantService.deleteInstructor(id, instructorId),
      () => {
        state.instructors = state.instructors.filter(i => i.id !== instructorId)
        showSuccess('講師已刪除')
      },
      '刪除講師失敗'
    )
    
    return result
  }

  return {
    // 狀態
    ...toRefs(state),
    
    // 計算屬性
    isVerified,
    hasCompleteProfile,
    
    // 方法
    fetchMerchant,
    updateMerchant,
    fetchMerchantCourses,
    fetchMerchantStats,
    fetchInstructors,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    clearError,
    resetState
  }
})
