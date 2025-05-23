// stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/enums/User'
import { useUserStore } from './userStore'
import type { Result } from '@/types'
import { authApi } from '@/services/authApi'

export interface LoginCredentials {
	account: string
	password: string
	rememberMe?: boolean
}

export interface RegisterData {
	name: string
	email: string
	password: string
	age: number | null
	gender?: string
	location?: string
	interests: string[]
}

export const useAuthStore = defineStore('auth', () => {
	/* ---------- state ---------- */
	const token = ref<string | null>(null)
	const role = ref<UserRole | null>(null)

	/* ---------- getters ---------- */
	const isLoggedIn = computed(() => !!token.value && !!role.value)
	const isAdmin = computed(() => role.value === UserRole.Admin)
	const isMerchant = computed(() => role.value === UserRole.Merchant)
	// const isUser = computed(() => role.value === UserRole.User)

	/* ---------- actions ---------- */
	async function login(creds: LoginCredentials): Promise<Result> {
		try {
			const res = await authApi.login(creds)
			if (res.success && res.token) {
				token.value = res.token
				role.value = res.role
				if (res.role === UserRole.User) {
					useUserStore().fetchProfile()
				}
				return { success: true, message: '登入成功', data: res.role }
			}
			return res
		} catch (error) {
			console.error('登入錯誤:', error)
			return { success: false, message: '登入失敗' }
		}
	}

	async function loginWithGoogle(): Promise<Result> {
		try {
			const res = await authApi.loginWithGoogle()
			if (res.success && res.token) {
				token.value = res.token
				role.value = res.role
				if (res.role === UserRole.User) {
					useUserStore().fetchProfile()
				}
				return { success: true, message: 'Google 登入成功', data: res.role }
			}
			return res
		} catch (error) {
			console.error('Google 登入錯誤:', error)
			return { success: false, message: 'Google 登入失敗' }
		}
	}

	async function loginWithFacebook(): Promise<Result> {
		try {
			const res = await authApi.loginWithFacebook()
			if (res.success && res.token) {
				token.value = res.token
				role.value = res.role
				if (res.role === UserRole.User) {
					useUserStore().fetchProfile()
				}
				return { success: true, message: 'Facebook 登入成功', data: res.role }
			}
			return res
		} catch (error) {
			console.error('Facebook 登入錯誤:', error)
			return { success: false, message: 'Facebook 登入失敗' }
		}
	}

	async function register(data: RegisterData): Promise<Result> {
		try {
			const res = await authApi.register(data)
			if (res.success && res.token) {
				token.value = res.token
				role.value = res.role

				// 保存用戶偏好到本地存儲
				localStorage.setItem('userInterests', JSON.stringify(data.interests))
				localStorage.setItem('userAge', data.age?.toString() || '')

				// 獲取用戶資料
				useUserStore().fetchProfile()

				return {
					success: true,
					message: '註冊成功！'
				}
			}
			return res
		} catch (error) {
			console.error('註冊錯誤:', error)
			return {
				success: false,
				message: '註冊失敗，請稍後再試'
			}
		}
	}

	async function logout() {
		try {
			await authApi.logout()
			token.value = null
			role.value = null
		} catch (error) {
			console.error('登出錯誤:', error)
		}
	}

	return {
		token,
		role,
		isAdmin,
		isMerchant,
		isLoggedIn,
		login,
		loginWithGoogle,
		loginWithFacebook,
		logout,
		register
	}
}, {
	persist: {
		key: 'auth',
		storage: localStorage,
		pick: ['token', 'role']
	}
})
