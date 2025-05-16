import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import api from '@/utils/api'  // 實際環境使用 API 呼叫
import { usePointsStore } from './pointsStore'
import type { Result } from "@/types"
import type { PurchaseItem, UnpaidItem } from '@/types/purchaseItem'
import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus'
import { PointType } from '@/enums/Point'
import { useUserStore } from './userStore'
import { CardType } from '@/enums/Cards'
import type { PointHistoryItem } from '@/types/pointItems'

/**
 * 購買記錄 Store - 管理會員購買歷史和未付清項目
 */
export const usePurchaseStore = defineStore('purchase', () => {
  const userStore = useUserStore()
  const pointsStore = usePointsStore()

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
      .filter(item => item.status === OrderStatus.Paid)
      .reduce((sum, item) => sum + item.amount, 0)
  )

  /** 購買點數總數 */
  const totalPointsPurchased = computed(() =>
    purchaseHistory.value
      .filter(item => item.status === OrderStatus.Paid && item.points > 0)
      .reduce((sum, item) => sum + item.points, 0)
  )

  /* ---------- actions ---------- */

  /**
   * 獲取購買歷史
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   */
  const fetchHistory = async (userId?: number): Promise<Result<PurchaseItem[]>> => {
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
          status: OrderStatus.Paid,
          paymentMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-001'
        },
        {
          id: 2,
          date: '2025-04-15',
          cardType: CardType.Advanced,
          amount: 1800,
          points: 20,
          status: OrderStatus.Pending,
          paymentMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-002'
        },
        {
          id: 3,
          date: '2025-03-20',
          cardType: CardType.VIP,
          amount: 5000,
          points: 100,
          status: OrderStatus.Paid,
          paymentMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-003'
        },
        {
          id: 4,
          date: '2025-02-10',
          cardType: CardType.VIP,
          amount: 2000,
          points: 50,
          status: OrderStatus.Pending,
          paymentMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-004'
        },
        {
          id: 5,
          date: '2025-01-01',
          cardType: CardType.VIP,
          amount: 1000,
          points: 10,
          status: OrderStatus.Paid,
          paymentMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-005'
        },
        {
          id: 6,
          date: '2025-01-01',
          cardType: CardType.VIP,
          amount: 1000,
          points: 10,
          status: OrderStatus.Cancelled,
          paymentMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-006'
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
   * 獲取狀態
   * @param s 狀態
   */
  const byStatus = (s: OrderStatus) => purchaseHistory.value.filter(b => b.status === s);

  /**
   * 獲取未付清項目
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   */
  const fetchUnpaid = async (userId?: number): Promise<Result<UnpaidItem[]>> => {
    loading.value.unpaid = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get(`/users/${userId || 'me'}/unpaid-items`)

      // 模擬數據
      const data: UnpaidItem[] = [
        {
          id: 1,
          date: '2025-03-20',
          cardType: CardType.Professional,
          amount: 5000,
          dueDate: '2025-06-20'
        },
        {
          id: 2,
          date: '2025-04-10',
          cardType: CardType.Professional,
          amount: 2500,
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
  const payUnpaidItem = async (itemId: number, amount: number): Promise<Result<void>> => {
    try {
      // 實際環境使用 API
      // await api.post(`/payments/unpaid/${itemId}`, { amount })

      // 更新本地數據
      const itemIndex = unpaidItems.value.findIndex(item => item.id === itemId)
      if (itemIndex >= 0) {
        const item = unpaidItems.value[itemIndex]

        // 更新已付金額和未付金額
        const newAmountPaid = item.amount + amount
        const newAmountDue = Math.max(0, item.amount - newAmountPaid)

        // 更新項目
        unpaidItems.value[itemIndex] = {
          ...item,
          amount: newAmountPaid,
        }

        // 如果已全部付清，從未付清列表移除
        if (newAmountDue === 0) {
          unpaidItems.value.splice(itemIndex, 1)

          // 更新購買歷史狀態
          const historyItem = purchaseHistory.value.find(h => h.id === itemId)
          if (historyItem) {
            historyItem.status = OrderStatus.Paid
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('支付未付清項目失敗:', error)
      return { success: false, error }
    }
  }
  
  /**
   * 購買課卡
   * @param cardId 課卡ID
   * @returns 購買結果
   */
  const buyPointsCard = async (cardId: number): Promise<Result<void>> => {
    try {
      const selectedCard = pointsStore.pointsCards.find(pkg => pkg.id === cardId)
      if (!selectedCard) {
        return { success: false, message: '課卡不存在' }
      }
    
      // 向後端發送購買請求（實際環境使用）
      // const response = await api.post('/points/buy', { cardId })
      
      // 在前端模擬處理
      const currentDate = new Date().toISOString().split('T')[0]
      
      // 嘗試更新使用者點數（假設Points是購買的點數）
      const adjustResult = userStore.adjustPoints(selectedCard.points)
      if (!adjustResult.success) {
        return { success: false, message: adjustResult.message || '點數調整失敗' }
      }
      
      const newBalance = adjustResult.data as number
    
      // 建立點數歷史記錄
      const pointHistoryItem: PointHistoryItem = {
        date: currentDate,
        type: PointType.Course,
        description: selectedCard.type,
        points: selectedCard.points,
        balance: newBalance
      }
      
      // 新增到點數歷史
      pointsStore.addPointsHistory(pointHistoryItem)
    
      // 建立購買記錄
      const purchaseItem: PurchaseItem = {
        id: Date.now(), // 臨時ID，實際應由後端生成
        date: currentDate,
        cardType: selectedCard.type,
        amount: selectedCard.price,
        points: selectedCard.points,
        status: OrderStatus.Paid,
        paymentMethod: PaymentMethod.CreditCard,
        invoiceNo: `INV-${Date.now().toString().slice(-6)}` // 臨時發票號，實際應由後端生成
      }
      
      // 新增到購買歷史
      purchaseHistory.value.unshift(purchaseItem)
    
      return { success: true, message: '購買課卡成功' }
    } catch (error) {
      console.error('購買課卡失敗:', error)
      return { success: false, message: '購買過程中發生錯誤', error }
    }
  }

  /**
   * 初始化購買記錄數據
   */
  const init = async () => {
    await Promise.all([
      fetchHistory(),
      fetchUnpaid()
    ])
  }

  return {
    // state
    purchaseHistory,
    unpaidItems,
    loading,

    // getters
    totalSpent,
    totalPointsPurchased,

    // actions
    fetchHistory,
    byStatus,
    fetchUnpaid,
    payUnpaidItem,
    buyPointsCard,
    init
  }
}) 