import  api from '@/utils/api';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import type { Order, Result } from '@/types'
import type { UnpaidItem } from '@/types/purchase'
import { request } from '@/utils/requestHelper'

export const orderService = {
  async fetchHistory(userId: number): Promise<Result<Order[]>> {
    return request<Order[]>(
      () => api.get(API_ROUTES.PURCHASE.HISTORY(userId))
    )
  },

  async fetchUnpaid(userId: number): Promise<Result<UnpaidItem[]>> {
    return request<UnpaidItem[]>(
      () => api.get(API_ROUTES.PURCHASE.UNPAID(userId))
    )
  },

  async payUnpaidItem(itemId: number, amount: number): Promise<Result<void>> {
    return request<void>(
      () => api.post(API_ROUTES.PURCHASE.PAY_UNPAID(itemId), { amount })
    )
  },

  async buyPointsCard(cardId: number): Promise<Result<void>> {
    return request<void>(
      () => api.post(API_ROUTES.POINTS.BUY, { cardId })
    )
  }
} 