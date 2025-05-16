// stores/bookingStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isEqual } from 'date-fns'
import type { Result } from '@/types'
import type { Booking, Course, CourseSession } from '@/types/course'
import { BookingStatus } from '@/enums/BookingStatus'
import { useCourseStore } from './courseStore'
import { useUserStore } from './userStore'
import { BookingService } from '@/service/BookingService'

export const useBookingStore = defineStore('booking', () => {
    /* ---------- state ---------- */
    const courseStore = useCourseStore()
    const userStore = useUserStore()
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
                b.status !== BookingStatus.Canceled
        )
    }

    /* ---------- can-book logic ---------- */
    function canBook(courseId: number, slotId: number): boolean {
        const course = courseStore.currentCourse
        const slot = courseStore.getTimeSlotById(slotId)
        
        if (!course || !slot) {
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
                error.value = '未登录或用户ID无效'
                return false
            }
            
            // 从 BookingService 获取预约记录
            const data = await BookingService.getUserBookings(userId)
            bookings.value = data
            return true
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取预约记录失败'
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
            // 从 BookingService 获取课程预约详情
            const { course, timeSlots, bookingStatus } = await BookingService.fetchCourseBookingDetail(courseId)
            
            // 更新 course store 中的数据
            courseStore.currentCourse = course
            courseStore.courseTime = timeSlots
            
            // 保存冲突时间槽
            conflictSlots.value = bookingStatus.conflictSlots
            
            return {
                success: true,
                message: '课程预约详情加载成功'
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '加载课程预约详情失败'
            return {
                success: false,
                message: error.value
            }
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
                error.value = '无法预约该课程时段'
                return { 
                    success: false, 
                    message: error.value 
                }
            }

            const course = courseStore.currentCourse
            const slot = courseStore.getTimeSlotById(slotId)
            
            if (!course || !slot || !userStore.profile) {
                error.value = '课程信息不完整或未登录'
                return { 
                    success: false, 
                    message: error.value 
                }
            }

            // 调用 BookingService 创建预约
            const result = await BookingService.createBooking(
                userStore.profile.id,
                courseId,
                slotId
            )
            
            if (result.success) {
                // 1. 扣点
                userStore.adjustPoints(-course.points)
                // 2. 减座位
                courseStore.updateAvailableSeats(slotId, -1)
                // 3. 添加到本地预约记录
                const newBook: Booking = {
                    id: result.data?.bookingId || Date.now(),
                    userId: userStore.profile.id,
                    sessionId: slotId,
                    points: course.points,
                    status: BookingStatus.Confirmed,
                    createdAt: new Date()
                }
                bookings.value.push(newBook)
            }
            
            return result
        } catch (err) {
            error.value = err instanceof Error ? err.message : '预约失败'
            return { 
                success: false, 
                message: error.value 
            }
        } finally {
            loading.value = false
        }
    }

    // 取消预约
    async function cancel(id: number): Promise<Result> {
        loading.value = true
        error.value = null
        
        try {
            const idx = bookings.value.findIndex(b => b.id === id)
            if (idx === -1) {
                error.value = '预约不存在'
                return { success: false, message: error.value }
            }
            
            const bk = bookings.value[idx]
            if (bk.status === BookingStatus.Canceled) {
                error.value = '课程已被取消'
                return { success: false, message: error.value }
            }
            
            // 调用 BookingService 取消预约
            const result = await BookingService.cancelBooking(id)
            
            if (result.success) {
                // 更新本地数据
                bk.status = BookingStatus.Canceled
                
                // 还原点数
                const course = courseStore.currentCourse
                if (course && course.courseId === bk.sessionId) {
                    userStore.adjustPoints(bk.points)
                }
            }
            
            return result
        } catch (err) {
            error.value = err instanceof Error ? err.message : '取消预约失败'
            return { 
                success: false, 
                message: error.value 
            }
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
