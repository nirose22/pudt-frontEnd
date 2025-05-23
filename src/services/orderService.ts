import apiClient from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import { errorHandler } from '@/utils/errorHandler'
import type { Order, Result } from '@/types'
import type { UnpaidItem } from '@/types/purchase'

export const orderService = {
  async fetchHistory(userId: number): Promise<Result<Order[]>> {
    try {
      const data = await apiClient.get<Order[]>(API_ROUTES.PURCHASE.HISTORY(userId))
      return { success: true, data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
    }
  },

  async fetchUnpaid(userId: number): Promise<Result<UnpaidItem[]>> {
    try {
      const data = await apiClient.get<UnpaidItem[]>(API_ROUTES.PURCHASE.UNPAID(userId))
      return { success: true, data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
    }
  },

  async payUnpaidItem(itemId: number, amount: number): Promise<Result<void>> {
    try {
      await apiClient.post(API_ROUTES.PURCHASE.PAY_UNPAID(itemId), { amount })
      return { success: true }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
    }
  },

  async buyPointsCard(cardId: number): Promise<Result<void>> {
    try {
      await apiClient.post(API_ROUTES.POINTS.BUY, { cardId })
      return { success: true }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.PURCHASE_ERROR)
    }
  }
} 