import type { ActivityProfile } from '@/types/activity'
import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import type { Result } from '@/types'
import type { Booking } from '@/types/booking'
import { request } from '@/utils/requestHelper'

/**
 * 活動統計響應
 */
export interface ActivityStatsResponse {
    totalCourses: number;
    completedCourses: number;
    absenceCourses: number;
    averageRating: number;
    totalPointsSpent: number;
    monthlyActivities: number;
}

/**
 * 活動查詢請求
 */
export interface ActivityQueryRequest {
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
}

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

export class ActivityService {
    /**
     * 獲取用戶活動統計
     */
    static async getActivityStats(userId: number, query?: ActivityQueryRequest): Promise<Result<ActivityStatsResponse>> {
        const params = new URLSearchParams();
        if (query?.startDate) params.append('startDate', query.startDate);
        if (query?.endDate) params.append('endDate', query.endDate);
        if (query?.status) params.append('status', query.status);
        if (query?.search) params.append('search', query.search);

        const url = `/activity/${userId}/stats${params.toString() ? '?' + params.toString() : ''}`;
        return request<ActivityStatsResponse>(() => api.get(url));
    }

    /**
     * 獲取用戶評價記錄
     */
    static async getRatingHistory(userId: number, query?: ActivityQueryRequest): Promise<Result<Booking[]>> {
        const params = new URLSearchParams();
        if (query?.startDate) params.append('startDate', query.startDate);
        if (query?.endDate) params.append('endDate', query.endDate);
        if (query?.search) params.append('search', query.search);
        if (query?.page) params.append('page', query.page.toString());
        if (query?.size) params.append('size', query.size.toString());

        const url = `/activity/${userId}/ratings${params.toString() ? '?' + params.toString() : ''}`;
        return request<Booking[]>(() => api.get(url));
    }

    /**
     * 獲取用戶缺席記錄
     */
    static async getAbsenceRecords(userId: number, query?: ActivityQueryRequest): Promise<Result<Booking[]>> {
        const params = new URLSearchParams();
        if (query?.startDate) params.append('startDate', query.startDate);
        if (query?.endDate) params.append('endDate', query.endDate);
        if (query?.search) params.append('search', query.search);
        if (query?.page) params.append('page', query.page.toString());
        if (query?.size) params.append('size', query.size.toString());

        const url = `/activity/${userId}/absence${params.toString() ? '?' + params.toString() : ''}`;
        return request<Booking[]>(() => api.get(url));
    }
} 