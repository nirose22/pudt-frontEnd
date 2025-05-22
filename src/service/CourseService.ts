import type { Course, CourseDetailDTO, CourseSession } from "@/types/course";
import type { PhotoItem, Result } from "@/types";
import { MerchantService } from "./MerchantService";
import { generateMockCourses } from "./MockService";

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
    getCourse(keyword?: string, regions?: string[], categories?: string[]): Promise<Course[]> {
        // TODO: 构建查询参数并调用后端API
        // API: /api/courses?keyword=xxx&regions=xxx&categories=xxx
        // 在实际应用中，这里应该将参数拼接到请求URL
        
        return Promise.resolve(generateMockCourses());
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
            // TODO: 实际环境可以改为单一API调用
            // API: GET /api/courses/{courseId}/detail
            
            // 获取课程基本信息
            const courseData = generateMockCourses().find(c => c.id === courseId);
            
            if (!courseData) {
                throw new Error(`找不到ID为${courseId}的课程`);
            }
            
            // 获取商家信息
            const merchant = await MerchantService.getMerchant(courseData.merchantId);
            
            // 获取课程时间
            const timeSlots = await this.getSessionsForCourse(courseId);

            // 获取课程图片
            const images = await this.getCourseImages(courseId);

            
            
            // 构建课程详情
            const courseDetail: CourseDetailDTO = {
                ...courseData,
                merchant,
                sessions: timeSlots,
                coverUrl: 'https://picsum.photos/300/200',
                joinCount: Math.floor(Math.random() * 20) + 5,
                recommended: courseData.id % 3 === 0, // 随机设置部分课程为推荐
                images: images, // 添加 images 属性
            };
            
            return { course: courseDetail, sessions: timeSlots };
            
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
        // TODO: API调用
        // API: /api/courses/{courseId}/sessions
        
        // 生成时间段
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
    },
    
    /**
     * 获取用户收藏的课程
     * @param userId 用户ID
     * @returns 收藏的课程列表
     */
    async getUserFavorites(userId: number): Promise<Result<Course[]>> {
        try {
            // TODO: API调用
            // API: /api/users/{userId}/favorites
            
            // 模拟数据 - 从所有课程中随机选择几个作为收藏
            const allCourses = generateMockCourses();
            const favorites = allCourses
                .filter((_, index) => index % 4 === 0) // 选择部分课程作为收藏
                .slice(0, 5);
            
            return { success: true, data: favorites };
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
            // TODO: API调用
            // API: POST /api/users/{userId}/favorites
            
            return { success: true, message: "成功添加到收藏" };
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
            // TODO: API调用
            // API: DELETE /api/users/{userId}/favorites/{courseId}
            
            return { success: true, message: "成功从收藏中移除" };
        } catch (error) {
            console.error("移除收藏失败:", error);
            return { success: false, message: "移除收藏失败" };
        }
    },

    async getCourseImages(courseId: number): Promise<PhotoItem[]> {
        // TODO: API调用
        // API: /api/courses/{courseId}/images
        
        // 模拟数据
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
    }
}