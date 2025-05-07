// stores/bookingStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isEqual, isWithinInterval } from 'date-fns'
import type { CourseBooking, Result } from '@/types'
import { BookingStatus } from '@/enums/BookingStatus'
import { useCourseStore } from './courseStore'
import { useUserStore } from './userStore'
// import api from '@/utils/api'

export const useBookingStore = defineStore('booking', () => {
    /* ---------- state ---------- */
    const range = ref<{ start: Date; end: Date } | null>(null)

    const courseStore = useCourseStore()
    const userStore = useUserStore()
    const bookings = ref<CourseBooking[]>([])
    /* ---------- getters ---------- */

    // 取得預約紀錄

    const fetchBookings = async (userId?: number) => {
        // const { success, data } = await api.get(`/users/${userId}/bookings`)
        const data: CourseBooking[] = [
            {
                id: 1,
                userId: 1,
                courseId: 101,
                courseTitle: '初级瑜伽课程',
                date: new Date('2025-05-01'),
                time: '10:00-12:00',
                location: '和平瑜伽中心 - 信义店',
                instructor: {
                    name: '李老师',
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Confirmed,
                points: 4,
            },
            {
                id: 2,
                userId: 1,
                courseId: 102,
                courseTitle: '冥想与放松',
                date: new Date('2025-05-01'),
                time: '14:00-16:00',
                location: '和平瑜伽中心 - 中山店',
                instructor: {
                    name: '张老师',
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Pending,
                points: 4,
            },
            {
                id: 3,
                userId: 1,
                courseId: 102,
                courseTitle: '冥想与放松',
                date: new Date('2025-05-01'),
                time: '14:00-16:00',
                location: '和平瑜伽中心 - 中山店',
                instructor: {
                    name: '张老师',
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Pending,
                points: 3,
            },
            {
                id: 4,
                userId: 1,
                courseId: 103,
                courseTitle: '高级瑜伽课程',
                date: new Date('2025-05-04'),
                time: '18:00-20:00',
                location: '和平瑜伽中心 - 信义店',
                instructor: {
                    name: '王老师',
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Canceled,
                points: 4,
            },
            {
                id: 5,
                userId: 1,
                courseId: 104,
                courseTitle: '瑜伽基础课程',
                date: new Date('2025-05-05'),
                time: '10:00-12:00',
                location: '和平瑜伽中心 - 中山店',
                instructor: {
                    name: '赵老师',
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Canceled,
                points: 4,
            },
            {
                id: 6,
                userId: 1,
                courseId: 104,
                courseTitle: '12312312321',
                date: new Date('2025-05-05'),
                time: '10:00-12:00',
                location: '和平瑜伽中心 - 中山店',
                instructor: {
                    name: '赵老师',
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Pending,
                points: 3,
            },
        ]
        bookings.value = data
    }

    const byStatus = (s: BookingStatus) => bookings.value.filter(b => b.status === s);

    const inRange = computed(() =>
        !range.value
            ? bookings.value
            : bookings.value.filter(b =>
                b.status !== BookingStatus.Canceled &&
                b.status !== BookingStatus.Pending &&
                isWithinInterval(new Date(b.date), range.value!)
            )
    )
    const byDate = computed(() => {
        return inRange.value.reduce<Record<string, CourseBooking[]>>((map, b) => {
            if (!map[b.date.toISOString()]) {
                map[b.date.toISOString()] = []
            }
            map[b.date.toISOString()].push(b)
            return map
        }, {})
    })

    /* ---------- helpers ---------- */
    function hasTimeConflict(date: Date, time: string) {
        return bookings.value.some(
            b =>
                isEqual(new Date(b.date), date) &&
                b.time === time &&
                b.status !== BookingStatus.Canceled
        )
    }

    /* ---------- can‑book logic ---------- */
    function canBook(courseId: number, slotId: number): boolean {
        const course = courseStore.getCourseById(courseId)
        const slot = courseStore.getTimeSlotById(slotId)
        if (
            !course ||
            !slot ||
            slot.availableSeats <= 0 ||
            hasTimeConflict(slot.date, slot.time)
        ) {
            return false
        }
        return true // 可訂
    }

    /* ---------- actions ---------- */
    async function book(courseId: number, slotId: number) {
        const err = canBook(courseId, slotId)
        if (err) return { success: false, reason: err }

        const course = courseStore.getCourseById(courseId)!
        const slot = courseStore.getTimeSlotById(slotId)!

        // 1. 扣點
        userStore.adjustPoints(-course.pointsRequired)
        // 2. 減座位
        courseStore.updateAvailableSeats(slotId, -1)
        // 3. 建立本地紀錄 (實戰應從 API response)
        const newBook: CourseBooking = {
            id: Date.now(),
            userId: userStore.profile?.id!,
            courseId,
            courseTitle: course.title,
            date: new Date(slot.date.toISOString().slice(0, 10)),
            time: slot.time,
            points: course.pointsRequired,
            location: course.merchant.name,
            instructor: { name: '教練', avatar: '' },
            status: BookingStatus.Confirmed
        }
        bookings.value.push(newBook)
        return { success: true, bookingId: newBook.id }
    }

    async function cancel(id: number): Promise<Result> {
        const idx = bookings.value.findIndex(b => b.id === id)
        if (idx === -1) return { success: false, message: '預約不存在' }
        const bk = bookings.value[idx]
        if (bk.status === BookingStatus.Canceled) {
            return { success: false, message: '課程已被取消' }
        }
        // 還原座位、點數
        const course = courseStore.getCourseById(bk.courseId)
        if (course) {
            courseStore.updateAvailableSeats(/* slotId */ 0, 1)
            userStore.adjustPoints(course.pointsRequired)
        }
        bk.status = BookingStatus.Canceled
        return { success: true, message: '您的課程已取消' }
    }

    /* ---------- expose ---------- */
    return {
        bookings,
        range,
        inRange,
        byDate,
        byStatus,
        fetchBookings,
        setRange: (s: Date, e: Date) => (range.value = { start: s, end: e }),
        canBook,
        book,
        cancel
    }
})
