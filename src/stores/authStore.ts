// stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/enums/User'
import { useUserStore } from './userStore'
import type { Result } from '@/types'
// import * as api from '@/services/authApi'          // 你的登入 API

export interface RegisterData {
	name: string;
	email: string;
	password: string;
	age: number | null;
	gender?: string;
	location?: string;
	interests: string[];
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
	async function login(creds: any): Promise<Result> {
		// TODO: 實際應用：const res = await api.login(type, creds)
		const res = {
			success: true,
			token: 'fake-token',
			role: creds.role
		}

		if (res.success && res.token) {
			token.value = res.token
			role.value = res.role
			if (res.role == UserRole.User) {
				useUserStore().fetchProfile()
			}
			return { success: true, message: '登入成功', data: res.role }
		} else {
			return { success: false, message: '登入失敗' }
		}
	}

	async function register(data: RegisterData): Promise<Result> {
		// TODO: 實際應用：const res = await api.register(data)
		// 這裡應該調用實際的 API 註冊用戶
		// 模擬後端註冊響應
		console.log('註冊數據：', data);

		// 模擬成功情況
		const res = {
			success: true,
			token: 'fake-token',
			role: UserRole.User
		};

		if (res.success && res.token) {
			token.value = res.token;
			role.value = res.role;

			// 保存用戶偏好到本地存儲，用於個性化推薦
			localStorage.setItem('userInterests', JSON.stringify(data.interests));
			localStorage.setItem('userAge', data.age?.toString() || '');

			// 獲取用戶資料
			useUserStore().fetchProfile();

			return {
				success: true,
				message: '註冊成功！'
			};
		} else {
			return {
				success: false,
				message: '註冊失敗，請稍後再試'
			};
		}
	}

	async function logout() {
		// TODO: 實際應用：await api.logout()
		token.value = null
		role.value = null
	}

	return { token, role, isAdmin, isMerchant, isLoggedIn, login, logout, register }
}, {
	persist: {
		key: 'auth',                 // localStorage key => auth
		storage: localStorage,       // 也可改成 sessionStorage
		pick: ['token', 'role'],    // 只持久化這兩個欄位
		// 如果需要「記住我」效果，可在 login 時動態切換 storage
	}
})
