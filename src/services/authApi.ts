import type { LoginCredentials, RegisterData } from '@/stores/authStore'
import type { Result } from '@/types'
import apiClient from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'

export const authApi = {
    // 普通登录
    async login(credentials: LoginCredentials): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.LOGIN, credentials)
        } catch (error) {
            console.error('登录失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '登录失败，请检查您的账号密码'
            }
        }
    },

    // Google 登录
    async loginWithGoogle(): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.GOOGLE_LOGIN)
        } catch (error) {
            console.error('Google 登录失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Google 登录失败'
            }
        }
    },

    // Facebook 登录
    async loginWithFacebook(): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.FACEBOOK_LOGIN)
        } catch (error) {
            console.error('Facebook 登录失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Facebook 登录失败'
            }
        }
    },

    // 注册
    async register(data: RegisterData): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.REGISTER, data)
        } catch (error) {
            console.error('注册失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '注册失败，请稍后重试'
            }
        }
    },

    // 登出
    async logout(): Promise<Result> {
        try {
            return await apiClient.post<Result>(API_ROUTES.AUTH.LOGOUT)
        } catch (error) {
            console.error('登出失败:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : '登出失败'
            }
        }
    }
} 