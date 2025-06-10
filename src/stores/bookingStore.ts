// stores/bookingStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Result } from '@/types'
import type { Booking } from '@/types/booking'
import { BookingStatus } from '@/enums/BookingStatus'
import { useUserStore } from './userStore'
import { BookingService } from '@/services/UserBookingService'
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
    const conflictSlots = ref<number[]>([])

    /* ---------- getters ---------- */
    // 按状态过滤预约
    const byStatus = (s: BookingStatus) => bookings.value.filter(b => b.status === s);

    /* ---------- helpers ---------- */
    function hasTimeConflict(date: Date, sessionId: number) {
        return bookings.value.some(
            b =>
                b.sessionId === sessionId &&
                b.status !== BookingStatus.Cancelled
        )
    }

    /* ---------- can-book logic ---------- */
    function canBook(courseId: number, slotId: number): boolean {
        const currentCourse = courseStore.currentCourse
        const slot = courseStore.getSessionById(slotId)
        
        if (!currentCourse || !slot) {
            return false
        }
        
        // 检查座位数
        if (slot.seatsLeft <= 0) {
            return false
        }
        
        // 检查时间冲突
        if (hasTimeConflict(slot.date, slotId)) {
            return false
        }
        
        // 检查是否在冲突时间槽列表中
        if (conflictSlots.value.includes(slotId)) {
            return false
        }
        
        return true
    }

    /* ---------- actions ---------- */
    // 获取用户的预约记录
    const fetchBookings = async (userId?: number): Promise<boolean> => {
        loading.value = true
        error.value = null
        
        try {
            if (!userId && userStore.profile) {
                userId = userStore.profile.id
            }
            
            if (!userId) {
                error.value = ERROR_MESSAGES.UNAUTHORIZED
                return false
            }
            
            const result = await BookingService.getBookings(userId)
            if (result.success && result.data) {
                bookings.value = result.data
                return true
            }
            error.value = result.message || ERROR_MESSAGES.BOOKING_ERROR
            return false
        } catch (err) {
            error.value = err instanceof Error ? err.message : ERROR_MESSAGES.BOOKING_ERROR
            return false
        } finally {
            loading.value = false
        }
    }
    
    // 加载课程预约详情
    const loadCourseBookingDetail = async (courseId: number): Promise<Result> => {
        loading.value = true
        error.value = null
        try {
            const res = await courseStore.loadCourseDetail(courseId)
            return res;
        } catch (err) {
            return errorHandler.handleApiError(err, ERROR_MESSAGES.BOOKING_ERROR)
        } finally {
            loading.value = false
        }
    }

    // 预约课程
    async function book(courseId: number, slotId: number): Promise<Result> {
        loading.value = true
        error.value = null
        
        try {
            // 检查是否可以预约
            if (!canBook(courseId, slotId)) {
                return errorHandler.handleBusinessError(null, '無法預約該課程時段')
            }

            const currentCourse = courseStore.currentCourse
            const slot = courseStore.getSessionById(slotId)
            
            if (!currentCourse || !slot || !userStore.profile) {
                return errorHandler.handleBusinessError(null, '課程信息不完整或未登錄')
            }

            const result = await BookingService.createBooking(courseId, slotId)
            
            if (result.success && result.data) {
                // 1. 扣点
                userStore.adjustPoints(-currentCourse.points)
                // 2. 减座位
                courseStore.updateAvailableSeats(slotId, -1)
                // 3. 添加到本地预约记录
                const newBook: Booking = {
                    id: result.data.id,
                    courseId,
                    sessionId: slotId,
                    points: currentCourse.points,
                    status: BookingStatus.Confirmed,
                    createdAt: new Date(),
                    start: slot.start,
                    end: slot.end,
                    date: slot.date,
                    courseTitle: currentCourse.title,
                    merchantName: currentCourse.merchant.name,
                    // 添加其他必要字段，确保类型兼容
                    location: currentCourse.merchant.address || '',
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

    // 取消预约
    async function cancel(id: number): Promise<Result> {
        loading.value = true
        error.value = null
        
        try {
            const booking = bookings.value.find(b => b.id === id)
            if (!booking) {
                return errorHandler.handleBusinessError(null, '預約不存在')
            }
            
            if (booking.status === BookingStatus.Cancelled) {
                return errorHandler.handleBusinessError(null, '課程已被取消')
            }
            
            // 调用 BookingService 取消预约
            const result = await BookingService.cancelBooking(id)
            
            if (result.success) {
                // 更新本地数据
                booking.status = BookingStatus.Cancelled
                
                // 还原点数
                const course = courseStore.currentCourse
                if (course && course.id === booking.courseId) {
                    userStore.adjustPoints(booking.points)
                }
            }
            return result
        } catch (err) {
            return errorHandler.handleApiError(err, ERROR_MESSAGES.BOOKING_ERROR)
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
        loadCourseBookingDetail,
        canBook,
        book,
        cancel
    }
})
