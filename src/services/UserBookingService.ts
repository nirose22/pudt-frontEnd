import api from '@/utils/api'
import type { Booking, BookingDetail } from '@/types/booking'
import { BookingStatus } from '@/enums/BookingStatus'
import type { Result } from '@/types'
import { API_ROUTES } from '@/utils/apiConfig'
import { request, buildQueryString } from '@/utils/requestHelper'

export type BookingQuery = {
    courseId?: string    // 修改為number類型，與後端保持一致
    status?: BookingStatus
    date?: string        // 單一日期
    dateRange?: string   // 日期範圍 "2024-01-01~2024-01-31"
}

export class BookingService {
    static async getBookings(userId: number, query?: BookingQuery): Promise<Result<Booking[]>> {
        // 轉換查詢參數，確保所有參數都是string類型
        const queryParams: Record<string, string | undefined> = {}
        if (query?.courseId) queryParams.courseId = query.courseId  // 已經是string，直接使用
        if (query?.status) queryParams.status = query.status
        if (query?.date) queryParams.date = query.date
        if (query?.dateRange) queryParams.dateRange = query.dateRange
        
        const queryString = buildQueryString(queryParams)
        return request<Booking[]>(() => api.get(API_ROUTES.BOOKING.LIST(userId, queryString)))
    }

    static async getSchedule(userId: number, query?: BookingQuery): Promise<Result<Booking[]>> {
        const queryParams: Record<string, string | undefined> = {}
        if (query?.courseId) queryParams.courseId = query.courseId  // 已經是string，直接使用
        if (query?.status) queryParams.status = query.status
        if (query?.dateRange) queryParams.dateRange = query.dateRange
        
        const queryString = buildQueryString(queryParams)
        return request<Booking[]>(() => api.get(API_ROUTES.BOOKING.SCHEDULE(userId, queryString)))
    }

        
    // 便利方法：按課程ID查詢
    static async getBookingsByCourse(userId: number, courseId: string): Promise<Result<Booking[]>> {
        return this.getBookings(userId, { courseId })
    }
    
    // 便利方法：按日期範圍查詢
    static async getBookingsByDateRange(userId: number, startDate: string, endDate: string): Promise<Result<Booking[]>> {
        const dateRange = `${startDate}~${endDate}`
        return this.getBookings(userId, { dateRange })
    }
    
    // 便利方法：按課程ID和日期範圍查詢
    static async getBookingsByCourseAndDateRange(
        userId: number, 
        courseId: string,  // 改為 string 類型
        startDate: string, 
        endDate: string
    ): Promise<Result<Booking[]>> {
        const dateRange = `${startDate}~${endDate}`
        return this.getBookings(userId, { courseId, dateRange })
    }
    
    // 便利方法：按狀態查詢
    static async getBookingsByStatus(userId: number, status: BookingStatus): Promise<Result<Booking[]>> {
        return this.getBookings(userId, { status })
    }

    static async getBookingDetail(bookingId: number): Promise<Result<BookingDetail>> {
        return request<BookingDetail>(() => api.get(API_ROUTES.BOOKING.DETAIL(bookingId)))
    }

    static async createBooking(courseId: number, sessionId: number, notes?: string): Promise<Result<Booking>> {
        return request<Booking>(() => api.post(API_ROUTES.BOOKING.CREATE, { 
            courseId, 
            sessionId,
            notes 
        }))
    }

    static async cancelBooking(bookingId: number): Promise<Result<void>> {
        return request<void>(() => api.post(API_ROUTES.BOOKING.CANCEL(bookingId)))
    }

    static async checkAvailability(courseId: number, sessionId: number): Promise<Result<boolean>> {
        return request<boolean>(() => api.post(API_ROUTES.BOOKING.CHECK, { courseId, sessionId }))
    }
    
    // 便利方法：獲取當前用戶的預約（需要配合用戶store使用）
    static async getCurrentUserBookings(query?: Omit<BookingQuery, 'userId'>): Promise<Result<Booking[]>> {
        // 這個方法需要從用戶store或其他地方獲取當前用戶ID
        // 假設通過某種方式獲取到用戶ID
        const currentUserId = 1; // 這裡應該從實際的用戶context獲取
        return this.getBookings(currentUserId, query)
    }
}