import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Course, Result } from '@/types'
import { UserGender, UserRole } from '@/enums/User';
import { RegionCode } from '@/enums/RegionCode';
import { MainCategory } from '@/enums/CourseCategory';
// import * as userApi from '@/services/userApi'

export const useUserStore = defineStore('user', () => {
    /* ---------- state (auto‑persist) ---------- */
    const profile = ref<User | null>(null)
    const points = ref<number>(0)
    const favs = ref<Course[]>([])
    const interests = ref<string[]>([]) // 用户兴趣标签 (主分类)

    /* ---------- getters ---------- */
    const isLoggedIn = computed(() => !!profile.value)
    const displayName = computed(() => profile.value?.name ?? UserRole.Guest)
    const isFavorite = (id: number) => favs.value.some(c => c.id === id)
    const userInterests = computed(() => interests.value)

    /* ---------- actions ---------- */
    async function fetchProfile(id?: number) {
        //TODO: 從 API 取得用戶資料
        // const { success, data } = await userApi.fetchProfile(id)
        const data: User = {
            id: 1,
            name: 'John',
            points: 100,
            email: 'john@example.com',
            phone: '1234567890',
            avatarUrl: 'https://example.com/avatar.jpg',
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

        //TODO: 從 API 取得收藏
        // const { success, data } = await userApi.fetchFavorites(id)
        const favsData: Course[] = [
            {
                id: 1,
                merchantId: 1,
                title: '課程1',
                points: 100,
                coverUrl: 'https://example.com/cover.jpg',
                region: RegionCode.TPE,
                createdAt: new Date(),
            }
        ]
        favs.value = favsData

        // 从localStorage获取用户兴趣标签
        const savedInterests = localStorage.getItem('userInterests');
        if (savedInterests) {
            try {
                const parsedInterests = JSON.parse(savedInterests);
                if (Array.isArray(parsedInterests)) {
                    interests.value = parsedInterests;
                }
            } catch (e) {
                console.error('解析用户兴趣数据失败:', e);
            }
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

        // 检查并更新兴趣标签 (如果有传入)
        if (payload.interests && payload.interests.categories) {
            updateUserInterests(payload.interests.categories as string[]);
        }
        
        // TODO: update user
        // await api.put(`/users/${profile.value.id}`, payload)

        return { success: true, data: profile.value }
    }

    // 更新用户兴趣标签
    function updateUserInterests(newInterests: string[]) {
        interests.value = newInterests;
        localStorage.setItem('userInterests', JSON.stringify(newInterests));
        return { success: true, message: '兴趣标签已更新' };
    }

    /* 收藏 */
    function addFavorite(course: Course) {
        if (!isFavorite(course.id)) favs.value.push(course)
        // api
        return { success: true, message: '已加入收藏' }
    }
    function removeFavorite(id: number) {
        favs.value = favs.value.filter(c => c.id !== id)
        // api
        return { success: true, message: '已從收藏中移除' }
    }

    return {
        // state
        profile,
        points,
        favs,
        interests,
        // getters
        isLoggedIn,
        displayName,
        isFavorite,
        userInterests,
        // actions
        fetchProfile,
        adjustPoints,
        updateProfile,
        updateUserInterests,
        addFavorite,
        removeFavorite,
    }
},
    {
        // ---------- persist plugin options ----------
        persist: {
            key: 'user',                // localStorage key
            storage: localStorage,      // 可改 sessionStorage
            pick: ['profile', 'points', 'favs', 'interests']
        }
    }
)
