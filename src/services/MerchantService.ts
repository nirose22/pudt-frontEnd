import  api from '@/utils/api';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import type { Merchant, MerchantStats, Instructor, Course, Result } from '@/types'
import { request } from '@/utils/requestHelper'

type MerchantId = number

export class MerchantService {
    /**
     * 獲取商家資料
     * @param id 商家ID，不傳則獲取當前登入商家
     */
    static async fetchMerchant(id: MerchantId): Promise<Result<Merchant>> {
        return request<Merchant>(
            () => api.get(API_ROUTES.MERCHANT.DETAIL(id))
        )
    }

    /**
     * 更新商家資料
     * @param id 商家ID
     * @param payload 更新的資料
     */
    static async updateMerchant(id: MerchantId, payload: Partial<Merchant>): Promise<Result<Merchant>> {
        return request<Merchant>(
            () => api.put(API_ROUTES.MERCHANT.DETAIL(id), payload)
        )
    }

    /**
     * 獲取商家課程列表
     * @param id 商家ID，不傳則獲取當前登入商家
     */
    static async fetchMerchantCourses(id: MerchantId): Promise<Result<Course[]>> {
        return request<Course[]>(
            () => api.get(API_ROUTES.MERCHANT.COURSES(id))
        )
    }

    /**
     * 獲取商家統計資料
     * @param id 商家ID
     */
    static async fetchMerchantStats(id: MerchantId): Promise<Result<MerchantStats>> {
        return request<MerchantStats>(
            () => api.get(API_ROUTES.MERCHANT.STATS(id))
        )
    }

    /**
     * 獲取商家講師列表
     * @param id 商家ID
     */
    static async fetchInstructors(id: MerchantId): Promise<Result<Instructor[]>> {
        return request<Instructor[]>(
            () => api.get(API_ROUTES.MERCHANT.INSTRUCTORS(id))
        )
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
        return request<Instructor>(
            () => api.post(API_ROUTES.MERCHANT.INSTRUCTORS(id), payload)
        )
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
        return request<Instructor>(
            () => api.put(API_ROUTES.MERCHANT.INSTRUCTOR_DETAIL(id, instructorId), payload)
        )
    }

    /**
     * 刪除講師
     * @param id 商家ID
     * @param instructorId 講師ID
     */
    static async deleteInstructor(id: MerchantId, instructorId: number): Promise<Result<void>> {
        return request<void>(
            () => api.delete(API_ROUTES.MERCHANT.INSTRUCTOR_DETAIL(id, instructorId))
        )
    }
}