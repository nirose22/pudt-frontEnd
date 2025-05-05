// stores/merchantStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'                                 // ⬅️ 真實專案請使用實際 API
import type { Merchant, MerchantCourse } from '@/types/merchant'

export const useMerchantStore = defineStore('merchant', () => {
  /* ---------- state ---------- */
  /** 商家基本資料 */
  const merchantInfo = ref<Merchant | null>(null)

  /** 商家課程清單 */
  const merchantCourses = ref<MerchantCourse[]>([])

  /* ---------- actions ---------- */
  /**
   * 讀取商家資料
   * @param id 目標商家 id（預設讀取目前登入商家）
   */
  const fetchMerchant = async (id?: number) => {
    try {
      // 真實情境：const { data } = await axios.get(`/api/merchants/${id ?? 'me'}`)
      // merchantInfo.value = data
      // ---- 以下為模擬資料 ----
      merchantInfo.value = {
        id: id ?? 1,
        name: '和平瑜珈中心',
        email: 'info@peaceyoga.com',
        phone: '02-2345-6789',
        address: '台北市信義區和平東路一段100號',
        description: '專業瑜珈教室，提供多種瑜珈課程',
        businessHours: '週一至週五 9:00-21:00，週六至週日 10:00-18:00',
        type: '瑜珈',
        rating: 4.8,
        reviewCount: 24,
        website: 'https://example.com',
        isVerified: true,
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
      // 真實情境：const { data } = await axios.get(`/api/merchants/${merchantId ?? 'me'}/courses`)
      // merchantCourses.value = data
      // ---- 以下為模擬資料 ----
      merchantCourses.value = [
        {
          id: 1,
          merchantId: merchantId ?? 1,
          title: '初階瑜珈',
          description: '適合初學者的瑜珈課程',
          price: 1200,
          pointsRequired: 12,
          availableSlots: 10,
          totalSlots: 20,
          schedule: [],
          status: 'active',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-04-01')
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