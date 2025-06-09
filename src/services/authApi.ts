import type { LoginCredentials, RegisterData } from '@/stores/authStore'
import type { Result, User } from '@/types'
import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import { request } from '@/utils/requestHelper'

export const authApi = {
    // 普通登錄
    async login(credentials: LoginCredentials): Promise<Result<User>> {
        return request(() => api.post(API_ROUTES.AUTH.LOGIN, credentials));
    },

    // Google 登錄
    async loginWithGoogle(): Promise<Result<User>> {
        return request<User>(() => api.post(API_ROUTES.AUTH.GOOGLE_LOGIN));
    },

    // Facebook 登錄
    async loginWithFacebook(): Promise<Result<User>> {
        return request<User>(() => api.post(API_ROUTES.AUTH.FACEBOOK_LOGIN));
    },

    // 註冊
    async register(data: RegisterData): Promise<Result<User>> {
        return request<User>(() => api.post(API_ROUTES.AUTH.REGISTER, data));
    },

    // 登出
    async logout(): Promise<Result<void>> {
        return request<void>(() => api.post(API_ROUTES.AUTH.LOGOUT));
    }
}