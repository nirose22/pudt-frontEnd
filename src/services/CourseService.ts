import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { PhotoItem, Result } from '@/types'
import { apiClient } from '@/utils/api'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES, API_ROUTES } from '@/utils/apiConfig'

/** Utility to wrap API calls and unify error handling */
async function request<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
        const data = await fn()
        return { success: true, data } as Result<T>
    } catch (error) {
        throw errorHandler.handleApiError(error, ERROR_MESSAGES.COURSE_ERROR)
    }
}

/** Build query string from optional params */
function buildCourseSearchParams(keyword?: string, regions?: string[], categories?: string[]): string {
    const p = new URLSearchParams()
    if (keyword) p.append('keyword', keyword)
    if (regions?.length) p.append('regions', regions.join(','))
    if (categories?.length) p.append('categories', categories.join(','))
    return p.toString()
}

export class CourseService {
    /* ----------------- List & Detail ----------------- */
    static getCourse(keyword?: string, regions?: string[], categories?: string[]) {
        const qs = buildCourseSearchParams(keyword, regions, categories)
        const url = qs ? `${API_ROUTES.COURSE.LIST}?${qs}` : API_ROUTES.COURSE.LIST
        return request<Course[]>(() => apiClient.get(url))
    }

    static fetchCourseDetail(courseId: number) {
        return request<CourseDetailDTO>(() => apiClient.get(API_ROUTES.COURSE.DETAIL(courseId)))
    }

    /* ----------------- Sessions ----------------- */
    static getSessionsForCourse(courseId: number) {
        return request<CourseSession[]>(() => apiClient.get(API_ROUTES.COURSE.SESSIONS(courseId)))
    }

    /* ----------------- Favorites ----------------- */
    static getUserFavorites(userId: number) {
        return request<Course[]>(() => apiClient.get(API_ROUTES.COURSE.FAVORITES(userId)))
    }

    static addFavorite(userId: number, courseId: number) {
        return request<void>(() => apiClient.post(API_ROUTES.COURSE.ADD_FAVORITE(userId), { courseId }))
    }

    static removeFavorite(userId: number, courseId: number) {
        return request<void>(() => apiClient.delete(API_ROUTES.COURSE.REMOVE_FAVORITE(userId, courseId)))
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
