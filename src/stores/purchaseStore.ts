import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import api from '@/utils/api'  // 實際環境使用 API 呼叫
import { usePointsStore } from './pointsStore'
import type { Result } from "@/types"
import type { PurchaseItem, UnpaidItem } from '@/types/purchaseItem'
import { PurchaseStatus, PurchasePaymentMethod } from '@/enums/Purchase'
import { PointType } from '@/enums/Point'
import { useUserStore } from './userStore'
import { CardType } from '@/enums/Cards'
import type { PointHistoryItem, PointsCard } from '@/types/pointItems'
/**
 * 購買記錄 Store - 管理會員購買歷史和未付清項目
 */
export const usePurchaseStore = defineStore('purchase', () => {
  /* ---------- state ---------- */
  /** 購買歷史記錄 */
  const purchaseHistory = ref<PurchaseItem[]>([])

  /** 未付清項目 */
  const unpaidItems = ref<UnpaidItem[]>([])

  /** 載入狀態 */ 
  const loading = ref({
    history: false,
    unpaid: false
  })


  /* ---------- getters ---------- */
  /** 總消費金額 */
  const totalSpent = computed(() =>
    purchaseHistory.value
      .filter(item => item.status === PurchaseStatus.Paid)
      .reduce((sum, item) => sum + item.amount, 0)
  )

  /** 未付清總金額 */
  const totalUnpaid = computed(() =>
    unpaidItems.value.reduce((sum, item) => sum + item.amountDue, 0)
  )

  /** 購買點數總數 */
  const totalPointsPurchased = computed(() =>
    purchaseHistory.value
      .filter(item => item.status === PurchaseStatus.Paid && item.points > 0)
      .reduce((sum, item) => sum + item.points, 0)
  )

  /* ---------- actions ---------- */

  /**
   * 獲取購買歷史
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   */
  const fetchHistory = async (userId?: number): Promise<Result> => {
    loading.value.history = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get(`/users/${userId}/purchase-history`)

      // 模擬數據
      const data: PurchaseItem[] = [
        {
          id: 1,
          date: '2025-05-01',
          cardType: CardType.Advanced,
          amount: 1000,
          points: 10,
          status: PurchaseStatus.Paid,
          paymentMethod: PurchasePaymentMethod.CreditCard,
          invoiceNo: 'INV-001'
        },
        {
          id: 2,
          date: '2025-04-15',
          cardType: CardType.Advanced,
          amount: 1800,
          points: 20,
          status: PurchaseStatus.Paid,
          paymentMethod: PurchasePaymentMethod.CreditCard,
          invoiceNo: 'INV-002'
        },
        {
          id: 3,
          date: '2025-03-20',
          cardType: CardType.VIP,
          amount: 5000,
          points: 100,
          status: PurchaseStatus.Paid,
          paymentMethod: PurchasePaymentMethod.CreditCard,
          invoiceNo: 'INV-003'
        }
      ]
      purchaseHistory.value = data
      return { success: true, data }
    } catch (error) {
      console.error('獲取購買歷史失敗:', error)
      return { success: false, error }
    } finally {
      loading.value.history = false
    }
  }

  /**
   * 獲取未付清項目
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   */
  const fetchUnpaid = async (userId?: number): Promise<Result> => {
    loading.value.unpaid = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get(`/users/${userId || 'me'}/unpaid-items`)

      // 模擬數據
      const data: UnpaidItem[] = [
        {
          id: 1,
          date: '2025-03-20',
          itemName: '專業課程套裝',
          amount: 5000,
          amountPaid: 3000,
          amountDue: 2000,
          dueDate: '2025-06-20'
        },
        {
          id: 2,
          date: '2025-04-10',
          itemName: '私人課程預約',
          amount: 2500,
          amountPaid: 1000,
          amountDue: 1500,
          dueDate: '2025-05-10'
        }
      ]

      unpaidItems.value = data
      return { success: true, data }
    } catch (error) {
      console.error('獲取未付清項目失敗:', error)
      return { success: false, error }
    } finally {
      loading.value.unpaid = false
    }
  }

  /**
   * 支付未付清項目
   * @param itemId 項目ID
   * @param amount 支付金額
   */
  const payUnpaidItem = async (itemId: number, amount: number): Promise<Result> => {
    try {
      // 實際環境使用 API
      // await api.post(`/payments/unpaid/${itemId}`, { amount })

      // 更新本地數據
      const itemIndex = unpaidItems.value.findIndex(item => item.id === itemId)
      if (itemIndex >= 0) {
        const item = unpaidItems.value[itemIndex]

        // 更新已付金額和未付金額
        const newAmountPaid = item.amountPaid + amount
        const newAmountDue = Math.max(0, item.amount - newAmountPaid)

        // 更新項目
        unpaidItems.value[itemIndex] = {
          ...item,
          amountPaid: newAmountPaid,
          amountDue: newAmountDue
        }

        // 如果已全部付清，從未付清列表移除
        if (newAmountDue === 0) {
          unpaidItems.value.splice(itemIndex, 1)

          // 更新購買歷史狀態
          const historyItem = purchaseHistory.value.find(h => h.id === itemId)
          if (historyItem) {
            historyItem.status = PurchaseStatus.Paid
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('支付未付清項目失敗:', error)
      return { success: false, error }
    }
  }
  
  // 購買課卡
  // API 新增: /api/user/points-history
  const buyPointsCard = async (cardId: number): Promise<Result> => {
    const userStore = useUserStore()
    const pointsStore = usePointsStore()

    const selectedCard = pointsStore.pointsCards.find(pkg => pkg.id === cardId)
    if (!selectedCard) {
      return { success: false, message: '課卡不存在' }
    }
  
    // 向後端發送購買請求（如有）
    // const { data } = await api.post('/points/buy', { cardId })
  
    // 嘗試扣點
    const res = userStore.adjustPoints(selectedCard.points)
    if (!res.success) {
      return { success: false, message: '扣點失敗' }
    }
  
    const currentDate = new Date().toISOString().split('T')[0]
    const balance = res.data as number
  
    // 更新使用者 points（如果後端沒自動回傳 profile）
    userStore.updateProfile({ points: balance })
  
    // 加入點數歷史紀錄
    const newPointItem: PointHistoryItem = {
      date: currentDate,
      type: PointType.Course,
      description: selectedCard.type,
      points: selectedCard.points,
      balance
    }
    pointsStore.addPointsHistory(newPointItem)
  
    // 加入購買歷史紀錄
    const newPurchaseItem: PurchaseItem = {
      id: purchaseHistory.value.length + 1,
      date: currentDate,
      cardType: selectedCard.type,
      amount: selectedCard.price,
      points: selectedCard.points,
      status: PurchaseStatus.Paid,
      paymentMethod: PurchasePaymentMethod.CreditCard,
      invoiceNo: `INV-${purchaseHistory.value.length + 1}`
    }
    purchaseHistory.value.unshift(newPurchaseItem)
  
    return { success: true, message: '購買課卡成功' }
  }


  return {
    // state
    purchaseHistory,
    unpaidItems,
    loading,

    // getters
    totalSpent,
    totalUnpaid,
    totalPointsPurchased,

    // actions
    fetchHistory,
    fetchUnpaid,
    payUnpaidItem,
    buyPointsCard
  }
}) 