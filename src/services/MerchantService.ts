import apiClient from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import { errorHandler } from '@/utils/errorHandler'
import type { Merchant } from '@/types/merchant'
import type { Course } from '@/types'

export const merchantService = {
    /**
     * 獲取商家信息
     * @param merchantId 商家ID
     * @returns 商家詳細信息
     */
    async fetchMerchant(id?: number | 'me'): Promise<{ success: boolean, merchant?: Merchant, error?: any }> {
        try {
            const data = await apiClient.get<Merchant>(API_ROUTES.MERCHANT.DETAIL(id ?? 'me'))
            return { success: true, merchant: data }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    },

    async updateMerchant(id: number, payload: Partial<Merchant>): Promise<{ success: boolean, merchant?: Merchant, error?: any }> {
        try {
            const data = await apiClient.put<Merchant>(API_ROUTES.MERCHANT.DETAIL(id), payload)
            return { success: true, merchant: data }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    },

    async fetchMerchantCourses(id?: number | 'me'): Promise<{ success: boolean, courses?: Course[], error?: any }> {
        try {
            const data = await apiClient.get<Course[]>(API_ROUTES.MERCHANT.COURSES(id ?? 'me'))
            return { success: true, courses: data }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }
}; 