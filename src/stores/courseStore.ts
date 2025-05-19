import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef } from 'vue';
import { CourseService } from '@/service/CourseService';
import type { Course, CourseDTO, CourseDetailDTO, CourseSession } from '@/types/course';
import type { Booking } from '@/types/booking';
import type { Result } from '@/types';
import { BookingStatus } from '@/enums/BookingStatus';

/**
 * 课程管理 Store
 * 统一处理课程相关逻辑，包括课程列表、详情、收藏和预订
 */
export const useCourseStore = defineStore('course', () => {
  // 状态
  const allCourses = ref<CourseDTO[]>([]);
  const myBookings = ref<Booking[]>([]);
  const favoriteCourses = ref<CourseDTO[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // 当前课程详情相关状态
  const currentCourse = ref<CourseDetailDTO>();
  const courseSession = ref<CourseSession[]>([]);
  const selectedSession = ref<CourseSession | null>(null);

  // 计算属性
  const popularCourses: ComputedRef<CourseDTO[]> = computed(() => {
    return [...allCourses.value]
      .sort((a, b) => (b.joinCount || 0) - (a.joinCount || 0))
      .slice(0, 6);
  });

  const latestCourses: ComputedRef<CourseDTO[]> = computed(() => {
    return [...allCourses.value]
      .sort((a, b) => {
        const aDate = a.createdAt;
        const bDate = b.createdAt;
        if (aDate && bDate) {
          return bDate.getTime() - aDate.getTime();
        }
        return b.id - a.id;
      })
      .slice(0, 6);
  });

  const recommendedCourses: ComputedRef<CourseDTO[]> = computed(() => {
    return [...allCourses.value]
      .filter(course => course.recommended)
      .slice(0, 6);
  });

  // 检查课程时段是否有可用座位
  const hasAvailableSeats = computed(() => {
    return selectedSession.value && selectedSession.value.seatsLeft > 0;
  });

  /**
   * 获取所有课程列表
   * @param keyword 搜索关键词
   * @param regions 区域筛选
   * @param categories 分类筛选
   */
  const fetchCourses = async (keyword?: string, regions?: string[], categories?: string[]): Promise<Result<CourseDTO[]>> => {
    isLoading.value = true;
    error.value = null;

    try {
      // 调用CourseService的getCourse方法
      const data = await CourseService.getCourse(keyword, regions, categories);
      console.log('data', data);
      
      allCourses.value = data;
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取课程数据时出错';
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 加载课程详情和时间槽
   * @param courseId 课程ID
   */
  const loadCourseDetail = async (courseId: number): Promise<Result<CourseDetailDTO>> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { course, timeSlots } = await CourseService.fetchCourseDetail(courseId);
      currentCourse.value = course;
      courseSession.value = timeSlots;
      return { success: true, data: course };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载课程详情失败';
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 获取用户已报名的课程
   * @param userId 用户ID
   */
  const fetchMyBookings = async (userId: number): Promise<Result<Booking[]>> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await CourseService.getUserBookings(userId);
      if (result.success && result.data) {
        myBookings.value = result.data;
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取已报名课程失败';
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 获取用户收藏的课程
   * @param userId 用户ID
   */
  const fetchFavoriteCourses = async (userId: number): Promise<Result<CourseDTO[]>> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await CourseService.getUserFavorites(userId);
      if (result.success && result.data) {
        favoriteCourses.value = result.data;
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取收藏课程失败';
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 更新课程时段的可用座位
   * @param sessionId 时段ID
   * @param change 变更数量(正数增加座位,负数减少座位)
   */
  const updateAvailableSeats = (sessionId: number, change: number): boolean => {
    const slot = courseSession.value.find(s => s.id === sessionId);
    if (slot) {
      slot.seatsLeft += change;
      // 确保座位数不会小于0或超过总座位数
      slot.seatsLeft = Math.max(0, Math.min(slot.seatsLeft, slot.seats));
      return true;
    }
    return false;
  };

  /**
   * 根据ID获取课程时间槽
   * @param sessionId 时段ID
   */
  const getSessionById = (sessionId: number): CourseSession | null => {
    return courseSession.value.find(slot => slot.id === sessionId) || null;
  };

  /**
   * 设置选择的时间槽
   * @param sessionId 时段ID
   */
  const selectSession = (sessionId: number): boolean => {
    const slot = getSessionById(sessionId);
    if (slot) {
      selectedSession.value = slot;
      return true;
    }
    return false;
  };

  /**
   * 添加收藏课程
   * @param courseId 课程ID
   * @param userId 用户ID
   */
  const addFavoriteCourse = async (courseId: number, userId: number): Promise<Result> => {
    try {
      const result = await CourseService.addFavorite(userId, courseId);
      if (result.success) {
        // 找到课程并添加到收藏
        const course = allCourses.value.find(c => c.id === courseId);
        if (course && !favoriteCourses.value.some(c => c.id === courseId)) {
          favoriteCourses.value.push(course);
        }
      }
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : '添加收藏失败' 
      };
    }
  };

  /**
   * 移除收藏课程
   * @param courseId 课程ID
   * @param userId 用户ID
   */
  const removeFavoriteCourse = async (courseId: number, userId: number): Promise<Result> => {
    try {
      const result = await CourseService.removeFavorite(userId, courseId);
      if (result.success) {
        // 从收藏中移除
        favoriteCourses.value = favoriteCourses.value.filter(c => c.id !== courseId);
      }
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : '移除收藏失败' 
      };
    }
  };

  /**
   * 检查课程是否已收藏
   * @param courseId 课程ID
   */
  const isFavorite = (courseId: number): boolean => {
    return favoriteCourses.value.some(c => c.id === courseId);
  };

  /**
   * 创建课程预订
   * @param courseId 课程ID
   * @param sessionId 课程时段ID
   * @returns 操作结果
   */
  const bookCourse = async (courseId: number, sessionId: number): Promise<Result> => {
    try {
      if (!selectedSession.value) {
        return { success: false, message: '请选择课程时段' };
      }
      
      // 这里需要通过userStore获取userId，但在store中我们不直接引用其他store
      // 由调用方提供userId
      const result = await CourseService.createBooking(0, sessionId);
      if (result.success) {
        // 更新课程时段的剩余座位
        updateAvailableSeats(sessionId, -1);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '课程预订失败';
      return { success: false, message: errorMessage };
    }
  };
  
  /**
   * 取消课程预订
   * @param bookingId 预订ID
   * @returns 操作结果
   */
  const cancelBooking = async (bookingId: number): Promise<Result> => {
    try {
      const booking = myBookings.value.find(b => b.id === bookingId);
      if (!booking) {
        return { success: false, message: '找不到对应的预订记录' };
      }
      
      const result = await CourseService.cancelBooking(bookingId);
      if (result.success) {
        // 更新本地预订状态
        booking.status = BookingStatus.Canceled;
        
        // 如果能找到对应的时间槽，更新座位数
        const sessionId = booking.sessionId;
        updateAvailableSeats(sessionId, 1);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '取消预订失败';
      return { success: false, message: errorMessage };
    }
  };

  return {
    // 状态
    allCourses,
    myBookings,
    favoriteCourses,
    currentCourse,
    courseSession,
    selectedSession,
    isLoading,
    error,

    // 计算属性
    popularCourses,
    latestCourses,
    recommendedCourses,
    hasAvailableSeats,

    // 方法
    fetchCourses,
    loadCourseDetail,
    fetchMyBookings,
    fetchFavoriteCourses,
    updateAvailableSeats,
    getSessionById,
    selectSession,
    addFavoriteCourse,
    removeFavoriteCourse,
    isFavorite,
    bookCourse,
    cancelBooking
  };
}); 