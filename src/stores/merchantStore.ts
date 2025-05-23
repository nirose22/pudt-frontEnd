// stores/merchantStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Merchant } from '@/types/merchant'
import type { Course } from '@/types'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES, API_ROUTES } from '@/utils/apiConfig'
import apiClient from '@/utils/api'

export const useMerchantStore = defineStore('merchant', () => {
  /* ---------- state ---------- */
  /** 商家基本資料 */
  const merchantInfo = ref<Merchant | null>(null)

  /** 商家課程清單 */
  const merchantCourses = ref<Course[]>([])

  /* ---------- actions ---------- */
  /**
   * 讀取商家資料
   * @param id 目標商家 id（預設讀取目前登入商家）
   */
  const fetchMerchant = async (id?: number) => {
    try {
      const data = await apiClient.get<Merchant>(API_ROUTES.MERCHANT.DETAIL(id ?? 'me'))
      merchantInfo.value = data
      return { success: true, merchant: data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
    }
  }

  /**
   * 更新商家資料
   */
  const updateMerchant = async (payload: Partial<Merchant>) => {
    if (!merchantInfo.value) {
      return errorHandler.handleBusinessError(null, '尚未載入商家資料')
    }
    try {
      const data = await apiClient.put<Merchant>(API_ROUTES.MERCHANT.DETAIL(merchantInfo.value.id), payload)
      merchantInfo.value = data
      return { success: true, merchant: data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
    }
  }

  /**
   * 讀取商家課程清單
   */
  const fetchMerchantCourses = async (merchantId?: number) => {
    try {
      const data = await apiClient.get<Course[]>(API_ROUTES.MERCHANT.COURSES(merchantId ?? 'me'))
      merchantCourses.value = data
      return { success: true, courses: data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
    }
  }

  /* ---------- export ---------- */
  return {
    merchantInfo,
    merchantCourses,
    fetchMerchant,
    updateMerchant,
    fetchMerchantCourses
  }
})