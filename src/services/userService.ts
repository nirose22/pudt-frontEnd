import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import type { 
  User, 
  Result, 
  UserBehaviorProfile, 
  UserInterestsRequest, 
  UserUpdateRequest,
  UserUpdateResponse
} from '@/types'
import type { MainCategory, RegionCode } from '@/enums'
import { request } from '@/utils/requestHelper'

export const userService = {
  /**
   * 獲取用戶資料
   */
  async fetchUserProfile(id: number): Promise<Result<User>> {
    return request<User>(() => api.get(API_ROUTES.USER.PROFILE(id)))
  },

  /**
   * 更新用戶資料
   */
  async updateProfile(userId: number, data: UserUpdateRequest): Promise<Result<UserUpdateResponse>> {
    return request<UserUpdateResponse>(() => api.put(API_ROUTES.USER.PROFILE(userId), data))
  },

  /**
   * 獲取用戶行為檔案
   */
  async fetchBehaviorProfile(userId: number): Promise<Result<UserBehaviorProfile>> {
    return request<UserBehaviorProfile>(() => api.get(API_ROUTES.USER.BEHAVIOR(userId)))
  },

  /**
   * 獲取用戶興趣
   */
  async fetchUserInterests(userId: number): Promise<Result<MainCategory[]>> {
    return request<MainCategory[]>(() => api.get(API_ROUTES.USER.INTERESTS(userId)))
  },

  /**
   * 更新地址
   */
  async updateAddress(userId: number, address: string): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.ADDRESS(userId), { address }))
  },

  /**
   * 登出
   */
  async logout(): Promise<Result<boolean>> {
    return request<boolean>(() => api.post(API_ROUTES.AUTH.LOGOUT))
  },

  /**
   * 更新用戶興趣和地區
   */
  async updateUserInterestsAndRegions(userId: number, interests: UserInterestsRequest): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.UPDATE_INTERESTS(userId), interests))
  },

  /**
   * 更新用戶地區偏好
   */
  async updateUserRegions(userId: number, regions: RegionCode[]): Promise<Result<boolean>> {
    return request<boolean>(() => api.put(API_ROUTES.USER.UPDATE_REGIONS(userId), { preferredRegions: regions }))
  },

  /**
   * 上傳用戶頭像
   */
  async uploadAvatar(file: File): Promise<Result<any>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return request<any>(() => 
      api.post('/files/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    )
  }
}