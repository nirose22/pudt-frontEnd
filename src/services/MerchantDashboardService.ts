import api from '@/utils/api';
import type { Result } from '@/types';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig';
import { request } from '@/utils/requestHelper';

// 儀表板數據類型定義
export interface DashboardData {
    todayBookings: number;
    bookingTrend: number;
    monthlyRevenue: number;
    revenueTrend: number;
    totalCourses: number;
    activeCourses: number;
    cancellationRate: number;
    cancellationTrend: number;
}

export interface RevenueChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension: number;
        fill: boolean;
    }[];
}

export interface BookingChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        hoverBackgroundColor: string[];
    }[];
}

export interface TopCourse {
    id: number;
    title: string;
    bookings: number;
    revenue: number;
    rating: number;
}

export interface PendingBooking {
    id: number;
    customerName: string;
    courseTitle: string;
    date: string | Date;
    status: string;
}

export interface DashboardResponse {
    dashboardData: DashboardData;
    revenueChartData: RevenueChartData;
    bookingChartData: BookingChartData;
    topCourses: TopCourse[];
    pendingBookings: PendingBooking[];
}

export const MerchantDashboardService = {
    /**
     * 獲取儀表板所有數據
     * @param merchantId 商家ID
     * @returns 儀表板數據
     */
    async getDashboardData(merchantId: number): Promise<Result<DashboardResponse>> {
        return request<DashboardResponse>(
            () => api.get(API_ROUTES.MERCHANT.DASHBOARD(merchantId))
        );
    },

    /**
     * 獲取營收趨勢數據
     * @param merchantId 商家ID
     * @returns 營收圖表數據
     */
    async getRevenueTrend(merchantId: number): Promise<Result<RevenueChartData>> {
        return request<RevenueChartData>(
            () => api.get(API_ROUTES.MERCHANT.REVENUE_TREND(merchantId))
        );
    },

    /**
     * 獲取預約統計數據
     * @param merchantId 商家ID
     * @returns 預約分佈圖數據
     */
    async getBookingStats(merchantId: number): Promise<Result<BookingChartData>> {
        return request<BookingChartData>(
            () => api.get(API_ROUTES.MERCHANT.BOOKING_STATS(merchantId))
        );
    },

    /**
     * 獲取熱門課程列表
     * @param merchantId 商家ID
     * @returns 熱門課程列表
     */
    async getTopCourses(merchantId: number): Promise<Result<TopCourse[]>> {
        return request<TopCourse[]>(
            () => api.get(API_ROUTES.MERCHANT.TOP_COURSES(merchantId))
        );
    },

    /**
     * 獲取待處理預約列表
     * @param merchantId 商家ID
     * @returns 待處理預約列表
     */
    async getPendingBookings(merchantId: number): Promise<Result<PendingBooking[]>> {
        return request<PendingBooking[]>(
            () => api.get(API_ROUTES.MERCHANT.PENDING_BOOKINGS(merchantId))
        );
    },

    /**
     * 確認預約
     * @param bookingId 預約ID
     * @returns 確認結果
     */
    async confirmBooking(bookingId: number): Promise<Result<{ success: boolean; message: string }>> {
        return request<{ success: boolean; message: string }>(
            () => api.post(API_ROUTES.MERCHANT.CONFIRM_BOOKING(bookingId))
        );
    }
}; 