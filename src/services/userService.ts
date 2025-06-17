import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import type { User, Course, Result, UserBehaviorProfile, UserInterestsRequest, UserPreferencesRequest } from '@/types'
import type { MainCategory, RegionCode } from '@/enums'
import { request } from '@/utils/requestHelper'

export const userService = {
  async fetchUserProfile(id: number): Promise<Result<User>> {
    return request<User>(() => api.get(API_ROUTES.USER.PROFILE(id)))
  },

  async updateProfile(userId: number, data: Partial<User>): Promise<Result<User>> {
    return request<User>(() => api.put(API_ROUTES.USER.PROFILE(userId), data))
  },

  async fetchBehaviorProfile(userId: number): Promise<Result<UserBehaviorProfile>> {
    return request<UserBehaviorProfile>(() => api.get(API_ROUTES.USER.BEHAVIOR(userId)))
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

  async updateUserInterestsAndRegions(userId: number, interests: UserInterestsRequest): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.UPDATE_INTERESTS(userId), interests))
  },

  async updateUserRegions(userId: number, regions: RegionCode[]): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.UPDATE_REGIONS(userId), { preferredRegions: regions }))
  }
}