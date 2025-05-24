import apiClient from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import { errorHandler } from '@/utils/errorHandler'
import type { Merchant, MerchantStats, Instructor, Course, Result } from '@/types'

type MerchantId = number | 'me'

export class MerchantService {
    /**
     * 獲取商家資料
     * @param id 商家ID，不傳則獲取當前登入商家
     */
    static async fetchMerchant(id?: MerchantId): Promise<Result<Merchant>> {
        try {
            return await apiClient.get<Result<Merchant>>(API_ROUTES.MERCHANT.DETAIL(id ?? 'me'))
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 更新商家資料
     * @param id 商家ID
     * @param payload 更新的資料
     */
    static async updateMerchant(id: MerchantId, payload: Partial<Merchant>): Promise<Result<Merchant>> {
        try {
            return await apiClient.put<Result<Merchant>>(API_ROUTES.MERCHANT.DETAIL(id), payload)
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 獲取商家課程列表
     * @param id 商家ID，不傳則獲取當前登入商家
     */
    static async fetchMerchantCourses(id?: MerchantId): Promise<Result<Course[]>> {
        try {
            return await apiClient.get<Result<Course[]>>(API_ROUTES.MERCHANT.COURSES(id ?? 'me'))
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 獲取商家統計資料
     * @param id 商家ID
     */
    static async fetchMerchantStats(id?: MerchantId): Promise<Result<MerchantStats>> {
        try {
            return await apiClient.get<Result<MerchantStats>>(API_ROUTES.MERCHANT.STATS(id ?? 'me'))
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 獲取商家講師列表
     * @param id 商家ID
     */
    static async fetchInstructors(id?: MerchantId): Promise<Result<Instructor[]>> {
        try {
            return await apiClient.get<Result<Instructor[]>>(API_ROUTES.MERCHANT.INSTRUCTORS(id ?? 'me'))
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 新增講師
     * @param id 商家ID
     * @param payload 講師資料
     */
    static async addInstructor(
        id: MerchantId, 
        payload: Omit<Instructor, 'id' | 'merchantId'>
    ): Promise<Result<Instructor>> {
        try {
            return await apiClient.post<Result<Instructor>>(API_ROUTES.MERCHANT.INSTRUCTORS(id), payload)
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 更新講師資料
     * @param id 商家ID
     * @param instructorId 講師ID
     * @param payload 更新的資料
     */
    static async updateInstructor(
        id: MerchantId, 
        instructorId: number, 
        payload: Partial<Instructor>
    ): Promise<Result<Instructor>> {
        try {
            return await apiClient.put<Result<Instructor>>(
                API_ROUTES.MERCHANT.INSTRUCTOR_DETAIL(id, instructorId), 
                payload
            )
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }

    /**
     * 刪除講師
     * @param id 商家ID
     * @param instructorId 講師ID
     */
    static async deleteInstructor(id: MerchantId, instructorId: number): Promise<Result<void>> {
        try {
            return await apiClient.delete<Result<void>>(API_ROUTES.MERCHANT.INSTRUCTOR_DETAIL(id, instructorId))
        } catch (error) {
            throw errorHandler.handleApiError(error, ERROR_MESSAGES.MERCHANT_ERROR)
        }
    }
}