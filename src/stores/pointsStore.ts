import type { PointsCard, PointTxn } from "@/types/point"
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useUserStore } from "./userStore"
import type { Result } from "@/types"
import { pointService } from '@/services/pointService'

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
      const result = await pointService.fetchPointsCards()
      if (result.success && result.data) {
        pointsCards.value = result.data
      }
      return result
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
      const result = await pointService.fetchPointsHistory()
      if (result.success && result.data) {
        pointsHistory.value = result.data
      }
      return result
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
