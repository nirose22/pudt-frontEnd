import  api from '@/utils/api';
import type { Booking, BookingDetail } from '@/types/booking'
import { BookingStatus } from '@/enums/BookingStatus'
import type { Result } from '@/types'
import { ERROR_MESSAGES, API_ROUTES } from '@/utils/apiConfig'
import { request, buildQueryString } from '@/utils/requestHelper'

export type BookingQuery = {
    status?: BookingStatus
    date?: string
}

export class BookingService {
    static async getBookings(userId: number, query?: BookingQuery): Promise<Result<Booking[]>> {
        const queryString = buildQueryString(query || {})
        const url = `${API_ROUTES.BOOKING.LIST(userId)}${queryString}`
        return request<Booking[]>(() => api.get(url), ERROR_MESSAGES.BOOKING_ERROR)
    }

    static async getBookingDetail(bookingId: number): Promise<Result<BookingDetail>> {
        return request<BookingDetail>(
            () => api.get(API_ROUTES.BOOKING.DETAIL(bookingId)),
            ERROR_MESSAGES.BOOKING_ERROR
        )
    }

    static async createBooking(courseId: number, sessionId: number): Promise<Result<Booking>> {
        return request<Booking>(
            () => api.post(API_ROUTES.BOOKING.CREATE, { courseId, sessionId }),
            ERROR_MESSAGES.BOOKING_ERROR
        )
    }

    static async cancelBooking(bookingId: number): Promise<Result<void>> {
        return request<void>(
            () => api.post(API_ROUTES.BOOKING.CANCEL(bookingId)),
            ERROR_MESSAGES.BOOKING_ERROR
        )
    }

    static async checkAvailability(courseId: number, sessionId: number): Promise<Result<boolean>> {
        return request<boolean>(
            () => api.post(API_ROUTES.BOOKING.CHECK, { courseId, sessionId }),
            ERROR_MESSAGES.BOOKING_ERROR
        )
    }
}
