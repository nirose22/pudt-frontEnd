import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePointsStore } from './pointsStore'
import type { Result } from "@/types"
import type { Order } from "@/types/order"
import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus'
import { PointKind, PointRefType  } from '@/enums/Point'
import { useUserStore } from './userStore'
import type { PointTxn } from '@/types/point'
import type { UnpaidItem } from '@/types/purchase'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES, API_ROUTES } from '@/utils/apiConfig'
import apiClient from '@/utils/api'

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
      const data = await apiClient.get<Order[]>(API_ROUTES.PURCHASE.HISTORY(userId ?? userStore.profile?.id ?? 0))
      OrderHistory.value = data
      return { success: true, data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
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
      const data = await apiClient.get<UnpaidItem[]>(API_ROUTES.PURCHASE.UNPAID(userId ?? userStore.profile?.id ?? 0))
      unpaidItems.value = data
      return { success: true, data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
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
      await apiClient.post(API_ROUTES.PURCHASE.PAY_UNPAID(itemId), { amount })

      const itemIndex = unpaidItems.value.findIndex(item => item.id === itemId)
      if (itemIndex >= 0) {
        const item = unpaidItems.value[itemIndex]
        const newAmountPaid = item.amount + amount
        const newAmountDue = Math.max(0, item.amount - newAmountPaid)

        unpaidItems.value[itemIndex] = {
          ...item,
          amount: newAmountPaid,
        }

        if (newAmountDue === 0) {
          unpaidItems.value.splice(itemIndex, 1)
          const historyItem = OrderHistory.value.find(h => h.id === itemId)
          if (historyItem) {
            historyItem.status = OrderStatus.Paid
          }
        }
      }

      return { success: true }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
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
        return errorHandler.handleBusinessError(null, '課卡不存在')
      }
    
      await apiClient.post(API_ROUTES.POINTS.BUY, { cardId })
      
      const adjustResult = userStore.adjustPoints(selectedCard.points)
      if (!adjustResult.success) {
        return errorHandler.handleBusinessError(null, adjustResult.message || '點數調整失敗')
      }
      const newBalance = adjustResult.data 
    
      const pointHistoryItem: PointTxn = {
        id: Date.now(),
        userId: userStore.profile?.id ?? 0,
        kind: PointKind.Deposit,
        amount: selectedCard.points,
        balance: newBalance ?? 0,
        refType: PointRefType.Order,
        refId: Date.now(),
        createdAt: new Date(),
      }
      
      pointsStore.addPointsHistory(pointHistoryItem)
    
      const purchaseItem: Order = {
        id: Date.now(),
        userId: userStore.profile?.id ?? 0,
        sn: `ORD-${Date.now().toString().slice(-6)}`,
        total: selectedCard.price,
        status: OrderStatus.Paid,
        payMethod: PaymentMethod.CreditCard,
        createdAt: new Date(),
        invoiceNo: `INV-${Date.now().toString().slice(-6)}`
      }
      
      OrderHistory.value.unshift(purchaseItem)
    
      return { success: true, message: '購買課卡成功' }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
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