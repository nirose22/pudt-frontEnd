import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import type { User, Course, Result, UserProfile } from '@/types'
import type { MainCategory } from '@/enums'

export const userService = {
  async fetchProfile(id?: number): Promise<Result<User>> {
    try {
      const response = await api.get(API_ROUTES.USER.PROFILE(id || 'me'))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: '獲取用戶資料失敗' }
    }
  },

  async fetchFavoriteCourses(userId: number): Promise<Result<Course[]>> {
    try {
      const response = await api.get(API_ROUTES.USER.FAVORITES(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: '獲取收藏課程失敗' }
    }
  },

  async addFavorite(userId: number, courseId: number): Promise<Result<boolean>> {
    try {
      await api.post(`${API_ROUTES.USER.FAVORITES(userId)}/${courseId}`)
      return { success: true, data: true }
    } catch (error) {
      return { success: false, message: '添加收藏失敗' }
    }
  },

  async removeFavorite(userId: number, courseId: number): Promise<Result<boolean>> {
    try {
      await api.delete(`${API_ROUTES.USER.FAVORITES(userId)}/${courseId}`)
      return { success: true, data: true }
    } catch (error) {
      return { success: false, message: '取消收藏失敗' }
    }
  },

  async updateProfile(userId: number, data: Partial<User>): Promise<Result<User>> {
    try {
      const response = await api.put(API_ROUTES.USER.PROFILE(userId), data)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: '更新用戶資料失敗' }
    }
  },

  async fetchBehaviorProfile(userId: number): Promise<Result<UserProfile>> {
    try {
      const response = await api.get(API_ROUTES.USER.BEHAVIOR(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: '獲取行為資料失敗' }
    }
  },

  async fetchUserInterests(userId: number): Promise<Result<MainCategory[]>> {
    try {
      const response = await api.get(API_ROUTES.USER.INTERESTS(userId))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: '獲取用戶興趣失敗' }
    }
  },

  async updateAddress(userId: number, address: string): Promise<Result<boolean>> {
    try {
      await api.put(API_ROUTES.USER.ADDRESS(userId), { address })
      return { success: true, data: true }
    } catch (error) {
      return { success: false, message: '更新地址失敗' }
    }
  },

  async logout(userId: number): Promise<Result<boolean>> {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT)
      return { success: true, data: true }
    } catch (error) {
      return { success: false, message: '登出失敗' }
    }
  },

  async updateUserInterests(userId: number, interests: MainCategory[]): Promise<Result<boolean>> {
    try {
      await api.put(API_ROUTES.USER.INTERESTS(userId), interests)
      return { success: true, data: true }
    } catch (error) {
      return { success: false, message: '更新興趣失敗' }
    }
  }
}