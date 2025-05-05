// stores/bookingStore.ts
import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { isEqual, isWithinInterval } from 'date-fns'
import type { CourseBooking, Result } from '@/types'
import { BookingStatus } from '@/enums/bookingStatus'
import { useCourseStore } from './courseStore'
import { useUserStore } from './userStore'

export const useBookingStore = defineStore('booking', () => {
    /* ---------- state ---------- */
    const range = ref<{ start: Date; end: Date } | null>(null)

    const courseStore = useCourseStore()
    const userStore = useUserStore()
    // const userBookings = ref<CourseBooking[]>([])
    const userBookings = ref<CourseBooking[]>([])
    /* ---------- getters ---------- */
    onMounted(async () => {
        await fetchBookings()
    })

    const fetchBookings = async () => {
        try {
            const bookings = await userStore.fetchBookings()
            userBookings.value = bookings
        } catch (err) {
            console.error('取得訂單失敗', err)
            const res: Result = {
                success: false,
                error: err
            }
            return res
        }
    }

    const inRange = computed(() =>
        !range.value
            ? userBookings.value
            : userBookings.value.filter(b =>
                isWithinInterval(new Date(b.date), range.value!)
            )
    )
    const byDate = computed(() => {
        return inRange.value.reduce<Record<string, CourseBooking[]>>((map, b) => {
            if (!map[b.date]) {
                map[b.date] = []
            }
            map[b.date].push(b)
            return map
        }, {})
    })
    const byStatus = (s: BookingStatus) => userBookings.value.filter(b => b.status === s);

    /* ---------- helpers ---------- */
    function hasTimeConflict(date: Date, time: string) {
        return userBookings.value.some(
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
        userStore.adjustPoints(course.pointsRequired)
        // 2. 減座位
        courseStore.updateAvailableSeats(slotId, -1)
        // 3. 建立本地紀錄 (實戰應從 API response)
        const newBook: CourseBooking = {
            id: Date.now(),
            userId: userStore.profile?.id!,
            courseId,
            courseTitle: course.title,
            date: slot.date.toISOString().slice(0, 10),
            time: slot.time,
            location: course.merchant.name,
            instructor: { name: '教練', avatar: '' },
            status: BookingStatus.Confirmed
        }
        userBookings.value.push(newBook)
        return { success: true, bookingId: newBook.id }
    }

    async function cancel(id: number) {
        const idx = userBookings.value.findIndex(b => b.id === id)
        if (idx === -1) return { success: false, reason: '預約不存在' }
        const bk = userBookings.value[idx]
        if (bk.status === BookingStatus.Canceled)
            return { success: false, reason: '已取消' }

        // 還原座位、點數
        const course = courseStore.getCourseById(bk.courseId)
        if (course) {
            courseStore.updateAvailableSeats(/* slotId */ 0, 1)
            userStore.adjustPoints(course.pointsRequired)
        }
        bk.status = BookingStatus.Canceled
        return { success: true }
    }

    /* ---------- expose ---------- */
    return {
        userBookings,
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
},
    //   {
    //     /* 持久化（可選） */
    //     persist: true
    //   }
)
