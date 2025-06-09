import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { PhotoItem, Result } from '@/types'
import api from '@/utils/api';
import { API_ROUTES } from '@/utils/apiConfig'
import { request, buildQueryString } from '@/utils/requestHelper'

export class CourseService {
    /* ----------------- List & Detail ----------------- */
    static getCourse(keyword?: string, regions?: string[], categories?: string[]): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ 
            keyword, 
            regions: regions?.join(','), 
            categories: categories?.join(','),
            includeCategories: 'true'
        })
        const url = `${API_ROUTES.COURSE.LIST}${queryString}`
        return request<Course[]>(() => api.get(url))
    }

    static fetchCourseDetail(courseId: number): Promise<Result<CourseDetailDTO>> {
        return request<CourseDetailDTO>(
            () => api.get(API_ROUTES.COURSE.DETAIL(courseId)),
        )
    }
    /* ----------------- Popular & Recommendations & Latest ----------------- */
    /**
     * 獲取熱門課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Result<Course[]>>
     */
    static getPopularCourses(limit: number = 6): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.POPULAR}${queryString}`
        return request<Course[]>(() => api.get(url))
    }

    /**
     * 獲取最新上架課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Result<Course[]>>
     */
    static getLatestCourses(limit: number = 6): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.LATEST}${queryString}`
        return request<Course[]>(() => api.get(url))
    }

    /**
     * 獲取個人化推薦課程
     * @param userId 用戶ID
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Result<Course[]>>
     */
    static getRecommendedCourses(userId: number, limit: number = 6): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.RECOMMENDED(userId)}${queryString}`
        return request<Course[]>(() => api.get(url))
    }
    
    /* ----------------- Sessions ----------------- */
    static getSessionsForCourse(courseId: number): Promise<Result<CourseSession[]>> {
        return request<CourseSession[]>(() => api.get(API_ROUTES.COURSE.SESSIONS(courseId)))
    }

    /* ----------------- Favorites ----------------- */
    static getUserFavorites(userId: number): Promise<Result<Course[]>> {
        return request<Course[]>(() => api.get(API_ROUTES.USER.FAVORITES(userId)))
    }

    static addFavorite(userId: number, courseId: number): Promise<Result<void>> {
        return request<void>(() => api.post(API_ROUTES.USER.FAVORITES(userId), { courseId }))
    }

    static removeFavorite(userId: number, courseId: number): Promise<Result<void>> {
        return request<void>(() => api.delete(API_ROUTES.USER.FAVORITES(userId), { data: { courseId } }))
    }

    /* ----------------- Images ----------------- */
    static getCourseImages(courseId: number): Promise<Result<PhotoItem[]>> {
        return request<PhotoItem[]>(() => api.get(API_ROUTES.COURSE.IMAGES(courseId)))
    }

    /* ----------------- CRUD ----------------- */
    static createCourse(course: CourseDetailDTO): Promise<Result<CourseDetailDTO>> {
        return request<CourseDetailDTO>(() => api.post(API_ROUTES.COURSE.LIST, course))
    }

    static updateCourse(courseId: number, course: CourseDetailDTO): Promise<Result<CourseDetailDTO>> {
        return request<CourseDetailDTO>(() => api.put(API_ROUTES.COURSE.DETAIL(courseId), course))
    }
}
