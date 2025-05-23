import apiClient from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import { errorHandler } from '@/utils/errorHandler'
import type { PointsCard, PointTxn, Result } from '@/types'

export const pointService = {
  async fetchPointsCards(): Promise<Result<PointsCard[]>> {
    try {
      const data = await apiClient.get<PointsCard[]>(API_ROUTES.POINTS.CARDS)
      return { success: true, data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.POINTS_ERROR)
    }
  },

  async fetchPointsHistory(): Promise<Result<PointTxn[]>> {
    try {
      const data = await apiClient.get<PointTxn[]>(API_ROUTES.POINTS.HISTORY)
      return { success: true, data }
    } catch (error) {
      return errorHandler.handleApiError(error, ERROR_MESSAGES.POINTS_ERROR)
    }
  }
} 