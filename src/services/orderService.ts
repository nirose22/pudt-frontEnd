import { apiClient } from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import type { Order, Result } from '@/types'
import type { UnpaidItem } from '@/types/purchase'
import { request } from '@/utils/requestHelper'

export const orderService = {
  async fetchHistory(userId: number): Promise<Result<Order[]>> {
    return request<Order[]>(
      () => apiClient.get(API_ROUTES.PURCHASE.HISTORY(userId)),
      ERROR_MESSAGES.PURCHASE_ERROR
    )
  },

  async fetchUnpaid(userId: number): Promise<Result<UnpaidItem[]>> {
    return request<UnpaidItem[]>(
      () => apiClient.get(API_ROUTES.PURCHASE.UNPAID(userId)),
      ERROR_MESSAGES.PURCHASE_ERROR
    )
  },

  async payUnpaidItem(itemId: number, amount: number): Promise<Result<void>> {
    return request<void>(
      () => apiClient.post(API_ROUTES.PURCHASE.PAY_UNPAID(itemId), { amount }),
      ERROR_MESSAGES.PURCHASE_ERROR
    )
  },

  async buyPointsCard(cardId: number): Promise<Result<void>> {
    return request<void>(
      () => apiClient.post(API_ROUTES.POINTS.BUY, { cardId }),
      ERROR_MESSAGES.PURCHASE_ERROR
    )
  }
} 