import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { PhotoItem } from '@/types'
import { apiClient } from '@/utils/api'
import { ERROR_MESSAGES, API_ROUTES } from '@/utils/apiConfig'
import { request, buildQueryString } from '@/utils/requestHelper'

export class CourseService {
    /* ----------------- List & Detail ----------------- */
    static getCourse(keyword?: string, regions?: string[], categories?: string[]) {
        const queryString = buildQueryString({ keyword, regions, categories })
        const url = `${API_ROUTES.COURSE.LIST}${queryString}`
        return request<Course[]>(() => apiClient.get(url), ERROR_MESSAGES.COURSE_ERROR)
    }

    static fetchCourseDetail(courseId: number) {
        return request<CourseDetailDTO>(
            () => apiClient.get(API_ROUTES.COURSE.DETAIL(courseId)),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    /* ----------------- Sessions ----------------- */
    static getSessionsForCourse(courseId: number) {
        return request<CourseSession[]>(
            () => apiClient.get(API_ROUTES.COURSE.SESSIONS(courseId)),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    /* ----------------- Favorites ----------------- */
    static getUserFavorites(userId: number) {
        return request<Course[]>(
            () => apiClient.get(API_ROUTES.FAVORITES.LIST(userId)),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    static addFavorite(userId: number, courseId: number) {
        return request<void>(
            () => apiClient.post(API_ROUTES.FAVORITES.ADD, { courseId }),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    static removeFavorite(userId: number, courseId: number) {
        return request<void>(
            () => apiClient.delete(API_ROUTES.FAVORITES.REMOVE(courseId)),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    /* ----------------- Images ----------------- */
    static getCourseImages(courseId: number) {
        return request<PhotoItem[]>(
            () => apiClient.get(API_ROUTES.COURSE.IMAGES(courseId)),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    /* ----------------- CRUD ----------------- */
    static createCourse(course: CourseDetailDTO) {
        return request<CourseDetailDTO>(
            () => apiClient.post(API_ROUTES.COURSE.LIST, course),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }

    static updateCourse(courseId: number, course: CourseDetailDTO) {
        return request<CourseDetailDTO>(
            () => apiClient.put(API_ROUTES.COURSE.DETAIL(courseId), course),
            ERROR_MESSAGES.COURSE_ERROR
        )
    }
}
