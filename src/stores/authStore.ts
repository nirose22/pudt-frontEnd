// stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/enums/User'
import { useUserStore } from './userStore'
import type { Result, User } from '@/types'
import { authApi } from '@/services/AuthApi'
import { lineService } from '@/services/lineService'
import { API_CONFIG } from '@/utils/apiConfig'

export interface LoginCredentials {
	account: string
	password: string
	rememberMe?: boolean
}

export interface RegisterData {
	name: string
	email: string
	password: string
	birthday: Date | null
	gender?: string
	regionCode?: string
	interests: string[]
}

export const useAuthStore = defineStore('auth', () => {
	/* ---------- state ---------- */
	const token = ref<string | null>(null)
	const role = ref<UserRole | null>(null)

	/* ---------- getters ---------- */
	const isLoggedIn = computed(() => !!token.value && (role.value === UserRole.User || role.value === UserRole.Admin))
	const isMerchant = computed(() => !!token.value && role.value === UserRole.Merchant)

	/* ---------- actions ---------- */
	async function login(creds: LoginCredentials): Promise<Result<User>> {
		const res = await authApi.login(creds);
		if (res.success && res.data) {
			token.value = res.data.token || null;
			role.value = res.data.role as UserRole;
			useUserStore().user = res.data
			useUserStore().refreshProfile(res.data.id);
		}
		return res;
	}

	async function loginWithGoogle(): Promise<Result<User>> {
		const res = await authApi.loginWithGoogle();
		if (res.success && res.data) {
			token.value = res.data.token || null;
			role.value = res.data.role as UserRole;
			if (res.data.role === UserRole.User) {
				useUserStore().fetchUserProfile(res.data.id);
			}
		}
		return res;
	}

	async function loginWithFacebook(): Promise<Result<User>> {
		const res = await authApi.loginWithFacebook();
		if (res.success && res.data) {
			token.value = res.data.token || null;
			role.value = res.data.role as UserRole;
			if (res.data.role === UserRole.User) {
				useUserStore().fetchUserProfile(res.data.id);
			}
		}
		return res;
	}

	// async function loginWithLine(): Promise<Result<User>> {
	// 	try {
	// 		await lineService.startLineLogin();
	// 		// LINE登入會重定向到LINE頁面，所以這裡不會直接返回結果
	// 		return { success: true, data: undefined, message: 'LINE登入重定向中...' } as Result<User>;
	// 	} catch (error: any) {
	// 		console.error('LINE登入失敗:', error);
	// 		return { success: false, data: undefined, message: error.message || 'LINE登入失敗' } as Result<User>;
	// 	}
	// }

	async function handleLineCallback(code: string, state: string): Promise<Result<User>> {
		try {
			const user = await lineService.handleLoginCallback(code, state);
			if (user) {
				token.value = user.token || null;
				role.value = user.role as UserRole;
				useUserStore().user = user;
				if (user.role === UserRole.User) {
					useUserStore().refreshProfile(user.id);
				}
				return { success: true, data: user, message: 'LINE登入成功' } as Result<User>;
			}
			throw new Error('LINE登入失敗');
		} catch (error: any) {
			console.error('LINE登入回調處理失敗:', error);
			return { success: false, data: undefined, message: error.message || 'LINE登入失敗' } as Result<User>;
		}
	}

	async function register(data: RegisterData): Promise<Result<User>> {
		const res = await authApi.register(data);
		if (res.success && res.data) {
			token.value = res.data.token || null;
			role.value = res.data.role as UserRole;
			login({
				account: data.email,
				password: data.password,
				rememberMe: true
			});
		}
		return res;
	}

	async function logout(): Promise<Result<void>> {
		const res = await authApi.logout();
		clearAuthData();
		return res;
	}

	function clearAuthData() {
		useUserStore().clearUserData();
		token.value = null;
		role.value = null;
		localStorage.clear()
		console.log('✅ 已清除所有登入數據');
	}


	// 檢查 token 有效性並清理無效數據
	function validateAndCleanup() {
		if (!token.value || !role.value) {
			console.log('🔍 檢測到無效的登入狀態，清除殘留數據');
			clearAuthData();
		}
	}

	return {
		token,
		role,
		isLoggedIn,
		isMerchant,
		login,
		loginWithGoogle,
		loginWithFacebook,
		// loginWithLine,
		handleLineCallback,
		logout,
		register,
		clearAuthData,
		validateAndCleanup
	}
}, {
	persist: {
		key: API_CONFIG.AUTH.TOKEN_KEY,
		storage: localStorage,
		pick: ['token', 'role']
	}
})
