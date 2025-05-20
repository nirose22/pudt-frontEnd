import type { PointsCard, PointTxn } from "@/types/point"
// import api from "@/utils/api"
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useUserStore } from "./userStore"
import { PointKind, PointRefType } from "@/enums/Point"
import { CardType } from "@/enums/Cards"
import type { Result } from "@/types"

/**
 * 點數管理 Store - 管理會員點數、點數歷史和課卡
 */
export const usePointsStore = defineStore('points', () => {
  const userStore = useUserStore()
  
  /* ---------- state ---------- */
  /** 點數歷史記錄 */
  const pointsHistory = ref<PointTxn[]>([])
  
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
  const fetchPointsHistory = async (): Promise<Result<PointTxn[]>> => {
    loading.value.history = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get('/points/history')
      
      // 模擬數據
      const data: PointTxn[] = [
        { id: 1, userId: 1, kind: PointKind.Deposit, amount: 100, balance: 100, refType: PointRefType.Order, refId: 1, note: '購買點數卡', createdAt: new Date()},
        { id: 2, userId: 1, kind: PointKind.Consume, amount: -10, balance: 90, refType: PointRefType.Booking, refId: 1, note: '預約課程', createdAt: new Date()},
        { id: 3, userId: 1, kind: PointKind.Reward, amount: 10, balance: 100, refType: PointRefType.Activity, refId: 1, note: '活動獎勵', createdAt: new Date()},
        { id: 4, userId: 1, kind: PointKind.Expire, amount: -10, balance: 90, refType: PointRefType.Activity, refId: 1, note: '活動獎勵', createdAt: new Date()},
        { id: 5, userId: 1, kind: PointKind.Deposit, amount: 100, balance: 100, refType: PointRefType.Order, refId: 1, note: '購買點數卡', createdAt: new Date()},
        { id: 6, userId: 1, kind: PointKind.Consume, amount: -10, balance: 90, refType: PointRefType.Booking, refId: 1, note: '預約課程', createdAt: new Date()},
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
  const addPointsHistory = (item: PointTxn) => {
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
