import type { LoginCredentials, RegisterData } from '@/stores/authStore'
import type { Result } from '@/types'
import apiClient from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'

export const authApi = {
    // 普通登錄
    async login(credentials: LoginCredentials): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.LOGIN, credentials)
        } catch (error) {
            console.error('登錄失敗:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '登錄失敗，請檢查您的賬號密碼'
            }
        }
    },

    // Google 登錄
    async loginWithGoogle(): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.GOOGLE_LOGIN)
        } catch (error) {
            console.error('Google 登錄失敗:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Google 登錄失敗'
            }
        }
    },

    // Facebook 登錄
    async loginWithFacebook(): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.FACEBOOK_LOGIN)
        } catch (error) {
            console.error('Facebook 登錄失敗:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Facebook 登錄失敗'
            }
        }
    },

    // 註冊
    async register(data: RegisterData): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.REGISTER, data)
        } catch (error) {
            console.error('註冊失敗:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '註冊失敗，請稍後重試'
            }
        }
    },

    // 登出
    async logout(): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.LOGOUT)
        } catch (error) {
            console.error('登出失敗:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '登出失敗'
            }
        }
    }
}