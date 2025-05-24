import type { Course, Booking, CourseSession } from '@/types';
import type { Result } from '@/types';
import apiClient from '@/utils/api';

type BookingAvailability = { canBook: boolean; reason?: string };

export class BookingService {
    /* ---------- 私有工具 ---------- */

    /** 統一封裝請求，集中錯誤處理與 log */
    private static async request<T>(
        fn: () => Promise<T>,
        logHint: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            console.error(`${logHint} 失敗:`, error);
            throw error;
        }
    }

    /** 方便組裝 /bookings 相關路徑 */
    private static base(path = ''): string {
        return `/bookings${path}`;
    }

    /* ---------- 公開 API ---------- */

    /** 取得使用者全部預約紀錄 */
    static getUserBookings(userId: number): Promise<Booking[]> {
        return this.request(
            () => apiClient.get<Booking[]>(`/users/${userId}/bookings`),
            '取得使用者預約紀錄'
        );
    }

    /** 取得課程預約詳細資料（含可預約狀態） */
    static fetchCourseBookingDetail(courseId: number): Promise<{
        course: Course;
        sessions: CourseSession[];
        bookingStatus: { canBook: boolean; conflictSlots: number[] };
    }> {
        return this.request(
            () => apiClient.get(this.base(`/course/${courseId}/detail`)),
            '取得課程預約詳細資料'
        );
    }

    /** 建立新預約 */
    static createBooking(
        userId: number,
        courseId: number,
        timeSlotId: number
    ): Promise<Result> {
        return this.request(
            () =>
                apiClient.post<Result>(this.base(), { userId, courseId, timeSlotId }),
            '建立預約'
        );
    }

    /** 取消預約 */
    static cancelBooking(bookingId: number): Promise<Result> {
        return this.request(
            () => apiClient.put<Result>(this.base(`/${bookingId}/cancel`)),
            '取消預約'
        );
    }

    /** 檢查特定課程時段是否可預約 */
    static checkBookingAvailability(
        userId: number,
        courseId: number,
        timeSlotId: number
    ): Promise<BookingAvailability> {
        return this.request(
            () =>
                apiClient.get(this.base('/check'), {
                    params: { userId, courseId, timeSlotId }
                }),
            '檢查預約可用性'
        );
    }
}
