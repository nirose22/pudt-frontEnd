import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import type { User, Course, Result, UserProfile } from '@/types'
import type { MainCategory } from '@/enums'
import { request } from '@/utils/requestHelper'

export const userService = {
  async fetchProfile(id: number): Promise<Result<User>> {
    return request<User>(() => api.get(API_ROUTES.USER.PROFILE(id)))
  },

  async updateProfile(userId: number, data: Partial<User>): Promise<Result<User>> {
    return request<User>(() => api.put(API_ROUTES.USER.PROFILE(userId), data))
  },

  async fetchBehaviorProfile(userId: number): Promise<Result<UserProfile>> {
    return request<UserProfile>(() => api.get(API_ROUTES.USER.BEHAVIOR(userId)))
  },

  async fetchUserInterests(userId: number): Promise<Result<MainCategory[]>> {
    return request<MainCategory[]>(() => api.get(API_ROUTES.USER.INTERESTS(userId)))
  },

  async updateAddress(userId: number, address: string): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.ADDRESS(userId), { address }))
  },

  async logout(): Promise<Result<boolean>> {
    return request<boolean>(() => api.post(API_ROUTES.AUTH.LOGOUT))
  },

  async updateUserInterests(userId: number, interests: MainCategory[]): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.INTERESTS(userId), interests))
  }
}