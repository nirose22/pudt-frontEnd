// stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/enums/User'
import { useUserStore } from './userStore'
import type { Result, User } from '@/types'
import { authApi } from '@/services/AuthApi'
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

	/* ---------- actions ---------- */
	async function login(creds: LoginCredentials): Promise<Result<User>> {
		const res = await authApi.login(creds);
		if (res.success && res.data) {
			token.value = res.data.token || null;
			role.value = UserRole.User;
			useUserStore().fetchUserProfile(res.data.id);
			useUserStore().fetchBehaviorProfile(res.data.id)
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

	async function register(data: RegisterData): Promise<Result<User>> {
		const res = await authApi.register(data);
		if (res.success && res.data) {
			token.value = res.data.token || null;
			role.value = res.data.role as UserRole;
			
			// 保存用戶偏好到本地存儲
			localStorage.setItem('userInterests', JSON.stringify(data.interests));
			localStorage.setItem('userAge', data.age?.toString() || '');
			
			useUserStore().fetchUserProfile(res.data.id);
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
		login,
		loginWithGoogle,
		loginWithFacebook,
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
