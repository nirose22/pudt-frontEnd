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
   * 登出
   */
  async logout(): Promise<Result<boolean>> {
    return request<boolean>(() => api.post(API_ROUTES.AUTH.LOGOUT))
  },

  /**
   * 更新用戶興趣和地區
   */
  async updateUserInterestsAndRegions(userId: number, interests: UserInterestsRequest): Promise<Result<boolean>> {
    console.log('🌐 [UserService] 發送 HTTP 請求:');
    console.log('📊 URL:', API_ROUTES.USER.UPDATE_INTERESTS(userId));
    console.log('📊 Method: PUT');
    console.log('📊 Request Body:', JSON.stringify(interests, null, 2));
    console.log('📊 Content-Type: application/json');
    
    const result = await request<boolean>(() => api.put(API_ROUTES.USER.UPDATE_INTERESTS(userId), interests));
    
    console.log('📨 [UserService] HTTP 回應:');
    console.log('📊 Status:', result.success ? 'Success' : 'Failed');
    console.log('📊 Response:', result);
    
    return result;
  },

  /**
   * 更新用戶地區偏好
   */
  async updateUserRegions(userId: number, regions: RegionCode[]): Promise<Result<boolean>> {
    const requestData = { preferredRegions: regions };
    
    console.log('🌐 [UserService] 發送地區偏好 HTTP 請求:');
    console.log('📊 URL:', API_ROUTES.USER.UPDATE_REGIONS(userId));
    console.log('📊 Method: PUT');
    console.log('📊 Request Body:', JSON.stringify(requestData, null, 2));
    console.log('📊 是否為清空請求:', regions.length === 0);
    console.log('📊 Content-Type: application/json');
    
    const result = await request<boolean>(() => api.put(API_ROUTES.USER.UPDATE_REGIONS(userId), requestData));
    
    console.log('📨 [UserService] 地區偏好 HTTP 回應:');
    console.log('📊 Status:', result.success ? 'Success' : 'Failed');
    console.log('📊 Response:', result);
    
    return result;
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