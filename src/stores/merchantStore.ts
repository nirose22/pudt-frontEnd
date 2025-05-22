// stores/merchantStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Merchant } from '@/types/merchant'
import type { Course } from '@/types'
import { MainCategory, SubCategory } from '@/enums/CourseCategory'
import { CourseStatus } from '@/enums/Course'

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
    // TODO: 從後端API取得商家資料
    try {
      // 真實情境：const { data } = await axios.get(`/api/merchants/${id ?? 'me'}`)
      // ---- 以下為模擬資料 ----
      merchantInfo.value = {
        id: id ?? 1,
        name: '和平瑜珈中心',
        email: 'info@peaceyoga.com',
        phone: '02-2345-6789',
        address: '台北市信義區和平東路一段100號',
        description: '專業瑜珈教室，提供多種瑜珈課程',
        bizHours: '週一至週五 9:00-21:00，週六至週日 10:00-18:00',
        category: MainCategory.SportsFitness,
        rating: 4.8,
        reviewCount: 24,
        website: 'https://example.com',
        createdAt: new Date('2023-01-01')
      }
      return { success: true, merchant: merchantInfo.value }
    } catch (error) {
      console.error('fetchMerchant 失敗：', error)
      return { success: false, error }
    }
  }

  /**
   * 更新商家資料
   */
  const updateMerchant = async (payload: Partial<Merchant>) => {
    if (!merchantInfo.value) {
      return { success: false, reason: '尚未載入商家資料' }
    }
    try {
      // 真實情境：await axios.put(`/api/merchants/${merchantInfo.value.id}`, payload)
      merchantInfo.value = { ...merchantInfo.value, ...payload }
      return { success: true, merchant: merchantInfo.value }
    } catch (error) {
      console.error('updateMerchant 失敗：', error)
      return { success: false, error }
    }
  }

  /**
   * 讀取商家課程清單
   */
  const fetchMerchantCourses = async (merchantId?: number) => {
    try {
      // TODO: 從後端API取得課程清單
      // 真實情境：const { data } = await axios.get(`/api/merchants/${merchantId ?? 'me'}/courses`)
      // merchantCourses.value = data
      // ---- 以下為模擬資料 ----
      merchantCourses.value = [
        {
          id: 1,
          merchantId: merchantId ?? 1,
          title: '初階瑜珈',
          description: '適合初學者的瑜珈課程',
          points: 12,
          joinCount: 10,
          status: CourseStatus.ACTIVE,
          createdAt: new Date('2023-01-01'),
          categories: [SubCategory.GroundYoga]
        }
      ]
      return { success: true, courses: merchantCourses.value }
    } catch (error) {
      console.error('fetchMerchantCourses 失敗：', error)
      return { success: false, error }
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