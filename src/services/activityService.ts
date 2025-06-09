import type { ActivityProfile } from '@/types/activity'
import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'

export const activityService = {
  async getActivityProfile(userId: number): Promise<ActivityProfile | null> {
    try {
      const response = await api.get(API_ROUTES.ACTIVITY.PROFILE(userId))
      return response.data
    } catch (error) {
      console.error('获取活动档案失败:', error)
      return null
    }
  }
} 