import type { Course, Booking, CourseSession } from '@/types';
import type { Result } from '@/types';
import { CourseService } from './CourseService';
import { BookingStatus } from '@/enums/BookingStatus';
import apiClient from '@/utils/api';
import { API_ROUTES } from '@/utils/apiConfig';

export const BookingService = {
    /**
     * 获取用户的所有预约记录
     * @param userId 用户ID
     * @returns 预约记录列表Promise
     */
    async getUserBookings(userId: number): Promise<Booking[]> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get<Booking[]>(`/users/${userId}/bookings`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

            const mockBookings: Booking[] = [
                {
                    id: 101,
                    courseId: 1,
                    courseTitle: '瑜珈初階班',
                    date: today,
                    start: "11:00",
                    end: "12:00",
                    points: 25,
                    status: BookingStatus.Pending,
                    merchantName: '健康生活館',
                    location: '台北市信義區松仁路100號',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    instructor: {
                        id: 201,
                        name: '王老師',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
                    }
                },
                {
                    id: 102,
                    courseId: 2,
                    courseTitle: '烹飪課程：義式料理',
                    date: tomorrow,
                    start: "10:00",
                    end: "12:00",
                    points: 30,
                    status: BookingStatus.Confirmed,
                    merchantName: '美食烹飪學校',
                    location: '台北市大安區復興南路70號',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    instructor: {
                        id: 202,
                        name: '李教練',
                        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
                    }
                },
                {
                    id: 103,
                    courseId: 3,
                    courseTitle: '水彩畫入門',
                    date: dayAfterTomorrow,
                    start: "15:30",
                    end: "17:30",
                    points: 20,
                    status: BookingStatus.Completed,
                    merchantName: '藝術工作室',
                    location: '台北市中山區民生東路三段51號',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    instructor: {
                        id: 203,
                        name: '張教練',
                        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
                    }
                },
                {
                    id: 104,
                    courseId: 1,
                    courseTitle: '瑜珈初階班',
                    date: new Date(),
                    start: "14:00",
                    end: "16:00",
                    points: 25,
                    status: BookingStatus.Cancelled,
                    merchantName: '健康生活館',
                    location: '台北市信義區松仁路100號',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    instructor: {
                        id: 201,
                        name: '王老師',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
                    }
                },
                {
                    id: 105,
                    courseId: 2,
                    courseTitle: '烹飪課程：義式料理',
                    date: new Date(),
                    start: "10:00",
                    end: "12:00",
                    points: 30,
                    status: BookingStatus.NoShow,
                    merchantName: '美食烹飪學校',
                    location: '台北市大安區復興南路70號',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    instructor: {
                        id: 202,
                        name: '李教練',
                        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
                    }
                }
            ];

            return mockBookings;
            */
        } catch (error) {
            console.error('获取用户预约记录失败:', error);
            throw error;
        }
    },

    /**
     * 获取课程详细预约信息（整合课程、商家、时段信息）
     * @param courseId 课程ID
     * @returns 课程详情、时间槽和可预约状态
     */
    async fetchCourseBookingDetail(courseId: number): Promise<{
        course: Course;
        sessions: CourseSession[];
        bookingStatus: {
            canBook: boolean;
            conflictSlots: number[];
        };
    }> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get(`/bookings/course/${courseId}/detail`);
            
            /* 暫時保留原有邏輯，待後端 API 完成後移除
            const { course, sessions } = await CourseService.fetchCourseDetail(courseId);
            const conflictSlots: number[] = [];
            return {
                course,
                sessions,
                bookingStatus: {
                    canBook: true,
                    conflictSlots
                }
            };
            */
        } catch (error) {
            console.error('获取课程预约详情失败:', error);
            throw error;
        }
    },

    /**
     * 创建新预约
     * @param userId 用户ID
     * @param courseId 课程ID
     * @param timeSlotId 时间槽ID
     * @returns 预约结果
     */
    async createBooking(userId: number, courseId: number, timeSlotId: number): Promise<Result> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.post<Result>('/bookings', {
                userId,
                courseId,
                timeSlotId
            });
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            const bookingId = Date.now();
            return {
                success: true,
                message: '预约成功',
                data: { bookingId }
            };
            */
        } catch (error) {
            console.error('创建预约失败:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '创建预约失败，请稍后再试'
            };
        }
    },

    /**
     * 取消预约
     * @param bookingId 预约ID
     * @returns 取消结果
     */
    async cancelBooking(bookingId: number): Promise<Result> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.put<Result>(`/bookings/${bookingId}/cancel`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            return {
                success: true,
                message: '您的预约已成功取消'
            };
            */
        } catch (error) {
            console.error('取消预约失败:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '取消预约失败，请稍后再试'
            };
        }
    },

    /**
     * 检查用户是否可以预约特定课程和时间
     * @param userId 用户ID
     * @param courseId 课程ID
     * @param timeSlotId 时间槽ID
     * @returns 是否可以预约
     */
    async checkBookingAvailability(userId: number, courseId: number, timeSlotId: number): Promise<{
        canBook: boolean;
        reason?: string;
    }> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get(`/bookings/check`, {
                params: { userId, courseId, timeSlotId }
            });
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            return {
                canBook: true
            };
            */
        } catch (error) {
            console.error('检查预约可用性失败:', error);
            return {
                canBook: false,
                reason: error instanceof Error ? error.message : '检查预约可用性失败'
            };
        }
    }
}; 