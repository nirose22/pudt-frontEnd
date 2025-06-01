import apiClient from '@/utils/api'
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig'
import { errorHandler } from '@/utils/errorHandler'
import type { User, Course, Result } from '@/types'

export const userService = {
    async fetchProfile(id?: number): Promise<Result<User>> {
        try {
            const data = await apiClient.get<User>(API_ROUTES.AUTH.PROFILE(id ?? 'me'))
            return { success: true, data }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.UNAUTHORIZED)
        }
    },

    async fetchFavoriteCourses(userId: number): Promise<Result<Course[]>> {
        try {
            const data = await apiClient.get<Course[]>(API_ROUTES.FAVORITES.LIST(userId))
            return { success: true, data }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.COURSE_ERROR)
        }
    },

    async addFavorite(userId: number, courseId: number): Promise<Result<boolean>> {
        try {
            await apiClient.post(API_ROUTES.FAVORITES.ADD, { courseId })
            return { success: true }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.COURSE_ERROR)
        }
    },

    async removeFavorite(userId: number, courseId: number): Promise<Result<boolean>> {
        try {
            await apiClient.delete(API_ROUTES.FAVORITES.REMOVE(courseId))
            return { success: true }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.COURSE_ERROR)
        }
    },

    async updateProfile(userId: number, data: Partial<User>): Promise<Result<User>> {
        try {
            const updated = await apiClient.put<User>(API_ROUTES.AUTH.PROFILE(userId), data)
            return { success: true, data: updated }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.UNAUTHORIZED)
        }
    },

    // 這裡假設有 API 路由，若無可先註解
    async updateUserInterests(userId: number, interests: string[]): Promise<Result<boolean>> {
        try {
            // await apiClient.put(API_ROUTES.USER.INTERESTS(userId), interests)
            return { success: true }
        } catch (error) {
            return errorHandler.handleApiError(error, ERROR_MESSAGES.VALIDATION_ERROR)
        }
    }
} 