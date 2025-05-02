// stores/bookingStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { addDays, parseISO } from 'date-fns';
import type { CourseBooking } from '@/types/course';
import { BookingStatus } from '@/enums/bookingStatus';
import { useCourseStore } from './courseStore';
import { useUserStore } from './userStore';


export const useBookingStore = defineStore('booking', () => {
    // 用户所有预约的课程
    const userBookings = ref<CourseBooking[]>([
        {
            id: 1,
            userId: 1,
            courseId: 101,
            courseTitle: '初级瑜伽课程',
            date: '2025-05-01',
            time: '10:00-12:00',
            location: '和平瑜伽中心 - 信义店',
            instructor: {
                name: '李老师',
                avatar: 'https://via.placeholder.com/50',
            },
            status: BookingStatus.Confirmed,
        },
        {
            id: 2,
            userId: 1,
            courseId: 102,
            courseTitle: '冥想与放松',
            date: '2025-05-01',
            time: '14:00-16:00',
            location: '和平瑜伽中心 - 中山店',
            instructor: {
                name: '张老师',
                avatar: 'https://via.placeholder.com/50',
            },
            status: BookingStatus.Pending,
        },
        {
            id: 3,
            userId: 1,
            courseId: 103,
            courseTitle: '高级瑜伽课程',
            date: '2025-05-04',
            time: '18:00-20:00',
            location: '和平瑜伽中心 - 信义店',
            instructor: {
                name: '王老师',
                avatar: 'https://via.placeholder.com/50',
            },
            status: BookingStatus.Canceled,
        },
        {
            id: 4,
            userId: 1,
            courseId: 104,
            courseTitle: '瑜伽基础课程',
            date: '2025-05-05',
            time: '10:00-12:00',
            location: '和平瑜伽中心 - 中山店',
            instructor: {
                name: '赵老师',
                avatar: 'https://via.placeholder.com/50',
            },
            status: BookingStatus.Canceled
        },
    ]);

    // 当前选择的日期范围
    const selectedDateRange = ref({
        start: new Date(),
        end: addDays(new Date(), 5)
    });

    // 检查用户是否可以预约课程
    const canBookCourse = (courseId: number, timeSlotId: number) => {
        const courseStore = useCourseStore();
        const userStore = useUserStore();
        
        // 获取课程信息
        const course = courseStore.getCourseById(courseId);
        if (!course) {
            return { canBook: false, reason: '課程不存在' };
        }
        
        // 获取时间槽信息
        const timeSlot = courseStore.getTimeSlotById(timeSlotId);
        if (!timeSlot) {
            return { canBook: false, reason: '所選時間不存在' };
        }
        
        // 检查是否有座位
        if (timeSlot.availableSeats <= 0) {
            return { canBook: false, reason: '該時段已無可用席位' };
        }
        
        // 检查用户点数是否足够
        if (!userStore.hasEnoughPoints(course.pointsRequired)) {
            return { 
                canBook: false, 
                reason: '點數不足', 
                missingPoints: course.pointsRequired - userStore.userPoints,
                requiredPoints: course.pointsRequired
            };
        }
        
        // 检查用户是否已经预约了相同时段的课程
        const hasConflict = userBookings.value.some(booking => 
            booking.date === timeSlot.date.toISOString().split('T')[0] &&
            booking.time === timeSlot.time &&
            booking.status !== BookingStatus.Canceled
        );
        
        if (hasConflict) {
            return { canBook: false, reason: '您已有相同時段的預約' };
        }
        
        return { canBook: true };
    };

    // 预约课程
    const bookCourse = async (courseId: number, timeSlotId: number) => {
        const courseStore = useCourseStore();
        const userStore = useUserStore();
        
        // 检查是否可以预约
        const bookingCheck = canBookCourse(courseId, timeSlotId);
        if (!bookingCheck.canBook) {
            return bookingCheck;
        }
        
        try {
            // 获取课程和时间槽信息
            const course = courseStore.getCourseById(courseId)!;
            const timeSlot = courseStore.getTimeSlotById(timeSlotId)!;
            
            // 在实际应用中，这里应该是API调用
            // const response = await axios.post('/api/bookings', { 
            //     courseId, 
            //     timeSlotId,
            //     userId: userStore.userId 
            // });
            
            // 扣除用户点数
            const deductResult = await userStore.deductPoints(course.pointsRequired);
            if (!deductResult.success) {
                return { canBook: false, reason: '扣除點數失敗' };
            }
            
            // 更新课程座位
            courseStore.updateAvailableSeats(timeSlotId, -1);
            
            // 创建本地预约记录
            const newBooking: CourseBooking = {
                id: Date.now(), // 临时ID，实际应用中应使用后端返回的ID
                userId: userStore.userId || 1,
                courseId: courseId,
                courseTitle: course.title,
                date: timeSlot.date.toISOString().split('T')[0],
                time: timeSlot.time,
                location: course.merchant.name,
                instructor: {
                    name: '教練', // 实际应用中应从API获取
                    avatar: 'https://via.placeholder.com/50',
                },
                status: BookingStatus.Confirmed,
            };
            
            userBookings.value.push(newBooking);
            
            return { 
                canBook: true, 
                success: true, 
                bookingId: newBooking.id, 
                remainingPoints: deductResult.remainingPoints 
            };
        } catch (error) {
            console.error('預約課程失敗:', error);
            return { canBook: false, success: false, reason: '預約過程中發生錯誤', error };
        }
    };

    // 获取特定日期范围内的预约
    const getBookingsInRange = computed(() => {
        return userBookings.value.filter(booking => {
            const bookingDate = parseISO(booking.date);
            return bookingDate >= selectedDateRange.value.start &&
                bookingDate <= selectedDateRange.value.end;
        });
    });

    // 按日期分组的预约
    const bookingsByDate = computed(() => {
        const result: Record<string, CourseBooking[]> = {};

        getBookingsInRange.value.forEach(booking => {
            if (!result[booking.date]) {
                result[booking.date] = [];
            }
            result[booking.date].push(booking);
        });
        return result;
    });

    // 获取用户的特定状态预约
    const getBookingsByStatus = (status: BookingStatus) => {
        return userBookings.value.filter(booking => booking.status === status);
    };

    // 设置日期范围
    const setDateRange = (start: Date, end: Date) => {
        selectedDateRange.value = { start, end };
    };

    // 获取用户的所有预约（从后端）
    const fetchUserBookings = async (userId: number) => {
        try {
            // 实际应用中，这里应该调用API
            // const response = await axios.get(`/api/users/${userId}/bookings`);
            // userBookings.value = response.data;
            console.log('Fetching bookings for user:', userId);
            // 模拟请求，实际项目中移除此行
            return { success: true };
        } catch (error) {
            console.error('获取预约失败:', error);
            return { success: false, error };
        }
    };

    // 取消预约
    const cancelBooking = async (bookingId: number) => {
        try {
            // 实际应用中，这里应该调用API
            // await axios.delete(`/api/bookings/${bookingId}`);
            
            // 查找预约记录
            const bookingIndex = userBookings.value.findIndex(b => b.id === bookingId);
            if (bookingIndex === -1) {
                return { success: false, reason: '預約不存在' };
            }
            
            const booking = userBookings.value[bookingIndex];
            
            // 确保预约未被取消
            if (booking.status === BookingStatus.Canceled) {
                return { success: false, reason: '預約已被取消' };
            }
            
            // 更新预约状态
            booking.status = BookingStatus.Canceled;
            
            // 在实际应用中，可能需要还原用户点数
            const userStore = useUserStore();
            const courseStore = useCourseStore();
            
            // 获取课程信息
            const course = courseStore.getCourseById(booking.courseId);
            if (course) {
                // 还原用户点数
                await userStore.addPoints(course.pointsRequired);
                
                // 还原课程座位
                // 注意：需要知道具体的时间槽ID
                // courseStore.updateAvailableSeats(timeSlotId, 1);
            }
            
            return { success: true };
        } catch (error) {
            console.error('取消预约失败:', error);
            return { success: false, error };
        }
    };

    return {
        userBookings,
        selectedDateRange,
        getBookingsInRange,
        bookingsByDate,
        canBookCourse,
        bookCourse,
        getBookingsByStatus,
        setDateRange,
        fetchUserBookings,
        cancelBooking
    };
}); 