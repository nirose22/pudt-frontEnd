// stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole } from '@/enums/UserRole'
import { useUserStore } from './userStore'
import type { Result } from '@/types'
// import * as api from '@/services/authApi'          // 你的登入 API

export const useAuthStore = defineStore('auth', () => {
  /* ---------- state ---------- */
  const token = ref<string | null>(null)
  const role = ref<UserRole | null>(null)

  /* ---------- getters ---------- */
  const isLoggedIn = computed(() => !!token.value && !!role.value)
  const isAdmin = computed(() => role.value === UserRole.Admin)
  // const isMerchant = computed(() => role.value === UserRole.Merchant)
  // const isUser = computed(() => role.value === UserRole.User)

  /* ---------- actions ---------- */
  async function login(creds: any): Promise<Result> {
    // const res = await api.login(type, creds)
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
      return { success: true, message: '登入成功' }
    } else {
      return { success: false, message: '登入失敗' }
    }
  }

  async function logout() {
    // await api.logout()        // 如果後端需要
    token.value = null
    role.value = null
  }

  return { token, role, isAdmin, isLoggedIn, login, logout }
}, {
  persist: {
    key: 'auth',                 // localStorage key => auth
    storage: localStorage,       // 也可改成 sessionStorage
    pick: ['token', 'role'],    // 只持久化這兩個欄位
    // 如果需要「記住我」效果，可在 login 時動態切換 storage
  }
})
