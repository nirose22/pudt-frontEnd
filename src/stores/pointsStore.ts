import type { PointsCard, PointHistoryItem } from "@/types/pointItems"
// import api from "@/utils/api"
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useUserStore } from "./userStore"
import { PointType } from "@/enums/Point"
import { CardType } from "@/enums/Cards"
import type { Result } from "@/types"

/**
 * 點數管理 Store - 管理會員點數、點數歷史和課卡
 */
export const usePointsStore = defineStore('points', () => {
  const userStore = useUserStore()
  
  /* ---------- state ---------- */
  /** 點數歷史記錄 */
  const pointsHistory = ref<PointHistoryItem[]>([])
  
  /** 可購買的課卡 */
  const pointsCards = ref<PointsCard[]>([])
  
  /** 載入狀態 */
  const loading = ref({
    history: false,
    cards: false
  })

  /* ---------- getters ---------- */
  /** 目前點數餘額 */
  const currentBalance = computed(() => {
    // 優先使用後端 profile 的 points，否則取最新 history
    return userStore.profile?.points 
      ?? pointsHistory.value[0]?.balance 
      ?? 0
  })

  /* ---------- actions ---------- */
  /**
   * 獲取可購買的課卡
   */
  const fetchPointsCards = async (): Promise<Result<PointsCard[]>> => {
    loading.value.cards = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get('/points/packages')
      
      // 模擬數據
      const data: PointsCard[] = [
        { id: 1, type: CardType.Basic, points: 10, price: 1000, description: '適合偶爾上課的學員' },
        { id: 2, type: CardType.Advanced, points: 20, price: 1800, description: '適合每週上課的學員', discount: '9折優惠' },
        { id: 3, type: CardType.Professional, points: 50, price: 4000, description: '適合頻繁上課的學員', discount: '8折優惠' },
        { id: 4, type: CardType.VIP, points: 100, price: 8000, description: '適合重度上課的學員', discount: '7折優惠' }
      ]
      
      pointsCards.value = data
      return { success: true, data }
    } catch (error) {
      console.error('獲取課卡信息失敗:', error)
      return { success: false, error }
    } finally {
      loading.value.cards = false
    }
  }

  /**
   * 獲取點數歷史記錄
   */
  const fetchPointsHistory = async (): Promise<Result<PointHistoryItem[]>> => {
    loading.value.history = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get('/points/history')
      
      // 模擬數據
      const data: PointHistoryItem[] = [
        { date: '2025-04-20', type: PointType.Points, description: '瑜珈初階班', points: -12, balance: 108 },
        { date: '2025-04-15', type: PointType.Points, description: '瑜珈冥想課', points: -8, balance: 120 },
        { date: '2025-04-01', type: PointType.Course, description: '進階課卡', points: 20, balance: 128 },
        { date: '2025-03-25', type: PointType.Points, description: '瑜珈進階班', points: -15, balance: 108 },
        { date: '2025-03-15', type: PointType.Course, description: '基本課卡', points: 10, balance: 123 },
        { date: '2025-03-05', type: PointType.System, description: '新會員禮', points: 3, balance: 113 }
      ]
      
      pointsHistory.value = data
      return { success: true, data }
    } catch (error) {
      console.error('獲取點數歷史失敗:', error)
      return { success: false, error }
    } finally {
      loading.value.history = false
    }
  }

  /**
   * 添加點數歷史記錄
   * @param item 點數歷史項目
   */
  const addPointsHistory = (item: PointHistoryItem) => {
    pointsHistory.value.unshift(item)
  }

  /**
   * 初始化點數數據
   */
  const init = async () => {
    await Promise.all([
      fetchPointsHistory(),
      fetchPointsCards()
    ])
  }

  return {
    // state
    pointsHistory,
    pointsCards,
    loading,
    
    // getters
    currentBalance,
    
    // actions
    fetchPointsHistory,
    fetchPointsCards,
    addPointsHistory,
    init
  }
})
