// stores/bookingStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import type { CourseBooking } from '@/types/course';
import { BookingStatus } from '@/enums/bookingStatus';


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
      
      // 更新本地状态
      userBookings.value = userBookings.value.filter(booking => booking.id !== bookingId);
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
    setDateRange,
    fetchUserBookings,
    cancelBooking
  };
}); 