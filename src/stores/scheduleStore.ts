import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { addDays, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import type { CourseBooking } from '@/types/course';


export const useScheduleStore = defineStore('schedule', () => {
  // 所有预约
  const bookings = ref<CourseBooking[]>([]);
  // 日期范围
  const dateRange = ref<{ start: Date; end: Date }>({
    start: new Date(),
    end: addDays(new Date(), 4), // 默认5天
  });

  // 获取用户预约
  const fetchBookings = async (userId: number) => {
    try {
      // 实际应用中，这里应该是API调用
      // const response = await axios.get(`/api/users/${userId}/bookings`);
      // bookings.value = response.data;
      
      // 模拟数据
      bookings.value = [
        {
          id: 1,
          userId: 1,
          courseId: 101,
          courseTitle: '初级瑜伽课程',
          date: '2025-06-01',
          time: '10:00-12:00',
          location: '和平瑜伽中心 - 信义店',
          instructor: {
            name: '李老师',
            avatar: 'https://via.placeholder.com/50',
          },
          status: 'confirmed',
        },
        {
          id: 2,
          userId: 1,
          courseId: 102,
          courseTitle: '冥想与放松',
          date: '2025-06-02',
          time: '14:00-16:00',
          location: '和平瑜伽中心 - 中山店',
          instructor: {
            name: '张老师',
            avatar: 'https://via.placeholder.com/50',
          },
          status: 'confirmed',
        },
        {
          id: 3,
          userId: 1,
          courseId: 103,
          courseTitle: '高级瑜伽课程',
          date: '2025-06-04',
          time: '18:00-20:00',
          location: '和平瑜伽中心 - 信义店',
          instructor: {
            name: '王老师',
            avatar: 'https://via.placeholder.com/50',
          },
          status: 'confirmed',
        },
      ];
      
      return true;
    } catch (error) {
      console.error('获取预约课程失败:', error);
      return false;
    }
  };

  // 设置日期范围
  const setDateRange = (start: Date, end: Date) => {
    dateRange.value = { start, end };
  };

  // 获取特定日期范围内的预约
  const bookingsInRange = computed(() => {
    return bookings.value.filter((booking) => {
      const bookingDate = booking.date instanceof Date ? booking.date : parseISO(booking.date as string);
      return isWithinInterval(bookingDate, {
        start: startOfDay(dateRange.value.start),
        end: startOfDay(dateRange.value.end),
      });
    });
  });

  // 添加新预约
  const addBooking = async (booking: Omit<CourseBooking, 'id'>) => {
    try {
      // 实际应用中，这里应该是API调用
      // const response = await axios.post(`/api/bookings`, booking);
      // const newBooking = response.data;
      
      // 模拟新增预约
      const newBooking: CourseBooking = {
        ...booking,
        id: bookings.value.length + 1,
      };
      
      bookings.value.push(newBooking);
      return { success: true, booking: newBooking };
    } catch (error) {
      console.error('添加预约失败:', error);
      return { success: false, error };
    }
  };

  // 取消预约
  const cancelBooking = async (bookingId: number) => {
    try {
      // 实际应用中，这里应该是API调用
      // await axios.delete(`/api/bookings/${bookingId}`);
      
      // 模拟取消预约（在实际应用中，可能只是更改状态而非删除）
      const index = bookings.value.findIndex(booking => booking.id === bookingId);
      if (index !== -1) {
        bookings.value[index].status = 'canceled';
        // 或者直接移除
        // bookings.value.splice(index, 1);
      }
      
      return { success: true };
    } catch (error) {
      console.error('取消预约失败:', error);
      return { success: false, error };
    }
  };

  // 格式化日期
  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      return format(parseISO(date), 'yyyy-MM-dd');
    }
    return format(date, 'yyyy-MM-dd');
  };

  return {
    bookings,
    dateRange,
    bookingsInRange,
    fetchBookings,
    setDateRange,
    addBooking,
    cancelBooking,
    formatDate,
  };
}); 