import  api from '@/utils/api';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import type { PointsCard, PointTxn, Result } from '@/types'
import { request } from '@/utils/requestHelper'

export const pointService = {
  async fetchPointsCards(): Promise<Result<PointsCard[]>> {
    return request<PointsCard[]>(
      () => api.get(API_ROUTES.POINTS.CARDS)
    )
  },

  async fetchPointsHistory(): Promise<Result<PointTxn[]>> {
    return request<PointTxn[]>(
      () => api.get(API_ROUTES.POINTS.HISTORY)
    )
  }
} 