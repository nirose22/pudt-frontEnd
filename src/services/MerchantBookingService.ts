import  api from '@/utils/api';
import type { MerchantBookingDetail } from '@/types/booking';
import { BookingStatus } from '@/enums/BookingStatus';
import type { Result } from '@/types';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig';
import { request, buildQueryString } from '@/utils/requestHelper';

export type BookingQuery = {
    status?: BookingStatus;
    date?: string;
};

type SendOption = {
    email?: boolean;
    sms?: boolean;
};

export class MerchantBookingService {
    /** 產生商家訂單基礎路徑 */
    private static base(merchantId: number): string {
        return `/merchants/${merchantId}/bookings`;
    }

    /**
     * 取得商家訂單（可複合條件）
     * @example getMerchantBookings(1, { status: 'confirmed', date: '2025-05-23' })
     */
    static async getMerchantBookings(
        merchantId: number,
        query: BookingQuery = {}
    ): Promise<Result<MerchantBookingDetail[]>> {
        const queryString = buildQueryString(query);
        const url = `${API_ROUTES.MERCHANT.BOOKINGS(merchantId)}${queryString}`;
        return request<MerchantBookingDetail[]>(() => api.get(url), ERROR_MESSAGES.BOOKING_ERROR);
    }

    /** 單筆訂單詳情 */
    static async getBookingDetail(
        merchantId: number,
        bookingId: number
    ): Promise<Result<MerchantBookingDetail>> {
        return request<MerchantBookingDetail>(
            () => api.get(API_ROUTES.MERCHANT.BOOKING_DETAIL(merchantId, bookingId)),
            ERROR_MESSAGES.BOOKING_ERROR
        );
    }

    /** 更新訂單狀態 */
    static async updateBookingStatus(
        merchantId: number,
        bookingId: number,
        status: BookingStatus
    ): Promise<Result<void>> {
        return request<void>(
            () => api.put(API_ROUTES.MERCHANT.BOOKING_STATUS(merchantId, bookingId), { status }),
            ERROR_MESSAGES.BOOKING_ERROR
        );
    }

    /** 更新訂單備註 */
    static async updateBookingNotes(
        merchantId: number,
        bookingId: number,
        notes: string
    ): Promise<Result<void>> {
        return request<void>(
            () => api.put(API_ROUTES.MERCHANT.BOOKING_NOTES(merchantId, bookingId), { notes }),
            ERROR_MESSAGES.BOOKING_ERROR
        );
    }

    /** 發送通知訊息 */
    static async sendMessage(
        merchantId: number,
        bookingId: number,
        content: string,
        options: SendOption = {}
    ): Promise<Result<void>> {
        return request<void>(
            () => api.post(API_ROUTES.MERCHANT.BOOKING_MESSAGE(merchantId, bookingId), {
                content,
                options
            }),
            ERROR_MESSAGES.BOOKING_ERROR
        );
    }
}
