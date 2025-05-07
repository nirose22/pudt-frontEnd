import type { PointsCard, PointHistoryItem } from "@/types/pointItems"
// import api from "@/utils/api"
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useUserStore } from "./userStore"
import { PointType } from "@/enums/Point"
import { CardType, CardTypeLabel } from "@/enums/Cards"

export const usePointsStore = defineStore('usePoints', () => {
  const userStore = useUserStore()
  // --- state ---
  const points = ref(userStore.points)
  const pointsHistory = ref<PointHistoryItem[]>([])
  const pointsCards = ref<PointsCard[]>([])

  // --- getters ---
  // 目前點數：如果後端沒回來，就用 history 的最後一筆 balance
  const currentBalance = computed(() => {
    // 優先後端 profile 的 points，否則取最新 history
    return userStore.profile?.points
      ?? pointsHistory.value[0]?.balance
      ?? 0
  })

  const fetchPointsCards = async () => {
    // const { data } = await api.get<PointsPackage[]>('/points/packages')
    const data: PointsCard[] = [
      { id: 1, type: CardType.Basic, points: 10, price: 1000, description: '適合偶爾上課的學員' },
      { id: 2, type: CardType.Advanced, points: 20, price: 1800, description: '適合每週上課的學員', discount: '9折優惠' },
      { id: 3, type: CardType.Professional, points: 50, price: 4000, description: '適合頻繁上課的學員', discount: '8折優惠' },
      { id: 4, type: CardType.VIP, points: 100, price: 8000, description: '適合重度上課的學員', discount: '7折優惠' }
    ]
    pointsCards.value = data
  }

  // --- actions ---
  const fetchPointsHistory = async () => {
    // const { data } = await api.get<PointsHistoryItem[]>('/points/history')
    const data: PointHistoryItem[] = [
      { date: '2025-04-20', type: PointType.Points, description: '瑜珈初階班', points: -12, balance: 108 },
      { date: '2025-04-15', type: PointType.Points, description: '瑜珈冥想課', points: -8, balance: 120 },
      { date: '2025-04-01', type: PointType.Course, description: '進階課卡', points: 20, balance: 128 },
      { date: '2025-03-25', type: PointType.Points, description: '瑜珈進階班', points: -15, balance: 108 },
      { date: '2025-03-15', type: PointType.Course, description: '基本課卡', points: 10, balance: 123 },
      { date: '2025-03-05', type: PointType.System, description: '新會員禮', points: 3, balance: 113 }
    ]
    pointsHistory.value = data
  }



  const addPointsHistory = (item: PointHistoryItem) => {
    pointsHistory.value.unshift(item)
  }

  // 一次載入所有資料
  async function init() {
    await Promise.all([
      fetchPointsHistory(),
      fetchPointsCards(),
    ])
  }

  return {
    points,
    pointsHistory,
    pointsCards,
    currentBalance,
    fetchPointsHistory,
    addPointsHistory,
    init
  }

})
