import type { Course, CourseDetailDTO, CourseSession } from "@/types/course";
import type { PhotoItem, Result } from "@/types";
import { MerchantService } from "./MerchantService";
import { generateMockCourses } from "./MockService";
import apiClient from '@/utils/api';
import { API_ROUTES } from '@/utils/apiConfig';

/**
 * 课程服务 - 负责所有与课程相关的API调用
 */
export const CourseService = {
    /**
     * 获取课程列表
     * @param keyword 搜索关键词
     * @param regions 区域筛选
     * @param categories 分类筛选
     * @returns 课程列表
     */
    async getCourse(keyword?: string, regions?: string[], categories?: string[]): Promise<Course[]> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get<Course[]>('/courses', {
                params: { keyword, regions, categories }
            });
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            return Promise.resolve(generateMockCourses());
            */
        } catch (error) {
            console.error('获取课程列表失败:', error);
            throw error;
        }
    },

    /**
     * 获取课程详情
     * @param courseId 课程ID
     * @returns 课程详情和可用时间
     */
    async fetchCourseDetail(courseId: number): Promise<{
        course: CourseDetailDTO;
        sessions: CourseSession[];
    }> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get(`/courses/${courseId}/detail`);
            
            /* 暫時保留原有邏輯，待後端 API 完成後移除
            const courseData = generateMockCourses().find(c => c.id === courseId);
            
            if (!courseData) {
                throw new Error(`找不到ID为${courseId}的课程`);
            }
            
            const merchant = await MerchantService.getMerchant(courseData.merchantId);
            const timeSlots = await this.getSessionsForCourse(courseId);
            const images = await this.getCourseImages(courseId);
            
            const courseDetail: CourseDetailDTO = {
                ...courseData,
                merchant,
                sessions: timeSlots,
                coverUrl: 'https://picsum.photos/300/200',
                joinCount: Math.floor(Math.random() * 20) + 5,
                recommended: courseData.id % 3 === 0,
                images: images,
            };
            
            return { course: courseDetail, sessions: timeSlots };
            */
        } catch (error) {
            console.error("获取课程详情失败:", error);
            throw error;
        }
    },
    
    /**
     * 获取课程的所有时间段
     * @param courseId 课程ID
     * @returns 课程时间段列表
     */
    async getSessionsForCourse(courseId: number): Promise<CourseSession[]> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get<CourseSession[]>(`/courses/${courseId}/sessions`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            const sessions: CourseSession[] = [];
            const currentDate = new Date();
            
            for (let i = 1; i <= 7; i++) {
                const date = new Date();
                date.setDate(currentDate.getDate() + i);
                
                sessions.push({
                    id: sessions.length + 1,
                    courseId: courseId,
                    date: date,
                    start: "10:00",
                    end: "12:00",
                    seats: 15,
                    seatsLeft: Math.floor(Math.random() * 15)
                });
                
                sessions.push({
                    id: sessions.length + 1,
                    courseId: courseId,
                    date: date,
                    start: "14:00",
                    end: "16:00",
                    seats: 15,
                    seatsLeft: Math.floor(Math.random() * 15)
                });
            }
            
            return sessions;
            */
        } catch (error) {
            console.error('获取课程时间段失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取用户收藏的课程
     * @param userId 用户ID
     * @returns 收藏的课程列表
     */
    async getUserFavorites(userId: number): Promise<Result<Course[]>> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get<Result<Course[]>>(`/users/${userId}/favorites`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            const allCourses = generateMockCourses();
            const favorites = allCourses
                .filter((_, index) => index % 4 === 0)
                .slice(0, 5);
            
            return { success: true, data: favorites };
            */
        } catch (error) {
            console.error("获取用户收藏失败:", error);
            return { success: false, message: "获取用户收藏失败" };
        }
    },
    
    /**
     * 添加课程到收藏
     * @param userId 用户ID
     * @param courseId 课程ID
     * @returns 操作结果
     */
    async addFavorite(userId: number, courseId: number): Promise<Result> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.post<Result>(`/users/${userId}/favorites`, { courseId });
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            return { success: true, message: "成功添加到收藏" };
            */
        } catch (error) {
            console.error("添加收藏失败:", error);
            return { success: false, message: "添加收藏失败" };
        }
    },
    
    /**
     * 从收藏中移除课程
     * @param userId 用户ID
     * @param courseId 课程ID
     * @returns 操作结果
     */
    async removeFavorite(userId: number, courseId: number): Promise<Result> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.delete<Result>(`/users/${userId}/favorites/${courseId}`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            return { success: true, message: "成功从收藏中移除" };
            */
        } catch (error) {
            console.error("移除收藏失败:", error);
            return { success: false, message: "移除收藏失败" };
        }
    },

    async getCourseImages(courseId: number): Promise<PhotoItem[]> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get<PhotoItem[]>(`/courses/${courseId}/images`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            const images: PhotoItem[] = [
                {
                    id: 1,
                    imageSrc: "https://picsum.photos/id/20/300/200",
                    alt: "Image 1",
                    thumbnail: "https://picsum.photos/id/20/100/80",
                },
                {
                    id: 2,
                    imageSrc: "https://picsum.photos/id/21/300/200",
                    alt: "Image 2",
                    thumbnail: "https://picsum.photos/id/21/100/80",
                },
                {
                    id: 3,
                    imageSrc: "https://picsum.photos/id/22/300/200",
                    alt: "Image 3",
                    thumbnail: "https://picsum.photos/id/22/100/80",
                },
                {
                    id: 4,
                    imageSrc: "https://picsum.photos/id/23/300/200",
                    alt: "Image 4",
                    thumbnail: "https://picsum.photos/id/23/100/80",
                },
            ];
            return images;
            */
        } catch (error) {
            console.error('获取课程图片失败:', error);
            throw error;
        }
    }
}