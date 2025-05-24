import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { Merchant, MerchantStats, Instructor, Course, Result } from '@/types'
import { MerchantService } from '@/services/MerchantService'
import { showSuccess, showError } from '@/utils/toastHelper'

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

  async function withLoading<T>(fn: () => Promise<Result<T>>, fallbackMsg: string): Promise<T | undefined> {
    state.loading = true
    state.error = null
    try {
      const res = await fn()
      if (!res.success) {
        throw new Error(res.message || fallbackMsg)
      }
      return res.data
    } catch (e) {
      const msg = e instanceof Error ? e.message : fallbackMsg
      state.error = msg
      showError(msg)
      return undefined
    } finally {
      state.loading = false
    }
  }

  const normalizeId = (id?: number | 'me') => id ?? 'me'

  async function fetchMerchant(id?: number | 'me') {
    const data = await withLoading(() => MerchantService.fetchMerchant(normalizeId(id)), '無法加載商家資料')
    if (data) state.profile = data as Merchant
  }

  async function updateMerchant(payload: Partial<Merchant>) {
    if (!state.profile) {
      showError('尚未載入商家資料')
      return
    }
    const updated = await withLoading(() => MerchantService.updateMerchant(state.profile!.id, payload), '更新商家資料失敗')
    if (updated) {
      state.profile = updated as Merchant
      showSuccess('商家資料已更新')
    }
  }

  async function fetchMerchantCourses(id?: number | 'me') {
    const list = await withLoading(() => MerchantService.fetchMerchantCourses(normalizeId(id)), '無法加載課程資料')
    if (list) state.courses = list as Course[]
  }

  async function fetchMerchantStats(id: number | 'me') {
    const s = await withLoading(() => MerchantService.fetchMerchantStats(normalizeId(id)), '無法加載統計資料')
    if (s) state.stats = s as MerchantStats
  }

  async function fetchInstructors(id: number | 'me') {
    const list = await withLoading(() => MerchantService.fetchInstructors(normalizeId(id)), '無法加載講師資料')
    if (list) state.instructors = list as Instructor[]
  }

  async function addInstructor(id: number | 'me', payload: Omit<Instructor, 'id' | 'merchantId'>) {
    const instructor = await withLoading(() => MerchantService.addInstructor(normalizeId(id), payload), '新增講師失敗')
    if (instructor) {
      state.instructors.push(instructor as Instructor)
      showSuccess('講師已新增')
    }
  }

  async function updateInstructor(id: number | 'me', instructorId: number, payload: Partial<Instructor>) {
    const updated = await withLoading(() => MerchantService.updateInstructor(normalizeId(id), instructorId, payload), '更新講師資料失敗')
    if (updated) {
      const idx = state.instructors.findIndex(i => i.id === instructorId)
      if (idx !== -1) state.instructors[idx] = updated as Instructor
      showSuccess('講師資料已更新')
    }
  }

  async function deleteInstructor(id: number | 'me', instructorId: number) {
    const ok = await withLoading(() => MerchantService.deleteInstructor(normalizeId(id), instructorId), '刪除講師失敗')
    if (ok !== undefined) {
      state.instructors = state.instructors.filter(i => i.id !== instructorId)
      showSuccess('講師已刪除')
    }
  }

  return {
    ...toRefs(state),
    isVerified,
    hasCompleteProfile,
    fetchMerchant,
    updateMerchant,
    fetchMerchantCourses,
    fetchMerchantStats,
    fetchInstructors,
    addInstructor,
    updateInstructor,
    deleteInstructor
  }
})
