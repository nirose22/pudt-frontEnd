// stores/bookingStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Result } from '@/types'
import type { Booking } from '@/types/booking'
import { BookingStatus } from '@/enums/BookingStatus'
import { useUserStore } from './userStore'
import { type BookingQuery, BookingService } from '@/services/UserBookingService'
import { useCourseStore } from './courseStore'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES } from '@/utils/apiConfig'

export const useBookingStore = defineStore('booking', () => {
    /* ---------- state ---------- */
    const userStore = useUserStore()
    const courseStore = useCourseStore()
    const bookings = ref<Booking[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    /* ---------- getters ---------- */
    // 按狀態過濾預約
    const byStatus = (s: BookingStatus) => bookings.value.filter(b => b.status === s);

    /* ---------- can-book logic ---------- */
    function canBook(courseId: number, sessionId: number): boolean {
        const currentCourse = courseStore.currentCourse
        const slot = courseStore.courseSession.find(s => s.id === sessionId)
        
        if (!currentCourse || !slot) {
            return false
        }
        
        // 檢查座位數
        if (slot.seatsLeft <= 0) {
            return false
        }
        return true
    }

    /* ---------- actions ---------- */
    // 獲取用戶的預約記錄
    const fetchBookings = async (query?: BookingQuery): Promise<Result> => {
        loading.value = true
        error.value = null
        const result = await BookingService.getBookings(userStore.profile.userId, query);
        if (result.success && result.data) {
            bookings.value = result.data
        }
        loading.value = false;
        return result;
    }

    // 預約課程
    async function book(courseId: number, sessionId: number): Promise<Result> {
        loading.value = true
        error.value = null
        
        try {
            // 檢查是否可以預約
            if (!canBook(courseId, sessionId)) {
                return errorHandler.handleBusinessError(null, '無法預約該課程時段')
            }
            const currentCourse = courseStore.currentCourse
            const slot = courseStore.courseSession.find(s => s.id === sessionId)
            const result = await BookingService.createBooking(courseId, sessionId)
            if (result.success && result.data) {
                // 1. 扣點
                userStore.adjustPoints(-currentCourse!.points)
                // 2. 減座位
                courseStore.updateAvailableSeats(sessionId, -1)
                // 3. 添加到本地預約記錄
                const newBook: Booking = {
                    id: result.data.id,
                    courseId,
                    sessionId: sessionId,
                    points: currentCourse!.points,
                    status: BookingStatus.Confirmed,
                    createdAt: new Date(),
                    start: slot!.start,
                    end: slot!.end,
                    date: slot!.date,
                    courseTitle: currentCourse!.title,
                    merchantName: currentCourse!.merchant.name,
                    location: currentCourse!.merchant.address || '',
                    rating: 0,
                    comment: '',
                    notes: ''
                }
                bookings.value.push(newBook)
            }
            return result
        } catch (err) {
            return errorHandler.handleApiError(err, ERROR_MESSAGES.BOOKING_ERROR)
        } finally {
            loading.value = false
        }
    }

    // 取消預約
    async function cancel(id: number): Promise<Result> {
        loading.value = true
        error.value = null
        
        try {
            // 調用 BookingService 取消預約
            const result = await BookingService.cancelBooking(id)
            
            if (result.success) {
                // 更新本地數據
                const booking = bookings.value.find(b => b.id === id)
                if (booking) {
                    booking.status = BookingStatus.Cancelled
                }
                
                // 還原點數
                const course = courseStore.currentCourse
                if (course && booking && course.id === booking.courseId) {
                    userStore.adjustPoints(booking.points)
                }
            }
            return result
        } catch (err) {
            return err as Result
        } finally {
            loading.value = false
        }
    }

    /* ---------- expose ---------- */
    return {
        bookings,
        byStatus,
        loading,
        error,
        fetchBookings,
        canBook,
        book,
        cancel
    }
})
