import { apiClient } from '@/utils/api';
import type { MerchantBookingDetail } from '@/types/booking';
import { BookingStatus } from '@/enums/BookingStatus';
import type { Result } from '@/types';

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
        const { status, date } = query;
        let url = this.base(merchantId);

        if (status) url += `/status/${status}`;
        if (date) url += `/date/${date}`;

        return apiClient.get(url);
    }

    /** 單筆訂單詳情 */
    static async getBookingDetail(
        merchantId: number,
        bookingId: number
    ): Promise<Result<MerchantBookingDetail>> {
        return apiClient.get(`${this.base(merchantId)}/${bookingId}`);
    }

    /** 更新訂單狀態 */
    static async updateBookingStatus(
        merchantId: number,
        bookingId: number,
        status: BookingStatus
    ): Promise<Result<void>> {
        return apiClient.put(`${this.base(merchantId)}/${bookingId}/status`, { status });
    }

    /** 更新訂單備註 */
    static async updateBookingNotes(
        merchantId: number,
        bookingId: number,
        notes: string
    ): Promise<Result<void>> {
        return apiClient.put(`${this.base(merchantId)}/${bookingId}/notes`, { notes });
    }

    /** 發送通知訊息 */
    static async sendMessage(
        merchantId: number,
        bookingId: number,
        content: string,
        options: SendOption = {}
    ): Promise<Result<void>> {
        return apiClient.post(`${this.base(merchantId)}/${bookingId}/message`, { content, options });
    }
}
