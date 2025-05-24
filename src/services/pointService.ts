import { apiClient } from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import type { PointsCard, PointTxn, Result } from '@/types'
import { request } from '@/utils/requestHelper'

export const pointService = {
  async fetchPointsCards(): Promise<Result<PointsCard[]>> {
    return request<PointsCard[]>(
      () => apiClient.get(API_ROUTES.POINTS.CARDS),
      ERROR_MESSAGES.POINTS_ERROR
    )
  },

  async fetchPointsHistory(): Promise<Result<PointTxn[]>> {
    return request<PointTxn[]>(
      () => apiClient.get(API_ROUTES.POINTS.HISTORY),
      ERROR_MESSAGES.POINTS_ERROR
    )
  }
} 