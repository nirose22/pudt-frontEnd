import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { PhotoItem } from '@/types'
import { apiClient } from '@/utils/api'
import { ERROR_MESSAGES, API_ROUTES } from '@/utils/apiConfig'
import { request, buildQueryString } from '@/utils/requestHelper'

export class CourseService {
    /* ----------------- List & Detail ----------------- */
    static getCourse(keyword?: string, regions?: string[], categories?: string[]) {
        const queryString = buildQueryString({ 
            keyword, 
            regions: regions?.join(','), 
            categories: categories?.join(','),
            includeCategories: 'true'
        })
        const url = `${API_ROUTES.COURSE.LIST}${queryString}`
        return request<Course[]>(() => apiClient.get(url))
    }

    static fetchCourseDetail(courseId: number) {
        return request<CourseDetailDTO>(
            () => apiClient.get(API_ROUTES.COURSE.DETAIL(courseId)),
        )
    }
    /* ----------------- Popular & Recommendations & Latest ----------------- */
    /**
     * 獲取熱門課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Course[]>
     */
    static getPopularCourses(limit: number = 6) {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.POPULAR}${queryString}`
        return request<Course[]>(() => apiClient.get(url))
    }

    /**
     * 獲取最新上架課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Course[]>
     */
    static getLatestCourses(limit: number = 6) {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.LATEST}${queryString}`
        return request<Course[]>(() => apiClient.get(url))
    }

    /**
     * 獲取個人化推薦課程
     * @param userId 用戶ID
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Course[]>
     */
    static async getRecommendedCourses(userId: number, limit: number = 6) {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.RECOMMENDED(userId)}${queryString}`
        return request<Course[]>(() => apiClient.get(url))
    }
    
    /* ----------------- Sessions ----------------- */
    static getSessionsForCourse(courseId: number) {
        return request<CourseSession[]>(() => apiClient.get(API_ROUTES.COURSE.SESSIONS(courseId)))
    }

    /* ----------------- Favorites ----------------- */
    static getUserFavorites(userId: number) {
        return request<Course[]>(() => apiClient.get(API_ROUTES.USER.FAVORITES(userId)))
    }

    static addFavorite(userId: number, courseId: number) {
        return request<void>(() => apiClient.post(API_ROUTES.USER.FAVORITES(userId), { courseId }))
    }

    static removeFavorite(userId: number, courseId: number) {
        return request<void>(() => apiClient.delete(API_ROUTES.USER.FAVORITES(userId), { data: { courseId } }))
    }

    /* ----------------- Images ----------------- */
    static getCourseImages(courseId: number) {
        return request<PhotoItem[]>(() => apiClient.get(API_ROUTES.COURSE.IMAGES(courseId)))
    }

    /* ----------------- CRUD ----------------- */
    static createCourse(course: CourseDetailDTO) {
        return request<CourseDetailDTO>(() => apiClient.post(API_ROUTES.COURSE.LIST, course))
    }

    static updateCourse(courseId: number, course: CourseDetailDTO) {
        return request<CourseDetailDTO>(() => apiClient.put(API_ROUTES.COURSE.DETAIL(courseId), course))
    }
}
