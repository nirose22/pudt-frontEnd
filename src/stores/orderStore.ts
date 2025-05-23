import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import api from '@/utils/api'  // 實際環境使用 API 呼叫
import { usePointsStore } from './pointsStore'
import type { Result } from "@/types"
import type { Order, OrderItem } from "@/types/order"
import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus'
import { PointKind, PointRefType  } from '@/enums/Point'
import { useUserStore } from './userStore'
import { CardType } from '@/enums/Cards'
import type { PointTxn } from '@/types/point'
import type { UnpaidItem } from '@/types/purchase'


/**
 * 購買記錄 Store - 管理會員購買歷史和未付清項目
 */
export const usePurchaseStore = defineStore('purchase', () => {
  const userStore = useUserStore()
  const pointsStore = usePointsStore()

  /* ---------- state ---------- */
  /** 購買歷史記錄 */
  const OrderHistory = ref<Order[]>([])

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
    OrderHistory.value
      .filter(item => item.status === OrderStatus.Paid)
      .reduce((sum, item) => sum + item.total, 0)
  )

  /** 購買點數總數 - 需要額外處理，因為Order中沒有points屬性 */
  const totalOrderd = computed(() => {
    // 這裡需要從Order中獲取點數信息，可能需要從OrderItem中計算
    // 臨時方案，返回0
    return 0;
  })

  /* ---------- actions ---------- */

  /**
   * 獲取購買歷史
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   */
  const fetchHistory = async (userId?: number): Promise<Result<Order[]>> => {
    loading.value.history = true
    try {
      // TODO: 實際環境使用 API
      // const { data } = await api.get(`/users/${userId}/purchase-history`)

      // 模擬數據 - 調整為符合Order接口的數據
      const data: Order[] = [
        {
          id: 1,
          userId: userId || 1,
          sn: 'ORD-001',
          total: 1000,
          status: OrderStatus.Paid,
          payMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-001',
          createdAt: new Date('2025-05-01')
        },
        {
          id: 2,
          userId: userId || 1,
          sn: 'ORD-002',
          total: 1800,
          status: OrderStatus.Pending,
          payMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-002',
          createdAt: new Date('2025-04-15')
        },
        {
          id: 3,
          userId: userId || 1,
          sn: 'ORD-003',
          total: 5000,
          status: OrderStatus.Paid,
          payMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-003',
          createdAt: new Date('2025-03-20')
        },
        {
          id: 4,
          userId: userId || 1,
          sn: 'ORD-004',
          total: 2000,
          status: OrderStatus.Pending,
          payMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-004',
          createdAt: new Date('2025-02-10')
        },
        {
          id: 5,
          userId: userId || 1,
          sn: 'ORD-005',
          total: 1000,
          status: OrderStatus.Paid,
          payMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-005',
          createdAt: new Date('2025-01-01')
        },
        {
          id: 6,
          userId: userId || 1,
          sn: 'ORD-006',
          total: 1000,
          status: OrderStatus.Cancelled,
          payMethod: PaymentMethod.CreditCard,
          invoiceNo: 'INV-006',
          createdAt: new Date('2025-01-01')
        }
      ]
      OrderHistory.value = data
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
  const byStatus = (s: OrderStatus) => OrderHistory.value.filter(b => b.status === s);

  /**
   * 獲取未付清項目
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   */
  const fetchUnpaid = async (userId?: number): Promise<Result<UnpaidItem[]>> => {
    loading.value.unpaid = true
    try {
      // TODO: 實際環境使用 API
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
          const historyItem = OrderHistory.value.find(h => h.id === itemId)
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
      const currentDate = new Date()
      
      // 嘗試更新使用者點數（假設Points是購買的點數）
      const adjustResult = userStore.adjustPoints(selectedCard.points)
      if (!adjustResult.success) {
        return { success: false, message: adjustResult.message || '點數調整失敗' }
      }
      const newBalance = adjustResult.data 
    
      // 建立點數歷史記錄
      const pointHistoryItem: PointTxn = {
        id: Date.now(),
        userId: userStore.profile?.id ?? 0,
        kind: PointKind.Deposit,
        amount: selectedCard.points,
        balance: newBalance,
        refType: PointRefType.Order,
        refId: Date.now(),
        createdAt: new Date(),
      }
      
      // 新增到點數歷史
      pointsStore.addPointsHistory(pointHistoryItem)
    
      // 建立購買記錄並符合Order介面
      const purchaseItem: Order = {
        id: Date.now(), // 臨時ID，實際應由後端生成
        userId: userStore.profile?.id ?? 0,
        sn: `ORD-${Date.now().toString().slice(-6)}`,
        total: selectedCard.price,
        status: OrderStatus.Paid,
        payMethod: PaymentMethod.CreditCard,
        createdAt: currentDate,
        invoiceNo: `INV-${Date.now().toString().slice(-6)}` // 臨時發票號，實際應由後端生成
      }
      
      // 新增到購買歷史
      OrderHistory.value.unshift(purchaseItem)
    
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
    purchaseHistory: OrderHistory,
    unpaidItems,
    loading,

    // getters
    totalSpent,
    totalOrderd,

    // actions
    fetchHistory,
    byStatus,
    fetchUnpaid,
    payUnpaidItem,
    buyPointsCard,
    init
  }
}) 