import type { Course, Booking, CourseSession } from '@/types';
import type { Result } from '@/types';
import { CourseService } from './CourseService';
import { BookingStatus } from '@/enums/BookingStatus';

export const BookingService = {
    /**
     * 获取用户的所有预约记录
     * @param userId 用户ID
     * @returns 预约记录列表Promise
     */
    async getUserBookings(userId: number): Promise<Booking[]> {
        try {
            // TODO: 实际环境调用后端API
            // API: GET /api/users/{userId}/bookings
            
            // 模拟数据 - 增加需要显示的字段
            const mockBookings: Booking[] = [
                {
                    id: 1,
                    userId: userId,
                    sessionId: 101,
                    points: 45,
                    status: BookingStatus.Canceled,
                    createdAt: new Date('2025-05-09'),
                    // 添加显示所需字段
                    courseTitle: '瑜伽入門班',
                    date: new Date('2025-05-09'),
                    time: '9:00 - 11:00',
                    location: '台北市信義區松仁路100號',
                    merchantName: '健康生活館',
                    instructor: {
                        id: 201,
                        name: '王老師',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
                    }
                },
                {
                    id: 2,
                    userId: userId,
                    sessionId: 102,
                    points: 60,
                    status: BookingStatus.Pending,
                    createdAt: new Date('2025-05-20'),
                    // 添加显示所需字段
                    courseTitle: '高強度間歇訓練',
                    date: new Date('2025-05-20'),
                    time: '14:00 - 16:00',
                    location: '台北市大安區復興南路70號',
                    merchantName: '強健健身房',
                    instructor: {
                        id: 202,
                        name: '李教練',
                        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
                    }
                },
                {
                    id: 3,
                    userId: userId,
                    sessionId: 103,
                    points: 35,
                    status: BookingStatus.Confirmed,
                    createdAt: new Date('2025-05-30'),
                    // 添加显示所需字段
                    courseTitle: '水中有氧',
                    date: new Date('2025-05-30'),
                    time: '10:30 - 12:00',
                    location: '台北市中山區民生東路三段51號',
                    merchantName: '海洋游泳池',
                    instructor: {
                        id: 203,
                        name: '張教練',
                        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
                    }
                },
                {
                    id: 4,
                    userId: userId,
                    sessionId: 104,
                    points: 50,
                    status: BookingStatus.Confirmed,
                    createdAt: new Date('2025-06-05'),
                    // 添加显示所需字段
                    courseTitle: '冥想放鬆課',
                    date: new Date('2025-06-05'),
                    time: '19:00 - 20:30',
                    location: '台北市內湖區內湖路一段285號',
                    merchantName: '心靈休憩中心',
                    instructor: {
                        id: 204,
                        name: '陳老師',
                        avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
                    }
                },
                {
                    id: 5,
                    userId: userId,
                    sessionId: 105,
                    points: 70,
                    status: BookingStatus.Confirmed,
                    createdAt: new Date('2025-06-15'),
                    // 添加显示所需字段
                    courseTitle: '拳擊體驗',
                    date: new Date('2025-06-15'),
                    time: '18:00 - 20:00',
                    location: '台北市松山區南京東路四段133號',
                    merchantName: '格鬥健身俱樂部',
                    instructor: {
                        id: 205,
                        name: '黃教練',
                        avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
                    }
                }
            ];
            
            return mockBookings;
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
        timeSlots: CourseSession[];
        bookingStatus: {
            canBook: boolean;
            conflictSlots: number[];
        };
    }> {
        try {
            // TODO: 实际环境可以改为单一API调用
            // API: GET /api/bookings/course/{courseId}/detail
            
            // 1. 获取课程详情和时间槽
            const { course, timeSlots } = await CourseService.fetchCourseDetail(courseId);
            
            // 2. 获取用户当前的预约情况，检查时间冲突
            // 实际应用中，这部分应该从后端返回
            const conflictSlots: number[] = [];
            
            // 在此示例中，我们模拟时间冲突检查
            // 实际应用应由后端完成，或在前端逻辑中实现
            
            return {
                course,
                timeSlots,
                bookingStatus: {
                    canBook: true, // 默认可预约
                    conflictSlots // 冲突的时间槽ID列表
                }
            };
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
            // TODO: 实际环境调用后端API
            // API: POST /api/bookings
            // 请求体: { userId, courseId, timeSlotId }
            
            // 模拟创建预约的结果
            const bookingId = Date.now(); // 模拟生成预约ID
            
            return {
                success: true,
                message: '预约成功',
                data: { bookingId }
            };
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
            // TODO: 实际环境调用后端API
            // API: PUT /api/bookings/{bookingId}/cancel
            
            // 模拟取消预约的结果
            return {
                success: true,
                message: '您的预约已成功取消'
            };
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
            // TODO: 实际环境调用后端API
            // API: GET /api/bookings/check?userId={userId}&courseId={courseId}&timeSlotId={timeSlotId}
            
            // 模拟检查预约可用性的结果
            return {
                canBook: true
            };
        } catch (error) {
            console.error('检查预约可用性失败:', error);
            return {
                canBook: false,
                reason: error instanceof Error ? error.message : '检查预约可用性失败'
            };
        }
    }
}; 