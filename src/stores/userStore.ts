// stores/userStore.ts – Pinia + pinia-plugin-persistedstate version
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Course, CourseRecord, Result } from '@/types'
import { UserGender, UserRole } from '@/enums/User';
import { BookingStatus } from '@/enums/BookingStatus';
// import * as userApi from '@/services/userApi'

export const useUserStore = defineStore('user', () => {
    /* ---------- state (auto‑persist) ---------- */
    const profile = ref<User | null>(null)
    const points = ref<number>(0)
    const favs = ref<Course[]>([])

    /* ---------- getters ---------- */
    const isLoggedIn = computed(() => !!profile.value)
    const displayName = computed(() => profile.value?.name ?? UserRole.Guest)
    const isFavorite = (id: number) => favs.value.some(c => c.courseId === id)

    /* ---------- actions ---------- */
    async function fetchProfile(id?: number) {
        // const { success, data } = await userApi.fetchProfile(id)
        const data: User = {
            id: 1, name: 'John', points: 100,
            email: 'john@example.com', phone: '1234567890',
            avatar: 'https://example.com/avatar.jpg',
            createdAt: new Date(),
            lastLogin: new Date(),
            address: '台北市信義區',
            gender: UserGender.Male,
            birthday: new Date('1990-01-01'),
        }

        if (data) {
            profile.value = data
            points.value = data.points ?? 0
        }
        return data
    }

    function adjustPoints(amount: number): Result {
        if (!profile.value) return { success: false, message: '尚未載入' }

        // 如果是扣點，檢查點數是否足夠
        if (amount < 0 && points.value + amount < 0) {
            return { success: false, message: '點數不足' }
        }

        // 更新點數 (加點數用正值，扣點數用負值)
        points.value += amount

        // 同時更新 profile 中的 points 值
        if (profile.value) {
            profile.value.points = points.value
        }

        // API call 記錄點數歷史
        // await api.post(`/users/${profile.value.id}/points/history`, { amount, reason, balance: points.value });

        return { success: true, data: points.value, message: amount > 0 ? '成功添加點數' : '成功扣除點數' }
    }

    // 更新用戶資料
    function updateProfile(payload: Partial<User>) {
        if (!profile.value) return { success: false, message: '尚未載入' }

        // 更新資料
        profile.value = { ...profile.value, ...payload }

        // 如果更新了點數，同步 points state
        if (payload.points !== undefined) {
            points.value = payload.points
        }
        // 呼叫 API
        // await api.put(`/users/${profile.value.id}`, payload)

        return { success: true, data: profile.value }
    }

    /* 收藏 */
    function addFavorite(course: Course) {
        if (!isFavorite(course.courseId)) favs.value.push(course)
        // api
        return { success: true, message: '已加入收藏' }
    }
    function removeFavorite(id: number) {
        favs.value = favs.value.filter(c => c.courseId !== id)
        // api
        return { success: true, message: '已從收藏中移除' }
    }

    return {
        // state
        profile,
        points,
        favs,
        // getters
        isLoggedIn,
        displayName,
        isFavorite,
        // actions
        fetchProfile,
        adjustPoints,
        updateProfile,
        addFavorite,
        removeFavorite,
    }
},
    {
        // ---------- persist plugin options ----------
        persist: {
            key: 'user',                // localStorage key
            storage: localStorage,      // 可改 sessionStorage
            pick: ['profile', 'points', 'favs']
        }
    }
)
